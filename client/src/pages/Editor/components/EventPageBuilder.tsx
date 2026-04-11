import React, { useRef, useState } from 'react';
import EnvelopeAnimation from "../../../components/envelope/EnvelopeAnimation";
import ReadOnlyCanvas from "../../../components/canvas/ReadOnlyCanvas";
import BuilderSection from "./BuilderSection";
import { ScrollHint } from "../../../components/ui/ScrollHint";
import { sortLayersForMobile } from './EditorHelpers';
import type { Layer, CanvasProps, Block } from "../../../types/editor";

interface EventPageBuilderProps {
  event: any;
  canvasProps: CanvasProps;
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  selectedLayerIds: string[];
  setSelectedLayerIds: (ids: string[]) => void;
  isMobile: boolean;
  scenarioScale: number;
  updateTheme: (updates: any, pushToHistory?: () => void) => void;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  selectedBlockId: string | null;
  setSelectedBlockId: React.Dispatch<React.SetStateAction<string | null>>;
  pushToHistory: () => void;
  setIsDirty: (val: boolean) => void;
  previewMobile: boolean;
  editingLayerId: string | null;
  setEditingLayerId: (id: string | null) => void;
  onUpdateBlock?: ((blockId: string, updates: Partial<Block>) => void) | undefined;
}

export function EventPageBuilder({
  event,
  canvasProps,
  layers,
  setLayers,
  selectedLayerIds,
  setSelectedLayerIds,
  isMobile,
  scenarioScale,
  updateTheme,
  blocks,
  setBlocks,
  selectedBlockId,
  setSelectedBlockId,
  pushToHistory,
  setIsDirty,
  previewMobile,
  editingLayerId,
  setEditingLayerId,
  onUpdateBlock
}: EventPageBuilderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInvitationOpened, setIsInvitationOpened] = useState(false);
  const [editorScale, setEditorScale] = useState(1);
  const LOGICAL_WIDTH = 1000;
  const MAX_CANVA_WIDTH = 1200;

  // CALCOLO SCALA UNIFICATA (Busta + Sezioni)
  React.useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const availableW = entry.contentRect.width;
        // Riserviamo 100px per la toolbar a destra
        const effectiveW = isMobile ? availableW : (availableW - 100); 
        const newScale = Math.min(effectiveW, MAX_CANVA_WIDTH) / LOGICAL_WIDTH;
        setEditorScale(newScale);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  const handleHeightChange = (index: number, newHeight: number) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], height: newHeight } as any;
    setBlocks(newBlocks); // Reattività immediata
  };

  const handleHeightChangeComplete = () => {
    // Sincronizza con il tema dell'evento solo alla fine del drag per performance e history pulita
    updateTheme({ blocks: blocks }); 
    pushToHistory();
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    
    const current = newBlocks[index];
    const target = newBlocks[targetIndex];
    if (!current || !target) return;

    newBlocks[index] = target;
    newBlocks[targetIndex] = current;
    
    // Riassegna gli order per rispecchiare l'indice dell'array, così la Public View li ordina correttamente.
    const ordered = newBlocks.map((b, i) => ({ ...b, order: i }));
    
    setBlocks(ordered);
    updateTheme({ blocks: ordered });
    pushToHistory();
    setSelectedBlockId(current.id || null);
  };

  const moveBlockMobile = (index: number, direction: 'up' | 'down') => {
    const currentBlocks = [...blocks];
    // Se non hanno mobileOrder, inizializzali in base all'ordine attuale
    const hasAnyMobileOrder = currentBlocks.some(b => b.mobileOrder !== undefined);
    
    let workingBlocks = [...currentBlocks];
    if (!hasAnyMobileOrder) {
      workingBlocks = workingBlocks.map((b, i) => ({ ...b, mobileOrder: i }));
    }

    // Ordina per mobileOrder per trovare i vicini reali in questa vista
    const sorted = [...workingBlocks].sort((a, b) => (a.mobileOrder ?? 0) - (b.mobileOrder ?? 0));
    const currentBlockInSorted = sorted[index];
    const targetIdxInSorted = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIdxInSorted < 0 || targetIdxInSorted >= sorted.length) return;
    
    const targetBlockInSorted = sorted[targetIdxInSorted];

    // Scambia i mobileOrder
    if (currentBlockInSorted && targetBlockInSorted) {
      const tempOrder = currentBlockInSorted.mobileOrder;
      currentBlockInSorted.mobileOrder = targetBlockInSorted.mobileOrder as number;
      targetBlockInSorted.mobileOrder = tempOrder as number;

      setBlocks(workingBlocks);
      updateTheme({ blocks: workingBlocks });
      pushToHistory();
      setSelectedBlockId(currentBlockInSorted.id || null);
    }
  };

  const moveLayerMobile = (layerId: string, direction: 'up' | 'down') => {
    const currentLayers = [...layers];
    const targetLayer = currentLayers.find(l => l.id === layerId);
    if (!targetLayer) return;

    // Filtriamo i layer dello stesso blocco visibili in mobile
    const blockLayers = currentLayers
      .filter(l => l.blockId === targetLayer.blockId && !l.hiddenMobile);
    
    // Inizializziamo mobileOrder se manca
    const hasAnyMobileOrder = blockLayers.some(l => l.mobileOrder !== undefined);
    if (!hasAnyMobileOrder) {
      // Ordiniamo per Y attuale per dare un senso iniziale
      blockLayers.sort((a, b) => ((a.y as number) || 0) - ((b.y as number) || 0));
      blockLayers.forEach((l, i) => {
        const originalLayer = currentLayers.find(ol => ol.id === l.id);
        if (originalLayer) originalLayer.mobileOrder = i;
      });
    }

    const sorted = [...blockLayers].sort((a, b) => (a.mobileOrder ?? 0) - (b.mobileOrder ?? 0));
    const idx = sorted.findIndex(l => l.id === layerId);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;

    if (targetIdx >= 0 && targetIdx < sorted.length) {
      const otherLayer = sorted[targetIdx];
      if (targetLayer && otherLayer) {
        const tempOrder = targetLayer.mobileOrder;
        targetLayer.mobileOrder = otherLayer.mobileOrder as number;
        otherLayer.mobileOrder = tempOrder as number;

        setLayers(currentLayers);
        updateTheme({ layers: currentLayers });
        pushToHistory();
      }
    }
  };

  const duplicateBlock = (index: number) => {
    const blockToDuplicate = blocks[index];
    if (!blockToDuplicate) return;

    const newBlockId = 'block-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const newBlock: Block = { 
      ...blockToDuplicate, 
      id: newBlockId 
    };

    // Deep copy of layers belonging to this block - USANDO VARIABILI LOCALI PER ATOMICITÀ
    const blockLayers = (layers || []).filter(l => l.blockId === blockToDuplicate.id);
    const newLayers = blockLayers.map(l => ({
      ...l,
      id: 'layer-' + Math.random().toString(36).substr(2, 9),
      blockId: newBlockId
    }));
    
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    
    const updatedLayers = [...layers, ...newLayers];

    setBlocks(newBlocks);
    setLayers(updatedLayers); // Aggiorna lo stato locale
    
    // Sincronizzazione ATOMICA: mandiamo sia i blocchi che i layer aggiornati al server in un colpo solo
    updateTheme({ 
      blocks: newBlocks, 
      layers: updatedLayers 
    });
    
    pushToHistory();
    setSelectedBlockId(newBlockId); // Seleziona automaticamente il nuovo blocco
  };

  const deleteBlock = (index: number) => {
    const blockToDelete = blocks[index];
    if (!blockToDelete) return;
    const newBlocks = blocks.filter((_, i) => i !== index);
    const newLayers = layers.filter(l => l.blockId !== blockToDelete.id);
    setBlocks(newBlocks);
    setLayers(newLayers);
    updateTheme({ blocks: newBlocks, layers: newLayers });
    pushToHistory();
  };


  const deleteLayer = (layerId: string) => {
    const newLayers = layers.filter(l => l.id !== layerId);
    setLayers(newLayers);
    updateTheme({ layers: newLayers });
    pushToHistory();
    setSelectedLayerIds([]);
  };

  const duplicateLayer = (layerId: string) => {
    const layerToDuplicate = layers.find(l => l.id === layerId);
    if (!layerToDuplicate) return;

    const blockId = layerToDuplicate.blockId;
    
    // 1. Isola i layer della sezione e ordinali usando la STESSA LOGICA del rendering
    const blockLayers = sortLayersForMobile(layers.filter(l => l.blockId === blockId))
      .map(l => ({ ...l })); // CLONE IMMUTABILE
    
    const localIndex = blockLayers.findIndex(l => l.id === layerId);
    if (localIndex === -1) return;

    // 2. Crea il duplicato
    const newLayer: Layer = {
      ...layerToDuplicate,
      id: 'layer-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      x: (layerToDuplicate.x as number || 0) + 20,
      y: (layerToDuplicate.y as number || 0) + 20,
      mobileOrder: 0 // Verrà normalizzato subito sotto
    } as any;

    // 3. Inserimento nella lista ordinata e normalizzazione indici ATOMICA
    const newSectionLayers = [...blockLayers];
    newSectionLayers.splice(localIndex + 1, 0, newLayer);
    
    const normalizedSectionLayers = newSectionLayers.map((l, i) => ({
      ...l,
      mobileOrder: i
    }));

    // 4. Ricostruzione array globale IN-PLACE per preservare lo z-index e l'ordine globale
    // Troviamo il primo layer di questo blocco nell'array originale per capire dove iniziare l'inserimento fisico
    const firstLayerGlobalIdx = layers.findIndex(l => l.blockId === blockId);
    
    // Filtriamo via i vecchi layer del blocco dall'array globale
    const otherLayers = layers.filter(l => l.blockId !== blockId);
    
    // Inseriamo i nuovi layer normalizzati esattamente dove c'era la sezione prima
    const finalLayers = [...otherLayers];
    finalLayers.splice(firstLayerGlobalIdx === -1 ? finalLayers.length : firstLayerGlobalIdx, 0, ...normalizedSectionLayers);

    setLayers(finalLayers);
    updateTheme({ layers: finalLayers });
    pushToHistory();
    setSelectedLayerIds([newLayer.id]);
  };

  const handleBlockColorChange = (index: number, newColor: string) => {
    const newBlocks = [...blocks];
    const targetBlock = { ...newBlocks[index] };
    const targetProps = { ...targetBlock.props, bgColor: newColor };
    newBlocks[index] = { ...targetBlock, props: targetProps } as any;
    setBlocks(newBlocks);
    updateTheme({ blocks: newBlocks }, pushToHistory);
  };

  return (
    <div 
      className="event-page-builder-container custom-scrollbar" 
      ref={containerRef}
      onClick={(e) => { 
        // Reset selection only if clicking EXACTLY on the empty background
        if (e.target === e.currentTarget) {
          setSelectedBlockId(null); 
          setSelectedLayerIds([]); 
        }
      }}
      style={{ 
        width: '100%', 
        height: '100%', 
        overflowY: 'auto', 
        overflowX: 'hidden',
        background: 'var(--bg-body)',
        position: 'relative'
      }}
    >
      <div 
        className="event-page-builder-wrapper"
        onPointerDown={(e) => {
          // Deselezione globale: pulisce solo se NON abbiamo cliccato su una sezione o un elemento
          const target = e.target as HTMLElement;
          if (target.closest('.builder-section-item') || target.closest('.section-floating-toolbar')) {
            return;
          }
          
          setSelectedBlockId(null);
          setSelectedLayerIds([]);
        }}
        style={{ 
          width: '100%',
          minHeight: '100%',
          cursor: 'default',
          paddingBottom: '20vh', // Area extra in fondo per deselezione comoda
          maxWidth: previewMobile ? '1020px' : '100%', // Allineato alla larghezza della busta + padding
          margin: '0 auto', 
          // CANALE SICURO PER LA TOOLBAR: reserviamo 100px a destra
          paddingRight: isMobile ? '0' : '100px', 
          position: 'relative',
          zIndex: 5,
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: previewMobile ? '0 0 50px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        {/* =======================
            HERO SECTION (Blocco 1) - ALLINEATA E SCALATA
            ======================= */}
        <div 
          className="event-hero-section"
          style={{
            width: previewMobile ? '100%' : (editorScale * LOGICAL_WIDTH) + 'px',
            minHeight: event?.theme?.envelopeFormat === 'vertical'
              ? (isMobile ? '83vh' : '85vh') 
              : (event?.theme?.envelopeFormat === 'horizontal'
                  ? '80vh'
                  : ((Math.abs((event?.canvas?.width || 0) - (event?.canvas?.height || 0)) < 10) ? (isMobile ? '720px' : '980px') : '100vh')),
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: event?.theme?.heroBgColor || 'transparent',
            backgroundImage: (event?.theme?.heroBg && !event.theme.heroBg.startsWith('#') && !event.theme.heroBg.startsWith('rgb') && event.theme.heroBg !== 'none') 
              ? `url(${event.theme.heroBg})` 
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: event?.theme?.heroBgPosition || 'center',
            backgroundRepeat: 'no-repeat',
            overflow: 'visible' 
          }}
        >
          {/* Overlay solo se c'è un'immagine di sfondo */}
          {(event?.theme?.heroBg && event.theme.heroBg !== 'none' && !event.theme.heroBg.startsWith('#')) && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: event?.theme?.heroBgColor || 'transparent',
              opacity: 1 - (event?.theme?.heroBgOpacity ?? 1),
              zIndex: 1,
              pointerEvents: 'none'
            }} />
          )}

          <div style={{ 
            position: 'relative', 
            zIndex: 2,
            width: LOGICAL_WIDTH + 'px', 
            display: 'flex',
            justifyContent: 'center',
            transform: isMobile ? 'scale(0.72)' : 'none', 
            transformOrigin: 'center center', 
            flexShrink: 0,
            marginTop: event?.theme?.envelopeFormat === 'vertical'
              ? (isMobile ? '1vh' : '5vh')
              : (event?.theme?.envelopeFormat === 'horizontal'
                  ? (isMobile ? '-10vh' : '0')
                  : '0')
          }}>
            <EnvelopeAnimation 
              envelopeFormat={event?.theme?.envelopeFormat || 'vertical'}
              envelopeColor={event?.theme?.coverBg || '#54392d'}
              linerImg={event?.theme?.coverLiner === 'none' ? null : (event?.theme?.coverLiner || null)}
              pocketColor={event?.theme?.coverPocketColor || event?.theme?.coverBg || '#54392d'}
              pocketLinerImg={event?.theme?.coverPocketLiner}
              linerX={event?.theme?.linerX || 0}
              linerY={event?.theme?.linerY || 0}
              linerScale={event?.theme?.linerScale || 1}
              linerOpacity={event?.theme?.linerOpacity ?? 1}
              linerColor={event?.theme?.coverLinerColor || '#ffffff'}
              canvasProps={canvasProps}
              manualPhase={null}
              isEventPage={true}
              isBuilder={true}
              isMobile={isMobile}
              scale={editorScale}
              onOpenComplete={() => setIsInvitationOpened(true)}
            >
               <ReadOnlyCanvas layers={layers} canvasProps={canvasProps} />
            </EnvelopeAnimation>
          </div>

          {/* SCROLL HINT */}
          {isInvitationOpened && <ScrollHint isMobile={isMobile} color={event?.theme?.accentColor || 'var(--accent)'} />}
        </div>

        {/* =======================
            DYNAMIC SECTIONS (Blocks)
            ======================= */}
        <div className="dynamic-sections-container" style={{ position: 'relative', overflow: 'visible', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {(previewMobile 
          ? [...blocks].sort((a, b) => (a.mobileOrder ?? 0) - (b.mobileOrder ?? 0))
          : blocks
        ).map((block, idx) => (
          <BuilderSection 
            key={block.id}
            block={block}
            index={idx}
            isSelected={selectedBlockId === block.id}
            onClick={() => setSelectedBlockId(block.id || null)}
            onHeightChange={(h) => handleHeightChange(idx, h)}
            onHeightChangeComplete={handleHeightChangeComplete}
            onMoveUp={() => previewMobile ? moveBlockMobile(idx, 'up') : moveBlock(idx, 'up')}
            onMoveDown={() => previewMobile ? moveBlockMobile(idx, 'down') : moveBlock(idx, 'down')}
            onDuplicate={() => duplicateBlock(idx)}
            onDelete={() => deleteBlock(idx)}
            onColorChange={(color) => handleBlockColorChange(idx, color)}
            onUpdateBlock={onUpdateBlock}
            isFirst={idx === 0}
            isLast={idx === (blocks.length - 1)}
            isMobile={isMobile}
            bgColor={block.props?.bgColor || '#ffffff'}
            layers={layers}
            selectedLayerIds={selectedLayerIds}
            setSelectedLayerIds={setSelectedLayerIds}
            setLayers={setLayers}
            pushToHistory={pushToHistory}
            setIsDirty={setIsDirty}
            previewMobile={previewMobile}
            editingLayerId={editingLayerId}
            setEditingLayerId={setEditingLayerId}
            editorScale={editorScale} 
            onMoveLayer={moveLayerMobile}
            onDuplicateLayer={duplicateLayer}
            onDeleteLayer={deleteLayer}
          />
        ))}
      </div>

      {/* BUtton Aggiungi Sezione placeholder */}
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-soft)', fontSize: '13px', marginBottom: '16px' }}>
             Questa è la pagina che i tuoi invitati vedranno scorrendo verso il basso.
          </p>
          <button 
            style={{ 
              padding: '10px 20px', 
              borderRadius: '30px', 
              border: '1px dashed var(--accent)', 
              backgroundColor: 'transparent',
              color: 'var(--accent)',
              fontSize: '13px',
              cursor: 'pointer'
            }}
            onClick={() => {
              const newBlocks = [...blocks, { 
                id: 'block-' + Date.now(), 
                type: 'custom',
                y: 0, // Required by Block interface
                title: 'Nuova Sezione', 
                height: 400, 
                bgColor: '#ffffff' 
              } as Block];
              updateTheme({ blocks: newBlocks });
              pushToHistory();
            }}
          >
            + Aggiungi Sezione
          </button>
      </div>
      </div>
    </div>
  );
};

export default EventPageBuilder;
