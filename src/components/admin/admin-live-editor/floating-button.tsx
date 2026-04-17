import { Pencil } from "lucide-react";

type LiveEditorFloatingButtonProps = {
  onClick: () => void;
};

export function LiveEditorFloatingButton({
  onClick,
}: LiveEditorFloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 rounded-full bg-forest p-4 text-white shadow-xl transition-all hover:scale-105 hover:bg-forest/90 active:scale-95"
    >
      <Pencil className="h-5 w-5" />
      <span className="hidden font-medium sm:inline">
        {"\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c"}
      </span>
    </button>
  );
}
