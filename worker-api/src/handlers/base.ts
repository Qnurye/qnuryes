import { Context } from 'hono';
import type { Env } from '../types';

export class BaseHandler {
  protected db: D1Database;

  constructor(env: Env) {
    this.db = env.DB;
  }

  protected getClientIP(c: Context): string {
    return c.req.header('CF-Connecting-IP') || 'unknown';
  }

  protected getCountryCode(c: Context): string {
    return c.req.header('CF-IPCountry') || 'unknown';
  }
}
