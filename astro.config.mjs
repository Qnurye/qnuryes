import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react'
import tomlI18n from './integrations/toml-i18n.ts';

export default defineConfig({
  site: 'https://qnury.es',
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  integrations: [
    react(),
    tomlI18n(),
  ],
  i18n: {
    locales: ['en', 'zh-cn', 'zh-tw'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
    },
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
})
