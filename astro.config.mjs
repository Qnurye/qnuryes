import { defineConfig, envField } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react'
import tomlI18n from './integrations/toml-i18n.ts';
import sentry from '@sentry/astro';
import spotlightjs from '@spotlightjs/astro';
import process from 'node:process';
import sitemap from '@astrojs/sitemap';

import { loadEnv } from 'vite';

import partytown from '@astrojs/partytown';

const { PUBLIC_SENTRY_DSN, SENTRY_AUTH_TOKEN, NODE_ENV } = loadEnv(process.env.NODE_ENV, process.cwd(), '');

export default defineConfig({
  env: {
    schema: {
      PUBLIC_SENTRY_DSN: envField.string({ context: 'server', access: 'public' }),
      SENTRY_AUTH_TOKEN: envField.string({ context: 'server', access: 'secret' }),
      GA_ID: envField.string({ context: 'client', access: 'public' }),
    },
  },
  site: 'https://qnury.es/',
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  integrations: [react(), tomlI18n(), sentry({
    dsn: NODE_ENV === 'development' ? PUBLIC_SENTRY_DSN : '',
    sourceMapsUploadOptions: {
      project: 'qnuryes',
      authToken: SENTRY_AUTH_TOKEN,
    },
  }), spotlightjs(), sitemap({
    i18n: {
      defaultLocale: 'en',
      locales: {
        'en': 'en-US',
        'zh-cn': 'zh-CN',
        'zh-tw': 'zh-TW',
      },
    },
  }), partytown({
    config: {
      forward: ['dataLayer.push', 'gtag'],
    },
  })],
  i18n: {
    locales: ['en', 'zh-cn', 'zh-tw'],
    defaultLocale: 'en',
    routing: {
      fallbackType: 'redirect',
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
    fallback: {
      'zh-tw': 'zh-cn',
      'zh-cn': 'en',
    },
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
  prefetch: {
    prefetchAll: true,
  },
});
