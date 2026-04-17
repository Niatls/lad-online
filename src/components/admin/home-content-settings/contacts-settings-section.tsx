import { EditorAccordionSection } from "@/components/admin/editor-accordion-section";
import { Field, MarkdownTextareaField } from "@/components/admin/editor-shared";
import type { HomePageContent } from "@/lib/content";

import type { SetHomeField } from "./types";

type ContactsSettingsSectionProps = {
  homeForm: HomePageContent;
  setHomeField: SetHomeField;
};

export function ContactsSettingsSection({
  homeForm,
  setHomeField,
}: ContactsSettingsSectionProps) {
  const updateContacts = (updates: Partial<HomePageContent["contacts"]>) => {
    setHomeField("contacts", {
      ...homeForm.contacts,
      ...updates,
    });
  };

  return (
    <EditorAccordionSection
      value="contacts"
      title={"\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b"}
      description={
        "\u0414\u0430\u043d\u043d\u044b\u0435 \u0432 \u0444\u0443\u0442\u0435\u0440\u0435, \u0441\u0441\u044b\u043b\u043a\u0430\u0445 \u0438 \u043f\u043e\u0434\u043f\u0438\u0441\u0438 \u0441\u0430\u0439\u0442\u0430."
      }
    >
      <div className="grid gap-4">
        <Field
          label={"\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0431\u0440\u0435\u043d\u0434\u0430"}
          value={homeForm.contacts.brandName}
          onChange={(brandName) => updateContacts({ brandName })}
        />
        <MarkdownTextareaField
          label={"\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u0432 \u0444\u0443\u0442\u0435\u0440\u0435"}
          rows={3}
          value={homeForm.contacts.description}
          onChange={(description) => updateContacts({ description })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label={"\u0422\u0435\u043b\u0435\u0444\u043e\u043d"}
            value={homeForm.contacts.phone}
            onChange={(phone) => updateContacts({ phone })}
          />
          <Field
            label={"\u0421\u0441\u044b\u043b\u043a\u0430 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0430"}
            value={homeForm.contacts.phoneHref}
            onChange={(phoneHref) => updateContacts({ phoneHref })}
          />
          <Field
            label="Email"
            value={homeForm.contacts.email}
            onChange={(email) => updateContacts({ email })}
          />
          <Field
            label={"\u0421\u0441\u044b\u043b\u043a\u0430 email"}
            value={homeForm.contacts.emailHref}
            onChange={(emailHref) => updateContacts({ emailHref })}
          />
          <Field
            label={"\u0424\u043e\u0440\u043c\u0430\u0442 \u043a\u043e\u043d\u0441\u0443\u043b\u044c\u0442\u0430\u0446\u0438\u0439"}
            value={homeForm.contacts.formatLabel}
            onChange={(formatLabel) => updateContacts({ formatLabel })}
          />
          <Field
            label={"\u041f\u043e\u0434\u043f\u0438\u0441\u044c \u043e \u0437\u0430\u0449\u0438\u0442\u0435 \u0434\u0430\u043d\u043d\u044b\u0445"}
            value={homeForm.contacts.dataProtectionLabel}
            onChange={(dataProtectionLabel) =>
              updateContacts({ dataProtectionLabel })
            }
          />
        </div>
      </div>
    </EditorAccordionSection>
  );
}
