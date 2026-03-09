import { useEffect, useState, useRef } from "react";

const ReadOnlyCanvas = ({ layers, canvasProps }) => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

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
         backgroundImage: canvasProps.bgImage ? `url(${canvasProps.bgImage})` : 'none',
         backgroundColor: canvasProps.bgImage ? 'transparent' : '#fff',
         backgroundSize: 'cover',
         position: 'relative',
         overflow: 'hidden',
         boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
         borderRadius: "4px"
       }}>
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
