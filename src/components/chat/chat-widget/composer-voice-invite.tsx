import { Phone } from "lucide-react";

import type { VoiceInvite } from "@/components/chat/chat-widget/types";

type ChatWidgetComposerVoiceInviteProps = {
  availableVoiceInvite: VoiceInvite;
  voiceExpiresIn: string | null;
  onJoinVoice: (token: string) => void;
};

export function ChatWidgetComposerVoiceInvite({
  availableVoiceInvite,
  voiceExpiresIn,
  onJoinVoice,
}: ChatWidgetComposerVoiceInviteProps) {
  return (
    <button
      type="button"
      onClick={() => onJoinVoice(availableVoiceInvite.token)}
      className="mb-3 w-full rounded-[1.5rem] border border-sage-light/20 bg-forest px-4 py-3 text-left text-white shadow-lg shadow-forest/15 transition hover:bg-forest/90"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Р“РѕР»РѕСЃРѕРІРѕРµ РѕР±С‰РµРЅРёРµ</p>
            <p className="text-[11px] text-white/70">РљРЅРѕРїРєР° РґРѕСЃС‚СѓРїРЅР° РµС‰С‘ {voiceExpiresIn}</p>
          </div>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">voice</span>
      </div>
    </button>
  );
}
