import { X } from "lucide-react";

import type { Message, Session } from "@/components/admin/admin-chat-panel/types";

type ComposerReplyPreviewProps = {
  getMessagePreview: (message: Message) => string;
  replyTarget: Message | null;
  selectedSession: Session | null;
  onClearReply: () => void;
};

export function ComposerReplyPreview({
  getMessagePreview,
  replyTarget,
  selectedSession,
  onClearReply,
}: ComposerReplyPreviewProps) {
  if (!replyTarget) {
    return null;
  }

  const senderLabel =
    replyTarget.sender === "admin"
      ? "\u0412\u044b"
      : replyTarget.sender === "visitor"
        ? selectedSession?.visitorName || "\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c"
        : "\u0421\u0438\u0441\u0442\u0435\u043c\u0430";

  return (
    <div className="mb-4 rounded-[1.5rem] border border-sage-light/20 bg-cream/35 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest/35">
            {"\u041e\u0442\u0432\u0435\u0442"}
          </p>
          <p className="mt-1 text-xs font-bold text-forest">{senderLabel}</p>
          <p className="mt-1 truncate text-xs text-forest/55">
            {getMessagePreview(replyTarget)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClearReply}
          className="rounded-full p-1 text-forest/35 hover:bg-white/70 hover:text-forest"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
