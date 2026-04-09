import { Mail, Phone } from "lucide-react";

import type {
  HomeContactsContent,
  HomeServiceItem,
} from "@/lib/content";
import { siteMessengerLinks } from "@/lib/site-config";

import type { NavLink } from "./home-data";

type SiteFooterProps = {
  contacts: HomeContactsContent;
  navLinks: NavLink[];
  services: HomeServiceItem[];
  onScrollToSection: (id: string) => void;
};

export function SiteFooter({
  contacts,
  navLinks,
  services,
  onScrollToSection,
}: SiteFooterProps) {
  return (
    <footer id="contacts" className="bg-forest text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <img
                src="/favicon.ico"
                alt={contacts.brandName}
                className="h-10 w-10 rounded-xl"
              />
              <span className="text-xl font-bold text-white">
                {contacts.brandName}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              {contacts.description}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Навигация</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.target}>
                  <button
                    onClick={() => onScrollToSection(link.target)}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Услуги</h4>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.title}>
                  <span className="text-sm text-white/50">{service.title}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Контакты</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={contacts.phoneHref}
                  className="flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4" />
                  {contacts.phone}
                </a>
              </li>
              <li>
                <a
                  href={contacts.emailHref}
                  className="flex items-center gap-2 break-all text-sm text-white/50 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  {contacts.email}
                </a>
              </li>
              <li className="flex gap-3 pt-2">
                {siteMessengerLinks.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-all duration-300 hover:bg-sage/50 hover:text-white"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} {contacts.brandName} - Психологические
            консультации. Все права защищены.
          </p>
          <p className="text-xs text-white/30">
            {contacts.dataProtectionLabel}
          </p>
        </div>
      </div>
    </footer>
  );
}
