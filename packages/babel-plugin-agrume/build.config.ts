import { defineBuildConfig } from 'unbuild'

// eslint-disable-next-line import/no-default-export
export default defineBuildConfig({
  clean: true,
  declaration: true,
  entries: [
    'src/agrume-plugin',
  ],
  rollup: {
    emitCJS: true,
  },
})
