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
import GalleryWidget from "../Editor/components/widgets/GalleryWidget";
import VideoWidget from "../Editor/components/widgets/VideoWidget";
import PaymentWidget from "../Editor/components/widgets/PaymentWidget";
import TableauWidget from "../Editor/components/widgets/TableauWidget";
import DonationModal from "./DonationModal";
import { widgetLayerIdForBlock } from "../../utils/widgetLayerId";

/** Canvas logico editor = 1000px di larghezza; Y in pixel sull'altezza del blocco.
 *  In pagina pubblica il contenitore è fluido (100% viewport): `left: 500px` non è più
 *  il centro se la sezione è >1000px. Convertiamo in % così il widget resta nella
 *  stessa posizione relativa (es. centro = 50% / 50%). */
const EDITOR_LOGICAL_WIDTH = 1000;
function widgetAbsoluteStyleFromEditorCoords(
  widgetX: number,
  widgetY: number,
  blockHeight: number
): React.CSSProperties {
  const h = blockHeight || 400;
  const x = Math.max(0, Math.min(EDITOR_LOGICAL_WIDTH, widgetX));
  const y = Math.max(0, Math.min(h, widgetY));
  return {
    position: "absolute",
    left: `${(x / EDITOR_LOGICAL_WIDTH) * 100}%`,
    top: `${(y / h) * 100}%`,
    transform: "translate(-50%, -50%)",
  };
}

export default function EventPublic() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editLink, setEditLink] = useState("");
  const [isInvitationOpened, setIsInvitationOpened] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [donationModal, setDonationModal] = useState<{
    open: boolean;
    block?: any | undefined;
    defaultAmount?: number | undefined;
  }>({ open: false });

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

  // Stesso criterio dell'editor: fallback sull'indice originale quando `order`
  // manca. Evita che eventi legacy (creati prima della normalizzazione di `order`)
  // collassino tutti a `order=0` e vengano ordinati in modo "stabile ma casuale".
  const orderedBlocks = [...(event.blocks || [])]
    .map((b, i) => ({ block: b, _idx: i }))
    .sort((a, b) => ((a.block.order ?? a._idx) as number) - ((b.block.order ?? b._idx) as number))
    .map(x => x.block);

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
                // [FIX mobile gap] Le sezioni hanno già padding interno (ReadOnlyCanvas
                // mobile: 40px top/bottom; widget-branch: padding interno dei widget),
                // per cui aggiungere un `gap: 20px` sul contenitore produceva una
                // striscia bianca tra sezioni adiacenti — particolarmente visibile tra
                // due sezioni con background scuro (Busta → Video). Allineiamo mobile
                // a desktop (flush) così il colore di sezione è continuo.
                gap: 0
              }}
            >
              {orderedBlocks.map((block) => {
                const layoutPreset = block.props?.layoutPreset || "single";
                const currentScale = isMobile ? 1 : stageScale;
                const isWidget = ['map', 'gallery', 'video', 'payment', 'tableau'].includes(block.type);
                // Su mobile gallery e video cadono nel ramo LOGICAL CANVAS con
                // ReadOnlyCanvas `isMobile+isBlock`, che genera uno stream flex
                // column interleaved (stesso comportamento di SectionCanvas mobile).
                // Questo è l'unico modo per replicare FEDELMENTE i testi (layer)
                // attorno al widget: il ramo isWidget "desktop" usa overlay absolute
                // con coordinate del canvas logico 1000x400, che su mobile cadono
                // in posizioni incoerenti. Map resta nel ramo isWidget anche su
                // mobile perché non ha un widget-layer ordinabile (è fill-parent).
                const useAbsoluteWidgetBranch = isWidget && !(isMobile && (block.type === 'gallery' || block.type === 'video' || block.type === 'payment' || block.type === 'tableau'));
                const scaledHeight = (block.height || 400) * currentScale;
                const isRsvpBlock = block.type === 'rsvp';
                const rsvpFormY = isRsvpBlock
                  ? ((typeof block.widgetProps?.formY === 'number' && !isNaN(block.widgetProps.formY))
                      ? block.widgetProps.formY
                      : (block.height || 400) / 2)
                  : 0;
                // Stima (statica) della metà altezza del widget RSVP nel suo stato iniziale.
                // Usata SOLO per calcolare il paddingTop del layout in-flow così che il widget
                // parta visivamente alla stessa Y che avrebbe in editor (formY - halfH).
                // Valore ~155px logici: 200 sovrastimava l'altezza reale (toggle + campi base),
                // riducendo il padding e facendo "salire" il form sui testi decorativi in public.
                // Tenendola statica il widget NON salta quando si espande: la sezione cresce
                // semplicemente verso il basso grazie a `height: auto` + `flex-start`.
                const RSVP_WIDGET_EST_HALF = 155;
                const rsvpTopPadding = isRsvpBlock
                  ? Math.max(40, rsvpFormY - RSVP_WIDGET_EST_HALF) * currentScale
                  : 0;
                const rsvpBottomPadding = isRsvpBlock
                  ? Math.max(40, (block.height || 400) - rsvpFormY - RSVP_WIDGET_EST_HALF) * currentScale
                  : 0;
                
                // [FIX overflow widget] Su desktop i widget con widgetX/widgetY vengono
                // renderizzati `position: absolute` all'interno del wrapper: se il wrapper
                // ha `height: auto` collassa al solo `minHeight` (300px) e il contenuto
                // absolute sfora nelle sezioni adiacenti (map → payment → video si
                // sovrapponevano a catena). Per i widget fissiamo quindi l'altezza a
                // `scaledHeight` (= block.height), coerentemente con l'editor, così il
                // contenuto absolute resta contenuto e le sezioni impilate non collassano.
                const widgetFixedHeight = scaledHeight + 'px';
                return (
                  <div 
                    key={block.id || block._id}
                    className={`public-block-wrapper event-section block-type-${block.type || 'canvas'} layout-${layoutPreset}`}
                    style={{
                       position: 'relative',
                       width: '100%', 
                       height: isMobile ? 'auto' : (isRsvpBlock ? 'auto' : (scaledHeight + 'px')),
                       // Su mobile gallery/video/payment vanno in-flow con ReadOnlyCanvas
                       // mobile (padding 40px 20px già interno): imponendo un minHeight
                       // 200px si aggiungevano barre vuote sotto al widget. Per map invece
                       // teniamo 200px perché il MapWidget ha altezza naturale piccola.
                       minHeight: isMobile
                         ? (useAbsoluteWidgetBranch ? '200px' : 'auto')
                         : (isRsvpBlock ? widgetFixedHeight : 'auto'),
                       background: block.props?.bgColor || block.bgColor || 'transparent',
                       // [FIX mobile gap] Il contenitore padre `.page-canvas-area` ha già
                       // `gap: 20px` su mobile: aggiungendo qui un `marginBottom: 20px`
                       // per ogni sezione si raddoppiava lo spazio (40px) e diventava
                       // visibile sotto forma di striscia bianca tra due sezioni con
                       // background scuro adiacenti (es. Busta Digitale → Video).
                       marginBottom: 0,
                       // [FIX overflow widget] Su desktop i widget usano `hidden` così i
                       // contenuti absolute non sconfinano; su mobile `visible` resta
                       // perché lo stream è già in-flow. RSVP mantiene `visible` per
                       // permettere al form di espandersi oltre il `scaledHeight`.
                       overflow: isMobile ? (isWidget || isRsvpBlock ? 'visible' : 'hidden') : (isRsvpBlock ? 'visible' : 'hidden'),
                       display: 'flex',
                       justifyContent: 'center',
                       boxSizing: 'border-box'
                    }}
                  >
                    {useAbsoluteWidgetBranch ? (
                      /* FLUID WIDGET RENDERING - No fixed width/scale wrapper to prevent clipping */
                      <div style={{ 
                        width: '100%', 
                        height: '100%',
                        position: 'relative', 
                        zIndex: 1, 
                        // [FIX mobile gap] Su mobile la mappa cade in questo ramo
                        // (useAbsoluteWidgetBranch) e, a differenza di gallery/video/
                        // payment che passano per ReadOnlyCanvas mobile (padding
                        // 40px 20px), qui il wrapper ha padding 0 → il bottone
                        // "Apri su Google Maps" risultava attaccato alla sezione
                        // successiva ora che il gap tra sezioni è stato azzerato.
                        // Aggiungiamo 40px top/bottom al ramo mobile per allineare
                        // il respiro verticale.
                        padding: isMobile ? '40px 0' : '0 20px',
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
                            sectionBg={block.props?.bgColor || block.bgColor}
                            accentColor={block.widgetProps?.mapAccentColor || event.theme?.accent}
                            previewMobile={isMobile}
                          />
                        )}
                        {/* Gallery/Video: se l'utente ha posizionato il widget nell'editor
                            (widgetX/widgetY settati) replichiamo la stessa posizione absolute
                            qui, altrimenti fallback al layout centrato del parent flex per
                            retro-compat con gli eventi creati prima dei widget posizionabili.
                            Su mobile il posizionamento libero viene ignorato (il layout è
                            stacked a colonna, coerente con tutti gli altri blocchi). */}
                        {block.type === 'gallery' && (() => {
                          const hasPos = !isMobile
                            && typeof block.widgetProps?.widgetX === 'number'
                            && typeof block.widgetProps?.widgetY === 'number';
                          const galleryEl = (
                            <GalleryWidget
                              title={block.props?.title}
                              images={block.props?.images || []}
                              layout={block.props?.layout || 'masonry'}
                              gap={block.props?.gap ?? 12}
                              columns={block.props?.columns ?? 3}
                              accentColor={event.theme?.accent}
                              sectionBg={block.props?.bgColor || block.bgColor}
                              previewMobile={isMobile}
                              readOnly={false}
                            />
                          );
                          if (!hasPos) return galleryEl;
                          return (
                            <div style={{
                              ...widgetAbsoluteStyleFromEditorCoords(
                                block.widgetProps!.widgetX as number,
                                block.widgetProps!.widgetY as number,
                                block.height || 400
                              ),
                              width: 'min(940px, calc(100% - 40px))'
                            }}>
                              {galleryEl}
                            </div>
                          );
                        })()}
                        {block.type === 'video' && (() => {
                          const hasPos = !isMobile
                            && typeof block.widgetProps?.widgetX === 'number'
                            && typeof block.widgetProps?.widgetY === 'number';
                          const videoEl = (
                            <VideoWidget
                              title={block.props?.title}
                              videoUrl={block.props?.videoUrl}
                              autoplay={block.props?.autoplay}
                              loop={block.props?.loop}
                              controls={block.props?.controls !== false}
                              muted={block.props?.muted !== false}
                              accentColor={event.theme?.accent}
                              sectionBg={block.props?.bgColor || block.bgColor}
                              previewMobile={isMobile}
                              readOnly={false}
                            />
                          );
                          if (!hasPos) return videoEl;
                          return (
                            <div style={{
                              ...widgetAbsoluteStyleFromEditorCoords(
                                block.widgetProps!.widgetX as number,
                                block.widgetProps!.widgetY as number,
                                block.height || 400
                              ),
                              width: 'min(940px, calc(100% - 40px))'
                            }}>
                              {videoEl}
                            </div>
                          );
                        })()}
                        {block.type === 'tableau' && (() => {
                          const hasPos = !isMobile
                            && typeof block.widgetProps?.widgetX === 'number'
                            && typeof block.widgetProps?.widgetY === 'number';
                          const tableauEl = (
                            <TableauWidget
                              block={block}
                              isEditor={false}
                              hasTableauAccess={!!event?.addons?.tableau}
                            />
                          );
                          if (!hasPos) return tableauEl;
                          return (
                            <div style={{
                              ...widgetAbsoluteStyleFromEditorCoords(
                                block.widgetProps!.widgetX as number,
                                block.widgetProps!.widgetY as number,
                                block.height || 400
                              ),
                              width: 'min(1000px, calc(100% - 40px))'
                            }}>
                              {tableauEl}
                            </div>
                          );
                        })()}
                        {block.type === 'payment' && (() => {
                          const hasPos = !isMobile
                            && typeof block.widgetProps?.widgetX === 'number'
                            && typeof block.widgetProps?.widgetY === 'number';
                          const paymentEl = (
                            <PaymentWidget
                              eventSlug={slug}
                              title={block.widgetProps?.paymentTitle}
                              description={block.widgetProps?.paymentDescription}
                              presetAmounts={block.widgetProps?.paymentPresetAmounts}
                              minAmount={block.widgetProps?.paymentMinAmount}
                              maxAmount={block.widgetProps?.paymentMaxAmount}
                              targetAmount={block.widgetProps?.paymentTargetAmount}
                              showProgress={block.widgetProps?.paymentShowProgress}
                              accentColor={block.widgetProps?.paymentAccentColor || event.theme?.accent}
                              mode={block.widgetProps?.paymentMode}
                              ctaLabel={block.widgetProps?.paymentCtaLabel}
                              allowCustomAmount={block.widgetProps?.paymentAllowCustomAmount !== false}
                              sectionBg={block.props?.bgColor || block.bgColor}
                              previewMobile={isMobile}
                              readOnly={false}
                              onClickDonate={(amt) => setDonationModal({ open: true, block, defaultAmount: amt })}
                            />
                          );
                          if (!hasPos) return paymentEl;
                          return (
                            <div style={{
                              ...widgetAbsoluteStyleFromEditorCoords(
                                block.widgetProps!.widgetX as number,
                                block.widgetProps!.widgetY as number,
                                block.height || 400
                              ),
                              width: 'min(620px, calc(100% - 40px))'
                            }}>
                              {paymentEl}
                            </div>
                          );
                        })()}
                        {/* WIDGET OVERLAY LAYERS (es. testi draggabili RSVP).
                            [FIX visibilità] aggiunto filtro `hiddenMobile/hiddenDesktop`:
                            prima il flag era salvato dal toggle in PropertyPanel ma
                            ignorato su tutti e 3 i path del public → i layer restavano
                            sempre visibili indipendentemente dalla vista. */}
                        {event.layers && event.canvas && (
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
                            <ReadOnlyCanvas 
                              layers={event.layers.filter(l => {
                                if (isMobile ? l.hiddenMobile : l.hiddenDesktop) return false;
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
                    ) : !isMobile && isRsvpBlock ? (
                      /* RSVP DESKTOP — LAYOUT IN-FLOW
                         Il widget vive in normal flow dentro un flex-column con paddingTop
                         calcolato per farlo apparire visivamente dove l'autore lo ha messo
                         nell'editor (formY − halfWidget estimato). Se il form espande
                         dinamicamente (es. "Sì allergie"), il widget cresce in basso e la
                         sezione cresce insieme a lui (`height: auto`) senza sovrapporsi ai
                         testi decorativi, che restano assoluti alle loro y logiche. */
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: MAX_CANVA_WIDTH + 'px',
                        minHeight: scaledHeight + 'px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        paddingTop: rsvpTopPadding + 'px',
                        paddingBottom: rsvpBottomPadding + 'px',
                        boxSizing: 'border-box',
                        zIndex: 1
                      }}>
                        {/* Overlay text layer decorativi (assoluti, non in flusso).
                            Filtro visibilità: rispetta i flag `hiddenDesktop` nella
                            path RSVP-desktop (qui `isMobile` è già false per rami). */}
                        {event.layers && event.canvas && (() => {
                          const bId = block.id || block._id;
                          const decorativeLayers = event.layers.filter(l => {
                            if (!l.blockId) return false;
                            if (l.hiddenDesktop) return false;
                            return l.blockId === bId;
                          });
                          if (decorativeLayers.length === 0) return null;
                          return (
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: '50%',
                              transform: `translateX(-50%) scale(${currentScale})`,
                              transformOrigin: 'top center',
                              width: LOGICAL_WIDTH + 'px',
                              height: (block.height || 400) + 'px',
                              pointerEvents: 'none',
                              zIndex: 2
                            }}>
                              <ReadOnlyCanvas
                                layers={decorativeLayers}
                                canvasProps={{ ...event.canvas, height: block.height || 400, bgImage: null, bgColor: 'transparent' }}
                                isMobile={false}
                                isBlock={true}
                              />
                            </div>
                          );
                        })()}
                        {/* Widget RSVP in flusso naturale, centrato orizzontalmente */}
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', zIndex: 3, position: 'relative' }}>
                          <RSVPWidget
                            block={block}
                            theme={event.theme}
                            eventSlug={slug || ""}
                            isMobile={false}
                            sectionBg={block.props?.bgColor || block.bgColor || '#ffffff'}
                          />
                        </div>
                      </div>
                    ) : (
                      /* LOGICAL CANVAS RENDERING - Uses scaling for precise layer positioning. */
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
                                if (isMobile ? l.hiddenMobile : l.hiddenDesktop) return false;
                                const bId = block.id || block._id;
                                if (!l.blockId) {
                                  if (bId) return false;
                                  if (block.type !== 'canvas') return false;
                                  return true;
                                }
                                return l.blockId === bId;
                              }),
                              ...(block.type === 'rsvp' ? [{
                                id: widgetLayerIdForBlock(String(block.id || block._id)),
                                type: 'custom-widget' as any,
                                blockId: block.id || block._id || '',
                                mobileOrder: block.widgetProps?.mobileOrder ?? 5,
                                x: (typeof block.widgetProps?.formX === 'number' && !isNaN(block.widgetProps.formX)) ? block.widgetProps.formX : 500,
                                y: (typeof block.widgetProps?.formY === 'number' && !isNaN(block.widgetProps.formY)) ? block.widgetProps.formY : (block.height || 400) / 2,
                                z: 5
                              }] : []),
                              // Gallery/Video mobile: iniettiamo un custom-widget nello
                              // stream mobile del ReadOnlyCanvas così il widget vive
                              // in-flow tra i layer testo (ordinati per mobileOrder),
                              // esattamente come SectionCanvas mobile fa nell'editor.
                              ...(isMobile && (block.type === 'gallery' || block.type === 'video' || block.type === 'payment') ? [{
                                id: widgetLayerIdForBlock(String(block.id || block._id)),
                                type: 'custom-widget' as any,
                                blockId: block.id || block._id || '',
                                mobileOrder: block.widgetProps?.mobileOrder ?? 5,
                                x: 500,
                                y: (block.height || 400) / 2,
                                z: 5
                              }] : [])
                            ]}
                            renderCustomLayer={(layer) => {
                              if (layer.type === 'custom-widget' && block.type === 'rsvp') {
                                return (
                                  <div style={{ pointerEvents: 'auto' }}>
                                    <RSVPWidget
                                      block={block}
                                      theme={event.theme}
                                      eventSlug={slug || ""}
                                      isMobile={isMobile}
                                      sectionBg={block.props?.bgColor || block.bgColor || '#ffffff'}
                                    />
                                  </div>
                                );
                              }
                              if (layer.type === 'custom-widget' && block.type === 'gallery') {
                                return (
                                  <div style={{ pointerEvents: 'auto' }}>
                                    <GalleryWidget
                                      title={block.props?.title}
                                      images={block.props?.images || []}
                                      layout={block.props?.layout || 'masonry'}
                                      gap={block.props?.gap ?? 12}
                                      columns={block.props?.columns ?? 3}
                                      accentColor={event.theme?.accent}
                                      sectionBg={block.props?.bgColor || block.bgColor}
                                      previewMobile={isMobile}
                                      readOnly={false}
                                    />
                                  </div>
                                );
                              }
                              if (layer.type === 'custom-widget' && block.type === 'video') {
                                return (
                                  <div style={{ pointerEvents: 'auto' }}>
                                    <VideoWidget
                                      title={block.props?.title}
                                      videoUrl={block.props?.videoUrl}
                                      autoplay={block.props?.autoplay}
                                      loop={block.props?.loop}
                                      controls={block.props?.controls !== false}
                                      muted={block.props?.muted !== false}
                                      accentColor={event.theme?.accent}
                                      sectionBg={block.props?.bgColor || block.bgColor}
                                      previewMobile={isMobile}
                                      readOnly={false}
                                    />
                                  </div>
                                );
                              }
                              if (layer.type === 'custom-widget' && block.type === 'payment') {
                                return (
                                  <div style={{ pointerEvents: 'auto' }}>
                                    <PaymentWidget
                                      eventSlug={slug}
                                      title={block.widgetProps?.paymentTitle}
                                      description={block.widgetProps?.paymentDescription}
                                      presetAmounts={block.widgetProps?.paymentPresetAmounts}
                                      minAmount={block.widgetProps?.paymentMinAmount}
                                      maxAmount={block.widgetProps?.paymentMaxAmount}
                                      targetAmount={block.widgetProps?.paymentTargetAmount}
                                      showProgress={block.widgetProps?.paymentShowProgress}
                                      accentColor={block.widgetProps?.paymentAccentColor || event.theme?.accent}
                                      mode={block.widgetProps?.paymentMode}
                                      ctaLabel={block.widgetProps?.paymentCtaLabel}
                                      allowCustomAmount={block.widgetProps?.paymentAllowCustomAmount !== false}
                                      sectionBg={block.props?.bgColor || block.bgColor}
                                      previewMobile={isMobile}
                                      readOnly={false}
                                      onClickDonate={(amt) => setDonationModal({ open: true, block, defaultAmount: amt })}
                                    />
                                  </div>
                                );
                              }
                              if (layer.type === 'custom-widget' && block.type === 'tableau') {
                                return (
                                  <div style={{ pointerEvents: 'auto', width: '100%' }}>
                                    <TableauWidget
                                      block={block}
                                      isEditor={false}
                                      hasTableauAccess={!!event?.addons?.tableau}
                                    />
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

      {donationModal.open && donationModal.block && (
        <DonationModal
          open={donationModal.open}
          onClose={() => setDonationModal({ open: false })}
          eventSlug={slug || ''}
          eventTitle={event?.title || ''}
          presetAmounts={donationModal.block.widgetProps?.paymentPresetAmounts}
          defaultAmount={donationModal.defaultAmount}
          minAmount={donationModal.block.widgetProps?.paymentMinAmount}
          maxAmount={donationModal.block.widgetProps?.paymentMaxAmount}
          accentColor={donationModal.block.widgetProps?.paymentAccentColor || event?.theme?.accent || '#1a1a1a'}
          mode={donationModal.block.widgetProps?.paymentMode || 'gift'}
          thankYouMessage={donationModal.block.widgetProps?.paymentThankYouMessage}
          allowCustomAmount={donationModal.block.widgetProps?.paymentAllowCustomAmount !== false}
        />
      )}
    </div>
  );
}
