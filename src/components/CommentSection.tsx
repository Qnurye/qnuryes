import '@/styles/comments.css';
import React, {useEffect, useState} from 'react';

// 评论类型定义
interface Comment {
  id: number;
  post_id: string;
  parent_id?: number;
  author_name: string;
  author_email?: string;
  content: string;
  country_code?: string;
  likes: number;
  created_at: string;
  replies?: Comment[];
}

// 评论表单数据类型
interface CommentFormData {
  post_id: string;
  parent_id?: number;
  author_name: string;
  author_email: string;
  content: string;
}

// 分页响应类型
interface PaginationResponse {
  data: Comment[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

// 评论组件属性
interface CommentSectionProps {
  postId: string;
  locale: string;
}

// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

export default function CommentSection({postId, locale}: CommentSectionProps) {
  // 状态管理
  const [comments, setComments] = useState<Comment[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [formData, setFormData] = useState<CommentFormData>({
    post_id: postId,
    author_name: '',
    author_email: '',
    content: ''
  });

  // 获取评论数据
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/comments/${postId}?page=${page}`);

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`)
      }

      const data: PaginationResponse = await response.json();
      setComments(data.data);
      setTotalPages(data.total_pages);
      setError(null);
    } catch (err) {
      setError('获取评论失败，请稍后再试');
      console.error('获取评论错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 提交评论
  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // 如果是回复，添加父评论ID
      const commentData = {...formData};
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
        console.error(`HTTP error! status: ${response.status}`)
      }

      // 重置表单
      setFormData({
        post_id: postId,
        author_name: '',
        author_email: '',
        content: ''
      });
      setReplyTo(null);

      // 重新获取评论
      await fetchComments();
    } catch (err) {
      setError('提交评论失败，请稍后再试');
      console.error('提交评论错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 点赞评论
  const likeComment = async (commentId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`)
      }

      // 更新本地评论数据
      const updatedComment = await response.json();

      setComments(prevComments => {
        if (!prevComments) return prevComments;
        return prevComments.map(comment => {
          if (comment.id === commentId) {
            return {...comment, likes: updatedComment.likes};
          } else if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === commentId ? {...reply, likes: updatedComment.likes} : reply
              )
            };
          }
          return comment;
        })
        }
      );
    } catch (err) {
      console.error('点赞评论错误:', err);
    }
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  // 处理回复按钮点击
  const handleReplyClick = (commentId: number) => {
    setReplyTo(commentId);
    // 滚动到评论表单
    document.getElementById('comment-form')?.scrollIntoView({behavior: 'smooth'});
  };

  // 取消回复
  const cancelReply = () => {
    setReplyTo(null);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString(locale === 'zh-cn' ? 'zh-CN' : 'en-US', options).toUpperCase();
  };

  // 初始加载和页码变化时获取评论
  useEffect(() => {
    fetchComments();
  }, [postId, page]);

  return (
    <section className="comments">
      <h2>{locale === 'zh-cn' ? '评论' : 'Comments'}</h2>

      {/* 评论表单 */}
      <form id="comment-form" className="comment-form" onSubmit={submitComment}>
        {replyTo && (
          <div className="reply-indicator">
            <span>{locale === 'zh-cn' ? '回复评论' : 'Replying to comment'} #{replyTo}</span>
            <button type="button" onClick={cancelReply} className="cancel-reply">
              {locale === 'zh-cn' ? '取消' : 'Cancel'}
            </button>
          </div>
        )}

        <div className="form-group">
          <input
            type="text"
            name="author_name"
            value={formData.author_name}
            onChange={handleInputChange}
            placeholder={locale === 'zh-cn' ? '您的名字' : 'Your name'}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            name="author_email"
            value={formData.author_email}
            onChange={handleInputChange}
            placeholder={locale === 'zh-cn' ? '您的邮箱（可选）' : 'Your email (optional)'}
          />
        </div>

        <div className="form-group">
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder={locale === 'zh-cn' ? '评论内容' : 'Your comment'}
            required
            rows={4}
          />
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? (locale === 'zh-cn' ? '提交中...' : 'Submitting...') : (locale === 'zh-cn' ? '提交评论' : 'Submit Comment')}
        </button>

        {error && <div className="error-message">{error}</div>}
      </form>

      {/* 评论列表 */}
      {loading ? (
        <div className="loading">{locale === 'zh-cn' ? '加载评论中...' : 'Loading comments...'}</div>
      ) : !comments || comments.length === 0 ?
        <div className="loading">{locale === 'zh-cn' ? '快来评论吧' : 'No replies yet'}</div>
        : comments.length > 0 ? (
        <div className="comment-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <div className="comment-author">
                  <span className="author-name">{comment.author_name}</span>
                  {comment.author_email && (
                    <span className="author-email">{comment.author_email}</span>
                  )}
                </div>
                <div className="comment-meta">
                  {comment.country_code && (
                    <span className="comment-country">{comment.country_code}</span>
                  )}
                  <span className="comment-date">{formatDate(comment.created_at)}</span>
                </div>
              </div>

              <div className="comment-content">
                <p>{comment.content}</p>
              </div>

              <div className="comment-actions">
                <button
                  className="reply-button"
                  onClick={() => handleReplyClick(comment.id)}
                >
                  {locale === 'zh-cn' ? '回复' : 'reply'}
                </button>
                <span
                  className="comment-likes"
                  role="button"
                  tabIndex={0}
                  onClick={() => likeComment(comment.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      likeComment(comment.id);
                    }
                  }}
                >
                    {comment.likes}
                  </span>
              </div>

              {/* 回复评论 */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="comment-replies">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="comment reply">
                      <div className="comment-header">
                        <div className="comment-author">
                          <span className="author-name">{reply.author_name}</span>
                          {reply.author_email && (
                            <span className="author-email">{reply.author_email}</span>
                          )}
                        </div>
                        <div className="comment-meta">
                          {reply.country_code && (
                            <span className="comment-country">{reply.country_code}</span>
                          )}
                          <span className="comment-date">{formatDate(reply.created_at)}</span>
                        </div>
                      </div>

                      <div className="comment-content">
                        <p>{reply.content}</p>
                      </div>

                      <div className="comment-actions">
                        <button
                          className="reply-button"
                          onClick={() => handleReplyClick(comment.id)}
                        >
                          {locale === 'zh-cn' ? '回复' : 'reply'}
                        </button>
                        <span
                          className="comment-likes"
                          role="button"
                          tabIndex={0}
                          onClick={() => likeComment(reply.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              likeComment(reply.id);
                            }
                          }}
                        >
                          {reply.likes}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-comments">
          {locale === 'zh-cn' ? '暂无评论，来发表第一条评论吧！' : 'No comments yet. Be the first to comment!'}
        </div>
      )}

      {/* 分页控制 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1 || loading}
            className="pagination-button"
          >
            {locale === 'zh-cn' ? '上一页' : 'Previous'}
          </button>

          <span className="page-info">
            {locale === 'zh-cn' ? `第 ${page} 页，共 ${totalPages} 页` : `Page ${page} of ${totalPages}`}
          </span>

          <button
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages || loading}
            className="pagination-button"
          >
            {locale === 'zh-cn' ? '下一页' : 'Next'}
          </button>
        </div>
      )}
    </section>
  );
}
