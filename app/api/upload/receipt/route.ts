import { NextResponse } from "next/server";
import { compressImageBuffer } from "@/app/lib/image-compress";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB max intake
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
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No receipt image provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Receipt must be a JPEG, PNG, WebP, GIF, or HEIC image" },
        { status: 400 }
      );
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Receipt image must be between 1 byte and 15 MB" },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      return NextResponse.json({ error: "Receipt uploads are not configured" }, { status: 503 });
    }

    // Pre-compress the receipt before uploading to Cloudinary
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const compressed = await compressImageBuffer(rawBuffer, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 80,
    });

    const uploadData = new FormData();
    const filename = `receipt-${Date.now()}${compressed.extension}`;
    const blob = new Blob([new Uint8Array(compressed.buffer)], { type: compressed.contentType });
    uploadData.append("file", blob, filename);
    uploadData.append("upload_preset", uploadPreset);
    uploadData.append(
      "folder",
      `${process.env.CLOUDINARY_UPLOAD_FOLDER || "SafaFragrance"}/receipts`
    );

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: uploadData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary receipt upload failed:", errorText);
      return NextResponse.json({ error: "Receipt upload failed" }, { status: 502 });
    }

    const result = (await response.json()) as { secure_url?: string };
    if (!result.secure_url) {
      return NextResponse.json({ error: "Receipt upload returned no URL" }, { status: 502 });
    }

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("POST /api/upload/receipt error:", error);
    return NextResponse.json({ error: "Receipt upload failed" }, { status: 500 });
  }
}
