import React, { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { PREBUILT_TEMPLATES } from "../../utils/layoutSchema";
import {
  formatItalianDateAsYouType,
  isoToItalianDisplay,
  italianDisplayToIso,
} from "../../utils/italianDateInput";
import { Surface, Button } from "../../ui";
import { CheckCircle2, ArrowRight, Calendar } from "lucide-react";
import CanvasPreview from "../../components/canvas/CanvasPreview";
import ItalianDatePicker from "../../components/datepicker/ItalianDatePicker";
import InviteFormatPicker from "../PublicView/InviteFormatPicker";
import {
  UPLOAD_CUSTOM_TEMPLATE_ID,
  applyUploadFormatToTemplate,
  parseInviteFormat,
  type InviteUploadFormat,
} from "../PublicView/templateCatalogUtils";
import "./NewEvent.css";

export default function NewEvent() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const templateFromUrl = searchParams.get("templateId");
  const formatFromUrl = parseInviteFormat(searchParams.get("format"));
  const uploadFormatResolved: InviteUploadFormat = formatFromUrl ?? "square";

  const basePreselected =
    templateFromUrl && PREBUILT_TEMPLATES.some((t) => t.id === templateFromUrl)
      ? PREBUILT_TEMPLATES.find((t) => t.id === templateFromUrl) ?? null
      : null;

  const preselectedTemplate = useMemo(() => {
    if (!basePreselected) return null;
    if (basePreselected.id !== UPLOAD_CUSTOM_TEMPLATE_ID) return basePreselected;
    return applyUploadFormatToTemplate(basePreselected, uploadFormatResolved);
  }, [basePreselected, uploadFormatResolved]);

  const [title, setTitle] = useState("");
  const [dateDisplay, setDateDisplay] = useState("");
  const [dateTBD, setDateTBD] = useState(false);
  /** Null = nessuna grafica selezionata (obbligo di clic esplicito). */
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
    templateFromUrl && PREBUILT_TEMPLATES.some((t) => t.id === templateFromUrl) ? templateFromUrl : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerAnchorRef = useRef<HTMLDivElement>(null);

  const setUploadFormatInUrl = (f: InviteUploadFormat) => {
    if (selectedTemplate !== UPLOAD_CUSTOM_TEMPLATE_ID && templateFromUrl !== UPLOAD_CUSTOM_TEMPLATE_ID) return;
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev);
        n.set("templateId", UPLOAD_CUSTOM_TEMPLATE_ID);
        n.set("format", f);
        return n;
      },
      { replace: true }
    );
  };

  const canSubmit = useMemo(() => {
    const titleOk = title.trim().length >= 2;
    const dateOk = dateTBD || italianDisplayToIso(dateDisplay.trim()) !== null;
    const templateOk = selectedTemplate !== null && selectedTemplate.length > 0;
    return titleOk && dateOk && templateOk;
  }, [title, dateDisplay, dateTBD, selectedTemplate]);

  const currentIso = italianDisplayToIso(dateDisplay.trim()) ?? "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!canSubmit || !selectedTemplate) {
      setError("Compila tutti i campi obbligatori e scegli una grafica.");
      return;
    }

    const trimmedTitle = title.trim();
    let dateIso: string | null = null;
    if (!dateTBD) {
      const iso = italianDisplayToIso(dateDisplay.trim());
      if (!iso) {
        setError("Data non valida. Usa il formato gg/mm/aaaa (es. 15/06/2026).");
        return;
      }
      dateIso = new Date(iso + "T12:00:00").toISOString();
    }

    setLoading(true);

    try {
      const raw = PREBUILT_TEMPLATES.find((t) => t.id === selectedTemplate);
      if (!raw) throw new Error("Template non trovato");
      const template =
        raw.id === UPLOAD_CUSTOM_TEMPLATE_ID
          ? applyUploadFormatToTemplate(raw, parseInviteFormat(searchParams.get("format")) ?? "square")
          : raw;

      const res = await apiFetch(`/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          date: dateTBD ? null : dateIso,
          dateTBD,
          templateId: template.id,
          layers: template.layers || [],
          canvas: template.canvas || { bgImage: null, width: 800, height: 1000 },
          blocks: template.blocks || [],
          theme: template.theme,
          plan: "free",
          status: "draft",
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg = typeof errBody?.message === "string" ? errBody.message : "Errore creazione evento";
        throw new Error(msg);
      }

      const createdItem = await res.json();
      navigate(`/activate/${createdItem.slug}`);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Non siamo riusciti a creare l'evento. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const isUploadFlow =
    preselectedTemplate?.id === UPLOAD_CUSTOM_TEMPLATE_ID || selectedTemplate === UPLOAD_CUSTOM_TEMPLATE_ID;

  return (
    <div className="new-event-page" lang="it">
      <div className="new-event-shell">
        <nav className="new-event-nav">
          <Button variant="ghost" type="button" onClick={() => navigate("/dashboard")}>
            ← Torna alla dashboard
          </Button>
        </nav>

        <form onSubmit={handleSubmit} className="new-event-form" noValidate>
          <Surface variant="glass" className="new-event-card new-event-card--form">
            <div className="new-event-card__top">
              <div className="new-event-card__intro">
                <span className="new-event-card__eyebrow">Nuovo evento</span>
                <h1 className="new-event-card__title">Dettagli</h1>
                <p className="new-event-card__lede">
                  {preselectedTemplate ? (
                    <>
                      Aggiungi <strong>nome e data</strong> dell’evento. Puoi modificarli anche dopo.
                      {" "}
                      Per un altro modello usa il pulsante nel riquadro sotto.
                    </>
                  ) : (
                    <>Nome e data dell’evento. Potrai modificarli anche in seguito dall’editor.</>
                  )}
                </p>
              </div>
              <Button
                type="submit"
                disabled={loading || !canSubmit}
                className="new-event-submit-top"
              >
                {loading ? "Creazione…" : "Continua"}
                {!loading ? <ArrowRight size={18} style={{ marginLeft: 8 }} aria-hidden /> : null}
              </Button>
            </div>

            <div className="new-event-fields">
              <label className="new-event-field">
                <span className="new-event-field__label">Titolo evento</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Es. Matrimonio Marco & Sara"
                  autoComplete="off"
                  className="new-event-input"
                  aria-invalid={!!error && title.trim().length < 2}
                />
              </label>

              <div className="new-event-field">
                <span className="new-event-field__label">Data</span>
                <div className="new-event-date-row">
                  <div className="new-event-date-input-wrap" ref={pickerAnchorRef}>
                    <input
                      type="text"
                      value={dateDisplay}
                      onChange={(e) => setDateDisplay(formatItalianDateAsYouType(e.target.value))}
                      placeholder="gg/mm/aaaa"
                      disabled={dateTBD}
                      className="new-event-input new-event-input--date"
                      autoComplete="off"
                      inputMode="numeric"
                      aria-label="Data evento gg/mm/aaaa"
                    />
                    <button
                      type="button"
                      className="new-event-date-calendar-btn"
                      onClick={() => setPickerOpen((v) => !v)}
                      disabled={dateTBD}
                      aria-label="Apri calendario"
                      aria-expanded={pickerOpen}
                      title="Apri calendario"
                    >
                      <Calendar size={18} aria-hidden />
                    </button>
                    {pickerOpen && !dateTBD ? (
                      <ItalianDatePicker
                        valueIso={currentIso}
                        minIso="1900-01-01"
                        maxIso="2100-12-31"
                        anchorRef={pickerAnchorRef}
                        onSelect={(iso) => {
                          setDateDisplay(iso ? isoToItalianDisplay(iso) : "");
                        }}
                        onClose={() => setPickerOpen(false)}
                      />
                    ) : null}
                  </div>
                  <span className="new-event-date-or" aria-hidden>oppure</span>
                  <label className="new-event-tbd">
                    <input
                      type="checkbox"
                      checked={dateTBD}
                      onChange={(e) => {
                        setDateTBD(e.target.checked);
                        if (e.target.checked) {
                          setDateDisplay("");
                          setPickerOpen(false);
                        }
                      }}
                    />
                    <span>Data da definire</span>
                  </label>
                </div>
              </div>
            </div>

            {error ? <p className="new-event-error">{error}</p> : null}
          </Surface>

          {preselectedTemplate ? (
            <Surface variant="glass" className="new-event-card new-event-card--picked">
              <div className={`new-event-picked${isUploadFlow ? " new-event-picked--upload" : ""}`}>
                {isUploadFlow ? (
                  <div className="new-event-picked__formats">
                    <InviteFormatPicker
                      value={uploadFormatResolved}
                      onChange={setUploadFormatInUrl}
                      heading="Formato invito e busta"
                    />
                  </div>
                ) : null}
                <div className="new-event-picked__preview">
                  <CanvasPreview
                    catalogThumb
                    canvas={preselectedTemplate.canvas as never}
                    layers={preselectedTemplate.layers as never}
                  />
                </div>
                <div className="new-event-picked__body">
                  <span className="new-event-picked__eyebrow">Modello</span>
                  <h2 className="new-event-picked__title">
                    {preselectedTemplate.id === UPLOAD_CUSTOM_TEMPLATE_ID
                      ? "Carica il tuo file"
                      : preselectedTemplate.name}
                  </h2>
                  <p className="new-event-picked__cat">{preselectedTemplate.category}</p>
                  <p className="new-event-picked__hint">
                    Poi completi il pagamento (69&nbsp;€) e accedi all’editor per invito, busta e
                    pagina dell’evento.
                  </p>
                  <Button
                    variant="outline"
                    type="button"
                    className="new-event-picked__change"
                    onClick={() => navigate("/templates")}
                  >
                    Cambia modello
                  </Button>
                </div>
              </div>
            </Surface>
          ) : (
            <Surface variant="glass" className="new-event-card new-event-card--catalog">
              <h2 className="new-event-catalog__title">Catalogo inviti</h2>
              <p className="new-event-catalog__lede">
                Scegli una grafica di partenza. Nell’editor potrai cambiare testi, colori e
                immagini.
              </p>
              <div className="template-grid">
                {PREBUILT_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className={`template-card ${selectedTemplate === tmpl.id ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedTemplate(tmpl.id);
                      if (tmpl.id === UPLOAD_CUSTOM_TEMPLATE_ID) {
                        setSearchParams(
                          { templateId: UPLOAD_CUSTOM_TEMPLATE_ID, format: "square" },
                          { replace: true }
                        );
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedTemplate === tmpl.id}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedTemplate(tmpl.id);
                        if (tmpl.id === UPLOAD_CUSTOM_TEMPLATE_ID) {
                          setSearchParams(
                            { templateId: UPLOAD_CUSTOM_TEMPLATE_ID, format: "square" },
                            { replace: true }
                          );
                        }
                      }
                    }}
                  >
                    <div className="template-cover">
                      <CanvasPreview
                        catalogThumb
                        canvas={tmpl.canvas as any}
                        layers={tmpl.layers as any}
                      />
                      {selectedTemplate === tmpl.id && (
                        <div className="template-selected-badge">
                          <CheckCircle2 color="white" fill="var(--accent)" size={28} />
                        </div>
                      )}
                    </div>
                    <div className="template-info">
                      <h3>{tmpl.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </Surface>
          )}
        </form>
      </div>
    </div>
  );
}
