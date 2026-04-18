import { CornerUpLeft, Pencil } from "lucide-react";

import type { Message } from "@/components/chat/chat-widget/types";

type ChatWidgetMessageActionsProps = {
  canEdit: boolean;
  message: Message;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
};

export function ChatWidgetMessageActions({
  canEdit,
  message,
  onReply,
  onEdit,
}: ChatWidgetMessageActionsProps) {
  return (
    <div className="mb-1 ml-2 mr-2 flex self-end flex-col gap-2">
      {canEdit ? (
        <button
          type="button"
          onClick={() => onEdit(message)}
          className="rounded-full border border-sage-light/20 bg-white/90 p-2 text-forest/45 transition hover:bg-white hover:text-forest"
          aria-label="Редактировать"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => onReply(message)}
        className="rounded-full border border-sage-light/20 bg-white/90 p-2 text-forest/45 transition hover:bg-white hover:text-forest"
        aria-label="Ответить"
      >
        <CornerUpLeft className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
