import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { PrebuiltTemplate } from "../../utils/layoutSchema";
import type { Layer, Block } from "../../types/editor";
import ReadOnlyCanvas from "../../components/canvas/ReadOnlyCanvas";
import EnvelopeAnimation from "../../components/envelope/EnvelopeAnimation";
import { RSVPWidget } from "../Editor/components/widgets/RSVPWidget";
import MapWidget from "../Editor/components/widgets/MapWidget";
import GalleryWidget from "../Editor/components/widgets/GalleryWidget";
import VideoWidget from "../Editor/components/widgets/VideoWidget";
import PaymentWidget from "../Editor/components/widgets/PaymentWidget";
import ScrollHint from "../../components/ui/ScrollHint";
import { Button } from "../../ui";
import InviteFormatPicker from "./InviteFormatPicker";
import {
  UPLOAD_CUSTOM_TEMPLATE_ID,
  applyUploadFormatToTemplate,
  buildCanvasPropsForPreview,
  envelopeColorsFromTemplate,
  type InviteUploadFormat,
} from "./templateCatalogUtils";

type Props = {
  template: PrebuiltTemplate | null;
  onClose: () => void;
  onContinue: (templateId: string, inviteFormat?: InviteUploadFormat) => void;
};

/**
 * Set completo di blocchi "showcase" che rappresentano TUTTE le funzionalità
 * della pagina evento. Usato da ogni anteprima indipendentemente dai blocchi
 * definiti nel template, così l'utente vede il valore completo dell'offerta.
 * Quando aggiungi un nuovo tipo di blocco nell'editor (es. tableau, libretto),
 * aggiungilo anche qui per includerlo automaticamente in ogni preview.
 */
const SHOWCASE_BLOCKS: Block[] = [
  {
    id: "showcase-map",
    type: "map",
    y: 0,
    order: 1,
    height: 560,
    props: { title: "Dove & Quando", address: "", bgColor: "#ffffff" },
  },
  {
    id: "showcase-gallery",
    type: "gallery",
    y: 0,
    order: 2,
    height: 500,
    props: { title: "La Nostra Galleria", images: [], layout: "masonry", bgColor: "#f9f9f9" },
  },
  {
    id: "showcase-video",
    type: "video",
    y: 0,
    order: 3,
    height: 500,
    props: { title: "I Nostri Video", videoUrl: "", bgColor: "#1a1e26" },
  },
  {
    id: "showcase-rsvp",
    type: "rsvp",
    y: 0,
    order: 4,
    height: 600,
    props: { bgColor: "#111114" },
    widgetProps: { formY: 360 },
  },
  {
    id: "showcase-payment",
    type: "payment",
    y: 0,
    order: 5,
    height: 500,
    props: { bgColor: "#ffffff" },
    widgetProps: {
      paymentTitle: "Regalo Digitale",
      paymentDescription: "Fai un pensiero speciale per l'occasione",
      paymentPresetAmounts: [50, 100, 150, 200],
      paymentMode: "gift",
      paymentCtaLabel: "Fai un regalo",
      paymentShowProgress: true,
      paymentTargetAmount: 5000,
    },
  },
];

export default function TemplateCatalogPreviewModal({ template, onClose, onContinue }: Props) {
  const [narrow, setNarrow] = useState(false);
  const [uploadFormat, setUploadFormat] = useState<InviteUploadFormat>("square");
  const [isInvitationOpened, setIsInvitationOpened] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const isUpload = template?.id === UPLOAD_CUSTOM_TEMPLATE_ID;
  const displayTemplate = isUpload
    ? applyUploadFormatToTemplate(template as PrebuiltTemplate, uploadFormat)
    : template;

  /* ---- Responsive ---- */
  useEffect(() => {
    if (!template) return;
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [template]);

  useEffect(() => {
    if (template?.id === UPLOAD_CUSTOM_TEMPLATE_ID) setUploadFormat("square");
  }, [template?.id]);

  /* Reset envelope state when template changes */
  useEffect(() => {
    setIsInvitationOpened(false);
  }, [template?.id]);

  /* ---- Keyboard / scroll lock ---- */
  useEffect(() => {
    if (!template) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [template, onClose]);

  if (!template || !displayTemplate) return null;

  const canvasProps = buildCanvasPropsForPreview(displayTemplate as PrebuiltTemplate);
  const layers = (displayTemplate as PrebuiltTemplate).layers as unknown as Layer[];
  const heroBg = displayTemplate.theme.background || "#fdfbf7";
  const { envelopeColor, pocketColor, linerColor } = envelopeColorsFromTemplate(
    displayTemplate as PrebuiltTemplate
  );
  const envFormat = (displayTemplate.theme as { envelopeFormat?: "horizontal" | "vertical" })
    .envelopeFormat;
  const isSquare =
    canvasProps.width &&
    canvasProps.height &&
    Math.abs(canvasProps.width - canvasProps.height) < 12;
  const accent = displayTemplate.theme.accent || "#1ABC9C";

  return (
    <div
      className="tc-preview-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tc-preview-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`tc-preview-dialog${isUpload ? " tc-preview-dialog--upload" : ""}`}>
        <button type="button" className="tc-preview-close" onClick={onClose} aria-label="Chiudi">
          <X size={22} strokeWidth={2.2} />
        </button>

        {/* ── SCROLLABLE PAGE PREVIEW ── */}
        <div className="tc-fullpage-scroll">
          {/* HEADER */}
          <header className="tc-preview-head">
            <h2 id="tc-preview-title" className="tc-preview-title">
              {isUpload ? (
                <>
                  <span className="tc-preview-title__cat">Il tuo file</span>
                  <span className="tc-preview-title__sep" aria-hidden="true" />
                  <span className="tc-preview-title__name">Carica il tuo file</span>
                </>
              ) : (
                <>
                  <span className="tc-preview-title__cat">{template.category}</span>
                  <span className="tc-preview-title__sep" aria-hidden="true" />
                  <span className="tc-preview-title__name">{template.name}</span>
                </>
              )}
            </h2>
          </header>

          {isUpload ? (
            <div className="tc-preview-upload">
              <InviteFormatPicker
                value={uploadFormat}
                onChange={setUploadFormat}
                heading="Scegli il formato dell'invito e la busta che preferisci"
              />
            </div>
          ) : null}

          {/* ── 1. HERO: Busta animata centrata (come pagina pubblica) ── */}
          <div
            ref={heroRef}
            className="tc-fullpage-hero"
            style={{ backgroundColor: heroBg }}
          >
            <div style={{
              position: 'relative',
              zIndex: 2,
              transform: `scale(${narrow ? 0.55 : 0.75})`,
              transformOrigin: 'center center',
              marginTop: !narrow
                ? (envFormat === 'vertical' ? '60px' : (isSquare ? '40px' : '0'))
                : '0'
            }}>
              <EnvelopeAnimation
                envelopeFormat={isSquare ? undefined : envFormat || "vertical"}
                envelopeColor={envelopeColor}
                pocketColor={pocketColor}
                linerImg={null}
                pocketLinerImg={null}
                linerColor={linerColor}
                canvasProps={canvasProps}
                isEventPage={true}
                onOpenComplete={() => setIsInvitationOpened(true)}
              >
                <ReadOnlyCanvas layers={layers} canvasProps={canvasProps} />
              </EnvelopeAnimation>
            </div>

            {isInvitationOpened && (
              <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                <ScrollHint isMobile={narrow} color={accent} />
              </div>
            )}
          </div>

          {/* ── 2. SHOWCASE BLOCKS: tutte le funzionalità disponibili ── */}
          <div className="tc-fullpage-blocks">
            {SHOWCASE_BLOCKS.map((block) => {
              const blockBg = block.props?.bgColor || "#ffffff";
              return (
                <div
                  key={block.id}
                  className="tc-fullpage-block"
                  style={{ background: blockBg }}
                >
                  {block.type === "map" && (
                    <div className="tc-fullpage-widget-wrap">
                      <MapWidget
                        address=""
                        title={block.props?.title || "Dove & Quando"}
                        zoom={15}
                        sectionBg={blockBg}
                        accentColor={accent}
                        previewMobile={narrow}
                      />
                    </div>
                  )}

                  {block.type === "gallery" && (
                    <div className="tc-fullpage-widget-wrap">
                      <GalleryWidget
                        title={block.props?.title}
                        images={[]}
                        layout="masonry"
                        gap={12}
                        columns={3}
                        accentColor={accent}
                        sectionBg={blockBg}
                        previewMobile={narrow}
                        readOnly
                      />
                    </div>
                  )}

                  {block.type === "video" && (
                    <div className="tc-fullpage-widget-wrap">
                      <VideoWidget
                        title={block.props?.title}
                        videoUrl=""
                        autoplay={false}
                        loop={false}
                        controls
                        muted
                        accentColor={accent}
                        sectionBg={blockBg}
                        previewMobile={narrow}
                        readOnly
                      />
                    </div>
                  )}

                  {block.type === "rsvp" && (
                    <div className="tc-fullpage-widget-wrap">
                      <RSVPWidget
                        block={block}
                        theme={displayTemplate.theme as any}
                        eventSlug=""
                        isMobile={narrow}
                        sectionBg={blockBg}
                        readOnly
                      />
                    </div>
                  )}

                  {block.type === "payment" && (
                    <div className="tc-fullpage-widget-wrap">
                      <PaymentWidget
                        eventSlug=""
                        title={block.widgetProps?.paymentTitle}
                        description={block.widgetProps?.paymentDescription}
                        presetAmounts={block.widgetProps?.paymentPresetAmounts}
                        targetAmount={block.widgetProps?.paymentTargetAmount}
                        showProgress={block.widgetProps?.paymentShowProgress}
                        accentColor={accent}
                        mode={block.widgetProps?.paymentMode}
                        ctaLabel={block.widgetProps?.paymentCtaLabel}
                        allowCustomAmount
                        sectionBg={blockBg}
                        previewMobile={narrow}
                        readOnly
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── FOOTER STICKY ── */}
        <footer className="tc-preview-footer">
          <div className="tc-preview-footer__inner">
            <div className="tc-preview-price-tag">
              <span className="tc-preview-price-label">Prezzo modello</span>
              <span className="tc-preview-price-value">€49.00</span>
            </div>
            <div className="tc-preview-actions">
              <Button
                type="button"
                variant="primary"
                className="tc-preview-buy-btn"
                onClick={() =>
                  isUpload
                    ? onContinue(template.id, uploadFormat)
                    : onContinue(template.id)
                }
              >
                {isUpload ? "Continua" : "Acquista e personalizza"}
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
