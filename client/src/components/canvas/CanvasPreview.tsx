import React, { useEffect } from "react";
import type { Layer, CanvasProps } from "../../types/editor";

const loadGoogleFont = (fontFamily: string) => {
  if (!fontFamily) return;
  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-')}`;
  if (document.getElementById(fontId)) return;
  const link = document.createElement("link");
  link.id = fontId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
};

interface CanvasPreviewProps {
  canvas: CanvasProps;
  layers: Layer[];
  /** Anteprima in griglia catalogo: scala dentro un box fisso senza alterare proporzioni canvas. */
  catalogThumb?: boolean;
}

export default function CanvasPreview({ canvas, layers, catalogThumb = false }: CanvasPreviewProps) {
  useEffect(() => {
    (layers || []).forEach(l => {
      if (l.fontFamily) loadGoogleFont(l.fontFamily);
    });
  }, [layers]);

  if (!canvas) return null;
  
  // Fallback to 800x1000 if not specified
  const width = canvas.width || 800;
  const height = canvas.height || 1000;

  /**
   * Catalogo: riempie la larghezza del contenitore e si adatta in altezza (max 100%)
   * mantenendo l'aspect-ratio del canvas. Evita collasso a 0×0 di `cqi`.
   */
  const boxStyle: React.CSSProperties = catalogThumb
    ? {
        containerType: "inline-size",
        width: "100%",
        height: "auto",
        maxHeight: "100%",
        aspectRatio: `${width} / ${height}`,
        backgroundColor: canvas.bgImage ? "transparent" : canvas.bgColor || "#fff",
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--radius-md)",
        flexShrink: 0,
      }
    : {
        containerType: "inline-size",
        width: "100%",
        maxWidth: `${width}px`,
        aspectRatio: `${width} / ${height}`,
        backgroundColor: canvas.bgImage ? "transparent" : canvas.bgColor || "#fff",
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--radius-md) var(--radius-md) 0 0",
      };

  return (
    <div style={boxStyle}>
      {canvas.bgImage && (
        <div style={{
          position: "absolute",
          left: `${((canvas.bgX || 0) / width) * 100}%`,
          top: `${((canvas.bgY || 0) / height) * 100}%`,
          // Note: we can't easily get natural size here, so we might still need cover fallback 
          // OR we trust the browser if the editor has already calculated and saved the values.
          // For now, let's use a robust implementation using object-fit if no scale/offsets, 
          // but if they exist, use them as percentages of the canvas.
          width: canvas.bgScale ? `${(canvas.bgScale * 100)}%` : '100%',
          height: canvas.bgScale ? 'auto' : '100%',
          display: 'block',
          zIndex: 0,
          pointerEvents: 'none'
        } as React.CSSProperties}>
          <img src={canvas.bgImage} style={{ 
            width: canvas.bgScale ? '100%' : '100%', 
            height: canvas.bgScale ? 'auto' : '100%', 
            objectFit: canvas.bgScale ? 'initial' : 'cover'
          }} alt="" />
        </div>
      )}
      {(layers || []).map(layer => {
        const lWidth = layer.width || layer.w;
        const isMaxContent = lWidth === 'max-content';
        const layerX = layer.x === 'center' ? '50%' : `${((layer.x as number) / width) * 100}%`;
        const layerY = layer.y === 'center' ? '50%' : `${((layer.y as number) / height) * 100}%`;
        
        return (
          <div key={layer.id} style={{
            position: "absolute",
            left: layerX,
            top: layerY,
            transform: 'translate(-50%, -50%)',
            width: isMaxContent ? 'max-content' : `${((lWidth as number) / width) * 100}%`,
            fontSize: `${((layer.fontSize || 32) / width) * 100}cqi`,
            fontFamily: layer.fontFamily,
            fontWeight: layer.fontWeight || "normal",
            fontStyle: layer.fontStyle || "normal",
            textDecoration: layer.textDecoration || "none",
            letterSpacing: `${(layer.letterSpacing || 0) / width * 100}cqi`,
            lineHeight: layer.lineHeight || 1.2,
            color: layer.color,
            textAlign: layer.textAlign,
            whiteSpace: 'pre-wrap',
          } as React.CSSProperties}>
            {layer.text}
          </div>
        );
      })}
    </div>
  );
}
