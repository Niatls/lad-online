export type BuiltInHomeSectionKind =
  | "hero"
  | "process"
  | "services"
  | "about"
  | "articles"
  | "pricing"
  | "booking";

export type HomeSectionVariant = "default" | "highlight" | "quote";

export type ElementKind = "badge" | "heading" | "paragraph" | "button" | "socials";

export type PageElement = {
  id: string;
  kind: ElementKind;
  content: string;
  target?: string;
  colStart?: number; // 1-24, default 1
  colSpan?: number;  // 1-24, default 24
  rowSpan?: number;  // number of rows, default 1
};

export type HomePageSection = {
  badge: string;
  body: string;
  ctaLabel: string;
  ctaTarget: string;
  enabled: boolean;
  id: string;
  kind: BuiltInHomeSectionKind | "custom" | "constructor";
  subtitle: string;
  title: string;
  variant: HomeSectionVariant;
  elements?: PageElement[];
};

const builtInSectionOrder: BuiltInHomeSectionKind[] = [
  "hero",
  "process",
  "services",
  "about",
  "articles",
  "pricing",
  "booking",
];

const builtInSectionTitles: Record<BuiltInHomeSectionKind, string> = {
  hero: "Первый экран",
  process: "Как это работает",
  services: "Услуги",
  about: "О нас",
  articles: "Статьи",
  pricing: "Цены",
  booking: "Запись",
};

export const defaultHomeSections: HomePageSection[] = builtInSectionOrder.map(
  (kind) => ({
    id: kind,
    kind,
    enabled: true,
    title: builtInSectionTitles[kind],
    badge: "",
    subtitle: "",
    body: "",
    ctaLabel: "",
    ctaTarget: "",
    variant: "default",
    elements: [],
  })
);

export function getSectionDisplayTitle(section: HomePageSection) {
  if (section.kind === "custom") {
    return section.title.trim() || "Новый блок";
  }
  if (section.kind === "constructor") {
    return "Пустой блок";
  }

  return builtInSectionTitles[section.kind];
}

export function createCustomHomeSection(
  variant: HomeSectionVariant = "default"
): HomePageSection {
  const suffix = Date.now().toString(36);

  return {
    id: `custom-${suffix}`,
    kind: "custom",
    enabled: true,
    title:
      variant === "quote"
        ? "Цитата"
        : variant === "highlight"
          ? "Акцентный блок"
          : "Инфо-блок",
    badge:
      variant === "quote"
        ? "Мысль"
        : variant === "highlight"
          ? "Важно"
          : "Новый блок",
    subtitle: "",
    body:
      variant === "quote"
        ? "> Добавьте здесь основную цитату или короткий сильный тезис."
        : "Добавьте сюда текст секции, список, цитату, ссылки или нужные акценты.",
    ctaLabel: "",
    ctaTarget: "",
    variant,
  };
}

function normalizeBuiltInSection(
  section: Partial<HomePageSection> & { kind: BuiltInHomeSectionKind }
): HomePageSection {
  return {
    id: section.kind,
    kind: section.kind,
    enabled: section.enabled ?? true,
    title: builtInSectionTitles[section.kind],
    badge: "",
    subtitle: "",
    body: "",
    ctaLabel: "",
    ctaTarget: "",
    variant: "default",
    elements: [],
  };
}

function normalizeCustomSection(
  section: Partial<HomePageSection>
): HomePageSection | null {
  const id = typeof section.id === "string" ? section.id.trim() : "";
  const title = typeof section.title === "string" ? section.title.trim() : "";

  if (!id) {
    return null;
  }

  return {
    id,
    kind: "custom",
    enabled: section.enabled ?? true,
    title: title || "Новый блок",
    badge: typeof section.badge === "string" ? section.badge.trim() : "",
    subtitle:
      typeof section.subtitle === "string" ? section.subtitle.trim() : "",
    body: typeof section.body === "string" ? section.body : "",
    ctaLabel:
      typeof section.ctaLabel === "string" ? section.ctaLabel.trim() : "",
    ctaTarget:
      typeof section.ctaTarget === "string" ? section.ctaTarget.trim() : "",
    variant:
      section.variant === "highlight" || section.variant === "quote"
        ? section.variant
        : "default",
    elements: Array.isArray(section.elements) ? section.elements : [],
  };
}

function normalizeConstructorSection(
  section: Partial<HomePageSection>
): HomePageSection | null {
  const id = typeof section.id === "string" ? section.id.trim() : "";
  if (!id) return null;

  return {
    id,
    kind: "constructor",
    enabled: section.enabled ?? true,
    title: "",
    badge: "",
    subtitle: "",
    body: "",
    ctaLabel: "",
    ctaTarget: "",
    variant: "default",
    elements: Array.isArray(section.elements) ? section.elements : [],
  };
}

export function normalizeHomeSections(value: unknown): HomePageSection[] {
  const sections = Array.isArray(value) ? value : [];
  const result: HomePageSection[] = [];
  const builtInKinds = new Set<BuiltInHomeSectionKind>();
  const seenIds = new Set<string>();

  for (const item of sections) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const section = item as Partial<HomePageSection>;
    if (
      section.kind === "hero" ||
      section.kind === "process" ||
      section.kind === "services" ||
      section.kind === "about" ||
      section.kind === "articles" ||
      section.kind === "pricing" ||
      section.kind === "booking"
    ) {
      if (!builtInKinds.has(section.kind)) {
        result.push(normalizeBuiltInSection(section as Partial<HomePageSection> & { kind: BuiltInHomeSectionKind }));
        builtInKinds.add(section.kind);
      }
      continue;
    }

    if (section.kind === "custom") {
      const normalized = normalizeCustomSection(section);
      if (normalized && !seenIds.has(normalized.id)) {
        result.push(normalized);
        seenIds.add(normalized.id);
      }
      continue;
    }

    if (section.kind === "constructor") {
      const normalized = normalizeConstructorSection(section);
      if (normalized && !seenIds.has(normalized.id)) {
        result.push(normalized);
        seenIds.add(normalized.id);
      }
      continue;
    }
  }

  for (const kind of builtInSectionOrder) {
    if (!builtInKinds.has(kind)) {
      result.push(normalizeBuiltInSection({ kind }));
    }
  }

  return result;
}
