import React from 'react';
import { Surface, Button } from "../../../ui";
import { Type, Image as ImageIcon, AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, Trash2, Plus, Minus, Bold, Italic, Underline, Palette } from "lucide-react";
import CustomColorPicker from "./CustomColorPicker";
import CustomFontSelect from "./CustomFontSelect";
import { decodeHtml, AVAILABLE_FONTS, loadGoogleFont } from "./EditorHelpers";

const PropertyPanel = ({
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
}) => {
  if (!selectedLayer) return null;

  return (
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
                  {(!layer.type || layer.type === 'text') ? (decodeHtml(layer.text.replace(/<[^>]*>/g, '').substring(0, 20)) || "Testo") : "Immagine"}
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

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '8px', opacity: 0.6 }}>ORIZZONTALE</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <Button variant="subtle" title="Sinistra" onClick={() => alignLayers('left', alignmentReference)} style={{ padding: '8px', justifyContent: 'center' }}><AlignHorizontalJustifyStart size={18} /></Button>
                <Button variant="subtle" title="Centro" onClick={() => alignLayers('center-h', alignmentReference)} style={{ padding: '8px', justifyContent: 'center' }}><AlignHorizontalJustifyCenter size={18} /></Button>
                <Button variant="subtle" title="Destra" onClick={() => alignLayers('right', alignmentReference)} style={{ padding: '8px', justifyContent: 'center' }}><AlignHorizontalJustifyEnd size={18} /></Button>
              </div>
            </div>
            
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
         <label style={{marginTop: '1.2rem', marginBottom: '8px', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-soft)'}}>Carattere</label>
         <CustomFontSelect 
           value={selectedLayer.fontFamily || ""} 
           fonts={AVAILABLE_FONTS}
           selectedLayer={selectedLayer}
           onChange={font => {
             updateSelectedLayer({ fontFamily: font });
             loadGoogleFont(font);
           }}
         />

          <div className="prop-row" style={{alignItems: 'center', marginTop: '0.2rem'}}>
            <div className="font-size-stepper" style={{display: 'flex', alignItems: 'center', background: 'var(--surface-light)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden'}}>
              <Button variant="ghost" className="stepper-btn" onClick={() => updateSelectedLayer({fontSize: Math.max(8, (selectedLayer.fontSize || 32) - 1)})}>
                <Minus size={14}/>
              </Button>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px' }}>
                <input 
                  type="text" 
                  value={selectedLayer.fontSize || 32}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                    updateSelectedLayer({fontSize: val});
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    padding: 0
                  }}
                />
              </div>
              <Button variant="ghost" className="stepper-btn" onClick={() => updateSelectedLayer({fontSize: (selectedLayer.fontSize || 32) + 1})}>
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

            <div className="prop-row" style={{alignItems: 'center', marginTop: '1.2rem', marginBottom: '8px'}}>
               <label style={{margin: 0, flex: 1, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-soft)'}}>Colore</label>
               <div 
                 onClick={() => setDisplayColorPicker(displayColorPicker === 'font' ? false : 'font')}
                 style={{
                   padding: 0, 
                   border: '2px solid var(--border)', 
                   background: selectedLayer.color, 
                   width: '28px', 
                   height: '28px', 
                   cursor: 'pointer', 
                   borderRadius: '6px', 
                   overflow: 'hidden'
                 }}
               />
            </div>
            {displayColorPicker === 'font' && (
               <div style={{ marginTop: '12px', width: '100%' }}>
                 <CustomColorPicker 
                   color={selectedLayer.color} 
                   onChange={color => updateSelectedLayer({color})} 
                 />
               </div>
            )}
          <label style={{marginTop: '1.2rem', marginBottom: '8px', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-soft)'}}>Spaziatura Lettere</label>
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

          <label style={{marginTop: '0.5rem', marginBottom: '8px', display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-soft)'}}>Spaziatura Righe</label>
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
  );
};

export default PropertyPanel;
