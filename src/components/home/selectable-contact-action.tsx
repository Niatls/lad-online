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

  const clearActiveCopyTargets = () => {
    document
      .querySelectorAll<HTMLElement>("[data-copy-active='true']")
      .forEach((node) => {
        node.dataset.copyActive = "false";
      });
  };

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

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

    clearActiveCopyTargets();
    if (textRef.current) {
      textRef.current.dataset.copyActive = "true";
    }
  };

  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={className}
    >
      <Icon className={iconClassName} />
      <span
        ref={textRef}
        className={textClassName}
        data-copy-text={text}
        data-copy-active="false"
      >
        {text}
      </span>
    </button>
  );
}
