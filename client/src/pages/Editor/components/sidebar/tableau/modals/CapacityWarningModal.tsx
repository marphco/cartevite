import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import { Surface, Button } from '../../../../../../ui';
import CustomTableSelect from '../shared/CustomTableSelect';

export interface CapacityWarning {
  tableId: string;
  tableIndex: number;
  guestCount: number;
  capacity: number;
  incomingGuests: { id: string; name: string }[];
  snapshotAssignments: any[];
  onConfirm: (idsToCommit?: string[]) => void;
  onRedirect: (newTableId: string) => void;
}

interface CapacityWarningModalProps {
  warning: CapacityWarning | null;
  onClose: () => void;
  assignments: any[];
  tables: any[];
  modalHandledIds: string[];
  setModalHandledIds: React.Dispatch<React.SetStateAction<string[]>>;
  patchConfig: (patch: any) => void;
}

const CapacityWarningModal: React.FC<CapacityWarningModalProps> = ({
  warning,
  onClose,
  assignments,
  tables,
  modalHandledIds,
  setModalHandledIds,
  patchConfig,
}) => {
  if (!warning) return null;

  const liveOccupancy = assignments.filter(a => a.tableId === warning.tableId).reduce((acc, a) => acc + (a.numPeople || 1), 0);
  const tableName = tables[warning.tableIndex]?.name || 'Tavolo';
  const guestsAtTable = assignments.filter((a: any) => a.tableId === warning.tableId);
  const stillIncoming = warning.incomingGuests.filter(g => !modalHandledIds.includes(g.id));
  const stillIncomingIds = stillIncoming.map(g => g.id);
  const canProceed = liveOccupancy + stillIncoming.length <= warning.capacity;

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <Surface variant="soft" style={{
        maxWidth: '460px', width: '100%', borderRadius: '32px',
        boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.4)',
        animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
      }}>
        {/* Header */}
        <div style={{ padding: '32px 32px 24px', textAlign: 'center' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px', background: '#fffbeb',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            border: '1.5px solid #ffe699'
          }}>
            <AlertTriangle size={32} color="#f59e0b" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '10px', fontFamily: 'var(--font-heading)' }}>
            Limite Tavolo Superato
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-soft)', lineHeight: 1.6, margin: 0 }}>
            Stai aggiungendo <strong>{warning.guestCount} {warning.guestCount === 1 ? 'persona' : 'persone'}</strong> al tavolo <strong>{tableName}</strong>,
            che ha già <strong style={{ color: '#ef4444' }}>{liveOccupancy} {liveOccupancy === 1 ? 'ospite' : 'ospiti'}</strong> su <strong>{warning.capacity}</strong> posti.
          </p>
        </div>

        {/* Tre opzioni esplicite */}
        <div style={{ padding: '0 32px 16px' }}>
          <div style={{
            padding: '14px 16px', borderRadius: '14px',
            background: 'rgba(var(--accent-rgb), 0.04)',
            border: '1.5px solid rgba(var(--accent-rgb), 0.12)',
            fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.6
          }}>
            <div style={{ fontWeight: 800, marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)' }}>Hai tre opzioni</div>
            <div><strong>1.</strong> Sposta uno o più ospiti già al tavolo verso un altro tavolo libero.</div>
            <div style={{ marginTop: '4px' }}><strong>2.</strong> Riassegna il gruppo che stai aggiungendo a un altro tavolo con posti sufficienti.</div>
            <div style={{ marginTop: '4px' }}><strong>3.</strong> Aumenta la capienza del tavolo {tableName}.</div>
          </div>
        </div>

        {/* Liste — scrollabile globale */}
        <div style={{ overflowY: 'auto', flex: 1, borderTop: '1px solid var(--border)' }}>
          {/* Sezione: ospiti già al tavolo */}
          {guestsAtTable.length > 0 && (
            <div style={{ padding: '16px 32px 12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-soft)', marginBottom: '10px' }}>
                Già assegnati al tavolo {tableName}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {guestsAtTable.map((a: any) => (
                  <div key={a.guestId} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 10px', background: 'var(--surface-light)',
                    borderRadius: '12px', border: '1px solid var(--border)'
                  }}>
                    <span style={{ flex: 1, fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.guestName}</span>
                    <div style={{ width: '170px', flexShrink: 0 }}>
                      <CustomTableSelect
                        value={a.tableId}
                        tables={tables.filter((t: any) => {
                          if (t.id === a.tableId) return true;
                          const occ = assignments.filter((x: any) => x.tableId === t.id).reduce((acc: number, x: any) => acc + (x.numPeople || 1), 0);
                          return occ < t.capacity;
                        })}
                        assignments={assignments}
                        onChange={(newTableId) => {
                          const next = assignments.map((x: any) => x.guestId === a.guestId ? { ...x, tableId: newTableId } : x);
                          patchConfig({ tableauAssignments: next });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Separatore */}
          {guestsAtTable.length > 0 && stillIncoming.length > 0 && (
            <div style={{ padding: '4px 32px' }}>
              <div style={{ borderTop: '1px dashed var(--border)' }} />
            </div>
          )}

          {/* Sezione: gruppo in arrivo (per-ospite) */}
          {stillIncoming.length > 0 && (
            <div style={{ padding: '12px 32px 20px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#f59e0b', marginBottom: '10px' }}>
                In arrivo — {stillIncoming.length} {stillIncoming.length === 1 ? 'persona' : 'persone'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stillIncoming.map(g => (
                  <div key={g.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 10px', background: 'rgba(245,158,11,0.06)',
                    borderRadius: '12px', border: '1px solid rgba(245,158,11,0.2)'
                  }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</span>
                    <div style={{ width: '170px', flexShrink: 0 }}>
                      <CustomTableSelect
                        value=""
                        tables={tables.filter((t: any) => {
                          const occ = assignments.filter((x: any) => x.tableId === t.id).reduce((acc: number, x: any) => acc + (x.numPeople || 1), 0);
                          return occ < t.capacity;
                        })}
                        assignments={assignments}
                        placeholder="Assegna a..."
                        onChange={(newTableId) => {
                          if (!newTableId) return;
                          let next = assignments.filter((x: any) => x.guestId !== g.id);
                          next.push({ guestId: g.id, tableId: newTableId, guestName: g.name });
                          patchConfig({ tableauAssignments: next });
                          setModalHandledIds(prev => [...prev, g.id]);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: '20px 32px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {stillIncoming.length === 0 ? (
            <Button variant="primary" fullWidth onClick={onClose}
              style={{ height: '48px', borderRadius: '100px', fontWeight: 800 }}>
              Tutti riassegnati — Chiudi
            </Button>
          ) : canProceed ? (
            <Button variant="primary" fullWidth onClick={() => { warning.onConfirm(stillIncomingIds); }}
              style={{ height: '48px', borderRadius: '100px', fontWeight: 800 }}>
              Spazio libero — Procedi
            </Button>
          ) : (
            <Button variant="primary" fullWidth
              onClick={() => {
                const nextTables = [...tables];
                nextTables[warning.tableIndex] = {
                  ...nextTables[warning.tableIndex],
                  capacity: liveOccupancy + stillIncoming.length
                };
                patchConfig({ tableauTables: nextTables });
                warning.onConfirm(stillIncomingIds);
              }}
              style={{ height: '48px', borderRadius: '100px', fontWeight: 800 }}>
              Aumenta capienza tavolo {tableName}
            </Button>
          )}
          <Button variant="ghost" fullWidth onClick={() => {
            patchConfig({ tableauAssignments: warning.snapshotAssignments });
            onClose();
          }}
            style={{ height: '48px', borderRadius: '100px', color: 'var(--text-soft)', fontWeight: 700 }}>
            Annulla
          </Button>
        </div>
      </Surface>
    </div>,
    document.body
  );
};

export default CapacityWarningModal;
