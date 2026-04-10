import { db } from "@/lib/db";
import { articles as fallbackArticles } from "@/components/home/home-data";
import {
  defaultHomeSections,
  normalizeHomeSections,
  type HomePageSection,
} from "@/lib/home-sections";

export type HomeNavLink = {
  label: string;
  target: string;
};

export type HomeServiceItem = {
  description: string;
  title: string;
};

export type HomeContactsContent = {
  brandName: string;
  dataProtectionLabel: string;
  description: string;
  email: string;
  emailHref: string;
  formatLabel: string;
  phone: string;
  phoneHref: string;
};

export type HomePageContent = {
  aboutDescription: string;
  aboutIntro: string;
  aboutTitle: string;
  bookingDescription: string;
  bookingTitle: string;
  contacts: HomeContactsContent;
  heroBadge: string;
  heroDescription: string;
  heroTitle: string;
  heroTitleAccent: string;
  navLinks: HomeNavLink[];
  sections: HomePageSection[];
  services: HomeServiceItem[];
};

export type ManagedContentPage = {
  content: string;
  excerpt: string;
  id: number | null;
  pageType: "article" | "page";
  published: boolean;
  researchHref: string;
  researchLabel: string;
  showOnHomepage: boolean;
  slug: string;
  sourceHref: string;
  sourceLabel: string;
  summaryPoints: string[];
  title: string;
  updatedAt: Date | null;
};

const HOME_CONTENT_KEY = "homepage";

export const defaultHomeNavLinks: HomeNavLink[] = [
  { label: "О нас", target: "about" },
  { label: "Как это работает", target: "process" },
  { label: "Услуги", target: "services" },
  { label: "Статьи", target: "articles" },
  { label: "Цены", target: "pricing" },
  { label: "Контакты", target: "contacts" },
];

export const defaultHomeServices: HomeServiceItem[] = [
  {
    title: "Личные границы",
    description:
      "Работа над личными границами, развитие навыков отстаивать свои интересы и строить здоровые отношения с окружающими.",
  },
  {
    title: "Стресс и тревога",
    description:
      "Помощь при стрессовых ситуациях, тревожных расстройствах, фобиях и панических атаках. Научимся управлять эмоциями.",
  },
  {
    title: "Депрессия и апатия",
    description:
      "Поддержка при депрессивных состояниях, потере мотивации, апатии. Возвращение интереса к жизни и энергии.",
  },
  {
    title: "Семейные отношения",
    description:
      "Психологическая помощь при разводе, расставании, семейных конфликтах и трудностях в браке.",
  },
  {
    title: "Принятие себя",
    description:
      "Работа с самооценкой, принятие себя после травматических событий, развитие самосознания и внутренней силы.",
  },
  {
    title: "Свободная тематика",
    description:
      "Консультирование по любым вопросам, которые вас беспокоят. Вы определяете направление работы.",
  },
];

export const defaultHomeContacts: HomeContactsContent = {
  brandName: "Лад",
  phone: "+7 (978) 293-95-29",
  phoneHref: "tel:+79782939529",
  email: "lad.psychologicalconsultations@mail.ru",
  emailHref: "mailto:lad.psychologicalconsultations@mail.ru",
  formatLabel: "Онлайн-консультации",
  description:
    "Профессиональные психологические консультации онлайн. Ваше ментальное здоровье - наш приоритет.",
  dataProtectionLabel: "Защита персональных данных по ФЗ-152",
};

export const defaultHomePageContent: HomePageContent = {
  heroBadge: "Психологические консультации",
  heroTitle: "Ваше ментальное",
  heroTitleAccent: "здоровье - наша цель",
  heroDescription:
    "Добро пожаловать! Мы - команда профессиональных психологов, готовых помочь вам справиться с жизненными трудностями и обрести внутреннюю гармонию.",
  aboutTitle: "Команда профессионалов, которой можно доверять",
  aboutIntro:
    "Мы - небольшая команда дипломированных психологов, специализирующихся на работе с людьми и их психологическими трудностями. Каждый из нашей команды работает непосредственно по своей специальности.",
  aboutDescription:
    "Этот ресурс создан для работы с клиентами, у которых есть реальные психологические трудности. Мы не продаем ложные иллюзии, религиозную тематику, инфо-курсы и эзотерические практики.",
  bookingTitle: "Запишитесь на консультацию",
  bookingDescription:
    "Заполните форму ниже, и мы свяжемся с вами в ближайшее время для назначения консультации. Все данные защищены.",
  navLinks: defaultHomeNavLinks,
  sections: defaultHomeSections,
  services: defaultHomeServices,
  contacts: defaultHomeContacts,
};

const fallbackManagedArticles: ManagedContentPage[] = fallbackArticles.map(
  (article) => ({
    id: null,
    slug: article.slug,
    title: article.title,
    excerpt: article.intro,
    content: article.sections
      .map((section) => {
        const heading = `## ${section.heading}`;
        const paragraphs = section.paragraphs.join("\n\n");
        const points = section.points?.length
          ? `\n\n${section.points.map((point) => `- ${point}`).join("\n")}`
          : "";

        return `${heading}\n\n${paragraphs}${points}`;
      })
      .join("\n\n"),
    pageType: "article",
    published: true,
    showOnHomepage: true,
    summaryPoints: article.points,
    sourceLabel: article.sourceLabel,
    sourceHref: article.sourceHref,
    researchLabel: article.researchLabel,
    researchHref: article.researchHref,
    updatedAt: null,
  })
);

function normalizeSummaryPoints(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizeNavLinks(value: unknown): HomeNavLink[] {
  if (!Array.isArray(value)) {
    return defaultHomeNavLinks;
  }

  const links = value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const label =
        typeof record.label === "string" ? record.label.trim() : "";
      const target =
        typeof record.target === "string" ? record.target.trim() : "";

      if (!label || !target) {
        return null;
      }

      return { label, target };
    })
    .filter((item): item is HomeNavLink => item !== null);

  return links.length ? links : defaultHomeNavLinks;
}

function normalizeServices(value: unknown): HomeServiceItem[] {
  if (!Array.isArray(value)) {
    return defaultHomeServices;
  }

  const services = value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const title =
        typeof record.title === "string" ? record.title.trim() : "";
      const description =
        typeof record.description === "string"
          ? record.description.trim()
          : "";

      if (!title || !description) {
        return null;
      }

      return { title, description };
    })
    .filter((item): item is HomeServiceItem => item !== null);

  return services.length ? services : defaultHomeServices;
}

function normalizeContacts(value: unknown): HomeContactsContent {
  if (!value || typeof value !== "object") {
    return defaultHomeContacts;
  }

  const record = value as Record<string, unknown>;

  return {
    brandName:
      typeof record.brandName === "string" && record.brandName.trim()
        ? record.brandName.trim()
        : defaultHomeContacts.brandName,
    description:
      typeof record.description === "string" && record.description.trim()
        ? record.description.trim()
        : defaultHomeContacts.description,
    phone:
      typeof record.phone === "string" && record.phone.trim()
        ? record.phone.trim()
        : defaultHomeContacts.phone,
    phoneHref:
      typeof record.phoneHref === "string" && record.phoneHref.trim()
        ? record.phoneHref.trim()
        : defaultHomeContacts.phoneHref,
    email:
      typeof record.email === "string" && record.email.trim()
        ? record.email.trim()
        : defaultHomeContacts.email,
    emailHref:
      typeof record.emailHref === "string" && record.emailHref.trim()
        ? record.emailHref.trim()
        : defaultHomeContacts.emailHref,
    formatLabel:
      typeof record.formatLabel === "string" && record.formatLabel.trim()
        ? record.formatLabel.trim()
        : defaultHomeContacts.formatLabel,
    dataProtectionLabel:
      typeof record.dataProtectionLabel === "string" &&
      record.dataProtectionLabel.trim()
        ? record.dataProtectionLabel.trim()
        : defaultHomeContacts.dataProtectionLabel,
  };
}

function mapContentPage(page: {
  content: string;
  excerpt: string;
  id: number;
  pageType: string;
  published: boolean;
  researchHref: string | null;
  researchLabel: string | null;
  showOnHomepage: boolean;
  slug: string;
  sourceHref: string | null;
  sourceLabel: string | null;
  summaryPoints: unknown;
  title: string;
  updatedAt: Date;
}): ManagedContentPage {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    excerpt: page.excerpt,
    content: page.content,
    pageType: page.pageType === "article" ? "article" : "page",
    published: page.published,
    showOnHomepage: page.showOnHomepage,
    summaryPoints: normalizeSummaryPoints(page.summaryPoints),
    sourceLabel: page.sourceLabel ?? "",
    sourceHref: page.sourceHref ?? "",
    researchLabel: page.researchLabel ?? "",
    researchHref: page.researchHref ?? "",
    updatedAt: page.updatedAt,
  };
}

function dedupePagesBySlug(pages: ManagedContentPage[]) {
  const map = new Map<string, ManagedContentPage>();

  for (const page of pages) {
    if (!map.has(page.slug)) {
      map.set(page.slug, page);
    }
  }

  return Array.from(map.values());
}

export async function getHomePageContent() {
  let content: Awaited<ReturnType<typeof db.siteContent.findUnique>> | null =
    null;

  try {
    content = await db.siteContent.findUnique({
      where: { key: HOME_CONTENT_KEY },
    });
  } catch (error) {
    console.error("Failed to load homepage content, using defaults", error);
    return defaultHomePageContent;
  }

  if (!content || typeof content.value !== "object" || content.value === null) {
    return defaultHomePageContent;
  }

  const value = content.value as Record<string, unknown>;

  return {
    heroBadge:
      typeof value.heroBadge === "string"
        ? value.heroBadge
        : defaultHomePageContent.heroBadge,
    heroTitle:
      typeof value.heroTitle === "string"
        ? value.heroTitle
        : defaultHomePageContent.heroTitle,
    heroTitleAccent:
      typeof value.heroTitleAccent === "string"
        ? value.heroTitleAccent
        : defaultHomePageContent.heroTitleAccent,
    heroDescription:
      typeof value.heroDescription === "string"
        ? value.heroDescription
        : defaultHomePageContent.heroDescription,
    aboutTitle:
      typeof value.aboutTitle === "string"
        ? value.aboutTitle
        : defaultHomePageContent.aboutTitle,
    aboutIntro:
      typeof value.aboutIntro === "string"
        ? value.aboutIntro
        : defaultHomePageContent.aboutIntro,
    aboutDescription:
      typeof value.aboutDescription === "string"
        ? value.aboutDescription
        : defaultHomePageContent.aboutDescription,
    bookingTitle:
      typeof value.bookingTitle === "string"
        ? value.bookingTitle
        : defaultHomePageContent.bookingTitle,
    bookingDescription:
      typeof value.bookingDescription === "string"
        ? value.bookingDescription
        : defaultHomePageContent.bookingDescription,
    navLinks: normalizeNavLinks(value.navLinks),
    sections: normalizeHomeSections(value.sections),
    services: normalizeServices(value.services),
    contacts: normalizeContacts(value.contacts),
  };
}

export async function upsertHomePageContent(content: HomePageContent) {
  return db.siteContent.upsert({
    where: { key: HOME_CONTENT_KEY },
    update: { value: content },
    create: { key: HOME_CONTENT_KEY, value: content },
  });
}

export async function getManagedContentPages() {
  try {
    const pages = await db.contentPage.findMany({
      orderBy: [{ pageType: "asc" }, { updatedAt: "desc" }],
    });

    const dbPages = pages.map(mapContentPage);
    return dedupePagesBySlug([...dbPages, ...fallbackManagedArticles]);
  } catch (error) {
    console.error("Failed to load managed content pages, using fallback", error);
    return fallbackManagedArticles;
  }
}

export async function getPublishedArticles() {
  try {
    const pages = await db.contentPage.findMany({
      where: {
        pageType: "article",
        published: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const dbPages = pages.map(mapContentPage);
    const homepageFallbackArticles = fallbackManagedArticles.filter(
      (article) => article.pageType === "article"
    );

    return dedupePagesBySlug([...dbPages, ...homepageFallbackArticles]);
  } catch (error) {
    console.error("Failed to load published articles, using fallback", error);
    return fallbackManagedArticles.filter(
      (article) => article.pageType === "article"
    );
  }
}

export async function getHomepageArticles() {
  const articles = await getPublishedArticles();
  return articles.filter((article) => article.showOnHomepage);
}

export async function getPublishedContentPageBySlug(
  slug: string,
  pageType?: "article" | "page"
) {
  try {
    const page = await db.contentPage.findUnique({
      where: { slug },
    });

    if (page && page.published) {
      const mapped = mapContentPage(page);
      if (!pageType || mapped.pageType === pageType) {
        return mapped;
      }
    }
  } catch (error) {
    console.error(`Failed to load content page "${slug}", using fallback`, error);
  }

  return fallbackManagedArticles.find(
    (article) =>
      article.slug === slug && (!pageType || article.pageType === pageType)
  );
}

export async function createManagedContentPage(input: {
  content: string;
  excerpt: string;
  pageType: "article" | "page";
  published: boolean;
  researchHref?: string;
  researchLabel?: string;
  showOnHomepage: boolean;
  slug: string;
  sourceHref?: string;
  sourceLabel?: string;
  summaryPoints: string[];
  title: string;
}) {
  return db.contentPage.create({
    data: {
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      pageType: input.pageType,
      published: input.published,
      showOnHomepage: input.showOnHomepage,
      summaryPoints: input.summaryPoints,
      sourceLabel: input.sourceLabel?.trim() || null,
      sourceHref: input.sourceHref?.trim() || null,
      researchLabel: input.researchLabel?.trim() || null,
      researchHref: input.researchHref?.trim() || null,
    },
  });
}

export async function updateManagedContentPage(
  id: number,
  input: {
    content: string;
    excerpt: string;
    pageType: "article" | "page";
    published: boolean;
    researchHref?: string;
    researchLabel?: string;
    showOnHomepage: boolean;
    slug: string;
    sourceHref?: string;
    sourceLabel?: string;
    summaryPoints: string[];
    title: string;
  }
) {
  return db.contentPage.update({
    where: { id },
    data: {
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      pageType: input.pageType,
      published: input.published,
      showOnHomepage: input.showOnHomepage,
      summaryPoints: input.summaryPoints,
      sourceLabel: input.sourceLabel?.trim() || null,
      sourceHref: input.sourceHref?.trim() || null,
      researchLabel: input.researchLabel?.trim() || null,
      researchHref: input.researchHref?.trim() || null,
    },
  });
}

export async function deleteManagedContentPage(id: number) {
  return db.contentPage.delete({
    where: { id },
  });
}
