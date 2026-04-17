"use client";

import { useEffect, useId, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import { useRouter } from "next/navigation";

import { LiveEditorCanvasShell } from "@/components/admin/admin-live-editor/canvas-shell";
import { liveEditorCollisionDetection } from "@/components/admin/admin-live-editor/collision-detection";
import { LiveEditorFloatingButton } from "@/components/admin/admin-live-editor/floating-button";
import { LiveEditorSidebar } from "@/components/admin/admin-live-editor/sidebar";
import type { LiveEditorInnerProps } from "@/components/admin/admin-live-editor/types";
import { useLiveEditorDnd } from "@/components/admin/admin-live-editor/use-live-editor-dnd";
import { LiveEditorProvider } from "@/components/admin/live-editor-context";
import type { HomePageContent, ManagedContentPage } from "@/lib/content";

function LiveEditorInner({ children, onSaved }: LiveEditorInnerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const id = useId();
  const { handleDragEnd, sensors } = useLiveEditorDnd();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <LiveEditorCanvasShell isSidebarOpen={isOpen}>
        {children}
      </LiveEditorCanvasShell>
    );
  }

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={liveEditorCollisionDetection}
      onDragEnd={handleDragEnd}
    >
      <LiveEditorCanvasShell isSidebarOpen={isOpen}>
        {children}
      </LiveEditorCanvasShell>

      {!isOpen ? (
        <LiveEditorFloatingButton onClick={() => setIsOpen(true)} />
      ) : null}

      <LiveEditorSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSaved={onSaved}
      />
    </DndContext>
  );
}

export function AdminLiveEditor({
  children,
  homeContent,
}: {
  children: React.ReactNode;
  homeContent: HomePageContent;
  pages: ManagedContentPage[];
}) {
  const router = useRouter();

  return (
    <LiveEditorProvider initialContent={homeContent} isEditMode={true}>
      <LiveEditorInner onSaved={() => router.refresh()}>
        {children}
      </LiveEditorInner>
    </LiveEditorProvider>
  );
}