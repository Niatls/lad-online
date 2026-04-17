import "server-only";

import type { ApplicationFormInput } from "@/lib/applications";
import {
  formatApplicationNumber,
  generateApplicationVerificationCode,
  getApplicationContactMethod,
} from "@/lib/applications";
import {
  buildAvailableBookingTimes,
  parsePreferredTime,
} from "@/lib/booking-availability";
import { db } from "@/lib/db";

type CreateApplicationOptions = {
  externalUserId?: string | null;
  source: string;
};

export async function loadAvailableBookingTimes(dateKey: string) {
  const rows = await db.application.findMany({
    select: {
      preferredTime: true,
    },
    where: {
      preferredTime: {
        startsWith: `${dateKey}T`,
      },
      NOT: {
        status: "archived",
      },
    },
  });

  const preferredTimes = rows
    .map((row) => row.preferredTime)
    .filter((value): value is string => Boolean(value));

  return buildAvailableBookingTimes(dateKey, preferredTimes);
}

export async function createApplicationSubmission(
  payload: ApplicationFormInput,
  options: CreateApplicationOptions
) {
  const parsedPreferredTime = parsePreferredTime(payload.preferredTime);

  if (!parsedPreferredTime) {
    throw new Error("INVALID_PREFERRED_TIME");
  }

  const availableTimes = await loadAvailableBookingTimes(parsedPreferredTime.dateKey);

  if (!availableTimes.includes(parsedPreferredTime.time)) {
    throw new Error("PREFERRED_TIME_UNAVAILABLE");
  }

  const phone = payload.phone?.trim() || "";
  const email = payload.email?.trim() || null;
  const verificationCode = generateApplicationVerificationCode();
  const contactMethod = getApplicationContactMethod(payload.contactMethod);
  const contactValue = [phone, email]
    .map((value) => value?.trim())
    .find(Boolean);

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
      source: options.source,
      telegramId:
        options.source === "telegram_bot" ? options.externalUserId ?? null : null,
    },
    select: {
      id: true,
      preferredTime: true,
      verificationCode: true,
    },
  });

  return {
    applicationId: application.id,
    applicationNumber: formatApplicationNumber(
      application.id,
      application.verificationCode
    ),
    contactHref: contactMethod.href,
    contactMethod: contactMethod.label,
    preferredTime: application.preferredTime,
    verificationCode,
  };
}
