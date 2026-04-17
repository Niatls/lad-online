type ConstructorResizeHandlesProps = {
  onResizeLeftStart: (event: React.MouseEvent) => void;
  onResizeRightStart: (event: React.MouseEvent) => void;
  onResizeBottomStart: (event: React.MouseEvent) => void;
  resizeLeftTitle: string;
  resizeRightTitle: string;
  resizeBottomTitle: string;
};

export function ConstructorResizeHandles({
  onResizeLeftStart,
  onResizeRightStart,
  onResizeBottomStart,
  resizeLeftTitle,
  resizeRightTitle,
  resizeBottomTitle,
}: ConstructorResizeHandlesProps) {
  return (
    <>
      <div
        onMouseDown={onResizeLeftStart}
        className="absolute top-0 -left-1 w-2 h-full cursor-col-resize z-40 group-hover/el:bg-sage/20 rounded-l-xl transition-colors"
        title={resizeLeftTitle}
      />
      <div
        onMouseDown={onResizeRightStart}
        className="absolute top-0 -right-1 w-2 h-full cursor-col-resize z-40 group-hover/el:bg-sage/20 rounded-r-xl transition-colors"
        title={resizeRightTitle}
      />
      <div
        onMouseDown={onResizeBottomStart}
        className="absolute -bottom-1 left-0 h-2 w-full cursor-row-resize z-40 group-hover/el:bg-sage/20 rounded-b-xl transition-colors"
        title={resizeBottomTitle}
      />
    </>
  );
}
