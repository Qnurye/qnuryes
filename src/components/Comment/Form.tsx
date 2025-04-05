import React from 'react';
import type { Comment, ErrorResponse } from '@/types';
import { useTranslations } from '@/hooks/useTranslations.ts';
import { Button } from '@/components/ui/button.tsx';

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
  replyTo: Comment | null
  onSubmit: (e: React.FormEvent) => Promise<void>
  onCancelReply: () => void
  formData: CommentFormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

const CommentForm: React.FC<CommentFormProps> = ({
  locale, loading, error, replyTo, onSubmit, onCancelReply, formData, onInputChange,
}) => {
  const { t } = useTranslations(locale)
  const safeFormData = {
    post_id: formData?.post_id || '',
    author_name: formData?.author_name || '',
    author_email: formData?.author_email || '',
    content: formData?.content || '',
  };

  return (
    <form id="comment-form" className="mb-8 p-6 bg-gray-50 rounded-lg flex flex-col" onSubmit={onSubmit}>
      {replyTo && (
        <div className="bg-gray-100 p-3 mb-4 rounded-md flex justify-between items-center">
          <span className="inline-flex items-baseline gap-1 flex-grow min-w-0">
            <span className="flex-shrink-0">{t('comment.reply_to')}</span>
            <span className="font-serif font-bold flex-shrink-0">{replyTo.author_name}:</span>
            <span className={'font-sans overflow-hidden text-ellipsis whitespace-nowrap min-w-0 max-w-full'
              + ' bg-gray-200 px-2 py-1 rounded'}
            >
              {replyTo.content.replace(/[#*~_`]/g, '')} {/* Remove Markdown syntax */}
            </span>
          </span>
          <Button
            variant="link"
            onClick={onCancelReply}
          >
            {t('comment.cancel')}
          </Button>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          name="author_name"
          value={safeFormData.author_name}
          onChange={onInputChange}
          placeholder={t('comment.name')}
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
          placeholder={t('comment.email')}
          className="w-full p-3 border border-gray-300 rounded-md text-base"
        />
      </div>

      <div className="mb-4">
        <textarea
          name="content"
          value={safeFormData.content}
          onChange={onInputChange}
          placeholder={t('comment.content')}
          required
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-md text-base resize-y min-h-[100px]"
        />
      </div>

      <Button
        variant="default"
        type="submit"
        disabled={loading}
      >
        {loading
          ? t('comment.loading')
          : t('comment.submit')}
      </Button>

      {error && <div className="text-red-600 mt-4">{error.details || t('comment.error')}</div>}
    </form>
  );
};

export default CommentForm;
