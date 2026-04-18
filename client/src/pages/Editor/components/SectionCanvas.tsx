import React, { useRef, useState } from 'react';
import type { Layer, CanvasProps, Block, EventTheme } from '../../../types/editor';
import EditableText from './EditableText';
import { sortLayersForMobile } from './EditorHelpers';
import MapWidget from './widgets/MapWidget';
import { RSVPWidget } from './widgets/RSVPWidget';
import GalleryWidget from './widgets/GalleryWidget';
import VideoWidget from './widgets/VideoWidget';
import PaymentWidget from './widgets/PaymentWidget';
import { widgetLayerIdForBlock } from '../../../utils/widgetLayerId';
import { resolveBlockHeight } from '../../../utils/blockHeight';

interface SectionCanvasProps {
  block: Block;
  layers: Layer[];
  selectedLayerIds: string[];
  setSelectedLayerIds: (ids: string[]) => void;
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  pushToHistory: () => void;
  setIsDirty: (val: boolean) => void;
  hoveredLayerId?: string | null | undefined;
  setHoveredLayerId?: ((id: string | null) => void) | undefined;
  onSelectBlock?: (() => void) | undefined;
  isMobile?: boolean | undefined;
  previewMobile?: boolean | undefined;
  editingLayerId: string | null;
  setEditingLayerId: (id: string | null) => void;
  editorScale?: number | undefined;
  onMoveLayer?: ((layerId: string, direction: 'up' | 'down') => void) | undefined;
  onUpdateBlock?: ((blockId: string, updates: Partial<Block>) => void) | undefined;
  theme: EventTheme;
}

export const SectionCanvas: React.FC<SectionCanvasProps> = ({
  block, layers, selectedLayerIds, setSelectedLayerIds, setLayers, pushToHistory, setIsDirty, hoveredLayerId, setHoveredLayerId, onSelectBlock, isMobile, previewMobile, editingLayerId, setEditingLayerId,
  editorScale = 1, onUpdateBlock, theme
}) => {
  const logicalH = resolveBlockHeight(block);
  const blockIdStr = String(block.id || (block as { _id?: string })._id || '');
  /** Selezione widget univoca per blocco (evita highlight su tutti i widget dello stesso tipo). */
  const widgetSelId = blockIdStr ? widgetLayerIdForBlock(blockIdStr) : '';
  const isMobileEffective = isMobile;
  const containerRef = useRef<HTMLDivElement>(null);
  const [snapGuides, setSnapGuides] = useState<{axis: string, position: number}[]>([]);
  const lastClickRef = useRef({ id: null as string | null, time: 0 });

  const handleResizePointerDown = (e: React.PointerEvent, layer: Layer, position: string) => {
    if (previewMobile) return; // Protezione binari: no resize in vista mobile
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    
    setSelectedLayerIds([layer.id]);
    if (onSelectBlock) onSelectBlock();
    
    const startX = e.clientX;
    const startY = e.clientY;
    
    const startFontSize = layer.fontSize || 32;
    const startLineHeight = layer.lineHeight || 1.2;
    const isImage = layer.type === 'image';
    
    // Usiamo il valore salvato se disponibile, altrimenti leggiamo dal DOM
    const domNode = document.getElementById(`layer-${layer.id}`);
    const startW = typeof layer.w === 'number' ? layer.w : (domNode?.offsetWidth || 100);
    const startH = typeof layer.h === 'number' ? layer.h : (domNode?.offsetHeight || 100);
    
    let startXCoord = typeof layer.x === 'number' ? layer.x : (containerRef.current?.clientWidth || 0) / 2;
    let startYCoord = typeof layer.y === 'number' ? layer.y : (containerRef.current?.clientHeight || 0) / 2;

    const handleResizeMove = (moveEv: PointerEvent) => {
      const dx = (moveEv.clientX - startX) / editorScale;
      const dy = (moveEv.clientY - startY) / editorScale;
      
      setLayers(prev => prev.map(l => {
        if (l.id !== layer.id) return l;
        
        // --- GESTIONE ANGOLI (nw, ne, sw, se) --- PROPORZIONALE ---
        if (['nw', 'ne', 'sw', 'se'].includes(position)) {
           const dxActual = position.includes('e') ? dx : -dx;
           const newW = Math.max(40, startW + dxActual);
           const factor = newW / startW;
           
           if (isImage) {
             const newH = startH * factor;
             const newX = startXCoord + (position.includes('e') ? 1 : -1) * (newW - startW) / 2;
             const newY = startYCoord + (position.includes('s') ? 1 : -1) * (newH - startH) / 2;
             return { ...l, w: newW, h: newH, x: newX, y: newY };
           } else {
             const newFontSize = Math.round(startFontSize * factor);
             const newH = startH * factor; // L'altezza reale scala con il box
             const newX = startXCoord + (position.includes('e') ? 1 : -1) * (newW - startW) / 2;
             const newY = startYCoord + (position.includes('s') ? 1 : -1) * (newH - startH) / 2;
             return { ...l, fontSize: Math.max(8, newFontSize), w: newW, x: newX, y: newY };
           }
        }
        
        // --- GESTIONE LATI ORIZZONTALI (e, w) --- WRAPPING ---
        if (position === 'e' || position === 'w') {
           const deltaW = position === 'e' ? dx : -dx;
           const newW = Math.max(50, startW + deltaW);
           const newX = startXCoord + (position === 'e' ? 1 : -1) * (newW - startW) / 2;
           return { ...l, w: newW, x: newX };
        }
        
        // --- GESTIONE LATI VERTICALI (n, s) --- LINE HEIGHT ---
        if (position === 'n' || position === 's') {
           const deltaY = position === 's' ? dy : -dy;
           const rawBaseLH = startLineHeight > 5 ? startLineHeight / 100 : startLineHeight;
           const baseLH = Math.max(0.1, rawBaseLH);
           const finalLH = Math.round(Math.max(0.1, Math.min(3, baseLH + (deltaY / startFontSize))) * 10) / 10;
           
           const ratio = finalLH / baseLH;
           const actualYShift = (startH * ratio - startH) / 2;
           const newY = startYCoord + (position === 's' ? actualYShift : -actualYShift);
           
           return { ...l, lineHeight: finalLH, y: newY };
        }
        
        return l;
      }));
      setIsDirty(true);
    };

    const handleResizeUp = (upEv: PointerEvent) => {
      target.releasePointerCapture(upEv.pointerId);
      window.removeEventListener('pointermove', handleResizeMove);
      window.removeEventListener('pointerup', handleResizeUp);
      // Ripristino scroll
      document.body.style.overflow = '';
      pushToHistory();
    };

    window.addEventListener('pointermove', handleResizeMove);
    window.addEventListener('pointerup', handleResizeUp);
  };

  const handlePointerDown = (e: React.PointerEvent, layer: Layer) => {
    e.stopPropagation(); // BLOCCA SUBITO: impedisce al wrapper di deselezionare
    
    // Gestione manuale doppio clic (PRIMA del return mobile!)
    const now = Date.now();
    const isDoubleClick = lastClickRef.current.id === layer.id && (now - lastClickRef.current.time < 350);
    lastClickRef.current = { id: layer.id, time: now };

    if (isDoubleClick && (layer.type === 'text' || !layer.type)) {
      setEditingLayerId(layer.id);
      return; // Entra in modalità editing e ferma tutto il resto
    }

    if (editingLayerId !== layer.id) {
       setEditingLayerId(null);
    }

    // Desktop Selection Sync: Se siamo su computer e selezioniamo un elemento,
    // selezioniamo automaticamente anche la sezione per mostrare la toolbar a destra.
    if (!previewMobile) {
      if (onSelectBlock) onSelectBlock();
    }

    // Selezione istantanea layer:
    setSelectedLayerIds([layer.id]);

    if (previewMobile) return; // Da qui in poi solo logica DRAG (disabilitata in mobile)
    
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    
    const startX = e.clientX;
    const startY = e.clientY;
    let initialX = typeof layer.x === 'number' && !isNaN(layer.x) ? layer.x : (containerRef.current?.clientWidth || 600) / 2;
    let initialY = typeof layer.y === 'number' && !isNaN(layer.y) ? layer.y : (containerRef.current?.clientHeight || 400) / 2;

    let dx = 0;
    let dy = 0;
    let ghostEl: HTMLElement | null = null;
    const elRect = document.getElementById(`layer-${layer.id}`)?.getBoundingClientRect();

    const handleMove = (moveEv: PointerEvent) => {
      // COMPENSAZIONE DELLA SCALA: Dividiamo il delta per la scala corrente per le coordinate LOGICHE (X, Y)
      const realDx = moveEv.clientX - startX;
      const realDy = moveEv.clientY - startY;
      dx = realDx / editorScale;
      dy = realDy / editorScale;
      
      let nx = initialX + dx;
      let ny = initialY + dy;
      
      const newGuides: {axis: string, position: number}[] = [];
      const SNAP_THRESHOLD = 5;
      
      if (containerRef.current) {
          const cw = containerRef.current.clientWidth;
          const ch = containerRef.current.clientHeight;
          
          const activeNode = document.getElementById(`layer-${layer.id}`);
          const elW = activeNode?.offsetWidth || 100;
          const elH = activeNode?.offsetHeight || 100;

          const activeLeft = nx - elW/2;
          const activeRight = nx + elW/2;
          const activeTop = ny - elH/2;
          const activeBottom = ny + elH/2;

          let snappedX = false;
          let snappedY = false;

          // Snap al Centro Canvas
          if (Math.abs(nx - cw/2) < SNAP_THRESHOLD) { nx = cw/2; newGuides.push({axis: 'x', position: cw/2}); snappedX = true; }
          if (Math.abs(ny - ch/2) < SNAP_THRESHOLD) { ny = ch/2; newGuides.push({axis: 'y', position: ch/2}); snappedY = true; }
          
          layers.forEach(otherL => {
             if (otherL.id === layer.id) return;
             const otherNode = document.getElementById(`layer-${otherL.id}`);
             const oW = otherNode?.offsetWidth || 100;
             const oH = otherNode?.offsetHeight || 100;
             const ox = typeof otherL.x === 'number' ? otherL.x : cw/2;
             const oy = typeof otherL.y === 'number' ? otherL.y : ch/2;
             
             const otherLeft = ox - oW/2;
             const otherRight = ox + oW/2;
             const otherTop = oy - oH/2;
             const otherBottom = oy + oH/2;

             if (!snappedX) {
                if (Math.abs(nx - ox) < SNAP_THRESHOLD) { nx = ox; newGuides.push({axis: 'x', position: ox}); snappedX = true; }
                else if (Math.abs(activeLeft - otherLeft) < SNAP_THRESHOLD) { nx = otherLeft + elW/2; newGuides.push({axis: 'x', position: otherLeft}); snappedX = true; }
                else if (Math.abs(activeRight - otherRight) < SNAP_THRESHOLD) { nx = otherRight - elW/2; newGuides.push({axis: 'x', position: otherRight}); snappedX = true; }
                else if (Math.abs(activeLeft - otherRight) < SNAP_THRESHOLD) { nx = otherRight + elW/2; newGuides.push({axis: 'x', position: otherRight}); snappedX = true; }
                else if (Math.abs(activeRight - otherLeft) < SNAP_THRESHOLD) { nx = otherLeft - elW/2; newGuides.push({axis: 'x', position: otherLeft}); snappedX = true; }
             }

             if (!snappedY) {
                if (Math.abs(ny - oy) < SNAP_THRESHOLD) { ny = oy; newGuides.push({axis: 'y', position: oy}); snappedY = true; }
                else if (Math.abs(activeTop - otherTop) < SNAP_THRESHOLD) { ny = otherTop + elH/2; newGuides.push({axis: 'y', position: otherTop}); snappedY = true; }
                else if (Math.abs(activeBottom - otherBottom) < SNAP_THRESHOLD) { ny = otherBottom - elH/2; newGuides.push({axis: 'y', position: otherBottom}); snappedY = true; }
                else if (Math.abs(activeTop - otherBottom) < SNAP_THRESHOLD) { ny = otherBottom + elH/2; newGuides.push({axis: 'y', position: otherBottom}); snappedY = true; }
                else if (Math.abs(activeBottom - otherTop) < SNAP_THRESHOLD) { ny = otherTop - elH/2; newGuides.push({axis: 'y', position: otherTop}); snappedY = true; }
             }
          });
      }
      setSnapGuides(newGuides);
      
      setLayers(prev => prev.map(l => 
        l.id === layer.id ? { ...l, x: nx, y: ny } : l
      ));
      setIsDirty(true);
      
      if (containerRef.current) {
         const containerRect = containerRef.current.getBoundingClientRect();
         // Check if pointer is outside current canvas
         const isOutside = 
            moveEv.clientY < containerRect.top || moveEv.clientY > containerRect.bottom ||
            moveEv.clientX < containerRect.left || moveEv.clientX > containerRect.right;
            
         if (isOutside) {
            if (!ghostEl && elRect) {
               ghostEl = document.createElement('div');
               ghostEl.style.position = 'fixed';
               ghostEl.style.border = '2px solid var(--accent)';
               ghostEl.style.width = elRect.width + 'px';
               ghostEl.style.height = elRect.height + 'px';
               ghostEl.style.pointerEvents = 'none';
               ghostEl.style.zIndex = '99999';
               ghostEl.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
               ghostEl.style.backdropFilter = 'blur(2px)';
               document.body.appendChild(ghostEl);
            }
            if (ghostEl && elRect) {
               // Per il GHOST visivo (fixed) usiamo lo spostamento REALE (non scalato)
               ghostEl.style.left = (elRect.left + realDx) + 'px';
               ghostEl.style.top = (elRect.top + realDy) + 'px';
            }
         } else {
            if (ghostEl) {
               ghostEl.remove();
               ghostEl = null;
            }
         }
      }
    };

    const handleUp = (upEv: PointerEvent) => {
      target.releasePointerCapture(upEv.pointerId);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      
      // Ripristino scroll
      document.body.style.overflow = '';
      
      if (ghostEl) {
         ghostEl.remove();
         ghostEl = null;
      }
      setSnapGuides([]);
      
      const elements = document.elementsFromPoint(upEv.clientX, upEv.clientY);
      const targetBlockEl = elements.find(el => el.getAttribute('data-block-id'));
      
      if (targetBlockEl && containerRef.current) {
        const newBlockId = targetBlockEl.getAttribute('data-block-id');
        if (newBlockId && newBlockId !== block.id) {
           const oldRect = containerRef.current.getBoundingClientRect();
           const newRect = targetBlockEl.getBoundingClientRect();
           
           // Trova il centro reale in pixel dello schermo
           const vCenterY = oldRect.top + (initialY + dy) * editorScale;
           const vCenterX = oldRect.left + (initialX + dx) * editorScale;
           
           // Converti in coordinate logiche della nuova sezione
           const newY = (vCenterY - newRect.top) / editorScale;
           const newX = (vCenterX - newRect.left) / editorScale;
           
           setLayers(prev => prev.map(l => 
             l.id === layer.id ? { ...l, x: newX, y: newY, blockId: newBlockId } : l
           ));
           
           // Select the new block visually
           (targetBlockEl as HTMLElement).click();
        }
      }

      pushToHistory();
    };

    // Blocco scroll durante il drag
    document.body.style.overflow = 'hidden';
    
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  /**
   * Drag handler generico per i widget posizionati (RSVP, Gallery, Video).
   *
   * Prima esisteva un solo `handleWidgetPointerDown` hard-coded su RSVP
   * (`widget-rsvp` + `formX/formY`). Ora lo stesso comportamento — click-to-select,
   * drag con conversione in coord blocco via `editorScale`, snap sugli assi
   * centrali e sugli altri layer, push history al rilascio — vale per qualsiasi
   * widget posizionato. Ogni widget-type ha le sue chiavi in `widgetProps` per
   * non collidere:
   *  - RSVP      → formX / formY (manteniamo nome storico per retrocompat DB)
   *  - Gallery   → widgetX / widgetY
   *  - Video     → widgetX / widgetY
   */
  const handleWidgetPointerDownGeneric = (
    e: React.PointerEvent,
    config: { widgetId: string; xKey: string; yKey: string; defaultX: number; defaultY: number }
  ) => {
    if (previewMobile) return;
    if (!onUpdateBlock) return;

    e.stopPropagation();
    if (onSelectBlock) onSelectBlock();
    setSelectedLayerIds([config.widgetId]);

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const startX = e.clientX;
    const startY = e.clientY;

    const wp: Record<string, unknown> = (block.widgetProps || {}) as any;
    const rawX = wp[config.xKey];
    const rawY = wp[config.yKey];

    let initialX = typeof rawX === 'number' && !isNaN(rawX) ? rawX : config.defaultX;
    let initialY = typeof rawY === 'number' && !isNaN(rawY) ? rawY : config.defaultY;

    let dx = 0; let dy = 0;

    const handleMove = (moveEv: PointerEvent) => {
      dx = (moveEv.clientX - startX) / editorScale;
      dy = (moveEv.clientY - startY) / editorScale;

      let nx = initialX + dx;
      let ny = initialY + dy;

      const newGuides: { axis: string, position: number }[] = [];
      const SNAP_THRESHOLD = 5;

      if (containerRef.current) {
        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight;

        let snappedX = false;
        let snappedY = false;

        if (Math.abs(nx - cw / 2) < SNAP_THRESHOLD) { nx = cw / 2; newGuides.push({ axis: 'x', position: cw / 2 }); snappedX = true; }
        if (Math.abs(ny - ch / 2) < SNAP_THRESHOLD) { ny = ch / 2; newGuides.push({ axis: 'y', position: ch / 2 }); snappedY = true; }

        layers.forEach(otherL => {
          const ox = typeof otherL.x === 'number' ? otherL.x : cw / 2;
          const oy = typeof otherL.y === 'number' ? otherL.y : ch / 2;

          if (!snappedX && Math.abs(nx - ox) < SNAP_THRESHOLD) { nx = ox; newGuides.push({ axis: 'x', position: ox }); snappedX = true; }
          if (!snappedY && Math.abs(ny - oy) < SNAP_THRESHOLD) { ny = oy; newGuides.push({ axis: 'y', position: oy }); snappedY = true; }
        });
      }

      setSnapGuides(newGuides);
      // Merge con widgetProps esistente: altri settings (es. mapAccentColor,
      // mobileOrder) non vanno persi a ogni drag.
      onUpdateBlock(block.id as string, {
        widgetProps: { ...(block.widgetProps || {}), [config.xKey]: nx, [config.yKey]: ny }
      });
    };

    const handleUp = (upEv: PointerEvent) => {
      target.releasePointerCapture(upEv.pointerId);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      document.body.style.overflow = '';
      setSnapGuides([]);
      pushToHistory();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  // Back-compat: il form RSVP usa ancora la stessa API `onPointerDown={handleWidgetPointerDown}`.
  const handleWidgetPointerDown = (e: React.PointerEvent) => handleWidgetPointerDownGeneric(e, {
    widgetId: widgetSelId,
    xKey: 'formX',
    yKey: 'formY',
    defaultX: 500,
    defaultY: logicalH / 2,
  });

  if (previewMobile) {
    const sortedLayers = sortLayersForMobile(layers);
    return (
      <div 
        className="section-canvas"
        ref={containerRef}
        onPointerDown={(e) => {
          // Se clicchiamo il canvas VUOTO (non un layer), selezioniamo la sezione
          if (e.target === e.currentTarget) {
            if (onSelectBlock) onSelectBlock();
            setSelectedLayerIds([]);
          }
        }}
        style={{ 
          width: '100%', 
          height: 'auto', 
          // Gallery/Video: niente minHeight forzato (block.height default 400 generava
          // barre vuote sotto il widget, mentre il public mobile è già `auto`).
          // Gli altri blocchi mantengono il minHeight per preservare lo spazio del
          // canvas autore (es. RSVP che ha form espandibile, testi liberi che fanno
          // riferimento a coordinate del canvas logico).
          minHeight: (block.type === 'gallery' || block.type === 'video' || block.type === 'payment') ? 'auto' : (logicalH + 'px'), 
          position: 'relative', 
          backgroundColor: (block as any).props?.bgColor || 'transparent',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '30px', 
          padding: '40px 20px',
          boxSizing: 'border-box',
          overflow: 'visible',
          cursor: 'default',
          touchAction: 'pan-y'
        }}
      >
        {/* RENDER LAYERS & WIDGET IN UNICO STREAM (Interscambiabili su mobile con Sposta Su/Giù)
            [FIX visibilità mobile] aggiunto filtro `!hiddenMobile` sui layer: prima
            mancava del tutto nel ramo mobile (il flag veniva salvato ma ignorato). */}
        {(() => {
          // Id widget = `widget-<blockId>` (univoco per blocco). Prima era `widget-rsvp`
          // ecc. → due RSVP selezionavano entrambi.
          const widgetId =
            block.type === 'rsvp' || block.type === 'gallery' || block.type === 'video'
            || block.type === 'payment' || block.type === 'map'
              ? widgetSelId
              : null;

          const blockLayers = sortedLayers
            .filter(layer => layer.blockId === block.id && !layer.hiddenMobile)
            .map(l => ({ ...l, isWidget: false }));

          const widgetItem = widgetId ? {
            isWidget: true,
            id: widgetId,
            mobileOrder: block.widgetProps?.mobileOrder ?? 5 // Valore default intermedio
          } : null;

          const allItems = [...blockLayers, widgetItem]
            .filter(Boolean)
            .sort((a, b) => (a!.mobileOrder ?? 0) - (b!.mobileOrder ?? 0));

          return allItems.map(item => {
            if (item!.isWidget) {
              const isSelected = widgetId ? selectedLayerIds.includes(widgetId) : false;
              return (
                <div
                  key={item!.id}
                  style={{
                    pointerEvents: 'auto',
                    position: 'relative',
                    zIndex: 0,
                    cursor: 'pointer',
                    border: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
                    borderRadius: '16px',
                    transition: 'border-color 0.2s'
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    // Tutti i widget con widgetId (rsvp/gallery/video) espongono un
                    // "widget-layer" selezionabile: mettendolo in selectedLayerIds la
                    // sidebar mostra i controlli contestuali e la toolbar mobile
                    // attiva SPOSTA SU/GIÙ coerentemente. La mappa invece non ha
                    // widget-layer (resta fill-parent, selezionare il blocco basta).
                    if (widgetId) {
                      setSelectedLayerIds([widgetId]);
                    } else {
                      setSelectedLayerIds([]);
                    }
                    if (onSelectBlock) onSelectBlock();
                  }}
                >
                  <div style={{ pointerEvents: 'none' }}>
                    {block.type === 'map' && (
                      <MapWidget
                        address={block.props?.address}
                        title={block.props?.title}
                        zoom={block.props?.zoom}
                        sectionBg={block.props?.bgColor || block.bgColor}
                        accentColor={block.widgetProps?.mapAccentColor || theme?.accent}
                        previewMobile={previewMobile}
                      />
                    )}
                    {block.type === 'rsvp' && (
                      <RSVPWidget
                        block={block}
                        readOnly={true}
                        isMobile={previewMobile}
                        sectionBg={block.props?.bgColor || block.bgColor || 'transparent'}
                      />
                    )}
                    {block.type === 'gallery' && (
                      <GalleryWidget
                        title={block.props?.title}
                        images={block.props?.images || []}
                        layout={block.props?.layout || 'masonry'}
                        gap={block.props?.gap ?? 12}
                        columns={block.props?.columns ?? 3}
                        accentColor={theme?.accent}
                        sectionBg={block.props?.bgColor || block.bgColor}
                        previewMobile={previewMobile}
                        readOnly={true}
                      />
                    )}
                    {block.type === 'video' && (
                      <VideoWidget
                        title={block.props?.title}
                        videoUrl={block.props?.videoUrl}
                        autoplay={block.props?.autoplay}
                        loop={block.props?.loop}
                        controls={block.props?.controls !== false}
                        muted={block.props?.muted !== false}
                        accentColor={theme?.accent}
                        sectionBg={block.props?.bgColor || block.bgColor}
                        previewMobile={previewMobile}
                        readOnly={true}
                      />
                    )}
                    {block.type === 'payment' && (
                      <PaymentWidget
                        title={block.widgetProps?.paymentTitle}
                        description={block.widgetProps?.paymentDescription}
                        presetAmounts={block.widgetProps?.paymentPresetAmounts}
                        minAmount={block.widgetProps?.paymentMinAmount}
                        maxAmount={block.widgetProps?.paymentMaxAmount}
                        targetAmount={block.widgetProps?.paymentTargetAmount}
                        showProgress={block.widgetProps?.paymentShowProgress}
                        accentColor={block.widgetProps?.paymentAccentColor || theme?.accent}
                        mode={block.widgetProps?.paymentMode}
                        ctaLabel={block.widgetProps?.paymentCtaLabel}
                        allowCustomAmount={block.widgetProps?.paymentAllowCustomAmount !== false}
                        sectionBg={block.props?.bgColor || block.bgColor}
                        previewMobile={previewMobile}
                        readOnly={true}
                      />
                    )}
                  </div>
                </div>
              );
            }

            const layer = item as typeof layers[0];
            const isSelected = selectedLayerIds.includes(layer.id);
            const isText = layer.type === 'text' || !layer.type;
            
            return (
              <div 
                key={layer.id}
                id={`layer-${layer.id}`}
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '600px', // Limite ragionevole per non spanciare su tablet in verticale
                  margin: '0 auto',
                  fontSize: Math.round((layer.fontSize || 24) * 1.25) + 'px', // Ingrandimento testi Canva-style
                  fontFamily: layer.fontFamily,
                  fontWeight: layer.fontWeight || "normal",
                  fontStyle: layer.fontStyle || "normal",
                  textDecoration: layer.textDecoration || "none",
                  letterSpacing: (layer.letterSpacing || 0) + 'px',
                  lineHeight: (layer.lineHeight || 1.3) > 5 ? (layer.lineHeight! / 100) : (layer.lineHeight || 1.3),
                  color: layer.color,
                  textAlign: layer.textAlign || 'center',
                  zIndex: isSelected ? 10 : layer.z || 1,
                  opacity: layer.opacity !== undefined ? layer.opacity : 1,
                  border: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
                  borderRadius: '4px',
                  padding: '4px',
                  touchAction: previewMobile ? 'pan-y' : 'none'
                }}
                onPointerDown={(e) => handlePointerDown(e, layer)}
              >
                {isText ? (
                  <EditableText
                    id={`layer-content-${layer.id}`}
                    className="layer-content"
                    text={layer.text || ""}
                    isEditing={editingLayerId === layer.id}
                    onSync={(newHtml) => {
                      setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, text: newHtml } : l));
                      setIsDirty(true);
                    }}
                    onBlur={(newHtml) => {
                      pushToHistory();
                    }}
                    onFocus={() => {
                      setEditingLayerId(layer.id);
                      setSelectedLayerIds([layer.id]);
                    }}
                  />
                ) : (
                  <img 
                    src={layer.src} 
                    alt="" 
                    style={{ 
                      width: '100%', 
                      height: 'auto', 
                      display: 'block', 
                      objectFit: 'contain',
                      borderRadius: '8px' // Un tocco più moderno per le immagini a tutto schermo
                    }} 
                  />
                )}
              </div>
            );
          });
        })()}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'visible' }} onPointerDown={(e) => {
      // Chrome Fix: Use onPointerDown for instant selection/deselection
      if (e.target === e.currentTarget) {
        e.stopPropagation();
        setSelectedLayerIds([]);
        if (onSelectBlock) onSelectBlock();
      }
    }}>
      {/* Mappa resta fill-parent: non è un "oggetto mobile" come form/gallery/video,
          è un layer informativo che accompagna l'evento (indirizzo + pin). Avrebbe
          poco senso poterla trascinare a caso nella sezione; se serve riposizionarla
          si sposta il blocco intero. */}
      {block.type === 'map' && (
        <div style={{ pointerEvents: 'none', width: '100%', height: '100%', display: 'flex', alignItems: 'flex-start' }}>
          <MapWidget
            address={block.props?.address}
            title={block.props?.title}
            zoom={block.props?.zoom}
            sectionBg={block.props?.bgColor || block.bgColor}
            accentColor={block.widgetProps?.mapAccentColor || theme?.accent}
            previewMobile={false}
          />
        </div>
      )}

      {/* Galleria e Video come "oggetti posizionabili" — stesso pattern RSVP:
          position absolute + translate(-50%, -50%), rettangolo di selezione accent
          quando selezionati, drag handler che scrive in `widgetProps.widgetX/Y` e
          pubblica le stesse guide di snap del form. Serve per poter mettere
          testi/layers intorno al widget (es. titoli, didascalie) senza che il
          widget occupi tutto lo spazio. */}
      {block.type === 'gallery' && (() => {
        const wx = typeof block.widgetProps?.widgetX === 'number' && !isNaN(block.widgetProps.widgetX)
          ? (block.widgetProps.widgetX as number) + 'px' : '50%';
        const wy = typeof block.widgetProps?.widgetY === 'number' && !isNaN(block.widgetProps.widgetY)
          ? (block.widgetProps.widgetY as number) + 'px' : '50%';
        return (
          <div
            style={{
              position: 'absolute',
              top: wy,
              left: wx,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
              cursor: 'grab',
              touchAction: 'none',
              zIndex: 5,
              // Width concreta invece di `max-content`: i widget interni
              // (Gallery empty state, Video) usano `paddingTop: 56.25%` per
              // l'aspect ratio 16:9 — calcolato sulla width del parent. Con
              // `max-content` il parent collassa a 0 e il video sparisce.
              // Usiamo il maxWidth interno del widget (900px) + respiro ai lati.
              width: 'min(940px, calc(100% - 40px))'
            }}
            onPointerDown={(e) => handleWidgetPointerDownGeneric(e, {
              widgetId: widgetSelId, xKey: 'widgetX', yKey: 'widgetY',
              defaultX: (containerRef.current?.clientWidth || 1000) / 2,
              defaultY: logicalH / 2,
            })}
          >
            {selectedLayerIds.includes(widgetSelId) && (
              <div style={{
                position: 'absolute',
                top: -8, bottom: -8, left: -8, right: -8,
                border: '2px solid var(--accent)',
                borderRadius: '12px',
                pointerEvents: 'none',
                zIndex: 100
              }} />
            )}
            <div style={{ pointerEvents: 'none', width: '100%' }}>
              <GalleryWidget
                title={block.props?.title}
                images={block.props?.images || []}
                layout={block.props?.layout || 'masonry'}
                gap={block.props?.gap ?? 12}
                columns={block.props?.columns ?? 3}
                accentColor={theme?.accent}
                sectionBg={block.props?.bgColor || block.bgColor}
                previewMobile={false}
                readOnly={true}
              />
            </div>
          </div>
        );
      })()}

      {block.type === 'video' && (() => {
        const wx = typeof block.widgetProps?.widgetX === 'number' && !isNaN(block.widgetProps.widgetX)
          ? (block.widgetProps.widgetX as number) + 'px' : '50%';
        const wy = typeof block.widgetProps?.widgetY === 'number' && !isNaN(block.widgetProps.widgetY)
          ? (block.widgetProps.widgetY as number) + 'px' : '50%';
        return (
          <div
            style={{
              position: 'absolute',
              top: wy,
              left: wx,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
              cursor: 'grab',
              touchAction: 'none',
              zIndex: 5,
              // Vedi nota width su widget-gallery: `paddingTop: 56.25%` del
              // VideoWidget richiede width concreta del parent, non `max-content`.
              width: 'min(940px, calc(100% - 40px))'
            }}
            onPointerDown={(e) => handleWidgetPointerDownGeneric(e, {
              widgetId: widgetSelId, xKey: 'widgetX', yKey: 'widgetY',
              defaultX: (containerRef.current?.clientWidth || 1000) / 2,
              defaultY: logicalH / 2,
            })}
          >
            {selectedLayerIds.includes(widgetSelId) && (
              <div style={{
                position: 'absolute',
                top: -8, bottom: -8, left: -8, right: -8,
                border: '2px solid var(--accent)',
                borderRadius: '12px',
                pointerEvents: 'none',
                zIndex: 100
              }} />
            )}
            <div style={{ pointerEvents: 'none', width: '100%' }}>
              <VideoWidget
                title={block.props?.title}
                videoUrl={block.props?.videoUrl}
                autoplay={block.props?.autoplay}
                loop={block.props?.loop}
                controls={block.props?.controls !== false}
                muted={block.props?.muted !== false}
                accentColor={theme?.accent}
                sectionBg={block.props?.bgColor || block.bgColor}
                previewMobile={false}
                readOnly={true}
              />
            </div>
          </div>
        );
      })()}
      {block.type === 'payment' && (() => {
        const wx = typeof block.widgetProps?.widgetX === 'number' && !isNaN(block.widgetProps.widgetX)
          ? (block.widgetProps.widgetX as number) + 'px' : '50%';
        const wy = typeof block.widgetProps?.widgetY === 'number' && !isNaN(block.widgetProps.widgetY)
          ? (block.widgetProps.widgetY as number) + 'px' : '50%';
        return (
          <div
            style={{
              position: 'absolute',
              top: wy,
              left: wx,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
              cursor: 'grab',
              touchAction: 'none',
              zIndex: 5,
              width: 'min(620px, calc(100% - 40px))'
            }}
            onPointerDown={(e) => handleWidgetPointerDownGeneric(e, {
              widgetId: widgetSelId, xKey: 'widgetX', yKey: 'widgetY',
              defaultX: (containerRef.current?.clientWidth || 1000) / 2,
              defaultY: logicalH / 2,
            })}
          >
            {selectedLayerIds.includes(widgetSelId) && (
              <div style={{
                position: 'absolute',
                top: -8, bottom: -8, left: -8, right: -8,
                border: '2px solid var(--accent)',
                borderRadius: '16px',
                pointerEvents: 'none',
                zIndex: 100
              }} />
            )}
            <div style={{ pointerEvents: 'none', width: '100%' }}>
              <PaymentWidget
                title={block.widgetProps?.paymentTitle}
                description={block.widgetProps?.paymentDescription}
                presetAmounts={block.widgetProps?.paymentPresetAmounts}
                minAmount={block.widgetProps?.paymentMinAmount}
                maxAmount={block.widgetProps?.paymentMaxAmount}
                targetAmount={block.widgetProps?.paymentTargetAmount}
                showProgress={block.widgetProps?.paymentShowProgress}
                accentColor={block.widgetProps?.paymentAccentColor || theme?.accent}
                mode={block.widgetProps?.paymentMode}
                ctaLabel={block.widgetProps?.paymentCtaLabel}
                allowCustomAmount={block.widgetProps?.paymentAllowCustomAmount !== false}
                sectionBg={block.props?.bgColor || block.bgColor}
                previewMobile={false}
                readOnly={true}
              />
            </div>
          </div>
        );
      })()}

      {block.type === 'rsvp' && (
        <div 
          style={{ 
            position: 'absolute',
            top: typeof block.widgetProps?.formY === 'number' && !isNaN(block.widgetProps.formY) ? block.widgetProps.formY + 'px' : '50%',
            left: typeof block.widgetProps?.formX === 'number' && !isNaN(block.widgetProps.formX) ? block.widgetProps.formX + 'px' : '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'auto', 
            cursor: 'grab',
            touchAction: 'none',
            zIndex: 5,
            width: 'max-content'
          }}
          onPointerDown={handleWidgetPointerDown}
        >
          {selectedLayerIds.includes(widgetSelId) && (
            <div style={{
              position: 'absolute',
              top: -8, bottom: -8, left: -8, right: -8,
              border: '2px solid var(--accent)',
              borderRadius: '12px',
              pointerEvents: 'none',
              zIndex: 100
            }} />
          )}
          <div style={{ pointerEvents: 'none', width: '100%' }}>
            <RSVPWidget 
              block={block} 
              readOnly={true}
              isMobile={false}
              theme={theme}
              sectionBg={block.props?.bgColor || block.bgColor || 'transparent'}
            />
          </div>
        </div>
      )}

      {/* Questo branch è raggiunto **solo** in preview desktop dell'editor (il ramo
          mobile fa early-return più in alto). Quindi filtriamo solo `hiddenDesktop`;
          la versione precedente aveva un `if (previewMobile)` che era codice morto. */}
      {layers
        .filter(layer => {
          if (layer.hiddenDesktop) return false;
          const bId = block.id || block._id;
          if (!layer.blockId) {
            if (bId) return false;
            if (block.type !== 'canvas') return false;
          } else {
            if (layer.blockId !== bId) return false;
          }
          return true;
        })
        .map(layer => {
          const isSelected = selectedLayerIds.includes(layer.id);
          const isText = layer.type === 'text' || !layer.type;
          const lx = typeof layer.x === 'number' ? layer.x + 'px' : '50%';
          const ly = typeof layer.y === 'number' ? layer.y + 'px' : '50%';
  
          return (
            <div 
              key={layer.id}
              id={`layer-${layer.id}`}
              style={{
                position: 'absolute',
                left: lx,
                top: ly,
                transform: 'translate(-50%, -50%)',
                width: layer.w ? layer.w + 'px' : 'max-content',
                fontSize: (layer.fontSize || 32) + 'px',
                fontFamily: layer.fontFamily,
                fontWeight: layer.fontWeight || "normal",
                fontStyle: layer.fontStyle || "normal",
                textDecoration: layer.textDecoration || "none",
                letterSpacing: (layer.letterSpacing || 0) + 'px',
                lineHeight: (layer.lineHeight || 1.2) > 5 ? (layer.lineHeight! / 100) : (layer.lineHeight || 1.2),
                color: layer.color,
                textAlign: layer.textAlign,
                zIndex: hoveredLayerId === layer.id ? 1000 : (isSelected ? 10 : layer.z || 1),
                padding: '2px 4px',
                opacity: layer.opacity !== undefined ? layer.opacity : 1,
                userSelect: editingLayerId === layer.id ? 'auto' : 'none',
                touchAction: 'none'
              }}
              onPointerDown={(e) => {
                // Chrome Fix: instant selection
                handlePointerDown(e, layer);
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={() => setHoveredLayerId && setHoveredLayerId(layer.id)}
              onMouseLeave={() => setHoveredLayerId && setHoveredLayerId(null)}
            >
              {hoveredLayerId === layer.id && <div className="layer-hover-outline" />}
              
              {isText ? (
                <EditableText
                  id={`layer-content-${layer.id}`}
                  className="layer-content"
                  text={layer.text || ""}
                  isEditing={editingLayerId === layer.id}
                  onSync={(val) => {
                    setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, text: val } : l));
                    setIsDirty(true);
                  }}
                  onBlur={(val) => {
                    let updatedText = val;
                    if (!updatedText || updatedText === "<br>") updatedText = "Testo Vuoto";
                    setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, text: updatedText } : l));
                    setIsDirty(true);
                    setEditingLayerId(null);
                  }}
                  onFocus={() => pushToHistory()}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingLayerId(layer.id);
                  }}
                  onPointerDown={(e) => {
                    if (editingLayerId === layer.id) e.stopPropagation();
                  }}
                  style={{
                    outline: "none",
                    minWidth: "20px",
                    minHeight: "1em",
                    cursor: editingLayerId === layer.id ? "text" : (isSelected ? "grab" : "pointer"),
                    userSelect: editingLayerId === layer.id ? "auto" : "none",
                    whiteSpace: "pre-wrap",
                    width: '100%',
                    wordBreak: 'break-word',
                    paddingBottom: "0.15em",
                    padding: "8px"
                  }}
                />
              ) : (
                <img src={layer.src} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} alt="" />
              )}
              
              {isSelected && (
                 <>
                   <div className="layer-outline" style={{ 
                      border: '1.5px solid var(--accent)', 
                      position: 'absolute', 
                      inset: '-4px', 
                      pointerEvents: 'none',
                      borderRadius: '4px',
                      boxShadow: '0 0 10px rgba(var(--accent-rgb), 0.2)'
                   }}></div>
                   
                   {/* Maniglie Angolari */}
                   {['NW', 'NE', 'SW', 'SE'].map(pos => (
                      <div 
                        key={pos} 
                        onPointerDown={(e) => handleResizePointerDown(e, layer, pos.toLowerCase())} 
                        className={isMobileEffective ? `mobile-handle-corner ${pos.toLowerCase()}` : ""}
                        style={!isMobileEffective ? { 
                          position: 'absolute', 
                          width: '12px', 
                          height: '12px', 
                          background: '#fff', 
                          border: '1.5px solid var(--accent)', 
                          borderRadius: '50%', 
                          top: pos.includes('N') ? '-10px' : 'auto', 
                          bottom: pos.includes('S') ? '-10px' : 'auto', 
                          left: pos.includes('W') ? '-10px' : 'auto', 
                          right: pos.includes('E') ? '-10px' : 'auto', 
                          cursor: pos === 'NW' || pos === 'SE' ? 'nwse-resize' : 'nesw-resize', 
                          zIndex: 10,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        } : {}} 
                      />
                   ))}
  
                    {/* Maniglie Laterali e Verticali (Pillole o Barre a sbalzo) */}
                    {isText && ["E", "W", "N", "S"].map(pos => (
                       <div 
                         key={pos} 
                         onPointerDown={(e) => handleResizePointerDown(e, layer, pos.toLowerCase())} 
                         className={isMobileEffective ? `mobile-handle-side ${pos === 'E' || pos === 'W' ? 'v' : 'h'} ${pos.toLowerCase()}` : ""}
                         style={!isMobileEffective ? { 
                           position: "absolute", 
                           width: (pos === "E" || pos === "W") ? "6px" : "18px", 
                           height: (pos === "E" || pos === "W") ? "18px" : "6px", 
                           background: "#fff", 
                           border: "1.5px solid var(--accent)", 
                           borderRadius: "10px", 
                           top: pos === "N" ? "-7px" : (pos === "S" ? "auto" : "50%"),
                           bottom: pos === "S" ? "-7px" : "auto",
                           left: pos === "W" ? "-7px" : (pos === "E" ? "auto" : "50%"),
                           right: pos === "E" ? "-7px" : "auto",
                           transform: (pos === "E" || pos === "W") ? "translateY(-50%)" : "translateX(-50%)",
                           cursor: (pos === "E" || pos === "W") ? "ew-resize" : "ns-resize", 
                           zIndex: 10,
                           boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                           pointerEvents: "auto"
                         } : {}} 
                       />
                    ))}
                 </>
              )}
            </div>
            );
        })
      }
      {/* Snap Guides */}
      {snapGuides.map((guide, i) => {
        if (guide.axis === 'x') return <div key={`gx_${i}`} style={{position: 'absolute', top: 0, bottom: 0, left: guide.position + 'px', width: '1px', background: '#FF007F', zIndex: 99, pointerEvents: 'none'}} />;
        if (guide.axis === 'y') return <div key={`gy_${i}`} style={{position: 'absolute', left: 0, right: 0, top: guide.position + 'px', height: '1px', background: '#FF007F', zIndex: 99, pointerEvents: 'none'}} />;
        return null;
      })}
    </div>
  );
};
