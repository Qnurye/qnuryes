export enum ErrorCode {
  // Validation errors (1000-1999)
  INVALID_POST_ID = 1000,
  INVALID_COMMENT_ID = 1001,
  INVALID_PAGE_NUMBER = 1002,
  INVALID_PAGE_SIZE = 1003,
  INVALID_EMAIL = 1004,
  MISSING_REQUIRED_FIELDS = 1005,

  INVALID_POST_SLUG = 1006,
  INVALID_EMOJI_LABEL = 1007,

  // Business logic errors (2000-2999)
  PARENT_COMMENT_NOT_FOUND = 2000,
  COMMENT_NOT_FOUND = 2001,
  ALREADY_LIKED = 2002,
  NOT_LIKED = 2003,
  RATE_LIMITED = 2004,

  // System errors (3000-3999)
  DATABASE_ERROR = 3000,
  UNKNOWN_ERROR = 3999,
}

export const ErrorMessages = {
  [ErrorCode.INVALID_POST_ID]: {
    en: 'Invalid post ID',
    'zh-cn': '无效的文章ID',
    'zh-tw': '無效的文章ID',
  },
  [ErrorCode.INVALID_COMMENT_ID]: {
    en: 'Invalid comment ID',
    'zh-cn': '无效的评论ID',
    'zh-tw': '無效的評論ID',
  },
  [ErrorCode.INVALID_PAGE_NUMBER]: {
    en: 'Invalid page number',
    'zh-cn': '无效的页码',
    'zh-tw': '無效的頁碼',
  },
  [ErrorCode.INVALID_PAGE_SIZE]: {
    en: 'Invalid page size',
    'zh-cn': '无效的每页数量',
    'zh-tw': '無效的每頁數量',
  },
  [ErrorCode.INVALID_EMAIL]: {
    en: 'Invalid email address',
    'zh-cn': '无效的邮箱地址',
    'zh-tw': '無效的郵箱地址',
  },
  [ErrorCode.MISSING_REQUIRED_FIELDS]: {
    en: 'Missing required fields',
    'zh-cn': '缺少必填字段',
    'zh-tw': '缺少必填欄位',
  },
  [ErrorCode.PARENT_COMMENT_NOT_FOUND]: {
    en: 'Parent comment not found or deleted',
    'zh-cn': '父评论不存在或已被删除',
    'zh-tw': '父評論不存在或已被刪除',
  },
  [ErrorCode.COMMENT_NOT_FOUND]: {
    en: 'Comment not found',
    'zh-cn': '评论不存在',
    'zh-tw': '評論不存在',
  },
  [ErrorCode.ALREADY_LIKED]: {
    en: 'Already liked this comment',
    'zh-cn': '已经点赞过该评论',
    'zh-tw': '已經點讚過該評論',
  },
  [ErrorCode.NOT_LIKED]: {
    en: 'Not liked this comment',
    'zh-cn': '未点赞过该评论',
    'zh-tw': '未點讚過該評論',
  },
  [ErrorCode.RATE_LIMITED]: {
    en: 'Too many requests',
    'zh-cn': '请求过于频繁',
    'zh-tw': '請求過於頻繁',
  },
  [ErrorCode.INVALID_POST_SLUG]: {
    en: 'Invalid post slug',
    'zh-cn': '无效的文章标识',
    'zh-tw': '無效的文章標識',
  },
  [ErrorCode.INVALID_EMOJI_LABEL]: {
    en: 'Invalid emoji label',
    'zh-cn': '无效的表情标签',
    'zh-tw': '無效的表情標籤',
  },
  [ErrorCode.DATABASE_ERROR]: {
    en: 'Database error',
    'zh-cn': '数据库错误',
    'zh-tw': '數據庫錯誤',
  },
  [ErrorCode.UNKNOWN_ERROR]: {
    en: 'Unknown error',
    'zh-cn': '未知错误',
    'zh-tw': '未知錯誤',
  },
};
