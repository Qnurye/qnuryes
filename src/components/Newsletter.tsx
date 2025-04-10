import { useTranslations } from '@/hooks/useTranslations.ts';
import React from 'react';
import { Button } from '@/components/ui/button.tsx';
import { MailboxIcon } from 'lucide-react';
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
  FormMessage,
} from '@/components/ui/form.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { locales } from '@/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
const localeOptions = Object.keys(locales) as [keyof typeof locales, ...Array<keyof typeof locales>];

const newsletterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  locale: z.enum(localeOptions),
  consent: z.boolean().refine(val => val, {
    message: 'You must accept the terms and conditions',
  }),
})

const NewsletterForm: React.FC<{ locale: keyof typeof locales }> = ({ locale }) => {
  const { t } = useTranslations(locale);
  const form = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
      name: undefined,
      locale,
      consent: false,
    },
  });

  const onSubmit = (value: z.infer<typeof newsletterSchema>): void => {
    console.log(value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('newsletter.email_label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('newsletter.email_placeholder')} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex flex-wrap sm:flex-row gap-2 *:grow">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('newsletter.name_label')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('newsletter.name_placeholder')} {...field} />
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
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
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
        <Button type="submit" className="w-full">{t('newsletter.submit_button')}</Button>
      </form>
    </Form>
  )
}

const Newsletter: React.FC<{ locale: string }> = ({ locale }) => {
  const { t } = useTranslations(locale)
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
        <NewsletterForm locale={locale as keyof typeof locales} />
        <DrawerFooter className="flex-wrap md:flex-row gap-2 justify-between items-center hidden">
          <span>{t('newsletter.check_inbox')}</span>
          <div className="flex w-full md:w-auto flex-wrap gap-2 justify-end">
            <Button className="grow">
              {t('newsletter.check_button')}
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
