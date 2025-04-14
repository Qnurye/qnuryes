import type { IconType } from '@icons-pack/react-simple-icons';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import React from 'react';
import { LinkIcon } from 'lucide-react';

const TechStack = ({ children, title, description, url }: {
  children: React.ReactElement<IconType>
  title: string
  description: string
  url: string
}): React.ReactElement => (
  <HoverCard>
    <HoverCardTrigger className="dark:bg-border dark:rounded-md dark:p-1" asChild>
      {/* Avoid `<a />` generated that affect SEO */}
      <div>
        {children}
      </div>
    </HoverCardTrigger>
    <HoverCardContent className="w-80">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="text-sm">
          {description}
        </p>
        <div className="flex items-center pt-2">
          <LinkIcon className="mr-2 h-4 w-4 opacity-70" />{' '}
          <a className="text-xs text-muted-foreground" href={url}>
            {url}
          </a>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
)

export default TechStack;
