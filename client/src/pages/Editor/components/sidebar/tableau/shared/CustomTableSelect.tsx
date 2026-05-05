import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LayoutGrid, ChevronDown } from 'lucide-react';

interface CustomTableSelectProps {
  value: string;
  tables: any[];
  assignments: any[];
  onChange: (tableId: string) => void;
  placeholder?: string;
  isBulk?: boolean;
}

const CustomTableSelect: React.FC<CustomTableSelectProps> = ({
  value,
  tables,
  assignments,
  onChange,
  placeholder = 'Seleziona tavolo...',
  isBulk,
}) => {
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, isAbove: false, maxHeight: 280 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const selectedTable = tables.find(t => t.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!dropdownRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const isAbove = spaceBelow < 280;
        const maxHeight = isAbove ? Math.max(150, rect.top - 40) : Math.min(280, spaceBelow - 40);

        setCoords({
          top: isAbove ? rect.top - 10 : rect.bottom + 4,
          left: rect.left,
          width: rect.width,
          isAbove,
          maxHeight,
        });
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      handleScroll();
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div ref={dropdownRef} style={{ width: '100%' }}>
      <button
        onClick={toggleDropdown}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isBulk ? '12px 16px' : '8px 12px',
          background: 'var(--surface-light)',
          border: isOpen ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
          borderRadius: '100px',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isOpen ? '0 4px 12px rgba(var(--accent-rgb), 0.15)' : 'none',
        }}
      >
        <span style={{
          fontSize: isBulk ? '12px' : '11px',
          fontWeight: 700,
          color: selectedTable ? 'var(--text-primary)' : 'var(--text-soft)',
          lineHeight: 1.2,
          textAlign: 'left',
        }}>
          {value === 'multiple' ? 'Misto (Vedi singoli)' : (selectedTable?.name || placeholder)}
        </span>
        <ChevronDown size={14} style={{
          color: 'var(--accent)',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease',
          flexShrink: 0,
          marginLeft: '8px',
        }} />
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            transform: coords.isAbove ? 'translateY(-100%)' : 'none',
            width: Math.max(coords.width, 240),
            background: '#ffffff',
            border: '1.5px solid var(--border)',
            borderRadius: '24px',
            boxShadow: '0 30px 90px rgba(0,0,0,0.3)',
            zIndex: 999999,
            maxHeight: `${coords.maxHeight}px`,
            overflowY: 'auto',
            padding: '8px',
            animation: coords.isAbove ? 'none' : 'fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
          }}>
          <div
            onClick={() => { onChange(''); setIsOpen(false); }}
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 800,
              color: value === '' ? 'var(--accent)' : 'var(--text-soft)',
              background: value === '' ? 'rgba(var(--accent-rgb), 0.1)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={(e) => {
              if (value !== '') e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
            }}
            onMouseLeave={(e) => {
              if (value !== '') e.currentTarget.style.background = 'transparent';
            }}
          >
            Non assegnato
          </div>
          {tables.map(t => {
            const occupancy = assignments.filter(a => a.tableId === t.id).reduce((acc, a) => acc + (a.numPeople || 1), 0);
            const isFull = occupancy >= t.capacity;
            const isSelected = t.id === value;

            return (
              <div
                key={t.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(t.id);
                  setIsOpen(false);
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: isSelected ? '#fff' : 'var(--text-primary)',
                  background: isSelected ? 'var(--accent)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  marginBottom: '2px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.08)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  <LayoutGrid size={12} strokeWidth={2.5} style={{ flexShrink: 0, opacity: isSelected ? 1 : 0.4 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{t.name}</span>
                </div>
                <div style={{
                  fontSize: '9px',
                  fontWeight: 900,
                  color: isSelected ? '#fff' : (isFull ? '#ef4444' : 'var(--text-soft)'),
                  background: isSelected ? 'rgba(255,255,255,0.2)' : (isFull ? '#fee2e2' : 'rgba(0,0,0,0.05)'),
                  padding: '2px 6px',
                  borderRadius: '100px',
                  flexShrink: 0,
                  marginLeft: '4px',
                }}>
                  {occupancy}/{t.capacity}
                </div>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomTableSelect;
