import { ArrowRight, Link2, Sparkles } from "lucide-react";

import { EditableText } from "@/components/admin/editable-text";
import type { PageElement } from "@/lib/home-sections";

type ConstructorElementContentProps = {
  element: PageElement;
  isEditMode: boolean;
  onUpdateContent: (content: string) => void;
  onUpdateTarget: (target: string) => void;
  linkPlaceholder: string;
};

export function ConstructorElementContent({
  element,
  isEditMode,
  onUpdateContent,
  onUpdateTarget,
  linkPlaceholder,
}: ConstructorElementContentProps) {
  switch (element.kind) {
    case "badge":
      return (
        <div className="flex justify-center py-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-sage-light/50 bg-sage-light/20 px-4 py-2 text-sm font-medium text-sage-dark backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-sage" />
            <EditableText tagName="span" value={element.content} onChange={onUpdateContent} />
          </div>
        </div>
      );
    case "heading":
      return (
        <h2 className="text-3xl font-bold leading-tight text-forest sm:text-4xl md:text-5xl py-4 tracking-tight">
          <EditableText tagName="span" value={element.content} onChange={onUpdateContent} />
        </h2>
      );
    case "paragraph":
      return (
        <div className="w-full py-2">
          <EditableText
            tagName="p"
            className="text-lg leading-relaxed text-forest/60 sm:text-xl"
            value={element.content}
            onChange={onUpdateContent}
          />
        </div>
      );
    case "button":
      return (
        <div className="flex flex-col items-center justify-center py-4 h-full">
          <button className="inline-flex items-center gap-2 rounded-2xl bg-sage px-8 py-4 text-lg font-bold text-white shadow-xl shadow-sage/20 transition-all hover:bg-forest hover:scale-[1.02] active:scale-95">
            <EditableText tagName="span" value={element.content} onChange={onUpdateContent} />
            <ArrowRight className="h-5 w-5" />
          </button>
          {isEditMode ? (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-forest/40">
              <Link2 className="h-3 w-3" />
              <EditableText
                tagName="span"
                className="font-mono text-[11px] text-forest/50 bg-sage-light/10 px-1.5 py-0.5 rounded border border-sage-light/20 min-w-[60px]"
                value={element.target || ""}
                onChange={onUpdateTarget}
                placeholder={linkPlaceholder}
              />
            </div>
          ) : null}
        </div>
      );
    case "socials":
      return (
        <div className="py-4 w-full">
          <div className="relative overflow-hidden rounded-3xl bg-sage/10 p-0.5 shadow-sm w-full border border-sage/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-[22px] bg-white/80 px-8 py-6 backdrop-blur-md">
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-bold text-forest mb-1">
                  <EditableText tagName="span" value={element.content} onChange={onUpdateContent} />
                </h3>
                <p className="text-sm text-forest/60">Telegram, WhatsApp, VK, Discord</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { label: "TG", color: "bg-[#24A1DE]" },
                  { label: "WA", color: "bg-[#25D366]" },
                  { label: "VK", color: "bg-[#0077FF]" },
                  { label: "DS", color: "bg-[#5865F2]" },
                ].map((social) => (
                  <div
                    key={social.label}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${social.color} text-white shadow-lg transition hover:scale-110`}
                  >
                    <span className="text-xs font-bold">{social.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}
