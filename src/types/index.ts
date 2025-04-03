export interface Comment {
  id: number
  postId: string
  parentId?: number
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

export interface CommentRequest {
  postId: string
  parentId?: number
  authorName: string
  authorEmail?: string
  content: string
}

export interface CommentResponse extends Comment {
  replies?: Comment[]
}

export interface PaginationResponse<T> {
  data: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}
