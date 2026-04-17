import type { Dispatch, SetStateAction } from "react";
import { FilePenLine, LayoutPanelTop, Settings2 } from "lucide-react";

import { ContentPagesSection } from "@/components/admin/content-pages-section";
import { emptyPageForm, type PageFormState } from "@/components/admin/editor-types";
import { HomeContentSection } from "@/components/admin/home-content-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { HomePageContent, ManagedContentPage } from "@/lib/content";

type AdminContentEditorTabsProps = {
  homeForm: HomePageContent;
  isSavingHome: boolean;
  isSavingPage: boolean;
  onDeletePage: () => Promise<void>;
  onOpenPreview: () => void;
  onSaveHome: () => Promise<void>;
  onSavePage: () => Promise<void>;
  pageForm: PageFormState;
  pages: ManagedContentPage[];
  setHomeField: <K extends keyof HomePageContent>(
    key: K,
    value: HomePageContent[K]
  ) => void;
  setPageForm: Dispatch<SetStateAction<PageFormState>>;
};

export function AdminContentEditorTabs({
  homeForm,
  isSavingHome,
  isSavingPage,
  onDeletePage,
  onOpenPreview,
  onSaveHome,
  onSavePage,
  pageForm,
  pages,
  setHomeField,
  setPageForm,
}: AdminContentEditorTabsProps) {
  return (
    <Tabs defaultValue="home" className="space-y-6">
      <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-2xl bg-white/90 p-2">
        <TabsTrigger
          value="home"
          className="flex-none rounded-xl px-4 py-2 data-[state=active]:bg-sage data-[state=active]:text-white"
        >
          <LayoutPanelTop className="h-4 w-4" />
          {"\u0413\u043b\u0430\u0432\u043d\u0430\u044f"}
        </TabsTrigger>
        <TabsTrigger
          value="settings"
          className="flex-none rounded-xl px-4 py-2 data-[state=active]:bg-sage data-[state=active]:text-white"
        >
          <Settings2 className="h-4 w-4" />
          {"\u041d\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044f \u0438 \u0443\u0441\u043b\u0443\u0433\u0438"}
        </TabsTrigger>
        <TabsTrigger
          value="pages"
          className="flex-none rounded-xl px-4 py-2 data-[state=active]:bg-sage data-[state=active]:text-white"
        >
          <FilePenLine className="h-4 w-4" />
          {"\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044b"}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="home">
        <HomeContentSection
          homeForm={homeForm}
          isSavingHome={isSavingHome}
          mode="main"
          onOpenPreview={onOpenPreview}
          onSave={onSaveHome}
          setHomeField={setHomeField}
        />
      </TabsContent>

      <TabsContent value="settings">
        <HomeContentSection
          homeForm={homeForm}
          isSavingHome={isSavingHome}
          mode="settings"
          onOpenPreview={onOpenPreview}
          onSave={onSaveHome}
          setHomeField={setHomeField}
        />
      </TabsContent>

      <TabsContent value="pages">
        <ContentPagesSection
          isSavingPage={isSavingPage}
          onDelete={onDeletePage}
          onReset={() => setPageForm(emptyPageForm)}
          onSave={onSavePage}
          pageForm={pageForm}
          pages={pages}
          setPageForm={setPageForm}
        />
      </TabsContent>
    </Tabs>
  );
}
