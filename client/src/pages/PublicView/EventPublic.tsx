import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { resolveImageUrl, API_BASE } from "../../config/api";
import { apiFetch } from "../../utils/apiFetch";
import { Surface, Button, Badge } from "../../ui";
import EnvelopeAnimation from "../../components/envelope/EnvelopeAnimation";
import ReadOnlyCanvas from "../../components/canvas/ReadOnlyCanvas";
import { loadGoogleFont } from "../../pages/Editor/components/EditorHelpers";
import { Calendar, MapPin, Send, Mouse, ChevronDown } from "lucide-react";
import "./EventPublic.css";
import ScrollHint from "../../components/ui/ScrollHint";
import type { EventData, Block } from "../../types/editor";
import { RSVPWidget } from "../Editor/components/widgets/RSVPWidget";
import MapWidget from "../Editor/components/widgets/MapWidget";

export default function EventPublic() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editLink, setEditLink] = useState("");
  const [isInvitationOpened, setIsInvitationOpened] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const [stageScale, setStageScale] = useState(1);

  const LOGICAL_WIDTH = 1000;
  const MAX_CANVA_WIDTH = 1200;

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && containerRef.current.parentElement) {
         const parentWidth = containerRef.current.parentElement.clientWidth;
         setStageScale(Math.min(parentWidth, MAX_CANVA_WIDTH) / LOGICAL_WIDTH);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [event?._id]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/events/${slug}`);
        if (!res.ok) {
          throw new Error("Evento non trovato");
        }
        const data = await res.json();
        setEditLink(data.editLink || "");
        setEvent(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  const pageTheme = useMemo(() => {
    const accent = event?.theme?.accent || "#f4c46b";
    const bg = event?.theme?.background || "#050506";
    const fonts = event?.theme?.fonts || { heading: "Playfair Display", body: "Space Grotesk" };
    return { accent, bg, fonts };
  }, [event]);

  // Load Theme Fonts
  useEffect(() => {
    if (pageTheme.fonts.heading) loadGoogleFont(pageTheme.fonts.heading);
    if (pageTheme.fonts.body) loadGoogleFont(pageTheme.fonts.body);
  }, [pageTheme]);

  if (loading) return <div className="event-public-page">Caricamento...</div>;
  if (!event) return <div className="event-public-page">Evento non trovato.</div>;

  if (event.status !== "published") {
    return (
      <div className="event-public-page">
        <div className="event-public-shell">
          <Surface variant="glass">
            <h1>{event.title}</h1>
            <p style={{ opacity: 0.8 }}>Questo evento non è ancora stato pubblicato.</p>
            <p style={{ marginTop: "1rem", opacity: 0.6 }}>Torna più tardi ✨</p>
          </Surface>
        </div>
      </div>
    );
  }

  const orderedBlocks = [...(event.blocks || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="event-public-page" style={{ 
      backgroundColor: '#ffffff', // Sezioni successive bianche
      position: 'relative', 
      overflowX: 'hidden' 
    }}>
      {/* 1. HERO SECTION - FULL WIDTH, NO MARGINS */}
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '100%', 
        padding: '0', 
        position: 'relative', 
        overflow: 'hidden'
      }}>
        {/* Sfondo Scenario (Hero Background) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: event.theme?.heroBgColor || 'var(--bg-body)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: (event.theme?.heroBg && !event.theme.heroBg.startsWith('#') && !event.theme.heroBg.startsWith('rgb')) 
            ? `url(${resolveImageUrl(event.theme.heroBg)})` 
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: event.theme?.heroBgPosition || 'center',
          opacity: (event.theme?.heroBg && !event.theme.heroBg.startsWith('#') && !event.theme.heroBg.startsWith('rgb')) ? (event.theme?.heroBgOpacity ?? 1) : 0,
          pointerEvents: 'none'
        }} />

         {/* Envelope Container con Scaling */}
         <div style={{
           position: 'relative',
           zIndex: 2,
           transform: `scale(${window.innerWidth <= 768 ? 0.6 : 0.88})`,
           transformOrigin: 'center center',
           marginTop: !isMobile 
            ? (event.theme?.envelopeFormat === 'vertical' 
                ? '140px' 
                : (Math.abs((event.canvas?.width || 0) - (event.canvas?.height || 0)) < 10 ? '80px' : '0'))
            : '0'
         }}>
            <EnvelopeAnimation
              envelopeFormat={event.theme?.envelopeFormat || 'vertical'}
              guestName={event.theme?.coverText || ''}
              envelopeColor={event.theme?.coverBg || '#ffffff'}
              pocketColor={event.theme?.coverPocketColor || null}
              linerImg={event.theme?.coverLiner === 'none' ? null : (event.theme?.coverLiner ? resolveImageUrl(event.theme.coverLiner) : null)}
              pocketLinerImg={event.theme?.coverPocketLiner ? resolveImageUrl(event.theme.coverPocketLiner) : null}
              linerX={event.theme?.linerX || 0}
              linerY={event.theme?.linerY || 0}
              linerScale={event.theme?.linerScale || 1}
              linerOpacity={event.theme?.linerOpacity ?? 1}
              linerColor={event.theme?.coverLinerColor || '#ffffff'}
              canvasProps={event.canvas || null}
              isEventPage={true}
              onOpenComplete={() => {
                setIsInvitationOpened(true);
              }}
            >
              {event.layers && event.canvas ? (
                <ReadOnlyCanvas layers={event.layers} canvasProps={event.canvas} />
              ) : (
                <div className="hero-card">
                  <Badge variant="accent" style={{ backgroundColor: pageTheme.accent, color: "var(--bg-body)", border: "none" }}>Invito digitale</Badge>
                  <h1 style={{ fontFamily: pageTheme.fonts.heading }}>{event.title}</h1>
                  {event.dateTBD ? (
                    <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      <Calendar size={18} color={pageTheme.accent} /> Data da definire
                    </p>
                  ) : event.date ? (
                    <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      <Calendar size={18} color={pageTheme.accent} /> {new Date(event.date).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  ) : null}
                </div>
              )}
            </EnvelopeAnimation>
          </div>
          
          {/* SCROLL HINT (Discreto e Disegnato sulla Viewport) */}
          {isInvitationOpened && <ScrollHint isMobile={window.innerWidth <= 768} color={pageTheme.accent} />}
      </div>

      {/* 2. CONTENT SHELL - FULL WIDTH FOR BLOCKS BACKGROUNDS */}
      <div className="event-public-shell" style={{ fontFamily: pageTheme.fonts.body, position: 'relative', zIndex: 1, width: '100%', margin: 0, padding: 0 }}>
        <div className="event-public-content" ref={containerRef} style={{ width: '100%', overflowX: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {orderedBlocks.length === 0 ? (
            <Surface variant="glass" style={{ marginTop: "2rem" }}>
              <p style={{ margin: 0, color: "var(--text-muted)" }}>
                Il creatore dell'evento sta ancora preparando i contenuti.
              </p>
            </Surface>
          ) : (
            <div 
              className={`page-canvas-area public-view ${isMobile ? 'is-mobile' : ''}`}
              style={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: isMobile ? '20px' : '0'
              }}
            >
              {orderedBlocks.map((block) => {
                const layoutPreset = block.props?.layoutPreset || "single";
                const currentScale = isMobile ? 1 : stageScale;
                const isWidget = ['map'].includes(block.type);
                const scaledHeight = (block.height || 400) * currentScale;
                
                return (
                  <div 
                    key={block.id || block._id}
                    className={`public-block-wrapper event-section block-type-${block.type || 'canvas'} layout-${layoutPreset}`}
                    style={{
                       position: 'relative',
                       width: '100%', 
                       height: isMobile || isWidget ? 'auto' : (scaledHeight + 'px'),
                       minHeight: isMobile ? '200px' : (isWidget ? '300px' : 'auto'),
                       background: block.props?.bgColor || 'transparent',
                       marginBottom: isMobile ? '20px' : '0',
                       overflow: isWidget ? 'visible' : 'hidden',
                       display: 'flex',
                       justifyContent: 'center',
                       boxSizing: 'border-box'
                    }}
                  >
                    {isWidget ? (
                      /* FLUID WIDGET RENDERING - No fixed width/scale wrapper to prevent clipping */
                      <div style={{ 
                        width: '100%', 
                        height: '100%',
                        position: 'relative', 
                        zIndex: 1, 
                        padding: isMobile ? '0' : '0 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        {block.type === 'map' && (
                          <MapWidget 
                            address={block.props?.address} 
                            title={block.props?.title}
                            zoom={block.props?.zoom || 15}
                            previewMobile={isMobile}
                          />
                        )}
                        {/* WIDGET OVERLAY LAYERS (es. testi draggabili RSVP) */}
                        {event.layers && event.canvas && (
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
                            <ReadOnlyCanvas 
                              layers={event.layers.filter(l => {
                                const bId = block.id || block._id;
                                if (!l.blockId) {
                                  if (bId) return false;
                                  if (block.type !== 'canvas') return false;
                                  return true;
                                }
                                return l.blockId === bId;
                              })} 
                              canvasProps={{...event.canvas, height: block.height || (block.type === 'rsvp' ? 550 : 400), bgImage: null, bgColor: 'transparent'}} 
                              isMobile={isMobile}
                              isBlock={true}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      /* LOGICAL CANVAS RENDERING - Uses scaling for precise layer positioning */
                      <div style={!isMobile ? {
                        width: LOGICAL_WIDTH + 'px',
                        height: (block.height || 400) + 'px',
                        position: 'relative',
                        flexShrink: 0,
                        transform: `scale(${currentScale})`,
                        transformOrigin: 'top center',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      } : {
                        width: '100%',
                        maxWidth: '100%',
                        height: '100%',
                        position: 'relative',
                        zIndex: 1,
                        padding: 0
                      }}>
                        {event.layers && event.canvas && (
                          <ReadOnlyCanvas 
                            layers={[
                              ...event.layers.filter(l => {
                                const bId = block.id || block._id;
                                if (!l.blockId) {
                                  if (bId) return false;
                                  if (block.type !== 'canvas') return false;
                                  return true;
                                }
                                return l.blockId === bId;
                              }),
                              ...(block.type === 'rsvp' ? [{
                                id: `widget-rsvp-${block.id || block._id}`,
                                type: 'custom-widget' as any,
                                blockId: block.id,
                                mobileOrder: block.widgetProps?.mobileOrder ?? 5,
                                x: (typeof block.widgetProps?.formX === 'number' && !isNaN(block.widgetProps.formX)) ? block.widgetProps.formX : 500,
                                y: (typeof block.widgetProps?.formY === 'number' && !isNaN(block.widgetProps.formY)) ? block.widgetProps.formY : (block.height || 400) / 2,
                                z: 5
                              }] : [])
                            ]}
                            renderCustomLayer={(layer) => {
                              if (layer.type === 'custom-widget' && block.type === 'rsvp') {
                                return (
                                  <div style={{ pointerEvents: 'auto' }}>
                                    <RSVPWidget block={block} theme={event.theme} eventSlug={slug || ""} isMobile={isMobile} />
                                  </div>
                                );
                              }
                              return null;
                            }}
                            canvasProps={{...event.canvas, height: block.height || 400, bgImage: null, bgColor: 'transparent'}} 
                            isMobile={isMobile}
                            isBlock={true}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
