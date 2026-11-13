import { neon } from "@neondatabase/serverless";
import type { Product } from "./types";

type ProductRow = {
  id: number;
  name: string;
  tagline: string;
  description: string;
  category: Product["category"];
  olfactoryFamily: string | null;
  price: number;
  stock: number;
  image: string;
  concentration: string;
  sillage: Product["sillage"];
  longevity: string;
  season: string;
  notes: Product["notes"];
  variants: Product["variants"];
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
};

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith("postgres")) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
}

async function ensureProductsTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      "olfactoryFamily" TEXT,
      price NUMERIC NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      image TEXT NOT NULL,
      concentration TEXT NOT NULL,
      sillage TEXT NOT NULL,
      longevity TEXT NOT NULL,
      season TEXT NOT NULL,
      notes JSONB NOT NULL DEFAULT '{"top":[],"heart":[],"base":[]}'::jsonb,
      variants JSONB NOT NULL DEFAULT '[]'::jsonb,
      "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
      rating NUMERIC NOT NULL DEFAULT 5,
      "reviewCount" INTEGER NOT NULL DEFAULT 1
    )
  `;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS "featuredOrder" INTEGER DEFAULT NULL`;
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    category: row.category,
    olfactoryFamily: row.olfactoryFamily || undefined,
    price: Number(row.price),
    stock: row.stock,
    image: row.image,
    concentration: row.concentration,
    sillage: row.sillage,
    longevity: row.longevity,
    season: row.season,
    notes: row.notes,
    variants: row.variants || [],
    isFeatured: row.isFeatured,
    rating: Number(row.rating),
    reviewCount: row.reviewCount,
  };
}

export async function listNeonProducts() {
  await ensureProductsTable();
  const sql = getSql();
  const rows = await sql`SELECT * FROM products ORDER BY id DESC`;
  return rows.map((row) => mapProduct(row as ProductRow));
}

export async function getNeonProduct(id: number) {
  await ensureProductsTable();
  const sql = getSql();
  const rows = await sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`;
  return rows.length ? mapProduct(rows[0] as ProductRow) : null;
}

export async function createNeonProduct(input: Omit<Product, "id">) {
  await ensureProductsTable();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO products (
      name, tagline, description, category, "olfactoryFamily", price, stock,
      image, concentration, sillage, longevity, season, notes, variants,
      "isFeatured", rating, "reviewCount"
    ) VALUES (
      ${input.name}, ${input.tagline}, ${input.description}, ${input.category},
      ${input.olfactoryFamily || null}, ${input.price}, ${input.stock},
      ${input.image}, ${input.concentration}, ${input.sillage}, ${input.longevity},
      ${input.season}, ${JSON.stringify(input.notes)}, ${JSON.stringify(input.variants || [])},
      ${input.isFeatured}, ${input.rating}, ${input.reviewCount}
    )
    RETURNING *
  `;
  return mapProduct(rows[0] as ProductRow);
}

export async function updateNeonProduct(id: number, input: Partial<Product>) {
  await ensureProductsTable();
  const current = await getNeonProduct(id);
  if (!current) return null;

  const next = { ...current, ...input };
  const sql = getSql();
  const rows = await sql`
    UPDATE products SET
      name = ${next.name},
      tagline = ${next.tagline},
      description = ${next.description},
      category = ${next.category},
      "olfactoryFamily" = ${next.olfactoryFamily || null},
      price = ${next.price},
      stock = ${next.stock},
      image = ${next.image},
      concentration = ${next.concentration},
      sillage = ${next.sillage},
      longevity = ${next.longevity},
      season = ${next.season},
      notes = ${JSON.stringify(next.notes)},
      variants = ${JSON.stringify(next.variants || [])},
      "isFeatured" = ${next.isFeatured},
      rating = ${next.rating},
      "reviewCount" = ${next.reviewCount}
    WHERE id = ${id}
    RETURNING *
  `;
  return mapProduct(rows[0] as ProductRow);
}

export async function deleteNeonProduct(id: number) {
  await ensureProductsTable();
  const sql = getSql();
  const rows = await sql`DELETE FROM products WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function getNeonFeaturedProducts() {
  await ensureProductsTable();
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM products 
    WHERE "isFeatured" = TRUE 
    ORDER BY "featuredOrder" ASC NULLS LAST, id DESC
    LIMIT 4
  `;
  return rows.map((row) => mapProduct(row as ProductRow));
}

export async function setNeonFeaturedProducts(ids: number[]) {
  await ensureProductsTable();
  const sql = getSql();
  await sql`UPDATE products SET "isFeatured" = FALSE, "featuredOrder" = NULL`;
  for (let index = 0; index < ids.length; index++) {
    const id = ids[index];
    await sql`UPDATE products SET "isFeatured" = TRUE, "featuredOrder" = ${index + 1} WHERE id = ${id}`;
  }
  return getNeonFeaturedProducts();
}
