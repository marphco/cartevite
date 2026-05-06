import React from 'react';
import { Pencil, Users, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { Surface } from '../../../../../../ui';

interface TableCardProps {
  table: any;
  idx: number;
  tablesLength: number;
  confirmDeleteTableId: string | null;
  onRename: (id: string, name: string) => void;
  onChangeCapacity: (id: string, capacity: number) => void;
  onMoveUp: (idx: number) => void;
  onMoveDown: (idx: number) => void;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
}

const TableCard: React.FC<TableCardProps> = ({
  table,
  idx,
  tablesLength,
  confirmDeleteTableId,
  onRename,
  onChangeCapacity,
  onMoveUp,
  onMoveDown,
  onRequestDelete,
  onConfirmDelete,
}) => {
  return (
    <Surface variant="soft" style={{
      padding: '20px',
      borderRadius: '32px',
      border: '1.5px solid var(--border)',
      background: 'var(--surface)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      transition: 'all 0.2s ease',
      position: 'relative'
    }}>
      {/* RIGA 1: NOME E FRECCE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', display: 'block' }}>Nome Tavolo</label>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'transparent', padding: '0', borderRadius: '0',
            borderBottom: '1.5px solid var(--border-subtle)'
          }}>
            <Pencil size={14} style={{ opacity: 0.3, flexShrink: 0 }} />
            <input
              value={table.name}
              onChange={(e) => onRename(table.id, e.target.value)}
              placeholder="Es: Maradona"
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', width: '100%',
                padding: '8px 0'
              }}
            />
          </div>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: '8px',
          background: 'rgba(var(--accent-rgb), 0.03)', padding: '6px', borderRadius: '16px',
          border: '1.5px solid var(--border-subtle)', flexShrink: 0
        }}>
          <button
            disabled={idx === 0}
            onClick={() => onMoveUp(idx)}
            style={{
              width: '32px', height: '32px', borderRadius: '10px', border: 'none',
              background: 'transparent', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              opacity: idx === 0 ? 0.2 : 1
            }}
          >
            <ChevronUp size={14} color="var(--text-primary)" />
            <span style={{ fontSize: '5px', fontWeight: 900, color: 'var(--text-soft)' }}>SU</span>
          </button>
          <button
            disabled={idx === tablesLength - 1}
            onClick={() => onMoveDown(idx)}
            style={{
              width: '32px', height: '32px', borderRadius: '10px', border: 'none',
              background: 'transparent', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              opacity: idx === tablesLength - 1 ? 0.2 : 1
            }}
          >
            <ChevronDown size={14} color="var(--text-primary)" />
            <span style={{ fontSize: '5px', fontWeight: 900, color: 'var(--text-soft)' }}>GIÙ</span>
          </button>
        </div>
      </div>

      {/* RIGA 2: POSTI E ELIMINA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ width: '100px' }}>
          <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', display: 'block' }}>Capienza</label>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--surface-light)', padding: '10px 14px', borderRadius: '16px',
            border: '1.5px solid var(--border-subtle)'
          }}>
            <Users size={14} style={{ opacity: 0.3, marginRight: '8px', flexShrink: 0 }} />
            <input
              type="number"
              value={table.capacity}
              onChange={(e) => onChangeCapacity(table.id, parseInt(e.target.value) || 0)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: '14px', fontWeight: 800, color: 'var(--accent)', width: '100%'
              }}
            />
          </div>
        </div>

        {confirmDeleteTableId === table.id ? (
          <button
            onClick={() => onConfirmDelete(table.id)}
            style={{
              background: '#fee2e2', border: 'none', borderRadius: '16px',
              width: '56px', height: '56px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '2px',
              animation: 'fadeIn 0.2s ease', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)'
            }}
          >
            <Trash2 size={16} color="#ef4444" strokeWidth={3} />
            <span style={{ fontSize: '7px', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase' }}>Sicuro?</span>
          </button>
        ) : (
          <button
            onClick={() => onRequestDelete(table.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              background: 'none', border: 'none', cursor: 'pointer', opacity: 0.8
            }}
          >
            <Trash2 size={20} color="#ef4444" />
            <span style={{ fontSize: '7px', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', opacity: 0.6 }}>Elimina</span>
          </button>
        )}
      </div>
    </Surface>
  );
};

export default TableCard;
