import React, { useState } from 'react';
import { formatDate } from '@/lib/utils.ts';
import type { Comment } from '@/types';
import Markdown from 'react-markdown';
import { ReplyIcon, ThumbsUpIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { useTranslations } from '@/hooks/useTranslations.ts';

interface CommentItemProps {
  comment: Comment
  locale: string
  onReply: (comment: Comment) => void
  onLike: (id: number) => Promise<void>
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  locale,
  onReply,
  onLike,
}) => {
  const { t } = useTranslations(locale)
  const [isExpanded, setIsExpanded] = useState(false);
  const [replies, setReplies] = useState<Comment[]>(comment.replies || []);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const hasReplies = (comment.replyCount ?? 0) > 0;

  const loadReplies = async (): Promise<void> => {
    if (loadingReplies) { return; }

    setLoadingReplies(true);
    try {
      const response = await fetch(
        `${import.meta.env.PUBLIC_API_BASE_URL}/comments/${comment.id}/replies`,
      );

      if (!response.ok) {
        throw new Error('Failed to load replies');
      }

      const data = await response.json();
      setReplies(data);
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleExpand = (): void => {
    if (!isExpanded && replies.length === 0) {
      void loadReplies();
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="pb-4">
      <div className="flex justify-between mb-2">
        <div className="font-bold max-w-96 overflow-hidden text-ellipsis">
          <span className="font-serif">{comment.author_name}</span>
          {comment.author_email && (
            <a
              className="text-sm font-mono font-light text-primary ml-2"
              href={`mailto:${comment.author_email}}`}
            >
              {comment.author_email}
            </a>
          )}
        </div>
        <div className="text-primary text-sm">
          {comment.country_code && (
            <span className="mr-2 font-mono">{comment.country_code}</span>
          )}
          <span>{formatDate(comment.created_at, locale)}</span>
        </div>
      </div>

      <div className="pl-2 mb-2 leading-relaxed">
        <Markdown>{comment.content}</Markdown>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="text-sm"
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
        <Button
          variant="ghost"
          className="text-sm"
          onClick={() => onReply(comment)}
        >
          <ReplyIcon size={14} />
          {t('comment.reply')}
        </Button>
        {hasReplies && (
          <Button
            variant="ghost"
            className="text-sm"
            onClick={handleExpand}
            disabled={loadingReplies}
          >
            {isExpanded
              ? (
                <ChevronDownIcon size={14} />
              )
              : (
                <ChevronRightIcon size={14} />
              )}
            {loadingReplies
              ? t('comment.loading')
              : isExpanded
                ? t('comment.hide_replies')
                : t('comment.show_replies', { count: comment.replyCount ?? 0 })}
          </Button>
        )}
      </div>
      {isExpanded && replies.length > 0 && (
        <div className="ml-2 pl-4 border-l-2 border-sidebar-border pt-2 mt-2">
          {replies.map(reply => (
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
  )
};

export default CommentItem;
