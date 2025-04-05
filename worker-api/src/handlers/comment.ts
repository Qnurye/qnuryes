import { Context } from 'hono';
import { BaseHandler } from './base';
import { Comment, commentRequestSchema, CommentResponse, Env, PaginationResponse } from '@/types';
import { ErrorCode } from '@/constants/errors';

export class CommentHandler extends BaseHandler {
  constructor(env: Env) {
    super(env);
  }

  async getCommentsByPostId(c: Context): Promise<Response> {
    const postId = c.req.param('post_id');
    if (!postId) {
      return c.json({ code: ErrorCode.INVALID_POST_ID }, 400);
    }

    const page = parseInt(c.req.query('page') || '1');
    const pageSize = parseInt(c.req.query('limit') || '20');

    if (page < 1) {
      return c.json({ code: ErrorCode.INVALID_PAGE_NUMBER }, 400);
    }
    if (pageSize < 1) {
      return c.json({ code: ErrorCode.INVALID_PAGE_SIZE }, 400);
    }

    const offset = (page - 1) * pageSize;

    try {
      // Get total count
      const countResult = await this.db.prepare(
        'SELECT COUNT(*) as total FROM comments WHERE post_id = ? AND parent_id IS NULL AND status = ?',
      )
        .bind(postId, 'approved')
        .first<{ total: number }>();

      const totalItems = countResult?.total || 0;
      const totalPages = Math.ceil(totalItems / pageSize);

      // Get top-level comments
      const comments = await this.db.prepare(
        `SELECT *
         FROM comments
         WHERE post_id = ?
           AND parent_id IS NULL
           AND status = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
      )
        .bind(postId, 'approved', pageSize, offset)
        .all<Comment>();

      // Get replies for each comment
      const commentsWithReplies = await Promise.all(
        comments.results.map(async (comment) => {
          const replies = await this.db.prepare(
            `SELECT *
             FROM comments
             WHERE parent_id = ?
               AND status = ?
             ORDER BY created_at`,
          )
            .bind(comment.id, 'approved')
            .all<Comment>();

          return {
            ...comment,
            replies: replies.results,
          };
        }),
      );

      const response: PaginationResponse<CommentResponse> = {
        data: commentsWithReplies,
        page,
        pageSize,
        totalItems,
        totalPages,
      };

      return c.json(response);
    } catch (error) {
      console.error('Database error:', error);
      return c.json({ code: ErrorCode.DATABASE_ERROR }, 500);
    }
  }

  async getCommentById(c: Context): Promise<Response> {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ code: ErrorCode.INVALID_COMMENT_ID }, 400);
    }

    try {
      const comment = await this.db.prepare(
        'SELECT * FROM comments WHERE id = ? AND status = ?',
      )
        .bind(id, 'approved')
        .first<Comment>();

      if (!comment) {
        return c.json({ code: ErrorCode.COMMENT_NOT_FOUND }, 404);
      }

      if (comment.parentId === null) {
        const replies = await this.db.prepare(
          `SELECT *
           FROM comments
           WHERE parent_id = ?
             AND status = ?
           ORDER BY created_at`,
        )
          .bind(comment.id, 'approved')
          .all<Comment>();

        comment.replies = replies.results;
      }

      return c.json(comment);
    } catch (error) {
      console.error('Database error:', error);
      return c.json({ code: ErrorCode.DATABASE_ERROR }, 500);
    }
  }

  async createComment(c: Context): Promise<Response> {
    const body = await c.req.json();
    const validation = commentRequestSchema.safeParse(body);

    if (!validation.success) {
      return c.json({
        code: ErrorCode.MISSING_REQUIRED_FIELDS,
        details: validation.error.errors[0].message,
      }, 400);
    }

    const {
      post_id: postId, parent_id: parentId, author_name: authorName, author_email: authorEmail, content,
    } = validation.data;

    const clientIP = this.getClientIP(c);
    const countryCode = this.getCountryCode(c);

    try {
      if (parentId) {
        const parentExists = await this.db.prepare(
          'SELECT 1 FROM comments WHERE id = ? AND status = ?',
        )
          .bind(parentId, 'approved')
          .first();

        if (!parentExists) {
          return c.json({ code: ErrorCode.PARENT_COMMENT_NOT_FOUND }, 400);
        }

        const result = await this.db.prepare(
          `INSERT INTO comments (post_id, parent_id, author_name, author_email, author_ip,
                                 content, country_code, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
           RETURNING *`,
        ).bind(
          postId,
          parentId,
          authorName,
          authorEmail,
          clientIP,
          content,
          countryCode,
          'approved',
        ).first<Comment>();

        return c.json(result, 201);
      } else {
        const result = await this.db.prepare(
          `INSERT INTO comments (post_id, author_name, author_email, author_ip,
                                 content, country_code, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
           RETURNING *`,
        ).bind(
          postId,
          authorName,
          authorEmail,
          clientIP,
          content,
          countryCode,
          'approved',
        ).first<Comment>();

        return c.json(result, 201);
      }
    } catch (error) {
      console.error('Database error:', error);
      return c.json({ code: ErrorCode.DATABASE_ERROR }, 500);
    }
  }
}
