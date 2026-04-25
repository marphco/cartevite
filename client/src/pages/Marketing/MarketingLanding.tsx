import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "../../ui";
import AuthForm from "../../components/ui/AuthForm";
import {
  ArrowRight,
  Check,
  Mail,
  MapPin,
  Gift,
  Globe2,
  Pen,
  CreditCard,
  CalendarDays,
  Sparkles,
  UserPlus,
  MousePointer2,
  Wand2,
  Send,
  ListChecks,
  ShieldOff,
  X as IconX,
  CalendarClock,
  Palette,
  HelpCircle,
  Heart,
} from "lucide-react";
import EnvelopeAnimation from "../../components/envelope/EnvelopeAnimation";
import { API_BASE } from "../../config/api";
import { MARKETING_CATEGORIES } from "../../config/marketingCatalog";
import invitoHero3 from "../../assets/invito-hero3.png";
import "./MarketingLanding.css";

const ease = [0.22, 1, 0.36, 1] as const;

const HOW_STEPS = [
  {
    icon: MousePointer2,
    n: "1",
    h: "Scegli un modello",
    p: "Parti da un design già pronto. Ti basta cambiare nomi e data.",
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
    icon: Globe2,
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

export default function MarketingLanding() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const t = (base: number) => (reduceMotion ? 0 : base);

  const [user, setUser] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModal, setAuthModal] = useState<null | "login" | "register">(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d: { user?: unknown }) => {
        if (!cancelled) setUser(!!d?.user);
      })
      .catch(() => {
        if (!cancelled) setUser(false);
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const closeAuthModal = useCallback(() => setAuthModal(null), []);

  useEffect(() => {
    if (!authModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [authModal, closeAuthModal]);

  const goTemplates = (categoryName?: string) => {
    if (categoryName) navigate(`/templates?category=${encodeURIComponent(categoryName)}`);
    else navigate("/templates");
  };

  const goPrimary = () => {
    if (user) navigate("/dashboard");
    else setAuthModal("register");
  };

  const onAuthSuccess = useCallback(() => {
    setAuthModal(null);
    navigate("/dashboard");
  }, [navigate]);

  const primaryLabel = user ? "Vai ai miei eventi" : "Crea il tuo evento";

  return (
    <div className="ml-page">
      <nav className="ml-nav" aria-label="Principale">
        <div className="ml-nav__inner">
          <button
            type="button"
            className="ml-logo"
            onClick={() => navigate("/")}
            aria-label="eenvee — torna alla home"
          >
            <img src="/logo-eenvee.svg" alt="eenvee" />
          </button>
          <div className="ml-nav__actions">
            <button
              type="button"
              className="ml-nav-btn"
              onClick={() => goTemplates()}
              aria-label="Sfoglia i modelli"
            >
              <Sparkles size={18} strokeWidth={2.1} />
              <span>Modelli</span>
            </button>
            {user ? (
              <button
                type="button"
                className="ml-nav-btn ml-nav-btn--primary"
                onClick={() => navigate("/dashboard")}
                aria-busy={authLoading || undefined}
                aria-label="I tuoi eventi"
              >
                <CalendarDays size={18} strokeWidth={2.1} />
                <span>I tuoi eventi</span>
              </button>
            ) : (
              <button
                type="button"
                className="ml-nav-btn ml-nav-btn--primary"
                onClick={() => setAuthModal("login")}
                aria-busy={authLoading || undefined}
                aria-label="Entra o crea un account"
              >
                <UserPlus size={18} strokeWidth={2.1} />
                <span>Entra</span>
              </button>
            )}
          </div>
        </div>
      </nav>

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
              Lo crei in pochi minuti, lo paghi una volta sola.
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
              <Button
                variant="outline"
                className="ml-hero__secondary"
                onClick={() => goTemplates()}
              >
                Vedi i modelli
              </Button>
            </motion.div>

            <ul className="ml-hero__trust" aria-label="Punti di fiducia">
              <li><Check size={14} strokeWidth={2.6} /> 49 € una tantum</li>
              <li><Check size={14} strokeWidth={2.6} /> Senza canone</li>
              <li><Check size={14} strokeWidth={2.6} /> Senza pubblicità</li>
            </ul>
          </div>

          <div className="ml-hero__visual" aria-hidden>
            <ProductLoop />
          </div>
        </div>
      </header>

      {/* HOW IT WORKS */}
      <section className="ml-section ml-how" aria-labelledby="how-title">
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
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: t(0.45), delay: t(i * 0.08), ease }}
            >
              <span className="ml-how__ic" aria-hidden><Icon size={22} strokeWidth={2.1} /></span>
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
          <p className="ml-h2__sub">Sei cose, fatte bene. Niente moduli da pagare a parte.</p>
        </header>
        <div className="ml-features__grid">
          {FEATURES.map(({ icon: Icon, h, p }, i) => (
            <motion.article
              key={h}
              className="ml-features__cell"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: t(0.4), delay: t((i % 3) * 0.06), ease }}
            >
              <span className="ml-features__ic" aria-hidden><Icon size={20} strokeWidth={2.1} /></span>
              <h3 className="ml-features__h">{h}</h3>
              <p className="ml-features__p">{p}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* VALUE STATEMENT (replaces compare table) */}
      <section className="ml-section ml-value" aria-labelledby="value-title">
        <div className="ml-value__card">
          <span className="ml-eyebrow ml-eyebrow--alt">Perché eenvee</span>
          <h2 id="value-title" className="ml-value__h">
            Più cose, <em>meno della metà</em> del prezzo.
          </h2>
          <p className="ml-value__p">
            Niente abbonamenti, niente crediti per invito, niente pubblicità sugli invitati.
            Una piccola spesa, una sola volta.
          </p>
        </div>
      </section>

      {/* CATALOG / OCCASIONS */}
      <section className="ml-section ml-catalog" aria-labelledby="cat-title">
        <header className="ml-section__head">
          <span className="ml-eyebrow ml-eyebrow--alt">Da dove parto</span>
          <h2 id="cat-title" className="ml-h2">Per quale occasione lo crei?</h2>
          <p className="ml-h2__sub">Scegli un design pronto. Cambi tutto come ti piace.</p>
        </header>
        <div className="ml-catalog__grid">
          {MARKETING_CATEGORIES.map((item, i) => (
            <motion.button
              type="button"
              key={item.name}
              className="ml-cat-card"
              onClick={() => goTemplates(item.name)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: t(0.42), delay: t(i * 0.05), ease }}
            >
              <div className="ml-cat-card__img-wrap">
                <img src={item.image} alt="" className="ml-cat-card__img" loading="lazy" />
                <div className="ml-cat-card__shade" aria-hidden />
              </div>
              <div className="ml-cat-card__body">
                <h3 className="ml-cat-card__h">{item.name}</h3>
                <p className="ml-cat-card__p">{item.blurb}</p>
                <span className="ml-cat-card__go">
                  Vedi i modelli <ArrowRight size={14} strokeWidth={2.4} />
                </span>
              </div>
            </motion.button>
          ))}
        </div>
        <div className="ml-catalog__cta">
          <Button variant="outline" className="ml-ghost-btn" onClick={() => goTemplates()}>
            Apri il catalogo completo
          </Button>
        </div>
      </section>

      {/* FINAL CTA / PRICING */}
      <section className="ml-section ml-final" aria-labelledby="price-title">
        <div className="ml-final__inner">
          <span className="ml-eyebrow ml-eyebrow--alt">Prezzo</span>
          <h2 id="price-title" className="ml-final__price">
            <span className="ml-final__amount">49&nbsp;€</span>
            <span className="ml-final__suffix">una tantum, per evento</span>
          </h2>
          <p className="ml-final__p">
            Una sola spesa, una sola volta. Niente abbonamenti, niente sorprese.
          </p>
          <ul className="ml-final__inc" aria-label="Cosa è incluso">
            <li><Globe2 size={14} strokeWidth={2.4} /> Pagina dell’evento</li>
            <li><ListChecks size={14} strokeWidth={2.4} /> Conferme illimitate</li>
            <li><MapPin size={14} strokeWidth={2.4} /> Mappa e indicazioni</li>
            <li><Gift size={14} strokeWidth={2.4} /> Lista regali</li>
            <li><ShieldOff size={14} strokeWidth={2.4} /> Senza pubblicità</li>
          </ul>
          <Button className="ml-final__btn" onClick={goPrimary}>
            <CreditCard size={18} />
            {user ? "Vai ai tuoi eventi" : "Inizia adesso"}
          </Button>
          <p className="ml-final__note">Pagamento sicuro · 49&nbsp;€ una sola volta · niente canone.</p>
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

      {authModal && (
        <div
          className="ml-auth-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAuthModal();
          }}
        >
          <div className="ml-auth-modal">
            <button
              type="button"
              className="ml-auth-modal__close"
              onClick={closeAuthModal}
              aria-label="Chiudi"
            >
              <IconX size={18} strokeWidth={2.4} />
            </button>
            <header className="ml-auth-modal__head">
              <h2 id="auth-modal-title" className="ml-auth-modal__title">
                {authModal === "login" ? "Bentornato" : "Crea il tuo account"}
              </h2>
              <p className="ml-auth-modal__sub">
                {authModal === "login"
                  ? "Entra per gestire i tuoi eventi."
                  : "Bastano email e password per cominciare."}
              </p>
            </header>
            <AuthForm initialMode={authModal} onAuthSuccess={onAuthSuccess} />
          </div>
        </div>
      )}
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
          <strong>49&nbsp;€</strong>
          <span>tutto incluso</span>
        </div>
      </div>
    </div>
  );
}
