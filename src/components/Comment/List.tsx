import React from 'react';
import CommentItem from './Item';
import type { Comment } from '@/types';

interface CommentListProps {
  comments: Comment[] | null
  loading: boolean
  locale: string
  onReply: (id: number) => void
  onLike: (id: number) => Promise<void>
}

const CommentList: React.FC<CommentListProps> = ({ comments, loading, locale, onReply, onLike }) => {
  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600">
        {locale === 'zh-cn' ? '加载评论中...' : 'Loading comments...'}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        {locale === 'zh-cn' ? '快来评论吧' : 'No replies yet'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
