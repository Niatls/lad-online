import type { HomePageContent } from "@/lib/content";

export type SetHomeField = <K extends keyof HomePageContent>(
  key: K,
  value: HomePageContent[K]
) => void;
