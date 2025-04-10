import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Markdown,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import React from 'react';
import { zhCN } from '@/i18n/zh-cn';
import { en } from '@/i18n/en';
import { zhTW } from '@/i18n/zh-tw';

export interface NewsletterProps {
  issue: string
  posts: Array<{
    id: string
    title: string
    description: string
    created_at: Date
    updated_at: Date
    tags: string[]
    content: string
  }>
  locale: 'zh-cn' | 'en' | 'zh-tw'
}

const translations = {
  'zh-cn': zhCN,
  'en': en,
  'zh-tw': zhTW,
};

export const Newsletter = ({ issue, posts, locale }: NewsletterProps): React.ReactElement => {
  const t = translations[locale];

  return (
    <Html>
      <Head />
      <Preview>{t.newsletter.title} - {issue}</Preview>
      <Tailwind
        config={{ theme: { extend: { colors: {
          primary: '#000000',
          secondary: '#444444',
          background: '#ffffff',
          border: '#dedede',
        } } } }}
      >
        <Body className="bg-background font-sans">
          <Container className="mx-auto max-w-[580px] py-5 px-0">
            <Heading className="text-primary text-2xl font-bold my-10 text-center">
              {t.newsletter.title}
            </Heading>
            <Text className="text-secondary text-base leading-6 my-4">
              {t.newsletter.issue}: {issue}
            </Text>

            {posts.map(post => (
              <Section key={post.id} className="p-6 border border-border rounded mb-5 text-center">
                <Heading className="text-primary text-xl font-bold mb-2.5">
                  {post.title}
                </Heading>
                <Markdown
                  markdownContainerStyles={{
                    color: '#444',
                    fontSize: '16px',
                    lineHeight: '24px',
                    margin: '16px 0',
                    textAlign: 'left',
                  }}
                  markdownCustomStyles={{
                    p: { color: '#444', fontSize: '16px', lineHeight: '24px', margin: '16px 0' },
                    h1: {
                      color: '#000',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      margin: '40px 0',
                      padding: '0',
                      textAlign: 'center',
                    },
                    h2: { color: '#000', fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px', padding: '0' },
                    h3: { color: '#000', fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px', padding: '0' },
                  }}
                >
                  {post.description}
                </Markdown>
                <Markdown
                  markdownContainerStyles={{
                    color: '#444',
                    fontSize: '16px',
                    lineHeight: '24px',
                    margin: '16px 0',
                    textAlign: 'left',
                  }}
                  markdownCustomStyles={{
                    p: { color: '#444', fontSize: '16px', lineHeight: '24px', margin: '16px 0' },
                    h1: {
                      color: '#000',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      margin: '40px 0',
                      padding: '0',
                      textAlign: 'center',
                    },
                    h2: { color: '#000', fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px', padding: '0' },
                    h3: { color: '#000', fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px', padding: '0' },
                  }}
                >
                  {post.content}
                </Markdown>
                <Text className="text-secondary text-base leading-6 my-4">
                  {t.newsletter.tags}: {post.tags.join(', ')}
                </Text>
                <Button
                  href={`https://qnurye.com/blog/${post.id}`}
                  className="bg-primary text-white text-base no-underline text-center block py-3 px-4 my-5 rounded"
                >
                  {t.newsletter.readMore}
                </Button>
              </Section>
            ))}

            <Section className="p-6 border border-border rounded mb-5 text-center">
              <Text className="text-secondary text-base leading-6 my-4">
                {t.newsletter.thanks.replace('{link}', t.newsletter.website)}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Newsletter;
