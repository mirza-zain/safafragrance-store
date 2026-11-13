import sharp from "sharp";

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface CompressedImage {
  buffer: Buffer;
  contentType: string;
  extension: string;
  size: number;
}

/**
 * Compresses and optimizes an image buffer using Sharp.
 * - Auto-orients mobile photos (EXIF orientation).
 * - Resizes to fit within maxWidth x maxHeight without enlargement.
 * - Converts to optimized WebP format with high visual fidelity.
 */
export async function compressImageBuffer(
  inputBuffer: Buffer,
  options: CompressOptions = {}
): Promise<CompressedImage> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 82 } = options;

  try {
    const pipeline = sharp(inputBuffer)
      .rotate() // auto-orient vertical/mobile camera shots
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 4 });

    const buffer = await pipeline.toBuffer();
    return {
      buffer,
      contentType: "image/webp",
      extension: ".webp",
      size: buffer.length,
    };
  } catch (error) {
    console.warn("Sharp image compression fallback to original buffer:", error);
    return {
      buffer: inputBuffer,
      contentType: "image/jpeg",
      extension: ".jpg",
      size: inputBuffer.length,
    };
  }
}
