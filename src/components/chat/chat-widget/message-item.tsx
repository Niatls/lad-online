"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ChatMessageContextMenu } from "@/components/chat/chat-widget/chat-message-context-menu";
import { ChatWidgetMessageBody } from "@/components/chat/chat-widget/message-body";
import { resolveChatWidgetMessageState } from "@/components/chat/chat-widget/resolve-chat-widget-message-state";
import type { Message } from "@/components/chat/chat-widget/types";
import { getChatMessagePreviewText } from "@/lib/chat-message-format";

type ChatWidgetMessageItemProps = {
  message: Message;
  onDelete: (message: Message) => void;
  onEdit: (message: Message) => void;
  onJumpToMessage: (messageId: number) => void;
  onReply: (message: Message) => void;
  setMessageRef: (messageId: number, node: HTMLDivElement | null) => void;
};

type MenuState = {
  open: boolean;
  x: number;
  y: number;
};

function getTouchCoordinates(
  event: React.TouchEvent<HTMLDivElement>,
  fallbackRect: DOMRect | undefined,
) {
  const touch = event.touches[0] ?? event.changedTouches[0];
  if (touch) {
    return { x: touch.clientX, y: touch.clientY };
  }

  return {
    x: fallbackRect ? fallbackRect.left + fallbackRect.width / 2 : 24,
    y: fallbackRect ? fallbackRect.top + fallbackRect.height / 2 : 24,
  };
}

export function ChatWidgetMessageItem({
  message,
  onDelete,
  onEdit,
  onJumpToMessage,
  onReply,
  setMessageRef,
}: ChatWidgetMessageItemProps) {
  const {
    canDelete,
    canEdit,
    canReply,
    isSystem,
    isVisitor,
    voiceToken,
  } = resolveChatWidgetMessageState(message);
  const [menuState, setMenuState] = useState<MenuState>({
    open: false,
    x: 0,
    y: 0,
  });
  const [swipeOffset, setSwipeOffset] = useState(0);
  const longPressTimeoutRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const copyText = useMemo(() => {
    if (message.isDeleted) {
      return "Сообщение удалено";
    }

    return getChatMessagePreviewText(message.content) ?? "Системное сообщение";
  }, [message.content, message.isDeleted]);

  useEffect(() => {
    if (!menuState.open) {
      return;
    }

    const handleClose = () => {
      setMenuState((prev) => (prev.open ? { open: false, x: 0, y: 0 } : prev));
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleClose);
    window.addEventListener("scroll", handleClose, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleClose);
      window.removeEventListener("scroll", handleClose, true);
    };
  }, [menuState.open]);

  if (voiceToken) {
    return null;
  }

  const clearLongPress = () => {
    if (longPressTimeoutRef.current) {
      window.clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  const openMenu = (x: number, y: number) => {
    setSwipeOffset(0);
    setMenuState({ open: true, x, y });
  };

  return (
    <>
      <div
        key={message.id}
        ref={(node) => {
          containerRef.current = node;
          setMessageRef(message.id, node);
        }}
        className={`flex animate-in fade-in slide-in-from-bottom-2 duration-300 ${
          isSystem ? "justify-center" : isVisitor ? "justify-end" : "justify-start"
        }`}
        onContextMenu={(event) => {
          if (isSystem) {
            return;
          }

          event.preventDefault();
          openMenu(event.clientX, event.clientY);
        }}
        onTouchStart={(event) => {
          if (isSystem) {
            return;
          }

          const touch = event.touches[0];
          touchStartRef.current = touch
            ? { x: touch.clientX, y: touch.clientY }
            : null;

          clearLongPress();
          longPressTimeoutRef.current = window.setTimeout(() => {
            openMenu(
              getTouchCoordinates(
                event,
                containerRef.current?.getBoundingClientRect(),
              ).x,
              getTouchCoordinates(
                event,
                containerRef.current?.getBoundingClientRect(),
              ).y,
            );
          }, 420);
        }}
        onTouchMove={(event) => {
          const start = touchStartRef.current;
          const touch = event.touches[0];
          if (!start || !touch || !canReply) {
            clearLongPress();
            return;
          }

          const deltaX = touch.clientX - start.x;
          const deltaY = touch.clientY - start.y;
          if (Math.abs(deltaX) > 12 || Math.abs(deltaY) > 12) {
            clearLongPress();
          }

          if (deltaX < 0 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (event.cancelable) {
              event.preventDefault();
            }

            setSwipeOffset(Math.max(deltaX, -84));
          } else if (swipeOffset !== 0) {
            setSwipeOffset(0);
          }
        }}
        onTouchCancel={() => {
          clearLongPress();
          touchStartRef.current = null;
          setSwipeOffset(0);
        }}
        onTouchEnd={() => {
          clearLongPress();
          touchStartRef.current = null;

          if (swipeOffset <= -72 && canReply) {
            onReply(message);
          }

          setSwipeOffset(0);
        }}
      >
        <div
          className="transition-transform duration-200 ease-out"
          style={{
            transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined,
          }}
        >
          <ChatWidgetMessageBody
            isSystem={isSystem}
            isVisitor={isVisitor}
            message={message}
            onJumpToMessage={onJumpToMessage}
          />
        </div>
      </div>

      <ChatMessageContextMenu
        canDelete={canDelete}
        canEdit={canEdit}
        canReply={canReply}
        open={menuState.open}
        x={menuState.x}
        y={menuState.y}
        onClose={() => setMenuState({ open: false, x: 0, y: 0 })}
        onCopy={() => {
          void navigator.clipboard.writeText(copyText);
        }}
        onDelete={() => onDelete(message)}
        onEdit={() => onEdit(message)}
        onReply={() => onReply(message)}
      />
    </>
  );
}
