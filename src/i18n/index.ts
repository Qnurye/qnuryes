import type { GetStaticPathsResult } from 'astro';

export const locales = {
  'en': 'English',
  'zh-cn': '简体中文',
  'zh-tw': '繁體中文',
};

export const defaultLocale = 'en';

export const getLanguageNameFromLocale = (locale: string): string => {
  if (!(locale in locales)) {
    return locale;
  }

  return locales[locale as keyof typeof locales];
};

export const getI18nPaths = (): GetStaticPathsResult =>
  Object.keys(locales).map(locale => ({
    params: { locale },
  }));

export interface Translations {
  [key: string]: string | Translations
}

export function getTranslationValue(obj: Translations, key: string): string {
  const tokens = key.split('.');
  let result: string | Translations = obj;

  for (const token of tokens) {
    if (result === undefined || typeof result === 'string') {
      return '';
    }

    result = result[token];
  }

  return typeof result === 'string' ? result : '';
}

export interface InterpolationValues {
  [key: string]: string | number
}

export async function loadTranslations(locale: string | undefined): Promise<(
  key: string, values?: InterpolationValues
) => string> {
  const resolvedLocale = locale || defaultLocale;

  try {
    const translations = await import(`./compiled/${resolvedLocale}.json`);

    return (key: string, values?: InterpolationValues): string => {
      const rawText = getTranslationValue(translations.default, key);

      if (!values || !rawText) {
        return rawText;
      }

      return Object.entries(values).reduce((result, [placeholder, value]) => {
        const pattern = new RegExp(`\\{${placeholder}\\}`, 'g');
        return result.replace(pattern, String(value));
      }, rawText);
    };
  } catch (error) {
    console.error(`Error loading translations for locale "${resolvedLocale}":`, error);
    return (k: string) => k;
  }
}
