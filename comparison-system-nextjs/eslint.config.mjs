import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';
import { defineCustomConfig } from './configs/eslint/index.js';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...defineCustomConfig(),

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'public',
    'node_modules',
    '.husky',
    'lint-staged.config.js',
  ]),
]);

export default eslintConfig;

