import { defineConfig } from 'eslint/config';

export const baseConfig = defineConfig({
  rules: {
    'prefer-object-has-own': 'error',
  },
});
