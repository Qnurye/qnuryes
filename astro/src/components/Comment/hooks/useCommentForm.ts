import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useTranslations } from '@/hooks/useTranslations';
import type { Comment, ErrorResponse } from '@/types';

export const formSchema = z.object({
  post_id: z.string(),
  parent_id: z.number().optional(),
  author_name: z.string().min(1, 'Name is required'),
  author_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  content: z.string().min(1, 'Comment is required'),
});

export type FormData = z.infer<typeof formSchema>;

export const useCommentForm = (
  postId: string,
  locale: string,
  fetchComments: () => Promise<void>,
): {
  formData: FormData;
  loading: boolean;
  error: ErrorResponse | null;
  submitComment: (data: FormData, replyTo: Comment | null) => Promise<void>;
  resetForm: () => void;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const { t } = useTranslations(locale);

  const defaultFormData: FormData = {
    post_id: postId,
    author_name: '',
    author_email: '',
    content: '',
  };

  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const resetForm = (): void => {
    setFormData(defaultFormData);
  };

  const submitComment = async (data: FormData, replyTo: Comment | null): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const commentData = { ...data };
      if (replyTo) {
        commentData.parent_id = replyTo.id;
      }

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        throw await response.json();
      }

      toast.success(t('comment.submit_success'));

      setFormData(defaultFormData);
      await fetchComments();
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError(err as ErrorResponse);
      toast.error(t('comment.submit_error'));
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    submitComment,
    resetForm,
  };
};
