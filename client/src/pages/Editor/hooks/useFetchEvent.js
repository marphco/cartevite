import { useState, useEffect } from "react";
import { apiFetch } from "../../../utils/apiFetch";
import { PREBUILT_TEMPLATES } from "../../../utils/layoutSchema";

export const DEFAULT_THEME = {
  accent: "#f4c46b",
  background: "#050506",
  heroBg: "/hero-bg-default.jpg", 
  heroBgPosition: "center",
  fonts: { heading: "Playfair Display", body: "Space Grotesk" },
  preset: "noir",
  linerX: 0,
  linerY: 0,
  linerScale: 1,
  coverLiner: '/minimal_pink_liner.png',
  coverPocketLiner: '/minimal_pink_liner.png'
};

const withTheme = (evt = {}) => ({
  ...evt,
  theme: { ...DEFAULT_THEME, ...(evt.theme || {}) },
});

export function useFetchEvent(slug, searchParams, loadDraft, setDraftRestored, setIsDirty, {
  setEvent, setLayers, setBlocks, setCanvasProps
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchEvent() {
      if (slug === 'demo') {
        const templateId = searchParams.get('templateId');
        const template = PREBUILT_TEMPLATES.find(t => t.id === templateId) || PREBUILT_TEMPLATES[0];
        if (!cancelled) {
          setEvent(withTheme({ title: "Prova Design - " + template.name, status: "draft", theme: template.theme }));
          setLayers(template.layers || []);
          setBlocks(template.blocks || []);
          setCanvasProps(template.canvas || { bgImage: null, width: 800, height: 1000 });
          setDraftRestored(true);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await apiFetch(`/api/events/${slug}/private`);
        if (!res.ok) throw new Error("Evento non trovato");
        const data = await res.json();

        if (!cancelled) {
          setEvent(withTheme(data));
          const draft = loadDraft();
          if (draft && draft.layers) {
             setLayers(draft.layers || []);
             setBlocks(draft.blocks || []);
             setCanvasProps(draft.canvas || { bgImage: null, width: 800, height: 1000 });
             if (draft.event) setEvent(withTheme(draft.event));
             setIsDirty(true);
          } else {
             setLayers(data.layers || []);
             setBlocks(data.blocks || []);
             setCanvasProps(data.canvas || { bgImage: null, width: 800, height: 1000 });
          }
          setDraftRestored(true);
        }
      } catch (err) {
        console.error("Errore fetch event:", err);
        if (!cancelled) setEvent(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchEvent();
    return () => { cancelled = true; };
  }, [slug, loadDraft, searchParams, setDraftRestored, setIsDirty, setEvent, setLayers, setBlocks, setCanvasProps]);

  return { loading, updateEvent: (newData, pushToHistory) => {
    if (pushToHistory) pushToHistory();
    setEvent(prev => {
      const updated = { ...prev };
      // Se newData contiene 'theme', facciamo il merge profondo del tema
      if (newData.theme) {
        updated.theme = { ...prev.theme, ...newData.theme };
      }
      return { ...updated, ...newData };
    });
    // Sincronizziamo anche lo stato blocks separato se presente nei dati
    if (newData.blocks) {
      setBlocks(newData.blocks);
    }
    setIsDirty(true);
  }};
}
