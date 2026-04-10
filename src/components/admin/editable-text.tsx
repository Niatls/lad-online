"use client";

import { useRef, useEffect } from "react";
import { useLiveEditor } from "@/components/admin/live-editor-context";

export function EditableText({
  value,
  onChange,
  tagName: Tag = "div",
  className,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  tagName?: any;
  className?: string;
  placeholder?: string;
}) {
  const { isEditMode } = useLiveEditor();
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (elementRef.current && document.activeElement !== elementRef.current) {
      elementRef.current.innerText = value;
    }
  }, [value]);

  if (!isEditMode) return <Tag className={className}>{value}</Tag>;

  return (
    <Tag
      ref={elementRef}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={`outline-none transition-all focus:bg-black/5 hover:bg-black/5 focus:ring-2 focus:ring-forest/20 rounded cursor-text min-h-[1.5em] min-w-[2ch] ${!value && placeholder ? "empty:before:content-[attr(data-placeholder)] empty:before:text-forest/30" : ""} ${className}`}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const newVal = e.target.innerText;
        if (newVal !== value) {
          onChange(newVal);
        }
      }}
    />
  );
}
