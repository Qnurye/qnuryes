import type { D1Database, KVNamespace } from '@cloudflare/workers-types';
import { z } from 'zod';

export interface Comment {
  id: number;
  postId: string;
  parentId: number | null;
  authorName: string;
  authorEmail?: string;
  authorIp?: string;
  content: string;
  countryCode?: string;
  likes: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  replies?: Comment[];
  replyCount?: number;
}

export const commentRequestSchema = z.object({
  post_id: z.string().min(1, 'post id cannot be empty'),
  parent_id: z.number().optional(),
  author_name: z.string().min(1, 'author name cannot be empty'),
  author_email: z.string().email('invalid email address').optional(),
  content: z.string().min(1, 'comment content cannot be empty'),
});

export interface CommentResponse {
  id: number;
  postId: string;
  parentId?: number | null;
  authorName: string;
  authorEmail?: string;
  content: string;
  countryCode?: string;
  likes: number;
  createdAt: Date;
  replies?: CommentResponse[];
  replyCount?: number;
}

export interface PaginationResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface Env {
  DB: D1Database;
  BASE_URL: string;
  RESEND_API_KEY: string;
  NEWSLETTER_RECIPIENTS: string;
  WEBSITE_BASE_URL: string;
  RESEND_AUDIENCE_ID: string;
  RESEND_FROM: string;
  GUESTBOOK_NOTIFY_EMAIL: string;
  subscription: KVNamespace;
  [key: string]: unknown;
}

export type { GuestbookSubmission, ReactionCounts } from '@qnury-es/shared';

export const guestbookSubmitSchema = z.object({
  nickname: z.string().min(1).max(50),
  email: z.string().email().optional(),
  url: z.string().url().optional(),
  message: z.string().max(140).optional(),
  signature_svg: z.string().min(1),
  signature_bbox: z.string().min(1),
  locale: z.enum(['en', 'zh-cn', 'zh-tw']).default('en'),
  address: z.string().optional(), // honeypot
});

export const guestbookReviewSchema = z.object({
  token: z.string().uuid(),
});

export const guestbookRejectSchema = z.object({
  token: z.string().uuid(),
  reason: z.string().min(1).max(500),
});

export interface PostReaction {
  post_slug: string;
  counts: string; // JSON string of ReactionCounts
}

export interface Post {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  content: string;
}
