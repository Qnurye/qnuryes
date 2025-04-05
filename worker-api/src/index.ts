import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { CommentHandler } from '@/handlers/comment';
import { LikeHandler } from '@/handlers/like';
import type { Env } from '@/types';

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

export default app;
