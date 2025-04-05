import React from 'react';
import { formatDate } from '@/lib/utils.ts';
import type { Comment } from '@/types';

interface CommentItemProps {
  comment: Comment
  locale: string
  onReply: (id: number) => void
  onLike: (id: number) => Promise<void>
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, locale, onReply, onLike }) => (
  <div className="mb-8 pb-4">
    <div className="flex justify-between mb-2">
      <div className="font-bold">
        <span>{comment.author_name}</span>
        {comment.author_email && (
          <span className="font-normal text-gray-600 ml-2">{comment.author_email}</span>
        )}
      </div>
      <div className="text-gray-600 text-sm">
        {comment.country_code && (
          <span className="mr-2">{comment.country_code}</span>
        )}
        <span>{formatDate(comment.created_at, locale)}</span>
      </div>
    </div>

    <div className="mb-2 leading-relaxed">
      <p>{comment.content}</p>
    </div>

    <div className="flex items-center">
      <button
        className="text-gray-600 text-sm flex items-center cursor-pointer"
        onClick={() => onReply(comment.id)}
      >
        <span className="mr-1">←</span>
        {locale === 'zh-cn' ? '回复' : 'reply'}
      </button>
      <span
        className="ml-auto text-gray-600 text-sm cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => onLike(comment.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            void onLike(comment.id);
          }
        }}
      >
        {comment.likes}
        <span className="ml-1">→</span>
      </span>
    </div>

    {comment.replies && comment.replies.length > 0 && (
      <div className="ml-8 pl-4 border-l-2 border-gray-200">
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
