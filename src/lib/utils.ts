import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { type SupportedLanguages, readingTime } from 'reading-time-estimator';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString: string, locale: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString(locale, options).toUpperCase();
};

export const formatDateAsMonth = (dateString: string, locale: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
  };
  return date.toLocaleDateString(locale, options).toUpperCase();
};

export const wpm = {
  'en': 200,
  'zh-cn': 300,
  'zh-tw': 300,
} as Record<string, number>;

export const readingTimeLocales = {
  'en': 'en',
  'zh-cn': 'cn',
  'zh-tw': 'cn',
} as Record<string, SupportedLanguages>

export const getReadingTime = (text: string, locale: string): number =>
  readingTime(text, wpm[locale], readingTimeLocales[locale]).minutes
