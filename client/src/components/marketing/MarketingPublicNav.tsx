import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, NavLink, Link, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  UserPlus,
  X as IconX,
  Search,
  ArrowRight,
  ChevronDown,
  LayoutGrid,
  Heart,
  PartyPopper,
  Briefcase,
  Baby,
  Upload,
  Sparkles,
  Cake,
  GraduationCap,
  Gift,
  BookOpen,
  Star,
  type LucideIcon,
} from "lucide-react";
import AuthForm from "../ui/AuthForm";
import {
  MARKETING_DISCOVER_LABEL,
  MARKETING_DISCOVER_TO,
  isMarketingDiscoverActive,
} from "../../config/marketingDiscover";
import { BROWSE_CATEGORY_NAMES } from "../../config/marketingCatalog";
import { templatesPathForCategory } from "../../config/templateCategoryRoutes";
import type { TEMPLATE_CATEGORIES } from "../../utils/layoutSchema";

export type MarketingSession = {
  user: boolean | null;
  authLoading: boolean;
  authModal: null | "login" | "register";
  setAuthModal: React.Dispatch<React.SetStateAction<null | "login" | "register">>;
  closeAuthModal: () => void;
  onAuthSuccess: () => void;
};

type Props = MarketingSession;

const UPLOAD_NAV: { name: (typeof TEMPLATE_CATEGORIES)[number]; label: string } = {
  name: "Il tuo file",
  label: "Carica",
};

const MEGA_CATEGORY_ICON: Record<(typeof BROWSE_CATEGORY_NAMES)[number], LucideIcon> = {
  Matrimonio: Heart,
  "Serate e party": PartyPopper,
  Business: Briefcase,
  "Battesimo & Nascite": Baby,
  "Compleanni Adulti": Cake,
  "Compleanni Bambini": Sparkles,
  Cresime: BookOpen,
  Comunioni: Star,
  Lauree: GraduationCap,
  "Baby Shower": Gift,
};

function MegaIconRow({ Icon, children }: { Icon: LucideIcon; children: React.ReactNode }) {
  const Ic = Icon;
  return (
    <span className="ml-nav-mega__row">
      <Ic className="ml-nav-mega__ic" size={18} strokeWidth={2.05} aria-hidden />
      <span className="ml-nav-mega__text">{children}</span>
    </span>
  );
}

function MegaCatalogGrid({ onNavigate }: { onNavigate?: () => void }) {
  const megaCls = (isActive: boolean) =>
    `ml-nav-mega__link${isActive ? " ml-nav-mega__link--active" : ""}`;

  return (
    <>
      <NavLink
        to="/templates"
        end
        className={({ isActive }) => `${megaCls(isActive)} ml-nav-mega__link--featured`}
        onClick={onNavigate}
      >
        <MegaIconRow Icon={LayoutGrid}>
          <span className="ml-nav-mega__link-title">Catalogo</span>
          <span className="ml-nav-mega__link-desc">Tutti i modelli</span>
        </MegaIconRow>
      </NavLink>
      {BROWSE_CATEGORY_NAMES.map((name) => {
        const CatIcon = MEGA_CATEGORY_ICON[name];
        return (
          <NavLink
            key={name}
            to={templatesPathForCategory(name)}
            className={({ isActive }) => megaCls(isActive)}
            onClick={onNavigate}
          >
            <MegaIconRow Icon={CatIcon}>
              <span className="ml-nav-mega__link-title">{name}</span>
            </MegaIconRow>
          </NavLink>
        );
      })}
      <NavLink
        to={templatesPathForCategory(UPLOAD_NAV.name)}
        className={({ isActive }) => `${megaCls(isActive)} ml-nav-mega__link--upload`}
        onClick={onNavigate}
      >
        <MegaIconRow Icon={Upload}>
          <span className="ml-nav-mega__link-title">{UPLOAD_NAV.label}</span>
          <span className="ml-nav-mega__link-desc">Parti dal tuo file</span>
        </MegaIconRow>
      </NavLink>
    </>
  );
}

export function MarketingPublicNav({
  user,
  authLoading,
  authModal,
  setAuthModal,
  closeAuthModal,
  onAuthSuccess,
}: Props) {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const [searchParams] = useSearchParams();
  const [searchDraft, setSearchDraft] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [desktopCatalogOpen, setDesktopCatalogOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const searchDockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname.startsWith("/templates")) {
      setSearchDraft(searchParams.get("q") ?? "");
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    setMobileSearchOpen(false);
    setDesktopCatalogOpen(false);
    setDesktopSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileSearchOpen && !desktopCatalogOpen && !desktopSearchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileSearchOpen(false);
        setDesktopCatalogOpen(false);
        setDesktopSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileSearchOpen, desktopCatalogOpen, desktopSearchOpen]);

  useEffect(() => {
    if (!desktopCatalogOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = megaRef.current;
      if (el && !el.contains(e.target as Node)) {
        setDesktopCatalogOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [desktopCatalogOpen]);

  useEffect(() => {
    if (!desktopSearchOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = searchDockRef.current;
      if (el && !el.contains(e.target as Node)) {
        setDesktopSearchOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [desktopSearchOpen]);

  useEffect(() => {
    if (mobileSearchOpen) {
      const t = window.setTimeout(() => mobileInputRef.current?.focus(), 80);
      return () => window.clearTimeout(t);
    }
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (authModal) {
      setMobileSearchOpen(false);
      setDesktopCatalogOpen(false);
      setDesktopSearchOpen(false);
    }
  }, [authModal]);

  useEffect(() => {
    if (!desktopSearchOpen) return;
    const t = window.setTimeout(() => desktopInputRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [desktopSearchOpen]);

  const runSearch = () => {
    const q = searchDraft.trim();
    if (!pathname.startsWith("/templates")) {
      navigate(q ? `/templates?q=${encodeURIComponent(q)}` : "/templates");
      return;
    }
    const base = pathname;
    if (!q) {
      navigate(base, { replace: true });
      return;
    }
    navigate(`${base}?q=${encodeURIComponent(q)}`, { replace: true });
  };

  const submitSearchDesktop = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch();
    setDesktopSearchOpen(false);
  };

  const submitSearchMobile = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch();
    setMobileSearchOpen(false);
  };

  const openDesktopCatalog = () => {
    setDesktopSearchOpen(false);
    setDesktopCatalogOpen((o) => !o);
  };

  return (
    <>
      <nav className="ml-nav" aria-label="Principale">
        {desktopCatalogOpen ? (
          <button
            type="button"
            className="ml-nav__mega-backdrop"
            aria-label="Chiudi catalogo"
            onClick={() => setDesktopCatalogOpen(false)}
          />
        ) : null}
        <div className="ml-nav__inner ml-nav__inner--stack">
          <div className="ml-nav__row ml-nav__row--top">
            <div className="ml-nav__lead">
              <div className="ml-nav__brand">
                <button
                  type="button"
                  className="ml-logo"
                  onClick={() => navigate("/")}
                  aria-label="eenvee — torna alla home"
                >
                  <img src="/logo-eenvee.svg" alt="eenvee" />
                </button>
              </div>
            </div>

            <div className="ml-nav__bundle ml-nav__bundle--pre">
              <div className="ml-nav__mega" ref={megaRef}>
                <button
                  type="button"
                  className="ml-nav__mega-trigger ml-nav__mob-tile"
                  aria-expanded={desktopCatalogOpen}
                  aria-haspopup="true"
                  aria-controls="ml-nav-mega-panel"
                  id="ml-nav-mega-button"
                  onClick={openDesktopCatalog}
                >
                  <span className="ml-nav__tile ml-nav__tile--mega-m">
                    <span className="ml-nav__ic-slot" aria-hidden>
                      <LayoutGrid size={20} strokeWidth={2.1} />
                    </span>
                    <span className="ml-nav__tile-lbl">Catalogo</span>
                  </span>
                  <span className="ml-nav__mega-trigger__inline">
                    <span className="ml-nav__mega-trigger__inline-lbl">Catalogo</span>
                    <ChevronDown
                      size={16}
                      strokeWidth={2.2}
                      className={`ml-nav__mega-chevron${desktopCatalogOpen ? " ml-nav__mega-chevron--open" : ""}`}
                      aria-hidden
                    />
                  </span>
                </button>
                {desktopCatalogOpen ? (
                  <div
                    id="ml-nav-mega-panel"
                    className="ml-nav__mega-panel"
                    aria-labelledby="ml-nav-mega-button"
                  >
                    <nav className="ml-nav__mega-grid" aria-label="Voci catalogo">
                      <MegaCatalogGrid onNavigate={() => setDesktopCatalogOpen(false)} />
                    </nav>
                  </div>
                ) : null}
              </div>
              <Link
                to={MARKETING_DISCOVER_TO}
                className={`ml-nav__desk-link${isMarketingDiscoverActive(pathname, hash) ? " ml-nav__desk-link--here" : ""}`}
                onClick={() => {
                  setDesktopCatalogOpen(false);
                  setDesktopSearchOpen(false);
                }}
                aria-label="Scopri come funziona eenvee, cosa c’è nell’invito per te e i tuoi ospiti, e perché conviene usare eenvee"
              >
                {MARKETING_DISCOVER_LABEL}
              </Link>
              <Link
                to={MARKETING_DISCOVER_TO}
                className={`ml-nav__pillar ml-nav__pillar--discover ml-nav__mob-tile${isMarketingDiscoverActive(pathname, hash) ? " ml-nav__pillar--discover-here" : ""}`}
                onClick={() => {
                  setDesktopCatalogOpen(false);
                  setDesktopSearchOpen(false);
                  setMobileSearchOpen(false);
                }}
                aria-label="Scopri come funziona eenvee, cosa c’è nell’invito per te e i tuoi ospiti, e perché conviene usare eenvee"
              >
                <span className="ml-nav__tile">
                  <span className="ml-nav__ic-slot" aria-hidden>
                    <Sparkles size={20} strokeWidth={2.1} />
                  </span>
                  <span className="ml-nav__tile-lbl">{MARKETING_DISCOVER_LABEL}</span>
                </span>
              </Link>
            </div>

            <div className="ml-nav__bundle ml-nav__bundle--post">
              <div className="ml-nav__actions">
                {user ? (
                  <button
                    type="button"
                    className="ml-nav-btn ml-nav-btn--primary ml-nav-btn--nav-pillar ml-nav__mob-tile"
                    onClick={() => navigate("/dashboard")}
                    aria-busy={authLoading || undefined}
                    aria-label="I tuoi eventi"
                  >
                    <span className="ml-nav__tile">
                      <span className="ml-nav__ic-slot" aria-hidden>
                        <CalendarDays size={20} strokeWidth={2.1} />
                      </span>
                      <span className="ml-nav__tile-lbl">I tuoi eventi</span>
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ml-nav-btn ml-nav-btn--primary ml-nav-btn--nav-pillar ml-nav__mob-tile"
                    onClick={() => setAuthModal("login")}
                    aria-busy={authLoading || undefined}
                    aria-label="Entra o crea un account"
                  >
                    <span className="ml-nav__tile">
                      <span className="ml-nav__ic-slot" aria-hidden>
                        <UserPlus size={20} strokeWidth={2.1} />
                      </span>
                      <span className="ml-nav__tile-lbl">Entra</span>
                    </span>
                  </button>
                )}
              </div>
              <button
                type="button"
                className={`ml-nav__pillar ml-nav__pillar--search ml-nav__mob-tile${mobileSearchOpen ? " ml-nav__pillar--search-open" : ""}`}
                onClick={() => {
                  setDesktopCatalogOpen(false);
                  setDesktopSearchOpen(false);
                  setMobileSearchOpen((o) => !o);
                }}
                aria-expanded={mobileSearchOpen}
                aria-controls="ml-nav-search-panel"
                aria-label={mobileSearchOpen ? "Chiudi ricerca" : "Cerca modelli nel catalogo"}
              >
                <span className="ml-nav__tile">
                  <span className="ml-nav__ic-slot" aria-hidden>
                    {mobileSearchOpen ? (
                      <IconX size={20} strokeWidth={2.1} />
                    ) : (
                      <Search size={20} strokeWidth={2.1} />
                    )}
                  </span>
                  <span className="ml-nav__tile-lbl">{mobileSearchOpen ? "Chiudi" : "Cerca"}</span>
                </span>
              </button>
              <div className="ml-nav__search-dock" ref={searchDockRef}>
                {desktopSearchOpen ? (
                  <form
                    className="ml-nav__search ml-nav__search--desktop-open"
                    role="search"
                    onSubmit={submitSearchDesktop}
                    id="ml-nav-search-expand"
                  >
                    <label htmlFor="ml-nav-search-d" className="visually-hidden">
                      Cerca modelli nel catalogo
                    </label>
                    <Search size={16} strokeWidth={2.1} className="ml-nav__search-icon" aria-hidden />
                    <input
                      ref={desktopInputRef}
                      id="ml-nav-search-d"
                      type="search"
                      className="ml-nav__search-input"
                      placeholder="Cerca"
                      value={searchDraft}
                      onChange={(e) => setSearchDraft(e.target.value)}
                      enterKeyHint="search"
                      autoComplete="off"
                    />
                    <button type="submit" className="ml-nav__search-submit" aria-label="Cerca">
                      <ArrowRight size={16} strokeWidth={2.4} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="ml-nav__search-dismiss"
                      onClick={() => setDesktopSearchOpen(false)}
                      aria-label="Chiudi ricerca"
                    >
                      <IconX size={15} strokeWidth={2.2} />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    className="ml-nav__search-toggle-d"
                    onClick={() => {
                      setDesktopCatalogOpen(false);
                      setDesktopSearchOpen(true);
                    }}
                    aria-expanded={desktopSearchOpen}
                    aria-controls="ml-nav-search-expand"
                    aria-label="Apri ricerca modelli"
                  >
                    <Search size={18} strokeWidth={2.1} aria-hidden />
                  </button>
                )}
              </div>
            </div>
          </div>

          {mobileSearchOpen ? (
            <div id="ml-nav-search-panel" className="ml-nav__search-panel">
              <form className="ml-nav__search-panel-form" role="search" onSubmit={submitSearchMobile}>
                <label htmlFor="ml-nav-search-m" className="visually-hidden">
                  Cerca modelli nel catalogo
                </label>
                <input
                  ref={mobileInputRef}
                  id="ml-nav-search-m"
                  type="search"
                  className="ml-nav__search-panel-input"
                  placeholder="Cerca"
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  enterKeyHint="search"
                  autoComplete="off"
                />
                <button type="submit" className="ml-nav__search-panel-submit">
                  Cerca
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </nav>

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
    </>
  );
}
