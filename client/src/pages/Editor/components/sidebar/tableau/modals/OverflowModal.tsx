import React from 'react';
import { createPortal } from 'react-dom';
import { Users, Plus, Minus, LayoutGrid } from 'lucide-react';
import { Surface, Button } from '../../../../../../ui';

interface OverflowModalProps {
  show: boolean;
  onClose: () => void;
  totalConfirmedGuests: number;
  totalCapacity: number;
  missingSeats: number;
  tables: any[];
  patchConfig: (patch: any) => void;
  setActiveTab: (tab: 'tables' | 'guests') => void;
  newTableNameInput: string;
  setNewTableNameInput: React.Dispatch<React.SetStateAction<string>>;
  newTableCapacityInput: number;
  setNewTableCapacityInput: React.Dispatch<React.SetStateAction<number>>;
}

const OverflowModal: React.FC<OverflowModalProps> = ({
  show,
  onClose,
  totalConfirmedGuests,
  totalCapacity,
  missingSeats,
  tables,
  patchConfig,
  setActiveTab,
  newTableNameInput,
  setNewTableNameInput,
  newTableCapacityInput,
  setNewTableCapacityInput,
}) => {
  if (!show) return null;

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100003,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <Surface variant="soft" style={{
        maxWidth: '460px', width: '100%', borderRadius: '32px',
        boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.4)',
        animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '32px 32px 20px', textAlign: 'center' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px', background: '#fffbeb',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            border: '1.5px solid #ffe699'
          }}>
            <Users size={32} color="#f59e0b" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '10px', fontFamily: 'var(--font-heading)' }}>
            Più ospiti che posti
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-soft)', lineHeight: 1.6, margin: 0 }}>
            Hai <strong>{totalConfirmedGuests} ospiti</strong> ma solo <strong>{totalCapacity} posti</strong> totali ({tables.length} {tables.length === 1 ? 'tavolo' : 'tavoli'}).
            Mancano <strong style={{ color: '#f59e0b' }}>{missingSeats} {missingSeats === 1 ? 'posto' : 'posti'}</strong>.
          </p>
        </div>

        {/* Form aggiungi tavolo inline */}
        <div style={{ padding: '0 32px 20px' }}>
          <div style={{
            padding: '16px', borderRadius: '16px',
            background: 'rgba(var(--accent-rgb), 0.04)',
            border: '1.5px solid rgba(var(--accent-rgb), 0.15)'
          }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              Aggiungi un tavolo
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
              <input
                value={newTableNameInput}
                onChange={e => setNewTableNameInput(e.target.value)}
                placeholder="Nome tavolo"
                style={{
                  flex: 1, background: '#fff', border: '1.5px solid var(--border)',
                  borderRadius: '12px', padding: '10px 12px',
                  fontSize: '12px', fontWeight: 700, outline: 'none', color: 'var(--text-primary)'
                }}
              />
              <div style={{
                display: 'flex', alignItems: 'center',
                background: '#fff', border: '1.5px solid var(--border)',
                borderRadius: '12px', overflow: 'hidden', width: '120px'
              }}>
                <button
                  onClick={() => setNewTableCapacityInput(c => Math.max(2, c - 1))}
                  style={{ width: '32px', height: '100%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Minus size={12} color="var(--text-soft)" strokeWidth={2.5} />
                </button>
                <input
                  type="number"
                  value={newTableCapacityInput}
                  onChange={e => setNewTableCapacityInput(Math.max(2, parseInt(e.target.value) || 2))}
                  style={{
                    flex: 1, border: 'none', outline: 'none', background: 'transparent',
                    fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', minWidth: 0
                  }}
                />
                <button
                  onClick={() => setNewTableCapacityInput(c => c + 1)}
                  style={{ width: '32px', height: '100%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={12} color="var(--accent)" strokeWidth={2.5} />
                </button>
              </div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-soft)', marginTop: '6px', fontWeight: 600 }}>
              Capienza posti
            </div>
            <Button
              variant="primary" fullWidth
              onClick={() => {
                const newTable = {
                  id: `table-${Date.now()}`,
                  name: newTableNameInput.trim() || `Tavolo ${tables.length + 1}`,
                  capacity: Math.max(2, newTableCapacityInput),
                  shape: 'round' as const,
                  x: 400, y: 300
                };
                patchConfig({ tableauTables: [...tables, newTable] });
                onClose();
              }}
              style={{ height: '40px', borderRadius: '100px', fontWeight: 800, fontSize: '12px', marginTop: '12px' }}
            >
              <Plus size={14} /> Aggiungi tavolo
            </Button>
          </div>
        </div>

        {/* OPPURE — aumenta capienza tavoli esistenti */}
        {tables.length > 0 && (
          <div style={{ padding: '0 32px 20px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              margin: '8px 0 12px'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Oppure</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>
            <div style={{
              padding: '16px', borderRadius: '16px',
              background: 'var(--surface-light)',
              border: '1.5px solid var(--border)'
            }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                Aumenta capienza tavoli esistenti
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tables.map((t: any) => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 10px', background: '#fff',
                    borderRadius: '12px', border: '1px solid var(--border)'
                  }}>
                    <LayoutGrid size={13} color="var(--accent)" style={{ opacity: 0.5, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      background: 'var(--surface-light)', border: '1px solid var(--border-subtle)',
                      borderRadius: '10px', overflow: 'hidden', flexShrink: 0
                    }}>
                      <button
                        onClick={() => {
                          const next = tables.map((x: any) => x.id === t.id ? { ...x, capacity: Math.max(2, (x.capacity || 0) - 1) } : x);
                          patchConfig({ tableauTables: next });
                        }}
                        disabled={(t.capacity || 0) <= 2}
                        style={{
                          width: '28px', height: '28px', border: 'none', background: 'none',
                          cursor: (t.capacity || 0) <= 2 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: (t.capacity || 0) <= 2 ? 0.3 : 1
                        }}
                      >
                        <Minus size={12} color="var(--text-soft)" strokeWidth={2.5} />
                      </button>
                      <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {t.capacity}
                      </span>
                      <button
                        onClick={() => {
                          const next = tables.map((x: any) => x.id === t.id ? { ...x, capacity: (x.capacity || 0) + 1 } : x);
                          patchConfig({ tableauTables: next });
                        }}
                        style={{
                          width: '28px', height: '28px', border: 'none', background: 'none',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <Plus size={12} color="var(--accent)" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {missingSeats === 0 && (
                <div style={{
                  marginTop: '12px', padding: '8px 12px', borderRadius: '10px',
                  background: 'rgba(var(--accent-rgb), 0.08)',
                  border: '1px solid rgba(var(--accent-rgb), 0.2)',
                  fontSize: '11px', fontWeight: 700, color: 'var(--accent)',
                  textAlign: 'center'
                }}>
                  Tutti gli ospiti hanno un posto
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ padding: '16px 32px 24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {missingSeats === 0 ? (
            <Button variant="primary" fullWidth onClick={onClose}
              style={{ height: '48px', borderRadius: '100px', fontWeight: 800, fontSize: '13px' }}>
              Procedi con le modifiche
            </Button>
          ) : (
            <>
              <Button variant="ghost" fullWidth
                onClick={() => { setActiveTab('tables'); onClose(); }}
                style={{ height: '44px', borderRadius: '100px', fontWeight: 700, fontSize: '12px' }}>
                Vai a "Tavoli" per gestirli
              </Button>
              <Button variant="ghost" fullWidth onClick={onClose}
                style={{ height: '44px', borderRadius: '100px', color: 'var(--text-soft)', fontWeight: 600, fontSize: '12px' }}>
                Più tardi
              </Button>
            </>
          )}
        </div>
      </Surface>
    </div>,
    document.body
  );
};

export default OverflowModal;
