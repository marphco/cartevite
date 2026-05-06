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
import GuestsSection from './tableau/sections/GuestsSection';
import MetadataSection from './tableau/sections/MetadataSection';

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

      <MetadataSection
        config={config}
        patchConfig={patchConfig}
        displayColorPicker={displayColorPicker}
        setDisplayColorPicker={setDisplayColorPicker}
      />

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

          <GuestsSection
            assignments={assignments}
            tables={tables}
            eventRsvps={eventRsvps}
            config={config}
            expandedGroups={expandedGroups}
            setExpandedGroups={setExpandedGroups}
            manualGuestName={manualGuestName}
            setManualGuestName={setManualGuestName}
            manualGuestCount={manualGuestCount}
            setManualGuestCount={setManualGuestCount}
            confirmDeleteManualId={confirmDeleteManualId}
            setConfirmDeleteManualId={setConfirmDeleteManualId}
            setCapacityWarning={setCapacityWarning}
            setConstraintWarning={setConstraintWarning}
            setShowPublishConfirm={setShowPublishConfirm}
            totalConfirmedGuests={totalConfirmedGuests}
            totalCapacity={totalCapacity}
            missingSeats={missingSeats}
            patchConfig={patchConfig}
            openOverflowModal={openOverflowModal}
            checkConstraintConflict={checkConstraintConflict}
          />
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
