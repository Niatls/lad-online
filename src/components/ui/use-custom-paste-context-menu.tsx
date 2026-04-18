"use client";

import * as React from "react";
import { createPortal } from "react-dom";

type EditableElement = HTMLInputElement | HTMLTextAreaElement;

type MenuState = {
  open: boolean;
  target: EditableElement | null;
  x: number;
  y: number;
};

function clampMenuPosition(x: number, y: number) {
  if (typeof window === "undefined") {
    return { x, y };
  }

  const menuWidth = 152;
  const menuHeight = 52;
  const maxX = window.innerWidth - menuWidth - 12;
  const maxY = window.innerHeight - menuHeight - 12;

  return {
    x: Math.max(12, Math.min(x, maxX)),
    y: Math.max(12, Math.min(y, maxY)),
  };
}

async function pasteClipboardText(target: EditableElement | null) {
  if (!target || typeof navigator === "undefined" || !navigator.clipboard) {
    return;
  }

  const text = await navigator.clipboard.readText();
  if (!text) {
    return;
  }

  const start = target.selectionStart ?? target.value.length;
  const end = target.selectionEnd ?? target.value.length;
  const nextValue =
    target.value.slice(0, start) + text + target.value.slice(end);

  target.focus();
  target.value = nextValue;

  const nextCaret = start + text.length;
  target.setSelectionRange(nextCaret, nextCaret);
  target.dispatchEvent(new Event("input", { bubbles: true }));
}

export function useCustomPasteContextMenu() {
  const [menuState, setMenuState] = React.useState<MenuState>({
    open: false,
    target: null,
    x: 0,
    y: 0,
  });

  const closeMenu = React.useCallback(() => {
    setMenuState((prev) =>
      prev.open
        ? { open: false, target: null, x: 0, y: 0 }
        : prev
    );
  }, []);

  React.useEffect(() => {
    if (!menuState.open) {
      return;
    }

    const handleClose = () => closeMenu();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("mousedown", handleClose);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handleClose);
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, menuState.open]);

  const handleContextMenu = React.useCallback(
    (event: React.MouseEvent<EditableElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const { x, y } = clampMenuPosition(event.clientX, event.clientY);
      setMenuState({
        open: true,
        target: event.currentTarget,
        x,
        y,
      });
    },
    []
  );

  const menu = menuState.open
    ? createPortal(
        <div
          className="fixed z-[1000] overflow-hidden rounded-xl border border-sage-light/30 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
          style={{ left: menuState.x, top: menuState.y }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="min-w-[152px] px-4 py-3 text-left text-sm font-medium text-forest transition hover:bg-sage-light/12"
            onClick={async () => {
              try {
                await pasteClipboardText(menuState.target);
              } catch (error) {
                console.error("Failed to paste clipboard text:", error);
              } finally {
                closeMenu();
              }
            }}
          >
            Вставить
          </button>
        </div>,
        document.body
      )
    : null;

  return {
    handleContextMenu,
    menu,
  };
}
