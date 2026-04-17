import { X } from "lucide-react";

import type { Message } from "@/components/chat/chat-widget/types";

type ChatWidgetComposerReplyBannerProps = {
  replyTarget: Message;
  getMessagePreview: (message: Message) => string;
  onClearReply: () => void;
};

export function ChatWidgetComposerReplyBanner({
  replyTarget,
  getMessagePreview,
  onClearReply,
}: ChatWidgetComposerReplyBannerProps) {
  return (
    <div className="mb-3 rounded-[1.25rem] border border-sage-light/20 bg-cream/35 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest/35">РћС‚РІРµС‚</p>
          <p className="mt-1 text-xs font-bold text-forest">
            {replyTarget.sender === "visitor" ? "Р’С‹" : replyTarget.sender === "admin" ? "РџРѕРґРґРµСЂР¶РєР°" : "РЎРёСЃС‚РµРјР°"}
          </p>
          <p className="mt-1 truncate text-xs text-forest/55">{getMessagePreview(replyTarget)}</p>
        </div>
        <button type="button" onClick={onClearReply} className="rounded-full p-1 text-forest/35 hover:bg-white/70 hover:text-forest">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
