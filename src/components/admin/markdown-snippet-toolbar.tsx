"use client";

type MarkdownSnippet = {
  label: string;
  template: string;
};

const snippets: MarkdownSnippet[] = [
  { label: "Жирный", template: "**{text}**" },
  { label: "Плашка", template: "> {text}" },
  { label: "Блок", template: "> **Заголовок блока**\n>\n> {text}" },
  { label: "H2", template: "\n## {text}\n" },
  { label: "H3", template: "\n### {text}\n" },
  { label: "Список", template: "\n- {text}" },
  { label: "Цитата", template: "\n> {text}" },
  { label: "Ссылка", template: "[{text}](https://example.com)" },
  { label: "Разделитель", template: "\n---\n" },
];

type MarkdownSnippetToolbarProps = {
  onInsert: (snippet: MarkdownSnippet) => void;
};

export function MarkdownSnippetToolbar({
  onInsert,
}: MarkdownSnippetToolbarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {snippets.map((snippet) => (
        <button
          key={snippet.label}
          type="button"
          onClick={() => onInsert(snippet)}
          className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-forest transition hover:bg-sage-light/20"
        >
          {snippet.label}
        </button>
      ))}
    </div>
  );
}

export type { MarkdownSnippet };
