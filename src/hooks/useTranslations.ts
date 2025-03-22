import { useState, useEffect } from 'react';
import { loadTranslations } from '@/i18n';

/**
 * React hook to load and use translations
 * @param locale The current locale
 * @returns A translation function and loading state
 */
export function useTranslations(locale: string) {
  const [t, setT] = useState<(key: string) => string>(() => (key: string) => key);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function load() {
      try {
        const translationFn = await loadTranslations(locale);
        if (isMounted) {
          setT(() => translationFn);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(`Error loading translations for locale "${locale}":`, error);
        if (isMounted) {
          setT(() => (key: string) => key);
          setIsLoading(false);
        }
      }
    }

    setIsLoading(true);
    load();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  return { t, isLoading };
}
