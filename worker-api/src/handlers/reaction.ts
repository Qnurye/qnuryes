import type { KVNamespace } from '@cloudflare/workers-types';
import {
  DEFAULT_REACTIONS,
  KV_PREFIX_RATELIMIT,
  KV_PREFIX_REACTION,
  RATE_LIMIT_MAX,
  RATE_LIMIT_TTL,
  type ReactionCounts,
  VALID_LABELS,
} from '@qnury-es/shared';
import type { Context } from 'hono';
import { ErrorCode } from '@/constants/errors';
import type { Env, PostReaction } from '@/types';
import { BaseHandler } from './base';

export class ReactionHandler extends BaseHandler {
  private kv: KVNamespace;

  constructor(env: Env) {
    super(env);
    this.kv = env.subscription;
  }

  private buildDefaultCounts(): ReactionCounts {
    const counts: ReactionCounts = {};
    for (const r of DEFAULT_REACTIONS) {
      counts[r.label] = 0;
    }
    return counts;
  }

  private async getOrSeedRow(postSlug: string): Promise<ReactionCounts> {
    const row = await this.db
      .prepare('SELECT counts FROM post_reactions WHERE post_slug = ?')
      .bind(postSlug)
      .first<PostReaction>();

    if (row) {
      return JSON.parse(row.counts) as ReactionCounts;
    }

    // INSERT OR IGNORE to handle concurrent first-visitors safely
    const defaultCounts = this.buildDefaultCounts();
    await this.db
      .prepare('INSERT OR IGNORE INTO post_reactions (post_slug, counts) VALUES (?, ?)')
      .bind(postSlug, JSON.stringify(defaultCounts))
      .run();

    // Re-SELECT to return the winning row (ours or the concurrent one)
    const seeded = await this.db
      .prepare('SELECT counts FROM post_reactions WHERE post_slug = ?')
      .bind(postSlug)
      .first<PostReaction>();

    return JSON.parse(seeded?.counts ?? '{}') as ReactionCounts;
  }

  private async getCountsWithDeltas(postSlug: string, d1Counts: ReactionCounts): Promise<ReactionCounts> {
    const combined = { ...d1Counts };

    await Promise.all(
      DEFAULT_REACTIONS.map(async (r) => {
        const deltaStr = await this.kv.get(`${KV_PREFIX_REACTION}:${postSlug}:${r.label}`);
        if (deltaStr) {
          const delta = parseInt(deltaStr, 10);
          if (delta > 0) {
            combined[r.label] = (combined[r.label] || 0) + delta;
          }
        }
      }),
    );

    return combined;
  }

  async getReactions(c: Context): Promise<Response> {
    const postSlug = c.req.param('postSlug');
    if (!postSlug) {
      return c.json({ code: ErrorCode.INVALID_POST_SLUG }, 400);
    }

    try {
      const d1Counts = await this.getOrSeedRow(postSlug);
      const counts = await this.getCountsWithDeltas(postSlug, d1Counts);
      return c.json({ post_slug: postSlug, counts });
    } catch (_error) {
      return c.json({ code: ErrorCode.DATABASE_ERROR }, 500);
    }
  }

  async addReaction(c: Context): Promise<Response> {
    const postSlug = c.req.param('postSlug');
    if (!postSlug) {
      return c.json({ code: ErrorCode.INVALID_POST_SLUG }, 400);
    }

    const emoji = c.req.param('emoji');
    if (!emoji || !VALID_LABELS.has(emoji)) {
      return c.json({ code: ErrorCode.INVALID_EMOJI_LABEL }, 400);
    }

    const clientIP = this.getClientIP(c);

    try {
      // Rate limit check
      const rateLimitKey = `${KV_PREFIX_RATELIMIT}:${postSlug}:${clientIP}`;
      const currentCount = await this.kv.get(rateLimitKey);
      const count = currentCount ? parseInt(currentCount, 10) : 0;

      if (count >= RATE_LIMIT_MAX) {
        return c.json({ code: ErrorCode.RATE_LIMITED }, 429);
      }

      // Increment rate limit counter
      await this.kv.put(rateLimitKey, String(count + 1), { expirationTtl: RATE_LIMIT_TTL });

      // Increment KV delta
      const deltaKey = `${KV_PREFIX_REACTION}:${postSlug}:${emoji}`;
      const currentDelta = await this.kv.get(deltaKey);
      const delta = currentDelta ? parseInt(currentDelta, 10) : 0;
      await this.kv.put(deltaKey, String(delta + 1));

      // Return combined counts
      const d1Counts = await this.getOrSeedRow(postSlug);
      const counts = await this.getCountsWithDeltas(postSlug, d1Counts);
      return c.json({ post_slug: postSlug, counts });
    } catch (_error) {
      return c.json({ code: ErrorCode.DATABASE_ERROR }, 500);
    }
  }

  async syncReactions(): Promise<void> {
    // Paginate through all KV keys
    const allKeys: { name: string }[] = [];
    let listComplete = false;
    let cursor: string | undefined;
    while (!listComplete) {
      const listed = await this.kv.list({ prefix: `${KV_PREFIX_REACTION}:`, cursor });
      allKeys.push(...listed.keys);
      listComplete = listed.list_complete;
      cursor = listed.cursor;
    }

    if (allKeys.length === 0) {
      return;
    }

    // Batch-read all deltas; on failure fall through to per-key reads
    let deltaMap = new Map<string, string | null>();
    try {
      const deltas = await Promise.all(allKeys.map((key) => this.kv.get(key.name)));
      deltaMap = new Map(allKeys.map((key, i) => [key.name, deltas[i]]));
    } catch {
      // Leave deltaMap empty so the loop falls back to individual reads
    }

    // Early exit when all deltas are clean (only if batch read succeeded)
    if (deltaMap.size > 0) {
      const hasDirty = [...deltaMap.values()].some((v) => v !== null && parseInt(v, 10) > 0);
      if (!hasDirty) {
        return;
      }
    }

    for (const key of allKeys) {
      const parts = key.name.split(':');
      if (parts.length !== 3) {
        continue;
      }

      const [, postSlug, emojiLabel] = parts;

      try {
        // Use cached delta from batch read, or fetch individually
        const deltaStr = deltaMap.get(key.name) ?? (await this.kv.get(key.name));
        if (!deltaStr) {
          continue;
        }

        const delta = parseInt(deltaStr, 10);
        if (delta <= 0) {
          continue;
        }

        // Read D1 row, seed if missing
        const counts = await this.getOrSeedRow(postSlug);
        counts[emojiLabel] = (counts[emojiLabel] || 0) + delta;

        await this.db
          .prepare('UPDATE post_reactions SET counts = ? WHERE post_slug = ?')
          .bind(JSON.stringify(counts), postSlug)
          .run();

        // Subtract the flushed delta to preserve concurrent writes.
        // TOCTOU: clicks between re-read and put may be lost, but acceptable for daily cron.
        const currentValue = await this.kv.get(key.name);
        const current = currentValue ? parseInt(currentValue, 10) : 0;
        await this.kv.put(key.name, String(Math.max(0, current - delta)));
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: intentional error logging for cron sync diagnostics
        console.error(`[reaction-sync] Failed to sync key ${key.name}:`, error);
      }
    }
  }
}
