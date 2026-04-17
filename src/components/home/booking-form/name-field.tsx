import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type NameFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function NameField({ value, onChange }: NameFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="name" className="text-sm font-medium text-forest">
        Как к вам обращаться
      </Label>
      <Input
        id="name"
        placeholder="Имя или псевдоним"
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 select-text rounded-xl border-sage-light/30 bg-white px-4 text-forest placeholder:text-forest/30 focus:border-sage"
      />
    </div>
  );
}
