import { NextResponse } from "next/server";
import {
  getAdminSessionCookieName,
  getAdminSessionToken,
  isAdminPasswordConfigured,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const url = new URL("/admin", request.url);

  if (!isAdminPasswordConfigured()) {
    return NextResponse.redirect(url);
  }

  const formData = await request.formData();
  const password = formData.get("password");

  if (typeof password !== "string" || password !== process.env.ADMIN_PASSWORD) {
    url.searchParams.set("error", "invalid_password");
    return NextResponse.redirect(url);
  }

  const response = NextResponse.redirect(url);

  response.cookies.set({
    name: getAdminSessionCookieName(),
    value: getAdminSessionToken() ?? "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return response;
}
