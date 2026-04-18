import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applicationContactMethods } from "@/lib/applications";

type ContactFieldsProps = {
  contactMethod: string;
  email: string;
  phone: string;
  onContactMethodChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
};

export function ContactFields({
  contactMethod,
  email,
  phone,
  onContactMethodChange,
  onEmailChange,
  onPhoneChange,
}: ContactFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label
          htmlFor="contactMethod"
          className="text-sm font-medium text-forest"
        >
          Способ связи
        </Label>
        <Select
          modal={false}
          value={contactMethod}
          onValueChange={onContactMethodChange}
        >
          <SelectTrigger
            id="contactMethod"
            className="h-12 rounded-xl border-sage-light/30 bg-white px-4 text-forest focus:border-sage"
          >
            <SelectValue placeholder="Выберите способ связи" />
          </SelectTrigger>
          <SelectContent>
            {applicationContactMethods.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="booking-phone" className="text-sm font-medium text-forest">
            Телефон по желанию
          </Label>
          <Input
            id="booking-phone"
            name="booking_phone"
            type="tel"
            autoComplete="off"
            inputMode="tel"
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
            className="h-12 select-text rounded-xl border-sage-light/30 bg-white px-4 text-forest placeholder:text-forest/30 focus:border-sage"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="booking-email" className="text-sm font-medium text-forest">
            Email по желанию
          </Label>
          <Input
            id="booking-email"
            name="booking_email"
            type="email"
            autoComplete="off"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            className="h-12 select-text rounded-xl border-sage-light/30 bg-white px-4 text-forest placeholder:text-forest/30 focus:border-sage"
          />
        </div>
      </div>
    </>
  );
}
