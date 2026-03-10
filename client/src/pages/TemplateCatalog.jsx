import { useState, useEffect } from "react";
import { PREBUILT_TEMPLATES, TEMPLATE_CATEGORIES } from "../utils/layoutSchema";
import { Button, Surface } from "../ui";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CanvasPreview from "../components/CanvasPreview";
import { API_BASE } from "../config/api";
import "./TemplateCatalog.css";

export default function TemplateCatalog() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "Tutti";
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const navigate = useNavigate();

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const filteredTemplates = activeCategory === "Tutti" 
    ? PREBUILT_TEMPLATES 
    : PREBUILT_TEMPLATES.filter(t => t.category === activeCategory);

  const handleSelectTemplate = async (templateId) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
      if (res.ok) {
        navigate(`/new?templateId=${templateId}`);
      } else {
        navigate(`/edit/demo?templateId=${templateId}`);
      }
    } catch {
      navigate(`/edit/demo?templateId=${templateId}`);
    }
  };

  return (
    <div className="catalog-page">
      <header className="catalog-header">
        <Button variant="ghost" className="back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={18} /> Dashboard
        </Button>
        <div className="header-titles">
          <h1>Scegli il design di partenza</h1>
          <p>Tutti gli inviti sono personalizzabili nel nostro Editor Avanzato.</p>
        </div>
      </header>

      <section className="catalog-filters">
        <div className="filter-chips">
          <button 
            className={`chip ${activeCategory === "Tutti" ? "active" : ""}`}
            onClick={() => setActiveCategory("Tutti")}
          >
            Tutti
          </button>
          {TEMPLATE_CATEGORIES.map(cat => (
            <button 
              key={cat}
              className={`chip ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <main className="catalog-grid-wrapper">
        {filteredTemplates.length === 0 ? (
          <div className="empty-state">
            <p>Nessun template trovato per questa categoria.</p>
          </div>
        ) : (
          <div className="catalog-grid">
            {filteredTemplates.map(template => (
              <Surface key={template.id} variant="card" className="template-card">
                <div className="thumbnail-wrapper" onClick={() => handleSelectTemplate(template.id)}>
                  <CanvasPreview canvas={template.canvas} layers={template.layers} />
                  <div className="hover-overlay">
                    <Button variant="primary">Modifica questo design</Button>
                  </div>
                </div>
                <div className="template-info">
                  <h3>{template.name}</h3>
                  <span className="template-category">{template.category}</span>
                </div>
              </Surface>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
