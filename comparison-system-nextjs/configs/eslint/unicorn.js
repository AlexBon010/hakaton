import unicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';

export const unicornConfig = defineConfig({
  plugins: {
    unicorn,
  },

  rules: {
    'unicorn/better-regex': 'warn',
    'unicorn/catch-error-name': ['error', { name: 'error' }],

    'unicorn/consistent-destructuring': 'warn',
    'unicorn/consistent-function-scoping': 'warn',

    'unicorn/prefer-array-flat': 'error',
    'unicorn/prefer-array-flat-map': 'error',

    'unicorn/prefer-string-replace-all': 'error',
    'unicorn/prefer-string-slice': 'error',
    'unicorn/prefer-string-trim-start-end': 'error',

    'unicorn/prefer-object-from-entries': 'error',

    'unicorn/no-useless-undefined': 'warn',

    'unicorn/number-literal-case': 'error',
    'unicorn/prefer-number-properties': 'error',

    'unicorn/prefer-node-protocol': 'error',

    'unicorn/no-await-expression-member': 'error',

    'unicorn/prefer-set-has': 'warn',
    'unicorn/prefer-includes': 'warn',

    'unicorn/no-empty-file': 'error',
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          camelCase: true,
          pascalCase: true,
        },
      },
    ],

    'unicorn/no-null': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/no-array-for-each': 'off',
    'unicorn/prefer-arrow-functions': 'off',
  },
});
