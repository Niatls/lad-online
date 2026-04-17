import { Eye, MonitorPlay } from "lucide-react";
import Link from "next/link";

type AdminContentEditorHeaderProps = {
  onOpenPreview: () => void;
  statusMessage: string;
};

export function AdminContentEditorHeader({
  onOpenPreview,
  statusMessage,
}: AdminContentEditorHeaderProps) {
  return (
    <section className="rounded-[2rem] border border-sage-light/30 bg-white/90 p-6 shadow-lg sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-forest">
            {"\u0420\u0435\u0434\u0430\u043a\u0442\u043e\u0440 \u0441\u0430\u0439\u0442\u0430"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-forest/60">
            {
              "\u0423\u043f\u0440\u0430\u0432\u043b\u044f\u0439\u0442\u0435 \u0433\u043b\u0430\u0432\u043d\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435\u0439, \u043c\u0435\u043d\u044e, \u0443\u0441\u043b\u0443\u0433\u0430\u043c\u0438, \u043a\u043e\u043d\u0442\u0430\u043a\u0442\u0430\u043c\u0438 \u0438 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0430\u043c\u0438. \u0414\u043b\u044f \u0433\u043b\u0430\u0432\u043d\u043e\u0439 \u0442\u0435\u043f\u0435\u0440\u044c \u0435\u0441\u0442\u044c \u043f\u0435\u0440\u0435\u0442\u0430\u0441\u043a\u0438\u0432\u0430\u043d\u0438\u0435 \u0441\u0435\u043a\u0446\u0438\u0439, \u0430 \u043f\u0440\u0435\u0434\u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u043e \u043d\u0430 \u0432\u0435\u0441\u044c \u044d\u043a\u0440\u0430\u043d."
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/live"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl bg-forest/10 px-5 py-3 text-sm font-semibold text-forest transition hover:bg-forest/20"
          >
            <MonitorPlay className="h-4 w-4" />
            {"Live-\u0440\u0435\u0434\u0430\u043a\u0442\u043e\u0440"}
          </Link>
          <button
            type="button"
            onClick={onOpenPreview}
            className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest/90"
          >
            <Eye className="h-4 w-4" />
            {
              "\u041f\u0440\u0435\u0434\u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u0432\u043d\u0443\u0442\u0440\u0438 \u0430\u0434\u043c\u0438\u043d\u043a\u0438"
            }
          </button>
        </div>
      </div>

      {statusMessage ? (
        <p className="mt-6 rounded-xl bg-sage-light/20 px-4 py-3 text-sm text-forest">
          {statusMessage}
        </p>
      ) : null}
    </section>
  );
}
