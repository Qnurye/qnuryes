package models

import (
	"time"
)

type Comment struct {
	ID          int64      `json:"id" db:"id"`
	PostID      string     `json:"post_id" db:"post_id"`
	ParentID    *int64     `json:"parent_id,omitempty" db:"parent_id"`
	AuthorName  string     `json:"author_name" db:"author_name"`
	AuthorEmail string     `json:"author_email,omitempty" db:"author_email"`
	AuthorIP    string     `json:"author_ip,omitempty" db:"author_ip"`
	Content     string     `json:"content" db:"content"`
	CountryCode string     `json:"country_code,omitempty" db:"country_code"`
	Likes       int        `json:"likes" db:"likes"`
	Status      string     `json:"status" db:"status"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
	Replies     []*Comment `json:"replies,omitempty" db:"-"` // 用于嵌套评论，不存储在数据库中
}

type CommentLike struct {
	ID             int64     `json:"id" db:"id"`
	CommentID      int64     `json:"comment_id" db:"comment_id"`
	UserIdentifier string    `json:"user_identifier" db:"user_identifier"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
}

type CommentRequest struct {
	PostID      string `json:"post_id" validate:"required"`
	ParentID    *int64 `json:"parent_id,omitempty"`
	AuthorName  string `json:"author_name" validate:"required"`
	AuthorEmail string `json:"author_email" validate:"omitempty,email"`
	Content     string `json:"content" validate:"required"`
}

type CommentResponse struct {
	ID          int64             `json:"id"`
	PostID      string            `json:"post_id"`
	ParentID    *int64            `json:"parent_id,omitempty"`
	AuthorName  string            `json:"author_name"`
	AuthorEmail string            `json:"author_email,omitempty"`
	Content     string            `json:"content"`
	CountryCode string            `json:"country_code,omitempty"`
	Likes       int               `json:"likes"`
	CreatedAt   time.Time         `json:"created_at"`
	Replies     []CommentResponse `json:"replies,omitempty"`
}

type PaginationResponse struct {
	Data       interface{} `json:"data"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalItems int         `json:"total_items"`
	TotalPages int         `json:"total_pages"`
}
