import { Body, Container, Head, Heading, Html, Link, Preview, Tailwind, Text } from '@react-email/components';
import type React from 'react';
import Fonts from '@/emails/_components/Fonts';
import { en } from '@/i18n/en';
import { zhCN } from '@/i18n/zh-cn';
import { zhTW } from '@/i18n/zh-tw';

export interface GuestbookApprovedProps {
  nickname: string;
  locale: 'en' | 'zh-cn' | 'zh-tw';
  wallUrl: string;
}

const translations = {
  'zh-cn': zhCN,
  en: en,
  'zh-tw': zhTW,
};

export const GuestbookApproved = ({ nickname, locale, wallUrl }: GuestbookApprovedProps): React.ReactElement => {
  const t = translations[locale];

  return (
    <Html>
      <Head>
        <Fonts />
      </Head>
      <Preview>{t.guestbook.approved_preview.replace('{name}', nickname)}</Preview>
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
          <Container className="flex w-full flex-col p-4">
            <Heading className="mb-4 font-bold font-serif text-2xl italic">Qnury.e's</Heading>
            <Text className="text-base text-secondary leading-6">
              {t.guestbook.approved_greeting.replace('{name}', nickname)}
            </Text>
            <Text className="text-base text-secondary leading-6">{t.guestbook.approved_body}</Text>
            <Link
              className="my-4 block rounded bg-primary py-4 text-center font-bold font-serif text-background text-lg"
              href={wallUrl}
            >
              {t.guestbook.approved_cta}
            </Link>
            <Text className="text-base text-secondary leading-6">{t.guestbook.approved_thanks}</Text>
            <Text className="text-base text-secondary leading-6">{t.guestbook.approved_sign}</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default GuestbookApproved;

GuestbookApproved.PreviewProps = {
  nickname: 'Alice',
  locale: 'en',
  wallUrl: 'https://qnury.es/en/guestbook',
};
