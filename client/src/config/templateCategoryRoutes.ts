import { TEMPLATE_CATEGORIES } from "../utils/layoutSchema";

type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

/** Slug URL stabile per ogni categoria catalogo (path segment, minuscolo). */
export const CATEGORY_SLUG_BY_NAME: Record<TemplateCategory, string> = {
  "Il tuo file": "carica",
  Matrimonio: "matrimonio",
  "Serate e party": "feste",
  Business: "business",
  "Battesimo & Nascite": "battesimo-nascite",
  "Compleanni Adulti": "compleanni-adulti",
  "Compleanni Bambini": "compleanni-bambini",
  Cresime: "cresime",
  Comunioni: "comunioni",
  Lauree: "lauree",
  "Baby Shower": "baby-shower",
};

/** Slug catalogo non più in uso: redirect a path attuale. */
export const TEMPLATE_CATEGORY_SLUG_REDIRECT: Record<string, string> = {
  "feste-pre-matrimonio": "feste",
};

const NAME_BY_SLUG = Object.fromEntries(
  Object.entries(CATEGORY_SLUG_BY_NAME).map(([name, slug]) => [slug, name]),
) as Record<string, TemplateCategory>;

export function slugFromCategoryName(name: string): string {
  return CATEGORY_SLUG_BY_NAME[name as TemplateCategory] ?? "";
}

export function categoryNameFromSlug(slug: string): TemplateCategory | null {
  const n = NAME_BY_SLUG[slug];
  return n ?? null;
}

/** Path catalogo: tutti i modelli oppure una categoria. */
export function templatesPathForCategory(category: "Tutti" | TemplateCategory): string {
  if (category === "Tutti") return "/templates";
  const slug = CATEGORY_SLUG_BY_NAME[category];
  return slug ? `/templates/${slug}` : "/templates";
}
