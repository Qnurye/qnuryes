import type * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>): React.ReactElement {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'selection:bg-primary file:text-foreground placeholder:text-muted-foreground' +
          'flex h-9 w-full min-w-0 rounded-md border-input selection:text-primary-foreground dark:bg-input/30' +
          'border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow]' +
          'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-sm' +
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
