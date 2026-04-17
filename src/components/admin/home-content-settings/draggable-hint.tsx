import { GripVertical } from "lucide-react";

export function DraggableHint() {
  return (
    <div className="mb-3 flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-medium text-forest/55">
      <GripVertical className="h-4 w-4" />
      {"\u041f\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0434\u043b\u044f \u0441\u043c\u0435\u043d\u044b \u043f\u043e\u0440\u044f\u0434\u043a\u0430"}
    </div>
  );
}
