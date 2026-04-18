"use client";

import { createPortal } from "react-dom";
import { Copy, CornerUpLeft, Pencil, Trash2 } from "lucide-react";

type ChatMessageContextMenuProps = {
  canDelete: boolean;
  canEdit: boolean;
  canReply: boolean;
  open: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onReply: () => void;
};

function getClampedPosition(x: number, y: number) {
  if (typeof window === "undefined") {
    return { x, y };
  }

  return {
    x: Math.min(Math.max(12, x), window.innerWidth - 208),
    y: Math.min(Math.max(12, y), window.innerHeight - 240),
  };
}

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-forest transition hover:bg-sage-light/10"
      onClick={onClick}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-light/12 text-sage-dark">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

export function ChatMessageContextMenu({
  canDelete,
  canEdit,
  canReply,
  open,
  x,
  y,
  onClose,
  onCopy,
  onDelete,
  onEdit,
  onReply,
}: ChatMessageContextMenuProps) {
  if (!open || typeof document === "undefined") {
    return null;
  }

  const position = getClampedPosition(x, y);

  return createPortal(
    <div
      data-allow-native-context-menu="true"
      data-chat-message-menu="true"
      className="fixed inset-0 z-[1200]"
      onMouseDown={onClose}
      onTouchStart={onClose}
    >
      <div
        className="absolute min-w-[184px] overflow-hidden rounded-[1.35rem] border border-sage-light/25 bg-white shadow-[0_24px_55px_rgba(45,74,62,0.22)]"
        style={{ left: position.x, top: position.y }}
        onMouseDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        {canReply ? (
          <MenuItem
            icon={<CornerUpLeft className="h-4 w-4" />}
            label="Ответить"
            onClick={() => {
              onReply();
              onClose();
            }}
          />
        ) : null}
        {canEdit ? (
          <MenuItem
            icon={<Pencil className="h-4 w-4" />}
            label="Изменить"
            onClick={() => {
              onEdit();
              onClose();
            }}
          />
        ) : null}
        <MenuItem
          icon={<Copy className="h-4 w-4" />}
          label="Копировать"
          onClick={() => {
            onCopy();
            onClose();
          }}
        />
        {canDelete ? (
          <MenuItem
            icon={<Trash2 className="h-4 w-4" />}
            label="Удалить"
            onClick={() => {
              onDelete();
              onClose();
            }}
          />
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
