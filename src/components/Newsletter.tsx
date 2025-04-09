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
              <FormLabel>邮箱地址</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
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
                <FormLabel>姓名（可选）</FormLabel>
                <FormControl>
                  <Input placeholder="可留空" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="locale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>偏好语言</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="请选择语言" />
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
                  同意提供以上信息用于订阅邮件
                </FormLabel>
                <FormDescription>
                  本站使用第三方服务提供商（Kit）处理邮件订阅，本站将与其共享用户邮箱地址。请查看 <a href="https://kit.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Kit 的隐私政策</a>以了解更多信息。
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">提交</Button>
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
          <DrawerTitle className="text-2xl font-serif">订阅新闻邮件</DrawerTitle>
          <DrawerDescription className="font-serif">
            提交邮箱地址后，你将收到我的每月更新合集。如果希望收到更频繁的更新提醒，请订阅我的 RSS。
          </DrawerDescription>
        </DrawerHeader>
        <NewsletterForm locale={locale as keyof typeof locales} />
        <DrawerFooter className="flex-wrap md:flex-row gap-2 justify-between items-center hidden">
          <span>请检查你的收件箱（或垃圾箱），查看刚刚发出的确认邮件。点击邮件中的链接以完成订阅。</span>
          <div className="flex w-full md:w-auto flex-wrap gap-2 justify-end">
            <Button className="grow">
              去看看
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">
                我知道了
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default Newsletter;
