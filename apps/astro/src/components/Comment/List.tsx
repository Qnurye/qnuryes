import React from 'react';
import CommentItem from './Item';
import type { Comment } from '@/types';
import { useTranslations } from '@/hooks/useTranslations.ts';
import { Loader2Icon } from 'lucide-react';

interface CommentListProps {
  comments: Comment[] | null
  loading: boolean
  locale: string
  onReply: (id: Comment) => void
  onLike: (id: number) => Promise<void>
}

const CommentList: React.FC<CommentListProps> = ({ comments, loading, locale, onReply, onLike }) => {
  const { t } = useTranslations(locale)
  if (loading) {
    return (
      <div className="text-center py-8 flex justify-center items-center gap-2">
        <Loader2Icon className="animate-spin size-4" />
        {t('comment.loading')}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8">
        {t('comment.no_comments')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
