import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MailOpen, RotateCcw } from "lucide-react";
import "./EnvelopeAnimation.css";

interface EnvelopeSquareProps {
  children?: React.ReactNode;
  preview?: boolean;
  guestName?: string;
  envelopeColor?: string;
  linerImg?: string | null;
  pocketLinerImg?: string | null;
  pocketColor?: string | null;
  canvasProps?: { width: number; height: number } | null;
  onOpenComplete?: () => void;
  editMode?: boolean;
  manualPhase?: 'closed' | 'flap_open' | 'extracting' | 'extracted' | null;
  linerX?: number;
  linerY?: number;
  linerScale?: number;
  isEditingLiner?: boolean;
  onLinerChange?: (updates: { x?: number; y?: number; scale?: number; opacity?: number }) => void;
  linerOpacity?: number;
  linerColor?: string | null;
  scale?: number | null;
  isEventPage?: boolean;
  isBuilder?: boolean;
  useExternalScaleInBuilder?: boolean;
}

type EnvelopePhase = 'closed' | 'flap_open' | 'extracting' | 'extracted';

export default function EnvelopeSquare({ 
  children, preview = false, guestName = "", envelopeColor = "#54392d", 
  linerImg = null, pocketLinerImg = null,
  pocketColor = null,
  canvasProps = null, onOpenComplete,
  editMode = false, manualPhase = null,
  linerX = 0, linerY = 0, linerScale = 1,
  isEditingLiner = false,
  onLinerChange = () => {},
  linerOpacity = 1,
  linerColor = null,
  scale: externalScale = null,
  isEventPage = false,
  isBuilder = false,
  useExternalScaleInBuilder = false
}: EnvelopeSquareProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<EnvelopePhase>(preview ? "extracted" : "closed"); 
  const phaseRef = useRef<EnvelopePhase>(phase);

  // Reliable Auto-Sequencer when manualPhase is not provided (standalone play)
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (!manualPhase) {
       if (phase === "flap_open") {
          t = setTimeout(() => { setPhase("extracting"); phaseRef.current = "extracting"; }, 800);
       } else if (phase === "extracting") {
          t = setTimeout(() => { setPhase("extracted"); phaseRef.current = "extracted"; }, 800);
       } else if (phase === "extracted" && onOpenComplete) {
          t = setTimeout(() => { onOpenComplete(); }, 800);
       }
    }
    return () => { if (t) clearTimeout(t); };
  }, [phase, manualPhase, onOpenComplete]);

  // Sync with manualPhase if provided, with sequence support for 'extracted' target
  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>, t2: ReturnType<typeof setTimeout>;
    if (manualPhase) {
      if (manualPhase === "extracted" && phaseRef.current === "closed") {
         setPhase("flap_open"); phaseRef.current = "flap_open";
         t1 = setTimeout(() => {
            setPhase("extracting"); phaseRef.current = "extracting";
            t2 = setTimeout(() => {
               setPhase("extracted"); phaseRef.current = "extracted";
            }, 800);
         }, 800);
      } else if (manualPhase === "closed") {
         setPhase("closed"); phaseRef.current = "closed";
      } else if (manualPhase === "extracting" && phaseRef.current === "closed") {
         setPhase("flap_open"); phaseRef.current = "flap_open";
         t1 = setTimeout(() => { setPhase("extracting"); phaseRef.current = "extracting"; }, 800);
      } else {
         setPhase(manualPhase as EnvelopePhase); phaseRef.current = manualPhase as EnvelopePhase;
      }
    }
    return () => { if (t1) clearTimeout(t1); if (t2) clearTimeout(t2); };
  }, [manualPhase]);

  // Robust Wheel Handling (non-passive)
  useEffect(() => {
    const el = sceneRef.current;
    if (!el || !isEditingLiner) return;

    const handleWheel = (e: WheelEvent) => {
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
    
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Quadrato Approvato Puro: Busta Formato Fisso 1:1, Rotazione in Uscita
  const envClass = "env-square";
  const startRot = -90;
  const endRot = 0;
  const cardScale = 1;

  const envBg = envelopeColor === "#111111" ? "#4a3328" : envelopeColor;
  const pColor = pocketColor ? (pocketColor === "#111111" ? "#4a3328" : pocketColor) : envBg;
  const [windowDims, setWindowDims] = useState({ w: 1000, h: 800 });
  
  useEffect(() => {
    setWindowDims({ w: window.innerWidth, h: window.innerHeight });
    const handleResize = () => setWindowDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getSceneScale = () => {
    if (preview) return (externalScale || 1.0);
    
    // Se siamo nel Builder (Editor), usiamo la scala esterna solo se esplicitamente richiesto
    if (isBuilder && useExternalScaleInBuilder && externalScale !== null) {
       return externalScale;
    }

    // Pagina pubblica/Editor: scala fissa per coerenza nel builder se non richiesto diversamente
    if (isBuilder) {
       if (windowDims.w <= 768) return 0.9;
       return 0.85; 
    }

    if (externalScale !== null) return externalScale;

    if (isEventPage) {
       if (windowDims.w <= 768) return 1.0;
       const base = windowDims.w > 1200 ? 1.35 : 1.15;
       // Laptop: cap in base all'altezza viewport per evitare clipping
       if (windowDims.h < 900) return base * (windowDims.h / 900);
       return base;
    }

    const baseDim = 500;
    const isFullShow = phase !== "closed";
    const targetHeight = isFullShow ? baseDim * 1.6 : baseDim;

    if (windowDims.w <= 768) {
       const topBoundary = 80;
       const bottomBoundary = 280;
       const availH = windowDims.h - topBoundary - bottomBoundary;
       const availW = windowDims.w * 0.85;
       const hScale = availH / targetHeight;
       const wScale = availW / baseDim;
       return Math.max(0.35, Math.min(hScale, wScale, 0.95));
    } else {
       const targetH = (windowDims.h - 150) * 0.9;
       const fitS = targetH / targetHeight;
       return Math.min(fitS, 1.0);
    }
  };

  const currentScale = getSceneScale();

  const getSceneY = (scaleVal: number) => {
    if (preview || isBuilder) return 0;
    if (isEventPage) {
       return phase === "extracted" ? (400 * 0.05 * scaleVal) : 0;
    }
    const baseDim = 500;
    const topLimit = 80;
    const bottomLimit = windowDims.w > 768 ? windowDims.h : windowDims.h - 260;
    const areaCenter = (topLimit + bottomLimit) / 2;
    const screenCenter = windowDims.h / 2;
    
    let y = areaCenter - screenCenter;
    const isFullShow = phase !== "closed";
    if (isFullShow) {
       const shiftFactor = phase === "extracted" ? 0.35 : 0.45;
       y += (shiftFactor * baseDim) * scaleVal;
    }
    return y;
  };

  const handleClick = () => {
    if (editMode || manualPhase) return; 
    if (phase === "closed") {
      setPhase("flap_open"); phaseRef.current = "flap_open";
    }
  };

  const currentLinerSrc = (pocketLinerImg === "none" || linerImg === "none") ? null : (pocketLinerImg || linerImg);

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
              y: getSceneY(currentScale),
              scale: currentScale
            }}
           transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }} 
           style={{
             '--liner-x': `${linerX}px`,
             '--liner-y': `${linerY}px`,
             '--liner-scale': linerScale
           } as any}
          >
            {/* Full-stage interaction overlay for gestures when editing liner */}
            {isEditingLiner && (
              <div 
                className="liner-interaction-overlay"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

                  if (!(window as any)._linerPointers) (window as any)._linerPointers = new Map();
                  (window as any)._linerPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

                  const initialX = linerX;
                  const initialY = linerY;
                  const initialScale = linerScale;
                  let startX = e.clientX;
                  let startY = e.clientY;
                  let initialDist = 0;

                  const handleMove = (moveEvent: PointerEvent) => {
                    const pointersMap = (window as any)._linerPointers;
                    if (!pointersMap || !pointersMap.has(moveEvent.pointerId)) return;
                    pointersMap.set(moveEvent.pointerId, { x: moveEvent.clientX, y: moveEvent.clientY });

                    const pointers = Array.from(pointersMap.values()) as {x: number, y: number}[];

                    if (pointers.length === 2) {
                      const [p0, p1] = pointers;
                      if (p0 && p1) {
                        // Pinch-to-zoom logic
                        const dist = Math.sqrt(
                          Math.pow(p1.x - p0.x, 2) + 
                          Math.pow(p1.y - p0.y, 2)
                        );
                        if (initialDist === 0) {
                          initialDist = dist;
                          return;
                        }
                        const scaleFactor = dist / initialDist;
                        const newScale = Math.min(Math.max(initialScale * scaleFactor, 0.1), 10);
                        onLinerChange({ scale: newScale });
                      }
                    } else if (pointers.length === 1) {
                      // Drag logic (single pointer)
                      const dx = moveEvent.clientX - startX;
                      const dy = moveEvent.clientY - startY;
                      onLinerChange({ x: initialX + dx, y: initialY + dy });
                    }
                  };

                  const handleUp = (upEvent: PointerEvent) => {
                    if ((window as any)._linerPointers) (window as any)._linerPointers.delete(upEvent.pointerId);
                    if (!(window as any)._linerPointers || (window as any)._linerPointers.size === 0) {
                      window.removeEventListener('pointermove', handleMove as any);
                      window.removeEventListener('pointerup', handleUp as any);
                      window.removeEventListener('pointercancel', handleUp as any);
                    }
                  };

                  window.addEventListener('pointermove', handleMove as any);
                  window.addEventListener('pointerup', handleUp as any);
                  window.addEventListener('pointercancel', handleUp as any);
                }}
                style={{
                  position: 'absolute',
                  inset: '-1000px', 
                  zIndex: 140, // Sopra tutto durante l'interazione
                  cursor: 'move',
                  touchAction: 'none'
                }}
              />
            )}
           {/* GHOST LINER (X-RAY VISION) + EDIT UI */}
           {isEditingLiner && (
               <>
                 <motion.div 
                   className="liner-edit-banner"
                   initial={{ opacity: 0, y: 20, x: "-50%", z: 200 }}
                   animate={{ opacity: 1, y: 0, x: "-50%", z: 200 }}
                   exit={{ opacity: 0, y: 20, x: "-50%", z: 200 } as any}
                   style={{ zIndex: 300 }}
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
                         ? "Trascina • Pizzica per zoomare" 
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
                            } as any}
                         />
                         <span style={{ fontSize: '10px', fontWeight: 700, minWidth: '25px', color: '#000' }}>{Math.round(linerOpacity * 100)}%</span>
                       </div>
                     </>
                   )}
                 </motion.div>
                 
                 {/* UI DAVANTI: Solo gli angoli (Foreground UI) */}
                 <div className="envelope-liner-foreground">
                    <div className="liner-image-wrapper" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       {/* Un img invisibile ma con le stesse dimensioni per far agganciare la boundary box in primo piano */}
                       {currentLinerSrc && (
                         <img 
                           src={currentLinerSrc} 
                           alt=""
                           style={{ height: '100%', width: 'auto', opacity: 0, pointerEvents: 'none' }}
                         />
                       )}
                       <div className="liner-boundary-box">
                         <div className="liner-corner top-left" />
                         <div className="liner-corner top-right" />
                         <div className="liner-corner bottom-left" />
                         <div className="liner-corner bottom-right" />
                       </div>
                    </div>
                 </div>
   
                 {/* GHOST DIETRO: Solo l'immagine fantasma (Background UI) con translateZ(-50px) nativo */}
                  <div className="envelope-liner-ghost">
                    <div className="liner-image-wrapper" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {currentLinerSrc && (
                        <img 
                          src={currentLinerSrc} 
                          alt="Liner Preview"
                          style={{ 
                            height: '100%', 
                            width: 'auto',
                            opacity: 0.3,
                            display: 'block'
                          }}
                        />
                      )}
                    </div>
                  </div>
               </>
             )}


             {/* BACK OF ENVELOPE */}
            <div className="envelope-back" style={{ backgroundColor: envBg, transform: 'translateZ(0px)' } as any}>
              <div className="envelope-back-liner-bg" style={{ 
                backgroundColor: linerColor || envBg,
                position: 'absolute',
                inset: 0,
                clipPath: 'polygon(4% 0, 96% 0, 96% 100%, 4% 100%)',
                zIndex: 1,
                transform: 'translateZ(1px)'
              } as any}></div>
              <div className="envelope-back-liner" style={{ 
                backgroundImage: (pocketLinerImg === "none" || linerImg === "none") ? "none" : `url(${pocketLinerImg || linerImg})`,
                opacity: linerOpacity,
                zIndex: 2,
                transform: 'translateZ(2px)'
              } as any}></div>
              <motion.div 
                className="envelope-dynamic-shadow"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ 
                  opacity: phase === "flap_open" ? 0.35 : (phase === "closed" ? 0 : (phase === "extracted" ? 0.08 : 0)),
                  scaleY: phase === "flap_open" ? 1 : 0.4
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{ transform: 'translateZ(3px)' } as any}
              />
            </div>
            
            {/* INVITATION CARD */}
             {!editMode && (
                <motion.div 
                  className={`envelope-card-wrapper phase-${phase}`}
                  initial={{ z: 3 } as any}
                  animate={{ z: phase === "extracted" ? 50 : 3 } as any}
                  transition={{ 
                    duration: phase === "extracted" ? 0.2 : 0.3, 
                    ease: "easeOut"
                  }}
                  style={{ transformStyle: 'preserve-3d' } as any}
                >
                  <motion.div className="envelope-card-content"
                     initial={{ y: "0%", x: "0%", scale: 1, rotate: startRot }}
                     animate={{ 
                       y: phase === "extracted" ? (isEventPage ? "12%" : "-25%") : (phase === "extracting" ? "-130%" : "0%"),
                       x: phase === "extracted" ? (isEventPage ? "4%" : "-35%") : "0%",
                       scale: phase === "extracted" ? (isEventPage ? 1.0 : 1.1) : 1,
                       rotate: phase === "extracted" ? endRot : startRot,
                       zIndex: phase === "extracted" ? 10 : 2
                     }}
                     transition={{ 
                       duration: phase === "extracted" ? 1.0 : 0.8, 
                       ease: "easeInOut",
                       delay: phase === "extracted" ? 0.2 : 0
                     }}
                  >
                  <div className="envelope-card-scaler" style={{ width: '100%', height: '100%' }}>               {children}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* FRONT OF ENVELOPE (POCKET) */}
            <div className="envelope-front" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(5px)' } as any}>
               <div className="envelope-pocket" style={{ backgroundColor: pColor, transform: 'translateZ(1px)' } as any}></div>
               <div className="envelope-pocket-left" style={{ backgroundColor: pColor, transform: 'translateZ(2px)' } as any}></div>
               <div className="envelope-pocket-right" style={{ backgroundColor: pColor, transform: 'translateZ(2px)' } as any}></div>
               
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
                 style={{ transform: 'translateZ(0px)' } as any}
               >
                 <div className="envelope-flap-shadow-shape" />
               </motion.div>

               {/* Livello Ombra Separata per Aletta Inferiore (Safe Path) */}
               <div className="envelope-pocket-bottom-shadow-container" style={{ transform: 'translateZ(3px)' } as any}>
                 <div className="envelope-pocket-bottom-shadow-shape" />
               </div>
               <div className="envelope-pocket-bottom" style={{ backgroundColor: pColor, transform: 'translateZ(4px)' } as any}></div>

                <AnimatePresence>
                 {phase === "closed" && guestName && (
                    <motion.div className="envelope-guest-name" exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ transform: 'translateZ(5px)' } as any}>
                      {guestName}
                    </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* TOP FLAP */}
            <motion.div
              className="envelope-flap-wrapper"
              initial={{ rotateX: 0, z: 10 } as any}
              animate={{ 
                rotateX: phase !== "closed" ? 180 : 0,
                z: phase === "closed" ? 10 : -1
              } as any}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{ 
                zIndex: (phase === "closed" || phase === "flap_open") ? 6 : 2,
                transformStyle: 'preserve-3d'
              } as any}
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
                   } as any}
                 ></div>
                 <div className="envelope-flap-inner-texture" style={{ backgroundImage: (linerImg && linerImg !== "none") ? `url(${linerImg})` : "none", opacity: linerOpacity }}></div>
                 <div className="envelope-flap-hinge-shadow"></div>
               </div>
            </motion.div>

          </motion.div>

          <AnimatePresence>
            {phase === "closed" && !editMode && !manualPhase && (
              <motion.button 
                className="envelope-action-btn"
                style={{ bottom: isBuilder ? '-40px' : undefined }}
                initial={{ opacity: 0, y: 10, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, scale: 0.9, x: "-50%" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPhase("flap_open");
                }}
              >
                <MailOpen size={18} />
                Apri Invito
              </motion.button>
            )}

            {phase === "extracted" && !editMode && !manualPhase && (
              <motion.button 
                className="envelope-replay-btn"
                style={{ bottom: isBuilder ? '-100px' : undefined }}
                initial={{ opacity: 0, scale: 0.5, x: "-50%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%" }}
                exit={{ opacity: 0, scale: 0.5, x: "-50%" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPhase("closed");
                }}
                title="Rivedi animazione"
              >
                <RotateCcw size={14} />
                Replay
              </motion.button>
            )}
          </AnimatePresence>
       </div>
    </div>
  );
}
