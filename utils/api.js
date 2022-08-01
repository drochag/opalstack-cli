import got from 'got'
import dotenv from 'dotenv'
import { credentialsFilePath } from './credentials.js'

dotenv.config({ path: credentialsFilePath })

const opalstackAPI = 'https://my.opalstack.com/api/v1/'

const opalstackInstance = (function () {
  let instance = got.extend({
    prefixUrl: opalstackAPI,
    ...process.env.OPALSTACK_CLI_API_TOKEN && {
      headers: {
        Authorization: `Token ${process.env.OPALSTACK_CLI_API_TOKEN}`
      }
    }
  })

  return options => {
    if (options) {
      instance = got.extend({
        prefixUrl: opalstackAPI,
        ...options,
        ...process.env.OPALSTACK_CLI_API_TOKEN && {
          headers: {
            Authorization: `Token ${process.env.OPALSTACK_CLI_API_TOKEN}`,
            ...options.headers,
          }
        },
      })
    }
    console.log(instance)
    return instance
  }
})()

export default opalstackInstance
