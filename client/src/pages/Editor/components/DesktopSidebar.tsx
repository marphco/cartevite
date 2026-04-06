import React from 'react';
import { Surface, Button } from "../../../ui";
import { 
  Type, Image as ImageIcon, PaintBucket, Move, Mail, MailOpen, ArrowLeft, 
  ArrowRight, ArrowDown, ArrowUp, ArrowUpRight, ArrowUpLeft, ArrowDownRight, 
  ArrowDownLeft, Plus, Circle, Sparkles, Smartphone, Layout, Monitor, Trash2, MapPin, CheckSquare,
  Settings2, MessageSquarePlus, Save, Palette as PaletteIcon
} from "lucide-react";
import PropertyPanel from "./PropertyPanel";
import CustomColorPicker from "./CustomColorPicker";
import { AVAILABLE_LINERS, AVAILABLE_SCENARIO_BGS } from "./EditorHelpers";
import type { Layer, CanvasProps, Block } from "../../../types/editor";

interface DesktopSidebarProps {
  slug: string;
  editorMode: 'canvas' | 'envelope' | 'background' | 'event_page';
  setEditorMode: (mode: 'canvas' | 'envelope' | 'background' | 'event_page') => void;
  selectedLayer: Layer | undefined;
  selectedLayerIds: string[];
  layers: Layer[];
  setSelectedLayerIds: (ids: string[]) => void;
  updateSelectedLayer: (updates: Partial<Layer>) => void;
  deleteSelectedLayers: () => void;
  alignLayers: (alignment: string, reference: string) => void;
  hoveredLayerId: string | null;
  setHoveredLayerId: (id: string | null) => void;
  keyLayerId: string | null;
  setKeyLayerId: (id: string | null) => void;
  alignmentReference: string;
  setAlignmentReference: (ref: string) => void;
  displayColorPicker: any;
  setDisplayColorPicker: React.Dispatch<React.SetStateAction<any>>;
  addTextLayer: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  canvasProps: CanvasProps;
  setCanvasProps: React.Dispatch<React.SetStateAction<CanvasProps>>;
  invitoBgInputRef: React.RefObject<HTMLInputElement | null>;
  isEditingBackground: boolean;
  setIsEditingBackground: (editing: boolean) => void;
  isEnvelopeOpen: boolean;
  setIsEnvelopeOpen: (open: boolean) => void;
  updateTheme: (updates: any) => void;
  event: any;
  textureInputRef: React.RefObject<HTMLInputElement | null>;
  userLinerImages: string[];
  isEditingLiner: boolean;
  setIsEditingLiner: (editing: boolean) => void;
  scenarioBgInputRef: React.RefObject<HTMLInputElement | null>;
  userScenarioBgImages: string[];
  showMobileAnchorGrid: boolean;
  setShowMobileAnchorGrid: (show: boolean) => void;
  pushToHistory: () => void;
  setIsDirty: (val: boolean) => void;
  handleBackgroundUpload: (file: File, type: 'canvas' | 'liner' | 'scenario') => Promise<void>;
  blocks?: Block[];
  setBlocks?: React.Dispatch<React.SetStateAction<Block[]>>;
  selectedBlockId?: string | null;
  previewMobile?: boolean;
  setPreviewMobile?: (val: boolean) => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  slug,
  editorMode,
  setEditorMode,
  selectedLayer,
  selectedLayerIds,
  layers,
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
  addTextLayer,
  fileInputRef,
  handleImageUpload,
  canvasProps,
  setCanvasProps,
  invitoBgInputRef,
  isEditingBackground,
  setIsEditingBackground,
  isEnvelopeOpen,
  setIsEnvelopeOpen,
  updateTheme,
  event,
  textureInputRef,
  userLinerImages,
  isEditingLiner,
  setIsEditingLiner,
  scenarioBgInputRef,
  userScenarioBgImages,
  showMobileAnchorGrid,
  setShowMobileAnchorGrid,
  pushToHistory,
  setIsDirty,
  handleBackgroundUpload,
  blocks,
  setBlocks,
  selectedBlockId,
  previewMobile,
  setPreviewMobile
}) => {
  const [activeRsvpTab, setActiveRsvpTab] = React.useState<'content' | 'style' | 'questions'>('content');
  const selectedBlock = blocks?.find(b => b.id === selectedBlockId);
  return (
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
                fontSize: '10px', 
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
                fontSize: '10px', 
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
                 fontSize: '10px', 
                 padding: '8px 2px',
                 ...(editorMode === 'background' ? { boxShadow: '0 0 12px rgba(var(--accent-rgb), 0.4)' } : {})
               }}
               onClick={() => setEditorMode('background')}
             >
               Scenario
             </Button>
         </div>
         <Button 
            variant={editorMode === 'event_page' ? 'primary' : 'subtle'} 
            style={{ width: '100%', justifyContent: 'center', fontSize: '12px', marginTop: '4px', ...(editorMode === 'event_page' ? { boxShadow: '0 0 12px rgba(var(--accent-rgb), 0.4)' } : {}) }}
            onClick={() => setEditorMode('event_page')}
          >
            Pagina Evento
          </Button>
       </Surface>

       {editorMode === 'canvas' && (
         <>
           {/* ISTRUZIONI SEMPRE IN ALTO */}
           <Surface variant="soft" className="panel-section">
              <p style={{ fontSize: '10px', color: 'var(--text-soft)', marginBottom: '0', lineHeight: '1.5', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '3px solid var(--accent)' }}>
                Clicca sugli elementi dell'invito per modificarli. Per l'immagine di sfondo, usa "Regola Posizione" sotto.
              </p>
           </Surface>

           {/* EDITOR PROPRIETÀ */}
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
              displayColorPicker={displayColorPicker === 'font' ? 'font' : false}
              setDisplayColorPicker={(show) => setDisplayColorPicker(show)}
           />

           {/* BLOCCO INSERISCI */}
           <Surface variant="soft" className="panel-section">
              <h3>Inserisci</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <Button variant="primary" style={{width: '100%', justifyContent: 'center'}} onClick={addTextLayer}>
              <Type size={18} style={{marginRight: 8}}/> Testo
            </Button>
            <Button variant="subtle" style={{width: '100%', justifyContent: 'center'}} onClick={() => fileInputRef.current?.click()}>
              <ImageIcon size={18} style={{marginRight: 8}}/> Immagine
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
                  onClick={() => { if (displayColorPicker !== 'canvasBg') pushToHistory(); setDisplayColorPicker(displayColorPicker === 'canvasBg' ? false : 'canvasBg'); }}
                  style={{ 
                    width: '100%', 
                    justifyContent: 'space-between', 
                    padding: '8px 12px',
                    ...(displayColorPicker === 'canvasBg' ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.5)', zIndex: 1 } : {})
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <PaintBucket size={18} style={{ marginRight: 8 }} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Colore</span>
                  </div>
                  <div style={{ width: '20px', height: '20px', background: (canvasProps.bgColor || '#ffffff'), borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }} />
                </Button>
                
                {displayColorPicker === 'canvasBg' && (
                  <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '4px', border: '1px solid var(--border)' }}>
                    <CustomColorPicker 
                      color={canvasProps.bgColor || '#ffffff'} 
                      onChange={(color) => { 
                        setCanvasProps(prev => ({ ...prev, bgColor: color })); 
                      }} 
                    />
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
                  <Move size={18} style={{ marginRight: 8 }} /> {isEditingBackground ? "Salva Posizione" : "Regola Posizione Sfondo"}
                </Button>
              )}
              <Button 
                variant="subtle" 
                style={{ width: "100%", justifyContent: "center", fontSize: "12px" }} 
                onClick={() => invitoBgInputRef.current?.click()}
              >
                <ImageIcon size={18} style={{ marginRight: 8 }} /> Carica Immagine Sfondo
              </Button>
            </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
             <input 
               type="file" 
               ref={invitoBgInputRef} 
               style={{display: 'none'}} 
               accept="image/*"
               onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (file) {
                   handleBackgroundUpload(file, 'canvas');
                 }
                 e.target.value = '';
               }}
             />
             {canvasProps.bgImage && (
               <Button 
                 variant="ghost" 
                 style={{ width: '100%', justifyContent: 'center', fontSize: '10px', color: 'salmon' }} 
                 onClick={() => setCanvasProps((prev: CanvasProps) => ({ ...prev, bgImage: null }))}
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
             <p style={{ fontSize: '10px', color: 'var(--text-soft)', marginBottom: '0', lineHeight: '1.5', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '3px solid var(--accent)' }}>
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
               {isEnvelopeOpen ? <Mail size={18} style={{ marginRight: 8 }} /> : <MailOpen size={18} style={{ marginRight: 8 }} />} {isEnvelopeOpen ? 'Chiudi Busta' : 'Apri Busta'}
             </Button>
            <div>
          {canvasProps?.width !== canvasProps?.height && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-soft)', marginBottom: '4px', display: 'block' }}>Formato Busta</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button 
                  variant={event.theme?.envelopeFormat === 'horizontal' ? 'primary' : 'subtle'} 
                  style={{ flex: 1, justifyContent: 'center', fontSize: '11px', padding: '6px 0' }}
                  onClick={() => { pushToHistory(); updateTheme({ envelopeFormat: 'horizontal' }); }}
                >
                  Orizzontale
                </Button>
                <Button 
                  variant={event.theme?.envelopeFormat !== 'horizontal' ? 'primary' : 'subtle'} 
                  style={{ flex: 1, justifyContent: 'center', fontSize: '11px', padding: '6px 0' }}
                  onClick={() => { pushToHistory(); updateTheme({ envelopeFormat: 'vertical' }); }}
                >
                  Verticale
                </Button>
              </div>
            </div>
          )}
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-soft)', marginBottom: '4px', display: 'block' }}>Colore Principale</label>
              <div 
                onClick={() => { if (displayColorPicker !== 'envelope') pushToHistory(); setDisplayColorPicker(displayColorPicker === 'envelope' ? false : 'envelope'); }}
                style={{width: '100%', height: '36px', background: event.theme?.coverBg || '#54392d', borderRadius: '6px', border: '2px solid var(--border)', cursor: 'pointer', marginBottom: displayColorPicker === 'envelope' ? '12px' : '0'}}
              />
              {displayColorPicker === 'envelope' && (
                <div style={{ marginBottom: '12px' }}>
                  <CustomColorPicker color={event.theme?.coverBg || '#54392d'} onChange={(color) => { if (event.theme?.coverBg !== color) updateTheme({ coverBg: color }); }} />
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-soft)', marginBottom: '4px', display: 'block' }}>Colore Tasca</label>
              <div 
                onClick={() => { if (displayColorPicker !== 'pocket') pushToHistory(); setDisplayColorPicker(displayColorPicker === 'pocket' ? false : 'pocket'); }}
                style={{width: '100%', height: '36px', background: event.theme?.coverPocketColor || event.theme?.coverBg || '#54392d', borderRadius: '6px', border: '2px solid var(--border)', cursor: 'pointer', marginBottom: displayColorPicker === 'pocket' ? '12px' : '0'}}
              />
              {displayColorPicker === 'pocket' && (
                <div style={{ marginBottom: '12px' }}>
                  <CustomColorPicker color={event.theme?.coverPocketColor || event.theme?.coverBg || '#54392d'} onChange={(color) => { if ((event.theme?.coverPocketColor || event.theme?.coverBg) !== color) updateTheme({ coverPocketColor: color }); }} />
                </div>
              )}
            </div>

            {/* Interno Busta Section */}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '10px', fontWeight: 750, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>INTERNO BUSTA</label>
              <div>
                <Button 
                  variant={displayColorPicker === 'linerColor' ? "primary" : "subtle"} 
                  onClick={() => {
                    if (displayColorPicker !== 'linerColor') pushToHistory();
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
                    <PaintBucket size={18} style={{ marginRight: 8 }} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Colore</span>
                  </div>
                  <div style={{ width: '20px', height: '20px', background: (event.theme?.coverLinerColor || '#ffffff'), borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }} />
                </Button>
                {displayColorPicker === 'linerColor' && (
                  <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '4px', border: '1px solid var(--border)', marginTop: '4px' }}>
                    <CustomColorPicker color={event.theme?.coverLinerColor || '#ffffff'} onChange={(color) => { if (event.theme?.coverLinerColor !== color) updateTheme({ coverLinerColor: color }); }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="file" 
                  ref={textureInputRef} 
                  style={{display: 'none'}} 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleBackgroundUpload(file, 'liner');
                    }
                    e.target.value = '';
                  }}
                />
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-soft)', marginBottom: '4px' }}>Motivi Predefiniti</div>
                
                {/* Thumbnails Interno Busta */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <div 
                    onClick={() => { pushToHistory(); updateTheme({ coverLiner: 'none', coverPocketLiner: 'none' }); }}
                    style={{
                      aspectRatio: '1', background: 'var(--surface-light)', borderRadius: '6px', 
                      border: (!event.theme?.coverLiner || event.theme?.coverLiner === 'none') ? '2px solid var(--accent)' : '1px solid var(--border)', 
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700
                    }}
                  >NESSUNA</div>
                  {AVAILABLE_LINERS.map((tex) => (
                    <div 
                      key={tex.id}
                      onClick={() => { pushToHistory(); updateTheme({ coverLiner: tex.url, coverPocketLiner: tex.url }); }}
                      style={{
                        aspectRatio: '1', background: `url(${tex.url})`, backgroundSize: 'cover', borderRadius: '6px', 
                        border: (event.theme?.coverLiner === tex.url || event.theme?.coverLiner?.endsWith(tex.url)) ? '2px solid var(--accent)' : '1px solid var(--border)', 
                        cursor: 'pointer'
                      }}
                      title={tex.name}
                    />
                  ))}
                  {userLinerImages.map((tex, idx) => (
                    <div 
                      key={`user-liner-${idx}`}
                      onClick={() => { pushToHistory(); updateTheme({ coverLiner: tex, coverPocketLiner: tex }); }}
                      style={{
                        aspectRatio: '1', background: `url(${tex})`, backgroundSize: 'cover', borderRadius: '6px', 
                        border: event.theme?.coverLiner === tex ? '2px solid var(--accent)' : '1px solid var(--border)', 
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>

                <Button 
                  variant="subtle" 
                  style={{ width: "100%", justifyContent: "center", fontSize: "12px" }} 
                  onClick={() => {
                    textureInputRef.current?.click();
                    setIsEnvelopeOpen(true);
                  }}
                >
                  <ImageIcon size={18} style={{ marginRight: 8 }} /> Carica Foto
                </Button>

                {event.theme?.coverLiner && event.theme?.coverLiner !== 'none' && (
                  <Button 
                    variant={isEditingLiner ? "primary" : "subtle"} 
                    style={{ 
                      width: "100%", 
                      justifyContent: "center", 
                      fontSize: "12px",
                      ...(isEditingLiner ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.5)', zIndex: 1 } : {})
                    }} 
                    onClick={() => {
                      setIsEditingLiner(!isEditingLiner);
                      setIsEnvelopeOpen(true);
                    }}
                  >
                  <Move size={18} style={{ marginRight: 8 }} /> {isEditingLiner ? "Salva Posizione" : "Regola Posizione"}
                  </Button>
                )}
              </div>
            </div>
            
         </div>
         </Surface>
          </>
       )}

       {/* Scene Background Selection Section */}
       {editorMode === 'background' && (
         <>
        <Surface variant="soft" className="panel-section">
          <p style={{ fontSize: '10px', color: 'var(--text-soft)', marginBottom: '0', lineHeight: '1.5', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '3px solid var(--accent)' }}>
            Scegli l'atmosfera per il tuo evento. Sincronizza lo sfondo dello scenario con il tema del tuo evento.
          </p>
        </Surface>
        <Surface variant="soft" className="panel-section">
          <h3 style={{ marginBottom: '16px' }}>Design Scenario</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '10px', color: 'var(--text-soft)', marginTop: '-8px' }}>
              Scegli l'immagine che apparirà dietro la busta e l'invito nella pagina pubblica.
            </p>
            {/* Bg Color Selection */}
            <div>
              <Button 
                variant={displayColorPicker === 'eventHeroBg' ? "primary" : "subtle"}
                onClick={() => { if (displayColorPicker !== 'eventHeroBg') pushToHistory(); setDisplayColorPicker(displayColorPicker === 'eventHeroBg' ? false : 'eventHeroBg'); }}
                style={{ 
                  width: '100%', 
                  justifyContent: 'space-between', 
                  padding: '10px 12px',
                  background: 'rgba(60, 79, 118, 0.05)',
                  borderRadius: '100px',
                  ...(displayColorPicker === 'eventHeroBg' ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.5)', zIndex: 1 } : {})
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <PaintBucket size={18} style={{ marginRight: 8, opacity: 0.7 }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Colore</span>
                </div>
                <div style={{ width: '20px', height: '20px', background: (event.theme?.heroBgColor || 'var(--bg-body)'), borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </Button>
              
              {displayColorPicker === 'eventHeroBg' && (
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '8px' }}>
                  <CustomColorPicker color={event.theme?.heroBgColor || 'var(--bg-body)'} onChange={(color) => { if (event.theme?.heroBgColor !== color) updateTheme({ heroBgColor: color }); }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button 
                variant="subtle" 
                style={{ 
                  width: '100%', 
                  justifyContent: 'flex-start', 
                  fontSize: '12px', 
                  padding: '10px 12px',
                  background: 'rgba(60, 79, 118, 0.05)',
                  borderRadius: '100px'
                }} 
                onClick={() => scenarioBgInputRef.current?.click()}
              >
                <ImageIcon size={18} style={{ marginRight: 8, opacity: 0.7 }} /> 
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Carica Immagine Sfondo</span>
              </Button>
              <input 
                type="file" 
                ref={scenarioBgInputRef} 
                style={{display: 'none'}} 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleBackgroundUpload(file, 'scenario');
                  }
                  e.target.value = '';
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: 750, color: 'var(--text-soft)', textTransform: 'uppercase' }}>LIBRERIA SFONDI</label>
                
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    <div 
                     onClick={() => { pushToHistory(); updateTheme({ heroBg: 'none' }); }}
                     style={{
                       aspectRatio: '1', background: 'var(--surface-light)', borderRadius: '6px', 
                       border: (!event.theme?.heroBg || event.theme?.heroBg === 'none') ? '2px solid var(--accent)' : '1px solid var(--border)', 
                       cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700
                     }}
                    >NESSUNO</div>
                    {AVAILABLE_SCENARIO_BGS.map((tex) => (
                     <div 
                       key={tex.id}
                       onClick={() => { pushToHistory(); updateTheme({ heroBg: tex.url }); }}
                       style={{
                         aspectRatio: '1', background: `url(${tex.url})`, backgroundSize: 'cover', borderRadius: '6px', 
                         border: (event.theme?.heroBg === tex.url || event.theme?.heroBg?.endsWith(tex.url)) ? '2px solid var(--accent)' : '1px solid var(--border)', 
                         cursor: 'pointer'
                       }}
                       title={tex.name}
                     />
                    ))}
                    {userScenarioBgImages.map((tex, idx) => (
                     <div 
                       key={`user-bg-${idx}`}
                       onClick={() => updateTheme({ heroBg: tex })}
                       style={{
                         aspectRatio: '1', background: `url(${tex})`, backgroundSize: 'cover', borderRadius: '6px', 
                         border: event.theme?.heroBg === tex ? '2px solid var(--accent)' : '1px solid var(--border)', 
                         cursor: 'pointer'
                       }}
                     />
                    ))}
                 </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                   <label style={{ fontSize: '10px', fontWeight: 750, color: 'var(--text-soft)', display: 'block' }}>OPACITÀ IMMAGINE</label>
                   <span style={{ fontSize: '10px', fontWeight: 750 }}>{Math.round((event.theme?.heroBgOpacity ?? 1) * 100)}%</span>
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

              {/* Anchor Point Selector */}
              <div style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '10px', fontWeight: 750, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>PUNTO DI ANCORAGGIO</label>
                <p style={{ fontSize: '10px', color: 'var(--text-soft)', marginBottom: '16px', lineHeight: '1.4' }}>
                  Scegli la porzione di immagine da mantenere visibile a prescindere dalle dimensioni dello schermo.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: 'fit-content', marginLeft: '8px' }}>
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
                          width: '32px',
                          height: '32px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isActive ? 'var(--accent)' : 'transparent',
                          color: isActive ? '#000' : 'var(--text-soft)',
                          padding: 0,
                          transition: 'all 0.2s',
                        }}
                      >
                        <IconComp size={isActive ? 18 : 14} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Surface>
        </>
       )}

        {editorMode === "event_page" && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-soft)', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>Visualizzazione Editor</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                 <Button 
                   variant={!previewMobile ? 'primary' : 'subtle'} 
                   style={{ 
                     flex: 1, 
                     justifyContent: 'center', 
                     fontSize: '11px', 
                     fontWeight: 800,
                     gap: '8px',
                     borderRadius: '100px',
                     height: '42px',
                     ...( !previewMobile ? { boxShadow: '0 4px 12px rgba(var(--accent-rgb), 0.25)' } : { opacity: 0.8 })
                   }}
                   onClick={() => setPreviewMobile?.(false)}
                 >
                   <Monitor size={14} /> Desktop
                 </Button>
                 <Button 
                   variant={previewMobile ? 'primary' : 'subtle'} 
                   style={{ 
                     flex: 1, 
                     justifyContent: 'center', 
                     fontSize: '11px', 
                     fontWeight: 800,
                     gap: '8px',
                     borderRadius: '100px',
                     height: '42px',
                     ...( previewMobile ? { boxShadow: '0 4px 12px rgba(var(--accent-rgb), 0.25)' } : { opacity: 0.8 })
                   }}
                   onClick={() => setPreviewMobile?.(true)}
                 >
                   <Smartphone size={14} /> Mobile
                 </Button>
              </div>
            </div>


            {/* PRIORITÀ 1: PROPRIETÀ ELEMENTO SELEZIONATO */}
            {selectedLayerIds.length > 0 ? (
               <div key={`layer-props-${selectedLayerIds.join(',')}`}>
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
                    displayColorPicker={displayColorPicker === 'font' ? 'font' : false}
                    setDisplayColorPicker={(show) => setDisplayColorPicker(show)}
                    previewMobile={previewMobile}
                 />
                 
                 {/* Opzioni di inserimento se siamo comunque dentro un blocco */}
                 {selectedBlockId && (
                   <Surface variant="soft" className="panel-section" style={{ padding: '16px' }}>
                     <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Inserisci nella Sezione</h3>
                     <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                       <Button variant="primary" style={{ width: '100%', justifyContent: 'center' }} onClick={addTextLayer}>
                         <Type size={18} style={{marginRight: 8}}/> Testo
                       </Button>
                       <Button variant="subtle" style={{ width: '100%', justifyContent: 'center' }} onClick={() => fileInputRef.current?.click()}>
                         <ImageIcon size={18} style={{marginRight: 8}}/> Immagine
                       </Button>
                     </div>
                   </Surface>
                 )}
               </div>
            ) : selectedBlockId ? (
              /* PRIORITÀ 2: OPZIONI SEZIONE (Se nessun elemento è selezionato) */
              <div key={selectedBlockId}>
               <Surface variant="soft" className="panel-section" style={{ padding: '16px' }}>
                   <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Inserisci nella Sezione</h3>
                   <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                     <Button variant="primary" style={{ width: '100%', justifyContent: 'center', boxSizing: 'border-box' }} onClick={addTextLayer}>
                       <Type size={18} style={{marginRight: 8}}/> Testo
                     </Button>
                     <Button variant="subtle" style={{ width: '100%', justifyContent: 'center', boxSizing: 'border-box' }} onClick={() => fileInputRef.current?.click()}>
                       <ImageIcon size={18} style={{marginRight: 8}}/> Immagine
                     </Button>
                     <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{display: 'none'}} />
                                      {/* SETTINGS SPECIFICI PER WIDGET MAPPA */}
                   {selectedBlock && selectedBlock.type === 'map' && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                        Opzioni Mappa 📍
                      </label>
                      <input 
                        type="text"
                        value={selectedBlock.props?.title || "Come Arrivare"}
                        onChange={(e) => {
                          if (blocks && setBlocks) {
                            setIsDirty(true);
                            setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, title: e.target.value } } : b));
                          }
                        }}
                        placeholder="Titolo sezione (es: Cerimonia)"
                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', fontSize: '13px', color: 'var(--text-main)', marginBottom: '12px', outline: 'none' }}
                      />
                      <input 
                        type="text"
                        value={selectedBlock.props?.address || ""}
                        onChange={(e) => {
                          if (blocks && setBlocks) {
                            setIsDirty(true);
                            setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, address: e.target.value } } : b));
                          }
                        }}
                        placeholder="Indirizzo (es: Piazza del Duomo, 1)"
                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', fontSize: '13px', color: 'var(--text-main)', marginBottom: '12px', outline: 'none' }}
                      />
                    </div>
                  )}

                  {/* SETTINGS SPECIFICI PER WIDGET RSVP */}
                  {selectedBlock && selectedBlock.type === 'rsvp' && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                      
                      {/* TABS RSVP */}
                      <div style={{ 
                        display: 'flex', 
                        background: 'var(--surface-light)', 
                        borderRadius: '100px', 
                        padding: '3px', 
                        marginBottom: '20px',
                        border: '1px solid var(--border)' 
                      }}>
                        {(['content', 'style', 'questions'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveRsvpTab(tab)}
                            style={{
                              flex: 1,
                              padding: '6px 2px',
                              fontSize: '9px',
                              fontWeight: 800,
                              borderRadius: '100px',
                              border: 'none',
                              cursor: 'pointer',
                              background: activeRsvpTab === tab ? 'var(--accent)' : 'transparent',
                              color: activeRsvpTab === tab ? '#000' : 'var(--text-soft)',
                              transition: 'all 0.2s',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}
                          >
                            {tab === 'content' ? 'Testi' : tab === 'style' ? 'Stile' : 'Domande'}
                          </button>
                        ))}
                      </div>

                      {/* TAB 1: CONTENUTI */}
                      {activeRsvpTab === 'content' && (
                        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                          <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Titolo & Messaggio</label>
                          <input 
                            type="text"
                            value={selectedBlock.props?.rsvpTitle || "GENTILE CONFERMA"}
                            onChange={(e) => {
                              if (blocks && setBlocks) {
                                setIsDirty(true);
                                setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, rsvpTitle: e.target.value } } : b));
                              }
                            }}
                            placeholder="Titolo RSVP"
                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', fontSize: '13px', color: 'var(--text-main)', marginBottom: '12px', outline: 'none' }}
                          />
                          <textarea 
                            value={selectedBlock.props?.rsvpDescription || ""}
                            onChange={(e) => {
                              if (blocks && setBlocks) {
                                setIsDirty(true);
                                setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, rsvpDescription: e.target.value } } : b));
                              }
                            }}
                            placeholder="Descrizione o istruzioni per gli ospiti..."
                            style={{ width: '100%', minHeight: '80px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', fontSize: '13px', color: 'var(--text-main)', resize: 'vertical', outline: 'none', marginBottom: '8px' }}
                          />
                          <p style={{ fontSize: '10px', color: 'var(--text-soft)', fontStyle: 'italic', marginBottom: '16px' }}>
                            Suggerimento: Specifica una data ultima per la conferma.
                          </p>
                        </div>
                      )}

                      {/* TAB 2: STILE */}
                      {activeRsvpTab === 'style' && (
                        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                              <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Colore Pulsante</label>
                              <div 
                                onClick={() => setDisplayColorPicker(displayColorPicker === 'formPrimary' ? false : 'formPrimary')}
                                style={{
                                  padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
                                }}
                              >
                                <span style={{ fontSize: '12px', color: 'var(--text-main)' }}>Principale</span>
                                <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: selectedBlock.props?.formPrimaryColor || 'var(--accent)', border: '1px solid rgba(0,0,0,0.1)' }} />
                              </div>
                              {displayColorPicker === 'formPrimary' && (
                                <div style={{ marginTop: '10px' }}>
                                  <CustomColorPicker 
                                    color={selectedBlock.props?.formPrimaryColor || '#14b8a6'} 
                                    onChange={(color) => {
                                      if (blocks && setBlocks) {
                                        setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, formPrimaryColor: color } } : b));
                                      }
                                    }} 
                                  />
                                </div>
                              )}
                            </div>

                            <div>
                              <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Colore Testi</label>
                              <div 
                                onClick={() => setDisplayColorPicker(displayColorPicker === 'formText' ? false : 'formText')}
                                style={{
                                  padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
                                }}
                              >
                                <span style={{ fontSize: '12px', color: 'var(--text-main)' }}>Labels & Testo</span>
                                <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: selectedBlock.props?.formTextColor || '#ffffff', border: '1px solid rgba(0,0,0,0.1)' }} />
                              </div>
                              {displayColorPicker === 'formText' && (
                                <div style={{ marginTop: '10px' }}>
                                  <CustomColorPicker 
                                    color={selectedBlock.props?.formTextColor || '#ffffff'} 
                                    onChange={(color) => {
                                      if (blocks && setBlocks) {
                                        setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, formTextColor: color } } : b));
                                      }
                                    }} 
                                  />
                                </div>
                              )}
                            </div>

                            <div>
                              <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Sfondo Campi</label>
                              <div 
                                onClick={() => setDisplayColorPicker(displayColorPicker === 'formInput' ? false : 'formInput')}
                                style={{
                                  padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
                                }}
                              >
                                <span style={{ fontSize: '12px', color: 'var(--text-main)' }}>Input Background</span>
                                <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: selectedBlock.props?.formInputBg || 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,0,0,0.1)' }} />
                              </div>
                              {displayColorPicker === 'formInput' && (
                                <div style={{ marginTop: '10px' }}>
                                  <CustomColorPicker 
                                    color={selectedBlock.props?.formInputBg || 'rgba(255,255,255,0.05)'} 
                                    onChange={(color) => {
                                      if (blocks && setBlocks) {
                                        setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, formInputBg: color } } : b));
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
                          
                          {/* Standard Toggles */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600 }}>Numero Ospiti</span>
                              </div>
                              <input type="checkbox" checked={selectedBlock.props?.rsvpAskGuests !== false} onChange={(e) => {
                                if (blocks && setBlocks) {
                                  setIsDirty(true);
                                  setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, rsvpAskGuests: e.target.checked } } : b));
                                }
                              }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600 }}>Allergie / Intolleranze</span>
                              </div>
                              <input type="checkbox" checked={selectedBlock.props?.rsvpAskIntolerances !== false} onChange={(e) => {
                                if (blocks && setBlocks) {
                                  setIsDirty(true);
                                  setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, rsvpAskIntolerances: e.target.checked } } : b));
                                }
                              }} />
                            </div>
                          </div>

                          {/* Custom Fields Manager */}
                          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                              <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase' }}>Campi Personalizzati</label>
                              <Button 
                                variant="ghost" 
                                onClick={() => {
                                  if (blocks && setBlocks) {
                                    setIsDirty(true);
                                    const currentFields = selectedBlock.props?.customFields || [];
                                    const newField = { id: 'field-' + Date.now(), label: 'Nuova Domanda', type: 'text', required: false };
                                    setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, customFields: [...currentFields, newField] } } : b));
                                  }
                                }}
                                style={{ padding: '4px 8px', fontSize: '10px', height: 'auto', background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent)' }}
                              >
                                <Plus size={14} style={{ marginRight: 4 }} /> AGGIUNGI
                              </Button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {(selectedBlock.props?.customFields || []).map((field: any, index: number) => (
                                <div key={field.id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)', padding: '10px' }}>
                                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <input 
                                      type="text"
                                      value={field.label}
                                      onChange={(e) => {
                                        if (blocks && setBlocks) {
                                          const newFields = [...(selectedBlock.props?.customFields || [])];
                                          newFields[index] = { ...field, label: e.target.value };
                                          setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, customFields: newFields } } : b));
                                        }
                                      }}
                                      style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-main)', padding: '4px 0', outline: 'none' }}
                                    />
                                    <Button 
                                      variant="ghost" 
                                      onClick={() => {
                                        if (blocks && setBlocks) {
                                          const newFields = (selectedBlock.props?.customFields || []).filter((_: any, i: number) => i !== index);
                                          setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, customFields: newFields } } : b));
                                        }
                                      }}
                                      style={{ padding: '0', color: 'salmon' }}
                                    >
                                      <Trash2 size={14} />
                                    </Button>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <select 
                                      value={field.type}
                                      onChange={(e) => {
                                        if (blocks && setBlocks) {
                                          const newFields = [...(selectedBlock.props?.customFields || [])];
                                          newFields[index] = { ...field, type: e.target.value as any };
                                          setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, customFields: newFields } } : b));
                                        }
                                      }}
                                      style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '4px', fontSize: '10px', color: 'var(--text-soft)', padding: '2px 4px', cursor: 'pointer', outline: 'none' }}
                                    >
                                      <option value="text">Testo libero</option>
                                      <option value="checkbox">Scelta (Sì/No)</option>
                                    </select>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-soft)', cursor: 'pointer' }}>
                                      <input 
                                        type="checkbox" 
                                        checked={field.required} 
                                        onChange={(e) => {
                                          if (blocks && setBlocks) {
                                            const newFields = [...(selectedBlock.props?.customFields || [])];
                                            newFields[index] = { ...field, required: e.target.checked };
                                            setBlocks(blocks.map(b => b.id === selectedBlock.id ? { ...b, props: { ...b.props, customFields: newFields } } : b));
                                          }
                                        }}
                                      /> Obbligatorio
                                    </label>
                                  </div>
                                </div>
                              ))}
                              {(!selectedBlock.props?.customFields || selectedBlock.props?.customFields.length === 0) && (
                                <p style={{ fontSize: '10px', color: 'var(--text-soft)', textAlign: 'center', padding: '10px', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                                  Nessuna domanda personalizzata aggiunta.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
                <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,0,0,0.1)', paddingTop: '20px' }}>
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
               </Surface>
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
                      setBlocks([...blocks, { id: 'block-' + Date.now(), type: 'canvas', y: 0, height: 400, bgColor: '#ffffff' }]);
                      pushToHistory();
                    }
                  }}>
                    <Plus size={18} style={{marginRight: 8}}/> Sezione Vuota
                  </Button>
                  
                   <Button variant="subtle" style={{width: '100%', justifyContent: 'center', borderColor: 'var(--accent-soft)', borderStyle: 'dashed'}} onClick={() => {
                    if (blocks && setBlocks) {
                      setIsDirty(true);
                      const newBlockId = 'block-map-' + Date.now();
                      setBlocks([...blocks, { 
                        id: newBlockId, 
                        type: 'map', 
                        y: 0, 
                        height: 400, 
                        bgColor: '#f9f9f9',
                        props: { address: 'Piazza del Duomo, Milano', zoom: 15 }
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
                        y: 0, 
                        height: 500, 
                        bgColor: 'transparent',
                        props: { rsvpTitle: 'GENTILE CONFERMA' }
                      }]);
                      pushToHistory();
                    }
                  }}>
                    <CheckSquare size={18} style={{marginRight: 8}}/> Sezione RSVP
                  </Button>
                </div>
              </Surface>
            )}
          </>
        )}
    </div>
  );
};

export default DesktopSidebar;
