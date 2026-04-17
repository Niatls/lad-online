import { MessageCircle, User } from "lucide-react";

import { ChatWidgetErrorState } from "@/components/chat/chat-widget/error-state";
import { ChatWidgetLoadingState } from "@/components/chat/chat-widget/loading-state";

type ChatWidgetNameStepProps = {
  pendingVisitorName: string;
  loading: boolean;
  onChangeName: (value: string) => void;
  onSaveName: () => void;
};

export function ChatWidgetNameStep({
  pendingVisitorName,
  loading,
  onChangeName,
  onSaveName,
}: ChatWidgetNameStepProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-sage/10">
        <User className="h-10 w-10 text-sage" />
      </div>
      <div>
        <h4 className="mb-2 text-xl font-bold text-forest">Р С™Р В°Р С” Р С” Р Р†Р В°Р С Р С•Р В±РЎР‚Р В°РЎвЂ°Р В°РЎвЂљРЎРЉРЎРѓРЎРЏ?</h4>
        <p className="max-w-[260px] text-sm leading-relaxed text-forest/50">
          Р Р€Р С”Р В°Р В¶Р С‘РЎвЂљР Вµ Р С‘Р СРЎРЏ Р С‘Р В»Р С‘ Р С—РЎРѓР ВµР Р†Р Т‘Р С•Р Р…Р С‘Р С. Р СћР В°Р С” РЎРѓР С—Р ВµРЎвЂ Р С‘Р В°Р В»Р С‘РЎРѓРЎвЂљ РЎРѓР СР С•Р В¶Р ВµРЎвЂљ Р С•Р В±РЎР‚Р В°РЎвЂљР С‘РЎвЂљРЎРЉРЎРѓРЎРЏ Р С” Р Р†Р В°Р С Р Р† РЎвЂЎР В°РЎвЂљР Вµ Р С‘ Р С—РЎР‚Р С‘ Р С–Р С•Р В»Р С•РЎРѓР С•Р Р†Р С•Р С Р С•Р В±РЎвЂ°Р ВµР Р…Р С‘Р С‘.
        </p>
      </div>
      <div className="w-full max-w-[280px] space-y-3">
        <input
          value={pendingVisitorName}
          onChange={(event) => onChangeName(event.target.value)}
          placeholder="Р ВР СРЎРЏ Р С‘Р В»Р С‘ Р С—РЎРѓР ВµР Р†Р Т‘Р С•Р Р…Р С‘Р С"
          className="w-full rounded-2xl border border-sage-light/20 bg-white px-4 py-3 text-sm text-forest outline-none focus:border-forest/30"
        />
        <button
          type="button"
          onClick={onSaveName}
          disabled={!pendingVisitorName.trim() || loading}
          className="w-full rounded-2xl bg-forest px-4 py-3 text-sm font-bold text-white shadow-lg shadow-forest/15 transition hover:bg-forest/90 disabled:opacity-50"
        >
          {loading ? "Р СџР С•Р Т‘Р С”Р В»РЎР‹РЎвЂЎР В°Р ВµР С..." : "Р СџРЎР‚Р С•Р Т‘Р С•Р В»Р В¶Р С‘РЎвЂљРЎРЉ"}
        </button>
      </div>
    </div>
  );
}

type ChatWidgetEmptyMessagesProps = {
  visitorName: string;
};

export function ChatWidgetEmptyMessages({ visitorName }: ChatWidgetEmptyMessagesProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-6 flex h-20 w-20 rotate-12 items-center justify-center rounded-[2rem] bg-sage/10 transition-transform duration-500 hover:rotate-0">
        <MessageCircle className="h-10 w-10 text-sage" />
      </div>
      <h4 className="mb-2 text-xl font-bold text-forest">Р СџРЎР‚Р С‘Р Р†Р ВµРЎвЂљ, {visitorName || "Р Т‘РЎР‚РЎС“Р С–"}!</h4>
      <p className="max-w-[240px] text-sm leading-relaxed text-forest/50">
        Р СљРЎвЂ№ Р Р†РЎРѓР ВµР С–Р Т‘Р В° Р Р…Р В° РЎРѓР Р†РЎРЏР В·Р С‘. Р С›Р С—Р С‘РЎв‚¬Р С‘РЎвЂљР Вµ Р Р†Р В°РЎв‚¬РЎС“ РЎРѓР С‘РЎвЂљРЎС“Р В°РЎвЂ Р С‘РЎР‹, Р С‘ Р Р…Р В°РЎв‚¬ РЎРѓР С—Р ВµРЎвЂ Р С‘Р В°Р В»Р С‘РЎРѓРЎвЂљ Р С•РЎвЂљР Р†Р ВµРЎвЂљР С‘РЎвЂљ Р Р†Р В°Р С Р Р† Р В±Р В»Р С‘Р В¶Р В°Р в„–РЎв‚¬Р ВµР Вµ Р Р†РЎР‚Р ВµР СРЎРЏ.
      </p>
    </div>
  );
}

export { ChatWidgetErrorState, ChatWidgetLoadingState };
