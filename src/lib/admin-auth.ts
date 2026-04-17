import { createHash } from "node:crypto";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

const ADMIN_SESSION_COOKIE = "lad_admin_session";

export function isAdminPasswordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export function getAdminSessionCookieName() {
  return ADMIN_SESSION_COOKIE;
}

export function getAdminSessionToken() {
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!password) {
    return null;
  }

  return createHash("sha256")
    .update(`lad-admin:${password}`)
    .digest("hex");
}

export function isAdminAuthenticated(cookieStore: ReadonlyRequestCookies, authHeader?: string | null) {
  if (!isAdminPasswordConfigured()) {
    return true;
  }

  const token = getAdminSessionToken();
  if (!token) return false;

  // Check cookie
  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value === token) {
    return true;
  }

  // Check Authorization header (Bearer token)
  if (authHeader) {
    const bearerToken = authHeader.startsWith("Bearer ") 
      ? authHeader.substring(7) 
      : authHeader;
    if (bearerToken === token) {
      return true;
    }
  }

  return false;
}
