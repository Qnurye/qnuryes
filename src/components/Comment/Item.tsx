import React from 'react';
import { formatDate } from '@/lib/utils.ts';

interface Comment {
  id: number
  post_id: string
  parent_id?: number
  author_name: string
  author_email?: string
  content: string
  country_code?: string
  likes: number
  created_at: string
  replies?: Comment[]
}

interface CommentItemProps {
  comment: Comment
  locale: string
  onReply: (id: number) => void
  onLike: (id: number) => Promise<void>
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, locale, onReply, onLike }) => (
  <div className="comment">
    <div className="comment-header">
      <div className="comment-author">
        <span className="author-name">{comment.author_name}</span>
        {comment.author_email && (
          <span className="author-email">{comment.author_email}</span>
        )}
      </div>
      <div className="comment-meta">
        {comment.country_code && (
          <span className="comment-country">{comment.country_code}</span>
        )}
        <span className="comment-date">{formatDate(comment.created_at, locale)}</span>
      </div>
    </div>

    <div className="comment-content">
      <p>{comment.content}</p>
    </div>

    <div className="comment-actions">
      <button
        className="reply-button"
        onClick={() => onReply(comment.id)}
      >
        {locale === 'zh-cn' ? '回复' : 'reply'}
      </button>
      <span
        className="comment-likes"
        role="button"
        tabIndex={0}
        onClick={() => onLike(comment.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onLike(comment.id);
          }
        }}
      >
        {comment.likes}
      </span>
    </div>

    {comment.replies && comment.replies.length > 0 && (
      <div className="comment-replies">
        {comment.replies.map(reply => (
          <CommentItem
            key={reply.id}
            comment={reply}
            locale={locale}
            onReply={onReply}
            onLike={onLike}
          />
        ))}
      </div>
    )}
  </div>
);

export default CommentItem;
