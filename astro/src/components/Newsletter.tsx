'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, MailboxIcon } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
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
        <FormMessage className={`text-destructive${!error && 'hidden'}`}>{t('newsletter.error')}</FormMessage>
        <Button type="submit" className={`w-full${disabled && !loading ? 'hidden' : ''}`} disabled={disabled}>
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
  const [formState, setFormState] = useState<'loading' | 'successful' | 'input'>('input');
  const [mailTarget, setMailTarget] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

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
      return;
    }

    setFormState('successful');
    const email = value.email.split('@')[1];
    if (mailWebLinks[email]) {
      setMailTarget(mailWebLinks[email]);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <MailboxIcon />
          {t('footer.subscribe_newsletter')}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-1 sm:p-2 md:p-4">
        <div className="overflow-y-auto scroll-smooth pb-24 sm:pb-16 md:pb-0">
          <DrawerHeader>
            <DrawerTitle className="font-serif text-2xl">{t('newsletter.title')}</DrawerTitle>
            <DrawerDescription className="font-serif">{t('newsletter.description')}</DrawerDescription>
          </DrawerHeader>
          <NewsletterForm
            locale={locale as keyof typeof locales}
            onSubmit={onSubmit}
            disabled={formState !== 'input'}
            loading={formState === 'loading'}
            error={isError}
          />
          <DrawerFooter className={`flex flex-col gap-2 ${formState !== 'successful' ? 'hidden' : ''}`}>
            <span>{t('newsletter.check_inbox')}</span>
            <div className="flex w-full grow flex-wrap justify-end gap-2 md:w-auto">
              <Button className={`grow ${mailTarget ? '' : 'hidden'}`} asChild>
                <a href={mailTarget || '#'} target="_blank" rel="noopener noreferrer">
                  {t('newsletter.check_button')}
                </a>
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">{t('newsletter.close_button')}</Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default Newsletter;
