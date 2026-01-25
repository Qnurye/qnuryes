import { useState } from 'react';
import type { ErrorResponse } from '@/types';

interface useCommentLikeReturn {
  loading: boolean;
  error: ErrorResponse | null;
  likeComment: (commentId: number) => Promise<void>;
  unlikeComment: (commentId: number) => Promise<void>;
}

export const useCommentLike = (fetchComments: () => Promise<void>): useCommentLikeReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);

  const likeComment = async (commentId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw await response.json();
      }

      // Refresh comments to update the like count
      await fetchComments();
    } catch (err) {
      setError(err as ErrorResponse);
    } finally {
      setLoading(false);
    }
  };

  const unlikeComment = async (commentId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/comments/${commentId}/like`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw await response.json();
      }

      // Refresh comments to update the like count
      await fetchComments();
    } catch (err) {
      setError(err as ErrorResponse);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    likeComment,
    unlikeComment,
  };
};
