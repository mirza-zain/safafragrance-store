import { neon } from "@neondatabase/serverless";

export type SitePromo = {
  id: number;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  updatedAt: string;
};

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith("postgres")) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (i + 1)));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Database operation failed");
}

async function ensurePromoTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS site_promo (
      id SERIAL PRIMARY KEY,
      image_url TEXT NOT NULL,
      link_url TEXT,
      is_active BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

function mapPromo(row: {
  id: number;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  updated_at: string | Date;
}): SitePromo {
  return {
    id: Number(row.id),
    imageUrl: row.image_url,
    linkUrl: row.link_url ?? null,
    isActive: Boolean(row.is_active),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function getSitePromo(): Promise<SitePromo | null> {
  return withRetry(async () => {
    await ensurePromoTable();
    const sql = getSql();
    const rows = await sql`SELECT id, image_url, link_url, is_active, updated_at FROM site_promo ORDER BY id ASC LIMIT 1`;
    if (rows.length === 0) return null;
    return mapPromo(rows[0] as Parameters<typeof mapPromo>[0]);
  });
}

export async function upsertSitePromo(input: {
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
}): Promise<SitePromo | null> {
  return withRetry(async () => {
    await ensurePromoTable();
    const sql = getSql();
    const existing = await sql`SELECT id FROM site_promo ORDER BY id ASC LIMIT 1`;
    const now = new Date().toISOString();

    if (existing.length > 0) {
      await sql`
        UPDATE site_promo
        SET image_url = ${input.imageUrl},
            link_url = ${input.linkUrl},
            is_active = ${input.isActive},
            updated_at = ${now}
        WHERE id = ${Number(existing[0].id)}
      `;
    } else {
      await sql`
        INSERT INTO site_promo (image_url, link_url, is_active, updated_at)
        VALUES (${input.imageUrl}, ${input.linkUrl}, ${input.isActive}, ${now})
      `;
    }

    const rows = await sql`SELECT id, image_url, link_url, is_active, updated_at FROM site_promo ORDER BY id ASC LIMIT 1`;
    if (rows.length === 0) return null;
    return mapPromo(rows[0] as Parameters<typeof mapPromo>[0]);
  });
}
