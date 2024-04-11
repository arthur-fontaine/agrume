import { createRoute } from 'agrume'

import { dog_api_url } from './dog-api-url'

export const getDogImage = createRoute(
  async function () {
    return (fetch(dog_api_url)
      .then(function (response) {
        return response.json()
      })
      .then(function (json) {
        return json.message as string
      })
      .then(function (url) {
        return url
      })
      .then(function (url) {
        return fetch(url)
      })
      .then(function (response) {
        return response.blob()
      })
      .then(async function (blob) {
        return `data:${blob.type};base64,${
          Buffer.from(await blob.arrayBuffer()).toString('base64')}`
      }))
  },
)
