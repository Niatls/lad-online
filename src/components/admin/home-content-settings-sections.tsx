"use client";

import { ContactsSettingsSection } from "@/components/admin/home-content-settings/contacts-settings-section";
import { MenuSettingsSection } from "@/components/admin/home-content-settings/menu-settings-section";
import { ServicesSettingsSection } from "@/components/admin/home-content-settings/services-settings-section";
import type { SetHomeField } from "@/components/admin/home-content-settings/types";
import { Accordion } from "@/components/ui/accordion";
import type { HomePageContent } from "@/lib/content";

type HomeContentSettingsSectionsProps = {
  homeForm: HomePageContent;
  setHomeField: SetHomeField;
};

export function HomeContentSettingsSections({
  homeForm,
  setHomeField,
}: HomeContentSettingsSectionsProps) {
  return (
    <Accordion
      type="multiple"
      defaultValue={["menu", "contacts"]}
      className="space-y-4"
    >
      <MenuSettingsSection homeForm={homeForm} setHomeField={setHomeField} />
      <ContactsSettingsSection homeForm={homeForm} setHomeField={setHomeField} />
      <ServicesSettingsSection homeForm={homeForm} setHomeField={setHomeField} />
    </Accordion>
  );
}
