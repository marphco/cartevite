import React from 'react';
import { Surface, Button } from "../../../../ui";
import { 
  PaintBucket, Image as ImageIcon, Circle, ArrowRight, ArrowLeft, ArrowDown, ArrowUp, 
  ArrowUpRight, ArrowUpLeft, ArrowDownRight, ArrowDownLeft
} from "lucide-react";
import CustomColorPicker from "../CustomColorPicker";
import { AVAILABLE_SCENARIO_BGS } from "../EditorHelpers";

interface ScenarioSectionProps {
  displayColorPicker: any;
  setDisplayColorPicker: (val: any) => void;
  pushToHistory: () => void;
  event: any;
  updateTheme: (updates: any) => void;
  scenarioBgInputRef: React.RefObject<HTMLInputElement | null>;
  handleBackgroundUpload: (file: File, type: 'canvas' | 'liner' | 'scenario') => Promise<void>;
  userScenarioBgImages: string[];
}

const ScenarioSection: React.FC<ScenarioSectionProps> = ({
  displayColorPicker,
  setDisplayColorPicker,
  pushToHistory,
  event,
  updateTheme,
  scenarioBgInputRef,
  handleBackgroundUpload,
  userScenarioBgImages
}) => {
  return (
    <>
      <Surface variant="soft" className="panel-section">
        <p style={{ fontSize: '10px', color: 'var(--text-soft)', marginBottom: '0', lineHeight: '1.5', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '3px solid var(--accent)' }}>
          Scegli l'atmosfera per il tuo evento. Sincronizza lo sfondo dello scenario con il tema del tuo evento.
        </p>
      </Surface>
      <Surface variant="soft" className="panel-section">
        <h3 style={{ marginBottom: '16px' }}>Design Scenario</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '10px', color: 'var(--text-soft)', marginTop: '-8px' }}>
            Scegli l'immagine che apparirà dietro la busta e l'invito nella pagina pubblica.
          </p>
          {/* Bg Color Selection */}
          <div>
            <Button 
              variant={displayColorPicker === 'eventHeroBg' ? "primary" : "subtle"}
              onClick={() => { if (displayColorPicker !== 'eventHeroBg') pushToHistory(); setDisplayColorPicker(displayColorPicker === 'eventHeroBg' ? false : 'eventHeroBg'); }}
              style={{ 
                width: '100%', 
                justifyContent: 'space-between', 
                padding: '10px 12px',
                background: 'rgba(60, 79, 118, 0.05)',
                borderRadius: '100px',
                ...(displayColorPicker === 'eventHeroBg' ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.5)', zIndex: 1 } : {})
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PaintBucket size={18} style={{ marginRight: 8, opacity: 0.7 }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Colore</span>
              </div>
              <div style={{ width: '20px', height: '20px', background: (event.theme?.heroBgColor || 'var(--bg-body)'), borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }} />
            </Button>
            
            {displayColorPicker === 'eventHeroBg' && (
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '8px' }}>
                <CustomColorPicker color={event.theme?.heroBgColor || 'var(--bg-body)'} onChange={(color) => { if (event.theme?.heroBgColor !== color) updateTheme({ heroBgColor: color }); }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button 
              variant="subtle" 
              style={{ 
                width: '100%', 
                justifyContent: 'flex-start', 
                fontSize: '12px', 
                padding: '10px 12px',
                background: 'rgba(60, 79, 118, 0.05)',
                borderRadius: '100px'
              }} 
              onClick={() => scenarioBgInputRef.current?.click()}
            >
              <ImageIcon size={18} style={{ marginRight: 8, opacity: 0.7 }} /> 
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Carica Immagine Sfondo</span>
            </Button>
            <input 
              type="file" 
              ref={scenarioBgInputRef} 
              style={{display: 'none'}} 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleBackgroundUpload(file, 'scenario');
                }
                e.target.value = '';
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase' }}>LIBRERIA SFONDI</label>
              
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <div 
                   onClick={() => { pushToHistory(); updateTheme({ heroBg: 'none' }); }}
                   style={{
                     aspectRatio: '1', background: 'var(--surface-light)', borderRadius: '6px', 
                     border: (!event.theme?.heroBg || event.theme?.heroBg === 'none') ? '2px solid var(--accent)' : '1px solid var(--border)', 
                     cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700
                   }}
                  >NESSUNO</div>
                  {AVAILABLE_SCENARIO_BGS.map((tex) => (
                   <div 
                     key={tex.id}
                     onClick={() => { pushToHistory(); updateTheme({ heroBg: tex.url }); }}
                     style={{
                       aspectRatio: '1', background: `url(${tex.url})`, backgroundSize: 'cover', borderRadius: '6px', 
                       border: (event.theme?.heroBg === tex.url || event.theme?.heroBg?.endsWith(tex.url)) ? '2px solid var(--accent)' : '1px solid var(--border)', 
                       cursor: 'pointer'
                     }}
                     title={tex.name}
                   />
                  ))}
                  {userScenarioBgImages.map((tex, idx) => (
                   <div 
                     key={`user-bg-${idx}`}
                     onClick={() => updateTheme({ heroBg: tex })}
                     style={{
                       aspectRatio: '1', background: `url(${tex})`, backgroundSize: 'cover', borderRadius: '6px', 
                       border: event.theme?.heroBg === tex ? '2px solid var(--accent)' : '1px solid var(--border)', 
                       cursor: 'pointer'
                     }}
                   />
                  ))}
               </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                 <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', display: 'block' }}>OPACITÀ IMMAGINE</label>
                 <span style={{ fontSize: '10px', fontWeight: 700 }}>{Math.round((event.theme?.heroBgOpacity ?? 1) * 100)}%</span>
               </div>
               <input 
                 type="range" 
                 className="custom-slider"
                 min="0" max="1" step="0.01" 
                 value={event.theme?.heroBgOpacity ?? 1} 
                 onPointerDown={() => pushToHistory()}
                 onChange={(e) => updateTheme({ heroBgOpacity: parseFloat(e.target.value) })}
                 style={{ 
                   width: '100%', 
                   background: `linear-gradient(to right, var(--accent) ${Math.round((event.theme?.heroBgOpacity ?? 1) * 100)}%, rgba(60, 79, 118, 0.1) ${Math.round((event.theme?.heroBgOpacity ?? 1) * 100)}%)`
                 } as React.CSSProperties}
               />
            </div>

            {/* Anchor Point Selector */}
            <div style={{ marginTop: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>PUNTO DI ANCORAGGIO</label>
              <p style={{ fontSize: '10px', color: 'var(--text-soft)', marginBottom: '16px', lineHeight: '1.4' }}>
                Scegli la porzione di immagine da mantenere visibile a prescindere dalle dimensioni dello schermo.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: 'fit-content', marginLeft: '8px' }}>
                {([
                  { val: 'top left', x: 0, y: 0 }, { val: 'top', x: 1, y: 0 }, { val: 'top right', x: 2, y: 0 },
                  { val: 'left', x: 0, y: 1 }, { val: 'center', x: 1, y: 1 }, { val: 'right', x: 2, y: 1 },
                  { val: 'bottom left', x: 0, y: 2 }, { val: 'bottom', x: 1, y: 2 }, { val: 'bottom right', x: 2, y: 2 }
                ] as const).map(pos => {
                  const currentPos = event.theme?.heroBgPosition || 'center';
                  const isActive = currentPos === pos.val;
                  
                  const coords: Record<string, {x: number, y: number}> = {
                    'top left': {x:0, y:0}, 'top': {x:1, y:0}, 'top right': {x:2, y:0},
                    'left': {x:0, y:1}, 'center': {x:1, y:1}, 'right': {x:2, y:1},
                    'bottom left': {x:0, y:2}, 'bottom': {x:1, y:2}, 'bottom right': {x:2, y:2}
                  };
                  const s = coords[currentPos] || {x: 1, y: 1};

                  let IconComp = Circle;
                  if (!isActive) {
                    if (pos.x > s.x && pos.y === s.y) IconComp = ArrowRight;
                    else if (pos.x < s.x && pos.y === s.y) IconComp = ArrowLeft;
                    else if (pos.y > s.y && pos.x === s.x) IconComp = ArrowDown;
                    else if (pos.y < s.y && pos.x === s.x) IconComp = ArrowUp;
                    else if (pos.x > s.x && pos.y > s.y) IconComp = ArrowDownRight;
                    else if (pos.x < s.x && pos.y < s.y) IconComp = ArrowUpLeft;
                    else if (pos.x > s.x && pos.y < s.y) IconComp = ArrowUpRight;
                    else if (pos.x < s.x && pos.y > s.y) IconComp = ArrowDownLeft;
                  }

                  return (
                    <button
                      key={pos.val}
                      onClick={() => { pushToHistory(); updateTheme({ heroBgPosition: pos.val }); }}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isActive ? 'var(--accent)' : 'transparent',
                        color: isActive ? '#000' : 'var(--text-soft)',
                        padding: 0,
                        transition: 'all 0.2s',
                      }}
                    >
                      <IconComp size={isActive ? 18 : 14} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Surface>
    </>
  );
};

export default ScenarioSection;
