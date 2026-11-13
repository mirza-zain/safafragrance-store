import { neon } from "@neondatabase/serverless";
import type { DeliveryCharge, DiscountCode, Order } from "./types";

type AnyOrderRow = {
  id: number;
  trackingId?: string;
  tracking_id?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  email: string;
  phoneCountryCode?: string;
  phone_country_code?: string;
  phoneNum?: string;
  phone_num?: string;
  address: string;
  city: string;
  country: string;
  paymentMethod?: Order["paymentMethod"];
  payment_method?: Order["paymentMethod"];
  paymentStatus?: Order["paymentStatus"];
  payment_status?: Order["paymentStatus"];
  paymentReceipt?: string | null;
  payment_receipt?: string | null;
  status: Order["status"];
  items: Order["items"] | string;
  subTotal?: number;
  subtotal?: number;
  discountCode?: string | null;
  discount_code?: string | null;
  discountAmount?: number;
  discount_amount?: number;
  deliveryAmount?: number;
  delivery_amount?: number;
  totalAmount?: number;
  total_amount?: number;
  createdAt?: string | Date;
  created_at?: string | Date;
  carrier?: string | null;
  notes?: string | null;
};

type DeliveryRow = { id: number; city: string; amount: number; active: boolean };
type DiscountRow = {
  id: number;
  code: string;
  type: DiscountCode["type"];
  value: number;
  min_amount: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | Date | null;
  active: boolean;
};

export type CreateNeonOrderInput = Omit<Order, "id" | "trackingId" | "createdAt" | "status" | "paymentStatus"> & {
  trackingId?: string;
  status?: Order["status"];
  paymentStatus?: Order["paymentStatus"];
};
export type CreateNeonDiscountInput = Omit<DiscountCode, "id" | "usedCount"> & { usedCount?: number };

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith("postgres")) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: any;
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
  throw lastError;
}

async function ensureCommerceTables() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      "trackingId" TEXT NOT NULL UNIQUE,
      "firstName" TEXT NOT NULL,
      "lastName" TEXT NOT NULL,
      email TEXT NOT NULL,
      "phoneCountryCode" TEXT NOT NULL DEFAULT '+92',
      "phoneNum" TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      "paymentMethod" TEXT NOT NULL,
      "paymentStatus" TEXT NOT NULL,
      "paymentReceipt" TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      "subTotal" NUMERIC NOT NULL DEFAULT 0,
      "discountCode" TEXT,
      "discountAmount" NUMERIC NOT NULL DEFAULT 0,
      "deliveryAmount" NUMERIC NOT NULL DEFAULT 0,
      "totalAmount" NUMERIC NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      carrier TEXT,
      notes TEXT
    )
  `;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS "phoneCountryCode" TEXT DEFAULT '+92'`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS delivery_charges (
      id SERIAL PRIMARY KEY,
      city TEXT NOT NULL UNIQUE,
      amount NUMERIC NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS discount_codes (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      value NUMERIC NOT NULL,
      min_amount NUMERIC NOT NULL DEFAULT 0,
      max_uses INTEGER,
      used_count INTEGER NOT NULL DEFAULT 0,
      expires_at TIMESTAMPTZ,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS _schema_init (
      key TEXT PRIMARY KEY,
      initialized_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  const initCheck = await sql`
    SELECT key FROM _schema_init WHERE key = 'initial_pricing_seeded' LIMIT 1
  `;
  if (initCheck.length === 0) {
    await sql`
      INSERT INTO _schema_init (key) VALUES ('initial_pricing_seeded') ON CONFLICT DO NOTHING
    `;
    await sql`
      INSERT INTO delivery_charges (city, amount, active) VALUES
        ('Karachi', 0, TRUE), ('Lahore', 250, TRUE), ('Islamabad', 250, TRUE),
        ('Rawalpindi', 250, TRUE), ('Faisalabad', 250, TRUE), ('Multan', 250, TRUE),
        ('Peshawar', 300, TRUE), ('Quetta', 350, TRUE), ('Other Cities (Nationwide)', 250, TRUE)
      ON CONFLICT (city) DO NOTHING
    `;
    await sql`
      INSERT INTO discount_codes (code, type, value, min_amount, max_uses, used_count, active)
      VALUES ('WELCOME15', 'percentage', 15, 0, 10, 0, TRUE)
      ON CONFLICT (code) DO NOTHING
    `;
  }
}

function mapOrder(row: AnyOrderRow): Order {
  let parsedItems: Order["items"] = [];
  if (Array.isArray(row.items)) {
    parsedItems = row.items;
  } else if (typeof row.items === "string") {
    try {
      parsedItems = JSON.parse(row.items);
    } catch {
      parsedItems = [];
    }
  }

  const rawCreatedAt = row.createdAt || row.created_at;
  const createdAtIso = rawCreatedAt
    ? new Date(rawCreatedAt).toISOString()
    : new Date().toISOString();

  return {
    id: row.id,
    trackingId: row.trackingId || row.tracking_id || "",
    firstName: row.firstName || row.first_name || "",
    lastName: row.lastName || row.last_name || "",
    email: row.email || "",
    phoneCountryCode: row.phoneCountryCode || row.phone_country_code || "+92",
    phoneNum: row.phoneNum || row.phone_num || "",
    address: row.address || "",
    city: row.city || "",
    country: row.country || "",
    paymentMethod: row.paymentMethod || row.payment_method || "cod",
    paymentStatus: row.paymentStatus || row.payment_status || "unpaid",
    paymentReceipt: row.paymentReceipt || row.payment_receipt || undefined,
    status: row.status || "pending",
    items: parsedItems,
    subTotal: Number(row.subTotal ?? row.subtotal ?? 0),
    discountCode: row.discountCode || row.discount_code || undefined,
    discountAmount: Number(row.discountAmount ?? row.discount_amount ?? 0),
    deliveryAmount: Number(row.deliveryAmount ?? row.delivery_amount ?? 0),
    totalAmount: Number(row.totalAmount ?? row.total_amount ?? 0),
    createdAt: createdAtIso,
    carrier: row.carrier || undefined,
    notes: row.notes || undefined,
  };
}

function mapDelivery(row: DeliveryRow): DeliveryCharge {
  return { id: row.id, city: row.city, amount: Number(row.amount), active: row.active };
}

function mapDiscount(row: DiscountRow): DiscountCode {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: Number(row.value),
    minAmount: Number(row.min_amount),
    maxUses: row.max_uses,
    usedCount: row.used_count,
    expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
    active: row.active,
  };
}

export async function listNeonOrders(): Promise<Order[]> {
  return withRetry(async () => {
    await ensureCommerceTables();
    const sql = getSql();
    let rows: AnyOrderRow[];
    try {
      rows = (await sql`SELECT * FROM orders ORDER BY "createdAt" DESC`) as AnyOrderRow[];
    } catch {
      rows = (await sql`SELECT * FROM orders ORDER BY id DESC`) as AnyOrderRow[];
    }
    return rows.map((row) => mapOrder(row));
  });
}

export async function getNeonOrder(id: number): Promise<Order | null> {
  return withRetry(async () => {
    await ensureCommerceTables();
    const sql = getSql();
    const rows = (await sql`SELECT * FROM orders WHERE id = ${id} LIMIT 1`) as AnyOrderRow[];
    return rows.length ? mapOrder(rows[0]) : null;
  });
}

export async function getNeonOrderByTrackingId(trackingId: string): Promise<Order | null> {
  return withRetry(async () => {
    await ensureCommerceTables();
    const sql = getSql();
    const trimmed = trackingId.trim();
    let rows: AnyOrderRow[];
    try {
      rows = (await sql`SELECT * FROM orders WHERE UPPER("trackingId") = UPPER(${trimmed}) LIMIT 1`) as AnyOrderRow[];
    } catch {
      rows = (await sql`SELECT * FROM orders WHERE UPPER(tracking_id) = UPPER(${trimmed}) LIMIT 1`) as AnyOrderRow[];
    }
    return rows.length ? mapOrder(rows[0]) : null;
  });
}

export async function createNeonOrder(input: CreateNeonOrderInput): Promise<Order> {
  return withRetry(async () => {
    await ensureCommerceTables();
    const sql = getSql();
    const trackingId = input.trackingId || `SAFA-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
    const paymentStatus = input.paymentStatus || (input.paymentMethod === "bank_transfer" ? "pending_verification" : "unpaid");
    const rows = (await sql`
      INSERT INTO orders (
        "trackingId", "firstName", "lastName", email, "phoneCountryCode", "phoneNum",
        address, city, country, "paymentMethod", "paymentStatus", "paymentReceipt",
        status, items, "subTotal", "discountCode", "discountAmount", "deliveryAmount",
        "totalAmount", carrier, notes
      ) VALUES (
        ${trackingId}, ${input.firstName}, ${input.lastName}, ${input.email}, ${input.phoneCountryCode || "+92"},
        ${input.phoneNum}, ${input.address}, ${input.city}, ${input.country}, ${input.paymentMethod},
        ${paymentStatus}, ${input.paymentReceipt || null}, ${input.status || "pending"},
        ${JSON.stringify(input.items)}, ${input.subTotal}, ${input.discountCode || null},
        ${input.discountAmount}, ${input.deliveryAmount}, ${input.totalAmount}, ${input.carrier || null},
        ${input.notes || null}
      ) RETURNING *
    `) as AnyOrderRow[];
    return mapOrder(rows[0]);
  });
}

export async function updateNeonOrder(id: number, input: Partial<Omit<Order, "id" | "createdAt">>): Promise<Order | null> {
  return withRetry(async () => {
    await ensureCommerceTables();
    const current = await getNeonOrder(id);
    if (!current) return null;
    const next = { ...current, ...input };
    const sql = getSql();
    const rows = (await sql`
      UPDATE orders SET
        "trackingId" = ${next.trackingId},
        "firstName" = ${next.firstName},
        "lastName" = ${next.lastName},
        email = ${next.email},
        "phoneCountryCode" = ${next.phoneCountryCode || "+92"},
        "phoneNum" = ${next.phoneNum},
        address = ${next.address},
        city = ${next.city},
        country = ${next.country},
        "paymentMethod" = ${next.paymentMethod},
        "paymentStatus" = ${next.paymentStatus},
        "paymentReceipt" = ${next.paymentReceipt || null},
        status = ${next.status},
        items = ${JSON.stringify(next.items)},
        "subTotal" = ${next.subTotal},
        "discountCode" = ${next.discountCode || null},
        "discountAmount" = ${next.discountAmount},
        "deliveryAmount" = ${next.deliveryAmount},
        "totalAmount" = ${next.totalAmount},
        carrier = ${next.carrier || null},
        notes = ${next.notes || null},
        "updatedAt" = NOW()
      WHERE id = ${id} RETURNING *
    `) as AnyOrderRow[];
    return rows.length ? mapOrder(rows[0]) : null;
  });
}

export async function deleteNeonOrder(id: number): Promise<boolean> {
  await ensureCommerceTables();
  const sql = getSql();
  const rows = await sql`DELETE FROM orders WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function listNeonDeliveryCharges(): Promise<DeliveryCharge[]> {
  return withRetry(async () => {
    await ensureCommerceTables();
    const sql = getSql();
    const rows = (await sql`SELECT * FROM delivery_charges ORDER BY id`) as DeliveryRow[];
    return rows.map((row) => mapDelivery(row));
  });
}

export async function addNeonDeliveryCharge(input: Omit<DeliveryCharge, "id">): Promise<DeliveryCharge> {
  return withRetry(async () => {
    await ensureCommerceTables();
    const sql = getSql();
    const rows = (await sql`INSERT INTO delivery_charges (city, amount, active) VALUES (${input.city}, ${input.amount}, ${input.active}) RETURNING *`) as DeliveryRow[];
    return mapDelivery(rows[0]);
  });
}

export async function toggleNeonDeliveryCharge(id: number, active?: boolean): Promise<DeliveryCharge | null> {
  return withRetry(async () => {
    await ensureCommerceTables();
    const sql = getSql();
    const rows = (await sql`UPDATE delivery_charges SET active = COALESCE(${active ?? null}, NOT active) WHERE id = ${id} RETURNING *`) as DeliveryRow[];
    return rows.length ? mapDelivery(rows[0]) : null;
  });
}

export async function deleteNeonDeliveryCharge(id: number): Promise<boolean> {
  return withRetry(async () => {
    await ensureCommerceTables();
    const sql = getSql();
    const rows = await sql`DELETE FROM delivery_charges WHERE id = ${id} RETURNING id`;
    return rows.length > 0;
  });
}

export async function listNeonDiscounts(): Promise<DiscountCode[]> {
  return withRetry(async () => {
    await ensureCommerceTables();
    const sql = getSql();
    const rows = (await sql`SELECT * FROM discount_codes ORDER BY id`) as DiscountRow[];
    return rows.map((row) => mapDiscount(row));
  });
}

export async function getNeonDiscountByCode(code: string): Promise<DiscountCode | null> {
  return withRetry(async () => {
    await ensureCommerceTables();
    const sql = getSql();
    const rows = (await sql`SELECT * FROM discount_codes WHERE UPPER(code) = UPPER(${code.trim()}) LIMIT 1`) as DiscountRow[];
    return rows.length ? mapDiscount(rows[0]) : null;
  });
}

export async function createNeonDiscount(input: CreateNeonDiscountInput): Promise<DiscountCode> {
  await ensureCommerceTables();
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO discount_codes (code, type, value, min_amount, max_uses, used_count, expires_at, active)
    VALUES (
      ${input.code.trim().toUpperCase()},
      ${input.type},
      ${input.value},
      ${input.minAmount ?? 0},
      ${input.maxUses ?? null},
      ${input.usedCount ?? 0},
      ${input.expiresAt ? new Date(input.expiresAt).toISOString() : null},
      ${input.active ?? true}
    ) RETURNING *
  `) as DiscountRow[];
  return mapDiscount(rows[0]);
}

export const addNeonDiscount = createNeonDiscount;

export async function toggleNeonDiscount(id: number, active?: boolean): Promise<DiscountCode | null> {
  await ensureCommerceTables();
  const sql = getSql();
  const rows = (await sql`UPDATE discount_codes SET active = COALESCE(${active ?? null}, NOT active) WHERE id = ${id} RETURNING *`) as DiscountRow[];
  return rows.length ? mapDiscount(rows[0]) : null;
}

export async function incrementNeonDiscountUsage(code: string): Promise<void> {
  await ensureCommerceTables();
  const sql = getSql();
  await sql`UPDATE discount_codes SET used_count = used_count + 1 WHERE UPPER(code) = UPPER(${code.trim()})`;
}

export async function deleteNeonDiscount(id: number): Promise<boolean> {
  await ensureCommerceTables();
  const sql = getSql();
  const rows = await sql`DELETE FROM discount_codes WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
