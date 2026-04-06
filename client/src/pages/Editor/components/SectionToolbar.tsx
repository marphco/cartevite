import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Copy, Trash2 } from 'lucide-react';
import CustomColorPicker from './CustomColorPicker';

interface SectionToolbarProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onUpdateBlockProps: (props: any) => void;
  onColorChange: (color: string) => void;
  bgColor: string;
  isFirst: boolean;
  isLast: boolean;
  isFirstLayer?: boolean;
  isLastLayer?: boolean;
  layout?: 'vertical' | 'horizontal';
  previewMobile?: boolean;
  selectedLayerId?: string | null | undefined;
  onMoveLayer?: ((layerId: string, direction: 'up' | 'down') => void) | undefined;
  onDuplicateLayer?: ((layerId: string) => void) | undefined;
  onDeleteLayer?: ((layerId: string) => void) | undefined;
  contextLabel?: string;
  isMobileDevice?: boolean;
  editingLayerId?: string | null;
}

const SectionToolbar: React.FC<SectionToolbarProps> = ({ 
  onMoveUp, 
  onMoveDown, 
  onDuplicate, 
  onDelete,
  onUpdateBlockProps,
  onColorChange,
  bgColor,
  isFirst,
  isLast,
  isFirstLayer,
  isLastLayer,
  layout = 'vertical',
  previewMobile,
  selectedLayerId,
  onMoveLayer,
  onDuplicateLayer,
  onDeleteLayer,
  contextLabel,
  isMobileDevice,
  editingLayerId
}) => {
  const isHorizontal = layout === 'horizontal';
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Auto-reset per la conferma eliminazione dopo 3 secondi
  useEffect(() => {
    if (isConfirmingDelete) {
      const timer = setTimeout(() => setIsConfirmingDelete(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmingDelete]);

  // MODALITÀ FOCUS: Nascondi tutto se stiamo scrivendo un testo (editingLayerId != null)
  if (editingLayerId) {
    return null;
  }

  const handleDeleteClick = () => {
    if (isConfirmingDelete) {
      if (isLayerToolbar && selectedLayerId && onDeleteLayer) {
        onDeleteLayer(selectedLayerId);
      } else {
        onDelete();
      }
      setIsConfirmingDelete(false);
    } else {
      setIsConfirmingDelete(true);
    }
  };
  const isMobileLayout = !!isMobileDevice; // Solo se è un dispositivo fisico mobile
  
  // Eccezione per Smartphone reale in visualizzazione Desktop della pagina:
  // Mostriamo sempre la toolbar della Sezione, ignorando l'elemento selezionato.
  const isLayerToolbar = !!selectedLayerId && (isMobileLayout || previewMobile) && !(isMobileDevice && !previewMobile);

  return (
    <div 
      className={`section-floating-toolbar ${isMobileLayout ? 'horizontal' : 'vertical'}`}
      style={{
        position: isMobileLayout ? 'fixed' : 'absolute',
        top: isMobileLayout ? 'auto' : '0', 
        bottom: isMobileLayout ? '110px' : 'auto', 
        right: isMobileLayout ? 'auto' : '-82px', 
        left: isMobileLayout ? '50%' : 'auto',
        transform: isMobileLayout ? 'translateX(-50%)' : 'none',
        display: 'flex',
        flexDirection: isMobileLayout ? 'row' : 'column',
        alignItems: 'center',
        gap: isMobileLayout ? '8px' : '4px',
        padding: isMobileLayout ? '8px 12px' : '10px 4px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '100px',
        border: `1.5px solid var(--accent)`,
        boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
        zIndex: 10000,
        pointerEvents: 'auto',
        minWidth: isMobileLayout ? '300px' : '58px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Badge Etichetta Originale - Mini & Raffinato */}
      <div style={{
        backgroundColor: 'var(--accent)',
        color: '#fff',
        fontSize: '7.5px',
        fontWeight: 900,
        padding: '1.5px 7px',
        borderRadius: '20px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        position: 'absolute',
        top: isMobileLayout ? 'auto' : '-22px',
        left: '50%',
        transform: 'translateX(-50%)',
        marginRight: isMobileLayout ? '12px' : '0',
        whiteSpace: 'nowrap',
        zIndex: 10,
        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        display: isMobileLayout ? 'none' : 'block'
      }}>
        {isLayerToolbar ? contextLabel : 'SEZIONE'}
      </div>

      {isMobileLayout && (
        <div style={{ 
          backgroundColor: 'var(--accent)',
          color: '#fff',
          fontSize: '9px', 
          fontWeight: 900, 
          textTransform: 'uppercase',
          padding: '4px 12px',
          borderRadius: '100px',
          marginRight: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(var(--accent-rgb), 0.2)',
          whiteSpace: 'nowrap',
          letterSpacing: '0.05em'
        }}>
          {isLayerToolbar ? contextLabel : 'SEZIONE'}
        </div>
      )}

      <ToolbarButton 
        icon={<ChevronUp size={isMobileLayout ? 16 : 18} />} 
        label="SPOSTA SU" 
        title={isLayerToolbar ? "Porta Avanti" : "Sposta Sezione Su"}
        onClick={() => {
          if (isLayerToolbar && selectedLayerId && onMoveLayer) {
            onMoveLayer(selectedLayerId, 'up');
          } else {
            onMoveUp();
          }
        }} 
        disabled={isLayerToolbar ? !!isFirstLayer : isFirst}
        isHorizontal={isMobileLayout}
      />
      
      <ToolbarButton 
        icon={<ChevronDown size={isMobileLayout ? 16 : 18} />} 
        label="SPOSTA GIÙ" 
        title={isLayerToolbar ? "Porta Indietro" : "Sposta Sezione Giù"}
        onClick={() => {
          if (isLayerToolbar && selectedLayerId && onMoveLayer) {
            onMoveLayer(selectedLayerId, 'down');
          } else {
            onMoveDown();
          }
        }} 
        disabled={isLayerToolbar ? !!isLastLayer : isLast}
        isHorizontal={isMobileLayout}
      />
      
      <div style={{ 
        width: isMobileDevice ? '1.5px' : '30px', 
        height: isMobileDevice ? '20px' : '1.5px', 
        backgroundColor: 'var(--accent)',
        opacity: 0.25,
        margin: isMobileDevice ? '0 4px' : '4px 0'
      }} />

      {!isLayerToolbar && (
        <>
          <div style={{ position: 'relative' }}>
            <ToolbarButton 
              icon={
                <div style={{ 
                  width: '18px', 
                  height: '18px', 
                  backgroundColor: bgColor || '#fff',
                  borderRadius: '50%',
                  border: '1.5px solid #fff',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)'
                }} />
              } 
              label="COLORE"
              title="Colore Sfondo Sezione"
              onClick={() => setShowColorPicker(!showColorPicker)} 
              isActive={showColorPicker}
              isHorizontal={isMobileDevice || false}
            />
            
            {showColorPicker && (
              <div style={{
                position: 'absolute',
                top: isMobileDevice ? 'auto' : '0',
                bottom: isMobileDevice ? '100%' : 'auto',
                right: isMobileDevice ? 'auto' : '100%',
                left: isMobileDevice ? '50%' : 'auto',
                transform: isMobileDevice ? 'translateX(-50%)' : 'none',
                marginBottom: isMobileDevice ? '15px' : '0',
                marginRight: isMobileDevice ? '0' : '15px',
                zIndex: 10001
              }}>
                  <div style={{ 
                  backgroundColor: 'var(--bg-surface)',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--accent)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  width: '260px'
                }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>COLORE SEZIONE</span>
                      <button 
                        onPointerDown={(e) => { e.stopPropagation(); setShowColorPicker(false); }}
                        style={{ background: 'var(--accent-soft)', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px' }}
                      >
                        OK
                      </button>
                   </div>
                   <CustomColorPicker color={bgColor} onChange={onColorChange} />
                </div>
              </div>
            )}
          </div>
          <div style={{ 
            width: isMobileDevice ? '1.5px' : '30px', 
            height: isMobileDevice ? '20px' : '1.5px', 
            backgroundColor: 'var(--accent)',
            opacity: 0.25,
            margin: isMobileDevice ? '0 4px' : '4px 0'
          }} />
        </>
      )}

      <ToolbarButton 
        icon={<Copy size={isMobileDevice ? 14 : 16} />} 
        label="DUPLICA" 
        title={selectedLayerId ? (isLayerToolbar ? "Duplica Elemento" : "Duplica Elemento") : "Duplica Sezione"}
        onClick={() => {
          if (isLayerToolbar && selectedLayerId && onDuplicateLayer) {
            onDuplicateLayer(selectedLayerId);
          } else {
            onDuplicate();
          }
        }} 
        isHorizontal={isMobileDevice || false}
      />
      
      <ToolbarButton 
        icon={<Trash2 size={isMobileDevice ? 16 : 18} />} 
        label={isConfirmingDelete ? "SICURO?" : "ELIMINA"}
        title={selectedLayerId ? (isLayerToolbar ? "Elimina Elemento" : "Elimina Elemento") : "Elimina Sezione"}
        isDestructive 
        isActive={isConfirmingDelete}
        onClick={() => {
          handleDeleteClick();
        }} 
        isHorizontal={isMobileDevice || false}
      />
    </div>
  );
};

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
  title: string;
  label: string;
  isDestructive?: boolean;
  isActive?: boolean;
  isHorizontal?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, icon, disabled, title, label, isDestructive, isActive, isHorizontal }) => (
  <button
    onClick={(e) => { e.stopPropagation(); if (!disabled) onClick(); }}
    onPointerDown={(e) => e.stopPropagation()}
    onMouseDown={(e) => e.stopPropagation()}
    disabled={disabled}
    title={title}
    style={{
      width: isHorizontal ? '38px' : '44px',
      height: isHorizontal ? '38px' : '44px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%', 
      backgroundColor: isActive ? (isDestructive ? 'rgba(231, 76, 60, 0.2)' : 'var(--accent-soft)') : 'transparent',
      color: disabled ? 'rgba(var(--accent-rgb), 0.2)' : (isDestructive ? '#e74c3c' : (isActive ? 'var(--accent)' : 'var(--text-primary)')),
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      border: 'none',
      opacity: disabled ? 0.6 : 1,
      gap: isHorizontal ? '0px' : '1px',
      boxShadow: isActive ? 'inset 0 0 0 1px rgba(var(--accent-rgb), 0.1)' : 'none'
    }}
    onMouseEnter={(e) => {
      if (!disabled && !isActive) {
        e.currentTarget.style.backgroundColor = isDestructive ? 'rgba(231, 76, 60, 0.08)' : 'var(--accent-soft)';
        e.currentTarget.style.color = isDestructive ? '#e74c3c' : 'var(--accent)';
        e.currentTarget.style.transform = 'scale(1.05)';
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled && !isActive) {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = isDestructive ? '#e74c3c' : 'var(--text-primary)';
        e.currentTarget.style.transform = 'scale(1)';
      }
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '18px' }}>
      {icon}
    </div>
    <span style={{ 
      fontSize: '6.5px', 
      fontWeight: 800, 
      letterSpacing: '0.04em',
      opacity: disabled ? 0.5 : (isActive ? 1 : 0.6),
      color: isDestructive ? '#e74c3c' : 'inherit',
      textAlign: 'center',
      lineHeight: 1
    }}>
      {label}
    </span>
  </button>
);

export default SectionToolbar;
