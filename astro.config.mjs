import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react'

// https://astro.build/config
export default defineConfig({
  site: 'http://localhost:4321',
  vite: {
    plugins: [tailwindcss()],
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
