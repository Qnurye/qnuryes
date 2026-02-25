import type { GuestbookWallEntry } from '@qnury-es/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { cn } from '@/lib/utils';
import SignatureCard from './SignatureCard';

interface GuestbookWallProps {
  locale: string;
}

function GuestbookWall({ locale }: GuestbookWallProps): React.ReactElement {
  const { t } = useTranslations(locale);
  const [entries, setEntries] = useState<GuestbookWallEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const apiBase = import.meta.env.PUBLIC_API_BASE_URL;

  const fetchEntries = useCallback(
    async (cursor?: string) => {
      const url = new URL(`${apiBase}/guestbook/wall`);
      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error('Failed to fetch');
      }

      return res.json() as Promise<{ entries: GuestbookWallEntry[]; next_cursor: string | null }>;
    },
    [apiBase],
  );

  // Initial load
  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      try {
        const data = await fetchEntries();
        if (!cancelled) {
          setEntries(data.entries);
          setNextCursor(data.next_cursor);
        }
      } catch {
        // Silently fail — show empty state
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [fetchEntries]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!nextCursor || loadingMore) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && nextCursor && !loadingMore) {
          setLoadingMore(true);

          fetchEntries(nextCursor)
            .then((data) => {
              setEntries((prev) => [...prev, ...data.entries]);
              setNextCursor(data.next_cursor);
            })
            .catch(() => {
              // Stop pagination on error
              setNextCursor(null);
            })
            .finally(() => {
              setLoadingMore(false);
            });
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore, fetchEntries]);

  if (loading) {
    return <p className="text-center text-muted-foreground">{t('guestbook.wall.loading')}</p>;
  }

  if (entries.length === 0) {
    return <p className="text-center text-muted-foreground">{t('guestbook.wall.empty')}</p>;
  }

  return (
    <div>
      <div className={cn('columns-2 gap-4 md:columns-3 xl:columns-4')}>
        {entries.map((entry) => (
          <div key={entry.id} className="mb-4">
            <SignatureCard entry={entry} locale={locale} />
          </div>
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
      {nextCursor && (
        <div ref={sentinelRef} className="py-8 text-center text-muted-foreground text-sm">
          {loadingMore && t('guestbook.wall.load_more')}
        </div>
      )}
    </div>
  );
}

export default GuestbookWall;
