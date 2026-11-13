import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { isAdminRequest } from "@/app/lib/admin-auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, and GIF images are allowed" }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image must be between 1 byte and 5 MB" }, { status: 400 });
    }

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name).toLowerCase();
    const safeExtension = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ? ext : ".bin";
    const filename = `receipt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${safeExtension}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
