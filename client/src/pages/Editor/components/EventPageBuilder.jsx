import React, { useRef } from 'react';
import EnvelopeAnimation from "../../../components/envelope/EnvelopeAnimation";
import ReadOnlyCanvas from "../../../components/canvas/ReadOnlyCanvas";

const EventPageBuilder = ({
  event,
  canvasProps,
  layers,
  isMobile,
  scenarioScale,
  updateTheme,
  blocks,
}) => {
  const containerRef = useRef(null);

  // Per ora costruiamo la "Hero Section" fissa come primo blocco.
  // In futuro mapperemo `blocks` per renderizzare sezioni aggiuntive (RSVP, Mappa, Lista Nozze).

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
        {/* Overlay opacità, come in EditorStage */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: event?.theme?.heroBgColor || 'var(--bg-body)',
          opacity: 1 - (event?.theme?.heroBgOpacity ?? 1),
          zIndex: 1,
          pointerEvents: 'none'
        }} />

        {/* Envelope Animation centrata */}
        <div style={{ 
          position: 'relative', 
          zIndex: 2,
          transform: `scale(${isMobile ? 0.6 : 0.8})`,
          transformOrigin: 'center center'
        }}>
          <EnvelopeAnimation 
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

        {/* Placeholder UI Builder controls for the Hero Section */}
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
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          Hero Section (Visualizzazione Pagina)
        </div>
      </div>

      {/* Aggiungeremo qui in futuro il bottone "+ Aggiungi Sezione" */}
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-soft)', fontSize: '13px', marginBottom: '16px' }}>
             Questa è la pagina che i tuoi invitati vedranno scorrendo verso il basso.
          </p>
          <button style={{
            padding: '12px 24px',
            background: 'var(--surface-light)',
            border: '2px dashed var(--border)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
            fontWeight: 700,
            cursor: 'pointer'
          }}>
            + Aggiungi Sezione (Prossimamente)
          </button>
      </div>

    </div>
  );
};

export default EventPageBuilder;
