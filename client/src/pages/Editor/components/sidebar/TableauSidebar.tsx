import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Surface, Button } from "../../../../ui";
import {
  LayoutGrid, Plus, Trash2, Heart, HeartOff, Zap,
  Circle, Square, Users, Pencil, ChevronUp, ChevronDown, ChevronRight,
  AlertTriangle, Sparkles, X, Search, UserPlus, Minus, RotateCcw
} from "lucide-react";
import type { Block, EventData } from "../../../../types/editor";
import { apiFetch } from "../../../../utils/apiFetch";
import { optimizeSeating } from "../../../../utils/seatingEngine";
import type { SplitWarning } from "../../../../utils/seatingEngine";
import EventPurchaseModal from "../../../../components/payments/EventPurchaseModal";
import CustomColorPicker from '../CustomColorPicker';
import { useTableauTotals } from './tableau/hooks/useTableauTotals';
import OverflowModal from './tableau/modals/OverflowModal';
import PublishConfirmModal from './tableau/modals/PublishConfirmModal';
import SeatingWarningsModal from './tableau/modals/SeatingWarningsModal';
import ConstraintWarningModal from './tableau/modals/ConstraintWarningModal';
import CustomTableSelect from './tableau/shared/CustomTableSelect';
import GuestSearchSelect from './tableau/shared/GuestSearchSelect';
import CapacityWarningModal from './tableau/modals/CapacityWarningModal';
import TableCard from './tableau/cards/TableCard';

interface TableauSidebarProps {
  selectedBlock: Block;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  eventRsvps: any[];
  hasTableauAccess?: boolean | undefined;
  slug?: string | undefined;
  eventTitle?: string | undefined;
  updateEventData?: ((updates: Partial<EventData>, pushToHistory?: () => void) => void) | undefined;
  event?: EventData | null | undefined;
}

const TableauSidebar: React.FC<TableauSidebarProps> = ({ 
  selectedBlock, 
  onUpdateBlock, 
  eventRsvps,
  hasTableauAccess = false,
  slug,
  eventTitle = "Evento",
  updateEventData,
  event
}) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'guests'>('tables');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [guestA, setGuestA] = useState('');
  const [guestB, setGuestB] = useState('');
  const [manualGuestName, setManualGuestName] = useState('');
  const [manualGuestCount, setManualGuestCount] = useState(1);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [confirmDeleteTableId, setConfirmDeleteTableId] = useState<string | null>(null);
  const [seatingWarnings, setSeatingWarnings] = useState<SplitWarning[]>([]);

  useEffect(() => {
    if (confirmDeleteTableId) {
      const timer = setTimeout(() => {
        setConfirmDeleteTableId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmDeleteTableId]);

  const [displayColorPicker, setDisplayColorPicker] = useState<boolean | string>(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [capacityWarning, setCapacityWarning] = useState<{
    tableId: string;
    tableIndex: number;
    guestCount: number;
    capacity: number;
    incomingGuests: { id: string; name: string }[];
    snapshotAssignments: any[];
    onConfirm: (idsToCommit?: string[]) => void;
    onRedirect: (newTableId: string) => void;
  } | null>(null);
  const [constraintWarning, setConstraintWarning] = useState<{
    type: 'avoid' | 'together';
    guestName: string;
    otherGuestName: string;
    otherTableName?: string;
    onConfirm: () => void;
  } | null>(null);
  // Tracking sessione modale: ospiti "in arrivo" che l'utente ha già riassegnato esplicitamente in questo modale
  const [modalHandledIds, setModalHandledIds] = useState<string[]>([]);
  const [confirmDeleteManualId, setConfirmDeleteManualId] = useState<string | null>(null);
  const [confirmResetAssignments, setConfirmResetAssignments] = useState(false);
  // Modale overflow ospiti > posti
  const [showOverflowModal, setShowOverflowModal] = useState(false);
  const [newTableNameInput, setNewTableNameInput] = useState('');
  const [newTableCapacityInput, setNewTableCapacityInput] = useState(10);

  // Reset del tracking ogni volta che il modale apre/cambia contesto
  useEffect(() => {
    setModalHandledIds([]);
  }, [capacityWarning]);

  // Auto-reset double-check elimina ospite manuale
  useEffect(() => {
    if (confirmDeleteManualId) {
      const t = setTimeout(() => setConfirmDeleteManualId(null), 3000);
      return () => clearTimeout(t);
    }
  }, [confirmDeleteManualId]);

  // Auto-reset double-check azzera assegnazioni
  useEffect(() => {
    if (confirmResetAssignments) {
      const t = setTimeout(() => setConfirmResetAssignments(false), 3000);
      return () => clearTimeout(t);
    }
  }, [confirmResetAssignments]);

  const config = selectedBlock.widgetProps || {};
  const tables = config.tableauTables || [];
  const assignments = (config.tableauAssignments || []) as any[];
  const constraints = config.tableauConstraints || [];

  const {
    allGuests,
    totalRsvpGuests,
    totalManualGuests,
    totalConfirmedGuests,
    totalCapacity,
    missingSeats,
    spareSeats,
  } = useTableauTotals(eventRsvps, assignments, tables);

  // Helper: apre il modale overflow con valori suggeriti, dato un missing calcolato (anche proiettato)
  const openOverflowModal = (missing: number) => {
    if (missing <= 0) return;
    setShowOverflowModal(true);
    setNewTableNameInput(`Tavolo ${tables.length + 1}`);
    setNewTableCapacityInput(Math.max(2, missing));
  };

  const closeOverflowModal = () => {
    setShowOverflowModal(false);
  };

  const patchConfig = (patch: any) => {
    if (!hasTableauAccess) return;
    onUpdateBlock(selectedBlock.id!, {
      widgetProps: { ...config, ...patch }
    });
  };

  // Normalizza i sub-id dei membri di gruppi manuali (manual-X__subN -> manual-X)
  // perché in `assignments` esiste solo il record del gruppo, non dei singoli membri.
  const normalizeGuestId = (id: string) => id.replace(/__sub\d+$/, '');

  const checkConstraintConflict = (guestIds: string[], targetTableId: string) => {
    for (const guestId of guestIds) {
      const gIdNorm = normalizeGuestId(guestId);
      for (const c of constraints as any[]) {
        const c1 = normalizeGuestId(c.guestId1);
        const c2 = normalizeGuestId(c.guestId2);
        if (c1 !== gIdNorm && c2 !== gIdNorm) continue;
        const otherId = c1 === gIdNorm ? c2 : c1;
        const otherAssignment = assignments.find((a: any) => a.guestId === otherId);
        if (c.type === 'avoid' && otherAssignment?.tableId === targetTableId) {
          return {
            type: 'avoid' as const,
            guestName: allGuests.find(g => g.id === guestId)?.name || 'Ospite',
            otherGuestName: allGuests.find(g => g.id === otherId || normalizeGuestId(g.id) === otherId)?.name || 'Ospite',
          };
        }
        if (c.type === 'together' && otherAssignment?.tableId && otherAssignment.tableId !== targetTableId) {
          return {
            type: 'together' as const,
            guestName: allGuests.find(g => g.id === guestId)?.name || 'Ospite',
            otherGuestName: allGuests.find(g => g.id === otherId || normalizeGuestId(g.id) === otherId)?.name || 'Ospite',
            otherTableName: tables.find((t: any) => t.id === otherAssignment.tableId)?.name || 'altro tavolo',
          };
        }
      }
    }
    return null;
  };

  const handleOptimize = () => {
    // Se ci sono più ospiti che posti, l'ottimizzazione non può funzionare bene.
    // Mostra il modale per aumentare capienza/aggiungere tavolo invece di lanciarla.
    if (missingSeats > 0) {
      openOverflowModal(missingSeats);
      return;
    }
    const manualAll = assignments.filter((a: any) => a.guestId.startsWith('manual-'));
    const manualAssigned = manualAll.filter((a: any) => a.tableId);
    const manualUnassigned = manualAll.filter((a: any) => !a.tableId);
    const preOccupancy = new Map<string, number>();
    manualAssigned.forEach((a: any) => {
      preOccupancy.set(a.tableId, (preOccupancy.get(a.tableId) || 0) + (a.numPeople || 1));
    });
    const result = optimizeSeating(tables, eventRsvps, constraints, preOccupancy);

    // Calcolo occupazione dopo gli RSVP per piazzare anche i manuali non assegnati
    const occupancyAfter = new Map<string, number>(preOccupancy);
    result.assignments.forEach((a: any) => {
      occupancyAfter.set(a.tableId, (occupancyAfter.get(a.tableId) || 0) + 1);
    });
    // Greedy: gruppi più grandi per primi nei tavoli con spazio
    const sortedManuals = [...manualUnassigned].sort((a: any, b: any) => (b.numPeople || 1) - (a.numPeople || 1));
    const placedManuals = sortedManuals.map((m: any) => {
      const groupSize = m.numPeople || 1;
      const targetTable = tables.find((t: any) => {
        const occ = occupancyAfter.get(t.id) || 0;
        return (t.capacity - occ) >= groupSize;
      });
      if (targetTable) {
        occupancyAfter.set(targetTable.id, (occupancyAfter.get(targetTable.id) || 0) + groupSize);
        return { ...m, tableId: targetTable.id };
      }
      return m;
    });

    const finalManuals = [...manualAssigned, ...placedManuals];
    patchConfig({ tableauAssignments: [...finalManuals, ...result.assignments] });
    if (result.warnings.length > 0) {
      setSeatingWarnings(result.warnings);
    }
  };

  const handleActivate = () => {
    setIsPurchaseModalOpen(true);
  };

  const addTable = () => {
    const newTable = {
      id: `table-${Date.now()}`,
      name: `Tavolo ${tables.length + 1}`,
      capacity: 10,
      shape: 'round' as const,
      x: 400,
      y: 300
    };
    patchConfig({ tableauTables: [...tables, newTable] });
  };

  const removeTable = (id: string) => {
    patchConfig({ 
      tableauTables: tables.filter((t: any) => t.id !== id),
      tableauAssignments: assignments.filter((a: any) => a.tableId !== id)
    });
  };

  const moveTable = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= tables.length) return;
    const next = [...tables];
    const temp = next[index];
    next[index] = next[newIndex];
    next[newIndex] = temp;
    patchConfig({ tableauTables: next });
  };

  return (
    <Surface variant="soft" className="panel-section" style={{ position: 'relative', overflow: hasTableauAccess ? 'visible' : 'hidden', minHeight: '400px' }}>
      {!hasTableauAccess && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1000,
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <LayoutGrid size={24} />
          </div>
          <h4 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Tableau Premium</h4>
          <p style={{ margin: '0 0 20px', fontSize: '11px', lineHeight: 1.5, color: 'var(--text-soft)', maxWidth: '200px' }}>
            Attiva l'add-on per gestire i tavoli, gli ospiti e usare l'algoritmo intelligente.
          </p>
          <Button 
            variant="primary" 
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleActivate}
          >
            Attiva ora per €15
          </Button>

          {slug && (
            <EventPurchaseModal 
              open={isPurchaseModalOpen}
              onClose={() => setIsPurchaseModalOpen(false)}
              eventSlug={slug}
              eventTitle={eventTitle}
              purchaseType="tableau_addon"
              onUnlocked={() => {
                // Notifica successo e aggiorna stato locale senza refresh
                setIsPurchaseModalOpen(false);
                if (updateEventData) {
                  updateEventData({ 
                    addons: { 
                      ...(event?.addons || {}), 
                      tableau: true 
                    } 
                  });
                }
              }}
            />
          )}
        </div>
      )}
      
      {/* HEADER */}
      <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(var(--accent-rgb), 0.12)',
            border: '1px solid rgba(var(--accent-rgb), 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Users size={18} color="var(--accent)" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Stai modificando</div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>Tableau de Mariage</h3>
          </div>
        </div>
        
        <p style={{ fontSize: '10px', color: 'var(--text-soft)', lineHeight: 1.4, margin: '0 0 12px' }}>
          Pubblica il tableau in pagina pubblica solo quando sarai sicuro della disposizione definitiva.
        </p>

        {!showPublishConfirm ? (
          <Button 
            variant={config.tableauIsPublished ? "subtle" : "primary"}
            onClick={() => setShowPublishConfirm(true)}
            style={{ width: '100%', fontSize: '11px', height: '32px', justifyContent: 'center', borderRadius: '100px' }}
          >
            {config.tableauIsPublished ? "Rendi Privato (Bozza)" : "Pubblica Tableau"}
          </Button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button 
              variant="ghost" 
              onClick={() => setShowPublishConfirm(false)}
              style={{ flex: 1, fontSize: '10px', height: '32px', borderRadius: '100px' }}
            >
              Annulla
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                patchConfig({ tableauIsPublished: !config.tableauIsPublished });
                setShowPublishConfirm(false);
              }}
              style={{ flex: 1, fontSize: '10px', height: '32px', borderRadius: '100px', background: config.tableauIsPublished ? '#ff4d4d' : 'var(--accent)' }}
            >
              {config.tableauIsPublished ? "Sì, nascondi" : "Sì, pubblica"}
            </Button>
          </div>
        )}
      </div>

      {/* TITOLI E DESCRIZIONE */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '0.05em' }}>Titolo Tableau</label>
        <div style={{ display: 'flex', alignItems: 'center', background: 'transparent', borderRadius: '0' }}>
          <Pencil size={14} style={{ color: 'var(--text-soft)', marginRight: '12px', flexShrink: 0 }} />
          <input
            type="text"
            value={config.tableauTitle ?? 'TABLEAU DE MARIAGE'}
            onChange={e => patchConfig({ tableauTitle: e.target.value })}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', minWidth: 0 }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '0.05em' }}>Descrizione Tableau</label>
        <div style={{ display: 'flex', alignItems: 'flex-start', background: 'transparent', borderRadius: '0' }}>
          <Pencil size={14} style={{ color: 'var(--text-soft)', marginRight: '12px', marginTop: '3px', flexShrink: 0 }} />
          <textarea
            value={config.tableauDescription ?? 'Cerca il tuo nome per trovare il tuo posto.'}
            onChange={e => patchConfig({ tableauDescription: e.target.value })}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'var(--text-primary)', minWidth: 0, resize: 'vertical' }}
            rows={2}
          />
        </div>
      </div>

      {/* COLORE ACCENTO WIDGET - GLOBALE */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
          Stile
        </label>
        <Button
          variant={displayColorPicker === 'tableauAccent' ? 'primary' : 'subtle'}
          onClick={() => setDisplayColorPicker(displayColorPicker === 'tableauAccent' ? false : 'tableauAccent')}
          style={{ width: '100%', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '100px' }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Pulsanti & Accenti</span>
          <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: config.tableauAccentColor || 'var(--accent)', border: '1px solid rgba(0,0,0,0.1)' }} />
        </Button>
        {displayColorPicker === 'tableauAccent' && (
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '8px' }}>
            <CustomColorPicker
              color={config.tableauAccentColor || '#1a1a1a'}
              onChange={(color) => patchConfig({ tableauAccentColor: color })}
            />
          </div>
        )}
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', background: 'var(--surface-light)', padding: '3px', borderRadius: '100px', border: '1px solid var(--border)' }}>
        <Button 
          variant={activeTab === 'tables' ? 'primary' : 'ghost'} 
          onClick={() => setActiveTab('tables')}
          style={{ flex: 1, padding: '6px 2px', fontSize: '10px', height: 'auto', fontWeight: 800, borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em', justifyContent: 'center' }}
        >
          Tavoli
        </Button>
        <Button
          variant={activeTab === 'guests' ? 'primary' : 'ghost'}
          onClick={() => {
            const wasOnTables = activeTab !== 'guests';
            setActiveTab('guests');
            if (wasOnTables && missingSeats > 0) openOverflowModal(missingSeats);
          }}
          style={{ flex: 1, padding: '6px 2px', fontSize: '10px', height: 'auto', fontWeight: 800, borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em', justifyContent: 'center' }}
        >
          Ospiti &amp; Regole
        </Button>
      </div>

      {/* CONTENT: TABLES */}
      {activeTab === 'tables' && (
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
      )}

      {/* CONTENT: GUESTS + RULES */}
      {activeTab === 'guests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* ── MOTORE INTELLIGENTE ── */}
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

          {/* ── DIVIDER ── */}
          <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

          {/* MANUAL GUEST ADD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Aggiungi ospite / gruppo extra
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
              <input
                placeholder="Nome ospite o gruppo..."
                value={manualGuestName}
                onChange={(e) => setManualGuestName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && manualGuestName.trim()) {
                    const guestId = `manual-${Date.now()}`;
                    const names = Array.from({ length: manualGuestCount }, (_, i) => i === 0 ? manualGuestName : '');
                    patchConfig({ tableauAssignments: [...assignments, { guestId, guestName: manualGuestName, numPeople: manualGuestCount, names, tableId: '' }] });
                    const projectedTotal = totalConfirmedGuests + manualGuestCount;
                    if (projectedTotal > totalCapacity) openOverflowModal(projectedTotal - totalCapacity);
                    setManualGuestName(''); setManualGuestCount(1);
                  }
                }}
                style={{ flex: 1, background: '#fff', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '9px 12px', fontSize: '12px', outline: 'none', fontWeight: 600 }}
              />
              {/* Contatore persone */}
              <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <button
                  onClick={() => setManualGuestCount(c => Math.max(1, c - 1))}
                  style={{ width: '32px', height: '100%', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >−</button>
                <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>{manualGuestCount}</span>
                <button
                  onClick={() => setManualGuestCount(c => c + 1)}
                  style={{ width: '32px', height: '100%', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >+</button>
              </div>
              <Button
                variant="subtle"
                disabled={!manualGuestName.trim()}
                onClick={() => {
                  const guestId = `manual-${Date.now()}`;
                  const names = Array.from({ length: manualGuestCount }, (_, i) => i === 0 ? manualGuestName : '');
                  patchConfig({ tableauAssignments: [...assignments, { guestId, guestName: manualGuestName, numPeople: manualGuestCount, names, tableId: '' }] });
                  const projectedTotal = totalConfirmedGuests + manualGuestCount;
                  if (projectedTotal > totalCapacity) openOverflowModal(projectedTotal - totalCapacity);
                  setManualGuestName(''); setManualGuestCount(1);
                }}
                style={{ padding: '0 12px', borderRadius: '12px', height: 'auto' }}
              >
                <Plus size={16} />
              </Button>
            </div>
            {manualGuestCount > 1 && (
              <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700, paddingLeft: '4px' }}>
                Gruppo di {manualGuestCount} persone — l'ottimizzazione li terrà insieme
              </div>
            )}
          </div>

          {/* MANUAL GUESTS LIST — stessa identica struttura delle card RSVP, con badge "Aggiunto manualmente" + cestino in testa */}
          {assignments.filter(a => a.guestId.startsWith('manual-')).map((assignment: any) => {
            const numPeople = assignment.numPeople || 1;
            const isAssigned = !!assignment.tableId;
            const isConfirmingDelete = confirmDeleteManualId === assignment.guestId;
            const isExpanded = expandedGroups.includes(assignment.guestId);
            const namesArr: string[] = (assignment.names && Array.isArray(assignment.names) && assignment.names.length > 0)
              ? assignment.names
              : Array.from({ length: numPeople }, (_, i) => i === 0 ? (assignment.guestName || '') : '');
            const toggleManualGroup = () => {
              setExpandedGroups(prev => prev.includes(assignment.guestId) ? prev.filter(id => id !== assignment.guestId) : [...prev, assignment.guestId]);
            };
            const updateNumPeople = (delta: number) => {
              const newCount = Math.max(1, numPeople + delta);
              const newNames = [...namesArr];
              while (newNames.length < newCount) newNames.push('');
              while (newNames.length > newCount) newNames.pop();
              const next = assignments.map(a => a.guestId === assignment.guestId
                ? { ...a, numPeople: newCount, names: newNames, guestName: newNames[0] || assignment.guestName }
                : a);
              patchConfig({ tableauAssignments: next });
            };
            const updateName = (idx: number, value: string) => {
              const newNames = [...namesArr];
              newNames[idx] = value;
              const next = assignments.map(a => a.guestId === assignment.guestId
                ? { ...a, names: newNames, guestName: newNames[0] || a.guestName }
                : a);
              patchConfig({ tableauAssignments: next });
            };
            return (
              <Surface key={assignment.guestId} variant="soft" style={{
                padding: '12px',
                borderRadius: '16px',
                border: isExpanded ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                background: isExpanded ? 'rgba(var(--accent-rgb), 0.02)' : 'var(--surface)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Top row: badge "AGGIUNTO MANUALMENTE" + cestino con doppio check */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '4px 10px', borderRadius: '100px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}>
                      <UserPlus size={11} color="#d97706" strokeWidth={2.5} />
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Aggiunto Manualmente
                      </span>
                    </div>
                    {isConfirmingDelete ? (
                      <button
                        onClick={() => {
                          const next = assignments.filter(a => a.guestId !== assignment.guestId);
                          patchConfig({ tableauAssignments: next });
                          setConfirmDeleteManualId(null);
                        }}
                        style={{
                          background: '#fee2e2', border: 'none', borderRadius: '10px',
                          padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px',
                          cursor: 'pointer', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.15)'
                        }}
                      >
                        <Trash2 size={12} color="#ef4444" strokeWidth={2.5} />
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sicuro?</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteManualId(assignment.guestId)}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          width: '28px', height: '28px', borderRadius: '8px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: 0.6, flexShrink: 0
                        }}
                        title="Elimina"
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    )}
                  </div>

                  {/* HEADER — identico a card RSVP: chevron + nome + meta cliccabile */}
                  <div
                    onClick={toggleManualGroup}
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
                        {assignment.guestName || 'Senza nome'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-soft)' }}>
                          {numPeople} {numPeople === 1 ? 'Persona' : 'Persone'}
                        </div>
                        <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--border)', opacity: 0.5 }} />
                        <div style={{
                          fontSize: '9px',
                          fontWeight: 800,
                          color: isAssigned ? 'var(--accent)' : '#f59e0b',
                          textTransform: 'uppercase'
                        }}>
                          {isAssigned ? `${numPeople}/${numPeople} Assegnati` : `0/${numPeople} Assegnati`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COLLAPSED — bulk select identico a RSVP */}
                  {!isExpanded && (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                      <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', display: 'block' }}>Assegna intero gruppo</label>
                      <CustomTableSelect
                        value={assignment.tableId || ''}
                        tables={tables}
                        assignments={assignments}
                        onChange={(tableId) => {
                          const next = assignments.map(a => a.guestId === assignment.guestId ? { ...a, tableId } : a);
                          patchConfig({ tableauAssignments: next });
                        }}
                        isBulk
                      />
                    </div>
                  )}

                  {/* EXPANDED — counter + nomi individuali + bulk select */}
                  {isExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                      <div>
                        <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', display: 'block' }}>
                          Numero persone
                        </label>
                        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--surface-light)', border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden', height: '32px' }}>
                          <button
                            onClick={() => updateNumPeople(-1)}
                            disabled={numPeople <= 1}
                            style={{
                              width: '32px', height: '100%', border: 'none', background: 'none',
                              cursor: numPeople <= 1 ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              opacity: numPeople <= 1 ? 0.3 : 1
                            }}
                          >
                            <Minus size={13} color="var(--text-soft)" strokeWidth={2.5} />
                          </button>
                          <span style={{ minWidth: '32px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {numPeople}
                          </span>
                          <button
                            onClick={() => updateNumPeople(1)}
                            style={{
                              width: '32px', height: '100%', border: 'none', background: 'none',
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            <Plus size={13} color="var(--accent)" strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', display: 'block' }}>
                          Nomi ospiti
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {namesArr.map((name, idx) => (
                            <div key={idx} style={{
                              display: 'flex', alignItems: 'center', gap: '8px',
                              background: 'var(--surface-light)', border: '1px solid var(--border-subtle)',
                              borderRadius: '10px', padding: '6px 10px'
                            }}>
                              <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', minWidth: '14px' }}>
                                {idx + 1}.
                              </span>
                              <input
                                value={name}
                                onChange={e => updateName(idx, e.target.value)}
                                placeholder={`Ospite ${idx + 1}`}
                                style={{
                                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                                  fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)',
                                  minWidth: 0
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', display: 'block' }}>Assegna intero gruppo</label>
                        <CustomTableSelect
                          value={assignment.tableId || ''}
                          tables={tables}
                          assignments={assignments}
                          onChange={(tableId) => {
                            const next = assignments.map(a => a.guestId === assignment.guestId ? { ...a, tableId } : a);
                            patchConfig({ tableauAssignments: next });
                          }}
                          isBulk
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Surface>
            );
          })}

          {/* RSVP GUESTS LIST */}
          <div style={{ 
            padding: '12px 16px', background: 'rgba(var(--accent-rgb), 0.08)', borderRadius: '14px', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px',
            border: '1px solid rgba(var(--accent-rgb), 0.15)'
          }}>
            <div>
              <div style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: '2px' }}>Riepilogo Posti</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Ospiti confermati</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                {assignments.filter((a: any) => a.tableId).reduce((acc, a) => acc + (a.numPeople || 1), 0)}
                <span style={{ fontSize: '13px', opacity: 0.3, margin: '0 4px', fontWeight: 400 }}>/</span>
                <span style={{ opacity: 0.5 }}>{totalConfirmedGuests}</span>
              </div>
              <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', marginTop: '2px' }}>Assegnati</div>
            </div>
          </div>

          {/* Alert overflow inline — visibile sotto al riepilogo se mancano posti */}
          {missingSeats > 0 && (
            <div style={{
              marginTop: '-8px', marginBottom: '16px',
              padding: '12px 14px', borderRadius: '14px',
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1.5px solid rgba(239, 68, 68, 0.22)',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <AlertTriangle size={16} color="#ef4444" strokeWidth={2.5} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                  Posti insufficienti
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  Mancano {missingSeats} {missingSeats === 1 ? 'posto' : 'posti'} per tutti gli ospiti.
                </div>
              </div>
              <button
                onClick={() => openOverflowModal(missingSeats)}
                style={{
                  background: '#ef4444', color: '#fff', border: 'none',
                  padding: '8px 14px', borderRadius: '100px', cursor: 'pointer',
                  fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
                }}
              >
                Risolvi
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {eventRsvps.filter(r => r.status === 'yes').map((rsvp: any) => {
              const rsvpId = rsvp._id || rsvp.id;
              const isExpanded = expandedGroups.includes(rsvpId);
              
              // Genera la lista degli ospiti basandosi su guestsCount (totale persone)
              let rsvpGuests: any[] = [];
              const totalCount = rsvp.guestsCount || 1;
              
              if (rsvp.guests && rsvp.guests.length > 0) {
                rsvpGuests = rsvp.guests;
              } else if (rsvp.allergiesDetail?.people && rsvp.allergiesDetail.people.length > 0) {
                rsvpGuests = rsvp.allergiesDetail.people;
              }
              
              if (rsvpGuests.length === 0) {
                rsvpGuests.push({ name: rsvp.name });
              }
              
              const currentNamesCount = rsvpGuests.length;
              if (currentNamesCount < totalCount) {
                for (let i = currentNamesCount; i < totalCount; i++) {
                  rsvpGuests.push({ name: `Ospite ${i + 1}` });
                }
              } else if (currentNamesCount > totalCount && totalCount > 0) {
                rsvpGuests = rsvpGuests.slice(0, totalCount);
              }

              // Bulk assignment logic
              const groupAssignments = rsvpGuests.map((_, idx) => assignments.find(a => a.guestId === `${rsvpId}-${idx}`));
              const firstTableId = groupAssignments[0]?.tableId || '';
              const isUniform = groupAssignments.every(a => (a?.tableId || '') === firstTableId);
              const bulkTableId = isUniform ? firstTableId : 'multiple';

              const toggleGroup = () => {
                setExpandedGroups(prev => prev.includes(rsvpId) ? prev.filter(id => id !== rsvpId) : [...prev, rsvpId]);
              };

              const bulkAssign = (tableId: string) => {
                if (!tableId) {
                  let next = assignments.filter(a => !rsvpGuests.some((_, i) => a.guestId === `${rsvpId}-${i}`));
                  patchConfig({ tableauAssignments: next });
                  return;
                }

                const table = tables.find((t: any) => t.id === tableId);
                const tableIndex = tables.findIndex((t: any) => t.id === tableId);
                const incomingCount = rsvpGuests.length;

                const execute = (idsToCommit?: string[]) => {
                  let next = [...assignments];
                  rsvpGuests.forEach((g, idx) => {
                    const gid = `${rsvpId}-${idx}`;
                    if (idsToCommit && !idsToCommit.includes(gid)) return;
                    const current = next.find(a => a.guestId === gid);
                    next = next.filter(a => a.guestId !== gid);
                    next.push({ guestId: gid, tableId, guestName: current?.guestName || g.name });
                  });
                  patchConfig({ tableauAssignments: next });
                  setCapacityWarning(null);
                  setConstraintWarning(null);
                };

                const proceed = () => {
                  const currentOccupancy = assignments.filter(a => a.tableId === tableId).reduce((acc, a) => acc + (a.numPeople || 1), 0);
                  if (table && currentOccupancy + incomingCount > table.capacity) {
                    setCapacityWarning({
                      tableId, tableIndex, guestCount: incomingCount, capacity: table.capacity,
                      incomingGuests: rsvpGuests.map((g: any, idx: number) => ({ id: `${rsvpId}-${idx}`, name: g.name })),
                      snapshotAssignments: [...assignments],
                      onConfirm: execute,
                      onRedirect: (newTableId: string) => { setCapacityWarning(null); bulkAssign(newTableId); }
                    });
                  } else {
                    execute();
                  }
                };

                const guestIds = rsvpGuests.map((_: any, i: number) => `${rsvpId}-${i}`);
                const conflict = checkConstraintConflict(guestIds, tableId);
                if (conflict) {
                  setConstraintWarning({ ...conflict, onConfirm: proceed });
                } else {
                  proceed();
                }
              };

              return (
                <Surface key={rsvpId} variant="soft" style={{ 
                  padding: '12px', 
                  borderRadius: '16px', 
                  border: isExpanded ? '1.5px solid var(--accent)' : '1px solid var(--border)', 
                  background: isExpanded ? 'rgba(var(--accent-rgb), 0.02)' : 'var(--surface)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' 
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div 
                      onClick={toggleGroup}
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
                          onChange={bulkAssign}
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
                        
                        const handleSingleAssign = (tableId: string) => {
                          if (!tableId) {
                            patchConfig({ tableauAssignments: assignments.filter(a => a.guestId !== guestId) });
                            return;
                          }

                          const table = tables.find((t: any) => t.id === tableId);
                          const tableIndex = tables.findIndex((t: any) => t.id === tableId);

                          const execute = (idsToCommit?: string[]) => {
                            if (idsToCommit && !idsToCommit.includes(guestId)) {
                              setCapacityWarning(null);
                              setConstraintWarning(null);
                              return;
                            }
                            let nextAssignments = assignments.filter((a: any) => a.guestId !== guestId);
                            nextAssignments.push({ guestId, tableId, guestName: displayName });
                            patchConfig({ tableauAssignments: nextAssignments });
                            setCapacityWarning(null);
                            setConstraintWarning(null);
                          };

                          const proceed = () => {
                            const currentOccupancy = assignments.filter(a => a.tableId === tableId).reduce((acc, a) => acc + (a.numPeople || 1), 0);
                            if (table && currentOccupancy + 1 > table.capacity) {
                              setCapacityWarning({
                                tableId, tableIndex, guestCount: 1, capacity: table.capacity,
                                incomingGuests: [{ id: guestId, name: displayName }],
                                snapshotAssignments: [...assignments],
                                onConfirm: execute,
                                onRedirect: (newTableId: string) => { setCapacityWarning(null); handleSingleAssign(newTableId); }
                              });
                            } else {
                              execute();
                            }
                          };

                          const conflict = checkConstraintConflict([guestId], tableId);
                          if (conflict) {
                            setConstraintWarning({ ...conflict, onConfirm: proceed });
                          } else {
                            proceed();
                          }
                        };

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
                                onChange={handleSingleAssign}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Surface>
              );
            })}

            {eventRsvps.filter(r => r.status === 'yes').length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 20px', opacity: 0.5, fontSize: '12px', background: 'var(--surface-light)', borderRadius: '12px', border: '1px dotted var(--border)' }}>
                Nessun ospite confermato trovato.
              </div>
            )}
          </div>
          
          {/* FOOTER DI PUBBLICAZIONE */}
          <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1.5px solid var(--border)' }}>
            <Surface variant="soft" style={{ 
              padding: '24px', 
              borderRadius: '24px', 
              border: '1.5px solid var(--border)',
              background: 'rgba(var(--accent-rgb), 0.03)',
              textAlign: 'center'
            }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                boxShadow: '0 8px 20px rgba(var(--accent-rgb), 0.2)'
              }}>
                <Zap size={20} color="#fff" />
              </div>
              
              <h4 style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pubblicazione
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-soft)', lineHeight: 1.5, marginBottom: '20px' }}>
                Salva le assegnazioni finali e rendi il tableau visibile ai tuoi ospiti nella pagina dell'evento.
              </p>

              <Button 
                variant="accent" 
                fullWidth
                onClick={() => {
                  const totalConfirmed = totalConfirmedGuests;
                  const totalAssigned = assignments.filter((a: any) => a.tableId).reduce((acc, a) => acc + (a.numPeople || 1), 0);

                  if (totalAssigned < totalConfirmed) {
                    setShowPublishConfirm(true);
                  } else {
                    patchConfig({ tableauIsPublished: !config.tableauIsPublished });
                  }
                }}
                style={{ height: '48px', borderRadius: '100px', fontWeight: 800, fontSize: '13px' }}
              >
                Pubblica Tableau
              </Button>
            </Surface>
          </div>
        </div>
      )}

      {/* MODALE WARNING PUBBLICAZIONE (PORTAL) */}
      <PublishConfirmModal
        show={showPublishConfirm}
        onClose={() => setShowPublishConfirm(false)}
        onConfirm={() => {
          patchConfig({ tableauIsPublished: true });
          setShowPublishConfirm(false);
        }}
      />

      {/* SEATING WARNING MODAL */}
      <SeatingWarningsModal
        warnings={seatingWarnings}
        onClose={() => setSeatingWarnings([])}
        assignments={assignments}
        tables={tables}
        patchConfig={patchConfig}
      />

      {/* CAPACITY WARNING MODAL */}
      <CapacityWarningModal
        warning={capacityWarning}
        onClose={() => setCapacityWarning(null)}
        assignments={assignments}
        tables={tables}
        modalHandledIds={modalHandledIds}
        setModalHandledIds={setModalHandledIds}
        patchConfig={patchConfig}
      />

      {/* CONSTRAINT WARNING MODAL */}
      <ConstraintWarningModal
        warning={constraintWarning}
        onClose={() => setConstraintWarning(null)}
      />

      {/* OVERFLOW MODAL — più ospiti che posti */}
      <OverflowModal
        show={showOverflowModal}
        onClose={closeOverflowModal}
        totalConfirmedGuests={totalConfirmedGuests}
        totalCapacity={totalCapacity}
        missingSeats={missingSeats}
        tables={tables}
        patchConfig={patchConfig}
        setActiveTab={setActiveTab}
        newTableNameInput={newTableNameInput}
        setNewTableNameInput={setNewTableNameInput}
        newTableCapacityInput={newTableCapacityInput}
        setNewTableCapacityInput={setNewTableCapacityInput}
      />
    </Surface>
  );
};

export default TableauSidebar;
