import React from 'react';
import { Sparkles } from "lucide-react";
import EnvelopeAnimation from "../../../components/envelope/EnvelopeAnimation";
import ReadOnlyCanvas from "../../../components/canvas/ReadOnlyCanvas";
import EditableText from "./EditableText";
import EventPageBuilder from "./EventPageBuilder";
import type { Layer, CanvasProps, SelectionBox, SnapGuide, Block } from "../../../types/editor";

interface EditorStageProps {
  stageRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  editorMode: string;
  isMobile: boolean;
  isEditingBackground: boolean;
  canvasProps: CanvasProps;
  setCanvasProps: React.Dispatch<React.SetStateAction<CanvasProps>>;
  stageScale: number;
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  selectedLayerIds: string[];
  setSelectedLayerIds: (ids: string[]) => void;
  editingLayerId: string | null;
  setEditingLayerId: (id: string | null) => void;
  hoveredLayerId: string | null;
  setHoveredLayerId: (id: string | null) => void;
  selectionBox: SelectionBox | null;
  setSelectionBox: (box: SelectionBox | null) => void;
  selectionBoxRef: React.MutableRefObject<SelectionBox | null>;
  setActiveMobileTab: (tab: string | null) => void;
  setDisplayColorPicker: React.Dispatch<React.SetStateAction<'font' | 'bg' | false>>;
  event: any;
  updateTheme: (updates: any) => void;
  isEnvelopeOpen: boolean;
  setIsEnvelopeOpen: (open: boolean) => void;
  envelopeScale: number;
  isEditingLiner: boolean;
  setIsEditingLiner: (editing: boolean) => void;
  scenarioScale: number;
  handlePointerDown: (e: React.PointerEvent, layer: Layer) => void;
  handleResizePointerDown: (e: React.PointerEvent, layer: Layer, handle: string) => void;
  bgNaturalSize: { w: number; h: number };
  setBgNaturalSize: (size: { w: number; h: number }) => void;
  snapGuides: SnapGuide[];
  setSnapGuides: (guides: SnapGuide[]) => void;
  pushToHistory: () => void;
  setIsDirty: (dirty: boolean) => void;
  setIsFontExpanded: (expanded: boolean) => void;
  stateBeforeActionRef: React.MutableRefObject<any>;
  latestStateRef: React.MutableRefObject<any>;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
}

const EditorStage: React.FC<EditorStageProps> = ({
  stageRef,
  canvasRef,
  editorMode,
  isMobile,
  isEditingBackground,
  canvasProps,
  setCanvasProps,
  stageScale,
  layers,
  setLayers,
  selectedLayerIds,
  setSelectedLayerIds,
  editingLayerId,
  setEditingLayerId,
  hoveredLayerId,
  setHoveredLayerId,
  selectionBox,
  setSelectionBox,
  selectionBoxRef,
  setActiveMobileTab,
  setDisplayColorPicker,
  event,
  updateTheme,
  isEnvelopeOpen,
  setIsEnvelopeOpen,
  envelopeScale,
  isEditingLiner,
  setIsEditingLiner,
  scenarioScale,
  handlePointerDown,
  handleResizePointerDown,
  bgNaturalSize,
  setBgNaturalSize,
  snapGuides,
  setSnapGuides,
  pushToHistory,
  setIsDirty,
  setIsFontExpanded,
  stateBeforeActionRef,
  latestStateRef,
  blocks,
  setBlocks
}) => {

  return (
    <div 
      className="editor-canvas-stage" 
      ref={stageRef}
      style={{ 
        transition: 'background 0.3s ease',
        position: 'relative'
      }}
      onPointerDown={(e) => {
         if (window.innerWidth <= 768 || editorMode !== 'canvas' || isEditingBackground) return;
         if ((e.target as HTMLElement).classList.contains('editor-canvas-stage')) {
             setSelectedLayerIds([]);
             setEditingLayerId(null);
             setActiveMobileTab(null);
             setDisplayColorPicker(false);
             setIsFontExpanded(false);

             const canvasElement = canvasRef.current;
             if (!canvasElement) return;

             const canvasRect = canvasElement.getBoundingClientRect();
             const scale = canvasRect.width / canvasProps.width;
             const mx = (e.clientX - canvasRect.left) / scale;
             const my = (e.clientY - canvasRect.top) / scale;
             const box = { startX: mx, startY: my, currentX: mx, currentY: my };
             selectionBoxRef.current = box;
             setSelectionBox(box);
         }
      }}
    >
      {editorMode !== 'event_page' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: event.theme?.heroBgColor || 'var(--bg-body)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />
      )}

      {editorMode !== 'event_page' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: (event.theme?.heroBg && (event.theme.heroBg.startsWith('#') || event.theme.heroBg.startsWith('rgb'))) 
            ? event.theme.heroBg 
            : 'transparent',
          backgroundImage: (event.theme?.heroBg && !event.theme.heroBg.startsWith('#') && !event.theme.heroBg.startsWith('rgb')) 
            ? `url(${event.theme.heroBg})` 
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: event.theme?.heroBgPosition || 'center',
          opacity: (event.theme?.heroBgOpacity ?? 1),
          zIndex: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease'
        }} />
      )}

      {editorMode === 'envelope' ? (
        <div className="envelope-preview-container" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EnvelopeAnimation 
               envelopeFormat={event.theme?.envelopeFormat || 'vertical'}
               envelopeColor={event.theme?.coverBg || '#54392d'}
               linerImg={event.theme?.coverLiner}
               pocketColor={event.theme?.coverPocketColor || event.theme?.coverBg || '#54392d'}
               pocketLinerImg={event.theme?.coverPocketLiner}
               canvasProps={canvasProps}
               editMode={true}
               manualPhase={isEnvelopeOpen ? 'extracted' : 'closed'}
               linerX={event.theme?.linerX || 0}
               linerY={event.theme?.linerY || 0}
               linerScale={event.theme?.linerScale || 1}
               linerOpacity={event.theme?.linerOpacity ?? 1}
               linerColor={event.theme?.coverLinerColor || '#ffffff'}
               isEditingLiner={isEditingLiner}
               scale={isMobile ? envelopeScale : 1}
               onLinerChange={(changes) => {
                 const themeUpdates: any = {};
                 if (changes.x !== undefined) themeUpdates.linerX = changes.x;
                 if (changes.y !== undefined) themeUpdates.linerY = changes.y;
                 if (changes.scale !== undefined) themeUpdates.linerScale = changes.scale;
                 if (changes.opacity !== undefined) themeUpdates.linerOpacity = changes.opacity;
                 if ((changes as any).editMode === false) setIsEditingLiner(false);
                 updateTheme(themeUpdates);
               }}
            >
              <ReadOnlyCanvas layers={layers} canvasProps={canvasProps} />
            </EnvelopeAnimation>
          </div>
        </div>
      ) : editorMode === 'background' ? (
        <div className="scenario-preview-container" style={{ flex: 1, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 0, overflow: 'hidden' }}>
           <div className="scenario-composition" style={{ position: 'relative', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '-60px', transform: `scale(${scenarioScale})`, transformOrigin: 'center center', transition: 'all 0.3s ease' }}>
            <div style={{ position: 'relative', pointerEvents: 'none', zIndex: 10, flexShrink: 0, width: canvasProps.width, height: canvasProps.height, background: canvasProps.bgColor || '#fff', transform: 'scale(0.96)', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', borderRadius: '4px' }}>
              <ReadOnlyCanvas layers={layers} canvasProps={canvasProps} />
            </div>
            {(() => {
              const envFormat = event.theme?.envelopeFormat || 'vertical';
              const baseW = envFormat === 'horizontal' ? 600 : 500;
              const envScenarioScale = (canvasProps.width * 1.02) / baseW;
              return (
                <div style={{ position: 'relative', pointerEvents: 'none', zIndex: 5, flexShrink: 0, transform: `translateX(-25%) translateY(15%)` }}>
                  <EnvelopeAnimation 
                    envelopeFormat={envFormat}
                    envelopeColor={event.theme?.coverBg || '#54392d'}
                    linerImg={event.theme?.coverLiner === 'none' ? null : (event.theme?.coverLiner || null)}
                    pocketColor={event.theme?.coverPocketColor || event.theme?.coverBg || '#54392d'}
                    pocketLinerImg={event.theme?.coverPocketLiner}
                    linerX={event.theme?.linerX || 0}
                    linerY={event.theme?.linerY || 0}
                    linerScale={event.theme?.linerScale || 1}
                    linerOpacity={event.theme?.linerOpacity ?? 1}
                    linerColor={event.theme?.coverLinerColor || '#ffffff'}
                    canvasProps={canvasProps}
                    manualPhase="extracted"
                    preview={true}
                    scale={envScenarioScale}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      ) : editorMode === 'event_page' ? (
        <EventPageBuilder 
          event={event} 
          canvasProps={canvasProps} 
          layers={layers} 
          isMobile={isMobile} 
          scenarioScale={scenarioScale} 
          updateTheme={updateTheme} 
          blocks={blocks || []}
          pushToHistory={pushToHistory}
        />
      ) : (
        <div style={{ 
          width: canvasProps.width * stageScale, 
          height: canvasProps.height * stageScale, 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          {isEditingBackground && window.innerWidth > 768 && (
            <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '10px 20px', borderRadius: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--accent)', pointerEvents: 'auto', whiteSpace: 'nowrap', width: 'max-content', maxWidth: '90vw', justifyContent: 'center' }}>
              <div style={{ background: 'var(--accent)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                 <Sparkles size={18}/>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#000000' }}>Regolazione Sfondo</span>
                <span style={{ fontSize: '10px', color: '#666' }}>Trascina per posizionare • Scali con gli angoli</span>
              </div>
              <div style={{ width: '1px', height: '30px', background: 'rgba(0,0,0,0.1)', margin: '0 5px' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '5px' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#666' }}>Opacità Immagine</span>
                 <input type="range" className="custom-slider" min="0" max="1" step="0.01" value={canvasProps.bgOpacity ?? 1} onChange={(e) => setCanvasProps(prev => ({ ...prev, bgOpacity: parseFloat(e.target.value) }))} onPointerDown={(e) => e.stopPropagation()} style={{ width: '80px', background: `linear-gradient(to right, var(--accent) ${Math.round((canvasProps.bgOpacity ?? 1) * 100)}%, rgba(60, 79, 118, 0.1) ${Math.round((canvasProps.bgOpacity ?? 1) * 100)}%)` } as React.CSSProperties} />
                <span style={{ fontSize: '10px', fontWeight: 700, minWidth: '25px', color: '#000000' }}>{Math.round((canvasProps.bgOpacity ?? 1) * 100)}%</span>
              </div>
            </div>
          )}
          <div className="canvas-scaler" style={{ 
            transform: `scale(${stageScale})`, 
            transformOrigin: 'center center', 
            transition: 'transform 0.2s ease-out', 
            position: 'relative',
            flexShrink: 0
          }}>
            <div ref={canvasRef} className="artboard" style={{ width: canvasProps.width, height: canvasProps.height, backgroundColor: canvasProps.bgColor || '#ffffff', position: 'relative', overflow: isEditingBackground ? 'visible' : 'hidden', zIndex: isEditingBackground ? 50 : 1 }}
              onPointerDown={(e) =>  {
                stateBeforeActionRef.current = latestStateRef.current;
                if (isEditingBackground) {
                  e.stopPropagation();
                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                  if (!(window as any)._bgPointers) (window as any)._bgPointers = new Map();
                  (window as any)._bgPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
                  const initX = canvasProps.bgX || 0;
                  const initY = canvasProps.bgY || 0;
                  const initScale = canvasProps.bgScale || 1;
                  const startX = e.clientX;
                  const startY = e.clientY;
                  let initialDist = 0;
                  const handleMove = (moveEvent: PointerEvent) => {
                     const bgPointers = (window as any)._bgPointers;
                     if (!bgPointers || !bgPointers.has(moveEvent.pointerId)) return;
                     bgPointers.set(moveEvent.pointerId, { x: moveEvent.clientX, y: moveEvent.clientY });
                     const pointers = Array.from(bgPointers.values()) as {x: number, y: number}[];
                     if (pointers.length === 2) {
                        const p0 = pointers[0]; const p1 = pointers[1];
                        if (p0 && p1) {
                          const dist = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
                          if (initialDist === 0) { initialDist = dist; return; }
                          const scaleFactor = dist / initialDist;
                          const newScale = Math.max(0.1, initScale * scaleFactor);
                          setCanvasProps(prev => ({ ...prev, bgScale: newScale }));
                        }
                     } else if (pointers.length === 1 && bgPointers.get(e.pointerId)) {
                        const dx = (moveEvent.clientX - startX) / stageScale;
                        const dy = (moveEvent.clientY - startY) / stageScale;
                        let nx = initX + dx; let ny = initY + dy;
                        const curW = bgNaturalSize.w * (canvasProps.bgScale || 1);
                        const curH = bgNaturalSize.h * (canvasProps.bgScale || 1);
                        const SNAP_THRESHOLD = 15; const newGuides = [];
                        if (Math.abs(nx) < SNAP_THRESHOLD) { nx = 0; newGuides.push({ axis: 'x', position: 0 } as SnapGuide); }
                        else if (Math.abs(nx + curW - canvasProps.width) < SNAP_THRESHOLD) { nx = canvasProps.width - curW; newGuides.push({ axis: 'x', position: canvasProps.width } as SnapGuide); }
                        else if (Math.abs(nx + curW/2 - canvasProps.width/2) < SNAP_THRESHOLD) { nx = (canvasProps.width - curW) / 2; newGuides.push({ axis: 'x', position: canvasProps.width/2 } as SnapGuide); }
                        if (Math.abs(ny) < SNAP_THRESHOLD) { ny = 0; newGuides.push({ axis: 'y', position: 0 } as SnapGuide); }
                        else if (Math.abs(ny + curH - canvasProps.height) < SNAP_THRESHOLD) { ny = canvasProps.height - curH; newGuides.push({ axis: 'y', position: canvasProps.height } as SnapGuide); }
                        else if (Math.abs(ny + curH/2 - canvasProps.height/2) < SNAP_THRESHOLD) { ny = (canvasProps.height - curH) / 2; newGuides.push({ axis: 'y', position: canvasProps.height/2 } as SnapGuide); }
                        setSnapGuides(newGuides); setCanvasProps(prev => ({ ...prev, bgX: nx, bgY: ny }));
                     }
                  };
                  const handleUp = (upEvent: PointerEvent) => {
                     const bgPointers = (window as any)._bgPointers;
                     if (bgPointers) bgPointers.delete(upEvent.pointerId);
                     if (!bgPointers || bgPointers.size === 0) {
                        setSnapGuides([]); window.removeEventListener('pointermove', handleMove as any); window.removeEventListener('pointerup', handleUp as any); window.removeEventListener('pointercancel', handleUp as any); pushToHistory(); setIsDirty(true);
                     }
                  };
                  window.addEventListener('pointermove', handleMove as any); window.addEventListener('pointerup', handleUp as any); window.addEventListener('pointercancel', handleUp as any); return;
                }
                if ((e.target as HTMLElement).closest('.canvas-layer')) return;
                if (editingLayerId) {
                  const el = document.getElementById(`layer-content-${editingLayerId}`);
                  if (el) {
                    const updatedText = el.innerHTML || "Testo Vuoto";
                    setLayers(layers.map(l => l.id === editingLayerId ? { ...l, text: updatedText } : l)); setIsDirty(true);
                  }
                }
                setSelectedLayerIds([]); setEditingLayerId(null); setActiveMobileTab(null); setIsFontExpanded(false);
                if(canvasRef.current && window.innerWidth > 768) {
                    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                    const canvasRect = canvasRef.current.getBoundingClientRect();
                    const scale = canvasRect.width / canvasProps.width;
                    const mx = (e.clientX - canvasRect.left) / scale;
                    const my = (e.clientY - canvasRect.top) / scale;
                    const box = { startX: mx, startY: my, currentX: mx, currentY: my };
                    selectionBoxRef.current = box; setSelectionBox(box);
                    const onPointerMove = (moveEvent: PointerEvent) => {
                        if (!canvasRef.current) return;
                        const cRect = canvasRef.current.getBoundingClientRect();
                        const sc = cRect.width / canvasProps.width;
                        const curX = (moveEvent.clientX - cRect.left) / sc;
                        const curY = (moveEvent.clientY - cRect.top) / sc;
                        if (!selectionBoxRef.current) return;
                        const newBox = { ...selectionBoxRef.current, currentX: curX, currentY: curY };
                        selectionBoxRef.current = newBox; setSelectionBox(newBox);
                    };
                    const onPointerUp = () => {
                        window.removeEventListener('pointermove', onPointerMove as any); window.removeEventListener('pointerup', onPointerUp as any);
                        const finalBox = selectionBoxRef.current;
                        if (finalBox) {
                           const minX = Math.min(finalBox.startX, finalBox.currentX); const maxX = Math.max(finalBox.startX, finalBox.currentX);
                           const minY = Math.min(finalBox.startY, finalBox.currentY); const maxY = Math.max(finalBox.startY, finalBox.currentY);
                           const newlySelected = layers.filter(l => {
                             const el = document.getElementById(`layer-${l.id}`); if (!el) return false;
                             const rect = el.getBoundingClientRect(); const parent = el.parentElement;
                             if (!parent) return false; const parentRect = parent.getBoundingClientRect();
                             const lX = (rect.left - parentRect.left) / scale; const lY = (rect.top - parentRect.top) / scale;
                             return lX >= minX && lX <= maxX && lY >= minY && lY <= maxY;
                           }).map(l => l.id);
                           setSelectedLayerIds(newlySelected);
                        }
                        setSelectionBox(null); selectionBoxRef.current = null;
                    };
                    window.addEventListener('pointermove', onPointerMove as any); window.addEventListener('pointerup', onPointerUp as any);
                }
              }}
            >
              {isEditingBackground && (
                <div style={{ position: 'absolute', inset: 0, border: '2px solid #FF007F', pointerEvents: 'none', zIndex: 10000 }} />
              )}
             {canvasProps.bgImage && (
               <div style={{ position: 'absolute', left: canvasProps.bgX || 0, top: canvasProps.bgY || 0, width: bgNaturalSize.w * (canvasProps.bgScale || 1), height: bgNaturalSize.h * (canvasProps.bgScale || 1), opacity: canvasProps.bgOpacity ?? 1, pointerEvents: 'none', zIndex: 0, touchAction: 'none' }}>
                 <img src={canvasProps.bgImage} alt="Sfondo" style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }} onLoad={(e) => {
                      const target = e.target as HTMLImageElement; setBgNaturalSize({ w: target.naturalWidth, h: target.naturalHeight });
                      if (canvasProps.bgX === undefined || canvasProps.bgY === undefined) {
                        const scale = Math.max(canvasProps.width / target.naturalWidth, canvasProps.height / target.naturalHeight);
                        setCanvasProps(prev => ({ ...prev, bgX: (canvasProps.width - target.naturalWidth * scale) / 2, bgY: (canvasProps.height - target.naturalHeight * scale) / 2, bgScale: scale, bgOpacity: prev.bgOpacity ?? 1 }));
                      }
                  }} />
                 {isEditingBackground && (
                   <>
                     {[ { pos: 'NW', top: -10, left: -10 }, { pos: 'NE', top: -10, right: -10 }, { pos: 'SW', bottom: -10, left: -10 }, { pos: 'SE', bottom: -10, right: -10 } ].map(h => (
                       <div key={h.pos} style={{ position: 'absolute', width: '20px', height: '20px', background: '#fff', border: '2px solid var(--accent)', borderRadius: '50%', cursor: h.pos === 'NW' || h.pos === 'SE' ? 'nwse-resize' : 'nesw-resize', top: h.pos.includes('N') ? h.top : 'auto', bottom: h.pos.includes('S') ? h.bottom : 'auto', left: h.pos.includes('W') ? h.left : 'auto', right: h.pos.includes('E') ? h.right : 'auto', zIndex: 10, pointerEvents: 'auto' }}
                         onPointerDown={(e) => {
                           e.stopPropagation(); const startX = e.clientX; const startY = e.clientY; const initScale = canvasProps.bgScale || 1; const initX = canvasProps.bgX || 0; const initY = canvasProps.bgY || 0; const initW = bgNaturalSize.w * initScale; const initH = bgNaturalSize.h * initScale;
                           const handleResize = (moveEvent: PointerEvent) => {
                             const dx = (moveEvent.clientX - startX) / stageScale; const dy = (moveEvent.clientY - startY) / stageScale;
                             let factor = 1;
                             if (h.pos === 'NW') factor = (dx < 0 || dy < 0) ? Math.max(Math.abs(dx), Math.abs(dy)) : -Math.max(Math.abs(dx), Math.abs(dy));
                             else if (h.pos === 'SE') factor = (dx > 0 || dy > 0) ? Math.max(Math.abs(dx), Math.abs(dy)) : -Math.max(Math.abs(dx), Math.abs(dy));
                             else if (h.pos === 'NE') factor = (dx > 0 || dy < 0) ? Math.max(Math.abs(dx), Math.abs(dy)) : -Math.max(Math.abs(dx), Math.abs(dy));
                             else if (h.pos === 'SW') factor = (dx < 0 || dy > 0) ? Math.max(Math.abs(dx), Math.abs(dy)) : -Math.max(Math.abs(dx), Math.abs(dy));
                              const newScale = Math.max(0.1, initScale + (factor * 0.005)); const newW = bgNaturalSize.w * newScale; const newH = bgNaturalSize.h * newScale;
                              let nx = initX; let ny = initY;
                              if (h.pos === 'NW') { nx = (initX + initW) - newW; ny = (initY + initH) - newH; } else if (h.pos === 'NE') { ny = (initY + initH) - newH; } else if (h.pos === 'SW') { nx = (initX + initW) - newW; }
                              const SNAP_THRESHOLD = 8; const newGuides = []; let finalScale = newScale;
                              const edgeX = (h.pos === 'NW' || h.pos === 'SW') ? nx : nx + newW; const targetX = (h.pos === 'NW' || h.pos === 'SW') ? 0 : canvasProps.width;
                              if (Math.abs(edgeX - targetX) < SNAP_THRESHOLD) { finalScale = (h.pos === 'SE' || h.pos === 'NE') ? (canvasProps.width - nx) / bgNaturalSize.w : (initX + initW) / bgNaturalSize.w; newGuides.push({ axis: 'x', position: targetX } as SnapGuide); }
                              const edgeY = (h.pos === 'NW' || h.pos === 'NE') ? ny : ny + newH; const targetY = (h.pos === 'NW' || h.pos === 'NE') ? 0 : canvasProps.height;
                              if (Math.abs(edgeY - targetY) < SNAP_THRESHOLD) { finalScale = Math.max(finalScale, (h.pos === 'SE' || h.pos === 'SW') ? (canvasProps.height - ny) / bgNaturalSize.h : (initY + initH) / bgNaturalSize.h); newGuides.push({ axis: 'y', position: targetY } as SnapGuide); }
                              if (newGuides.length > 0) {
                                const finalW = bgNaturalSize.w * finalScale; const finalH = bgNaturalSize.h * finalScale;
                                let fnx = nx, fny = ny;
                                if (h.pos === 'NW') { fnx = (initX + initW) - finalW; fny = (initY + initH) - finalH; } else if (h.pos === 'NE') { fnx = nx; fny = (initY + initH) - finalH; } else if (h.pos === 'SW') { fnx = (initX + initW) - finalW; fny = ny; } else if (h.pos === 'SE') { fnx = nx; fny = ny; }
                                setCanvasProps(prev => ({ ...prev, bgScale: finalScale, bgX: fnx, bgY: fny })); setSnapGuides(newGuides); return;
                              }
                              setSnapGuides([]); setCanvasProps(prev => ({ ...prev, bgScale: newScale, bgX: nx, bgY: ny }));
                           };
                           const handleUp = () => { setSnapGuides([]); window.removeEventListener('pointermove', handleResize as any); window.removeEventListener('pointerup', handleUp as any); };
                           window.addEventListener('pointermove', handleResize as any); window.addEventListener('pointerup', handleUp as any);
                         }}
                       />
                     ))}
                   </>
                 )}
               </div>
             )}
             {layers.map((layer) => {
                const isSelected = selectedLayerIds.includes(layer.id); const isEditing = editingLayerId === layer.id; const isHovered = hoveredLayerId === layer.id;
                return (
                 <div key={layer.id} id={`layer-${layer.id}`} className={`canvas-layer ${isSelected ? 'selected' : ''}`}
                   style={{ left: layer.x === 'center' || isNaN(layer.x as number) ? '50%' : (layer.x + 'px'), top: layer.y === 'center' || isNaN(layer.y as number) ? '50%' : (layer.y + 'px'), transform: 'translate(-50%, -50%)', width: 'max-content', fontSize: (layer.fontSize || 32) + 'px', fontFamily: layer.fontFamily, fontWeight: layer.fontWeight || "normal", fontStyle: layer.fontStyle || "normal", textDecoration: layer.textDecoration || "none", letterSpacing: (layer.letterSpacing || 0) + 'px', lineHeight: layer.lineHeight || 1.2, color: layer.color, textAlign: layer.textAlign, zIndex: isSelected ? 10 : 1, padding: '2px 4px', pointerEvents: isEditingBackground ? 'none' : 'auto', userSelect: 'none', touchAction: 'none', opacity: isEditingBackground ? 0.3 : 1, transition: 'opacity 0.3s ease' } as React.CSSProperties}
                   onPointerDown={(e) => !isEditingBackground && handlePointerDown(e, layer)} onClick={(e) => e.stopPropagation()}
                  >
                    {isHovered && <div style={{ position: 'absolute', inset: -4, border: '2px solid #FF007F', pointerEvents: 'none', zIndex: 101, borderRadius: '4px', boxShadow: '0 0 10px rgba(255, 0, 127, 0.3)' }} />}
                   {isSelected && (
                      <>
                        <div className="layer-outline" style={{ border: '1px solid var(--accent)', position: 'absolute', inset: 0, pointerEvents: 'none' }}></div>
                        {['NW', 'NE', 'SW', 'SE'].map(pos => (
                           <div key={pos} onPointerDown={(e) => handleResizePointerDown(e, layer, pos)} style={{ position: 'absolute', width: '10px', height: '10px', background: '#fff', border: '1px solid var(--accent)', borderRadius: '50%', top: pos.includes('N') ? '-5px' : 'auto', bottom: pos.includes('S') ? '-5px' : 'auto', left: pos.includes('W') ? '-5px' : 'auto', right: pos.includes('E') ? '-5px' : 'auto', cursor: pos === 'NW' || pos === 'SE' ? 'nwse-resize' : 'nesw-resize', zIndex: 10 }} />
                        ))}
                      </>
                   )}
                   {(!layer.type || layer.type === 'text') && (
                      <EditableText id={`layer-content-${layer.id}`} className="layer-content" text={layer.text || ""} isEditing={isEditing} onSync={(val) => { setLayers(layers.map(l => l.id === layer.id ? { ...l, text: val } : l)); setIsDirty(true); }} onBlur={(val) => { let updatedText = val; if (!updatedText || updatedText === "<br>") updatedText = "Testo Vuoto"; setLayers(layers.map(l => l.id === layer.id ? { ...l, text: updatedText } : l)); setIsDirty(true); setEditingLayerId(null); }} onFocus={() => pushToHistory()} onDoubleClick={(e) => { e.stopPropagation(); setEditingLayerId(layer.id); }} onPointerDown={(e) => { if (isEditing) e.stopPropagation(); }} style={{ outline: "none", minWidth: "20px", minHeight: "1em", cursor: isEditing ? "text" : (isSelected ? "grab" : "pointer"), pointerEvents: "auto", userSelect: isEditing ? "auto" : "none", whiteSpace: "nowrap", paddingBottom: "0.15em" }} />
                    )}
                   {layer.type === 'image' && (
                     <img src={layer.src} style={{ width: (layer.w || 100) + 'px', height: (layer.h || 100) + 'px', objectFit: 'contain', pointerEvents: 'none', display: 'block', userSelect: 'none', WebkitUserDrag: 'none', opacity: layer.opacity !== undefined ? layer.opacity : 1 } as React.CSSProperties} alt="" draggable="false" />
                   )}
                 </div>
                )
             })}
             {snapGuides.map((guide, i) => {
               if (guide.axis === 'x') return <div key={`gx_${i}`} style={{position: 'absolute', top: 0, bottom: 0, left: guide.position + 'px', width: '1px', background: '#FF007F', zIndex: 99, pointerEvents: 'none'}} />;
               if (guide.axis === 'y') return <div key={`gy_${i}`} style={{position: 'absolute', left: 0, right: 0, top: guide.position + 'px', height: '1px', background: '#FF007F', zIndex: 99, pointerEvents: 'none'}} />;
               return null;
             })}
             {selectionBox && (
               <div style={{ position: 'absolute', left: Math.min(selectionBox.startX, selectionBox.currentX), top: Math.min(selectionBox.startY, selectionBox.currentY), width: Math.abs(selectionBox.currentX - selectionBox.startX), height: Math.abs(selectionBox.currentY - selectionBox.startY), backgroundColor: 'rgba(0, 150, 255, 0.2)', border: '1px solid rgba(0, 150, 255, 0.8)', zIndex: 9999, pointerEvents: 'none' }} />
             )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorStage;
