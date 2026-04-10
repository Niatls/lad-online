"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminContentEditor } from "@/components/admin/admin-content-editor";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { HomePageContent, ManagedContentPage } from "@/lib/content";

type AdminLiveEditorProps = {
  children: React.ReactNode;
  homeContent: HomePageContent;
  pages: ManagedContentPage[];
};

export function AdminLiveEditor({
  children,
  homeContent,
  pages,
}: AdminLiveEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSaved = () => {
    // Soft-refresh the page to fetch the new content
    router.refresh();
  };

  return (
    <>
      {children}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 rounded-full shadow-xl bg-forest p-4 text-white hover:bg-forest/90 hover:scale-105 active:scale-95 transition-all"
            aria-label="Редактировать сайт"
          >
            <Pencil className="h-5 w-5" />
            <span className="hidden sm:inline font-medium">Редактировать</span>
          </button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[70vw] md:max-w-[60vw] lg:max-w-[50vw] xl:max-w-[800px] overflow-y-auto p-0 sm:p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Редактор сайта</SheetTitle>
          </SheetHeader>
          <div className="bg-cream min-h-screen p-4 sm:p-6 lg:p-8">
            <AdminContentEditor
              homeContent={homeContent}
              pages={pages}
              onSaved={handleSaved}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
