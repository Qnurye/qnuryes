interface ImportMetaEnv {
  readonly SENTRY_AUTH_TOKEN: string;
  readonly PUBLIC_SENTRY_DSN: string;
  readonly GA_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}