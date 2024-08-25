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

### Installation

```bash
pnpm add agrume @agrume/plugin
```

Agrume is agnostic. This means that you can use it with the stack of your choice. We provide plugins for the following tools:

- [Babel](https://babeljs.io/)
- [ESBuild](https://esbuild.github.io)
- [Farm](https://www.farmfe.org/)
- [Rolldown](https://rolldown.rs/)
- [Rollup](https://rollupjs.org/)
- [Rspack](https://rspack.dev/)
- [Vite](https://vitejs.dev/)
- [Webpack](https://webpack.js.org/)

*Provide this range of plugins is possible thanks to [Unplugin](https://unplugin.vercel.app/) and the [UnJS team](https://unjs.io/).*

#### Vite

To use Agrume with Vite, you need to add the Agrume plugin to your Vite configuration:

```ts
import { defineConfig } from 'vite'
import agrume from '@agrume/plugin/vite'

export default defineConfig({
  plugins: [
    agrume()
    // ...
  ]
})
```

> [!WARNING]
> In some cases, you need to add the plugin to the top of the list of plugins. For example, if you use [Vite React](https://www.npmjs.com/package/@vitejs/plugin-react), the Vite React plugin will add side-effect statements to your code, which will break Agrume. To work around this problem, you can also use the `createRoute` function in separate files.

#### Other tools

With the same logic as Vite, you can add the Agrume plugin to the configuration of your tool, by importing `@agrume/plugin/your-tool`.

#### Babel

Agrume uses Babel under the hood. If you use another tool that the ones listed above, you can use the Babel preset.

First, you need to install the Babel preset and the Agrume internals:

```bash
pnpm add -D babel-preset-agrume @agrume/internals
```

Then, you can create a `.babelrc.js` file:

```js
const { state } = require('@agrume/internals')

state.set((state) => {
  state.options = {
    // Put your options here
  }
  return state
})

module.exports = function (api) {
  return {
    presets: ['babel-preset-agrume'],
  }
}
```

### Motivation

As a student, I frequently have to build projects in teams and in a short amount of time. These projects require a backend, but many of my teammates prefer to work on the frontend because they are not comfortable with the backend. I wanted to create a tool that would make backend development as easy as frontend development, so that it would be easier to organise the work in teams.

I think that Agrume is great to build prototypes and small projects. However, I don't know if it's a good idea to use it in production. I would love to hear your feedback on this!

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

#### `baseUrl`

By default, Agrume will make requests to the same host as the frontend. However, you can change this by passing the `baseUrl` option to the plugin:

```ts
// ...

export default defineConfig({
  plugins: [
    agrume({
      baseUrl: 'http://localhost:3000/'
    })
    // ...
  ]
})
```

> [!NOTE]
> It can be useful if you host your frontend and backend on different servers or different processes.

> [!NOTE]
> The difference between `prefix` and `baseUrl` is that `prefix` will impact both the transformation step (the frontend) and the registration step (the backend), while `baseUrl` will only impact the transformation step (the frontend).

#### `useMiddleware`

By default, Agrume will use the [Vite server](https://vitejs.dev/guide/api-javascript.html#devserver) to serve your API. However, you can use your own server by passing the `useMiddleware` option to the plugin:

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

#### `tunnel`

By default, Agrume will not use a tunnel. However, sometimes you need to use a tunnel to access your backend due to network restrictions. You can use a tunnel by passing the `tunnel` option to the plugin:

```ts
// ...

export default defineConfig({
  plugins: [
    agrume({
      tunnel: { type: 'bore' }
    })
    // ...
  ]
})
```

Agrume supports the following tunnel types:

- [`bore`](http://bore.pub)
- [`localtunnel`](https://localtunnel.github.io/www/)

> [!IMPORTANT]
> For some tunnel types, you may need to install the tunnel CLI. For example, to use the `bore` tunnel, you need to install the `bore` CLI.

> [!NOTE]
> The tunnel URL is deterministic. This means that if you restart the tunnel, the URL will be the same.

> [!NOTE]
> You may want to use the Agrume CLI to start the tunnel easily. See the [CLI](#cli) section.

## Creating routes

The only thing you need to create a route is to wrap a function that you would write in the backend with the `createRoute` function. It will return a function with the same signature as the function you passed to it, except that it will do a request under the hood.

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

> [!NOTE]
> The above code will be transformed to
> ```ts
> async function sayHello() {
>   return fetch('/api/sayHello', { method: 'POST' }).then((response) => response.json())
> }
> ```

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

### Realtime routes

You can use the `createRoute` function to create a realtime route. It can replace WebSockets in some cases. It works by using the server-sent events.

All you need to do is to pass a generator function to the `createRoute` function:

```ts
import { createRoute } from 'agrume'

const realtime = createRoute(
  async function* () {
    while (true) {
      yield new Date().toISOString()
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  },
)
```

The code above will send the current date of the server every second.

You can then use your function like a normal generator function:

```ts
for await (const date of realtime()) {
  console.log(date)
}
```

### Error throwing

You can use the [`http-errors`](https://www.npmjs.com/package/http-errors) package to throw a custom HTTP error. Agrume re-exports `http-errors` in a `HTTPError` member. You don't need to install the package yourself.

```ts
import { HTTPError, createRoute } from 'agrume'

const sayHello = createRoute(
  async (name: string) => {
    throw HTTPError.ImATeapot()
    return `Hello ${name}!`
  },
)
```

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

The default `getClient` function can be found in the [source code](./packages/core/src/create-route/create-route.ts) (search for the `getDefaultClient` function).

Have a look at the [Recipes](#recipes) section to see what you can do with the `getClient` option.

## CLI

To make it easier to use Agrume, we provide a CLI. For example, you can use the CLI to start the server separately from the frontend.

If you use Vite, you don't need to use the CLI necessarily because the Agrume plugin for Vite registers the routes on the Vite server. However, some tools don't allow registering custom routes, so you can use the CLI to start the server separately.

### Installation

```bash
pnpm add -D @agrume/cli
```

> [!NOTE]
> You can also install the CLI globally by using the `-g` flag.

### Usage

You can use the CLI to start the server:

```bash
agrume
```

It will find the routes in your project and start the server.

#### Options

| Option | Argument | Description | Default |
| --- | --- | --- | --- |
| `-p`, `--port` | A number | Port to listen on | `3000` |
| `-h`, `--host` | A string | Host to listen on | `localhost` |
| `-e`, `--entry` | A list of strings separated by a comma | The entry files to search for routes | `"index.js,index.ts,index.jsx,index.tsx,main.js,main.ts,main.jsx,main.tsx,app.js,app.ts,app.jsx,app.tsx,src/index.js,src/index.ts,src/index.jsx,src/index.tsx,src/main.js,src/main.ts,src/main.jsx,src/main.tsx,src/app.js,src/app.ts,src/app.jsx,src/app.tsx"` |
| `--watch` | *Optional* The directory to watch for changes | Watch for changes in the target directory | *not provided*. If the option is present, defaults to the entry file found |
| `--tunnel` | *Optional* The tunnel type (see the `tunnel` option in the [configuration](#configuration)) | Use a tunnel to access the server | *not provided*. If the option is present, defaults to the `localtunnel` tunnel |
| `--allow-unsafe` | | Allow loading routes from `node_modules` | `false` |

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

### React Native/Metro

Look at the `metro.config.js`, `babel.config.js` and `package.json` files in the [Yvees repository](https://github.com/arthur-fontaine/yvees/tree/b6624113a7dbd747254777022f47f76388064568/apps/mobile) to see how you can configure Agrume with React Native.

### Other examples

You can find examples in the [examples](./examples) directory.

- [Vue example](./examples/vue-example)
- [React example](./examples/react-example)
- [Prisma (with React) example](./examples/react-prisma-example)

## License

[MIT © Arthur Fontaine](./LICENSE)
