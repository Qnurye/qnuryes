import { D1Database } from '@cloudflare/workers-types';

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

export interface CommentLike {
  id: number
  commentId: number
  userIdentifier: string
  createdAt: Date
}

export interface CommentRequest {
  postId: string
  parentId?: number
  authorName: string
  authorEmail?: string
  content: string
}

export interface CommentResponse {
  id: number
  postId: string
  parentId?: number
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
}
