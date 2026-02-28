export function trackEvent(event: string, data?: Record<string, string | number | boolean>): void {
  if (typeof window !== 'undefined') {
    window.umami?.track(event, data);
  }
}
