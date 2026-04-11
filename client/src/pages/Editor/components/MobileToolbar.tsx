import React from 'react';
import { 
  X, Baseline, Settings2, Bold, Italic, Underline, PaintBucket, 
  Palette, Image as ImageIcon, Move, Sparkles, Trash2, Mail, MailOpen, 
  Shapes, Type, ChevronUp, Minus, Plus, Circle, ArrowRight, 
  ArrowLeft, ArrowDown, ArrowUp, ArrowUpRight, ArrowUpLeft, 
  ArrowDownRight, ArrowDownLeft, Check, ChevronLeft, Layout, Smartphone, Monitor
} from 'lucide-react';
import { Button } from "../../../ui";
import MobileIconBtn from "../../../components/ui/MobileIconBtn";
import CustomColorPicker from "./CustomColorPicker";
import { AVAILABLE_FONTS, getFontPreviewText, loadGoogleFont, AVAILABLE_LINERS, AVAILABLE_SCENARIO_BGS } from "./EditorHelpers";
import type { Layer, CanvasProps, Block } from "../../../types/editor";

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
  setIsDirty
}) => {
  // MODALITÀ FOCUS: Nascondi la barra strumenti fissa se stiamo scrivendo un testo
  if (editingLayerId) {
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
                  {activeMobileTab === 'font' ? 'Font' : activeMobileTab === 'size' ? 'Dimensioni' : activeMobileTab === 'format' ? 'Formato' : activeMobileTab === 'color' ? 'Colore' : activeMobileTab === 'image_opacity' ? 'Opacità Immagine' : activeMobileTab === 'bg_invito' ? 'Sfondo Invito' : activeMobileTab === 'envelope_colors' ? 'Colori Busta' : activeMobileTab === 'envelope_format' ? 'Formato Busta' : activeMobileTab === 'envelope_liner' ? 'Interno Busta' : activeMobileTab === 'scenario_bg' ? 'Scenario' : activeMobileTab === 'rsvp_style' ? 'Stile Form' : activeMobileTab === 'rsvp_questions' ? 'Domande RSVP' : activeMobileTab }
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
                          onClick={() => setCanvasProps((prev: CanvasProps) => ({ ...prev, bgImage: null }))}
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

                {/* RSVP STYLE TAB */}
                {activeMobileTab === 'rsvp_style' && selectedBlockId && blocks && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(() => {
                      const block = blocks.find(b => b.id === selectedBlockId);
                      if (!block) return null;
                      return (
                        <>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button 
                              variant={displayColorPicker === 'formPrimary' ? 'primary' : 'subtle'}
                              style={{ flex: 1, fontSize: '11px', justifyContent: 'space-between' }}
                              onClick={() => setDisplayColorPicker(displayColorPicker === 'formPrimary' ? false : 'formPrimary')}
                            >
                              <span>Pulsante</span>
                              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: block.widgetProps?.formPrimaryColor || 'var(--accent)', border: '1px solid var(--border)' }} />
                            </Button>
                            <Button 
                              variant={displayColorPicker === 'formText' ? 'primary' : 'subtle'}
                              style={{ flex: 1, fontSize: '11px', justifyContent: 'space-between' }}
                              onClick={() => setDisplayColorPicker(displayColorPicker === 'formText' ? false : 'formText')}
                            >
                              <span>Testi</span>
                              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: block.widgetProps?.formTextColor || '#ffffff', border: '1px solid var(--border)' }} />
                            </Button>
                          </div>
                          
                          {displayColorPicker === 'formPrimary' && (
                            <div style={{ padding: '4px 0' }}>
                              <CustomColorPicker 
                                color={block.widgetProps?.formPrimaryColor || '#14b8a6'} 
                                onChange={(color) => {
                                  if (setBlocks) {
                                    setBlocks(blocks.map(b => b.id === block.id ? { ...b, widgetProps: { ...b.widgetProps, formPrimaryColor: color } } : b));
                                  }
                                }} 
                              />
                            </div>
                          )}
                          {displayColorPicker === 'formText' && (
                            <div style={{ padding: '4px 0' }}>
                              <CustomColorPicker 
                                color={block.widgetProps?.formTextColor || '#ffffff'} 
                                onChange={(color) => {
                                  if (setBlocks) {
                                    setBlocks(blocks.map(b => b.id === block.id ? { ...b, widgetProps: { ...b.widgetProps, formTextColor: color } } : b));
                                  }
                                }} 
                              />
                            </div>
                          )}

                          <Button 
                            variant={displayColorPicker === 'formInput' ? 'primary' : 'subtle'}
                            style={{ width: '100%', fontSize: '11px', justifyContent: 'space-between' }}
                            onClick={() => setDisplayColorPicker(displayColorPicker === 'formInput' ? false : 'formInput')}
                          >
                            <span>Sfondo Input</span>
                            <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: block.widgetProps?.formInputBg || 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }} />
                          </Button>
                          {displayColorPicker === 'formInput' && (
                            <div style={{ padding: '4px 0' }}>
                              <CustomColorPicker 
                                color={block.widgetProps?.formInputBg || 'rgba(255,255,255,0.05)'} 
                                onChange={(color) => {
                                  if (setBlocks) {
                                    setBlocks(blocks.map(b => b.id === block.id ? { ...b, widgetProps: { ...b.widgetProps, formInputBg: color } } : b));
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
                          </div>
                          
                          <div style={{ textAlign: 'center', marginTop: '4px' }}>
                             <Button 
                               variant="ghost" 
                               onClick={() => {
                                 if (setBlocks && setIsDirty) {
                                   setIsDirty(true);
                                   const currentFields = block.widgetProps?.customFields || [];
                                   const newField = { id: 'field-' + Date.now(), label: 'Nuova Domanda', type: 'text' as const, required: false };
                                   setBlocks(blocks.map(b => b.id === block.id ? { ...b, widgetProps: { ...b.widgetProps, customFields: [...currentFields, newField] } } : b));
                                 }
                               }}
                               style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.05em' }}
                             >
                               + AGGIUNGI DOMANDA PERSONALIZZATA
                             </Button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
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
                            {selectedBlockId ? (blocks?.find(b => b.id === selectedBlockId)?.type === 'rsvp' ? "Modifica RSVP" : "Modifica Sezione") : "Aggiungi"}
                         </span>
                         <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 1, width: '150px' }}>Visualizza su</span>
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
                                  </>
                                );
                              }
                              
                              return (
                                <>
                                  <MobileIconBtn 
                                    icon={Plus} 
                                    label="Sezione" 
                                    onClick={() => alert("Funzionalità in arrivo!")} 
                                  />
                                  <MobileIconBtn 
                                    icon={Type} 
                                    label="Testo" 
                                    onClick={addTextLayer} 
                                  />
                                  {(!block || (block.type !== 'rsvp' && block.type !== 'map')) && (
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
                           background: 'rgba(0,0,0,0.2)', 
                           padding: '2px', 
                           borderRadius: '100px',
                           border: '1px solid rgba(255,255,255,0.08)',
                           width: '150px',
                           flexShrink: 0
                         }}>
                           <button 
                             onClick={() => setPreviewMobile?.(true)}
                             style={{
                               flex: 1,
                               background: previewMobile ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                               border: 'none',
                               borderRadius: '100px',
                               padding: '7px 0',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               gap: '5px',
                               color: previewMobile ? '#000' : 'rgba(255,255,255,0.75)',
                               transition: 'all 0.2s',
                               cursor: 'pointer'
                             }}
                           >
                             <Smartphone size={14} style={{ opacity: previewMobile ? 1 : 0.8 }} />
                             <span style={{ fontSize: '10px', fontWeight: 900 }}>MOBILE</span>
                           </button>
                           <button 
                             onClick={() => setPreviewMobile?.(false)}
                             style={{
                               flex: 1,
                               background: !previewMobile ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                               border: 'none',
                               borderRadius: '100px',
                               padding: '7px 0',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               gap: '5px',
                               color: !previewMobile ? '#000' : 'rgba(255,255,255,0.75)',
                               transition: 'all 0.2s',
                               cursor: 'pointer'
                             }}
                           >
                             <Monitor size={14} style={{ opacity: !previewMobile ? 1 : 0.8 }} />
                             <span style={{ fontSize: '10px', fontWeight: 900 }}>DESKTOP</span>
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
