import { useState, useRef, useEffect } from "react";
import type { Layer, CanvasProps, SelectionBox, SnapGuide } from "../../../types/editor";

interface UseEditorInteractionsProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  canvasProps: CanvasProps;
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  selectedLayerIds: string[];
  setSelectedLayerIds: (ids: string[]) => void;
  editingLayerId: string | null;
  setEditingLayerId: (id: string | null) => void;
  pushToHistory: (state?: any) => void;
  setIsDirty: (val: boolean) => void;
  stateBeforeActionRef: React.RefObject<any>;
  latestStateRef: React.RefObject<any>;
  deleteSelectedLayers: () => void;
  setActiveMobileTab: (tab: string | null) => void;
  stageScaleRef: React.RefObject<number>;
}

declare global {
  interface Window {
    _elementPointers: Map<number, { x: number; y: number }> | null;
  }
}

export function useEditorInteractions({
  canvasRef, canvasProps, layers, setLayers, selectedLayerIds, setSelectedLayerIds,
  editingLayerId, setEditingLayerId, pushToHistory, setIsDirty, stateBeforeActionRef,
  latestStateRef, deleteSelectedLayers, setActiveMobileTab, stageScaleRef
}: UseEditorInteractionsProps) {
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  
  const draggingLayerId = useRef<string | null>(null);
  const resizingLayerId = useRef<string | null>(null);
  const selectionBoxRef = useRef<SelectionBox | null>(null);
  const dragOffset = useRef<Record<string, { startX: number; startY: number; offsetX: number; offsetY: number }>>({});
  const dragGeometries = useRef<{
    active: { w: number; h: number };
    others: Array<{ id: string; centerX: number; centerY: number; left: number; right: number; top: number; bottom: number }>;
    primaryId: string;
  } | null>(null);
  const resizeStart = useRef<{ mouseX: number; mouseY: number; startSize: number; startW: number; startH: number; startWidthAttr: number; startLineHeight: number; startLX: number; startLY: number; position: string }>({ mouseX: 0, mouseY: 0, startSize: 0, startW: 0, startH: 0, startWidthAttr: 0, startLineHeight: 0, startLX: 0, startLY: 0, position: '' });
  const pinchStartRef = useRef<{ initialDist: number; startSize: number | null; startW: number | null; startH: number | null } | null>(null);
  const lastClickRef = useRef({ id: null as string | null, time: 0 });

  const handlePointerDown = (e: React.PointerEvent, layer: Layer) => {
    e.stopPropagation();
    if (e.pointerId) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (!window._elementPointers) window._elementPointers = new Map();
    window._elementPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    let newSelected = [...selectedLayerIds];
    if (e.shiftKey) {
        if (newSelected.includes(layer.id)) newSelected = newSelected.filter(id => id !== layer.id);
        else newSelected.push(layer.id);
    } else {
        if (!newSelected.includes(layer.id)) newSelected = [layer.id];
    }
    setSelectedLayerIds(newSelected);
    
    if (editingLayerId === layer.id && newSelected.length === 1) return; 

    const now = Date.now();
    const isDoubleClick = lastClickRef.current.id === layer.id && (now - lastClickRef.current.time < 300);
    lastClickRef.current = { id: layer.id, time: now };

    if (isDoubleClick && (layer.type === 'text' || !layer.type)) {
      setEditingLayerId(layer.id); draggingLayerId.current = null; return;
    }

    setEditingLayerId(null);
    draggingLayerId.current = layer.id;
    pinchStartRef.current = null;

    if(canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const scale = canvasRect.width / canvasProps.width;
        const mouseX = (e.clientX - canvasRect.left) / scale;
        const mouseY = (e.clientY - canvasRect.top) / scale;
        
        let updatedLayers = [...layers];
        let positionResolved = false;

        newSelected.forEach(id => {
            let l = updatedLayers.find(ll => ll.id === id);
            if (l) {
                let cx = l.x as any, cy = l.y as any;
                let changed = false;
                if (cx === 'center' || isNaN(cx)) { cx = canvasProps.width / 2; changed = true; }
                if (cy === 'center' || isNaN(cy)) { cy = canvasProps.height / 2; changed = true; }
                if (changed) {
                    updatedLayers = updatedLayers.map(ul => ul.id === id ? { ...ul, x: cx, y: cy } : ul);
                    positionResolved = true;
                }
            }
        });
        
        if (positionResolved) setLayers(updatedLayers);
        (stateBeforeActionRef as any).current = latestStateRef.current;

        const offsets: Record<string, any> = {};
        newSelected.forEach(id => {
            const l = updatedLayers.find(ll => ll.id === id);
            if(l) offsets[id] = { startX: l.x, startY: l.y, offsetX: mouseX - (l.x as number), offsetY: mouseY - (l.y as number) };
        });
        dragOffset.current = offsets;

        const activeNode = document.getElementById(`layer-${layer.id}`);
        let activeW = layer.w || 100, activeH = layer.h || 100;
        if (activeNode) { activeW = activeNode.offsetWidth; activeH = activeNode.offsetHeight; }
        
        const others: any[] = [];
        layers.forEach(l => {
            if (!newSelected.includes(l.id)) {
                const n = document.getElementById(`layer-${l.id}`);
                let oW = l.w || 100, oH = l.h || 100;
                if (n) { oW = n.offsetWidth; oH = n.offsetHeight; }
                const oX = typeof l.x === 'number' && !isNaN(l.x) ? l.x : canvasProps.width/2;
                const oY = typeof l.y === 'number' && !isNaN(l.y) ? l.y : canvasProps.height/2;
                others.push({ id: l.id, centerX: oX, centerY: oY, left: oX-oW/2, right: oX+oW/2, top: oY-oH/2, bottom: oY+oH/2 });
            }
        });

        dragGeometries.current = { active: { w: activeW, h: activeH }, others: others, primaryId: layer.id };
    }
  };

  const handleResizePointerDown = (e: React.PointerEvent, layer: Layer, handlePostion: string) => {
    e.stopPropagation();
    setSelectedLayerIds([layer.id]);
    resizingLayerId.current = layer.id;
    if(canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const scale = canvasRect.width / canvasProps.width;
        let currentX = layer.x as any, currentY = layer.y as any;
        if (currentX === 'center' || currentY === 'center') {
            if (currentX === 'center') currentX = canvasProps.width / 2;
            if (currentY === 'center') currentY = canvasProps.height / 2;
            setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, x: currentX, y: currentY } : l));
        }
        resizeStart.current = {
            mouseX: (e.clientX - canvasRect.left) / scale, mouseY: (e.clientY - canvasRect.top) / scale,
            startSize: layer.fontSize || 32, 
            startW: typeof layer.w === 'number' ? layer.w : (document.getElementById(`layer-${layer.id}`)?.offsetWidth || 100),
            startH: typeof layer.h === 'number' ? layer.h : (document.getElementById(`layer-${layer.id}`)?.offsetHeight || 100),
            startWidthAttr: typeof layer.width === 'number' ? layer.width : (document.getElementById(`layer-${layer.id}`)?.offsetWidth || 100),
            startLineHeight: layer.lineHeight || 1.2,
            startLX: (typeof layer.x === 'number' ? layer.x : currentX) as number,
            startLY: (typeof layer.y === 'number' ? layer.y : currentY) as number,
            position: handlePostion
        };
    }
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (window._elementPointers && window._elementPointers.has(e.pointerId)) {
        window._elementPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }
      if (!draggingLayerId.current && !resizingLayerId.current && !selectionBoxRef.current) return;
      if (!canvasRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const scale = canvasRect.width / canvasProps.width;
      const mouseX = (e.clientX - canvasRect.left) / scale, mouseY = (e.clientY - canvasRect.top) / scale;

      if (selectionBoxRef.current) {
          selectionBoxRef.current.currentX = Math.max(0, Math.min(mouseX, canvasProps.width));
          selectionBoxRef.current.currentY = Math.max(0, Math.min(mouseY, canvasProps.height));
          setSelectionBox({ ...selectionBoxRef.current }); return;
      }
      const pointers = window._elementPointers ? Array.from(window._elementPointers.values()) : [];
      if (pointers.length >= 2 && draggingLayerId.current) {
         const p0 = pointers[0]!;
         const p1 = pointers[1]!;
         const dist = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
         if (!pinchStartRef.current) {
            const layer = layers.find(l => l.id === draggingLayerId.current);
            if (layer) pinchStartRef.current = { initialDist: dist, startSize: layer.type === 'text' || !layer.type ? (layer.fontSize || 32) : null, startW: layer.type === 'image' ? (layer.w || 100) : null, startH: layer.type === 'image' ? (layer.h || 100) : null };
            return;
         }
         const scaleFactor = dist / pinchStartRef.current.initialDist;
         setLayers(prev => prev.map(l => {
           if (l.id === draggingLayerId.current) {
               if (!l.type || l.type === 'text') {
                 let newSize = Math.max(12, Math.min((pinchStartRef.current!.startSize || 32) * scaleFactor, 300));
                 return { ...l, fontSize: Math.round(newSize) };
               } else if (l.type === 'image') {
                 let newW = Math.max(20, Math.min((pinchStartRef.current!.startW || 100) * scaleFactor, canvasProps.width * 2));
                 return { ...l, w: Math.round(newW), h: Math.round(newW * ((pinchStartRef.current!.startH || 100) / (pinchStartRef.current!.startW || 100))) };
               }
           }
           return l;
         }));
         setIsDirty(true); return;
      }
      if (resizingLayerId.current) {
         setLayers(prev => prev.map(l => {
           if (l.id === resizingLayerId.current) {
               const deltaX = resizeStart.current.position.includes('W') ? (resizeStart.current.mouseX - mouseX) : (mouseX - resizeStart.current.mouseX);
               if (!l.type || l.type === 'text') {
                 const handle = resizeStart.current.position;
                 
                 // Se stiamo usando le maniglie LATERALI (E, W), ridimensioniamo la LARGHEZZA (Wrapping)
                 if (handle === 'E' || handle === 'W') {
                   const deltaXRaw = mouseX - resizeStart.current.mouseX;
                   let newWidth = resizeStart.current.startWidthAttr;
                   let newX = resizeStart.current.startLX;
                   
                   if (handle === 'E') {
                     newWidth += deltaXRaw;
                     newX += deltaXRaw / 2;
                   } else {
                     newWidth -= deltaXRaw;
                     newX += deltaXRaw / 2;
                   }
                   
                   return { ...l, width: Math.max(40, newWidth), x: newX };
                 }

                 // Se stiamo usando le maniglie VERTICALI (N, S), ridimensioniamo la SPAZIATURA RIGHE (LineHeight)
                  if (handle === 'N' || handle === 'S') {
                    const deltaYRaw = mouseY - resizeStart.current.mouseY;
                    const bLH = resizeStart.current.startLineHeight > 5 ? resizeStart.current.startLineHeight / 100 : resizeStart.current.startLineHeight;
                    const baseLH = Math.max(0.1, bLH);
                    const lDelta = deltaYRaw / (l.fontSize || 32);
                    const finalLH = Math.round(Math.max(0.1, Math.min(3, baseLH + (handle === 'S' ? lDelta : -lDelta))) * 10) / 10;
                    
                    const ratio = finalLH / baseLH;
                    const actualYShift = (resizeStart.current.startH * ratio - resizeStart.current.startH) / 2;
                    
                  }

                 // Se stiamo usando le maniglie ANGOLARI (NW, NE, SW, SE), ridimensionamento PROPORZIONALE (Font + Area)
                 if (['NW', 'NE', 'SW', 'SE'].includes(handle)) {
                    const deltaXRaw = mouseX - resizeStart.current.mouseX;
                    // Calcolo delta X effettivo basato sulla direzione della maniglia
                    const dx = handle.includes('E') ? deltaXRaw : -deltaXRaw;
                    
                    const startW = resizeStart.current.startWidthAttr;
                    const startSize = resizeStart.current.startSize;
                    const startH = resizeStart.current.startH;
                    
                    const newWidth = Math.max(40, startW + dx);
                    const factor = newWidth / startW;
                    const newFontSize = Math.round(startSize * factor);
                    const newHeight = startH * factor;
                    
                    // Ancoraggio: spostiamo il centro per tenere fisso l'angolo opposto
                    const newX = resizeStart.current.startLX + (handle.includes('E') ? 1 : -1) * (newWidth - startW) / 2;
                    const newY = resizeStart.current.startLY + (handle.includes('S') ? 1 : -1) * (newHeight - startH) / 2;
                    
                    return { ...l, fontSize: Math.max(8, newFontSize), width: newWidth, x: newX, y: newY };
                 }
               } else if (l.type === 'image') {
                 let newW = Math.max(20, Math.min(resizeStart.current.startW + deltaX * 2, canvasProps.width));
                 if (resizeStart.current.startW > 0) {
                   const ratio = resizeStart.current.startH / resizeStart.current.startW;
                   let newH = newW * ratio; if (newH > canvasProps.height) { newH = canvasProps.height; newW = newH / ratio; }
                   return { ...l, w: Math.round(newW), h: Math.round(newH) };
                 }
                 return { ...l, w: Math.round(newW), h: Math.round(newW) };
               }
           }
           return l;
         }));
         setIsDirty(true); return;
      }
      if (draggingLayerId.current && dragGeometries.current) {
         setLayers(prev => {
            let draftLayers = [...prev]; const primaryId = dragGeometries.current!.primaryId, primaryLayer = draftLayers.find(l => l.id === primaryId);
            if (!primaryLayer) return draftLayers; const primaryOffset = dragOffset.current[primaryId]; if (!primaryOffset) return draftLayers;
            let nx = mouseX - primaryOffset.offsetX, ny = mouseY - primaryOffset.offsetY;
            const elW = dragGeometries.current!.active.w, elH = dragGeometries.current!.active.h;
            nx = Math.max(elW/2, Math.min(nx, canvasProps.width-elW/2)); ny = Math.max(elH/2, Math.min(ny, canvasProps.height-elH/2));

            const SNAP_THRESHOLD = 5; let newGuides: SnapGuide[] = [], snappedX = false, snappedY = false;
            const activeCenterX = nx, activeCenterY = ny, activeLeft = nx-elW/2, activeRight = nx+elW/2, activeTop = ny-elH/2, activeBottom = ny+elH/2;
            const canvasCenterX = canvasProps.width/2, canvasCenterY = canvasProps.height/2;

            if (Math.abs(activeCenterX - canvasCenterX) < SNAP_THRESHOLD) { nx = canvasCenterX; newGuides.push({ axis: 'x', position: canvasCenterX }); snappedX = true; }
            if (Math.abs(activeCenterY - canvasCenterY) < SNAP_THRESHOLD) { ny = canvasCenterY; newGuides.push({ axis: 'y', position: canvasCenterY }); snappedY = true; }

            dragGeometries.current!.others.forEach(other => {
                if (!snappedX) {
                    if (Math.abs(activeCenterX - other.centerX) < SNAP_THRESHOLD) { nx = other.centerX; newGuides.push({ axis: 'x', position: other.centerX }); snappedX = true; }
                    else if (Math.abs(activeLeft - other.left) < SNAP_THRESHOLD) { nx = other.left + elW/2; newGuides.push({ axis: 'x', position: other.left }); snappedX = true; }
                    else if (Math.abs(activeRight - other.right) < SNAP_THRESHOLD) { nx = other.right - elW/2; newGuides.push({ axis: 'x', position: other.right }); snappedX = true; }
                }
                if (!snappedY) {
                    if (Math.abs(activeCenterY - other.centerY) < SNAP_THRESHOLD) { ny = other.centerY; newGuides.push({ axis: 'y', position: other.centerY }); snappedY = true; }
                    else if (Math.abs(activeTop - other.top) < SNAP_THRESHOLD) { ny = other.top + elH/2; newGuides.push({ axis: 'y', position: other.top }); snappedY = true; }
                    else if (Math.abs(activeBottom - other.bottom) < SNAP_THRESHOLD) { ny = other.bottom - elH / 2; newGuides.push({ axis: 'y', position: other.bottom }); snappedY = true; }
                }
            });
            setSnapGuides(newGuides);
            nx = Math.max(elW/2, Math.min(nx, canvasProps.width-elW/2)); ny = Math.max(elH/2, Math.min(ny, canvasProps.height-elH/2));
            const deltaX = nx - primaryOffset.startX, deltaY = ny - primaryOffset.startY;
            return draftLayers.map(l => {
                const off = dragOffset.current[l.id]; if (off) {
                    let finalX = off.startX + deltaX, finalY = off.startY + deltaY;
                    const node = document.getElementById(`layer-${l.id}`);
                    if (node) { const localW = node.offsetWidth, localH = node.offsetHeight; finalX = Math.max(localW/2, Math.min(finalX, canvasProps.width-localW/2)); finalY = Math.max(localH/2, Math.min(finalY, canvasProps.height-localH/2)); }
                    return { ...l, x: finalX, y: finalY };
                }
                return l;
            });
         });
         setIsDirty(true);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (window._elementPointers) { window._elementPointers.delete(e.pointerId); if (window._elementPointers.size === 0) window._elementPointers = null; }
      try { if (e.pointerId && e.target && (e.target as HTMLElement).hasPointerCapture && (e.target as HTMLElement).hasPointerCapture(e.pointerId)) (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch (err) { console.error("Pointer release error:", err); }

      if (draggingLayerId.current || resizingLayerId.current || selectionBoxRef.current) {
         let shouldPush = false;
         if (draggingLayerId.current || resizingLayerId.current) {
             const before = stateBeforeActionRef.current?.layers || [], current = latestStateRef.current?.layers || []; 
             if (JSON.stringify(before) !== JSON.stringify(current)) shouldPush = true;
         } else if (selectionBoxRef.current) {
             const mxX = Math.max(selectionBoxRef.current.startX, selectionBoxRef.current.currentX), mnX = Math.min(selectionBoxRef.current.startX, selectionBoxRef.current.currentX);
             const mxY = Math.max(selectionBoxRef.current.startY, selectionBoxRef.current.currentY), mnY = Math.min(selectionBoxRef.current.startY, selectionBoxRef.current.currentY);
             if (mxX - mnX > 5 || mxY - mnY > 5) shouldPush = true;
         }
         if (shouldPush && stateBeforeActionRef.current) { pushToHistory(stateBeforeActionRef.current); setIsDirty(true); }
      }
      
      if (selectionBoxRef.current) {
          const mnY = Math.min(selectionBoxRef.current.startY, selectionBoxRef.current.currentY), mxY = Math.max(selectionBoxRef.current.startY, selectionBoxRef.current.currentY);
          const mnX = Math.min(selectionBoxRef.current.startX, selectionBoxRef.current.currentX), mxX = Math.max(selectionBoxRef.current.startX, selectionBoxRef.current.currentX);
          if (mxX - mnX > 5 || mxY - mnY > 5) {
             setLayers(prev => {
                const selectedIds = prev.filter(l => {
                    const node = document.getElementById(`layer-${l.id}`); if (!node) return false;
                    const w = node.offsetWidth, h = node.offsetHeight, lx = typeof l.x === 'number' && !isNaN(l.x as number) ? (l.x as number) : canvasProps.width/2, ly = typeof l.y === 'number' && !isNaN(l.y as number) ? (l.y as number) : canvasProps.height/2;
                    return !(lx + w/2 < mnX || lx - w/2 > mxX || ly + h/2 < mnY || ly - h/2 > mxY);
                }).map(l => l.id);
                setTimeout(() => setSelectedLayerIds(selectedIds), 0); return prev;
             });
          }
          selectionBoxRef.current = null; setSelectionBox(null);
      }
      draggingLayerId.current = null; resizingLayerId.current = null; pinchStartRef.current = null; setSnapGuides([]);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [canvasProps.width, canvasProps.height, pushToHistory, setIsDirty, stateBeforeActionRef, latestStateRef, layers, setLayers, setSelectedLayerIds]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (editingLayerId || target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea' || target.isContentEditable) return;
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedLayerIds.length > 0) {
        e.preventDefault(); deleteSelectedLayers(); return;
      }
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (keys.includes(e.key) && selectedLayerIds.length > 0) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        setLayers(prev => {
          let hasChanges = false;
          const newLayers = prev.map(l => {
            if (selectedLayerIds.includes(l.id)) {
              hasChanges = true;
              let nx = (l.x === 'center' || isNaN(l.x as any)) ? canvasProps.width/2 : (l.x as number);
              let ny = (l.y === 'center' || isNaN(l.y as any)) ? canvasProps.height/2 : (l.y as number);
              if (e.key === 'ArrowUp') ny -= step; if (e.key === 'ArrowDown') ny += step;
              if (e.key === 'ArrowLeft') nx -= step; if (e.key === 'ArrowRight') nx += step;
              return { ...l, x: nx, y: ny };
            }
            return l;
          });
          if (hasChanges) setIsDirty(true);
          return newLayers;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerIds, editingLayerId, canvasProps, deleteSelectedLayers, setIsDirty, setLayers]);

  return {
    selectionBox, setSelectionBox, selectionBoxRef,
    snapGuides, setSnapGuides,
    handlePointerDown, handleResizePointerDown
  };
}
