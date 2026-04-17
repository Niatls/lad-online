import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { createApplicationSubmission } from "@/lib/application-submission";
import { applicationFormSchema } from "@/lib/applications";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = applicationFormSchema.parse(json);
    const application = await createApplicationSubmission(payload, {
      source: "website",
    });

    return NextResponse.json(
      {
        ok: true,
        applicationId: application.applicationId,
        applicationNumber: application.applicationNumber,
        contactMethod: application.contactMethod,
        contactHref: application.contactHref,
        preferredTime: application.preferredTime,
        verificationCode: application.verificationCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create application", error);

    if (error instanceof Error && error.message === "INVALID_PREFERRED_TIME") {
      return NextResponse.json(
        {
          ok: false,
          message: "Выберите корректную дату и время консультации.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "PREFERRED_TIME_UNAVAILABLE"
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
