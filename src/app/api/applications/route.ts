import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import {
  applicationFormSchema,
  formatApplicationNumber,
} from "@/lib/applications";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = applicationFormSchema.parse(json);

    const application = await db.application.create({
      data: {
        ...payload,
        source: "website",
      },
    });

    return NextResponse.json(
      {
        ok: true,
        applicationNumber: formatApplicationNumber(application.id),
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
