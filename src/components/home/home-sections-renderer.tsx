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
  return homeContent.sections
    .filter((section) => section.enabled)
    .map((section) => {
      switch (section.kind) {
        case "hero":
          return (
            <div key={section.id}>
              <HeroSection
                content={homeContent}
                onScrollToSection={onScrollToSection}
              />
              <MessengerStrip />
            </div>
          );
        case "process":
          return <ProcessSection key={section.id} />;
        case "services":
          return (
            <ServicesSection key={section.id} services={homeContent.services} />
          );
        case "about":
          return <AboutSection key={section.id} content={homeContent} />;
        case "articles":
          return <ArticlesSection key={section.id} articles={articles} />;
        case "pricing":
          return <PricingSection key={section.id} />;
        case "booking":
          return (
            <BookingSection
              key={section.id}
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
        case "custom":
          return (
            <CustomHomeSection
              key={section.id}
              onScrollToSection={onScrollToSection}
              section={section}
            />
          );
        default:
          return null;
      }
    });
}
