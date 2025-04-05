import React, { useState, useEffect } from 'react';
import type { Comment, PaginationResponse } from '@/types';

interface UseCommentsReturn {
  comments: Comment[] | null
  loading: boolean
  error: { code: number, details?: string } | null
  page: number
  totalPages: number
  replyTo: Comment | null
  setPage: React.Dispatch<React.SetStateAction<number>>
  setReplyTo: React.Dispatch<React.SetStateAction<Comment | null>>
  fetchComments: () => Promise<void>
}

const API_BASE_URL = 'https://api.qnury.es';

export const useComments = (postId: string): UseCommentsReturn => {
  const [comments, setComments] = useState<Comment[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code: number, details?: string } | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const fetchComments = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/posts/${postId}/comments?page=${page}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const data: PaginationResponse<Comment> = await response.json();
      setComments(data.data);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError(error as { code: number, details?: string });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchComments();
  }, [postId, page]);

  return {
    comments,
    loading,
    error,
    page,
    totalPages,
    replyTo,
    setPage,
    setReplyTo,
    fetchComments,
  };
};
