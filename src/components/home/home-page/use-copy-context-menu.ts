"use client";

import { useEffect, useRef, useState } from "react";

import type { CopyContextMenuState } from "./constants";

export function useCopyContextMenu() {
  const [copyContextMenu, setCopyContextMenu] =
    useState<CopyContextMenuState>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const clearSelection = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        selection.removeAllRanges();
      }

      document
        .querySelectorAll<HTMLElement>("[data-copy-active='true']")
        .forEach((node) => {
          node.dataset.copyActive = "false";
        });
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }

      if (
        event.target instanceof Node &&
        contextMenuRef.current?.contains(event.target)
      ) {
        return;
      }

      clearSelection();
      setCopyContextMenu(null);
    };

    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        setCopyContextMenu(null);
        return;
      }

      if (target.closest("input, textarea, [contenteditable='true']")) {
        setCopyContextMenu(null);
        return;
      }

      const copyTarget = target.closest("[data-copy-active='true'][data-copy-text]");
      if (!(copyTarget instanceof HTMLElement)) {
        event.preventDefault();
        setCopyContextMenu(null);
        return;
      }

      event.preventDefault();

      setCopyContextMenu({
        text: copyTarget.dataset.copyText || "",
        x: Math.min(event.clientX, window.innerWidth - 156),
        y: Math.min(event.clientY, window.innerHeight - 64),
      });
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCopyContextMenu(null);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleCopyFromMenu = async () => {
    if (!copyContextMenu?.text) {
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyContextMenu.text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = copyContextMenu.text;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
    } finally {
      setCopyContextMenu(null);
    }
  };

  return {
    contextMenuRef,
    copyContextMenu,
    handleCopyFromMenu,
  };
}
