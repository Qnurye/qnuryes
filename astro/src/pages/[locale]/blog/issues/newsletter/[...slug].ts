import type { APIRoute, GetStaticPathsResult } from 'astro';
import { getCollection } from 'astro:content';
import { dateToIssue } from '@/lib/utils';
import { getI18nPaths } from '@/i18n';

export const GET: APIRoute = async ({ params }) => {
  const locale = params.locale as string;
  const issue = params.slug as string;

  const posts = (await getCollection('blog', p =>
    p.data.locale === locale
    && dateToIssue(p.data.created_at) === issue,
  ))
    .sort((a, b) => b.data.created_at.getTime() - a.data.created_at.getTime())
    .map(post => ({
      id: post.data.translation_id,
      title: post.data.title,
      description: post.data.description,
      created_at: post.data.created_at,
      updated_at: post.data.updated_at,
      tags: post.data.tags,
      content: post.body,
    }));

  return new Response(JSON.stringify(posts), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const issues = (await getCollection('blog'))
    .reduce((acc, post) => {
      const issue = dateToIssue(post.data.created_at);
      acc = acc || [];
      acc.unshift(issue);
      return acc;
    }, [] as string[]);

  return issues.flatMap(issue =>
    getI18nPaths().map(i18nPath => ({
      params: {
        locale: i18nPath.params.locale,
        slug: issue,
      },
    })),
  );
}
