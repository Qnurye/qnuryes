-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id TEXT NOT NULL,
  parent_id INTEGER,
  author_name TEXT NOT NULL,
  author_email TEXT,
  author_ip TEXT,
  content TEXT NOT NULL,
  country_code TEXT,
  likes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'approved',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES comments(id)
);

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER NOT NULL,
  user_identifier TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comment_id) REFERENCES comments(id),
  UNIQUE(comment_id, user_identifier)
);

-- Create post_reactions table
CREATE TABLE IF NOT EXISTS post_reactions (
  post_slug TEXT PRIMARY KEY,
  counts TEXT NOT NULL DEFAULT '{}'
);

-- Create guestbook_submissions table
CREATE TABLE IF NOT EXISTS guestbook_submissions (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  nickname TEXT NOT NULL,
  email TEXT,
  url TEXT,
  message TEXT,
  signature_svg TEXT NOT NULL,
  signature_bbox TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'pending',
  reject_reason TEXT,
  ip TEXT,
  approve_token_hash TEXT NOT NULL,
  token_used INTEGER NOT NULL DEFAULT 0,
  token_expires_at INTEGER NOT NULL,
  reviewed_at INTEGER
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_guestbook_status ON guestbook_submissions(status);
CREATE INDEX IF NOT EXISTS idx_guestbook_created_at ON guestbook_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_guestbook_token_hash ON guestbook_submissions(approve_token_hash);