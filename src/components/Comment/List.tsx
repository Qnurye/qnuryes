import React from 'react';
import CommentItem from './Item';

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

interface CommentListProps {
  comments: Comment[] | null
  loading: boolean
  locale: string
  onReply: (id: number) => void
  onLike: (id: number) => Promise<void>
}

const CommentList: React.FC<CommentListProps> = ({ comments, loading, locale, onReply, onLike }) => {
  if (loading) {
    return <div className="loading">{locale === 'zh-cn' ? '加载评论中...' : 'Loading comments...'}</div>;
  }

  if (!comments || comments.length === 0) {
    return <div className="loading">{locale === 'zh-cn' ? '快来评论吧' : 'No replies yet'}</div>;
  }

  return (
    <div className="comment-list">
      {comments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          locale={locale}
          onReply={onReply}
          onLike={onLike}
        />
      ))}
    </div>
  );
};

export default CommentList;
