import { useState, useCallback } from "react";

export function useLayerManager(layers, setLayers, pushToHistory, setIsDirty, canvasProps, setActiveMobileTab) {
  const [selectedLayerIds, setSelectedLayerIds] = useState([]);
  const [editingLayerId, setEditingLayerId] = useState(null);
  const [hoveredLayerId, setHoveredLayerId] = useState(null);
  const [keyLayerId, setKeyLayerId] = useState(null);

  const addLayer = (type, customProps = {}) => {
    pushToHistory();
    const newLayer = {
      id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      type: type || "text",
      x: 'center',
      y: (canvasProps.height || 1000) / 2,
      ...customProps
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerIds([newLayer.id]);
    setIsDirty(true);

    if (window.innerWidth <= 768 && type === 'text') {
      setActiveMobileTab('font');
    }
  };

  const updateSelectedLayer = (updates) => {
    if (selectedLayerIds.length === 0) return;
    
    let currentEditingText = null;
    if (editingLayerId) {
      const el = document.getElementById(`layer-content-${editingLayerId}`);
      if (el) currentEditingText = el.innerHTML;
    }

    pushToHistory();
    setLayers(prev => prev.map(l => {
      if (!selectedLayerIds.includes(l.id)) return l;
      let finalUpdate = { ...l, ...updates };
      if (l.id === editingLayerId && currentEditingText !== null) {
        finalUpdate.text = currentEditingText;
      }
      return finalUpdate;
    }));
    setIsDirty(true);
  };

  const alignLayers = (type, reference = 'canvas', currentScale = 1) => {
    if (selectedLayerIds.length === 0) return;
    pushToHistory();
    
    const canvasWidth = canvasProps.width || 800;
    const canvasHeight = canvasProps.height || 1000;

    let refBounds = null;

    if (reference === 'selection') {
      if (keyLayerId) {
        const el = document.getElementById(`layer-${keyLayerId}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          const parentRect = el.parentElement.getBoundingClientRect();
          refBounds = {
            x: (rect.left - parentRect.left) / currentScale,
            y: (rect.top - parentRect.top) / currentScale,
            w: rect.width / currentScale,
            h: rect.height / currentScale
          };
        }
      } 
      
      if (!refBounds) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        selectedLayerIds.forEach(id => {
          const el = document.getElementById(`layer-${id}`);
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const parentRect = el.parentElement.getBoundingClientRect();
          const lX = (rect.left - parentRect.left) / currentScale, lY = (rect.top - parentRect.top) / currentScale;
          const lW = rect.width / currentScale, lH = rect.height / currentScale;
          if (lX < minX) minX = lX; if (lY < minY) minY = lY;
          if (lX + lW > maxX) maxX = lX + lW; if (lY + lH > maxY) maxY = lY + lH;
        });
        refBounds = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
      }
    }

    setLayers(prev => prev.map(l => {
      if (!selectedLayerIds.includes(l.id)) return l;
      if (reference === 'selection' && keyLayerId && l.id === keyLayerId) return l;
      
      const el = document.getElementById(`layer-${l.id}`);
      if (!el) return l;

      const rect = el.getBoundingClientRect();
      const w = rect.width / currentScale, h = rect.height / currentScale;

      let newX = l.x, newY = l.y;

      if (reference === 'canvas') {
        switch(type) {
          case 'left': newX = w / 2; break;
          case 'center-h': newX = canvasWidth / 2; break;
          case 'right': newX = canvasWidth - (w / 2); break;
          case 'top': newY = h / 2; break;
          case 'center-v': newY = canvasHeight / 2; break;
          case 'bottom': newY = canvasHeight - (h / 2); break;
        }
      } else if (refBounds) {
        switch(type) {
          case 'left': newX = refBounds.x + (w / 2); break;
          case 'center-h': newX = refBounds.x + (refBounds.w / 2); break;
          case 'right': newX = refBounds.x + refBounds.w - (w / 2); break;
          case 'top': newY = refBounds.y + (h / 2); break;
          case 'center-v': newY = refBounds.y + (refBounds.h / 2); break;
          case 'bottom': newY = refBounds.y + refBounds.h - (h / 2); break;
        }
      }
      return { ...l, x: newX, y: newY };
    }));
    setIsDirty(true);
  };

  const deleteSelectedLayers = useCallback(() => {
    if (selectedLayerIds.length === 0) return;
    pushToHistory();
    setLayers(prev => prev.filter(l => !selectedLayerIds.includes(l.id)));
    setSelectedLayerIds([]);
    setEditingLayerId(null);
    setActiveMobileTab(null);
    setIsDirty(true);
  }, [selectedLayerIds, pushToHistory, setIsDirty, setActiveMobileTab, setLayers]);

  return {
    selectedLayerIds, setSelectedLayerIds,
    editingLayerId, setEditingLayerId,
    hoveredLayerId, setHoveredLayerId,
    keyLayerId, setKeyLayerId,
    addLayer, updateSelectedLayer, alignLayers, deleteSelectedLayers
  };
}
