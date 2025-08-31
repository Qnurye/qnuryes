import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { loadTranslations } from '@/i18n';
export { getI18nPaths as getStaticPaths } from '@/i18n';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
const parser = new MarkdownIt();

export const GET: APIRoute = async (context): Promise<Response> => {
  const locale = context.currentLocale;
  const t = await loadTranslations(locale);
  const blog = await getCollection('blog', p => p.data.locale === locale);
  return await rss({
    title: t('landing.page_title'),
    description: t('landing.page_description'),
    site: context.site || new URL('https://qnury.es/'),
    items: blog.map(post => ({
      title: post.data.title,
      pubDate: post.data.created_at,
      description: post.data.description,
      link: `/${locale}/blog/${post.id}/`,
      content: sanitizeHtml(parser.render(post.body || ''), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      }),
    })),
    stylesheet: '/rss/pretty-feed-v3.xsl',
  })
}
