import { Body, Container, Head, Heading, Html, Link, Preview, Section, Tailwind, Text } from '@react-email/components';
import React from 'react';
import { zhCN } from '@/i18n/zh-cn';
import { en } from '@/i18n/en';
import { zhTW } from '@/i18n/zh-tw';
import NewsletterCard from './_components/NewsletterCard';
import Fonts from '@/emails/_components/Fonts';

export interface NewsletterProps {
  issue: string
  posts: Array<{
    id: string
    title: string
    description: string
    created_at: string
    updated_at: string
    tags: string[]
    content: string
  }>
  locale: 'zh-cn' | 'en' | 'zh-tw'
  baseUrl: string
}

const translations = {
  'zh-cn': zhCN,
  'en': en,
  'zh-tw': zhTW,
};

export const Newsletter = ({ issue, posts, locale, baseUrl }: NewsletterProps): React.ReactElement => {
  const t = translations[locale];

  return (
    <Html>
      <Head>
        <Fonts />
      </Head>
      <Preview>{`Hi {{{FIRST_NAME|there}}}, here is my latest updates. check Vol.${issue}!`}</Preview>
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
          <Container className="mx-auto max-w-[580px] py-5 px-2">
            <Heading className="text-secondary text-sm font-bold my-4 font-serif">
              {t.newsletter.title}
            </Heading>
            <Text className="text-primary flex flex-row gap-2 text-4xl items-end my-4 font-mono">
              <span className="text-2xl font-mono">Vol.</span>{issue}
            </Text>
            <Text>
              简体中文读者请查看<Link href={`${baseUrl}/zh-cn/blog/issues/${issue}`}>简体中文版本</Link>。
              <br />
              繁體中文讀者請查看<Link href={`${baseUrl}/zh-tw/blog/issues/${issue}`}>繁體中文版本</Link>。
            </Text>

            {posts.map(post => (
              <NewsletterCard
                key={post.id}
                url={`${baseUrl}/${locale}/blog/${post.id}`}
                title={post.title}
                description={post.description}
                content={post.content}
                tags={post.tags}
                readMoreText={t.newsletter.readMore}
                time={new Date(post.created_at).toLocaleDateString(locale, {
                  year: '2-digit',
                  month: 'short',
                  day: '2-digit',
                })}
              />
            ))}
            <Section className="p-6 border border-border rounded mb-5 text-pretty">
              <Text className="text-secondary text-base leading-6 my-4">
                {
                  t.newsletter.thanks
                }
              </Text>
              <Text className="text-secondary text-base leading-6 my-4">
                {
                  t.newsletter.unsubscribe
                }{' '}
                <Link href="{{{RESEND_UNSUBSCRIBE_URL}}}">unsubscribe</Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Newsletter;

Newsletter.PreviewProps = {
  issue: '202504',
  posts: [
    {
      id: 'tomb',
      title: 'Digital Tombstone',
      description: '**In youth,** everything seems so close—that is the future. In old age, everything seems so'
        + ' distant—that is the past.',
      created_at: new Date('2025-04-01T00:32:00.000Z'),
      updated_at: new Date('2025-04-01T14:58:03.000Z'),
      tags: ['foo', 'bar'],
      content: 'Qui ad commodo nisi nostrud aliquip quis tempor amet culpa non adipisicing eiusmod ipsum nisi.'
        + ' Lorem id quis tempor veniam velit sunt nostrud culpa aute adipisicing sit in consequat. Aliqua non anim'
        + ' et sit duis nostrud velit cupidatat sint est irure. Sint nisi do ad elit tempor deserunt pariatur.'
        + ' Aliquip laboris cupidatat duis sunt amet.\n\n'
        + ' Lorem id quis tempor veniam velit sunt nostrud culpa aute adipisicing sit in consequat. Aliqua non anim'
        + ' et sit duis nostrud velit cupidatat sint est irure. Sint nisi do ad elit tempor deserunt pariatur.'
        + ' Aliquip laboris cupidatat duis sunt amet.\n\n'
        + ' Lorem id quis tempor veniam velit sunt nostrud culpa aute adipisicing sit in consequat. Aliqua non anim'
        + ' et sit duis nostrud velit cupidatat sint est irure. Sint nisi do ad elit tempor deserunt pariatur.'
        + ' Aliquip laboris cupidatat duis sunt amet.\n\n'
        + ' Lorem id quis tempor veniam velit sunt nostrud culpa aute adipisicing sit in consequat. Aliqua non anim'
        + ' et sit duis nostrud velit cupidatat sint est irure. Sint nisi do ad elit tempor deserunt pariatur.'
        + ' Aliquip laboris cupidatat duis sunt amet.\n\n'
        + ' Lorem id quis tempor veniam velit sunt nostrud culpa aute adipisicing sit in consequat. Aliqua non anim'
        + ' et sit duis nostrud velit cupidatat sint est irure. Sint nisi do ad elit tempor deserunt pariatur.'
        + ' Aliquip laboris cupidatat duis sunt amet.\n\n',
    },
    {
      id: 'terms',
      title: 'Terms of Service & Privacy Policy',
      description: 'Read the following terms of service and privacy policy carefully before using this site.',
      created_at: new Date('2025-04-01T00:00:00.000Z'),
      updated_at: new Date('2025-04-01T00:00:03.000Z'),
      tags: [],
      content: 'Exercitation mollit qui exercitation sint deserunt est proident ut fugiat aliqua.',
    },
  ],
  locale: 'en',
  baseUrl: 'https://qnury.es',
}
