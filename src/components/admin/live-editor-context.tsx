"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { HomePageContent } from "@/lib/content";

type LiveEditorContextType = {
  homeContent: HomePageContent | null;
  setHomeContent: (content: HomePageContent) => void;
  updateSection: (id: string, updates: any) => void;
  isEditMode: boolean;
};

const LiveEditorContext = createContext<LiveEditorContextType | undefined>(undefined);

export function LiveEditorProvider({
  children,
  initialContent,
  isEditMode = false,
}: {
  children: ReactNode;
  initialContent?: HomePageContent;
  isEditMode?: boolean;
}) {
  const [homeContent, setHomeContent] = useState<HomePageContent | null>(initialContent || null);

  const updateSection = (id: string, updates: any) => {
    setHomeContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((sec) => (sec.id === id ? { ...sec, ...updates } : sec)),
      };
    });
  };

  return (
    <LiveEditorContext.Provider value={{ homeContent, setHomeContent, updateSection, isEditMode }}>
      {children}
    </LiveEditorContext.Provider>
  );
}

export function useLiveEditor() {
  const context = useContext(LiveEditorContext);
  // We return a safe default if not wrapped in provider so components can work normally outside of admin
  if (!context) {
    return {
      homeContent: null,
      setHomeContent: () => {},
      updateSection: () => {},
      isEditMode: false,
    };
  }
  return context;
}
