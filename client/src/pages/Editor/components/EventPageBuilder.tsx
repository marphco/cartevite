import React, { useRef, useState } from 'react';
import EnvelopeAnimation from "../../../components/envelope/EnvelopeAnimation";
import ReadOnlyCanvas from "../../../components/canvas/ReadOnlyCanvas";
import BuilderSection from "./BuilderSection";
import type { Layer, CanvasProps, Block } from "../../../types/editor";

interface EventPageBuilderProps {
  event: any;
  canvasProps: CanvasProps;
  layers: Layer[];
  isMobile: boolean;
  scenarioScale: number;
  updateTheme: (updates: any) => void;
  blocks: Block[];
  pushToHistory: () => void;
}

export const EventPageBuilder: React.FC<EventPageBuilderProps> = ({
  event,
  canvasProps,
  layers,
  isMobile,
  scenarioScale,
  updateTheme,
  blocks,
  pushToHistory
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const handleHeightChange = (index: number, newHeight: number) => {
    const newBlocks = [...blocks];
    // Use any as intermediate to bypass exactOptionalPropertyTypes spread issues
    newBlocks[index] = { ...newBlocks[index], height: newHeight } as any;
    updateTheme({ blocks: newBlocks });
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
        position: 'relative'
      }}
    >
      {/* =======================
          HERO SECTION (Blocco 1)
          ======================= */}
      <div 
        className="event-hero-section"
        style={{
          width: '100%',
          minHeight: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: (event?.theme?.heroBg && (event.theme.heroBg.startsWith('#') || event.theme.heroBg.startsWith('rgb'))) 
            ? event.theme.heroBg 
            : 'var(--bg-body)',
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
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: event?.theme?.heroBgColor || 'var(--bg-body)',
          opacity: 1 - (event?.theme?.heroBgOpacity ?? 1),
          zIndex: 1,
          pointerEvents: 'none'
        }} />

        <div style={{ 
          position: 'relative', 
          zIndex: 2,
          transform: `scale(${isMobile ? 0.6 : 0.8})`,
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
            preview={false}
            isEventPage={true}
          >
             <ReadOnlyCanvas layers={layers} canvasProps={canvasProps} />
          </EnvelopeAnimation>
        </div>
      </div>

      {/* =======================
          DYNAMIC SECTIONS (Blocks)
          ======================= */}
      <div className="dynamic-sections-container">
        {blocks.map((block, idx) => (
          <BuilderSection 
            key={block.id || idx}
            block={block}
            index={idx}
            isSelected={selectedBlockId === block.id}
            onClick={() => setSelectedBlockId(block.id || null)}
            onHeightChange={(h) => handleHeightChange(idx, h)}
            onHeightChangeComplete={() => pushToHistory()}
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
  );
};

export default EventPageBuilder;
