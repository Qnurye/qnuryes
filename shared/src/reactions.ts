export interface ReactionEmoji {
  emoji: string;
  label: string;
}

export const DEFAULT_REACTIONS: ReactionEmoji[] = [
  { emoji: '❤️', label: 'love' },
  { emoji: '👍', label: 'like' },
  { emoji: '💡', label: 'insightful' },
  { emoji: '🚀', label: 'rocket' },
  { emoji: '🤯', label: 'mindblown' },
];

export const VALID_LABELS = new Set(DEFAULT_REACTIONS.map((r) => r.label));

export interface ReactionCounts {
  [emojiLabel: string]: number;
}

export const RATE_LIMIT_MAX = 30;
export const RATE_LIMIT_TTL = 60;

export const KV_PREFIX_REACTION = 'reactions';
export const KV_PREFIX_RATELIMIT = 'ratelimit:reactions';
