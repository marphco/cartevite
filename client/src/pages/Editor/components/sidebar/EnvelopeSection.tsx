import React from 'react';
import { Surface, Button } from "../../../../ui";
import { 
  Mail, MailOpen, PaintBucket, ImageIcon, Move
} from "lucide-react";
import CustomColorPicker from "../CustomColorPicker";
import { AVAILABLE_LINERS } from "../EditorHelpers";
import type { CanvasProps } from "../../../../types/editor";

interface EnvelopeSectionProps {
  isEnvelopeOpen: boolean;
  setIsEnvelopeOpen: (open: boolean) => void;
  canvasProps: CanvasProps;
  event: any;
  pushToHistory: () => void;
  updateTheme: (updates: any) => void;
  displayColorPicker: any;
  setDisplayColorPicker: (val: any) => void;
  textureInputRef: React.RefObject<HTMLInputElement | null>;
  handleBackgroundUpload: (file: File, type: 'canvas' | 'liner' | 'scenario') => Promise<void>;
  userLinerImages: string[];
  isEditingLiner: boolean;
  setIsEditingLiner: (editing: boolean) => void;
}

const EnvelopeSection: React.FC<EnvelopeSectionProps> = ({
  isEnvelopeOpen,
  setIsEnvelopeOpen,
  canvasProps,
  event,
  pushToHistory,
  updateTheme,
  displayColorPicker,
  setDisplayColorPicker,
  textureInputRef,
  handleBackgroundUpload,
  userLinerImages,
  isEditingLiner,
  setIsEditingLiner
}) => {
  return (
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
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>INTERNO BUSTA</label>
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
  );
};

export default EnvelopeSection;
