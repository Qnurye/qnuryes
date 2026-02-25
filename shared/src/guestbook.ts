// --- Types ---

export type GuestbookStatus = 'pending' | 'approved' | 'rejected';

/** Full D1 row shape for guestbook_submissions */
export interface GuestbookSubmission {
  id: string;
  created_at: number; // Unix ms
  nickname: string;
  email: string | null;
  url: string | null;
  message: string | null;
  signature_svg: string;
  signature_bbox: string; // JSON: { x, y, width, height }
  locale: string;
  status: GuestbookStatus;
  reject_reason: string | null;
  ip: string | null;
  approve_token_hash: string;
  token_used: number; // 0 | 1
  token_expires_at: number; // Unix ms
  reviewed_at: number | null;
}

/** Public-facing entry returned from the wall API (no sensitive fields) */
export interface GuestbookWallEntry {
  id: string;
  nickname: string;
  url: string | null;
  message: string | null;
  signature_svg: string;
  signature_bbox: string;
  created_at: number;
}

/** Cursor-based pagination response for the wall */
export interface GuestbookWallResponse {
  entries: GuestbookWallEntry[];
  next_cursor: string | null;
}

/** Signature bounding box stored as JSON in signature_bbox */
export interface SignatureBBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// --- Validation ---

/** Whitelist regex for SVG path `d` attribute values */
export const SVG_PATH_REGEX = /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]+$/;

// --- Constants ---

export const KV_PREFIX_GUESTBOOK_RATELIMIT = 'ratelimit:guestbook';

export const GUESTBOOK_RATE_LIMIT_MAX = 3;
export const GUESTBOOK_RATE_LIMIT_TTL = 3600; // 1 hour in seconds

export const GUESTBOOK_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export const GUESTBOOK_PAGE_SIZE = 20;

export const MAX_MESSAGE_LENGTH = 140;
export const MAX_NICKNAME_LENGTH = 50;
export const MAX_REJECT_REASON_LENGTH = 500;
