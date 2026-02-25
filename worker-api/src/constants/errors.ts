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

  // Guestbook validation errors (1100-1199)
  INVALID_NICKNAME = 1100,
  INVALID_SIGNATURE = 1101,
  INVALID_MESSAGE_LENGTH = 1102,
  INVALID_TOKEN = 1103,
  MISSING_REJECT_REASON = 1104,

  // Business logic errors (2000-2999)
  PARENT_COMMENT_NOT_FOUND = 2000,
  COMMENT_NOT_FOUND = 2001,
  ALREADY_LIKED = 2002,
  NOT_LIKED = 2003,
  RATE_LIMITED = 2004,
  TOKEN_EXPIRED = 2005,
  TOKEN_ALREADY_USED = 2006,
  GUESTBOOK_RATE_LIMITED = 2007,

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
  [ErrorCode.INVALID_NICKNAME]: {
    en: 'Invalid nickname',
    'zh-cn': '无效的昵称',
    'zh-tw': '無效的暱稱',
  },
  [ErrorCode.INVALID_SIGNATURE]: {
    en: 'Invalid signature',
    'zh-cn': '无效的签名',
    'zh-tw': '無效的簽名',
  },
  [ErrorCode.INVALID_MESSAGE_LENGTH]: {
    en: 'Message is too long',
    'zh-cn': '留言过长',
    'zh-tw': '留言過長',
  },
  [ErrorCode.INVALID_TOKEN]: {
    en: 'Invalid token',
    'zh-cn': '无效的令牌',
    'zh-tw': '無效的令牌',
  },
  [ErrorCode.MISSING_REJECT_REASON]: {
    en: 'Rejection reason is required',
    'zh-cn': '拒绝原因不能为空',
    'zh-tw': '拒絕原因不能為空',
  },
  [ErrorCode.TOKEN_EXPIRED]: {
    en: 'Token has expired',
    'zh-cn': '令牌已过期',
    'zh-tw': '令牌已過期',
  },
  [ErrorCode.TOKEN_ALREADY_USED]: {
    en: 'Token has already been used',
    'zh-cn': '令牌已被使用',
    'zh-tw': '令牌已被使用',
  },
  [ErrorCode.GUESTBOOK_RATE_LIMITED]: {
    en: 'Too many guestbook submissions',
    'zh-cn': '留言提交过于频繁',
    'zh-tw': '留言提交過於頻繁',
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
