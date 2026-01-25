// src/middleware.ts
import { defineMiddleware } from 'astro/middleware';
import { defaultLocale, locales } from '@/i18n';

const matcher = '/((?!api|trpc|_image|_astro|.*\\.(?!xml$)[a-z0-9]+).*)';

const hasLocale = new RegExp(`^/(${Object.keys(locales).join('|')})(/|$)`);

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  if (!pathname.match(matcher)) {
    return next();
  }
  if (hasLocale.test(pathname)) {
    return next();
  }
  return context.rewrite(new URL(`/${defaultLocale}${pathname}`, context.request.url));
});
