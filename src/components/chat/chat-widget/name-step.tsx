import { User } from "lucide-react";

import { ChatWidgetNameStepForm } from "@/components/chat/chat-widget/name-step-form";

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
        <h4 className="mb-2 text-xl font-bold text-forest">Как к вам обращаться?</h4>
        <p className="max-w-[260px] text-sm leading-relaxed text-forest/50">
          Укажите имя или псевдоним. Так специалист сможет обратиться к вам в чате и при голосовом общении.
        </p>
      </div>
      <ChatWidgetNameStepForm
        pendingVisitorName={pendingVisitorName}
        loading={loading}
        onChangeName={onChangeName}
        onSaveName={onSaveName}
      />
    </div>
  );
}
