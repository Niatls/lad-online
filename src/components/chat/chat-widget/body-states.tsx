import { Loader2, MessageCircle, User, X } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center h-full gap-5 px-4 text-center">
      <div className="w-20 h-20 rounded-[2rem] bg-sage/10 flex items-center justify-center">
        <User className="h-10 w-10 text-sage" />
      </div>
      <div>
        <h4 className="text-forest font-bold text-xl mb-2">Как к вам обращаться?</h4>
        <p className="text-forest/50 text-sm leading-relaxed max-w-[260px]">
          Укажите имя или псевдоним. Так специалист сможет обратиться к вам в чате и при голосовом общении.
        </p>
      </div>
      <div className="w-full max-w-[280px] space-y-3">
        <input
          value={pendingVisitorName}
          onChange={(event) => onChangeName(event.target.value)}
          placeholder="Имя или псевдоним"
          className="w-full rounded-2xl border border-sage-light/20 bg-white px-4 py-3 text-sm text-forest outline-none focus:border-forest/30"
        />
        <button
          type="button"
          onClick={onSaveName}
          disabled={!pendingVisitorName.trim() || loading}
          className="w-full rounded-2xl bg-forest px-4 py-3 text-sm font-bold text-white shadow-lg shadow-forest/15 transition hover:bg-forest/90 disabled:opacity-50"
        >
          {loading ? "Подключаем..." : "Продолжить"}
        </button>
      </div>
    </div>
  );
}

export function ChatWidgetLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-sage" />
      <p className="text-forest/40 text-sm font-medium">Подключаемся...</p>
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
    <div className="text-center py-12 px-6 flex flex-col items-center justify-center h-full">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <X className="h-8 w-8 text-red-500/50" />
      </div>
      <p className="text-forest/70 text-sm font-medium mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 rounded-xl bg-forest text-white text-sm font-bold shadow-lg hover:bg-forest/90 transition-all flex items-center gap-2 mx-auto active:scale-95"
      >
        <Loader2 className={`h-3.5 w-3.5 animate-spin ${loading ? "block" : "hidden"}`} />
        Попробовать снова
      </button>
    </div>
  );
}

type ChatWidgetEmptyMessagesProps = {
  visitorName: string;
};

export function ChatWidgetEmptyMessages({ visitorName }: ChatWidgetEmptyMessagesProps) {
  return (
    <div className="text-center py-12 px-6 flex flex-col items-center justify-center h-full">
      <div className="w-20 h-20 rounded-[2rem] bg-sage/10 flex items-center justify-center mb-6 rotate-12 transition-transform hover:rotate-0 duration-500">
        <MessageCircle className="h-10 w-10 text-sage" />
      </div>
      <h4 className="text-forest font-bold text-xl mb-2">Привет, {visitorName || "друг"}!</h4>
      <p className="text-forest/50 text-sm leading-relaxed max-w-[240px]">
        Мы всегда на связи. Опишите вашу ситуацию, и наш специалист ответит вам в ближайшее время.
      </p>
    </div>
  );
}
