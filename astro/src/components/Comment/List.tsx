import { Loader2Icon } from 'lucide-react';
import type React from 'react';
import { useTranslations } from '@/hooks/useTranslations.ts';
import type { Comment } from '@/types';
import CommentItem from './Item';

interface CommentListProps {
  comments: Comment[] | null;
  loading: boolean;
  locale: string;
  onReply: (id: Comment) => void;
  onLike: (id: number) => Promise<void>;
}

const CommentList: React.FC<CommentListProps> = ({ comments, loading, locale, onReply, onLike }) => {
  const { t } = useTranslations(locale);
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-center">
        <Loader2Icon className="size-4 animate-spin" />
        {t('comment.loading')}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return <div className="py-8 text-center">{t('comment.no_comments')}</div>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} locale={locale} onReply={onReply} onLike={onLike} />
      ))}
    </div>
  );
};

export default CommentList;
