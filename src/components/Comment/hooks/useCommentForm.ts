import React, { useState } from 'react';
import type { ErrorResponse } from '@/types';

interface CommentFormData {
  post_id: string
  parent_id?: number
  author_name: string
  author_email: string
  content: string
}

export const useCommentForm = (postId: string, fetchComments: () => Promise<void>): {
  formData: CommentFormData
  loading: boolean
  error: ErrorResponse | null
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  submitComment: (e: React.FormEvent, replyTo: number | null) => Promise<void>
} => {
  const [formData, setFormData] = useState<CommentFormData>({
    post_id: postId,
    author_name: '',
    author_email: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitComment = async (e: React.FormEvent, replyTo: number | null): Promise<void> => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const commentData = { ...formData };
      if (replyTo) {
        commentData.parent_id = replyTo;
      }

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      setFormData({
        post_id: postId,
        author_name: '',
        author_email: '',
        content: '',
      });

      await fetchComments();
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError(err as ErrorResponse);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    handleInputChange,
    submitComment,
  };
};
