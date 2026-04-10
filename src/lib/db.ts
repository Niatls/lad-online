import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

function buildRuntimeDatabaseUrl() {
  const pooledUrl =
    process.env.LADSTORAGE_POSTGRES_PRISMA_URL ||
    process.env.LADSTORAGE_DATABASE_URL ||
    process.env.DATABASE_URL;

  if (!pooledUrl) {
    return undefined;
  }

  const url = new URL(pooledUrl);

  // Neon behaves more reliably in Next.js when runtime traffic uses the pooler
  // and Prisma keeps its own pool very small.
  if (!url.hostname.includes("-pooler.") && process.env.LADSTORAGE_PGHOST) {
    url.hostname = process.env.LADSTORAGE_PGHOST;
  }

  if (!url.searchParams.has("sslmode")) {
    url.searchParams.set("sslmode", "require");
  }

  if (!url.searchParams.has("connect_timeout")) {
    url.searchParams.set("connect_timeout", "15");
  }

  if (!url.searchParams.has("connection_limit")) {
    url.searchParams.set("connection_limit", "1");
  }

  if (!url.searchParams.has("pool_timeout")) {
    url.searchParams.set("pool_timeout", "15");
  }

  if (url.hostname.includes("-pooler.") && !url.searchParams.has("pgbouncer")) {
    url.searchParams.set("pgbouncer", "true");
  }

  return url.toString();
}

const runtimeDatabaseUrl = buildRuntimeDatabaseUrl();

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : ["error"],
    datasources: runtimeDatabaseUrl
      ? {
          db: {
            url: runtimeDatabaseUrl,
          },
        }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
