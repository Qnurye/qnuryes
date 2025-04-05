import React from 'react';
import { formatDate } from '@/lib/utils.ts';
import type { Comment } from '@/types';
import Markdown from 'react-markdown';
import { ReplyIcon, ThumbsUpIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';

interface CommentItemProps {
  comment: Comment
  locale: string
  onReply: (comment: Comment) => void
  onLike: (id: number) => Promise<void>
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, locale, onReply, onLike }) => (
  <div className="pb-4">
    <div className="flex justify-between mb-2">
      <div className="font-bold max-w-96 overflow-hidden text-ellipsis">
        <span className="font-serif">{comment.author_name}</span>
        {comment.author_email && (
          <a
            className="text-sm font-mono text-gray-600 ml-2"
            href={`mailto:${comment.author_email}}`}
          >
            {comment.author_email}
          </a>
        )}
      </div>
      <div className="text-gray-600 text-sm">
        {comment.country_code && (
          <span className="mr-2 font-mono">{comment.country_code}</span>
        )}
        <span>{formatDate(comment.created_at, locale)}</span>
      </div>
    </div>

    <div className="mb-2 leading-relaxed">
      <Markdown>{comment.content}</Markdown>
    </div>

    <div className="flex items-center">
      <Button
        variant="ghost"
        className="text-gray-600 text-sm flex gap-1 items-center cursor-pointer"
        onClick={() => onReply(comment)}
      >
        <ReplyIcon size={14} />
        {locale === 'zh-cn' ? '回复' : 'reply'}
      </Button>
      <Button
        variant="ghost"
        className="ml-auto text-gray-600 text-sm flex gap-1 items-baseline cursor-pointer"
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
        <ThumbsUpIcon size={14} />
      </Button>
    </div>

    {comment.replies && comment.replies.length > 0 && (
      <div className="ml-2 pl-4 border-l-2 border-gray-200 pt-2 mt-2">
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
