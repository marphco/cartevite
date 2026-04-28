import type { PrebuiltTemplate } from "../../utils/layoutSchema";
import type { CanvasProps } from "../../types/editor";

/** Sfondo scenario: risolve colori o restituisce l'immagine di default. */
export function resolveScenarioBackground(raw: string | undefined): string {
  const t = (raw || "").trim();
  // Se non c'è nulla o è il default del corpo, usiamo l'immagine premium dello scenario
  if (!t || t.includes("bg-body")) return "url('/bg_scenario_default.jpg')";
  
  if (t.startsWith("#")) {
    if (t.length === 4) {
      const r = t[1], g = t[2], b = t[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return t;
  }
  
  // Se è un URL immagine già formato
  if (t.startsWith("url(") || t.startsWith("/") || t.startsWith("http")) {
    return t.startsWith("url(") ? t : `url('${t}')`;
  }

  return "url('/bg_scenario_default.jpg')";
}

function parseRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Luminosità relativa 0–1 (srgb). */
export function backgroundLuminance(bg: string): number {
  const hex = resolveScenarioBackground(bg);
  const rgb = parseRgb(hex);
  if (!rgb) return 0.85;
  const linear = rgb.map((c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export type ToneFilter = "all" | "light" | "dark" | "mid";

export function templateTone(t: PrebuiltTemplate): Exclude<ToneFilter, "all"> {
  const L = backgroundLuminance(t.theme.background);
  if (L > 0.62) return "light";
  if (L < 0.28) return "dark";
  return "mid";
}

export function matchesTone(t: PrebuiltTemplate, filter: ToneFilter): boolean {
  if (filter === "all") return true;
  return templateTone(t) === filter;
}

export function buildCanvasPropsForPreview(t: PrebuiltTemplate): CanvasProps {
  const c = t.canvas;
  return {
    width: c.width,
    height: c.height,
    bgImage: c.bgImage || null,
    bgColor: c.bgImage ? undefined : "#ffffff",
    bgOpacity: 1,
  };
}

/** Colori busta plausibili da accent + preset (i template predefiniti non hanno coverBg). */
export function envelopeColorsFromTemplate(t: PrebuiltTemplate) {
  const accent = t.theme.accent || "#1ABC9C";
  const pocket = accent;
  return {
    envelopeColor: accent,
    pocketColor: pocket,
    linerColor: "#ffffff",
  };
}

export const UPLOAD_CUSTOM_TEMPLATE_ID = "upload_custom";

export type InviteUploadFormat = "square" | "vertical" | "vertical-henv" | "horizontal";

export function parseInviteFormat(raw: string | null): InviteUploadFormat | null {
  if (raw === "square" || raw === "horizontal" || raw === "vertical" || raw === "vertical-henv") return raw;
  return null;
}

/** Canvas + busta coerenti col formato invito scelto (solo `upload_custom`). */
export function mergeUploadCustomWithFormat(
  format: InviteUploadFormat
): Pick<PrebuiltTemplate, "canvas" | "theme"> {
  const fonts = { heading: "Cormorant Garamond", body: "Inter" };
  const accent = "#2f7f6f";
  switch (format) {
    case "horizontal":
      return {
        canvas: { bgImage: null, width: 1100, height: 700 },
        theme: {
          preset: "noir",
          accent,
          background: "#ffffff",
          fonts,
          envelopeFormat: "horizontal",
        },
      };
    case "vertical":
      return {
        canvas: { bgImage: null, width: 800, height: 1200 },
        theme: {
          preset: "garden",
          accent,
          background: "#ffffff",
          fonts,
          envelopeFormat: "vertical",
        },
      };
    case "vertical-henv":
      return {
        canvas: { bgImage: null, width: 800, height: 1200 },
        theme: {
          preset: "garden",
          accent,
          background: "#ffffff",
          fonts,
          envelopeFormat: "horizontal",
        },
      };
    case "square":
    default:
      return {
        canvas: { bgImage: null, width: 800, height: 800 },
        theme: {
          preset: "garden",
          accent,
          background: "#ffffff",
          fonts,
          envelopeFormat: "vertical",
        },
      };
  }
}

export function applyUploadFormatToTemplate(
  base: PrebuiltTemplate,
  format: InviteUploadFormat
): PrebuiltTemplate {
  if (base.id !== UPLOAD_CUSTOM_TEMPLATE_ID) return base;
  const patch = mergeUploadCustomWithFormat(format);
  return { ...base, ...patch, theme: { ...base.theme, ...patch.theme } };
}

