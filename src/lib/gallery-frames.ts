import type { GalleryFrame } from "./firebase/schema";

// Aspect ratio [w, h] for each framing style.
export const FRAME_ASPECT: Record<Exclude<GalleryFrame, "auto">, [number, number]> = {
  square: [1, 1],
  portrait: [4, 5],
  tall: [3, 4],
  landscape: [3, 2],
  wide: [16, 9],
};

// Pleasing repeating mix used when a photo's frame is "auto", so any batch
// (including a run of ten) reads as a designed collage rather than a plain grid.
const AUTO_PATTERN: Exclude<GalleryFrame, "auto">[] = [
  "portrait", "landscape", "square", "tall", "wide",
  "square", "portrait", "landscape", "tall", "portrait",
];

export const FRAME_OPTIONS: { value: GalleryFrame; label: string }[] = [
  { value: "auto", label: "Auto (varied)" },
  { value: "square", label: "Square" },
  { value: "portrait", label: "Portrait" },
  { value: "tall", label: "Tall" },
  { value: "landscape", label: "Landscape" },
  { value: "wide", label: "Wide" },
];

// The frame to render this photo at. An explicit frame wins; otherwise a known
// natural size keeps true proportions; otherwise the varied auto pattern.
export function frameFor(
  g: { frame?: GalleryFrame; w?: number; h?: number },
  index: number
): [number, number] {
  if (g.frame && g.frame !== "auto") return FRAME_ASPECT[g.frame];
  if (g.w && g.h) return [g.w, g.h];
  return FRAME_ASPECT[AUTO_PATTERN[index % AUTO_PATTERN.length]];
}

export function aspectCss(wh: [number, number]): string {
  return `${wh[0]} / ${wh[1]}`;
}

// The auto frame a given slot would get, for previewing in the uploader.
export function autoFrameAt(index: number): Exclude<GalleryFrame, "auto"> {
  return AUTO_PATTERN[index % AUTO_PATTERN.length];
}
