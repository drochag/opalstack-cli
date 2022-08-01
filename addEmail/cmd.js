import minimist from 'minimist'

import createEmail from './createEmail.js'

export default function addEmail (argv) {
  const args = minimist(argv, {
    alias: { username: 'u', email: ['e', 'mail'] },
  });

  if (args._.length < 2) {
    usage()
    prozcess.exit(1)
  }

  const [username, email] = args._

  createEmail(username, email)
}
