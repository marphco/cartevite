import React from "react";
import type { PrebuiltTemplate } from "../../utils/layoutSchema";
import type { Layer, Block } from "../../types/editor";
import ReadOnlyCanvas from "../../components/canvas/ReadOnlyCanvas";
import EnvelopeAnimation from "../../components/envelope/EnvelopeAnimation";
import { widgetLayerIdForBlock } from "../../utils/widgetLayerId";

interface Props {
  template: PrebuiltTemplate;
}

export default function TemplateEventPageMiniPreview({ template }: Props) {
  const { blocks, layers, theme, canvas } = template;

  // Renderizziamo una versione super semplificata dei blocchi
  return (
    <div className="tc-mini-page">
      {/* HERO SECTION */}
      <section 
        className="tc-mini-hero"
        style={{
          backgroundColor: theme.background || "#fff",
          padding: "40px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px"
        }}
      >
        <div style={{ transform: "scale(0.35)", transformOrigin: "top center", height: "180px" }}>
           <EnvelopeAnimation 
              envelopeFormat={(theme as any).envelopeFormat || 'vertical'}
              envelopeColor={theme.accent || '#1ABC9C'}
              linerImg={null}
              pocketColor={theme.accent || '#1ABC9C'}
              pocketLinerImg={null}
              linerColor="#ffffff"
              canvasProps={canvas}
              manualPhase="extracted"
              preview
              isBuilder
              isMobile={true}
              scale={1}
            >
               <ReadOnlyCanvas layers={layers as any} canvasProps={canvas as any} />
            </EnvelopeAnimation>
        </div>
      </section>

      {/* DYNAMIC BLOCKS */}
      {(blocks || []).map((block: any) => (
        <section 
          key={block.id} 
          className="tc-mini-block"
          style={{
            padding: "24px 16px",
            background: "#fff",
            borderTop: "1px solid rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          {block.type === 'map' && (
            <div className="tc-mini-block__map">
              <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "8px", color: "#1a1a1a" }}>{block.props?.title || "Dove & Quando"}</div>
              <div style={{ width: "100%", height: "80px", background: "#f0f0f0", borderRadius: "8px", display: "grid", placeItems: "center" }}>
                <span style={{ fontSize: "10px", color: "#888" }}>Anteprima Mappa</span>
              </div>
            </div>
          )}
          
          {block.type === 'rsvp' && (
            <div className="tc-mini-block__rsvp">
              <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "8px", color: "#1a1a1a" }}>Conferma la tua presenza</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ height: "30px", background: "#f8f8f8", borderRadius: "4px" }} />
                <div style={{ height: "30px", background: "#f8f8f8", borderRadius: "4px" }} />
                <div style={{ height: "36px", background: theme.accent, borderRadius: "4px", marginTop: "4px" }} />
              </div>
            </div>
          )}

          {block.type === 'photo' && (
            <div className="tc-mini-block__photo">
              <div style={{ width: "100%", height: "120px", background: "#f5f5f5", borderRadius: "8px" }} />
            </div>
          )}

          {block.type === 'text' && (
             <div className="tc-mini-block__text">
                <div style={{ height: "10px", width: "40%", background: "#eee", borderRadius: "4px", marginBottom: "8px" }} />
                <div style={{ height: "8px", width: "90%", background: "#f5f5f5", borderRadius: "4px", marginBottom: "4px" }} />
                <div style={{ height: "8px", width: "85%", background: "#f5f5f5", borderRadius: "4px" }} />
             </div>
          )}
        </section>
      ))}

      {/* FOOTER PLACEHOLDER */}
      <div style={{ padding: "30px 20px", textAlign: "center", color: "#ccc", fontSize: "10px" }}>
        eenvee &copy; 2026
      </div>
    </div>
  );
}
