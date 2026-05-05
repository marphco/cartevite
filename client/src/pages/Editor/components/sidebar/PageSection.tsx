import React from 'react';
import { Surface, Button } from "../../../../ui";
import { 
  Type, Image as ImageIcon, MapPin, CheckSquare, Plus, Trash2, Monitor, Smartphone, Check, Pencil,
  Images, Video as VideoIcon, Upload, GripVertical, Youtube, Gift, LayoutGrid
} from "lucide-react";
import PropertyPanel from "../PropertyPanel";
import CustomColorPicker from "../CustomColorPicker";
import PaymentSection from "./PaymentSection";
import TableauSidebar from "./TableauSidebar";
import type { Layer, Block, EventData } from "../../../../types/editor";
import { apiFetch } from "../../../../utils/apiFetch";
import { parseVideoUrl } from "../widgets/VideoWidget";
import { widgetLayerIdForBlock } from "../../../../utils/widgetLayerId";

interface PageSectionProps {
  previewMobile: boolean;
  setPreviewMobile: (preview: boolean) => void;
  slug: string;
  selectedLayer: any;
  selectedLayerIds: string[];
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  setSelectedLayerIds: (ids: string[]) => void;
  updateSelectedLayer: (updates: Partial<Layer>) => void;
  deleteSelectedLayers: () => void;
  alignLayers: (dir: any, ref: any) => void;
  hoveredLayerId: string | null;
  setHoveredLayerId: (id: string | null) => void;
  keyLayerId: string | null;
  setKeyLayerId: (id: string | null) => void;
  alignmentReference: any;
  setAlignmentReference: (ref: any) => void;
  displayColorPicker: any;
  setDisplayColorPicker: (show: any) => void;
  selectedBlockId: string | null;
  addTextLayer: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setIsDirty: (val: boolean) => void;
  pushToHistory: () => void;
  showVisibility?: boolean | undefined;
  blocks?: Block[] | undefined;
  setBlocks?: React.Dispatch<React.SetStateAction<Block[]>> | undefined;
  onUpdateBlock?: ((blockId: string, updates: Partial<Block>) => void) | undefined;
  event?: EventData | null | undefined;
  updateEventData?: ((updates: Partial<EventData>, pushToHistory?: () => void) => void) | undefined;
}

const PageSection: React.FC<PageSectionProps> = ({
  previewMobile,
  setPreviewMobile,
  slug,
  selectedLayer,
  selectedLayerIds,
  layers,
  setLayers,
  setSelectedLayerIds,
  updateSelectedLayer,
  deleteSelectedLayers,
  alignLayers,
  hoveredLayerId,
  setHoveredLayerId,
  keyLayerId,
  setKeyLayerId,
  alignmentReference,
  setAlignmentReference,
  displayColorPicker,
  setDisplayColorPicker,
  selectedBlockId,
  addTextLayer,
  fileInputRef,
  handleImageUpload,
  blocks,
  setBlocks,
  setIsDirty,
  pushToHistory,
  onUpdateBlock,
  event,
  updateEventData,
  showVisibility = true
}) => {
   const selectedBlock = blocks?.find(b => b.id === selectedBlockId);
  const [activeRsvpTab, setActiveRsvpTab] = React.useState<'content' | 'style' | 'questions'>('content');
  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  const [galleryUploading, setGalleryUploading] = React.useState(false);
  const [galleryDragIndex, setGalleryDragIndex] = React.useState<number | null>(null);
  const [galleryDragOver, setGalleryDragOver] = React.useState(false);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const [videoUploading, setVideoUploading] = React.useState(false);
  const [videoDragOver, setVideoDragOver] = React.useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = React.useState<number | null>(null);

  // Scrive in modo immutabile una patch `props` sul blocco corrente.
  const patchBlockProps = (patch: Record<string, any>) => {
    if (!selectedBlock) return;
    if (onUpdateBlock) {
      onUpdateBlock(selectedBlock.id as string, { props: { ...selectedBlock.props, ...patch } });
    } else if (blocks && setBlocks) {
      setIsDirty(true);
      setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, ...patch } } : b));
    }
  };

  // Upload multiplo dedicato alla galleria: NON crea layer, popola `block.props.images`.
  // Singolo entry point usato sia dal picker classico (input change) sia dal
  // drag&drop (sidebar dropzone + widget empty state in editor).
  const uploadGalleryFiles = async (files: File[]) => {
    if (!files.length || !selectedBlock) return;
    setGalleryUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const res = await apiFetch(`/api/uploads?slug=${slug}&folder=gallery`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload fallito');
      const data = await res.json();
      const newImages = (data.urls as string[]).map((url) => ({
        id: `gallery-img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url
      }));
      const current = selectedBlock.props?.images || [];
      patchBlockProps({ images: [...current, ...newImages] });
      pushToHistory();
    } catch (err) {
      console.error('Gallery upload error:', err);
      alert('Errore durante il caricamento delle immagini.');
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await uploadGalleryFiles(files);
    if (e.target) e.target.value = '';
  };

  // Upload file VIDEO locale (mp4/webm/mov/ogg). Endpoint dedicato server-side
  // con filtro mime `video/*` e limiti alzati a 200MB. L'URL R2 viene salvato
  // come `block.props.videoUrl` e il source del widget lo riconosce come 'file'.
  const uploadVideoFile = async (file: File | undefined | null) => {
    if (!file || !selectedBlock) return;
    if (!file.type.startsWith('video/')) {
      alert('Formato non supportato. Carica un file video (mp4, webm, mov).');
      return;
    }
    setVideoUploading(true);
    setVideoUploadProgress(0);
    try {
      // Usiamo XHR (invece di fetch) per avere il progress bar reale: fetch non
      // ha ancora upload-progress standard in browser. È un'ottimizzazione UX
      // importante per file grandi (video > 50MB).
      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const params = new URLSearchParams({ slug: slug || '', folder: 'video' });
        xhr.open('POST', `/api/uploads/video?${params.toString()}`, true);
        // Copia credenziali/header di apiFetch (token bearer se presente)
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
      patchBlockProps({ videoUrl: url });
      pushToHistory();
    } catch (err: any) {
      console.error('Video upload error:', err);
      alert(err?.message || 'Errore durante il caricamento del video.');
    } finally {
      setVideoUploading(false);
      setVideoUploadProgress(null);
    }
  };

  const removeGalleryImage = (imgId: string) => {
    if (!selectedBlock) return;
    const next = (selectedBlock.props?.images || []).filter((i: any) => i.id !== imgId);
    patchBlockProps({ images: next });
    pushToHistory();
  };

  const reorderGallery = (fromIdx: number, toIdx: number) => {
    if (!selectedBlock) return;
    const imgs = [...(selectedBlock.props?.images || [])];
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= imgs.length || toIdx >= imgs.length) return;
    const [moved] = imgs.splice(fromIdx, 1);
    imgs.splice(toIdx, 0, moved);
    patchBlockProps({ images: imgs });
    pushToHistory();
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        {/* SWITCHER VISUALIZZAZIONE */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-soft)', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>Visualizzazione Editor</div>
          <div style={{ display: 'flex', gap: '8px' }}>
             <Button 
               variant={!previewMobile ? 'primary' : 'subtle'} 
               style={{ flex: 1, justifyContent: 'center', fontSize: '10px', padding: '8px 2px', ...(!previewMobile ? { boxShadow: '0 4px 12px rgba(var(--accent-rgb), 0.3)' } : {}) }}
               onClick={() => setPreviewMobile(false)}
             >
               <Monitor size={14} style={{ marginRight: 6 }} /> Desktop
             </Button>
             <Button 
               variant={previewMobile ? 'primary' : 'subtle'} 
               style={{ flex: 1, justifyContent: 'center', fontSize: '10px', padding: '8px 2px', ...(previewMobile ? { boxShadow: '0 4px 12px rgba(var(--accent-rgb), 0.3)' } : {}) }}
               onClick={() => setPreviewMobile(true)}
             >
               <Smartphone size={14} style={{ marginRight: 6 }} /> Mobile
             </Button>
          </div>
        </div>

        {selectedLayerIds.length > 0 && !selectedLayerIds.some(id => id.startsWith('widget-')) ? (
           /* PRIORITÀ 1: EDITOR ELEMENTO */
           <div key="editor-layer">
             <PropertyPanel 
               slug={slug}
               selectedLayer={selectedLayer}
               selectedLayerIds={selectedLayerIds}
               layers={layers}
               setSelectedLayerIds={setSelectedLayerIds}
               updateSelectedLayer={updateSelectedLayer}
               deleteSelectedLayers={deleteSelectedLayers}
               alignLayers={alignLayers}
               hoveredLayerId={hoveredLayerId}
               setHoveredLayerId={setHoveredLayerId}
               keyLayerId={keyLayerId}
               setKeyLayerId={setKeyLayerId}
               alignmentReference={alignmentReference}
               setAlignmentReference={setAlignmentReference}
               displayColorPicker={displayColorPicker}
               setDisplayColorPicker={setDisplayColorPicker}
             />
             
             {/* Opzioni di inserimento se siamo comunque dentro un blocco */}
             {selectedBlockId && (
               <Surface variant="soft" className="panel-section" style={{ padding: '16px' }}>
                 <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Inserisci nella Sezione</h3>
                 <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                   <Button variant="primary" style={{ width: '100%', justifyContent: 'center' }} onClick={addTextLayer}>
                     <Type size={18} style={{marginRight: 8}}/> Testo
                   </Button>
                  {/* Immagine disabilitata su RSVP / Mappa / Galleria / Video:
                      sono sezioni widget-only, le immagini libere non hanno senso
                      (la galleria gestisce già le foto, il video ha il suo player,
                      la mappa e il form non accettano overlay immagine). */}
                  {selectedBlock?.type !== 'rsvp' && selectedBlock?.type !== 'map' && selectedBlock?.type !== 'gallery' && selectedBlock?.type !== 'video' && selectedBlock?.type !== 'payment' && selectedBlock?.type !== 'tableau' && (
                    <Button variant="subtle" style={{ width: '100%', justifyContent: 'center' }} onClick={() => fileInputRef.current?.click()}>
                      <ImageIcon size={18} style={{marginRight: 8}}/> Immagine
                    </Button>
                  )}
                </div>
              </Surface>
            )}
          </div>
        ) : selectedBlockId ? (
          /* PRIORITÀ 2: OPZIONI SEZIONE (Se nessun elemento è selezionato) */
          <div key={selectedBlockId}>
           {/* Solo "Inserisci" si nasconde quando è selezionato il widget virtuale;
               i pannelli Mappa/Galleria/Video/Payment devono restare visibili anche
               con il widget selezionato (altrimenti sparisce PaymentSection). */}
           {!(selectedBlock && selectedLayerIds.includes(widgetLayerIdForBlock(String(selectedBlock.id)))) && (
             <Surface variant="soft" className="panel-section" style={{ padding: '16px' }}>
                 <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Inserisci nella Sezione</h3>
               <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                 <Button variant="primary" style={{ width: '100%', justifyContent: 'center', boxSizing: 'border-box' }} onClick={addTextLayer}>
                   <Type size={18} style={{marginRight: 8}}/> Testo
                 </Button>
                {/* Stesso filtro sopra: niente immagine su rsvp/map/gallery/video. */}
                {selectedBlock?.type !== 'rsvp' && selectedBlock?.type !== 'map' && selectedBlock?.type !== 'gallery' && selectedBlock?.type !== 'video' && selectedBlock?.type !== 'payment' && (
                  <Button variant="subtle" style={{ width: '100%', justifyContent: 'center', boxSizing: 'border-box' }} onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon size={18} style={{marginRight: 8}}/> Immagine
                  </Button>
                )}
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{display: 'none'}} />
              </div>
            </Surface>
            )}

            {/* SETTINGS SPECIFICI PER WIDGET MAPPA — panel dedicato, stesso pattern Jewelry
                usato per RSVP / Testo / Immagine (header di contesto + controlli in un unico Surface) */}
            {selectedBlock && selectedBlock.type === 'map' && (
              <Surface variant="soft" className="panel-section" style={{ marginTop: '20px' }}>
                {/* HEADER DI CONTESTO */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(var(--accent-rgb), 0.12)',
                    border: '1px solid rgba(var(--accent-rgb), 0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <MapPin size={18} color="var(--accent)" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                      Stai modificando
                    </div>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      Mappa
                    </h3>
                  </div>
                </div>

                {/* CAMPO: TITOLO SEZIONE */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                    Titolo
                  </label>
                  <div style={{
                    position: 'relative',
                    display: 'flex', alignItems: 'center',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    transition: 'border-color .15s ease, box-shadow .15s ease'
                  }}>
                    <Pencil size={12} style={{ color: 'var(--text-soft)', marginRight: '8px', flexShrink: 0 }} />
                    <input
                      type="text"
                      value={selectedBlock.props?.title || "Come Arrivare"}
                      onChange={(e) => {
                        if (onUpdateBlock && selectedBlock) {
                          onUpdateBlock(selectedBlock.id as string, { props: { ...selectedBlock.props, title: e.target.value } });
                        } else if (blocks && setBlocks) {
                          setIsDirty(true);
                          setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, title: e.target.value } } : b));
                        }
                      }}
                      placeholder="Es: Cerimonia, Ricevimento…"
                      onFocus={(e) => {
                        const p = e.currentTarget.parentElement as HTMLDivElement | null;
                        if (p) { p.style.borderColor = 'var(--accent)'; p.style.boxShadow = '0 0 0 3px rgba(var(--accent-rgb), 0.15)'; }
                      }}
                      onBlur={(e) => {
                        const p = e.currentTarget.parentElement as HTMLDivElement | null;
                        if (p) { p.style.borderColor = 'var(--border)'; p.style.boxShadow = 'none'; }
                      }}
                      style={{
                        flex: 1, background: 'transparent', border: 'none',
                        fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                        padding: 0, outline: 'none', width: '100%'
                      }}
                    />
                  </div>
                </div>

                {/* CAMPO: INDIRIZZO */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                    Indirizzo
                  </label>
                  <div style={{
                    position: 'relative',
                    display: 'flex', alignItems: 'center',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    transition: 'border-color .15s ease, box-shadow .15s ease'
                  }}>
                    <MapPin size={12} style={{ color: 'var(--text-soft)', marginRight: '8px', flexShrink: 0 }} />
                    <input
                      type="text"
                      value={selectedBlock.props?.address || ""}
                      onChange={(e) => {
                        if (onUpdateBlock && selectedBlock) {
                          onUpdateBlock(selectedBlock.id as string, { props: { ...selectedBlock.props, address: e.target.value } });
                        } else if (blocks && setBlocks) {
                          setIsDirty(true);
                          setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, address: e.target.value } } : b));
                        }
                      }}
                      placeholder="Es: Via Roma 1, Milano"
                      onFocus={(e) => {
                        const p = e.currentTarget.parentElement as HTMLDivElement | null;
                        if (p) { p.style.borderColor = 'var(--accent)'; p.style.boxShadow = '0 0 0 3px rgba(var(--accent-rgb), 0.15)'; }
                      }}
                      onBlur={(e) => {
                        const p = e.currentTarget.parentElement as HTMLDivElement | null;
                        if (p) { p.style.borderColor = 'var(--border)'; p.style.boxShadow = 'none'; }
                      }}
                      style={{
                        flex: 1, background: 'transparent', border: 'none',
                        fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                        padding: 0, outline: 'none', width: '100%'
                      }}
                    />
                  </div>
                  <p style={{ margin: '6px 2px 0', fontSize: '10px', color: 'var(--text-soft)', lineHeight: 1.4 }}>
                    L'indirizzo viene usato sia per la mappa che per il pulsante "Apri in Google Maps".
                  </p>
                </div>

                {/* CAMPO: ZOOM */}
                {(() => {
                  const z = selectedBlock.props?.zoom ?? 15;
                  const pct = Math.round(((z - 10) / (19 - 10)) * 100);
                  return (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Zoom
                        </label>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>{z}×</span>
                      </div>
                      <input
                        type="range" className="custom-slider"
                        min={10} max={19} step={1}
                        value={z}
                        onChange={(e) => {
                          const newZoom = parseInt(e.target.value, 10);
                          if (onUpdateBlock && selectedBlock) {
                            onUpdateBlock(selectedBlock.id as string, { props: { ...selectedBlock.props, zoom: newZoom } });
                          } else if (blocks && setBlocks) {
                            setIsDirty(true);
                            setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, zoom: newZoom } } : b));
                          }
                        }}
                        style={{
                          width: '100%',
                          background: `linear-gradient(to right, var(--accent) ${pct}%, rgba(60, 79, 118, 0.1) ${pct}%)`
                        } as React.CSSProperties}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '9px', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        <span>Città</span>
                        <span>Via</span>
                      </div>
                    </div>
                  );
                })()}

                {/* COLORE ACCENTO — picker stesso pattern di RSVP (formPrimaryColor).
                    Salvato su `widgetProps.mapAccentColor` (namespaced per non
                    collidere con futuri accentColor di altri widget). Se undefined
                    il widget ricade sul `theme.accent` globale, quindi retro-compat
                    piena per le mappe già create. */}
                <div style={{ marginTop: '16px' }}>
                  <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                    Colore Accento
                  </label>
                  <Button
                    variant={displayColorPicker === 'mapAccent' ? 'primary' : 'subtle'}
                    onClick={() => setDisplayColorPicker(displayColorPicker === 'mapAccent' ? false : 'mapAccent')}
                    style={{
                      width: '100%',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '100px',
                      ...(displayColorPicker === 'mapAccent' ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.5)', zIndex: 1 } : {})
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Icona & Pulsante</span>
                    <div style={{
                      width: '20px', height: '20px',
                      borderRadius: '4px',
                      background: selectedBlock.widgetProps?.mapAccentColor || 'var(--accent)',
                      border: '1px solid rgba(0,0,0,0.1)'
                    }} />
                  </Button>
                  {displayColorPicker === 'mapAccent' && (
                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '8px' }}>
                      <CustomColorPicker
                        color={(selectedBlock.widgetProps?.mapAccentColor as string) || '#14b8a6'}
                        onChange={(color) => {
                          if (onUpdateBlock && selectedBlock) {
                            onUpdateBlock(selectedBlock.id as string, { widgetProps: { ...selectedBlock.widgetProps, mapAccentColor: color } });
                          } else if (blocks && setBlocks) {
                            setIsDirty(true);
                            setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, widgetProps: { ...b.widgetProps, mapAccentColor: color } } : b));
                          }
                        }}
                      />
                    </div>
                  )}
                  <p style={{ margin: '6px 2px 0', fontSize: '10px', color: 'var(--text-soft)', lineHeight: 1.4 }}>
                    Usato per l'icona pin e il pulsante "Apri su Google Maps".
                  </p>
                </div>
              </Surface>
            )}

            {/* SETTINGS SPECIFICI PER WIDGET GALLERIA */}
            {selectedBlock && selectedBlock.type === 'gallery' && (
              <Surface variant="soft" className="panel-section" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(var(--accent-rgb), 0.12)',
                    border: '1px solid rgba(var(--accent-rgb), 0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Images size={18} color="var(--accent)" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                      Stai modificando
                    </div>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      Galleria Foto
                    </h3>
                  </div>
                </div>

                {/* [RIMOSSO] campo "Titolo (opzionale)": il titolo è ora un layer
                    testo standard, modificabile selezionandolo direttamente in canvas
                    con lo stesso PropertyPanel di qualsiasi altro testo in pagina. */}

                {/* UPLOAD DROPZONE — drag&drop + click per aprire il picker.
                    Stile coerente con l'empty state del widget in canvas: stesso
                    linguaggio visivo, stessa icona, stessa microcopy. */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                    Foto ({(selectedBlock.props?.images || []).length})
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setGalleryDragOver(true); }}
                    onDragEnter={(e) => { e.preventDefault(); setGalleryDragOver(true); }}
                    onDragLeave={() => setGalleryDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setGalleryDragOver(false);
                      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                      if (files.length) void uploadGalleryFiles(files);
                    }}
                    onClick={() => !galleryUploading && galleryInputRef.current?.click()}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '18px 12px',
                      border: `2px dashed ${galleryDragOver ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: '12px',
                      background: galleryDragOver ? 'rgba(var(--accent-rgb), 0.08)' : 'var(--surface)',
                      cursor: galleryUploading ? 'not-allowed' : 'pointer',
                      transition: 'border-color .15s ease, background .15s ease',
                      opacity: galleryUploading ? 0.7 : 1,
                      textAlign: 'center'
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'rgba(var(--accent-rgb), 0.12)',
                      border: '1px solid rgba(var(--accent-rgb), 0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Upload size={16} color="var(--accent)" />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {galleryUploading ? 'Caricamento…' : galleryDragOver ? 'Rilascia per caricare' : 'Trascina o clicca per aggiungere'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-soft)', lineHeight: 1.4 }}>
                      JPG, PNG, WebP — più foto alla volta
                    </div>
                  </div>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* THUMBNAILS LIST */}
                {(selectedBlock.props?.images || []).length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    {(selectedBlock.props?.images || []).map((img: any, idx: number) => (
                      <div
                        key={img.id}
                        draggable
                        onDragStart={() => setGalleryDragIndex(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (galleryDragIndex !== null) reorderGallery(galleryDragIndex, idx);
                          setGalleryDragIndex(null);
                        }}
                        onDragEnd={() => setGalleryDragIndex(null)}
                        style={{
                          position: 'relative',
                          aspectRatio: '1 / 1',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: 'var(--surface)',
                          border: galleryDragIndex === idx ? '2px solid var(--accent)' : '1px solid var(--border)',
                          cursor: 'grab',
                          opacity: galleryDragIndex === idx ? 0.5 : 1
                        }}
                      >
                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />
                        <Button
                          variant="ghost"
                          onClick={() => removeGalleryImage(img.id)}
                          style={{
                            position: 'absolute', top: 4, right: 4,
                            padding: '4px', minWidth: 'auto', height: 'auto',
                            background: 'rgba(0,0,0,0.6)', color: '#fff',
                            borderRadius: '6px'
                          }}
                          aria-label="Rimuovi foto"
                        >
                          <Trash2 size={12} />
                        </Button>
                        <div style={{
                          position: 'absolute', bottom: 4, left: 4,
                          display: 'flex', alignItems: 'center', gap: '3px',
                          padding: '2px 6px',
                          background: 'rgba(0,0,0,0.55)',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '9px', fontWeight: 700
                        }}>
                          <GripVertical size={9} /> {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(selectedBlock.props?.images || []).length > 1 && (
                  <p style={{ margin: '0 2px 16px', fontSize: '10px', color: 'var(--text-soft)', lineHeight: 1.4 }}>
                    Trascina le miniature per riordinare le foto nella galleria.
                  </p>
                )}

                {/* LAYOUT */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                    Layout
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button
                      variant={(selectedBlock.props?.layout || 'masonry') === 'masonry' ? 'primary' : 'subtle'}
                      onClick={() => patchBlockProps({ layout: 'masonry' })}
                      style={{ flex: 1, fontSize: '11px', padding: '8px', justifyContent: 'center', fontWeight: 700 }}
                    >
                      Masonry
                    </Button>
                    <Button
                      variant={selectedBlock.props?.layout === 'grid' ? 'primary' : 'subtle'}
                      onClick={() => patchBlockProps({ layout: 'grid' })}
                      style={{ flex: 1, fontSize: '11px', padding: '8px', justifyContent: 'center', fontWeight: 700 }}
                    >
                      Griglia
                    </Button>
                  </div>
                </div>

                {/* COLONNE — slider "Jewelry" coerente con PropertyPanel (custom-slider + gradient fill) */}
                {(() => {
                  const cols = selectedBlock.props?.columns ?? 3;
                  const pctCols = Math.round(((cols - 2) / (4 - 2)) * 100);
                  return (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Colonne
                        </label>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>{cols}</span>
                      </div>
                      <input
                        type="range" className="custom-slider"
                        min={2} max={4} step={1}
                        value={cols}
                        onChange={(e) => patchBlockProps({ columns: parseInt(e.target.value, 10) })}
                        style={{
                          width: '100%',
                          background: `linear-gradient(to right, var(--accent) ${pctCols}%, rgba(60, 79, 118, 0.1) ${pctCols}%)`
                        } as React.CSSProperties}
                      />
                    </div>
                  );
                })()}

                {/* SPAZIATURA — stesso pattern */}
                {(() => {
                  const gap = selectedBlock.props?.gap ?? 12;
                  const pctGap = Math.round((gap / 32) * 100);
                  return (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Spaziatura
                        </label>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>{gap}px</span>
                      </div>
                      <input
                        type="range" className="custom-slider"
                        min={0} max={32} step={2}
                        value={gap}
                        onChange={(e) => patchBlockProps({ gap: parseInt(e.target.value, 10) })}
                        style={{
                          width: '100%',
                          background: `linear-gradient(to right, var(--accent) ${pctGap}%, rgba(60, 79, 118, 0.1) ${pctGap}%)`
                        } as React.CSSProperties}
                      />
                    </div>
                  );
                })()}
              </Surface>
            )}

            {/* SETTINGS SPECIFICI PER WIDGET VIDEO */}
            {selectedBlock && selectedBlock.type === 'video' && (() => {
              const videoUrl = (selectedBlock.props?.videoUrl || '') as string;
              const parsed = parseVideoUrl(videoUrl);
              // Se l'utente non ha ancora incollato nulla, evitiamo di mostrare
              // "Non riconosciuto" — appare troppo pessimista prima ancora di
              // avere input. Mostriamo il badge solo quando c'è del testo.
              const hasInput = videoUrl.trim().length > 0;
              const sourceLabel = parsed.source === 'youtube' ? 'YouTube'
                : parsed.source === 'vimeo' ? 'Vimeo'
                : parsed.source === 'file' ? 'File video'
                : hasInput ? 'Non riconosciuto' : 'In attesa di link';
              const sourceIcon = parsed.source === 'youtube' ? <Youtube size={12} />
                : parsed.source === 'vimeo' ? <VideoIcon size={12} />
                : parsed.source === 'file' ? <VideoIcon size={12} />
                : null;
              return (
                <Surface variant="soft" className="panel-section" style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'rgba(var(--accent-rgb), 0.12)',
                      border: '1px solid rgba(var(--accent-rgb), 0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <VideoIcon size={18} color="var(--accent)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                        Stai modificando
                      </div>
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                        Video
                      </h3>
                    </div>
                  </div>

                  {/* [RIMOSSO] campo "Titolo (opzionale)": come per la galleria, il titolo
                      è ora un layer testo libero modificabile dal PropertyPanel standard. */}

                  {/* SORGENTE VIDEO — due percorsi mutualmente esclusivi:
                      A) nessun video: mostriamo dropzone upload + campo link come alternativa
                      B) file caricato: mostriamo mini-card "Video caricato" con bottone rimuovi
                      C) link YouTube/Vimeo: mostriamo campo link con badge sorgente
                      Questo è molto più semplice del precedente setup "dropzone + link sempre
                      visibili insieme" che creava confusione mostrando URL R2 raw dopo upload. */}
                  {parsed.source === 'file' && videoUrl && !videoUploading ? (
                    // === CASE B: file caricato — pill minimale "Video caricato ✓ Rimuovi".
                    // Versione precedente aveva icona 40px + titolo + filename troncato +
                    // bottone + frase sotto = 5 elementi di info, visivamente pesante.
                    // Ora: un solo check-pill accent a tutta larghezza che comunica lo stato
                    // ("c'è un video, è ok") e offre subito l'azione di rimozione. Il nome
                    // tecnico del file (`1776464…mov`) non serve a nessuno in un editor
                    // visuale: l'utente vede il video in anteprima, il filename è rumore. */}
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                        Sorgente video
                      </label>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px',
                        background: 'rgba(var(--accent-rgb), 0.08)',
                        border: '1px solid rgba(var(--accent-rgb), 0.25)',
                        borderRadius: '100px'
                      }}>
                        <Check size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Video caricato
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); patchBlockProps({ videoUrl: '' }); pushToHistory(); }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '0',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--text-soft)',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                          title="Rimuovi e carica un altro file o link"
                        >
                          Rimuovi
                        </button>
                      </div>
                    </div>
                  ) : (
                    // === CASE A / C: nessun file caricato → dropzone + link come alternativa ===
                    <>
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Carica un file
                          </label>
                          {hasInput && parsed.source !== 'unknown' && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              fontSize: '9px', fontWeight: 700,
                              color: 'var(--accent)',
                              textTransform: 'uppercase', letterSpacing: '0.08em',
                              padding: '3px 8px',
                              borderRadius: '100px',
                              background: 'rgba(var(--accent-rgb), 0.1)',
                              border: '1px solid rgba(var(--accent-rgb), 0.3)'
                            }}>
                              {sourceIcon}
                              {sourceLabel}
                            </span>
                          )}
                        </div>

                        <div
                          onDragOver={(e) => { e.preventDefault(); setVideoDragOver(true); }}
                          onDragEnter={(e) => { e.preventDefault(); setVideoDragOver(true); }}
                          onDragLeave={() => setVideoDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setVideoDragOver(false);
                            const f = Array.from(e.dataTransfer.files).find(x => x.type.startsWith('video/'));
                            if (f) void uploadVideoFile(f);
                          }}
                          onClick={() => !videoUploading && videoInputRef.current?.click()}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '18px 12px',
                            border: `2px dashed ${videoDragOver ? 'var(--accent)' : 'var(--border)'}`,
                            borderRadius: '12px',
                            background: videoDragOver ? 'rgba(var(--accent-rgb), 0.08)' : 'var(--surface)',
                            cursor: videoUploading ? 'not-allowed' : 'pointer',
                            transition: 'border-color .15s ease, background .15s ease',
                            opacity: videoUploading ? 0.85 : 1,
                            textAlign: 'center'
                          }}
                        >
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'rgba(var(--accent-rgb), 0.12)',
                            border: '1px solid rgba(var(--accent-rgb), 0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <Upload size={16} color="var(--accent)" />
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {videoUploading
                              ? (videoUploadProgress !== null ? `Caricamento… ${videoUploadProgress}%` : 'Caricamento…')
                              : videoDragOver ? 'Rilascia per caricare'
                              : 'Trascina o clicca per caricare'}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-soft)', lineHeight: 1.4 }}>
                            MP4, WEBM, MOV — fino a 200 MB
                          </div>

                          {videoUploading && videoUploadProgress !== null && (
                            <div style={{ width: '100%', marginTop: '4px' }}>
                              <div style={{
                                height: '4px', borderRadius: '2px',
                                background: 'rgba(60, 79, 118, 0.1)', overflow: 'hidden'
                              }}>
                                <div style={{
                                  height: '100%',
                                  width: `${videoUploadProgress}%`,
                                  background: 'var(--accent)',
                                  transition: 'width .15s ease'
                                }} />
                              </div>
                            </div>
                          )}
                        </div>
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void uploadVideoFile(f);
                            if (e.target) e.target.value = '';
                          }}
                          style={{ display: 'none' }}
                        />
                      </div>

                      {/* DIVIDER "oppure" */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 14px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                        <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                          oppure
                        </span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                      </div>

                      {/* LINK YOUTUBE/VIMEO */}
                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                          Incolla un link YouTube o Vimeo
                        </label>
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          borderRadius: '10px', padding: '10px 12px'
                        }}>
                          <VideoIcon size={12} style={{ color: 'var(--text-soft)', marginRight: '8px', flexShrink: 0 }} />
                          <input
                            type="url"
                            value={selectedBlock.props?.videoUrl || ''}
                            onChange={(e) => patchBlockProps({ videoUrl: e.target.value })}
                            placeholder="Es: https://youtube.com/watch?v=…"
                            onFocus={(e) => {
                              const p = e.currentTarget.parentElement as HTMLDivElement | null;
                              if (p) { p.style.borderColor = 'var(--accent)'; p.style.boxShadow = '0 0 0 3px rgba(var(--accent-rgb), 0.15)'; }
                            }}
                            onBlur={(e) => {
                              const p = e.currentTarget.parentElement as HTMLDivElement | null;
                              if (p) { p.style.borderColor = 'var(--border)'; p.style.boxShadow = 'none'; }
                            }}
                            style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', padding: 0, outline: 'none', width: '100%' }}
                          />
                        </div>
                        {hasInput && parsed.source === 'unknown' && (
                          <p style={{ margin: '6px 2px 0', fontSize: '10px', color: 'var(--text-soft)', lineHeight: 1.4 }}>
                            Link non riconosciuto. Accettiamo YouTube (watch, shorts) e Vimeo.
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* OPZIONI RIPRODUZIONE */}
                  <div>
                    <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                      Riproduzione
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        { key: 'autoplay', label: 'Autoplay', hint: 'Parte appena è visibile (richiede muted)' },
                        { key: 'loop',     label: 'Loop',     hint: 'Riparte quando finisce' },
                        { key: 'muted',    label: 'Senza audio', hint: 'Spunta se vuoi forzare muted' },
                        { key: 'controls', label: 'Controlli visibili', hint: 'Play/pausa, volume ecc.' }
                      ].map(opt => {
                        const defaultOn = opt.key === 'muted' || opt.key === 'controls';
                        const raw = selectedBlock.props?.[opt.key];
                        const isOn = raw === undefined ? defaultOn : !!raw;
                        return (
                          <Button
                            key={opt.key}
                            variant={isOn ? 'primary' : 'subtle'}
                            onClick={() => patchBlockProps({ [opt.key]: !isOn })}
                            style={{ width: '100%', justifyContent: 'space-between', padding: '8px 12px', fontSize: '11px' }}
                            title={opt.hint}
                          >
                            <span style={{ fontWeight: 700 }}>{opt.label}</span>
                            {isOn ? <Check size={14} /> : null}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </Surface>
              );
            })()}

            {/* SETTINGS SPECIFICI PER WIDGET PAYMENT (Regali in denaro) */}
            {selectedBlock && selectedBlock.type === 'payment' && (
              <PaymentSection
                block={selectedBlock as Block}
                displayColorPicker={displayColorPicker}
                setDisplayColorPicker={setDisplayColorPicker}
                setIsDirty={setIsDirty}
                blocks={blocks}
                setBlocks={setBlocks}
                onUpdateBlock={onUpdateBlock}
                slug={slug}
              />
            )}

            {/* SETTINGS SPECIFICI PER WIDGET TABLEAU */}
            {selectedBlock && selectedBlock.type === 'tableau' && (
              <TableauSidebar 
                selectedBlock={selectedBlock}
                onUpdateBlock={onUpdateBlock || ((id, up) => {
                  if (blocks && setBlocks) {
                    setIsDirty(true);
                    setBlocks(blocks.map(b => b.id === id ? { ...b, ...up } : b));
                  }
                })}
                eventRsvps={event?.rsvps || []}
                hasTableauAccess={event?.addons?.tableau || false}
                slug={slug}
                eventTitle={event?.title}
                updateEventData={updateEventData}
                event={event}
              />
            )}

            {/* SETTINGS SPECIFICI PER WIDGET RSVP */}
            {selectedBlock && selectedBlock.type === 'rsvp' && selectedLayerIds.includes(widgetLayerIdForBlock(String(selectedBlock.id))) && (
              <Surface variant="soft" className="panel-section" style={{ marginTop: '20px' }}>

                  {/* HEADER DI CONTESTO — ora intestazione interna del Surface (non un box separato),
                      per uniformare con PropertyPanel (Testo/Immagine). */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{
                      width: '36px', height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(var(--accent-rgb), 0.12)',
                      border: '1px solid rgba(var(--accent-rgb), 0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <CheckSquare size={18} color="var(--accent)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                        Stai modificando
                      </div>
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                        Modulo RSVP
                      </h3>
                    </div>
                  </div>

                  {/* TABS RSVP — pill tabs in stile Jewelry (coerente con altri editor) */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '6px',
                    background: 'var(--surface-light)', 
                    borderRadius: '100px', 
                    padding: '3px', 
                    marginBottom: '20px',
                    border: '1px solid var(--border)' 
                  }}>
                    {(['content', 'questions', 'style'] as const).map((tab) => (
                      <Button
                        key={tab}
                        variant={activeRsvpTab === tab ? 'primary' : 'ghost'}
                        onClick={() => setActiveRsvpTab(tab)}
                        style={{
                          flex: 1, 
                          padding: '6px 0', 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          borderRadius: '100px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {tab === 'content' ? 'Testo' : tab === 'style' ? 'Stile' : 'Domande'}
                      </Button>
                    ))}
                  </div>

                  {/* TAB 1: CONTENUTO */}
                  {activeRsvpTab === 'content' && (
                    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Titolo RSVP</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                          <Pencil size={12} style={{ color: 'var(--text-soft)', flexShrink: 0 }} />
                          <input
                            type="text"
                            value={selectedBlock.widgetProps?.rsvpTitle ?? 'GENTILE CONFERMA'}
                            onChange={(e) => {
                              if (onUpdateBlock && selectedBlock) {
                                onUpdateBlock(selectedBlock.id as string, { widgetProps: { rsvpTitle: e.target.value } });
                              } else if (blocks && setBlocks) {
                                setIsDirty(true);
                                setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, widgetProps: { ...b.widgetProps, rsvpTitle: e.target.value } } : b));
                              }
                            }}
                            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', minWidth: 0 }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Descrizione RSVP</label>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                          <Pencil size={12} style={{ color: 'var(--text-soft)', flexShrink: 0, marginTop: '3px' }} />
                          <textarea
                            value={selectedBlock.widgetProps?.rsvpDescription ?? 'Ti preghiamo di confermare la tua presenza entro il 30 Giugno 2026.'}
                            rows={3}
                            onChange={(e) => {
                              if (onUpdateBlock && selectedBlock) {
                                onUpdateBlock(selectedBlock.id as string, { widgetProps: { rsvpDescription: e.target.value } });
                              } else if (blocks && setBlocks) {
                                setIsDirty(true);
                                setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, widgetProps: { ...b.widgetProps, rsvpDescription: e.target.value } } : b));
                              }
                            }}
                            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'var(--text-primary)', minWidth: 0, resize: 'vertical' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: STILE */}
                  {activeRsvpTab === 'style' && (
                    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* INFO AUTO-DETECT */}
                        <p style={{ fontSize: '10px', color: 'var(--text-soft)', lineHeight: '1.5', padding: '10px 12px', background: 'rgba(var(--accent-rgb), 0.05)', borderRadius: '10px', borderLeft: '3px solid var(--accent)', margin: 0 }}>
                          I colori del form si adattano automaticamente allo sfondo della sezione.
                        </p>

                        {/* COLORE ACCENTO — picker row in stile Scenario/Invito */}
                        <div>
                          <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '0.05em' }}>Colore Accento</label>
                          <Button 
                            variant={displayColorPicker === 'formPrimary' ? 'primary' : 'subtle'}
                            onClick={() => setDisplayColorPicker(displayColorPicker === 'formPrimary' ? false : 'formPrimary')}
                            style={{
                              width: '100%',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              borderRadius: '100px',
                              ...(displayColorPicker === 'formPrimary' ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.5)', zIndex: 1 } : {})
                            }}
                          >
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>Pulsante & Accenti</span>
                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: selectedBlock.widgetProps?.formPrimaryColor || 'var(--accent)', border: '1px solid rgba(0,0,0,0.1)' }} />
                          </Button>
                          {displayColorPicker === 'formPrimary' && (
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '8px' }}>
                              <CustomColorPicker 
                                color={selectedBlock.widgetProps?.formPrimaryColor || '#14b8a6'} 
                                onChange={(color) => {
                                  if (onUpdateBlock && selectedBlock) {
                                    onUpdateBlock(selectedBlock.id as string, { widgetProps: { formPrimaryColor: color } });
                                  } else if (blocks && setBlocks) {
                                    setIsDirty(true);
                                    setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, widgetProps: { ...b.widgetProps, formPrimaryColor: color } } : b));
                                  }
                                }} 
                              />
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}

                  {/* TAB 3: DOMANDE */}
                  {activeRsvpTab === 'questions' && (
                    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Configura Domande</label>
                      
                      {/* Standard Toggles (consistent with mobile style) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                        <Button
                          variant="subtle"
                          style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px' }}
                          onClick={() => {
                            const next = !(selectedBlock.widgetProps?.rsvpAskGuests !== false);
                            if (onUpdateBlock && selectedBlock) {
                              onUpdateBlock(selectedBlock.id as string, { widgetProps: { rsvpAskGuests: next } });
                            } else if (blocks && setBlocks) {
                              setIsDirty(true);
                              setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, widgetProps: { ...b.widgetProps, rsvpAskGuests: next } } : b));
                            }
                          }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: 600 }}>Chiedi numero ospiti</span>
                          <div style={{ width: '16px', height: '16px', border: '1px solid var(--accent)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {selectedBlock.widgetProps?.rsvpAskGuests !== false && <Check size={12} color="var(--accent)" />}
                          </div>
                        </Button>

                        <Button
                          variant="subtle"
                          style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px' }}
                          onClick={() => {
                            const next = !(selectedBlock.widgetProps?.rsvpAskIntolerances !== false);
                            if (onUpdateBlock && selectedBlock) {
                              onUpdateBlock(selectedBlock.id as string, { widgetProps: { rsvpAskIntolerances: next } });
                            } else if (blocks && setBlocks) {
                              setIsDirty(true);
                              setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, widgetProps: { ...b.widgetProps, rsvpAskIntolerances: next } } : b));
                            }
                          }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: 600 }}>Chiedi allergie/intolleranze</span>
                          <div style={{ width: '16px', height: '16px', border: '1px solid var(--accent)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {selectedBlock.widgetProps?.rsvpAskIntolerances !== false && <Check size={12} color="var(--accent)" />}
                          </div>
                        </Button>
                        {selectedBlock.widgetProps?.rsvpAskIntolerances !== false && (
                          <div style={{ padding: '8px 12px', background: 'rgba(var(--accent-rgb), 0.06)', border: '1px solid rgba(var(--accent-rgb), 0.18)', borderRadius: '8px', fontSize: '10px', color: 'var(--text-soft)', lineHeight: 1.45 }}>
                            Form con sì/no, opzione «stessa allergia per tutti» e righe nome + allergia se serve. Export: riepilogo testuale.
                          </div>
                        )}

                        {/* ────── Canali di contatto (default OFF per retro-compat) ────── */}
                        <Button
                          variant="subtle"
                          style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px' }}
                          onClick={() => {
                            const next = !(selectedBlock.widgetProps?.rsvpAskEmail === true);
                            if (onUpdateBlock && selectedBlock) {
                              onUpdateBlock(selectedBlock.id as string, { widgetProps: { rsvpAskEmail: next } });
                            } else if (blocks && setBlocks) {
                              setIsDirty(true);
                              setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, widgetProps: { ...b.widgetProps, rsvpAskEmail: next } } : b));
                            }
                          }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: 600 }}>Chiedi email</span>
                          <div style={{ width: '16px', height: '16px', border: '1px solid var(--accent)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {selectedBlock.widgetProps?.rsvpAskEmail === true && <Check size={12} color="var(--accent)" />}
                          </div>
                        </Button>

                        <Button
                          variant="subtle"
                          style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px' }}
                          onClick={() => {
                            const next = !(selectedBlock.widgetProps?.rsvpAskPhone === true);
                            if (onUpdateBlock && selectedBlock) {
                              onUpdateBlock(selectedBlock.id as string, { widgetProps: { rsvpAskPhone: next } });
                            } else if (blocks && setBlocks) {
                              setIsDirty(true);
                              setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, widgetProps: { ...b.widgetProps, rsvpAskPhone: next } } : b));
                            }
                          }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: 600 }}>Chiedi telefono</span>
                          <div style={{ width: '16px', height: '16px', border: '1px solid var(--accent)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {selectedBlock.widgetProps?.rsvpAskPhone === true && <Check size={12} color="var(--accent)" />}
                          </div>
                        </Button>

                        {/* Info: se entrambi OFF, nessun contatto viene raccolto.
                             Se entrambi ON basta compilarne uno; se solo uno è ON,
                             quello diventa obbligatorio. */}
                        {(selectedBlock.widgetProps?.rsvpAskEmail === true || selectedBlock.widgetProps?.rsvpAskPhone === true) && (
                          <div style={{ padding: '8px 12px', background: 'rgba(var(--accent-rgb), 0.06)', border: '1px solid rgba(var(--accent-rgb), 0.18)', borderRadius: '8px', fontSize: '10px', color: 'var(--text-soft)', lineHeight: 1.4 }}>
                            {selectedBlock.widgetProps?.rsvpAskEmail === true && selectedBlock.widgetProps?.rsvpAskPhone === true
                              ? '💡 Con entrambi attivi, l\'ospite deve fornire almeno uno dei due.'
                              : '💡 Il campo attivo sarà obbligatorio per completare la RSVP.'}
                          </div>
                        )}
                      </div>

                      {/* Custom Fields Manager */}
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase' }}>Campi Personalizzati</label>
                          <Button 
                            variant="ghost" 
                            onClick={() => {
                               if (selectedBlock) {
                                 const currentFields = selectedBlock.widgetProps?.customFields || [];
                                 const newField = { id: 'field-' + Date.now(), label: 'Nuova Domanda', type: 'text' as const, required: false };
                                 if (onUpdateBlock) {
                                   onUpdateBlock(selectedBlock.id as string, { widgetProps: { customFields: [...currentFields, newField] } });
                                 } else if (blocks && setBlocks) {
                                   setIsDirty(true);
                                   setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, widgetProps: { ...b.widgetProps, customFields: [...currentFields, newField] } } : b));
                                 }
                               }
                             }}
                            style={{ padding: '4px 8px', fontSize: '10px', height: 'auto', background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent)' }}
                          >
                            <Plus size={14} style={{ marginRight: 4 }} /> AGGIUNGI
                          </Button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {(selectedBlock.widgetProps?.customFields || []).map((field: any, index: number) => {
                            const updateField = (patch: any) => {
                              const newFields = [...(selectedBlock.widgetProps?.customFields || [])];
                              newFields[index] = { ...field, ...patch };
                              if (onUpdateBlock && selectedBlock) {
                                onUpdateBlock(selectedBlock.id as string, { widgetProps: { customFields: newFields } });
                              } else if (blocks && setBlocks) {
                                setIsDirty(true);
                                setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, widgetProps: { ...b.widgetProps, customFields: newFields } } : b));
                              }
                            };
                            const removeField = () => {
                              const newFields = (selectedBlock.widgetProps?.customFields || []).filter((_: any, i: number) => i !== index);
                              if (onUpdateBlock && selectedBlock) {
                                onUpdateBlock(selectedBlock.id as string, { widgetProps: { customFields: newFields } });
                              } else if (blocks && setBlocks) {
                                setIsDirty(true);
                                setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, widgetProps: { ...b.widgetProps, customFields: newFields } } : b));
                              }
                            };
                            return (
                              <Surface key={field.id} variant="soft" style={{ padding: '12px', borderRadius: '12px' }}>
                                {/* LABEL + ELIMINA — rende esplicito che sotto c'è un campo editabile */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                  <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Domanda
                                  </label>
                                  <Button 
                                    variant="ghost" 
                                    onClick={removeField}
                                    style={{ padding: '4px', color: 'var(--error)', minWidth: 'auto', height: 'auto' }}
                                    aria-label="Elimina domanda"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>

                                {/* INPUT — look da campo editabile (bg + bordo + icona matita) */}
                                <div style={{
                                  position: 'relative',
                                  display: 'flex', alignItems: 'center',
                                  background: 'var(--surface)',
                                  border: '1px solid var(--border)',
                                  borderRadius: '10px',
                                  padding: '8px 10px',
                                  marginBottom: '12px',
                                  transition: 'border-color .15s ease, box-shadow .15s ease'
                                }}>
                                  <Pencil size={12} style={{ color: 'var(--text-soft)', marginRight: '8px', flexShrink: 0 }} />
                                  <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => updateField({ label: e.target.value })}
                                    placeholder="Scrivi qui la domanda..."
                                    onFocus={(e) => {
                                      const p = e.currentTarget.parentElement as HTMLDivElement | null;
                                      if (p) {
                                        p.style.borderColor = 'var(--accent)';
                                        p.style.boxShadow = '0 0 0 3px rgba(var(--accent-rgb), 0.15)';
                                      }
                                    }}
                                    onBlur={(e) => {
                                      const p = e.currentTarget.parentElement as HTMLDivElement | null;
                                      if (p) {
                                        p.style.borderColor = 'var(--border)';
                                        p.style.boxShadow = 'none';
                                      }
                                    }}
                                    style={{
                                      flex: 1,
                                      background: 'transparent',
                                      border: 'none',
                                      fontSize: '13px',
                                      fontWeight: 600,
                                      color: 'var(--text-primary)',
                                      padding: 0,
                                      outline: 'none',
                                      width: '100%'
                                    }}
                                  />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <Button
                                      variant={field.type === 'text' ? 'primary' : 'subtle'}
                                      onClick={() => updateField({ type: 'text' })}
                                      style={{ flex: 1, fontSize: '10px', padding: '6px 8px', justifyContent: 'center', fontWeight: 700 }}
                                    >
                                      Testo libero
                                    </Button>
                                    <Button
                                      variant={field.type === 'checkbox' ? 'primary' : 'subtle'}
                                      onClick={() => updateField({ type: 'checkbox' })}
                                      style={{ flex: 1, fontSize: '10px', padding: '6px 8px', justifyContent: 'center', fontWeight: 700 }}
                                    >
                                      Sì / No
                                    </Button>
                                  </div>
                                  <Button
                                    variant="subtle"
                                    onClick={() => updateField({ required: !field.required })}
                                    style={{ width: '100%', justifyContent: 'space-between', padding: '8px 12px', fontSize: '11px' }}
                                  >
                                    <span style={{ fontWeight: 600 }}>Obbligatorio</span>
                                    <div style={{ width: '16px', height: '16px', border: '1px solid var(--accent)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      {field.required && <Check size={12} color="var(--accent)" />}
                                    </div>
                                  </Button>
                                </div>
                              </Surface>
                            );
                          })}
                          {(!selectedBlock.widgetProps?.customFields || selectedBlock.widgetProps?.customFields.length === 0) && (
                            <p style={{ fontSize: '10px', color: 'var(--text-soft)', textAlign: 'center', padding: '12px', border: '1px dashed var(--border)', borderRadius: '10px', margin: 0 }}>
                              Nessuna domanda personalizzata aggiunta.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Surface>
              )}
            {!(selectedBlock && selectedLayerIds.includes(widgetLayerIdForBlock(String(selectedBlock.id)))) && (
              <div style={{ marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                  <Button 
                    variant="ghost" 
                  style={{ width: '100%', color: 'var(--error)', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}
                  onClick={() => {
                    if (blocks && setBlocks && selectedBlockId) {
                      if (confirm("Sei sicuro di voler eliminare questa intera sezione e tutti i suoi elementi?")) {
                        setIsDirty(true);
                        setBlocks(blocks.filter(b => b.id !== selectedBlockId));
                        pushToHistory();
                      }
                    }
                  }}
                >
                  <Trash2 size={16} style={{ marginRight: 8 }} /> ELIMINA SEZIONE
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* PRIORITÀ 3: GESTIONE GENERALE SEZIONI (Default) */
          <Surface variant="soft" className="panel-section">
            <p style={{ fontSize: '11px', color: 'var(--text-soft)', marginBottom: '0', lineHeight: '1.6', padding: '12px', background: 'rgba(var(--accent-rgb), 0.03)', borderRadius: '12px', borderLeft: '3px solid var(--accent)' }}>
              Aggiungi contenuti alla tua pagina invito per raccontare meglio il tuo evento.
            </p>
            <h3 style={{ marginTop: '20px', marginBottom: '12px', fontSize: '11px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>GESTIONE SEZIONI</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <Button variant="primary" style={{width: '100%', justifyContent: 'center'}} onClick={() => {
                if (blocks && setBlocks) {
                  setIsDirty(true);
                  // `order: blocks.length` → il nuovo blocco va in fondo e la public
                  // view lo ordina correttamente (sorta per `order`).
                  // Salviamo il bg sia in top-level sia in `props.bgColor`: il
                  // rendering (BuilderSection / EventPublic) legge PRIMA da
                  // `props.bgColor` e solo poi fallback su `bgColor`. Scrivere in
                  // entrambi i posti evita il bug "blocco bianco al primo render"
                  // e si allinea alla convenzione usata dal PropertyPanel quando
                  // l'utente cambia colore (che scrive in `props.bgColor`).
                  setBlocks([...blocks, { id: 'block-' + Date.now(), type: 'canvas', y: 0, height: 480, bgColor: '#ffffff', props: { bgColor: '#ffffff' }, order: blocks.length } as any]);
                  pushToHistory();
                }
              }}>
                <Plus size={18} style={{marginRight: 8}}/> Sezione Vuota
              </Button>
              
               <Button variant="subtle" style={{width: '100%', justifyContent: 'center', borderColor: 'var(--accent-soft)', borderStyle: 'dashed'}} onClick={() => {
                if (blocks && setBlocks) {
                  setIsDirty(true);
                  const newBlockId = 'block-map-' + Date.now();
                  // Altezza generosa: header (44) + mappa (360) + button (44) +
                  // padding interno (40) + breathing room top/bottom = ~560.
                  // Se usassimo 400 il contenuto sforerebbe dal basso costringendo
                  // l'utente a "allargare" la sezione manualmente ad ogni creazione.
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
                }
              }}>
                <MapPin size={18} style={{marginRight: 8}}/> Sezione Mappa
              </Button>
              
              <Button variant="subtle" style={{width: '100%', justifyContent: 'center', borderColor: 'var(--accent-soft)', borderStyle: 'dashed'}} onClick={() => {
                if (blocks && setBlocks) {
                  setIsDirty(true);
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
                }
              }}>
                <CheckSquare size={18} style={{marginRight: 8}}/> Sezione RSVP
              </Button>

              <Button variant="subtle" style={{width: '100%', justifyContent: 'center', borderColor: 'var(--accent-soft)', borderStyle: 'dashed'}} onClick={() => {
                if (blocks && setBlocks) {
                  setIsDirty(true);
                  const newBlockId = 'block-gallery-' + Date.now();
                  // Il titolo della sezione è ora un **layer testo libero** (stesso
                  // pattern RSVP), non più una prop interna del widget. Motivo: con
                  // un layer l'utente ha controllo completo su font/colore/dimensione/
                  // allineamento con tutti gli editor standard, esattamente come per
                  // qualsiasi altro titolo di pagina. Il precedente rendering `h3` nel
                  // widget con colore adattivo dava due problemi:
                  //   1) su bg molto chiari/scuri tagliava il titolo (overflow container);
                  //   2) forzava nero/bianco e impediva la personalizzazione brand.
                  const galleryLayers = [
                    ...layers,
                    {
                      id: 'layer-gallery-title-' + newBlockId + '-' + Date.now(),
                      blockId: newBlockId,
                      type: 'text',
                      text: 'LA NOSTRA GALLERIA',
                      x: 'center',
                      y: 40,
                      width: 600,
                      fontSize: 28,
                      fontFamily: event?.theme?.fonts?.heading || 'Playfair Display',
                      textAlign: 'center',
                      color: event?.theme?.accent || 'var(--accent)'
                    }
                  ];
                  // Altezza = titolo layer (40 top + ~50) + padding (24) + empty state
                  // card (16:9 su 900max = ~506) + padding bottom (24) + breathing ≈ 660.
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
                }
              }}>
                <Images size={18} style={{marginRight: 8}}/> Sezione Galleria
              </Button>

              <Button variant="subtle" style={{width: '100%', justifyContent: 'center', borderColor: 'var(--accent-soft)', borderStyle: 'dashed'}} onClick={() => {
                if (blocks && setBlocks) {
                  setIsDirty(true);
                  const newBlockId = 'block-video-' + Date.now();
                  // Titolo = layer testo libero (stesso rationale della galleria).
                  // Sul default nero scuro (#050506) il titolo default è bianco,
                  // così è leggibile da subito; l'utente può cambiarlo.
                  const videoLayers = [
                    ...layers,
                    {
                      id: 'layer-video-title-' + newBlockId + '-' + Date.now(),
                      blockId: newBlockId,
                      type: 'text',
                      text: 'IL NOSTRO VIDEO',
                      x: 'center',
                      y: 40,
                      width: 600,
                      fontSize: 28,
                      fontFamily: event?.theme?.fonts?.heading || 'Playfair Display',
                      textAlign: 'center',
                      color: '#ffffff'
                    }
                  ];
                  // Altezza = titolo layer (40 top + ~50) + spacer + video 16:9 max 900
                  // = ~506 + padding bottom (24) + breathing ≈ 700.
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
                }
              }}>
                <VideoIcon size={18} style={{marginRight: 8}}/> Sezione Video
              </Button>

              <Button variant="subtle" style={{width: '100%', justifyContent: 'center', borderColor: 'var(--accent-soft)', borderStyle: 'dashed'}} onClick={() => {
                if (blocks && setBlocks) {
                  setIsDirty(true);
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
                }
              }}>
                <Gift size={18} style={{marginRight: 8}}/> Sezione Regali
              </Button>

              <Button variant="subtle" style={{width: '100%', justifyContent: 'center', borderColor: 'var(--accent-soft)', borderStyle: 'dashed'}} onClick={() => {
                if (blocks && setBlocks && setLayers) {
                  setIsDirty(true);
                  const newBlockId = 'block-tableau-' + Date.now();
                  setBlocks([...blocks, {
                    id: newBlockId,
                    type: 'tableau',
                    order: blocks.length,
                    y: 0,
                    height: 800,
                    bgColor: '#f8fafc',
                    props: { bgColor: '#f8fafc' },
                    widgetProps: { 
                      tableauTables: [],
                      tableauAssignments: [],
                      tableauConstraints: [],
                      tableauSettings: { showFloorPlan: true }
                    }
                  } as any]);
                  pushToHistory();
                }
              }}>
                <LayoutGrid size={18} style={{marginRight: 8}}/> Sezione Tableau
              </Button>
            </div>
          </Surface>
        )}
    </div>
  );
};

export default PageSection;
