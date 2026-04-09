import { Mail, Phone } from "lucide-react";

import type { NavLink } from "./home-data";
import {
  DiscordIcon,
  TelegramIcon,
  VKIcon,
  WhatsAppIcon,
} from "./messenger-icons";

type SiteFooterProps = {
  navLinks: NavLink[];
  onScrollToSection: (id: string) => void;
};

const footerServices = [
  "Стресс и тревога",
  "Депрессия",
  "Семейное консультирование",
  "ПТСР",
  "Детская психология",
];

const footerMessengers = [
  { Icon: TelegramIcon, href: "#" },
  { Icon: WhatsAppIcon, href: "#" },
  { Icon: VKIcon, href: "#" },
  { Icon: DiscordIcon, href: "#" },
];

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
                alt="Лад"
                className="w-10 h-10 rounded-xl"
              />
              <span className="text-xl font-bold text-white">Лад</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Профессиональные психологические консультации онлайн. Ваше
              ментальное здоровье — наш приоритет.
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
                  href="tel:+79782939529"
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +7 (978) 293-95-29
                </a>
              </li>
              <li>
                <a
                  href="mailto:lad.psychologicalconsultations@mail.ru"
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors break-all"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  lad.psychologicalconsultations@mail.ru
                </a>
              </li>
              <li className="flex gap-3 pt-2">
                {footerMessengers.map(({ Icon, href }, index) => (
                  <a
                    key={index}
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
            © {new Date().getFullYear()} Лад — Психологические консультации. Все
            права защищены.
          </p>
          <p className="text-xs text-white/30">
            Защита персональных данных по ФЗ-152
          </p>
        </div>
      </div>
    </footer>
  );
}
