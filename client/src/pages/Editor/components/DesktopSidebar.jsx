import React from 'react';
import { Surface, Button } from "../../../ui";
import { 
  Type, ImageIcon, PaintBucket, Move, Mail, MailOpen, ChevronDown, Check, ArrowLeft, ArrowRight, ArrowDown, ArrowUp, ArrowUpRight, ArrowUpLeft, ArrowDownRight, ArrowDownLeft, Plus, Circle
} from "lucide-react";
import PropertyPanel from "./PropertyPanel";
import CustomColorPicker from "./CustomColorPicker";
import { AVAILABLE_LINERS, AVAILABLE_SCENARIO_BGS } from "./EditorHelpers";

const DesktopSidebar = ({
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
  setShowMobileAnchorGrid
}) => {
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

           {/* BLOCCO INSERISCI */}
           <Surface variant="soft" className="panel-section">
              <h3>Inserisci</h3>
         <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
           <Button variant="primary" style={{width: '100%', justifyContent: 'center'}} onClick={addTextLayer}>
             <Type size={18} style={{marginRight: 8}}/> Testo
           </Button>
           <Button variant="secondary" style={{width: '100%', justifyContent: 'center'}} onClick={() => fileInputRef.current?.click()}>
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
                  onClick={() => setDisplayColorPicker(displayColorPicker === 'canvasBg' ? false : 'canvasBg')}
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
                 style={{ width: '100%', justifyContent: 'center', fontSize: '10px', color: 'salmon' }} 
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
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-soft)', marginBottom: '4px', display: 'block' }}>Colore Principale</label>
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
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-soft)', marginBottom: '4px', display: 'block' }}>Colore Tasca</label>
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '10px', fontWeight: 750, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>INTERNO BUSTA</label>
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
                    <PaintBucket size={18} style={{ marginRight: 8 }} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Colore</span>
                  </div>
                  <div style={{ width: '20px', height: '20px', background: (event.theme?.coverLinerColor || '#ffffff'), borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }} />
                </Button>
                {displayColorPicker === 'linerColor' && (
                  <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '4px', border: '1px solid var(--border)', marginTop: '4px' }}>
                    <CustomColorPicker color={event.theme?.coverLinerColor || '#ffffff'} onChange={(color) => updateTheme({ coverLinerColor: color })} />
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
                    const file = e.target.files[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      updateTheme({ coverLiner: url, coverPocketLiner: url });
                      setIsEnvelopeOpen(true);
                      setIsEditingLiner(true);
                    }
                  }}
                />
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-soft)', marginBottom: '4px' }}>Motivi Predefiniti</div>
                
                {/* Thumbnails Interno Busta */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <div 
                    onClick={() => updateTheme({ coverLiner: 'none', coverPocketLiner: 'none' })}
                    style={{
                      aspectRatio: '1', background: 'var(--surface-light)', borderRadius: '6px', 
                      border: (!event.theme?.coverLiner || event.theme?.coverLiner === 'none') ? '2px solid var(--accent)' : '1px solid var(--border)', 
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700
                    }}
                  >NESSUNA</div>
                  {AVAILABLE_LINERS.map((tex) => (
                    <div 
                      key={tex.id}
                      onClick={() => updateTheme({ coverLiner: tex.url, coverPocketLiner: tex.url })}
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
                      onClick={() => updateTheme({ coverLiner: tex, coverPocketLiner: tex })}
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
                    onClick={() => setDisplayColorPicker(displayColorPicker === 'eventHeroBg' ? false : 'eventHeroBg')}
                    style={{ 
                      width: '100%', 
                      justifyContent: 'space-between', 
                      padding: '10px 12px',
                      background: 'rgba(60, 79, 118, 0.05)',
                      borderRadius: '12px',
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
                      <CustomColorPicker color={event.theme?.heroBgColor || 'var(--bg-body)'} onChange={(color) => updateTheme({ heroBgColor: color })} />
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
                      borderRadius: '12px'
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
                      const file = e.target.files[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        updateTheme({ heroBg: url });
                      }
                    }}
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 750, color: 'var(--text-soft)', textTransform: 'uppercase' }}>LIBRERIA SFONDI</label>
                    
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        <div 
                         onClick={() => updateTheme({ heroBg: 'none' })}
                         style={{
                           aspectRatio: '1', background: 'var(--surface-light)', borderRadius: '6px', 
                           border: (!event.theme?.heroBg || event.theme?.heroBg === 'none') ? '2px solid var(--accent)' : '1px solid var(--border)', 
                           cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700
                         }}
                        >NESSUNO</div>
                        {AVAILABLE_SCENARIO_BGS.map((tex) => (
                         <div 
                           key={tex.id}
                           onClick={() => updateTheme({ heroBg: tex.url })}
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
                       onChange={(e) => updateTheme({ heroBgOpacity: parseFloat(e.target.value) })}
                       style={{ 
                         width: '100%', 
                         background: `linear-gradient(to right, var(--accent) ${Math.round((event.theme?.heroBgOpacity ?? 1) * 100)}%, rgba(60, 79, 118, 0.1) ${Math.round((event.theme?.heroBgOpacity ?? 1) * 100)}%)`
                       }}
                     />
                  </div>

                  {/* Anchor Point Selector */}
                  <div style={{ marginTop: '8px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 750, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>PUNTO DI ANCORAGGIO</label>
                    <p style={{ fontSize: '10px', color: 'var(--text-soft)', marginBottom: '16px', lineHeight: '1.4' }}>
                      Scegli la porzione di immagine da mantenere visibile a prescindere dalle dimensioni dello schermo.
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: 'fit-content', marginLeft: '8px' }}>
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

           {editorMode === 'event_page' && (
             <Surface variant="soft" className="panel-section">
               <p style={{ fontSize: '10px', color: 'var(--text-soft)', marginBottom: '0', lineHeight: '1.5', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '3px solid var(--accent)' }}>
                 Costruisci la pagina web pubblica del tuo evento aggiungendo intere nuove sezioni (Mappa, RSVP, Foto).
               </p>
               <h3 style={{ marginTop: '16px', marginBottom: '12px' }}>Gestione Sezioni</h3>
               <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                 <Button variant="primary" style={{width: '100%', justifyContent: 'center'}} onClick={() => alert("Aggiunta moduli in arrivo nel prossimo step!")}>
                   <Plus size={18} style={{marginRight: 8}}/> Aggiungi Sezione
                 </Button>
               </div>
             </Surface>
           )}
    </div>
  );
};


export default DesktopSidebar;
