// Client-side image compression + tiny blur placeholder.
// Runs in the browser before upload so large phone photos shrink to a
// web-friendly size and R2 uploads are fast.

export type Compressed = { file: File; w: number; h: number; blur: string };

function loadImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function decode(file: File): Promise<{ src: CanvasImageSource; w: number; h: number; cleanup: () => void }> {
  if ("createImageBitmap" in window) {
    try {
      const bmp = await createImageBitmap(file);
      return { src: bmp, w: bmp.width, h: bmp.height, cleanup: () => bmp.close?.() };
    } catch {
      /* fall through */
    }
  }
  const url = URL.createObjectURL(file);
  const img = await loadImageEl(url);
  return {
    src: img,
    w: img.naturalWidth,
    h: img.naturalHeight,
    cleanup: () => URL.revokeObjectURL(url),
  };
}

function canvasBlob(canvas: HTMLCanvasElement, type: string, q: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, q));
}

/**
 * Downscale to <= maxDim on the long edge and re-encode as WebP.
 * Falls back to the original file for formats canvas cannot re-encode well
 * (GIF, AVIF) or when compression would not help.
 */
export async function compressImage(
  file: File,
  { maxDim = 2400, quality = 0.82 }: { maxDim?: number; quality?: number } = {}
): Promise<Compressed> {
  const recompressible = /^image\/(jpe?g|png|webp)$/i.test(file.type);
  let dec;
  try {
    dec = await decode(file);
  } catch {
    return { file, w: 0, h: 0, blur: "" };
  }
  const { src, w, h, cleanup } = dec;

  const scale = Math.min(1, maxDim / Math.max(w, h) || 1);
  const tw = Math.max(1, Math.round(w * scale));
  const th = Math.max(1, Math.round(h * scale));

  // Tiny blurred placeholder (data URI) for a smooth load.
  let blur = "";
  try {
    const bw = 28;
    const bh = Math.max(1, Math.round((bw * th) / tw));
    const bc = document.createElement("canvas");
    bc.width = bw;
    bc.height = bh;
    bc.getContext("2d")!.drawImage(src, 0, 0, bw, bh);
    blur = bc.toDataURL("image/jpeg", 0.5);
    if (blur.length > 3000) blur = "";
  } catch {
    /* ignore */
  }

  if (!recompressible) {
    cleanup();
    return { file, w, h, blur };
  }

  const canvas = document.createElement("canvas");
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, tw, th);
  cleanup();

  const blob = await canvasBlob(canvas, "image/webp", quality);
  if (!blob || (blob.size >= file.size && scale === 1)) {
    return { file, w, h, blur };
  }
  const name = file.name.replace(/\.[a-z0-9]+$/i, "") + ".webp";
  return {
    file: new File([blob], name, { type: "image/webp" }),
    w: tw,
    h: th,
    blur,
  };
}

// Simple concurrency runner: at most `limit` tasks in flight.
export async function runPool<T>(
  items: T[],
  limit: number,
  task: (item: T, index: number) => Promise<void>
): Promise<void> {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await task(items[idx], idx);
    }
  });
  await Promise.all(workers);
}
