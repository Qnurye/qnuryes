import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react'
import { tomlI18n } from './plugins/toml-i18n.ts';

// https://astro.build/config
export default defineConfig({
  site: 'http://localhost:4321',
  vite: {
    plugins: [
      tailwindcss(),
      tomlI18n(),
    ],
  },
  integrations: [react()],
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
