// Builds a 1080x1920 Instagram-story image: the gallery photo inside an
// ASA-branded frame (kente stripe, logo, handle, caption). Runs in the browser.

const KENTE = ["#B23A20", "#D98A1E", "#0C6B63", "#C89127", "#4A163B"];

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const ir = img.width / img.height;
  const r = w / h;
  let dw = w;
  let dh = h;
  if (ir > r) dw = h * ir;
  else dh = w / ir;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines && words.length) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(last + "…").width > maxWidth && last.length) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = last + "…";
  }
  return lines;
}

export async function buildStoryCard(opts: {
  imageUrl: string;
  caption?: string;
  handle: string;
  logoUrl: string;
}): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const [photo, logo] = await Promise.all([
    loadImg(opts.imageUrl),
    loadImg(opts.logoUrl).catch(() => null as unknown as HTMLImageElement),
  ]);

  // Blurred photo backdrop
  ctx.save();
  ctx.filter = "blur(46px) brightness(0.55) saturate(1.35)";
  drawCover(ctx, photo, -40, -40, W + 80, H + 80);
  ctx.restore();

  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, "rgba(20,14,8,0.5)");
  grd.addColorStop(0.5, "rgba(20,14,8,0.35)");
  grd.addColorStop(1, "rgba(15,10,5,0.9)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // Logo + wordmark
  if (logo) {
    const ls = 150;
    ctx.drawImage(logo, W / 2 - ls / 2, 96, ls, ls);
  }
  ctx.fillStyle = "#F3ECDD";
  ctx.textAlign = "center";
  ctx.font = '600 42px -apple-system, "Segoe UI", system-ui, sans-serif';
  ctx.fillText("AFRICAN STUDENTS ASSOCIATION", W / 2, logo ? 300 : 200);

  // Photo card
  const M = 84;
  const cardTop = 360;
  const cardW = W - M * 2;
  const cardH = 1150;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 30;
  roundRect(ctx, M - 16, cardTop - 16, cardW + 32, cardH + 32, 34);
  ctx.fillStyle = "#F3ECDD";
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, M, cardTop, cardW, cardH, 22);
  ctx.clip();
  ctx.fillStyle = "#0f0a05";
  ctx.fillRect(M, cardTop, cardW, cardH);
  // contain the photo
  const ir = photo.width / photo.height;
  let dw = cardW;
  let dh = cardW / ir;
  if (dh > cardH) {
    dh = cardH;
    dw = cardH * ir;
  }
  ctx.drawImage(photo, M + (cardW - dw) / 2, cardTop + (cardH - dh) / 2, dw, dh);
  ctx.restore();

  // Kente stripe under the card
  const sy = cardTop + cardH + 34;
  const sw = (cardW + 32) / KENTE.length;
  KENTE.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(M - 16 + i * sw, sy, sw + 1, 14);
  });

  // Caption
  if (opts.caption) {
    ctx.fillStyle = "#F3ECDD";
    ctx.font = '500 44px "Newsreader", Georgia, serif';
    const lines = wrapLines(ctx, opts.caption, cardW, 3);
    lines.forEach((ln, i) => ctx.fillText(ln, W / 2, sy + 90 + i * 58));
  }

  // Handle
  ctx.fillStyle = "#E7B44A";
  ctx.font = '700 40px -apple-system, "Segoe UI", system-ui, sans-serif';
  ctx.fillText(opts.handle, W / 2, H - 110);

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png")
  );
}
