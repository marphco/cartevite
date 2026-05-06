import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Surface } from '../../../../../../ui';
import CustomTableSelect from '../shared/CustomTableSelect';

interface GuestRsvpCardProps {
  rsvp: any;
  rsvpId: string;
  rsvpGuests: any[];
  isExpanded: boolean;
  groupAssignments: (any | undefined)[];
  bulkTableId: string;
  tables: any[];
  assignments: any[];
  onToggle: () => void;
  onBulkAssign: (tableId: string) => void;
  onSingleAssign: (guestId: string, displayName: string, tableId: string) => void;
}

const GuestRsvpCard: React.FC<GuestRsvpCardProps> = ({
  rsvp,
  rsvpId,
  rsvpGuests,
  isExpanded,
  groupAssignments,
  bulkTableId,
  tables,
  assignments,
  onToggle,
  onBulkAssign,
  onSingleAssign,
}) => {
  return (
    <Surface variant="soft" style={{
      padding: '12px',
      borderRadius: '16px',
      border: isExpanded ? '1.5px solid var(--accent)' : '1px solid var(--border)',
      background: isExpanded ? 'rgba(var(--accent-rgb), 0.02)' : 'var(--surface)',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          onClick={onToggle}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: isExpanded ? 'var(--accent)' : 'rgba(var(--accent-rgb), 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}>
            {isExpanded ? <ChevronUp size={16} color="#fff" /> : <ChevronDown size={16} color="var(--accent)" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {rsvp.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-soft)' }}>
                {rsvpGuests.length} {rsvpGuests.length === 1 ? 'Ospite' : 'Ospiti'}
              </div>
              <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--border)', opacity: 0.5 }} />
              <div style={{
                fontSize: '9px',
                fontWeight: 800,
                color: groupAssignments.every(a => a?.tableId) ? 'var(--accent)' : '#f59e0b',
                textTransform: 'uppercase'
              }}>
                {groupAssignments.filter(a => a?.tableId).length}/{rsvpGuests.length} Assegnati
              </div>
            </div>
          </div>
        </div>

        {!isExpanded && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', display: 'block' }}>Assegna intero gruppo</label>
            <CustomTableSelect
              value={bulkTableId}
              tables={tables}
              assignments={assignments}
              onChange={onBulkAssign}
              isBulk
            />
          </div>
        )}
      </div>

      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          {rsvpGuests.map((guest: any, gIdx: number) => {
            const guestId = `${rsvpId}-${gIdx}`;
            const currentAssignment = assignments.find((a: any) => a.guestId === guestId);
            const displayName = guest.name;

            return (
              <div key={guestId} style={{
                display: 'flex', flexDirection: 'column', gap: '10px',
                padding: '12px', background: 'var(--surface-light)', borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                transition: 'all 0.2s ease'
              }}>
                {/* NOME OSPITE */}
                <div style={{ fontSize: '11px', fontWeight: 750, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: currentAssignment?.tableId ? 'var(--accent)' : '#f59e0b',
                    boxShadow: currentAssignment?.tableId ? '0 0 10px rgba(var(--accent-rgb), 0.4)' : '0 0 10px rgba(245, 158, 11, 0.4)',
                    flexShrink: 0
                  }} />
                  <span style={{ lineHeight: 1.4 }}>{displayName}</span>
                </div>

                {/* ASSEGNAZIONE */}
                <div style={{ width: '100%' }}>
                  <CustomTableSelect
                    value={currentAssignment?.tableId || ''}
                    tables={tables}
                    assignments={assignments}
                    onChange={(tableId) => onSingleAssign(guestId, displayName, tableId)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Surface>
  );
};

export default GuestRsvpCard;
