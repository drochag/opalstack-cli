import interactiveAddEmail from './addEmail/interactiveAddEmail.js'
import enquirer from 'enquirer'

const availableOptions = {
  'add email': interactiveAddEmail
}

export default async function tui (api) {
  const { action } = await enquirer.prompt({
    type: 'autocomplete',
    name: 'action',
    message: 'Action',
    choices: Object.keys(availableOptions)
  })

  availableOptions[action](api)
}