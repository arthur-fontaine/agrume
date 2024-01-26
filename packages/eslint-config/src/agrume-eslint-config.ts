import antfu, { pluginJsdoc, pluginPerfectionist } from '@antfu/eslint-config'
import filenameExportPlugin from 'eslint-plugin-filename-export'
import filenamePlugin from 'eslint-plugin-filename-rules'
import fpPlugin from 'eslint-plugin-fp'

export const agrumeEslintConfig = antfu(
  {
    rules: {
      ...pluginPerfectionist.configs['recommended-natural'].rules,
      'style/indent': ['error', 2, {
        flatTernaryExpressions: true,
      }],
      'style/multiline-ternary': 'off',
    },
    stylistic: true,
  },
  pluginJsdoc.configs['flat/recommended'],
  {
    plugins: {
      'filename-export': filenameExportPlugin,
      'filename-rules': filenamePlugin,
      'fp': fpPlugin,
    },
    rules: {
      'curly': ['error', 'all'],

      'filename-export/match-named-export': ['error', {
        stripextra: true,
      }],
      'filename-rules/not-match': [2, /(.*\.d\.ts$)|(^index\..*)/],

      'fp/no-throw': 'error',

      'import/no-default-export': ['error'],

      'jsdoc/match-description': ['error'],
      'jsdoc/require-description': ['error'],

      'jsdoc/require-description-complete-sentence': ['error'],

      'jsdoc/require-jsdoc': ['error', {
        publicOnly: true,
        require: {
          ArrowFunctionExpression: true,
          ClassDeclaration: true,
          ClassExpression: true,
          FunctionDeclaration: true,
          FunctionExpression: true,
          MethodDefinition: true,
        },
      }],
      'ts/no-explicit-any': ['error'],
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
        },
      ],
      'unicorn/switch-case-braces': ['error'],
    },
  },
)
