import React from 'react';
import { Sparkles, Heart, HeartOff, X, Zap, AlertTriangle, RotateCcw } from 'lucide-react';
import GuestSearchSelect from '../shared/GuestSearchSelect';

interface RulesSectionProps {
  guestA: string;
  guestB: string;
  setGuestA: React.Dispatch<React.SetStateAction<string>>;
  setGuestB: React.Dispatch<React.SetStateAction<string>>;
  allGuests: any[];
  assignments: any[];
  constraints: any[];
  confirmResetAssignments: boolean;
  setConfirmResetAssignments: React.Dispatch<React.SetStateAction<boolean>>;
  patchConfig: (patch: any) => void;
  handleOptimize: () => void;
}

const RulesSection: React.FC<RulesSectionProps> = ({
  guestA,
  guestB,
  setGuestA,
  setGuestB,
  allGuests,
  assignments,
  constraints,
  confirmResetAssignments,
  setConfirmResetAssignments,
  patchConfig,
  handleOptimize,
}) => {
  return (
    <div style={{
      padding: '20px 0',
      background: 'transparent',
      display: 'flex', flexDirection: 'column', gap: '14px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '14px', background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 6px 18px rgba(var(--accent-rgb), 0.35)'
        }}>
          <Sparkles size={22} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '0.02em', lineHeight: 1.2 }}>Motore Intelligente</div>
          <div style={{ fontSize: '11px', color: 'var(--text-soft)', marginTop: '3px', lineHeight: 1.3 }}>Definisci vincoli, poi ottimizza con un click</div>
        </div>
      </div>

      {/* Selettori ospiti */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <GuestSearchSelect value={guestA} placeholder="Ospite A" guests={allGuests} assignments={assignments} onChange={setGuestA} />
        <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 900, color: 'var(--text-soft)', opacity: 0.3 }}>&</div>
        <GuestSearchSelect value={guestB} placeholder="Ospite B" guests={allGuests} assignments={assignments} onChange={setGuestB} />
      </div>

      {/* Bottoni vincoli */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => {
            if (guestA && guestB && guestA !== guestB) {
              patchConfig({ tableauConstraints: [...constraints, { type: 'together', guestId1: guestA, guestId2: guestB }] });
              setGuestA(''); setGuestB('');
            }
          }}
          style={{
            flex: '1 1 0', minWidth: 0, width: 0,
            height: '40px', borderRadius: '100px', fontSize: '11px', fontWeight: 800,
            background: 'var(--accent)', color: '#fff', border: 'none',
            boxShadow: '0 4px 14px rgba(var(--accent-rgb), 0.3)', transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            cursor: 'pointer', padding: 0
          }}
        >
          <Heart size={12} color="#fff" fill="#fff" /> Insieme
        </button>
        <button
          onClick={() => {
            if (guestA && guestB && guestA !== guestB) {
              patchConfig({ tableauConstraints: [...constraints, { type: 'avoid', guestId1: guestA, guestId2: guestB }] });
              setGuestA(''); setGuestB('');
            }
          }}
          style={{
            flex: '1 1 0', minWidth: 0, width: 0,
            height: '40px', borderRadius: '100px', fontSize: '11px', fontWeight: 800,
            background: 'rgba(239, 68, 68, 0.06)', color: '#dc2626',
            border: '1.5px solid rgba(239, 68, 68, 0.15)', transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            cursor: 'pointer', padding: 0
          }}
        >
          <HeartOff size={12} color="#dc2626" /> Separati
        </button>
      </div>

      {/* Chips vincoli */}
      {constraints.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {constraints.map((c: any, i: number) => {
            const g1 = allGuests.find(g => g.id === c.guestId1)?.name || 'Ospite';
            const g2 = allGuests.find(g => g.id === c.guestId2)?.name || 'Ospite';
            return (
              <div key={i} style={{
                padding: '10px 12px', background: c.type === 'together' ? 'rgba(var(--accent-rgb), 0.04)' : 'rgba(239,68,68,0.04)',
                borderRadius: '14px', border: c.type === 'together' ? '1.5px solid rgba(var(--accent-rgb), 0.15)' : '1.5px solid rgba(239,68,68,0.15)',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '7px', flexShrink: 0,
                    background: c.type === 'together' ? 'rgba(var(--accent-rgb), 0.1)' : 'rgba(239,68,68,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px'
                  }}>
                    {c.type === 'together' ? <Heart size={11} color="var(--accent)" fill="var(--accent)" /> : <HeartOff size={11} color="#ef4444" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.type === 'together' ? 'var(--accent)' : '#ef4444', marginBottom: '3px' }}>
                      {c.type === 'together' ? 'Insieme' : 'Separati'}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {g1} <span style={{ opacity: 0.3, fontWeight: 400 }}>&</span> {g2}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => patchConfig({ tableauConstraints: constraints.filter((_: any, idx: number) => idx !== i) })}
                  style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: c.type === 'together' ? 'rgba(var(--accent-rgb), 0.08)' : 'rgba(239,68,68,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none',
                    cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0, marginTop: '1px'
                  }}
                >
                  <X size={11} color={c.type === 'together' ? 'var(--accent)' : '#ef4444'} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pulsante ottimizzazione */}
      <button
        onClick={handleOptimize}
        style={{
          width: '100%', height: '48px',
          fontSize: '13px', fontWeight: 900, borderRadius: '100px',
          background: 'var(--accent)', color: '#fff', border: 'none',
          boxShadow: '0 8px 24px rgba(var(--accent-rgb), 0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          cursor: 'pointer', padding: 0, whiteSpace: 'nowrap',
          letterSpacing: '0.01em', transition: 'all 0.2s ease'
        }}
      >
        <Zap size={15} /> Ottimizza Automaticamente
      </button>

      {/* Pulsante Azzera assegnazioni — alert arancione, doppio check */}
      {assignments.some((a: any) => a.tableId) && (
        confirmResetAssignments ? (
          <button
            onClick={() => {
              const next = assignments
                .filter((a: any) => a.guestId.startsWith('manual-'))
                .map((a: any) => ({ ...a, tableId: '' }));
              patchConfig({ tableauAssignments: next });
              setConfirmResetAssignments(false);
            }}
            style={{
              width: '100%', height: '40px', borderRadius: '100px',
              background: '#f59e0b', color: '#fff', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 6px 18px rgba(245, 158, 11, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <AlertTriangle size={14} color="#fff" strokeWidth={2.5} />
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Sicuro? Azzera tutto
            </span>
          </button>
        ) : (
          <button
            onClick={() => setConfirmResetAssignments(true)}
            style={{
              width: '100%', height: '40px', borderRadius: '100px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1.5px solid rgba(245, 158, 11, 0.3)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s ease'
            }}
            title="Rimuove tutte le assegnazioni guest→tavolo (gli ospiti manuali restano in lista, non assegnati)"
          >
            <RotateCcw size={13} color="#d97706" strokeWidth={2.5} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Azzera tutte le assegnazioni
            </span>
          </button>
        )
      )}
    </div>
  );
};

export default RulesSection;
