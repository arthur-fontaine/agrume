<p align="center">
  <img src="https://github.com/arthur-fontaine/agrume/blob/main/.github/assets/logo.png?raw=true" width="200px" align="center" alt="Agrume logo" />
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
  ],
  // to prevent some errors
  optimizeDeps: {
    exclude: ['agrume']
  },
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
      prefix: '/my-api/'
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

Agrume has built-in support for tunnels. You can opt-in to use a tunnel by passing the `tunnel` option to the plugin:

```ts
// ...

export default defineConfig({
  plugins: [
    agrume({
      tunnel: { type: 'Bore', connectionArgs: {} }
    })
    // ...
  ]
})
```

> [!NOTE]
> You may want to use the Agrume CLI to start the tunnel easily. See the [CLI](#cli) section.

##### [`ngrok`](https://ngrok.com)

Ngrok is the most popular of all the options. However, it have some prerequisites:

1. Create an account on [ngrok.com](https://dashboard.ngrok.com/signup).
2. Go to the [auth token page](https://dashboard.ngrok.com/get-started/your-authtoken) and copy your auth token.
3. Set the `NGROK_AUTHTOKEN` environment variable to your auth token.

```bash
echo "export NGROK_AUTHTOKEN=your-auth-token" >> ~/.zshrc # or ~/.bashrc or any other shell configuration file
```

4. Create a free static subdomain on [ngrok.com](https://dashboard.ngrok.com/cloud-edge/domains).
5. Set the `ngrokDomain` option to your subdomain.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1. with the CLI:

```bash
agrume --tunnel ngrok --ngrok-domain your-subdomain
```

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. with the plugin:

```ts
// ...
export default defineConfig({
  // ...
  tunnel: {
    type: 'Ngrok',
    connectionArgs: {
      accessToken: process.env.NGROK_AUTHTOKEN, // This is optional, it will use the NGROK_AUTHTOKEN environment variable by default.
    },
    tunnelDomain: 'your-ngrok-domain',
  }
})
```

##### [`pinggy`](https://pinggy.io)

Pinggy is a stable and cheaper alternative to Ngrok.

1. Create an account on [pinggy.io](https://pinggy.io).
2. Go to the [subscriptions page](https://dashboard.pinggy.io/subscriptions) and upgrade to a paid plan (3$/month).
3. Go to the [subdomains page](https://dashboard.pinggy.io/subdomains) and create a static subdomain.
4. Set the `pinggySubdomain` and `pinggyToken` options to your subdomain and your token.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1. with the CLI:

```bash
agrume --tunnel pinggy --pinggy-subdomain your-subdomain --pinggy-token your-token
```

> [!NOTE]
> Ideally, you should set the `PINGGY_TOKEN` environment variable to your token and use this variable in the command.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. with the plugin:

```ts
// ...
export default defineConfig({
  // ...
  tunnel: {
    type: 'Pinggy',
    connectionArgs: {
      accessToken: process.env.PINGGY_TOKEN,
    },
    tunnelSubdomain: 'your-subdomain',
  },
})
```

##### [`bore`](http://bore.pub)

Bore is a free and open-source tunnel. However, it doesn't support HTTPS and works with ports (anybody can reserve a port, so the determined URL can be taken by someone else).

1. Install the `bore` CLI (read the [installation instructions](https://github.com/ekzhang/bore#installation)).
2. Use `bore` as the tunnel type.

##### [`localtunnel`](https://localtunnel.github.io/www/)

Localtunnel is a free and open-source tunnel. However, the service is not very stable. It doesn't need any installation.

1. Use `localtunnel` as the tunnel type.

#### `getClient`

By default, Agrume will use the client written at [`packages/client/src/get-client.ts`](https://github.com/arthur-fontaine/agrume/blob/main/packages/client/src/get-client.ts). However, you can pass your own client to the plugin:

```ts
export default defineConfig({
  plugins: [
    agrume({
      getClient: (requestOptions) => {
        // Your client
      }
    })
    // ...
  ]
})
```

If you want to modify the type of the client compared to the default client, you can do as follows:

```ts
// ...
import type { createRoute } from 'agrume'
import type { AnyRoute, RequestOptions, RouteTypes } from '@agrume/types'

function getClient<RT extends RouteTypes<AnyRoute>>(
  requestOptions: RequestOptions,
  _?: RT
) {
  type Parameters = createRoute.Helpers.InferRouteTypes.Parameters<RT> // you can modify the parameters your client will take (for example, add a token parameter)
  // For example, if you want to add a token parameter:
  // type Parameters = [...createRoute.Helpers.InferRouteTypes.Parameters<RT>, { token: string }]

  type ReturnType = createRoute.Helpers.InferRouteTypes.ReturnType<RT> // you can modify the return type of your client
  return async (...parameters: Parameters): Promise<ReturnType> => {
    // Your client
  }
}

export default defineConfig({
  plugins: [
    agrume({
      getClient,
    }),
    // ...
  ]
})

declare module '@agrume/types' {
  export interface CustomClient<R> {
    getClient: typeof getClient<RouteTypes<R>>
  }
}
```

> [!IMPORTANT]
> Make sure that the `declare module` is in a file included in your `tsconfig.json`. If you don't want to include your build tool's configuration file, you can put the `getClient` and the `declare module` in a separate file that is included in your `tsconfig.json`.

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

You don't have to necessarily return a value. Your function can have a signature like `(parameters: T) => Promise<void>`. In this case, the HTTP response will be `204 No Content`.

```ts
import { createRoute } from 'agrume'

const sayHello = createRoute(
  async (name: string) => {
    console.log(`Hello ${name}!`)
  },
)
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

You can use the `createRoute` function to create a realtime route. It can replace WebSockets.

#### `client` → `server`

To send data from the client to the server in real time, you can require a generator function as a parameter of your route.

```ts
import { createRoute } from 'agrume'

const realtime = createRoute(
  async (clicks: AsyncGenerator<[number, number]>) => {
    for await (const [x, y] of clicks) {
      console.log(x, y)
    }
  },
)
```

Then, you can use the `realtime` function as follows:

```ts
realtime(async function* () {
  while (true) {
    yield [Math.random(), Math.random()]
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
})
```

The code above will send random coordinates every second. The server will log the coordinates in real time.

#### `server` → `client`

To send data from the server to the client in real time, you can pass a generator function to the `createRoute` function.

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
for await (const date of await realtime()) {
  console.log(date)
}
```

#### Combining both (`client` ⇄ `server`)

You can receive and send data in real time by combining both methods:

```ts
import { createRoute } from 'agrume'

const chat = createRoute(
  async function* (userMessages: AsyncGenerator<string>) {
    (async () => {
      // Receive messages in parallel with sending messages
      for await (const message of userMessages) {
        sendToAll(message)
      }
    })()

    for await (const message of allMessagesIterator) {
      yield message
    }
  },
)
```

By passing a generator function (the messages from your user) to the `chat` function, you can receive messages from all other users in real time.

### Error throwing

You can use the [`http-errors`](https://www.npmjs.com/package/http-errors) package to throw a custom HTTP error. Agrume re-exports `http-errors` in a `HTTPError` member. You don't need to install the package yourself.

```ts
import { createRoute } from 'agrume'
import { HTTPError } from 'agrume/errors'

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

## Security

Since parts of your server logic is in your frontend code, you may be concerned about security, particularly regarding the exposure of sensitive code to the client.

As explained in the [Creating routes](#creating-routes) section, any function passed to `createRoute` is transformed into a request to the server. The request path will be determined by one of the following:

- The route path (if specified in the options), or
- The name of the function passed to `createRoute`, or
- A hash of the function passed to `createRoute`.

The first two options are under your control. While the last option might seem like a potential vulnerability, Agrume mitigates this risk by using the secure SHA-256 algorithm to hash the function. Unless someone has the exact same server code as you, they won't be able to guess the function you passed to `createRoute` (if you're concerned about this, you can use the `path` option to specify the route path explicitly).

Another possible source of leakage is variables and imports outside the `createRoute` function. Since `createRoute` functions are transformed into requests, any variables and imports outside these functions become unused. Most build tools perform “tree-shaking” to remove unused code from the final bundle ***if your code is written in ESM*** (using `import` rather than `require` means it's ESM). Be sure that your build tool supports tree-shaking. In the future, Agrume may implement built-in tree-shaking ([an issue](https://github.com/arthur-fontaine/agrume/issues/97) has been opened for this feature).

Below is a table of build tools and their tree-shaking capabilities:

| Build tool | Tree-shaking | Documentation |
| --- | --- | --- |
| Vite | ✅ (by default in production) | |
| Rollup | ✅ | <https://rollupjs.org/introduction/#tree-shaking> |
| Webpack | ✅ (by default in production) | <https://webpack.js.org/guides/tree-shaking/> |
| ESBuild | 🟨 (enabled with `--bundle` option, or `--format=iife`, or `--tree-shaking=true`) | <https://esbuild.github.io/api/#tree-shaking> |
| Farm | ✅ (by default in production) | <https://www.farmfe.org/docs/advanced/tree-shake> |
| Rspack | ✅ (by default in production) | <https://rspack.dev/guide/optimization/tree-shaking#tree-shaking> |
| Rolldown | ❓ | |
| Expo | ⚙️ (experimental, read the documentation) | <https://docs.expo.dev/guides/tree-shaking/#enabling-tree-shaking> |

## Optimizations

Agrume will duplicate the same client for each route. This is because we want the `createRoute` function to be usable as such without any configuration. However, you can avoid this duplication by using the “optimized client”.

To start, paste this side effect at the top of your entry file (for example, `main.ts`):

```ts
import '@agrume/client/optimized/register'
```

Then, in the plugin options, you can pass the optimized client:

```ts
// ...
import { getOptimizedClient } from '@agrume/client/optimized'

export default defineConfig({
  plugins: [
    agrume({
      getClient: getOptimizedClient()
    })
    // ...
  ]
})
```

## CLI

### Installation

```bash
pnpm add -D @agrume/cli
```

> [!NOTE]
> You can also install the CLI globally by using the `-g` flag.


### Configuration

To configure the CLI, you can either use the command options or create a configuration file.

At the root of your project, create a `agrume.config.ts` file:

```ts
import { defineConfig } from '@agrume/cli'

export default defineConfig({
  externalUrl: 'http://localhost:3000/',
  host: 'localhost',
  port: 8173,
  prefix: '/__agrume__/',
  watch: true,
  // As plugin options, if you use `externalUrl`, you can't use `tunnel` (and vice versa)
  // tunnel: {
  //   type: 'Localtunnel',
  // },
})
```

> [!NOTE]
> You can also put the configuration file in a `.config` directory following the [config dir proposal](https://github.com/pi0/config-dir). In fact, the configuration is loaded using [c12](https://github.com/unjs/c12?tab=readme-ov-file), so you can even use `.js` or `.json` even if it has not been tested.

The advantage of using a configuration file is that you can share the configuration with the plugin. For example, if you use the Vite plugin, you can write:

```ts
import { defineConfig } from 'vite'
import agrume from '@agrume/plugin/vite'
import agrumeConfig from './agrume.config'

export default defineConfig({
  plugins: [
    agrume({
      ...agrumeConfig,
      // other options
    }),
    // ...
  ]
})
```

### `agrume`

You can use the CLI to start the server:

```bash
agrume
```

It will find the routes in your project and start a [Fastify](https://github.com/fastify/fastify/) server.

> [!NOTE]
> For development purposes, you can just use the `agrume` Vite plugin that will
use the Vite server.

#### Options

| Option | Argument | Description | Default |
| --- | --- | --- | --- |
| `-p`, `--port` | A number | Port to listen on | `3000` |
| `-h`, `--host` | A string | Host to listen on | `localhost` |
| `-e`, `--entry` | A list of strings separated by a comma | The entry files to search for routes | `"index.js,index.ts,index.jsx,index.tsx,main.js,main.ts,main.jsx,main.tsx,app.js,app.ts,app.jsx,app.tsx,src/index.js,src/index.ts,src/index.jsx,src/index.tsx,src/main.js,src/main.ts,src/main.jsx,src/main.tsx,src/app.js,src/app.ts,src/app.jsx,src/app.tsx"` |
| `--watch` | *Optional* The directory to watch for changes | Watch for changes in the target directory | *not provided*. If the option is present, defaults to the entry file found |
| `--tunnel` | *Optional* The tunnel type (see the `tunnel` option in the [configuration](#configuration)) | Use a tunnel to access the server | *not provided*. If the option is present, defaults to the `localtunnel` tunnel |
| `--allow-unsafe` | | Allow loading routes from `node_modules` | `false` |
| `--cors-regexp` | A string | The regular expression to match the origin |  |
| `--ngrok-domain` | A string | The domain to use with Ngrok |  |
| `--pinggy-subdomain` | A string | The subdomain to use with Pinggy |  |
| `--pinggy-token` | A string | The token to use with pinggy |  |

### `agrume build`

You can use the CLI to build the routes:

```bash
agrume build
```

It allows you not being dependent on Agrume to run your backend.

By default, `agrume build` will write in TypeScript a Fastify server in the
`build` directory.
If a port is specified either in the configuration or in the command, you
will be able to run the server with `npx tsx build/index.mts`. Otherwise, you
will be able to import a `registerServer` function from the generated file and
use it in your own Fastify server.

#### Options

| Option              | Argument     | Description                                                                                                           | Default                                          |
| ------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `library`           |              | The library to compile for. Choices: `fastify`                                                                       | `"fastify"`                                      |
| `-e`, `--entry`     | A list of strings separated by a comma    | The entry files to search for routes                                                                                 | `"index.js,index.ts,index.jsx,index.tsx,main.js,main.ts,main.jsx,main.tsx,app.js,app.ts,app.jsx,app.tsx,src/index.js,src/index.ts,src/index.jsx,src/index.tsx,src/main.js,src/main.ts,src/main.jsx,src/main.tsx,src/app.js,src/app.ts,src/app.jsx,src/app.tsx"`        |
| `-o`, `--output`    | A directory were to write   | The output directory                                                                                                 | `"build"`                                        |
| `--disable-logger`  |              | Disable the logger of the server                                                                                                   | `false`                                          |
| `--single-file`     |              | Generate a single file                                                                                               | `false`                                          |
| `-p`, `--port`      | A string for an environment variable, or a number     | The port the server will listen on. By default, it uses the port from the config file. Set a string to select an environment variable, or leave empty to avoid generating listen code. | *not provided* |
| `-w`, `--watch`     | *Optional* The directory to watch for changes   | Watch for changes in the target directory                                                                            | *not provided*                                   |

For example, if you want to build a Fastify server in the `dist` directory that listens on the port `1234`, you can run:

```bash
agrume build fastify --output dist --port 1234
```

#### Use as a Fastify plugin

You can generate a function that will register the routes in a Fastify server:

```bash
agrume build fastify --output agrume-server --port ""
```

Then, you can use the generated function in your Fastify server:

```ts
import fastify from 'fastify'
import { registerServer } from './agrume-server'

const app = fastify()

registerServer(app)

// Do something with the app, like listening on a port
```

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
