import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./ItalianDatePicker.css";

interface ItalianDatePickerProps {
  /** Data corrente in formato ISO `yyyy-mm-dd` (stringa vuota = nessuna selezione). */
  valueIso: string;
  onSelect: (iso: string) => void;
  onClose: () => void;
  /** Elemento rispetto a cui posizionare il popup (es. il wrapper input + bottone). */
  anchorRef: React.RefObject<HTMLElement | null>;
  minIso?: string;
  maxIso?: string;
}

const MONTHS_IT = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];
const DAYS_IT = ["L", "M", "M", "G", "V", "S", "D"];

function parseIso(iso: string): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function ItalianDatePicker({
  valueIso,
  onSelect,
  onClose,
  anchorRef,
  minIso,
  maxIso,
}: ItalianDatePickerProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => new Date(), []);
  const initial = useMemo(() => parseIso(valueIso) ?? today, [valueIso, today]);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const minDate = useMemo(() => (minIso ? parseIso(minIso) : null), [minIso]);
  const maxDate = useMemo(() => (maxIso ? parseIso(maxIso) : null), [maxIso]);
  const selectedDate = useMemo(() => parseIso(valueIso), [valueIso]);

  /** Posiziona il popup in coord viewport rispetto all'anchor, evitando overflow a destra/basso. */
  useLayoutEffect(() => {
    const reposition = () => {
      const anchor = anchorRef.current;
      const popup = popupRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const popupW = popup?.offsetWidth ?? 304;
      const popupH = popup?.offsetHeight ?? 340;
      const margin = 8;
      let top = rect.bottom + margin;
      if (top + popupH > vh - margin) {
        top = Math.max(margin, rect.top - popupH - margin);
      }
      let left = rect.left;
      if (left + popupW > vw - margin) left = Math.max(margin, vw - popupW - margin);
      if (left < margin) left = margin;
      setPosition({ top, left });
    };
    reposition();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [anchorRef]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popupRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [anchorRef, onClose]);

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  /** Lunedì-first: 0 = lun ... 6 = dom. */
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const nextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const cells: Array<{ day: number; date: Date } | null> = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, date: new Date(viewYear, viewMonth, d) });

  const isDisabled = (d: Date) => {
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  };

  const popup = (
    <div
      ref={popupRef}
      className="it-datepicker"
      role="dialog"
      aria-label="Scegli una data"
      style={
        position
          ? { top: position.top, left: position.left }
          : { visibility: "hidden" }
      }
    >
      <div className="it-datepicker__header">
        <button
          type="button"
          className="it-datepicker__nav"
          onClick={prevMonth}
          aria-label="Mese precedente"
        >
          <ChevronLeft size={18} aria-hidden />
        </button>
        <div className="it-datepicker__title">
          <span className="it-datepicker__month">{MONTHS_IT[viewMonth]}</span>
          <span className="it-datepicker__year">{viewYear}</span>
        </div>
        <button
          type="button"
          className="it-datepicker__nav"
          onClick={nextMonth}
          aria-label="Mese successivo"
        >
          <ChevronRight size={18} aria-hidden />
        </button>
      </div>

      <div className="it-datepicker__weekdays" aria-hidden>
        {DAYS_IT.map((d, i) => (
          <span key={i} className="it-datepicker__weekday">
            {d}
          </span>
        ))}
      </div>

      <div className="it-datepicker__grid">
        {cells.map((cell, i) => {
          if (!cell) return <span key={i} className="it-datepicker__cell it-datepicker__cell--empty" />;
          const disabled = isDisabled(cell.date);
          const isSelected = selectedDate ? isSameDay(cell.date, selectedDate) : false;
          const isToday = isSameDay(cell.date, today);
          return (
            <button
              key={i}
              type="button"
              className={`it-datepicker__cell${isSelected ? " is-selected" : ""}${
                isToday && !isSelected ? " is-today" : ""
              }`}
              disabled={disabled}
              onClick={() => {
                onSelect(toIso(cell.date));
                onClose();
              }}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div className="it-datepicker__footer">
        <button
          type="button"
          className="it-datepicker__footer-btn"
          onClick={() => {
            onSelect(toIso(today));
            onClose();
          }}
        >
          Oggi
        </button>
        {valueIso ? (
          <button
            type="button"
            className="it-datepicker__footer-btn it-datepicker__footer-btn--muted"
            onClick={() => {
              onSelect("");
              onClose();
            }}
          >
            Cancella
          </button>
        ) : null}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(popup, document.body);
}
