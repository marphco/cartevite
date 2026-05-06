import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronDown, Search } from 'lucide-react';

interface GuestSearchSelectProps {
  value: string;
  placeholder: string;
  guests: any[];
  assignments?: any[];
  onChange: (id: string) => void;
}

const GuestSearchSelect: React.FC<GuestSearchSelectProps> = ({
  value,
  placeholder,
  guests,
  assignments = [],
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedGuest = guests.find(g => g.id === value);
  const filteredGuests = guests
    .filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'it'));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => { setIsOpen(o => !o); setSearch(''); }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: '#fff',
          border: isOpen ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
          borderRadius: '100px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
          <Sparkles size={13} color={selectedGuest ? 'var(--accent)' : 'var(--text-soft)'} />
          <span style={{
            fontSize: '12px',
            fontWeight: 700,
            color: selectedGuest ? 'var(--text-primary)' : 'rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {selectedGuest ? selectedGuest.name : placeholder}
          </span>
        </div>
        <ChevronDown size={14} style={{ color: 'var(--accent)', opacity: 0.5, flexShrink: 0, marginLeft: '8px' }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: '#fff',
          border: '1.5px solid var(--border)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          maxHeight: '220px',
        }}>
          <div style={{ padding: '10px 10px 6px', flexShrink: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--surface-light)', border: '1.5px solid var(--border)',
              borderRadius: '100px', padding: '7px 12px',
            }}>
              <Search size={13} color="var(--text-soft)" style={{ flexShrink: 0 }} />
              <style>{`.gsearch::placeholder{color:var(--text-soft);opacity:1}`}</style>
              <input
                autoFocus
                className="gsearch"
                placeholder="Cerca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent', fontSize: '12px', fontWeight: 600,
                  color: 'var(--text-primary)', caretColor: 'var(--accent)',
                }}
              />
            </div>
          </div>
          <div style={{ overflowY: 'auto', padding: '4px 8px 8px' }}>
            {filteredGuests.length > 0 ? filteredGuests.map(g => {
              const isSelected = g.id === value;
              const isAssigned = assignments.some((a: any) => a.guestId === g.id && a.tableId);
              return (
                <div
                  key={g.id}
                  onClick={() => { onChange(g.id); setIsOpen(false); }}
                  style={{
                    padding: '9px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                    color: isSelected ? '#fff' : 'var(--text-primary)',
                    background: isSelected ? 'var(--accent)' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '10px',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0,
                    background: isSelected ? '#fff' : (isAssigned ? 'var(--accent)' : '#f59e0b'),
                    boxShadow: isSelected ? 'none' : (isAssigned ? '0 0 0 2px rgba(var(--accent-rgb),0.15)' : '0 0 0 2px rgba(245,158,11,0.18)'),
                  }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</span>
                </div>
              );
            }) : (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '11px', color: 'var(--text-soft)', opacity: 0.5 }}>
                Nessun ospite trovato
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestSearchSelect;
