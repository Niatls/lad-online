"use client";

import { type LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";

type SelectableContactActionProps = {
  className?: string;
  href: string;
  iconClassName?: string;
  Icon: LucideIcon;
  text: string;
  textClassName?: string;
};

export function SelectableContactAction({
  className = "",
  href,
  iconClassName,
  Icon,
  text,
  textClassName = "",
}: SelectableContactActionProps) {
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const selectText = () => {
    const textNode = textRef.current;
    if (!textNode) {
      return;
    }

    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      window.location.href = href;
      clickTimeoutRef.current = null;
    }, 220);
  };

  const handleDoubleClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    selectText();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={className}
    >
      <Icon className={iconClassName} />
      <span
        ref={textRef}
        className={textClassName}
        data-copy-text={text}
      >
        {text}
      </span>
    </button>
  );
}
