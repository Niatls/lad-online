"use client";

import type React from "react";
import { useEffect, useState } from "react";

import { AboutSection } from "@/components/home/about-section";
import { ArticlesSection } from "@/components/home/articles-section";
import {
  BookingSection,
  type BookingFormData,
} from "@/components/home/booking-section";
import { articles, navLinks } from "@/components/home/home-data";
import { HeroSection } from "@/components/home/hero-section";
import { HomeHeader } from "@/components/home/home-header";
import { MessengerStrip } from "@/components/home/messenger-strip";
import { PricingSection } from "@/components/home/pricing-section";
import { ProcessSection } from "@/components/home/process-section";
import { ServicesSection } from "@/components/home/services-section";
import { SiteFooter } from "@/components/home/site-footer";

const initialFormData: BookingFormData = {
  name: "",
  email: "",
  phone: "",
  reason: "",
};

export default function LadPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedApplicationNumber, setSubmittedApplicationNumber] =
    useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFieldChange = (field: keyof BookingFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
    <div className="min-h-screen flex flex-col">
      <HomeHeader
        mobileMenuOpen={mobileMenuOpen}
        scrolled={scrolled}
        navLinks={navLinks}
        onToggleMobileMenu={() => setMobileMenuOpen((current) => !current)}
        onScrollToSection={scrollToSection}
      />

      <main className="flex-1">
        <HeroSection onScrollToSection={scrollToSection} />
        <MessengerStrip />
        <ProcessSection />
        <ServicesSection />
        <AboutSection />
        <ArticlesSection articles={articles} />
        <PricingSection />
        <BookingSection
          formData={formData}
          isSubmitting={isSubmitting}
          submitError={submitError}
          submittedApplicationNumber={submittedApplicationNumber}
          onSubmit={handleSubmit}
          onResetSuccess={() => setSubmittedApplicationNumber("")}
          onFieldChange={handleFieldChange}
        />
      </main>

      <SiteFooter navLinks={navLinks} onScrollToSection={scrollToSection} />
    </div>
  );
}
