import { Body, Container, Head, Heading, Html, Link, Preview, Tailwind, Text } from '@react-email/components';
import type React from 'react';
import Fonts from '@/emails/_components/Fonts';
import { en } from '@/i18n/en';
import { zhCN } from '@/i18n/zh-cn';
import { zhTW } from '@/i18n/zh-tw';

export interface NewsletterProps {
  firstName?: string;
  locale: 'zh-cn' | 'en' | 'zh-tw';
  url: string;
}

const translations = {
  'zh-cn': zhCN,
  en: en,
  'zh-tw': zhTW,
};

export const Subscribe = ({ firstName, locale, url }: NewsletterProps): React.ReactElement => {
  const t = translations[locale];

  return (
    <Html>
      <Head>
        <Fonts />
      </Head>
      <Preview>{t.subscribe.preview.replace('{name}', firstName || 'there')}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                primary: '#000000',
                secondary: '#444444',
                background: '#ffffff',
                border: '#dedede',
              },
              fontFamily: {
                sans: ['Nunito', 'sans-serif'],
                mono: ['Maple Mono', 'monospace'],
                serif: ['Arvo', 'serif'],
              },
            },
          },
        }}
      >
        <Body className="bg-background font-sans">
          <Container className="w-full p-4 flex flex-col">
            <Heading className="font-serif text-2xl font-bold italic mb-4">Qnury.e's</Heading>
            <Text>{t.subscribe.greeting.replace('{name}', firstName || 'there')}</Text>
            <Link
              className="bg-primary text-background font-bold text-lg py-4 font-serif rounded my-4 block text-center"
              href={url}
            >
              {t.subscribe.confirm}
            </Link>
            <Text>{t.subscribe.ignore}</Text>
            <Text>
              {t.subscribe.fallback} <Link href={url}>{url}</Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Subscribe;

Subscribe.PreviewProps = {
  firstName: 'Qnurye',
  locale: 'en',
  url: 'https://qnury.es',
};
