import React, { useRef, useState } from 'react';
import { Plus, Trash2, MapPin, Users, Type, Image as LucideImage } from 'lucide-react';
import EnvelopeAnimation from "../../../components/envelope/EnvelopeAnimation";
import ReadOnlyCanvas from "../../../components/canvas/ReadOnlyCanvas";
import BuilderSection from "./BuilderSection";

const EventPageBuilder = ({
  event,
  canvasProps,
  layers,
  isMobile,
  updateEvent
}) => {
  const containerRef = useRef(null);
  const [selectedBlockId, setSelectedBlockId] = useState(null);

  const blocks = [...(event?.blocks || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleHeightChange = (id, newHeight) => {
    const updatedBlocks = blocks.map(b => (b.id || b._id) === id ? { ...b, height: newHeight } : b);
    updateEvent({ blocks: updatedBlocks });
  };

  const handleAddBlock = (type) => {
    const newBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      height: 400,
      order: blocks.length,
      props: type === 'text' ? { heading: 'Nuovo Titolo', body: 'Scrivi qui il tuo testo...' } : {}
    };
    const updatedBlocks = [...(event?.blocks || []), newBlock];
    updateEvent({ blocks: updatedBlocks });
    setSelectedBlockId(newBlock.id);
  };

  const handleDeleteBlock = (id, e) => {
    e.stopPropagation();
    if (!confirm('Sei sicuro di voler eliminare questa sezione?')) return;
    const updatedBlocks = blocks.filter(b => (b.id || b._id) !== id);
    updateEvent({ blocks: updatedBlocks });
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  return (
    <div 
      className="event-page-builder-container custom-scrollbar" 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '100%', 
        overflowY: 'auto', 
        overflowX: 'hidden',
        background: 'var(--bg-body)',
        position: 'relative',
        scrollBehavior: 'smooth'
      }}
      onClick={() => setSelectedBlockId(null)}
    >
      {/* =======================
          HERO SECTION (Blocco 0)
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

        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          padding: '8px 16px',
          borderRadius: '100px',
          fontSize: '11px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: 'var(--text-primary)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          Hero (Sezione Fissa Apertura)
        </div>
      </div>

      {/* =======================
          EDITABLE BLOCKS
          ======================= */}
      {blocks.map((block, idx) => (
        <BuilderSection 
          key={block.id || block._id}
          block={block}
          index={idx}
          isSelected={selectedBlockId === (block.id || block._id)}
          onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id || block._id); }}
          onHeightChange={(newH) => handleHeightChange(block.id || block._id, newH)}
        >
          {/* Mock Content per renderizzare i vari tipi di blocco nell'editor */}
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px', opacity: selectedBlockId === (block.id || block._id) ? 1 : 0.7 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-soft)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                   {block.type === 'rsvp' && <Users size={14} />}
                   {block.type === 'map' && <MapPin size={14} />}
                   {block.type === 'text' && <Type size={14} />}
                   {block.type === 'photo' && <LucideImage size={14} />}
                   {block.type}
                </div>
                {selectedBlockId === (block.id || block._id) && (
                   <button 
                     onClick={(e) => handleDeleteBlock(block.id || block._id, e)}
                     style={{ background: 'rgba(255,0,0,0.1)', color: 'red', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                     <Trash2 size={16} />
                   </button>
                )}
             </div>

             {/* Rendering statico/placeholder nel builder */}
             {block.type === 'text' && (
                <div>
                   <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>{block.props?.heading || 'Titolo Sezione'}</h2>
                   <p style={{ opacity: 0.6 }}>{block.props?.body || 'Testo della sezione...'}</p>
                </div>
             )}
             {block.type === 'rsvp' && (
                <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                   Modulo RSVP (Anteprima)
                </div>
             )}
             {block.type === 'map' && (
                <div style={{ width: '100%', height: '200px', background: 'var(--surface)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   Mappa Evento (Anteprima)
                </div>
             )}
          </div>
        </BuilderSection>
      ))}

      {/* =======================
          ADD SECTION UI
          ======================= */}
      <div style={{ padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <p style={{ color: 'var(--text-soft)', fontSize: '14px', fontWeight: 500 }}>
             Aggiungi nuove sezioni per i tuoi invitati
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
             {[
               { type: 'text', label: 'Testo', icon: <Type size={16} /> },
               { type: 'rsvp', label: 'RSVP', icon: <Users size={16} /> },
               { type: 'map', label: 'Mappa', icon: <MapPin size={16} /> },
               { type: 'photo', label: 'Foto', icon: <LucideImage size={16} /> }
             ].map(opt => (
               <button 
                 key={opt.type}
                 onClick={() => handleAddBlock(opt.type)}
                 style={{
                   display: 'flex', alignItems: 'center', gap: '8px',
                   padding: '12px 20px', background: 'var(--surface-light)',
                   border: '1px solid var(--border)', borderRadius: '12px',
                   color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer'
                 }}
                >
                 <Plus size={16} /> {opt.label}
               </button>
             ))}
          </div>
      </div>

    </div>
  );
};

export default EventPageBuilder;
