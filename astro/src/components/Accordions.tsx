import type { ReactElement } from 'react';
import Markdown from 'react-markdown';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.tsx';
import { cn } from '@/lib/utils.ts';

interface AccordionProps {
  className?: string;
  accordions: Array<{
    title: string;
    content: string;
  }>;
}
const Accordions = ({ className, accordions }: AccordionProps): ReactElement => (
  <Accordion type="single" collapsible className={cn('max-w-prose prose', className)}>
    {accordions.map((a, key) => (
      <AccordionItem value={`item-${key}`} key={key}>
        <AccordionTrigger>
          <Markdown>{a.title}</Markdown>
        </AccordionTrigger>
        <AccordionContent>
          <Markdown>{a.content}</Markdown>
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

export default Accordions;
