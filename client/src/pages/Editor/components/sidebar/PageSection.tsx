import React from 'react';
import { Surface, Button } from "../../../../ui";
import { 
  Type, Image as ImageIcon, MapPin, CheckSquare, Plus, Trash2, Monitor, Smartphone
} from "lucide-react";
import PropertyPanel from "../PropertyPanel";
import CustomColorPicker from "../CustomColorPicker";
import type { Layer, Block } from "../../../../types/editor";

interface PageSectionProps {
  previewMobile: boolean;
  setPreviewMobile: (preview: boolean) => void;
  slug: string;
  selectedLayer: any;
  selectedLayerIds: string[];
  layers: Layer[];
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
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsDirty: (val: boolean) => void;
  pushToHistory: () => void;
  showVisibility?: boolean;
  updateTheme: (updates: any) => void;
}

const PageSection: React.FC<PageSectionProps> = ({
  previewMobile,
  setPreviewMobile,
  slug,
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
  selectedBlockId,
  addTextLayer,
  fileInputRef,
  handleImageUpload,
  blocks,
  setBlocks,
  setIsDirty,
  pushToHistory,
  updateTheme,
  showVisibility = true
}) => {
  const selectedBlock = blocks?.find(b => b.id === selectedBlockId);
  const [activeRsvpTab, setActiveRsvpTab] = React.useState<'content' | 'style' | 'questions'>('content');

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

        {selectedLayerIds.length > 0 ? (
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
                          <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Input Background</label>
                          <div 
                            onClick={() => setDisplayColorPicker(displayColorPicker === 'formInput' ? false : 'formInput')}
                            style={{
                              padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
                            }}
                          >
                            <span style={{ fontSize: '12px', color: 'var(--text-main)' }}>Sfondo Campi</span>
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
    </div>
  );
};

export default PageSection;
