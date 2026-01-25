import type React from 'react';
import { useEffect, useState } from 'react';
import type { Comment, ErrorResponse, PaginationResponse } from '@/types';

interface UseCommentsReturn {
  comments: Comment[] | null;
  loading: boolean;
  error: ErrorResponse | null;
  page: number;
  totalPages: number;
  replyTo: Comment | null;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setReplyTo: React.Dispatch<React.SetStateAction<Comment | null>>;
  fetchComments: () => Promise<void>;
}

export const useComments = (postId: string): UseCommentsReturn => {
  const [comments, setComments] = useState<Comment[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const fetchComments = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/posts/${postId}/comments?page=${page}`);

      if (!response.ok) {
        throw await response.json();
      }

      const data: PaginationResponse<Comment> = await response.json();
      setComments(data.data);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError(error as ErrorResponse);
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
