# CARTEVITE – Fase 1 Operativa (2026-02-27 11:50 EST)

## Obiettivi richiesti

1. Animazione 3D della busta/invito stile Paperless Post.
2. Editor pagina evento “a blocchi” estremamente semplice per utenti non tecnici.
3. Pannello di personalizzazione design (colori, font, layout a colonne stile Elementor light).
4. Invio inviti integrato con la rubrica nativa (Android/iOS/Desktop) e canali e-mail / WhatsApp / SMS gestiti in-house.
5. Valutazione struttura pagina invii vs RSVP (separare o fondere) e implementazione della soluzione scelta.
6. Marketing site/vetrina premium con catalogo inviti per categorie + spiegazione servizio.

---

## Stato attuale e gap

| Area | Cosa esiste ora | Gap principali |
| --- | --- | --- |
| 3D busta | `client/src/components/Envelope3D.jsx` + hero in `EventPublic.jsx`. Mesh semplice, materiali basici, animazione statica. | Motion piatto, nessun easing/sequence, materiali poco realistici, niente interazione CTA. |
| Editor pagina evento | `EventEditor.jsx` usa layout rigido con sezioni predefinite; UI già restylata ma non modulare. | Manca schema blocchi, nessun drag/drop, impossibile ricombinare layout. |
| Personalizzazioni | Theme picker placeholder; CSS vars limitate. | Nessun controllo reale su palette, font pairing, colonne; niente preview live. |
| Inviti & rubrica | Solo RSVP manager (aggiunta manuale). Nessuna integrazione contatti o flussi invio. | Serve import rubrica, compose messaggi multicanale, orchestrazione server. |
| RSVP vs Invii | Pagina RSVP rifatta ma isolata. | Va deciso se unire invii+RSVP (tab?) o mantenere viste separate. |
| Marketing site | Non esiste landing/vetrina: l’app client parte direttamente sul dashboard. | Va creata struttura marketing + catalogo inviti. |

---

## Piano operativo (sequenza + deliverable)

### Phase A – 3D Envelope polish (ETA ~3h)
- Refine `Envelope3D.jsx` con materiali PBR (MeshPhysicalMaterial), mappe texture (paper grain, foil). Assets in `client/public/textures/`.
- Timeline animation: sequenza di keyframe (GSAP o React Spring) per apertura busta, reveal invito, floating. Sincronizzare con CTA "Visualizza Invito".
- Hero layout (`EventPublic.jsx` + CSS) aggiornato per controllare fallback (static hero su device legacy). Build check (`npm run build`).

### Phase B – Block Editor core (ETA ~6h)
- Data model: `client/src/utils/layoutSchema.ts` con definizione blocchi (Hero, Text, Gallery, RSVP, Custom HTML).
- Editor UI: `client/src/pages/EventEditor.jsx` evoluto → introdurre pannello "Blocchi disponibili" + area canvas (drag/drop leggero usando `dnd-kit`).
- Salvataggio: patch API `POST /api/events/:id/layout` (nuovo controller server). Stato persistito nel DB mock (attuale storage?) — definire JSON schema in `server/models/eventLayout.json`.

### Phase C – Design Controls (ETA ~4h)
- Side panel "Design" con tab: Colori, Tipografia, Colonne.
- Colori: preselezioni + custom pickers (usare `react-colorful`). Applicare a CSS vars in `client/src/index.css` (prefisso `--theme-*`).
- Font: pairing (Serif, Sans, Script). Integrare Google Fonts via `<link>` dinamico.
- Layout colonne: presets (1/2/3) per sezione selezionata; generare classi responsive (`grid-cols-*`).

### Phase D – Invitations & Rubrica (ETA ~8h)
- UI nuova pagina `EventInvites.jsx` (o tab in RSVP). Sezioni: Import contatti (CSV/vCard), Selezione manuale, Compose messaggio per canale.
- Native contacts: proporre PWA + `navigator.contacts.select` (Chrome/Android), fallback upload CSV; documentato in UI.
- Canali: Email (MIME builder server), WhatsApp (deep link con template personalizzato), SMS (affidarsi a gateway interno: mock queue in server). Implementare service `server/services/messageDispatcher.js` con code per ogni canale (per ora log/console, hook per provider futuri).

### Phase E – RSVP vs Invii UX (ETA ~1h spec + 3h implement)
- Soluzione proposta: pagina combinata con tab "Inviti" e "RSVP" dentro `EventRsvps.jsx`. Motivazione: contesto condiviso (stesso dataset). Alternativa: mantenere separate ma cross-link.
- Implementare tabbed interface, mantenendo componente RSVP esistente come tab 2.

### Phase F – Marketing/Vetrina (ETA ~5h)
- Nuovo route pubblica `/` → `MarketingLanding.jsx` + CSS. Struttura: Hero premium, sezione "Come funziona" (3 step), catalogo inviti (carosello categorie), testimonianze.
- Catalogo: dataset mock `client/src/data/inviteCatalog.json` con categorie (Matrimoni, Corporate, Party). Cards con preview (riusare asset `client/public/previews/`).
- CTA verso signup/event builder.

Totale stimato: ~30h uomo. Priorità immediate: Phase A + B + C (core prodotto). Parallelizzo dove possibile (es. mentre build 3D gira, impianto schema layout).

---

## Prossimi passi immediati
1. Branch `feature/cartevite-phase1`.
2. Implementazione Phase A (3D polish) + setup skeleton per Phase B (data schema + UI scaffolding) oggi stesso.
3. Aggiornamenti frequenti nel WORKLOG + commit granulari.
