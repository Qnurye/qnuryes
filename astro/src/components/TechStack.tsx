import type { IconType } from '@icons-pack/react-simple-icons';
import { LinkIcon } from 'lucide-react';
import type React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

const TechStack = ({
  children,
  title,
  description,
  url,
}: {
  children: React.ReactElement<IconType>;
  title: string;
  description: string;
  url: string;
}): React.ReactElement => (
  <HoverCard>
    <HoverCardTrigger className="dark:rounded-md dark:bg-border dark:p-1" asChild>
      {/* Avoid `<a />` generated that affect SEO */}
      <div>{children}</div>
    </HoverCardTrigger>
    <HoverCardContent className="w-80">
      <div className="space-y-1">
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-sm">{description}</p>
        <div className="flex items-center pt-2">
          <LinkIcon className="mr-2 h-4 w-4 opacity-70" />{' '}
          <a className="text-muted-foreground text-xs" href={url}>
            {url}
          </a>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
);

export default TechStack;
