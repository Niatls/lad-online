import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import {
  applicationFormSchema,
  formatApplicationNumber,
  generateApplicationVerificationCode,
  getApplicationContactMethod,
} from "@/lib/applications";

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

    const application = await db.application.create({
      data: {
        name: payload.name,
        email,
        phone,
        gender: payload.gender,
        age: payload.age,
        preferredTime: payload.preferredTime,
        reason: payload.reason,
        contactMethod: payload.contactMethod,
        contactValue: contactValue || null,
        verificationCode,
        source: "website",
      },
    });

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
