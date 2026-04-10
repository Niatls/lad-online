import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";

type RichMarkdownProps = {
  content: string;
};

export function RichMarkdown({ content }: RichMarkdownProps) {
  return (
    <div className="prose prose-stone max-w-none prose-headings:font-bold prose-headings:text-forest prose-p:text-forest/70 prose-p:leading-8 prose-strong:text-forest prose-a:text-sage-dark prose-a:no-underline hover:prose-a:text-forest prose-li:text-forest/65 prose-hr:border-sage-light/40">
      <ReactMarkdown
        components={{
          blockquote: ({ children }) => (
            <blockquote className="rounded-3xl border border-sage-light/30 bg-cream px-6 py-5 not-italic text-forest shadow-sm">
              {children}
            </blockquote>
          ),
          h2: ({ children }) => (
            <h2 className="mt-12 text-3xl font-bold text-forest first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-8 text-2xl font-semibold text-forest">
              {children}
            </h3>
          ),
          hr: () => <hr className="my-10 border-sage-light/40" />,
          a: ({ children, href }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noreferrer" : undefined}
              className="font-semibold text-sage-dark underline-offset-4 transition hover:text-forest hover:underline"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="space-y-3">{children}</ul>,
          li: ({ children }) => (
            <li className="leading-7 text-forest/65">{children}</li>
          ),
          p: ({ children }) => <p className="leading-8 text-forest/70">{children}</p>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
