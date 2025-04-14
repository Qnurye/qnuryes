import {
  Button,
  Heading, Hr, Link,
  Markdown,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

export interface NewsletterCardProps {
  url: string
  title: string
  description: string
  content: string
  time: string
  tags: string[]
  readMoreText: string
}

export const NewsletterCard = ({
  url,
  title,
  description,
  time,
  content,
  tags,
  readMoreText,
}: NewsletterCardProps): React.ReactElement => (
  <Section className="p-6 border border-border rounded mb-5">
    <Hr />
    <Heading className="text-primary text-xl font-bold font-serif mb-2.5">
      {title}
    </Heading>
    <Text className="flex flex-wrap gap-3 font-serif text-secondary text-sm">
      {time}
      {tags.map(tag => (
        <span className="font-mono" key={tag}>#{tag}</span>
      ))}
    </Text>
    <Markdown
      markdownCustomStyles={{
        h1: {
          fontSize: '1.25rem',
          fontFamily: 'Arvo, serif',
        },
        h2: {
          fontSize: '1rem',
          fontFamily: 'Arvo, serif',
        },
        h3: {
          fontSize: '1rem',
          fontFamily: 'Arvo, serif',
        },
        h4: {
          fontSize: '1rem',
          fontFamily: 'Arvo, serif',
        },
        codeInline: { background: 'grey' },
        codeBlock: {
          width: '100%',
          padding: '1rem',
        },
      }}
    >
      {description}
    </Markdown>
    <Markdown
      markdownCustomStyles={{
        h1: {
          fontSize: '1.25rem',
          fontFamily: 'Arvo, serif',
        },
        h2: {
          fontSize: '1rem',
          fontFamily: 'Arvo, serif',
        },
        h3: {
          fontSize: '1rem',
          fontFamily: 'Arvo, serif',
        },
        h4: {
          fontSize: '1rem',
          fontFamily: 'Arvo, serif',
        },
        codeInline: { background: 'grey' },
        codeBlock: {
          width: '100%',
          padding: '1rem',
        },
      }}
      markdownContainerStyles={{
        maxHeight: '32rem',
        overflowY: 'hidden',
      }}
    >
      {content}
    </Markdown>
    <Button
      href={url}
      className="bg-primary text-white text-base no-underline text-center block py-3 px-4 my-5 rounded"
    >
      {readMoreText}
    </Button>
    <Link
      href={url}
    >
      {readMoreText}
    </Link>
  </Section>
);

export default NewsletterCard;
