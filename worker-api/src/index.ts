import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { CommentHandler } from '@/handlers/comment';
import { LikeHandler } from '@/handlers/like';
import type { Env, Post } from '@/types';
import { Resend } from 'resend';
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
      console.log('Starting newsletter job at ', new Date(event.scheduledTime).toISOString());

      const now = new Date();
      const issue = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

      const locale = 'en';
      const response = await fetch(`${env.WEBSITE_BASE_URL}/${locale}/blog/issues/newsletter/${issue}`);
      if (!response.ok) {
        console.error(`Failed to fetch posts for locale ${locale}: ${response.statusText}`);
      }

      const posts = await response.json() as Post[];

      if (posts.length === 0) {
        console.warn(`No posts found for locale ${locale} in issue ${issue}`);
      }

      const emailReact = Newsletter({
        issue,
        posts,
        baseUrl: env.WEBSITE_BASE_URL,
        locale: locale as 'zh-cn' | 'en' | 'zh-tw',
      });

      const resend = new Resend(env.RESEND_API_KEY);
      const broadcastResponse = await resend.broadcasts.create({
        name: `Vol. ${issue}`,
        audienceId: env.RESEND_AUDIENCE_ID,
        from: env.RESEND_FROM,
        subject: `Qnury.e's Newsletter`,
        react: emailReact,
      });
      if (!broadcastResponse.data || !broadcastResponse.data.id) {
        console.error(`Failed to send newsletter for issue ${issue}:`, broadcastResponse.error);
        return
      }

      const sendResponse = await resend.broadcasts.send(broadcastResponse.data.id);
      if (sendResponse.error) {
        console.error(`Failed to send newsletter for issue ${issue}:`, sendResponse.error);
        return
      }
    } catch (error) {
      console.error('Failed to send newsletter:', error);
    }
  },
};
