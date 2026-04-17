import { Loader2, MessageCircle, User, X } from "lucide-react";

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
        <h4 className="mb-2 text-xl font-bold text-forest">РљР°Рє Рє РІР°Рј РѕР±СЂР°С‰Р°С‚СЊСЃСЏ?</h4>
        <p className="max-w-[260px] text-sm leading-relaxed text-forest/50">
          РЈРєР°Р¶РёС‚Рµ РёРјСЏ РёР»Рё РїСЃРµРІРґРѕРЅРёРј. РўР°Рє СЃРїРµС†РёР°Р»РёСЃС‚ СЃРјРѕР¶РµС‚ РѕР±СЂР°С‚РёС‚СЊСЃСЏ Рє РІР°Рј РІ С‡Р°С‚Рµ Рё РїСЂРё РіРѕР»РѕСЃРѕРІРѕРј РѕР±С‰РµРЅРёРё.
        </p>
      </div>
      <div className="w-full max-w-[280px] space-y-3">
        <input
          value={pendingVisitorName}
          onChange={(event) => onChangeName(event.target.value)}
          placeholder="РРјСЏ РёР»Рё РїСЃРµРІРґРѕРЅРёРј"
          className="w-full rounded-2xl border border-sage-light/20 bg-white px-4 py-3 text-sm text-forest outline-none focus:border-forest/30"
        />
        <button
          type="button"
          onClick={onSaveName}
          disabled={!pendingVisitorName.trim() || loading}
          className="w-full rounded-2xl bg-forest px-4 py-3 text-sm font-bold text-white shadow-lg shadow-forest/15 transition hover:bg-forest/90 disabled:opacity-50"
        >
          {loading ? "РџРѕРґРєР»СЋС‡Р°РµРј..." : "РџСЂРѕРґРѕР»Р¶РёС‚СЊ"}
        </button>
      </div>
    </div>
  );
}

type ChatWidgetErrorStateProps = {
  error: string;
  loading: boolean;
  onRetry: () => void;
};

export function ChatWidgetErrorState({ error, loading, onRetry }: ChatWidgetErrorStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <X className="h-8 w-8 text-red-500/50" />
      </div>
      <p className="mb-4 text-sm font-medium text-forest/70">{error}</p>
      <button
        onClick={onRetry}
        className="mx-auto flex items-center gap-2 rounded-xl bg-forest px-6 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-forest/90 active:scale-95"
      >
        <Loader2 className={`h-3.5 w-3.5 animate-spin ${loading ? "block" : "hidden"}`} />
        РџРѕРїСЂРѕР±РѕРІР°С‚СЊ СЃРЅРѕРІР°
      </button>
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
      <h4 className="mb-2 text-xl font-bold text-forest">РџСЂРёРІРµС‚, {visitorName || "РґСЂСѓРі"}!</h4>
      <p className="max-w-[240px] text-sm leading-relaxed text-forest/50">
        РњС‹ РІСЃРµРіРґР° РЅР° СЃРІСЏР·Рё. РћРїРёС€РёС‚Рµ РІР°С€Сѓ СЃРёС‚СѓР°С†РёСЋ, Рё РЅР°С€ СЃРїРµС†РёР°Р»РёСЃС‚ РѕС‚РІРµС‚РёС‚ РІР°Рј РІ Р±Р»РёР¶Р°Р№С€РµРµ РІСЂРµРјСЏ.
      </p>
    </div>
  );
}

export { ChatWidgetLoadingState };
