import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

import { baseConfig } from './base.js';
import { importsConfig } from './imports.js';
import { promiseConfig } from './promise.js';
import { securityConfig } from './security.js';
import { unicornConfig } from './unicorn.js';

export const defineCustomConfig = () =>
  defineConfig([
    ...baseConfig,
    ...importsConfig,
    ...promiseConfig,
    ...securityConfig,
    ...unicornConfig,
    eslintConfigPrettier,
  ]);
