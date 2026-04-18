import { MessageCircle } from "lucide-react";

export function AdminChatEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-12 text-center animate-in fade-in duration-700">
      <div className="mb-8 flex h-24 w-24 rotate-12 items-center justify-center rounded-[2.5rem] bg-sage/5">
        <MessageCircle className="h-12 w-12 text-sage/20" />
      </div>
      <h3 className="mb-2 text-2xl font-bold tracking-tight text-forest">
        Центр сообщений
      </h3>
      <p className="max-w-xs text-sm font-medium leading-relaxed text-forest/40">
        Выберите диалог из списка слева, чтобы начать общение с посетителем в
        режиме реального времени.
      </p>
    </div>
  );
}
