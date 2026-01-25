import { getCollection } from 'astro:content';
import type { GetStaticPathsResult } from 'astro';
import { dateToIssue } from '@/lib/utils';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const issues = (await getCollection('blog')).reduce((acc, post) => {
    const issue = dateToIssue(post.data.created_at);
    acc = acc || [];
    acc.unshift(issue);
    return acc;
  }, [] as string[]);

  return issues.flatMap((issue) => [
    { params: { locale: 'en', slug: issue } },
    { params: { locale: 'ko', slug: issue } },
  ]);
}
