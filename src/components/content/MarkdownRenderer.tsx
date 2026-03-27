// src/components/content/MarkdownRenderer.tsx
// Renders markdown as a fully formatted document using react-markdown +
// remark-gfm (tables, strikethrough, task lists, autolinks) +
// @tailwindcss/typography prose classes.

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = ({ content, className }: MarkdownRendererProps) => {
  return (
    <div
      className={cn(
        // Base prose
        'prose prose-sm max-w-none',

        // Headings
        'prose-headings:font-bold prose-headings:text-foreground prose-headings:tracking-tight',
        'prose-h1:text-2xl prose-h1:border-b prose-h1:border-border prose-h1:pb-2 prose-h1:mb-4',
        'prose-h2:text-xl prose-h2:border-b prose-h2:border-border/50 prose-h2:pb-1.5 prose-h2:mb-3',
        'prose-h3:text-lg prose-h3:mb-2',

        // Body text
        'prose-p:text-foreground/90 prose-p:leading-relaxed',
        'prose-strong:text-foreground prose-strong:font-semibold',
        'prose-em:text-foreground/80',

        // Links
        'prose-a:text-primary prose-a:underline-offset-2 hover:prose-a:text-primary/80',

        // Lists
        'prose-ul:my-2 prose-ol:my-2',
        'prose-li:text-foreground/90 prose-li:my-0.5',
        'prose-li:marker:text-muted-foreground',

        // Code — inline
        'prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5',
        'prose-code:rounded prose-code:text-[0.8em] prose-code:font-mono',
        'prose-code:before:content-none prose-code:after:content-none',

        // Code — block
        'prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg',
        'prose-pre:p-4 prose-pre:overflow-x-auto',
        'prose-pre:code:bg-transparent prose-pre:code:p-0 prose-pre:code:text-sm',

        // Blockquote
        'prose-blockquote:border-l-4 prose-blockquote:border-primary/40',
        'prose-blockquote:bg-muted/40 prose-blockquote:px-4 prose-blockquote:py-1',
        'prose-blockquote:rounded-r prose-blockquote:text-muted-foreground prose-blockquote:not-italic',

        // Tables
        'prose-table:w-full prose-table:border-collapse',
        'prose-thead:bg-muted/60',
        'prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2',
        'prose-th:text-left prose-th:font-semibold prose-th:text-foreground prose-th:text-sm',
        'prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2',
        'prose-td:text-foreground/90 prose-td:text-sm',
        'prose-tr:even:bg-muted/20',

        // Images
        'prose-img:rounded-lg prose-img:border prose-img:border-border prose-img:shadow-sm',

        // Horizontal rule
        'prose-hr:border-border prose-hr:my-6',

        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;