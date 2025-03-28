import React from 'react';

interface CommentFormData {
  post_id: string
  parent_id?: number
  author_name: string
  author_email: string
  content: string
}

interface CommentFormProps {
  locale: string
  loading: boolean
  error: string | null
  replyTo: number | null
  onSubmit: (e: React.FormEvent) => Promise<void>
  onCancelReply: () => void
  formData: CommentFormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

const CommentForm: React.FC<CommentFormProps> = ({
  locale, loading, error, replyTo, onSubmit, onCancelReply, formData, onInputChange,
}) => (
  <form id="comment-form" className="comment-form" onSubmit={onSubmit}>
    {replyTo && (
      <div className="reply-indicator">
        <span>
          {locale === 'zh-cn' ? '回复评论' : 'Replying to comment'}
          {' '}
          #
          {replyTo}
        </span>
        <button type="button" onClick={onCancelReply} className="cancel-reply">
          {locale === 'zh-cn' ? '取消' : 'Cancel'}
        </button>
      </div>
    )}

    <div className="form-group">
      <input
        type="text"
        name="author_name"
        value={formData.author_name}
        onChange={onInputChange}
        placeholder={locale === 'zh-cn' ? '您的名字' : 'Your name'}
        required
      />
    </div>

    <div className="form-group">
      <input
        type="email"
        name="author_email"
        value={formData.author_email}
        onChange={onInputChange}
        placeholder={locale === 'zh-cn' ? '您的邮箱（可选）' : 'Your email (optional)'}
      />
    </div>

    <div className="form-group">
      <textarea
        name="content"
        value={formData.content}
        onChange={onInputChange}
        placeholder={locale === 'zh-cn' ? '评论内容' : 'Your comment'}
        required
        rows={4}
      />
    </div>

    <button type="submit" disabled={loading} className="submit-button">
      {loading
        ? (locale === 'zh-cn' ? '提交中...' : 'Submitting...')
        : (locale === 'zh-cn' ? '提交评论' : 'Submit Comment')}
    </button>

    {error && <div className="error-message">{error}</div>}
  </form>
);

export default CommentForm;
