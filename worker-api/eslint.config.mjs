import globals from 'globals'
import pluginJs from '@eslint/js'
import ts from 'typescript-eslint'
import stylisticPlugin from '@stylistic/eslint-plugin'

export default [
  pluginJs.configs.recommended,
  ...ts.configs.recommended,
  stylisticPlugin.configs.recommended,
  {
    ignores: ['**/dist/', '**/node_modules/', '**/.wrangler/', '**/.react-email'],
  },
  {
    files: ['**/*.{js,mjs,cjs,mts,ts,tsx,jsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/ban-ts-comment': 'error',

      '@stylistic/semi': 'off',
      'curly': ['error', 'all'],
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'max-depth': ['error', 4],
      'max-lines-per-function': ['error', { max: 100, skipComments: true }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'arrow-body-style': ['error', 'as-needed'],
      '@stylistic/max-statements-per-line': ['off', { max: 2 }],
      '@stylistic/jsx-one-expression-per-line': 'off',
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],

      'camelcase': ['error', { properties: 'never' }],

      'indent': 'off',
      '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
      'max-len': ['error', { code: 120, ignoreUrls: true }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-blocks': 'error',
      'space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      }],
      'comma-dangle': ['error', 'always-multiline'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        // Cloudflare Workers specific globals
        caches: 'readonly',
        crypto: 'readonly',
        fetch: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
      },
    },
  },
]
