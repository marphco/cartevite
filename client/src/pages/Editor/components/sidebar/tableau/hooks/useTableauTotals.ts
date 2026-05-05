import { useMemo } from 'react';
import type { GuestEntry, TableauTotals } from '../shared/types';

export function useTableauTotals(
  eventRsvps: any[],
  assignments: any[],
  tables: any[]
): TableauTotals {
  return useMemo(() => {
    const allGuests: GuestEntry[] = [
      ...eventRsvps
        .filter((r: any) => r.status === 'yes')
        .flatMap((r: any) => (r.guests || [{ name: r.name }]).map((g: any, idx: number) => ({
          id: `${r._id || r.id}-${idx}`,
          name: g.name,
        }))),
      ...assignments
        .filter((a: any) => a.guestId.startsWith('manual-'))
        .flatMap((a: any) => {
          const namesArr: string[] = (a.names && Array.isArray(a.names) && a.names.length > 0)
            ? a.names
            : [a.guestName];
          return namesArr.map((n: string, i: number) => ({
            id: i === 0 ? a.guestId : `${a.guestId}__sub${i}`,
            name: n || `${a.guestName} ${i + 1}`,
          }));
        }),
    ];

    const totalRsvpGuests = eventRsvps
      .filter((r: any) => r.status === 'yes')
      .reduce((acc: number, r: any) => acc + (r.guestsCount || 1), 0);
    const totalManualGuests = assignments
      .filter((a: any) => a.guestId.startsWith('manual-'))
      .reduce((acc: number, a: any) => acc + (a.numPeople || 1), 0);
    const totalConfirmedGuests = totalRsvpGuests + totalManualGuests;
    const totalCapacity = tables.reduce((acc: number, t: any) => acc + (t.capacity || 0), 0);
    const missingSeats = Math.max(0, totalConfirmedGuests - totalCapacity);
    const spareSeats = Math.max(0, totalCapacity - totalConfirmedGuests);

    return {
      allGuests,
      totalRsvpGuests,
      totalManualGuests,
      totalConfirmedGuests,
      totalCapacity,
      missingSeats,
      spareSeats,
    };
  }, [eventRsvps, assignments, tables]);
}
