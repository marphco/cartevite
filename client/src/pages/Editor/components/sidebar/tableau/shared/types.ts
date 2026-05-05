export interface GuestEntry {
  id: string;
  name: string;
}

export interface TableauTotals {
  allGuests: GuestEntry[];
  totalRsvpGuests: number;
  totalManualGuests: number;
  totalConfirmedGuests: number;
  totalCapacity: number;
  missingSeats: number;
  spareSeats: number;
}

export const normalizeGuestId = (id: string): string => id.replace(/__sub\d+$/, '');
