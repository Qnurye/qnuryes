import React, { useState, useEffect } from 'react';

interface Comment {
  id: number
  post_id: string
  parent_id?: number
  author_name: string
  author_email?: string
  content: string
  country_code?: string
  likes: number
  created_at: string
  replies?: Comment[]
}

interface PaginationResponse {
  data: Comment[]
  page: number
  page_size: number
  total_items: number
  total_pages: number
}

const API_BASE_URL = 'http://localhost:3000/api';

export const useComments = (postId: string): {
  comments: Comment[] | null
  loading: boolean
  error: string | null
  page: number
  totalPages: number
  replyTo: number | null
  setPage: React.Dispatch<React.SetStateAction<number>>
  setReplyTo: React.Dispatch<React.SetStateAction<number | null>>
  fetchComments: () => Promise<void>
} => {
  const [comments, setComments] = useState<Comment[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [replyTo, setReplyTo] = useState<number | null>(null);

  const fetchComments = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/comments/${postId}?page=${page}`);

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
      }

      const data: PaginationResponse = await response.json();
      setComments(data.data);
      setTotalPages(data.total_pages);
      setError(null);
    }
    catch (err) {
      setError('Failed to fetch comments, please try again later.');
      console.error('Error fetching comments:', err);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
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
