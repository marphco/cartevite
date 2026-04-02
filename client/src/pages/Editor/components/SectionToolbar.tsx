import React from 'react';
import { ChevronUp, ChevronDown, Copy, Trash2 } from 'lucide-react';

interface SectionToolbarProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
  layout?: 'vertical' | 'horizontal';
}

const SectionToolbar: React.FC<SectionToolbarProps> = ({ 
  onMoveUp, 
  onMoveDown, 
  onDuplicate, 
  onDelete,
  isFirst,
  isLast,
  layout = 'vertical'
}) => {
  const isHorizontal = layout === 'horizontal';

  return (
    <div 
      className={`section-floating-toolbar ${layout}`}
      style={{
        position: 'absolute',
        // Ripristinato all'esterno come originariamente richiesto
        top: isHorizontal ? '-28px' : '0', 
        right: isHorizontal ? 'auto' : '-65px',
        left: isHorizontal ? '50%' : 'auto',
        transform: isHorizontal ? 'translateX(-50%)' : 'none',
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        alignItems: 'center',
        gap: isHorizontal ? '0' : '4px',
        padding: isHorizontal ? '4px' : '6px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: isHorizontal ? '10px' : '12px',
        border: '1.5px solid var(--accent)',
        boxShadow: isHorizontal 
          ? '0 6px 16px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.05)' 
          : 'var(--shadow-soft)',
        zIndex: 1000,
        pointerEvents: 'auto',
        minWidth: isHorizontal ? '160px' : '48px',
        justifyContent: 'center'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <ToolbarButton 
        onClick={onMoveUp} 
        disabled={isFirst} 
        icon={<ChevronUp size={isHorizontal ? 16 : 18} />} 
        title="Sposta Su" 
      />
      <ToolbarButton 
        onClick={onMoveDown} 
        disabled={isLast} 
        icon={<ChevronDown size={isHorizontal ? 16 : 18} />} 
        title="Sposta Giù" 
      />
      
      {/* Separator - Fixed color (using opacity on the hex accent) */}
      <div style={{ 
        width: isHorizontal ? '1.5px' : '70%', 
        height: isHorizontal ? '22px' : '1.5px', 
        background: 'var(--accent)', 
        opacity: 0.25,
        margin: isHorizontal ? '0 8px' : '4px 0' 
      }} />
      
      <ToolbarButton 
        onClick={onDuplicate} 
        icon={<Copy size={isHorizontal ? 14 : 16} />} 
        title="Duplica" 
      />
      <ToolbarButton 
        onClick={onDelete} 
        icon={<Trash2 size={isHorizontal ? 14 : 16} />} 
        title="Elimina" 
        isDestructive 
      />

      {/* Puntatore di ancoraggio (Solo mobile/horizontal) */}
      {isHorizontal && (
        <div style={{
          position: 'absolute',
          bottom: '-7.5px', // Corretto per coprire esattamente il bordo di 1.5px
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
          width: '12px',
          height: '12px',
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1.5px solid var(--accent)',
          borderBottom: '1.5px solid var(--accent)',
          zIndex: 2, // Sopra il bordo principale per "fonderlo"
          boxShadow: '2px 2px 5px rgba(0,0,0,0.05)'
        }} />
      )}
    </div>
  );
};

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
  title: string;
  isDestructive?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, icon, disabled, title, isDestructive }) => (
  <button
    onClick={(e) => { e.stopPropagation(); if (!disabled) onClick(); }}
    disabled={disabled}
    title={title}
    style={{
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      backgroundColor: 'transparent',
      color: disabled ? 'var(--text-soft)' : (isDestructive ? '#e74c3c' : 'var(--text-primary)'),
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      opacity: disabled ? 0.4 : 1
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.backgroundColor = isDestructive ? 'rgba(231, 76, 60, 0.1)' : 'var(--accent-soft)';
        e.currentTarget.style.color = isDestructive ? '#e74c3c' : 'var(--accent)';
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = isDestructive ? '#e74c3c' : 'var(--text-primary)';
      }
    }}
  >
    {icon}
  </button>
);

export default SectionToolbar;
