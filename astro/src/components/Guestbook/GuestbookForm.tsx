import { zodResolver } from '@hookform/resolvers/zod';
import { MAX_MESSAGE_LENGTH, MAX_NICKNAME_LENGTH } from '@qnury-es/shared';
import { Loader2Icon, PenLineIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from '@/hooks/useTranslations';
import { cn } from '@/lib/utils';
import SignatureCanvas, { type SignatureData } from './SignatureCanvas';

interface GuestbookFormProps {
  locale: string;
}

const guestbookSchema = z.object({
  nickname: z.string().min(1).max(MAX_NICKNAME_LENGTH),
  email: z.email().optional().or(z.literal('')),
  link: z
    .string()
    .or(z.literal(''))
    .transform((val) => {
      if (!val.trim()) {
        return '';
      }
      const trimmed = val.trim();
      return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    })
    .pipe(z.string().url().or(z.literal(''))),
  message: z.string().max(MAX_MESSAGE_LENGTH).optional().or(z.literal('')),
  address: z.string().max(0), // honeypot
});

type GuestbookFormData = z.infer<typeof guestbookSchema>;

type FormState = 'idle' | 'submitting' | 'success' | 'error' | 'rate_limited';

function GuestbookForm({ locale }: GuestbookFormProps): React.ReactElement {
  const { t } = useTranslations(locale);
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>('idle');
  const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
  const [signatureError, setSignatureError] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<GuestbookFormData>({
    resolver: zodResolver(guestbookSchema),
    defaultValues: {
      nickname: '',
      email: '',
      link: '',
      message: '',
      address: '',
    },
  });

  const messageValue = watch('message') || '';
  const charsRemaining = MAX_MESSAGE_LENGTH - messageValue.length;

  const handleSignatureChange = useCallback((data: SignatureData | null) => {
    setSignatureData(data);
    if (data) {
      setSignatureError(false);
    }
  }, []);

  const onSubmit = async (data: GuestbookFormData): Promise<void> => {
    if (!signatureData) {
      setSignatureError(true);
      return;
    }

    if (data.address) {
      return;
    }

    setFormState('submitting');

    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/guestbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: data.nickname,
          email: data.email || undefined,
          url: data.link || undefined,
          message: data.message || undefined,
          signature_svg: signatureData.svg,
          signature_bbox: JSON.stringify(signatureData.bbox),
          locale,
        }),
      });

      if (response.status === 429) {
        setFormState('rate_limited');
        toast.error(t('guestbook.form.rate_limit'));
        return;
      }

      if (!response.ok) {
        setFormState('error');
        toast.error(t('guestbook.form.error'));
        return;
      }

      setFormState('success');
    } catch {
      setFormState('error');
      toast.error(t('guestbook.form.error'));
    }
  };

  const trigger = (
    <Button variant="outline">
      <PenLineIcon />
      {t('guestbook.form.submit')}
    </Button>
  );

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-4">
      {/* Honeypot */}
      <input type="text" {...register('address')} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

      {/* Nickname */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nickname">{t('guestbook.form.nickname')} *</Label>
        <Input
          id="nickname"
          placeholder={t('guestbook.form.nickname_placeholder')}
          {...register('nickname')}
          aria-invalid={!!errors.nickname}
        />
        {errors.nickname && <p className="text-destructive text-sm">{t('guestbook.form.nickname_required')}</p>}
      </div>

      {/* Signature */}
      <div className="flex flex-col gap-1.5">
        <Label>{t('guestbook.form.signature')} *</Label>
        <p className="text-muted-foreground text-sm">{t('guestbook.form.signature_hint')}</p>
        <SignatureCanvas
          onSignatureChange={handleSignatureChange}
          tapToSignLabel={t('guestbook.form.tap_to_sign')}
          undoLabel={t('guestbook.form.undo')}
          clearLabel={t('guestbook.form.clear')}
        />
        {signatureError && <p className="text-destructive text-sm">{t('guestbook.form.signature_required')}</p>}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t('guestbook.form.email')}</Label>
        <Input id="email" type="email" placeholder={t('guestbook.form.email_placeholder')} {...register('email')} />
      </div>

      {/* Link */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="link">{t('guestbook.form.link')}</Label>
        <Input id="link" placeholder={t('guestbook.form.link_placeholder')} {...register('link')} />
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">{t('guestbook.form.message')}</Label>
        <Textarea
          id="message"
          placeholder={t('guestbook.form.message_placeholder')}
          {...register('message')}
          aria-invalid={!!errors.message}
          rows={3}
        />
        <div className="flex justify-between">
          {errors.message ? (
            <p className="text-destructive text-sm">{t('guestbook.form.message_too_long')}</p>
          ) : (
            <span />
          )}
          <p className={cn('text-sm', charsRemaining < 20 ? 'text-destructive' : 'text-muted-foreground')}>
            {t('guestbook.form.chars_remaining', { count: charsRemaining })}
          </p>
        </div>
      </div>

      {/* Error / Rate Limit */}
      {formState === 'error' && <p className="text-destructive text-sm">{t('guestbook.form.error')}</p>}
      {formState === 'rate_limited' && <p className="text-destructive text-sm">{t('guestbook.form.rate_limit')}</p>}

      {/* Submit */}
      <Button type="submit" disabled={formState === 'submitting'}>
        {formState === 'submitting' ? <Loader2Icon className="animate-spin" /> : t('guestbook.form.submit')}
      </Button>

      {/* Footer */}
      <div className="flex flex-col gap-1 text-center text-muted-foreground text-xs">
        <p>{t('guestbook.form.footer_note')}</p>
        <p>{t('guestbook.form.footer_removal', { email: 'contact@qnury.es' })}</p>
      </div>
    </form>
  );

  const successContent = (
    <div className="flex flex-col items-center gap-4 p-4 text-center">
      <p className="text-lg">{t('guestbook.form.success')}</p>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{t('guestbook.title')}</DialogTitle>
            <DialogDescription className="font-serif">{t('guestbook.description')}</DialogDescription>
          </DialogHeader>
          {formState === 'success' ? successContent : formContent}
          <DialogFooter className={cn(formState !== 'success' && 'hidden')}>
            <DialogClose asChild>
              <Button variant="outline">{t('guestbook.form.close')}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} handleOnly>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="p-1 sm:p-2">
        <div className="overflow-y-auto pb-24 sm:pb-16">
          <DrawerHeader>
            <DrawerTitle className="font-serif text-2xl">{t('guestbook.title')}</DrawerTitle>
            <DrawerDescription className="font-serif">{t('guestbook.description')}</DrawerDescription>
          </DrawerHeader>
          {formState === 'success' ? successContent : formContent}
          <DrawerFooter className={cn(formState !== 'success' && 'hidden')}>
            <DrawerClose asChild>
              <Button variant="outline">{t('guestbook.form.close')}</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default GuestbookForm;
