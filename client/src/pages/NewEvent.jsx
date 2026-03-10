import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";
import { PREBUILT_TEMPLATES } from "../utils/layoutSchema";
import { Surface, Button } from "../ui";
import { CheckCircle2 } from "lucide-react";
import CanvasPreview from "../components/CanvasPreview";
import "./NewEvent.css";

export default function NewEvent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [dateTBD, setDateTBD] = useState(false);
  const templateIdParam = searchParams.get("templateId");
  const [selectedTemplate, setSelectedTemplate] = useState(templateIdParam || PREBUILT_TEMPLATES[0].id);
  const [loading, setLoading] = useState(!!templateIdParam);
  const [error, setError] = useState("");

  useEffect(() => {
    // Auto-create if arrived from Catalog
    if (templateIdParam && !error) {
       autoCreate(templateIdParam);
    }
  }, [templateIdParam]);

  const autoCreate = async (id) => {
    try {
      setLoading(true);
      const template = PREBUILT_TEMPLATES.find(t => t.id === id) || PREBUILT_TEMPLATES[0];
      const res = await apiFetch(`/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Nuovo Invito - ${template.name}`,
          date: null,
          dateTBD: true,
          templateId: template.id,
          layers: template.layers || [],
          canvas: template.canvas || { bgImage: null, width: 800, height: 1000 },
          blocks: template.blocks || [],
          theme: template.theme,
          plan: "free",
          status: "draft",
        }),
      });

      if (!res.ok) throw new Error("Errore creazione evento veloce");
      
      const createdItem = await res.json();
      navigate(`/edit/${createdItem.slug}`);
    } catch(err) {
      console.error(err);
      setError("Creazione rapida fallita.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const template = PREBUILT_TEMPLATES.find(t => t.id === selectedTemplate) || PREBUILT_TEMPLATES[0];
      
      const res = await apiFetch(`/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date: dateTBD ? null : new Date(date).toISOString(),
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
        throw new Error("Errore creazione evento");
      }

      const createdItem = await res.json();
      navigate(`/edit/${createdItem.slug}`);
    } catch (err) {
      console.error(err);
      setError("Non siamo riusciti a creare l'evento. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-event-page">
      <div className="new-event-shell">
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <Button variant="ghost" onClick={() => navigate("/")}>← Torna alla dashboard</Button>
          <h1>Catalogo Inviti</h1>
          <p>
            Scegli il design perfetto per il tuo evento. Potrai personalizzare testi, colori e foto nel prossimo step.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="new-event-form">
          <Surface variant="glass" style={{ padding: "1.5rem" }}>
            <div className="new-event-inputs">
              <label>
                Titolo evento
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Es. Matrimonio Marco & Sara"
                />
              </label>

              <label>
                Data evento
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <input
                    type="date"
                    disabled={dateTBD}
                    required={!dateTBD}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />

                  <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.35rem" }}>
                    <input
                      type="checkbox"
                      checked={dateTBD}
                      onChange={(e) => {
                        setDateTBD(e.target.checked);
                        if (e.target.checked) setDate("");
                      }}
                    />
                    Data da definire
                  </label>
                </div>
              </label>
            </div>
          </Surface>

          <h2 style={{ marginTop: "1rem" }}>Seleziona un Template</h2>
          <div className="template-grid">
            {PREBUILT_TEMPLATES.map((tmpl) => (
              <div 
                key={tmpl.id} 
                className={`template-card ${selectedTemplate === tmpl.id ? 'selected' : ''}`}
                onClick={() => setSelectedTemplate(tmpl.id)}
              >
                <div className="template-cover" style={{position: 'relative'}}>
                  <CanvasPreview canvas={tmpl.canvas} layers={tmpl.layers} />
                  {selectedTemplate === tmpl.id && (
                    <div className="template-selected-badge">
                      <CheckCircle2 color="white" fill="#3ae6b3" size={32} />
                    </div>
                  )}
                </div>
                <div className="template-info">
                  <h3>{tmpl.name}</h3>
                  <span className="template-blocks-count">{(tmpl.layers || []).length} livelli di testo</span>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <p style={{ color: "salmon", textAlign: "center" }}>{error}</p>
          )}

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Button type="submit" disabled={loading || !title} style={{ padding: "1rem 3rem", fontSize: "1.1rem" }}>
              {loading ? "Creazione in corso..." : "Usa questo Design"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
