import { defineConfig, envField } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react'
import tomlI18n from './integrations/toml-i18n.ts';
import sentry from '@sentry/astro';
// import spotlightjs from '@spotlightjs/astro';
import process from 'node:process';
import sitemap from '@astrojs/sitemap';

import { loadEnv } from 'vite';

import partytown from '@astrojs/partytown';

import umami from '@yeskunall/astro-umami';

const { PUBLIC_SENTRY_DSN, SENTRY_AUTH_TOKEN, PUBLIC_BASE_URL, NODE_ENV, UMAMI_ID } = loadEnv(
  process.env.NODE_ENV || 'development', process.cwd(), '',
);

export default defineConfig({
  env: {
    schema: {
      PUBLIC_SENTRY_DSN: envField.string({ context: 'server', access: 'public' }),
      SENTRY_AUTH_TOKEN: envField.string({ context: 'server', access: 'secret' }),
      GA_ID: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_API_BASE_URL: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_BASE_URL: envField.string({ context: 'client', access: 'public' }),
      UMAMI_ID: envField.string({ context: 'client', access: 'public' }),
    },
  },
  site: PUBLIC_BASE_URL,
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  integrations: [react(), tomlI18n(),
    // Passing DSN directly to sentry integration will be deprecated in the future
    // https://docs.sentry.io/platforms/javascript/guides/astro/#astro-integration-setup
    // However, it causes issue if I setup `sentry.client.config.js` and `sentry.server.config.js`.
    // Maybe caused by the `loadEnv` function.
    sentry({
      dsn: PUBLIC_SENTRY_DSN,
      enabled: NODE_ENV === 'production',
      sourceMapsUploadOptions: {
        project: 'qnuryes',
        authToken: SENTRY_AUTH_TOKEN,
      },
    }),
    // spotlightjs(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          'en': 'en-US',
          'zh-cn': 'zh-CN',
          'zh-tw': 'zh-TW',
        },
      },
      xslURL: '/rss/pretty-feed-v3.xsl',
    }), partytown({
      config: {
        forward: ['dataLayer.push', 'gtag'],
      },
    }), umami({
      id: UMAMI_ID,
    })],
  i18n: {
    locales: ['en', 'zh-cn', 'zh-tw'],
    defaultLocale: 'en',
    routing: {
      fallbackType: 'rewrite',
      redirectToDefaultLocale: true,
    },
    fallback: {
      'zh-tw': 'zh-cn',
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
