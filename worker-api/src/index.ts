import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { CommentHandler } from '@/handlers/comment';
import { LikeHandler } from '@/handlers/like';
import type { Env, Post, Contact, BatchEmail, BatchEmailResponse } from '@/types';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import Newsletter from './emails/Newsletter';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*', // Allow all origins, can also be a specific domain
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 24 hours
}));

// Initialize handlers
app.use('*', async (c, next) => {
  const commentHandler = new CommentHandler(c.env as unknown as Env);
  const likeHandler = new LikeHandler(c.env as unknown as Env);
  c.set('commentHandler' as never, commentHandler as never);
  c.set('likeHandler' as never, likeHandler as never);
  await next();
});

// Comment routes
app.get('/posts/:post_id/comments', async (c) => {
  const handler = c.get('commentHandler' as never) as CommentHandler;
  return handler.getCommentsByPostId(c);
});

app.get('/comments/:id', async (c) => {
  const handler = c.get('commentHandler' as never) as CommentHandler;
  return handler.getCommentById(c);
});

app.get('/comments/:id/replies', async (c) => {
  const handler = c.get('commentHandler' as never) as CommentHandler;
  return handler.getCommentReplies(c);
});

app.post('/comments', async (c) => {
  const handler = c.get('commentHandler' as never) as CommentHandler;
  return handler.createComment(c);
});

// Like routes
app.post('/comments/:id/like', async (c) => {
  const handler = c.get('likeHandler' as never) as LikeHandler;
  return handler.likeComment(c);
});

app.delete('/comments/:id/like', async (c) => {
  const handler = c.get('likeHandler' as never) as LikeHandler;
  return handler.unlikeComment(c);
});

app.get('/', c => c.text('Hello Hono!'));

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    try {
      console.warn('Starting newsletter job at ', new Date(event.scheduledTime).toISOString());

      const now = new Date();
      const issue = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      const resend = new Resend(env.RESEND_API_KEY);

      // Fetch contacts from Resend
      const data = await resend.contacts.list({
        audienceId: env.RESEND_AUDIENCE_ID,
      })
      const contactsResponse = data.data

      if (!contactsResponse?.data) {
        console.error('failed to fetch contacts');
        return;
      }

      // Group contacts by locale and filter out unsubscribed
      const contactsByLocale = contactsResponse.data.reduce((acc: Record<string, string[]>, contact: Contact) => {
        if (!contact.unsubscribed && contact.last_name) {
          const locale = contact.last_name;
          acc[locale] = acc[locale] || [];
          acc[locale].push(contact.email);
        }
        return acc;
      }, {});

      // Prepare batch emails for each locale
      const batchEmails: BatchEmail[] = [];
      for (const [locale, emails] of Object.entries(contactsByLocale)) {
        const response = await fetch(`${env.WEBSITE_BASE_URL}/${locale}/blog/issues/newsletter/${issue}`);
        if (!response.ok) {
          console.error(`Failed to fetch posts for locale ${locale}: ${response.statusText}`);
          continue;
        }

        const posts = await response.json() as Post[];

        if (posts.length === 0) {
          console.warn(`No posts found for locale ${locale} in issue ${issue}`);
          continue;
        }

        const emailHtml = await render(
          await Newsletter({
            issue,
            posts,
            locale: locale as 'zh-cn' | 'en' | 'zh-tw',
          }),
        );

        batchEmails.push({
          from: env.RESEND_FROM,
          to: emails,
          subject: `Qnury.e's - Vol.${issue}`,
          html: emailHtml,
        });
      }

      if (batchEmails.length > 0) {
        const chunkSize = 100;
        const chunks = [];
        for (let i = 0; i < batchEmails.length; i += chunkSize) {
          chunks.push(batchEmails.slice(i, i + chunkSize));
        }

        for (const chunk of chunks) {
          const { error } = await resend.batch.send(chunk) as {
              data: BatchEmailResponse
              error: Error | null
            };

          if (error) {
            console.error('Failed to send batch email:', error);
          }
        }
      } else {
        console.warn('No emails to send for this issue');
      }
    } catch (error) {
      console.error('Failed to send newsletter:', error);
    }
  },
};
