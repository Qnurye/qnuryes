import React from 'react';
import type { ErrorResponse } from '@/types';

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
  error: ErrorResponse | null
  replyTo: number | null
  onSubmit: (e: React.FormEvent) => Promise<void>
  onCancelReply: () => void
  formData: CommentFormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

const CommentForm: React.FC<CommentFormProps> = ({
  locale, loading, error, replyTo, onSubmit, onCancelReply, formData, onInputChange,
}) => {
  // Ensure formData has default values if it's undefined
  const safeFormData = {
    post_id: formData?.post_id || '',
    author_name: formData?.author_name || '',
    author_email: formData?.author_email || '',
    content: formData?.content || '',
  };

  return (
    <form id="comment-form" className="mb-8 p-6 bg-gray-50 rounded-lg" onSubmit={onSubmit}>
      {replyTo && (
        <div className="bg-gray-100 p-3 mb-4 rounded-md flex justify-between items-center">
          <span>
            {locale === 'zh-cn' ? '回复评论' : 'Replying to comment'}
            {' '}
            #
            {replyTo}
          </span>
          <button type="button" onClick={onCancelReply} className="text-gray-600 underline cursor-pointer">
            {locale === 'zh-cn' ? '取消' : 'Cancel'}
          </button>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          name="author_name"
          value={safeFormData.author_name}
          onChange={onInputChange}
          placeholder={locale === 'zh-cn' ? '您的名字' : 'Your name'}
          required
          className="w-full p-3 border border-gray-300 rounded-md text-base"
        />
      </div>

      <div className="mb-4">
        <input
          type="email"
          name="author_email"
          value={safeFormData.author_email}
          onChange={onInputChange}
          placeholder={locale === 'zh-cn' ? '您的邮箱（可选）' : 'Your email (optional)'}
          className="w-full p-3 border border-gray-300 rounded-md text-base"
        />
      </div>

      <div className="mb-4">
        <textarea
          name="content"
          value={safeFormData.content}
          onChange={onInputChange}
          placeholder={locale === 'zh-cn' ? '评论内容' : 'Your comment'}
          required
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-md text-base resize-y min-h-[100px]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={'bg-gray-800 text-white border-none py-3 px-6 rounded-md cursor-pointer text-base'
          + 'transition-colors hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed'}
      >
        {loading
          ? (locale === 'zh-cn' ? '提交中...' : 'Submitting...')
          : (locale === 'zh-cn' ? '提交评论' : 'Submit Comment')}
      </button>

      {error && <div className="text-red-600 mt-4">{error.details || 'An error occurred'}</div>}
    </form>
  );
};

export default CommentForm;
