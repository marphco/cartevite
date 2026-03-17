import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import "./EnvelopeAnimation.css";

export default function EnvelopeAnimation({ 
  children, preview = false, guestName = "", envelopeColor = "#54392d", 
  linerImg = "/minimal_pink_liner.png", pocketLinerImg = null,
  pocketColor = null,
  canvasProps = null, onOpenComplete,
  editMode = false, manualPhase = null,
  linerX = 0, linerY = 0, linerScale = 1,
  isEditingLiner = false,
  onLinerChange = () => {},
  linerOpacity = 1,
  linerColor = null,
  scale: externalScale = null
}) {
  const sceneRef = useRef(null);
  const [phase, setPhase] = useState(preview ? "extracted" : "closed"); 

  // Sync with manualPhase if provided
  useEffect(() => {
    if (manualPhase) setPhase(manualPhase);
  }, [manualPhase]);

  // Robust Wheel Handling (non-passive)
  useEffect(() => {
    const el = sceneRef.current;
    if (!el || !isEditingLiner) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.95 : 1.05;
      const newScale = Math.min(Math.max(linerScale * delta, 0.1), 10);
      onLinerChange({ scale: newScale });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [isEditingLiner, linerScale, onLinerChange]);

  // Keyboard Navigation for Liner Adjustment
  useEffect(() => {
    if (!isEditingLiner) return;
    
    const handleKeyDown = (e) => {
      const step = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;
      let hasUpdate = false;
      
      switch (e.key) {
        case 'ArrowLeft': dx = -step; hasUpdate = true; break;
        case 'ArrowRight': dx = step; hasUpdate = true; break;
        case 'ArrowUp': dy = -step; hasUpdate = true; break;
        case 'ArrowDown': dy = step; hasUpdate = true; break;
        default: break;
      }
      
      if (hasUpdate) {
        e.preventDefault();
        onLinerChange({ x: linerX + dx, y: linerY + dy });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditingLiner, linerX, linerY, onLinerChange]);

  const [windowDims, setWindowDims] = useState({ w: 1000, h: 800 });
  
  const isRectangular = canvasProps?.width && canvasProps?.height && canvasProps.width < canvasProps.height;
  const envClass = isRectangular ? "env-rectangular" : "";

  useEffect(() => {
    setWindowDims({ w: window.innerWidth, h: window.innerHeight });
    const handleResize = () => setWindowDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const envBg = envelopeColor === "#111111" ? "#4a3328" : envelopeColor;
  const pColor = pocketColor ? (pocketColor === "#111111" ? "#4a3328" : pocketColor) : envBg;

  const handleClick = () => {
    if (editMode) return; // In edit mode, we control via buttons
    if (phase === "closed") {
      setPhase("flap_open"); 
      setTimeout(() => {
        setPhase("extracting"); 
        setTimeout(() => {
          setPhase("extracted"); 
          setTimeout(() => {
             if (onOpenComplete) onOpenComplete();
          }, 800);
        }, 800); 
      }, 800);
    }
  };

  const fallbackLiner = "url('/minimal_pink_liner.png')";

  return (
    <div className={`paperless-wrapper ${phase}`}>
       <div 
         className="envelope-hero"
         onClick={handleClick}
       >
         <motion.div 
           ref={sceneRef}
           className={`envelope-3d-scene ${envClass} ${isEditingLiner ? 'is-editing-liner' : ''}`}
           initial={{ y: 0, scale: 1 }}
           animate={{ 
             y: externalScale !== null 
                ? ((phase === "flap_open" || phase === "extracting") ? 0.3 * (isRectangular ? 428.5 : 500) * externalScale : 0)
                : (phase === "extracted" ? windowDims.h * 0.05 : (phase === "flap_open" || phase === "extracting" ? (windowDims.w <= 768 ? 65 : 20) : 0)),
             scale: externalScale !== null ? externalScale : ((windowDims.w <= 768 && (phase === "flap_open" || phase === "extracting")) ? 0.85 : 1)
           }}
           transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }} 
           style={{
             '--liner-x': `${linerX}px`,
             '--liner-y': `${linerY}px`,
             '--liner-scale': linerScale
           }}
          >
            {/* Full-stage interaction overlay for gestures when editing liner */}
            {isEditingLiner && (
              <div 
                className="liner-interaction-overlay"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.currentTarget.setPointerCapture(e.pointerId);

                  if (!window._linerPointers) window._linerPointers = new Map();
                  window._linerPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

                  const initialX = linerX;
                  const initialY = linerY;
                  const initialScale = linerScale;
                  let startX = e.clientX;
                  let startY = e.clientY;
                  let initialDist = 0;

                  const handleMove = (moveEvent) => {
                    if (!window._linerPointers.has(moveEvent.pointerId)) return;
                    window._linerPointers.set(moveEvent.pointerId, { x: moveEvent.clientX, y: moveEvent.clientY });

                    const pointers = Array.from(window._linerPointers.values());

                    if (pointers.length === 2) {
                      // Pinch-to-zoom logic
                      const dist = Math.sqrt(
                        Math.pow(pointers[1].x - pointers[0].x, 2) + 
                        Math.pow(pointers[1].y - pointers[0].y, 2)
                      );
                      if (initialDist === 0) {
                        initialDist = dist;
                        return;
                      }
                      const scaleFactor = dist / initialDist;
                      const newScale = Math.min(Math.max(initialScale * scaleFactor, 0.1), 10);
                      onLinerChange({ scale: newScale });
                    } else if (pointers.length === 1) {
                      // Drag logic (single pointer)
                      const dx = moveEvent.clientX - startX;
                      const dy = moveEvent.clientY - startY;
                      onLinerChange({ x: initialX + dx, y: initialY + dy });
                    }
                  };

                  const handleUp = (upEvent) => {
                    if (window._linerPointers) window._linerPointers.delete(upEvent.pointerId);
                    if (!window._linerPointers || window._linerPointers.size === 0) {
                      window.removeEventListener('pointermove', handleMove);
                      window.removeEventListener('pointerup', handleUp);
                      window.removeEventListener('pointercancel', handleUp);
                    }
                  };

                  window.addEventListener('pointermove', handleMove);
                  window.addEventListener('pointerup', handleUp);
                  window.addEventListener('pointercancel', handleUp);
                }}
                style={{
                  position: 'absolute',
                  inset: '-1000px', // Expand way beyond the scene
                  zIndex: 40,
                  cursor: 'move',
                  touchAction: 'none'
                }}
              />
            )}
                       {/* GHOST LINER (X-RAY VISION) + EDIT UI */}
            {isEditingLiner && (
               <>
                 {window.innerWidth > 768 && (
                   <motion.div 
                     className="liner-edit-banner"
                     initial={{ opacity: 0, y: 20, x: "-50%", z: 100 }}
                     animate={{ opacity: 1, y: 0, x: "-50%", z: 100 }}
                     exit={{ opacity: 0, y: 20, x: "-50%", z: 100 }}
                     style={window.innerWidth <= 768 ? {
                       bottom: 'auto',
                       top: '20px',
                       padding: '6px 14px',
                       background: 'rgba(0, 0, 0, 0.85)',
                       backdropFilter: 'blur(8px)',
                       border: '1px solid rgba(255, 255, 255, 0.1)',
                       borderRadius: '30px',
                       boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                     } : {}}
                   >
                     <div style={{ background: 'var(--accent)', width: window.innerWidth <= 768 ? '24px' : '32px', height: window.innerWidth <= 768 ? '24px' : '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', flexShrink: 0 }}>
                       <Sparkles size={window.innerWidth <= 768 ? 14 : 18}/>
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px', fontWeight: 700, color: window.innerWidth <= 768 ? '#fff' : '#000' }}>
                         {window.innerWidth <= 768 ? "Regolazione" : "Regolazione Interno Busta"}
                       </span>
                       <span style={{ fontSize: window.innerWidth <= 768 ? '9px' : '10px', color: window.innerWidth <= 768 ? 'rgba(255,255,255,0.7)' : '#666' }}>
                         {window.innerWidth <= 768 
                           ? "Trascina per spostare • Pizzica per zoomare" 
                           : "Trascina • Rotella zoom • Frecce tastiera (precisione)"}
                       </span>
                     </div>
   
                     {window.innerWidth > 768 && (
                       <>
                         <div style={{ width: '1px', height: '30px', background: 'rgba(0,0,0,0.1)', margin: '0 8px' }}></div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <span style={{ fontSize: '10px', fontWeight: 600, color: '#666' }}>Opacità</span>
                           <input 
                             type="range" 
                             className="custom-slider"
                             min="0" max="1" step="0.01" 
                             value={linerOpacity} 
                             onChange={(e) => onLinerChange({ opacity: parseFloat(e.target.value) })}
                             onPointerDown={(e) => e.stopPropagation()}
                             style={{ 
                               width: '80px', 
                               background: `linear-gradient(to right, var(--accent) ${Math.round(linerOpacity * 100)}%, rgba(255,255,255,0.1) ${Math.round(linerOpacity * 100)}%)`,
                               cursor: 'pointer', 
                               pointerEvents: 'auto' 
                             }}
                           />
                           <span style={{ fontSize: '10px', fontWeight: 700, minWidth: '25px', color: '#000' }}>{Math.round(linerOpacity * 100)}%</span>
                         </div>
                       </>
                     )}
                   </motion.div>
                 )}
 
                 <div 
                   className="envelope-liner-ghost" 
                   style={{ 
                     backgroundImage: (pocketLinerImg === "none" || linerImg === "none") ? "none" : `url(${pocketLinerImg || linerImg})`,
                     pointerEvents: 'none'
                   }} 
                 />
               </>
             )}


            {/* BACK OF ENVELOPE */}
           <div className="envelope-back" style={{ backgroundColor: envBg, transform: 'translateZ(0px)' }}>
             <div className="envelope-back-liner-bg" style={{ 
               backgroundColor: linerColor || envBg,
               position: 'absolute',
               inset: 0,
               clipPath: 'polygon(4% 0, 96% 0, 96% 100%, 4% 100%)',
               zIndex: 1,
               transform: 'translateZ(1px)'
             }}></div>
             <div className="envelope-back-liner" style={{ 
               backgroundImage: (pocketLinerImg === "none" || linerImg === "none") ? "none" : `url(${pocketLinerImg || linerImg})`,
               opacity: linerOpacity,
               zIndex: 2,
               transform: 'translateZ(2px)'
             }}></div>
             <motion.div 
               className="envelope-dynamic-shadow"
               initial={{ opacity: 0, scaleY: 0 }}
               animate={{ 
                 opacity: phase === "flap_open" ? 0.35 : (phase === "closed" ? 0 : 0.08),
                 scaleY: phase === "flap_open" ? 1 : 0.4
               }}
               transition={{ duration: 0.8, ease: "easeInOut" }}
               style={{ transform: 'translateZ(3px)' }}
             />
           </div>
           
           {/* INVITATION CARD */}
           {!editMode && (
             <div 
               className={`envelope-card-wrapper phase-${phase}`}
               style={{ zIndex: phase === "extracted" ? 8 : 3 }}
             >
               <motion.div className="envelope-card-content"
                 initial={{ y: "0%", scale: 1, rotateZ: 0 }}
                 animate={{ 
                   y: phase === "extracted" ? "-15%" : (phase === "extracting" ? "-120%" : "0%"),
                   scale: 1,
                   rotateZ: phase === "extracted" ? -90 : 0
                  }}
                 transition={{ duration: phase === "extracted" ? 1.2 : 0.8, ease: "easeInOut" }}
               >
                 <div className="envelope-card-scaler">
                    {children}
                 </div>
               </motion.div>
             </div>
           )}

           {/* FRONT OF ENVELOPE (POCKET) */}
           <div className="envelope-front" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(5px)' }}>
              <div className="envelope-pocket" style={{ backgroundColor: pColor, transform: 'translateZ(1px)' }}></div>
              <div className="envelope-pocket-left" style={{ backgroundColor: pColor, transform: 'translateZ(2px)' }}></div>
              <div className="envelope-pocket-right" style={{ backgroundColor: pColor, transform: 'translateZ(2px)' }}></div>
              
              {/* TRUE CAST SHADOW: Proiettata sulla busta, sotto l'aletta */}
              <motion.div 
                className="envelope-flap-cast-shadow"
                initial={{ opacity: 0.5, filter: "blur(2.5px)" }}
                animate={{ 
                  opacity: phase !== "closed" ? 0 : 0.5,
                  filter: phase !== "closed" ? "blur(30px)" : "blur(2.5px)",
                  y: phase !== "closed" ? 15 : 0
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{ transform: 'translateZ(0px)' }}
              >
                <div className="envelope-flap-shadow-shape" />
              </motion.div>

              {/* Livello Ombra Separata per Aletta Inferiore (Safe Path) */}
              <div className="envelope-pocket-bottom-shadow-container" style={{ transform: 'translateZ(3px)' }}>
                <div className="envelope-pocket-bottom-shadow-shape" />
              </div>
              <div className="envelope-pocket-bottom" style={{ backgroundColor: pColor, transform: 'translateZ(4px)' }}></div>

               <AnimatePresence>
                {phase === "closed" && guestName && (
                   <motion.div className="envelope-guest-name" exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ transform: 'translateZ(5px)' }}>
                     {guestName}
                   </motion.div>
                )}
              </AnimatePresence>
           </div>

           {/* TOP FLAP */}
           <motion.div
             className="envelope-flap-wrapper"
             initial={{ rotateX: 0, z: 10 }}
             animate={{ 
               rotateX: phase !== "closed" ? 180 : 0,
               z: phase === "closed" ? 10 : -1
             }}
             transition={{ duration: 0.8, ease: "easeInOut" }}
             style={{ 
               zIndex: (phase === "closed" || phase === "flap_open") ? 6 : 2,
               transformStyle: 'preserve-3d'
             }}
           >
             <div className="envelope-flap-outer" style={{ backgroundColor: envBg }} />
             {/* The interior liner with texture offset effect */}
              <div className="envelope-flap-inner">
                <div className="envelope-flap-inner-bg" style={{ backgroundColor: envBg }}></div>
                <div 
                  className="envelope-flap-liner-bg" 
                  style={{ 
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: linerColor || "#ffffff",
                    transform: 'scale(-1, -1)',
                    clipPath: 'polygon(4% 100%, 96% 100%, 55% 15%, 53% 12%, 51.5% 10.5%, 50% 10%, 48.5% 10.5%, 47% 12%, 45% 15%)'
                  }}
                ></div>
                <div className="envelope-flap-inner-texture" style={{ backgroundImage: linerImg === "none" ? "none" : `url(${linerImg})`, opacity: linerOpacity }}></div>
                <div className="envelope-flap-hinge-shadow"></div>
              </div>
           </motion.div>

           <AnimatePresence>
             {phase === "closed" && !editMode && (
               <motion.div className="envelope-hint" exit={{ opacity: 0 }} animate={{y:[0,-5,0]}} transition={{repeat:Infinity,duration:2}}>
                 Tocca la busta per aprire
               </motion.div>
             )}
           </AnimatePresence>
           
         </motion.div>
       </div>
    </div>
  );
}
