import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams, useParams, useLocation } from "react-router-dom";
import { 
  Search, 
  ChevronRight, 
  SlidersHorizontal, 
  ChevronDown, 
  Upload,
  Heart,
  PartyPopper,
  Briefcase,
  Baby,
  Cake,
  Sparkles,
  BookOpen,
  Star,
  GraduationCap,
  Gift,
  LayoutGrid
} from "lucide-react";
import {
  PREBUILT_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type PrebuiltTemplate,
} from "../../utils/layoutSchema";
import CanvasPreview from "../../components/canvas/CanvasPreview";
import { API_BASE } from "../../config/api";
import { MarketingPublicNav } from "../../components/marketing/MarketingPublicNav";
import { useMarketingSession } from "../../components/marketing/useMarketingSession";
import TemplateCatalogPreviewModal from "./TemplateCatalogPreviewModal";
import {
  matchesTone,
  type ToneFilter,
  UPLOAD_CUSTOM_TEMPLATE_ID,
  type InviteUploadFormat,
} from "./templateCatalogUtils";
import {
  TEMPLATE_CATEGORY_SLUG_REDIRECT,
  categoryNameFromSlug,
  slugFromCategoryName,
  templatesPathForCategory,
} from "../../config/templateCategoryRoutes";
import "../Marketing/MarketingLanding.css";
import "./TemplateCatalog.css";

export default function TemplateCatalog() {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [tone, setTone] = useState<ToneFilter>("all");
  const [preview, setPreview] = useState<PrebuiltTemplate | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const marketingSession = useMarketingSession();

  const categoryFromPath = useMemo(
    () => (categorySlug ? categoryNameFromSlug(categorySlug) : null),
    [categorySlug],
  );

  useEffect(() => {
    if (!categorySlug) return;
    const to = TEMPLATE_CATEGORY_SLUG_REDIRECT[categorySlug];
    if (!to) return;
    const q = searchParams.toString();
    navigate(`/templates/${to}${q ? `?${q}` : ""}`, { replace: true });
  }, [categorySlug, navigate, searchParams]);

  const legacyName = !categorySlug ? searchParams.get("category") : null;
  const activeCategory: "Tutti" | (typeof TEMPLATE_CATEGORIES)[number] =
    categoryFromPath ??
    (legacyName && (TEMPLATE_CATEGORIES as readonly string[]).includes(legacyName)
      ? (legacyName as (typeof TEMPLATE_CATEGORIES)[number])
      : "Tutti");

  useEffect(() => {
    if (!categorySlug) return;
    if (TEMPLATE_CATEGORY_SLUG_REDIRECT[categorySlug]) return;
    if (!categoryFromPath) {
      navigate("/templates", { replace: true });
    }
  }, [categorySlug, categoryFromPath, navigate]);

  useEffect(() => {
    if (categorySlug) return;
    const legacy = searchParams.get("category");
    if (!legacy) return;
    const slug = slugFromCategoryName(legacy);
    if (!slug) return;
    const q = searchParams.get("q");
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    navigate(`/templates/${slug}${qs.toString() ? `?${qs}` : ""}`, { replace: true });
  }, [categorySlug, searchParams, navigate]);

  const applyCategory = (cat: "Tutti" | (typeof TEMPLATE_CATEGORIES)[number]) => {
    const q = searchParams.get("q");
    const tail = q ? `?q=${encodeURIComponent(q)}` : "";
    if (cat === "Tutti") {
      navigate(`/templates${tail}`);
      return;
    }
    navigate(`${templatesPathForCategory(cat)}${tail}`);
  };

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    const uploadTemplate = PREBUILT_TEMPLATES.find((t) => t.id === UPLOAD_CUSTOM_TEMPLATE_ID);
    
    const others = PREBUILT_TEMPLATES.filter((t) => {
      if (t.id === UPLOAD_CUSTOM_TEMPLATE_ID) return false;
      if (activeCategory !== "Tutti" && t.category !== activeCategory) return false;
      if (!matchesTone(t, tone)) return false;
      if (!q) return true;
      const blob = `${t.name} ${t.category} ${t.id}`.toLowerCase();
      return blob.includes(q);
    });

    return uploadTemplate ? [uploadTemplate, ...others] : others;
  }, [activeCategory, query, tone]);

  const sidebarCategories = useMemo(() => {
    return TEMPLATE_CATEGORIES.filter(c => c !== "Il tuo file");
  }, []);

  const handleSelectTemplate = async (templateId: string, inviteFormat?: InviteUploadFormat) => {
    setPreview(null);
    const qs = new URLSearchParams();
    qs.set("templateId", templateId);
    if (templateId === UPLOAD_CUSTOM_TEMPLATE_ID && inviteFormat) {
      qs.set("format", inviteFormat);
    }
    const qstr = qs.toString();
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
      const data = res.ok ? await res.json() : null;
      if (data && data.user) {
        navigate(`/new?${qstr}`);
      } else {
        navigate(`/edit/demo?${qstr}`);
      }
    } catch {
      navigate(`/edit/demo?${qstr}`);
    }
  };

  return (
    <div className="ml-page">
      <MarketingPublicNav {...marketingSession} />

      <main className="ml-section tc-templates">
        <header className="ml-section__head">
          <div className="tc-header">
            <span className="tc-header__tag">Catalogo</span>
            <h1 className="tc-header__title">Scegli il tuo design di partenza</h1>
            <p className="tc-header__subtitle">
              Scegli un modello o carica un file. Nell'editor potrai personalizzare testi, colori e dettagli per renderlo unico.
            </p>
          </div>
        </header>

        <div className="tc-container">
          <div className="tc-top-controls">
            <button 
              type="button" 
              className={`tc-filter-trigger ${isFilterOpen ? 'tc-filter-trigger--active' : ''}`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <SlidersHorizontal size={18} />
              <span>Filtri</span>
              <ChevronDown size={18} className={`tc-filter-trigger__chevron ${isFilterOpen ? 'tc-filter-trigger__chevron--open' : ''}`} />
            </button>

            <div className="tc-search-compact">
              <Search size={18} className="tc-search-compact__icon" />
              <input
                type="text"
                className="tc-search-compact__input"
                placeholder="Cerca modelli..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  const sp = new URLSearchParams(searchParams);
                  if (e.target.value) sp.set("q", e.target.value);
                  else sp.delete("q");
                  navigate(`${location.pathname}?${sp.toString()}`, { replace: true });
                }}
              />
            </div>
          </div>

          {isFilterOpen && (
            <div className="tc-filter-flyout">
              <div className="tc-filter-flyout__content">
                {/* Hero / All Models */}
                <button
                  type="button"
                  className={`tc-filter-hero ${activeCategory === "Tutti" ? "tc-filter-hero--active" : ""}`}
                  onClick={() => {
                    applyCategory("Tutti");
                    setIsFilterOpen(false);
                  }}
                >
                  <div className="tc-filter-hero__icon">
                    <LayoutGrid size={24} />
                  </div>
                  <div className="tc-filter-hero__text">
                    <span className="tc-filter-hero__title">Tutti i modelli</span>
                    <span className="tc-filter-hero__sub">Esplora l'intero catalogo</span>
                  </div>
                </button>

                <div className="tc-filter-grid">
                  {[
                    { id: 'Matrimonio', icon: Heart },
                    { id: 'Serate e party', icon: PartyPopper },
                    { id: 'Business', icon: Briefcase },
                    { id: 'Battesimo & Nascite', icon: Baby },
                    { id: 'Compleanni Adulti', icon: Cake },
                    { id: 'Compleanni Bambini', icon: Sparkles },
                    { id: 'Cresime', icon: BookOpen },
                    { id: 'Comunioni', icon: Star },
                    { id: 'Lauree', icon: GraduationCap },
                    { id: 'Baby Shower', icon: Gift },
                  ].map(({ id, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      className={`tc-filter-item ${activeCategory === id ? "tc-filter-item--active" : ""}`}
                      onClick={() => {
                        applyCategory(id);
                        setIsFilterOpen(false);
                      }}
                    >
                      <Icon size={18} className="tc-filter-item__icon" />
                      <span className="tc-filter-item__label">{id}</span>
                    </button>
                  ))}
                </div>

                <div className="tc-filter-tones">
                  <h4 className="tc-filter-tones__title">TONALITÀ PREVALENTI</h4>
                  <div className="tc-tone-pills">
                    {(
                      [
                        ["all", "Tutte", "tc-tone-gradient"],
                        ["light", "Chiari", "tc-tone-light"],
                        ["mid", "Neutri", "tc-tone-mid"],
                        ["dark", "Scuri", "tc-tone-dark"],
                      ] as const
                    ).map(([id, label, toneClass]) => (
                      <button
                        key={id}
                        type="button"
                        className={`tc-tone-pill ${tone === id ? "tc-tone-pill--active" : ""}`}
                        onClick={() => setTone(id)}
                      >
                        <span className={`tc-tone-indicator ${toneClass}`} />
                        <span className="tc-tone-pill__label">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="tc-grid-wrap">
            {filteredTemplates.length === 0 ? (
              <div className="tc-empty">
                <p>Nessun modello con questi filtri. Prova a cambiare ricerca o tonalità.</p>
              </div>
            ) : (
              <div className="tc-grid">
                {filteredTemplates.map((template) => (
                  <article key={template.id} className="tc-card">
                    <button
                      type="button"
                      className={`tc-card__thumb ${template.id === UPLOAD_CUSTOM_TEMPLATE_ID ? "tc-card__thumb--upload" : ""}`}
                      onClick={() => setPreview(template)}
                      aria-label={`Anteprima modello ${template.name}`}
                    >
                      {template.id === UPLOAD_CUSTOM_TEMPLATE_ID ? (
                        <div className="tc-upload-placeholder">
                          <div className="tc-upload-placeholder__icon">
                            <Upload size={32} />
                          </div>
                          <div className="tc-upload-placeholder__formats">
                            <span className="tc-format-icon tc-format-icon--v" />
                            <span className="tc-format-icon tc-format-icon--s" />
                            <span className="tc-format-icon tc-format-icon--h" />
                          </div>
                          <span className="tc-upload-placeholder__label">
                            Crea da un file
                          </span>
                        </div>
                      ) : (
                        <CanvasPreview
                          catalogThumb
                          canvas={template.canvas as never}
                          layers={template.layers as never}
                        />
                      )}
                      <span className="tc-card__overlay" aria-hidden="true">
                        <span className="tc-card__cta">
                          {template.id === UPLOAD_CUSTOM_TEMPLATE_ID ? "Configura" : "Anteprima"}
                        </span>
                      </span>
                    </button>
                    <div className="tc-card__body">
                      <h3 className="tc-card__title">{template.name}</h3>
                      <span className="tc-card__cat">{template.category}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="ml-footer">
        <span>eenvee © {new Date().getFullYear()}</span>
        <div className="ml-footer__links">
          <Link to="/">Home</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/termini">Termini</Link>
          <Link to="/cookie">Cookie</Link>
        </div>
      </footer>

      <TemplateCatalogPreviewModal
        template={preview}
        onClose={() => setPreview(null)}
        onContinue={(id, fmt) => {
          setPreview(null);
          void handleSelectTemplate(id, fmt);
        }}
      />
    </div>
  );
}
