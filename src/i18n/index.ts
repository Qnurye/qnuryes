export const locales = {
  "en": "English",
  "zh-cn": "简体中文",
  "zh-tw": "繁體中文",
}

export const getLanguageFromLocale = (locale: string) => {
  if (!(locale in locales)) {
    return locale
  } else {
    return locales[locale as keyof typeof locales]
  }
}

export const staticPaths = Object.keys(locales).map(locale => ({
  params: {locale},
}))

export async function loadTranslations(locale: string | undefined) {
  try {
    const translations = await import(`./messages/${locale || 'en'}.json`);
    return (key: string) => key.split('.').reduce((obj, i) => obj?.[i], translations.default) || '';
  } catch (error) {
    console.error(`Error loading translations for locale "${locale}":`, error);
    return (key: string) => key;
  }
}
