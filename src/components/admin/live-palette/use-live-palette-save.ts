"use client";

import { useState } from "react";

import { useLiveEditor } from "@/components/admin/live-editor-context";

export type SaveStatus = "idle" | "success" | "error";

export function useLivePaletteSave({ onSaved }: { onSaved?: () => void }) {
  const { homeContent } = useLiveEditor();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const handleSave = async () => {
    if (!homeContent) return;
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const response = await fetch("/api/admin/content/home", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(homeContent),
      });

      if (response.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        onSaved?.();
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    handleSave,
    isSaving,
    saveStatus,
  };
}
