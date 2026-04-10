"use client";

import type React from "react";

import { AboutSection } from "@/components/home/about-section";
import { ArticlesSection } from "@/components/home/articles-section";
import {
  BookingSection,
  type BookingFormData,
} from "@/components/home/booking-section";
import { CustomHomeSection } from "@/components/home/custom-home-section";
import { HeroSection } from "@/components/home/hero-section";
import { MessengerStrip } from "@/components/home/messenger-strip";
import { PricingSection } from "@/components/home/pricing-section";
import { ProcessSection } from "@/components/home/process-section";
import { ServicesSection } from "@/components/home/services-section";
import { SortableSection } from "@/components/admin/sortable-section";
import { ConstructorSection } from "@/components/admin/constructor-section";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { HomePageContent, ManagedContentPage } from "@/lib/content";

type HomeSectionsRendererProps = {
  articles: ManagedContentPage[];
  formData: BookingFormData;
  homeContent: HomePageContent;
  isSubmitting: boolean;
  onFieldChange: (field: keyof BookingFormData, value: string) => void;
  onResetSuccess: () => void;
  onScrollToSection: (id: string) => void;
  onSubmit: (event: React.FormEvent) => Promise<void>;
  submitError: string;
  submittedApplicationNumber: string;
};

export function HomeSectionsRenderer({
  articles,
  formData,
  homeContent,
  isSubmitting,
  onFieldChange,
  onResetSuccess,
  onScrollToSection,
  onSubmit,
  submitError,
  submittedApplicationNumber,
}: HomeSectionsRendererProps) {
  return (
    <SortableContext
      items={homeContent.sections.map((s) => s.id)}
      strategy={verticalListSortingStrategy}
    >
      <div className="flex flex-col min-h-[50vh]">
        {homeContent.sections
          .filter((section) => section.enabled)
          .map((section) => {
            let contentNode: React.ReactNode = null;
            switch (section.kind) {
              case "hero":
                contentNode = (
                  <>
                    <HeroSection
                      content={homeContent}
                      onScrollToSection={onScrollToSection}
                    />
                    <MessengerStrip />
                  </>
                );
                break;
              case "process":
                contentNode = <ProcessSection />;
                break;
              case "services":
                contentNode = <ServicesSection services={homeContent.services} />;
                break;
              case "about":
                contentNode = <AboutSection content={homeContent} />;
                break;
              case "articles":
                contentNode = <ArticlesSection articles={articles} />;
                break;
              case "pricing":
                contentNode = <PricingSection />;
                break;
              case "booking":
                contentNode = (
                  <BookingSection
                    content={homeContent}
                    contacts={homeContent.contacts}
                    formData={formData}
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                    submittedApplicationNumber={submittedApplicationNumber}
                    onSubmit={onSubmit}
                    onResetSuccess={onResetSuccess}
                    onFieldChange={onFieldChange}
                  />
                );
                break;
              case "custom":
                contentNode = (
                  <CustomHomeSection
                    onScrollToSection={onScrollToSection}
                    section={section}
                  />
                );
                break;
              case "constructor":
                contentNode = <ConstructorSection section={section} />;
                break;
              default:
                contentNode = null;
            }

            if (!contentNode) return null;

            return (
              <SortableSection key={section.id} id={section.id}>
                {contentNode}
              </SortableSection>
            );
          })}
      </div>
    </SortableContext>
  );
}
