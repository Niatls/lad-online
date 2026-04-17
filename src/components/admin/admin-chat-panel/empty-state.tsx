import { MessageCircle } from "lucide-react";

export function AdminChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-700">
      <div className="w-24 h-24 rounded-[2.5rem] bg-sage/5 flex items-center justify-center mb-8 rotate-12">
        <MessageCircle className="h-12 w-12 text-sage/20" />
      </div>
      <h3 className="text-forest font-bold text-2xl mb-2 tracking-tight">Центр сообщений</h3>
      <p className="text-forest/40 text-sm max-w-xs leading-relaxed font-medium">
        Выберите диалог из списка слева, чтобы начать общение с посетителем в режиме реального времени.
      </p>
    </div>
  );
}
