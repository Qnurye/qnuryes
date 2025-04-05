interface ImportMetaEnv {
  readonly SENTRY_AUTH_TOKEN: string;
  readonly PUBLIC_SENTRY_DSN: string;
  readonly GA_ID: string;
  readonly API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
