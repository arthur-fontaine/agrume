# babel-plugin-agrume

## 3.1.1

### Patch Changes

- Updated dependencies [01f937b]
  - @agrume/core@3.2.1
  - agrume@3.1.3

## 3.1.0

### Minor Changes

- 232bfa1: Removed the small amount of time when the server had no route registered and raised a 404 when watcher was rebuilding the project. Added support for Pinggy (https://pinggy.io) tunnels.

### Patch Changes

- Updated dependencies [232bfa1]
  - @agrume/core@3.2.0
  - @agrume/internals@3.2.0
  - @agrume/types@3.2.0
  - agrume@3.1.2

## 3.0.2

### Patch Changes

- @agrume/core@3.1.1
- agrume@3.1.1

## 3.0.1

### Patch Changes

- Updated dependencies [c5d4d79]
  - agrume@3.1.0
  - @agrume/core@3.1.0
  - @agrume/internals@3.1.0
  - @agrume/types@3.1.0

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
  - agrume@3.0.0
  - @agrume/core@3.0.0
  - @agrume/internals@3.0.0
  - @agrume/types@3.0.0

## 2.1.2

### Patch Changes

- cbd08ac: Fix undefined value for default imports on compiling

## 2.1.1

### Patch Changes

- 3c93814: In some cases, the route created was not the good one when there was multiple routes. This patch improve stability in choosing the route to register.

## 2.1.0

### Minor Changes

- f7ab7dc: Allow to import ESM-only modules.

## 2.0.0

### Major Changes

- 5fb60e7: - Support for stream/iterable route
  - Agrume CLI
  - Some fixes

### Minor Changes

- 344d4a0: Add support for tunneling

### Patch Changes

- 034c046: Use HTTP instead of HTTPS when using Bore
- 4ddd7f6: Show errors of Bore tunnel
- Updated dependencies [d144095]
- Updated dependencies [843f053]
- Updated dependencies [344d4a0]
- Updated dependencies [034c046]
- Updated dependencies [4ddd7f6]
- Updated dependencies [5fb60e7]
  - @agrume/core@2.0.0
  - @agrume/internals@2.0.0
  - agrume@2.0.0

## 2.0.0-beta.5

### Patch Changes

- 4ddd7f6: Show errors of Bore tunnel
- Updated dependencies [4ddd7f6]
  - agrume@2.0.0-beta.5
  - @agrume/core@2.0.0-beta.5
  - @agrume/internals@2.0.0-beta.5

## 2.0.0-beta.4

### Patch Changes

- 034c046: Use HTTP instead of HTTPS when using Bore
- Updated dependencies [034c046]
  - agrume@2.0.0-beta.4
  - @agrume/core@2.0.0-beta.4
  - @agrume/internals@2.0.0-beta.4

## 2.0.0-beta.3

### Patch Changes

- Updated dependencies [843f053]
  - @agrume/core@2.0.0-beta.3
  - @agrume/internals@2.0.0-beta.3
  - agrume@2.0.0-beta.3

## 2.0.0-beta.2

### Minor Changes

- 344d4a0: Add support for tunneling

### Patch Changes

- Updated dependencies [344d4a0]
  - agrume@2.0.0-beta.2
  - @agrume/core@2.0.0-beta.2
  - @agrume/internals@2.0.0-beta.2

## 2.0.0-beta.1

### Patch Changes

- Updated dependencies [d144095]
  - @agrume/core@2.0.0-beta.1
  - agrume@2.0.0-beta.1
  - @agrume/internals@2.0.0-beta.1

## 2.0.0-beta.0

### Major Changes

- 5fb60e7: - Support for stream/iterable route
  - Agrume CLI
  - Some fixes

### Patch Changes

- Updated dependencies [5fb60e7]
  - agrume@2.0.0-beta.0
  - @agrume/core@2.0.0-beta.0
  - @agrume/internals@2.0.0-beta.0

## 1.0.0

### Major Changes

- f85ee99: Initial release! 🎉

### Patch Changes

- Updated dependencies [f85ee99]
  - agrume@1.0.0
  - @agrume/core@1.0.0
