import type { Block } from "../types/editor";

/** Altezza logica minima consigliata per tipo (canvas editor 1000px largo). */
export const DEFAULT_BLOCK_HEIGHT: Record<string, number> = {
  map: 560,
  rsvp: 600,
  gallery: 660,
  video: 700,
  payment: 760,
  photo: 480,
  custom: 480,
  canvas: 480,
};

const LEGACY_FALLBACK = 400;

/**
 * Risolve l'altezza logica della sezione per l'editor (desktop/mobile preview).
 * - Se mancante: default per tipo.
 * - Se è il vecchio default universale 400px su blocchi "ricchi", alza al minimo tipo
 *   (evita mappa/RSVP/regali tagliati nei template vecchi).
 */
export function resolveBlockHeight(block: Pick<Block, "type" | "height">): number {
  const t = block.type || "custom";
  const minH = DEFAULT_BLOCK_HEIGHT[t] ?? DEFAULT_BLOCK_HEIGHT.custom!;
  const raw = block.height;

  if (typeof raw !== "number" || Number.isNaN(raw) || raw < 100) {
    return minH;
  }

  if (raw === LEGACY_FALLBACK && ["map", "rsvp", "gallery", "video", "payment"].includes(t)) {
    return Math.max(raw, minH);
  }

  return raw;
}

export function normalizeBlocksForEditor(blocks: Block[] | undefined): Block[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((b) => ({
    ...b,
    height: resolveBlockHeight(b),
  }));
}
