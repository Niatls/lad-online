type ApplicationInfoRowProps = {
  label: string;
  value: string;
};

export function ApplicationInfoRow({
  label,
  value,
}: ApplicationInfoRowProps) {
  return (
    <div className="rounded-xl border border-sage-light/15 bg-white/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest/35">
        {label}
      </p>
      <p className="mt-2 break-all text-sm leading-6 text-forest/80">
        {value}
      </p>
    </div>
  );
}
