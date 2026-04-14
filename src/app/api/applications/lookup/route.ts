import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  applicationLookupSchema,
  formatApplicationNumber,
  getApplicationContactMethod,
  parseApplicationCode,
} from "@/lib/applications";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = applicationLookupSchema.parse(json);
    const applicationCode = parseApplicationCode(payload.applicationCode);

    if (!Number.isFinite(applicationCode.id)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Проверьте код заявки.",
        },
        { status: 400 }
      );
    }

    const application = await db.application.findFirst({
      where: {
        id: applicationCode.id,
        ...(applicationCode.verificationCode
          ? { verificationCode: applicationCode.verificationCode }
          : {}),
      },
      select: {
        id: true,
        contactMethod: true,
        preferredTime: true,
        verificationCode: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          ok: false,
          message: "Заявка с таким кодом не найдена.",
        },
        { status: 404 }
      );
    }

    const contactMethod = getApplicationContactMethod(
      application.contactMethod
    );

    return NextResponse.json({
      ok: true,
      applicationNumber: formatApplicationNumber(
        application.id,
        application.verificationCode
      ),
      contactMethod: contactMethod.label,
      contactHref: contactMethod.href,
      preferredTime: application.preferredTime,
    });
  } catch (error) {
    console.error("Failed to lookup application", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: error.issues[0]?.message ?? "Проверьте данные.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Не удалось проверить заявку. Попробуйте еще раз.",
      },
      { status: 400 }
    );
  }
}
