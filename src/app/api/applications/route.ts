import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import {
  isPreferredTimeAvailable,
  parsePreferredTime,
} from "@/lib/booking-availability";
import {
  applicationFormSchema,
  formatApplicationNumber,
  generateApplicationVerificationCode,
  getApplicationContactMethod,
} from "@/lib/applications";

type CreatedApplicationRow = {
  id: number;
  preferredTime: string | null;
  verificationCode: string | null;
};

type PreferredTimeRow = {
  preferredTime: string | null;
};

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = applicationFormSchema.parse(json);
    const contactMethod = getApplicationContactMethod(payload.contactMethod);
    const phone = payload.phone?.trim() || "";
    const email = payload.email?.trim() || null;
    const contactValue = [phone, email]
      .map((value) => value?.trim())
      .find(Boolean);
    const verificationCode = generateApplicationVerificationCode();
    const parsedPreferredTime = parsePreferredTime(payload.preferredTime);

    if (!parsedPreferredTime) {
      return NextResponse.json(
        {
          ok: false,
          message: "Выберите корректную дату и время консультации.",
        },
        { status: 400 }
      );
    }

    const existingRows = await db.$queryRaw<PreferredTimeRow[]>(Prisma.sql`
      select "preferredTime"
      from "Application"
      where "preferredTime" like ${`${parsedPreferredTime.dateKey}T%`}
        and coalesce("status", 'new') <> 'archived'
    `);
    const existingPreferredTimes = existingRows
      .map((row) => row.preferredTime)
      .filter((value): value is string => Boolean(value));

    if (
      !isPreferredTimeAvailable(
        payload.preferredTime,
        existingPreferredTimes
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Это время уже занято или недоступно. Пожалуйста, выберите другой слот.",
        },
        { status: 400 }
      );
    }

    const [application] = await db.$queryRaw<CreatedApplicationRow[]>(Prisma.sql`
      insert into "Application" (
        "name",
        "email",
        "phone",
        "gender",
        "age",
        "preferredTime",
        "reason",
        "contactMethod",
        "contactValue",
        "verificationCode",
        "source",
        "createdAt",
        "updatedAt"
      )
      values (
        ${payload.name},
        ${email},
        ${phone},
        ${payload.gender},
        ${payload.age},
        ${payload.preferredTime},
        ${payload.reason},
        ${payload.contactMethod},
        ${contactValue || null},
        ${verificationCode},
        ${"website"},
        now(),
        now()
      )
      returning "id", "preferredTime", "verificationCode"
    `);

    if (!application) {
      throw new Error("Application insert returned no rows");
    }

    return NextResponse.json(
      {
        ok: true,
        applicationId: application.id,
        applicationNumber: formatApplicationNumber(
          application.id,
          application.verificationCode
        ),
        contactMethod: contactMethod.label,
        contactHref: contactMethod.href,
        preferredTime: application.preferredTime,
        verificationCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create application", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: error.issues[0]?.message ?? "Проверьте заполнение формы.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Не удалось отправить заявку. Попробуйте еще раз.",
      },
      { status: 400 }
    );
  }
}
