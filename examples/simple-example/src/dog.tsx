import { createRoute } from '@agrume/core'
import React from 'react'

import { dog_api_url } from './dog-api-url'

const getDogImage = createRoute(
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
  {
    getClient(requestOptions) {
      return async function() {
        return (fetch(
          `http://localhost:1000${requestOptions.url}`,
          requestOptions,
        )
          .then(function (response) {
            return response.json()
          }))
      }
    },
  },
)

/**
 * @returns A component that renders a random dog image.
 */
export const Dog = function () {
  const [dog_image, setDogImage] = React.useState('')

  void React.useEffect(function () {
    // console.log('getDogImage', getDogImage({ a: 'b' }))
    void (getDogImage()
      .then(function (dog_image) {
        return dog_image
      })
      .then(setDogImage))

    return undefined
  }, [])

  return (
    <div>
      <img src={dog_image} />
    </div>
  )
}
