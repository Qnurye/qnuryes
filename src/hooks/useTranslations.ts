import { useEffect, useState } from 'react';
import { loadTranslations } from '@/i18n';

/**
 * React hook to load and use translations
 * @param locale The current locale
 * @returns A translation function and loading state
 */
export function useTranslations(locale: string): {
  t: (key: string) => string
  isLoading: boolean
} {
  const [t, setT] = useState<(key: string) => string>(() => (key: string): string => key);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load(): Promise<void> {
      try {
        const translationFn = await loadTranslations(locale);
        if (isMounted) {
          setT(() => translationFn);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(`Error loading translations for locale "${locale}":`, error);
        if (isMounted) {
          setT(() => (key: string): string => key);
          setIsLoading(false);
        }
      }
    }

    setIsLoading(true);
    void load();

    return (): void => {
      isMounted = false;
    };
  }, [locale]);

  return { t, isLoading };
}
