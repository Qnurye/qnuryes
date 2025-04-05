'use client'

import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { CheckIcon, LanguagesIcon } from 'lucide-react'
import { getLanguageNameFromLocale } from '@/i18n'
import { useTranslations } from '@/hooks/useTranslations'

export default function LanguageSwitcher({ locales, currentLocale }: {
  locales: string[]
  currentLocale: string
}): React.ReactElement {
  const [open, setOpen] = useState(false)
  const { t, isLoading } = useTranslations(currentLocale)

  function handleLanguageChange(locale: string): undefined {
    if (locale === currentLocale) { return }

    const pathname = window.location.pathname
    const currentPath = pathname.replace(`/${currentLocale}`, '')

    window.location.href = `/${locale}${currentPath}`
  }

  if (isLoading) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-fit justify-between gap-1"
        disabled
      >
        <LanguagesIcon className="size-4" />
        {getLanguageNameFromLocale(currentLocale)}
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={t('nav.language.select') || 'Select language'}
          size="sm"
          className={'w-fit justify-between gap-1 border-contrast transition-colors hover:bg-contrast'
            + ' hover:text-contrast-foreground'}
        >
          <LanguagesIcon className="size-4" />
          {getLanguageNameFromLocale(currentLocale)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0 mx-12">
        <Command>
          <CommandInput placeholder={t('nav.language.search') || 'Search language...'} />
          <CommandList>
            <CommandEmpty>{t('nav.language.not_found') || 'No language found.'}</CommandEmpty>
            <CommandGroup>
              {locales.map((locale: string) => (
                <CommandItem
                  key={locale}
                  value={locale}
                  onSelect={() => handleLanguageChange(locale)}
                  className="cursor-pointer"
                >
                  <span>{getLanguageNameFromLocale(locale)}</span>
                  {locale === currentLocale && (
                    <CheckIcon className="ml-auto size-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
