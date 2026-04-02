import React, { useRef, useState } from 'react';
import EnvelopeAnimation from "../../../components/envelope/EnvelopeAnimation";
import ReadOnlyCanvas from "../../../components/canvas/ReadOnlyCanvas";
import BuilderSection from "./BuilderSection";
import { ScrollHint } from "../../../components/ui/ScrollHint";
import type { Layer, CanvasProps, Block } from "../../../types/editor";

interface EventPageBuilderProps {
  event: any;
  canvasProps: CanvasProps;
  layers: Layer[];
  isMobile: boolean;
  scenarioScale: number;
  updateTheme: (updates: any) => void;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  pushToHistory: () => void;
}

export function EventPageBuilder({
  event,
  canvasProps,
  layers,
  isMobile,
  scenarioScale,
  updateTheme,
  blocks,
  setBlocks,
  pushToHistory
}: EventPageBuilderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isInvitationOpened, setIsInvitationOpened] = useState(false);

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
    
    setBlocks(newBlocks);
    updateTheme({ blocks: newBlocks });
    pushToHistory();
  };

  const duplicateBlock = (index: number) => {
    const blockToDuplicate = blocks[index];
    if (!blockToDuplicate) return;

    const newBlock: Block = { 
      ...blockToDuplicate, 
      id: 'block-' + Date.now() + '-' + Math.floor(Math.random() * 1000) 
    };
    
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
    updateTheme({ blocks: newBlocks });
    pushToHistory();
  };

  const deleteBlock = (index: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa sezione?')) return;
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks);
    updateTheme({ blocks: newBlocks });
    pushToHistory();
  };

  return (
    <div 
      className="event-page-builder-container custom-scrollbar" 
      ref={containerRef}
      onClick={() => setSelectedBlockId(null)}
      style={{ 
        width: '100%', 
        height: '100%', 
        overflowY: 'auto', 
        overflowX: 'hidden',
        background: 'var(--bg-body)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: isMobile ? '0' : '0 100px 0 30px' // Aumentato padding destro per alloggiare la toolbar esterna
      }}
    >
      {/* =======================
          HERO SECTION (Blocco 1) - FULL WIDTH
          ======================= */}
      <div 
        className="event-hero-section"
        style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '900px', // Limita la larghezza per matchare le sezioni
          margin: '0 auto', // Centra la hero
          minHeight: isMobile ? '100vh' : '100vh',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: event?.theme?.heroBgColor || 'var(--bg-body)',
          backgroundImage: (event?.theme?.heroBg && !event.theme.heroBg.startsWith('#') && !event.theme.heroBg.startsWith('rgb') && event.theme.heroBg !== 'none') 
            ? `url(${event.theme.heroBg})` 
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: event?.theme?.heroBgPosition || 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'local',
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
          transform: isMobile ? 'scale(0.6)' : 'none', 
          transformOrigin: 'center center'
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
            onOpenComplete={() => setIsInvitationOpened(true)}
          >
             <ReadOnlyCanvas layers={layers} canvasProps={canvasProps} />
          </EnvelopeAnimation>
        </div>
        {/* SCROLL HINT (Ancorato alla base della Hero per centratura e visibilità) */}
        {isInvitationOpened && <ScrollHint isMobile={isMobile} color={event?.theme?.accentColor || 'var(--accent)'} />}
      </div>

      {/* =======================
          CONSTRAINED CONTENT (Blocks)
          ======================= */}
      <div 
        className="event-page-width-constraint"
        style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '900px', 
          margin: '0 auto', // Centra il contenuto rispetto alla hero full-width
          position: 'relative',
          backgroundColor: '#ffffff',
          boxShadow: isMobile ? 'none' : '0 0 40px rgba(0,0,0,0.05)',
          minHeight: '100%',
          zIndex: 5
        }}
      >

      {/* =======================
          DYNAMIC SECTIONS (Blocks)
          ======================= */}
      <div className="dynamic-sections-container" style={{ position: 'relative', overflow: 'visible' }}>
        {blocks.map((block, idx) => (
          <BuilderSection 
            key={block.id || idx}
            block={block}
            index={idx}
            isSelected={selectedBlockId === block.id}
            onClick={() => setSelectedBlockId(block.id || null)}
            onHeightChange={(h) => handleHeightChange(idx, h)}
            onHeightChangeComplete={handleHeightChangeComplete}
            onMoveUp={() => moveBlock(idx, 'up')}
            onMoveDown={() => moveBlock(idx, 'down')}
            onDuplicate={() => duplicateBlock(idx)}
            onDelete={() => deleteBlock(idx)}
            isFirst={idx === 0}
            isLast={idx === blocks.length - 1}
            isMobile={isMobile}
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
