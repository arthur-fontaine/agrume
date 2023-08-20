import { createRoute } from '@agrume/core'
import React from 'react'

const dog_api_url = 'https://dog.ceo/api/breeds/image/random'

const getDogImage = createRoute(async function () {
  return (fetch(dog_api_url)
    .then(function (response) {
      return response.json()
    })
    .then(function (json) {
      return json.message
    })
    .then(function (url) {
      return { url }
    }))
})

/**
 * @returns A component that renders a random dog image.
 */
export const Dog = function () {
  const [dog_image, setDogImage] = React.useState('')

  void React.useEffect(function () {
    void (getDogImage()
      .then(function (dog_image) {
        return dog_image.url
      })
      .then(setDogImage))

    return function () {
      return void 0
    }
  }, [])

  return (
    <div>
      <img src={dog_image} />
    </div>
  )
}
