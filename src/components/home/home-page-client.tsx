"use client";

import { useEffect, useState } from "react";

import { useLiveEditor } from "@/components/admin/live-editor-context";
import { HomeHeader } from "@/components/home/home-header";
import { HomeSectionsRenderer } from "@/components/home/home-sections-renderer";
import { SiteFooter } from "@/components/home/site-footer";
import { ScrollToTopButton } from "@/components/shared/scroll-to-top-button";
import type { HomePageContent, ManagedContentPage } from "@/lib/content";

import { useCopyContextMenu } from "./home-page/use-copy-context-menu";
import { useHomeBookingForm } from "./home-page/use-home-booking-form";

type HomePageClientProps = {
  articles: ManagedContentPage[];
  homeContent: HomePageContent;
  previewMode?: boolean;
};

export function HomePageClient({
  articles,
  homeContent,
  previewMode = false,
}: HomePageClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { contextMenuRef, copyContextMenu, handleCopyFromMenu } =
    useCopyContextMenu();
  const {
    formData,
    handleFieldChange,
    handleSubmit,
    isSubmitting,
    setSubmittedApplication,
    submitError,
    submittedApplication,
  } = useHomeBookingForm(previewMode);

  const { homeContent: liveHomeContent } = useLiveEditor();
  const currentHomeContent = liveHomeContent || homeContent;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
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
          onResetSuccess={() => setSubmittedApplication(null)}
          onScrollToSection={scrollToSection}
          onSubmit={handleSubmit}
          submitError={submitError}
          submittedApplication={submittedApplication}
        />
      </main>

      <SiteFooter
        contacts={currentHomeContent.contacts}
        navLinks={currentHomeContent.navLinks}
        services={currentHomeContent.services}
        onScrollToSection={scrollToSection}
      />

      <ScrollToTopButton />

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
