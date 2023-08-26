module.exports = {
  root: true,
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.js', '*.config.js', '*.config.ts', '*.config.mjs'],
  extends: ['@whitebird'],
  rules: {
    'functional/functional-parameters': 'off',
  },
}
