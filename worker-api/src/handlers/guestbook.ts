import type { KVNamespace } from '@cloudflare/workers-types';
import {
  GUESTBOOK_PAGE_SIZE,
  GUESTBOOK_RATE_LIMIT_MAX,
  GUESTBOOK_RATE_LIMIT_TTL,
  GUESTBOOK_TOKEN_EXPIRY,
  KV_PREFIX_GUESTBOOK_RATELIMIT,
  SVG_PATH_REGEX,
} from '@qnury-es/shared';
import type { Context } from 'hono';
import { Resend } from 'resend';
import { ErrorCode } from '@/constants/errors';
import { GuestbookApproved } from '@/emails/GuestbookApproved';
import { GuestbookNotification } from '@/emails/GuestbookNotification';
import { GuestbookRejected } from '@/emails/GuestbookRejected';
import type { Env, GuestbookSubmission } from '@/types';
import { guestbookRejectSchema, guestbookReviewSchema, guestbookSubmitSchema } from '@/types';
import { BaseHandler } from './base';

export class GuestbookHandler extends BaseHandler {
  private kv: KVNamespace;
  private resend: Resend;
  private notifyEmail: string;

  constructor(env: Env) {
    super(env);
    this.kv = env.subscription;
    this.resend = new Resend(env.RESEND_API_KEY);
    this.notifyEmail = env.GUESTBOOK_NOTIFY_EMAIL;
  }

  private async hashToken(token: string): Promise<string> {
    const data = new TextEncoder().encode(token);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  async submit(c: Context): Promise<Response> {
    const body = await c.req.json();
    const parsed = guestbookSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ code: ErrorCode.MISSING_REQUIRED_FIELDS, errors: parsed.error.flatten() }, 400);
    }

    const { nickname, email, url, message, signature_svg, signature_bbox, locale, address } = parsed.data;

    // Honeypot: silent fake success
    if (address) {
      return c.json({ success: true }, 201);
    }

    // Rate limit
    const clientIP = this.getClientIP(c);
    const rateLimitKey = `${KV_PREFIX_GUESTBOOK_RATELIMIT}:${clientIP}`;
    const currentCount = await this.kv.get(rateLimitKey);
    const count = currentCount ? Number.parseInt(currentCount, 10) : 0;
    if (count >= GUESTBOOK_RATE_LIMIT_MAX) {
      return c.json({ code: ErrorCode.GUESTBOOK_RATE_LIMITED }, 429);
    }

    // Validate SVG path
    if (!SVG_PATH_REGEX.test(signature_svg)) {
      return c.json({ code: ErrorCode.INVALID_SIGNATURE }, 400);
    }

    // Validate signature_bbox is valid JSON with required numeric fields
    try {
      const bbox = JSON.parse(signature_bbox);
      if (
        typeof bbox.x !== 'number' ||
        typeof bbox.y !== 'number' ||
        typeof bbox.width !== 'number' ||
        typeof bbox.height !== 'number'
      ) {
        return c.json({ code: ErrorCode.INVALID_SIGNATURE }, 400);
      }
    } catch {
      return c.json({ code: ErrorCode.INVALID_SIGNATURE }, 400);
    }

    const id = crypto.randomUUID();
    const reviewToken = crypto.randomUUID();
    const tokenHash = await this.hashToken(reviewToken);
    const now = Date.now();

    try {
      await this.db
        .prepare(
          `INSERT INTO guestbook_submissions (id, created_at, nickname, email, url, message, signature_svg, signature_bbox, locale, status, ip, approve_token_hash, token_used, token_expires_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, 0, ?)`,
        )
        .bind(
          id,
          now,
          nickname,
          email ?? null,
          url ?? null,
          message ?? null,
          signature_svg,
          signature_bbox,
          locale,
          clientIP,
          tokenHash,
          now + GUESTBOOK_TOKEN_EXPIRY,
        )
        .run();

      // Increment rate limit counter
      await this.kv.put(rateLimitKey, String(count + 1), { expirationTtl: GUESTBOOK_RATE_LIMIT_TTL });

      // Send notification email to site owner
      try {
        const reviewUrl = `${c.env.WEBSITE_BASE_URL}/en/guestbook/review?token=${reviewToken}`;
        await this.resend.emails.send({
          from: c.env.RESEND_FROM,
          to: this.notifyEmail,
          subject: `New guestbook submission from ${nickname}`,
          react: GuestbookNotification({
            nickname,
            message: message ?? null,
            locale,
            reviewUrl,
            createdAt: new Date(now).toISOString(),
          }),
        });
      } catch (err) {
        // biome-ignore lint/suspicious/noConsole: non-fatal email error logged for wrangler tail debugging
        console.error('[guestbook] Failed to send notification email:', err);
      }

      return c.json({ success: true }, 201);
    } catch {
      return c.json({ code: ErrorCode.DATABASE_ERROR }, 500);
    }
  }

  async getByToken(c: Context): Promise<Response> {
    const token = c.req.query('token');
    if (!token) {
      return c.json({ code: ErrorCode.INVALID_TOKEN }, 400);
    }

    const tokenHash = await this.hashToken(token);

    try {
      const row = await this.db
        .prepare('SELECT * FROM guestbook_submissions WHERE approve_token_hash = ?')
        .bind(tokenHash)
        .first<GuestbookSubmission>();

      if (!row) {
        return c.json({ code: ErrorCode.INVALID_TOKEN }, 404);
      }

      if (row.token_used) {
        return c.json({ code: ErrorCode.TOKEN_ALREADY_USED }, 400);
      }

      if (Date.now() > row.token_expires_at) {
        return c.json({ code: ErrorCode.TOKEN_EXPIRED }, 400);
      }

      // Return submission data without sensitive fields
      return c.json({
        id: row.id,
        created_at: row.created_at,
        nickname: row.nickname,
        url: row.url,
        message: row.message,
        signature_svg: row.signature_svg,
        signature_bbox: row.signature_bbox,
        locale: row.locale,
        status: row.status,
        reject_reason: row.reject_reason,
      });
    } catch {
      return c.json({ code: ErrorCode.DATABASE_ERROR }, 500);
    }
  }

  async approve(c: Context): Promise<Response> {
    const body = await c.req.json();
    const parsed = guestbookReviewSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ code: ErrorCode.INVALID_TOKEN }, 400);
    }

    const tokenHash = await this.hashToken(parsed.data.token);

    try {
      const row = await this.db
        .prepare('SELECT * FROM guestbook_submissions WHERE approve_token_hash = ?')
        .bind(tokenHash)
        .first<GuestbookSubmission>();

      if (!row) {
        return c.json({ code: ErrorCode.INVALID_TOKEN }, 404);
      }

      if (row.token_used) {
        return c.json({ code: ErrorCode.TOKEN_ALREADY_USED }, 400);
      }

      if (Date.now() > row.token_expires_at) {
        return c.json({ code: ErrorCode.TOKEN_EXPIRED }, 400);
      }

      await this.db
        .prepare(`UPDATE guestbook_submissions SET status = 'approved', token_used = 1, reviewed_at = ? WHERE id = ?`)
        .bind(Date.now(), row.id)
        .run();

      // Send approval notification to visitor if they provided email
      if (row.email) {
        try {
          const wallUrl = `${c.env.WEBSITE_BASE_URL}/${row.locale}/guestbook`;
          await this.resend.emails.send({
            from: c.env.RESEND_FROM,
            to: row.email,
            subject: 'Your guestbook entry has been approved!',
            react: GuestbookApproved({
              nickname: row.nickname,
              locale: row.locale as 'en' | 'zh-cn' | 'zh-tw',
              wallUrl,
            }),
          });
        } catch (err) {
          // biome-ignore lint/suspicious/noConsole: non-fatal email error logged for wrangler tail debugging
          console.error('[guestbook] Failed to send approval email:', err);
        }
      }

      return c.json({ success: true });
    } catch {
      return c.json({ code: ErrorCode.DATABASE_ERROR }, 500);
    }
  }

  async reject(c: Context): Promise<Response> {
    const body = await c.req.json();
    const parsed = guestbookRejectSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ code: ErrorCode.MISSING_REJECT_REASON }, 400);
    }

    const tokenHash = await this.hashToken(parsed.data.token);

    try {
      const row = await this.db
        .prepare('SELECT * FROM guestbook_submissions WHERE approve_token_hash = ?')
        .bind(tokenHash)
        .first<GuestbookSubmission>();

      if (!row) {
        return c.json({ code: ErrorCode.INVALID_TOKEN }, 404);
      }

      if (row.token_used) {
        return c.json({ code: ErrorCode.TOKEN_ALREADY_USED }, 400);
      }

      if (Date.now() > row.token_expires_at) {
        return c.json({ code: ErrorCode.TOKEN_EXPIRED }, 400);
      }

      await this.db
        .prepare(
          `UPDATE guestbook_submissions SET status = 'rejected', reject_reason = ?, token_used = 1, reviewed_at = ? WHERE id = ?`,
        )
        .bind(parsed.data.reason, Date.now(), row.id)
        .run();

      // Send rejection notification to visitor if they provided email
      if (row.email) {
        try {
          await this.resend.emails.send({
            from: c.env.RESEND_FROM,
            to: row.email,
            subject: 'About your guestbook entry',
            react: GuestbookRejected({
              nickname: row.nickname,
              locale: row.locale as 'en' | 'zh-cn' | 'zh-tw',
              reason: parsed.data.reason,
            }),
          });
        } catch (err) {
          // biome-ignore lint/suspicious/noConsole: non-fatal email error logged for wrangler tail debugging
          console.error('[guestbook] Failed to send rejection email:', err);
        }
      }

      return c.json({ success: true });
    } catch {
      return c.json({ code: ErrorCode.DATABASE_ERROR }, 500);
    }
  }

  async getWall(c: Context): Promise<Response> {
    const cursor = c.req.query('cursor');
    const limitParam = c.req.query('limit');
    const limit = limitParam ? Math.min(Number.parseInt(limitParam, 10), GUESTBOOK_PAGE_SIZE) : GUESTBOOK_PAGE_SIZE;

    try {
      let stmt: D1PreparedStatement;
      if (cursor) {
        stmt = this.db
          .prepare(
            `SELECT id, nickname, url, message, signature_svg, signature_bbox, created_at
             FROM guestbook_submissions
             WHERE status = 'approved' AND created_at < ?
             ORDER BY created_at DESC
             LIMIT ?`,
          )
          .bind(Number.parseInt(cursor, 10), limit + 1);
      } else {
        stmt = this.db
          .prepare(
            `SELECT id, nickname, url, message, signature_svg, signature_bbox, created_at
             FROM guestbook_submissions
             WHERE status = 'approved'
             ORDER BY created_at DESC
             LIMIT ?`,
          )
          .bind(limit + 1);
      }

      const { results } = await stmt.all();
      const hasMore = results.length > limit;
      const entries = hasMore ? results.slice(0, limit) : results;
      const next_cursor = hasMore ? String(entries[entries.length - 1].created_at) : null;

      return c.json({ entries, next_cursor });
    } catch {
      return c.json({ code: ErrorCode.DATABASE_ERROR }, 500);
    }
  }
}
