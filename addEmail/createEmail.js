import got from 'got'
import chalk from 'chalk'
import ansiEsc from 'ansi-escapes'

const KEY = process.env.KEY

export default async function createEmail(username, email, api) {
  console.log(ansiEsc.clearTerminal)
  const instance = got.extend({
    headers: {
      'Authorization': `Token ${KEY}`
    },
    prefixUrl: api
  })

  const { imap_servers: servers } = await instance.get('server/list').json()
  const { id: uuid, hostname } = servers.find(server => server.hostname.includes('\.us\.'))

  const [mailUser] = await instance.post('mailuser/create', {
    json: [{
      imap_server: uuid,
      name: username
    }]
  }).json()

  console.log(chalk.green('✔ ') + chalk.bold('Created mailuser ') + chalk.dim('· ') + chalk.cyan(username))

  let state = mailUser.state
  let tries = 0

  console.log(chalk.dim('waiting for mailuser to be ready'))

  while (state !== 'READY') {
    await new Promise(resolve => setTimeout(resolve, ++tries * 2000));
    const tempMailUser = await instance.get(`mailuser/read/${mailUser.id}`).json()
    state = tempMailUser.state
  }

  console.log(chalk.green('✔ ') +  chalk.bold('Mailuser ready'))

  await instance.post('address/create', {
    json: [{
      source: email,
      destinations: [mailUser.id],
      forwards: []
    }]
  })

  console.log(chalk.green('✔ ') +  chalk.bold('Created email ') + chalk.dim('· ') + chalk.cyan(email))

  const logs = await instance.get('notice/list').json()
  const currentLog = logs.find(item => item.content.includes(`${username}@${hostname}`))

  await instance.post('notice/delete', {
    json: [{ id: currentLog.id }]
  })

  console.log(chalk.green('✔ ') +  chalk.bold('Removed password log'))
  console.log(chalk.green('+ ') +  chalk.bold('Username ') + chalk.dim('· ') + chalk.cyan(username))
  console.log(chalk.green('+ ') +  chalk.bold('Mail ') + chalk.dim('· ') + chalk.cyan(email))
  console.log(chalk.green('+ ') +  chalk.bold('Server ') + chalk.dim('· ') + chalk.cyan(hostname))
  console.log(chalk.green('+ ') +  chalk.bold('Password ') + chalk.dim('· ') + chalk.cyan(mailUser.default_password))
}
