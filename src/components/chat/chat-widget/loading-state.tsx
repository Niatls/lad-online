import { Loader2 } from "lucide-react";

export function ChatWidgetLoadingState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-sage" />
      <p className="text-sm font-medium text-forest/40">Подключаемся...</p>
    </div>
  );
}
