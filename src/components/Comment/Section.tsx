import React from 'react';
import { useComments } from './hooks/useComments';
import { useCommentForm } from './hooks/useCommentForm';
import { useCommentLike } from './hooks/useCommentLike';
import CommentForm from './Form';
import CommentList from './List';
import Pagination from './Pagination';

interface CommentSectionProps {
  postId: string
  locale: string
}

const Section: React.FC<CommentSectionProps> = ({ postId, locale }) => {
  const {
    comments,
    loading,
    page,
    totalPages,
    replyTo,
    setPage,
    setReplyTo,
    fetchComments,
  } = useComments(postId);

  const {
    formData,
    loading: formLoading,
    error: formError,
    handleInputChange,
    submitComment,
  } = useCommentForm(postId, fetchComments);

  const {
    likeComment,
  } = useCommentLike(fetchComments);

  const safeFormData = formData || {
    post_id: postId,
    author_name: '',
    author_email: '',
    content: '',
  };

  return (
    <section className="mt-8">
      <h2 className="text-3xl font-bold mb-8">{locale === 'zh-cn' ? '评论' : 'Comments'}</h2>
      <CommentList
        comments={comments}
        loading={loading}
        locale={locale}
        onReply={setReplyTo}
        onLike={likeComment}
      />
      <Pagination
        page={page}
        totalPages={totalPages}
        loading={loading}
        locale={locale}
        onPageChange={setPage}
      />
      <CommentForm
        locale={locale}
        loading={formLoading}
        error={formError}
        replyTo={replyTo}
        onSubmit={e => submitComment(e, replyTo)}
        onCancelReply={() => setReplyTo(null)}
        formData={safeFormData}
        onInputChange={handleInputChange}
      />
    </section>
  );
};

export default Section;
