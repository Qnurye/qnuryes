import React from 'react';

interface PaginationProps {
  page: number
  totalPages: number
  loading: boolean
  locale: string
  onPageChange: (newPage: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, loading, locale, onPageChange }) => {
  if (totalPages <= 1) { return null; }

  return (
    <div className="flex justify-center items-center mt-8 gap-4">
      <button
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        disabled={page === 1 || loading}
        className={' bg-gray-100 border-none py-2 px-4 rounded-md cursor-pointer transition-colors hover:bg-gray-200'
          + ' disabled:opacity-50 disabled:cursor-not-allowed'}
      >
        {locale === 'zh-cn' ? '上一页' : 'Previous'}
      </button>

      <span className="text-gray-600">
        {locale === 'zh-cn' ? `第 ${page} 页，共 ${totalPages} 页` : `Page ${page} of ${totalPages}`}
      </span>

      <button
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        disabled={page === totalPages || loading}
        className={'bg-gray-100 border-none py-2 px-4 rounded-md cursor-pointer transition-colors hover:bg-gray-200'
          + ' disabled:opacity-50 disabled:cursor-not-allowed'}
      >
        {locale === 'zh-cn' ? '下一页' : 'Next'}
      </button>
    </div>
  );
};

export default Pagination;
