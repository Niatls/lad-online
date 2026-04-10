import Link from "next/link";

const links = [
  { href: "/admin", label: "Заявки" },
  { href: "/admin/editor", label: "Редактор" },
  { href: "/admin/chat", label: "Чат" },
];

export function AdminNavigation() {
  return (
    <nav className="rounded-[2rem] border border-sage-light/30 bg-white/90 p-3 shadow-lg">
      <div className="flex flex-wrap gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl bg-cream px-4 py-2 text-sm font-semibold text-forest transition hover:bg-sage-light/20"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
