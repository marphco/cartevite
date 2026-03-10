# WORKLOG

## 2026-02-26

- Workspace setup, repository inspection, roadmap definition (design system, builder evolution, hero animation, marketing site, payments, backend hardening).
- No code changes yet; preparing staged plan before implementation.
- Initialized client/server dependencies locally (npm install) and verified builds run.
- Created new design foundation: global typography + color tokens (`src/index.css`), cleaned old default styles, added noise texture asset.
- Added reusable UI primitives (`client/src/ui`: Surface, Button, Badge, StatCard + utility CSS) for consistent look.
- Rebuilt Dashboard page UI (`Dashboard.jsx` + `Dashboard.css`): new hero header, stats cards, premium/draft badges, modern event cards, responsive layout, improved action buttons.
- Ran `npm run build` in `client/` to ensure updated UI compiles without errors.
- Restyled Event Editor (`EventEditor.jsx` + `EventEditor.css`): sticky panel, theme controls placeholders, block cards, upgrade modal re-skin; logic invariata.
- Reworked New Event page (`NewEvent.jsx` + CSS): CTA hero, plan selection cards, consistent form controls.
- Redesigned public event page (`EventPublic.jsx` + CSS): hero envelope animation, gallery carousel, RSVP card, theme-aware styling.
- Updated auth/login UI (`Login.jsx` + CSS) to align with new visual language.
- Rebuilt client (`npm run build`) after all UI changes.
- Fixed runtime crash on Login (missing `Badge` import) and reran `npm run build` to confirm.
- Relaxed CORS policy in `server/server.js` to accept both localhost:5173 and 5174 (configurable via `CLIENT_ORIGINS` env), fixing dev mismatch. Further update: automatically allow any `http://localhost:*` origin to prevent future port issues and log the origin used.
- Adjusted UI buttons (primary/ghost/danger) to ensure high-contrast text on dark backgrounds.
- Rebuilt RSVP management page (`EventRsvps.jsx` + CSS) with the new design system: summary stats, filter chips, manual add card, modern guest cards and edit/delete flows; matching styling across app.
- `npm run build` after RSVP redesign.
- Integrato prototipo 3D (`Envelope3D.jsx`) usando Three.js + react-three-fiber e sostituito la hero 2D con Canvas 3D su `EventPublic.jsx`. Build ora include nuove dipendenze (chunk ~1.1MB Gzip ~324KB). CSS della hero aggiornato per ospitare il Canvas.
- `npm run build` after 3D integration (noted chunk size warning per Three.js bundle).

## 2026-02-27

- Recupero contesto repository + richieste: lettura `WORKLOG.md`, `client/src/pages/*`, `server/server.js`. Nessuna memoria/specifica esterna disponibile → riallineate con Marco via chat.
- Formalizzato piano operativo richiesto (Fase 1) con stato attuale, gap e sequenza deliverable: file `docs/fase1-spec.md` creato (11:50 EST) per tracciare scope (3D polish, block editor, design controls, inviti & rubrica, UX inviti/RSVP, marketing site).
- Creato branch `feature/cartevite-phase1`.
- Phase A kick-off: `components/Envelope3D.jsx` reingegnerizzato con materiali PBR, timeline easing, luci multiple + Environment HDR e sincronizzato con accento tema; `EventPublic.jsx` ora passa `accent`, `EventPublic.css` aggiornata per layout testo multi-colonna.
- Phase B scaffolding: introdotto `client/src/utils/layoutSchema.js` (libreria blocchi, preset colonne e temi) + nuovo pannello "Blocchi guidati" in `EventEditor.jsx`/`EventEditor.css`; blocchi selezionabili con layout chips, highlight selezione, e salvataggio tema esteso (colori personalizzati, font pairing, preset). Rimosse quick actions legacy, aggiornato salvataggio per includere `theme`.
- Bozze ulteriori (in corso): blocco foto singola, layout colonne, palette/font picker implementati a livello di editor ma **non ancora** collegati alla preview live né all’output pubblico; mappa auto-link pronta lato UI ma non ancora completata lato API.
- Scope ancora da sviluppare (ordinato per urgenza):
  1. Rifinitura blocchi/layout (rimuovere look “card”, applicare varianti layout/palette/font nella pagina pubblica, esporre blocco foto singola). **Update 21:55** → Fixato upload (FormData ora senza `Content-Type` forzato), galleria resa masonry a colonne libere, blocco foto singola con campi “caption/pulsante” facoltativi e copy più umano. Prossimo micro-step: palette/font live + icone premium.
  2. Pagina “Inviti” con import rubrica nativa + compose multi-canale (email/WhatsApp/SMS) e valutazione struttura con RSVP.
  3. Marketing/vetrina premium con catalogo inviti e storytelling del servizio.
  4. Integrazione pagamenti (Stripe o alternative a basse commissioni) con UI dedicata.
  5. Sostituzione delle emoji con icone premium coerenti (UI globale).
  6. Spostare lo storage immagini su bucket esterno (Cloudflare R2 suggerito) per evitare crescita su disco locale + prevedere policy limiti upload.
- Eseguito `npm run build` in `client/` (vite) → successo (chunk principale 1.2MB per via di Three.js; warning già noto).
