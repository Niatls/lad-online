import type { ReactNode } from "react";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(143,174,139,0.22),_transparent_42%),linear-gradient(180deg,_#fdfbf7_0%,_#f6f0e7_100%)] px-4 py-6 text-forest sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">{children}</div>
    </main>
  );
}
