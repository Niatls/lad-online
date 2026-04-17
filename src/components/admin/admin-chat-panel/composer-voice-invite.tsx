import { Loader2, Phone } from "lucide-react";

type ComposerVoiceInviteProps = {
  creatingVoiceToken: boolean;
  onGenerateVoiceToken: () => void;
};

export function ComposerVoiceInvite({
  creatingVoiceToken,
  onGenerateVoiceToken,
}: ComposerVoiceInviteProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.5rem] border border-sage-light/15 bg-cream/35 px-4 py-3">
      <div>
        <p className="text-sm font-bold text-forest">
          {"Voice-\u0440\u0435\u0436\u0438\u043c"}
        </p>
        <p className="text-xs text-forest/50">
          {
            "\u0417\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u0435 \u0433\u043e\u043b\u043e\u0441\u043e\u0432\u043e\u0435 \u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u0434\u043b\u044f \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u043e\u0433\u043e \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f. \u041a\u043d\u043e\u043f\u043a\u0430 \u0443 \u043a\u043b\u0438\u0435\u043d\u0442\u0430 \u0431\u0443\u0434\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430 5 \u043c\u0438\u043d\u0443\u0442."
          }
        </p>
      </div>
      <button
        type="button"
        onClick={onGenerateVoiceToken}
        disabled={creatingVoiceToken}
        className="inline-flex items-center gap-2 rounded-2xl bg-forest px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-forest/15 transition hover:bg-forest/90 disabled:opacity-50"
      >
        {creatingVoiceToken ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Phone className="h-4 w-4" />
        )}
        {"\u041f\u043e\u0437\u0432\u043e\u043d\u0438\u0442\u044c \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044e"}
      </button>
    </div>
  );
}
