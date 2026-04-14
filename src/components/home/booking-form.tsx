import { LoaderCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applicationContactMethods } from "@/lib/applications";

import { BookingDateTimeField } from "./booking-date-time-field";
import type {
  BookingFieldChangeHandler,
  BookingFormData,
  BookingSubmitHandler,
} from "./booking-types";
import { genderOptions } from "./booking-utils";

type BookingFormProps = {
  formData: BookingFormData;
  isSubmitting: boolean;
  submitError: string;
  onFieldChange: BookingFieldChangeHandler;
  onSubmit: BookingSubmitHandler;
};

export function BookingForm({
  formData,
  isSubmitting,
  submitError,
  onFieldChange,
  onSubmit,
}: BookingFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-forest">
          Как к вам обращаться
        </Label>
        <Input
          id="name"
          placeholder="Имя или псевдоним"
          required
          value={formData.name}
          onChange={(event) => onFieldChange("name", event.target.value)}
          className="h-12 select-text rounded-xl border-sage-light/30 bg-white px-4 text-forest placeholder:text-forest/30 focus:border-sage"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-forest">Пол</Label>
          <RadioGroup
            value={formData.gender}
            onValueChange={(value) => onFieldChange("gender", value)}
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
            value={formData.age}
            onChange={(event) => onFieldChange("age", event.target.value)}
            className="h-12 select-text rounded-xl border-sage-light/30 bg-white px-4 text-forest placeholder:text-forest/30 focus:border-sage"
          />
        </div>
      </div>

      <BookingDateTimeField
        preferredTime={formData.preferredTime}
        onFieldChange={onFieldChange}
      />

      <div className="space-y-2">
        <Label
          htmlFor="contactMethod"
          className="text-sm font-medium text-forest"
        >
          Способ связи
        </Label>
        <Select
          value={formData.contactMethod}
          onValueChange={(value) => onFieldChange("contactMethod", value)}
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
          <Label htmlFor="phone" className="text-sm font-medium text-forest">
            Телефон по желанию
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+7 (___) ___-__-__"
            value={formData.phone}
            onChange={(event) => onFieldChange("phone", event.target.value)}
            className="h-12 select-text rounded-xl border-sage-light/30 bg-white px-4 text-forest placeholder:text-forest/30 focus:border-sage"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-forest">
            Email по желанию
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(event) => onFieldChange("email", event.target.value)}
            className="h-12 select-text rounded-xl border-sage-light/30 bg-white px-4 text-forest placeholder:text-forest/30 focus:border-sage"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason" className="text-sm font-medium text-forest">
          Описание проблемы
        </Label>
        <Textarea
          id="reason"
          placeholder="Можно кратко: что сейчас беспокоит?"
          required
          rows={4}
          value={formData.reason}
          onChange={(event) => onFieldChange("reason", event.target.value)}
          className="resize-none select-text rounded-xl border-sage-light/30 bg-white px-4 py-3 text-forest placeholder:text-forest/30 focus:border-sage"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-xl border-0 bg-gradient-to-r from-sage to-sage-dark text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-sage-dark hover:to-forest hover:shadow-xl"
      >
        {isSubmitting ? (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        Отправить заявку
      </Button>

      {submitError ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}

      <p className="text-center text-xs leading-relaxed text-forest/30">
        Нажимая кнопку, вы соглашаетесь с правилами нашего сервиса. Ваши данные
        защищены в соответствии с ФЗ-152.
      </p>
    </form>
  );
}
