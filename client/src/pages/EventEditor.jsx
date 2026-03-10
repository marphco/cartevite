import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { resolveImageUrl } from "../config/api";
import { apiFetch } from "../utils/apiFetch";
import { BLOCK_LIBRARY, THEME_PRESETS, PREBUILT_TEMPLATES } from "../utils/layoutSchema";
import { Surface, Button, Badge } from "../ui";
import { CopyPlus, GripVertical, Trash2, Type, Move, MapPin, Undo2, AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, Plus, Minus, PaintBucket, Bold, Italic, Underline, Pipette, ChevronDown, ChevronUp, Home, LayoutDashboard, Save, Check, X, Settings2, Baseline, Image as ImageIcon, Sparkles, Shapes, Heart, Star, Camera, Gift, Music, Bell, Cake, PartyPopper, Wine, GlassWater, Anchor, Crown, Gem, Cloud, Sun, Moon, Smile, Coffee, TreePine, Flame, MailOpen, Palette, Maximize2, Mail, Target, ArrowUpLeft, ArrowUp, ArrowUpRight, ArrowLeft, Circle, ArrowRight, ArrowDownLeft, ArrowDown, ArrowDownRight } from "lucide-react";

import { HexColorPicker } from "react-colorful";
import "./EventEditor.css";
import EnvelopeAnimation from "../components/EnvelopeAnimation";
import ReadOnlyCanvas from "../components/ReadOnlyCanvas";

const MobileIconBtn = ({ icon: Icon, label, onClick, disabled, variant = "ghost", className = "", style = {} }) => (
  <button 
    onClick={onClick} 
    disabled={disabled} 
    className={`mobile-icon-btn variant-${variant} ${className}`}
    style={style}
  >
    <Icon size={18} className="mib-icon"/>
    <span className="mib-label">{label}</span>
  </button>
);

// Componente Custom per il Color Picker (Stile Canva/Native Chrome)
const CustomColorPicker = ({ color, onChange }) => {
  const [hexInput, setHexInput] = useState(color);
  
  useEffect(() => {
    setHexInput(color);
  }, [color]);

  const handleHexChange = (e) => {
    let val = e.target.value.toUpperCase();
    if (val && !val.startsWith('#') && !val.includes('/')) val = '#' + val;
    setHexInput(val);
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      onChange(val);
    }
  };

  const isColor = (str) => {
    if (!str) return false;
    return str.startsWith('#') || str.startsWith('rgb');
  };

  const displayHex = isColor(hexInput) ? hexInput : '';
  const displayPreview = isColor(color) ? color : 'transparent';

  const handleEyeDropper = async () => {
    if (!window.EyeDropper) return alert("Il tuo browser non supporta EyeDropper API.");
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      onChange(result.sRGBHex);
    } catch (e) {
      // User canceled
    }
  };

  return (
    <div className="custom-color-picker-container" style={{
      position: 'relative',
      zIndex: 105,
      background: '#fff',
      padding: '12px',
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      width: '100%',
      minWidth: '240px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      border: '1px solid #ddd'
    }} onClick={(e) => e.stopPropagation()}>
      <div className="custom-colorful-override">
        <HexColorPicker color={color} onChange={onChange} style={{ width: '100%' }} />
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', padding: '0 8px', height: '34px', boxSizing: 'border-box', gap: '8px', background: '#fff' }}>
           <div style={{ width: '18px', height: '18px', minWidth: '18px', minHeight: '18px', flexShrink: 0, borderRadius: '50%', background: displayPreview, border: '1px solid rgba(0,0,0,0.1)' }}></div>
           <input 
             type="text" 
             value={displayHex} 
             onChange={handleHexChange}
             placeholder={!isColor(hexInput) ? "Nessun colore" : ""}
             style={{ border: 'none', background: 'transparent', width: '100%', height: '100%', outline: 'none', fontSize: '14px', color: '#333', fontWeight: 500, fontFamily: 'monospace' }}
           />
        </div>
        {window.EyeDropper && (
          <button onClick={handleEyeDropper} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#333' }}>
            <Pipette size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// Dynamic Google Font Loader
const loadGoogleFont = (fontFamily) => {
  if (!fontFamily) return;
  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-')}`;
  if (document.getElementById(fontId)) return;
  const link = document.createElement("link");
  link.id = fontId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
};


const AVAILABLE_FONTS = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Playfair Display",
  "Cormorant Garamond", "Fraunces", "DM Serif Display", "Space Grotesk",
  "Alex Brush", "Great Vibes", "Dancing Script", "Pacifico", "Amatic SC",
  "Bebas Neue", "Anton", "Lobster", "Righteous", "Cinzel", "Oswald",
  "Raleway", "Poppins", "Nunito", "Quicksand", "Crimson Text", "Libre Baskerville",
  "Merriweather", "PT Sans", "Work Sans", "Rubik", "Lora", "Fira Sans",
  "Ubuntu", "Mukta", "Noto Sans", "PT Serif", "Nanum Gothic", "Titillium Web",
  "Heebo", "Karla", "Josefin Sans", "Libre Franklin", "Inconsolata", "Bitter",
  "Dosis", "Hind", "Cabin", "Fjalla One", "Source Sans Pro", "Source Serif Pro",
  "Abril Fatface", "Varela Round", "Comfortaa", "Exo 2", "Kanit", "Teko",
  "Shadows Into Light", "Caveat", "Permanent Marker", "Satisfy", "Courgette",
  "Kaushan Script", "Cookie", "Chewy", "Handlee", "Neucha", "Marck Script",
  "Sacramento", "Yellowtail", "Parisienne", "Tangerine", "Allura", "Pinyon Script",
  "Berkshire Swash", "Leckerli One", "Rochester", "Arizonia", "Mr De Haviland",
  "Niconne", "Bad Script", "Yeseva One", "Forum", "Prata", "Rokkitt", "Cormorant",
  "Alegreya", "EB Garamond", "Cardo", "Gilda Display", "Philosopher", "Cinzel Decorative"
].sort();

const getFontPreviewText = (selectedLayer) => {
  if (!selectedLayer || selectedLayer.type !== 'text') return "AaBbCc";
  const raw = (selectedLayer.text || "");
  
  // Use a temporary element to strip HTML and decode entities properly
  const doc = new DOMParser().parseFromString(raw, 'text/html');
  const clean = doc.body.textContent || "";
  
  if (!clean.trim()) return "AaBbCc";
  return clean.length > 20 ? clean.substring(0, 18) + "..." : clean;
};
const EditableText = ({ text, isEditing, onSync, onBlur, onFocus, onDoubleClick, onPointerDown, style, id, className }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== text) {
      ref.current.innerHTML = text;
    }
  }, [text]);
  return (
    <div
      ref={ref}
      id={id}
      className={className}
      contentEditable={isEditing}
      suppressContentEditableWarning={true}
      onInput={(e) => onSync(e.currentTarget.innerHTML)}
      onBlur={(e) => onBlur(e.currentTarget.innerHTML)}
      onFocus={onFocus}
      onDoubleClick={onDoubleClick}
      onPointerDown={onPointerDown}
      style={style}
    />
  );
};

const CustomFontSelect = ({ value, onChange, fonts, selectedLayer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const previewText = getFontPreviewText(selectedLayer);


  useEffect(() => {
     const clickOut = (e) => {
       if(containerRef.current && !containerRef.current.contains(e.target) && !e.target.closest('#custom-font-portal')) {
         setIsOpen(false);
       }
     };
     document.addEventListener('mousedown', clickOut);
     return () => document.removeEventListener('mousedown', clickOut);
  }, []);

  return (
    <div ref={containerRef} style={{position: 'relative', width: '100%', marginBottom: '4px'}}>
       <div 
         onClick={() => setIsOpen(!isOpen)}
         style={{
           padding: '8px 12px', 
           border: '1px solid var(--border)', 
           borderRadius: 'var(--radius-sm)',
           background: 'var(--surface-light)',
           cursor: 'pointer',
           display: 'flex',
           justifyContent: 'space-between',
           alignItems: 'center',
           fontFamily: value,
           fontSize: '15px'
         }}
       >
         <span>{value}</span>
         <ChevronDown size={14} style={{ color: "var(--text-soft)", transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
       </div>
       
       {isOpen && (
         <div id="custom-font-portal" style={{
           marginTop: '4px',
           width: '100%',
           maxHeight: '300px',
           overflowY: 'auto',
           background: '#181820',
           border: '1px solid var(--border)',
           borderRadius: 'var(--radius-md)',
           boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.4)',
           zIndex: 1000
         }} className="custom-scrollbar-mini">
            {fonts.map(f => (
               <div 
                 key={f}
                 onClick={() => {
                   onChange(f);
                   setIsOpen(false);
                 }}
                 style={{
                   padding: '12px 14px',
                   cursor: 'pointer',
                   borderBottom: '1px solid rgba(255,255,255,0.05)',
                   backgroundColor: value === f ? 'var(--accent)' : 'transparent',
                   color: value === f ? '#ffffff' : 'var(--text-main)',
                   transition: 'all 0.15s ease',
                   display: 'flex',
                   flexDirection: 'column',
                   gap: '1px'
                 }}
                 onMouseEnter={e => {
                   if(value !== f) {
                     e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                   }
                 }}
                 onMouseLeave={e => {
                   if(value !== f) {
                     e.currentTarget.style.backgroundColor = 'transparent';
                   }
                 }}
               >
                 <div style={{ fontSize: '10px', fontWeight: 700, opacity: value === f ? 0.7 : 0.4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f}</div>
                 <div style={{ fontFamily: f, fontSize: '20px', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{previewText}</div>
               </div>
            ))}
         </div>
       )}
    </div>
  );
};

export default function EventEditor() {
  const isMobile = window.innerWidth <= 768;
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [event, setEvent] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [layers, setLayers] = useState([]);
  const [canvasProps, setCanvasProps] = useState({ 
    bgImage: null, 
    bgColor: '#ffffff',
    bgX: 0, 
    bgY: 0, 
    bgScale: 1,
    width: 800, 
    height: 1000 
  });
  const [loading, setLoading] = useState(true);
  
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [activeMobileTab, setActiveMobileTab] = useState(null);
  const [showMobileAnchorGrid, setShowMobileAnchorGrid] = useState(false);
  const [isFontExpanded, setIsFontExpanded] = useState(false);
  
  const [history, setHistory] = useState([]); 
  const [draftRestored, setDraftRestored] = useState(false);
  
  const [selectedLayerIds, setSelectedLayerIds] = useState([]);
  const [hoveredLayerId, setHoveredLayerId] = useState(null);
  const [keyLayerId, setKeyLayerId] = useState(null);
  const [alignmentReference, setAlignmentReference] = useState('canvas'); // 'canvas' | 'selection'
  const [editingLayerId, setEditingLayerId] = useState(null);
  const [selectionBox, setSelectionBox] = useState(null); // Box di selezione {startX, startY, currentX, currentY}
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [isEditingBackground, setIsEditingBackground] = useState(false);
  const [isEditingLiner, setIsEditingLiner] = useState(false);
  const [userLinerImages, setUserLinerImages] = useState([]);
  const [userScenarioBgImages, setUserScenarioBgImages] = useState([]);
  const [snapGuides, setSnapGuides] = useState([]); // Array of { axis: 'x'|'y', position: number }
  const [bgNaturalSize, setBgNaturalSize] = useState({ w: 0, h: 0 });
  const [editorMode, setEditorMode] = useState('canvas'); // 'canvas' | 'envelope' | 'background'
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const canvasRef = useRef(null);
  const textureInputRef = useRef(null);
  const lastClickRef = useRef({ id: null, time: 0 }); // To detect manual double-clicks
  const bgInputRef = useRef(null);
  const scenarioBgInputRef = useRef(null);
  const invitoBgInputRef = useRef(null);
  const stateBeforeActionRef = useRef(null);
  const latestStateRef = useRef(null);

  const DRAFT_KEY = `cartevite:draft:${slug}`;

  const defaultTheme = {
    accent: "#f4c46b",
    background: "#050506",
    heroBg: "/hero-bg-default.jpg", 
    heroBgPosition: "center",
    fonts: { heading: "Playfair Display", body: "Space Grotesk" },
    preset: "noir",
    linerX: 0,
    linerY: 0,
    linerScale: 1,
  };

  const withTheme = (evt = {}) => ({
    ...evt,
    theme: { ...defaultTheme, ...(evt.theme || {}) },
  });

  const updateTheme = (newTheme) => {
    pushToHistory();
    setEvent(prev => ({
      ...prev,
      theme: { ...prev.theme, ...newTheme }
    }));
    setIsDirty(true);
  };

  const fileInputRef = useRef(null);

  // --- HISTORY & DRAFT ---
    
  useEffect(() => {
    if (event) {
      latestStateRef.current = captureState();
    }
  }, [layers, blocks, canvasProps, event]);

  const captureState = () => {
    if (!event) return null;
    return {
      layers: JSON.parse(JSON.stringify(layers)),
      blocks: JSON.parse(JSON.stringify(blocks)),
      canvas: JSON.parse(JSON.stringify(canvasProps)),
      theme: JSON.parse(JSON.stringify(event.theme))
    };
  };

  const pushToHistory = (specificState = null) => {
    const currentState = specificState || captureState();
    setHistory(prev => [...prev.slice(-49), currentState]); 
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setLayers(last.layers);
    setBlocks(last.blocks);
    setCanvasProps(last.canvas);
    if (last.theme) {
      setEvent(prev => ({ ...prev, theme: last.theme }));
    }
    setHistory(prev => prev.slice(0, -1));
    setIsDirty(true);
  };

  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  };

  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ blocks, layers, canvas: canvasProps, event, savedAt: Date.now() }));
    } catch {}
  };

  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
  };

  useEffect(() => {
    if (!draftRestored || !isDirty) return;
    saveDraft();
  }, [blocks, layers, canvasProps, event, draftRestored, isDirty]);

  // --- SCROLL LOCK FOR MOBILE ---
  useEffect(() => {
    if (window.innerWidth <= 768) {
      document.body.classList.add('editor-locked');
      // Impedisci il "pull-to-refresh" e altri comportamenti di scroll del browser
      document.documentElement.style.overscrollBehavior = 'none';
    }
    return () => {
      document.body.classList.remove('editor-locked');
      document.documentElement.style.overscrollBehavior = 'auto';
    };
  }, []);

  // --- DATA FETCHING ---
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
        if (!cancelled) setEvent(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchEvent();
    return () => { cancelled = true; };
  }, [slug]);

  // --- AUTOSAVE ---
  useEffect(() => {
    if (!isEditingBackground) return;
    const handleKeyDown = (e) => {
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') setCanvasProps(prev => ({ ...prev, bgX: (prev.bgX || 0) - step }));
      if (e.key === 'ArrowRight') setCanvasProps(prev => ({ ...prev, bgX: (prev.bgX || 0) + step }));
      if (e.key === 'ArrowUp') setCanvasProps(prev => ({ ...prev, bgY: (prev.bgY || 0) - step }));
      if (e.key === 'ArrowDown') setCanvasProps(prev => ({ ...prev, bgY: (prev.bgY || 0) + step }));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditingBackground]);

  useEffect(() => {
    if (!draftRestored || !isDirty || autoSaving) return;
    const t = setTimeout(() => {
      saveToServer();
    }, 1500);
    return () => clearTimeout(t);
  }, [blocks, layers, canvasProps, event, isDirty, autoSaving, draftRestored]);

  const saveToServer = async () => {
    if (!event || slug === 'demo') {
      if (slug === 'demo') {
        setIsDirty(false);
        setLastSavedAt(Date.now());
      }
      return;
    }
    setAutoSaving(true);
    try {
      const res = await apiFetch(`/api/events/${slug}`, {
        method: "PUT",
        body: JSON.stringify({
          title: event.title, status: event.status, theme: event.theme,
          blocks, layers, canvas: canvasProps
        }),
      });
      if (!res.ok) throw new Error("Errore salvataggio evento");
      setIsDirty(false);
      setLastSavedAt(Date.now());
      clearDraft();
    } catch (err) {
      console.error(err);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSaveAndExit = async () => {
    try {
      setAutoSaving(true);
      const res = await apiFetch(`/api/events/${slug}`, {
        method: "PUT",
        body: JSON.stringify({
          title: event.title, status: 'published', theme: event.theme,
          blocks, layers, canvas: canvasProps
        }),
      });
      if (!res.ok) throw new Error("Errore salvataggio finale");
      clearDraft();
      navigate('/dashboard');
    } catch (err) {
      alert("Errore durante il salvataggio finale.");
    } finally {
      setAutoSaving(false);
    }
  };

  // --- LAYER MANAGEMENT ---
  const addLayer = (type, customProps = {}) => {
    pushToHistory();
    const newLayer = {
      id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      type: type || "text",
      x: 'center',
      y: canvasProps.height / 2,
      ...customProps
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerIds([newLayer.id]);
    setIsDirty(true);

    // Auto-open property panel on mobile for better feedback
    if (window.innerWidth <= 768 && type === 'text') {
      setActiveMobileTab('font');
    }
  };

  const addTextLayer = () => {
    addLayer("text", {
      text: "Nuovo Testo",
      fontSize: 32,
      fontFamily: event.theme?.fonts?.heading || "Playfair Display",
      color: event.theme?.accent || "#000000",
      textAlign: "center",
      width: "max-content",
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
      letterSpacing: 0,
      lineHeight: 1.2
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 300;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w *= ratio;
            h *= ratio;
          }
          addLayer("image", { src: ev.target.result, w: Math.round(w), h: Math.round(h), lockRatio: true });
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null; // reset
  };

  const updateSelectedLayer = (updates) => {
    if (selectedLayerIds.length === 0) return;
    
    // Se stiamo editando un testo, sincronizziamo il contenuto DOM corrente nello stato
    // PRIMA di applicare le modifiche della toolbar, così non perdiamo quello che l'utente ha scritto.
    let currentEditingText = null;
    if (editingLayerId) {
      const el = document.getElementById(`layer-content-${editingLayerId}`);
      if (el) currentEditingText = el.innerHTML;
    }

    pushToHistory();
    setLayers(prev => prev.map(l => {
      if (!selectedLayerIds.includes(l.id)) return l;
      let finalUpdate = { ...l, ...updates };
      // Se questo è il layer che stavamo editando, assicuriamoci di includere il testo aggiornato dal DOM
      if (l.id === editingLayerId && currentEditingText !== null) {
        finalUpdate.text = currentEditingText;
      }
      return finalUpdate;
    }));
    setIsDirty(true);
  };

  const alignLayers = (type, reference = 'canvas') => {
    if (selectedLayerIds.length === 0) return;
    pushToHistory();
    
    const canvasWidth = canvasProps.width || 800;
    const canvasHeight = canvasProps.height || 1000;

    // Se il riferimento è 'selection', dobbiamo prima calcolare il bounding box della selezione
    // OPPURE usare il bounding box dell'elemento chiave se presente
    let refBounds = null;

    if (reference === 'selection') {
      if (keyLayerId) {
        // Uso l'elemento chiave come riferimento
        const el = document.getElementById(`layer-${keyLayerId}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          const parentRect = el.parentElement.getBoundingClientRect();
          refBounds = {
            x: (rect.left - parentRect.left) / stageScale,
            y: (rect.top - parentRect.top) / stageScale,
            w: rect.width / stageScale,
            h: rect.height / stageScale
          };
        }
      } 
      
      if (!refBounds) {
        // Fallback al bounding box dell'intero gruppo
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        selectedLayerIds.forEach(id => {
          const el = document.getElementById(`layer-${id}`);
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const parentRect = el.parentElement.getBoundingClientRect();
          const lX = (rect.left - parentRect.left) / stageScale;
          const lY = (rect.top - parentRect.top) / stageScale;
          const lW = rect.width / stageScale;
          const lH = rect.height / stageScale;
          if (lX < minX) minX = lX;
          if (lY < minY) minY = lY;
          if (lX + lW > maxX) maxX = lX + lW;
          if (lY + lH > maxY) maxY = lY + lH;
        });
        refBounds = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
      }
    }

    setLayers(prev => prev.map(l => {
      if (!selectedLayerIds.includes(l.id)) return l;
      // Se è l'elemento chiave, non lo spostiamo (rimane il perno)
      if (reference === 'selection' && keyLayerId && l.id === keyLayerId) return l;
      
      const el = document.getElementById(`layer-${l.id}`);
      if (!el) return l;

      const rect = el.getBoundingClientRect();
      const w = rect.width / stageScale;
      const h = rect.height / stageScale;

      let newX = l.x;
      let newY = l.y;

      if (reference === 'canvas') {
        switch(type) {
          case 'left': newX = w / 2; break;
          case 'center-h': newX = canvasWidth / 2; break;
          case 'right': newX = canvasWidth - (w / 2); break;
          case 'top': newY = h / 2; break;
          case 'center-v': newY = canvasHeight / 2; break;
          case 'bottom': newY = canvasHeight - (h / 2); break;
        }
      } else if (refBounds) {
        switch(type) {
          case 'left': newX = refBounds.x + (w / 2); break;
          case 'center-h': newX = refBounds.x + (refBounds.w / 2); break;
          case 'right': newX = refBounds.x + refBounds.w - (w / 2); break;
          case 'top': newY = refBounds.y + (h / 2); break;
          case 'center-v': newY = refBounds.y + (refBounds.h / 2); break;
          case 'bottom': newY = refBounds.y + refBounds.h - (h / 2); break;
        }
      }

      return { ...l, x: newX, y: newY };
    }));
    setIsDirty(true);
  };

  const deleteSelectedLayers = () => {
    if (selectedLayerIds.length === 0) return;
    pushToHistory();
    setLayers(prev => prev.filter(l => !selectedLayerIds.includes(l.id)));
    setSelectedLayerIds([]);
    setEditingLayerId(null);
    setActiveMobileTab(null);
    setIsDirty(true);
  };

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editingLayerId || e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea' || e.target.isContentEditable) {
        return; // Non interferire se stiamo digitando un testo o l'evento è un div editabile
      }

      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedLayerIds.length > 0) {
        e.preventDefault();
        deleteSelectedLayers();
        return;
      }

      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (keys.includes(e.key) && selectedLayerIds.length > 0) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        setLayers(prev => {
          let hasChanges = false;
          const newLayers = prev.map(l => {
            if (selectedLayerIds.includes(l.id)) {
              hasChanges = true;
              let nx = l.x === 'center' || isNaN(l.x) ? canvasProps.width/2 : l.x;
              let ny = l.y === 'center' || isNaN(l.y) ? canvasProps.height/2 : l.y;
              if (e.key === 'ArrowUp') ny -= step;
              if (e.key === 'ArrowDown') ny += step;
              if (e.key === 'ArrowLeft') nx -= step;
              if (e.key === 'ArrowRight') nx += step;
              return { ...l, x: nx, y: ny };
            }
            return l;
          });
          if (hasChanges) setIsDirty(true);
          return newLayers;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerIds, editingLayerId, canvasProps]);

  // --- DRAG E RESIZE LOGIC NATIVA ---
  const draggingLayerId = useRef(null);
  const dragOffset = useRef({}); // { layerId: { offsetX, offsetY, startX, startY } }
  const selectionBoxRef = useRef(null);
  const dragGeometries = useRef(null);
  const resizingLayerId = useRef(null);
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, startSize: 0, startX: 0 });
  const pinchStartRef = useRef(null);

  

  const handlePointerDown = (e, layer) => {
    e.stopPropagation();
    
    // Gestione multi-touch: Tracciamo i pointer attivi su questo elemento
    if (e.pointerId) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (!window._elementPointers) window._elementPointers = new Map();
    window._elementPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    let newSelected = [...selectedLayerIds];
    if (e.shiftKey) {
        if (newSelected.includes(layer.id)) {
            newSelected = newSelected.filter(id => id !== layer.id);
        } else {
            newSelected.push(layer.id);
        }
    } else {
        if (!newSelected.includes(layer.id)) {
            newSelected = [layer.id];
        }
    }
    setSelectedLayerIds(newSelected);
    
    // If we're already editing this layer, let the pointer event fall through to text selection
    if (editingLayerId === layer.id && newSelected.length === 1) {
      return; 
    }

    // Manual Double-Click Detection
    const now = Date.now();
    const isDoubleClick = lastClickRef.current.id === layer.id && (now - lastClickRef.current.time < 300);
    lastClickRef.current = { id: layer.id, time: now };

    if (isDoubleClick && (layer.type === 'text' || !layer.type)) {
      setEditingLayerId(layer.id);
      draggingLayerId.current = null;
      return; // Stop here to allow focus/editing
    }

    setEditingLayerId(null);
    draggingLayerId.current = layer.id;
    pinchStartRef.current = null; // Reset initial pinch state

    // Calculate offset from mouse to layer's top-left corner
    if(canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const scale = canvasRect.width / canvasProps.width;
        // Mouse position inside canvas
        const mouseX = (e.clientX - canvasRect.left) / scale;
        const mouseY = (e.clientY - canvasRect.top) / scale;
        
        let positionResolved = false;
        let updatedLayers = [...layers];

        newSelected.forEach(id => {
            let l = updatedLayers.find(ll => ll.id === id);
            if (l) {
                let cx = l.x; let cy = l.y;
                let changed = false;
                if (cx === 'center' || isNaN(cx)) { cx = canvasProps.width / 2; changed = true; }
                if (cy === 'center' || isNaN(cy)) { cy = canvasProps.height / 2; changed = true; }
                if (changed) {
                    updatedLayers = updatedLayers.map(ul => ul.id === id ? { ...ul, x: cx, y: cy } : ul);
                    positionResolved = true;
                }
            }
        });
        
        if (positionResolved) {
            setLayers(updatedLayers);
        }
        stateBeforeActionRef.current = latestStateRef.current;

        const offsets = {};
        newSelected.forEach(id => {
            const l = positionResolved ? updatedLayers.find(ll => ll.id === id) : layers.find(ll => ll.id === id);
            if(l) {
               offsets[id] = {
                   startX: l.x,
                   startY: l.y,
                   offsetX: mouseX - l.x,
                   offsetY: mouseY - l.y
               };
            }
        });
        dragOffset.current = offsets;

        // Cache geometries for smooth, high-performance snapping using TRUE un-scaled offset sizes
        const activeNode = document.getElementById(`layer-${layer.id}`);
        let activeW = layer.w || 100;
        let activeH = layer.h || 100;
        
        if (activeNode) {
            activeW = activeNode.offsetWidth;
            activeH = activeNode.offsetHeight;
        }
        
        const others = [];
        layers.forEach(l => {
            if (!newSelected.includes(l.id)) { // snap against non-selected ONLY
                const n = document.getElementById(`layer-${l.id}`);
                let oW = l.w || 100;
                let oH = l.h || 100;
                if (n) {
                    oW = n.offsetWidth;
                    oH = n.offsetHeight;
                }
                const oX = typeof l.x === 'number' && !isNaN(l.x) ? l.x : canvasProps.width/2;
                const oY = typeof l.y === 'number' && !isNaN(l.y) ? l.y : canvasProps.height/2;
                others.push({
                    id: l.id,
                    centerX: oX,
                    centerY: oY,
                    left: oX - oW / 2,
                    right: oX + oW / 2,
                    top: oY - oH / 2,
                    bottom: oY + oH / 2
                });
            }
        });

        dragGeometries.current = {
            active: { w: activeW, h: activeH },
            others: others,
            primaryId: layer.id
        };
    }
  };

  const handleResizePointerDown = (e, layer, handlePostion) => {
    e.stopPropagation();
    setSelectedLayerIds([layer.id]);
    resizingLayerId.current = layer.id;
    
    if(canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const scale = canvasRect.width / canvasProps.width;
        
        let currentX = layer.x;
        let currentY = layer.y;
        let positionResolved = false;
        
        if (currentX === 'center' || currentY === 'center') {
            if (currentX === 'center') {
                currentX = canvasProps.width / 2;
            }
            if (currentY === 'center') {
                currentY = canvasProps.height / 2;
            }
            positionResolved = true;
            setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, x: currentX, y: currentY } : l));
        }

        resizeStart.current = {
            mouseX: (e.clientX - canvasRect.left) / scale,
            mouseY: (e.clientY - canvasRect.top) / scale,
            startSize: layer.fontSize,
            startW: typeof layer.w === 'number' ? layer.w : (document.getElementById(`layer-${layer.id}`)?.offsetWidth || 100),
            startH: typeof layer.h === 'number' ? layer.h : (document.getElementById(`layer-${layer.id}`)?.offsetHeight || 100),
            position: handlePostion
        };
    }
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (window._elementPointers && window._elementPointers.has(e.pointerId)) {
        window._elementPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      if (!draggingLayerId.current && !resizingLayerId.current && !selectionBoxRef.current) return;
      if (!canvasRef.current) return;
      
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const scale = canvasRect.width / canvasProps.width;
      
      const mouseX = (e.clientX - canvasRect.left) / scale;
      const mouseY = (e.clientY - canvasRect.top) / scale;

      if (selectionBoxRef.current) {
          selectionBoxRef.current.currentX = Math.max(0, Math.min(mouseX, canvasProps.width));
          selectionBoxRef.current.currentY = Math.max(0, Math.min(mouseY, canvasProps.height));
          setSelectionBox({ ...selectionBoxRef.current });
          return;
      }

      const pointers = window._elementPointers ? Array.from(window._elementPointers.values()) : [];
      if (pointers.length === 2 && draggingLayerId.current) {
         // Pinch-to-zoom logic sugli elementi del canvas
         const dist = Math.sqrt(
           Math.pow(pointers[1].x - pointers[0].x, 2) + 
           Math.pow(pointers[1].y - pointers[0].y, 2)
         );
         
         if (!pinchStartRef.current) {
            const layer = layers.find(l => l.id === draggingLayerId.current);
            if (layer) {
               pinchStartRef.current = {
                  initialDist: dist,
                  startSize: layer.type === 'text' || !layer.type ? layer.fontSize : null,
                  startW: layer.type === 'image' ? (layer.w || 100) : null,
                  startH: layer.type === 'image' ? (layer.h || 100) : null
               };
            }
            return; // Setup frame
         }

         const scaleFactor = dist / pinchStartRef.current.initialDist;

         setLayers(prev => prev.map(l => {
           if (l.id === draggingLayerId.current) {
               if (!l.type || l.type === 'text') {
                 let newSize = pinchStartRef.current.startSize * scaleFactor;
                 newSize = Math.max(12, Math.min(newSize, 300)); // Limiti font
                 return { ...l, fontSize: Math.round(newSize) };
               } else if (l.type === 'image') {
                 let newW = pinchStartRef.current.startW * scaleFactor;
                 newW = Math.max(20, Math.min(newW, canvasProps.width * 2)); // Limiti immagine
                 let newH = newW * (pinchStartRef.current.startH / pinchStartRef.current.startW);
                 return { ...l, w: Math.round(newW), h: Math.round(newH) };
               }
           }
           return l;
         }));
         setIsDirty(true);
         return; // Skip dragging logic if we are pinching
      }

      if (resizingLayerId.current) {
         setLayers(prev => prev.map(l => {
           if (l.id === resizingLayerId.current) {
               // Calcola la distanza diagonale percorsa dal mouse
               const deltaX = resizeStart.current.position.includes('W') ? (resizeStart.current.mouseX - mouseX) : (mouseX - resizeStart.current.mouseX);
               
               if (!l.type || l.type === 'text') {
                 let newSize = resizeStart.current.startSize + deltaX * 0.5;
                 newSize = Math.max(12, Math.min(newSize, 300));
                 return { ...l, fontSize: Math.round(newSize) };
               } else if (l.type === 'image') {
                 let newW = resizeStart.current.startW + deltaX * 2;
                 newW = Math.max(20, Math.min(newW, canvasProps.width));
                 if (resizeStart.current.startW > 0) {
                   const ratio = resizeStart.current.startH / resizeStart.current.startW;
                   let newH = newW * ratio;
                   if (newH > canvasProps.height) {
                     newH = canvasProps.height;
                     newW = newH / ratio;
                   }
                   return { ...l, w: Math.round(newW), h: Math.round(newH) };
                 }
                 return { ...l, w: Math.round(newW), h: Math.round(newW) };
               }
           }
           return l;
         }));
         setIsDirty(true);
         return;
      }

      if (draggingLayerId.current && dragGeometries.current) {
         setLayers(prev => {
            let draftLayers = [...prev];
            const primaryId = dragGeometries.current.primaryId;
            const primaryLayer = draftLayers.find(l => l.id === primaryId);
            if (!primaryLayer) return draftLayers;
            
            const primaryOffset = dragOffset.current[primaryId];
            if (!primaryOffset) return draftLayers;
            
            let nx = mouseX - primaryOffset.offsetX;
            let ny = mouseY - primaryOffset.offsetY;
            
            const elW = dragGeometries.current.active.w;
            const elH = dragGeometries.current.active.h;

            // 1. BOUNDS
            nx = Math.max(elW / 2, Math.min(nx, canvasProps.width - elW / 2));
            ny = Math.max(elH / 2, Math.min(ny, canvasProps.height - elH / 2));

            // 2. MAGNETIC SNAP
            const SNAP_THRESHOLD = 5;
            let newGuides = [];
            let snappedX = false;
            let snappedY = false;

            const activeLeft = nx - elW / 2;
            const activeRight = nx + elW / 2;
            const activeTop = ny - elH / 2;
            const activeBottom = ny + elH / 2;
            const activeCenterX = nx;
            const activeCenterY = ny;

            const canvasCenterX = canvasProps.width / 2;
            const canvasCenterY = canvasProps.height / 2;

            if (Math.abs(activeCenterX - canvasCenterX) < SNAP_THRESHOLD) {
                nx = canvasCenterX;
                newGuides.push({ axis: 'x', position: canvasCenterX });
                snappedX = true;
            }
            if (Math.abs(activeCenterY - canvasCenterY) < SNAP_THRESHOLD) {
                ny = canvasCenterY;
                newGuides.push({ axis: 'y', position: canvasCenterY });
                snappedY = true;
            }

            dragGeometries.current.others.forEach(other => {
                if (!snappedX) {
                    if (Math.abs(activeCenterX - other.centerX) < SNAP_THRESHOLD) {
                        nx = other.centerX; newGuides.push({ axis: 'x', position: other.centerX }); snappedX = true;
                    } else if (Math.abs(activeLeft - other.left) < SNAP_THRESHOLD) {
                        nx = other.left + elW / 2; newGuides.push({ axis: 'x', position: other.left }); snappedX = true;
                    } else if (Math.abs(activeRight - other.right) < SNAP_THRESHOLD) {
                        nx = other.right - elW / 2; newGuides.push({ axis: 'x', position: other.right }); snappedX = true;
                    }
                }
                if (!snappedY) {
                    if (Math.abs(activeCenterY - other.centerY) < SNAP_THRESHOLD) {
                        ny = other.centerY; newGuides.push({ axis: 'y', position: other.centerY }); snappedY = true;
                    } else if (Math.abs(activeTop - other.top) < SNAP_THRESHOLD) {
                        ny = other.top + elH / 2; newGuides.push({ axis: 'y', position: other.top }); snappedY = true;
                    } else if (Math.abs(activeBottom - other.bottom) < SNAP_THRESHOLD) {
                        ny = other.bottom - elH / 2; newGuides.push({ axis: 'y', position: other.bottom }); snappedY = true;
                    }
                }
            });

            setSnapGuides(newGuides);
            
            // 3. ABSOLUTE FINAL BOUNDS
            nx = Math.max(elW / 2, Math.min(nx, canvasProps.width - elW / 2));
            ny = Math.max(elH / 2, Math.min(ny, canvasProps.height - elH / 2));

            const deltaX = nx - primaryOffset.startX;
            const deltaY = ny - primaryOffset.startY;
            
            return draftLayers.map(l => {
                const off = dragOffset.current[l.id];
                if (off) {
                    let finalX = off.startX + deltaX;
                    let finalY = off.startY + deltaY;
                    const node = document.getElementById(`layer-${l.id}`);
                    if (node) {
                        const localW = node.offsetWidth;
                        const localH = node.offsetHeight;
                        finalX = Math.max(localW / 2, Math.min(finalX, canvasProps.width - localW / 2));
                        finalY = Math.max(localH / 2, Math.min(finalY, canvasProps.height - localH / 2));
                    }
                    return { ...l, x: finalX, y: finalY };
                }
                return l;
            });
         });
         setIsDirty(true);
      }
    };

    const handlePointerUp = (e) => {
      if (window._elementPointers) {
          window._elementPointers.delete(e.pointerId);
          if (window._elementPointers.size === 0) {
              window._elementPointers = null;
          }
      }
      
      try {
        if (e.pointerId && e.target && e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) {
           e.target.releasePointerCapture(e.pointerId);
        }
      } catch (err) {
        // Ignora errori di release se il pointer non era più valido
      }

      if (draggingLayerId.current || resizingLayerId.current || selectionBoxRef.current) {
         // History push only if something moved or selection box was large
         let shouldPush = false;
         if (draggingLayerId.current || resizingLayerId.current) {
             // Compare current layers with captured state
             const before = stateBeforeActionRef.current?.layers || [];
             const current = latestStateRef.current?.layers || []; 
             // Simple stringify check is fine for "did it change"
             if (JSON.stringify(before) !== JSON.stringify(current)) {
                 shouldPush = true;
             }
         } else if (selectionBoxRef.current) {
             const minX = Math.min(selectionBoxRef.current.startX, selectionBoxRef.current.currentX);
             const maxX = Math.max(selectionBoxRef.current.startX, selectionBoxRef.current.currentX);
             const minY = Math.min(selectionBoxRef.current.startY, selectionBoxRef.current.currentY);
             const maxY = Math.max(selectionBoxRef.current.startY, selectionBoxRef.current.currentY);
             if (maxX - minX > 5 || maxY - minY > 5) {
                 shouldPush = true;
             }
         }
         
         if (shouldPush && stateBeforeActionRef.current) {
             pushToHistory(stateBeforeActionRef.current);
             setIsDirty(true);
         }
      }
      
      if (selectionBoxRef.current) {
          const minX = Math.min(selectionBoxRef.current.startX, selectionBoxRef.current.currentX);
          const maxX = Math.max(selectionBoxRef.current.startX, selectionBoxRef.current.currentX);
          const minY = Math.min(selectionBoxRef.current.startY, selectionBoxRef.current.currentY);
          const maxY = Math.max(selectionBoxRef.current.startY, selectionBoxRef.current.currentY);
          
          if (maxX - minX > 5 || maxY - minY > 5) {
             setLayers(prev => {
                const selectedIds = prev.filter(l => {
                    const node = document.getElementById(`layer-${l.id}`);
                    if (!node) return false;
                    const w = node.offsetWidth;
                    const h = node.offsetHeight;
                    const lx = typeof l.x === 'number' && !isNaN(l.x) ? l.x : canvasProps.width/2;
                    const ly = typeof l.y === 'number' && !isNaN(l.y) ? l.y : canvasProps.height/2;
                    const left = lx - w/2;
                    const right = lx + w/2;
                    const top = ly - h/2;
                    const bottom = ly + h/2;
                    
                    return !(right < minX || left > maxX || bottom < minY || top > maxY);
                }).map(l => l.id);
                setTimeout(() => setSelectedLayerIds(selectedIds), 0);
                return prev;
             });
          }
          selectionBoxRef.current = null;
          setSelectionBox(null);
      }

      draggingLayerId.current = null;
      resizingLayerId.current = null;
      pinchStartRef.current = null;
      setSnapGuides([]); // Nascondi le guide rilasciando il click
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [canvasProps.width, canvasProps.height]); // MUST include canvasProps.height otherwise closure gets stale 1000px height causing bottom boundary fails!

  // FONTS E RESIZE
  useEffect(() => {
    // 1. Carica i font già in uso dai layer
    layers.forEach(l => {
       if(l.fontFamily) loadGoogleFont(l.fontFamily);
    });
    // 2. Pre-carica i font della lista globale per permettere il rendering dell'anteprima nel selettore a tendina
    AVAILABLE_FONTS.forEach(font => loadGoogleFont(font));
  }, [layers]);

  const stageRef = useRef(null);
  const [stageScale, setStageScale] = useState(1);
  const [envelopeScale, setEnvelopeScale] = useState(1);
  const [scenarioScale, setScenarioScale] = useState(0.75); // New scale for Scenario mode

  useEffect(() => {
    const handleResize = () => {
      if (stageRef.current) {
         // Ridotto il padding su mobile per massimizzare la visibilità della tela
         const paddingX = window.innerWidth <= 768 ? 20 : 96; 
         const paddingY = window.innerWidth <= 768 ? 10 : 96; 
         const availableWidth = stageRef.current.clientWidth - paddingX;
         const availableHeight = stageRef.current.clientHeight - paddingY;

         // If envelope is open, it takes ~1.6x the canvas height in 3D space
         const effectiveHeight = (editorMode === 'envelope' && isEnvelopeOpen) 
            ? canvasProps.height * 1.6 
            : canvasProps.height;

         const scaleX = availableWidth / canvasProps.width;
         const scaleY = availableHeight / effectiveHeight;
         
         // Nuova logica: vogliamo che entri SEMPRE. Math.min garantisce che stia dentro entrambi i bordi.
          const newScale = Math.min(scaleX, scaleY, 1);
          setStageScale(newScale);

           // Calcolo scala dedicata per la Busta per massimizzare lo spazio
           // Usiamo 500/600 come base FISSA concordata con il CSS
           const isPortrait = canvasProps?.width < canvasProps?.height;
           const baseW = isPortrait ? 600 : 500;
           const baseH = isPortrait ? (600 / 1.4) : 500;
           
           const envW = baseW;
           const envH = isEnvelopeOpen ? baseH * 1.6 : baseH;
           
           const padding = 4; // Minimal padding for a tight fit
           const divW = stageRef.current.clientWidth;
           const divH = stageRef.current.clientHeight;
           
           const availableW = divW - padding;
           const availableH = divH - padding;
           
           const sX = availableW / envW;
           const sY = availableH / envH;
           
           // No caps, we want it as big as possible to fill the space
            setEnvelopeScale(Math.min(sX, sY));

            // 3. Calcolo scala dedicata per lo Scenario (Invito + Busta)
            // Vogliamo che la composizione intera (estesa circa 2.6x W) entri sempre
            const scenarioRefWidth = canvasProps.width * 2.6; 
            const scenarioRefHeight = canvasProps.height * 2.3; // Busta è 1.5x H e scalata 1.5x + offset
            
            const sScaleX = stageRef.current.clientWidth / scenarioRefWidth;
            const sScaleY = stageRef.current.clientHeight / scenarioRefHeight;
            
            // Applichiamo un tetto di 0.8 per mantenere l'aspetto premium su grandi schermi
            setScenarioScale(Math.min(sScaleX, sScaleY, 0.8));
      }
    };
    // initial check after short delay to let flex layout settle
    setTimeout(handleResize, 100);
    window.addEventListener('resize', handleResize);
    handleResize();

    const observer = new ResizeObserver(() => {
       handleResize();
    });
    
    if (stageRef.current) {
       observer.observe(stageRef.current);
    }

    // fallback timeouts
    const t1 = setTimeout(handleResize, 50);
    const t2 = setTimeout(handleResize, 300);

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [canvasProps.width, canvasProps.height, activeMobileTab, isFontExpanded, displayColorPicker, editorMode]);


  if (loading) return <div className="editor-page">Caricamento editor...</div>;
  if (!event) return <div className="editor-page">Evento non trovato.</div>;

  const selectedLayer = selectedLayerIds.length > 0 ? layers.find(l => selectedLayerIds.includes(l.id)) : null;

  return (
    <div 
      className={`editor-page ${editorMode !== 'canvas' ? 'preview-mode' : 'canvas-mode'}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="editor-topbar">
          <MobileIconBtn icon={Home} label="Home" onClick={() => navigate("/")} />
          <MobileIconBtn icon={LayoutDashboard} label="Eventi" onClick={() => navigate("/dashboard")} />
          
          <MobileIconBtn 
            icon={ImageIcon} 
            label="Invito" 
            className="mobile-only"
            variant={editorMode === 'canvas' ? 'primary' : 'ghost'}
            onClick={() => {
               setEditorMode('canvas');
               setSelectedLayerIds([]);
               setActiveMobileTab(null);
               setDisplayColorPicker(false);
            }} 
          />
          <MobileIconBtn 
            icon={Shapes} 
            label="Busta" 
            className="mobile-only"
            variant={editorMode === 'envelope' ? 'primary' : 'ghost'}
            onClick={() => {
               setEditorMode('envelope');
               setSelectedLayerIds([]);
               setActiveMobileTab(null);
               setDisplayColorPicker(false);
            }} 
          />
          <MobileIconBtn 
            icon={Sparkles} 
            label="Scenario" 
            className="mobile-only"
            variant={editorMode === 'background' ? 'primary' : 'ghost'}
            onClick={() => {
               setEditorMode('background');
               setActiveMobileTab(null);
               setDisplayColorPicker(false);
               setSelectedLayerIds([]);
            }} 
          />

          <div style={{ flex: 1 }} className="desktop-only text-center">
            <h1 style={{ fontSize: '1.2rem', margin: 0 }}>{event.title}</h1>
          </div>

          <MobileIconBtn icon={Undo2} label="Annulla" onClick={undo} disabled={history.length === 0} />
          
          <MobileIconBtn 
             icon={autoSaving ? Save : (isDirty ? Save : Check)} 
             label={autoSaving ? "..." : (isDirty ? "Bozza" : "Salvato")} 
             disabled 
             style={{ color: autoSaving ? "#f4c46b" : (isDirty ? "salmon" : "#3ae6b3") }} 
          />

          <MobileIconBtn 
            icon={Check} 
            label="Finito!" 
            variant="primary"
            onClick={handleSaveAndExit} 
          />
      </div>

      <div className="editor-workspace">
        {/* LATO SINISTRO: TOOLBAR TESTI & BLOCCHI EXTRAS */}
        <div className="editor-sidebar left-sidebar">
           {/* SWITCHER DESKTOP */}
           <Surface variant="soft" className="panel-section desktop-only" style={{ marginBottom: '12px', padding: '16px' }}>
             <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-soft)', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>Scegli Cosa Modificare</div>
             <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <Button 
                  variant={editorMode === 'canvas' ? 'primary' : 'subtle'} 
                  style={{ 
                    flex: 1, 
                    justifyContent: 'center', 
                    fontSize: '11px', 
                    padding: '8px 2px',
                    ...(editorMode === 'canvas' ? { boxShadow: '0 0 12px rgba(var(--accent-rgb), 0.4)' } : {})
                  }}
                  onClick={() => setEditorMode('canvas')}
                >
                  Invito
                </Button>
                <Button 
                  variant={editorMode === 'envelope' ? 'primary' : 'subtle'} 
                  style={{ 
                    flex: 1, 
                    justifyContent: 'center', 
                    fontSize: '11px', 
                    padding: '8px 2px',
                    ...(editorMode === 'envelope' ? { boxShadow: '0 0 12px rgba(var(--accent-rgb), 0.4)' } : {})
                  }}
                  onClick={() => { setEditorMode('envelope'); setIsEnvelopeOpen(true); }}
                >
                  Busta
                </Button>
                 <Button 
                   variant={editorMode === 'background' ? 'primary' : 'subtle'} 
                   style={{ 
                     flex: 1, 
                     justifyContent: 'center', 
                     fontSize: '11px', 
                     padding: '8px 2px',
                     ...(editorMode === 'background' ? { boxShadow: '0 0 12px rgba(var(--accent-rgb), 0.4)' } : {})
                   }}
                   onClick={() => setEditorMode('background')}
                 >
                   Scenario
                 </Button>
             </div>
             <Button 
                variant="subtle" 
                style={{ width: '100%', justifyContent: 'center', fontSize: '12px', borderStyle: 'dashed', opacity: 0.8 }}
                onClick={() => alert("Funzionalità in arrivo!")}
              >
                Pagina Evento
              </Button>
           </Surface>

           {editorMode === 'canvas' && (
             <>
               {/* ISTRUZIONI SEMPRE IN ALTO */}
               <Surface variant="soft" className="panel-section">
                  <p style={{ fontSize: '11px', color: 'var(--text-soft)', marginBottom: '0', lineHeight: '1.5', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '3px solid var(--accent)' }}>
                    Clicca sugli elementi dell'invito per modificarli. Per l'immagine di sfondo, usa "Regola Posizione" sotto.
                  </p>
               </Surface>

               {/* EDITOR PROPRIETÀ: SPOSTATO QUI PER APPARIRE SECONDO IL DESIDERIO DELL'UTENTE */}
               {selectedLayer && (
                 <Surface variant="soft" className="panel-section property-panel">
                 {selectedLayerIds.length > 1 ? (
                    <div className="multi-select-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>{selectedLayerIds.length} Elementi Selezionati</h3>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLayerIds([])} style={{ padding: '4px 8px', fontSize: '11px' }}>Deseleziona</Button>
                      </div>

                      <div className="layer-mini-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '4px' }}>
                        {layers.filter(l => selectedLayerIds.includes(l.id)).map(layer => (
                          <div 
                            key={layer.id}
                            onMouseEnter={() => setHoveredLayerId(layer.id)}
                            onMouseLeave={() => setHoveredLayerId(null)}
                            onClick={() => {
                              setSelectedLayerIds([layer.id]);
                              setHoveredLayerId(null);
                              setKeyLayerId(null);
                            }}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '10px', 
                              padding: '8px 10px', 
                              borderRadius: '6px', 
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              boxSizing: 'border-box',
                              background: hoveredLayerId === layer.id ? 'rgba(var(--accent-rgb), 0.12)' : 'transparent',
                              border: '1px solid transparent',
                              outline: hoveredLayerId === layer.id ? '1px solid rgba(var(--accent-rgb), 0.4)' : 'none',
                              outlineOffset: '-1px'
                            }}
                          >
                            <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {(!layer.type || layer.type === 'text') ? <Type size={14} color="var(--text-soft)" /> : <ImageIcon size={14} color="var(--text-soft)" />}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                              {(!layer.type || layer.type === 'text') ? (layer.text.replace(/<[^>]*>/g, '').substring(0, 20) || "Testo") : "Immagine"}
                            </span>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', opacity: hoveredLayerId === layer.id ? 1 : 0, transition: 'opacity 0.2s' }} />
                          </div>
                        ))}
                      </div>

                      <div className="alignment-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Allineamento</label>
                          <div style={{ display: 'flex', background: 'var(--surface-light)', borderRadius: '20px', padding: '2px', border: '1px solid var(--border)' }}>
                            <button 
                              onClick={() => { setAlignmentReference('canvas'); setKeyLayerId(null); }}
                              style={{ 
                                padding: '4px 10px', fontSize: '9px', fontWeight: 700, borderRadius: '15px', border: 'none', cursor: 'pointer',
                                background: alignmentReference === 'canvas' ? 'var(--accent)' : 'transparent',
                                color: alignmentReference === 'canvas' ? '#ffffff' : 'var(--text-soft)',
                                transition: 'all 0.2s ease'
                              }}
                            >CANVAS</button>
                            <button 
                              onClick={() => setAlignmentReference('selection')}
                              style={{ 
                                padding: '4px 10px', fontSize: '9px', fontWeight: 700, borderRadius: '15px', border: 'none', cursor: 'pointer',
                                background: alignmentReference === 'selection' ? 'var(--accent)' : 'transparent',
                                color: alignmentReference === 'selection' ? '#ffffff' : 'var(--text-soft)',
                                transition: 'all 0.2s ease'
                              }}
                            >SELEZIONE</button>
                          </div>
                        </div>

                        {/* CONTESTO ELEMENTO CHIAVE */}
                        {alignmentReference === 'selection' && (
                          <div style={{ marginBottom: '16px', background: 'rgba(var(--accent-rgb), 0.05)', borderRadius: '8px', padding: '10px', border: '1px dashed rgba(var(--accent-rgb), 0.2)' }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px', textTransform: 'uppercase' }}>Rispetto a:</div>
                            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }} className="custom-scrollbar-mini">
                              {layers.filter(l => selectedLayerIds.includes(l.id)).map(layer => (
                                <div 
                                  key={`ref-${layer.id}`}
                                  onClick={() => setKeyLayerId(keyLayerId === layer.id ? null : layer.id)}
                                  onMouseEnter={() => setHoveredLayerId(layer.id)}
                                  onMouseLeave={() => setHoveredLayerId(null)}
                                  style={{ 
                                    flexShrink: 0, width: '32px', height: '32px', borderRadius: '6px', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: keyLayerId === layer.id ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                                    color: keyLayerId === layer.id ? '#ffffff' : 'var(--text-soft)',
                                    cursor: 'pointer', border: '1px solid transparent',
                                    borderColor: hoveredLayerId === layer.id ? 'var(--accent)' : 'transparent',
                                    transition: 'all 0.2s'
                                  }}
                                  title={(!layer.type || layer.type === 'text') ? (layer.text.replace(/<[^>]*>/g, '') || "Testo") : "Immagine"}
                                >
                                  {(!layer.type || layer.type === 'text') ? <Type size={14} /> : <ImageIcon size={14} />}
                                </div>
                              ))}
                            </div>
                            <div style={{ fontSize: '8px', color: 'var(--text-soft)', marginTop: '6px', letterSpacing: '0.02em' }}>
                              {keyLayerId ? "Elemento chiave impostato: gli altri si allineeranno a lui." : "Opzionale: scegli un elemento come perno fisso."}
                            </div>
                          </div>
                        )}

                        {/* ORIZZONTALE */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '8px', opacity: 0.6 }}>ORIZZONTALE</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            <Button variant="subtle" title="Sinistra" onClick={() => alignLayers('left', alignmentReference)} style={{ padding: '8px', justifyContent: 'center' }}><AlignHorizontalJustifyStart size={18} /></Button>
                            <Button variant="subtle" title="Centro" onClick={() => alignLayers('center-h', alignmentReference)} style={{ padding: '8px', justifyContent: 'center' }}><AlignHorizontalJustifyCenter size={18} /></Button>
                            <Button variant="subtle" title="Destra" onClick={() => alignLayers('right', alignmentReference)} style={{ padding: '8px', justifyContent: 'center' }}><AlignHorizontalJustifyEnd size={18} /></Button>
                          </div>
                        </div>
                        
                        {/* VERTICALE */}
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '8px', opacity: 0.6 }}>VERTICALE</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            <Button variant="subtle" title="Alto" onClick={() => alignLayers('top', alignmentReference)} style={{ padding: '8px', justifyContent: 'center' }}><AlignVerticalJustifyStart size={18} /></Button>
                            <Button variant="subtle" title="Medio" onClick={() => alignLayers('center-v', alignmentReference)} style={{ padding: '8px', justifyContent: 'center' }}><AlignVerticalJustifyCenter size={18} /></Button>
                            <Button variant="subtle" title="Basso" onClick={() => alignLayers('bottom', alignmentReference)} style={{ padding: '8px', justifyContent: 'center' }}><AlignVerticalJustifyEnd size={18} /></Button>
                          </div>
                        </div>
                        
                        <p style={{ fontSize: '10px', color: 'var(--text-soft)', textAlign: 'center', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>
                          {alignmentReference === 'canvas' 
                            ? "Allineamento rispetto ai bordi del foglio." 
                            : keyLayerId 
                              ? `Allineamento rispetto all'elemento chiave.` 
                              : "Allineamento rispetto ai bordi del gruppo."}
                        </p>
                      </div>

                      <Button variant="ghost" onClick={deleteSelectedLayers} style={{ color: 'salmon', border: '1px solid rgba(250, 128, 114, 0.2)', width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                        <Trash2 size={16} style={{ marginRight: 6 }} /> Elimina Tutti
                      </Button>
                    </div>
                  ) : (!selectedLayer.type || selectedLayer.type === 'text') ? (
                   <>
                     <label>Font</label>
                     <CustomFontSelect 
                       value={selectedLayer.fontFamily} 
                       fonts={AVAILABLE_FONTS}
                       selectedLayer={selectedLayer}
                       onChange={font => {
                         updateSelectedLayer({ fontFamily: font });
                         loadGoogleFont(font);
                       }}
                     />

                      <div className="prop-row" style={{alignItems: 'center', marginTop: '0.2rem'}}>
                        <div className="font-size-stepper" style={{display: 'flex', alignItems: 'center', background: 'var(--surface-light)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden'}}>
                          <Button variant="ghost" className="stepper-btn" onClick={() => updateSelectedLayer({fontSize: Math.max(8, selectedLayer.fontSize - 1)})}>
                            <Minus size={14}/>
                          </Button>
                          <div style={{width: '40px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600}}>{selectedLayer.fontSize}</div>
                          <Button variant="ghost" className="stepper-btn" onClick={() => updateSelectedLayer({fontSize: selectedLayer.fontSize + 1})}>
                            <Plus size={14}/>
                          </Button>
                        </div>

                        <div style={{display: 'flex', gap: '0.25rem', marginLeft: 'auto'}}>
                          <Button variant="ghost" onClick={() => updateSelectedLayer({fontWeight: selectedLayer.fontWeight === 'bold' ? 'normal' : 'bold'})} style={{padding: '0.4rem', borderRadius: 'var(--radius-sm)', justifyContent: 'center', background: selectedLayer.fontWeight === 'bold' ? 'var(--accent)' : 'var(--surface-light)', color: selectedLayer.fontWeight === 'bold' ? '#ffffff' : 'var(--text-soft)', border: 'none'}}>
                            <Bold size={16}/>
                          </Button>
                          <Button variant="ghost" onClick={() => updateSelectedLayer({fontStyle: selectedLayer.fontStyle === 'italic' ? 'normal' : 'italic'})} style={{padding: '0.4rem', borderRadius: 'var(--radius-sm)', justifyContent: 'center', background: selectedLayer.fontStyle === 'italic' ? 'var(--accent)' : 'var(--surface-light)', color: selectedLayer.fontStyle === 'italic' ? '#ffffff' : 'var(--text-soft)', border: 'none'}}>
                            <Italic size={16}/>
                          </Button>
                          <Button variant="ghost" onClick={() => updateSelectedLayer({textDecoration: selectedLayer.textDecoration === 'underline' ? 'none' : 'underline'})} style={{padding: '0.4rem', borderRadius: 'var(--radius-sm)', justifyContent: 'center', background: selectedLayer.textDecoration === 'underline' ? 'var(--accent)' : 'var(--surface-light)', color: selectedLayer.textDecoration === 'underline' ? '#ffffff' : 'var(--text-soft)', border: 'none'}}>
                            <Underline size={16}/>
                          </Button>
                        </div>
                      </div>

                        <div className="prop-row" style={{alignItems: 'center', marginTop: '0.5rem', marginBottom: displayColorPicker === 'font' ? '0.5rem' : '0.5rem'}}>
                           <PaintBucket size={16} color="var(--text-soft)"/>
                           <label style={{margin: 0, flex: 1}}>Colore</label>
                           <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                              <div 
                                onClick={() => setDisplayColorPicker(displayColorPicker === 'font' ? false : 'font')}
                                style={{
                                  padding: 0, 
                                  border: '2px solid var(--border)', 
                                  background: selectedLayer.color, 
                                  width: '24px', 
                                  height: '24px', 
                                  cursor: 'pointer', 
                                  borderRadius: '4px', 
                                  overflow: 'hidden'
                                }}
                              />
                           </div>
                        </div>
                        {displayColorPicker === 'font' && (
                           <div style={{ marginTop: '12px', width: '100%' }}>
                             <CustomColorPicker 
                               color={selectedLayer.color} 
                               onChange={color => updateSelectedLayer({color})} 
                             />
                           </div>
                        )}
                      <label style={{marginTop: '0.5rem', marginBottom: '8px', display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-soft)'}}>Spaziatura Lettere</label>
                      <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '0.5rem'}}>
                        <input 
                          type="range" 
                          className="custom-slider"
                          min="-10" 
                          max="50" 
                          step="1" 
                          value={selectedLayer.letterSpacing || 0} 
                          onChange={e => updateSelectedLayer({letterSpacing: parseFloat(e.target.value)})} 
                          style={{
                            flex: 1, 
                            background: `linear-gradient(to right, var(--accent) ${Math.max(0, Math.min(100, Math.round(((selectedLayer.letterSpacing || 0) + 10) / 60 * 100)))}%, rgba(60, 79, 118, 0.1) ${Math.max(0, Math.min(100, Math.round(((selectedLayer.letterSpacing || 0) + 10) / 60 * 100)))}%)`
                          }}
                        />
                        <span style={{fontSize: '14px', width: '30px', textAlign: 'right', fontWeight: 700, color: 'var(--text-soft)'}}>{selectedLayer.letterSpacing || 0}</span>
                      </div>

                      <label style={{marginBottom: '8px', display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-soft)'}}>Spaziatura Righe</label>
                      <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1rem'}}>
                        <input 
                          type="range" 
                          className="custom-slider"
                          min="0.5" 
                          max="3" 
                          step="0.1" 
                          value={selectedLayer.lineHeight || 1.2} 
                          onChange={e => updateSelectedLayer({lineHeight: parseFloat(e.target.value)})} 
                          style={{
                            flex: 1, 
                            background: `linear-gradient(to right, var(--accent) ${Math.max(0, Math.min(100, Math.round(((selectedLayer.lineHeight || 1.2) - 0.5) / 2.5 * 100)))}%, rgba(60, 79, 118, 0.1) ${Math.max(0, Math.min(100, Math.round(((selectedLayer.lineHeight || 1.2) - 0.5) / 2.5 * 100)))}%)`
                          }}
                        />
                        <span style={{fontSize: '14px', width: '30px', textAlign: 'right', fontWeight: 700, color: 'var(--text-soft)'}}>{selectedLayer.lineHeight || 1.2}</span>
                      </div>
                   </>
                 ) : (
                    <div style={{ marginBottom: '1rem' }}>
                      <div className="prop-row" style={{ alignItems: 'center', marginBottom: '8px' }}>
                        <Palette size={14} color="var(--text-soft)" />
                        <label style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: 'var(--text-soft)' }}>Opacità Immagine</label>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <input 
                          type="range" 
                          className="custom-slider"
                          min="0" 
                          max="1" 
                          step="0.01" 
                          value={selectedLayer.opacity !== undefined ? selectedLayer.opacity : 1} 
                          onChange={(e) => updateSelectedLayer({ opacity: parseFloat(e.target.value) })}
                          style={{ 
                            flex: 1,
                            background: `linear-gradient(to right, var(--accent) ${Math.round((selectedLayer.opacity ?? 1) * 100)}%, rgba(60, 79, 118, 0.1) ${Math.round((selectedLayer.opacity ?? 1) * 100)}%)`
                          }}
                        />
                        <span style={{ fontSize: '14px', color: 'var(--text-soft)', fontWeight: 700, minWidth: '40px', textAlign: 'right' }}>
                          {Math.round((selectedLayer.opacity !== undefined ? selectedLayer.opacity : 1) * 100)}%
                        </span>
                      </div>
                    </div>
                 )}

                   {selectedLayerIds.length === 1 && (
                     <div className="prop-row" style={{ marginTop: '1rem' }}>
                        <Button variant="ghost" onClick={deleteSelectedLayers} style={{color: 'salmon', width: '100%', justifyContent: 'center'}}>
                          <Trash2 size={16} style={{marginRight: 6}}/> {selectedLayer.type === 'image' ? 'Elimina Immagine' : 'Elimina Livello'}
                        </Button>
                     </div>
                   )}
                 </Surface>
               )}

               {/* BLOCCO INSERISCI */}
               <Surface variant="soft" className="panel-section">
                  <h3>Inserisci</h3>
             <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
               <Button variant="primary" style={{width: '100%', justifyContent: 'center'}} onClick={addTextLayer}>
                 <Type size={16} style={{marginRight: 8}}/> Testo
               </Button>
               <Button variant="secondary" style={{width: '100%', justifyContent: 'center'}} onClick={() => fileInputRef.current?.click()}>
                 <ImageIcon size={16} style={{marginRight: 8}}/> Immagine
               </Button>
               <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{display: 'none'}} />
              </div>
            </Surface>
             <Surface variant="soft" className="panel-section">
                <h3 style={{ marginBottom: '12px' }}>Sfondo Invito</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Button 
                      variant={displayColorPicker === 'canvasBg' ? "primary" : "subtle"}
                      onClick={() => setDisplayColorPicker(displayColorPicker === 'canvasBg' ? false : 'canvasBg')}
                      style={{ 
                        width: '100%', 
                        justifyContent: 'space-between', 
                        padding: '8px 12px',
                        ...(displayColorPicker === 'canvasBg' ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.5)', zIndex: 1 } : {})
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <PaintBucket size={14} style={{ marginRight: 8 }} />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>Colore</span>
                      </div>
                      <div style={{ width: '20px', height: '20px', background: (canvasProps.bgColor || '#ffffff'), borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }} />
                    </Button>
                    
                    {displayColorPicker === 'canvasBg' && (
                      <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '4px', border: '1px solid var(--border)' }}>
                        <CustomColorPicker color={canvasProps.bgColor || '#ffffff'} onChange={(color) => setCanvasProps(prev => ({ ...prev, bgColor: color }))} />
                      </div>
                    )}
                  </div>

                  {canvasProps.bgImage && (
                    <Button 
                      variant={isEditingBackground ? "primary" : "subtle"} 
                      style={{ 
                        width: "100%", 
                        justifyContent: "center", 
                        fontSize: "12px",
                        ...(isEditingBackground ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.5)', zIndex: 1 } : {})
                      }} 
                      onClick={() => setIsEditingBackground(!isEditingBackground)}
                    >
                      <Move size={14} style={{ marginRight: 8 }} /> {isEditingBackground ? "Salva Posizione" : "Regola Posizione Sfondo"}
                    </Button>
                  )}
                  <Button 
                    variant="subtle" 
                    style={{ width: "100%", justifyContent: "center", fontSize: "12px" }} 
                    onClick={() => invitoBgInputRef.current?.click()}
                  >
                    <ImageIcon size={14} style={{ marginRight: 8 }} /> Carica Immagine Sfondo
                  </Button>
                </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <input 
                   type="file" 
                   ref={invitoBgInputRef} 
                   style={{display: 'none'}} 
                   accept="image/*"
                   onChange={(e) => {
                     const file = e.target.files[0];
                     if (file) {
                       const url = URL.createObjectURL(file);
                       setCanvasProps(prev => ({ ...prev, bgImage: url }));
                        setIsEditingBackground(true);
                     }
                   }}
                 />
                 {canvasProps.bgImage && (
                   <Button 
                     variant="ghost" 
                     style={{ width: '100%', justifyContent: 'center', fontSize: '11px', color: 'salmon' }} 
                     onClick={() => setCanvasProps(prev => ({ ...prev, bgImage: null }))}
                   >
                     Rimuovi Immagine
                   </Button>
                 )}
               </div>
             </Surface>
          </>
           )}

           {/* Envelope Design Section */}
           {editorMode === 'envelope' && (
             <>
               <Surface variant="soft" className="panel-section">
                 <p style={{ fontSize: '11px', color: 'var(--text-soft)', marginBottom: '0', lineHeight: '1.5', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '3px solid var(--accent)' }}>
                   Personalizza i colori e l'interno della busta che conterrà il tuo invito.
                 </p>
               </Surface>
             <Surface variant="soft" className="panel-section">
             <h3>Design Busta</h3>
             <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                 <Button 
                   variant="primary" 
                   style={{ width: '100%', justifyContent: 'center', marginBottom: '8px' }}
                   onClick={() => setIsEnvelopeOpen(!isEnvelopeOpen)}
                 >
                   {isEnvelopeOpen ? <Mail size={16} style={{ marginRight: 8 }} /> : <MailOpen size={16} style={{ marginRight: 8 }} />} {isEnvelopeOpen ? 'Chiudi Busta' : 'Apri Busta'}
                 </Button>
                <div>
                  <label style={{fontSize: '12px', color: 'var(--text-soft)', display: 'block', marginBottom: '4px'}}>Colore Principale</label>
                  <div 
                    onClick={() => setDisplayColorPicker(displayColorPicker === 'envelope' ? false : 'envelope')}
                    style={{width: '100%', height: '36px', background: event.theme?.coverBg || '#54392d', borderRadius: '6px', border: '2px solid var(--border)', cursor: 'pointer', marginBottom: displayColorPicker === 'envelope' ? '12px' : '0'}}
                  />
                  {displayColorPicker === 'envelope' && (
                    <div style={{ marginBottom: '12px' }}>
                      <CustomColorPicker color={event.theme?.coverBg || '#54392d'} onChange={(color) => updateTheme({ coverBg: color })} />
                    </div>
                  )}
                </div>
                <div>
                  <label style={{fontSize: '12px', color: 'var(--text-soft)', display: 'block', marginBottom: '4px'}}>Colore Tasca</label>
                  <div 
                    onClick={() => setDisplayColorPicker(displayColorPicker === 'pocket' ? false : 'pocket')}
                    style={{width: '100%', height: '36px', background: event.theme?.coverPocketColor || event.theme?.coverBg || '#54392d', borderRadius: '6px', border: '2px solid var(--border)', cursor: 'pointer', marginBottom: displayColorPicker === 'pocket' ? '12px' : '0'}}
                  />
                  {displayColorPicker === 'pocket' && (
                    <div style={{ marginBottom: '12px' }}>
                      <CustomColorPicker color={event.theme?.coverPocketColor || event.theme?.coverBg || '#54392d'} onChange={(color) => updateTheme({ coverPocketColor: color })} />
                    </div>
                  )}
                </div>

                {/* Interno Busta Section */}
                <h4 style={{ fontSize: '11px', fontWeight: 700, marginTop: '16px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-soft)' }}>Interno Busta</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Liner Color Selection (Same pattern as Invite Background) */}
                  <div>
                    <Button 
                      variant={displayColorPicker === 'linerColor' ? "primary" : "subtle"} 
                      onClick={() => {
                        setDisplayColorPicker(displayColorPicker === 'linerColor' ? false : 'linerColor');
                        if (displayColorPicker !== 'linerColor') setIsEnvelopeOpen(true);
                      }}
                      style={{ 
                        width: '100%', 
                        justifyContent: 'space-between', 
                        padding: '8px 12px',
                        ...(displayColorPicker === 'linerColor' ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.5)', zIndex: 1 } : {})
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <PaintBucket size={14} style={{ marginRight: 8 }} />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>Colore</span>
                      </div>
                      <div style={{ width: '20px', height: '20px', background: (event.theme?.coverLinerColor || '#ffffff'), borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }} />
                    </Button>
                    
                    {displayColorPicker === 'linerColor' && (
                      <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginTop: '8px', border: '1px solid var(--border)' }}>
                        <CustomColorPicker color={event.theme?.coverLinerColor || '#ffffff'} onChange={(color) => updateTheme({ coverLinerColor: color })} />
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{fontSize: '11px', fontWeight: 600, color: 'var(--text-soft)', display: 'block', marginBottom: '8px'}}>Texture Preset</label>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '8px'}}>
                      {[null, '/minimal_pink_liner.png', ...userLinerImages].map(tex => (
                      <div 
                        key={tex || 'none'}
                        onClick={() => updateTheme({ coverLiner: tex || 'none', coverPocketLiner: tex || 'none' })}
                        style={{
                          aspectRatio: '1', 
                          background: (tex && tex !== 'none') ? `url(${tex})` : 'var(--surface-light)', 
                          backgroundSize: 'cover', 
                          borderRadius: '4px', 
                          border: (event.theme?.coverLiner === tex || (tex === null && event.theme?.coverLiner === 'none')) ? '2px solid var(--accent)' : '2px solid transparent', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          overflow: 'hidden'
                        }}
                      >
                        {!tex && 'No'}
                      </div>
                    ))}
                  </div>
                  <input 
                    type="file" 
                    ref={textureInputRef} 
                    style={{display: 'none'}} 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setUserLinerImages(prev => {
                          if (prev.includes(url)) return prev;
                          return [url, ...prev];
                        });
                        updateTheme({ coverLiner: url, coverPocketLiner: url });
                        setIsEditingLiner(true); // Auto-open adjustment mode on upload
                        setIsEnvelopeOpen(true); // Auto-open envelope on upload
                      }
                    }}
                  />
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <Button 
                       variant="ghost" 
                       style={{ fontSize: '11px', width: '100%', justifyContent: 'center', border: '1px dashed var(--border)' }}
                       onClick={() => {
                         textureInputRef.current?.click();
                         setIsEnvelopeOpen(true);
                       }}
                     >
                        Cambia Foto Interno Busta
                     </Button>
                     <Button 
                       variant={isEditingLiner ? "primary" : "subtle"} 
                       style={{ 
                         fontSize: '11px', 
                         height: '36px',
                         flex: 1,
                         justifyContent: 'center', 
                         ...(isEditingLiner ? { boxShadow: '0 0 10px rgba(var(--accent-rgb), 0.3)' } : {})
                       }}
                       onClick={() => {
                         setIsEditingLiner(!isEditingLiner);
                         if (!isEditingLiner) setIsEnvelopeOpen(true);
                       }}
                     >
                        <Move size={12} style={{ marginRight: 6 }} /> {isEditingLiner ? "Salva" : "Regola Posizione"}
                     </Button>
                   </div>
                </div>
             </div>
            </div>
           </Surface>
           </>
           )}

           {/* Scenario Panel (Desktop ONLY) */}
            {editorMode === 'background' && !isMobile && (
              <>
                <Surface variant="soft" className="panel-section">
                   <p style={{ fontSize: '11px', color: 'var(--text-soft)', marginBottom: '0', lineHeight: '1.5', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '3px solid var(--accent)' }}>
                     Scegli l'atmosfera per il tuo evento. Sincronizza lo sfondo dello scenario con il tema del tuo evento.
                   </p>
                </Surface>
                <Surface variant="soft" className="panel-section">
               <h3>Design Scenario</h3>
               <p style={{ fontSize: '12px', color: 'var(--text-soft)', marginBottom: '12px' }}>
                 Scegli l'immagine che apparirà dietro la busta e l'invito nella pagina pubblica.
               </p>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input 
                    type="file" 
                    ref={scenarioBgInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (re) => {
                          const url = re.target.result;
                          setUserScenarioBgImages(prev => {
                            if (prev.includes(url)) return prev;
                            return [url, ...prev];
                          });
                          updateTheme({ heroBg: url });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Button 
                        variant={displayColorPicker === 'eventHeroBg' ? "primary" : "subtle"} 
                        style={{ 
                          width: '100%', 
                          justifyContent: 'space-between', 
                          padding: '8px 12px',
                          ...(displayColorPicker === 'eventHeroBg' ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.5)', zIndex: 1 } : {})
                        }} 
                        onClick={() => setDisplayColorPicker(displayColorPicker === 'eventHeroBg' ? false : 'eventHeroBg')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <PaintBucket size={16} style={{ marginRight: 8 }} />
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>Colore</span>
                        </div>
                        <div style={{ 
                          width: '20px', 
                          height: '20px', 
                          background: event.theme?.heroBgColor || 'var(--bg-body)', 
                          borderRadius: '4px', 
                          border: '1px solid rgba(60, 79, 118, 0.1)' 
                        }} />
                      </Button>
                      
                      {displayColorPicker === 'eventHeroBg' && (
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                          <CustomColorPicker 
                            color={event.theme?.heroBgColor || 'var(--bg-body)'} 
                            onChange={(color) => updateTheme({ heroBgColor: color })} 
                          />
                        </div>
                      )}

                      <Button 
                        variant="subtle" 
                        style={{ width: '100%', justifyContent: 'center', fontSize: '12px', marginTop: '4px' }} 
                        onClick={() => scenarioBgInputRef.current?.click()}
                      >
                        <ImageIcon size={16} style={{ marginRight: 8 }} /> Carica Immagine Sfondo
                      </Button>
                      
                      <div style={{ marginTop: '8px' }}>
                        <h4 style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Libreria Sfondi</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                          {[null, '/bg_scenario_default.jpg', ...userScenarioBgImages].map(tex => (
                            <div 
                              key={tex || 'none'}
                              onClick={() => updateTheme({ heroBg: tex || 'none' })}
                              style={{ 
                                aspectRatio: '1', 
                                background: (tex && tex !== 'none') ? `url(${tex})` : 'var(--surface-light)', 
                                backgroundSize: 'cover', 
                                borderRadius: '8px', 
                                border: (event.theme?.heroBg === tex || (tex === null && event.theme?.heroBg === 'none') || (tex === null && !event.theme?.heroBg)) ? '2px solid var(--accent)' : '1px solid rgba(60, 79, 118, 0.1)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                overflow: 'hidden',
                                color: 'var(--text-soft)'
                              }}
                            >
                              {!tex && 'No'}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {event.theme?.heroBg && event.theme?.heroBg !== 'none' && (
                      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Palette size={16} color="var(--text-soft)" />
                            <label style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: 'var(--text-soft)' }}>Opacità Immagine</label>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input 
                              type="range" 
                              className="custom-slider"
                              min="0" max="1" step="0.01" 
                              value={event.theme?.heroBgOpacity ?? 1} 
                              onChange={(e) => updateTheme({ heroBgOpacity: parseFloat(e.target.value) })}
                              style={{ 
                                flex: 1, 
                                background: `linear-gradient(to right, var(--accent) ${Math.round((event.theme?.heroBgOpacity ?? 1) * 100)}%, rgba(60, 79, 118, 0.1) ${Math.round((event.theme?.heroBgOpacity ?? 1) * 100)}%)`
                              }}
                            />
                            <span style={{ fontSize: '12px', fontWeight: 700, minWidth: '35px', textAlign: 'right' }}>{Math.round((event.theme?.heroBgOpacity ?? 1) * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px', paddingBottom: '8px' }}>
                      <h4 style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Punto di Ancoraggio</h4>
                      <p style={{ fontSize: '10px', color: 'var(--text-soft)', lineHeight: '1.4', marginBottom: '12px' }}>
                        Scegli come bloccare lo sfondo. L'immagine rimarrà fissata al punto scelto anche ridimensionando la finestra.
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', width: '120px', margin: '0 0' }}>
                        {[
                          { val: 'top left', x: 0, y: 0 }, { val: 'top', x: 1, y: 0 }, { val: 'top right', x: 2, y: 0 },
                          { val: 'left', x: 0, y: 1 }, { val: 'center', x: 1, y: 1 }, { val: 'right', x: 2, y: 1 },
                          { val: 'bottom left', x: 0, y: 2 }, { val: 'bottom', x: 1, y: 2 }, { val: 'bottom right', x: 2, y: 2 }
                        ].map(pos => {
                          const currentPos = event.theme?.heroBgPosition || 'center';
                          const mapping = {
                            'top left': {x:0, y:0}, 'top': {x:1, y:0}, 'top right': {x:2, y:0},
                            'left': {x:0, y:1}, 'center': {x:1, y:1}, 'right': {x:2, y:1},
                            'bottom left': {x:0, y:2}, 'bottom': {x:1, y:2}, 'bottom right': {x:2, y:2}
                          };
                          const s = mapping[currentPos];
                          const isActive = currentPos === pos.val;
                          
                          let Icon = Circle;
                          if (!isActive) {
                            if (pos.x > s.x && pos.y === s.y) Icon = ArrowRight;
                            else if (pos.x < s.x && pos.y === s.y) Icon = ArrowLeft;
                            else if (pos.y > s.y && pos.x === s.x) Icon = ArrowDown;
                            else if (pos.y < s.y && pos.x === s.x) Icon = ArrowUp;
                            else if (pos.x > s.x && pos.y < s.y) Icon = ArrowUpRight;
                            else if (pos.x < s.x && pos.y < s.y) Icon = ArrowUpLeft;
                            else if (pos.x > s.x && pos.y > s.y) Icon = ArrowDownRight;
                            else if (pos.x < s.x && pos.y > s.y) Icon = ArrowDownLeft;
                          }

                          return (
                            <Button
                              key={pos.val}
                              variant={isActive ? "primary" : "subtle"}
                              style={{ 
                                padding: '0', 
                                minWidth: '0', 
                                height: '36px', 
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                                border: isActive ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.2s ease'
                              }}
                              onClick={() => updateTheme({ heroBgPosition: pos.val })}
                            >
                              <Icon size={isActive ? 16 : 14} color={isActive ? "black" : "var(--text-soft)"} />
                            </Button>
                          );
                        })}
                      </div>
                    </div>
               </div>
             </Surface>
              </>
            )}
        </div>

        {/* ===================== MOBILE BOTTOM BAR ===================== */}
        <div className="mobile-toolbar-container">
           {activeMobileTab && (
             <div className="mobile-tab-panel">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                     {activeMobileTab === 'insert' ? 'Inserisci' : activeMobileTab === 'font' ? 'Font' : activeMobileTab === 'size' ? 'Dimensioni' : activeMobileTab === 'format' ? 'Formato' : activeMobileTab === 'color' ? 'Colore' : activeMobileTab === 'image_opacity' ? 'Opacità Immagine' : activeMobileTab === 'bg_invito' ? 'Sfondo Invito' : activeMobileTab === 'envelope_colors' ? 'Colori Busta' : activeMobileTab === 'envelope_liner' ? 'Interno Busta' : activeMobileTab === 'scenario_bg' ? 'Scenario' : 'Scenario' }
                  </span>
                  <button className="mobile-tab-close" onClick={() => { 
                    setActiveMobileTab(null); 
                    setIsFontExpanded(false); 
                    setIsEditingBackground(false);
                    setIsEditingLiner(false);
                    setDisplayColorPicker(false);
                  }} style={{background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex'}}><X size={20}/></button>
               </div>
               <div className="mobile-tab-content" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '1rem', boxSizing: 'border-box' }}>
                  {activeMobileTab === 'font' && selectedLayer && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', overflow: isFontExpanded ? 'hidden' : 'visible' }}>
                      {!isFontExpanded ? (
                        <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                          <div className="font-list-wrapper">
                            <div className="font-scroll-container">
                              {AVAILABLE_FONTS.slice(0, 15).map(f => (
                                 <button 
                                   key={f} 
                                   onClick={() => { updateSelectedLayer({ fontFamily: f }); loadGoogleFont(f); }} 
                                   style={{
                                     whiteSpace: 'nowrap', padding: '12px 18px', 
                                     background: selectedLayer?.fontFamily === f ? 'var(--accent)' : 'var(--surface-light)', 
                                     color: selectedLayer?.fontFamily === f ? '#ffffff' : 'var(--text-primary)', 
                                     borderRadius: '12px', border: 'none', cursor: 'pointer',
                                     display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '4px',
                                     minWidth: '130px'
                                   }}
                                 >
                                   <span style={{ fontSize: '9px', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>{f}</span>
                                   <span style={{ fontFamily: f, fontSize: '1.2rem', lineHeight: 1 }}>{getFontPreviewText(selectedLayer)}</span>
                                 </button>
                              ))}
                            </div>
                          </div>
                          <button onClick={() => setIsFontExpanded(true)} style={{background: 'var(--surface-light)', border: 'none', color: 'var(--text-primary)', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', margin: '0 0.2rem 0 0.8rem', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 12px rgba(60, 79, 118, 0.15)'}}><ChevronUp size={20}/></button>
                        </div>
                      ) : (
                        <div style={{width: '100%', height: '50vh', display: 'flex', flexDirection: 'column'}}>
                          <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column'}} className="custom-scrollbar-mini">
                             {AVAILABLE_FONTS.map(f => (
                               <button 
                                 key={f} 
                                 onClick={() => { updateSelectedLayer({ fontFamily: f }); loadGoogleFont(f); setIsFontExpanded(false); }} 
                                 style={{
                                   padding: '14px 20px', textAlign: 'left', 
                                   background: selectedLayer?.fontFamily === f ? 'var(--accent)' : 'transparent', 
                                   color: selectedLayer?.fontFamily === f ? '#ffffff' : 'var(--text-primary)', 
                                   border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', 
                                   display: 'flex', flexDirection: 'column', gap: '4px'
                                 }}
                               >
                                 <span style={{ fontSize: '10px', fontWeight: 700, opacity: selectedLayer?.fontFamily === f ? 0.7 : 0.4, textTransform: 'uppercase' }}>{f}</span>
                                 <span style={{ fontFamily: f, fontSize: '1.8rem', lineHeight: 1 }}>{getFontPreviewText(selectedLayer)}</span>
                               </button>
                             ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {activeMobileTab === 'size' && selectedLayer && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 20px', flex: 1, justifyContent: 'center' }}>
                      <div className="font-size-stepper" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem'}}>
                        <Button variant="ghost" className="stepper-btn" onClick={() => updateSelectedLayer({fontSize: Math.max(8, selectedLayer.fontSize - 1)})}><Minus size={28}/></Button>
                        <span style={{fontSize: '1.4rem', minWidth: '50px', fontWeight: 700, textAlign: 'center'}}>{selectedLayer.fontSize}px</span>
                        <Button variant="ghost" className="stepper-btn" onClick={() => updateSelectedLayer({fontSize: selectedLayer.fontSize + 1})}><Plus size={28}/></Button>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '0 10px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-soft)', fontWeight: 600 }}>A</span>
                        <input 
                          type="range" 
                          className="custom-slider"
                          min="8" 
                          max="200" 
                          step="1" 
                          value={selectedLayer.fontSize} 
                          onChange={(e) => updateSelectedLayer({ fontSize: parseInt(e.target.value) })}
                          style={{ 
                            flex: 1, 
                            background: `linear-gradient(to right, var(--accent) ${Math.max(0, Math.min(100, Math.round((selectedLayer.fontSize - 8) / 192 * 100)))}%, rgba(60, 79, 118, 0.1) ${Math.max(0, Math.min(100, Math.round((selectedLayer.fontSize - 8) / 192 * 100)))}%)`
                          }}
                        />
                        <span style={{ fontSize: '18px', color: 'var(--text-soft)', fontWeight: 600 }}>A</span>
                      </div>
                    </div>
                  )}
                  {activeMobileTab === 'format' && selectedLayer && (
                    <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flex: 1}}>
                       <Button variant="ghost" onClick={() => updateSelectedLayer({fontWeight: selectedLayer.fontWeight === 'bold' ? 'normal' : 'bold'})} style={{background: selectedLayer.fontWeight === 'bold' ? 'var(--accent)' : 'var(--surface-light)', color: selectedLayer.fontWeight === 'bold' ? '#ffffff' : 'var(--text-soft)', padding: '0.8rem'}}>
                         <Bold size={24}/>
                       </Button>
                       <Button variant="ghost" onClick={() => updateSelectedLayer({fontStyle: selectedLayer.fontStyle === 'italic' ? 'normal' : 'italic'})} style={{background: selectedLayer.fontStyle === 'italic' ? 'var(--accent)' : 'var(--surface-light)', color: selectedLayer.fontStyle === 'italic' ? '#ffffff' : 'var(--text-soft)', padding: '0.8rem'}}>
                         <Italic size={24}/>
                       </Button>
                       <Button variant="ghost" onClick={() => updateSelectedLayer({textDecoration: selectedLayer.textDecoration === 'underline' ? 'none' : 'underline'})} style={{background: selectedLayer.textDecoration === 'underline' ? 'var(--accent)' : 'var(--surface-light)', color: selectedLayer.textDecoration === 'underline' ? '#ffffff' : 'var(--text-soft)', padding: '0.8rem'}}>
                         <Underline size={24}/>
                       </Button>
                    </div>
                  )}
                  {activeMobileTab === 'color' && selectedLayer && (
                    <div style={{flex: 1, width: '100%'}}>
                      <CustomColorPicker color={selectedLayer.color} onChange={(color) => updateSelectedLayer({ color })} />
                    </div>
                  )}
                  {activeMobileTab === 'image_opacity' && selectedLayer && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 20px', flex: 1, justifyContent: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '0 10px' }}>
                        <Palette size={18} color="var(--text-soft)" />
                        <input 
                          type="range" 
                          className="custom-slider"
                          min="0" 
                          max="1" 
                          step="0.01" 
                          value={selectedLayer.opacity !== undefined ? selectedLayer.opacity : 1} 
                          onChange={(e) => updateSelectedLayer({ opacity: parseFloat(e.target.value) })}
                          style={{ 
                            flex: 1,
                            background: `linear-gradient(to right, var(--accent) ${Math.round((selectedLayer.opacity ?? 1) * 100)}%, rgba(60, 79, 118, 0.1) ${Math.round((selectedLayer.opacity ?? 1) * 100)}%)`
                          }}
                        />
                        <span style={{ fontSize: '14px', color: 'var(--text-soft)', fontWeight: 700, minWidth: '40px', textAlign: 'right' }}>
                          {Math.round((selectedLayer.opacity !== undefined ? selectedLayer.opacity : 1) * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                  {activeMobileTab === 'bg_invito' && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       <div style={{ display: 'flex', gap: '8px' }}>
                          <Button 
                            variant={displayColorPicker === "canvasBg" ? "primary" : "subtle"} 
                            style={{ 
                              flex: 1, 
                              fontSize: '12px',
                              justifyContent: 'space-between',
                              ...(displayColorPicker === 'canvasBg' ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.5)', zIndex: 1 } : {})
                            }} 
                            onClick={() => setDisplayColorPicker(displayColorPicker === 'canvasBg' ? false : 'canvasBg')}
                          >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <PaintBucket size={14} style={{ marginRight: 6 }} />
                              <span>Colore</span>
                            </div>
                            <div style={{ width: '16px', height: '16px', background: (canvasProps.bgColor || '#ffffff'), borderRadius: '3px', border: '1px solid var(--border)' }} />
                          </Button>
                          <Button 
                            variant="subtle" 
                            style={{ flex: 1, fontSize: '12px' }} 
                            onClick={() => invitoBgInputRef.current?.click()}
                          >
                            <ImageIcon size={14} style={{ marginRight: 6 }} /> Immagine
                          </Button>
                       </div>
                       {displayColorPicker === 'canvasBg' && (
                         <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                           <CustomColorPicker color={canvasProps.bgColor || '#ffffff'} onChange={(color) => setCanvasProps(prev => ({ ...prev, bgColor: color }))} />
                         </div>
                       )}
                       {canvasProps.bgImage && (
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                            {/* Nuova sezione Opacità direttamente nel pannello Mobile */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 4px' }}>
                              <Palette size={16} color="var(--text-soft)" />
                              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-soft)', minWidth: '55px' }}>Opacità Immagine</span>
                               <input 
                                 type="range" 
                                 className="custom-slider"
                                 min="0" max="1" step="0.01" 
                                 value={canvasProps.bgOpacity ?? 1} 
                                 onChange={(e) => setCanvasProps(prev => ({ ...prev, bgOpacity: parseFloat(e.target.value) }))}
                                 style={{ 
                                   flex: 1, 
                                   background: `linear-gradient(to right, var(--accent) ${Math.round((canvasProps.bgOpacity ?? 1) * 100)}%, rgba(60, 79, 118, 0.1) ${Math.round((canvasProps.bgOpacity ?? 1) * 100)}%)`
                                 }}
                               />
                              <span style={{ fontSize: '11px', fontWeight: 700, minWidth: '35px', textAlign: 'right' }}>{Math.round((canvasProps.bgOpacity ?? 1) * 100)}%</span>
                            </div>

                            <Button 
                              variant={isEditingBackground ? "primary" : "subtle"} 
                              style={{ 
                                width: '100%', 
                                justifyContent: 'center',
                                ...(isEditingBackground ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.5)', zIndex: 1 } : {})
                              }} 
                              onClick={() => setIsEditingBackground(!isEditingBackground)}
                            >
                              <Move size={16} style={{ marginRight: 8 }} /> {isEditingBackground ? "Salva Posizione" : "Regola Posizione"}
                            </Button>

                            {/* Hint per mobile quando in modalità regolazione - Spostato qui sotto per migliore visibilità */}
                            {isEditingBackground && (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: '8px', 
                                padding: '6px 10px', 
                                background: 'rgba(var(--accent-rgb), 0.1)', 
                                borderRadius: '8px',
                                border: '1px solid rgba(var(--accent-rgb), 0.2)',
                                marginTop: '-2px'
                              }}>
                                <Sparkles size={14} color="var(--accent)" />
                                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent)' }}>
                                  Pizzica per zoomare • Trascina sull'invito per spostare
                                </span>
                              </div>
                            )}
                            <Button 
                              variant="ghost" 
                              style={{ width: '100%', justifyContent: 'center', color: 'salmon', fontSize: '12px' }} 
                              onClick={() => setCanvasProps(prev => ({ ...prev, bgImage: null }))}
                            >
                              Rimuovi Immagine
                            </Button>
                         </div>
                       )}
                    </div>
                  )}
                   {activeMobileTab === 'scenario_bg' && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     {showMobileAnchorGrid ? (
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                         <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                           <Button 
                             variant="ghost" 
                             style={{ padding: '0 8px', height: '32px' }} 
                             onClick={() => setShowMobileAnchorGrid(false)}
                           >
                             <ArrowLeft size={14} />
                           </Button>
                           <h4 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-soft)', flex: 1, textAlign: 'center', marginRight: '32px' }}>Punto di Ancoraggio</h4>
                         </div>
                         <p style={{ fontSize: '9px', color: 'var(--text-soft)', lineHeight: '1.2', textAlign: 'center', marginBottom: '4px', padding: '0 16px' }}>
                           Scegli la porzione di immagine da mantenere visibile a prescindere dalle dimensioni dello schermo.
                         </p>
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', width: '45%' }}>
                           {[
                             { val: 'top left', x: 0, y: 0 }, { val: 'top', x: 1, y: 0 }, { val: 'top right', x: 2, y: 0 },
                             { val: 'left', x: 0, y: 1 }, { val: 'center', x: 1, y: 1 }, { val: 'right', x: 2, y: 1 },
                             { val: 'bottom left', x: 0, y: 2 }, { val: 'bottom', x: 1, y: 2 }, { val: 'bottom right', x: 2, y: 2 }
                           ].map(pos => {
                             const currentPos = event.theme?.heroBgPosition || 'center';
                             const mapping = {
                               'top left': {x:0, y:0}, 'top': {x:1, y:0}, 'top right': {x:2, y:0},
                               'left': {x:0, y:1}, 'center': {x:1, y:1}, 'right': {x:2, y:1},
                               'bottom left': {x:0, y:2}, 'bottom': {x:1, y:2}, 'bottom right': {x:2, y:2}
                             };
                             const s = mapping[currentPos];
                             const isActive = currentPos === pos.val;
                             
                             let Icon = Circle;
                             if (!isActive) {
                               if (pos.x > s.x && pos.y === s.y) Icon = ArrowRight;
                               else if (pos.x < s.x && pos.y === s.y) Icon = ArrowLeft;
                               else if (pos.y > s.y && pos.x === s.x) Icon = ArrowDown;
                               else if (pos.y < s.y && pos.x === s.x) Icon = ArrowUp;
                               else if (pos.x > s.x && pos.y < s.y) Icon = ArrowUpRight;
                               else if (pos.x < s.x && pos.y < s.y) Icon = ArrowUpLeft;
                               else if (pos.x > s.x && pos.y > s.y) Icon = ArrowDownRight;
                               else if (pos.x < s.x && pos.y > s.y) Icon = ArrowDownLeft;
                             }

                             return (
                               <Button
                                 key={pos.val}
                                 variant={isActive ? "primary" : "subtle"}
                                 style={{ 
                                   padding: '0', 
                                   minWidth: '0', 
                                   aspectRatio: '1', 
                                   borderRadius: '4px',
                                   display: 'flex',
                                   alignItems: 'center',
                                   justifyContent: 'center',
                                   background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                                   border: isActive ? 'none' : '1px solid rgba(255,255,255,0.05)'
                                 }}
                                 onClick={() => updateTheme({ heroBgPosition: pos.val })}
                               >
                                 <Icon size={isActive ? 16 : 14} color={isActive ? "black" : "var(--text-soft)"} />
                               </Button>
                             );
                           })}
                         </div>
                       </div>
                     ) : (
                       <>
                         <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <Button 
                              variant="subtle" 
                              style={{ flex: 1, fontSize: '11px', height: '36px', justifyContent: 'center' }} 
                              onClick={() => scenarioBgInputRef.current?.click()}
                            >
                              <ImageIcon size={14} style={{ marginRight: 6 }} /> Carica Foto
                            </Button>
                            <input 
                              type="file" 
                              ref={scenarioBgInputRef} 
                              style={{ display: 'none' }} 
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (re) => {
                                    const url = re.target.result;
                                    setUserScenarioBgImages(prev => {
                                      if (prev.includes(url)) return prev;
                                      return [url, ...prev];
                                    });
                                    updateTheme({ heroBg: url });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <div style={{ flex: 2 }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                                 {[null, '/bg_scenario_default.jpg', ...userScenarioBgImages].slice(0, 5).map(tex => (
                                  <div 
                                    key={tex || 'none'}
                                    onClick={() => updateTheme({ heroBg: tex || 'none' })}
                                    style={{
                                      aspectRatio: '1', 
                                      background: (tex && tex !== 'none') ? `url(${tex})` : 'var(--surface-light)', 
                                      backgroundSize: 'cover', 
                                      borderRadius: '4px', 
                                      border: (event.theme?.heroBg === tex || (tex === null && event.theme?.heroBg === 'none') || (tex === null && !event.theme?.heroBg) ) ? '2px solid var(--accent)' : '1px solid rgba(60, 79, 118, 0.1)', 
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '9px',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    {!tex && 'No'}
                                  </div>
                                ))}
                              </div>
                            </div>
                         </div>

                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
                           <div style={{ flex: 1 }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                               <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-soft)' }}>Opacità</label>
                               <span style={{ fontSize: '10px', fontWeight: 600 }}>{Math.round((event.theme?.heroBgOpacity ?? 1) * 100)}%</span>
                             </div>
                             <input 
                               type="range" 
                               className="custom-slider"
                               min="0" max="1" step="0.01" 
                               value={event.theme?.heroBgOpacity ?? 1} 
                               onChange={(e) => updateTheme({ heroBgOpacity: parseFloat(e.target.value) })}
                               style={{ 
                                 width: '100%', 
                                 background: `linear-gradient(to right, var(--accent) ${Math.round((event.theme?.heroBgOpacity ?? 1) * 100)}%, rgba(60, 79, 118, 0.1) ${Math.round((event.theme?.heroBgOpacity ?? 1) * 100)}%)`
                               }}
                             />
                           </div>
                           
                           <Button
                             variant={displayColorPicker === 'eventHeroBgMobile' ? "primary" : "subtle"}
                             style={{ 
                               height: '36px', 
                               padding: '0 12px', 
                               fontSize: '11px',
                               ...(displayColorPicker === 'eventHeroBgMobile' ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.3)' } : {})
                             }}
                             onClick={() => setDisplayColorPicker(displayColorPicker === 'eventHeroBgMobile' ? false : 'eventHeroBgMobile')}
                           >
                             <PaintBucket size={14} style={{ marginRight: 6 }} /> Colore
                             <div style={{ width: '14px', height: '14px', background: (event.theme?.heroBgColor || 'var(--bg-body)'), borderRadius: '2px', marginLeft: 8, border: '1px solid rgba(255,255,255,0.2)' }} />
                           </Button>
                         </div>

                         {displayColorPicker === 'eventHeroBgMobile' && (
                           <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '4px' }}>
                             <CustomColorPicker color={event.theme?.heroBgColor || 'var(--bg-body)'} onChange={(color) => updateTheme({ heroBgColor: color })} />
                           </div>
                         )}

                         <Button 
                           variant={showMobileAnchorGrid ? "primary" : "subtle"} 
                           style={{ 
                             fontSize: '11px', 
                             height: '36px',
                             width: '100%',
                             justifyContent: 'center', 
                             marginTop: '4px',
                             ...(showMobileAnchorGrid ? { boxShadow: '0 0 10px rgba(var(--accent-rgb), 0.3)' } : {})
                           }}
                           onClick={() => setShowMobileAnchorGrid(true)}
                         >
                            <Move size={14} style={{ marginRight: 6 }} /> Regola Posizione
                         </Button>
                       </>
                     )}
                     </div>
                   )}


                    {activeMobileTab === 'envelope_colors' && (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                         <div style={{ display: 'flex', gap: '8px' }}>
                            <Button 
                              variant={displayColorPicker === "coverBg" ? "primary" : "subtle"} 
                              style={{ 
                                flex: 1, 
                                fontSize: '12px',
                                justifyContent: 'space-between',
                                ...(displayColorPicker === 'coverBg' ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.5)', zIndex: 1 } : {})
                              }} 
                              onClick={() => setDisplayColorPicker(displayColorPicker === 'coverBg' ? false : 'coverBg')}
                            >
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <PaintBucket size={14} style={{ marginRight: 6 }} />
                                <span>Principale</span>
                              </div>
                              <div style={{ width: '16px', height: '16px', background: (event.theme?.coverBg || '#54392d'), borderRadius: '3px', border: '1px solid var(--border)' }} />
                            </Button>
                            <Button 
                              variant={displayColorPicker === "coverPocket" ? "primary" : "subtle"} 
                              style={{ 
                                flex: 1, 
                                fontSize: '12px',
                                justifyContent: 'space-between',
                                ...(displayColorPicker === 'coverPocket' ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.5)', zIndex: 1 } : {})
                              }} 
                              onClick={() => setDisplayColorPicker(displayColorPicker === 'coverPocket' ? false : 'coverPocket')}
                            >
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <PaintBucket size={14} style={{ marginRight: 6 }} />
                                <span>Tasca</span>
                              </div>
                              <div style={{ width: '16px', height: '16px', background: (event.theme?.coverPocketColor || event.theme?.coverBg || '#54392d'), borderRadius: '3px', border: '1px solid var(--border)' }} />
                            </Button>
                         </div>
                         {displayColorPicker === 'coverBg' && (
                           <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                             <CustomColorPicker color={event.theme?.coverBg || '#54392d'} onChange={(color) => updateTheme({ coverBg: color })} />
                           </div>
                         )}
                         {displayColorPicker === 'coverPocket' && (
                           <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                             <CustomColorPicker color={event.theme?.coverPocketColor || event.theme?.coverBg || '#54392d'} onChange={(color) => updateTheme({ coverPocketColor: color })} />
                           </div>
                         )}
                       </div>
                     )}

                    {activeMobileTab === 'envelope_liner' && (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                         <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <Button 
                              variant="subtle" 
                              style={{ flex: 1, fontSize: '11px', height: '36px', justifyContent: 'center' }} 
                              onClick={() => textureInputRef.current?.click()}
                            >
                              <ImageIcon size={14} style={{ marginRight: 6 }} /> Carica Foto
                            </Button>
                            <div style={{ flex: 2 }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                                 {[null, '/minimal_pink_liner.png', ...userLinerImages].slice(0, 5).map(tex => (
                                  <div 
                                    key={tex || 'none'}
                                    onClick={() => updateTheme({ coverLiner: tex || 'none', coverPocketLiner: tex || 'none' })}
                                    style={{
                                      aspectRatio: '1', 
                                      background: (tex && tex !== 'none') ? `url(${tex})` : 'var(--surface-light)', 
                                      backgroundSize: 'cover', 
                                      borderRadius: '4px', 
                                      border: (event.theme?.coverLiner === tex || (tex === null && event.theme?.coverLiner === 'none')) ? '2px solid var(--accent)' : '1px solid rgba(60, 79, 118, 0.1)', 
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '9px',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    {!tex && 'No'}
                                  </div>
                                ))}
                              </div>
                            </div>
                         </div>

                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
                           <div style={{ flex: 1 }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                               <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-soft)' }}>Opacità</label>
                               <span style={{ fontSize: '10px', fontWeight: 600 }}>{Math.round((event.theme?.linerOpacity ?? 1) * 100)}%</span>
                             </div>
                             <input 
                               type="range" 
                               className="custom-slider"
                               min="0" max="1" step="0.01" 
                               value={event.theme?.linerOpacity ?? 1} 
                               onChange={(e) => updateTheme({ linerOpacity: parseFloat(e.target.value) })}
                               style={{ 
                                 width: '100%', 
                                 background: `linear-gradient(to right, var(--accent) ${Math.round((event.theme?.linerOpacity ?? 1) * 100)}%, rgba(60, 79, 118, 0.1) ${Math.round((event.theme?.linerOpacity ?? 1) * 100)}%)`
                               }}
                             />
                           </div>
                           
                           <Button
                             variant={displayColorPicker === 'coverLiner' ? "primary" : "subtle"}
                             style={{ 
                               height: '36px', 
                               padding: '0 12px', 
                               fontSize: '11px',
                               ...(displayColorPicker === 'coverLiner' ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.3)' } : {})
                             }}
                             onClick={() => setDisplayColorPicker(displayColorPicker === 'coverLiner' ? false : 'coverLiner')}
                           >
                             <PaintBucket size={14} style={{ marginRight: 6 }} /> Colore
                             <div style={{ width: '14px', height: '14px', background: (event.theme?.coverLinerColor || '#ffffff'), borderRadius: '2px', marginLeft: 8, border: '1px solid rgba(255,255,255,0.2)' }} />
                           </Button>
                         </div>

                         <Button 
                           variant={isEditingLiner ? "primary" : "subtle"} 
                           style={{ 
                             fontSize: '11px', 
                             height: '36px',
                             width: '100%',
                             justifyContent: 'center', 
                             marginTop: '4px',
                             ...(isEditingLiner ? { boxShadow: '0 0 10px rgba(var(--accent-rgb), 0.3)' } : {})
                           }}
                           onClick={() => {
                             setIsEditingLiner(!isEditingLiner);
                             setIsEnvelopeOpen(true);
                           }}
                         >
                            {isEditingLiner ? <Check size={14} style={{ marginRight: 6 }} /> : <Move size={14} style={{ marginRight: 6 }} />}
                            {isEditingLiner ? "Salva" : "Regola Posizione"}
                         </Button>

                          {isEditingLiner && (
                             <div style={{ 
                               display: 'flex', 
                               alignItems: 'center', 
                               justifyContent: 'center',
                               gap: '8px', 
                               padding: '6px 10px', 
                               background: 'rgba(var(--accent-rgb), 0.1)', 
                               borderRadius: '8px',
                               border: '1px solid rgba(var(--accent-rgb), 0.2)',
                               marginTop: '4px'
                             }}>
                               <Sparkles size={14} color="var(--accent)" />
                               <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent)' }}>
                                 Pizzica per zoomare • Trascina per spostare
                               </span>
                             </div>
                          )}

                         {displayColorPicker === 'coverLiner' && (
                           <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                              <CustomColorPicker color={event.theme?.coverLinerColor || '#ffffff'} onChange={(color) => updateTheme({ coverLinerColor: color })} />
                           </div>
                         )}
                      </div>
                    )}
                </div>
              </div>
            )}

           <div className="mobile-toolbar">
              {selectedLayer && editorMode === 'canvas' ? (
                 <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%', padding: '4px 0' }}>
                   {(!selectedLayer.type || selectedLayer.type === 'text') ? (
                     <>
                       <MobileIconBtn 
                         icon={Type} 
                         label="Modifica" 
                         variant={selectedLayer.type === 'text' ? 'primary' : 'ghost'}
                         onClick={() => setEditingLayerId(selectedLayer.id)} 
                       />
                       <MobileIconBtn icon={Baseline} label="Font" onClick={() => setActiveMobileTab(activeMobileTab === 'font' ? null : 'font')} />
                       <MobileIconBtn icon={Settings2} label="Dimensioni" onClick={() => setActiveMobileTab(activeMobileTab === 'size' ? null : 'size')} />
                       <MobileIconBtn icon={Bold} label="Formato" onClick={() => setActiveMobileTab(activeMobileTab === 'format' ? null : 'format')} />
                       <MobileIconBtn icon={PaintBucket} label="Colore" onClick={() => setActiveMobileTab(activeMobileTab === 'color' ? null : 'color')} />
                     </>
                   ) : (
                     <>
                       <MobileIconBtn icon={Palette} label="Opacità" onClick={() => setActiveMobileTab(activeMobileTab === 'image_opacity' ? null : 'image_opacity')} />
                     </>
                   )}
                   <MobileIconBtn icon={Trash2} label="Elimina" onClick={deleteSelectedLayers} style={{ color: 'salmon' }} />
                 </div>
              ) : !activeMobileTab && (
                 <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
                    <div style={{ padding: '8px 10px 4px', fontSize: '10px', color: 'var(--text-soft)', textAlign: 'center' }}>
                      {editorMode === 'envelope' ? "Personalizza la tua busta" : 
                       editorMode === 'background' ? "Personalizza lo scenario" : 
                       "Seleziona o aggiungi un elemento"}
                    </div>
                      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%', padding: '4px 0' }}>
                        {editorMode === 'envelope' ? (
                          <>
                            <MobileIconBtn 
                              icon={isEnvelopeOpen ? Mail : MailOpen} 
                              label={isEnvelopeOpen ? "Chiudi Busta" : "Apri Busta"}
                              variant={isEnvelopeOpen ? 'primary' : 'ghost'}
                              onClick={() => setIsEnvelopeOpen(!isEnvelopeOpen)}
                            />
                            <MobileIconBtn icon={Palette} label="Colori" onClick={() => setActiveMobileTab("envelope_colors")} />
                            <MobileIconBtn 
                              icon={Shapes} 
                              label="Interno" 
                              onClick={() => {
                                setActiveMobileTab("envelope_liner");
                                if (!isEnvelopeOpen) setIsEnvelopeOpen(true);
                              }} 
                            />
                          </>
                        ) : editorMode === 'background' ? (
                          <>
                            <MobileIconBtn 
                              icon={Shapes} 
                              label="Sfondo" 
                              variant={activeMobileTab === 'scenario_bg' ? 'primary' : 'ghost'}
                              onClick={() => setActiveMobileTab('scenario_bg')} 
                            />
                          </>
                        ) : (
                          <>
                            <MobileIconBtn icon={Shapes} label="Sfondo" onClick={() => setActiveMobileTab("bg_invito")} />
                            <MobileIconBtn icon={Type} label="Testo" onClick={addTextLayer} />
                            <MobileIconBtn icon={ImageIcon} label="Foto" onClick={() => fileInputRef.current?.click()} />
                          </>
                        )}
                      </div>
                 </div>
              )}
           </div>

          
        </div>
        {/* ========================================================== */}

        {/* CENTRO: STAGE */}
        <div 
          className="editor-canvas-stage" 
          ref={stageRef}
          style={{ 
            transition: 'background 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onPointerDown={(e) => {
             if (window.innerWidth <= 768 || editorMode !== 'canvas' || isEditingBackground) return;
             
             const canvasRect = canvasRef.current.getBoundingClientRect();
             const scale = canvasRect.width / canvasProps.width;
             const mx = (e.clientX - canvasRect.left) / scale;
             const my = (e.clientY - canvasRect.top) / scale;

             // Deseleziona tutto se clicco sul vuoto (ma non se sto ridimensionando o trascinando)
             if (e.target.classList.contains('editor-canvas-stage')) {
                 setSelectedLayerIds([]);
                 setEditingLayerId(null);
                 setActiveMobileTab(null);
                 setDisplayColorPicker(false);

                 const box = { startX: mx, startY: my, currentX: mx, currentY: my };
                 selectionBoxRef.current = box;
                 setSelectionBox(box);
                 setSelectedLayerIds([]);
                 setEditingLayerId(null);
             }
          }}
        >
          {/* Sfondo colorato di base situato SOTTO l'immagine */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: event.theme?.heroBgColor || 'var(--bg-body)',
            zIndex: 0,
            pointerEvents: 'none'
          }} />

          {/* Layer Sfondo Scenario con Opacità */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: (event.theme?.heroBg && (event.theme.heroBg.startsWith('#') || event.theme.heroBg.startsWith('rgb'))) 
              ? event.theme.heroBg 
              : 'transparent',
            backgroundImage: (event.theme?.heroBg && !event.theme.heroBg.startsWith('#') && !event.theme.heroBg.startsWith('rgb')) 
              ? `url(${event.theme.heroBg})` 
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: event.theme?.heroBgPosition || 'center',
            opacity: (event.theme?.heroBgOpacity ?? 1),
            zIndex: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease'
          }} />
          {editorMode === 'envelope' ? (() => {
            
            return (
              <div className="envelope-preview-container" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EnvelopeAnimation 
                     envelopeColor={event.theme?.coverBg || '#54392d'}
                     linerImg={event.theme?.coverLiner || '/minimal_pink_liner.png'}
                     pocketColor={event.theme?.coverPocketColor || event.theme?.coverBg || '#54392d'}
                     pocketLinerImg={event.theme?.coverPocketLiner}
                     canvasProps={canvasProps}
                     editMode={true}
                     manualPhase={isEnvelopeOpen ? 'flap_open' : 'closed'}
                     linerX={event.theme?.linerX || 0}
                     linerY={event.theme?.linerY || 0}
                     linerScale={event.theme?.linerScale || 1}
                     linerOpacity={event.theme?.linerOpacity ?? 1}
                     linerColor={event.theme?.coverLinerColor || '#ffffff'}
                     isEditingLiner={isEditingLiner}
                     scale={isMobile ? envelopeScale : 1}
                     onLinerChange={(changes) => {
                       const themeUpdates = {};
                       if (changes.x !== undefined) themeUpdates.linerX = changes.x;
                       if (changes.y !== undefined) themeUpdates.linerY = changes.y;
                       if (changes.scale !== undefined) themeUpdates.linerScale = changes.scale;
                       if (changes.opacity !== undefined) themeUpdates.linerOpacity = changes.opacity;
                       if (changes.editMode === false) setIsEditingLiner(false);
                       updateTheme(themeUpdates);
                     }}
                  >
                    <ReadOnlyCanvas 
                       layers={layers} 
                       canvasProps={canvasProps} 
                    />
                  </EnvelopeAnimation>
                </div>
              </div>
            );
          })() : editorMode === 'background' ? (() => {
             
             // Base dimensions for the invitation
             const invWidth = canvasProps.width;
             const invHeight = canvasProps.height;
             
             // Base dimensions for the envelope (approximate based on animation)
             const envWidth = canvasProps.width * 1.05;
             const envHeight = canvasProps.height * 1.5;

             return (
              <div className="scenario-preview-container" style={{ 
                flex: 1, 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                position: 'relative', 
                minHeight: 0,
                overflow: 'hidden'
              }}>
                {/* COMPOSITION WRAPPER: Centers the entire set and scales it as one */}
                 <div className="scenario-composition" style={{
                   position: 'relative',
                   display: 'flex',
                   flexDirection: 'row',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '-60px', // Fixed gap for pixel-perfect overlap
                   transform: `scale(${scenarioScale})`, // DYNAMIC SCALE
                   transformOrigin: 'center center',
                   transition: 'all 0.3s ease'
                 }}>
                  {/* INVITO (SINISTRA) */}
                  <div style={{ 
                    position: 'relative',
                    pointerEvents: 'none', 
                    boxShadow: '0 20px 60px rgba(0,0,0,0.25)', // Slightly deeper shadow
                    zIndex: 10,
                    flexShrink: 0,
                    width: invWidth,
                    height: invHeight,
                    background: canvasProps.bgColor || '#fff'
                  }}>
                    <ReadOnlyCanvas layers={layers} canvasProps={canvasProps} />
                  </div>

                  {/* BUSTA (DESTRA / DIETRO) */}
                  <div style={{ 
                    position: 'relative',
                    pointerEvents: 'none', 
                    zIndex: 5,
                    flexShrink: 0,
                     transform: 'translateX(-10%) translateY(25%) scale(1.5)', // Fixed transform for consistency
                  }}>
                    <EnvelopeAnimation 
                      envelopeColor={event.theme?.coverBg || '#54392d'}
                      linerImg={event.theme?.coverLiner || '/minimal_pink_liner.png'}
                      pocketColor={event.theme?.coverPocketColor || event.theme?.coverBg || '#54392d'}
                      pocketLinerImg={event.theme?.coverPocketLiner}
                      linerX={event.theme?.linerX || 0}
                      linerY={event.theme?.linerY || 0}
                      linerScale={event.theme?.linerScale || 1}
                      linerOpacity={event.theme?.linerOpacity ?? 1}
                      linerColor={event.theme?.coverLinerColor || '#ffffff'}
                      canvasProps={canvasProps}
                      manualPhase="flap_open"
                      preview={true}
                    >
                      {/* empty for scenario preview */}
                    </EnvelopeAnimation>
                  </div>
                </div>
              </div>
             );
          })() : (
             <div style={{ width: canvasProps.width * stageScale, height: canvasProps.height * stageScale, position: 'relative', margin: 'auto' }}>
                {/* Su Desktop mostriamo ancora il banner, ma su Mobile lo rimuoviamo per non coprire l'invito */}
                {isEditingBackground && window.innerWidth > 768 && (
                  <div style={{
                    position: 'absolute',
                    top: '-100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    padding: '10px 20px',
                    borderRadius: '40px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: '1px solid var(--accent)',
                    pointerEvents: 'auto',
                    whiteSpace: 'nowrap',
                    width: 'max-content',
                    maxWidth: '90vw',
                    justifyContent: 'center'
                  }}>
                    <div style={{ background: 'var(--accent)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                       <Sparkles size={18}/>
                    </div>
                     <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Regolazione Sfondo</span>
                      <span style={{ fontSize: '10px', color: '#666' }}>Trascina per posizionare • Scali con gli angoli</span>
                    </div>
                    <div style={{ width: '1px', height: '30px', background: 'rgba(0,0,0,0.1)', margin: '0 5px' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '5px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: '#666' }}>Opacità Immagine</span>
                       <input 
                         type="range" 
                         className="custom-slider"
                         min="0" max="1" step="0.01" 
                         value={canvasProps.bgOpacity ?? 1} 
                         onChange={(e) => setCanvasProps(prev => ({ ...prev, bgOpacity: parseFloat(e.target.value) }))}
                         onPointerDown={(e) => e.stopPropagation()}
                         style={{ 
                           width: '80px', 
                           background: `linear-gradient(to right, var(--accent) ${Math.round((canvasProps.bgOpacity ?? 1) * 100)}%, rgba(60, 79, 118, 0.1) ${Math.round((canvasProps.bgOpacity ?? 1) * 100)}%)`
                         }}
                       />
                      <span style={{ fontSize: '10px', fontWeight: 700, minWidth: '25px', color: '#ffffff' }}>{Math.round((canvasProps.bgOpacity ?? 1) * 100)}%</span>
                    </div>
                  </div>
                )}
               <div className="canvas-scaler" style={{ transform: `scale(${stageScale})`, transformOrigin: 'top left', transition: 'transform 0.2s ease-out', position: 'absolute', top: 0, left: 0 }}>
                <div 
                 ref={canvasRef}
                 className="artboard" 
                 style={{ 
                   width: canvasProps.width, 
                   height: canvasProps.height,
                    backgroundColor: canvasProps.bgColor || '#ffffff',
                    position: 'relative',
                    overflow: isEditingBackground ? 'visible' : 'hidden',
                    
                    zIndex: isEditingBackground ? 50 : 1
                  }}
                 onPointerDown={(e) =>  {
                    stateBeforeActionRef.current = latestStateRef.current;
                   if (isEditingBackground) {
                     e.stopPropagation();
                     e.currentTarget.setPointerCapture(e.pointerId);
                     
                     if (!window._bgPointers) window._bgPointers = new Map();
                     window._bgPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

                     const initX = canvasProps.bgX || 0;
                     const initY = canvasProps.bgY || 0;
                     const initScale = canvasProps.bgScale || 1;
                     
                     let startX = e.clientX;
                     let startY = e.clientY;
                     let initialDist = 0;
                     
                     const handleMove = (moveEvent) => {
                        if (!window._bgPointers.has(moveEvent.pointerId)) return;
                        window._bgPointers.set(moveEvent.pointerId, { x: moveEvent.clientX, y: moveEvent.clientY });
                        
                        const pointers = Array.from(window._bgPointers.values());
                        
                        if (pointers.length === 2) {
                           const dist = Math.sqrt(
                             Math.pow(pointers[1].x - pointers[0].x, 2) + 
                             Math.pow(pointers[1].y - pointers[0].y, 2)
                           );
                           if (initialDist === 0) { initialDist = dist; return; }
                           const scaleFactor = dist / initialDist;
                           const newScale = Math.max(0.1, initScale * scaleFactor);
                           setCanvasProps(prev => ({ ...prev, bgScale: newScale }));
                        } else if (pointers.length === 1) {
                           let dx = (moveEvent.clientX - startX) / stageScale;
                           let dy = (moveEvent.clientY - startY) / stageScale;
                           
                           let nx = initX + dx;
                           let ny = initY + dy;
                           const curW = bgNaturalSize.w * (canvasProps.bgScale || 1);
                           const curH = bgNaturalSize.h * (canvasProps.bgScale || 1);
                           
                           const SNAP_THRESHOLD = 15;
                           let newGuides = [];
                           
                           if (Math.abs(nx) < SNAP_THRESHOLD) { nx = 0; newGuides.push({ axis: 'x', position: 0 }); }
                           else if (Math.abs(nx + curW - canvasProps.width) < SNAP_THRESHOLD) { nx = canvasProps.width - curW; newGuides.push({ axis: 'x', position: canvasProps.width }); }
                           else if (Math.abs(nx + curW/2 - canvasProps.width/2) < SNAP_THRESHOLD) { nx = (canvasProps.width - curW) / 2; newGuides.push({ axis: 'x', position: canvasProps.width/2 }); }
                           
                           if (Math.abs(ny) < SNAP_THRESHOLD) { ny = 0; newGuides.push({ axis: 'y', position: 0 }); }
                           else if (Math.abs(ny + curH - canvasProps.height) < SNAP_THRESHOLD) { ny = canvasProps.height - curH; newGuides.push({ axis: 'y', position: canvasProps.height }); }
                           else if (Math.abs(ny + curH/2 - canvasProps.height/2) < SNAP_THRESHOLD) { ny = (canvasProps.height - curH) / 2; newGuides.push({ axis: 'y', position: canvasProps.height/2 }); }

                           setSnapGuides(newGuides);
                           setCanvasProps(prev => ({ ...prev, bgX: nx, bgY: ny }));
                        }
                     };
                     
                     const handleUp = (upEvent) => {
                        if (window._bgPointers) window._bgPointers.delete(upEvent.pointerId);
                        if (!window._bgPointers || window._bgPointers.size === 0) {
                           setSnapGuides([]);
                           window.removeEventListener('pointermove', handleMove);
                           window.removeEventListener('pointerup', handleUp);
                           window.removeEventListener('pointercancel', handleUp);
                           // History push if background changed
                           const nowState = latestStateRef.current;
                           const old = stateBeforeActionRef.current?.canvas || {};
                           const cur = nowState.canvas || {};
                           if (Math.abs((old.bgX||0) - (cur.bgX||0)) > 1 || 
                               Math.abs((old.bgY||0) - (cur.bgY||0)) > 1 || 
                               Math.abs((old.bgScale||1) - (cur.bgScale||1)) > 0.001) {
                               pushToHistory(stateBeforeActionRef.current);
                               setIsDirty(true);
                           }
                        }
                     };
                     
                     window.addEventListener('pointermove', handleMove);
                     window.addEventListener('pointerup', handleUp);
                     window.addEventListener('pointercancel', handleUp);
                     return;
                   }

                    if (e.target.closest('.canvas-layer')) return;

                    // Salvataggio manuale se stiamo chiudendo la modifica cliccando sullo sfondo
                    if (editingLayerId) {
                      const el = document.getElementById(`layer-content-${editingLayerId}`);
                      if (el) {
                        const updatedText = el.innerHTML || "Testo Vuoto";
                        setLayers(prev => prev.map(l => l.id === editingLayerId ? { ...l, text: updatedText } : l));
                        setIsDirty(true);
                      }
                    }

                    setSelectedLayerIds([]);
                    setEditingLayerId(null);
                    setActiveMobileTab(null);
                    setIsFontExpanded(false);
                   if(canvasRef.current && window.innerWidth > 768) {
                       e.currentTarget.setPointerCapture(e.pointerId);
                       const canvasRect = canvasRef.current.getBoundingClientRect();
                       const scale = canvasRect.width / canvasProps.width;
                       const mx = (e.clientX - canvasRect.left) / scale;
                       const my = (e.clientY - canvasRect.top) / scale;
                       const box = { startX: mx, startY: my, currentX: mx, currentY: my };
                       selectionBoxRef.current = box;
                       setSelectionBox(box);
                   }
                 }}
                >
                  {/* Bordo rosso prominente sempre in primo piano durante la regolazione */}
                  {isEditingBackground && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      border: '2px solid #FF007F',
                      pointerEvents: 'none',
                      zIndex: 10000
                    }} />
                  )}
                 
                 {canvasProps.bgImage && (
                   <div 
                     style={{
                       position: 'absolute',
                       left: canvasProps.bgX || 0,
                       top: canvasProps.bgY || 0,
                        width: bgNaturalSize.w * (canvasProps.bgScale || 1),
                        height: bgNaturalSize.h * (canvasProps.bgScale || 1),
                        opacity: canvasProps.bgOpacity ?? 1,
                        pointerEvents: 'none',
                       zIndex: 0,
                        touchAction: 'none'
                      }}
                    >
                     <img 
                       src={canvasProps.bgImage} 
                       alt="Sfondo" 
                       style={{ 
                          width: '100%',
                          height: '100%',
                          display: 'block',
                          pointerEvents: 'none' 
                        }} 
                        onLoad={(e) => {
                          const nw = e.target.naturalWidth;
                          const nh = e.target.naturalHeight;
                          setBgNaturalSize({ w: nw, h: nh });
                          
                          // Initial "cover" behavior if properties are missing
                          if (canvasProps.bgX === undefined || canvasProps.bgY === undefined) {
                            const scale = Math.max(canvasProps.width / nw, canvasProps.height / nh);
                            const nx = (canvasProps.width - nw * scale) / 2;
                            const ny = (canvasProps.height - nh * scale) / 2;
                            setCanvasProps(prev => ({ ...prev, bgX: nx, bgY: ny, bgScale: scale, bgOpacity: prev.bgOpacity ?? 1 }));
                          }
                        }}
                      />
                     {/* Corner Handles for Background Scaling */}
                     {isEditingBackground && (
                       <>
                         {[
                           { pos: 'NW', top: -10, left: -10 },
                           { pos: 'NE', top: -10, right: -10 },
                           { pos: 'SW', bottom: -10, left: -10 },
                           { pos: 'SE', bottom: -10, right: -10 }
                         ].map(h => (
                           <div 
                             key={h.pos}
                             style={{
                               position: 'absolute',
                               width: '20px', height: '20px',
                               background: '#fff', border: '2px solid var(--accent)',
                               borderRadius: '50%',
                               cursor: h.pos === 'NW' || h.pos === 'SE' ? 'nwse-resize' : 'nesw-resize',
                               top: h.top, bottom: h.bottom, left: h.left, right: h.right,
                               zIndex: 10,
                               pointerEvents: 'auto'
                             }}
                             onPointerDown={(e) => {
                               e.stopPropagation();
                               const startY = e.clientY;
                               const startX = e.clientX;
                               const initScale = canvasProps.bgScale || 1;
                               const initX = canvasProps.bgX || 0;
                               const initY = canvasProps.bgY || 0;
                               const initW = bgNaturalSize.w * initScale;
                               const initH = bgNaturalSize.h * initScale;

                               const handleResize = (moveEvent) => {
                                 const dx = (moveEvent.clientX - startX) / stageScale;
                                 const dy = (moveEvent.clientY - startY) / stageScale;
                                 
                                 let factor = 1;
                                 if (h.pos === 'NW') factor = (dx < 0 || dy < 0) ? Math.max(Math.abs(dx), Math.abs(dy)) : -Math.max(Math.abs(dx), Math.abs(dy));
                                 else if (h.pos === 'SE') factor = (dx > 0 || dy > 0) ? Math.max(Math.abs(dx), Math.abs(dy)) : -Math.max(Math.abs(dx), Math.abs(dy));
                                 else if (h.pos === 'NE') factor = (dx > 0 || dy < 0) ? Math.max(Math.abs(dx), Math.abs(dy)) : -Math.max(Math.abs(dx), Math.abs(dy));
                                 else if (h.pos === 'SW') factor = (dx < 0 || dy > 0) ? Math.max(Math.abs(dx), Math.abs(dy)) : -Math.max(Math.abs(dx), Math.abs(dy));

                                  const newScale = Math.max(0.1, initScale + (factor * 0.005));
                                  let newW = bgNaturalSize.w * newScale;
                                  let newH = bgNaturalSize.h * newScale;

                                  let nx = initX;
                                  let ny = initY;

                                  // Adjust position to keep opposite corner anchored
                                  if (h.pos === 'NW') { nx = (initX + initW) - newW; ny = (initY + initH) - newH; }
                                  else if (h.pos === 'NE') { ny = (initY + initH) - newH; }
                                  else if (h.pos === 'SW') { nx = (initX + initW) - newW; }
                                  
                                  // RESIZE SNAPPING
                                  const SNAP_THRESHOLD = 8;
                                  let newGuides = [];
                                  let finalScale = newScale;
                                  
                                  // X snapping
                                  const edgeX = (h.pos === 'NW' || h.pos === 'SW') ? nx : nx + newW;
                                  const targetX = (h.pos === 'NW' || h.pos === 'SW') ? 0 : canvasProps.width;
                                  if (Math.abs(edgeX - targetX) < SNAP_THRESHOLD) {
                                     finalScale = (h.pos === 'SE' || h.pos === 'NE') ? (canvasProps.width - nx) / bgNaturalSize.w : (initX + initW) / bgNaturalSize.w;
                                     newGuides.push({ axis: 'x', position: targetX });
                                  }
                                  
                                  // Y snapping (apply same logic for scale)
                                  const edgeY = (h.pos === 'NW' || h.pos === 'NE') ? ny : ny + newH;
                                  const targetY = (h.pos === 'NW' || h.pos === 'NE') ? 0 : canvasProps.height;
                                  if (Math.abs(edgeY - targetY) < SNAP_THRESHOLD) {
                                     const snappedScaleY = (h.pos === 'SE' || h.pos === 'SW') ? (canvasProps.height - ny) / bgNaturalSize.h : (initY + initH) / bgNaturalSize.h;
                                     // We take the max scale if both snap to make sure it covers both snap points if possible, or just the Y snap if it's the only one
                                     finalScale = Math.max(finalScale, snappedScaleY);
                                     newGuides.push({ axis: 'y', position: targetY });
                                  }

                                  if (newGuides.length > 0) {
                                    const finalW = bgNaturalSize.w * finalScale;
                                    const finalH = bgNaturalSize.h * finalScale;
                                    let fnx = nx, fny = ny;
                                    if (h.pos === 'NW') { fnx = (initX + initW) - finalW; fny = (initY + initH) - finalH; }
                                    else if (h.pos === 'NE') { fnx = nx; fny = (initY + initH) - finalH; }
                                    else if (h.pos === 'SW') { fnx = (initX + initW) - finalW; fny = ny; }
                                    else if (h.pos === 'SE') { fnx = nx; fny = ny; }

                                    setCanvasProps(prev => ({ ...prev, bgScale: finalScale, bgX: fnx, bgY: fny }));
                                    setSnapGuides(newGuides);
                                    return;
                                  }

                                  setSnapGuides([]);
                                  setCanvasProps(prev => ({ ...prev, bgScale: newScale, bgX: nx, bgY: ny }));
                                };
                               
                               const handleUp = () => {
                                 setSnapGuides([]);
                                 window.removeEventListener('pointermove', handleResize);
                                 window.removeEventListener('pointerup', handleUp);
                               };
                               window.addEventListener('pointermove', handleResize);
                               window.addEventListener('pointerup', handleUp);
                             }}
                           />
                         ))}
                       </>
                     )}
                   </div>
                 )}

                  {/* Zoom controls removed per user request */}
{layers.map((layer) => {
                    const isSelected = selectedLayerIds.includes(layer.id);
                    const isEditing = editingLayerId === layer.id;
                    const isHovered = hoveredLayerId === layer.id;
                    return (
                     <div 
                       key={layer.id} 
                       id={`layer-${layer.id}`}
                       className={`canvas-layer ${isSelected ? 'selected' : ''}`}
                       style={{
                         left: layer.x === 'center' || isNaN(layer.x) ? '50%' : (layer.x + 'px'),
                         top: layer.y === 'center' || isNaN(layer.y) ? '50%' : (layer.y + 'px'),
                         transform: 'translate(-50%, -50%)',
                         width: 'max-content',
                         fontSize: (layer.fontSize || 32) + 'px',
                         fontFamily: layer.fontFamily,
                         fontWeight: layer.fontWeight || "normal",
                         fontStyle: layer.fontStyle || "normal",
                         textDecoration: layer.textDecoration || "none",
                         letterSpacing: (layer.letterSpacing || 0) + 'px',
                         lineHeight: layer.lineHeight || 1.2,
                         color: layer.color,
                         textAlign: layer.textAlign,
                         zIndex: isSelected ? 10 : 1,
                         padding: '2px 4px', // bounding box "appena leggermente piu grande"
                          pointerEvents: isEditingBackground ? 'none' : 'auto',
                         userSelect: 'none',
                         touchAction: 'none', // Critical for pinch-to-zoom prevention on iOS
                         opacity: isEditingBackground ? 0.3 : 1,
                         transition: 'opacity 0.3s ease'
                       }}
                        onPointerDown={(e) => !isEditingBackground && handlePointerDown(e, layer)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isHovered && (
                          <div style={{ position: 'absolute', inset: -4, border: '2px solid #FF007F', pointerEvents: 'none', zIndex: 101, borderRadius: '4px', boxShadow: '0 0 10px rgba(255, 0, 127, 0.3)' }} />
                        )}
                       {/* Bounding Box Selector & Handles */}
                       {isSelected && (
                          <>
                            <div className="layer-outline" style={{ border: '1px solid var(--accent)', position: 'absolute', inset: 0, pointerEvents: 'none' }}></div>
                            {/* Resize Handles Corners */}
                            {['NW', 'NE', 'SW', 'SE'].map(pos => (
                               <div 
                                 key={pos}
                                 onPointerDown={(e) => handleResizePointerDown(e, layer, pos)}
                                 style={{
                                   position: 'absolute',
                                   width: '10px', height: '10px',
                                   background: '#fff', border: '1px solid var(--accent)',
                                   borderRadius: '50%',
                                   top: pos.includes('N') ? '-5px' : 'auto',
                                   bottom: pos.includes('S') ? '-5px' : 'auto',
                                   left: pos.includes('W') ? '-5px' : 'auto',
                                   right: pos.includes('E') ? '-5px' : 'auto',
                                   cursor: pos === 'NW' || pos === 'SE' ? 'nwse-resize' : 'nesw-resize',
                                   zIndex: 10
                                 }}
                               />
                            ))}
                          </>
                       )}
                       {(!layer.type || layer.type === 'text') && (
                          <EditableText
                            id={`layer-content-${layer.id}`}
                            className="layer-content"
                            text={layer.text}
                            isEditing={isEditing}
                            onSync={(val) => {
                              setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, text: val } : l));
                              setIsDirty(true);
                            }}
                            onBlur={(val) => {
                              let updatedText = val;
                              if (!updatedText || updatedText === "<br>") updatedText = "Testo Vuoto";
                              setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, text: updatedText } : l));
                              setIsDirty(true); setEditingLayerId(null);
                            }}
                            onFocus={() => pushToHistory()}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setEditingLayerId(layer.id);
                            }}
                            onPointerDown={(e) => {
                              if (isEditing) e.stopPropagation(); 
                            }}
                            style={{
                              outline: "none",
                              minWidth: "20px",
                              minHeight: "1em",
                              cursor: isEditing ? "text" : (isSelected ? "grab" : "pointer"),
                              pointerEvents: "auto",
                              userSelect: isEditing ? "auto" : "none",
                              whiteSpace: "nowrap",
                              paddingBottom: "0.15em"
                            }}
                          />
                        )}
                       {layer.type === 'image' && (
                         <img 
                           src={layer.src} 
                           style={{ width: (layer.w || 100) + 'px', height: (layer.h || 100) + 'px', objectFit: 'contain', pointerEvents: 'none', display: 'block', userSelect: 'none', WebkitUserDrag: 'none', opacity: layer.opacity !== undefined ? layer.opacity : 1 }} 
                           alt="" 
                           draggable="false"
                         />
                       )}
                     </div>
                   )
                 })}

                 {/* SMART GUIDES OVERLAY (RED LINES) */}
                 {snapGuides.map((guide, i) => {
                   if (guide.axis === 'x') {
                     return <div key={`gx_${i}`} style={{position: 'absolute', top: 0, bottom: 0, left: guide.position + 'px', width: '1px', background: '#FF007F', zIndex: 99, pointerEvents: 'none'}} />;
                   }
                   if (guide.axis === 'y') {
                     return <div key={`gy_${i}`} style={{position: 'absolute', left: 0, right: 0, top: guide.position + 'px', height: '1px', background: '#FF007F', zIndex: 99, pointerEvents: 'none'}} />;
                   }
                   return null;
                 })}
                 
                 {/* SELECTION BOX OVERLAY */}
                 {selectionBox && (
                   <div style={{
                      position: 'absolute',
                      left: Math.min(selectionBox.startX, selectionBox.currentX),
                      top: Math.min(selectionBox.startY, selectionBox.currentY),
                      width: Math.abs(selectionBox.currentX - selectionBox.startX),
                      height: Math.abs(selectionBox.currentY - selectionBox.startY),
                      backgroundColor: 'rgba(0, 150, 255, 0.2)',
                      border: '1px solid rgba(0, 150, 255, 0.8)',
                      zIndex: 9999,
                      pointerEvents: 'none'
                   }} />
                 )}

                </div>
              </div>
            </div>
           )}
        </div>
      </div>
    </div>
  );
}
