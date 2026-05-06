import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../../../../ui';
import TableCard from '../cards/TableCard';

interface TablesSectionProps {
  tables: any[];
  totalConfirmedGuests: number;
  totalCapacity: number;
  missingSeats: number;
  spareSeats: number;
  confirmDeleteTableId: string | null;
  patchConfig: (patch: any) => void;
  addTable: () => void;
  moveTable: (idx: number, dir: 1 | -1) => void;
  removeTable: (id: string) => void;
  setConfirmDeleteTableId: React.Dispatch<React.SetStateAction<string | null>>;
}

const TablesSection: React.FC<TablesSectionProps> = ({
  tables,
  totalConfirmedGuests,
  totalCapacity,
  missingSeats,
  spareSeats,
  confirmDeleteTableId,
  patchConfig,
  addTable,
  moveTable,
  removeTable,
  setConfirmDeleteTableId,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* COPERTURA POSTI — overview ospiti vs capienza */}
      {totalConfirmedGuests > 0 && (() => {
        const isOver = missingSeats > 0;
        const isExact = missingSeats === 0 && spareSeats === 0;
        const cappedCovered = Math.min(totalConfirmedGuests, totalCapacity);
        const pct = totalConfirmedGuests > 0 ? Math.min(100, Math.round((cappedCovered / totalConfirmedGuests) * 100)) : 0;
        const accent = isOver ? '#f59e0b' : 'var(--accent)';
        const accentBg = isOver ? 'rgba(245, 158, 11, 0.08)' : 'rgba(var(--accent-rgb), 0.06)';
        const accentBorder = isOver ? 'rgba(245, 158, 11, 0.25)' : 'rgba(var(--accent-rgb), 0.18)';
        return (
          <div style={{
            padding: '16px 18px', borderRadius: '18px',
            background: accentBg, border: `1.5px solid ${accentBorder}`,
            display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent, marginBottom: '4px' }}>
                  Copertura posti
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>
                  {totalCapacity} <span style={{ fontSize: '13px', opacity: 0.4, fontWeight: 600 }}>/</span> {totalConfirmedGuests}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
                  Posti / Ospiti
                </div>
              </div>
              <div style={{
                padding: '6px 10px', borderRadius: '100px',
                background: '#fff', border: `1.5px solid ${accentBorder}`,
                fontSize: '11px', fontWeight: 900, color: accent,
                whiteSpace: 'nowrap'
              }}>
                {pct}%
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ width: '100%', height: '6px', borderRadius: '100px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: accent, borderRadius: '100px', transition: 'width 0.3s ease' }} />
            </div>
            {/* Status */}
            <div style={{ fontSize: '11px', color: 'var(--text-primary)', lineHeight: 1.4, fontWeight: 600 }}>
              {isOver ? (
                <>⚠ <strong>{missingSeats} {missingSeats === 1 ? 'ospite senza posto' : 'ospiti senza posto'}</strong> — aggiungi un tavolo o aumenta capienza.</>
              ) : isExact ? (
                <>✓ Perfetto: tutti gli ospiti hanno un posto, nessuno avanzato.</>
              ) : (
                <>✓ Tutti coperti — <strong>{spareSeats} {spareSeats === 1 ? 'posto libero' : 'posti liberi'}</strong> (puoi ridurre capienza o lasciare margine).</>
              )}
            </div>
          </div>
        );
      })()}

      <Button variant="primary" style={{ width: '100%', justifyContent: 'center' }} onClick={addTable}>
        <Plus size={16} style={{ marginRight: 8 }} /> Aggiungi Tavolo
      </Button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
        {tables.map((table: any, idx: number) => (
          <TableCard
            key={table.id}
            table={table}
            idx={idx}
            tablesLength={tables.length}
            confirmDeleteTableId={confirmDeleteTableId}
            onRename={(id, name) => {
              const next = tables.map((t: any) => t.id === id ? { ...t, name } : t);
              patchConfig({ tableauTables: next });
            }}
            onChangeCapacity={(id, capacity) => {
              const next = tables.map((t: any) => t.id === id ? { ...t, capacity } : t);
              patchConfig({ tableauTables: next });
            }}
            onMoveUp={(i) => moveTable(i, -1)}
            onMoveDown={(i) => moveTable(i, 1)}
            onRequestDelete={(id) => setConfirmDeleteTableId(id)}
            onConfirmDelete={(id) => { removeTable(id); setConfirmDeleteTableId(null); }}
          />
        ))}
      </div>
    </div>
  );
};

export default TablesSection;
