import enquirer from 'enquirer'
import createEmail from './createEmail.js'

export default async function interactiveAddEmail (api) {
  const form = new enquirer.Form({
    message: 'Add new email',
    hint: 'Press Ctrl+Q to go back to menu',
    validate (values) {
      const { username, email } = values
      if (!username || !email) return 'All fields are required'
      return true
    },
    choices: [
      {name: 'username', message: 'Username'},
      {name: 'email', message: 'Email'},
    ]
  })
  form.on('keypress', (_, {ctrl, name}) => {
    if (ctrl && name === 'q') {
      form.cancel()
      quit = true
    }
  })
  let add = null
  try {
    add = await form.run()
    createEmail(add.username, add.email, api)
  } catch (err) {
    throw err
  }
}
