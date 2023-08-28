import { PrismaClient } from '@prisma/client'
import { createRoute } from 'agrume'
import React from 'react'

const prisma = new PrismaClient()
const dog_image_url = (
  'https://images.dog.ceo/breeds/schipperke/n02104365_7791.jpg'
)

const getDog = createRoute(
  async function () {
    // eslint-disable-next-line functional/no-conditional-statements
    if (await prisma.dog.count() === 0) {
      void await prisma.dog.create({
        data: {
          isGoodBoy: true,
          imageUrl: dog_image_url,
        },
      })
    }

    return prisma.dog.findFirst()
  },
  {
    path: '/dogs/random',
  },
)

/**
 * @returns A component that renders a random dog image.
 */
export const Dog = function () {
  const [dog_image, setDogImage] = React.useState('')

  void React.useEffect(function () {
    void (getDog(undefined)
      .then(function (dog) {
        return dog?.imageUrl ?? ''
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
