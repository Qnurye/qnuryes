import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Comment, ErrorResponse } from '@/types';
import { useTranslations } from '@/hooks/useTranslations.ts';
import { Button } from '@/components/ui/button.tsx';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formSchema, type FormData } from './hooks/useCommentForm';
import { QuoteIcon, XIcon } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import Markdown from 'react-markdown';

interface CommentFormProps {
  locale: string
  loading: boolean
  error: ErrorResponse | null
  replyTo: Comment | null
  onSubmit: (data: FormData) => Promise<void>
  onCancelReply: () => void
  formData: FormData
}

const ReplyToCard: React.FC<{
  replyTo: Comment
  onCancelReply: () => void
  t: {
    replyTo: string
  }
}> = ({ replyTo, onCancelReply, t }) => (
  <div className="bg-card p-3 mb-4 rounded-md flex justify-between items-center">
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-row between items-center">
        <span className="inline-flex items-baseline gap-1 flex-grow min-w-0">
          <QuoteIcon className="size-4 mr-2" />
          <span className="flex-shrink-0">{t.replyTo}</span>
          <span className="font-serif font-bold flex-shrink-0">{replyTo.author_name}</span>
        </span>
        <Button
          variant="ghost"
          onClick={onCancelReply}
          type="button"
          size="icon"
        >
          <XIcon className="size-3" />
        </Button>
      </div>
      <div className="font-sans w-full bg-input p-2 rounded *:overflow-hidden *:text-ellipsis *:max-h-24">
        <Markdown>
          {replyTo.content}
        </Markdown>
      </div>
    </div>
  </div>
)

const CommentForm: React.FC<CommentFormProps> = ({
  locale, loading, error, replyTo, onSubmit, onCancelReply, formData,
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
          className="mb-8 p-6 bg-secondary rounded-lg flex flex-col"
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
                  <Textarea
                    {...field}
                    rows={4}
                    className="min-h-[100px] resize-y"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            variant="default"
            type="submit"
            disabled={loading}
          >
            {loading
              ? t('comment.loading')
              : t('comment.submit')}
          </Button>

          {error && <div className="text-destructive mt-4">{error.details || t('comment.error')}</div>}
        </form>
      </Form>
      <Toaster />
    </>
  );
};

export default CommentForm;
