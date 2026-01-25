import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Resend } from 'resend';
import { CommentHandler } from '@/handlers/comment';
import { LikeHandler } from '@/handlers/like';
import { SubscriptionHandler } from '@/handlers/subscription';
import type { Env, Post } from '@/types';
import Newsletter from './emails/Newsletter';

const app = new Hono<{ Bindings: Env }>();

app.use(
  '*',
  cors({
    origin: '*', // Allow all origins, can also be a specific domain
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400, // 24 hours
  }),
);

// Initialize handlers
app.use('*', async (c, next) => {
  const commentHandler = new CommentHandler(c.env as unknown as Env);
  const likeHandler = new LikeHandler(c.env as unknown as Env);
  const subscriptionHandler = new SubscriptionHandler(c.env as unknown as Env);
  c.set('commentHandler' as never, commentHandler as never);
  c.set('likeHandler' as never, likeHandler as never);
  c.set('subscriptionHandler' as never, subscriptionHandler as never);
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

app.post('/subscription', async (c) => {
  const handler = c.get('subscriptionHandler' as never) as SubscriptionHandler;
  return handler.subscribe(c);
});

app.get('/subscription/confirmation', async (c) => {
  const handler = c.get('subscriptionHandler' as never) as SubscriptionHandler;
  return handler.confirm(c);
});

app.get('/', (c) => c.text('Hello Hono!'));

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    try {
      const kv = env.subscription;
      const TRIGGERED_BROADCAST = 'triggered_broadcast';
      const bounce = (await kv.get(TRIGGERED_BROADCAST)) === event.cron;
      if (bounce) {
        // eslint-disable-next-line no-console
        console.log({ scheduledTime: new Date(event.scheduledTime).toISOString(), status: 'canceled' });
        return;
      }

      await kv.put(TRIGGERED_BROADCAST, event.cron, { expirationTtl: 120 });

      // eslint-disable-next-line no-console
      console.log({ scheduledTime: new Date(event.scheduledTime).toISOString(), status: 'running' });

      const now = new Date();
      now.setMonth(now.getMonth() - 1);
      const year = String(now.getFullYear()).slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const issue = `${year}${month}`;

      const locale = 'en';
      const response = await fetch(`${env.WEBSITE_BASE_URL}/${locale}/blog/issues/newsletter/${issue}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Seems somebody wrote no shit for this month');
        }
        console.error(response);
        await kv.delete(TRIGGERED_BROADCAST);
        return;
      }

      const posts = (await response.json()) as Post[];

      if (posts.length === 0) {
        console.warn(`No posts found for locale ${locale} in issue ${issue}`);
        return;
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
        console.error(broadcastResponse);
        await kv.delete(TRIGGERED_BROADCAST);
        return;
      }

      const sendResponse = await resend.broadcasts.send(broadcastResponse.data.id);
      if (sendResponse.error) {
        console.error(sendResponse);
        await kv.delete(TRIGGERED_BROADCAST);
        return;
      }

      // eslint-disable-next-line no-console
      console.log({ scheduledTime: new Date(event.scheduledTime).toISOString(), status: 'done' });
    } catch (error) {
      console.error(error);
    }
  },
};
