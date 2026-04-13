"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

import { type BookingFormData } from "@/components/home/booking-section";
import { HomeHeader } from "@/components/home/home-header";
import { useLiveEditor } from "@/components/admin/live-editor-context";
import { HomeSectionsRenderer } from "@/components/home/home-sections-renderer";
import { SiteFooter } from "@/components/home/site-footer";
import type { HomePageContent, ManagedContentPage } from "@/lib/content";

const initialFormData: BookingFormData = {
  name: "",
  email: "",
  phone: "",
  reason: "",
};

type HomePageClientProps = {
  articles: ManagedContentPage[];
  homeContent: HomePageContent;
  previewMode?: boolean;
};

type CopyContextMenuState = {
  text: string;
  x: number;
  y: number;
} | null;

export function HomePageClient({
  articles,
  homeContent,
  previewMode = false,
}: HomePageClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [copyContextMenu, setCopyContextMenu] =
    useState<CopyContextMenuState>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedApplicationNumber, setSubmittedApplicationNumber] =
    useState("");
  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  const { homeContent: liveHomeContent } = useLiveEditor();
  const currentHomeContent = liveHomeContent || homeContent;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const clearSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        return;
      }

      selection.removeAllRanges();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }

      if (
        event.target instanceof Node &&
        contextMenuRef.current?.contains(event.target)
      ) {
        return;
      }

      clearSelection();
      setCopyContextMenu(null);
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();

      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        setCopyContextMenu(null);
        return;
      }

      const copyTarget = target.closest("[data-copy-text]");
      if (!(copyTarget instanceof HTMLElement)) {
        setCopyContextMenu(null);
        return;
      }

      const selection = window.getSelection();
      const selectedText = selection?.toString().trim() ?? "";
      if (!selection || selection.isCollapsed || !selectedText) {
        setCopyContextMenu(null);
        return;
      }

      const anchorElement =
        selection.anchorNode instanceof Element
          ? selection.anchorNode
          : selection.anchorNode?.parentElement;
      const focusElement =
        selection.focusNode instanceof Element
          ? selection.focusNode
          : selection.focusNode?.parentElement;
      const anchorCopyTarget = anchorElement?.closest("[data-copy-text]");
      const focusCopyTarget = focusElement?.closest("[data-copy-text]");

      if (anchorCopyTarget !== copyTarget || focusCopyTarget !== copyTarget) {
        setCopyContextMenu(null);
        return;
      }

      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const rect = range?.getBoundingClientRect();
      if (!rect || (rect.width === 0 && rect.height === 0)) {
        setCopyContextMenu(null);
        return;
      }

      setCopyContextMenu({
        text: selectedText,
        x: Math.min(rect.right + 8, window.innerWidth - 156),
        y: Math.min(Math.max(rect.top - 4, 8), window.innerHeight - 64),
      });
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCopyContextMenu(null);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleCopyFromMenu = async () => {
    if (!copyContextMenu?.text) {
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyContextMenu.text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = copyContextMenu.text;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
    } finally {
      setCopyContextMenu(null);
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFieldChange = (field: keyof BookingFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (previewMode) {
      setSubmittedApplicationNumber("PREVIEW-001");
      setSubmitError("");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Не удалось отправить заявку");
      }

      setSubmittedApplicationNumber(result.applicationNumber);
      setFormData(initialFormData);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Не удалось отправить заявку. Попробуйте еще раз."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col select-none">
      <HomeHeader
        mobileMenuOpen={mobileMenuOpen}
        scrolled={scrolled}
        brandName={currentHomeContent.contacts.brandName}
        navLinks={currentHomeContent.navLinks}
        onToggleMobileMenu={() => setMobileMenuOpen((current) => !current)}
        onScrollToSection={scrollToSection}
      />

      <main className="flex-1">
        <HomeSectionsRenderer
          articles={articles}
          formData={formData}
          homeContent={currentHomeContent}
          isSubmitting={isSubmitting}
          onFieldChange={handleFieldChange}
          onResetSuccess={() => setSubmittedApplicationNumber("")}
          onScrollToSection={scrollToSection}
          onSubmit={handleSubmit}
          submitError={submitError}
          submittedApplicationNumber={submittedApplicationNumber}
        />
      </main>

      <SiteFooter
        contacts={currentHomeContent.contacts}
        navLinks={currentHomeContent.navLinks}
        services={currentHomeContent.services}
        onScrollToSection={scrollToSection}
      />

      {copyContextMenu ? (
        <div
          ref={contextMenuRef}
          className="fixed z-[100] min-w-[140px] overflow-hidden rounded-xl border border-sage-light/30 bg-white/95 p-1 shadow-2xl backdrop-blur-md"
          style={{ left: copyContextMenu.x, top: copyContextMenu.y }}
        >
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleCopyFromMenu}
            className="w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-forest transition hover:bg-sage-light/20"
          >
            Копировать
          </button>
        </div>
      ) : null}
    </div>
  );
}
