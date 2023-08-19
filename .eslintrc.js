module.exports = {
  root: true,
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.js', '*.config.js', '*.config.ts'],
  extends: ['@whitebird'],
  rules: {
    'functional/functional-parameters': 'off',
  },
}
