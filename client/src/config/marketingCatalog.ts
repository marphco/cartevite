import { TEMPLATE_CATEGORIES } from "../utils/layoutSchema";

/** Metadati per home marketing; `name` deve coincidere con le categorie template (filtro catalogo). */
export type MarketingCategory = {
  name: (typeof TEMPLATE_CATEGORIES)[number];
  blurb: string;
  image: string;
};

const byName: Record<(typeof TEMPLATE_CATEGORIES)[number], Omit<MarketingCategory, "name">> = {
  Matrimonio: {
    blurb: "Dal save the date al giorno J, stesso link.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1000",
  },
  Feste: {
    blurb: "Invito coerente con la serata.",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000",
  },
  Business: {
    blurb: "Conferme in ordine, comunicazione sobria.",
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1000",
  },
  "Battesimo & Nascite": {
    blurb: "Tono delicato, informazioni chiare.",
    image:
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=1000",
  },
};

export const MARKETING_CATEGORIES: MarketingCategory[] = TEMPLATE_CATEGORIES.map((name) => ({
  name,
  ...byName[name],
}));
