import React, { useState } from 'react';

const BuilderSection = ({ block, index, isSelected, onClick, onHeightChange, onHeightChangeComplete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnchorHovered, setIsAnchorHovered] = useState(false);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const startY = e.clientY;
    const initHeight = block.height || 400;

    const handleMove = (moveEv) => {
      const dy = moveEv.clientY - startY;
      onHeightChange(Math.max(100, initHeight + dy));
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
      if (onHeightChangeComplete) onHeightChangeComplete();
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
  };

  const currentZIndex = isSelected ? 10 : (isHovered ? 5 : 1);

  return (
    <div 
      className={`builder-section-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{
        width: '100%',
        height: (block.height || 400) + 'px',
        backgroundColor: block.bgColor || '#ffffff',
        position: 'relative',
        boxSizing: 'border-box',
        border: `2px solid ${isSelected || isHovered ? 'var(--accent)' : 'transparent'}`,
        transition: 'border-color 0.2s ease',
        marginTop: index > 0 ? '-2px' : '0px', // elimina il doppio bordo tra blocchi
        zIndex: currentZIndex, 
        cursor: 'default'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Contenitore interno per futuri widget (Testi, Immagini) */}
      <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
        {/* Futura renderizzazione items */}
      </div>

      {isSelected && (
        <div 
          className="section-resize-hitbox"
          onMouseEnter={(e) => { e.stopPropagation(); setIsAnchorHovered(true); }}
          onMouseLeave={(e) => { e.stopPropagation(); setIsAnchorHovered(false); }}
          style={{
            position: 'absolute',
            bottom: '-7px',
            left: '0',
            width: '100%',
            height: '14px',
            cursor: 'ns-resize',
            zIndex: 200,
            touchAction: 'none'
          }}
          onPointerDown={handlePointerDown}
        >
          {/* Maniglia Visiva (indifferente agli eventi puntatore) */}
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '38px',
              height: '10px',
              backgroundColor: isAnchorHovered ? 'var(--accent)' : '#ffffff',
              border: isAnchorHovered ? '1px solid var(--accent)' : '1px solid rgba(0,0,0,0.1)',
              borderRadius: '10px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease',
              pointerEvents: 'none' 
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BuilderSection;
