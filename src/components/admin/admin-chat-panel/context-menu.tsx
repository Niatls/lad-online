import { CornerUpLeft, Pencil, SquareCheck } from "lucide-react";

import type { Message } from "./types";

type AdminChatContextMenuProps = {
  contextMenu: {
    left: number;
    top: number;
    message: Message;
  } | null;
  contextMenuPosition: {
    left: number;
    top: number;
  };
  contextMenuRef: React.RefObject<HTMLDivElement | null>;
  selectedMessageIds: number[];
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onSelect: (messageId: number) => void;
};

export function AdminChatContextMenu({
  contextMenu,
  contextMenuPosition,
  contextMenuRef,
  selectedMessageIds,
  onReply,
  onEdit,
  onSelect,
}: AdminChatContextMenuProps) {
  if (!contextMenu) {
    return null;
  }

  return (
    <div
      ref={contextMenuRef}
      className="absolute z-50 min-w-[180px] rounded-[1.25rem] border border-sage-light/20 bg-white/95 p-2 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.18)] backdrop-blur"
      style={contextMenuPosition}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {!contextMenu.message.isDeleted ? (
        <button
          type="button"
          onClick={() => onReply(contextMenu.message)}
          className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-medium text-forest transition hover:bg-cream/50"
        >
          <CornerUpLeft className="h-4 w-4" />
          Ответить
        </button>
      ) : null}
      {!contextMenu.message.isDeleted && contextMenu.message.sender === "admin" ? (
        <button
          type="button"
          onClick={() => onEdit(contextMenu.message)}
          className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-medium text-forest transition hover:bg-cream/50"
        >
          <Pencil className="h-4 w-4" />
          Редактировать
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => onSelect(contextMenu.message.id)}
        className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-medium text-forest transition hover:bg-cream/50"
      >
        <SquareCheck className="h-4 w-4" />
        {selectedMessageIds.includes(contextMenu.message.id) ? "Снять выбор" : "Выбрать"}
      </button>
    </div>
  );
}
