import type { ReactNode } from "react";

type LiveEditorCanvasShellProps = {
  children: ReactNode;
  isSidebarOpen: boolean;
};

export function LiveEditorCanvasShell({
  children,
  isSidebarOpen,
}: LiveEditorCanvasShellProps) {
  return (
    <div className={`transition-all duration-300 ${isSidebarOpen ? "pr-80" : ""}`}>
      {children}
    </div>
  );
}
