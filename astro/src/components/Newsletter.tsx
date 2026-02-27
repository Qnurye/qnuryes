'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, MailboxIcon } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer.tsx';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { useTranslations } from '@/hooks/useTranslations.ts';
import { locales } from '@/i18n';
import { cn } from '@/lib/utils.ts';

const localeOptions = Object.keys(locales) as [keyof typeof locales, ...Array<keyof typeof locales>];

const newsletterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  locale: z.enum(localeOptions),
  consent: z.boolean().refine((val) => val, {
    message: 'You must accept the terms and conditions',
  }),
});

const NewsletterForm: React.FC<{
  locale: keyof typeof locales;
  onSubmit: (value: z.infer<typeof newsletterSchema>) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
}> = ({ locale, onSubmit, disabled = false, loading = false, error = false }) => {
  const { t } = useTranslations(locale);
  const form = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
      name: undefined,
      locale: locale,
      consent: false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2 *:grow sm:flex-row">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('newsletter.email_label')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('newsletter.email_placeholder')} {...field} disabled={disabled} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('newsletter.name_label')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('newsletter.name_placeholder')} {...field} disabled={disabled} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="locale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('newsletter.language_label')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('newsletter.language_placeholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(locales).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t('newsletter.consent_label')}</FormLabel>
                <FormDescription>
                  <span dangerouslySetInnerHTML={{ __html: t('newsletter.consent_description') }} />
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <FormMessage className={cn('text-destructive', !error && 'hidden')}>{t('newsletter.error')}</FormMessage>
        <Button type="submit" className={cn('w-full', disabled && !loading && 'hidden')} disabled={disabled}>
          {loading ? <Loader2Icon className="animate-spin" /> : t('newsletter.submit_button')}
        </Button>
      </form>
    </Form>
  );
};

const mailWebLinks: Record<string, string> = {
  'gmail.com': 'https://mail.google.com',
  'outlook.com': 'https://outlook.live.com',
  'hotmail.com': 'https://outlook.live.com',
  'yahoo.com': 'https://mail.yahoo.com',
  'icloud.com': 'https://www.icloud.com/mail',
  'aol.com': 'https://mail.aol.com',
  'qq.com': 'https://mail.qq.com',
  'foxmail.com': 'https://mail.qq.com',
  '163.com': 'https://mail.163.com',
  '126.com': 'https://mail.126.com',
  'sohu.com': 'https://mail.sohu.com',
  'sina.com': 'https://mail.sina.com.cn',
  'yandex.com': 'https://mail.yandex.com',
  'zoho.com': 'https://mail.zoho.com',
  'protonmail.com': 'https://protonmail.com',
  'tutanota.com': 'https://tutanota.com',
  'mail.com': 'https://www.mail.com',
  'gmx.com': 'https://www.gmx.com',
  'fastmail.com': 'https://www.fastmail.com',
  'hushmail.com': 'https://www.hushmail.com',
  'mail.ru': 'https://mail.ru',
};

const Newsletter: React.FC<{ locale: string }> = ({ locale }) => {
  const { t } = useTranslations(locale);
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<'loading' | 'successful' | 'input'>('input');
  const [mailTarget, setMailTarget] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Reset state when the modal closes so it opens fresh next time
  useEffect(() => {
    if (!open) {
      setFormState('input');
      setMailTarget(null);
      setIsError(false);
    }
  }, [open]);

  const onSubmit = async (value: z.infer<typeof newsletterSchema>): Promise<void> => {
    setFormState('loading');

    const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(value),
    });

    if (!response.ok) {
      setIsError(true);
      setMailTarget(null);
      setFormState('input');
      return;
    }

    setFormState('successful');
    const email = value.email.split('@')[1];
    if (mailWebLinks[email]) {
      setMailTarget(mailWebLinks[email]);
    }
  };

  const triggerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const animPhaseRef = useRef<'idle' | 'converging' | 'settled'>('idle');
  const [animPhase, setAnimPhase] = useState<'idle' | 'converging' | 'settled'>('idle');

  const setPhase = useCallback((phase: 'idle' | 'converging' | 'settled') => {
    animPhaseRef.current = phase;
    setAnimPhase(phase);
  }, []);

  const cancelAnimation = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (open || animPhaseRef.current !== 'idle') {
      return;
    }
    if (!window.matchMedia('(hover: hover)').matches) {
      return;
    }
    const el = triggerRef.current;
    const overlay = overlayRef.current;
    if (!el || !overlay) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    overlay.style.willChange = 'mask-image, opacity';

    const rect = el.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;
    const corners = [
      { x: 0, y: 0 },
      { x: window.innerWidth, y: 0 },
      { x: 0, y: window.innerHeight },
      { x: window.innerWidth, y: window.innerHeight },
    ];
    const startRadius = Math.max(window.innerWidth, window.innerHeight);
    const endRadius = Math.max(rect.width, rect.height) / 2 + 12;

    setPhase('converging');
    startTimeRef.current = 0;

    const easeOutExpo = (t: number): number => (t === 1 ? 1 : 1 - 2 ** (-10 * t));
    const lerp = (start: number, end: number, t: number): number => start + (end - start) * t;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / 1200, 1);
      const eased = easeOutExpo(progress);

      overlay.style.setProperty('--s1x', `${lerp(corners[0].x, targetX, eased)}px`);
      overlay.style.setProperty('--s1y', `${lerp(corners[0].y, targetY, eased)}px`);
      overlay.style.setProperty('--s2x', `${lerp(corners[1].x, targetX, eased)}px`);
      overlay.style.setProperty('--s2y', `${lerp(corners[1].y, targetY, eased)}px`);
      overlay.style.setProperty('--s3x', `${lerp(corners[2].x, targetX, eased)}px`);
      overlay.style.setProperty('--s3y', `${lerp(corners[2].y, targetY, eased)}px`);
      overlay.style.setProperty('--s4x', `${lerp(corners[3].x, targetX, eased)}px`);
      overlay.style.setProperty('--s4y', `${lerp(corners[3].y, targetY, eased)}px`);
      overlay.style.setProperty('--sr', `${lerp(startRadius, endRadius, eased)}px`);
      overlay.style.opacity = `${Math.min(elapsed / 400, 1)}`;

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        animFrameRef.current = 0;
        setPhase('settled');
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [open, setPhase]);

  const handleMouseLeave = useCallback(() => {
    cancelAnimation();
    const overlay = overlayRef.current;
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.willChange = 'auto';
    }
    setPhase('idle');
  }, [cancelAnimation, setPhase]);

  useEffect(() => {
    if (open) {
      cancelAnimation();
      const overlay = overlayRef.current;
      if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.willChange = 'auto';
      }
      setPhase('idle');
    }
  }, [open, cancelAnimation, setPhase]);

  useEffect(() => {
    return () => {
      cancelAnimation();
    };
  }, [cancelAnimation]);

  const trigger = (
    <div className="relative">
      <Button
        ref={triggerRef}
        variant="outline"
        className={cn('newsletter-trigger', animPhase !== 'idle' && 'newsletter-glow z-50')}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <MailboxIcon className="newsletter-icon" />
        {t('footer.subscribe_newsletter')}
      </Button>
      {animPhase === 'settled' && (
        <span
          className="click-it-text pointer-events-none absolute top-1/2 left-full z-50 flex items-center gap-1 whitespace-nowrap font-medium text-foreground text-xs"
          aria-hidden="true"
        >
          <span className="click-it-arrow">←</span>
          <span className="click-it-letters">
            {t('footer.click_it')
              .split('')
              .map((char, i) => (
                <span key={i} className="click-it-letter" style={{ animationDelay: `${200 + i * 60}ms` }}>
                  {char}
                </span>
              ))}
          </span>
        </span>
      )}
    </div>
  );

  const spotlight = <div ref={overlayRef} className="newsletter-spotlight" aria-hidden="true" />;

  const form = (
    <NewsletterForm
      locale={locale as keyof typeof locales}
      onSubmit={onSubmit}
      disabled={formState !== 'input'}
      loading={formState === 'loading'}
      error={isError}
    />
  );

  const successFooter = (
    <div className={cn('flex flex-col gap-2', formState !== 'successful' && 'hidden')}>
      <span>{t('newsletter.check_inbox')}</span>
      <div className="flex w-full grow flex-wrap justify-end gap-2">
        <Button className={cn('grow', !mailTarget && 'hidden')} asChild>
          <a href={mailTarget || '#'} target="_blank" rel="noopener noreferrer">
            {t('newsletter.check_button')}
          </a>
        </Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <>
        {spotlight}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">{t('newsletter.title')}</DialogTitle>
              <DialogDescription className="font-serif">{t('newsletter.description')}</DialogDescription>
            </DialogHeader>
            {form}
            <DialogFooter className={cn(formState !== 'successful' && 'hidden')}>
              {successFooter}
              <DialogClose asChild>
                <Button variant="outline">{t('newsletter.close_button')}</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      {spotlight}
      <Drawer open={open} onOpenChange={setOpen} handleOnly>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="p-1 sm:p-2">
          <div className="overflow-y-auto pb-24 sm:pb-16">
            <DrawerHeader>
              <DrawerTitle className="font-serif text-2xl">{t('newsletter.title')}</DrawerTitle>
              <DrawerDescription className="font-serif">{t('newsletter.description')}</DrawerDescription>
            </DrawerHeader>
            {form}
            <DrawerFooter className={cn(formState !== 'successful' && 'hidden')}>
              {successFooter}
              <DrawerClose asChild>
                <Button variant="outline">{t('newsletter.close_button')}</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Newsletter;
