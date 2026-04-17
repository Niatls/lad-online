import { HomePageClient } from "@/components/home/home-page-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { HomePageContent, ManagedContentPage } from "@/lib/content";

type AdminContentPreviewDialogProps = {
  articles: ManagedContentPage[];
  homeContent: HomePageContent;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function AdminContentPreviewDialog({
  articles,
  homeContent,
  onOpenChange,
  open,
}: AdminContentPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="h-screen w-screen max-w-none overflow-hidden rounded-none border-0 p-0 sm:max-w-none"
      >
        <DialogHeader className="border-b border-sage-light/20 px-6 py-4">
          <DialogTitle>
            {"\u041f\u0440\u0435\u0434\u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u0433\u043b\u0430\u0432\u043d\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b"}
          </DialogTitle>
          <DialogDescription>
            {
              "\u041d\u0438\u0436\u0435 \u043e\u0442\u043e\u0431\u0440\u0430\u0436\u0430\u0435\u0442\u0441\u044f \u0442\u0435\u043a\u0443\u0449\u0430\u044f \u0432\u0435\u0440\u0441\u0438\u044f \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b \u0438\u0437 \u0440\u0435\u0434\u0430\u043a\u0442\u043e\u0440\u0430 \u0434\u043e \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="h-full overflow-y-auto bg-cream">
          <HomePageClient
            articles={articles}
            homeContent={homeContent}
            previewMode
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
