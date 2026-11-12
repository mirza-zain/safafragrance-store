import sys
from PIL import Image, ImageFilter
import numpy as np

def black_to_transparent(input_path, output_path, threshold=20, softness=40):
    """
    Converts solid black background (#000000) to clean, antialiased transparent alpha.
    """
    im = Image.open(input_path).convert("RGBA")
    arr = np.array(im, dtype=float)
    
    # Calculate luminance/brightness of each pixel
    r, g, b, _ = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    # Max color component
    brightness = np.maximum(r, np.maximum(g, b))
    
    # Smooth step alpha
    alpha = np.clip((brightness - threshold) / softness, 0.0, 1.0)
    
    # Preserve full opacity for non-black pixels
    alpha_255 = (alpha * 255.0).astype(np.uint8)
    
    # For semi-transparent pixels near the black boundary, un-multiply black to prevent dark fringing
    norm_alpha = np.maximum(alpha, 1e-4)
    r_unpremult = np.clip(r / norm_alpha, 0, 255).astype(np.uint8)
    g_unpremult = np.clip(g / norm_alpha, 0, 255).astype(np.uint8)
    b_unpremult = np.clip(b / norm_alpha, 0, 255).astype(np.uint8)
    
    result = np.dstack([r_unpremult, g_unpremult, b_unpremult, alpha_255])
    out_im = Image.fromarray(result, "RGBA")
    out_im.save(output_path, "PNG")
    print(f"Processed: {input_path} -> {output_path} (size: {out_im.size})")

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        thresh = int(sys.argv[3]) if len(sys.argv) > 3 else 18
        soft = int(sys.argv[4]) if len(sys.argv) > 4 else 35
        black_to_transparent(sys.argv[1], sys.argv[2], thresh, soft)
    else:
        print("Usage: python3 process_assets.py <input> <output> [threshold] [softness]")
