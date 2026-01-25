export interface Comment {
  id: number;
  post_id: string;
  parent_id?: number;
  author_name: string;
  author_email?: string;
  content: string;
  country_code?: string;
  likes: number;
  status: string;
  created_at: string;
  replies?: Comment[];
  replyCount?: number;
}

export interface CommentRequest {
  postId: string;
  parentId?: number;
  authorName: string;
  authorEmail?: string;
  content: string;
}

export interface CommentResponse extends Comment {
  replies?: Comment[];
}

export interface PaginationResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ErrorResponse {
  code: number;
  details?: string;
}
