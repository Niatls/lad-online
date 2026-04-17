import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { genderOptions } from "../booking-utils";

type DemographicsFieldsProps = {
  age: string;
  gender: string;
  onAgeChange: (value: string) => void;
  onGenderChange: (value: string) => void;
};

export function DemographicsFields({
  age,
  gender,
  onAgeChange,
  onGenderChange,
}: DemographicsFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-forest">Пол</Label>
        <RadioGroup
          value={gender}
          onValueChange={onGenderChange}
          className="grid grid-cols-2 gap-3"
        >
          {genderOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-sage-light/30 bg-white px-4 py-3 text-sm font-medium text-forest transition hover:border-sage"
            >
              <RadioGroupItem value={option.value} id={option.value} />
              <span>{option.label}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="age" className="text-sm font-medium text-forest">
          Возраст
        </Label>
        <Input
          id="age"
          type="number"
          min={12}
          max={120}
          placeholder="Например: 32"
          required
          value={age}
          onChange={(event) => onAgeChange(event.target.value)}
          className="h-12 select-text rounded-xl border-sage-light/30 bg-white px-4 text-forest placeholder:text-forest/30 focus:border-sage"
        />
      </div>
    </div>
  );
}
