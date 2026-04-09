"use client";

import type React from "react";
import { useRef } from "react";
import { LayoutTemplate } from "lucide-react";

type SectionShellProps = {
  children: React.ReactNode;
  description: string;
  icon?: typeof LayoutTemplate;
  title: string;
};

type FieldProps = {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

type MarkdownTextareaFieldProps = {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  value: string;
};

export function SectionShell({
  title,
  description,
  icon: Icon = LayoutTemplate,
  children,
}: SectionShellProps) {
  return (
    <section className="rounded-[2rem] border border-sage-light/30 bg-white/90 p-6 shadow-lg sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-light/20 text-sage-dark">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-forest">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-forest/55">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
}: FieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-forest">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-sage-light/30 bg-white px-4 py-3 text-sm text-forest outline-none transition focus:border-sage"
      />
    </label>
  );
}

export function MarkdownTextareaField({
  label,
  onChange,
  placeholder,
  rows = 6,
  value,
}: MarkdownTextareaFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const applySnippet = (
    before: string,
    after = "",
    placeholderText = "текст"
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + before + placeholderText + after);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.slice(start, end) || placeholderText;
    const nextValue =
      value.slice(0, start) +
      before +
      selectedText +
      after +
      value.slice(end);

    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <label className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-forest">{label}</span>
        <div className="flex flex-wrap gap-2">
          <ToolbarButton
            label="Жирный"
            onClick={() => applySnippet("**", "**", "акцент")}
          />
          <ToolbarButton
            label="H2"
            onClick={() => applySnippet("\n## ", "", "Заголовок")}
          />
          <ToolbarButton
            label="Список"
            onClick={() => applySnippet("\n- ", "", "Пункт")}
          />
          <ToolbarButton
            label="Цитата"
            onClick={() => applySnippet("\n> ", "", "Цитата")}
          />
        </div>
      </div>

      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-sage-light/30 bg-white px-4 py-3 font-mono text-sm text-forest outline-none transition focus:border-sage"
      />
    </label>
  );
}

function ToolbarButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-forest transition hover:bg-sage-light/20"
    >
      {label}
    </button>
  );
}
