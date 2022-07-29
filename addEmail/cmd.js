import minimist from 'minimist'

import createEmail from './createEmail.js'
const OPALSTACK_API = 'https://my.opalstack.com/api/v1/'

export default function addEmail (argv) {
  const args = minimist(argv, {
    alias: { username: 'u', email: ['e', 'mail'] },
    string: ['api'],
    default: { 'api': OPALSTACK_API }
  });

  if (args._.length < 2) {
    usage()
    prozcess.exit(1)
  }

  const [username, email] = args._
  const { api } = args

  createEmail(username, email, api)
}
