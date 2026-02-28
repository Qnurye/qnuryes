interface ImportMetaEnv {
  readonly SENTRY_AUTH_TOKEN: string;
  readonly PUBLIC_SENTRY_DSN: string;
  readonly GA_ID: string;
  readonly PUBLIC_API_BASE_URL: string;
  readonly PUBLIC_BASE_URL: string;
  readonly UMAMI_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Umami {
  track(event: string, data?: Record<string, string | number | boolean>): void;
  identify(data: Record<string, string | number | boolean>): void;
}

interface Window {
  umami?: Umami;
}
