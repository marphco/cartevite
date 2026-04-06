import React from 'react';
import { Surface, Button } from "../../../../ui";
import { 
  Type, Image as ImageIcon, PaintBucket, Move
} from "lucide-react";
import PropertyPanel from "../PropertyPanel";
import CustomColorPicker from "../CustomColorPicker";
import type { Layer, CanvasProps } from "../../../../types/editor";

interface InviteSectionProps {
  slug: string;
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
  setDisplayColorPicker: (val: any) => void;
  addTextLayer: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  canvasProps: CanvasProps;
  setCanvasProps: React.Dispatch<React.SetStateAction<CanvasProps>>;
  invitoBgInputRef: React.RefObject<HTMLInputElement | null>;
  isEditingBackground: boolean;
  setIsEditingBackground: (editing: boolean) => void;
  pushToHistory: () => void;
  handleBackgroundUpload: (file: File, type: 'canvas' | 'liner' | 'scenario') => Promise<void>;
  showVisibility?: boolean;
}

const InviteSection: React.FC<InviteSectionProps> = ({
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
  addTextLayer,
  fileInputRef,
  handleImageUpload,
  canvasProps,
  setCanvasProps,
  invitoBgInputRef,
  isEditingBackground,
  setIsEditingBackground,
  pushToHistory,
  handleBackgroundUpload,
  showVisibility = false
}) => {
  return (
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
        showVisibility={showVisibility}
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

      {/* SFONDO INVITO */}
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
  );
};

export default InviteSection;
