// Picks a zoom starting point on a character image that lands on a spot
// worth zooming into instead of always landing on the same one. We render
// the image to a small offscreen canvas, split it into a coarse 3x3 grid of
// zones, and keep the best-scoring point in each zone that clears a
// qualifying bar. One zone is then picked with `pickSeeded` -- same seed
// always picks the same zone, so a daily round is identical for everyone
// and a practice round still varies, but every candidate is a genuinely
// different part of the image (a coarse grid, not a cloud of near-duplicate
// points a few pixels apart from a single best match).
//
// Two scoring modes:
// - 'opacity': for a transparent-background character cutout rendered as a
//   silhouette -- score by how close the opaque/transparent pixel ratio is
//   to a target "dosage" (~45% opaque/"black" once the silhouette filter is
//   applied, 55% transparent/"red" background showing through).
// - 'contrast': for a full, opaque scene (promo banner) shown desaturated --
//   there's no transparency to measure, so score by local luminance
//   variance instead (how much visual detail/edges a window has), avoiding
//   flat sky/background patches in favor of textured, identifiable ones.
//
// The returned point is a `transform-origin` value, not the visible window's
// center: CSS `transform: scale(s)` around `transform-origin: ox% oy%` keeps
// (ox,oy) fixed on screen and scales everything else around it, so the
// visible crop at scale s is actually centered at `ox + (50-ox)/s`, not at ox
// itself. We invert that here so the window we measured is the window that
// actually ends up on screen at the caller's initial zoom scale.

import { pickSeeded } from './gameLogic';

export interface Anchor {
  x: number;
  y: number;
}

export type AnchorMode = 'opacity' | 'contrast';

const cache = new Map<string, Promise<Anchor>>();

const SAMPLE_SIZE = 96;
const STRIDE = 4;
const PIXEL_STEP = 1;
const GRID_SIZE = 3;
const DEFAULT_ANCHOR: Anchor = { x: 50, y: 42 };

const OPAQUE_TARGET_RATIO = 0.45;
const OPAQUE_TOLERANCE = 0.12;
const DETAIL_MIN_VARIANCE = 1500;

export function getSilhouetteAnchor(
  imgSrc: string,
  initialScale: number,
  seed: string,
  mode: AnchorMode = 'opacity'
): Promise<Anchor> {
  const key = `${imgSrc}@${initialScale}@${seed}@${mode}`;
  let promise = cache.get(key);
  if (!promise) {
    promise = computeAnchor(imgSrc, initialScale, seed, mode);
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

interface Candidate {
  x: number;
  y: number;
  score: number;
}

// Lower score is always "better" (closer to the opacity target, or more
// negative i.e. higher variance for contrast), so both modes share one
// qualifying rule: score <= threshold.
function makeScorer(data: Uint8ClampedArray, window: number, mode: AnchorMode) {
  const threshold = mode === 'opacity' ? OPAQUE_TOLERANCE : -DETAIL_MIN_VARIANCE;

  const score = (cx: number, cy: number): number => {
    if (mode === 'opacity') {
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
      return Math.abs(ratio - OPAQUE_TARGET_RATIO);
    }

    let sum = 0;
    let sumSq = 0;
    let total = 0;
    for (let y = cy - window; y < cy + window; y += PIXEL_STEP) {
      for (let x = cx - window; x < cx + window; x += PIXEL_STEP) {
        const i = (y * SAMPLE_SIZE + x) * 4;
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        sum += lum;
        sumSq += lum * lum;
        total++;
      }
    }
    const mean = total > 0 ? sum / total : 0;
    const variance = total > 0 ? sumSq / total - mean * mean : 0;
    return -variance;
  };

  return { score, threshold };
}

async function computeAnchor(imgSrc: string, initialScale: number, seed: string, mode: AnchorMode): Promise<Anchor> {
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
    const lo = window;
    const hi = SAMPLE_SIZE - window;
    const { score, threshold } = makeScorer(data, window, mode);

    // One candidate per grid zone: the best-scoring point found while
    // scanning only within that zone's slice of the image.
    const zoneCandidates: Candidate[] = [];
    let globalBest: Candidate = { x: SAMPLE_SIZE / 2, y: SAMPLE_SIZE / 2, score: Infinity };

    for (let gy = 0; gy < GRID_SIZE; gy++) {
      const zoneYStart = lo + ((hi - lo) * gy) / GRID_SIZE;
      const zoneYEnd = lo + ((hi - lo) * (gy + 1)) / GRID_SIZE;
      for (let gx = 0; gx < GRID_SIZE; gx++) {
        const zoneXStart = lo + ((hi - lo) * gx) / GRID_SIZE;
        const zoneXEnd = lo + ((hi - lo) * (gx + 1)) / GRID_SIZE;

        let zoneBest: Candidate = { x: 0, y: 0, score: Infinity };
        for (let cy = zoneYStart; cy < zoneYEnd; cy += STRIDE) {
          for (let cx = zoneXStart; cx < zoneXEnd; cx += STRIDE) {
            const s = score(Math.round(cx), Math.round(cy));
            if (s < zoneBest.score) zoneBest = { x: cx, y: cy, score: s };
            if (s < globalBest.score) globalBest = { x: cx, y: cy, score: s };
          }
        }
        if (zoneBest.score <= threshold) zoneCandidates.push(zoneBest);
      }
    }

    // Fall back to the single closest/most-detailed match anywhere on the
    // image if no zone independently cleared the bar (e.g. a very thin
    // silhouette, or an unusually flat scene).
    const chosen = zoneCandidates.length > 0 ? pickSeeded(zoneCandidates, seed) : globalBest;

    const centerXPct = (chosen.x / SAMPLE_SIZE) * 100;
    const centerYPct = (chosen.y / SAMPLE_SIZE) * 100;
    const clamp = (v: number) => Math.max(-20, Math.min(120, v));

    return {
      x: Math.round(clamp(centerToOrigin(centerXPct, initialScale))),
      y: Math.round(clamp(centerToOrigin(centerYPct, initialScale))),
    };
  } catch {
    return DEFAULT_ANCHOR;
  }
}
