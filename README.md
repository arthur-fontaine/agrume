<p align="center">
  <img src="./.github/assets/logo.png" width="200px" align="center" alt="Agrume logo" />
  <h1 align="center">Agrume</h1>
  <p align="center">
    <a href="https://agrume.js.org">https://agrume.js.org</a>
    <br/>
    API development made for front-end developers!
    <br/>
    Easy, customizable and type-safe.
  </p>
</p>

## Getting started

Front-end developers are often afraid of the backend. They don't know how to start, what to do, and how to do it. Agrume is a tool that makes developing API endpoints as easy as writing a function. Best of all, it's type-safe!

Let's see an example:

```tsx
import { createRoute } from 'agrume'

const getDogImage = createRoute(
  async () => {
    // `database` is a fake database that should not be accessible from the client

    const dog = database.dogs.findFirst({
      select: ['imageBase64'],
      where: { isGoodBoy: true }
    })

    return dog.imageBase64
  }
)

export const Dog = function () {
  const [dogImage, setDogImage] = useState('')

  useEffect(() => {
    getDogImage().then(setDogImage)
  }, [])

  return <img src={dogImage} />
}
```

### Motivation

As a student, I frequently have to build projects in teams and in a short amount of time. These projects require a backend, but many of my teammates prefer to work on the frontend because they are not comfortable with the backend. I wanted to create a tool that would make backend development as easy as frontend development, so that it would be easier to organise the work in teams.

I think that Agrume is great to build prototypes and small projects. However, I don't know if it's a good idea to use it in production. I would love to hear your feedback on this!

### Installation

```bash
pnpm add agrume vite-plugin-agrume
```

> [!NOTE]
> Agrume is agnostic. This means that you can use it with the stack of your choice. However, for now we only provide a [Vite](https://vitejs.dev) plugin.

Now, you can add the plugin to your `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import { agrume } from 'vite-plugin-agrume'

export default defineConfig({
  plugins: [
    agrume()
    // ...
  ]
})
```

> [!WARNING]
> In some cases, you need to add the plugin to the top of the list of plugins. For example, if you use [Vite React](https://www.npmjs.com/package/@vitejs/plugin-react), the Vite React plugin will add side-effect statements to your code, which will break Agrume. To work around this problem, you can also use the `createRoute` function in separate files.

> [!NOTE]
> If you want to make Agrume work with another stack, you may want to use the [babel plugin](https://github.com/arthur-fontaine/agrume/tree/main/packages/babel-plugin-agrume). Feel free to open a PR to add support for your stack!

## Configuration

Agrume is designed to be as simple as possible. It doesn't need any configuration to work. However, you can configure it to suit your needs.

#### `prefix`

By default, Agrume will prefix all your routes with `/api`. You can change this prefix by passing the `prefix` option to the plugin:

```ts
// ...

export default defineConfig({
  plugins: [
    agrume({
      prefix: '/my-api'
    })
    // ...
  ]
})
```

#### `useMiddleware`

By default, Agrume will use the [Vite dev server](https://vitejs.dev/guide/api-javascript.html#devserver) to serve your API. However, you can use your own server by passing the `useMiddleware` option to the plugin:

```ts
// ...
import { server } from './server'

export default defineConfig({
  plugins: [
    agrume({
      useMiddleware: server.use.bind(server),
    })
    // ...
  ]
})
```

The `useMiddleware` option takes a function that takes a Connect-like middleware as an argument. Here is an example of a Connect-like server:

```ts
import { createServer } from "node:http"
import connect from "connect"

const app = connect()
const server = createServer(app)

server.listen(3000)

export { app as server }
```

Many backend frameworks can use Connect-like middleware. For example, [Express](https://expressjs.com) can use Connect-like middleware. You can use it as a server:

```ts
import express from 'express'

const app = express()
const server = app.listen(3000)

export { app as server }
```

*But please, don't use Express. See ["Why you should drop ExpressJS" by Romain Lanz](https://web.archive.org/web/20220206190522/https://dev.to/romainlanz/why-you-should-drop-expressjs-in-2021-711)*.

#### `logger`

By default, Agrume does not log anything. However, you can pass a logger to the plugin to log the requests:

```ts
// ...

export default defineConfig({
  plugins: [
    agrume({
      logger: {
        info: console.info,
        error: console.error,
      }
    })
    // ...
  ]
})
```

You can use `fs.writeFileSync` instead of `console.log` to log the requests to a file.

```ts
// ...

export default defineConfig({
  plugins: [
    agrume({
      logger: {
        info: (...args) => fs.writeFileSync('info.log', args.join(' ') + '\n', { flag: 'a' }),
        error: (...args) => fs.writeFileSync('error.log', args.join(' ') + '\n', { flag: 'a' }),
      }
    })
    // ...
  ]
})
```

## Creating routes

The only thing you need to create a route is the `createRoute` function. It takes a function as an argument and returns a function that can be called to do a request to the route.

```ts
import { createRoute } from 'agrume'

const sayHello = createRoute(
  async () => {
    return 'Hello world!'
  },
)
```

> [!NOTE]
> `sayHello` will be typed as `() => Promise<string>`.

You can then use the `sayHello` function to do a request to the route:

```ts
sayHello().then(console.log) // Hello world!
```

> [!WARNING]
> At the moment you can only use the `createRoute` function in `.js`, `.jsx`, `.ts` and `.tsx` files. To use Agrume in other files, you need to export the `createRoute` function from one of the valid files and import it into the other files. (See [Vue example](./examples/vue-example))

### Parameters

You can request parameters from the client just like you would do with a normal function:

```ts
import { createRoute } from 'agrume'

const sayHello = createRoute(
  async (name: string) => {
    return `Hello ${name}!`
  },
)
```

You can then use the `sayHello` function to do a request to the route:

```ts
sayHello('Arthur').then(console.log) // Hello Arthur!
```

> [!NOTE]
> Agrume is type-safe so if you don't pass the correct parameters to the function, your IDE will warn you!

> [!NOTE]
> Agrume will pass the parameters to the server as body parameters so every request will be a `POST` request.

### Options

You can configure each route individually by passing an object to the `createRoute` function.

#### `path`

You can specify the path of the route by passing a string starting with `/` to the `path` option:

```ts
import { createRoute } from 'agrume'

const getDogImage = createRoute(
  async () => {}, {
    path: '/dog'
  },
)
```

#### `getClient`

By default, Agrume will transform the `createRoute` function into a function that can be called to do a request to the route. The default client will use the `fetch` API to do the request. However, you can specify your own client by passing a function to the `getClient` option.

For example, if you want use a custom server that listen on port `3000`, you can do:

```ts
import { createRoute } from 'agrume'

const getDogImage = createRoute(
  async () => {},
  {
    getClient(requestOptions) {
      return async (parameters) => {
        const response = await fetch(
          `http://localhost:3000${requestOptions.url}`,
          {
            ...requestOptions,
            body: JSON.stringify(parameters)
          }
        )
        return response.json()
      }
    }
  },
)
```

> [!NOTE]
> The `parameters` argument cannot be inferred by TypeScript, so it will be typed as `any`. You can type it yourself, but it must be the same type as the parameters of the route.

> [!IMPORTANT]
> `getClient` will affect the type of the route. For example, if your `getClient` function returns the `requestOptions`, the type of the route will be `() => Promise<RequestOptions>`.

Have a look at the [Recipes](#recipes) section to see what you can do with the `getClient` option.

## Recipes

### Authentication

You can use the `getClient` option to add authentication to your routes. For example, if you want to add a JWT authentication to your routes, you can do:

```ts
import { createRoute } from 'agrume'

const getUser = ({ token }) => {
  // ...
}

const getAgrumeClient = (requestOptions) => {
  return async (parameters) => {
    const token = localStorage.getItem('token')
    const response = await fetch(
      `http://localhost:3000${requestOptions.url}`,
      {
        ...requestOptions,
        body: JSON.stringify({
          ...parameters,
          token
        })
      }
    )
    return response.json()
  }
}

const authenticatedRoute = createRoute(
  async (parameters) => {
    const user = await getUser(parameters)
    return user
  },
  {
    getClient: getAgrumeClient
  },
)
```

### Other examples

You can find examples in the [examples](./examples) directory.

- [Vue example](./examples/vue-example)
- [React example](./examples/react-example)
- [Prisma (with React) example](./examples/react-prisma-example)

## License

[MIT © Arthur Fontaine](./LICENSE)
