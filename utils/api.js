import got from 'got'
import dotenv from 'dotenv'
import { credentialsFilePath } from './credentials.js'

dotenv.config({ path: credentialsFilePath })

const opalstackAPI = 'https://my.opalstack.com/api/v1/'

const get = (path, options) => instance().get(path, options).json()
const post = (path, options) => instance().post(path, options).json()

export const getTokenList = () => get('token/list')
export const deleteToken = key => post('token/delete', { json: [{ key }] })
export const createToken = () => post('token/create', { json: [{ name: 'opalstack_cli' }] })
export const login = credentials => post('login', { json: credentials })
export const setApiOptions = options => instance(options)

const instance = (function () {
  let gotInstance = got.extend({
    prefixUrl: opalstackAPI,
    ...process.env.OPALSTACK_CLI_API_TOKEN && {
      headers: {
        Authorization: `Token ${process.env.OPALSTACK_CLI_API_TOKEN}`
      }
    }
  })

  return options => {
    if (options) {
      gotInstance = got.extend({
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

    return gotInstance
  }
})()

export default instance
