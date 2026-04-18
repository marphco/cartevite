import React, { useRef, useState } from 'react';
import EnvelopeAnimation from "../../../components/envelope/EnvelopeAnimation";
import ReadOnlyCanvas from "../../../components/canvas/ReadOnlyCanvas";
import BuilderSection from "./BuilderSection";
import { ScrollHint } from "../../../components/ui/ScrollHint";
import { sortLayersForMobile } from './EditorHelpers';
import type { Layer, CanvasProps, Block } from "../../../types/editor";
import { widgetLayerIdForBlock } from "../../../utils/widgetLayerId";
import { DEFAULT_BLOCK_HEIGHT } from "../../../utils/blockHeight";

interface EventPageBuilderProps {
  event: any;
  canvasProps: CanvasProps;
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  selectedLayerIds: string[];
  setSelectedLayerIds: (ids: string[]) => void;
  isMobile: boolean;
  scenarioScale: number;
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
  updateEventData: (updates: any, pushToHistory?: () => void) => void;
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
  blocks,
  setBlocks,
  selectedBlockId,
  setSelectedBlockId,
  pushToHistory,
  setIsDirty,
  previewMobile,
  editingLayerId,
  setEditingLayerId,
  onUpdateBlock,
  updateEventData
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
    updateEventData({ blocks: blocks }); 
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
    updateEventData({ blocks: ordered });
    pushToHistory();
    setSelectedBlockId(current.id || null);
  };

  // [FIX ordine mobile/desktop] Prima `moveBlockMobile` aggiornava `block.mobileOrder`
  // — un binario separato che sia la preview mobile dell'editor sia la pagina
  // pubblica ignoravano (la public usa `block.order`). Risultato: l'utente
  // spostava una sezione su mobile e l'ordine restava diverso ovunque. Le
  // SEZIONI hanno un solo ordine globale (solo gli elementi interni, i layer,
  // hanno `mobileOrder` separato). Rendiamo `moveBlockMobile` un alias di
  // `moveBlock` così ogni "sposta sezione" — che venga dalla vista desktop o
  // mobile dell'editor — aggiorna `block.order`, garantendo consistenza con
  // la pagina pubblica su entrambi i dispositivi.
  const moveBlockMobile = (index: number, direction: 'up' | 'down') => moveBlock(index, direction);

  const moveLayerMobile = (layerId: string, direction: 'up' | 'down') => {
    // === WIDGET VIRTUALE (RSVP/Mappa/Gallery/Video) ===
    // L'ID `widget-<type>` non vive in layers[]: l'ordinamento è su
    // block.widgetProps.mobileOrder. Costruiamo lo stream completo
    // (layer reali + widget) e swappiamo l'ordine con il vicino.
    // [FIX] prima accettava solo rsvp/map → su gallery/video il move era no-op.
    if (layerId.startsWith('widget-')) {
      const WIDGET_TYPES = ['rsvp', 'map', 'gallery', 'video', 'payment'] as const;
      const wid = layerId.slice('widget-'.length);
      const block = blocks?.find(b => b.id === wid && WIDGET_TYPES.includes(b.type as any));
      if (!block) return;
      const blockLayers = (layers || []).filter(l => l.blockId === block.id && !l.hiddenMobile);
      const hasAnyMobileOrder = blockLayers.some(l => l.mobileOrder !== undefined);
      const preparedLayers = [...blockLayers];
      if (!hasAnyMobileOrder) {
        preparedLayers.sort((a, b) => ((a.y as number) || 0) - ((b.y as number) || 0));
        preparedLayers.forEach((l, i) => { (l as any).mobileOrder = i; });
      }
      const widgetOrder = (block.widgetProps?.mobileOrder ?? 5) as number;

      type StreamItem = { id: string; mobileOrder: number; isWidget: boolean };
      const stream: StreamItem[] = [
        ...preparedLayers.map(l => ({ id: l.id!, mobileOrder: (l.mobileOrder ?? 0) as number, isWidget: false })),
        { id: layerId, mobileOrder: widgetOrder, isWidget: true }
      ].sort((a, b) => a.mobileOrder - b.mobileOrder);

      const idx = stream.findIndex(s => s.isWidget);
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (idx < 0 || targetIdx < 0 || targetIdx >= stream.length) return;

      const other = stream[targetIdx]!;
      const current = stream[idx]!;
      // Scambio valori di mobileOrder
      const newWidgetOrder = other.mobileOrder;
      const newOtherOrder = current.mobileOrder;

      // Applica: aggiorna il widget sul block e il layer vicino in layers[]
      const newBlocks = (blocks || []).map(b => b.id === block.id
        ? { ...b, widgetProps: { ...b.widgetProps, mobileOrder: newWidgetOrder } }
        : b
      );
      const newLayers = (layers || []).map(l => {
        if (l.id === other.id) return { ...l, mobileOrder: newOtherOrder };
        // Seed iniziale: se mancava un mobileOrder, lo fissiamo coerentemente con prepared
        if (!hasAnyMobileOrder) {
          const p = preparedLayers.find(pl => pl.id === l.id);
          if (p) return { ...l, mobileOrder: (p as any).mobileOrder };
        }
        return l;
      });

      setBlocks(newBlocks);
      setLayers(newLayers);
      updateEventData({ blocks: newBlocks, layers: newLayers });
      setIsDirty(true);
      pushToHistory();
      return;
    }

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

    // Costruiamo lo stream completo includendo il widget se il blocco ne ha uno:
    // così lo "scambio" tra un layer reale e il widget funziona in entrambi i sensi.
    // [FIX] ora coperti tutti e 4 i tipi widget, non solo rsvp/map.
    const block = blocks?.find(b => b.id === targetLayer.blockId);
    const widgetId =
      block && ['rsvp', 'map', 'gallery', 'video', 'payment'].includes(block.type)
        ? widgetLayerIdForBlock(String(block.id))
        : null;
    type StreamItem = { id: string; mobileOrder: number; isWidget: boolean };
    const stream: StreamItem[] = [
      ...blockLayers.map(l => ({ id: l.id!, mobileOrder: (l.mobileOrder ?? 0) as number, isWidget: false })),
      ...(widgetId ? [{ id: widgetId, mobileOrder: (block!.widgetProps?.mobileOrder ?? 5) as number, isWidget: true }] : [])
    ].sort((a, b) => a.mobileOrder - b.mobileOrder);

    const idx = stream.findIndex(s => s.id === layerId);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (idx < 0 || targetIdx < 0 || targetIdx >= stream.length) return;

    const other = stream[targetIdx]!;
    const current = stream[idx]!;
    const tempOrder = current.mobileOrder;
    const newCurrentOrder = other.mobileOrder;
    const newOtherOrder = tempOrder;

    if (other.isWidget && block) {
      // Scambio tra layer reale e widget: aggiorna il widget sul block
      const newBlocks = (blocks || []).map(b => b.id === block.id
        ? { ...b, widgetProps: { ...b.widgetProps, mobileOrder: newOtherOrder } }
        : b
      );
      const newLayers = currentLayers.map(l => l.id === current.id ? { ...l, mobileOrder: newCurrentOrder } : l);
      setBlocks(newBlocks);
      setLayers(newLayers);
      updateEventData({ blocks: newBlocks, layers: newLayers });
    } else {
      // Scambio classico tra due layer reali (path originale, preservato)
      const newLayers = currentLayers.map(l => {
        if (l.id === current.id) return { ...l, mobileOrder: newCurrentOrder };
        if (l.id === other.id) return { ...l, mobileOrder: newOtherOrder };
        return l;
      });
      setLayers(newLayers);
    }
    setIsDirty(true);
    pushToHistory();
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
    // Normalizziamo `order` = idx array. È CRITICO: la public view sorta per
    // `(block.order ?? 0)`, quindi se i blocchi hanno order non contiguo o uguale
    // (tipico dopo duplicate/delete) l'ordine nelle due viste si disallinea.
    const orderedBlocks = newBlocks.map((b, i) => ({ ...b, order: i }));
    const updatedLayers = [...layers, ...newLayers];

    setBlocks(orderedBlocks);
    setLayers(updatedLayers); // Aggiorna lo stato locale

    // Sincronizzazione ATOMICA: mandiamo sia i blocchi che i layer aggiornati al server in un colpo solo
    updateEventData({
      blocks: orderedBlocks,
      layers: updatedLayers
    });

    pushToHistory();
    setSelectedBlockId(newBlockId); // Seleziona automaticamente il nuovo blocco
  };

  const deleteBlock = (index: number) => {
    const blockToDelete = blocks[index];
    if (!blockToDelete) return;
    // Stessa normalizzazione di order applicata in moveBlock/duplicateBlock.
    const newBlocks = blocks
      .filter((_, i) => i !== index)
      .map((b, i) => ({ ...b, order: i }));
    const newLayers = layers.filter(l => l.blockId !== blockToDelete.id);
    setBlocks(newBlocks);
    setLayers(newLayers);
    updateEventData({ blocks: newBlocks, layers: newLayers });
    pushToHistory();
  };


  const deleteLayer = (layerId: string) => {
    // Widget virtuale (form RSVP, mappa): non esiste un layer "vero" da rimuovere.
    // Eliminare il widget equivale a svuotare la sezione del suo contenuto principale,
    // quindi eliminiamo l'intero blocco (la doppia-tap "SICURO?" della toolbar è la safety net).
    if (layerId.startsWith('widget-')) {
      const wid = layerId.slice('widget-'.length);
      const idx = (blocks || []).findIndex(b => b.id === wid);
      if (idx >= 0) {
        deleteBlock(idx);
        setSelectedLayerIds([]);
        setSelectedBlockId(null);
      }
      return;
    }
    const newLayers = layers.filter(l => l.id !== layerId);
    setLayers(newLayers);
    updateEventData({ layers: newLayers });
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
    setIsDirty(true);
    pushToHistory();
    setSelectedLayerIds([newLayer.id]);
  };

  const handleBlockColorChange = (index: number, newColor: string) => {
    const newBlocks = [...blocks];
    const targetBlock = { ...newBlocks[index] };
    const targetProps = { ...targetBlock.props, bgColor: newColor };
    newBlocks[index] = { ...targetBlock, props: targetProps } as any;
    setBlocks(newBlocks);
    updateEventData({ blocks: newBlocks }, pushToHistory);
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
        {/* UNICO CRITERIO DI ORDINAMENTO — identico in editor desktop,
            editor mobile preview e public view (desktop + mobile). Le sezioni
            hanno un solo `block.order` globale: mobile e desktop mostrano la
            stessa sequenza di blocchi. (Gli elementi interni — layer — hanno
            invece `mobileOrder` separato per permettere stream diversi fra le
            due viste.) Fallback all'indice array per retro-compatibilità
            con eventi legacy che non hanno ancora `order` popolato ovunque. */}
        {[...blocks]
          .map((b, i) => ({ block: b, _idx: i }))
          .sort((a, b) => (a.block.order ?? a._idx) - (b.block.order ?? b._idx))
          .map(x => x.block)
          .map((block, idx) => (
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
            bgColor={block.props?.bgColor || block.bgColor || '#ffffff'}
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
            theme={event?.theme}
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
                height: DEFAULT_BLOCK_HEIGHT.custom, 
                bgColor: '#ffffff' 
              } as Block];
              updateEventData({ blocks: newBlocks });
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
