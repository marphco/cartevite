import { TEMPLATE_CATEGORIES } from "../utils/layoutSchema";

/** Metadati per home marketing; `name` deve coincidere con le categorie template (filtro catalogo). */
export type MarketingCategory = {
  name: (typeof TEMPLATE_CATEGORIES)[number];
  blurb: string;
  image: string;
};

const IMG = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=1200`;

const pexels = (photoId: string) =>
  `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=1200`;

const byName: Record<(typeof TEMPLATE_CATEGORIES)[number], Omit<MarketingCategory, "name">> = {
  "Il tuo file": {
    blurb: "Parti da un file tuo, formato che preferisci.",
    image: IMG("photo-1586281380349-632531db7ed4"),
  },
  Matrimonio: {
    blurb: "Dal save the date al giorno J, stesso link.",
    image: IMG("photo-1519741497674-611481863552"),
  },
  "Serate e party": {
    blurb: "Aperitivi, cene a tema, party: invito e dettagli in un solo posto.",
    image: IMG("photo-1514525253161-7a46d19cd819"),
  },
  Business: {
    blurb: "Conferme in ordine, comunicazione sobria.",
    image: IMG("photo-1505373877841-8d25f7d46678"),
  },
  "Battesimo & Nascite": {
    blurb: "Tono delicato, informazioni chiare.",
    image: IMG("photo-1519689680058-324335c77eba"),
  },
  "Compleanni Adulti": {
    blurb: "Dalla cena a sorpresa alla festa: un link per chi deve confermare.",
    image: IMG("photo-1464047736614-af63643285bf"),
  },
  "Compleanni Bambini": {
    blurb: "Colori, orari, cosa portare: genitori informati senza chat infinite.",
    image: IMG("photo-1503454537195-1dcabb73ffb9"),
  },
  Cresime: {
    blurb: "Invito e dettagli in tono rispettoso, tutto in un unico posto.",
    image: pexels("13718101"),
  },
  Comunioni: {
    blurb: "Programma, luogo e risposta: anche per le famiglie in lista.",
    image: pexels("760111"),
  },
  Lauree: {
    blurb: "Cerimonia, aperitivo, lista regali: coordinate senza disordinare l’inbox.",
    image: pexels("267885"),
  },
  "Baby Shower": {
    blurb: "Informazioni in chiaro, senza canali sparsi tra i partecipanti.",
    image: pexels("5729090"),
  },
};

export const MARKETING_CATEGORIES: MarketingCategory[] = TEMPLATE_CATEGORIES.map((name) => {
  const meta = byName[name];
  if (!meta) throw new Error(`marketingCatalog: metadati mancanti per categoria "${name}"`);
  return { name, ...meta };
});

/** Ordine homepage / slider: solo occasioni con modelli pronti (niente «Il tuo file»). 10 = pari, griglia 2×. */
export const BROWSE_CATEGORY_NAMES = [
  "Matrimonio",
  "Serate e party",
  "Business",
  "Battesimo & Nascite",
  "Compleanni Adulti",
  "Compleanni Bambini",
  "Cresime",
  "Comunioni",
  "Lauree",
  "Baby Shower",
] as const satisfies readonly (typeof TEMPLATE_CATEGORIES)[number][];

export function browseMarketingCategories(): MarketingCategory[] {
  return BROWSE_CATEGORY_NAMES.map((name) => {
    const row = MARKETING_CATEGORIES.find((c) => c.name === name);
    if (!row) throw new Error(`browseMarketingCategories: missing ${name}`);
    return row;
  });
}
