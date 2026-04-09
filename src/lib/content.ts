import { db } from "@/lib/db";
import { articles as fallbackArticles } from "@/components/home/home-data";

export type HomePageContent = {
  aboutDescription: string;
  aboutIntro: string;
  aboutTitle: string;
  bookingDescription: string;
  bookingTitle: string;
  heroBadge: string;
  heroDescription: string;
  heroTitle: string;
  heroTitleAccent: string;
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
    (article) => article.slug === slug && (!pageType || article.pageType === pageType)
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
