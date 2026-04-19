/**
 * Payload strutturato allergie (RSVP pubblico / manuale / edit).
 * Il server normalizza di nuovo e compone `allergies` (stringa export/catering).
 */

export type AllergyPersonRow = { name: string; allergies: string };

export type AllergiesDetailPayload = {
  mode: "whole_party" | "by_person";
  wholePartyText: string;
  people: AllergyPersonRow[];
};

export type BuildAllergiesInput = {
  askIntolerances: boolean;
  status: "yes" | "maybe" | "no";
  hasAllergies: "yes" | "no" | null;
  guestsCount: number;
  /** Obbligatorio se ospiti > 1 e hasAllergies === "yes" */
  allergyMode: "whole_party" | "by_person" | null;
  wholePartyAllergies: string;
  allergyPeople: AllergyPersonRow[];
};

export type BuildAllergiesResult =
  | { ok: true; allergies: string; allergiesDetail: AllergiesDetailPayload | null }
  | { ok: false; error: string };

export function buildAllergiesPayload(input: BuildAllergiesInput): BuildAllergiesResult {
  const { askIntolerances, status, hasAllergies, guestsCount } = input;
  const n = Math.max(1, Math.floor(Number(guestsCount)) || 1);

  if (!askIntolerances || status === "no" || hasAllergies !== "yes") {
    return { ok: true, allergies: "", allergiesDetail: null };
  }

  if (hasAllergies === null) {
    return { ok: false, error: "Rispondi sì o no." };
  }

  if (n > 1) {
    const mode = input.allergyMode ?? "by_person";
    if (mode === "whole_party") {
      const t = input.wholePartyAllergies.trim();
      if (!t) {
        return { ok: false, error: "Inserisci il dettaglio condiviso da tutti gli ospiti." };
      }
      return {
        ok: true,
        allergies: `Tutti gli ${n} ospiti dichiarati: ${t}`,
        allergiesDetail: { mode: "whole_party", wholePartyText: t, people: [] },
      };
    }
    const people = input.allergyPeople
      .map((p) => ({
        name: (p.name || "").trim(),
        allergies: (p.allergies || "").trim(),
      }))
      .filter((p) => p.allergies.length > 0);
    if (people.length === 0) {
      return { ok: false, error: "Inserisci almeno un dettaglio (nome opzionale + allergia)." };
    }
    const allergies = people.map((p) => (p.name ? `${p.name}: ${p.allergies}` : p.allergies)).join(" · ");
    return {
      ok: true,
      allergies,
      allergiesDetail: { mode: "by_person", wholePartyText: "", people },
    };
  }

  const row = input.allergyPeople[0] || { name: "", allergies: "" };
  const al = row.allergies.trim();
  if (!al) {
    return { ok: false, error: "Inserisci allergia o intolleranza." };
  }
  const name = row.name.trim();
  const allergies = name ? `${name}: ${al}` : al;
  return {
    ok: true,
    allergies,
    allergiesDetail: { mode: "by_person", wholePartyText: "", people: [{ name, allergies: al }] },
  };
}

export function defaultAllergyPeopleRows(): AllergyPersonRow[] {
  return [{ name: "", allergies: "" }];
}

/** Prefisso usato in `buildAllergiesPayload` per allergia condivisa da tutto il gruppo. */
const WHOLE_PARTY_FLAT_PREFIX = /^Tutti gli (\d+) ospiti dichiarati:\s*/i;

/**
 * Quante persone nel gruppo dichiarano allergia/intolleranza (per export catering).
 * - `whole_party`: tutti i posti dichiarati (`guestsCount`).
 * - `by_person`: una riga = una persona con allergia.
 * - Record vecchi senza `allergiesDetail`: euristica sulla stringa `allergies` (split su " · ").
 */
export function countCateringAllergySubjects(
  guestsCount: number,
  allergiesDetail: unknown,
  flatAllergies: string
): number {
  const n = Math.max(1, Math.floor(Number(guestsCount)) || 1);
  const flat = (flatAllergies || "").trim();
  if (!flat) return 0;

  if (allergiesDetail && typeof allergiesDetail === "object") {
    const d = allergiesDetail as AllergiesDetailPayload;
    if (d.mode === "whole_party" && String(d.wholePartyText || "").trim()) {
      return n;
    }
    if (d.mode === "by_person" && Array.isArray(d.people)) {
      const c = d.people.filter((p) => String(p?.allergies || "").trim().length > 0).length;
      if (c > 0) return c;
    }
  }

  const wholeMatch = flat.match(WHOLE_PARTY_FLAT_PREFIX);
  const wholeDeclared = wholeMatch?.[1];
  if (wholeDeclared !== undefined) {
    const declared = parseInt(wholeDeclared, 10);
    return Math.min(n, Number.isFinite(declared) && declared > 0 ? declared : n);
  }

  if (n <= 1) return 1;

  const parts = flat.split(/\s*·\s*/).filter((p) => p.trim().length > 0);
  if (parts.length > 1) return parts.length;
  return 1;
}

const BULLET = "\u2022 ";

/**
 * Testo allergie per export (PDF/CSV): elenco puntato su più righe quando
 * ci sono più persone o segmenti separati da " · ".
 */
export function formatCateringAllergiesBulletList(
  guestsCount: number,
  allergiesDetail: unknown,
  flatAllergies: string
): string {
  const n = Math.max(1, Math.floor(Number(guestsCount)) || 1);
  const flat = (flatAllergies || "").trim();
  if (!flat) return "";

  if (allergiesDetail && typeof allergiesDetail === "object") {
    const d = allergiesDetail as AllergiesDetailPayload;
    const whole = String(d.wholePartyText || "").trim();
    if (d.mode === "whole_party" && whole) {
      return `${BULLET}Tutti i ${n} posti: ${whole}`;
    }
    if (d.mode === "by_person" && Array.isArray(d.people)) {
      const rows = d.people
        .map((p) => ({
          name: String(p?.name || "").trim(),
          al: String(p?.allergies || "").trim(),
        }))
        .filter((p) => p.al.length > 0);
      if (rows.length === 0) {
        return formatCateringAllergiesBulletListFallback(n, flat);
      }
      if (rows.length === 1) {
        const one = rows[0]!;
        return one.name ? `${BULLET}${one.name}: ${one.al}` : `${BULLET}${one.al}`;
      }
      return rows.map((p) => (p.name ? `${BULLET}${p.name}: ${p.al}` : `${BULLET}${p.al}`)).join("\n");
    }
  }

  return formatCateringAllergiesBulletListFallback(n, flat);
}

function formatCateringAllergiesBulletListFallback(n: number, flat: string): string {
  const wholeMatch = flat.match(WHOLE_PARTY_FLAT_PREFIX);
  const wholeDeclared = wholeMatch?.[1];
  if (wholeMatch && wholeDeclared !== undefined) {
    const rest = flat.replace(WHOLE_PARTY_FLAT_PREFIX, "").trim();
    const num = parseInt(wholeDeclared, 10);
    const useN = Number.isFinite(num) && num > 0 ? num : n;
    return `${BULLET}Tutti i ${useN} posti: ${rest}`;
  }

  const parts = flat
    .split(/\s*·\s*/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (parts.length > 1) {
    return parts.map((p) => `${BULLET}${p}`).join("\n");
  }
  return `${BULLET}${flat}`;
}

/** Decodifica da record RSVP per precompilare form di modifica. */
export function parseAllergiesDetailFromRecord(detail: unknown, fallbackAllergies: string): {
  hasAllergies: "yes" | "no";
  allergyMode: "whole_party" | "by_person" | null;
  wholePartyAllergies: string;
  allergyPeople: AllergyPersonRow[];
} {
  if (!detail || typeof detail !== "object") {
    const fb = (fallbackAllergies || "").trim();
    if (!fb) return { hasAllergies: "no", allergyMode: null, wholePartyAllergies: "", allergyPeople: defaultAllergyPeopleRows() };
    return {
      hasAllergies: "yes",
      allergyMode: "by_person",
      wholePartyAllergies: "",
      allergyPeople: [{ name: "", allergies: fb }],
    };
  }
  const d = detail as AllergiesDetailPayload & { mode?: string };
  if (d.mode === "whole_party") {
    return {
      hasAllergies: "yes",
      allergyMode: "whole_party",
      wholePartyAllergies: (d.wholePartyText || "").trim(),
      allergyPeople: defaultAllergyPeopleRows(),
    };
  }
  if (d.mode === "by_person" && Array.isArray(d.people) && d.people.length > 0) {
    return {
      hasAllergies: "yes",
      allergyMode: "by_person",
      wholePartyAllergies: "",
      allergyPeople: d.people.map((p) => ({
        name: String(p?.name || ""),
        allergies: String(p?.allergies || ""),
      })),
    };
  }
  const fb = (fallbackAllergies || "").trim();
  return {
    hasAllergies: fb ? "yes" : "no",
    allergyMode: fb ? "by_person" : null,
    wholePartyAllergies: "",
    allergyPeople: fb ? [{ name: "", allergies: fb }] : defaultAllergyPeopleRows(),
  };
}
