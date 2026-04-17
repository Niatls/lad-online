import type { Dispatch, SetStateAction } from "react";

import type { PageFormState } from "@/components/admin/editor-types";

export type SetPageForm = Dispatch<SetStateAction<PageFormState>>;

export type PageEditorSectionProps = {
  pageForm: PageFormState;
  setPageForm: SetPageForm;
};
