// Picks a zoom starting point on a character's splash art that is neither
// pure background nor a solid block of the character (which in practice
// means: stop always landing on the face). We render the image to a small
// offscreen canvas and scan for the window whose opaque/transparent pixel
// ratio is closest to a target "dosage" (default ~45% opaque/"black" once the
// silhouette filter is applied, 55% transparent/"red" background showing
// through) — a purely data-driven pick from the actual artwork, deterministic
// per image (no randomness), so it's stable across reloads for free.
//
// The returned point is a `transform-origin` value, not the visible window's
// center: CSS `transform: scale(s)` around `transform-origin: ox% oy%` keeps
// (ox,oy) fixed on screen and scales everything else around it, so the
// visible crop at scale s is actually centered at `ox + (50-ox)/s`, not at ox
// itself. We invert that here so the window we measured is the window that
// actually ends up on screen at the caller's initial zoom scale.

export interface Anchor {
  x: number;
  y: number;
}

const cache = new Map<string, Promise<Anchor>>();

const SAMPLE_SIZE = 96;
const STRIDE = 4;
const PIXEL_STEP = 1;
const TARGET_OPAQUE_RATIO = 0.45;
const DEFAULT_ANCHOR: Anchor = { x: 50, y: 42 };

export function getSilhouetteAnchor(imgSrc: string, initialScale: number): Promise<Anchor> {
  const key = `${imgSrc}@${initialScale}`;
  let promise = cache.get(key);
  if (!promise) {
    promise = computeAnchor(imgSrc, initialScale);
    cache.set(key, promise);
  }
  return promise;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Inverse of visibleCenter = origin + (50 - origin) / scale
function centerToOrigin(center: number, scale: number): number {
  if (scale <= 1) return center;
  return (center * scale - 50) / (scale - 1);
}

async function computeAnchor(imgSrc: string, initialScale: number): Promise<Anchor> {
  try {
    const img = await loadImage(imgSrc);
    const canvas = document.createElement('canvas');
    canvas.width = SAMPLE_SIZE;
    canvas.height = SAMPLE_SIZE;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx || img.width === 0 || img.height === 0) return DEFAULT_ANCHOR;

    // Match CSS `object-fit: cover` so sampled % coordinates line up with
    // what the browser actually renders.
    const drawScale = Math.max(SAMPLE_SIZE / img.width, SAMPLE_SIZE / img.height);
    const w = img.width * drawScale;
    const h = img.height * drawScale;
    ctx.drawImage(img, (SAMPLE_SIZE - w) / 2, (SAMPLE_SIZE - h) / 2, w, h);
    const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

    // Half-width of the measured window, sized to match what `initialScale`
    // actually reveals on screen.
    const window = Math.max(4, Math.round(SAMPLE_SIZE / initialScale / 2));

    let bestX = SAMPLE_SIZE / 2;
    let bestY = SAMPLE_SIZE / 2;
    let bestScore = Infinity;

    for (let cy = window; cy < SAMPLE_SIZE - window; cy += STRIDE) {
      for (let cx = window; cx < SAMPLE_SIZE - window; cx += STRIDE) {
        let opaque = 0;
        let total = 0;
        for (let y = cy - window; y < cy + window; y += PIXEL_STEP) {
          for (let x = cx - window; x < cx + window; x += PIXEL_STEP) {
            const alpha = data[(y * SAMPLE_SIZE + x) * 4 + 3];
            total++;
            if (alpha > 128) opaque++;
          }
        }
        const ratio = total > 0 ? opaque / total : 0;
        const score = Math.abs(ratio - TARGET_OPAQUE_RATIO);
        if (score < bestScore) {
          bestScore = score;
          bestX = cx;
          bestY = cy;
        }
      }
    }

    const centerXPct = (bestX / SAMPLE_SIZE) * 100;
    const centerYPct = (bestY / SAMPLE_SIZE) * 100;
    const clamp = (v: number) => Math.max(-20, Math.min(120, v));

    return {
      x: Math.round(clamp(centerToOrigin(centerXPct, initialScale))),
      y: Math.round(clamp(centerToOrigin(centerYPct, initialScale))),
    };
  } catch {
    return DEFAULT_ANCHOR;
  }
}
