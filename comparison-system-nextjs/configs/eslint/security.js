import security from 'eslint-plugin-security';
import { defineConfig } from 'eslint/config';

export const securityConfig = defineConfig({
  plugins: {
    security,
  },

  rules: {
    'security/detect-object-injection': 'off',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'warn',
  },
});
