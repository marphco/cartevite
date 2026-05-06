import React from 'react';
import { 
  X, Baseline, Settings2, Bold, Italic, Underline, PaintBucket, 
  Palette, Image as ImageIcon, Move, Sparkles, Trash2, Mail, MailOpen, 
  Shapes, Type, ChevronUp, Minus, Plus, Circle, ArrowRight, 
  ArrowLeft, ArrowDown, ArrowUp, ArrowUpRight, ArrowUpLeft, 
  ArrowDownRight, ArrowDownLeft, Check, ChevronLeft, Layout, Smartphone, Monitor, Upload,
  AlignJustify, CreditCard, Banknote, MapPin, CheckSquare, Images, Video as VideoIcon, Gift, Pencil, Users
} from 'lucide-react';
import { Button } from "../../../ui";
import MobileIconBtn from "../../../components/ui/MobileIconBtn";
import CustomColorPicker from "./CustomColorPicker";
import PaymentSection from "./sidebar/PaymentSection";
import { DEFAULT_BLOCK_HEIGHT } from "../../../utils/blockHeight";
import { AVAILABLE_FONTS, getFontPreviewText, loadGoogleFont, AVAILABLE_LINERS, AVAILABLE_SCENARIO_BGS } from "./EditorHelpers";
import type { Layer, CanvasProps, Block } from "../../../types/editor";
import { apiFetch } from "../../../utils/apiFetch";

interface MobileToolbarProps {
  activeMobileTab: string | null;
  setActiveMobileTab: (tab: string | null) => void;
  selectedLayer: Layer | undefined;
  selectedLayerIds: string[];
  editorMode: 'canvas' | 'envelope' | 'background' | 'event_page';
  isEnvelopeOpen: boolean;
  setIsEnvelopeOpen: (open: boolean) => void;
  isEditingBackground: boolean;
  setIsEditingBackground: (editing: boolean) => void;
  isEditingLiner: boolean;
  setIsEditingLiner: (editing: boolean) => void;
  displayColorPicker: any;
  setDisplayColorPicker: React.Dispatch<React.SetStateAction<any>>;
  showMobileAnchorGrid: boolean;
  setShowMobileAnchorGrid: (show: boolean) => void;
  event: any;
  updateTheme: (updates: any) => void;
  canvasProps: CanvasProps;
  setCanvasProps: React.Dispatch<React.SetStateAction<CanvasProps>>;
  userScenarioBgImages: string[];
  setUserScenarioBgImages: (imgs: string[]) => void;
  userLinerImages: string[];
  envelopeScale: number;
  isMobile: boolean;
  updateSelectedLayer: (updates: Partial<Layer>) => void;
  deleteSelectedLayers: () => void;
  addTextLayer: () => void;
  isFontExpanded: boolean;
  setIsFontExpanded: (expanded: boolean) => void;
  scenarioBgInputRef: React.RefObject<HTMLInputElement | null>;
  invitoBgInputRef: React.RefObject<HTMLInputElement | null>;
  textureInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  pushToHistory: () => void;
  previewMobile?: boolean;
  setPreviewMobile?: (val: boolean) => void;
  editingLayerId?: string | null;
  selectedBlockId?: string | null;
  blocks?: Block[] | null;
  setBlocks?: React.Dispatch<React.SetStateAction<Block[]>> | null;
  layers?: Layer[];
  setLayers?: React.Dispatch<React.SetStateAction<Layer[]>>;
  setIsDirty?: (val: boolean) => void;
  slug?: string;
}

const MobileToolbar: React.FC<MobileToolbarProps> = ({
  activeMobileTab,
  setActiveMobileTab,
  selectedLayer,
  selectedLayerIds,
  editorMode,
  isEnvelopeOpen,
  setIsEnvelopeOpen,
  isEditingBackground,
  setIsEditingBackground,
  isEditingLiner,
  setIsEditingLiner,
  displayColorPicker,
  setDisplayColorPicker,
  showMobileAnchorGrid,
  setShowMobileAnchorGrid,
  event,
  updateTheme,
  canvasProps,
  setCanvasProps,
  userScenarioBgImages,
  setUserScenarioBgImages,
  userLinerImages,
  envelopeScale,
  isMobile,
  updateSelectedLayer,
  deleteSelectedLayers,
  addTextLayer,
  isFontExpanded,
  setIsFontExpanded,
  scenarioBgInputRef,
  invitoBgInputRef,
  textureInputRef,
  fileInputRef,
  pushToHistory,
  previewMobile,
  setPreviewMobile,
  editingLayerId,
  selectedBlockId,
  blocks,
  setBlocks,
  layers,
  setLayers,
  setIsDirty,
  slug
}) => {
  const galleryInputRef = React.useRef<HTMLInputElement | null>(null);
  const videoInputRef = React.useRef<HTMLInputElement | null>(null);
  const [galleryUploading, setGalleryUploading] = React.useState(false);
  const [videoUploading, setVideoUploading] = React.useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = React.useState<number | null>(null);

  const getRangeStyle = (progressPercent: number): React.CSSProperties => ({
    width: '100%',
    background: `linear-gradient(to right, var(--accent) ${progressPercent}%, rgba(60, 79, 118, 0.12) ${progressPercent}%)`
  });

  const patchSelectedBlock = React.useCallback((patch: { props?: Record<string, any>; widgetProps?: Record<string, any> }) => {
    if (!selectedBlockId || !blocks || !setBlocks || !setIsDirty) return;
    setIsDirty(true);
    setBlocks(blocks.map(b => {
      if (b.id !== selectedBlockId) return b;
      return {
        ...b,
        ...(patch.props ? { props: { ...b.props, ...patch.props } } : {}),
        ...(patch.widgetProps ? { widgetProps: { ...b.widgetProps, ...patch.widgetProps } } : {})
      };
    }));
  }, [selectedBlockId, blocks, setBlocks, setIsDirty]);

  const uploadGalleryFilesMobile = React.useCallback(async (files: File[]) => {
    if (!files.length || !selectedBlockId || !slug || !blocks || !setBlocks || !setIsDirty) return;
    setGalleryUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const res = await apiFetch(`/api/uploads?slug=${slug}&folder=gallery`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload fallito');
      const data = await res.json();
      const currentBlock = blocks.find(b => b.id === selectedBlockId);
      const currentImages = currentBlock?.props?.images || [];
      const newImages = (data.urls as string[]).map((url) => ({
        id: `gallery-img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url
      }));
      patchSelectedBlock({ props: { images: [...currentImages, ...newImages] } });
      pushToHistory();
    } catch (err) {
      console.error('Gallery upload mobile error:', err);
      alert('Errore durante il caricamento delle immagini.');
    } finally {
      setGalleryUploading(false);
    }
  }, [blocks, patchSelectedBlock, pushToHistory, selectedBlockId, setBlocks, setIsDirty, slug]);

  const uploadVideoFileMobile = React.useCallback(async (file: File | undefined | null) => {
    if (!file || !selectedBlockId || !slug) return;
    if (!file.type.startsWith('video/')) {
      alert('Formato non supportato. Carica un file video (mp4, webm, mov).');
      return;
    }
    setVideoUploading(true);
    setVideoUploadProgress(0);
    try {
      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const params = new URLSearchParams({ slug, folder: 'video' });
        xhr.open('POST', `/api/uploads/video?${params.toString()}`, true);
        try {
          const token = localStorage.getItem('token');
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        } catch { /* noop */ }
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setVideoUploadProgress(Math.round((ev.loaded / ev.total) * 100));
        };
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && data.url) resolve(data.url);
            else reject(new Error(data.error || `Upload fallito (HTTP ${xhr.status})`));
          } catch {
            reject(new Error('Risposta server non valida'));
          }
        };
        xhr.onerror = () => reject(new Error('Errore di rete durante upload'));
        const formData = new FormData();
        formData.append('video', file);
        xhr.send(formData);
      });
      patchSelectedBlock({ props: { videoUrl: url } });
      pushToHistory();
    } catch (err: any) {
      console.error('Video upload mobile error:', err);
      alert(err?.message || 'Errore durante il caricamento del video.');
    } finally {
      setVideoUploading(false);
      setVideoUploadProgress(null);
    }
  }, [patchSelectedBlock, pushToHistory, selectedBlockId, slug]);

  // MODALITÀ FOCUS: nascondiamo la toolbar solo mentre il layer in editing è
  // ancora effettivamente selezionato. Se `editingLayerId` resta stale dopo un
  // blur/deselect (race condition già vista su gallery/video), la toolbar deve
  // comunque riapparire per evitare il bug "sparisce finché non refreshi".
  if (editingLayerId && selectedLayerIds.includes(editingLayerId)) {
    return null;
  }

  return (
    <div className="mobile-toolbar-container">
        {activeMobileTab && (
          <div className="mobile-tab-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {activeMobileTab === 'scenario_bg' && showMobileAnchorGrid ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => setShowMobileAnchorGrid(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-soft)', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Punto di Ancoraggio
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {activeMobileTab === 'add_section' ? 'Aggiungi Sezione' : activeMobileTab === 'font' ? 'Font' : activeMobileTab === 'size' ? 'Dimensioni' : activeMobileTab === 'format' ? 'Formato' : activeMobileTab === 'color' ? 'Colore' : activeMobileTab === 'image_opacity' ? 'Opacità Immagine' : activeMobileTab === 'bg_invito' ? 'Sfondo Invito' : activeMobileTab === 'envelope_colors' ? 'Colori Busta' : activeMobileTab === 'envelope_format' ? 'Formato Busta' : activeMobileTab === 'envelope_liner' ? 'Interno Busta' : activeMobileTab === 'scenario_bg' ? 'Scenario' : activeMobileTab === 'rsvp_content' ? 'Testo Form' : activeMobileTab === 'rsvp_style' ? 'Stile Form' : activeMobileTab === 'rsvp_questions' ? 'Domande RSVP' : activeMobileTab === 'payment_setup' ? 'Pagamenti' : activeMobileTab === 'payment_content' ? 'Contenuto Regali' : activeMobileTab === 'payment_amounts' ? 'Importi' : activeMobileTab === 'payment_style' ? 'Obiettivo & Stile' : activeMobileTab === 'widget_settings' ? (() => {
                    const t = blocks?.find(b => b.id === selectedBlockId)?.type;
                    if (t === 'gallery') return 'Galleria';
                    if (t === 'video') return 'Video';
                    if (t === 'map') return 'Mappa';
                    if (t === 'payment') return 'Regali';
                    return 'Impostazioni';
                  })() : activeMobileTab }
                </span>
              )}
              <button className="mobile-tab-close" onClick={() => { 
                setActiveMobileTab(null); 
                setIsFontExpanded(false); 
                setIsEditingBackground(false);
                setIsEditingLiner(false);
                setDisplayColorPicker(false);
                setShowMobileAnchorGrid(false);
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
                               onClick={() => { pushToHistory(); updateSelectedLayer({ fontFamily: f }); loadGoogleFont(f); }} 
                               style={{
                                 whiteSpace: 'nowrap', padding: '8px 14px', 
                                 background: selectedLayer?.fontFamily === f ? 'var(--accent)' : 'var(--surface-light)', 
                                 color: selectedLayer?.fontFamily === f ? '#ffffff' : 'var(--text-primary)', 
                                 borderRadius: '8px', border: 'none', cursor: 'pointer',
                                 display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '2px',
                                 minWidth: '110px'
                               } as React.CSSProperties}
                             >
                               <span style={{ fontSize: '8px', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>{f}</span>
                               <span style={{ fontFamily: f, fontSize: '1rem', lineHeight: 1 }}>{getFontPreviewText(selectedLayer)}</span>
                             </button>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => setIsFontExpanded(true)} style={{background: 'var(--surface-light)', border: 'none', color: 'var(--text-primary)', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', margin: '0 0.2rem 0 0.8rem', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 12px rgba(60, 79, 118, 0.15)'}}><ChevronUp size={20}/></button>
                    </div>
                  ) : (
                    <div style={{width: '100%', height: '35vh', display: 'flex', flexDirection: 'column'}}>
                      <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column'}} className="custom-scrollbar-mini">
                         {AVAILABLE_FONTS.map(f => (
                           <button 
                             key={f} 
                             onClick={() => { pushToHistory(); updateSelectedLayer({ fontFamily: f }); loadGoogleFont(f); setIsFontExpanded(false); }} 
                             style={{
                               padding: '8px 16px', textAlign: 'left', 
                               background: selectedLayer?.fontFamily === f ? 'var(--accent)' : 'transparent', 
                               color: selectedLayer?.fontFamily === f ? '#ffffff' : 'var(--text-primary)', 
                               border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', 
                               display: 'flex', flexDirection: 'column', gap: '2px'
                             } as React.CSSProperties}
                           >
                             <span style={{ fontSize: '9px', fontWeight: 700, opacity: selectedLayer?.fontFamily === f ? 0.7 : 0.4, textTransform: 'uppercase' }}>{f}</span>
                             <span style={{ fontFamily: f, fontSize: '1.3rem', lineHeight: 1 }}>{getFontPreviewText(selectedLayer)}</span>
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
                    <Button variant="ghost" className="stepper-btn" onClick={() => updateSelectedLayer({fontSize: Math.max(8, (selectedLayer.fontSize || 32) - 1)})}><Minus size={28}/></Button>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '60px' }}>
                      <input 
                        type="text" 
                        value={selectedLayer.fontSize || 32}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                          updateSelectedLayer({fontSize: val});
                        }}
                        style={{
                          fontSize: '1.4rem', 
                          width: '45px', 
                          fontWeight: 700, 
                          textAlign: 'center',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-primary)',
                          padding: 0,
                          outline: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-soft)', marginLeft: '2px', position: 'relative', top: '2px' }}>px</span>
                    </div>
                    <Button variant="ghost" className="stepper-btn" onClick={() => updateSelectedLayer({fontSize: (selectedLayer.fontSize || 32) + 1})}><Plus size={28}/></Button>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '0 10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-soft)', fontWeight: 600 }}>A</span>
                    <input 
                      type="range" 
                      className="custom-slider"
                      min="8" 
                      max="200" 
                      step="1" 
                      value={selectedLayer.fontSize || 32} 
                      onPointerDown={() => pushToHistory()}
                      onChange={(e) => updateSelectedLayer({ fontSize: parseInt(e.target.value) })}
                      style={{ 
                        flex: 1, 
                        background: `linear-gradient(to right, var(--accent) ${Math.max(0, Math.min(100, Math.round(((selectedLayer.fontSize || 32) - 8) / 192 * 100)))}%, rgba(60, 79, 118, 0.1) ${Math.max(0, Math.min(100, Math.round(((selectedLayer.fontSize || 32) - 8) / 192 * 100)))}%)`
                      } as React.CSSProperties}
                    />
                    <span style={{ fontSize: '18px', color: 'var(--text-soft)', fontWeight: 600 }}>A</span>
                  </div>

                  {/* Spaziatura Lettere — coerente con PropertyPanel desktop (-10..50) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 10px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Spaziatura Lettere
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-soft)', fontWeight: 700, letterSpacing: '-0.5px' }}>AA</span>
                      <input 
                        type="range" 
                        className="custom-slider"
                        min="-10" 
                        max="50" 
                        step="1" 
                        value={selectedLayer.letterSpacing || 0} 
                        onPointerDown={() => pushToHistory()}
                        onChange={(e) => updateSelectedLayer({ letterSpacing: parseFloat(e.target.value) })}
                        style={{ 
                          flex: 1, 
                          background: `linear-gradient(to right, var(--accent) ${Math.max(0, Math.min(100, Math.round(((selectedLayer.letterSpacing || 0) + 10) / 60 * 100)))}%, rgba(60, 79, 118, 0.1) ${Math.max(0, Math.min(100, Math.round(((selectedLayer.letterSpacing || 0) + 10) / 60 * 100)))}%)`
                        } as React.CSSProperties}
                      />
                      <span style={{ fontSize: '13px', color: 'var(--text-soft)', fontWeight: 700, letterSpacing: '3px' }}>A A</span>
                      <span style={{ fontSize: '12px', width: '32px', textAlign: 'right', fontWeight: 700, color: 'var(--text-soft)' }}>
                        {selectedLayer.letterSpacing || 0}
                      </span>
                    </div>
                  </div>

                  {/* Spaziatura Righe — coerente con PropertyPanel desktop (0.5..3) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 10px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Spaziatura Righe
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <AlignJustify size={14} color="var(--text-soft)" style={{ transform: 'scaleY(0.7)' }} />
                      <input 
                        type="range" 
                        className="custom-slider"
                        min="0.5" 
                        max="3" 
                        step="0.1" 
                        value={selectedLayer.lineHeight || 1.2} 
                        onPointerDown={() => pushToHistory()}
                        onChange={(e) => updateSelectedLayer({ lineHeight: parseFloat(e.target.value) })}
                        style={{ 
                          flex: 1, 
                          background: `linear-gradient(to right, var(--accent) ${Math.max(0, Math.min(100, ((selectedLayer.lineHeight || 1.2) - 0.5) / 2.5 * 100))}%, rgba(60, 79, 118, 0.1) ${Math.max(0, Math.min(100, ((selectedLayer.lineHeight || 1.2) - 0.5) / 2.5 * 100))}%)`
                        } as React.CSSProperties}
                      />
                      <AlignJustify size={14} color="var(--text-soft)" style={{ transform: 'scaleY(1.4)' }} />
                      <span style={{ fontSize: '12px', width: '32px', textAlign: 'right', fontWeight: 700, color: 'var(--text-soft)' }}>
                        {(selectedLayer.lineHeight || 1.2).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {activeMobileTab === 'format' && selectedLayer && (
                <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flex: 1}}>
                   <Button variant="ghost" onClick={() => { pushToHistory(); updateSelectedLayer({fontWeight: selectedLayer.fontWeight === 'bold' ? 'normal' : 'bold'}); }} style={{background: selectedLayer.fontWeight === 'bold' ? 'var(--accent)' : 'var(--surface-light)', color: selectedLayer.fontWeight === 'bold' ? '#ffffff' : 'var(--text-soft)', padding: '0.8rem'}}>
                     <Bold size={18}/>
                   </Button>
                   <Button variant="ghost" onClick={() => { pushToHistory(); updateSelectedLayer({fontStyle: selectedLayer.fontStyle === 'italic' ? 'normal' : 'italic'}); }} style={{background: selectedLayer.fontStyle === 'italic' ? 'var(--accent)' : 'var(--surface-light)', color: selectedLayer.fontStyle === 'italic' ? '#ffffff' : 'var(--text-soft)', padding: '0.8rem'}}>
                     <Italic size={18}/>
                   </Button>
                   <Button variant="ghost" onClick={() => { pushToHistory(); updateSelectedLayer({textDecoration: selectedLayer.textDecoration === 'underline' ? 'none' : 'underline'}); }} style={{background: selectedLayer.textDecoration === 'underline' ? 'var(--accent)' : 'var(--surface-light)', color: selectedLayer.textDecoration === 'underline' ? '#ffffff' : 'var(--text-soft)', padding: '0.8rem'}}>
                     <Underline size={18}/>
                   </Button>
                </div>
              )}
              {activeMobileTab === 'color' && selectedLayer && (
                <div style={{flex: 1, width: '100%'}}>
                  <CustomColorPicker color={selectedLayer.color || '#000000'} onChange={(color) => updateSelectedLayer({ color })} />
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
                      onPointerDown={() => pushToHistory()}
                      onChange={(e) => updateSelectedLayer({ opacity: parseFloat(e.target.value) })}
                      style={{ 
                        flex: 1,
                        background: `linear-gradient(to right, var(--accent) ${Math.round((selectedLayer.opacity ?? 1) * 100)}%, rgba(60, 79, 118, 0.1) ${Math.round((selectedLayer.opacity ?? 1) * 100)}%)`
                      } as React.CSSProperties}
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
                        onClick={() => { if (displayColorPicker !== 'canvasBg') pushToHistory(); setDisplayColorPicker(displayColorPicker === 'canvasBg' ? false : 'canvasBg'); }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <PaintBucket size={18} style={{ marginRight: 6 }} />
                          <span>Colore</span>
                        </div>
                        <div style={{ width: '16px', height: '16px', background: (canvasProps.bgColor || '#ffffff'), borderRadius: '3px', border: '1px solid var(--border)' }} />
                      </Button>
                      <Button 
                        variant="subtle" 
                        style={{ flex: 1, fontSize: '12px' }} 
                        onClick={() => invitoBgInputRef.current?.click()}
                      >
                        <ImageIcon size={18} style={{ marginRight: 6 }} /> Immagine
                      </Button>
                   </div>
                   {displayColorPicker === 'canvasBg' && (
                     <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                       <CustomColorPicker color={canvasProps.bgColor || '#ffffff'} onChange={(color) => setCanvasProps((prev: CanvasProps) => ({ ...prev, bgColor: color }))} />
                     </div>
                   )}
                   {canvasProps.bgImage && (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 4px' }}>
                          <Palette size={18} color="var(--text-soft)" />
                          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-soft)', minWidth: '55px' }}>Opacità Immagine</span>
                           <input 
                             type="range" 
                             className="custom-slider"
                             min="0" max="1" step="0.01" 
                             value={canvasProps.bgOpacity ?? 1} 
                             onPointerDown={() => pushToHistory()}
                             onChange={(e) => setCanvasProps((prev: CanvasProps) => ({ ...prev, bgOpacity: parseFloat(e.target.value) }))}
                             style={{ 
                               flex: 1, 
                               background: `linear-gradient(to right, var(--accent) ${Math.round((canvasProps.bgOpacity ?? 1) * 100)}%, rgba(60, 79, 118, 0.1) ${Math.round((canvasProps.bgOpacity ?? 1) * 100)}%)`
                             } as React.CSSProperties}
                           />
                          <span style={{ fontSize: '10px', fontWeight: 700, minWidth: '35px', textAlign: 'right' }}>{Math.round((canvasProps.bgOpacity ?? 1) * 100)}%</span>
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
                          <Move size={18} style={{ marginRight: 8 }} /> {isEditingBackground ? "Salva Posizione" : "Regola Posizione"}
                        </Button>

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
                            <Sparkles size={18} color="var(--accent)" />
                            <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent)' }}>
                              Pizzica per zoomare • Trascina sull'invito per spostare
                            </span>
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          style={{ width: '100%', justifyContent: 'center', color: 'salmon', fontSize: '12px' }} 
                          onClick={() => {
                            setCanvasProps((prev: CanvasProps) => ({ ...prev, bgImage: null }));
                            setIsEditingBackground(false);
                          }}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                       <p style={{ fontSize: '10px', color: 'var(--text-soft)', marginBottom: '4px', lineHeight: '1.4' }}>
                         Scegli la porzione di immagine da mantenere visibile a prescindere dalle dimensioni dello schermo.
                       </p>
                       <div style={{ display: 'flex', justifyContent: 'center' }}>
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: 'fit-content' }}>
                            {([
                              { val: 'top left', x: 0, y: 0 }, { val: 'top', x: 1, y: 0 }, { val: 'top right', x: 2, y: 0 },
                              { val: 'left', x: 0, y: 1 }, { val: 'center', x: 1, y: 1 }, { val: 'right', x: 2, y: 1 },
                              { val: 'bottom left', x: 0, y: 2 }, { val: 'bottom', x: 1, y: 2 }, { val: 'bottom right', x: 2, y: 2 }
                            ] as const).map(pos => {
                              const currentPos = event.theme?.heroBgPosition || 'center';
                              const isActive = currentPos === pos.val;
                              
                              const coords: Record<string, {x: number, y: number}> = {
                                'top left': {x:0, y:0}, 'top': {x:1, y:0}, 'top right': {x:2, y:0},
                                'left': {x:0, y:1}, 'center': {x:1, y:1}, 'right': {x:2, y:1},
                                'bottom left': {x:0, y:2}, 'bottom': {x:1, y:2}, 'bottom right': {x:2, y:2}
                              };
                              const s = coords[currentPos] || {x: 1, y: 1};

                              let IconComp = Circle;
                              if (!isActive) {
                                if (pos.x > s.x && pos.y === s.y) IconComp = ArrowRight;
                                else if (pos.x < s.x && pos.y === s.y) IconComp = ArrowLeft;
                                else if (pos.y > s.y && pos.x === s.x) IconComp = ArrowDown;
                                else if (pos.y < s.y && pos.x === s.x) IconComp = ArrowUp;
                                  else if (pos.x > s.x && pos.y > s.y) IconComp = ArrowDownRight;
                                else if (pos.x < s.x && pos.y < s.y) IconComp = ArrowUpLeft;
                                else if (pos.x > s.x && pos.y < s.y) IconComp = ArrowUpRight;
                                else if (pos.x < s.x && pos.y > s.y) IconComp = ArrowDownLeft;
                              }

                              return (
                               <button
                                  key={pos.val}
                                  onClick={() => { pushToHistory(); updateTheme({ heroBgPosition: pos.val }); }}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: isActive ? 'var(--accent)' : 'var(--surface-light)',
                                    color: isActive ? '#000' : 'var(--text-soft)',
                                    padding: 0,
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  <IconComp size={isActive ? 22 : 18} />
                                </button>
                              );
                            })}
                         </div>
                       </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                         <button 
                           onClick={() => scenarioBgInputRef.current?.click()}
                           style={{ 
                             flex: 1.8, 
                             height: '42px', 
                             background: '#f1f3f9', 
                             borderRadius: '100px', 
                             border: 'none',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             gap: '8px',
                             cursor: 'pointer',
                             padding: '0 12px'
                           }}
                         >
                           <ImageIcon size={20} color="#3c4f76" />
                           <span style={{ color: '#3c4f76', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>Carica Foto</span>
                         </button>
                         <div style={{ flex: 3.2 }}>
                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {([null, ...AVAILABLE_SCENARIO_BGS.map(b => b.url), ...userScenarioBgImages.slice(0, 2)]).map(tex => (
                               <div 
                                 key={tex || 'none'}
                                 onClick={() => { pushToHistory(); updateTheme({ heroBg: tex || 'none' }); }}
                                 style={{
                                   aspectRatio: '1', 
                                   background: (tex && tex !== 'none') ? `url(${tex})` : 'var(--surface-light)', 
                                   backgroundSize: 'cover', 
                                   borderRadius: '4px', 
                                   border: (event.theme?.heroBg === tex || (event.theme?.heroBg?.endsWith(tex || '') && tex) || (tex === null && (event.theme?.heroBg === 'none' || !event.theme?.heroBg))) ? '2px solid var(--accent)' : '1px solid rgba(60, 79, 118, 0.1)', 
                                   cursor: 'pointer',
                                   display: 'flex',
                                   alignItems: 'center',
                                   justifyContent: 'center',
                                   fontSize: '7px', letterSpacing: '-0.2px',
                                   fontWeight: 700,
                                   overflow: 'hidden',
                                   color: 'var(--text-soft)',
                                   textTransform: 'uppercase'
                                 } as React.CSSProperties}
                               >
                                 {!tex && 'NESSUNO'}
                               </div>
                             ))}
                           </div>
                         </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-soft)' }}>Opacità</label>
                            <span style={{ fontSize: '10px', fontWeight: 600 }}>{Math.round((event.theme?.heroBgOpacity ?? 1) * 100)}%</span>
                          </div>
                          <input 
                            type="range" 
                            className="custom-slider"
                            min="0" max="1" step="0.01" 
                            value={event.theme?.heroBgOpacity ?? 1} 
                            onPointerDown={() => pushToHistory()}
                            onChange={(e) => updateTheme({ heroBgOpacity: parseFloat(e.target.value) })}
                            style={{ 
                              width: '100%', 
                              background: `linear-gradient(to right, var(--accent) ${Math.round((event.theme?.heroBgOpacity ?? 1) * 100)}%, rgba(60, 79, 118, 0.1) ${Math.round((event.theme?.heroBgOpacity ?? 1) * 100)}%)`
                            } as React.CSSProperties}
                          />
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                           <label style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-soft)' }}>Colore</label>
                           <button
                             onClick={() => { if (displayColorPicker !== 'eventHeroBgMobile') pushToHistory(); setDisplayColorPicker(displayColorPicker === 'eventHeroBgMobile' ? false : 'eventHeroBgMobile'); }}
                             style={{ 
                               width: '32px', height: '32px', 
                               background: (event.theme?.heroBgColor || 'var(--bg-body)'), 
                               borderRadius: '50%', border: '2px solid var(--border)', cursor: 'pointer',
                               boxShadow: displayColorPicker === 'eventHeroBgMobile' ? '0 0 10px var(--accent)' : 'none'
                             }}
                           />
                        </div>
                      </div>

                      {displayColorPicker === 'eventHeroBgMobile' && (
                        <div style={{ padding: '4px 0' }}>
                          <CustomColorPicker color={event.theme?.heroBgColor || 'var(--bg-body)'} onChange={(color) => updateTheme({ heroBgColor: color })} />
                        </div>
                      )}

                      <Button 
                        variant="subtle" 
                        style={{ width: '100%', justifyContent: 'center', height: '40px', gap: '8px', background: 'rgba(60, 79, 118, 0.05)', borderRadius: '12px' }}
                        onClick={() => setShowMobileAnchorGrid(true)}
                      >
                         <Move size={18} /> Regola Posizione
                      </Button>
                    </div>
                  )}
                </div>
              )}


                {activeMobileTab === 'envelope_format' && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <Button 
                        variant={event.theme?.envelopeFormat === 'horizontal' ? 'primary' : 'subtle'} 
                        style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '10px 0' }}
                        onClick={() => { pushToHistory(); updateTheme({ envelopeFormat: 'horizontal' }); }}
                      >
                        Orizzontale
                      </Button>
                      <Button 
                        variant={event.theme?.envelopeFormat !== 'horizontal' ? 'primary' : 'subtle'} 
                        style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '10px 0' }}
                        onClick={() => { pushToHistory(); updateTheme({ envelopeFormat: 'vertical' }); }}
                      >
                        Verticale
                      </Button>
                    </div>
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
                          onClick={() => { if (displayColorPicker !== 'coverBg') pushToHistory(); setDisplayColorPicker(displayColorPicker === 'coverBg' ? false : 'coverBg'); }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <PaintBucket size={18} style={{ marginRight: 6 }} />
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
                          onClick={() => { if (displayColorPicker !== 'coverPocket') pushToHistory(); setDisplayColorPicker(displayColorPicker === 'coverPocket' ? false : 'coverPocket'); }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <PaintBucket size={18} style={{ marginRight: 6 }} />
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
                        <button 
                          onClick={() => textureInputRef.current?.click()}
                          style={{ 
                            flex: 1.8, 
                            height: '36px', 
                            background: '#f1f3f9', 
                            borderRadius: '100px', 
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            padding: '0 12px'
                          }}
                        >
                          <ImageIcon size={18} color="#3c4f76" />
                          <span style={{ color: '#3c4f76', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>Carica Foto</span>
                        </button>
                        <div style={{ flex: 2 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                             {([null, ...AVAILABLE_LINERS.map(l => l.url), ...userLinerImages]).map(tex => (
                              <div 
                                key={tex || 'none'}
                                onClick={() => { pushToHistory(); updateTheme({ coverLiner: tex || 'none', coverPocketLiner: tex || 'none' }); }}
                                style={{
                                  aspectRatio: '1', 
                                  background: (tex && tex !== 'none') ? `url(${tex})` : 'var(--surface-light)', 
                                  backgroundSize: 'cover', 
                                  borderRadius: '4px', 
                                  border: (event.theme?.coverLiner === tex || (event.theme?.coverLiner?.endsWith(tex || '') && tex) || (tex === null && (event.theme?.coverLiner === 'none' || !event.theme?.coverLiner))) ? '2px solid var(--accent)' : '1px solid rgba(60, 79, 118, 0.1)', 
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '7px', letterSpacing: '-0.2px',
                                  fontWeight: 700,
                                  overflow: 'hidden',
                                  color: 'var(--text-soft)',
                                  textTransform: 'uppercase'
                                } as React.CSSProperties}
                              >
                                {!tex && 'NESSUNA'}
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
                           onPointerDown={() => pushToHistory()}
                           onChange={(e) => updateTheme({ linerOpacity: parseFloat(e.target.value) })}
                           style={{ 
                             width: '100%', 
                             background: `linear-gradient(to right, var(--accent) ${Math.round((event.theme?.linerOpacity ?? 1) * 100)}%, rgba(60, 79, 118, 0.1) ${Math.round((event.theme?.linerOpacity ?? 1) * 100)}%)`
                           } as React.CSSProperties}
                         />
                       </div>
                       
                       <Button
                         variant={displayColorPicker === 'coverLiner' ? "primary" : "subtle"}
                         style={{ 
                           height: '36px', 
                           padding: '0 12px', 
                           fontSize: '10px',
                           ...(displayColorPicker === 'coverLiner' ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.3)' } : {})
                         }}
                          onClick={() => { if (displayColorPicker !== 'coverLiner') pushToHistory(); setDisplayColorPicker(displayColorPicker === 'coverLiner' ? false : 'coverLiner'); }}
                       >
                         <PaintBucket size={18} style={{ marginRight: 6 }} /> Colore
                         <div style={{ width: '14px', height: '14px', background: (event.theme?.coverLinerColor || '#ffffff'), borderRadius: '2px', marginLeft: 8, border: '1px solid rgba(255,255,255,0.2)' }} />
                       </Button>
                     </div>

                     <Button 
                       variant={isEditingLiner ? "primary" : "subtle"} 
                       style={{ 
                         fontSize: '10px', 
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
                        {isEditingLiner ? <Check size={18} style={{ marginRight: 6 }} /> : <Move size={18} style={{ marginRight: 6 }} />}
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
                           <Sparkles size={18} color="var(--accent)" />
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

                {/* RSVP - TAB 1: CONTENUTO */}
                {activeMobileTab === 'rsvp_content' && selectedBlockId && blocks && (
                  <div style={{ width: '100%' }}>
                    <div style={{ marginBottom: '16px', width: '100%' }}>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Titolo RSVP</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', width: '100%', boxSizing: 'border-box' }}>
                        <Pencil size={12} style={{ color: 'var(--text-soft)', flexShrink: 0 }} />
                        <input
                          type="text"
                          value={blocks.find(b => b.id === selectedBlockId)?.widgetProps?.rsvpTitle ?? 'GENTILE CONFERMA'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (setBlocks && blocks) {
                              setBlocks(blocks.map(b => b.id === selectedBlockId ? { ...b, widgetProps: { ...b.widgetProps, rsvpTitle: val } } : b));
                            }
                            setIsDirty?.(true);
                          }}
                          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'var(--text-primary)', minWidth: 0, width: '100%' }}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px', width: '100%' }}>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Descrizione RSVP</label>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', width: '100%', boxSizing: 'border-box' }}>
                        <Pencil size={12} style={{ color: 'var(--text-soft)', flexShrink: 0, marginTop: '3px' }} />
                        <textarea
                          value={blocks.find(b => b.id === selectedBlockId)?.widgetProps?.rsvpDescription ?? 'Ti preghiamo di confermare la tua presenza entro il 30 Giugno 2026.'}
                          rows={3}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (setBlocks && blocks) {
                              setBlocks(blocks.map(b => b.id === selectedBlockId ? { ...b, widgetProps: { ...b.widgetProps, rsvpDescription: val } } : b));
                            }
                            setIsDirty?.(true);
                          }}
                          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'var(--text-primary)', minWidth: 0, width: '100%', resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* RSVP - TAB 2: STILE */}
                {activeMobileTab === 'rsvp_style' && selectedBlockId && blocks && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(() => {
                      const block = blocks.find(b => b.id === selectedBlockId);
                      if (!block) return null;
                      return (
                        <>
                          {/* Info auto-contrast coerente con desktop */}
                          <p style={{ fontSize: '10px', color: 'var(--text-soft)', lineHeight: '1.5', padding: '10px 12px', background: 'rgba(var(--accent-rgb), 0.05)', borderRadius: '10px', borderLeft: '3px solid var(--accent)', margin: 0 }}>
                            I colori del form si adattano automaticamente allo sfondo della sezione.
                          </p>

                          <Button 
                            variant={displayColorPicker === 'formPrimary' ? 'primary' : 'subtle'}
                            style={{ width: '100%', fontSize: '11px', justifyContent: 'space-between', borderRadius: '100px', padding: '10px 12px' }}
                            onClick={() => setDisplayColorPicker(displayColorPicker === 'formPrimary' ? false : 'formPrimary')}
                          >
                            <span style={{ fontWeight: 600 }}>Pulsante & Accenti</span>
                            <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: block.widgetProps?.formPrimaryColor || 'var(--accent)', border: '1px solid var(--border)' }} />
                          </Button>
                          
                          {displayColorPicker === 'formPrimary' && (
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                              <CustomColorPicker 
                                color={block.widgetProps?.formPrimaryColor || '#14b8a6'} 
                                onChange={(color) => {
                                  if (setBlocks) {
                                    if (setIsDirty) setIsDirty(true);
                                    setBlocks(blocks.map(b => b.id === block.id ? { ...b, widgetProps: { ...b.widgetProps, formPrimaryColor: color } } : b));
                                  }
                                }} 
                              />
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* RSVP QUESTIONS TAB */}
                {activeMobileTab === 'rsvp_questions' && selectedBlockId && blocks && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(() => {
                      const block = blocks.find(b => b.id === selectedBlockId);
                      if (!block) return null;
                      const customFields = block.widgetProps?.customFields || [];
                      const updateCustomField = (index: number, patch: Record<string, any>) => {
                        const next = [...customFields];
                        const currentField = next[index];
                        if (!currentField) return;
                        next[index] = { ...currentField, ...patch };
                        patchSelectedBlock({ widgetProps: { customFields: next } });
                      };
                      const removeCustomField = (index: number) => {
                        const next = customFields.filter((_: any, i: number) => i !== index);
                        patchSelectedBlock({ widgetProps: { customFields: next } });
                      };
                      return (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <Button 
                              variant="subtle" 
                              style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px' }}
                              onClick={() => {
                                if (setBlocks && setIsDirty) {
                                  setIsDirty(true);
                                  setBlocks(blocks.map(b => b.id === block.id ? { ...b, widgetProps: { ...b.widgetProps, rsvpAskGuests: block.widgetProps?.rsvpAskGuests === false } } : b));
                                }
                              }}
                            >
                              <span style={{ fontSize: '11px', fontWeight: 600 }}>Chiedi numero ospiti</span>
                              <div style={{ width: '16px', height: '16px', border: '1px solid var(--accent)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {block.widgetProps?.rsvpAskGuests !== false && <Check size={12} color="var(--accent)" />}
                              </div>
                            </Button>
                            <Button 
                              variant="subtle" 
                              style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px' }}
                              onClick={() => {
                                if (setBlocks && setIsDirty) {
                                  setIsDirty(true);
                                  setBlocks(blocks.map(b => b.id === block.id ? { ...b, widgetProps: { ...b.widgetProps, rsvpAskIntolerances: block.widgetProps?.rsvpAskIntolerances === false } } : b));
                                }
                              }}
                            >
                              <span style={{ fontSize: '11px', fontWeight: 600 }}>Chiedi allergie/intolleranze</span>
                              <div style={{ width: '16px', height: '16px', border: '1px solid var(--accent)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {block.widgetProps?.rsvpAskIntolerances !== false && <Check size={12} color="var(--accent)" />}
                              </div>
                            </Button>
                            {block.widgetProps?.rsvpAskIntolerances !== false && (
                              <div style={{ padding: '8px 10px', background: 'rgba(var(--accent-rgb), 0.06)', border: '1px solid rgba(var(--accent-rgb), 0.18)', borderRadius: '8px', fontSize: '10px', color: 'var(--text-soft)', lineHeight: 1.45 }}>
                                Sì/no, stessa allergia per tutti o dettaglio per persona. Export in testo.
                              </div>
                            )}
                          </div>
                          
                          <div style={{ textAlign: 'center', marginTop: '4px' }}>
                             <Button 
                               variant="ghost" 
                               onClick={() => {
                                 const newField = { id: 'field-' + Date.now(), label: 'Nuova Domanda', type: 'text' as const, required: false };
                                 patchSelectedBlock({ widgetProps: { customFields: [...customFields, newField] } });
                               }}
                               style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.05em' }}
                             >
                               + AGGIUNGI DOMANDA PERSONALIZZATA
                             </Button>
                          </div>

                          {customFields.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                              {customFields.map((field: any, index: number) => (
                                <div key={field.id || index} style={{ background: 'var(--surface-light)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px' }}>
                                  <input
                                    value={field.label || ''}
                                    onChange={(e) => updateCustomField(index, { label: e.target.value })}
                                    placeholder={`Domanda ${index + 1}`}
                                    style={{
                                      width: '100%',
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      border: '1px solid var(--border)',
                                      background: 'var(--surface)',
                                      color: 'var(--text-primary)',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                    <Button
                                      variant={field.type === 'text' ? 'primary' : 'subtle'}
                                      style={{ flex: 1, fontSize: '10px', borderRadius: '100px', padding: '6px 8px' }}
                                      onClick={() => updateCustomField(index, { type: 'text' })}
                                    >
                                      Testo libero
                                    </Button>
                                    <Button
                                      variant={field.type === 'checkbox' ? 'primary' : 'subtle'}
                                      style={{ flex: 1, fontSize: '10px', borderRadius: '100px', padding: '6px 8px' }}
                                      onClick={() => updateCustomField(index, { type: 'checkbox' })}
                                    >
                                      Sì / No
                                    </Button>
                                  </div>
                                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                    <Button
                                      variant={field.required ? 'primary' : 'subtle'}
                                      style={{ flex: 1, fontSize: '10px', borderRadius: '100px', padding: '6px 8px' }}
                                      onClick={() => updateCustomField(index, { required: !field.required })}
                                    >
                                      {field.required ? 'Obbligatoria' : 'Facoltativa'}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      style={{ color: 'var(--error)', fontSize: '10px', borderRadius: '100px', padding: '6px 8px' }}
                                      onClick={() => removeCustomField(index)}
                                    >
                                      <Trash2 size={12} style={{ marginRight: 4 }} /> Elimina
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* WIDGET SETTINGS TAB — mappa, galleria, video.
                    Unica tab per i 3 tipi (switch interno sul block.type).
                    Controlli = subset essenziale della sidebar desktop:
                    - map: titolo, indirizzo, zoom, colore accento
                    - gallery: layout, colonne, spazio (upload via desktop)
                    - video: URL, controlli riproduzione, rimuovi
                    Gli upload di file (foto gallery / video .mp4) restano sulla
                    sidebar desktop per evitare la complessità di fetch/API
                    nel MobileToolbar (richiederebbe `slug` e handler di upload
                    duplicati). Su mobile l'utente può comunque incollare un
                    link YouTube/Vimeo come sorgente video senza upload. */}
                {activeMobileTab === 'add_section' && (
                  <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px'}}>
                      <Button variant="primary" style={{width: '100%', justifyContent: 'center'}} onClick={() => {
                        if (blocks && setBlocks) {
                          setIsDirty && setIsDirty(true);
                          setBlocks([...blocks, { id: 'block-' + Date.now(), type: 'canvas', y: 0, height: 480, bgColor: '#ffffff', props: { bgColor: '#ffffff' }, order: blocks.length } as any]);
                          pushToHistory();
                          setActiveMobileTab(null);
                        }
                      }}>
                        <Plus size={16} style={{marginRight: 6}}/> Vuota
                      </Button>
                      
                      <Button variant="subtle" style={{width: '100%', justifyContent: 'center', borderColor: 'var(--accent-soft)', borderStyle: 'dashed'}} onClick={() => {
                        if (blocks && setBlocks) {
                          setIsDirty && setIsDirty(true);
                          const newBlockId = 'block-map-' + Date.now();
                          setBlocks([...blocks, {
                            id: newBlockId,
                            type: 'map',
                            order: blocks.length,
                            y: 0,
                            height: 560,
                            bgColor: '#f9f9f9',
                            props: { address: '', zoom: 15, bgColor: '#f9f9f9' }
                          }]);
                          pushToHistory();
                          setActiveMobileTab(null);
                        }
                      }}>
                        <MapPin size={16} style={{marginRight: 6}}/> Mappa
                      </Button>
                      
                      <Button variant="subtle" style={{width: '100%', justifyContent: 'center', borderColor: 'var(--accent-soft)', borderStyle: 'dashed'}} onClick={() => {
                        if (blocks && setBlocks) {
                          setIsDirty && setIsDirty(true);
                          const newBlockId = 'block-rsvp-' + Date.now();
                          
                          setBlocks([...blocks, {
                            id: newBlockId,
                            type: 'rsvp',
                            order: blocks.length,
                            y: 0,
                            height: 750,
                            bgColor: '#1a1a1a',
                            props: { bgColor: '#1a1a1a' },
                            widgetProps: { 
                              rsvpTitle: 'GENTILE CONFERMA',
                              rsvpDescription: 'Ti preghiamo di confermare la tua presenza entro il 30 Giugno 2026.'
                            }
                          } as any]);
                          pushToHistory();
                          setActiveMobileTab(null);
                        }
                      }}>
                        <CheckSquare size={16} style={{marginRight: 6}}/> RSVP
                      </Button>

                      <Button variant="subtle" style={{width: '100%', justifyContent: 'center', borderColor: 'var(--accent-soft)', borderStyle: 'dashed'}} onClick={() => {
                        if (blocks && setBlocks && setLayers) {
                          setIsDirty && setIsDirty(true);
                          const newBlockId = 'block-gallery-' + Date.now();
                          const galleryLayers = [
                            ...(layers || []),
                            {
                              id: 'layer-gallery-title-' + newBlockId + '-' + Date.now(),
                              blockId: newBlockId,
                              type: 'text',
                              text: 'LA NOSTRA GALLERIA',
                              x: 'center',
                              y: 40,
                              width: 600,
                              fontSize: 28,
                              fontFamily: event.theme?.fonts?.heading || 'Playfair Display',
                              textAlign: 'center',
                              color: event.theme?.accent || 'var(--accent)'
                            }
                          ];
                          setBlocks([...blocks, {
                            id: newBlockId,
                            type: 'gallery',
                            order: blocks.length,
                            y: 0,
                            height: 660,
                            bgColor: '#ffffff',
                            props: {
                              bgColor: '#ffffff',
                              images: [],
                              layout: 'masonry',
                              columns: 3,
                              gap: 12
                            }
                          } as any]);
                          setLayers(galleryLayers as any);
                          pushToHistory();
                          setActiveMobileTab(null);
                        }
                      }}>
                        <Images size={16} style={{marginRight: 6}}/> Galleria
                      </Button>

                      <Button variant="subtle" style={{width: '100%', justifyContent: 'center', borderColor: 'var(--accent-soft)', borderStyle: 'dashed'}} onClick={() => {
                        if (blocks && setBlocks && setLayers) {
                          setIsDirty && setIsDirty(true);
                          const newBlockId = 'block-video-' + Date.now();
                          const videoLayers = [
                            ...(layers || []),
                            {
                              id: 'layer-video-title-' + newBlockId + '-' + Date.now(),
                              blockId: newBlockId,
                              type: 'text',
                              text: 'IL NOSTRO VIDEO',
                              x: 'center',
                              y: 40,
                              width: 600,
                              fontSize: 28,
                              fontFamily: event.theme?.fonts?.heading || 'Playfair Display',
                              textAlign: 'center',
                              color: '#ffffff'
                            }
                          ];
                          setBlocks([...blocks, {
                            id: newBlockId,
                            type: 'video',
                            order: blocks.length,
                            y: 0,
                            height: 700,
                            bgColor: '#050506',
                            props: {
                              bgColor: '#050506',
                              videoUrl: '',
                              autoplay: false,
                              loop: false,
                              muted: true,
                              controls: true
                            }
                          } as any]);
                          setLayers(videoLayers as any);
                          pushToHistory();
                          setActiveMobileTab(null);
                        }
                      }}>
                        <VideoIcon size={16} style={{marginRight: 6}}/> Video
                      </Button>

                      <Button variant="subtle" style={{width: '100%', justifyContent: 'center', borderColor: 'var(--accent-soft)', borderStyle: 'dashed'}} onClick={() => {
                        if (blocks && setBlocks && setLayers) {
                          setIsDirty && setIsDirty(true);
                          const newBlockId = 'block-payment-' + Date.now();
                          setBlocks([...blocks, {
                            id: newBlockId,
                            type: 'payment',
                            order: blocks.length,
                            y: 0,
                            height: 760,
                            bgColor: '#1a1a1a',
                            props: { bgColor: '#1a1a1a' },
                            widgetProps: {
                              paymentTitle: '',
                              paymentDescription: '',
                              paymentPresetAmounts: [50, 100, 200, 300],
                              paymentMinAmount: 1,
                              paymentMaxAmount: 5000,
                              paymentShowProgress: false,
                              paymentAccentColor: '#C9A961',
                              paymentMode: 'gift',
                              mobileOrder: 5,
                            }
                          } as any]);
                          pushToHistory();
                          setActiveMobileTab(null);
                        }
                      }}>
                        <Gift size={16} style={{marginRight: 6}}/> Regali
                      </Button>
                    </div>
                  </div>
                )}

                {activeMobileTab === 'widget_settings' && selectedBlockId && blocks && (
                  <div style={{ flex: 1, minWidth: 0, maxWidth: '100%', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(() => {
                      const block = blocks.find(b => b.id === selectedBlockId);
                      if (!block) return null;

                      const patchProps = (patch: Record<string, any>) => patchSelectedBlock({ props: patch });
                      const patchWidgetProps = (patch: Record<string, any>) => patchSelectedBlock({ widgetProps: patch });

                      const inputStyle: React.CSSProperties = {
                        width: '100%', padding: '10px 12px', fontSize: '12px',
                        background: 'var(--surface-light)', color: 'var(--text-primary)',
                        border: '1px solid var(--border)', borderRadius: '10px',
                        boxSizing: 'border-box', outline: 'none'
                      };
                      const labelStyle: React.CSSProperties = {
                        fontSize: '9px', fontWeight: 800, color: 'var(--accent)',
                        textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px'
                      };

                      if (block.type === 'map') {
                        return (
                          <>
                            <div>
                              <label style={labelStyle}>Titolo sezione</label>
                              <input style={inputStyle} value={block.props?.title || ''} placeholder="Come Arrivare"
                                onChange={(e) => patchProps({ title: e.target.value })} />
                            </div>
                            <div>
                              <label style={labelStyle}>Indirizzo</label>
                              <input style={inputStyle} value={block.props?.address || ''} placeholder="Via, Città"
                                onChange={(e) => patchProps({ address: e.target.value })} />
                            </div>
                            <div>
                              <label style={labelStyle}>Zoom ({block.props?.zoom ?? 15})</label>
                              <input type="range" min={10} max={19} step={1} value={block.props?.zoom ?? 15}
                                onChange={(e) => patchProps({ zoom: parseInt(e.target.value, 10) })}
                                className="custom-slider"
                                style={getRangeStyle(Math.round((((block.props?.zoom ?? 15) - 10) / 9) * 100))} />
                            </div>
                            <Button variant={displayColorPicker === 'mapAccent' ? 'primary' : 'subtle'}
                              style={{ width: '100%', fontSize: '11px', justifyContent: 'space-between', borderRadius: '100px', padding: '10px 12px' }}
                              onClick={() => setDisplayColorPicker(displayColorPicker === 'mapAccent' ? false : 'mapAccent')}>
                              <span style={{ fontWeight: 600 }}>Colore accento</span>
                              <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: block.widgetProps?.mapAccentColor || 'var(--accent)', border: '1px solid var(--border)' }} />
                            </Button>
                            {displayColorPicker === 'mapAccent' && (
                              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <CustomColorPicker color={(block.widgetProps?.mapAccentColor as string) || '#14b8a6'}
                                  onChange={(color) => patchWidgetProps({ mapAccentColor: color })} />
                              </div>
                            )}
                          </>
                        );
                      }

                      if (block.type === 'gallery') {
                        const images = block.props?.images || [];
                        const layout = block.props?.layout || 'masonry';
                        return (
                          <>
                            <p style={{ fontSize: '10px', color: 'var(--text-soft)', lineHeight: '1.5', padding: '10px 12px', background: 'rgba(var(--accent-rgb), 0.05)', borderRadius: '10px', borderLeft: '3px solid var(--accent)', margin: 0 }}>
                              {images.length > 0
                                ? `${images.length} foto caricate. Da qui puoi aggiungerne altre, poi regolare layout e spaziatura.`
                                : 'Carica le foto direttamente qui sotto oppure regola layout e spaziatura.'}
                            </p>
                            <Button
                              variant={galleryUploading ? 'primary' : 'subtle'}
                              style={{ width: '100%', fontSize: '11px', justifyContent: 'center', borderRadius: '100px' }}
                              onClick={() => galleryInputRef.current?.click()}
                              disabled={galleryUploading}
                            >
                              <Upload size={14} style={{ marginRight: 6 }} />
                              {galleryUploading ? 'Caricamento foto...' : 'Carica Foto'}
                            </Button>
                            <input
                              ref={galleryInputRef}
                              type="file"
                              accept="image/*"
                              multiple
                              style={{ display: 'none' }}
                              onChange={async (e) => {
                                const files = Array.from(e.target.files || []);
                                await uploadGalleryFilesMobile(files);
                                if (e.target) e.target.value = '';
                              }}
                            />
                            {images.length > 0 && (
                              <div style={{ width: '100%', minWidth: 0, maxWidth: '100%' }}>
                                <label style={labelStyle}>Foto ({images.length})</label>
                                <div style={{ width: '100%', minWidth: 0, maxWidth: '100%', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch' }}>
                                  <div style={{ display: 'inline-flex', flexWrap: 'nowrap', gap: '8px', paddingBottom: '4px' }}>
                                    {images.map((img: any, idx: number) => {
                                      const src = typeof img === 'string' ? img : (img?.url || img?.src || '');
                                      const key = (img && img.id) || `${src}-${idx}`;
                                      return (
                                        <div key={key} style={{ position: 'relative', flex: '0 0 116px', width: '116px', height: '78px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-light)' }}>
                                          {src && (
                                            <img
                                              src={src}
                                              alt=""
                                              loading="lazy"
                                              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                            />
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const next = images.filter((_: any, i: number) => i !== idx);
                                              patchProps({ images: next });
                                            }}
                                            aria-label="Rimuovi foto"
                                            style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', border: 'none', borderRadius: '50%', background: 'rgba(0,0,0,0.55)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, zIndex: 1 }}
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                            <div>
                              <label style={labelStyle}>Layout</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <Button variant={layout === 'masonry' ? 'primary' : 'subtle'} style={{ flex: 1, fontSize: '11px', borderRadius: '100px' }}
                                  onClick={() => patchProps({ layout: 'masonry' })}>Masonry</Button>
                                <Button variant={layout === 'grid' ? 'primary' : 'subtle'} style={{ flex: 1, fontSize: '11px', borderRadius: '100px' }}
                                  onClick={() => patchProps({ layout: 'grid' })}>Griglia</Button>
                              </div>
                            </div>
                            <div>
                              <label style={labelStyle}>Colonne ({block.props?.columns ?? 3})</label>
                              <input type="range" min={1} max={5} step={1} value={block.props?.columns ?? 3}
                                onChange={(e) => patchProps({ columns: parseInt(e.target.value, 10) })}
                                className="custom-slider"
                                style={getRangeStyle(Math.round((((block.props?.columns ?? 3) - 1) / 4) * 100))} />
                            </div>
                            <div>
                              <label style={labelStyle}>Spaziatura ({block.props?.gap ?? 12}px)</label>
                              <input type="range" min={0} max={40} step={2} value={block.props?.gap ?? 12}
                                onChange={(e) => patchProps({ gap: parseInt(e.target.value, 10) })}
                                className="custom-slider"
                                style={getRangeStyle(Math.round(((block.props?.gap ?? 12) / 40) * 100))} />
                            </div>
                          </>
                        );
                      }

                      if (block.type === 'video') {
                        const url = block.props?.videoUrl || '';
                        const hasVideo = Boolean(url);
                        const ToggleRow = ({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) => (
                          <Button variant="subtle" style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px' }} onClick={onChange}>
                            <span style={{ fontSize: '11px', fontWeight: 600 }}>{label}</span>
                            <div style={{ width: '16px', height: '16px', border: '1px solid var(--accent)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {value && <Check size={12} color="var(--accent)" />}
                            </div>
                          </Button>
                        );
                        return (
                          <>
                            <div>
                              <label style={labelStyle}>Sorgente video</label>
                              {hasVideo ? (
                                <div style={{ flex: 1, background: 'rgba(var(--accent-rgb), 0.06)', border: '1px solid rgba(var(--accent-rgb), 0.2)', borderRadius: '10px', padding: '9px 10px', fontSize: '11px', color: 'var(--text-soft)', fontWeight: 600 }}>
                                  Video caricato
                                </div>
                              ) : (
                                <input style={inputStyle} value={url} placeholder="https://youtu.be/..."
                                  onChange={(e) => patchProps({ videoUrl: e.target.value })}
                                />
                              )}
                              <Button
                                variant={videoUploading ? 'primary' : 'subtle'}
                                style={{ width: '100%', fontSize: '11px', justifyContent: 'center', borderRadius: '100px', marginTop: '8px' }}
                                onClick={() => videoInputRef.current?.click()}
                                disabled={videoUploading}
                              >
                                <Upload size={14} style={{ marginRight: 6 }} />
                                {videoUploading
                                  ? (videoUploadProgress !== null ? `Caricamento ${videoUploadProgress}%` : 'Caricamento video...')
                                  : 'Carica Video'}
                              </Button>
                              <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/*"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                  const f = e.target.files?.[0];
                                  if (f) await uploadVideoFileMobile(f);
                                  if (e.target) e.target.value = '';
                                }}
                              />
                              <p style={{ fontSize: '10px', color: 'var(--text-soft)', marginTop: '6px', lineHeight: 1.5 }}>
                                Puoi incollare un link YouTube/Vimeo oppure caricare un file .mp4/.webm.
                              </p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                              <ToggleRow label="Autoplay" value={!!block.props?.autoplay} onChange={() => patchProps({ autoplay: !block.props?.autoplay })} />
                              <ToggleRow label="Loop" value={!!block.props?.loop} onChange={() => patchProps({ loop: !block.props?.loop })} />
                              <ToggleRow label="Senza audio" value={block.props?.muted !== false} onChange={() => patchProps({ muted: block.props?.muted === false })} />
                              <ToggleRow label="Controlli" value={block.props?.controls !== false} onChange={() => patchProps({ controls: block.props?.controls === false })} />
                            </div>
                            {url && (
                              <Button variant="ghost" style={{ width: '100%', color: 'var(--error)', fontSize: '11px', marginTop: '4px' }}
                                onClick={() => patchProps({ videoUrl: '' })}>
                                <Trash2 size={14} style={{ marginRight: 6 }} /> Rimuovi video
                              </Button>
                            )}
                          </>
                        );
                      }

                      return null;
                    })()}
                  </div>
                )}

                {/* PAYMENT: 4 tab separati (setup / contenuto / importi / stile)
                    per evitare il "mappazzone" unico che non entra nella viewport.
                    Riusiamo PaymentSection in modalità compact + section per
                    avere un'unica fonte di verità con il desktop. */}
                {(['payment_setup', 'payment_content', 'payment_amounts', 'payment_style'] as const).includes(activeMobileTab as any) && selectedBlockId && blocks && (() => {
                  const block = blocks.find(b => b.id === selectedBlockId);
                  if (!block || block.type !== 'payment') return null;
                  const sectionMap: Record<string, 'setup' | 'content' | 'amounts' | 'style'> = {
                    payment_setup: 'setup',
                    payment_content: 'content',
                    payment_amounts: 'amounts',
                    payment_style: 'style',
                  };
                  return (
                    <div style={{ flex: 1, minWidth: 0, width: '100%', alignSelf: 'stretch' }}>
                       <PaymentSection
                        block={block as Block}
                        displayColorPicker={displayColorPicker}
                        setDisplayColorPicker={setDisplayColorPicker}
                        setIsDirty={(v: boolean) => setIsDirty?.(v)}
                        blocks={blocks}
                        setBlocks={setBlocks as any}
                        slug={slug || ''}
                        compact
                        section={sectionMap[activeMobileTab as string] as 'setup' | 'content' | 'amounts' | 'style'}
                      />
                    </div>
                  );
                })()}
            </div>
          </div>
        )}

      <div className="mobile-toolbar">
        {selectedLayer && (editorMode === 'canvas' || editorMode === 'event_page') ? (
           <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%', padding: '4px 0' }}>
             {(!selectedLayer.type || selectedLayer.type === 'text') ? (
               <>
                 <MobileIconBtn icon={Baseline} label="Carattere" onClick={() => setActiveMobileTab(activeMobileTab === 'font' ? null : 'font')} />
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
              {editorMode !== 'event_page' && (
                <div style={{ padding: '8px 10px 4px', fontSize: '10px', color: 'var(--text-soft)', textAlign: 'center' }}>
                  {editorMode === 'envelope' ? "Personalizza la tua busta" : "Personalizza lo scenario"}
                </div>
              )}
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%', padding: '4px 0' }}>
                  {editorMode === 'envelope' ? (
                    <>
                      <MobileIconBtn 
                        icon={isEnvelopeOpen ? Mail : MailOpen} 
                        label={isEnvelopeOpen ? "Chiudi Busta" : "Apri Busta"}
                        variant={isEnvelopeOpen ? 'primary' : 'ghost'}
                        onClick={() => setIsEnvelopeOpen(!isEnvelopeOpen)}
                      />
                      {canvasProps?.width !== canvasProps?.height && (
                        <MobileIconBtn icon={Layout} label="Formato" onClick={() => setActiveMobileTab("envelope_format")} />
                      )}
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
                        label="Scenario" 
                        variant={activeMobileTab === 'scenario_bg' ? 'primary' : 'ghost'}
                        onClick={() => setActiveMobileTab('scenario_bg')} 
                      />
                    </>
                  ) : editorMode === 'event_page' ? (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      width: '100%', 
                      padding: '12px 14px 8px 14px',
                      borderTop: '1px solid rgba(255,255,255,0.15)',
                      marginTop: '-2px'
                    }}>
                       {/* RIGA INTESTAZIONI UNIFICATA */}
                       <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '6px', padding: '0 4px' }}>
                         <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 1 }}>
                            {(() => {
                              if (!selectedBlockId) return "Aggiungi";
                              const t = blocks?.find(b => b.id === selectedBlockId)?.type;
                              if (t === 'rsvp') return "Modifica RSVP";
                              if (t === 'gallery') return "Modifica Galleria";
                              if (t === 'video') return "Modifica Video";
                              if (t === 'map') return "Modifica Mappa";
                              if (t === 'payment') return "Modifica Regali";
                              return "Modifica Sezione";
                            })()}
                         </span>
                         <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 1, width: '100px', textAlign: 'left', paddingLeft: '4px' }}>Visualizza su</span>
                       </div>

                       {/* RIGA CONTROLLI */}
                       <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                         
                         {/* BLOCCO AZIONI (Sinistra) - CONTESTUALE */}
                         <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                            {(() => {
                              const block = blocks?.find(b => b.id === selectedBlockId);
                              if (block && block.type === 'rsvp') {
                                return (
                                  <>
                                    <div style={{ display: 'flex', gap: '2px', alignItems: 'center', flex: 1, overflowX: 'auto', minWidth: 0 }}>
                                      <MobileIconBtn 
                                        icon={AlignJustify} 
                                        label="Testo" 
                                        variant={activeMobileTab === 'rsvp_content' ? 'primary' : 'ghost'}
                                        onClick={() => setActiveMobileTab('rsvp_content')} 
                                      />
                                      <MobileIconBtn 
                                        icon={Palette} 
                                        label="Stile" 
                                        variant={activeMobileTab === 'rsvp_style' ? 'primary' : 'ghost'}
                                        onClick={() => setActiveMobileTab('rsvp_style')} 
                                      />
                                      <MobileIconBtn 
                                        icon={Settings2} 
                                        label="Campi" 
                                        variant={activeMobileTab === 'rsvp_questions' ? 'primary' : 'ghost'}
                                        onClick={() => setActiveMobileTab('rsvp_questions')} 
                                      />
                                      <MobileIconBtn 
                                        icon={Type} 
                                        label="+ Testo" 
                                        onClick={addTextLayer} 
                                      />
                                    </div>
                                  </>
                                );
                              }

                              // Widget map/gallery/video: stesso pattern di RSVP — un
                              // pulsante "Impostazioni" apre il tab con i controlli del
                              // widget + un "+ Testo" per aggiungere titoli/didascalie.
                              if (block && (block.type === 'map' || block.type === 'gallery' || block.type === 'video')) {
                                return (
                                  <>
                                    <MobileIconBtn
                                      icon={Settings2}
                                      label="Impostazioni"
                                      variant={activeMobileTab === 'widget_settings' ? 'primary' : 'ghost'}
                                      onClick={() => setActiveMobileTab('widget_settings')}
                                    />
                                    <MobileIconBtn
                                      icon={Type}
                                      label="+ Testo"
                                      onClick={addTextLayer}
                                    />
                                  </>
                                );
                              }

                              // Payment widget: 4 tab dedicati invece di un unico
                              // "Impostazioni", per dividere i campi in gruppi
                              // leggibili (stesso pattern di RSVP con Stile/Campi).
                              // 5° pulsante "+ Testo" per aggiungere didascalie/titoli
                              // come sugli altri widget; il container scrolla
                              // orizzontalmente su schermi molto stretti.
                              if (block && block.type === 'payment') {
                                const paymentTabs = ['payment_setup', 'payment_content', 'payment_amounts', 'payment_style'];
                                const active = paymentTabs.includes(activeMobileTab as string);
                                return (
                                  <div
                                    className="payment-mobile-tabs"
                                    style={{ display: 'flex', gap: '2px', alignItems: 'center', flex: 1, overflowX: 'auto', minWidth: 0 }}
                                  >
                                    <MobileIconBtn
                                      icon={CreditCard}
                                      label="Setup"
                                      variant={activeMobileTab === 'payment_setup' ? 'primary' : 'ghost'}
                                      onClick={() => setActiveMobileTab(active && activeMobileTab === 'payment_setup' ? null : 'payment_setup')}
                                    />
                                    <MobileIconBtn
                                      icon={AlignJustify}
                                      label="Contenuto"
                                      variant={activeMobileTab === 'payment_content' ? 'primary' : 'ghost'}
                                      onClick={() => setActiveMobileTab(active && activeMobileTab === 'payment_content' ? null : 'payment_content')}
                                    />
                                    <MobileIconBtn
                                      icon={Banknote}
                                      label="Importi"
                                      variant={activeMobileTab === 'payment_amounts' ? 'primary' : 'ghost'}
                                      onClick={() => setActiveMobileTab(active && activeMobileTab === 'payment_amounts' ? null : 'payment_amounts')}
                                    />
                                    <MobileIconBtn
                                      icon={Palette}
                                      label="Stile"
                                      variant={activeMobileTab === 'payment_style' ? 'primary' : 'ghost'}
                                      onClick={() => setActiveMobileTab(active && activeMobileTab === 'payment_style' ? null : 'payment_style')}
                                    />
                                    <MobileIconBtn
                                      icon={Type}
                                      label="+ Testo"
                                      onClick={addTextLayer}
                                    />
                                  </div>
                                );
                              }

                              // Tableau widget: 4 tab dedicati (Tavoli / Ospiti /
                              // Vincoli / Stile) coerenti con i microcomponenti
                              // sidebar desktop. Stessa estetica del payment block.
                              if (block && block.type === 'tableau') {
                                const tableauTabs = ['tableau_tables', 'tableau_guests', 'tableau_rules', 'tableau_style'];
                                const active = tableauTabs.includes(activeMobileTab as string);
                                return (
                                  <div
                                    className="tableau-mobile-tabs"
                                    style={{ display: 'flex', gap: '2px', alignItems: 'center', flex: 1, overflowX: 'auto', minWidth: 0 }}
                                  >
                                    <MobileIconBtn
                                      icon={Layout}
                                      label="Tavoli"
                                      variant={activeMobileTab === 'tableau_tables' ? 'primary' : 'ghost'}
                                      onClick={() => setActiveMobileTab(active && activeMobileTab === 'tableau_tables' ? null : 'tableau_tables')}
                                    />
                                    <MobileIconBtn
                                      icon={Users}
                                      label="Ospiti"
                                      variant={activeMobileTab === 'tableau_guests' ? 'primary' : 'ghost'}
                                      onClick={() => setActiveMobileTab(active && activeMobileTab === 'tableau_guests' ? null : 'tableau_guests')}
                                    />
                                    <MobileIconBtn
                                      icon={Sparkles}
                                      label="Vincoli"
                                      variant={activeMobileTab === 'tableau_rules' ? 'primary' : 'ghost'}
                                      onClick={() => setActiveMobileTab(active && activeMobileTab === 'tableau_rules' ? null : 'tableau_rules')}
                                    />
                                    <MobileIconBtn
                                      icon={Palette}
                                      label="Stile"
                                      variant={activeMobileTab === 'tableau_style' ? 'primary' : 'ghost'}
                                      onClick={() => setActiveMobileTab(active && activeMobileTab === 'tableau_style' ? null : 'tableau_style')}
                                    />
                                  </div>
                                );
                              }

                              return (
                                <>
                                  <MobileIconBtn 
                                    icon={Plus} 
                                    label="Sezione" 
                                    variant={activeMobileTab === 'add_section' ? 'primary' : 'ghost'}
                                    onClick={() => setActiveMobileTab(activeMobileTab === 'add_section' ? null : 'add_section')} 
                                  />
                                  <MobileIconBtn 
                                    icon={Type} 
                                    label="Testo" 
                                    onClick={addTextLayer} 
                                  />
                                  {/* Filtro coerente con sidebar desktop: niente "Foto"
                                      su widget-only (rsvp/map/gallery/video hanno già le
                                      loro sorgenti media specifiche). */}
                                  {(!block || !['rsvp','map','gallery','video','payment','tableau'].includes(block.type as string)) && (
                                    <MobileIconBtn 
                                      icon={ImageIcon} 
                                      label="Foto" 
                                      onClick={() => fileInputRef.current?.click()} 
                                    />
                                  )}
                                </>
                              );
                            })()}
                         </div>

                         {/* DIVISORE VERTICALE */}
                         <div style={{ width: '1.5px', height: '30px', background: 'rgba(255,255,255,0.15)', margin: '0 12px' }} />

                         {/* BLOCCO VISTA (Destra) */}
                         <div style={{ 
                           display: 'flex', 
                           flexDirection: 'column',
                           background: 'rgba(0,0,0,0.2)', 
                           padding: '4px', 
                           borderRadius: '12px',
                           border: '1px solid rgba(255,255,255,0.08)',
                           width: '100px',
                           flexShrink: 0,
                           gap: '4px'
                         }}>
                           <button 
                             onClick={() => setPreviewMobile?.(true)}
                             style={{
                               flex: 1,
                               background: previewMobile ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                               border: 'none',
                               borderRadius: '8px',
                               padding: '6px 10px',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'flex-start',
                               gap: '8px',
                               color: previewMobile ? '#000' : 'rgba(255,255,255,0.75)',
                               transition: 'all 0.2s',
                               cursor: 'pointer'
                             }}
                           >
                             <Smartphone size={13} style={{ opacity: previewMobile ? 1 : 0.8 }} />
                             <span style={{ fontSize: '10px', fontWeight: 700 }}>Mobile</span>
                           </button>
                           <button 
                             onClick={() => setPreviewMobile?.(false)}
                             style={{
                               flex: 1,
                               background: !previewMobile ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                               border: 'none',
                               borderRadius: '8px',
                               padding: '6px 10px',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'flex-start',
                               gap: '8px',
                               color: !previewMobile ? '#000' : 'rgba(255,255,255,0.75)',
                               transition: 'all 0.2s',
                               cursor: 'pointer'
                             }}
                           >
                             <Monitor size={13} style={{ opacity: !previewMobile ? 1 : 0.8 }} />
                             <span style={{ fontSize: '10px', fontWeight: 700 }}>Desktop</span>
                           </button>
                         </div>
                       </div>
                    </div>
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
  );
};

export default MobileToolbar;
