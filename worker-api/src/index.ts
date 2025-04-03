import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { CommentHandler } from './handlers/comment';
import { LikeHandler } from './handlers/like';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// Configure CORS
app.use('*', cors({
  origin: '*', // You can replace this with specific origins like ['https://yourdomain.com']
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 24 hours
}));

// Initialize handlers
app.use('*', async (c, next) => {
  const commentHandler = new CommentHandler(c.env);
  const likeHandler = new LikeHandler(c.env);
  c.set('commentHandler', commentHandler);
  c.set('likeHandler', likeHandler);
  await next();
});

// Comment routes
app.get('/posts/:post_id/comments', async (c) => {
  const handler = c.get('commentHandler') as CommentHandler;
  return handler.getCommentsByPostId(c);
});

app.get('/comments/:id', async (c) => {
  const handler = c.get('commentHandler') as CommentHandler;
  return handler.getCommentById(c);
});

app.post('/comments', async (c) => {
  const handler = c.get('commentHandler') as CommentHandler;
  return handler.createComment(c);
});

// Like routes
app.post('/comments/:id/like', async (c) => {
  const handler = c.get('likeHandler') as LikeHandler;
  return handler.likeComment(c);
});

app.delete('/comments/:id/like', async (c) => {
  const handler = c.get('likeHandler') as LikeHandler;
  return handler.unlikeComment(c);
});

export default app;
