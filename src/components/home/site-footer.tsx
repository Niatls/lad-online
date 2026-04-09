import { Mail, Phone } from "lucide-react";

import { footerServices, siteConfig, siteMessengerLinks } from "@/lib/site-config";

import type { NavLink } from "./home-data";

type SiteFooterProps = {
  navLinks: NavLink[];
  onScrollToSection: (id: string) => void;
};

export function SiteFooter({
  navLinks,
  onScrollToSection,
}: SiteFooterProps) {
  return (
    <footer id="contacts" className="bg-forest text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/favicon.svg"
                alt={siteConfig.brandName}
                className="w-10 h-10 rounded-xl"
              />
              <span className="text-xl font-bold text-white">
                {siteConfig.brandName}
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              {siteConfig.description}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Навигация</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.target}>
                  <button
                    onClick={() => onScrollToSection(link.target)}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Услуги</h4>
            <ul className="space-y-2">
              {footerServices.map((service) => (
                <li key={service}>
                  <span className="text-sm text-white/50">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Контакты</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={siteConfig.phoneHref}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.emailHref}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors break-all"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex gap-3 pt-2">
                {siteMessengerLinks.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-sage/50 flex items-center justify-center text-white/60 hover:text-white transition-all duration-300"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} {siteConfig.brandName} —
            Психологические консультации. Все права защищены.
          </p>
          <p className="text-xs text-white/30">
            {siteConfig.dataProtectionLabel}
          </p>
        </div>
      </div>
    </footer>
  );
}
