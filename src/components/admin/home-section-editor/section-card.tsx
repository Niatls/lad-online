import type { ReactNode } from "react";

type SectionCardProps = {
  children: ReactNode;
  description: string;
  title: string;
};

export function SectionCard({
  children,
  description,
  title,
}: SectionCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-sage-light/20 bg-white p-6">
      <h3 className="text-lg font-semibold text-forest">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-forest/55">{description}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}
