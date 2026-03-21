export const decodeHtml = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

// Dynamic Google Font Loader
export const loadGoogleFont = (fontFamily) => {
  if (!fontFamily) return;
  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-')}`;
  if (document.getElementById(fontId)) return;
  const link = document.createElement("link");
  link.id = fontId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
};

export const AVAILABLE_FONTS = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Playfair Display",
  "Cormorant Garamond", "Fraunces", "DM Serif Display", "Space Grotesk",
  "Alex Brush", "Great Vibes", "Dancing Script", "Pacifico", "Amatic SC",
  "Bebas Neue", "Anton", "Lobster", "Righteous", "Cinzel", "Oswald",
  "Raleway", "Poppins", "Nunito", "Quicksand", "Crimson Text", "Libre Baskerville",
  "Merriweather", "PT Sans", "Work Sans", "Rubik", "Lora", "Fira Sans",
  "Ubuntu", "Mukta", "Noto Sans", "PT Serif", "Nanum Gothic", "Titillium Web",
  "Heebo", "Karla", "Josefin Sans", "Libre Franklin", "Inconsolata", "Bitter",
  "Dosis", "Hind", "Cabin", "Fjalla One", "Source Sans Pro", "Source Serif Pro",
  "Abril Fatface", "Varela Round", "Comfortaa", "Exo 2", "Kanit", "Teko",
  "Shadows Into Light", "Caveat", "Permanent Marker", "Satisfy", "Courgette",
  "Kaushan Script", "Cookie", "Chewy", "Handlee", "Neucha", "Marck Script",
  "Sacramento", "Yellowtail", "Parisienne", "Tangerine", "Allura", "Pinyon Script",
  "Berkshire Swash", "Leckerli One", "Rochester", "Arizonia", "Mr De Haviland",
  "Niconne", "Bad Script", "Yeseva One", "Forum", "Prata", "Rokkitt", "Cormorant",
  "Alegreya", "EB Garamond", "Cardo", "Gilda Display", "Philosopher", "Cinzel Decorative"
].sort();

export const getFontPreviewText = (selectedLayer) => {
  if (!selectedLayer || (selectedLayer.type !== 'text' && selectedLayer.type !== undefined)) return "AaBbCc";
  const raw = (selectedLayer.text || "");
  
  const doc = new DOMParser().parseFromString(raw, 'text/html');
  const clean = doc.body.textContent || "";
  
  if (!clean.trim()) return "AaBbCc";
  return clean.length > 20 ? clean.substring(0, 18) + "..." : clean;
};

export const AVAILABLE_LINERS = [
  { id: 'minimal_pink', url: '/minimal_pink_liner.png', name: 'Minimal Pink' },
  { id: 'wedding_floral', url: '/wedding_liner.png', name: 'Wedding Floral' },
  { id: 'silk', url: '/bg_texture_silk.jpg', name: 'Seta' }
];

export const AVAILABLE_SCENARIO_BGS = [
  { id: 'default', url: '/bg_scenario_default.jpg', name: 'Default' }
];
