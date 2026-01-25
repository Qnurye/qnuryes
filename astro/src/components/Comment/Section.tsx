import { Loader2Icon } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations.ts';
import CommentForm from './Form';
import { type FormData, useCommentForm } from './hooks/useCommentForm';
import { useCommentLike } from './hooks/useCommentLike';
import { useComments } from './hooks/useComments';
import CommentList from './List';
import Pagination from './Pagination';

interface CommentSectionProps {
  postId: string;
  locale: string;
}

const Section: React.FC<CommentSectionProps> = ({ postId, locale }) => {
  const { t, isLoading } = useTranslations(locale);
  const { comments, loading, page, totalPages, replyTo, setPage, setReplyTo, fetchComments } = useComments(postId);

  useEffect(() => {
    if (replyTo) {
      document.getElementById('comment-form')?.scrollIntoView();
    }
  }, [replyTo]);

  const {
    formData,
    loading: formLoading,
    error: formError,
    submitComment,
  } = useCommentForm(postId, locale, fetchComments);

  const { likeComment } = useCommentLike(fetchComments);

  const handleSubmit = async (data: FormData): Promise<void> => {
    await submitComment(data, replyTo);
    setReplyTo(null);
  };

  return isLoading ? (
    <section className="mt-8">
      <div className="flex animate-spin items-center justify-center text-ring">
        <Loader2Icon />
      </div>
    </section>
  ) : (
    <section className="mt-8">
      <h2 className="mb-8 font-bold text-3xl">{t('comment.title')}</h2>
      <CommentList comments={comments} loading={loading} locale={locale} onReply={setReplyTo} onLike={likeComment} />
      <Pagination page={page} totalPages={totalPages} loading={loading} locale={locale} onPageChange={setPage} />
      <CommentForm
        locale={locale}
        loading={formLoading}
        error={formError}
        replyTo={replyTo}
        onSubmit={handleSubmit}
        onCancelReply={() => {
          setReplyTo(null);
          // Reset form when canceling reply
          formData.author_name = '';
          formData.author_email = '';
          formData.content = '';
        }}
        formData={formData}
      />
    </section>
  );
};

export default Section;
