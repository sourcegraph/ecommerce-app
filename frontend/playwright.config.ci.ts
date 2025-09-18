import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig(baseConfig, {
  webServer: undefined, // Services managed by compose
  use: {
    ...baseConfig.use,
    baseURL: 'http://frontend:3001',
    headless: true,
  },
});
