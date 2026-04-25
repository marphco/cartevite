# Roadmap Progetto Ynvio 🛠️💎

Log completo delle funzionalità implementate e delle prossime feature da realizzare per rendere l'editor di Eenvee un'esperienza premium e fluida (Canva-like).

---

## ⏳ Storico Progetto (Completato)

### 26-02-2026: Fondamenta e Restyle UI
- [x] Setup workspace e definizione roadmap.
- [x] Fondamenta design: Tipografia e token colore (`src/index.css`).
- [x] Primitive UI riutilizzabili (`client/src/ui`: Surface, Button, Badge, ecc.).
- [x] Rifacimento UI Dashboard (header moderno, statistiche, card eventi).
- [x] Restyle Editor Eventi (pannello sticky, placeholder temi).
- [x] Redesign pagina Nuovo Evento (hero CTA, card selezione piano).
- [x] Redesign pagina pubblica Evento (animazione busta hero, galleria).
- [x] Fix Reattività Chrome (PointerDown Selection) ✅
- [x] Sistema Ordinamento Mobile (Frecce Sezioni/Elementi) ✅
- [x] Cleanup Branding (Rimozione Canva e jargon tecnico) ✅
- [ ] Test finali su diversi dispositivi
- [x] Allineamento UI Auth/Login.
- [x] Rilassamento policy CORS nel server.
- [x] Redesign pagina gestione RSVP (statistiche, filtri, card invitati).
- [x] Sincronizzazione perfetta tra Editor e Public View per il widget RSVP.
- [x] Risoluzione bug persistenza: `widgetProps` salvati correttamente nel DB.
- [x] Pulizia completa dei warning TypeScript in `ReadOnlyCanvas.tsx`.
- [x] Prototipo Busta 3D (`Envelope3D.jsx`) con Three.js.

### 27-02-2026: Avvio Operativo Fase 1
- [x] Formalizzazione `docs/fase1-spec.md`.
- [x] **Fase A: Rifinitura Busta 3D**
    - [x] Materiali PBR e illuminazione d'ambiente.
    - [x] Sincronizzazione con i colori d'accento del tema.
- [x] **Fase B: Scaffolding Editor a Blocchi**
    - [x] Definizione `layoutSchema.js`.
    - [x] Pannello "Blocchi guidati" nell'Editor.
    - [x] Galleria Masonry e blocco Foto Singola.
    - [x] Fix upload (problemi FormData).

### 02-03-2026: Nuove Feature "ORO"
- [x] **Formato Rettangolare Verticale**
    - [x] Creazione componente Invito Verticale.
    - [x] Creazione Busta Rettangolare Orizzontale.
    - [x] Implementazione animazione dedicata (rotazione 90° sx -> 0°).
    - [x] Selezione automatica della busta.
- [x] **Personalizzazione Profonda Busta**
    - [x] Colore base editabile.
    - [x] Texture liner superiore (interna) personalizzabile.
    - [x] Colori alette editabili singolarmente.
    - [x] Texture liner tasca (interna) personalizzabile.
- [x] **UX e Persistenza**
    - [x] Sistema Undo multi-livello (Cmd+Z).
    - [x] Persistenza `localStorage` / Auto-salvataggio.
    - [x] Funnel di personalizzazione guest trial.

### 03-03-2026: Rifiniture & UX Avanzata
- [x] **Desktop UI & Sidebar**
    - [x] Pulizia Topbar e switcher sidebar.
    - [x] Pulsante "Pagina Evento" (placeholder) in sidebar.
- [x] **Sistema Undo Avanzato** (Multi-livello granulare).
- [x] **Fix Funzionali & Texture**
    - [x] Upload Texture Custom.
    - [x] Navigazione "Sfondo/Scenario" via Sidebar.
- [x] **Mobile Optimization**
    - [x] Redesign Topbar (no scroll).
    - [x] Pinch-to-Zoom per lo sfondo su mobile.
    - [x] Naming: "Scenario" al posto di "Scena".

### 01-04-2026: Rifinitura Event Page Builder (Milestone Toolbar & Scaling)
- [x] **Floating Section Toolbar**: Menu contestuale per spostare (Su/Giù), duplicare ed eliminare le sezioni in tempo reale.
- [x] **Unificazione Design "Jewelry"**: Toolbar con notch verde smeraldo e coerenza estetica premium.
- [x] **Scissione Scala Editor vs Pubblico (isBuilder)**: (isBuilder logic) 0.85/0.7 Editor vs 1.25/1.35 Pubblico.
- [x] **Centratura Millimetrica**: Offset 0.05 per l'invito estratto sulla pagina pubblica.
- [x] **Protezione Hero Section**: Ripristino 100px padding-top per evitare clipping dell'aletta.
- [x] **Stabilità Git**: Commit e push su branch `main`. ✅
### 02-04-2026: Perfezionamento UX Hero & Layout Editor
- [x] **Scroll Hint "Luminous Minimal"**: Implementato indicatore di scroll adattivo con `mix-blend-mode: difference` (visibilità universale su ogni sfondo). ✅
- [x] **Sincronizzazione Colori Scenario**: Fix bug visibilità colori scenario in tutte le tab dell'Editor (Tela, Busta, Scenario, Pagina). ✅
- [x] **Ottimizzazione Tasti Replay/Apri**: Fine-tuning dei posizionamenti per Verticale, Quadrato e Orizzontale (inclusa correzione specifica per Mobile Builder). ✅
- [x] **Fix Mobile Background**: Ripristinata la regolazione di posizione e zoom dello sfondo su dispositivi mobili nell'Editor Invito. ✅
- [x] **Architettura Layout Unificata**: 
    - [x] Allineamento larghezza Hero a 900px nell'Editor per coerenza visiva con i blocchi. ✅
    - [x] Implementazione "Safe Padding" (100px) per la protezione della toolbar esterna su ogni viewport. ✅
- [x] **Evoluzione Toolbar & Colori (Fase 2)**: 
    - [x] Aggiunta Mini-Labels sotto le icone della toolbar per una UX ottimizzata sia su Desktop che su Mobile. ✅
    - [x] Sistema di personalizzazione colore di sfondo per ogni singola sezione tramite Popover dedicato. ✅
    - [x] Rifinitura UI: Icona colore a quadratino, etichette esplicite e sistema di eliminazione a due step ("SICURO?"). ✅
    - [x] Fix Persistenza Database: Aggiunto supporto nativo a `bgColor` nel server per salvataggio permanente. ✅
    - [x] Ottimizzazione Mobile: Color picker ridisegnato in formato rettangolare compatto. ✅

---

### 03-04-2026: Debugging & UI Unification
- [x] **Fix Bug Salvataggio (Errore 413)**: Incrementati i limiti del server (50mb) e corretta la gestione delle immagini nel PropertyPanel (rimosso base64 a favore di R2). ✅
- [x] **Unificazione UI "Jewelry"**: Uniformato lo stile dei pulsanti a pillola (Sostituisci Immagine, Colore Scenario, Carica Immagine Scenario) per garantire coerenza premium. ✅
- [x] **Isolamento Layer Invitato/Pagina**: Implementato filtro in `ReadOnlyCanvas` per garantire che i contenuti della pagina evento non "sporchino" l'invito e la busta. ✅
- [x] **Uniformità Selezione**: Allineato lo stile del rettangolo di selezione tra Editor Invito e Editor Pagina. ✅
- [x] **Fix Critici Selezione & Gestione Blocchi**: Risolto il problema del clic sullo spazio vuoto nullo; ottimizzata la duplicazione e lo spostamento dei blocchi (movimento atomico e stabile). ✅

---

### 05-04-2026: Milestone "Smart & Atomic Builder" ✅
*Giornata dedicata alla stabilità strutturale dell'editor e al redesign dell'esperienza mobile.*

- [x] **Refactoring Mobile Toolbar (Jewelry Tiffany Style)**:
    - [x] Riorganizzazione semantica: separazione tra "AGGIUNGI" (SX) e "VISUALIZZA SU" (DX).
    - [x] Design System: Implementazione stile "pillola" (Verde Tiffany `--accent`) con testi bianchi per massima leggibilità.
    - [x] Allineamento millimetrico e rimozione elementi ridondanti.
- [x] **Section Toolbar Update**:
    - [x] Trasformazione etichette (TESTATO, IMMAGINE, SEZIONE) in badge a pillola coordinati.
- [x] **Desktop Sidebar Sync (Fix Bug Focus)**:
    - [x] Logica di rendering prioritaria: ora la selezione di un elemento (testo/foto) apre istantaneamente il relativo pannello proprietà, scavalcando la gestione sezioni.
- [x] **Logic: Atomic Layer Duplication (Fix Rimescolamento)**:
    - [x] Implementazione approccio **100% Immutabile**: ogni duplicazione clona i layer e ricalcola i `mobileOrder` sequenzialmente (0, 1, 2...).
    - [x] Inserimento "In-Place": il duplicato appare fisicamente e logicamente dopo l'originale, senza alterare la posizione degli altri blocchi nell'array globale.
- [x] **Gestione Sezioni Sidebar Redesign**:
    - [x] Semplificazione testi per utenti meno esperti.
    - [x] Pulsanti rapidi: `Sezione Vuota` (Plus) e `Sezione Mappa` (MapPin) per inserimento immediato dei widget corretti.

---

### 19-04-2026: Paywall piano Evento — fattura IT, email, idempotenza ✅
- [x] **Modal acquisto** (`EventPurchaseModal` + CSS): dati pagatore (nome/cognome), checkbox fattura, form per **persona fisica / professionista / società** (copy e placeholder allineati a produzione), indirizzo strutturato; metadata Stripe `inv_*` e `invoice_requested` da `validateInvoiceForIntent` in `server/utils/invoiceIntentPayload.ts`.
- [x] **Email acquisto**: ricevuta acquirente + notifica interna **solo** da webhook `payment_intent.succeeded` (rimosso dispatch duplicato da `complete-unlock-intent` / `complete-checkout`); claim atomico su `paidReceiptSentForPi` in `paidEventEmailDispatch.ts`; destinatari `INTERNAL_NOTIFY_EMAIL` (multi) o fallback `SMTP_USER`; controllo esito `sendEmail`; `.env.example` aggiornato (`donationEmails.ts`).
- [x] **CF / P.IVA in fattura**: validazione **solo formato** (niente checksum: evita falsi negativi es. omocodia); commenti espliciti in `invoiceIntentPayload.ts` (2026-04-19).

---

### 20-04-2026: Inviti — messaggio + link, WhatsApp `wa.me`, condivisione nativa ✅
- [x] **Pagina inviti** (`EventInvites.tsx` + CSS): template messaggio con placeholder `{name}` e `{link}` (URL pubblico `/e/:slug` automatico); per ogni contatto pulsanti **WhatsApp** (deep link `wa.me` con numero normalizzato e testo precompilato), **Condividi** (`navigator.share` + fallback copia), **Segna inviato**; azione bulk **Segna come inviati** sui selezionati.
- [x] **Util** `client/src/utils/whatsAppInvite.ts`: normalizzazione numeri (focus Italia `39`), limite lunghezza testo per URL, `buildWhatsAppSendUrl`.
- [x] **API** `POST /api/events/:slug/invites/send`: validazione `inviteIds`, dedup, verifica che tutti gli inviti appartengano all’evento prima di `updateMany` (`inviteRoutes.ts`).
- [x] **UI allineata a RSVP / donazioni**: `EventInvites` su shell `rsvp-page` + `StatCard`, form `rsvp-input` / `rsvp-textarea`, card elenco stile `rsvp-card` + `don-gift-list`, note QR/`localhost`; `MobileImport` stesso sfondo e tipografia (`EventRsvps.css`).
- [x] **RSVP aggiunta manuale (host) allineata al modulo pubblico** (`EventRsvps.tsx` 2026-04-20): lettura `widgetProps` da `/api/events/:slug/private` (stesso blocco `rsvp`); numero ospiti condizionato a `rsvpAskGuests`; email/telefono e validazione “almeno uno” come `RSVPWidget`; domande custom (testo + SÌ/NO) nello stesso ordine; allergie con `buildAllergiesPayload` + `allergiesDetail` o testo libero se le intolleranze sono disattivate nell’editor. Fix `setManualSending` solo dopo le validazioni.

---

## 🚀 La Nuova Architettura: Sviluppo a Lotti Modulari (Batches)

Per garantire un codice pulito, altamente debuggabile e con struttura a micro-componenti, le feature rimaste sono state organizzate per priorità evolutiva.

### ✅ Lotto 1: Interactive Essentials (COMPLETATO)
- [x] **Restauro PageSection.tsx**: Sincronizzazione totale "Zero Diff" con il monolite.
- [x] **Widget RSVP High-Perf**: Ripristino Tab (Titoli, Style, Domande, Menu).
- [x] **Jewelry Design Polish**: Shadow `0 0 12px`, Label `750` weight, Adaptive Padding.
- [x] **Design Libero**: Implementazione toggle `freeDesign` per layout aperti.
- [x] **Widget RSVP Real-Time**: Uniformato `EventPublic.tsx` al layout flex-stack dell'Editor (`LOGICAL_WIDTH = 1000px`).
- [x] **Design pubblico**: Sviluppato `RSVPWidget.tsx` (Jewelry Style) riutilizzabile sia in editor (ReadOnly) che in public view. Supporta toggle presenza, numero ospiti e intolleranze.
- [x] **Editor**: Aggiunto bottone "Sezione RSVP" nella sidebar con controlli per personalizzare testi e regole del form (titolo, messaggi e toggle intolleranze/ospiti).

### 10-04-2026: Interattività & Allineamento RSVP ✅
- [x] **Testi come Layer**: Trasformazione dei titoli e descrizioni RSVP in layer trascinabili. Isolamento logica widget per layout pulito senza clonazioni sulla public page.
- [x] **Semplificazione Editor**: Rimossa tab "Testo", ridotta l'interfaccia RSVP a focus più stretto sia in Desktop che Mobile.
- [x] **Sincronizzazione Z-Index Layer**: Sistemato il bug in SectionCanvas per cui le vecchie interfacce RSVP andavano perse/si duplicavano sotto Maps widget.
- [x] **RSVP "Forse" (Baby Step 1)**: Introdotta classificazione opzionale a 3 vie (Sì / No / Forse). Mantenute le logiche di controllo e UI per Ospiti/Intolleranze anche nello stato "Maybe".
- [x] **Mobile Widget Rendering Order (Bug Fix)**: Iniettati `MapWidget` ed `RSVPWidget` nello stream dinamico dell'edit layer su mobile. Permette ora al tasto "Sposta Su" e "Sposta Giù" di far fluttuare liberamente i layer *sopra* o *sotto* l'interfaccia form.
- [x] **Form RSVP Draggabile Libero (Baby Step 2)**: Implementazione proprietà `formY`/`formX` nel widget property per trattare il container del form allo specchio di un testo draggabile su editor. EventPublic aggiornato nativamente rimpiazzando logica di container fisso e incanalando i render widgets dentro ReadOnlyCanvas.
- [x] **Personalizzazione Colori Form (Baby Step 3)**: Aggiunta opzioni colore sfondo, testi e bottoni per il blocco form. ✅
- [x] **Ottimizzazione Toolbar Mobile RSVP (Baby Step 4)**: Riorganizzazione Tab e naming per massima chiarezza. ✅
- [x] **Mirroring Perfetto Editor/Pagina Pubblica**: Allineata la logica di `ReadOnlyCanvas` mobile (fontSize 1.25x, lineHeight, gap, padding) per una fedeltà millimetrica con il builder. ✅

### 11-04-2026: Milestone "Jewelry Precision & Stability" 💎✅
*Focus su stabilità del dato, zero-diff editor/pubblico e pulizia codice professionale.*

- [x] **Centralizzazione Persistenza (onUpdateBlock)**: Migrazione totale verso un unico flusso di salvataggio atomico per Mappe, Widget RSVP e Drag&Drop. ✅
- [x] **Zero-Warning Codebase**: Deep cleanup di `DesktopSidebar.tsx`, `PageSection.tsx` e `EventPageBuilder.tsx`. Rimossi import morti e prop obsolete. ✅
- [x] **TypeScript Strict Mode Fix**: Risolti errori di tipo `exactOptionalPropertyTypes` per un'integrità del codice di livello enterprise. ✅
- [x] **Fix Drag-Persistence**: Il posizionamento (X, Y) del form RSVP ora viene salvato correttamente nel database durante lo spostamento nel canvas. ✅

### 17-04-2026: RSVP Data Consistency & UI Alignment
*Focus sull'allineamento tra editor e public view del widget RSVP, unificazione del modello dati e rifinitura estetica dei controlli della sidebar.*

- [x] **Auto-Contrast Form RSVP**: I testi del form si adattano automaticamente allo sfondo effettivo della sezione (passato come `sectionBg` dal builder e dalla public view), risolvendo i casi di scarsa leggibilità su sezioni chiare/trasparenti. ✅
- [x] **Fix Persistenza Domande Custom (Desktop vs Mobile)**: Unificato `customFields` su `block.widgetProps` per coerenza totale tra sidebar desktop, toolbar mobile e rendering pubblico. ✅
- [x] **UI Consistency Sidebar RSVP**: Rimossi toggle `<input type="checkbox">` grezzi nella tab "Domande"; ora righe `Button` in stile Jewelry coerenti con la mobile toolbar. Rimosso divisore rosso residuo ("debug") in favore di `var(--border)`. ✅
- [x] **Pill Tabs RSVP Unificati**: I tab "Stile / Domande" della sidebar RSVP ora usano le primitive `Button` (variant `primary/ghost`) al posto di `<button>` inline, replicando esattamente i pattern di Invito/Scenario/Busta. ✅
- [x] **Color Picker Row RSVP Jewelry**: La riga "Pulsante & Accenti" della sidebar RSVP è stata portata sul pattern `Button variant="primary|subtle"` con pillola `100px` + swatch a destra (identico a `ScenarioSection.tsx`), con glow attivo quando il picker è aperto. ✅
- [x] **Custom Fields Refactor (Sidebar)**: Ogni domanda personalizzata è ora racchiusa in un `Surface variant="soft"` con toggle tipo (Testo libero / Sì-No) come `Button` segmentato e riga "Obbligatorio" con check-box in stile Jewelry. Eliminati `<select>` e checkbox grezzi. ✅
- [x] **Mobile Toolbar RSVP Allineata al Desktop**: Rimossi i color picker "Testi" e "Sfondo Input" non più usati dal widget auto-contrast; mantenuto solo il picker "Pulsante & Accenti" + banner informativo identico a desktop. Unica sorgente di verità coerente tra desktop e mobile. ✅
- [x] **Fix Missing Import (`Check`)**: Aggiunto import mancante di `Check` (lucide-react) in `PageSection.tsx` per i toggle RSVP "Numero Ospiti" / "Allergie". ✅
- [x] **Rimozione "Email Placeholder" nel Form RSVP**: Disattivando "Chiedi numero ospiti" il form non sostituisce più il campo con un input email "fantasma" mai presentato all'utente come campo effettivo. Ora il layout collassa elegantemente su **una singola colonna (nome full-width)** quando la seconda colonna non serve. Il campo `email` resta comunque opzionale lato payload per compatibilità con il backend. ✅
- [x] **Spaziatura Lettere & Righe su Mobile**: Aggiunti nella tab "Dimensioni" della `MobileToolbar` i due slider `Spaziatura Lettere` (-10..50) e `Spaziatura Righe` (0.5..3) con gli stessi range del `PropertyPanel` desktop, così l'editor testo mobile ha ora parità di controlli tipografici con quello desktop (icone `AA`/`A A` e `AlignJustify` compresso/espanso per feedback visivo immediato). ✅
- [x] **Fix Section Toolbar per Widget RSVP (Mobile)**: La floating toolbar mobile di un widget (form RSVP) ora mostra label **"Form RSVP"** invece del generico "Testo", riconoscendo i layer virtuali con prefisso `widget-` (usa `block.type` per il label corretto, valido anche per blocchi `map` → "Mappa"). ✅
- [x] **Sposta Su/Giù Funzionante per Form RSVP**: `moveLayerMobile` ora riconosce l'ID virtuale `widget-rsvp` e scambia correttamente `block.widgetProps.mobileOrder` con il `mobileOrder` del layer adiacente (e viceversa se si muove un layer reale verso/oltre il widget), rendendo il widget un **peer a pieno titolo** nello stream mobile. Persistenza atomica via `updateEventData({ blocks, layers })`. ✅
- [x] **Duplica Nascosto su Widget Unici**: Nuovo prop `isWidgetLayer` in `SectionToolbar`; quando il layer selezionato è un widget virtuale (RSVP/Mappa, **unici per sezione**) il pulsante "Duplica" viene nascosto, così l'utente non può più duplicare un form RSVP (operazione priva di senso). ✅
- [x] **Elimina Form RSVP → Elimina Sezione**: `deleteLayer('widget-rsvp')` ora rimuove l'**intero blocco** RSVP (modello mentale coerente: la sezione RSVP esiste per ospitare la form). La doppia-tap "SICURO?" della toolbar resta come safety-net; la selezione viene resettata. ✅
- [x] **`isFirstLayer`/`isLastLayer` includono il Widget**: Il calcolo di inizio/fine stream in `BuilderSection` include ora anche il widget virtuale (quando il blocco è `rsvp`/`map`), così le frecce "Sposta Su/Giù" si disabilitano correttamente ai bordi dello stream reale. ✅
- [x] **Floating Toolbar Adattiva**: Rimosso il `minWidth: 300px` hardcoded su mobile della `SectionToolbar`; la barra ora si auto-dimensiona (`width: max-content`, `maxWidth: calc(100vw - 24px)`) in base ai pulsanti effettivamente mostrati. Risolve lo "spazio morto" a destra quando si seleziona il widget RSVP (modalità in cui Duplica e Colore sono nascosti). ✅
- [x] **Label Widget → "Modulo RSVP"**: Rinominato il label del widget da `Form RSVP` a **`Modulo RSVP`** (più chiaro per utenti non tecnici). Aggiornato sia in `BuilderSection.contextLabel` (usato dalla floating toolbar) sia nella sidebar desktop. ✅
- [x] **Header di Contesto Uniforme su Tutti i Layer**: Aggiunto header "Stai modificando: [Tipo]" con icona accent e stile Jewelry in tre contesti diversi ma con markup identico: 1) sidebar `PageSection` quando si seleziona il modulo RSVP (icona `CheckSquare` → "Modulo RSVP"), 2) `PropertyPanel` in modalità Testo (icona `Type` → "Testo"), 3) `PropertyPanel` in modalità Immagine (icona `Image` → "Immagine"). Così l'utente sa SEMPRE cosa sta modificando, a prescindere dal tipo di elemento. ✅
- [x] **Unificazione Container Sidebar (Header + Contenuto)**: Rimossa la separazione visiva fra "mini-box header" e "pannello controlli". Ora l'intera sidebar RSVP vive dentro **un unico `Surface variant="soft"`** e l'header ("Stai modificando: Modulo RSVP") è diventato un'intestazione interna con border-bottom sottile (stesso pattern di `PropertyPanel` per Testo/Immagine). Anche `PropertyPanel` è stato pulito nello stesso modo: l'header non è più un box a sé ma la testata naturale del pannello. Risultato: zero "doppi rettangoli", sensazione di coerenza totale a colpo d'occhio. ✅
- [x] **Campo "Domanda" Chiaramente Editabile**: Il testo della domanda nei Campi Personalizzati prima sembrava statico (solo un sottolineato). Ora ha: a) etichetta esplicita **"DOMANDA"** sopra, b) un container input con sfondo `--surface`, bordo e `border-radius`, c) icona **matita** a sinistra per suggerire la modifica, d) focus state con bordo accent + glow sottile. Eliminato ogni dubbio sull'interattività. ✅
- [x] **Persistenza Completa Dati RSVP (Allergie + Risposte Custom)**: Prima il widget inviava `customResponses` e allergie dentro `message`, ma il server scartava `customResponses` e non aveva un campo dedicato per le allergie → la pagina gestione non mostrava nulla di tutto ciò. Ora:
  - **Modello `Rsvp`** esteso con `allergies: string` e `customResponses: [{ fieldId, label, type, answer }]` (denormalizzato di proposito: se rinomini la domanda le risposte storiche restano coerenti).
  - **Routes** `POST /api/rsvps`, `PUT /api/rsvps/edit/:token` e `PUT /api/rsvps/:id` ora accettano e persistono i nuovi campi; helper `normalizeCustomResponses` gestisce sia il nuovo payload array sia vecchie forme oggetto `{id: answer}` (retro-compat).
  - **`RSVPWidget`** invia adesso `allergies` come campo dedicato e `customResponses` come array strutturato con label/type catturati al momento dell'invio. ✅
- [x] **Pagina Gestione RSVP — Display Arricchito**: Nella `EventRsvps` ogni card ospite ora mostra:
  - **Callout Allergie** in stile warning (giallo con icona `AlertTriangle`) quando l'ospite ha segnalato intolleranze — immediatamente individuabile anche in liste lunghe.
  - **Risposte alle Domande Personalizzate** in un pannello con label grassetto + risposta, una riga per domanda, con gestione distinta di `checkbox` (Sì / No) e `text`.
  - **Retro-compatibilità**: record vecchi che avevano le allergie in `message` vengono rilevati via regex e renderizzati nel nuovo callout, senza perdere nessuna risposta già raccolta. ✅
- [x] **Export CSV per Catering & Fornitori**: Aggiunta barra di export sotto le stat cards con due pulsanti:
  - **"Scarica elenco completo (CSV)"**: tutte le RSVP con Nome, Email, Telefono, Ospiti, Stato, Allergie, Data + **una colonna dinamica per ogni domanda personalizzata** mai ricevuta (union). Ideale per planner & comunicazioni.
  - **"Scarica allergie per catering (CSV)"**: filtra solo chi ha segnalato intolleranze ed esclude i "Non può"; include Nome, N. Ospiti, Stato, Allergie, contatti — pronto da passare al catering.
  - Implementazione client-side zero-deps: BOM UTF-8 per Excel, escaping RFC 4180 (virgolette, virgole, newline), download via Blob. Nome file derivato dallo slug evento. ✅
- [x] **Dev Server con Hot-Reload (`tsx watch`)**: **Bug importante risolto**: `dev:server` chiamava `npm start` che eseguiva `tsx server.ts` **senza watch**, quindi qualsiasi modifica a modelli/routes Mongoose rimaneva invisibile al backend fino a un riavvio manuale. Cambiato `dev:server` per invocare `npm run dev --prefix server` che usa `tsx watch server.ts`. Effetto pratico: le modifiche ai file in `/server/**` ora applicano auto-restart (come HMR lato client). Spostate anche `jspdf`/`jspdf-autotable` (finite per errore nella `package.json` di root) dentro `client/package.json` dove vengono realmente importate, mantenendo pulita la separazione delle dipendenze monorepo-like. ✅
- [x] **Aggiunta Manuale Ospiti — Parità con Form Pubblico**: L'owner dalla dashboard RSVP può ora inserire manualmente ospiti con gli **stessi dati** che inserirebbe un ospite dal form pubblico:
  - La pagina gestione ora carica la config del blocco RSVP dell'evento (`widgetProps.askIntolerances` + `widgetProps.customFields`) da `/api/events/:slug/private` in fase di mount.
  - Il form di aggiunta manuale mostra, **condizionatamente** (solo se il modulo è configurato così), una sezione **"DATI AGGIUNTIVI"** con: campo **"Allergie / Intolleranze"** (opzionale) e un input per **ogni domanda personalizzata** (text o Sì/No a seconda del `type`), con stesso payload denormalizzato `{ fieldId, label, type, answer }` del widget pubblico.
  - La sezione si nasconde se lo stato è "Non può" (coerente con il form pubblico che non chiede allergie/custom a chi non partecipa) e se l'evento non ha nessuna di queste opzioni configurate. ✅
- [x] **Diagnostica Payload RSVP (log temporanei → rimossi)**: Aggiunti in fase di debug due `console.log` (`[RSVPWidget submit]` lato client, `[RSVP POST]` lato server) per tracciare il flusso dei dati custom dalla UI al DB dopo che la voce "Quanti anni hai? 95" non risultava persistita. Una volta confermato che il fix dell'hot-reload del server risolveva il problema (le modifiche a modello + routes non venivano mai applicate), **i log sono stati rimossi** per mantenere la console pulita in produzione. ✅
- [x] **Export PDF Professionale (oltre al CSV)**: Aggiunte due varianti PDF (con `jspdf` + `jspdf-autotable`) perché il CSV non è per tutti — molti fornitori/catering preferiscono un documento stampabile.
  - **PDF Elenco Completo** (A4 landscape): header Tiffany, summary con conteggi (Conferme/Forse/Non possono + totale atteso), tabella striped multi-pagina con Nome, Email, Telefono, N. Ospiti, Stato (colorato per tipo), Allergie + colonne dinamiche per domande custom. Footer con numero di pagina.
  - **PDF Allergie Catering** (A4 portrait): header con stile warning, summary "N ospiti con allergie segnalate / persone coinvolte", tabella grid con Allergie evidenziate in arancio bold — pronta da stampare e consegnare in cucina. Esclude automaticamente i "Non può".
  - **UI Riprogettata**: zona export ora è un `Surface` dedicato "ESPORTA DATI OSPITI" con due card (Elenco completo / Allergie catering), ciascuna con bottoni CSV + PDF affiancati e icone distinte (`ClipboardList` / `ChefHat`). L'utente sceglie prima COSA esportare, poi in che formato. ✅

### 17 Aprile 2026 — Coerenza Finale Pagina RSVP (Edit + Export + Card)
- [x] **Modifica RSVP Completa — Allergie + Domande Custom**: Il form di edit nella card ospite prima lasciava modificare solo Nome/Ospiti/Stato; ora è **alla pari del form pubblico e dell'aggiunta manuale**. `startEdit` pre-popola `allergies` (leggendole dal campo dedicato o dal vecchio `message`) e le risposte custom indicizzate per `fieldId`. Mostra una sezione **"DATI AGGIUNTIVI"** con input allergie + una griglia di domande custom (text o Sì/No) basata sulla config dell'evento (`rsvpConfig`). `saveEdit` riscrive il payload denormalizzato `{fieldId, label, type, answer}` usando la config come source-of-truth per label/type, con fallback graceful se una domanda è stata rimossa dall'editor dopo la risposta. ✅
- [x] **Colonne Email/Telefono Adattive negli Export**: Il widget pubblico attualmente **non raccoglie** email e telefono, quindi CSV e PDF mostravano sempre due colonne vuote (rumore visivo e confusione per il catering). Ora sia l'export completo (CSV + PDF) sia quello allergie includono Email/Telefono/Contatto **solo se almeno una RSVP li ha valorizzati** (tipicamente i record creati via `handleManualAdd` o tramite API). Questo rende i documenti molto più puliti per gli utenti tipici, senza perdere flessibilità per chi raccoglie contatti fuori form. Aggiornato anche `didParseCell` per colorare la cella "Stato" all'indice giusto in base alla presenza/assenza di quelle colonne. ✅
- [x] **Card RSVP — Presentazione Risposte Custom Ridisegnata**: Le risposte alle domande personalizzate erano impilate come `Label:valore` piccolo e grigio, poco leggibili. Ora ogni domanda è un **mini-blocco** in una griglia responsive con: eyebrow accent uppercase per la domanda e **risposta in peso 600** sotto — stesso linguaggio visivo del callout allergie, coerenza immediata. Fallback "—" elegante per risposte vuote. Lo sfondo del pannello è ora `rgba(accent, 0.04)` con bordo tenue, in armonia con la palette Tiffany senza competere con il callout giallo delle allergie. ✅
- [x] **Rimossi Log di Debug RSVP**: Cancellati i due `console.log` temporanei (`[RSVPWidget submit]`, `[RSVP POST]`) ora che la catena salvataggio/visualizzazione è verificata end-to-end. ✅
- [x] **Gerarchia Export — PDF Primario, CSV Secondario**: Il PDF è di gran lunga il formato più usato (stampabile, condivisibile con fornitori, pronto all'uso). Ora in entrambe le card di export compare **per primo** con stile "primary": accent pieno nell'elenco completo, warm-amber pieno nelle allergie catering; il CSV resta disponibile ma in stile "subtle" come scelta secondaria per chi deve elaborare i dati in Excel/Numbers. Aggiornato anche il testo esplicativo del blocco "ESPORTA DATI OSPITI" per riflettere l'ordine: prima si nomina il PDF, poi il CSV come alternativa. Nessuna funzione rimossa (meglio avere un'opzione in più che una in meno). ✅
- [x] **Canali di Contatto RSVP (Email / Telefono) Configurabili**: Il widget pubblico prima **non chiedeva mai** email e telefono, quindi le colonne dei relativi export erano vuote. Ora il proprietario decide caso per caso:
  - **Sidebar RSVP** (`PageSection` → tab "Domande"): due nuovi toggle **"Chiedi email"** e **"Chiedi telefono"**, con **default OFF** (zero impatto sugli eventi esistenti). Quando almeno uno è attivo compare un hint contestuale che spiega la logica di validazione.
  - **Widget pubblico** (`RSVPWidget`): renderizza condizionatamente gli input email (`type="email"`, `inputMode="email"`, `autoComplete="email"`) e telefono (`type="tel"`, `inputMode="tel"`), con layout 2-colonne desktop / 1-colonna mobile se entrambi attivi.
  - **Validazione smart lato client**: se entrambi ON → basta uno dei due (hint sotto il campo: "Inserisci almeno uno dei due per permetterci di contattarti"); se solo uno è ON → quello diventa obbligatorio con asterisco; se entrambi OFF → nessuna raccolta. In più, controllo sintattico semplice sull'email (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) per evitare typo ovvi come "mario@".
  - **Owner dashboard** (`EventRsvps`): il form di aggiunta manuale e quello di edit mostrano sempre Email e Telefono come campi opzionali — l'owner potrebbe avere i contatti fuori-form (WhatsApp, agenda) e volerli annotare comunque. La card in lettura mostra email/telefono come chip cliccabili (`mailto:` / `tel:`) sotto il nome ospite se presenti.
  - **Server `PUT /api/rsvps/:id`**: ora accetta `email` e `phone` dal payload owner; stringa vuota viene tradotta in `undefined` per evitare conflitti col partial-unique-index (che altrimenti impedirebbe due RSVP "senza email"). ✅

### 17 Aprile 2026 — Pagina Pubblica RSVP: Sezione Adattiva + Padding Mobile + Copy Contatti
- [x] **Sezione RSVP Adattiva — Layout In-Flow per Desktop** (`EventPublic.tsx`): quando l'ospite cliccava "Sì" sulla domanda allergie (o qualsiasi altro campo condizionale che ingrandisce il form), il layout continuava a rompersi. Il motivo profondo: `transform: scale()` sul wrapper logico **non scala il layout, solo il visual**, quindi anche misurando il widget con `ResizeObserver` restava un mismatch tra altezza DOM (che cresceva) e altezza visiva scalata (che ignorava la crescita), risultando in spazi vuoti o overlap.
  - **Soluzione definitiva**: per i blocchi RSVP su desktop è stato abbandonato il pattern `transform: scale` a favore di un **layout in-flow**: il widget viene renderizzato come un `<RSVPWidget>` in flusso naturale dentro un flex-column centrato. La sezione si ridimensiona **organicamente** con il contenuto, senza ResizeObserver né calcoli dinamici. Il padding verticale (`rsvpTopPadding`, `rsvpBottomPadding`) è derivato dal `formY` configurato dall'autore (clamp min 40px) così la spaziatura autore-definita viene comunque preservata.
  - **Text layer decorativi eventuali**: quelli posizionati con coordinate (x,y) all'interno della sezione RSVP restano renderizzati come un overlay **assoluto scalato** sovrastante al widget, su un canvas logico di `block.height` — NON partecipano al flusso, quindi non interferiscono con la crescita naturale della sezione.
  - **Risultato**: zero clipping, zero overlap, la sezione nera cresce fluidamente verso il basso quando il form espande, i margini top/bottom configurati restano proporzionali. Soluzione cleaner che non richiede osservatori di resize o math dinamico. ✅
- [x] **Ordine Layer Mobile — Parità Editor/Pubblico** (`EditorHelpers.ts`): l'elenco degli elementi della sezione RSVP su mobile appariva in ordine diverso tra editor e pagina pubblica (in pubblico il widget finiva PRIMA dei testi decorativi, nell'editor DOPO). Root cause: `sortLayersForMobile` aveva una "PRIORITÀ 2" che metteva *primi* i layer con `mobileOrder` esplicito rispetto a quelli senza — mentre il sort inline usato in `SectionCanvas` (editor mobile) e `EventPageBuilder` trattava i valori mancanti come 0. Allineata ora la logica: `sortLayersForMobile` usa `a.mobileOrder ?? 0` coerente con il resto del codice. Il widget RSVP (default `mobileOrder = 5`) finisce correttamente **dopo** i text layer decorativi (default 0), replicando l'ordine visto in editor. ✅
- [x] **Padding Laterale Mobile sulla Pagina Pubblica** (`ReadOnlyCanvas.tsx`): la resa mobile mostrava i layer (testi, immagini) attaccati al bordo dello schermo, in contrasto col respiro orizzontale visibile nell'anteprima mobile dell'editor. Cambiato il container della modalità `isMobile && isBlock` da `padding: '40px 0'` a `padding: '40px 20px'`. Ora anche la pagina pubblica ha la stessa respirazione laterale dell'editor; lo sfondo della sezione continua a estendersi edge-to-edge (perché è sul wrapper esterno), solo il contenuto interno è rientrato. ✅
- [x] **Copy Contatti più Neutro e Chiaro** (`RSVPWidget.tsx`): la frase sotto gli input email/telefono "*Inserisci almeno uno dei due per permetterci di contattarti*" presentava due problemi: **a)** il plurale "permetterci" assumeva un gruppo di organizzatori (ma un evento può essere gestito da una persona sola); **b)** su mobile — dove email e telefono sono impilati invece che affiancati — "uno dei due" diventava ambiguo (uno dei due cosa?). Riscritta in: "*Lascia almeno un recapito (email o telefono) per ricevere aggiornamenti sull'evento.*" — neutra, esplicita su quali sono i due canali, funziona identica su desktop e mobile. ✅
- [x] **Sezione RSVP Desktop — Parità Altezza Editor/Pubblico** (`EventPublic.tsx`): diverse iterazioni per trovare il compromesso giusto: (1) il pattern "1:1 col canvas scalato + widget ancorato a `formY` con `translate(-50%,-50%)`" è fedele all'editor ma sovrappone il widget ai testi decorativi quando il widget è cresciuto in altezza (aggiunta campi email/telefono): il widget si estende sopra la sua y configurata e va a coprire i layer decorativi posizionati ai loro `y` logici; (2) il pattern "flex center + minHeight = scaledHeight" centra il widget senza rispettare `formY`, stessa sovrapposizione. **Scelta finale**: layout **in-flow flex-start** con paddings derivati da `formY`:
  - `paddingTop = max(40, formY − 155) × scale` — porta il widget visivamente alla stessa quota che avrebbe in editor quando il widget ha dimensioni standard; la metà stimata è **155px logici** (prima 200; agg. 18-04-2026) perché 200 sovrastimava l’altezza reale del form base e il toggle finiva troppo in alto sui testi decorativi.
  - `paddingBottom = max(40, (block.height − formY) − 155) × scale` — **formula corretta** (prima era simmetrica al top, da cui "moltissimo spazio" sotto quando `formY` era grande).
  - `minHeight = scaledHeight` + `height: auto`: la sezione parte all'altezza dell'editor e cresce verso il basso quando il widget espande (es. "Sì allergie"), senza clipping né overlap.
  - Testi decorativi come overlay assoluto scalato sopra il widget — NON in flusso, non alterano la dimensione.
  Nessun `ResizeObserver`, niente math dinamico: il widget può crescere quanto vuole, la sezione lo segue. Compromesso: perfetta fedeltà al posizionamento autore nei casi "widget normale", growth pulito nei casi espansi. ✅
- [x] **Editor Mappa — Restyle Jewelry Coerente** (`PageSection.tsx`): il pannello di modifica del widget Mappa era l'ultimo pezzo di UI editor rimasto in stile "grezzo": due `<input>` nudi annegati dentro il Surface "Inserisci nella Sezione", con un'etichetta `Opzioni Mappa 📍` in lowercase e nessun controllo per lo zoom (pur supportato dal widget). Rifattorizzato con il **pattern uniforme** usato per RSVP / Testo / Immagine:
  - **Surface dedicato** fuori dal blocco "Inserisci nella Sezione", visibile solo quando il blocco selezionato è di tipo `map`.
  - **Header di contesto** con icona `MapPin` in box accent-tinted e label `Stai modificando · Mappa` — identico a quello del Modulo RSVP, così l'utente ha feedback immediato di cosa sta editando.
  - **Input Titolo e Indirizzo**: wrap con bg `var(--surface)`, bordo tenue, padding `10px 12px`, icona `Pencil` / `MapPin` inline, focus state accent con `box-shadow: 0 0 0 3px rgba(accent, .15)`. Rende esplicito che i campi sono editabili (prima sembravano quasi statici).
  - **Hint sotto Indirizzo**: "*L'indirizzo viene usato sia per la mappa che per il pulsante Apri in Google Maps.*" — chiarisce che il valore pilota due comportamenti, evitando confusione.
  - **Controllo Zoom (nuovo)**: slider range 10–19 con valore live accent-colored a destra (`15×`) e due etichette `Città` / `Via` agli estremi — il widget `MapWidget` già supportava il parametro, ora è finalmente esposto in UI. ✅

### 17 Aprile 2026 — Lotto 2 (Rich Media): Widget Galleria Foto + Widget Video
*Due nuovi widget di prima categoria per arricchire la pagina evento con storytelling visivo — stesso pattern dei widget Mappa/RSVP (Jewelry coerente, editor dedicato, public parity, zero breaking change backend).*

- [x] **Widget Galleria Foto** (`widgets/GalleryWidget.tsx`): nuovo componente riutilizzabile editor+public con 2 layout:
  - **Masonry** (default): CSS `column-count` con `break-inside: avoid`, preserva le proporzioni originali delle foto — perfetto per mix di verticali/orizzontali tipici di uno shooting.
  - **Griglia**: `grid-template-columns: repeat(N, 1fr)` con `aspect-ratio: 1/1` per un reportage uniforme.
  - **Lightbox integrato**: click su thumbnail apre overlay full-screen con navigazione tastiera (`←`/`→`/`Esc`), counter `N / tot`, frecce flottanti con backdrop-blur, animazione fade-in, cursore `zoom-in`/`zoom-out`. Disabilitato in `readOnly` (editor preview).
  - **Stato vuoto** (empty state) in editor: card tratteggiata con icona accent e call-to-action "Aggiungi delle foto dal pannello laterale" — UX leggibile per il content creator.
  - **Responsive**: su mobile `columns` clamp automatico a `min(2, columns)` per non appiattire troppo.
- [x] **Editor Galleria** (`PageSection.tsx`): pannello dedicato con header di contesto `Stai modificando · Galleria` (icona `Images`). Include:
  - Input Titolo (opzionale) — stesso pattern Jewelry con icona `Pencil` e focus-glow accent.
  - **Uploader multi-foto**: pulsante primary full-width → apre `<input multiple>` → upload parallelo via endpoint esistente `/api/uploads?slug=&folder=gallery`, ogni file diventa un item `{id, url}` nel `block.props.images`. Stato `uploading` con label dinamica "Caricamento…" e disabilitazione del bottone.
  - **Grid thumbnails**: griglia 3 colonne con preview quadrata, badge posizione (`1`, `2`, …) con icona `GripVertical`, trash-button contestuale (angolo in alto a destra) per rimuovere singole foto. **Drag & drop riordinamento**: `onDragStart/onDrop/onDragEnd` nativi HTML5 con feedback visivo (bordo accent + opacity 0.5 sulla card trascinata).
  - **Layout switch** (Masonry / Griglia) come bottoni primary/subtle segmented.
  - **Slider Colonne** (2–4) con valore live accent-colored.
  - **Slider Spaziatura** (0–32 px, step 2) per il gap tra foto.
- [x] **Widget Video** (`widgets/VideoWidget.tsx`): componente che parsa **runtime** l'URL incollato dall'utente e ne rileva la sorgente (YouTube / Vimeo / file video). Supporti:
  - **YouTube**: matcher che riconosce `watch?v=`, `youtu.be/`, `embed/`, `shorts/`, `v/` → embed `https://www.youtube.com/embed/<id>` con params per autoplay (`autoplay=1`), mute (`mute=1`, obbligatorio per autoplay sui browser moderni), loop (`loop=1&playlist=<id>` — trick YouTube per loop), controlli (`controls=0`), branding pulito (`rel=0`, `modestbranding=1`).
  - **Vimeo**: matcher `vimeo.com/<id>` → `https://player.vimeo.com/video/<id>` con params analoghi + `dnt=1` (do-not-track).
  - **File video diretto**: match estensione `.mp4|.webm|.mov|.ogg|.m4v` → render nativo `<video>` con `playsInline`, `preload="metadata"`, `objectFit: cover`.
  - **Aspect ratio**: 4 preset (`16:9`, `9:16`, `1:1`, `4:3`) via padding-top percentuale (tecnica intrinsic aspect ratio), maxWidth adattivo (900px per orizzontali, 420px per verticali 9:16 tipo reels).
  - **Empty state** (URL vuoto o non riconosciuto): card tratteggiata con icona `Video` accent + hint "Incolla un link YouTube, Vimeo o un MP4 dal pannello laterale."
  - **Editor readOnly overlay**: in preview editor il video è visivamente "dietro un velo" con pill `▶ ANTEPRIMA` — evita che l'iframe catturi il pointer e rompa drag/drop.
  - Esportato `parseVideoUrl()` come helper standalone per l'editor (badge source detection).
- [x] **Editor Video** (`PageSection.tsx`): pannello dedicato con header `Stai modificando · Video` (icona `Video`). Include:
  - Input Titolo (opzionale) — stesso pattern Jewelry.
  - **Input URL con source badge live**: appena l'utente digita, al fianco della label compare una pill accent-colored con l'icona del servizio (`YouTube`, `Video` per Vimeo/file) e il nome della sorgente rilevata (o "Non riconosciuto" se ancora non valido) — feedback immediato che il link è supportato, prima di vedere il video.
  - **Hint esplicito**: "*Supportati: YouTube (watch, shorts), Vimeo, file .mp4 / .webm / .mov.*"
  - **Selettore formato** (4 bottoni segmented): `16:9` / `9:16` / `1:1` / `4:3`.
  - **Opzioni riproduzione** (4 toggle Button in stile Jewelry con check accent quando attivo): Autoplay (+ hint "richiede muted"), Loop, Senza audio (muted, default ON), Controlli visibili (default ON).
- [x] **Integrazione Editor Canvas** (`SectionCanvas.tsx`): entrambi i widget renderizzati sia nel path desktop sia nel path mobile (stream interleavable con layer testuali via `mobileOrder`). Su mobile: il click sul widget per Galleria/Video/Mappa **non forza più** `setSelectedLayerIds(['widget-rsvp'])` (che era scritto hardcoded nel commit originale) — ora solo RSVP usa quel virtual layer ID, per Galleria/Video/Mappa la selezione resta a livello di blocco e la sidebar mostra correttamente il pannello di editing del widget.
- [x] **Integrazione Public Page** (`EventPublic.tsx`): Galleria e Video aggiunti alla lista `isWidget` (accanto a `map`) — ereditano il rendering fluid senza wrapper `transform: scale`, quindi il lightbox della galleria e gli iframe video occupano la loro reale altezza DOM senza clipping.
- [x] **Creazione Sezioni dalla Sidebar** (`PageSection.tsx` → GESTIONE SEZIONI): aggiunti due nuovi pulsanti "Sezione Galleria" (icona `Images`, default chiaro `#ffffff`) e "Sezione Video" (icona `Video`, default scuro `#050506` più cinematografico) allineati al pattern esistente di Mappa/RSVP. Bagaglio props di default ragionato (layout `masonry`, 3 colonne, gap 12 per Galleria — `16:9` + muted + controlli ON per Video).
- [x] **Backend Zero-Change**: il modello `Event.blocks.props` usa già `Schema.Types.Mixed`, quindi i nuovi `props` di Galleria (`images[]`, `layout`, `columns`, `gap`) e Video (`videoUrl`, `aspectRatio`, `autoplay`, `loop`, `muted`, `controls`) si persistono in DB senza modifiche alla schema. Aggiornato solo il commento del campo `type` per documentare i nuovi valori supportati. ✅
- [x] **Context Label Mobile Toolbar** (`BuilderSection.tsx`): esteso il case `selId.startsWith('widget-')` per restituire `Galleria` / `Video` in modo coerente con `Modulo RSVP` / `Mappa`, utile se in futuro si volesse far diventare questi widget anche un "virtual layer" selezionabile via mobile toolbar.

### 17 Aprile 2026 — Rifiniture Rich Media: Placeholder leggibili, Slider Jewelry, Drag&Drop + Upload Video
*Pass di polish sul Lotto 2 dopo il primo QA utente: il linguaggio visivo non era ancora 100% coerente col resto dell'editor e mancava un modo "umano" per caricare media (drag&drop). Risultato: gli editor Galleria e Video adesso sono gemelli delle altre sidebar e permettono sia upload locale sia link remoto.*

- [x] **Fix placeholder illeggibili** (`EventEditor.css`): sui nostri sfondi crema (`--surface`) i browser applicavano di default un grigio chiarissimo sul `color` ereditato dal `--text-primary`, rendendo placeholder come "Es: I nostri ricordi" / "Es: Il nostro momento" / "Scrivi qui la domanda…" praticamente invisibili. Aggiunte regole globali scoped a `.panel-section input::placeholder` (con varianti `-webkit` e `-moz`) che fissano colore a `--text-soft` e `opacity:1`. Zero tocchi agli input: si applica automaticamente a **tutti** i campi della sidebar, inclusi i campi domanda personalizzata RSVP e i nuovi Video/Galleria.
- [x] **Slider coerenti con pattern Jewelry** (`PageSection.tsx`): gli slider Gallery → Colonne/Spaziatura e Mappa → Zoom erano `<input type=range>` con `accentColor`, estranei al linguaggio usato nel `PropertyPanel` (Spaziatura Lettere/Righe, Opacità, …). Ora usano **tutti** lo stesso pattern: `className="custom-slider"` + gradient inline (`linear-gradient(to right, var(--accent) X%, rgba(60,79,118,0.1) X%)`) calcolato dalla percentuale effettiva del valore → stessa track arrotondata, stesso thumb bianco ovale con ombra morbida, stesso hover scale 1.1.
- [x] **Drag & drop upload Galleria** (`PageSection.tsx` + `GalleryWidget.tsx`):
  - **Sidebar**: il vecchio button "Aggiungi foto" è stato promosso a **dropzone card**: area tratteggiata con icona Upload accent, copy dinamica ("Trascina o clicca per aggiungere" / "Rilascia per caricare" / "Caricamento…"), hint formati supportati (JPG/PNG/WebP). Accetta sia drop di file sia click per aprire il file picker. `uploadGalleryFiles()` estratto come helper unico riusato da entrambi i path.
  - **Widget**: introdotte le prop opzionali `onUploadImages?` e `uploading?` per farlo diventare una dropzone attiva quando in editor con empty state. Attualmente viene comunque usato solo in read-only nel canvas (il drag&drop sul canvas entra in conflitto con il drag delle sezioni), quindi il callback non viene passato dal `SectionCanvas` — ma l'API è pronta per futuri canvas non-interattivi (anteprima template, preview modal).
- [x] **Upload file video locale** (`server/routes/uploads.ts` + `PageSection.tsx`):
  - **Backend**: nuova route `POST /api/uploads/video` con filtro MIME dedicato (`video/*`), limite dimensione alzato a **200 MB** (ragionevole per clip brevi vlog-style), singolo file per request. Stesso gate Premium del route principale per coerenza commerciale. Upload su R2 in `events/<slug>/videos/` (o fallback locale `/uploads`). Risposta `{ url }` (singolo, non `urls[]`).
  - **Frontend**: nell'editor Video la dropzone upload diventa il **metodo primario** (prima del link): drag&drop o click, copy dinamica, icona Upload accent, formato ammesso (MP4/WEBM/MOV). Usa `XMLHttpRequest` invece di `fetch` per avere un **progress bar reale** (fetch non espone ancora upload progress standard) — UX critica per file > 50MB. Se c'è già un video caricato, la dropzone si adatta in "Sostituisci video".
  - **Link come alternativa**: dopo la dropzone un divider "oppure" poi il campo URL classico (YouTube/Vimeo/URL diretto). Placeholder aggiornato (`Es: https://youtube.com/watch?v=…`) e badge sorgente mostrato **solo quando l'utente ha digitato qualcosa** (prima era sempre "Non riconosciuto" anche con campo vuoto, UX pessimista).

### 17 Aprile 2026 — Fix critici Rich Media: Persistenza Galleria, Ordine Editor↔Public, Widget Adattivi
*Pass di consolidamento dopo il primo uso reale del Lotto 2. L'utente ha segnalato cinque problemi interconnessi: foto e testi della galleria sparivano dopo il refresh, l'ordine delle sezioni nell'editor non coincideva con quello della pagina pubblica, i testi dei widget non si adattavano al colore di sfondo della sezione (problema già risolto per RSVP), l'empty state di galleria e video era incoerente, e l'editor Video era troppo complesso (URL R2 raw sporco dopo upload + selettore aspect ratio poco chiaro). Affrontati tutti e 5 in una sola passata con due bug-fix critici (persistenza + ordine) e tre refactor UX.*

- [x] **[BUG CRITICO] Persistenza blocco Galleria** (`server/routes/eventRoutes.ts`): trovato filtro lato server (`safeBlocks.filter(b => b.type !== "gallery")` su account non-premium) che in dev **cancellava silenziosamente** i blocchi galleria ad ogni save. L'utente vedeva "Salvato", faceva refresh e tutte le foto + i testi associati al blocco sparivano. Fix: gate applicato solo in `process.env.NODE_ENV === "production"`, coerente con `requirePremiumForGalleryUpload` in `uploads.ts` (che già permetteva upload sempre in dev). Ora in sviluppo si può testare la galleria liberamente; in produzione resta il gate commerciale.
- [x] **[BUG CRITICO] Ordine sezioni editor ≠ pagina pubblica** (`PageSection.tsx`, `EventPageBuilder.tsx`, `EventPublic.tsx`): la public view ordinava per `block.order ?? 0`, l'editor usava l'ordine array del `blocks` state. Quando l'utente aggiungeva un nuovo blocco via sidebar non gli veniva assegnato `order`, quindi il nuovo blocco collassava a 0 e in public view finiva in cima mescolandosi agli altri. Fix a due livelli:
  1. **Normalizzazione all'origine**: ogni `setBlocks([...blocks, newBlock])` ora include `order: blocks.length` (tutti i 5 pulsanti di creazione: Vuota, Mappa, RSVP, Galleria, Video). `duplicateBlock` e `deleteBlock` in `EventPageBuilder.tsx` ora normalizzano `order = idx` su TUTTO l'array dopo la mutazione, come già faceva `moveBlock`.
  2. **Fallback all'indice**: sia editor che public view ordinano con criterio `(block.order ?? arrayIdx) - (otherBlock.order ?? otherArrayIdx)`, così eventi legacy con `order` incompleto/sporco non si scompigliano più al primo render (prima collassavano tutti a 0 e l'ordine dipendeva dal `Array.prototype.sort` stability, comportamento "stabile ma imprevedibile"). Stesso criterio in entrambe le viste → sequenza identica garantita.
- [x] **Helper riusabile `colorUtils.ts`** (`client/src/utils/colorUtils.ts`): estratta la logica `normalizeColor` + `getLuminance` + `getSafeColor` + palette adattiva che viveva inline dentro `RSVPWidget.tsx`. Nuova utility esporta `getAdaptivePalette(bg, accent)` che ritorna `{isDark, text, textSoft, textMuted, border, surface, accent}` — single source of truth usata da Mappa, Galleria, Video e (a breve) RSVP. Soglia luminance 0.6 (invariata rispetto a RSVP, volutamente più alta di 0.5 per gestire bene i grigi medi del nostro brand).
- [x] **Widget adattivi al background** (`MapWidget.tsx`, `GalleryWidget.tsx`, `VideoWidget.tsx`): i tre widget ora accettano `sectionBg?: string` come prop e passano tutto al `getAdaptivePalette`. Tutti i riferimenti hardcoded a `var(--text-main)`, `#1a1a1a`, `rgba(60, 79, 118, …)` sono stati sostituiti con `palette.text/textSoft/border/surface`. `SectionCanvas.tsx` e `EventPublic.tsx` passano `block.props?.bgColor || block.bgColor` come `sectionBg`. Risultato: titolo/indirizzo mappa, titolo galleria/video, bordi e copy empty state cambiano automaticamente fra "chiaro su bg scuro" e "scuro su bg chiaro". Accent color e foto/video vero non vengono toccati (sono vincoli brand/content).
- [x] **Empty state unificati Galleria/Video** (`GalleryWidget.tsx`, `VideoWidget.tsx`): le due card vuote avevano dimensioni e layout diversi (galleria piccolina `minHeight:240px`, video con aspect dinamico che cambiava con il selettore). Ora entrambe usano lo **stesso contenitore**: `maxWidth:900px` + `aspect-ratio:16/9` su desktop (fallback `minHeight:240px` su mobile), stessa icona-pill accent 56×56, stessa gerarchia titolo/subtitolo, stessa border dashed che si illumina in accent durante drag. Uniche differenze: icona (`Upload` vs `Video`) e copy. Ora la sezione si presenta consistente anche quando alcuni widget sono vuoti e altri no.
- [x] **Video: URL R2 nascosto dopo upload** (`PageSection.tsx`): prima, dopo un upload file locale, l'URL raw di R2 (lungo, inconoscibile, con query string) appariva nel campo "Incolla un link", confondendo l'utente ("cos'è questo, devo copiarlo da qualche parte?"). Ora la logica è a stati:
  - **File caricato** (`parsed.source === 'file'` + URL presente): mini-card con icona video su accent, nome file troncato (`nome…estensione`) e bottone **Rimuovi**. Se premuto, l'URL viene svuotato e la UI torna alla dropzone.
  - **Nessun video o link**: dropzone upload + divider "oppure" + input link YouTube/Vimeo. Più chiaro, zero URL tecnici mostrati all'utente.
- [x] **Video: aspect ratio semplificato** (`VideoWidget.tsx`, `PageSection.tsx`): rimosso il selettore `16:9 / 9:16 / 1:1 / 4:3` dalla sidebar (creava confusione: "che formato scelgo?"). Il widget ora usa sempre il contenitore **16:9** standard (lo stesso di YouTube/Vimeo) ma per i file locali applica `object-fit: contain` + sfondo nero invece di `cover`: il video mantiene il suo aspect originale e vengono aggiunte le bande nere laterali quando è verticale, **senza mai tagliare** il contenuto. Una scelta "cinematografica" che gestisce automaticamente sia video orizzontali sia reels verticali senza chiedere nulla all'utente. Prop `aspectRatio` rimossa dall'API del widget e dalle due chiamate in `EventPublic.tsx` e `SectionCanvas.tsx`.
- [x] **Default block.props puliti**: rimossi `textColor: '#1a1a1a'` e `aspectRatio: '16:9'` dai default dei blocchi galleria/video nella sidebar — ora che l'adaptive palette calcola il testo dal bg e l'aspect ratio è fisso, questi campi non servono più e appesantivano solo il payload DB.

### 17 Aprile 2026 — Rifiniture Rich Media 2: Altezze sensate, card video minimale, accent mappa custom
*Secondo pass di QA utente dopo il fix critici: la persistenza ora funziona ma emergono problemi di "prima impressione" — i blocchi widget nascevano più piccoli del loro contenuto (costringendo l'utente ad allargare ogni volta), il titolo del video spariva in editor, la card "Video pronto" era troppo densa e l'accent della mappa era vincolato al theme globale (nessun modo per cambiarlo per-sezione).*

- [x] **Altezze default sensate per i widget fissi** (`PageSection.tsx`): i blocchi nascevano con `height` insufficiente a contenere il loro widget, costringendo l'utente a "pescare" il bordo e allargare ogni volta. Calcolate altezze coerenti con il contenuto reale:
  - Mappa: 400 → **560** (44 header + 360 mappa + 44 button + 40 padding + breathing room).
  - Galleria: 500 → **580** (24 padding + empty state 16:9 ~506 + 24 padding + buffer).
  - Video: 500 → **640** (24 padding + ~50 titolo h3 + 20 margin + video 16:9 ~506 + 24 padding + buffer).
  Ora appena creati i blocchi mostrano tutto il contenuto con respiro sopra/sotto senza interazione manuale.
- [x] **[BUG] Titolo video tagliato in editor** (`SectionCanvas.tsx`): i wrapper dei widget (gallery/video/map) avevano `display:flex, alignItems:center` su un container con `overflow:hidden` e altezza fissa. Conseguenza: quando il contenuto è più alto del container (tipico con titolo + video 16:9 in una sezione default), il widget veniva **centrato verticalmente** e il titolo in alto **tagliato**. Cambiato `alignItems:center` → `flex-start` per i 3 widget: il titolo parte dall'alto ed è sempre visibile; eventuali overflow cadono in fondo (meno grave, l'utente può sempre estendere la sezione). Non tocca il rendering RSVP che mantiene il suo layout assoluto.
- [x] **Card "Video caricato" minimale** (`PageSection.tsx`): la precedente card occupava 5 elementi visivi (icona 40px + titolo + filename troncato `1776464…mov` + bottone + frase help = visivamente pesante). Sostituita con una **pill unica a tutta larghezza** in stile "chip di conferma": check-icon accent + "Video caricato" + link-button "Rimuovi" in linea. Il filename tecnico (R2 hash) è stato rimosso: non dà valore all'utente in un editor visuale (il video lo vedi nell'anteprima), era solo rumore tecnico. Pattern coerente con badge/chip del resto della piattaforma.
- [x] **Accent color per-sezione sulla Mappa** (`PageSection.tsx`, `MapWidget.tsx`, `SectionCanvas.tsx`, `EventPublic.tsx`):
  - **Sidebar**: nuovo color picker "Icona & Pulsante" alla fine dell'editor Mappa, stesso **identico pattern** di RSVP `formPrimaryColor` (Button pill + swatch + `CustomColorPicker` espanso). Salvato in `block.widgetProps.mapAccentColor` (namespaced per non collidere con accenti futuri di altri widget).
  - **Widget**: `MapWidget` già aveva prop `accentColor`, ma il pulsante "Apri su Google Maps" usava `rgba(var(--accent-rgb), 0.1)` hardcoded per bg/border → ignorava il color picker. Ora se `accentColor` è un hex a 6 char applichiamo suffisso alpha (`${accent}1A` = 10%, `${accent}40` = 25%); altrimenti fallback sulle CSS var originali. Stesso approccio per l'icona pin.
  - **Retro-compat**: se `widgetProps.mapAccentColor` è undefined, fallback su `theme.accent` globale → tutte le mappe esistenti continuano a funzionare invariate.

### 17 Aprile 2026 — Rifiniture Rich Media 3: Titoli come layer, cleanup widget-only, fix RSVP default
*Terzo pass di QA. Emergono tre classi di problemi: (1) il titolo del video continuava a non essere visibile perché il rendering `h3` interno al widget sopravviveva in contesti di altezza ristretta; (2) la UX di Gallery/Video ospitava un pulsante "Immagine" che non aveva senso su widget-only (la galleria gestisce già le foto, il video ha il suo player) e un campo "Titolo (opzionale)" in sidebar che forzava font/colore non-personalizzabili; (3) la creazione di un nuovo blocco RSVP lasciava il form **illeggibile al primo colpo** (bg trasparente + testi bianchi su sfondo pagina chiaro) e **sovrapposto al titolo** (formY implicito a 50% con transform -50% invadeva il layer desc).*

- [x] **Titoli Gallery/Video promossi a layer testo** (`GalleryWidget.tsx`, `VideoWidget.tsx`, `PageSection.tsx`): rimosso completamente il rendering `{title && <h3>}` interno ai due widget (era il residuo che continuava a sparire su altezze ristrette nonostante il fix `alignItems: flex-start`). Alla creazione di una Sezione Galleria/Video viene ora creato in automatico un layer testo standard (`LA NOSTRA GALLERIA` / `IL NOSTRO VIDEO`, fontSize 28, heading font del tema, y=40, textAlign center) posizionato sopra il widget. L'utente lo seleziona e lo modifica con lo stesso PropertyPanel di qualsiasi altro testo — font, colore, dimensione, allineamento, rotazione — senza essere vincolato alla palette adattiva bianco/nero. Rimosso anche il campo "Titolo (opzionale)" dalla sidebar dei due editor: una fonte di verità sola per i titoli. Altezze default aumentate di conseguenza (galleria 580→660, video 640→700) per accomodare il layer titolo sopra.
- [x] **Bottone "Immagine" nascosto su widget-only** (`PageSection.tsx`): il filtro già presente per RSVP/Mappa (`selectedBlock?.type !== 'rsvp' && selectedBlock?.type !== 'map'`) ora include anche `gallery` e `video`. Motivo: la galleria gestisce le foto internamente con il suo empty state + drag&drop dedicato, il video ha un player che occupa tutta la zona contenuto; lasciare "Inserisci immagine" creava confusione ("cosa succede se carico un'immagine sopra un video?"). Il pulsante "Testo" resta disponibile su tutti e 4 i widget perché consente aggiunte libere (es. caption, didascalia, credits foto).
- [x] **[BUG] RSVP nuovo blocco illeggibile "al primo colpo"** (`PageSection.tsx`):
  - **Prima**: default `bgColor: 'transparent'` + layer desc con `color: '#ffffff'` + layer titolo con `color: event.theme?.accent`. Su una pagina a sfondo chiaro il risultato era testi bianchi su bianco → illeggibili. L'utente doveva cambiare manualmente il bg per vedere qualcosa comparire.
  - **Fix**: `bgColor: '#1a1a1a'` (nero scuro) come default. Peso visivo immediato, layer bianco + accent leggibili dal primo render. Se l'utente vuole un form su bg chiaro cambia il colore e (come fa per ogni testo su sezione vuota) adegua i colori dei layer testo.
- [x] **[BUG] Form RSVP invade il titolo** (`PageSection.tsx`): il `widgetProps.formY` era implicito (fallback `50%` in `SectionCanvas.tsx` + `transform: translate(-50%, -50%)`). Su un blocco alto 550 → centro a 275 → con form alto ~300 il contenuto partiva da y≈125 e si sovrapponeva al layer desc (y=160). Ora il default alla creazione è esplicito: `widgetProps: { formY: 360 }`. Con transform -50% il form parte a y≈210, lasciando ~30px di gap sotto il layer desc. Retro-compat: gli eventi esistenti senza `formY` settato continuano con il fallback `50%`.

### 17 Aprile 2026 — Rifiniture Rich Media 4: Widget posizionabili + fix bug bgColor sistemico
*Quarto pass di QA. Due richieste utente: (1) permettere di spostare liberamente i widget Galleria e Video dentro la sezione — stesso pattern del form RSVP, con rettangolo di selezione e guide di snap — per poter circondare il widget con layer testo (didascalie, titoli decorativi, credits); (2) risolvere un bug residuo sul colore sfondo di RSVP che continuava a comparire bianco anche dopo il fix default `#1a1a1a` del pass precedente.*

- [x] **[BUG sistemico] bgColor top-level ignorato dal rendering** (`EventPageBuilder.tsx`, `EventPublic.tsx`, `PageSection.tsx`): il BuilderSection leggeva il bg **solo** da `block.props?.bgColor` (con fallback a `#ffffff`), mentre tutti i default creati dalla sidebar (RSVP, Galleria, Video, Mappa, Vuota) scrivevano il colore **solo** in `block.bgColor` top-level. Risultato: ogni blocco widget appena creato appariva bianco a prescindere dal suo default. Fix a doppio livello:
  1. **Rendering**: `bgColor={block.props?.bgColor || block.bgColor || '#ffffff'}` in editor e `background: block.props?.bgColor || block.bgColor || 'transparent'` in public → retro-compat con eventi legacy che hanno solo top-level.
  2. **Default di creazione**: ora tutti i blocchi nuovi scrivono il bg **in entrambi** (`bgColor` top-level + `props.bgColor`), allineandosi alla convenzione del PropertyPanel che scrive in `props.bgColor` quando l'utente cambia colore.
  Questo era il bug che faceva comparire il form RSVP illeggibile al primo colpo (riportato dall'utente con screenshot): il `#1a1a1a` del fix precedente stava nel posto sbagliato per il renderer.

- [x] **Galleria e Video posizionabili liberamente** (`SectionCanvas.tsx`, `EventPublic.tsx`): stesso pattern del form RSVP — position absolute + `transform: translate(-50%, -50%)`, rettangolo di selezione accent con offset `-8px` quando `selectedLayerIds` contiene l'id del widget, drag handler che scrive in `widgetProps` e pubblica le stesse guide di snap rosa sugli assi centrali e sui layer testo. Serve per poter mettere titoli/didascalie intorno ai widget senza che occupino tutta la sezione.
  - **Refactor drag handler**: il vecchio `handleWidgetPointerDown` era hard-coded su `widget-rsvp` + `formX/formY`. Estratta una funzione `handleWidgetPointerDownGeneric(e, { widgetId, xKey, yKey, defaultX, defaultY })` che parametrizza id e chiavi `widgetProps`. Il form RSVP continua a usare `formX/formY` (retro-compat DB), Gallery e Video usano il nome generico `widgetX/widgetY`. Merge con `widgetProps` esistente a ogni drag: niente perdita di `mapAccentColor`, `mobileOrder` o altri settings ausiliari.
  - **Mappa esclusa dal posizionamento libero**: resta fill-parent. Rationale: la mappa è un layer informativo (pin + indirizzo), non un oggetto "stile" da comporre; se serve riposizionarla si sposta il blocco intero. Lo stesso è già vero per molte piattaforme (Squarespace/Canva) dove la map-card occupa sempre la sua sezione.
  - **Public view coerente**: se `widgetX/widgetY` sono settati, il public replica l'esatta posizione dell'editor (absolute + transform). Se mancano (eventi legacy o utente che non ha mai spostato il widget), fallback al layout flex-center del parent → retro-compat piena. Su mobile il posizionamento libero viene sempre ignorato: layout stacked a colonna, come già per tutti gli altri blocchi widget.
  - **Outline selezione**: identico stilisticamente al rettangolo selezione RSVP (`2px solid var(--accent)`, `border-radius: 12px`, offset `-8px`) così la UX di selezione è riconoscibile e consistente fra i tre widget posizionabili.

### 17 Aprile 2026 — Editor Mobile: Selezione widget, toolbar Sposta Giù, visibilità layer consistente
*Quinto pass di QA. L'utente segnala 3 bug interconnessi sulla vista mobile: (a) la freccia "Sposta Giù" della floating toolbar risulta disabilitata quando seleziono un testo in una sezione Galleria/Video anche se sotto c'è il widget; (b) Galleria e Video non sono proprio selezionabili in preview mobile (click = niente, nessuna toolbar compare); (c) il toggle "Visibilità MOBILE / DESKTOP" del PropertyPanel salva il flag ma i layer nascosti continuano a comparire sia nel preview mobile dell'editor sia nella pagina pubblica. Tre fix mirati tutti radicati nello stesso errore: Gallery e Video erano stati aggiunti come "widget posizionabili" in desktop ma **mai promossi a peer dello stream mobile** (dove avevano ancora un id generico `widget-element` + ramo hard-coded solo su rsvp/map).*

- [x] **[BUG] Widget id dinamico nello stream mobile** (`SectionCanvas.tsx`, `BuilderSection.tsx`, `EventPageBuilder.tsx`): in preview mobile tutti i widget usavano l'id hard-coded `widget-element` nel rendering e il toggle di selezione guardava solo `widget-rsvp`. Di conseguenza su Galleria/Video: (1) il `onPointerDown` faceva `setSelectedLayerIds([])` invece di selezionare il widget, quindi niente toolbar mobile né sidebar contestuale; (2) il bordo accent di selezione non compariva mai; (3) la toolbar mobile calcolava `isLast` considerando widget solo per `rsvp`/`map`, quindi su un blocco Galleria/Video con un solo testo questo risultava sia primo che ultimo dello stream e SPOSTA GIÙ veniva disabilitato anche se visivamente sotto c'era il widget. Fix: id widget dinamico `widget-<type>` (rsvp/gallery/video, più `widget-map` per coerenza) allineato a quello già usato nel rendering desktop; `onPointerDown` mette questo id in `selectedLayerIds` così la floating toolbar (che già supporta contextLabel `Galleria`/`Video` e usa il prefisso `widget-` per il branch "widget layer") riconosce il widget; `isFirstLayer/isLastLayer` in BuilderSection e `moveLayerMobile` in EventPageBuilder ora considerano il widget per tutti e 4 i tipi. Niente cambi al DB: `widgetProps.mobileOrder` resta la source-of-truth per l'ordine widget, come già per RSVP.
- [x] **[BUG] Flag `hiddenMobile` ignorato in preview mobile editor** (`SectionCanvas.tsx`): il ramo `previewMobile` del SectionCanvas filtrava i layer solo per `blockId`, **mai** per `hiddenMobile`. L'utente cliccava il toggle "Visibilità MOBILE" e salvava, ma il layer restava visibile. Il flag `hiddenDesktop` funzionava invece (filtrato nel ramo desktop), il che rendeva il bug ancora più confuso ("nasconde su desktop sì, su mobile no"). Fix: aggiunto `&& !layer.hiddenMobile` al filtro `sortedLayers.filter` del ramo mobile; rimosso anche il ramo morto `if (previewMobile) return !layer.hiddenMobile` nel filtro desktop (dead code dovuto a early-return più in alto).
- [x] **[BUG] Flag `hidden*` ignorati in pagina pubblica** (`EventPublic.tsx`): i 3 punti di rendering layer della public view (overlay widget desktop/mobile, decorativi RSVP desktop, canvas block standard) filtravano solo per `blockId`, mai per `hiddenMobile`/`hiddenDesktop`. Risultato: il toggle di visibilità era completamente inefficace in production — l'autore nascondeva elementi nell'editor ma gli ospiti sul telefono li vedevano comunque. Fix: aggiunto `if (isMobile ? l.hiddenMobile : l.hiddenDesktop) return false` a tutti e 3 i filter (e `l.hiddenDesktop` hardcoded nel ramo RSVP desktop che è già in una branch `!isMobile`). La feature ora funziona end-to-end: toggle in editor → persistito in DB → rispettato nel preview mobile editor **e** nella public view.
- [x] **Note di scope**: il supporto visibilità è stato lasciato a livello di **layer** (testi, immagini), che è dove vive già la UI del toggle. Nascondere un widget intero (RSVP, Galleria, Video, Mappa) per vista specifica richiederebbe una nuova UI sulla sidebar del blocco + filtro a block-level nel rendering: rinviato a un futuro pass se/quando emergerà come necessità (oggi l'autore può raggiungere lo stesso risultato usando `hidden*` sui singoli testi interni al widget).

### 17 Aprile 2026 — QA finale Rich Media: sidebar contestuale, editor mobile widget, ordine globale, video desktop
*Sesto e ultimo pass di QA sui widget rich-media. Utente segnala quattro bug interconnessi: (1) selezionando il blocco Galleria o Video dalla sidebar desktop compare "Inserisci nella sezione" invece della card "Stai modificando · Galleria/Video" coi controlli specifici; (2) la toolbar mobile sui blocchi Galleria/Video/Mappa non ha i controlli widget-specifici (caricamento, layout, indirizzo, ecc.) ma solo un generico "Sezione / Testo / Foto"; (3) l'ordine delle sezioni in editor mobile ≠ desktop ≠ public view (drift totale dell'UX); (4) il video è sparito nell'editor desktop dopo il pass #4 che ha reso il widget posizionabile. I 4 bug hanno cause distinte ma condividono la radice "gallery/video sono stati aggiunti come peer di rsvp/map solo parzialmente".*

- [x] **[BUG 1] Sidebar desktop: `widget-gallery`/`widget-video` attivavano il PropertyPanel layer** (`PageSection.tsx`): la condizione "priorità 1 = editor elemento" usava `!selectedLayerIds.includes('widget-rsvp')`, quindi quando l'utente cliccava il widget Galleria/Video (che ora mette `widget-gallery`/`widget-video` in `selectedLayerIds`, coerentemente col fix del Bug 2 mobile del pass precedente) la sidebar provava a renderizzare un editor di layer inesistente e mostrava solo il pannello generico "Inserisci nella Sezione". Fix: generalizzato il filtro a `!selectedLayerIds.some(id => id.startsWith('widget-'))` → qualsiasi widget virtuale cade nel ramo "sezione selezionata" dove i pannelli `type === 'gallery'` / `type === 'video'` / `type === 'map'` erano già presenti ma venivano bypassati. Ora i tre widget hanno comportamento sidebar identico a RSVP: clic sul widget = pannello di impostazioni contestuale.

- [x] **[BUG 2] Editor mobile: nessun pannello impostazioni per Gallery/Video/Map** (`MobileToolbar.tsx`): la toolbar mobile aveva controlli widget-specifici solo per RSVP (tab `rsvp_style`/`rsvp_questions`). Per gli altri widget l'utente vedeva il fallback generico "Sezione / Testo / Foto" che non offriva alcun modo per regolare colonne galleria, URL video, indirizzo mappa, ecc. Fix: (a) label contestuale dinamico nell'intestazione — "Modifica Galleria / Video / Mappa" invece di fallback "Modifica Sezione"; (b) ramo dedicato per `block.type === 'map'|'gallery'|'video'` che mostra due pulsanti — **Impostazioni** (apre nuovo tab `widget_settings`) e **+ Testo** — stesso pattern visivo di RSVP; (c) tab unificato `widget_settings` con switch interno per tipo: **mappa** → titolo + indirizzo + zoom + colore accento; **galleria** → layout masonry/grid + colonne + spaziatura + nota upload desktop; **video** → URL YouTube/Vimeo + toggle autoplay/loop/muted/controls + rimuovi video; (d) filtro coerente con desktop: il pulsante "Foto" del fallback generico ora nasconde per tutti e 4 i widget (rsvp/map/gallery/video) — prima escludeva solo rsvp e map. *Scope trade-off*: gli upload di file (foto galleria, file .mp4) restano sulla sidebar desktop per evitare di duplicare la pipeline API di upload dentro il MobileToolbar (richiederebbe `slug` + handler + progress tracking); su mobile l'utente può comunque incollare un link YouTube/Vimeo direttamente. Documentato nel tooltip.

- [x] **[BUG 3] Ordine blocchi mobile ≠ desktop ≠ public** (`EventPageBuilder.tsx`): la preview mobile dell'editor sortava per `block.mobileOrder ?? 0` mentre la preview desktop usava `block.order ?? _idx` e la public view usava `block.order ?? _idx` (ignorando `mobileOrder`). I blocchi nuovi non avevano `mobileOrder` → collassavano tutti a `0` → sort "stabile ma arbitrario"; quando l'utente usava il pulsante "Sposta Su/Giù" in mobile, la funzione `moveBlockMobile` aggiornava solo `mobileOrder`, che era un binario separato mai letto dalla public view. Risultato: l'ordine delle sezioni in editor mobile, editor desktop e pagina pubblica era *completamente diverso*. Fix architetturale: **le sezioni hanno un solo ordine globale** (`block.order`), coerente con il modello mentale dell'utente — mobile e desktop mostrano la stessa sequenza di sezioni, solo gli **elementi interni** (layer) hanno `mobileOrder` separato per permettere stream diversi nelle due viste. Concretamente: `moveBlockMobile` è ora alias di `moveBlock` (scrive in `block.order`, normalizza l'array, salva nel DB); il sort del `.map` di render è unico per entrambe le viste (`block.order ?? _idx`) identico a quello già usato da public view e desktop. Zero migrazione DB necessaria: i `mobileOrder` di eventi legacy vengono semplicemente ignorati al render, e lo `_idx` fallback garantisce retro-compatibilità per eventi senza `order` su tutti i blocchi.

- [x] **[BUG 4] Video invisibile in editor desktop** (`SectionCanvas.tsx`, `EventPublic.tsx`): il pass #4 (widget posizionabili) aveva avvolto `VideoWidget` in un wrapper absolute con `width: 'max-content'` + `maxWidth: 'calc(100% - 40px)'`. Questo funzionava per RSVPWidget/GalleryWidget (hanno contenuti con larghezza intrinseca) ma **distruggeva** VideoWidget: il player usa il classico trick `paddingTop: 56.25%` per l'aspect ratio 16:9, e `padding-top` in percentuale si calcola rispetto alla **width del parent**. Con `max-content` la width del parent collassa alla width del contenuto (che è 0 perché il video è positioned absolute) → padding 0 → video invisibile, solo lo sfondo nero 2px visibile. Fix: sostituito `width: 'max-content' + maxWidth: 'calc(100% - 40px)'` con `width: 'min(940px, calc(100% - 40px))'` — lo stesso maxWidth interno usato dai widget (900px + 40px di respiro), espresso come width concreta che risolve correttamente le percentuali interne. Applicato in 4 punti (SectionCanvas gallery+video, EventPublic gallery+video) per coerenza totale editor ↔ pubblico.

### 17 Aprile 2026 — QA finale bis: mobile polishing (slider style, RSVP custom fields, map input, upload gallery/video)
*Pass supplementare richiesto dall'utente per chiudere davvero il lotto mobile. Dopo il pass precedente restavano 5 gap UX: slider con track nera non coerente, domande RSVP personalizzate non editabili da mobile, campi mappa poco leggibili/non usabili, upload foto galleria assente su mobile, upload file video assente su mobile. Fix concentrati in `MobileToolbar.tsx` + passaggio `slug` da `EventEditor.tsx`.*

- [x] **Slider mobile allineati al design system**: i range nel tab `widget_settings` (zoom mappa, colonne galleria, gap galleria) ora usano `className="custom-slider"` + progress background gradiente accent (`var(--accent)` + track soft), identico alla resa delle altre sezioni mobile. Rimossa la resa nativa browser (track nera).
- [x] **RSVP custom fields editabili anche da mobile**: nel tab `rsvp_questions` i campi personalizzati ora non sono solo "aggiungibili" ma anche completamente modificabili inline (label, tipo `text` / `checkbox`, toggle obbligatorio/facoltativo, elimina), con layout compatto a card per rispettare il poco spazio verticale.
- [x] **Input mappa usabili/leggibili in mobile editor**: i campi Titolo/Indirizzo passano da palette hardcoded bianca a token UI (`var(--surface-light)`, `var(--text-primary)`, `var(--border)`), risolvendo il problema di contrasto che faceva sembrare i campi vuoti/non editabili.
- [x] **Upload foto galleria da mobile toolbar**: aggiunto pulsante `Carica Foto` con input multiplo e upload reale verso `/api/uploads?slug=...&folder=gallery`, append immutabile in `block.props.images`, stato loading e reset input.
- [x] **Upload video da mobile toolbar**: aggiunto pulsante `Carica Video` con input `video/*`, upload XHR verso `/api/uploads/video?slug=...&folder=video` (con progress %), salvataggio URL risultante in `block.props.videoUrl`. Il flusso link YouTube/Vimeo resta disponibile in parallelo.
- [x] **Plumbing dati mobile upload**: `EventEditor.tsx` ora passa `slug={event?.slug || ''}` al `MobileToolbar` per sbloccare le API upload in modalità mobile.

### 17 Aprile 2026 — QA finale ter: compact toolbar + riordino foto + fix scomparsa toolbar
*Ultimo giro richiesto dall'utente per chiudere la UX mobile senza refresh forzati. Focus: ridurre l'altezza pannello, aggiungere riordino foto mobile, togliere URL brutto nel tab Video, e risolvere bug grave della toolbar che spariva dopo editing testo in sezioni Gallery/Video.*

- [x] **Toolbar mobile compatta (no full-screen takeover)** (`EventEditor.css`): `mobile-tab-panel` ora ha `max-height: 44vh`, padding ridotti e `mobile-tab-content` scrollabile con `overflow-y: auto`. Il pannello resta consistente visivamente ma non copre più quasi tutto lo schermo.
- [x] **Riordino foto galleria su riga orizzontale** (`MobileToolbar.tsx`): introdotta strip scrollabile (`overflowX`) con thumbnail compatte e frecce sinistra/destra per spostare ogni immagine, così il controllo ordine non mangia altezza verticale.
- [x] **Video tab più pulito e compatto** (`MobileToolbar.tsx`): nascosto il link raw (soprattutto URL R2 lunghi) dietro stato sintetico "Video caricato / Link YouTube/Vimeo collegato" + bottone `Modifica link`; toggle playback compattati in griglia 2x2.
- [x] **Fix bug critico toolbar che non riappare** (`MobileToolbar.tsx`): la toolbar non viene più nascosta solo perché `editingLayerId` è valorizzato; ora si nasconde esclusivamente quando quell'id è ancora nella selezione attiva (`selectedLayerIds.includes(editingLayerId)`). Risolto il caso stale state dopo blur/deselect che obbligava al refresh pagina.

### 17 Aprile 2026 — QA finale quater: Netflix row galleria + parity video desktop/mobile
*Micro-pass finale: l'utente richiede che **solo** la riga foto sia scrollabile (stile catalogo Netflix) senza trascinare orizzontalmente tutto il pannello, e che il tab Video mobile sia identico a desktop (nessun campo/link "modifica", solo stato caricato + rimuovi).*

- [x] **Solo riga foto scrollabile** (`MobileToolbar.tsx`, `EventEditor.css`): la strip ordine foto usa `overflow-x: auto` locale + card `flex: 0 0 auto` + `scroll-snap`; il contenitore tab mobile ora forza `overflow-x: hidden`, quindi non si trascina più tutto il pannello lateralmente.
- [x] **Video mobile allineato al desktop** (`MobileToolbar.tsx`): eliminata la UX "modifica link", nascosto il raw URL quando il video è presente, mostrato stato sintetico `Video caricato`; rimangono `Carica Video` e `Rimuovi video` come nel pannello desktop.

### 17 Aprile 2026 — QA finale quinquies: rollback layout pannello, resta solo Netflix row
*Fix correttivo immediato: il tentativo di compattare il pannello aveva introdotto tagli/decentramento visuale. Requisito utente: mantenere il layout originale della toolbar e lasciare come unica eccezione la strip foto orizzontale.*

- [x] **Rollback completo layout panel mobile** (`EventEditor.css`): ripristinati `padding`, `gap` e flusso originari di `mobile-tab-panel`; rimossi i vincoli di altezza/scroll interno introdotti nel pass precedente che causavano clipping e composizione fuori asse.
- [x] **Scope confermato**: resta attiva solo la riga foto orizzontale (catalogo Netflix) nel tab Galleria; il resto della UI torna al comportamento/layout pre-compattazione.

### 17 Aprile 2026 — Hotfix rollback netto: rimossa strip ordine foto mobile
*Correzione richiesta dall'utente dopo QA visuale: la prima implementazione della riga "Ordine foto" risultava ancora invasiva/non allineata al layout. Decisione: rollback completo del blocco ordine foto in `MobileToolbar` e ritorno allo stato precedente stabile. Il riordino foto mobile verrà reintrodotto in un pass dedicato con UX riprogettata.*

- [x] **Rimozione completa riga `Ordine foto`** (`MobileToolbar.tsx`): eliminati sia il renderer della strip orizzontale sia la logica `moveImage` associata; il pannello Gallery mobile torna al flusso precedente (upload + layout + colonne + spaziatura), senza overflow laterali aggiuntivi.

### 17 Aprile 2026 — Reintroduzione strip Netflix (solo preview orizzontale)
*Dopo rollback, l'utente richiede di reintrodurre la riga immagini in modo minimale e robusto: solo una rail orizzontale stile Netflix con card successive parzialmente visibili, senza alterare il resto del layout pannello.*

- [x] **Rail preview galleria mobile** (`MobileToolbar.tsx`): aggiunta una strip `overflow-x: auto` locale con thumbnail a larghezza fissa (`120px`), `flex-wrap: nowrap` e spacer finale per mantenere la percezione della card tagliata a destra (cue visivo di scroll). Nessun cambiamento al layout verticale globale della toolbar.
- [x] **Scope invariato**: solo preview/scroll della riga immagini; i controlli esistenti (upload, layout, colonne, spaziatura) restano identici.

### 17 Aprile 2026 — Hotfix immediato: rollback seconda strip gallery
*QA utente: la reintroduzione della rail immagini continua a rompere l'equilibrio visivo del pannello mobile. Decisione operativa: rollback completo immediato per tornare alla baseline stabile.*

- [x] **Rimossa di nuovo la rail immagini** (`MobileToolbar.tsx`): eliminato il blocco preview orizzontale della galleria; pannello Mobile Gallery riportato allo stato precedente (copy + upload + layout + colonne + spaziatura), senza alterazioni al design generale.

### 17 Aprile 2026 — Tentativo 3 strip gallery: implementazione minima non invasiva
*Nuovo pass su richiesta utente ("proviamo"), con vincolo stretto: evitare regressioni di layout. Soluzione: rail preview ridotta e isolata, senza controlli extra e senza toccare CSS globale del pannello.*

- [x] **Mini rail orizzontale Gallery** (`MobileToolbar.tsx`): aggiunta una sola riga `Anteprima foto` con `overflow-x: auto`, card fisse (`116x76`), `nowrap` e spacer finale per mantenere la card tagliata a destra come cue visivo di scroll; nessuna modifica ai blocchi `Layout/Colonne/Spaziatura`.

### 17 Aprile 2026 — Rollback immediato tentativo 3 strip gallery
*QA utente negativo: anche la versione minimale della rail immagini altera visivamente il pannello. Ripristino urgente allo stato stabile.*

- [x] **Rimossa riga `Anteprima foto`** (`MobileToolbar.tsx`): rollback completo del blocco rail orizzontale; pannello Gallery mobile riportato a upload + layout + colonne + spaziatura senza preview strip.

### 17 Aprile 2026 — Strip gallery nel pannello (fix mirato contenimento flex)
*Reintrodotta la rail orizzontale dentro al pannello `widget_settings > Gallery` senza rompere il layout grazie a un wrapper bloccato in larghezza.*

- [x] **Contenitore `widget_settings` con `minWidth: 0, maxWidth: 100%, width: 100%`** (`MobileToolbar.tsx`): impedisce a un figlio largo (la rail) di far espandere il flex item oltre il parent, evitando l'overflow che prima sfondava il pannello.
- [x] **Rail `Foto (N)` orizzontale** (`MobileToolbar.tsx`, ramo `block.type === 'gallery'`): wrapper esterno `width: 100%; overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch`, interno `display: inline-flex; flex-wrap: nowrap; gap: 8px`. Card fisse `116x78px` con `background: url(...) center/cover`, bottone `Trash2` assoluto in alto a destra (22x22, fondo nero semitrasparente) per rimozione immediata via `patchProps({ images: next })`. L'ultima card resta tagliata dal bordo destro del pannello come cue visivo di scroll.
- [x] **Compatibilità URL immagini**: la card legge sia stringhe pure (`typeof img === 'string'`) sia oggetti `{url}` / `{src}`, coerentemente con i formati accettati dal resto della gallery.
- [x] **Fix thumbnail invisibili**: sostituito `background: url("...")` inline con un vero `<img>` in `position: absolute; inset: 0; object-fit: cover` dentro la card. Il background inline aveva parsing fragile con URL contenenti caratteri speciali; l'`<img>` renderizza sempre e permette `loading="lazy"`. Il bottone cestino ha `zIndex: 1` per restare cliccabile sopra.

### 17 Aprile 2026 — Public view mobile: fedeltà 1:1 con editor per gallery/video
*Bug: nella pagina pubblica mobile i layer testo attorno a gallery/video non replicavano l'editor — i titoli "Nuovo Testo" sopra la gallery sparivano o finivano in posizioni incoerenti, e la sezione video aveva uno spazio vuoto enorme sotto.*

- [x] **Root cause identificata** (`EventPublic.tsx`): il ramo `isWidget` usava overlay assoluti (`ReadOnlyCanvas` con `position: absolute; top: 0; left: 0; width: 100%; height: 100%`) con coordinate del canvas logico desktop (1000×400). Su mobile le coordinate x/y dei layer cadevano fuori schermo o sovrapposte al widget. RSVP mobile invece funzionava perché cadeva nel ramo LOGICAL CANVAS con `ReadOnlyCanvas isMobile+isBlock` (stream flex column interleaved, già compatibile con `custom-widget` via `renderCustomLayer`).
- [x] **Gallery/Video mobile → ramo LOGICAL CANVAS** (`EventPublic.tsx`): introdotto flag `useAbsoluteWidgetBranch = isWidget && !(isMobile && (block.type === 'gallery' || block.type === 'video'))`. Su mobile gallery/video cadono nel ramo con `ReadOnlyCanvas` mobile, che produce lo stesso stream flex column di `SectionCanvas.tsx` mobile (stesso padding `40px 20px`, stesso `gap: 30px`, stessa scala testi ×1.25). Map resta nel ramo absolute anche su mobile (non ha widget-layer ordinabile, è fill-parent).
- [x] **Injection custom-widget per gallery/video** (`EventPublic.tsx`): esteso l'array `layers` passato a `ReadOnlyCanvas` con un layer `type: 'custom-widget'` dedicato (`widget-gallery-<id>` / `widget-video-<id>`), con `mobileOrder` preso da `block.widgetProps.mobileOrder ?? 5` — esattamente come SectionCanvas mobile nell'editor. Aggiunti i branch corrispondenti in `renderCustomLayer` che istanziano `<GalleryWidget>` e `<VideoWidget>` con gli stessi props dell'editor.
- [x] **Fix spazio vuoto sotto il video mobile** (`EventPublic.tsx`): il wrapper sezione aveva `minHeight: '200px'` anche quando in-flow col ReadOnlyCanvas mobile, creando una barra vuota sotto il video (padding interno 40+40 + video ~190px ≥ 200 di solito, ma quando la sezione aveva pochi layer rimaneva evidente). Ora su mobile: `minHeight: 'auto'` per gallery/video (stream-mode), `200px` per map (resta absolute), come prima per gli altri.
- [x] **Risultato**: su mobile i testi sopra/sotto gallery e video appaiono nello stesso ordine, stessa dimensione e stessa posizione dell'editor mobile. Niente più overlay fantasma o spazio vuoto sotto i widget.
- [x] **Parity editor mobile: spazio vuoto sotto il video** (`SectionCanvas.tsx`): la sezione mobile aveva `minHeight: (block.height || 400) + 'px'` uniforme per tutti i tipi, che sul video (default 400) creava una barra vuota sotto il widget (il contenuto reale è ~titolo + video 16:9 ≈ 250px). Ora gallery/video usano `minHeight: 'auto'` (come il public), gli altri blocchi conservano `block.height || 400` perché hanno layer posizionati a coordinate del canvas logico che richiedono lo spazio (es. RSVP form espandibile, testi liberi).

### 🐛 Bug scoperti durante QA Fase 1 (da sistemare)
*Raccolti durante il test end-to-end della Busta Digitale. Non bloccanti per il lancio, ma da chiudere prima del release pubblico.*

- [x] **Widget duplicati — selezione condivisa errata**: ~~se nella stessa pagina ci sono due widget dello stesso tipo~~ **Risolto (2026-04)**: gli id virtuali erano per tipo (`widget-rsvp`, `widget-gallery`, …) invece che per blocco. Ora è ovunque `widget-<blockId>` (`widgetLayerIdForBlock` in `client/src/utils/widgetLayerId.ts`), allineato anche a `EventPublic` per lo stream mobile. Aggiornati `SectionCanvas`, `PageSection`, `BuilderSection`, `EventPageBuilder` (move/delete widget da `layerId`).
- [ ] **Disallineamento editor ↔ pagina pubblica**: alcuni blocchi nell'editor hanno un design, nella pagina pubblica risultano diversi (spaziatura, tipografia, proporzioni). Da auditare blocco per blocco — probabile regressione dopo gli ultimi refactor mobile/rich-media. Confronto visuale editor↔public per: RSVP, Gallery, Video, Map, Payment.

### 18 Aprile 2026 — Prossima milestone: Dashboard, Donazioni e identità evento
*Backlog concordato post-push: rifinitura area host + regole di naming evento coerenti con le comunicazioni email.*

- [x] **Pagina Donazioni (host)**: schermata dedicata alle donazioni/regali in denaro (Stripe), collegata dalla dashboard; progettare subito **desktop e mobile** (navigazione, tabella/card, filtri, export se applicabile). Completata base host (card, filtri, CSV, copy onesti su commissioni/contestazioni); vedi anche hub 19-04-2026.
- [ ] **Dashboard — rifacimento strutturato**: ripensare layout e gerarchia informazioni con **due esperienze first-class** (breakpoint desktop vs mobile), non solo adattamento “minimo” dello stesso markup.
- [ ] **Titolo evento obbligatorio in creazione**: oggi spesso compare il nome della **grafica/template invito** al posto di un titolo umano — poco elegante. Obbligare a inserire un **titolo evento** al funnel “nuovo evento” (validazione + copy chiara: cosa vedranno gli invitati e dove compare).
- [ ] **Mail transazionali (donazioni/regali) + titolo evento**: prima di cambiare la source del nome mostrato nelle email, **audit** di tutti i template (notifiche donazione, ricevute, riepiloghi host) che oggi possono usare il nome invito/template. Allineare a un **campo titolo evento** stabile; verificare che layout HTML testo (lunghezze, line-break, fallback) non rompa il design delle mail esistenti.

### 19 Aprile 2026 — Hub «Regali e donazioni» + percorso lista materiali
*Allineamento prodotto: denaro (Stripe) e lista regali materiali restano due flussi distinti; niente promessa di join automatico con RSVP finché non si definisce una chiave esplicita (es. email).*

- [x] **Hub UI in `EventDonations`**: tab pill «Denaro» / «Lista regali» (stile RSVP); seconda scheda roadmap lista; export **PDF prima di CSV** (jspdf-autotable); copy accorciata in pagina, Stripe nominato nel solo riquadro informativo legale; card donazione con blocco **«Messaggio dal donatore»** (titolo uppercase + testo). Rotte `/gifts/:slug`, `/events/:slug/gifts`. Dashboard → `/gifts/:slug`.
- [x] **Checklist v1.0 (sync 19-04-2026)**: in sezione «Deve esserci al day-one» segnati come fatti anche **dashboard utente**, **pagina regali/donazioni host** (senza affiliate), **home + catalogo template**; corretto header lotto RSVP 10-04 da «IN CORSO» a chiuso.
- [ ] **Backend lista regali**: modello prenotazioni (eventSlug, itemId, nome, email/telefono, note, createdAt), API host + endpoint pubblico con rate limit; widget pagina pubblica con flusso Prenota → redirect merchant.

### 📦 Lotto 3: Monetizzazione & Logistica

#### Fase 1 — Busta Digitale (Regali in denaro tramite Stripe Connect)
*Obiettivo: permettere ai beneficiari (sposi, organizzatori) di ricevere regali in denaro dagli invitati tramite carte worldwide, Apple/Google Pay, SEPA, con eenvee che incassa una commissione come platform fee. Tutto il flusso senza uscire dal dominio eenvee grazie a Stripe Connect Embedded Components. Dettaglio completo in `.cursor/plans/digital_gifts_mvp_*.plan.md`.*

- [ ] Stripe Connect Express + Embedded Components (onboarding inline, no redirect a stripe.com).
- [ ] Commissione 3% + 0,50€ via `application_fee_amount` (parametrica).
- [ ] Blocco `PaymentWidget` polivalente (template wedding_gift / generic), preset importi 25/50/100/200, progress bar opzionale, no lista pubblica donatori, no modalità anonima.
- [ ] Payment Element inline per donatori (carta, Apple Pay, Google Pay, SEPA) con 3DS2 gestito da Stripe.
- [ ] Webhook handler con signature verification, idempotency, rate limiting su create-intent.
- [ ] Dashboard host con `ConnectPaymentDetails` embedded per visualizzare donazioni ricevute, saldo, payout.
- [ ] Compliance: disclosure Stripe data processor, aggiornamento TOS/Privacy, pagina informativa fee.

#### Fase 2 — Lista Regali con affiliate marketing multi-merchant
*Obiettivo: permettere ai beneficiari di inserire prodotti reali (non in denaro) acquistabili su Amazon/MediaWorld/Zalando/IKEA ecc. Ricerca embedded lato eenvee, click-out finale verso il merchant (Amazon TOS vieta checkout in iframe/proxy), commissione affiliate standard del network.*

**Fase 2A — Wishlist Amazon (MVP)**
- [ ] Registrazione Amazon Associates IT (precondizione: almeno 3 vendite qualificate nei primi 180 giorni altrimenti account disattivato).
- [ ] Backend: integrazione Product Advertising API 5.0 per ricerca prodotti + fetch dettagli (ASIN, titolo, thumbnail, prezzo, disponibilità, rating). Cache risultati per rispettare rate limit.
- [ ] Blocco `WishlistWidget` nel page builder: griglia prodotti, card con foto/prezzo/merchant badge, CTA "Prenota e vai su Amazon".
- [ ] Modal embedded di ricerca per l'host: typeahead con preview risultati, supporto sia "query testuale" sia "incolla URL Amazon" (parser ASIN dal link).
- [ ] Funnel donatore con **soft-lock 48h**: al click "Prenoto" il prodotto passa in stato `reserved`, form nome + messaggio + checkbox "mostra nome agli sposi", poi redirect Amazon in nuova tab con link affiliate firmato (`?tag=eenvee-21&ascsubtag=<eventId>-<itemId>`).
- [ ] Attribuzione automatica via **Amazon Reporting API** (cron notturno): download conversioni giornaliere, match per `ascsubtag` con gli item `reserved`, promozione automatica a `purchased` + email notifica sposi. Delay atteso 24-48h (compatibile con la finestra di soft-lock).
- [ ] Fallback manuale: al ritorno sulla pagina + in email follow-up T+24h, popup "Hai completato l'acquisto?" → conferma utente = promozione manuale a `purchased`. Copre gli edge case (cookie bloccati, ITP Safari, acquisto senza usare il nostro link).
- [ ] Release automatico dopo 48h se nessuna conferma (né da Reporting API né manuale) → prodotto torna disponibile.
- [ ] Disclosure affiliate obbligatoria in footer + pagina dedicata "Come funzionano i regali fisici" (requisito Amazon TOS e AGCom).
- [ ] GDPR: cookie banner aggiornato per cookie terzi Amazon al redirect.

**Fase 2B — Estensione multi-merchant (Awin + TradeDoubler)**
- [ ] Iscrizione **Awin** (un account → 15k+ merchant inclusi Zalando, IKEA [dove disponibile], Decathlon, Sephora, Leroy Merlin, Booking).
- [ ] Iscrizione **TradeDoubler** (un account → MediaWorld, Unieuro, Eataly, Eprice, alcuni Euronics).
- [ ] Aggregator layer backend: query parallele alle API dei 3 network, normalizzazione dei risultati (schema unificato `ProductCandidate { source, sourceId, title, price, currency, thumbnail, merchantName, affiliateUrl }`), ordinamento per rilevanza + prezzo.
- [ ] UI con badge merchant per distinguere le fonti nella griglia risultati ("Amazon", "MediaWorld", "Zalando"...).
- [ ] Webhook conversioni **real-time** per Awin e TradeDoubler (entrambi li supportano, a differenza di Amazon): promozione a `purchased` entro ~15 minuti dall'acquisto, UX molto più fluida rispetto al polling Amazon.
- [ ] Gestione link deep-linking per ogni network (ogni provider ha sintassi diversa per tracking ID + custom param).

**Fase 2C — Robustezza anti-doppione e dashboard analytics**
- [ ] Dashboard sposi: filtro prodotti per stato (disponibile / prenotato / acquistato), con nome donatore (se consent) e messaggio.
- [ ] Notifica push/email real-time agli sposi al primo match di conversione.
- [ ] Gestione edge case "conversione su ASIN diverso dalla wishlist": se Amazon attribuisce una vendita con il nostro tag ma ASIN non presente nella lista (es. zia ha scelto altro), mostrarlo agli sposi come "regalo fuori lista ricevuto da donatore anonimo" senza matchare prodotti in wishlist.
- [ ] Analytics commissioni per l'host (trasparenza: "Il tuo evento ha generato X€ di commissioni per eenvee, alla piattaforma va Y%"), opzionale.
- [ ] Dashboard admin eenvee con totale commissioni multi-network, fatturazione reverse charge con Amazon Europe Core SARL, Awin (UK), TradeDoubler (SE).

**Vincoli noti e decisioni condivise**
- Il checkout **DEVE** avvenire sul merchant (Amazon TOS §5(b) vieta framing/embedding del checkout). L'utente percepisce eenvee come hub unico perché l'85% del journey (ricerca, wishlist, browsing pagina evento) avviene lì; solo l'ultimo click apre il merchant in nuova tab.
- "Prodotto automaticamente non disponibile dopo acquisto" → risolto via combo soft-lock 48h + Reporting API sub-tag + fallback manuale. Certezza non 100% (browser con cookie bloccati, utente che compra senza seguire il link), ma ~90-95% automazione, resto via UX di conferma.
- Nessun rischio fiscale lato eenvee: il beneficiario NON vende, Amazon/merchant è il seller; eenvee riceve solo commissioni affiliate (ricavo commerciale B2B fatturato reverse charge).

#### Altre feature Lotto 3
- [ ] **Tableau de Mariage**: Strumento per gli invitati per trovare il proprio tavolo tramite ricerca testuale.

---

## 💎 Regole d'Oro per lo Sviluppo (Developer Guidelines)

*Queste regole sono vincolanti e devono essere seguite in ogni sessione per mantenere il progetto "Premium".*

1.  **Immutabilità & Stato**: Ogni modifica ai layer o ai blocchi deve essere immutabile (`{...old, new}`). Mai modificare riferimenti diretti.
2.  **Micro-Componenti & Micro-Servizi**: 
    - Se un componente supera le 300 righe, deve essere diviso in sub-componenti (es. `EditorStage` -> `Canvas` + `Tools`).
    - La logica complessa (es. drag&drop, sorting) deve risiedere in **Hooks dedicati** (`useLayerManager`, `useEditorInteractions`).
3.  **Sincronizzazione Roadmap**: 
    - **REGOLA FISSA**: Ogni volta che una feature viene completata o un bug fixato, la `ROADMAP.md` deve essere aggiornata e i relativi box `[x]` spuntati.
    - Se si scopre un bug durante lo sviluppo, deve essere aggiunto alla roadmap prima di essere risolto.
4.  **Estetica "Jewelry"**: Ogni elemento UI deve brillare. Usare ombre morbide, gradienti Tiffany, angoli arrotondati (12px-20px) e animazioni fluide. Evitare design "piatti" e poveri.
5.  **Debug Friendliness**: Commentare le sezioni critiche e usare naming espliciti per le funzioni (es. `duplicateLayerInPlace` invece di `dup`).

---

## 🤵 L'Ecosistema Eenvee (Visione Globale)
- **Modulo A**: Sito Vetrina & Catalogo Template.
- **Modulo B**: Dashboard Creator per la gestione RSVP.
- **Modulo C**: Admin Panel Interno per creazione nuovi template commerciali.
- **Modulo D**: Area Pro per Wedding Planner (White-label).

---

## 💼 Business Plan — Eenvee v1.0

*Versione: Aprile 2026. Documento interno, aggiornare a ogni cambio di strategia.*

---

### Mercato di riferimento

| Segmento | Volume annuo Italia | Note |
|----------|--------------------|----|
| Matrimoni | ~173.000/anno (~14.400/mese) | In calo strutturale ma alto valore per evento (€35k media) |
| Battesimi / Comunioni | ~200.000/anno | Target secondario immediato |
| Lauree | ~300.000/anno | Alta frequenza, target giovane nativo digitale |
| Compleanni importanti (18/40/50) | ~500.000/anno (stima) | Stagionale, alta emotività |
| Corporate / eventi privati | Non stimato | Canale B2B futuro |
| **Totale potenziale** | **~1.200.000 eventi/anno** | Solo mercato italiano |

Il settore wedding muove **€3,5 miliardi/anno** in Italia. Il budget medio per matrimonio è €35.000: Eenvee intercetta meno dell'1‰ di quel budget — soglia psicologica praticamente inesistente.

---

### Posizionamento

**"Il sito del tuo evento. Tutto in un posto: invito, pagina, RSVP, regali, widget — niente stress."**

Differenziatori vs competitor (Paperless Post, Joy, WithJoy, servizi locali):
- Editor live completo (non solo template statici)
- Pagina evento interattiva con tutti i widget
- Integrazione RSVP + regali + donazioni nativa
- Dashboard wedding planner dedicata
- Made in Italy, lingua italiana, supporto reale
- Tableau de mariage e libretto messa (unici sul mercato italiano)

---

### Modello di ricavi

#### 1. Pay-per-event (coppie e privati)

| Piano | Prezzo | Contenuto |
|-------|--------|-----------|
| **Free** | €0 | Solo durante mese di lancio. Dopo: nessun free tier. |
| **Evento** | **€49** | Tutti i template, tutti i widget base, RSVP illimitato, regali, invio email inviti, pagina pubblica senza branding Eenvee, valido 18 mesi |
| **+ Tableau de mariage** | **€15** | Add-on acquistabile separatamente |
| **+ Libretto messa** | **€15** | Add-on acquistabile separatamente |
| **Import custom** (Canva/PDF) | incluso nei €49 | Non è una feature separata, è parte del prodotto |

Note: nessun abbonamento per coppie. Pagamento una tantum per evento. Psicologicamente allineato all'uso (un matrimonio = un pagamento).

#### 2. Subscription Wedding Planner

| Piano | Prezzo | Contenuto | Per chi |
|-------|--------|-----------|---------|
| **Starter** | **€79/mese** (o €790/anno) | Fino a 5 eventi attivi contemporaneamente, dashboard multi-evento, branding studio (logo sulla pagina), template base | Freelance, 1–2 eventi/mese |
| **Pro** | **€129/mese** (o €1.290/anno) | Fino a 15 eventi attivi, tutto Starter + tableau incluso + libretto incluso + analytics aggregati + priorità supporto + template pro esclusivi | Studio medio, 3–5 eventi/mese |
| **Agency** | **€199/mese** (o €1.990/anno) | Eventi illimitati, tutto Pro + subdomain studio (`studio.eenvee.com`), onboarding dedicato, report esportabili | Agenzie, 5+ eventi/mese |

Il valore della subscription planner non è "risparmiare rispetto al pay-per-event" ma **avere strumenti professionali esclusivi** (dashboard aggregata, branding studio, analytics, template riservati) che una coppia singola non può acquistare a nessun prezzo.

#### 3. Commissioni automatiche

| Fonte | % | Note |
|-------|---|------|
| Regali digitali (busta) | 3% + €0,50 | Già configurato su Stripe Connect |
| Donazioni | 3% + €0,50 | Già configurato |
| Affiliate prodotti lista nozze | 2–8% | Da configurare per network (Amazon, Awin, TradeDoubler) |

#### 4. Referral e incentivi social (programma lancio)

| Azione | Premio |
|--------|--------|
| Post/reel/story con tag @eenvee + link | €10 di credito su prossimo evento o add-on |
| Review verificata (Google / Trustpilot) | €15 di credito |
| Porta un amico che acquista | €20 di credito per entrambi |
| Planner: porta una coppia che acquista | 1 mese gratis sul piano attivo |

I crediti non scadono, sono trasferibili a qualsiasi acquisto futuro.

---

### Strategia di lancio

#### Fase 0 — Pre-lancio (2–3 settimane prima)
- Beta chiusa con 20–30 wedding planner selezionati (testimonial, feedback, contenuti autentici)
- Raccolta email/waitlist sul sito con countdown
- Kit influencer preparato (brief, asset grafici, copy suggerito)

#### Fase 1 — Lancio (mese 1)
- **Tutti gli eventi gratuiti per 30 giorni** (comunicato come "mese di lancio", non come "free tier permanente")
- Campagna social con micro e macro influencer settore wedding italiano
- Post sponsorizzati Instagram/TikTok target: donne 25–35, fidanzate/spose, Italia
- Al termine del mese: post ufficiale di ringraziamento + annuncio prezzi con grafica dedicata

#### Fase 2 — Regime (mese 2+)
- Prezzi attivi, nessun free tier
- Programma referral attivo
- SEO su keyword wedding Italia (pagina evento, inviti digitali matrimonio, RSVP online)
- Espansione a categorie non-wedding (lauree, compleanni)

---

### Proiezioni economiche

#### Anno 1 (post-lancio, scenario base)

| Fonte | Volume | Revenue annua |
|-------|--------|---------------|
| Coppie €49 (media 80/mese dopo lancio) | 960 eventi | **€47.040** |
| Tableau add-on €15 (40% degli eventi) | 384 | **€5.760** |
| Libretto add-on €15 (25% degli eventi) | 240 | **€3.600** |
| Planner Starter €79 (25 attivi) | — | **€23.700** |
| Planner Pro €129 (12 attivi) | — | **€18.576** |
| Fee transazioni (media €200/evento, 35%) | ~336 | **€2.100** |
| Affiliate (stima conservativa) | — | **€3.000** |
| **Totale anno 1** | | **~€103.776** |

#### Anno 2 (crescita organica + planner network)

| Fonte | Volume | Revenue annua |
|-------|--------|---------------|
| Coppie €49 (250/mese) | 3.000 eventi | **€147.000** |
| Add-on tableau + libretto (35% media) | 2.100 | **€31.500** |
| Planner Starter €79 (50 attivi) | — | **€47.400** |
| Planner Pro €129 (30 attivi) | — | **€46.440** |
| Planner Agency €199 (5 attivi) | — | **€11.940** |
| Fee transazioni + affiliate | — | **€18.000** |
| **Totale anno 2** | | **~€302.280** |

#### Anno 3 (dominanza mercato italiano)

Penetrazione ~8–10% mercato matrimoni + espansione non-wedding: **€600.000–800.000/anno** realistici.

---

### Costi operativi stimati

| Voce | Mese lancio | A regime (anno 1) |
|------|-------------|-------------------|
| Hosting (Railway + Vercel) | €20 | €50–100 |
| MongoDB Atlas | €0 (free) | €0–60 |
| Cloudflare R2 storage | €0–5 | €10–30 |
| Email (SMTP → Resend/Mailgun) | €0 | €20–50 |
| Stripe fees (% su transazioni) | variabile | variabile |
| Marketing / ads | €500–2.000 | €1.000–3.000 |
| Dominio + certificati | €2 | €2 |
| **Totale fisso** | **~€530–2.030** | **~€1.100–3.250/mese** |

**Break-even:** ~22–67 eventi/mese a €49. Raggiungibile già nel secondo mese.

---

### Roadmap prodotto verso il lancio (scope v1.0 commerciale)

#### App mobile & distribuzione (entro il lancio, non in coda)
*Decisione: non una seconda app “importer”, ma **lo stesso Eenvee** in store tramite **Capacitor** (webapp React incapsulata, accesso a API native dove servono). Questo lavoro va pianificato **prima** dello ship pubblico, in parallelo alla chiusura delle ultime feature web critiche, così al lancio avete **PWA** (add to home) **e** binari iOS/Android per permessi veri (es. contatti) senza sorpese post-release.*

- [ ] **Progetto Capacitor**: init repo/workspace (o cartella `mobile/`), `cap sync`, bundle client di produzione, variabili ambiente, deep link / universal link verso `eenvee` (auth e ritorno evento).
- [ ] **Build & pipeline**: TestFlight, Play internal testing; **certificati / firma**; versioning allineato al web.
- [ ] **PWA** (in parallelo o subito prima): `manifest`, icona, tema, caching sensato; “Installa app” con copy coerente con l’**app store** (stesso prodotto, due packaging).
- [ ] **Dopo** shell stabile: schermata **Inviti** con import contatti (plugin nativo + stesse API già previste) — svolta **dopo** il completamento “sito” funzionale, ma **tutta la filiera app + import resta in roadmap pre-lancio** (come da accordo: non lasciata come “fase successiva vaga”).

**Ordine consigliato per chiudere “il sito” e arrivare in tempo al lancio (rev. 2026-04-20)**  
1. **Compliance e fiducia** — Privacy, termini, cookie, copy GDPR: pochi asset ma sblocca marketing e uso pubblico.  
2. **Congelare lo scope v1.0** — Cosa entra nello *ship* iniziale (es. planner, tableau, libretto: day-one o fase 2) per evitare scope creep.  
3. **Qualità e test** — QA E2E (almeno 3 eventi) e, quando si toccano aree, tenere sotto controllo errori `tsc` sui file modificati.  
4. **Feature business ancora aperte** — Add-on, email invii, inviti: in coda a legal + QA, **in parallelo** preparazione **Capacitor** quando le schermate web “core” tendono a freeze.

#### Deve esserci al day-one (non negoziabile)
- [x] Editor invito (canvas, layer, template)
- [x] Pagina evento pubblica (blocchi, RSVP, mappa, galleria, video, regali)
- [x] Flusso nuovo evento (picker template, date, salvataggio)
- [x] Paywall Stripe piano **Evento** (€49 una tantum; DB `plan: paid`) — 2026-04-19: flusso **principale** allineato al modulo donazioni (`EventPurchaseModal` + `PaymentElement`, appearance/locale IT, SEPA+carte). `POST /api/subscriptions/create-unlock-intent` → `complete-unlock-intent` dopo `confirmPayment`; **fallback** hosted `POST /api/subscriptions/checkout` se intent non disponibile (503). Dev senza Stripe: `dev_simulate` → `success-mock` (solo non-prod). Redirect `?unlock=1&session_id=` resta per checkout hosted completato in precedenza. **Email** (stesso layout donazioni): webhook `payment_intent.succeeded` → ricevuta acquirente + notifica interna (`INTERNAL_NOTIFY_EMAIL` / fallback `SMTP_USER`; niente doppio invio da route HTTP). **Fattura IT** in modal + metadata `inv_*` (validazione formato-only CF/P.IVA). Migrazione dati legacy: `npm run migrate:plan` nella cartella `server/`. *Dettaglio sessione 19-04-2026: storico sotto.*
- [ ] Add-on acquistabili (tableau €15, libretto €15)
- [ ] Invio inviti email funzionante e semplice
- [x] Dashboard utente (lista eventi, statistiche base) — `Dashboard.tsx` 2026-04-19
- [x] Pagina regali e donazioni host (riepilogo in denaro, messaggi donatori, export PDF/CSV, hub Denaro/Lista regali) — 2026-04-19 *(affiliate multi-merchant: voci post-lancio)*
- [ ] Account planner con subscription Stripe
- [ ] Dashboard planner (lista clienti/eventi, branding studio)
- [ ] Tableau de mariage
- [ ] Libretto messa sfogliabile
- [ ] Timeline evento
- [ ] Menu catering
- [x] Home page marketing e catalogo template pubblici (`/` e `/templates`) — baseline 2026-04-19 *(refactor estetico/SEO può continuare)*
- [ ] Admin panel base (gestione template, utenti, transazioni)
- [ ] GDPR, termini d'uso, privacy policy, cookie banner
- [ ] QA su flussi reali (almeno 3 eventi test end-to-end)

#### Editor — Chatbot sfondi a tema (generazione immagini)
*Assistente conversazionale dentro l’editor, per le viste **Invito**, **Busta** (inclusa tasca / liner di sfondo) e **Scenario**: l’utente descrive il tema in linguaggio naturale e ottiene un’**immagine di sfondo** generata da applicare al contesto corrente.*

- [ ] **Chatbot + generazione sfondo**: prompt testuale (es. «matrimonio tema marino — sfondo per l’invito»); modello di generazione immagini; anteprima e conferma prima di impostare lo sfondo; ripetibile per **invito**, **busta (tasca / interni)** e **scenario** con contesto e aspect adeguati a ciascuna area.
- [ ] **Pipeline asset**: salvataggio su storage (es. R2), collegamento ai layer/sfondi già gestiti dall’editor, sostituzione o versionamento senza rompere il canvas.
- [ ] **Sicurezza e costi**: moderazione contenuti, rate limit, tracciamento crediti/costi API, copy chiara su uso AI e licenza d’uso dell’immagine generata.

#### Post-lancio (roadmap pubblica comunicabile)
- [ ] Widget affiliate lista nozze (Amazon + Awin)
- [ ] Dashboard wedding planner avanzata (analytics aggregati, report)
- [ ] Import PDF/Canva → invito digitale automatico
- [ ] Espansione categorie (lauree, compleanni, corporate)
- [ ] (Opzionale post–MVP iniziale) Evoluzioni app native oltre lo shell Capacitor + feature elencate nella sezione “App mobile & distribuzione”
