"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { NavLink } from "./home-data";

type HomeHeaderProps = {
  brandName: string;
  mobileMenuOpen: boolean;
  scrolled: boolean;
  navLinks: NavLink[];
  onToggleMobileMenu: () => void;
  onScrollToSection: (id: string) => void;
};

export function HomeHeader({
  brandName,
  mobileMenuOpen,
  scrolled,
  navLinks,
  onToggleMobileMenu,
  onScrollToSection,
}: HomeHeaderProps) {
  const isArticlesLink = (target: string) => target === "articles";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-sage-light/20 bg-white/90 shadow-sm backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-3"
          >
            <img
              src="/favicon.ico"
              alt={brandName}
              className="h-10 w-10 rounded-xl shadow-md transition-shadow group-hover:shadow-lg"
            />
            <span className="text-xl font-bold tracking-tight text-forest">
              {brandName}
            </span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) =>
              isArticlesLink(link.target) ? (
                <Link
                  key={link.target}
                  href="/articles"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-forest/70 transition-all duration-300 hover:bg-sage-light/20 hover:text-forest"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.target}
                  onClick={() => onScrollToSection(link.target)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-forest/70 transition-all duration-300 hover:bg-sage-light/20 hover:text-forest"
                >
                  {link.label}
                </button>
              )
            )}
            <Button
              onClick={() => onScrollToSection("booking")}
              className="ml-3 rounded-xl border-0 bg-gradient-to-r from-sage to-sage-dark text-white shadow-md transition-all duration-300 hover:from-sage-dark hover:to-forest hover:shadow-lg"
            >
              Записаться
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </nav>

          <button
            className="rounded-lg p-2 transition-colors hover:bg-sage-light/20 md:hidden"
            onClick={onToggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-forest" />
            ) : (
              <Menu className="h-6 w-6 text-forest" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-1 border-t border-sage-light/20 bg-white/95 px-4 py-4 backdrop-blur-md">
          {navLinks.map((link) =>
            isArticlesLink(link.target) ? (
              <Link
                key={link.target}
                href="/articles"
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-forest/70 transition-all hover:bg-sage-light/20 hover:text-forest"
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.target}
                onClick={() => onScrollToSection(link.target)}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-forest/70 transition-all hover:bg-sage-light/20 hover:text-forest"
              >
                {link.label}
              </button>
            )
          )}
          <Button
            onClick={() => onScrollToSection("booking")}
            className="mt-2 w-full rounded-xl border-0 bg-gradient-to-r from-sage to-sage-dark text-white"
          >
            Записаться на прием
          </Button>
        </div>
      </div>
    </header>
  );
}
