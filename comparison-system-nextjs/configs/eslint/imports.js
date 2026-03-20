import importPlugin from 'eslint-plugin-import';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import { defineConfig } from 'eslint/config';

export const importsConfig = defineConfig({
  files: ['**/*.{js,ts,tsx}'],

  plugins: {
    perfectionist: perfectionistPlugin,
    import: importPlugin,
  },

  rules: {
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],

    'import/newline-after-import': ['error', { count: 1 }],

    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      },
    ],

    'perfectionist/sort-imports': [
      'error',
      {
        type: 'alphabetical',
        order: 'asc',
        ignoreCase: true,

        groups: [
          'side-effect',
          'builtin',

          'react',
          'external',

          'internal',

          'parent',
          'sibling',
          'index',

          'import',

          'type-react',
          'type-external',
          'type-internal',
          'type-parent',
          'type-sibling',
          'type-index',
          'type-import',

          'side-effect-style',
          'style',
        ],

        customGroups: [
          {
            groupName: 'react',
            elementNamePattern: ['^react$', '^react-.*'],
          },
          {
            groupName: 'type-react',
            elementNamePattern: ['^react$', '^react-.*'],
            selector: 'type',
          },
        ],

        newlinesBetween: 1,

        internalPattern: ['^@/.+', '^app/.+'],
      },
    ],
  },
});
