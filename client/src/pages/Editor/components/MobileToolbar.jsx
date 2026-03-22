import React from 'react';
import { 
  X, Baseline, Settings2, Bold, Italic, Underline, PaintBucket, 
  Palette, Image as ImageIcon, Move, Sparkles, Trash2, Mail, MailOpen, 
  Shapes, Type, ChevronUp, Minus, Plus, Circle, ArrowRight, 
  ArrowLeft, ArrowDown, ArrowUp, ArrowUpRight, ArrowUpLeft, 
  ArrowDownRight, ArrowDownLeft, Check, ChevronLeft, Layout
} from 'lucide-react';
import { Button } from "../../../ui";
import MobileIconBtn from "../../../components/ui/MobileIconBtn";
import CustomColorPicker from "./CustomColorPicker";
import { AVAILABLE_FONTS, getFontPreviewText, loadGoogleFont, AVAILABLE_LINERS, AVAILABLE_SCENARIO_BGS } from "./EditorHelpers";

const MobileToolbar = ({
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
  fileInputRef
}) => {
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
                  {activeMobileTab === 'font' ? 'Font' : activeMobileTab === 'size' ? 'Dimensioni' : activeMobileTab === 'format' ? 'Formato' : activeMobileTab === 'color' ? 'Colore' : activeMobileTab === 'image_opacity' ? 'Opacità Immagine' : activeMobileTab === 'bg_invito' ? 'Sfondo Invito' : activeMobileTab === 'envelope_colors' ? 'Colori Busta' : activeMobileTab === 'envelope_format' ? 'Formato Busta' : activeMobileTab === 'envelope_liner' ? 'Interno Busta' : activeMobileTab === 'scenario_bg' ? 'Scenario' : activeMobileTab }
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
                               onClick={() => { updateSelectedLayer({ fontFamily: f }); loadGoogleFont(f); }} 
                               style={{
                                 whiteSpace: 'nowrap', padding: '8px 14px', 
                                 background: selectedLayer?.fontFamily === f ? 'var(--accent)' : 'var(--surface-light)', 
                                 color: selectedLayer?.fontFamily === f ? '#ffffff' : 'var(--text-primary)', 
                                 borderRadius: '8px', border: 'none', cursor: 'pointer',
                                 display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '2px',
                                 minWidth: '110px'
                               }}
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
                             onClick={() => { updateSelectedLayer({ fontFamily: f }); loadGoogleFont(f); setIsFontExpanded(false); }} 
                             style={{
                               padding: '8px 16px', textAlign: 'left', 
                               background: selectedLayer?.fontFamily === f ? 'var(--accent)' : 'transparent', 
                               color: selectedLayer?.fontFamily === f ? '#ffffff' : 'var(--text-primary)', 
                               border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', 
                               display: 'flex', flexDirection: 'column', gap: '2px'
                             }}
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
                    <Button variant="ghost" className="stepper-btn" onClick={() => updateSelectedLayer({fontSize: Math.max(8, selectedLayer.fontSize - 1)})}><Minus size={28}/></Button>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '60px' }}>
                      <input 
                        type="text" 
                        value={selectedLayer.fontSize}
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
                     <Bold size={18}/>
                   </Button>
                   <Button variant="ghost" onClick={() => updateSelectedLayer({fontStyle: selectedLayer.fontStyle === 'italic' ? 'normal' : 'italic'})} style={{background: selectedLayer.fontStyle === 'italic' ? 'var(--accent)' : 'var(--surface-light)', color: selectedLayer.fontStyle === 'italic' ? '#ffffff' : 'var(--text-soft)', padding: '0.8rem'}}>
                     <Italic size={18}/>
                   </Button>
                   <Button variant="ghost" onClick={() => updateSelectedLayer({textDecoration: selectedLayer.textDecoration === 'underline' ? 'none' : 'underline'})} style={{background: selectedLayer.textDecoration === 'underline' ? 'var(--accent)' : 'var(--surface-light)', color: selectedLayer.textDecoration === 'underline' ? '#ffffff' : 'var(--text-soft)', padding: '0.8rem'}}>
                     <Underline size={18}/>
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
                       <CustomColorPicker color={canvasProps.bgColor || '#ffffff'} onChange={(color) => setCanvasProps(prev => ({ ...prev, bgColor: color }))} />
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
                             onChange={(e) => setCanvasProps(prev => ({ ...prev, bgOpacity: parseFloat(e.target.value) }))}
                             style={{ 
                               flex: 1, 
                               background: `linear-gradient(to right, var(--accent) ${Math.round((canvasProps.bgOpacity ?? 1) * 100)}%, rgba(60, 79, 118, 0.1) ${Math.round((canvasProps.bgOpacity ?? 1) * 100)}%)`
                             }}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                       <p style={{ fontSize: '10px', color: 'var(--text-soft)', marginBottom: '4px', lineHeight: '1.4' }}>
                         Scegli la porzione di immagine da mantenere visibile a prescindere dalle dimensioni dello schermo.
                       </p>
                       <div style={{ display: 'flex', justifyContent: 'center' }}>
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: 'fit-content' }}>
                            {[
                              { val: 'top left', x: 0, y: 0 }, { val: 'top', x: 1, y: 0 }, { val: 'top right', x: 2, y: 0 },
                              { val: 'left', x: 0, y: 1 }, { val: 'center', x: 1, y: 1 }, { val: 'right', x: 2, y: 1 },
                              { val: 'bottom left', x: 0, y: 2 }, { val: 'bottom', x: 1, y: 2 }, { val: 'bottom right', x: 2, y: 2 }
                            ].map(pos => {
                              const currentPos = event.theme?.heroBgPosition || 'center';
                              const isActive = currentPos === pos.val;
                              
                              const coords = {
                                'top left': {x:0, y:0}, 'top': {x:1, y:0}, 'top right': {x:2, y:0},
                                'left': {x:0, y:1}, 'center': {x:1, y:1}, 'right': {x:2, y:1},
                                'bottom left': {x:0, y:2}, 'bottom': {x:1, y:2}, 'bottom right': {x:2, y:2}
                              };
                              const s = coords[currentPos];

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
                                  onClick={() => updateTheme({ heroBgPosition: pos.val })}
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
                            {[null, ...AVAILABLE_SCENARIO_BGS.map(b => b.url), ...userScenarioBgImages.slice(0, 2)].map(tex => (
                               <div 
                                 key={tex || 'none'}
                                 onClick={() => updateTheme({ heroBg: tex || 'none' })}
                                 style={{
                                   aspectRatio: '1', 
                                   background: (tex && tex !== 'none') ? `url(${tex})` : 'var(--surface-light)', 
                                   backgroundSize: 'cover', 
                                   borderRadius: '4px', 
                                   border: (event.theme?.heroBg === tex || (event.theme?.heroBg?.endsWith(tex) && tex) || (tex === null && (event.theme?.heroBg === 'none' || !event.theme?.heroBg))) ? '2px solid var(--accent)' : '1px solid rgba(60, 79, 118, 0.1)', 
                                   cursor: 'pointer',
                                   display: 'flex',
                                   alignItems: 'center',
                                   justifyContent: 'center',
                                   fontSize: '7px', letterSpacing: '-0.2px',
                                   fontWeight: 700,
                                   overflow: 'hidden',
                                   color: 'var(--text-soft)',
                                   textTransform: 'uppercase'
                                 }}
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
                            onChange={(e) => updateTheme({ heroBgOpacity: parseFloat(e.target.value) })}
                            style={{ 
                              width: '100%', 
                              background: `linear-gradient(to right, var(--accent) ${Math.round((event.theme?.heroBgOpacity ?? 1) * 100)}%, rgba(60, 79, 118, 0.1) ${Math.round((event.theme?.heroBgOpacity ?? 1) * 100)}%)`
                            }}
                          />
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                           <label style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-soft)' }}>Colore</label>
                           <button
                             onClick={() => setDisplayColorPicker(displayColorPicker === 'eventHeroBgMobile' ? false : 'eventHeroBgMobile')}
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
                        onClick={() => updateTheme({ envelopeFormat: 'horizontal' })}
                      >
                        Orizzontale
                      </Button>
                      <Button 
                        variant={event.theme?.envelopeFormat !== 'horizontal' ? 'primary' : 'subtle'} 
                        style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '10px 0' }}
                        onClick={() => updateTheme({ envelopeFormat: 'vertical' })}
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
                          onClick={() => setDisplayColorPicker(displayColorPicker === 'coverBg' ? false : 'coverBg')}
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
                          onClick={() => setDisplayColorPicker(displayColorPicker === 'coverPocket' ? false : 'coverPocket')}
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
                             {[null, ...AVAILABLE_LINERS.map(l => l.url), ...userLinerImages].map(tex => (
                              <div 
                                key={tex || 'none'}
                                onClick={() => updateTheme({ coverLiner: tex || 'none', coverPocketLiner: tex || 'none' })}
                                style={{
                                  aspectRatio: '1', 
                                  background: (tex && tex !== 'none') ? `url(${tex})` : 'var(--surface-light)', 
                                  backgroundSize: 'cover', 
                                  borderRadius: '4px', 
                                  border: (event.theme?.coverLiner === tex || (event.theme?.coverLiner?.endsWith(tex) && tex) || (tex === null && (event.theme?.coverLiner === 'none' || !event.theme?.coverLiner))) ? '2px solid var(--accent)' : '1px solid rgba(60, 79, 118, 0.1)', 
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '7px', letterSpacing: '-0.2px',
                                  fontWeight: 700,
                                  overflow: 'hidden',
                                  color: 'var(--text-soft)',
                                  textTransform: 'uppercase'
                                }}
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
                           fontSize: '10px',
                           ...(displayColorPicker === 'coverLiner' ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.3)' } : {})
                         }}
                         onClick={() => setDisplayColorPicker(displayColorPicker === 'coverLiner' ? false : 'coverLiner')}
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
            </div>
          </div>
        )}

      <div className="mobile-toolbar">
        {selectedLayer && editorMode === 'canvas' ? (
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
              <div style={{ padding: '8px 10px 4px', fontSize: '10px', color: 'var(--text-soft)', textAlign: 'center' }}>
                {editorMode === 'envelope' ? "Personalizza la tua busta" : 
                 editorMode === 'background' ? "Personalizza lo scenario" : 
                 editorMode === 'event_page' ? "Costruisci la landing page" :
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
                      {event.canvas?.width !== event.canvas?.height && (
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
                    <>
                      <MobileIconBtn 
                        icon={Plus} 
                        label="Aggiungi Sez." 
                        onClick={() => alert("Moduli in arrivo!")} 
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
  );
};

export default MobileToolbar;
