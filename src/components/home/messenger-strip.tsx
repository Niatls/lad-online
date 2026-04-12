import { siteMessengerLinks } from "@/lib/site-config";

export function MessengerStrip() {
  return (
    <section className="py-16 bg-gradient-to-r from-sage to-sage-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold text-white mb-1">
              Свяжитесь с нами в удобном мессенджере
            </h3>
            <p className="text-white/70 text-sm">
              Telegram, WhatsApp, VK, Discord — выберите свой вариант
            </p>
          </div>
          <div className="flex items-center gap-3">
            {siteMessengerLinks.map(({ Icon, label, href, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className={`w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm ${color} flex items-center justify-center text-white transition-all duration-300 border border-white/10 hover:border-white/30 hover:scale-110`}
                aria-label={label}
                title={label}
              >
                <Icon size={22} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
