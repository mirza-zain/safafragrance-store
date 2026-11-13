import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { isAdminRequest } from "@/app/lib/admin-auth";
import { compressImageBuffer } from "@/app/lib/image-compress";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB max intake before compression
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

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
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, GIF, and HEIC images are allowed" },
        { status: 400 }
      );
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image must be between 1 byte and 15 MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer and compress before uploading
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const compressed = await compressImageBuffer(rawBuffer, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 82,
    });

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "SafaFragrance";

    if (cloudName && !uploadPreset) {
      return NextResponse.json(
        { error: "Cloudinary setup is incomplete. Add CLOUDINARY_UPLOAD_PRESET." },
        { status: 503 }
      );
    }

    if (cloudName && uploadPreset) {
      const uploadData = new FormData();
      const filename = `product-${Date.now()}${compressed.extension}`;
      const blob = new Blob([new Uint8Array(compressed.buffer)], { type: compressed.contentType });
      uploadData.append("file", blob, filename);
      uploadData.append("upload_preset", uploadPreset);
      if (folder) uploadData.append("folder", folder);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudinary upload failed:", errorText);
        return NextResponse.json({ error: "Cloudinary image upload failed" }, { status: 502 });
      }

      const result = (await response.json()) as { secure_url?: string };
      if (!result.secure_url) {
        return NextResponse.json({ error: "Cloudinary returned no image URL" }, { status: 502 });
      }

      return NextResponse.json({ url: result.secure_url });
    }

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET." },
        { status: 503 }
      );
    }

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const filename = `product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${compressed.extension}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filePath, compressed.buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
