import React from 'react';
import { useTranslations } from '@/hooks/useTranslations.ts';
import { Button } from '@/components/ui/button.tsx';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';

interface PaginationProps {
  page: number
  totalPages: number
  loading: boolean
  locale: string
  onPageChange: (newPage: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, loading, locale, onPageChange }) => {
  const { t } = useTranslations(locale)
  if (totalPages <= 1) { return null; }

  return (
    <div className="flex justify-between items-center my-8 gap-4">
      <Button
        variant="secondary"
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        disabled={page === 1 || loading}
      >
        <ArrowLeftIcon size={14} />
        {t('comment.previous')}
      </Button>

      <span className="text-sm">
        {t('comment.pages', { current: page, total: totalPages })}
      </span>

      <Button
        variant="secondary"
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        disabled={page === totalPages || loading}
      >
        {t('comment.next')}
        <ArrowRightIcon size={14} />
      </Button>
    </div>
  );
};

export default Pagination;
