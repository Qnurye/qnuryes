'use client';

import { useTranslations } from '@/hooks/useTranslations.ts';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Loader2Icon, MailboxIcon } from 'lucide-react';
import {
  Drawer, DrawerClose,
  DrawerContent,
  DrawerDescription, DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer.tsx';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { locales } from '@/i18n';
const localeOptions = Object.keys(locales) as [keyof typeof locales, ...Array<keyof typeof locales>];

const newsletterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  locale: z.enum(localeOptions),
  consent: z.boolean().refine(val => val, {
    message: 'You must accept the terms and conditions',
  }),
})

const NewsletterForm: React.FC<{
  locale: keyof typeof locales
  onSubmit: (value: z.infer<typeof newsletterSchema>) => void
  disabled?: boolean
  loading?: boolean
}> = ({ locale, onSubmit, disabled = false, loading = false }) => {
  const { t } = useTranslations(locale);
  const form = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
      name: undefined,
      locale: 'en',
      consent: false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
        <div className="flex flex-wrap sm:flex-row gap-2 *:grow">
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
        </div>
        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  {t('newsletter.consent_label')}
                </FormLabel>
                <FormDescription>
                  <span dangerouslySetInnerHTML={{ __html: t('newsletter.consent_description') }} />
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className={'w-full' + ((disabled && !loading) ? ' hidden' : '')}
          disabled={disabled}
        >
          {loading
            ? (
              <Loader2Icon className="animate-spin" />
            )
            : (t('newsletter.submit_button'))}
        </Button>
      </form>
    </Form>
  )
}
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
  const { t } = useTranslations(locale)
  const [formState, setFormState] = useState<'loading' | 'successful' | 'input'>('input')
  const [mailTarget, setMailTarget] = useState<string | null>(null)

  const onSubmit = (value: z.infer<typeof newsletterSchema>): void => {
    setFormState('loading');
    setTimeout(() => {
      setFormState('successful');

      const email = value.email.split('@')[1];
      if (mailWebLinks[email]) {
        setMailTarget(mailWebLinks[email]);
      }
      console.log(value);
    }, 2000);
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
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-serif">{t('newsletter.title')}</DrawerTitle>
          <DrawerDescription className="font-serif">
            {t('newsletter.description')}
          </DrawerDescription>
        </DrawerHeader>
        <NewsletterForm
          locale={locale as keyof typeof locales}
          onSubmit={onSubmit}
          disabled={formState !== 'input'}
          loading={formState === 'loading'}
        />
        <DrawerFooter
          className={`flex flex-col gap-2 ${formState !== 'successful'
            ? ' hidden'
            : ''}`}
        >
          <span>{t('newsletter.check_inbox')}</span>
          <div className="flex w-full grow md:w-auto flex-wrap gap-2 justify-end">
            <Button className={`grow ${mailTarget ? '' : ' hidden'}`} asChild>
              <a href={mailTarget || '#'} target="_blank" rel="noopener noreferrer">
                {t('newsletter.check_button')}
              </a>
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">
                {t('newsletter.close_button')}
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default Newsletter;
