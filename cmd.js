#!/usr/bin/env node
import minimist from 'minimist'
import commist from 'commist'

import tui from './tui.js'
import addEmail from './addEmail/cmd.js'
import credentials from './utils/credentials.js'

await credentials()

const usage = () => {
  console.log('Opalstack CLI')
  console.log('add:')
  console.log('         opalstack-cli add email <username> <email>')
}

const availableOptions = {
  'add email': addEmail
}

const commister = commist()

Object.entries(availableOptions).forEach(([key, fn]) => commister.register(key, fn))

const noMatches = commister.parse(process.argv.slice(2))

if (noMatches) {
  const args = minimist(process.argv.slice(2), {
    boolean: ['help'],
    alias: {help: 'h' },
  })

  const { help } = args

  if (help) {
    usage()
    process.exit()
  }

  try {
    await tui()
  } catch (err) {
    const cancelled = err === ''
    if (cancelled === false) {
      console.log(err.message)
      process.exit(1)
    }
  }
}

