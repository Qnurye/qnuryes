import type { SignatureBBox } from '@qnury-es/shared';
import { Loader2Icon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ReviewData {
  nickname: string;
  email: string | null;
  url: string | null;
  message: string | null;
  signature_svg: string;
  signature_bbox: string;
  locale: string;
  created_at: number;
}

const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  'zh-cn': 'Simplified Chinese',
  'zh-tw': 'Traditional Chinese',
};

type ReviewState = 'loading' | 'review' | 'approved' | 'rejected' | 'error';

function GuestbookReview(): React.ReactElement | null {
  const [state, setState] = useState<ReviewState>('loading');
  const [data, setData] = useState<ReviewData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') : null;

  useEffect(() => {
    if (!token) {
      setErrorMsg('No review token provided.');
      setState('error');
      return;
    }

    fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/guestbook/review?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to load submission');
        }
        return res.json();
      })
      .then((submission: ReviewData) => {
        setData(submission);
        setState('review');
      })
      .catch((err: Error) => {
        setErrorMsg(err.message);
        setState('error');
      });
  }, [token]);

  const handleApprove = useCallback(async () => {
    if (!token) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/guestbook/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        throw new Error('Approve failed');
      }
      setState('approved');
    } catch {
      setErrorMsg('Failed to approve. The token may have expired.');
      setState('error');
    } finally {
      setSubmitting(false);
    }
  }, [token]);

  const handleReject = useCallback(async () => {
    if (!token) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/guestbook/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, reason: rejectReason }),
      });
      if (!res.ok) {
        throw new Error('Reject failed');
      }
      setState('rejected');
    } catch {
      setErrorMsg('Failed to reject. The token may have expired.');
      setState('error');
    } finally {
      setSubmitting(false);
    }
  }, [token, rejectReason]);

  if (state === 'loading') {
    return (
      <div className="flex justify-center py-12">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <p className="text-destructive">{errorMsg}</p>
      </div>
    );
  }

  if (state === 'approved') {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <p className="text-green-600 text-lg dark:text-green-400">Approved! The entry is now live on the wall.</p>
      </div>
    );
  }

  if (state === 'rejected') {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <p className="text-lg text-muted-foreground">Rejected. The submitter will be notified.</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  let bbox: SignatureBBox = { x: 0, y: 0, width: 200, height: 80 };
  try {
    bbox = JSON.parse(data.signature_bbox);
  } catch {
    // use default
  }

  const viewBox = `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      {/* Signature preview */}
      <div className="rounded-lg border bg-muted p-6">
        <svg
          viewBox={viewBox}
          width="100%"
          style={{ height: 'auto', maxHeight: '200px' }}
          aria-label={`Signature by ${data.nickname}`}
        >
          <path d={data.signature_svg} fill="currentColor" />
        </svg>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-3 rounded-lg border p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Nickname</span>
          <span className="font-medium">{data.nickname}</span>
        </div>
        {data.message && (
          <div className="flex justify-between gap-4">
            <span className="shrink-0 text-muted-foreground">Message</span>
            <span className="text-end">{data.message}</span>
          </div>
        )}
        {data.url && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Link</span>
            <a href={data.url} target="_blank" rel="noopener noreferrer" className="truncate underline">
              {data.url}
            </a>
          </div>
        )}
        {data.email && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{data.email}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Submitted</span>
          <time>{new Date(data.created_at).toLocaleString()}</time>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Visitor language</span>
          <span>{LOCALE_NAMES[data.locale] || data.locale}</span>
        </div>
      </div>

      {/* Actions */}
      {!rejectMode ? (
        <div className="flex gap-3">
          <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={submitting}>
            {submitting ? <Loader2Icon className="animate-spin" /> : 'Approve'}
          </Button>
          <Button variant="destructive" className="flex-1" onClick={() => setRejectMode(true)} disabled={submitting}>
            Reject
          </Button>
        </div>
      ) : (
        <div className={cn('flex flex-col gap-3')}>
          <Textarea
            placeholder="Reason for rejection (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <div className="flex gap-3">
            <Button variant="destructive" className="flex-1" onClick={handleReject} disabled={submitting}>
              {submitting ? <Loader2Icon className="animate-spin" /> : 'Confirm Reject'}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setRejectMode(false)} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GuestbookReview;
