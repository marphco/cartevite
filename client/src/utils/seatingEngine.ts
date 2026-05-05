/**
 * SEATING ENGINE - Ynvio
 * Algoritmo di assegnazione intelligente degli ospiti ai tavoli.
 * 
 * Obiettivi:
 * 1. Non separare mai i gruppi (stessa RSVP) se possibile.
 * 2. Rispettare la capienza massima di ogni tavolo.
 * 3. Rispettare i vincoli utente (Insieme / Separati).
 */

export interface Table {
  id: string;
  name: string;
  capacity: number;
}

export interface GuestGroup {
  id: string;
  name: string;
  size: number;
  guests: { name: string; id: string }[];
}

export interface Constraint {
  type: 'together' | 'avoid';
  guestId1: string;
  guestId2: string;
}

export interface Assignment {
  guestId: string;
  tableId: string;
  guestName: string;
}

export interface SplitWarning {
  type: 'group_split' | 'constraint_unresolved';
  groupGuests: { id: string; name: string }[];
  reason: string;
}

export interface SeatingResult {
  assignments: Assignment[];
  warnings: SplitWarning[];
}

export const optimizeSeating = (
  tables: Table[],
  rsvps: any[],
  constraints: Constraint[] = [],
  preAssignedOccupancy: Map<string, number> = new Map()
): SeatingResult => {
  // 1. Prepariamo i dati degli ospiti
  let confirmedGuests = rsvps
    .filter(r => r.status === 'yes')
    .flatMap(r => {
      const guests = r.guests || [{ name: r.name }];
      return guests.map((g: any, i: number) => ({
        id: `${r._id || r.id}-${i}`,
        name: g.name || 'Ospite',
        rsvpId: r._id || r.id
      }));
    });

  const assignments: Assignment[] = [];
  const warnings: SplitWarning[] = [];
  const tableStates = tables.map(t => ({ ...t, remaining: t.capacity - (preAssignedOccupancy.get(t.id) || 0) }));

  // 2. Gestione Vincoli "Together" -> Creiamo dei Super-Gruppi
  // Se A deve stare con B, e B è in un gruppo RSVP, allora A deve stare con quel gruppo.
  const groupsToAssign: { guests: typeof confirmedGuests }[] = [];
  const processedGuestIds = new Set<string>();

  // Prima creiamo gruppi basati sulle RSVP (comportamento default: non separare famiglie)
  const rsvpGroups = new Map<string, typeof confirmedGuests>();
  confirmedGuests.forEach(g => {
    if (!rsvpGroups.has(g.rsvpId)) rsvpGroups.set(g.rsvpId, []);
    rsvpGroups.get(g.rsvpId)!.push(g);
  });

  // Integriamo i vincoli "together" nei gruppi RSVP
  // Per semplicità, se un vincolo unisce due persone di RSVP diverse, uniamo le due RSVP.
  const mergedGroups = Array.from(rsvpGroups.values());

  constraints.filter(c => c.type === 'together').forEach(c => {
    const g1 = c.guestId1;
    const g2 = c.guestId2;
    
    let groupIdx1 = mergedGroups.findIndex(grp => grp.some(g => g.id === g1));
    let groupIdx2 = mergedGroups.findIndex(grp => grp.some(g => g.id === g2));

    if (groupIdx1 !== -1 && groupIdx2 !== -1 && groupIdx1 !== groupIdx2) {
      // Uniamo i due gruppi
      const spliced = mergedGroups.splice(groupIdx2, 1);
      const grp2 = spliced[0];
      if (!grp2) return;
      // Se splice ha rimosso un elemento prima di groupIdx1, l'indice è cambiato
      groupIdx1 = mergedGroups.findIndex(grp => grp.some(g => g.id === g1));
      const targetGroup = groupIdx1 !== -1 ? mergedGroups[groupIdx1] : undefined;
      if (targetGroup) targetGroup.push(...grp2);
    }
  });

  // Ordiniamo i gruppi dal più grande al più piccolo per ottimizzare lo spazio
  mergedGroups.sort((a, b) => b.length - a.length);

  // 3. Assegnazione Greedy con controllo vincoli "Avoid"
  for (const group of mergedGroups) {
    const groupSize = group.length;

    // Cerchiamo un tavolo che:
    // 1. Abbia spazio
    // 2. Non contenga persone che devono stare SEPARATE da membri di questo gruppo
    let bestTable = tableStates.find(t => {
      if (t.remaining < groupSize) return false;

      // Controllo vincoli "avoid"
      const guestsAlreadyAtTable = assignments.filter(a => a.tableId === t.id).map(a => a.guestId);
      const conflict = constraints.some(c => {
        if (c.type !== 'avoid') return false;
        const id1 = c.guestId1;
        const id2 = c.guestId2;
        // Se uno dei due è nel gruppo corrente e l'altro è già al tavolo -> CONFLITTO
        const groupHas1 = group.some(g => g.id === id1);
        const groupHas2 = group.some(g => g.id === id2);
        const tableHas1 = guestsAlreadyAtTable.includes(id1);
        const tableHas2 = guestsAlreadyAtTable.includes(id2);

        return (groupHas1 && tableHas2) || (groupHas2 && tableHas1);
      });

      return !conflict;
    });

    if (bestTable) {
      group.forEach(g => {
        assignments.push({ guestId: g.id, tableId: bestTable!.id, guestName: g.name });
      });
      bestTable.remaining -= groupSize;
    } else {
      // Fallback: piazza individualmente dove c'è spazio (post-processing tenterà di correggere)
      group.forEach(g => {
        const anySpaceTable = tableStates.find(t => t.remaining > 0);
        if (anySpaceTable) {
          assignments.push({ guestId: g.id, tableId: anySpaceTable.id, guestName: g.name });
          anySpaceTable.remaining--;
        }
      });
    }
  }

  // Post-processing: group-aware avoid swap.
  // When A and B must be separated, move B's entire RSVP group (not just B),
  // keeping families/couples together.
  let improved = true;
  let safetyIterations = 0;
  const MAX_ITERATIONS = 50; // prevenzione loop infinito su vincoli irrisolvibili
  while (improved && safetyIterations < MAX_ITERATIONS) {
    improved = false;
    safetyIterations++;
    for (const c of constraints.filter(c => c.type === 'avoid')) {
      const a1 = assignments.find(a => a.guestId === c.guestId1);
      const a2 = assignments.find(a => a.guestId === c.guestId2);
      if (!a1 || !a2 || a1.tableId !== a2.tableId) continue;

      const violatingTableId = a2.tableId;

      // Find the entire RSVP group of guestId2 (e.g. Brad Pitt + Angelina Jolie)
      const g2group = mergedGroups.find(grp => grp.some(g => g.id === c.guestId2)) ?? [];
      const g2Ids = new Set(g2group.map(g => g.id));
      const groupSize = Math.max(g2Ids.size, 1);

      const otherTableIds = [...new Set(assignments.map(a => a.tableId))].filter(t => t !== violatingTableId);

      for (const targetId of otherTableIds) {
        const targetOccupancy = assignments.filter(a => a.tableId === targetId).length;
        const targetCap = tableStates.find(t => t.id === targetId)?.capacity ?? 0;

        if (targetOccupancy + groupSize <= targetCap) {
          // Free space: move entire group
          assignments.forEach((a, i) => {
            if (g2Ids.has(a.guestId)) assignments[i] = { ...assignments[i], tableId: targetId };
          });
          improved = true;
          break;
        }

        // No free space: try group-for-group swap with same-size RSVP group at target
        const swapCandidate = mergedGroups.find(grp =>
          grp.length === groupSize &&
          !grp.some(g => g2Ids.has(g.id)) &&
          grp.every(g => assignments.some(a => a.guestId === g.id && a.tableId === targetId))
        );
        if (swapCandidate) {
          const swapIds = new Set(swapCandidate.map(g => g.id));
          assignments.forEach((a, i) => {
            if (g2Ids.has(a.guestId)) assignments[i] = { ...assignments[i], tableId: targetId };
            else if (swapIds.has(a.guestId)) assignments[i] = { ...assignments[i], tableId: violatingTableId };
          });
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  // Dopo il post-processing: rileva gruppi RSVP effettivamente divisi su tavoli diversi
  const rsvpGroupIds = Array.from(new Set(confirmedGuests.map(g => g.rsvpId)));
  for (const rsvpId of rsvpGroupIds) {
    const groupMembers = confirmedGuests.filter(g => g.rsvpId === rsvpId);
    if (groupMembers.length <= 1) continue;
    const assignedTableIds = new Set(
      groupMembers
        .map(g => assignments.find(a => a.guestId === g.id)?.tableId)
        .filter((id): id is string => Boolean(id))
    );
    if (assignedTableIds.size > 1) {
      warnings.push({
        type: 'group_split',
        groupGuests: groupMembers.map(g => ({ id: g.id, name: g.name })),
        reason: `Il gruppo di ${groupMembers.length} persone è stato diviso su più tavoli: capienza insufficiente. Assegna manualmente i posti rimanenti.`
      });
    }
  }

  // Segnala vincoli avoid ancora irrisolti dopo il post-processing
  for (const c of constraints.filter(c => c.type === 'avoid')) {
    const a1 = assignments.find(a => a.guestId === c.guestId1);
    const a2 = assignments.find(a => a.guestId === c.guestId2);
    if (!a1 || !a2 || a1.tableId !== a2.tableId) continue;
    const g1 = confirmedGuests.find(g => g.id === c.guestId1);
    const g2 = confirmedGuests.find(g => g.id === c.guestId2);
    const alreadyWarned = warnings.some(w =>
      w.groupGuests.some(g => g.id === c.guestId1 || g.id === c.guestId2)
    );
    if (!alreadyWarned) {
      warnings.push({
        type: 'constraint_unresolved',
        groupGuests: [g1, g2].filter(Boolean).map(g => ({ id: g!.id, name: g!.name })),
        reason: `Impossibile separare ${g1?.name ?? '?'} e ${g2?.name ?? '?'}: nessuna disposizione alternativa disponibile.`
      });
    }
  }

  return { assignments, warnings };
};
