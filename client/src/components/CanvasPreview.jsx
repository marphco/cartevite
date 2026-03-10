import { useEffect } from "react";

const loadGoogleFont = (fontFamily) => {
  if (!fontFamily) return;
  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-')}`;
  if (document.getElementById(fontId)) return;
  const link = document.createElement("link");
  link.id = fontId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
};

export default function CanvasPreview({ canvas, layers }) {
  useEffect(() => {
    (layers || []).forEach(l => {
      if (l.fontFamily) loadGoogleFont(l.fontFamily);
    });
  }, [layers]);

  if (!canvas) return null;
  // Fallback to 800x1000 if not specified
  const width = canvas.width || 800;
  const height = canvas.height || 1000;

  return (
    <div style={{ 
      containerType: "inline-size", 
      width: "100%", 
      aspectRatio: `${width} / ${height}`,
      backgroundImage: canvas.bgImage ? `url(${canvas.bgImage})` : 'none',
      backgroundColor: canvas.bgImage ? 'transparent' : '#fff',
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "relative",
      overflow: "hidden",
      borderRadius: "var(--radius-md) var(--radius-md) 0 0"
    }}>
      {(layers || []).map(layer => {
        return (
          <div key={layer.id} style={{
            position: "absolute",
            left: layer.x === 'center' ? '50%' : `${(layer.x / width) * 100}%`,
            top: layer.y === 'center' ? '50%' : `${(layer.y / height) * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: layer.width === 'max-content' ? 'max-content' : `${(layer.width / width) * 100}%`,
            fontSize: `${(layer.fontSize / width) * 100}cqi`,
            fontFamily: layer.fontFamily,
            fontWeight: layer.fontWeight || "normal",
            fontStyle: layer.fontStyle || "normal",
            textDecoration: layer.textDecoration || "none",
            letterSpacing: `${(layer.letterSpacing || 0) / width * 100}cqi`,
            lineHeight: layer.lineHeight || 1.2,
            color: layer.color,
            textAlign: layer.textAlign,
            whiteSpace: layer.width === 'max-content' ? 'nowrap' : 'pre-wrap',
          }}>
            {layer.text}
          </div>
        );
      })}
    </div>
  );
}
