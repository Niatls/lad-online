import type { HomePageContent, ManagedContentPage } from "@/lib/content";

export type AdminContentEditorProps = {
  homeContent: HomePageContent;
  pages: ManagedContentPage[];
  onSaved?: () => void;
};

export type SavedPageResponse = Omit<ManagedContentPage, "updatedAt"> & {
  updatedAt: string | null;
};
