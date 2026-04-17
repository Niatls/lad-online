import { ChevronLeft, ChevronRight, GripHorizontal, Minus, Plus, Trash2 } from "lucide-react";

type ConstructorElementToolbarProps = {
  colStart: number;
  colSpan: number;
  gridCols: number;
  onMoveStart: (event: React.MouseEvent) => void;
  onAdjustColStart: (delta: number) => void;
  onAdjustColSpan: (delta: number) => void;
  onDelete: (event: React.MouseEvent) => void;
};

export function ConstructorElementToolbar({
  colStart,
  colSpan,
  gridCols,
  onMoveStart,
  onAdjustColStart,
  onAdjustColSpan,
  onDelete,
}: ConstructorElementToolbarProps) {
  return (
    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 opacity-0 group-hover/el:opacity-100 transition-opacity bg-white/95 shadow-lg rounded-full px-1 py-0.5 border border-sage-light/40 backdrop-blur-sm whitespace-nowrap">
      <button
        type="button"
        className="p-1 hover:bg-sage-light/20 rounded-full cursor-move text-forest/50"
        onMouseDown={onMoveStart}
      >
        <GripHorizontal className="h-3 w-3" />
      </button>

      <div className="w-px h-3 bg-sage-light/30" />

      <button
        type="button"
        onClick={() => onAdjustColStart(-1)}
        disabled={colStart <= 1}
        className="p-0.5 hover:bg-sage-light/20 rounded text-forest/50 disabled:opacity-20"
      >
        <ChevronLeft className="h-3 w-3" />
      </button>
      <span className="text-[9px] font-mono text-forest/40 min-w-[18px] text-center select-none">{colStart}</span>
      <button
        type="button"
        onClick={() => onAdjustColStart(1)}
        disabled={colStart + colSpan > gridCols}
        className="p-0.5 hover:bg-sage-light/20 rounded text-forest/50 disabled:opacity-20"
      >
        <ChevronRight className="h-3 w-3" />
      </button>

      <div className="w-px h-3 bg-sage-light/30" />

      <button
        type="button"
        onClick={() => onAdjustColSpan(-1)}
        disabled={colSpan <= 1}
        className="p-0.5 hover:bg-sage-light/20 rounded text-forest/50 disabled:opacity-20"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="text-[9px] font-mono text-forest/40 min-w-[18px] text-center select-none">{colSpan}</span>
      <button
        type="button"
        onClick={() => onAdjustColSpan(1)}
        disabled={colStart + colSpan > gridCols}
        className="p-0.5 hover:bg-sage-light/20 rounded text-forest/50 disabled:opacity-20"
      >
        <Plus className="h-3 w-3" />
      </button>

      <div className="w-px h-3 bg-sage-light/30" />

      <button
        type="button"
        onClick={onDelete}
        className="p-1 hover:bg-red-50 rounded-full text-red-400 hover:text-red-500"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}
