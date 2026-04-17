import type { ReactNode } from "react";

export type LiveEditorInnerProps = {
  children: ReactNode;
  onSaved: () => void;
};
