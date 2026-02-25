import type { GuestbookWallEntry, SignatureBBox } from '@qnury-es/shared';
import { ExternalLinkIcon } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { cn } from '@/lib/utils';

interface SignatureCardProps {
  entry: GuestbookWallEntry;
  locale: string;
}

function SignatureCard({ entry, locale }: SignatureCardProps): React.ReactElement {
  const { t } = useTranslations(locale);
  const bbox: SignatureBBox = JSON.parse(entry.signature_bbox);
  const date = new Date(entry.created_at).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className={cn('break-inside-avoid rounded-lg border bg-card p-4 shadow-sm')}>
      <svg
        viewBox={`${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`}
        width="100%"
        height="auto"
        className="mb-3"
        aria-label={t('guestbook.wall.signature_by', { name: entry.nickname })}
      >
        <path d={entry.signature_svg} fill="currentColor" />
      </svg>

      {entry.message && <p className="mb-2 line-clamp-2 text-sm">{entry.message}</p>}

      <div className="flex items-center justify-between text-muted-foreground text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-medium">{entry.nickname}</span>
          {entry.url && (
            <a href={entry.url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              <ExternalLinkIcon size={12} />
            </a>
          )}
        </div>
        <time dateTime={new Date(entry.created_at).toISOString()}>{date}</time>
      </div>
    </div>
  );
}

export default SignatureCard;
