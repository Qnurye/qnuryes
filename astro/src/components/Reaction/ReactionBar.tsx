import { useCallback, useRef, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { useTranslations } from '@/hooks/useTranslations';
import { cn } from '@/lib/utils';
import type { ReactionEmoji } from './reactions';
import { DEFAULT_REACTIONS } from './reactions';
import { useReactions } from './useReactions';

function formatCount(n: number): string {
  if (n >= 1_000_000) {
    const decimals = n % 1_000_000 >= 100_000 ? 1 : 0;
    const formatted = (n / 1_000_000).toFixed(decimals);
    if (parseFloat(formatted) >= 1000) {
      return `${Math.round(n / 1_000_000_000)}B`;
    }
    return `${formatted}M`;
  }
  if (n >= 1_000) {
    const decimals = n % 1_000 >= 100 ? 1 : 0;
    const formatted = (n / 1_000).toFixed(decimals);
    if (parseFloat(formatted) >= 1000) {
      return `${Math.round(n / 1_000_000)}M`;
    }
    return `${formatted}k`;
  }
  return String(n);
}

const MAX_PARTICLES = 30;

interface BurstParticle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  angle: number;
  distance: number;
  rotation: number;
}

interface ReactionBarProps {
  postSlug: string;
  locale: string;
}

function ReactionBar({ postSlug, locale }: ReactionBarProps): React.ReactElement {
  const { t } = useTranslations(locale);
  const { counts, loading, rateLimited, rateLimitedEmoji, react } = useReactions(postSlug, t);
  const [clickedLabel, setClickedLabel] = useState<string | null>(null);
  const [pressedLabel, setPressedLabel] = useState<string | null>(null);
  const [prevCounts, setPrevCounts] = useState<Record<string, number>>({});
  const [particles, setParticles] = useState<BurstParticle[]>([]);
  const particleId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (emoji: ReactionEmoji, e: React.MouseEvent<HTMLButtonElement>) => {
      if (rateLimited) {
        return;
      }

      // Track previous count for tick animation
      if (counts) {
        setPrevCounts((p) => ({ ...p, [emoji.label]: counts[emoji.label] || 0 }));
      }

      // Release pressed → trigger spring bounce
      setPressedLabel(null);
      setClickedLabel(emoji.label);
      setTimeout(() => setClickedLabel(null), 400);

      // Emoji burst particles (capped at MAX_PARTICLES concurrent)
      const rect = e.currentTarget.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        setParticles((current) => {
          if (current.length >= MAX_PARTICLES) {
            return current;
          }
          const cx = rect.left - containerRect.left + rect.width / 2;
          const cy = rect.top - containerRect.top + rect.height / 2;
          const budget = Math.min(5 + Math.floor(Math.random() * 3), MAX_PARTICLES - current.length);
          const newParticles: BurstParticle[] = [];
          for (let i = 0; i < budget; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 50;
            newParticles.push({
              id: ++particleId.current,
              emoji: emoji.emoji,
              x: cx,
              y: cy,
              scale: 0.6 + Math.random() * 0.8,
              angle,
              distance,
              rotation: (Math.random() - 0.5) * 120,
            });
          }
          setTimeout(() => {
            setParticles((p) => p.filter((pp) => !newParticles.some((np) => np.id === pp.id)));
          }, 850);
          return [...current, ...newParticles];
        });
      }

      react(emoji);
    },
    [counts, rateLimited, react],
  );

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap justify-center gap-2">
        {DEFAULT_REACTIONS.map((emoji, i) => {
          const isLoading = loading || !counts;
          const count = counts?.[emoji.label] ?? 0;
          const prev = prevCounts[emoji.label] ?? count;
          const ticking = prev !== count;
          const isPressed = pressedLabel === emoji.label;
          const isClicked = clickedLabel === emoji.label;
          const isShaking = rateLimited && rateLimitedEmoji === emoji.label;

          return isLoading ? (
            <div
              key={emoji.label}
              className={cn('h-9 w-20 shrink-0 rounded-full bg-muted', 'animate-pulse')}
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ) : (
            <button
              key={emoji.label}
              type="button"
              onClick={(e) => handleClick(emoji, e)}
              onMouseDown={() => setPressedLabel(emoji.label)}
              onMouseUp={() => setPressedLabel(null)}
              onMouseLeave={() => setPressedLabel(null)}
              onTouchStart={() => setPressedLabel(emoji.label)}
              onTouchEnd={() => setPressedLabel(null)}
              disabled={rateLimited}
              aria-label={emoji.label}
              className={cn(
                'reaction-pill',
                'flex w-20 items-center justify-between rounded-full',
                'px-3.5 py-1.5 font-medium text-sm',
                'border border-border bg-card text-card-foreground',
                'transition-transform duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:pointer-events-none disabled:opacity-60',
                'cursor-pointer select-none',
                isPressed && !isClicked && 'scale-[0.9]',
                isClicked && 'reaction-spring',
                isShaking && 'reaction-shake',
              )}
            >
              <span className={cn('text-base', !isClicked && 'reaction-wiggle-hover')}>{emoji.emoji}</span>
              <span className="relative inline-block h-5 min-w-5 overflow-hidden tabular-nums">
                {ticking ? (
                  <>
                    <span key={`old-${prev}`} className="reaction-tick-out absolute inset-0 flex items-center">
                      {formatCount(prev)}
                    </span>
                    <span key={`new-${count}`} className="reaction-tick-in flex items-center">
                      {formatCount(count)}
                    </span>
                  </>
                ) : (
                  <span className="flex items-center">{formatCount(count)}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Rate limit message */}
      <div
        className={cn(
          'mt-3 select-none text-center text-muted-foreground text-sm transition-opacity duration-300',
          rateLimited ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        {t('reaction.rate_limited')} 😄
      </div>

      {/* Burst particles */}
      {particles.map((p) => {
        const tx = Math.cos(p.angle) * p.distance;
        const ty = Math.sin(p.angle) * p.distance;
        return (
          <span
            key={p.id}
            className="reaction-burst pointer-events-none absolute text-lg"
            style={
              {
                left: p.x,
                top: p.y,
                '--burst-x': `${tx}px`,
                '--burst-y': `${ty}px`,
                '--burst-scale': p.scale,
                '--burst-rotation': `${p.rotation}deg`,
              } as React.CSSProperties
            }
          >
            {p.emoji}
          </span>
        );
      })}

      <Toaster />
    </div>
  );
}

export default ReactionBar;
