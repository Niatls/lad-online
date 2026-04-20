import { Archive, Download, Loader2, Trash2 } from "lucide-react";

type AdminChatSessionContextMenuProps = {
  contextMenu: {
    left: number;
    top: number;
  } | null;
  contextMenuRef: React.RefObject<HTMLDivElement | null>;
  archivingSession: boolean;
  deletingSession: boolean;
  downloadingSession: boolean;
  onDownload: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

export function AdminChatSessionContextMenu({
  contextMenu,
  contextMenuRef,
  archivingSession,
  deletingSession,
  downloadingSession,
  onDownload,
  onArchive,
  onDelete,
}: AdminChatSessionContextMenuProps) {
  if (!contextMenu) {
    return null;
  }

  return (
    <div
      ref={contextMenuRef}
      className="absolute z-50 min-w-[190px] rounded-[1.25rem] border border-sage-light/20 bg-white/95 p-2 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.18)] backdrop-blur"
      style={{ left: contextMenu.left, top: contextMenu.top }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={onDownload}
        disabled={downloadingSession}
        className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-medium text-forest transition hover:bg-cream/50 disabled:opacity-50"
      >
        {downloadingSession ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Скачать
      </button>
      <button
        type="button"
        onClick={onArchive}
        disabled={archivingSession}
        className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-medium text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
      >
        {archivingSession ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
        Скрыть
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={deletingSession}
        className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        {deletingSession ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Удалить навсегда
      </button>
    </div>
  );
}
