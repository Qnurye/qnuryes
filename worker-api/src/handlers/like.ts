import { Context } from 'hono';
import { BaseHandler } from './base';
import type { Env } from '../types';
import { ErrorCode } from '../constants/errors';

export class LikeHandler extends BaseHandler {
  constructor(env: Env) {
    super(env);
  }

  async likeComment(c: Context): Promise<Response> {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ code: ErrorCode.INVALID_COMMENT_ID }, 400);
    }

    const clientIP = this.getClientIP(c);

    try {
      // Check if comment exists
      const comment = await this.db.prepare(
        'SELECT 1 FROM comments WHERE id = ? AND status = ?',
      )
        .bind(id, 'approved')
        .first();

      if (!comment) {
        return c.json({ code: ErrorCode.COMMENT_NOT_FOUND }, 404);
      }

      // Check if already liked
      const existingLike = await this.db.prepare(
        'SELECT 1 FROM comment_likes WHERE comment_id = ? AND user_identifier = ?',
      )
        .bind(id, clientIP)
        .first();

      if (existingLike) {
        return c.json({ code: ErrorCode.ALREADY_LIKED }, 400);
      }

      // Add like
      await this.db.prepare(
        'INSERT INTO comment_likes (comment_id, user_identifier) VALUES (?, ?)',
      )
        .bind(id, clientIP)
        .run();

      // Update likes count
      await this.db.prepare(
        'UPDATE comments SET likes = likes + 1 WHERE id = ?',
      )
        .bind(id)
        .run();

      return c.json({ success: true });
    } catch (error) {
      console.error('Database error:', error);
      return c.json({ code: ErrorCode.DATABASE_ERROR }, 500);
    }
  }

  async unlikeComment(c: Context): Promise<Response> {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ code: ErrorCode.INVALID_COMMENT_ID }, 400);
    }

    const clientIP = this.getClientIP(c);

    try {
      // Check if like exists
      const like = await this.db.prepare(
        'SELECT 1 FROM comment_likes WHERE comment_id = ? AND user_identifier = ?',
      )
        .bind(id, clientIP)
        .first();

      if (!like) {
        return c.json({ code: ErrorCode.NOT_LIKED }, 400);
      }

      // Remove like
      await this.db.prepare(
        'DELETE FROM comment_likes WHERE comment_id = ? AND user_identifier = ?',
      )
        .bind(id, clientIP)
        .run();

      // Update likes count
      await this.db.prepare(
        'UPDATE comments SET likes = likes - 1 WHERE id = ?',
      )
        .bind(id)
        .run();

      return c.json({ success: true });
    } catch (error) {
      console.error('Database error:', error);
      return c.json({ code: ErrorCode.DATABASE_ERROR }, 500);
    }
  }
}
