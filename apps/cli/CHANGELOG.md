# @agrume/server

## 3.3.0

### Minor Changes

- 9007df8: Use polymorphism for tunnels to improve stability (create an `@agrume/tunnel` package at the same time).

### Patch Changes

- Updated dependencies [9007df8]
  - @agrume/core@3.3.0
  - @agrume/internals@3.3.0
  - @agrume/plugin@3.2.0
  - @agrume/tunnel@3.1.0
  - @agrume/types@3.3.0

## 3.2.3

### Patch Changes

- e4e81f1: Fix SSH remote host for Pinggy.

## 3.2.2

### Patch Changes

- 166b5cd: Fix bad remote URL for Pinggy tunnel.
- Updated dependencies [166b5cd]
  - @agrume/internals@3.2.1
  - @agrume/core@3.2.2
  - @agrume/plugin@3.1.2

## 3.2.1

### Patch Changes

- Updated dependencies [01f937b]
  - @agrume/core@3.2.1
  - @agrume/plugin@3.1.1

## 3.2.0

### Minor Changes

- 232bfa1: Removed the small amount of time when the server had no route registered and raised a 404 when watcher was rebuilding the project. Added support for Pinggy (https://pinggy.io) tunnels.

### Patch Changes

- Updated dependencies [232bfa1]
  - @agrume/core@3.2.0
  - @agrume/internals@3.2.0
  - @agrume/plugin@3.1.0
  - @agrume/types@3.2.0

## 3.1.1

### Patch Changes

- 89facb2: Fix watcher not watching recursively. Fix AsyncGenerators not correctly detected in React Native.
  - @agrume/core@3.1.1
  - @agrume/plugin@3.0.2

## 3.1.0

### Minor Changes

- c5d4d79: Add support for Ngrok and custom CORS in the CLI.

### Patch Changes

- Updated dependencies [c5d4d79]
  - @agrume/core@3.1.0
  - @agrume/internals@3.1.0
  - @agrume/types@3.1.0
  - @agrume/plugin@3.0.1

## 3.0.0

### Major Changes

- 0dc3cc0: **What's new in Agrume 3?**

  - Custom HTTP error throwing
  - Accept void or undefined as return type
  - Realtime parameter
  - Global client
  - Optimized client
  - Config file for CLI

  See the documentation for more information.

### Patch Changes

- Updated dependencies [0dc3cc0]
  - @agrume/core@3.0.0
  - @agrume/internals@3.0.0
  - @agrume/plugin@3.0.0
  - @agrume/types@3.0.0

## 2.0.3

### Patch Changes

- @agrume/plugin@2.0.3

## 2.0.2

### Patch Changes

- @agrume/plugin@2.0.2

## 2.0.1

### Patch Changes

- @agrume/plugin@2.0.1

## 2.0.0

### Major Changes

- 5fb60e7: - Support for stream/iterable route
  - Agrume CLI
  - Some fixes

### Minor Changes

- 843f053: Add support for tunneling with Bore
- a22a091: Add watch option
- 9a4d21a: Add security option --allow-unsafe in Agrume CLI
- 344d4a0: Add support for tunneling
- 01e90f8: Make external source detection works in monorepo
- 5952d93: Introduce cross-framework plugin \`@agrume/plugin\`.
- a4a3630: Introduce babel-preset-agrume and automatically find entry file when using Agrume CLI.

### Patch Changes

- b660121: Add Node shebang to the CLI
- 56ce19f: Improve watching and tunneling together with CLI
- d210a9a: Fix bad identification of external dependencies in Agrume CLI.
- 034c046: Use HTTP instead of HTTPS when using Bore
- 4ddd7f6: Show errors of Bore tunnel
- Updated dependencies [d144095]
- Updated dependencies [843f053]
- Updated dependencies [9d503c1]
- Updated dependencies [24e08ae]
- Updated dependencies [344d4a0]
- Updated dependencies [034c046]
- Updated dependencies [4ddd7f6]
- Updated dependencies [5952d93]
- Updated dependencies [a4a3630]
- Updated dependencies [5fb60e7]
  - @agrume/core@2.0.0
  - @agrume/internals@2.0.0
  - @agrume/plugin@2.0.0

## 2.0.0-beta.15

### Patch Changes

- 4ddd7f6: Show errors of Bore tunnel
- Updated dependencies [4ddd7f6]
  - @agrume/core@2.0.0-beta.5
  - @agrume/internals@2.0.0-beta.5
  - @agrume/plugin@2.0.0-beta.9

## 2.0.0-beta.14

### Patch Changes

- 034c046: Use HTTP instead of HTTPS when using Bore
- Updated dependencies [034c046]
  - @agrume/core@2.0.0-beta.4
  - @agrume/internals@2.0.0-beta.4
  - @agrume/plugin@2.0.0-beta.8

## 2.0.0-beta.13

### Minor Changes

- 843f053: Add support for tunneling with Bore

### Patch Changes

- Updated dependencies [843f053]
  - @agrume/core@2.0.0-beta.3
  - @agrume/internals@2.0.0-beta.3
  - @agrume/plugin@2.0.0-beta.7

## 2.0.0-beta.12

### Patch Changes

- 56ce19f: Improve watching and tunneling together with CLI

## 2.0.0-beta.11

### Minor Changes

- a22a091: Add watch option

## 2.0.0-beta.10

### Minor Changes

- 344d4a0: Add support for tunneling

### Patch Changes

- Updated dependencies [344d4a0]
  - @agrume/core@2.0.0-beta.2
  - @agrume/internals@2.0.0-beta.2
  - @agrume/plugin@2.0.0-beta.6

## 2.0.0-beta.9

### Patch Changes

- b660121: Add Node shebang to the CLI

## 2.0.0-beta.8

### Minor Changes

- 01e90f8: Make external source detection works in monorepo

## 2.0.0-beta.7

### Patch Changes

- d210a9a: Fix bad identification of external dependencies in Agrume CLI.

## 2.0.0-beta.6

### Minor Changes

- 9a4d21a: Add security option --allow-unsafe in Agrume CLI

## 2.0.0-beta.5

### Patch Changes

- Updated dependencies [9d503c1]
  - @agrume/plugin@2.0.0-beta.5

## 2.0.0-beta.4

### Minor Changes

- a4a3630: Introduce babel-preset-agrume and automatically find entry file when using Agrume CLI.

### Patch Changes

- Updated dependencies [a4a3630]
  - @agrume/plugin@2.0.0-beta.4

## 2.0.0-beta.3

### Patch Changes

- Updated dependencies [d144095]
  - @agrume/core@2.0.0-beta.1
  - @agrume/plugin@2.0.0-beta.3
  - @agrume/internals@2.0.0-beta.1

## 2.0.0-beta.2

### Patch Changes

- Updated dependencies [24e08ae]
  - @agrume/plugin@2.0.0-beta.2

## 2.0.0-beta.1

### Minor Changes

- 5952d93: Introduce cross-framework plugin \`@agrume/plugin\`.

### Patch Changes

- Updated dependencies [5952d93]
  - @agrume/plugin@2.0.0-beta.1

## 2.0.0-beta.0

### Major Changes

- 5fb60e7: - Support for stream/iterable route
  - Agrume CLI
  - Some fixes

### Patch Changes

- Updated dependencies [5fb60e7]
  - @agrume/core@2.0.0-beta.0
  - @agrume/internals@2.0.0-beta.0
  - vite-plugin-agrume@2.0.0-beta.0
