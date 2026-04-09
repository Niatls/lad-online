"use client";

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
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-sage-light/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 group"
          >
            <img
              src="/favicon.ico"
              alt={brandName}
              className="w-10 h-10 rounded-xl shadow-md group-hover:shadow-lg transition-shadow"
            />
            <span className="text-xl font-bold tracking-tight text-forest">
              {brandName}
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.target}
                onClick={() => onScrollToSection(link.target)}
                className="px-4 py-2 text-sm font-medium text-forest/70 hover:text-forest rounded-lg hover:bg-sage-light/20 transition-all duration-300"
              >
                {link.label}
              </button>
            ))}
            <Button
              onClick={() => onScrollToSection("booking")}
              className="ml-3 bg-gradient-to-r from-sage to-sage-dark hover:from-sage-dark hover:to-forest text-white border-0 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              Записаться
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </nav>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-sage-light/20 transition-colors"
            onClick={onToggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-forest" />
            ) : (
              <Menu className="w-6 h-6 text-forest" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md border-t border-sage-light/20 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.target}
              onClick={() => onScrollToSection(link.target)}
              className="block w-full text-left px-4 py-3 text-sm font-medium text-forest/70 hover:text-forest rounded-lg hover:bg-sage-light/20 transition-all"
            >
              {link.label}
            </button>
          ))}
          <Button
            onClick={() => onScrollToSection("booking")}
            className="w-full mt-2 bg-gradient-to-r from-sage to-sage-dark text-white border-0 rounded-xl"
          >
            Записаться на приём
          </Button>
        </div>
      </div>
    </header>
  );
}
