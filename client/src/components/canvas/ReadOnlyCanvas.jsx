import { useEffect, useState, useRef } from "react";
import { loadGoogleFont } from "../../pages/Editor/components/EditorHelpers";

const ReadOnlyCanvas = ({ layers, canvasProps }) => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const [bgNaturalSize, setBgNaturalSize] = useState({ w: 0, h: 0 });

  // Load Google Fonts for all layers
  useEffect(() => {
    layers.forEach(layer => {
      const isText = layer.type === 'text' || !layer.type;
      if (isText && layer.fontFamily) {
        loadGoogleFont(layer.fontFamily);
      }
    });
  }, [layers]);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
         let w = containerRef.current.parentElement.offsetWidth;
         let h = containerRef.current.parentElement.offsetHeight;
         
         if (!w || w === 0) w = Math.min(window.innerWidth - 32, 600);
         if (!h || h === 0) h = window.innerHeight * 0.8;

         const scaleW = w / canvasProps.width;
         const scaleH = h / canvasProps.height;
         setScale(Math.min(scaleW, scaleH));
      }
    };
    updateScale();
    setTimeout(updateScale, 50);
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [canvasProps.width, canvasProps.height]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
       <div style={{
         width: canvasProps.width, 
         height: canvasProps.height,
         flexShrink: 0,
         transformOrigin: "center center",
         transform: `scale(${scale})`,
         backgroundColor: canvasProps.bgColor || '#ffffff',
         position: 'relative',
         overflow: 'hidden',
         boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
         borderRadius: "4px"
       }}>
          {/* Background Image Layer Sync with Editor */}
          {canvasProps.bgImage && (
            <div style={{
              position: 'absolute',
              left: (canvasProps.bgX || 0),
              top: (canvasProps.bgY || 0),
              width: bgNaturalSize.w * (canvasProps.bgScale || 1),
              height: bgNaturalSize.h * (canvasProps.bgScale || 1),
              opacity: canvasProps.bgOpacity ?? 1,
              pointerEvents: 'none',
              zIndex: 0
            }}>
              <img 
                src={canvasProps.bgImage} 
                alt="" 
                style={{ width: '100%', height: '100%', display: 'block' }}
                onLoad={(e) => {
                  setBgNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight });
                }}
              />
            </div>
          )}
          {layers.map(layer => {
            const isText = layer.type === 'text' || !layer.type;
            return (
              <div 
               key={layer.id} 
               style={{
                 position: 'absolute',
                 left: layer.x === 'center' || isNaN(layer.x) ? '50%' : (layer.x + 'px'),
                 top: layer.y === 'center' || isNaN(layer.y) ? '50%' : (layer.y + 'px'),
                 transform: 'translate(-50%, -50%)',
                 width: isText ? 'max-content' : (layer.w + 'px'),
                 height: isText ? 'auto' : (layer.h + 'px'),
                 fontSize: (layer.fontSize || 32) + 'px',
                 fontFamily: layer.fontFamily,
                 fontWeight: layer.fontWeight || "normal",
                 fontStyle: layer.fontStyle || "normal",
                 textDecoration: layer.textDecoration || "none",
                 letterSpacing: (layer.letterSpacing || 0) + 'px',
                 lineHeight: layer.lineHeight || 1.2,
                 color: layer.color,
                 textAlign: layer.textAlign,
                 zIndex: layer.z || 1,
                 display: 'block'
               }}
             >
               {isText ? (
                 <div 
                   style={{ outline: 'none', whiteSpace: 'nowrap', paddingBottom: '0.15em' }}
                   dangerouslySetInnerHTML={{ __html: layer.text }} 
                 />
               ) : (
                 <img 
                   src={layer.src} 
                   style={{ width: layer.w || '100%', height: layer.h || '100%', objectFit: 'contain', display: 'block' }} 
                   alt="" 
                 />
               )}
              </div>
            )
          })}
       </div>
    </div>
  );
};

export default ReadOnlyCanvas;
