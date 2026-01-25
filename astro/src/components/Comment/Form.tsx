import { zodResolver } from '@hookform/resolvers/zod';
import { QuoteIcon, XIcon } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import Markdown from 'react-markdown';
import { Button } from '@/components/ui/button.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from '@/hooks/useTranslations.ts';
import type { Comment, ErrorResponse } from '@/types';
import { type FormData, formSchema } from './hooks/useCommentForm';

interface CommentFormProps {
  locale: string;
  loading: boolean;
  error: ErrorResponse | null;
  replyTo: Comment | null;
  onSubmit: (data: FormData) => Promise<void>;
  onCancelReply: () => void;
  formData: FormData;
}

const ReplyToCard: React.FC<{
  replyTo: Comment;
  onCancelReply: () => void;
  t: {
    replyTo: string;
  };
}> = ({ replyTo, onCancelReply, t }) => (
  <div className="mb-4 flex items-center justify-between rounded-md bg-card p-3">
    <div className="flex w-full flex-col gap-2">
      <div className="between flex flex-row items-center">
        <span className="inline-flex min-w-0 flex-grow items-baseline gap-1">
          <QuoteIcon className="mr-2 size-4" />
          <span className="flex-shrink-0">{t.replyTo}</span>
          <span className="flex-shrink-0 font-bold font-serif">{replyTo.author_name}</span>
        </span>
        <Button variant="ghost" onClick={onCancelReply} type="button" size="icon">
          <XIcon className="size-3" />
        </Button>
      </div>
      <div className="w-full rounded bg-input p-2 font-sans *:max-h-24 *:overflow-hidden *:text-ellipsis">
        <Markdown>{replyTo.content}</Markdown>
      </div>
    </div>
  </div>
);

const CommentForm: React.FC<CommentFormProps> = ({
  locale,
  loading,
  error,
  replyTo,
  onSubmit,
  onCancelReply,
  formData,
}) => {
  const { t } = useTranslations(locale);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
  });

  const handleSubmit = async (data: FormData): Promise<void> => {
    await onSubmit(data);
  };

  return (
    <>
      <Form {...form}>
        <form
          id="comment-form"
          className="mb-8 flex flex-col rounded-lg bg-secondary p-6"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          {replyTo && (
            <ReplyToCard
              replyTo={replyTo}
              onCancelReply={onCancelReply}
              t={{
                replyTo: t('comment.reply_to'),
              }}
            />
          )}

          <FormField
            control={form.control}
            name="author_name"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>{t('comment.name')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author_email"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>{t('comment.email')}</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>{t('comment.content')}</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={4} className="min-h-[100px] resize-y" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button variant="default" type="submit" disabled={loading}>
            {loading ? t('comment.loading') : t('comment.submit')}
          </Button>

          {error && <div className="mt-4 text-destructive">{error.details || t('comment.error')}</div>}
        </form>
      </Form>
      <Toaster />
    </>
  );
};

export default CommentForm;
