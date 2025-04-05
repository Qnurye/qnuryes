import { D1Database } from '@cloudflare/workers-types';
import { z } from 'zod';

export interface Comment {
  id: number
  postId: string
  parentId: number | null
  authorName: string
  authorEmail?: string
  authorIp?: string
  content: string
  countryCode?: string
  likes: number
  status: string
  createdAt: Date
  updatedAt: Date
  replies?: Comment[]
}

export const commentRequestSchema = z.object({
  post_id: z.string().min(1, 'post id cannot be empty'),
  parent_id: z.number().optional(),
  author_name: z.string().min(1, 'author name cannot be empty'),
  author_email: z.string().email('invalid email address').optional(),
  content: z.string().min(1, 'comment content cannot be empty'),
});

export interface CommentResponse {
  id: number
  postId: string
  parentId?: number | null
  authorName: string
  authorEmail?: string
  content: string
  countryCode?: string
  likes: number
  createdAt: Date
  replies?: CommentResponse[]
}

export interface PaginationResponse<T> {
  data: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface Env {
  DB: D1Database
  [key: string]: unknown
}
