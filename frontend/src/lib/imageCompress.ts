/**
 * @fileoverview Kompres gambar di browser agar muat batas ukuran unggahan (mockup: maks. 2 MB).
 * Gambar yang sudah di bawah batas tidak diubah. GIF/SVG dikembalikan apa adanya.
 */
export const COVER_TARGET_BYTES = 2 * 1024 * 1024;

const loadBitmap = (file: File): Promise<{ w: number; h: number; draw: (c: CanvasRenderingContext2D, w: number, h: number) => void }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        w: img.naturalWidth,
        h: img.naturalHeight,
        draw: (c, w, h) => {
          c.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(url);
        },
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gambar tidak dapat dibaca."));
    };
    img.src = url;
  });

const toBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

export async function fitImage(file: File, maxBytes = COVER_TARGET_BYTES): Promise<File> {
  if (file.size <= maxBytes || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  try {
    const bmp = await loadBitmap(file);
    let scale = Math.min(1, 2400 / Math.max(bmp.w, bmp.h));
    let best: Blob | null = null;
    for (let round = 0; round < 6; round++) {
      const w = Math.max(1, Math.round(bmp.w * scale));
      const h = Math.max(1, Math.round(bmp.h * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      bmp.draw(ctx, w, h);
      for (const q of [0.9, 0.8, 0.7, 0.6]) {
        const blob = await toBlob(canvas, q);
        if (blob && (!best || blob.size < best.size)) best = blob;
        if (blob && blob.size <= maxBytes) {
          return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
        }
      }
      scale *= 0.8;
    }
    if (best && best.size < file.size) {
      return new File([best], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
    }
  } catch {
    /* gunakan file asli bila kompresi gagal */
  }
  return file;
}
