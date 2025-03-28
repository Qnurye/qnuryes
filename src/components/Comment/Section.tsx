import '@/styles/comments.css';
import React from 'react';
import { useComments } from './hooks/useComments';
import { useCommentForm } from './hooks/useCommentForm';
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

  return (
    <section className="comments">
      <h2>{locale === 'zh-cn' ? '评论' : 'Comments'}</h2>
      <CommentForm
        locale={locale}
        loading={formLoading}
        error={formError}
        replyTo={replyTo}
        onSubmit={e => submitComment(e, replyTo)}
        onCancelReply={() => setReplyTo(null)}
        formData={formData}
        onInputChange={handleInputChange}
      />
      <CommentList
        comments={comments}
        loading={loading}
        locale={locale}
        onReply={setReplyTo}
        onLike={fetchComments}
      />
      <Pagination
        page={page}
        totalPages={totalPages}
        loading={loading}
        locale={locale}
        onPageChange={setPage}
      />
    </section>
  );
};

export default Section;
