import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";

type RichMarkdownProps = {
  content: string;
  theme?: "dark" | "light";
};

export function RichMarkdown({
  content,
  theme = "light",
}: RichMarkdownProps) {
  const proseClassName =
    theme === "dark"
      ? "prose prose-invert max-w-none prose-headings:text-white prose-p:text-white/75 prose-strong:text-white prose-a:text-white prose-li:text-white/70 prose-hr:border-white/20"
      : "prose prose-stone max-w-none prose-headings:font-bold prose-headings:text-forest prose-p:text-forest/70 prose-p:leading-8 prose-strong:text-forest prose-a:text-sage-dark prose-a:no-underline hover:prose-a:text-forest prose-li:text-forest/65 prose-hr:border-sage-light/40";

  return (
    <div className={proseClassName}>
      <ReactMarkdown
        components={{
          blockquote: ({ children }) => (
            <blockquote
              className={
                theme === "dark"
                  ? "rounded-3xl border border-white/15 bg-white/5 px-6 py-5 not-italic text-white shadow-sm"
                  : "rounded-3xl border border-sage-light/30 bg-cream px-6 py-5 not-italic text-forest shadow-sm"
              }
            >
              {children}
            </blockquote>
          ),
          h2: ({ children }) => (
            <h2
              className={`mt-12 text-3xl font-bold first:mt-0 ${
                theme === "dark" ? "text-white" : "text-forest"
              }`}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={`mt-8 text-2xl font-semibold ${
                theme === "dark" ? "text-white" : "text-forest"
              }`}
            >
              {children}
            </h3>
          ),
          hr: () => (
            <hr
              className={`my-10 ${
                theme === "dark" ? "border-white/20" : "border-sage-light/40"
              }`}
            />
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noreferrer" : undefined}
              className={`font-semibold underline-offset-4 transition hover:underline ${
                theme === "dark"
                  ? "text-white hover:text-white/80"
                  : "text-sage-dark hover:text-forest"
              }`}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="space-y-3">{children}</ul>,
          li: ({ children }) => (
            <li
              className={`leading-7 ${
                theme === "dark" ? "text-white/70" : "text-forest/65"
              }`}
            >
              {children}
            </li>
          ),
          p: ({ children }) => (
            <p
              className={`leading-8 ${
                theme === "dark" ? "text-white/75" : "text-forest/70"
              }`}
            >
              {children}
            </p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
