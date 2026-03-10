export const BLOCK_LIBRARY = [
  {
    type: "text",
    label: "Testo a blocchi",
    description: "Titolo, paragrafo e layout a colonne guidato.",
    presets: {
      heading: "Dettagli",
      body: "Aggiungi tutte le informazioni utili agli ospiti.",
      layoutPreset: "single",
    },
  },
  {
    type: "gallery",
    label: "Gallery",
    description: "Carosello immagini ad alta risoluzione.",
    premium: true,
    presets: {
      images: [],
      layout: "carousel",
    },
  },
  {
    type: "photo",
    label: "Foto singola",
    description: "Un'immagine hero con varianti full-bleed o incorniciate.",
    presets: {
      image: null,
      caption: "",
      variant: "full",
      ctaLabel: "",
      ctaLink: "",
    },
  },
  {
    type: "map",
    label: "Mappa",
    description: "Posizione con link diretto a Google Maps.",
    presets: {
      title: "Come arrivare",
      address: "",
      mapUrl: "",
    },
  },
  {
    type: "rsvp",
    label: "RSVP",
    description: "Modulo risposta integrato.",
    presets: {},
  },
];

export const COLUMN_PRESETS = [
  { id: "single", label: "Singola", columns: [12] },
  { id: "split", label: "50 / 50", columns: [6, 6] },
  { id: "wideLeft", label: "60 / 40", columns: [7, 5] },
  { id: "wideRight", label: "40 / 60", columns: [5, 7] },
  { id: "triple", label: "Terzine", columns: [4, 4, 4] },
];

export const THEME_PRESETS = [
  {
    id: "noir",
    name: "Noir",
    accent: "#f4c46b",
    background: "#050506",
    fonts: { heading: "Playfair Display", body: "Space Grotesk" },
  },
  {
    id: "garden",
    name: "Garden",
    accent: "#6bd6b5",
    background: "#0b1914",
    fonts: { heading: "Cormorant Garamond", body: "Inter" },
  },
  {
    id: "cotton",
    name: "Cotton",
    accent: "#d6829f",
    background: "#faf3ef",
    fonts: { heading: "Fraunces", body: "DM Sans" },
  },
];

export function createBlockInstance(type) {
  const blueprint = BLOCK_LIBRARY.find((b) => b.type === type);
  if (!blueprint) {
    return {
      id: crypto.randomUUID(),
      type,
      order: 0,
      props: {},
    };
  }
  const clone = typeof structuredClone === "function"
    ? structuredClone
    : (value) => JSON.parse(JSON.stringify(value));

  return {
    id: crypto.randomUUID(),
    type: blueprint.type,
    order: 0,
    props: clone(blueprint.presets || {}),
  };
}

export const TEMPLATE_CATEGORIES = ["Matrimonio", "Feste", "Business", "Battesimo & Nascite"];

export const PREBUILT_TEMPLATES = [
  // --- MATRIMONIO ---
  {
    id: "wedding_floral",
    name: "Romantico Floreale",
    category: "Matrimonio",
    thumbnail: "/templates/wedding_floral.png",
    canvas: {
      bgImage: "/templates/wedding_floral.png",
      width: 800,
      height: 800
    },
    theme: {
      preset: "garden",
      accent: "#6bd6b5",
      background: "#fdfbf7",
      fonts: { heading: "Cormorant Garamond", body: "Inter" }
    },
    layers: [
      { id: "l1", type: "text", text: "Ci Sposiamo", x: "center", y: 318, fontSize: 36, fontFamily: "Cormorant Garamond", fontWeight: "normal", color: "#6e7f6e", textAlign: "center", width: "max-content" },
      { id: "l2", type: "text", text: "Marco & Sofia", x: "center", y: 416, fontSize: 72, fontFamily: "Cormorant Garamond", fontWeight: "bold", color: "#3a4a3a", textAlign: "center", width: "max-content" },
      { id: "l3", type: "text", text: "12 Settembre 2026", x: "center", y: 492, fontSize: 24, fontFamily: "Inter", fontWeight: "300", color: "#6e7f6e", textAlign: "center", width: "max-content" }
    ],
    blocks: [
      { id: "m1", type: "map", order: 1, props: { title: "Dove & Quando", address: "Villa Comunale, Napoli", mapUrl: "" } },
      { id: "r1", type: "rsvp", order: 2, props: {} }
    ]
  },
  {
    id: "wedding_minimal",
    name: "Minimalista Elegante",
    category: "Matrimonio",
    thumbnail: "/templates/wedding_minimal.png",
    canvas: {
      bgImage: "/templates/wedding_minimal.png",
      width: 800,
      height: 800
    },
    theme: {
      preset: "noir",
      accent: "#f4c46b",
      background: "#ffffff",
      fonts: { heading: "Playfair Display", body: "Space Grotesk" }
    },
    layers: [
      { id: "l1", type: "text", text: "Alessandro e Giulia", x: "center", y: 327, fontSize: 54, fontFamily: "Playfair Display", fontWeight: "bold", color: "#1a1a1a", textAlign: "center", width: "max-content" },
      { id: "l2", type: "text", text: "hanno la gioia di annunciare il loro matrimonio", x: "center", y: 390, fontSize: 20, fontFamily: "Space Grotesk", fontWeight: "300", color: "#666666", textAlign: "center", width: "max-content" },
      { id: "l3", type: "text", text: "24 MAGGIO 2027", x: "center", y: 462, fontSize: 24, fontFamily: "Space Grotesk", fontWeight: "500", color: "#1a1a1a", textAlign: "center", width: "max-content" }
    ],
    blocks: [
      { id: "r1", type: "rsvp", order: 1, props: {} }
    ]
  },
  {
    id: "wedding_ornate",
    name: "Classico Reale",
    category: "Matrimonio",
    thumbnail: "/templates/wedding_ornate.png",
    canvas: {
      bgImage: "/templates/wedding_ornate.png",
      width: 800,
      height: 800
    },
    theme: {
      preset: "noir",
      accent: "#b7945d",
      background: "#1c1c1c",
      fonts: { heading: "DM Serif Display", body: "Inter" }
    },
    layers: [
      { id: "l1", type: "text", text: "Invito al Matrimonio", x: "center", y: 334, fontSize: 28, fontFamily: "Inter", fontWeight: "normal", color: "#b7945d", textAlign: "center", width: "max-content" },
      { id: "l2", type: "text", text: "Edoardo & Vittoria", x: "center", y: 432, fontSize: 64, fontFamily: "DM Serif Display", fontWeight: "normal", color: "#8b6914", textAlign: "center", width: "max-content" },
      { id: "l3", type: "text", text: "Duomo di Milano, ore 16:00", x: "center", y: 511, fontSize: 22, fontFamily: "Inter", fontWeight: "300", color: "#555555", textAlign: "center", width: "max-content" }
    ],
    blocks: [
      { id: "r1", type: "rsvp", order: 1, props: {} }
    ]
  },

  // --- FESTE ---
  {
    id: "party_retro",
    name: "Neon Party",
    category: "Feste",
    thumbnail: "/templates/party_retro.png",
    canvas: {
      bgImage: "/templates/party_retro.png",
      width: 800,
      height: 800
    },
    theme: {
      preset: "noir",
      accent: "#ff3366",
      background: "var(--bg-body)",
      fonts: { heading: "Space Grotesk", body: "Inter" }
    },
    layers: [
      { id: "l1", type: "text", text: "30° COMPLEANNO", x: "center", y: 266, fontSize: 32, fontFamily: "Space Grotesk", fontWeight: "700", color: "#ffffff", textAlign: "center", width: "max-content" },
      { id: "l2", type: "text", text: "Let's Party!", x: "center", y: 390, fontSize: 80, fontFamily: "Space Grotesk", fontWeight: "bold", color: "#ffffff", textAlign: "center", width: "max-content" },
      { id: "l3", type: "text", text: "Sabato Sera • Open Bar", x: "center", y: 473, fontSize: 26, fontFamily: "Inter", fontWeight: "normal", color: "#eeeeee", textAlign: "center", width: "max-content" }
    ],
    blocks: [
      { id: "p1", type: "photo", order: 1, props: { image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80", caption: "Cocktails", variant: "full" } },
      { id: "r1", type: "rsvp", order: 2, props: {} }
    ]
  },

  // --- BUSINESS ---
  {
    id: "business_corporate",
    name: "Gala Aziendale",
    category: "Business",
    thumbnail: "/templates/business_corporate.png",
    canvas: {
      bgImage: "/templates/business_corporate.png",
      width: 800,
      height: 800
    },
    theme: {
      preset: "noir",
      accent: "#b7945d",
      background: "#050506",
      fonts: { heading: "Playfair Display", body: "Inter" }
    },
    layers: [
      { id: "l1", type: "text", text: "ANNUAL DINNER 2026", x: "center", y: 312, fontSize: 24, fontFamily: "Inter", fontWeight: "600", color: "#b7945d", textAlign: "center", width: "max-content" },
      { id: "l2", type: "text", text: "Corporate Excellence", x: "center", y: 408, fontSize: 56, fontFamily: "Playfair Display", fontWeight: "bold", color: "#ffffff", textAlign: "center", width: "max-content" },
      { id: "l3", type: "text", text: "Hotel Excelsior • RSVP required", x: "center", y: 490, fontSize: 20, fontFamily: "Inter", fontWeight: "300", color: "#cccccc", textAlign: "center", width: "max-content" }
    ],
    blocks: [
      { id: "m1", type: "map", order: 1, props: { title: "Location Sede", address: "Centro Direzionale", mapUrl: "" } },
      { id: "r1", type: "rsvp", order: 2, props: {} }
    ]
  },

  // --- BATTESIMO & NASCITE ---
  {
    id: "battesimo_sweet",
    name: "Dolce Arrivo",
    category: "Battesimo & Nascite",
    thumbnail: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800",
    canvas: {
      bgImage: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800",
      width: 800,
      height: 1000
    },
    theme: {
      preset: "garden",
      accent: "#a0cecb",
      background: "#ffffff",
      fonts: { heading: "Alex Brush", body: "Inter" }
    },
    layers: [
      { id: "l1", type: "text", text: "Siamo felici di annunciare il battesimo di", x: "center", y: 160, fontSize: 20, fontFamily: "Inter", fontWeight: "300", color: "#555555", textAlign: "center", width: "max-content" },
      { id: "l2", type: "text", text: "Leonardo", x: "center", y: 268, fontSize: 96, fontFamily: "Alex Brush", fontWeight: "normal", color: "#a0cecb", textAlign: "center", width: "max-content" },
      { id: "l3", type: "text", text: "Domenica 18 Ottobre 2026\nChiesa di San Lorenzo, ore 11:00\nSeguirà rinfresco presso Villa Flora.", x: "center", y: 760, fontSize: 20, fontFamily: "Inter", fontWeight: "normal", color: "#444444", textAlign: "center", width: "max-content" }
    ],
    blocks: [
      { id: "r1", type: "rsvp", order: 1, props: {} }
    ]
  }
];
