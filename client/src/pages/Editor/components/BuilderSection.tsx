import React, { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { Block, Layer } from '../../../types/editor';
import SectionToolbar from './SectionToolbar';
import { SectionCanvas } from './SectionCanvas';

interface BuilderSectionProps {
  block: Block;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onHeightChange: (height: number) => void;
  onHeightChangeComplete?: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
  isMobile: boolean;
  onColorChange: (color: string) => void;
  bgColor: string;
  layers: Layer[];
  selectedLayerIds: string[];
  setSelectedLayerIds: (ids: string[]) => void;
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  pushToHistory: () => void;
  setIsDirty: (val: boolean) => void;
  previewMobile: boolean;
  editingLayerId: string | null;
  setEditingLayerId: (id: string | null) => void;
  editorScale: number;
  onMoveLayer?: (layerId: string, direction: 'up' | 'down') => void;
  onDuplicateLayer?: (layerId: string) => void;
  onDeleteLayer?: (layerId: string) => void;
}

const BuilderSection: React.FC<BuilderSectionProps> = ({ 
  block, 
  index, 
  isSelected, 
  onClick, 
  onHeightChange, 
  onHeightChangeComplete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  isFirst,
  isLast,
  isMobile,
  onColorChange,
  bgColor,
  layers,
  selectedLayerIds,
  setSelectedLayerIds,
  setLayers,
  pushToHistory,
  setIsDirty,
  previewMobile,
  editingLayerId,
  setEditingLayerId,
  editorScale,
  onMoveLayer,
  onDuplicateLayer,
  onDeleteLayer
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnchorHovered, setIsAnchorHovered] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId); 
    
    const startY = e.clientY;
    const initHeight = block.height || 400;

    const handleMove = (moveEv: PointerEvent) => {
      const dy = moveEv.clientY - startY;
      // Adattiamo il delta y alla scala per un trascinamento naturale
      onHeightChange(Math.max(100, initHeight + (dy / editorScale)));
    };

    const handleUp = (upEv: PointerEvent) => {
      target.releasePointerCapture(upEv.pointerId);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
      if (onHeightChangeComplete) onHeightChangeComplete();
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
  };

  const currentZIndex = isSelected ? 10 : (isHovered ? 5 : 1);
  
  const LOGICAL_WIDTH = 1000; 
  const currentScale = previewMobile ? 1 : editorScale;
  const scaledHeight = (block.height || 400) * currentScale;

  return (
    <div 
      className={`builder-section-item ${isSelected ? 'selected' : ''}`}
      data-block-id={block.id}
      ref={containerRef}
      onPointerDown={(e) => {
        // FIX SELEZIONE: Se clicchi sul canvas o sulla toolbar, ignora
        if ((e.target as HTMLElement).closest('.section-canvas-container') || 
            (e.target as HTMLElement).closest('.section-floating-toolbar')) {
          return;
        }

        // Chrome Fix: Use onPointerDown for instant selection
        if (!(e.target as HTMLElement).closest('.section-resize-hitbox')) {
           e.stopPropagation(); // Evita deselezione globale
           onClick();
        }
      }}
      style={{
        width: previewMobile ? '100%' : (currentScale * LOGICAL_WIDTH) + 'px', 
        height: (previewMobile ? 'auto' : (scaledHeight + 'px')),
        minHeight: previewMobile ? '200px' : 'auto',
        backgroundColor: bgColor || '#ffffff',
        position: 'relative',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'all 0.2s ease',
        marginTop: index > 0 ? '-2px' : '0px', 
        zIndex: currentZIndex, 
        cursor: 'default',
        overflow: 'visible',
        padding: '0'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* SELECTION OVERLAY - Always visible atop content */}
      {(isSelected || isHovered) && (
        <div style={{
          position: 'absolute',
          inset: 0,
          border: `2px solid var(--accent)`,
          boxShadow: isSelected ? `0 0 0 4px rgba(26, 188, 156, 0.1) inset` : 'none',
          pointerEvents: 'none',
          zIndex: 10,
          borderRadius: 'inherit',
          opacity: isSelected ? 1 : 0.6
        }} />
      )}
      <div 
        className="section-canvas-container"
        onClick={(e) => {
          // GHOST CLICK FIX: Su mobile, il browser emette un 'click' sintetico dopo il tocco.
          // Lo blocchiamo qui per evitare che risalga alla BuilderSection e selezioni la sezione intera.
          if (isMobile) {
            e.stopPropagation();
          }
        }}
        style={!previewMobile ? { 
        width: LOGICAL_WIDTH + 'px', 
        height: (block.height || 400) + 'px', 
        position: 'relative', 
        flexShrink: 0,
        transform: `scale(${currentScale})`, 
        transformOrigin: 'top left', // Crucial: scale from 0,0 to fill the centered parent
        pointerEvents: 'auto',
        zIndex: 1
      } : { 
        width: '100%', 
        maxWidth: '100%',
        height: '100%', 
        position: 'relative',
        zIndex: 1
      }}>
        <SectionCanvas 
          block={block}
          layers={layers
            .filter(l => l.blockId === block.id)
            .sort((a, b) => (a.mobileOrder ?? 0) - (b.mobileOrder ?? 0))
          }
          selectedLayerIds={selectedLayerIds}
          setSelectedLayerIds={setSelectedLayerIds}
          setLayers={setLayers}
          onSelectBlock={onClick}
          pushToHistory={pushToHistory}
          setIsDirty={setIsDirty}
          isMobile={isMobile}
          previewMobile={previewMobile}
          editingLayerId={editingLayerId}
          setEditingLayerId={setEditingLayerId}
          editorScale={editorScale}
          onMoveLayer={onMoveLayer}
        />
      </div>

      {/* Selezione facilitata: un bordino trasparente interno che cattura il clic se non si clicca su un layer */}
      {!previewMobile && isSelected && (
        <div 
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            border: '8px solid transparent',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}

      {/* Toolbar Sezione / Elemento: appare se la sezione è selezionata O se c'è un elemento interno selezionato */}
      {(isSelected || (selectedLayerIds.length > 0 && layers.some(l => selectedLayerIds.includes(l.id) && l.blockId === block.id))) && (
        <>
          {!previewMobile && (
            <div 
              className="section-resize-hitbox"
              onMouseEnter={(e: React.MouseEvent) => { e.stopPropagation(); setIsAnchorHovered(true); }}
              onMouseLeave={(e: React.MouseEvent) => { e.stopPropagation(); setIsAnchorHovered(false); }}
              style={{
                position: 'absolute',
                bottom: '-7px',
                left: '0',
                right: '0',
                height: '14px',
                cursor: 'ns-resize',
                zIndex: 200,
                touchAction: 'none'
              }}
              onPointerDown={handlePointerDown}
            >
              <div 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '48px',
                  height: '6px',
                  backgroundColor: isAnchorHovered ? 'var(--accent)' : '#ffffff',
                  border: `1.5px solid var(--accent)`,
                  borderRadius: '20px',
                  boxShadow: isAnchorHovered ? '0 0 10px rgba(var(--accent-rgb), 0.5)' : '0 2px 8px rgba(0,0,0,0.12)',
                  transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  pointerEvents: 'none' 
                }}
              />
            </div>
          )}
          <SectionToolbar 
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onUpdateBlockProps={(props: any) => {
              if (props.bgColor) onColorChange(props.bgColor);
            }}
            onColorChange={onColorChange}
            bgColor={bgColor}
            isFirst={isFirst}
            isLast={isLast}
            layout={isMobile ? 'horizontal' : 'vertical'}
            previewMobile={previewMobile}
            isMobileDevice={isMobile}
            editingLayerId={editingLayerId}
            selectedLayerId={selectedLayerIds.length === 1 ? selectedLayerIds[0] : null}
            onMoveLayer={onMoveLayer}
            onDuplicateLayer={onDuplicateLayer}
            onDeleteLayer={onDeleteLayer}
            isFirstLayer={(() => {
              if (selectedLayerIds.length !== 1) return false;
              const blockLayers = layers.filter(l => l.blockId === block.id && !l.hiddenMobile);
              const sorted = [...blockLayers].sort((a, b) => (a.mobileOrder ?? 0) - (b.mobileOrder ?? 0));
              return sorted[0]?.id === selectedLayerIds[0];
            })()}
            isLastLayer={(() => {
              if (selectedLayerIds.length !== 1) return false;
              const blockLayers = layers.filter(l => l.blockId === block.id && !l.hiddenMobile);
              const sorted = [...blockLayers].sort((a, b) => (a.mobileOrder ?? 0) - (b.mobileOrder ?? 0));
              return sorted[sorted.length - 1]?.id === selectedLayerIds[0];
            })()}
            contextLabel={(() => {
              if (selectedLayerIds.length === 1) {
                const layer = layers.find(l => l.id === selectedLayerIds[0]);
                if (layer?.type === 'image') return 'Immagine';
                if (layer?.type === 'text' || !layer?.type) return 'Testo';
                return 'Elemento';
              }
              return 'Sezione';
            })()}
          />
        </>
      )}
    </div>
  );
};

export default BuilderSection;
