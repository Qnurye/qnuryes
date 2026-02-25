import { Body, Container, Head, Heading, Html, Link, Preview, Tailwind, Text } from '@react-email/components';
import type React from 'react';
import Fonts from '@/emails/_components/Fonts';

export interface GuestbookNotificationProps {
  nickname: string;
  message: string | null;
  locale: string;
  reviewUrl: string;
  createdAt: string;
}

const localeDisplay: Record<string, string> = {
  en: 'English',
  'zh-cn': 'Simplified Chinese',
  'zh-tw': 'Traditional Chinese',
};

export const GuestbookNotification = ({
  nickname,
  message,
  locale,
  reviewUrl,
  createdAt,
}: GuestbookNotificationProps): React.ReactElement => {
  return (
    <Html>
      <Head>
        <Fonts />
      </Head>
      <Preview>{`🖊️ New guestbook entry — ${nickname}`}</Preview>
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
            <Text className="text-base text-secondary leading-6">You have a new guestbook submission:</Text>
            <Text className="text-base text-secondary leading-6">
              <strong>Nickname:</strong> {nickname}
              <br />
              <strong>Visitor's language:</strong> {localeDisplay[locale] || locale}
              <br />
              <strong>Message:</strong> {message || 'No message'}
              <br />
              <strong>Submitted at:</strong> {createdAt}
            </Text>
            <Link
              className="my-4 block rounded bg-primary py-4 text-center font-bold font-serif text-background text-lg"
              href={reviewUrl}
            >
              Review this entry
            </Link>
            <Text className="text-secondary text-sm">This link expires in 7 days and can only be used once.</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default GuestbookNotification;

GuestbookNotification.PreviewProps = {
  nickname: 'Alice',
  message: 'Love your blog! Keep writing.',
  locale: 'en',
  reviewUrl: 'https://api.qnury.es/guestbook/review?token=abc123',
  createdAt: '2026-02-25 14:30 UTC',
};
