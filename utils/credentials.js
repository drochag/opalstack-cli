import chalk from 'chalk'
import ansiEsc from 'ansi-escapes'
import enquirer from 'enquirer'
import dotenv from 'dotenv'
import os from 'os'
import { join } from 'path'
import { constants as fsConstants, readFile, writeFile, mkdir } from 'fs'
import api from './api.js'

const homedir = os.homedir()
const configDirPath = join(homedir, '.opalstack-cli');
const isWindows = process.platform === 'win32'
const settingRe = /^([a-zA-Z0-9_]+)\s*=\s*([^\s]+)\s*$/;

export const credentialsFilePath = homedir ? join(configDirPath, 'credentials') : null;

const parseFile = content => content.split(/[\n\r]+/).reduce((obj, line) => {
  const match = line.match(settingRe)
  return {
    ...obj,
    ...match && { [match[1]]: match[2] }
  }
}, {})

const writeCredentialsContent = content => new Promise((resolve, reject) =>
  writeFile(
    credentialsFilePath,
    content,
    !isWindows ? { mode: fsConstants.S_IRUSR | fsConstants.S_IWUSR } : null,
    writeFileError => {
      if (writeFileError) {
        if (writeFileError.code === 'ENOENT') {
          mkdir(configDirPath),
          !isWindows ? { mode: fsConstants.S_IRWXU } : null,
          mkdirError => {
            if (mkdirError) reject(mkdirError)
            else resolve(writeCredentialsContent(content))
          }
        }
      }
    }
  )
)

const login = () => new Promise(async resolve => {
  const formQuestions = [{
    type: 'input',
    name: 'username',
    message: 'Opalstack Username',
    validate: value => !!value || 'Username is required'
  }, {
    type: 'password',
    name: 'password',
    message: 'Opalstack Password',
    validate: value => !!value || 'Password is required'
  }]

  const { username, password } = await enquirer.prompt(formQuestions)

  try {
    const response = await api().post('login', {
      json: { username, password }
    }).json()

    console.log(chalk.green('✔ ') +  chalk.bold('Logged in'))

    api({
      headers: {
        'Authorization': `Token ${response.token}`
      }
    })

    resolve(response)
  } catch (err) {
    console.log(ansiEsc.eraseLines(3))
    console.log(ansiEsc.cursorUp(3))
    console.log(chalk.red('✖ ') + chalk.bold('Invalid username or password, please try again.'))

    resolve(login())
  }
})

const getTokenList = () => api().get('token/list').json()

const createToken = () => api().post('token/create', {
  json: [{
    name: 'opalstack_cli'
  }]
}).json()

const shouldCreateChoicesEnum = {
  CREATE_ONE_AND_SAVE: 'Create one and save',
  LOG_IN_EVERY_TIME: 'Ask every time to log in',
}

const existingTokenEnum = {
  USE_TOKEN: 'Use that token',
  NEW_TOKEN_DELETE_EXISTING: 'Generate a new token and delete the existing one',
  NEW_TOKEN_KEEP_EXISTING: 'Generate a new token and keep the previous one',
  LOG_IN_EVERY_TIME: 'Don\'t use a token, ask me to log in every time',
}

const saveInfo = async () => {
  const tokenList = await getTokenList()
  const existingToken = tokenList.find(token => token.name === 'opalstack_cli')

  const shouldCreateChoices = {
    [shouldCreateChoicesEnum.CREATE_ONE_AND_SAVE]: async () => {
      const createdTokens = await createToken()
      const { key: newToken } = createdTokens.pop()

      api({
        headers: {
          'Authorization': `Token ${newToken}`
        }
      })

      credentials({ OPALSTACK_CLI_API_TOKEN: newToken, OPALSTACK_CLI_ASK_FOR_LOGIN: false })
      console.log(chalk.green('✔ ') + chalk.bold('Saved token. '))
    },
    [shouldCreateChoicesEnum.LOG_IN_EVERY_TIME]: () => {
      credentials({ OPALSTACK_CLI_ASK_FOR_LOGIN: true })
    }
  }

  const existingTokenChoices = {
    [existingTokenEnum.USE_TOKEN]: () => {
      api({
        headers: {
          'Authorization': `Token ${existingToken.key}`
        }
      })

      credentials({ OPALSTACK_CLI_API_TOKEN: existingToken.key, OPALSTACK_CLI_ASK_FOR_LOGIN: false })
    },
    [existingTokenEnum.NEW_TOKEN_DELETE_EXISTING]: () => {
      api().post('token/delete', {
        json: [{
          key: existingToken.key
        }]
      }).json()

      shouldCreateChoices[shouldCreateChoicesEnum.CREATE_ONE_AND_SAVE]()
    },
    [existingTokenEnum.NEW_TOKEN_KEEP_EXISTING]: () => shouldCreateChoices[shouldCreateChoicesEnum.CREATE_ONE_AND_SAVE](),
    [existingTokenEnum.LOG_IN_EVERY_TIME]: () => {
      credentials({ OPALSTACK_CLI_ASK_FOR_LOGIN: true })
    }
  }

  // Non existing token on Opalstack
  if (!existingToken) {
    const options = new enquirer.Select({
      message: `You don't have a saved token on your Opalstack account for opalstack-cli,
                want to create one and save it so you don't need to log in every time?`,
      choices: Object.keys(shouldCreateChoices)
    })

    const selectedOption = await options.run()
    return shouldCreateChoices[selectedOption]()
  }

  const option = new enquirer.Select({
    message: 'You already have an opalstack-cli token on you Opalstack account',
    choices: Object.keys(existingTokenChoices)
  })

  const selectedOption =  await option.run()
  existingTokenChoices[selectedOption]()
}

const credentials = obj => new Promise((resolve, reject) => {
  if (obj) {
    writeCredentialsContent(Object.entries(obj).reduce((arr, [key, value]) => [
      ...arr,
      `${key}=${value}\n`
    ], []).join('\n'))

    return resolve(obj)
  }

  if (!process.env.OPALSTACK_CLI_API_TOKEN && !process.env.ASK_FOR_LOGIN) {
    readFile(credentialsFilePath, { encoding: 'utf-8' }, (error, existingFileContent) => {
      if (error) {
        if (error.code === 'ENOENT') {
          console.log(chalk.red('✖ ') + chalk.bold('No credentials found. Please log in. '))
          login().then(saveInfo).then(resolve).catch(reject)
          return
        }

        return reject(error)
      }

      const credentialItems = parseFile(existingFileContent)

      if (credentialItems.OPALSTACK_CLI_ASK_FOR_LOGIN) {
        dotenv.config({ path: credentialsFilePath })
        login().then(resolve)
      } else {
        resolve(parseFile(existingFileContent))
      }
    })
  } else if (process.env.ASK_FOR_LOGIN) {
    login().then(resolve).catch(reject)
  } else {
    resolve()
  }
})

export default credentials
