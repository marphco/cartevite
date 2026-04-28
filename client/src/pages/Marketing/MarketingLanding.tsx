import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "../../ui";
import { MarketingPublicNav } from "../../components/marketing/MarketingPublicNav";
import { useMarketingSession } from "../../components/marketing/useMarketingSession";
import {
  ArrowRight,
  Check,
  Mail,
  MapPin,
  Gift,
  LayoutTemplate,
  Pen,
  CreditCard,
  MousePointer2,
  Wand2,
  Send,
  ListChecks,
  ShieldOff,
  CalendarClock,
  Palette,
  HelpCircle,
  Heart,
  ChevronLeft,
  ChevronRight,
  Upload,
  LayoutGrid,
  Image,
  Users,
  Files,
  LayoutDashboard,
  Layers,
  Table,
  LineChart,
  Star,
  Globe,
  Home,
  Headphones,
  Infinity as InfinityIcon,
} from "lucide-react";
import EnvelopeAnimation from "../../components/envelope/EnvelopeAnimation";
import { browseMarketingCategories, type MarketingCategory } from "../../config/marketingCatalog";
import {
  MARKETING_DISCOVER_HASH,
  MARKETING_DISCOVER_SECTION_ID,
} from "../../config/marketingDiscover";
import { templatesPathForCategory } from "../../config/templateCategoryRoutes";
import { LEGAL } from "../../config/legalEntity";
import invitoHero3 from "../../assets/invito-hero3.png";
import appStoreSvg from "../../assets/app-store.svg";
import playStoreSvg from "../../assets/play-store.svg";
import { apiFetch } from "../../utils/apiFetch";
import "./MarketingLanding.css";

const ease = [0.22, 1, 0.36, 1] as const;

const HOW_STEPS = [
  {
    icon: MousePointer2,
    n: "1",
    h: "Scegli o carica un design",
    p: "Parti da un modello pronto, oppure carica il tuo: invito, busta, pagina dell’evento.",
  },
  {
    icon: Wand2,
    n: "2",
    h: "Cambialo come vuoi",
    p: "Tocchi, scrivi, fatto. Niente codice, niente programmi da scaricare.",
  },
  {
    icon: Send,
    n: "3",
    h: "Mandi un link",
    p: "Su WhatsApp o email. Le risposte ti arrivano già in ordine.",
  },
] as const;

const FEATURES = [
  {
    icon: Mail,
    h: "L’invito si apre come una busta",
    p: "Animazione di apertura curata. Sembra una vera busta in mano.",
  },
  {
    icon: LayoutTemplate,
    h: "Una pagina tutta per l’evento",
    p: "Un sito tuo con tutte le informazioni importanti.",
  },
  {
    icon: ListChecks,
    h: "Conferme presenza",
    p: "Chi viene, in quanti, allergie. Riepilogo pronto, niente fogli Excel.",
  },
  {
    icon: MapPin,
    h: "Mappa e indicazioni",
    p: "Indirizzi, parcheggi, orari. Senza chiedere nei gruppi.",
  },
  {
    icon: Gift,
    h: "Lista regali",
    p: "Idee regalo o cassa digitale, già nella pagina.",
  },
  {
    icon: Pen,
    h: "Cambi quando vuoi",
    p: "Aggiorni un dettaglio una volta sola, lo vedono tutti gli invitati.",
  },
] as const;

/** Un evento: cosa sblocca l’attivazione (allineato prodotto + roadmap listino coppie). */
const PLAN_INCLUSION = [
  { icon: Image, t: "Tutti i design del catalogo" },
  { icon: Mail, t: "Pagina evento con busta animata" },
  { icon: Users, t: "Gestione conferme e lista regali" },
  { icon: MapPin, t: "Mappa interattiva e indicazioni" },
  { icon: ShieldOff, t: "Nessuna pubblicità per gli invitati" },
] as const;

/** Roadmap § Subscription Wedding Planner — tre tier. */
const PLANNER_TIERS = [
  {
    name: "Starter",
    price: "79 €",
    sub: "al mese",
    features: [
      { icon: Files, t: "Fino a 5 eventi attivi" },
      { icon: LayoutDashboard, t: "Dashboard professionale" },
      { icon: Palette, t: "Logo personalizzato" },
      { icon: Send, t: "Assistenza dedicata" },
    ],
  },
  {
    name: "Pro",
    price: "129 €",
    sub: "al mese",
    features: [
      { icon: Layers, t: "Fino a 15 eventi attivi" },
      { icon: Table, t: "Tableau e Libretto inclusi" },
      { icon: LineChart, t: "Analytics avanzate" },
      { icon: Star, t: "Supporto prioritario" },
    ],
  },
  {
    name: "Agency",
    price: "199 €",
    sub: "al mese",
    features: [
      { icon: InfinityIcon, t: "Eventi illimitati" },
      { icon: Globe, t: "Sottodominio dedicato" },
      { icon: Home, t: "Spazio studio riservato" },
      { icon: Headphones, t: "Account manager dedicato" },
    ],
  },
] as const;

export default function MarketingLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const t = (base: number) => (reduceMotion ? 0 : base);
  const [planTab, setPlanTab] = useState(0); // 0: un evento, 1: planner
  const [activeTierForm, setActiveTierForm] = useState<string | null>(null);
  const [plannerFormStatus, setPlannerFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const marketingSession = useMarketingSession();
  const { user } = marketingSession;

  /** Catalogo modelli (entry principale del funnel: scegli → account → attivazione). */
  const goCatalog = () => {
    navigate("/templates");
  };

  /** CTA principale: utenti collegati → dashboard; ospiti → catalogo (non aprire subito la registrazione). */
  const goPrimary = () => {
    if (user) navigate("/dashboard");
    else goCatalog();
  };

  const primaryLabel = user ? "Vai ai miei eventi" : "Sfoglia il catalogo";

  useLayoutEffect(() => {
    if (location.pathname !== "/") return;
    if (location.hash !== MARKETING_DISCOVER_HASH) return;
    const el = document.getElementById(MARKETING_DISCOVER_SECTION_ID);
    if (!el) return;
    const instant = reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: "start" });
    });
  }, [location.pathname, location.hash, reduceMotion]);

  return (
    <div className="ml-page">
      <MarketingPublicNav {...marketingSession} />

      {/* HERO */}
      <header className="ml-hero">
        <div className="ml-hero__bg" aria-hidden>
          <div className="ml-hero__mesh" />
          <div className="ml-hero__grain" />
        </div>

        <div className="ml-hero__grid">
          <div className="ml-hero__copy">
            <motion.span
              className="ml-eyebrow"
              initial={{ opacity: 0, y: t(8) }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: t(0.4), ease }}
            >
              Inviti elettronici · Made in Italy
            </motion.span>

            <motion.h1
              className="ml-hero__title"
              initial={{ opacity: 0, y: t(20) }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: t(0.55), ease }}
            >
              <span className="ml-hero__line">Tutto il tuo evento,</span>
              <span className="ml-hero__line ml-hero__line--accent">in un solo link.</span>
            </motion.h1>

            <motion.p
              className="ml-hero__sub"
              initial={{ opacity: 0, y: t(14) }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: t(0.45), delay: t(0.08), ease }}
            >
              Invito animato, pagina dell’evento, conferme, mappa e regali.
              Lo metti in piedi in pochi minuti e condividi il link con chi inviti.
            </motion.p>

            <motion.div
              className="ml-hero__cta"
              initial={{ opacity: 0, y: t(10) }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: t(0.4), delay: t(0.16), ease }}
            >
              <Button className="ml-hero__primary" onClick={goPrimary}>
                {primaryLabel}
                <ArrowRight size={18} strokeWidth={2.4} />
              </Button>
            </motion.div>

            <p className="ml-hero__filelink">
              Hai già la grafica?{" "}
              <Link to={templatesPathForCategory("Il tuo file")}>Caricala</Link>
              {", scegli formato e busta: in due clic l’invito è pronto da condividere."}
            </p>

            <ul className="ml-hero__trust" aria-label="Punti di fiducia">
              <li><Check size={14} strokeWidth={2.6} /> Soli 69 € per evento</li>
              <li><Check size={14} strokeWidth={2.6} /> Senza canone</li>
              <li><Check size={14} strokeWidth={2.6} /> Senza pubblicità</li>
            </ul>
          </div>

          <div className="ml-hero__visual" aria-hidden>
            <ProductLoop />
          </div>
        </div>
      </header>

      {/* HOW IT WORKS — anchor nav «Scopri eenvee» (come funziona, cosa include, perché sceglierci) */}
      <section id={MARKETING_DISCOVER_SECTION_ID} className="ml-section ml-how" aria-labelledby="how-title">
        <header className="ml-section__head">
          <span className="ml-eyebrow ml-eyebrow--alt">Come funziona</span>
          <h2 id="how-title" className="ml-h2">In tre passi sei online.</h2>
          <p className="ml-h2__sub">Senza spiegazioni, senza app extra. Anche se non sei pratico.</p>
        </header>
        <ol className="ml-how__grid">
          {HOW_STEPS.map(({ icon: Icon, n, h, p }, i) => (
            <motion.li
              key={n}
              className="ml-how__cell"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
            >
              <div className="ml-how__ic" aria-hidden>
                <Icon size={24} strokeWidth={2.2} />
              </div>
              <span className="ml-how__n" aria-hidden>{n}</span>
              <h3 className="ml-how__h">{h}</h3>
              <p className="ml-how__p">{p}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* FEATURES */}
      <section className="ml-section ml-features" aria-labelledby="feat-title">
        <header className="ml-section__head">
          <span className="ml-eyebrow ml-eyebrow--alt">Cosa ricevono i tuoi invitati</span>
          <h2 id="feat-title" className="ml-h2">Tutto in un solo posto.</h2>
          <p className="ml-h2__sub">
            Sei cose, fatte bene. L’essenziale c’è già: il resto lo attivi solo se ti serve.
          </p>
        </header>
        <div className="ml-features__grid">
          {FEATURES.map(({ icon: Icon, h, p }, i) => (
            <motion.article
              key={h}
              className="ml-features__cell"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
            >
              <motion.span 
                className="ml-features__ic" 
                aria-hidden
                whileHover={{ y: -5, rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Icon size={22} strokeWidth={2.2} />
              </motion.span>
              <h3 className="ml-features__h">{h}</h3>
              <p className="ml-features__p">{p}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Prezzi — stesso linguaggio visivo delle sezioni Come funziona / Cosa ricevono */}
      <section className="ml-section ml-plan" aria-labelledby="plan-section-title">
        <header className="ml-section__head">
          <span className="ml-eyebrow ml-eyebrow--alt">Piani e prezzi</span>
          <h2 id="plan-section-title" className="ml-h2">
            Il prezzo giusto per il tuo evento.
          </h2>
          <p className="ml-h2__sub">
            Semplice e trasparente: un unico pagamento per il tuo evento o un abbonamento flessibile per professionisti.
          </p>
        </header>

        <div className="ml-plan__bar" role="tablist" aria-label="Modalità d’utilizzo">
          <button
            type="button"
            className={`ml-plan__opt${planTab === 0 ? " ml-plan__opt--on" : ""}`}
            role="tab"
            id="plan-tab-0"
            aria-selected={planTab === 0}
            tabIndex={planTab === 0 ? 0 : -1}
            onClick={() => setPlanTab(0)}
          >
            <span className="ml-plan__opt-t">Per il tuo evento</span>
            <span className="ml-plan__opt-d">Nessun abbonamento</span>
          </button>
          <button
            type="button"
            className={`ml-plan__opt${planTab === 1 ? " ml-plan__opt--on" : ""}`}
            role="tab"
            id="plan-tab-1"
            aria-selected={planTab === 1}
            tabIndex={planTab === 1 ? 0 : -1}
            onClick={() => setPlanTab(1)}
          >
            <span className="ml-plan__opt-t">Per professionisti</span>
            <span className="ml-plan__opt-d">Piani in abbonamento</span>
          </button>
        </div>

        {planTab === 0 && (
          <div className="ml-plan__grid ml-plan__grid--split">
            <div className="ml-plan__copy" role="tabpanel" id="plan-panel-0" aria-labelledby="plan-tab-0">
              <h3 className="ml-plan__h">Scegli il design, dai vita al tuo progetto</h3>
              <p className="ml-plan__lede">
                Scegli il design perfetto nel catalogo e sbloccalo quando sei pronto a condividere. Accesso illimitato a ogni funzione.
              </p>
              <ul className="ml-plan__simple" aria-label="Cosa sblocchi con l’attivazione">
                {PLAN_INCLUSION.map(({ icon: Ic, t: line }) => (
                  <li key={line}>
                    <span className="ml-plan__simple-ic" aria-hidden>
                      <Ic size={14} strokeWidth={3} />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
              {/* Rimosso link Vedi i modelli */}
            </div>
            <div className="ml-plan__aside" aria-label="Riepilogo prezzo">
              <div className="ml-plan__stick">
                <p className="ml-plan__stick-ey">Il tuo progetto</p>
                <p className="ml-plan__stick-total" aria-label="Sessantanove euro">
                  <span className="ml-plan__stick-curr">69&nbsp;€</span>
                  <span className="ml-plan__stick-sub">per iniziare</span>
                </p>
                <p className="ml-plan__stick-oneliner">
                  Invito, pagina, conferme, mappa e regali. Accesso illimitato.
                </p>
                <Button className="ml-plan__stick-cta" onClick={goPrimary}>
                  {user ? "Vai ai miei eventi" : "Inizia dal catalogo"}
                  <ArrowRight size={18} strokeWidth={2.3} />
                </Button>
                <p className="ml-plan__stick-note">
                  <span>Pagamento sicuro via</span>{" "}
                  <img
                    src="/stripe-wordmark.svg"
                    alt="Stripe"
                    className="ml-final__stripe-logo"
                    width={50}
                    height={22}
                    loading="lazy"
                    decoding="async"
                  />
                </p>
              </div>
            </div>
          </div>
        )}

        {planTab === 1 && (
          <div className="ml-plan__planner" role="tabpanel" id="plan-panel-1" aria-labelledby="plan-tab-1">
            <div className="ml-plan__planner-intro">
              <h3 className="ml-plan__h">Tutti i tuoi eventi in un unico posto</h3>
              <p className="ml-plan__lede">
                Scegli il piano più adatto alla tua attività. Primo mese in omaggio, disdici quando vuoi.
              </p>
            </div>
            <ol className="ml-plan__tier-grid" aria-label="Piani subscription per wedding planner">
              {PLANNER_TIERS.map((tier) => {
                const isActive = activeTierForm === tier.name;

                return (
                  <li key={tier.name} className="ml-plan__tier-wrapper">
                    <div
                      className={`ml-plan__tier-card ${isActive ? "ml-plan__tier-card--active" : ""}`}
                    >
                      {isActive ? (
                        <div className="ml-plan__tier-form-container">
                          {plannerFormStatus === "success" ? (
                            <div className="ml-plan__tier-success">
                              <Check size={32} className="ml-plan__tier-success-ic" />
                              <p>Richiesta ricevuta!</p>
                              <span className="ml-plan__tier-success-sub">
                                Ti contatteremo a breve per attivare il tuo piano e il mese di prova gratuita.
                              </span>
                              <button
                                className="ml-plan__tier-back"
                                onClick={() => {
                                  setActiveTierForm(null);
                                  setPlannerFormStatus("idle");
                                }}
                              >
                                Chiudi
                              </button>
                            </div>
                          ) : (
                            <form
                              className="ml-plan__tier-form"
                              onSubmit={async (e) => {
                                e.preventDefault();
                                setPlannerFormStatus("loading");
                                try {
                                  const fd = new FormData(e.currentTarget);
                                  const payload = {
                                    fullName: fd.get("fullName"),
                                    email: fd.get("email"),
                                    phone: fd.get("phone"),
                                    tier: tier.name
                                  };
                                  
                                  const res = await apiFetch("/api/marketing/professional-request", {
                                    method: "POST",
                                    body: JSON.stringify(payload)
                                  });
                                  
                                  if (res.ok) setPlannerFormStatus("success");
                                  else setPlannerFormStatus("error");
                                } catch (err) {
                                  setPlannerFormStatus("error");
                                }
                              }}
                            >
                              <span className="ml-plan__tier-form-title">Piano {tier.name}</span>
                              <p className="ml-plan__tier-form-intro">
                                Richiedi l'attivazione del tuo mese di prova gratuita e scopri tutte le funzioni del piano.
                              </p>
                              <input type="text" name="fullName" required placeholder="Nome e Cognome" className="ml-plan__tier-input" />
                              <input type="email" name="email" required placeholder="Email" className="ml-plan__tier-input" />
                              <input
                                type="tel"
                                name="phone"
                                placeholder="Telefono (opzionale)"
                                className="ml-plan__tier-input"
                                onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9+]/g, '')}
                              />
                              <div className="ml-plan__tier-form-btns">
                                <button
                                  type="button"
                                  className="ml-plan__tier-cancel"
                                  onClick={() => setActiveTierForm(null)}
                                >
                                  Annulla
                                </button>
                                <Button type="submit" size="sm" className="ml-plan__tier-submit" disabled={plannerFormStatus === "loading"}>
                                  {plannerFormStatus === "loading" ? "Inviando..." : "Invia"}
                                </Button>
                              </div>
                            </form>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="ml-plan__tier-card-head">
                            <span className="ml-plan__tier-name">{tier.name}</span>
                          </div>
                          <ul className="ml-plan__tier-list">
                            {tier.features.map((feat) => (
                              <li key={feat.t}>
                                <feat.icon size={14} strokeWidth={2.5} className="ml-plan__tier-ic" />
                                {feat.t}
                              </li>
                            ))}
                          </ul>
                          <div className="ml-plan__tier-price-box">
                            <span className="ml-plan__tier-price" aria-label={`${tier.price} ${tier.sub}`}>
                              {tier.price}
                              <span className="ml-plan__tier-every">{tier.sub}</span>
                            </span>
                          </div>
                          <button
                            className="ml-plan__tier-cta"
                            onClick={() => setActiveTierForm(tier.name)}
                          >
                            Seleziona piano
                            <ArrowRight size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            {/* Rimosso footer ingombrante */}
          </div>
        )}
      </section>

      {/* Occasioni — dopo il perché / come, prima del prezzo */}
      <section className="ml-section ml-explore" aria-labelledby="explore-title">
        <header className="ml-section__head ml-explore__head">
          <span className="ml-eyebrow ml-eyebrow--alt">Catalogo</span>
          <h2 id="explore-title" className="ml-h2">
            Parti dal tipo di evento
          </h2>
          <p className="ml-h2__sub">
            Tocchi la categoria e lavori solo con modelli coerenti per tono e stile, senza mescolare il
            resto.
          </p>
        </header>
        <HomeCategoryStrip reduceMotion={!!reduceMotion} t={t} />
      </section>

      {/* APP DOWNLOAD — Visual: Push Notifications with Brand Logo */}
      <section className="ml-section ml-download" aria-labelledby="app-title">
        <div className="ml-download__container">
          <div className="ml-download__content">
            <span className="ml-eyebrow ml-eyebrow--alt">In tasca, ovunque</span>
            <h2 id="app-title" className="ml-h2">Portalo sempre con te.</h2>
            <p className="ml-download__p">
              Gestisci il tuo evento, rispondi ai messaggi e controlla le conferme in tempo reale. 
              Tutto il controllo di eenvee in un'app elegante e veloce.
            </p>
            <div className="ml-download__stores">
              <a href="#" className="ml-download__store-btn" aria-label="Scarica su App Store">
                <img src={appStoreSvg} alt="App Store" style={{ height: '44px', width: 'auto' }} />
              </a>
              <a href="#" className="ml-download__store-btn" aria-label="Disponibile su Google Play">
                <img src={playStoreSvg} alt="Google Play" style={{ height: '44px', width: 'auto' }} />
              </a>
            </div>
          </div>
          
          <div className="ml-download__visual">
            <div className="ml-download__notif-stage">
              {/* Notifica 1 */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="ml-download__push"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="ml-download__push-icon">
                    <img src="/favicon.svg" alt="eenvee" />
                  </div>
                  <div className="ml-download__push-body">
                    <div className="ml-download__push-head">
                      <strong>eenvee</strong>
                      <span>ora</span>
                    </div>
                    <p><strong>Nuova conferma</strong>: Marco Rossi e +2 invitati.</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Notifica 2 */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="ml-download__push ml-download__push--alt"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                >
                  <div className="ml-download__push-icon">
                    <img src="/favicon.svg" alt="eenvee" />
                  </div>
                  <div className="ml-download__push-body">
                    <div className="ml-download__push-head">
                      <strong>eenvee</strong>
                      <span>2m fa</span>
                    </div>
                    <p><strong>Lista regali</strong>: Ricevuto nuovo contributo di 150€.</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <footer className="ml-footer">
        <span>eenvee © {new Date().getFullYear()}</span>
        <div className="ml-footer__links">
          <Link to="/privacy">Privacy</Link>
          <Link to="/termini">Termini</Link>
          <Link to="/cookie">Cookie</Link>
        </div>
      </footer>
    </div>
  );
}

/** Due card per colonna, scroll orizzontale: con molte sezioni resta un’unica pista orizzontale. */
function chunkCategoriesForTwoRows(items: MarketingCategory[]) {
  const out: MarketingCategory[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    out.push(items.slice(i, i + 2));
  }
  return out;
}

function HomeCategoryStrip({
  reduceMotion,
  t,
}: {
  reduceMotion: boolean;
  t: (base: number) => number;
}) {
  const navigate = useNavigate();
  const stripRef = useRef<HTMLDivElement>(null);
  const items = useMemo(() => browseMarketingCategories(), []);
  const columns = useMemo(() => chunkCategoriesForTwoRows(items), [items]);

  const scrollStrip = (dir: -1 | 1) => {
    const el = stripRef.current;
    if (!el) return;
    const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 720px)").matches;
    /* mobile: scatto per colonna a 2 card; desktop: scatto per singola card (riga unica) */
    const stepEl = (
      isDesktop
        ? el.querySelector(".ml-explore-card--duo")
        : el.querySelector(".ml-explore__col")
    ) as HTMLElement | null;
    const w = stepEl?.getBoundingClientRect().width ?? 0;
    const gap = parseFloat(getComputedStyle(el).columnGap) || parseFloat(getComputedStyle(el).gap) || 12;
    const step = w + (Number.isFinite(gap) ? gap : 12);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="ml-explore__slider">
      <button
        type="button"
        className="ml-explore__chev ml-explore__chev--prev"
        onClick={() => scrollStrip(-1)}
        aria-label="Scorri le categorie indietro"
      >
        <ChevronLeft size={22} strokeWidth={2.2} />
      </button>
      <div
        ref={stripRef}
        className="ml-explore__strip ml-explore__strip--duo"
        tabIndex={0}
        role="region"
        aria-label="Categorie: scorri per vederle tutte"
      >
        {columns.map((col, colIdx) => {
          const colKey = col.map((c) => c.name).join("·");
          return (
            <div className="ml-explore__col" key={colKey}>
              {col.map((item, ri) => {
                const i = colIdx * 2 + ri;
                return (
                  <motion.button
                    type="button"
                    key={item.name}
                    className="ml-explore-card ml-explore-card--duo"
                    onClick={() => navigate(templatesPathForCategory(item.name))}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-24px" }}
                    transition={{
                      duration: reduceMotion ? 0 : t(0.35),
                      delay: reduceMotion ? 0 : t(i * 0.04),
                      ease,
                    }}
                  >
                    <span className="ml-explore-card__media">
                      <img src={item.image} alt="" className="ml-explore-card__img" loading="lazy" />
                      <span className="ml-explore-card__shade" aria-hidden />
                      <span className="ml-explore-card__title">{item.name}</span>
                    </span>
                  </motion.button>
                );
              })}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="ml-explore__chev ml-explore__chev--next"
        onClick={() => scrollStrip(1)}
        aria-label="Scorri le categorie avanti"
      >
        <ChevronRight size={22} strokeWidth={2.2} />
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------
   ProductLoop — finto telefono che mostra (in loop, solo CSS):
   1) busta chiusa  →  2) flap che si apre  →  3) pagina evento
      che scorre con sezioni reali del prodotto
   Volutamente "muto" all'AT (aria-hidden a livello superiore).
   ---------------------------------------------------------------- */
function ProductLoop() {
  const reduceMotion = useReducedMotion();
  const [cycle, setCycle] = useState(0);
  const [envPhase, setEnvPhase] = useState<"closed" | "extracted">("closed");
  const slotRef = useRef<HTMLDivElement>(null);

  // Loop sync con CSS: setTimeout(16s) e animation 16s divergono → al wrap keyframe busta
  // a opacity 1 un frame con ancora l'albero React "estratto". iteration = fine ciclo, stesso tick del browser.
  useLayoutEffect(() => {
    if (reduceMotion) return;
    const el = slotRef.current;
    if (!el) return;
    const onLoop = (e: AnimationEvent) => {
      if (e.target !== e.currentTarget) return;
      if (!String(e.animationName).includes("ml-env-slot")) return;
      setEnvPhase("closed");
      setCycle((c) => c + 1);
    };
    el.addEventListener("animationiteration", onLoop);
    return () => el.removeEventListener("animationiteration", onLoop);
  }, [reduceMotion]);

  // ~14.0s/16s (~87%): closed prima del fade-in busta 91–100% (allineato keyframe ml-env-slot).
  const PRECLOSE_AT_MS = 14_000;

  useEffect(() => {
    if (reduceMotion) return;
    const openT = window.setTimeout(() => setEnvPhase("extracted"), 900);
    const preCloseT = window.setTimeout(() => setEnvPhase("closed"), PRECLOSE_AT_MS);
    return () => {
      window.clearTimeout(openT);
      window.clearTimeout(preCloseT);
    };
  }, [cycle, reduceMotion]);

  return (
    <div className="ml-stage">
      <div className="ml-stage__device">
        <div className="ml-stage__notch" />
        <div className="ml-stage__screen">
          {/* Fase 1 — vera busta del prodotto, pilotata via manualPhase + key remount */}
          <div className="ml-envelope-slot" ref={slotRef} aria-hidden>
            <EnvelopeAnimation
              envelopeFormat="vertical"
              envelopeColor="#2f7f6f"
              pocketColor="#58a892"
              linerColor="#f7efd9"
              canvasProps={{ width: 400, height: 500 }}
              isBuilder
              useExternalScaleInBuilder
              scale={0.8}
              manualPhase={envPhase}
            >
              <div className="ml-envelope-card">
                <img
                  className="ml-envelope-card__img"
                  src={invitoHero3}
                  alt=""
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
              </div>
            </EnvelopeAnimation>
          </div>

          {/* Fase 2 — pagina evento che scorre */}
          <div className="ml-app">
            <div className="ml-app__bar">
              <span className="ml-app__dot" />
              <span className="ml-app__dot" />
              <span className="ml-app__dot" />
            </div>

            <section className="ml-app__hero">
              <span className="ml-app__eyebrow">Save the date</span>
              <span className="ml-app__title">Anna &amp; Luca</span>
              <span className="ml-app__date">21 · 09 · 2026 — Lago di Como</span>
            </section>

            <section className="ml-app__sec">
              <div className="ml-app__sec-h">
                <ListChecks size={14} strokeWidth={2.4} />
                <span>Conferma presenza</span>
              </div>
              <div className="ml-app__field" />
              <div className="ml-app__field" />
              <div className="ml-app__pill ml-app__pill--accent">Conferma</div>
            </section>

            <section className="ml-app__sec">
              <div className="ml-app__sec-h">
                <MapPin size={14} strokeWidth={2.4} />
                <span>Come arrivare</span>
              </div>
              <div className="ml-app__map">
                <span className="ml-app__map-pin" />
              </div>
            </section>

            <section className="ml-app__sec">
              <div className="ml-app__sec-h">
                <Gift size={14} strokeWidth={2.4} />
                <span>Lista regali</span>
              </div>
              <div className="ml-app__row">
                <div className="ml-app__chip" />
                <div className="ml-app__chip" />
                <div className="ml-app__chip" />
              </div>
            </section>

            <section className="ml-app__sec">
              <div className="ml-app__sec-h">
                <CalendarClock size={14} strokeWidth={2.4} />
                <span>Programma</span>
              </div>
              <ul className="ml-app__timeline">
                <li><span /> Cerimonia · 16:00</li>
                <li><span /> Aperitivo · 18:30</li>
                <li><span /> Cena · 20:00</li>
                <li><span /> Festa · 22:30</li>
              </ul>
            </section>

            <section className="ml-app__sec">
              <div className="ml-app__sec-h">
                <Palette size={14} strokeWidth={2.4} />
                <span>Dress code</span>
              </div>
              <div className="ml-app__swatches">
                <span style={{ background: "#e7d8b9" }} />
                <span style={{ background: "#a4c4b1" }} />
                <span style={{ background: "#3c4f76" }} />
                <span style={{ background: "#fff" }} />
              </div>
              <div className="ml-app__field ml-app__field--sm" />
            </section>

            <section className="ml-app__sec">
              <div className="ml-app__sec-h">
                <HelpCircle size={14} strokeWidth={2.4} />
                <span>Domande frequenti</span>
              </div>
              <div className="ml-app__faq">
                <div className="ml-app__field ml-app__field--sm" />
                <div className="ml-app__field ml-app__field--sm" />
                <div className="ml-app__field ml-app__field--sm" />
              </div>
            </section>

            <section className="ml-app__sec ml-app__sec--thanks">
              <div className="ml-app__sec-h">
                <Heart size={14} strokeWidth={2.4} />
                <span>Un grazie da noi</span>
              </div>
              <div className="ml-app__field ml-app__field--sm" />
              <div className="ml-app__field ml-app__field--sm" />
              <div className="ml-app__field ml-app__field--sm" style={{ width: "60%" }} />
            </section>
          </div>
        </div>

        <div className="ml-stage__ribbon" aria-hidden>
          <strong>69&nbsp;€</strong>
          <span>tutto incluso</span>
        </div>
      </div>
    </div>
  );
}
