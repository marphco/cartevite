import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../utils/apiFetch";
import { PREBUILT_TEMPLATES } from "../../../utils/layoutSchema";
import {
  UPLOAD_CUSTOM_TEMPLATE_ID,
  applyUploadFormatToTemplate,
  parseInviteFormat,
} from "../../../pages/PublicView/templateCatalogUtils";
import type { EventData, EventTheme, Layer, Block, CanvasProps } from "../../../types/editor";
import { normalizeBlocksForEditor } from "../../../utils/blockHeight";

export const DEFAULT_THEME: EventTheme = {
  accent: "#f4c46b",
  background: "#050506",
  preset: "noir",
  fonts: { heading: "Playfair Display", body: "Space Grotesk" },
  // Scenario default
  heroBg: null,
  heroBgColor: "var(--bg-body)",
  heroBgOpacity: 1,
  heroBgPosition: "center",
  // Envelope default
  envelopeFormat: "vertical",
  coverBg: "#54392d",
  coverPocketColor: null,
  coverLiner: null,
  coverPocketLiner: null,
  coverLinerColor: "#ffffff",
  coverText: "",
  // Liner default control
  linerX: 0,
  linerY: 0,
  linerScale: 1,
  linerOpacity: 1
};

const withTheme = (evt: Partial<EventData> = {}): EventData => ({
  title: evt.title || "Senza Titolo",
  ...evt,
  theme: { ...DEFAULT_THEME, ...(evt.theme || {}) } as EventTheme,
});

interface UseFetchEventProps {
  setEvent: React.Dispatch<React.SetStateAction<EventData | null>>;
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setCanvasProps: React.Dispatch<React.SetStateAction<CanvasProps>>;
}

export function useFetchEvent(
  slug: string | undefined, 
  searchParams: URLSearchParams, 
  loadDraft: () => any, 
  setDraftRestored: (val: boolean) => void, 
  setIsDirty: (val: boolean) => void, 
  { setEvent, setLayers, setBlocks, setCanvasProps }: UseFetchEventProps
) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function fetchEvent() {
      if (slug === 'demo') {
        const templateId = searchParams.get('templateId');
        const fmt = parseInviteFormat(searchParams.get("format"));
        const raw = PREBUILT_TEMPLATES.find((t) => t.id === templateId) || PREBUILT_TEMPLATES[0];
        const template =
          raw.id === UPLOAD_CUSTOM_TEMPLATE_ID
            ? applyUploadFormatToTemplate(raw, fmt ?? "square")
            : raw;
        if (!cancelled && template) {
          setEvent(withTheme({ 
            title: "Prova Design - " + template.name, 
            status: "draft", 
            theme: template.theme as any 
          }));
          setLayers(template.layers as Layer[] || []);
          setBlocks(normalizeBlocksForEditor((template.blocks as Block[]) || []));
          setCanvasProps(template.canvas as CanvasProps || { bgImage: null, width: 800, height: 1000 });
          setDraftRestored(true);
          setLoading(false);
        }
        return;
      }

      if (!slug) return;

      try {
        const res = await apiFetch(`/api/events/${slug}/private`);
        if (!res.ok) throw new Error("Evento non trovato");
        const data = await res.json();

        if (!cancelled) {
          // Guard: se il piano non è pagato, redirect ad attivazione
          if (data.plan && data.plan !== "paid") {
            navigate(`/activate/${slug}`, { replace: true });
            return;
          }
          setEvent(withTheme(data));
          const draft = loadDraft();
          if (draft && draft.layers) {
             setLayers(draft.layers || []);
             setBlocks(normalizeBlocksForEditor(draft.blocks || []));
             setCanvasProps(draft.canvas || { bgImage: null, width: 800, height: 1000 });
             if (draft.event) setEvent(withTheme(draft.event));
             setIsDirty(true);
          } else {
             setLayers(data.layers || []);
             setBlocks(normalizeBlocksForEditor(data.blocks || []));
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
  }, [slug, loadDraft, searchParams, setDraftRestored, setIsDirty, setEvent, setLayers, setBlocks, setCanvasProps, navigate]);

  return { 
    loading, 
    updateTheme: (newTheme: Partial<EventTheme>, pushToHistory?: () => void) => {
      if (pushToHistory) pushToHistory();
      setEvent(prev => {
        if (!prev) return null;
        return {
          ...prev,
          theme: { ...prev.theme, ...newTheme }
        };
      });
      setIsDirty(true);
    },
    updateEventData: (updates: Partial<EventData>, pushToHistory?: () => void) => {
      if (pushToHistory) pushToHistory();
      setEvent(prev => {
        if (!prev) return null;
        return { ...prev, ...updates };
      });
      setIsDirty(true);
    }
  };
}
