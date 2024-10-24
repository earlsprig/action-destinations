import type { ActionDefinition } from '@segment/actions-core'
import type { Settings } from '../generated-types'
import type { Payload } from './generated-types'

const isPlainObj = (o) =>
  Boolean(
    o &&
      o.constructor &&
      o.constructor.prototype &&
      Object.prototype.hasOwnProperty.call(o.constructor.prototype, 'isPrototypeOf')
  )

const flattenObj = (obj, keys = []) => {
  return Object.keys(obj).reduce((acc, key) => {
    return Object.assign(
      acc,
      isPlainObj(obj[key]) ? flattenObj(obj[key], keys.concat(key)) : { [keys.concat(key).join('.')]: obj[key] }
    )
  }, {})
}

const payloadTransform = (payload: Payload) => {
  payload.attributes = flattenObj(payload.attributes)
  return payload
}

const action: ActionDefinition<Settings, Payload> = {
  title: 'Identify User',
  description: 'Upserts a user along with any traits to the Sprig platform.',
  fields: {
    userId: {
      description: 'The userId of the identified user.',
      label: 'User ID',
      required: true,
      type: 'string',
      default: {
        '@path': '$.userId'
      }
    },
    attributes: {
      description: 'The traits payload to attribute to the userId.',
      label: 'Attributes',
      required: true,
      type: 'object',
      default: {
        '@path': '$.traits'
      }
    }
  },
  perform: (request, data) => {
    // Make your partner api request here!
    // return request('https://example.com', {
    //   method: 'post',
    //   json: data.payload
    // })
    return request('https://api.sprig.com/v2/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${data.settings.apiKey}`
      },
      json: payloadTransform(data.payload)
    })
  }
}

export default action