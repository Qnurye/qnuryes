import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { ReactionCounts, ReactionEmoji } from './reactions';
import { DEFAULT_REACTIONS } from './reactions';

interface UseReactionsReturn {
  counts: ReactionCounts | null;
  loading: boolean;
  rateLimited: boolean;
  rateLimitedEmoji: string | null;
  react: (emoji: ReactionEmoji) => void;
}

export function useReactions(postSlug: string, t: (key: string) => string): UseReactionsReturn {
  const [counts, setCounts] = useState<ReactionCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitedEmoji, setRateLimitedEmoji] = useState<string | null>(null);
  const rateLimitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiBase = import.meta.env.PUBLIC_API_BASE_URL;

  useEffect(() => {
    let cancelled = false;

    async function fetchCounts(): Promise<void> {
      try {
        const res = await fetch(`${apiBase}/reactions/${postSlug}`);
        if (!res.ok) {
          throw new Error('Failed to fetch reactions');
        }
        const data = await res.json();
        if (!cancelled) {
          setCounts(data.counts);
        }
      } catch {
        if (!cancelled) {
          const fallback: ReactionCounts = {};
          for (const r of DEFAULT_REACTIONS) {
            fallback[r.label] = 0;
          }
          setCounts(fallback);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchCounts();
    return () => {
      cancelled = true;
    };
  }, [postSlug, apiBase]);

  const rollbackOne = useCallback((label: string) => {
    setCounts((c) => (c ? { ...c, [label]: Math.max(0, (c[label] || 0) - 1) } : c));
  }, []);

  const react = useCallback(
    (emoji: ReactionEmoji) => {
      if (rateLimited || !counts) {
        return;
      }

      // Optimistic +1 (each request independently manages its own increment)
      setCounts((c) => (c ? { ...c, [emoji.label]: (c[emoji.label] || 0) + 1 } : c));

      fetch(`${apiBase}/reactions/${postSlug}/${emoji.label}`, { method: 'POST' })
        .then((res) => {
          if (res.status === 429) {
            rollbackOne(emoji.label);
            setRateLimited(true);
            setRateLimitedEmoji(emoji.label);

            if (rateLimitTimer.current) {
              clearTimeout(rateLimitTimer.current);
            }
            rateLimitTimer.current = setTimeout(() => {
              setRateLimited(false);
              setRateLimitedEmoji(null);
            }, 5000);
            return;
          }
          if (!res.ok) {
            throw new Error('Failed');
          }
        })
        .catch(() => {
          rollbackOne(emoji.label);
          toast.error(t('reaction.error'));
        });
    },
    [counts, rateLimited, postSlug, apiBase, rollbackOne],
  );

  useEffect(() => {
    return () => {
      if (rateLimitTimer.current) {
        clearTimeout(rateLimitTimer.current);
      }
    };
  }, []);

  return { counts, loading, rateLimited, rateLimitedEmoji, react };
}
