import { BookingDateTimeField } from "./booking-date-time-field";
import { ContactFields } from "./booking-form/contact-fields";
import { DemographicsFields } from "./booking-form/demographics-fields";
import { NameField } from "./booking-form/name-field";
import { ReasonField } from "./booking-form/reason-field";
import { SubmitSection } from "./booking-form/submit-section";
import type {
  BookingFieldChangeHandler,
  BookingFormData,
  BookingSubmitHandler,
} from "./booking-types";

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
    <form
      onSubmit={onSubmit}
      autoComplete="off"
      className="space-y-6"
      onContextMenuCapture={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("input, textarea")) {
          return;
        }

        event.preventDefault();
      }}
    >
      <NameField
        value={formData.name}
        onChange={(value) => onFieldChange("name", value)}
      />

      <DemographicsFields
        age={formData.age}
        gender={formData.gender}
        onAgeChange={(value) => onFieldChange("age", value)}
        onGenderChange={(value) => onFieldChange("gender", value)}
      />

      <BookingDateTimeField
        preferredTime={formData.preferredTime}
        onFieldChange={onFieldChange}
      />

      <ContactFields
        contactMethod={formData.contactMethod}
        email={formData.email}
        phone={formData.phone}
        onContactMethodChange={(value) => onFieldChange("contactMethod", value)}
        onEmailChange={(value) => onFieldChange("email", value)}
        onPhoneChange={(value) => onFieldChange("phone", value)}
      />

      <ReasonField
        value={formData.reason}
        onChange={(value) => onFieldChange("reason", value)}
      />

      <SubmitSection
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </form>
  );
}
