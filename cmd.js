#!/usr/bin/env node

import minimist from 'minimist'
import commist from 'commist'
import tui from './tui.js'
import addEmail from './addEmail/cmd.js'

const OPALSTACK_API = 'https://my.opalstack.com/api/v1/'

const usage = () => {
  console.log('Opalstack CLI')
  console.log('add:')
  console.log('  email: opalstack-cli add email <username> <email> --api=<string>')
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
    string: ['api'],
    default: { 'api': OPALSTACK_API }
  })

  const { help, api } = args

  if (help) {
    usage()
    process.exit()
  }

  try {
    await tui(api)
  } catch (err) {
    const cancelled = err === ''
    if (cancelled === false) {
      console.log(err.message)
      process.exit(1)
    }
  }
}

