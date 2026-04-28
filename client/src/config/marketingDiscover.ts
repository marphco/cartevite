/**
 * Link al dettaglio di prodotto (come funziona, cosa c’è nell’invito, perché eenvee) nella nav marketing.
 * Oggi: ancora sulla home (`#scopri-eenvee`). Quando esiste la pagina dedicata,
 * sostituire `MARKETING_DISCOVER_TO` (es. `/scopri`) e aggiornare `isMarketingDiscoverActive`.
 */
export const MARKETING_DISCOVER_LABEL = "Scopri" as const;

export const MARKETING_DISCOVER_TO = "/#scopri-eenvee" as const;

export const MARKETING_DISCOVER_HASH = "#scopri-eenvee" as const;

export const MARKETING_DISCOVER_SECTION_ID = "scopri-eenvee" as const;

export function isMarketingDiscoverActive(pathname: string, hash: string): boolean {
  return pathname === "/" && hash === MARKETING_DISCOVER_HASH;
}
