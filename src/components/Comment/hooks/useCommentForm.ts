import React, { useState } from 'react';

interface CommentFormData {
  post_id: string
  parent_id?: number
  author_name: string
  author_email: string
  content: string
}

const API_BASE_URL = 'https://api.qnury.es';

export const useCommentForm = (postId: string, fetchComments: () => Promise<void>): {
  formData: CommentFormData
  loading: boolean
  error: string | null
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
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitComment = async (e: React.FormEvent, replyTo: number | null): Promise<void> => {
    e.preventDefault();

    try {
      setLoading(true);

      const commentData = { ...formData };
      if (replyTo) {
        commentData.parent_id = replyTo;
      }

      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
      }

      setFormData({
        post_id: postId,
        author_name: '',
        author_email: '',
        content: '',
      });

      await fetchComments();
    } catch (err) {
      setError('Failed to submit comment, please try again later.');
      console.error('Error submitting comment:', err);
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
