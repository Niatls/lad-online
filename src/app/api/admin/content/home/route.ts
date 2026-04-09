import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  defaultHomeContacts,
  defaultHomeNavLinks,
  defaultHomePageContent,
  defaultHomeServices,
  upsertHomePageContent,
  type HomePageContent,
} from "@/lib/content";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  if (!isAdminAuthenticated(cookieStore)) {
    return NextResponse.json(
      { ok: false, message: "Требуется вход в админку." },
      { status: 401 }
    );
  }

  try {
    const payload = (await request.json()) as Partial<HomePageContent>;
    const navLinks = Array.isArray(payload.navLinks)
      ? payload.navLinks
          .map((item) => ({
            label: item?.label?.trim() || "",
            target: item?.target?.trim() || "",
          }))
          .filter((item) => item.label && item.target)
      : defaultHomeNavLinks;

    const services = Array.isArray(payload.services)
      ? payload.services
          .map((item) => ({
            title: item?.title?.trim() || "",
            description: item?.description?.trim() || "",
          }))
          .filter((item) => item.title && item.description)
      : defaultHomeServices;

    const content: HomePageContent = {
      heroBadge: payload.heroBadge?.trim() || defaultHomePageContent.heroBadge,
      heroTitle: payload.heroTitle?.trim() || defaultHomePageContent.heroTitle,
      heroTitleAccent:
        payload.heroTitleAccent?.trim() ||
        defaultHomePageContent.heroTitleAccent,
      heroDescription:
        payload.heroDescription?.trim() ||
        defaultHomePageContent.heroDescription,
      aboutTitle:
        payload.aboutTitle?.trim() || defaultHomePageContent.aboutTitle,
      aboutIntro:
        payload.aboutIntro?.trim() || defaultHomePageContent.aboutIntro,
      aboutDescription:
        payload.aboutDescription?.trim() ||
        defaultHomePageContent.aboutDescription,
      bookingTitle:
        payload.bookingTitle?.trim() || defaultHomePageContent.bookingTitle,
      bookingDescription:
        payload.bookingDescription?.trim() ||
        defaultHomePageContent.bookingDescription,
      navLinks: navLinks.length ? navLinks : defaultHomeNavLinks,
      services: services.length ? services : defaultHomeServices,
      contacts: {
        brandName:
          payload.contacts?.brandName?.trim() || defaultHomeContacts.brandName,
        description:
          payload.contacts?.description?.trim() ||
          defaultHomeContacts.description,
        phone: payload.contacts?.phone?.trim() || defaultHomeContacts.phone,
        phoneHref:
          payload.contacts?.phoneHref?.trim() || defaultHomeContacts.phoneHref,
        email: payload.contacts?.email?.trim() || defaultHomeContacts.email,
        emailHref:
          payload.contacts?.emailHref?.trim() || defaultHomeContacts.emailHref,
        formatLabel:
          payload.contacts?.formatLabel?.trim() ||
          defaultHomeContacts.formatLabel,
        dataProtectionLabel:
          payload.contacts?.dataProtectionLabel?.trim() ||
          defaultHomeContacts.dataProtectionLabel,
      },
    };

    await upsertHomePageContent(content);

    revalidatePath("/");
    revalidatePath("/admin/editor");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save homepage content", error);

    return NextResponse.json(
      { ok: false, message: "Не удалось сохранить главную страницу." },
      { status: 500 }
    );
  }
}
