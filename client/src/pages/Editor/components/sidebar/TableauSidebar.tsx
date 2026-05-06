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
import GuestRsvpCard from './tableau/cards/GuestRsvpCard';
import GuestManualCard from './tableau/cards/GuestManualCard';
import TablesSection from './tableau/sections/TablesSection';
import RulesSection from './tableau/sections/RulesSection';

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
        <TablesSection
          tables={tables}
          totalConfirmedGuests={totalConfirmedGuests}
          totalCapacity={totalCapacity}
          missingSeats={missingSeats}
          spareSeats={spareSeats}
          confirmDeleteTableId={confirmDeleteTableId}
          patchConfig={patchConfig}
          addTable={addTable}
          moveTable={moveTable}
          removeTable={removeTable}
          setConfirmDeleteTableId={setConfirmDeleteTableId}
        />
      )}

      {/* CONTENT: GUESTS + RULES */}
      {activeTab === 'guests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* ── MOTORE INTELLIGENTE ── */}
          <RulesSection
            guestA={guestA}
            guestB={guestB}
            setGuestA={setGuestA}
            setGuestB={setGuestB}
            allGuests={allGuests}
            assignments={assignments}
            constraints={constraints}
            confirmResetAssignments={confirmResetAssignments}
            setConfirmResetAssignments={setConfirmResetAssignments}
            patchConfig={patchConfig}
            handleOptimize={handleOptimize}
          />

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
              <GuestManualCard
                key={assignment.guestId}
                assignment={assignment}
                numPeople={numPeople}
                isAssigned={isAssigned}
                isConfirmingDelete={isConfirmingDelete}
                isExpanded={isExpanded}
                namesArr={namesArr}
                tables={tables}
                assignments={assignments}
                onToggle={toggleManualGroup}
                onUpdateNumPeople={updateNumPeople}
                onUpdateName={updateName}
                onAssignTable={(tableId) => {
                  const next = assignments.map(a => a.guestId === assignment.guestId ? { ...a, tableId } : a);
                  patchConfig({ tableauAssignments: next });
                }}
                onRequestDelete={() => setConfirmDeleteManualId(assignment.guestId)}
                onConfirmDelete={() => {
                  const next = assignments.filter(a => a.guestId !== assignment.guestId);
                  patchConfig({ tableauAssignments: next });
                  setConfirmDeleteManualId(null);
                }}
              />
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

              const handleSingleAssign = (guestId: string, displayName: string, tableId: string) => {
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
                      onRedirect: (newTableId: string) => { setCapacityWarning(null); handleSingleAssign(guestId, displayName, newTableId); }
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
                <GuestRsvpCard
                  key={rsvpId}
                  rsvp={rsvp}
                  rsvpId={rsvpId}
                  rsvpGuests={rsvpGuests}
                  isExpanded={isExpanded}
                  groupAssignments={groupAssignments}
                  bulkTableId={bulkTableId}
                  tables={tables}
                  assignments={assignments}
                  onToggle={toggleGroup}
                  onBulkAssign={bulkAssign}
                  onSingleAssign={handleSingleAssign}
                />
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
