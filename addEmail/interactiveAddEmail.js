import enquirer from 'enquirer'
import createEmail from './createEmail.js'

export default async function interactiveAddEmail () {
  const form = new enquirer.Form({
    message: 'Add new email',
    validate (values) {
      const { username, email } = values
      if (!username || !email) return 'All fields are required'
      return true
    },
    choices: [
      { name: 'username', message: 'Username' },
      { name: 'email', message: 'Email' },
    ]
  })

  try {
    const add = await form.run()
    createEmail(add.username, add.email)
  } catch (err) {
    throw err
  }
}
