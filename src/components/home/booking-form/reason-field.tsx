import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReasonFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ReasonField({ value, onChange }: ReasonFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="booking-reason" className="text-sm font-medium text-forest">
        Описание проблемы
      </Label>
      <Textarea
        id="booking-reason"
        name="booking_reason"
        autoComplete="off"
        placeholder="Можно кратко: что сейчас беспокоит?"
        required
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="resize-none select-text rounded-xl border-sage-light/30 bg-white px-4 py-3 text-forest placeholder:text-forest/30 focus:border-sage"
      />
    </div>
  );
}
