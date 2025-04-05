interface ImportMetaEnv {
  readonly SENTRY_AUTH_TOKEN: string;
  readonly PUBLIC_SENTRY_DSN: string;
  readonly GA_ID: string;
  readonly PUBLIC_API_BASE_URL: string;
  readonly PUBLIC_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
