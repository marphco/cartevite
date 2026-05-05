import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { Surface, Button, Badge, StatCard } from "../../ui";
import {
  CheckCircle2,
  HelpCircle,
  XCircle,
  Users,
  AlertTriangle,
  Download,
  ClipboardList,
  FileText,
  ChefHat,
  Mail,
  Phone,
  Search,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Trash2,
  Check,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./EventRsvps.css";
import {
  buildAllergiesPayload,
  countCateringAllergySubjects,
  defaultAllergyPeopleRows,
  formatCateringAllergiesBulletList,
  parseAllergiesDetailFromRecord,
  type AllergiesDetailPayload,
  type AllergyPersonRow,
} from "../../utils/allergies";

interface CustomResponse {
  fieldId: string;
  label: string;
  type?: "text" | "checkbox";
  answer: any;
}

interface RSVP {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  guestsCount: number;
  status: "yes" | "maybe" | "no";
  guests?: { name: string }[];
  message?: string;
  allergies?: string;
  allergiesDetail?: AllergiesDetailPayload | null;
  customResponses?: CustomResponse[];
  createdAt?: string;
}

/* ============================================================
   Helpers per export CSV (client-side, zero dipendenze).
   - Escape secondo RFC 4180: virgolette raddoppiate, campo fra "".
   - BOM UTF-8 iniziale così Excel legge correttamente gli accenti.
============================================================ */
function csvEscape(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const head = headers.map(csvEscape).join(",");
  const body = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  return `${head}\n${body}`;
}

function downloadCsv(filename: string, csv: string) {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Restituisce il testo allergie effettivo, con fallback ai vecchi record (solo `message`). */
function extractAllergies(r: RSVP): string {
  if (r.allergies && r.allergies.trim()) return r.allergies.trim();
  // retro-compat: vecchi record mettevano allergie in `message` (o "Nessuna allergia segnalata")
  if (r.message && r.message.trim() && !/nessuna allergia/i.test(r.message)) {
    return r.message.trim();
  }
  return "";
}

function formatCustomAnswer(cr: CustomResponse): string {
  if (cr.type === "checkbox") {
    if (cr.answer === true || cr.answer === "yes" || cr.answer === "Sì" || cr.answer === "SÌ") return "Sì";
    if (cr.answer === false || cr.answer === "no" || cr.answer === "No" || cr.answer === "NO") return "No";
    return cr.answer ? String(cr.answer) : "—";
  }
  return cr.answer ? String(cr.answer) : "—";
}

function AllergiesDetailReadout({ detail, fallback }: { detail: unknown; fallback: string }) {
  const d = detail as AllergiesDetailPayload | null | undefined;
  if (d && d.mode === "whole_party" && (d.wholePartyText || "").trim()) {
    return (
      <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "13px", fontWeight: 600, lineHeight: 1.45 }}>
        <li>
          <span style={{ fontWeight: 800 }}>Tutti gli ospiti dichiarati:</span> {(d.wholePartyText || "").trim()}
        </li>
      </ul>
    );
  }
  if (d && d.mode === "by_person" && Array.isArray(d.people) && d.people.length > 0) {
    return (
      <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "13px", fontWeight: 600, lineHeight: 1.45 }}>
        {d.people.map((p, i) => (
          <li key={i}>
            {(p.name || "").trim() ? (
              <>
                <span style={{ fontWeight: 800 }}>{(p.name || "").trim()}:</span> {(p.allergies || "").trim()}
              </>
            ) : (
              (p.allergies || "").trim()
            )}
          </li>
        ))}
      </ul>
    );
  }
  if (fallback.trim()) return <>{fallback.trim()}</>;
  return null;
}

export default function EventRsvps() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const [manualName, setManualName] = useState("");
  const [manualGuests, setManualGuests] = useState<string | number>(1);
  const [manualStatus, setManualStatus] = useState<"yes" | "maybe" | "no">("yes");
  /** Solo se l'editor disattiva “Chiedi allergie” (sì/no): testo libero, come in modifica carta. */
  const [manualFreeAllergies, setManualFreeAllergies] = useState("");
  const [manualCustom, setManualCustom] = useState<Record<string, any>>({});
  const [manualSending, setManualSending] = useState(false);
  const [manualError, setManualError] = useState("");
  const [manualGuestsList, setManualGuestsList] = useState<{name: string}[]>([]);

  /** Allineato a RSVPWidget: sì/no + stessa allergia / per persona. */
  const [manualAllergy, setManualAllergy] = useState<{
    hasAllergies: "yes" | "no" | null;
    mode: "whole_party" | "by_person" | null;
    wholeParty: string;
    people: AllergyPersonRow[];
  }>({
    hasAllergies: null,
    mode: null,
    wholeParty: "",
    people: defaultAllergyPeopleRows(),
  });

  /* --- Config del blocco RSVP dell'evento (domande custom + flag allergie/contatti) --- */
  const [rsvpConfig, setRsvpConfig] = useState<{
    askGuests: boolean;
    askIntolerances: boolean;
    askEmail: boolean;
    askPhone: boolean;
    customFields: Array<{ id: string; label: string; type: "text" | "checkbox"; required?: boolean }>;
  }>({ askGuests: true, askIntolerances: true, askEmail: false, askPhone: false, customFields: [] });

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [manualPanelOpen, setManualPanelOpen] = useState(false);
  const [exportPanelOpen, setExportPanelOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    guestsCount: number;
    status: "yes" | "maybe" | "no";
    allergies: string;
    customResponses: Record<string, any>;
    email: string;
    phone: string;
  }>({
    name: "",
    guestsCount: 1,
    status: "yes",
    allergies: "",
    customResponses: {},
    email: "",
    phone: "",
  });
  const [editGuestsList, setEditGuestsList] = useState<{name: string}[]>([]);

  const [editAllergy, setEditAllergy] = useState<{
    hasAllergies: "yes" | "no" | null;
    mode: "whole_party" | "by_person" | null;
    wholeParty: string;
    people: AllergyPersonRow[];
  }>({
    hasAllergies: null,
    mode: null,
    wholeParty: "",
    people: defaultAllergyPeopleRows(),
  });

  const [manualEmail, setManualEmail] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!editingId) return;
    if (Number(editForm.guestsCount) <= 1 && editAllergy.mode === "whole_party") {
      setEditAllergy((p) => ({ ...p, mode: "by_person", wholeParty: "" }));
    }
  }, [editingId, editForm.guestsCount, editAllergy.mode]);

  useEffect(() => {
    if (manualPanelOpen && Number(manualGuests) <= 1 && manualAllergy.mode === "whole_party") {
      setManualAllergy((p) => ({ ...p, mode: "by_person", wholeParty: "" }));
    }
    // Sync manualGuestsList size
    const n = Math.max(1, Number(manualGuests));
    setManualGuestsList(prev => {
      const next = [...prev];
      if (next.length < n - 1) {
        while(next.length < n - 1) next.push({ name: '' });
      } else {
        next.length = n - 1;
      }
      return next;
    });
  }, [manualPanelOpen, manualGuests, manualAllergy.mode]);

  // Sincronizza nomi allergie manuali
  useEffect(() => {
    const allNames = [manualName, ...manualGuestsList.map(g => g.name)];
    setManualAllergy(prev => ({
      ...prev,
      people: allNames.map((n, i) => ({
        name: n,
        allergies: prev.people[i]?.allergies || ""
      }))
    }));
  }, [manualName, manualGuestsList]);

  // Sync editGuestsList size
  useEffect(() => {
    if (!editingId) return;
    const n = Math.max(1, Number(editForm.guestsCount));
    setEditGuestsList(prev => {
      const next = [...prev];
      if (next.length < n - 1) {
        while(next.length < n - 1) next.push({ name: '' });
      } else {
        next.length = n - 1;
      }
      return next;
    });
  }, [editingId, editForm.guestsCount]);

  // Sincronizza nomi allergie edit
  useEffect(() => {
    if (!editingId) return;
    const allNames = [editForm.name, ...editGuestsList.map(g => g.name)];
    setEditAllergy(prev => ({
      ...prev,
      people: allNames.map((n, i) => ({
        name: n,
        allergies: prev.people[i]?.allergies || ""
      }))
    }));
  }, [editingId, editForm.name, editGuestsList]);

  useEffect(() => {
    async function fetchAll() {
      try {
        const meRes = await apiFetch("/api/auth/me");
        const meData = await meRes.json();
        if (!meData.user) throw new Error("Unauthorized");
        setAuthChecked(true);

        const evRes = await apiFetch(`/api/events/${slug}/private`);
        if (evRes.ok) {
          const evData = await evRes.json();
          setEventTitle(evData.title || slug || "");

          // ✅ Estrai config del blocco RSVP (se presente) per popolare il form manuale
          //    con le stesse domande personalizzate configurate in editor.
          const rsvpBlock = (evData.blocks || []).find((b: any) => b?.type === "rsvp");
          if (rsvpBlock) {
            const wp = rsvpBlock.widgetProps || {};
            setRsvpConfig({
              askGuests: wp.rsvpAskGuests !== false,
              askIntolerances: wp.rsvpAskIntolerances !== false, // default true
              askEmail: wp.rsvpAskEmail === true,                // default false
              askPhone: wp.rsvpAskPhone === true,                // default false
              customFields: Array.isArray(wp.customFields) ? wp.customFields : [],
            });
          }
        } else {
          setEventTitle(slug || "");
        }

        const rRes = await apiFetch(`/api/events/${slug}/rsvps`);
        if (rRes.ok) {
          const rData = await rRes.json();
          setRsvps(Array.isArray(rData) ? rData : []);
        } else {
          setRsvps([]);
        }
      } catch (err: any) {
        if (err.message !== "Unauthorized") {
          console.error(err);
          setRsvps([]);
          setEventTitle(slug || "");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [slug]);

  const counts = useMemo(() => {
    const base = {
      yesResponses: 0,
      maybeResponses: 0,
      noResponses: 0,
      yesGuests: 0,
      maybeGuests: 0,
      noGuests: 0,
    };

    for (const r of rsvps) {
      const guests = Number(r.guestsCount) || 1;
      if (r.status === "yes") {
        base.yesResponses += 1;
        base.yesGuests += guests;
      } else if (r.status === "maybe") {
        base.maybeResponses += 1;
        base.maybeGuests += guests;
      } else if (r.status === "no") {
        base.noResponses += 1;
        base.noGuests += guests;
      }
    }
    return base;
  }, [rsvps]);

  const filteredRsvps = useMemo(() => {
    let list = filterStatus === "all" ? rsvps : rsvps.filter((r) => r.status === filterStatus);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => {
      const customHay = (r.customResponses || [])
        .map((cr) => `${cr.label || ""} ${formatCustomAnswer(cr)}`)
        .join(" ");
      const hay = `${r.name || ""} ${r.email || ""} ${r.phone || ""} ${extractAllergies(r)} ${r.message || ""} ${customHay}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rsvps, filterStatus, search]);

  /* --- Union di TUTTE le domande custom mai ricevute → header dinamici CSV --- */
  const allCustomLabels = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rsvps) {
      for (const cr of r.customResponses || []) {
        if (cr.fieldId && !map.has(cr.fieldId)) map.set(cr.fieldId, cr.label || cr.fieldId);
      }
    }
    return Array.from(map.entries()); // [ [id, label], ... ]
  }, [rsvps]);

  /* --- Colonne contatto dinamiche: includiamo email/telefono SOLO se almeno
     una RSVP le ha valorizzate. Evita colonne "morte" nei PDF/CSV se il form
     pubblico non chiede quei campi. --- */
  const hasAnyEmail = useMemo(() => rsvps.some((r) => !!r.email), [rsvps]);
  const hasAnyPhone = useMemo(() => rsvps.some((r) => !!r.phone), [rsvps]);

  const statusLabel = (s: RSVP["status"]) =>
    s === "yes" ? "Partecipa" : s === "maybe" ? "Forse" : "Non può";

  /** CSV completo: una riga per ospite con TUTTI i dati disponibili. */
  const handleExportAllCsv = () => {
    const baseHeaders: string[] = ["Nome"];
    if (hasAnyEmail) baseHeaders.push("Email");
    if (hasAnyPhone) baseHeaders.push("Telefono");
    baseHeaders.push("N. Ospiti", "Stato", "Allergie", "Data risposta");
    const customHeaders = allCustomLabels.map(([, label]) => label);
    const headers = [...baseHeaders, ...customHeaders];

    const rows = rsvps.map((r) => {
      const allNames = r.guests?.map(g => g.name).filter(Boolean).join(", ") || r.name || "";
      const base: (string | number)[] = [allNames];
      if (hasAnyEmail) base.push(r.email || "");
      if (hasAnyPhone) base.push(r.phone || "");
      base.push(
        r.guestsCount ?? 1,
        statusLabel(r.status),
        extractAllergies(r),
        r.createdAt ? new Date(r.createdAt).toLocaleString("it-IT") : ""
      );
      const customValues = allCustomLabels.map(([id]) => {
        const cr = (r.customResponses || []).find((x) => x.fieldId === id);
        return cr ? formatCustomAnswer(cr) : "";
      });
      return [...base, ...customValues];
    });

    const csv = buildCsv(headers, rows);
    const safeSlug = (slug || eventTitle || "evento").replace(/[^a-z0-9-_]/gi, "_");
    downloadCsv(`rsvps_${safeSlug}.csv`, csv);
  };

  /** CSV per catering: SOLO ospiti con allergie dichiarate. */
  const handleExportAllergiesCsv = () => {
    const withAllergies = rsvps
      .map((r) => ({ r, allergies: extractAllergies(r) }))
      .filter((x) => x.allergies && x.r.status !== "no");

    if (withAllergies.length === 0) {
      alert("Nessuna allergia/intolleranza segnalata dagli ospiti.");
      return;
    }

    const headers: string[] = [
      "Nome",
      "Posti (gruppo)",
      "Allergici (n.)",
      "Stato",
      "Allergie (dettaglio)",
    ];
    if (hasAnyEmail) headers.push("Email");
    if (hasAnyPhone) headers.push("Telefono");
    const rows = withAllergies.map(({ r, allergies }) => {
      const allNames = r.guests?.map(g => g.name).filter(Boolean).join(", ") || r.name || "";
      const allergySubjects = countCateringAllergySubjects(
        r.guestsCount ?? 1,
        r.allergiesDetail,
        allergies
      );
      const detailBullets = formatCateringAllergiesBulletList(
        r.guestsCount ?? 1,
        r.allergiesDetail,
        allergies
      );
      const row: (string | number)[] = [
        allNames,
        r.guestsCount ?? 1,
        allergySubjects,
        statusLabel(r.status),
        detailBullets,
      ];
      if (hasAnyEmail) row.push(r.email || "");
      if (hasAnyPhone) row.push(r.phone || "");
      return row;
    });

    const csv = buildCsv(headers, rows);
    const safeSlug = (slug || eventTitle || "evento").replace(/[^a-z0-9-_]/gi, "_");
    downloadCsv(`allergie_catering_${safeSlug}.csv`, csv);
  };

  /* ============================================================
     PDF EXPORT — stesso contenuto del CSV, ma in formato
     stampabile / condivisibile (più adatto per fornitori, catering,
     agenzie di wedding planning che non masticano Excel).
     Uso `jspdf` + `jspdf-autotable` per tabelle pulite multi-pagina.
  ============================================================ */
  const pdfHeader = (doc: jsPDF, title: string, subtitle: string) => {
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFillColor(20, 184, 166); // --accent Tiffany
    doc.rect(0, 0, pageW, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("EENVEE · RSVP", 12, 12);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(title, 12, 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 110);
    doc.text(subtitle, 12, 37);
    const genDate = new Date().toLocaleString("it-IT");
    doc.text(`Generato il ${genDate}`, pageW - 12, 37, { align: "right" });
  };

  const pdfFooter = (doc: jsPDF) => {
    const pageCount = doc.getNumberOfPages();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(`Pagina ${i} di ${pageCount}`, pageW - 12, pageH - 8, { align: "right" });
      doc.text("eenvee · gestione RSVP", 12, pageH - 8);
    }
  };

  /** PDF completo: summary + tabella con tutti i dati + domande custom. */
  const handleExportAllPdf = () => {
    if (rsvps.length === 0) {
      alert("Nessuna RSVP da esportare.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    pdfHeader(doc, eventTitle || "Evento", "Elenco completo RSVP");

    // Summary box
    const totalGuests = counts.yesGuests + counts.maybeGuests;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const summary = `Conferme: ${counts.yesResponses} (${counts.yesGuests} ospiti)  ·  Forse: ${counts.maybeResponses} (${counts.maybeGuests} ospiti)  ·  Non possono: ${counts.noResponses}  ·  Totale atteso: ~${totalGuests}`;
    doc.text(summary, 12, 46);

    const baseHeaders: string[] = ["Nome"];
    if (hasAnyEmail) baseHeaders.push("Email");
    if (hasAnyPhone) baseHeaders.push("Telefono");
    baseHeaders.push("Osp.", "Stato", "Allergie");
    const customHeaders = allCustomLabels.map(([, label]) => label);
    const headers = [...baseHeaders, ...customHeaders];

    // Indice della colonna "Stato" dipende dalla presenza di email/telefono.
    const statusColumnIndex = 1 + (hasAnyEmail ? 1 : 0) + (hasAnyPhone ? 1 : 0) + 1; // Nome + (Email?) + (Tel?) + Osp.

    const body = rsvps.map((r) => {
      const allNames = r.guests?.map(g => g.name).filter(Boolean).join("\n") || r.name || "—";
      const base: string[] = [allNames];
      if (hasAnyEmail) base.push(r.email || "—");
      if (hasAnyPhone) base.push(r.phone || "—");
      base.push(
        String(r.guestsCount ?? 1),
        statusLabel(r.status),
        extractAllergies(r) || "—"
      );
      const customValues = allCustomLabels.map(([id]) => {
        const cr = (r.customResponses || []).find((x) => x.fieldId === id);
        return cr ? formatCustomAnswer(cr) : "—";
      });
      return [...base, ...customValues];
    });

    autoTable(doc, {
      head: [headers],
      body,
      startY: 52,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: [20, 184, 166], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [247, 247, 247] },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === statusColumnIndex) {
          const val = String(data.cell.raw || "");
          if (val === "Partecipa") data.cell.styles.textColor = [20, 120, 90];
          else if (val === "Forse") data.cell.styles.textColor = [180, 130, 0];
          else if (val === "Non può") data.cell.styles.textColor = [180, 60, 60];
        }
      },
    });

    pdfFooter(doc);
    const safeSlug = (slug || eventTitle || "evento").replace(/[^a-z0-9-_]/gi, "_");
    doc.save(`rsvps_${safeSlug}.pdf`);
  };

  /** PDF per catering: SOLO ospiti con allergie — formato stampabile chiaro. */
  const handleExportAllergiesPdf = () => {
    const withAllergies = rsvps
      .map((r) => ({ r, allergies: extractAllergies(r) }))
      .filter((x) => x.allergies && x.r.status !== "no");

    if (withAllergies.length === 0) {
      alert("Nessuna allergia/intolleranza segnalata dagli ospiti.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    pdfHeader(doc, eventTitle || "Evento", "Lista allergie / intolleranze per catering");

    const totalWithRequirement = withAllergies.reduce(
      (sum, x) =>
        sum +
        countCateringAllergySubjects(x.r.guestsCount ?? 1, x.r.allergiesDetail, x.allergies),
      0
    );
    const totalPartySeats = withAllergies.reduce((sum, x) => sum + (Number(x.r.guestsCount) || 1), 0);
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const pageInnerW = doc.internal.pageSize.getWidth() - 24;
    const summaryText = `RSVP con allergie dichiarate: ${withAllergies.length}  ·  Persone con allergia/intolleranza: ${totalWithRequirement}  ·  Posti totali (stessi gruppi): ${totalPartySeats}`;
    const summaryLines = doc.splitTextToSize(summaryText, pageInnerW);
    doc.text(summaryLines, 12, 46);
    const tableStartY = 46 + summaryLines.length * 5 + 4;

    // Colonna "Contatto" presente solo se almeno una RSVP ha email/telefono.
    const hasContact = hasAnyEmail || hasAnyPhone;
    const headers: string[] = ["Nome", "Posti", "Allergici", "Stato", "Allergie"];
    if (hasContact) headers.push("Contatto");

    const tableW = doc.internal.pageSize.getWidth() - 24;

    autoTable(doc, {
      head: [headers],
      body: withAllergies.map(({ r, allergies }) => {
        const allNames = r.guests?.map(g => g.name).filter(Boolean).join("\n") || r.name || "—";
        const allergySubjects = countCateringAllergySubjects(
          r.guestsCount ?? 1,
          r.allergiesDetail,
          allergies
        );
        const detailBullets = formatCateringAllergiesBulletList(
          r.guestsCount ?? 1,
          r.allergiesDetail,
          allergies
        );
        const row: string[] = [
          allNames,
          String(r.guestsCount ?? 1),
          String(allergySubjects),
          statusLabel(r.status),
          detailBullets,
        ];
        if (hasContact) {
          row.push([r.email, r.phone].filter(Boolean).join("\n") || "—");
        }
        return row;
      }),
      startY: tableStartY,
      margin: { left: 12, right: 12 },
      tableWidth: tableW,
      theme: "grid",
      styles: { fontSize: 9.5, cellPadding: 3, overflow: "linebreak", valign: "top" },
      headStyles: {
        fillColor: [244, 196, 107],
        textColor: 70,
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
        valign: "middle",
      },
      columnStyles: hasContact
        ? {
            0: { cellWidth: 42, fontStyle: "bold", halign: "left" },
            1: { cellWidth: 16, halign: "center" },
            2: { cellWidth: 18, halign: "center", fontStyle: "bold", textColor: [20, 120, 90] },
            3: { cellWidth: 26, halign: "center" },
            4: { cellWidth: "auto", textColor: [140, 80, 15], fontStyle: "bold", halign: "left" },
            5: { cellWidth: 44, fontSize: 8.5, textColor: [100, 100, 100], halign: "left" },
          }
        : {
            0: { cellWidth: 48, fontStyle: "bold", halign: "left" },
            1: { cellWidth: 18, halign: "center" },
            2: { cellWidth: 20, halign: "center", fontStyle: "bold", textColor: [20, 120, 90] },
            3: { cellWidth: 28, halign: "center" },
            4: { cellWidth: "auto", textColor: [140, 80, 15], fontStyle: "bold", halign: "left" },
          },
    });

    pdfFooter(doc);
    const safeSlug = (slug || eventTitle || "evento").replace(/[^a-z0-9-_]/gi, "_");
    doc.save(`allergie_catering_${safeSlug}.pdf`);
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError("");

    if (!manualName.trim()) {
      setManualError("Inserisci il nome o il gruppo.");
      return;
    }

    const st = manualStatus;
    const gc =
      st === "no" || !rsvpConfig.askGuests
        ? 1
        : Math.min(20, Math.max(1, Math.floor(Number(manualGuests)) || 1));

    if (st !== "no") {
      const cleanEmail = manualEmail.trim();
      const cleanPhone = manualPhone.trim();
      if (rsvpConfig.askEmail && rsvpConfig.askPhone && !cleanEmail && !cleanPhone) {
        setManualError("Inserisci almeno email o telefono, come nel modulo pubblico.");
        return;
      }
      if (rsvpConfig.askEmail && !rsvpConfig.askPhone && !cleanEmail) {
        setManualError("Inserisci l'email per proseguire.");
        return;
      }
      if (rsvpConfig.askPhone && !rsvpConfig.askEmail && !cleanPhone) {
        setManualError("Inserisci il numero di telefono per proseguire.");
        return;
      }
      if (rsvpConfig.askEmail && cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setManualError("L'email inserita non sembra valida. Controlla e riprova.");
        return;
      }

      const missingFields = rsvpConfig.customFields.filter(
        (f) => f.required && (manualCustom[f.id] === undefined || manualCustom[f.id] === "" || manualCustom[f.id] === null)
      );
      if (missingFields[0]) {
        setManualError(`Rispondi alla domanda: "${missingFields[0].label || "Domanda"}"`);
        return;
      }

      if (rsvpConfig.askIntolerances && manualAllergy.hasAllergies === null) {
        setManualError("Indica sì o no sulle allergie o intolleranze.");
        return;
      }
    }

    setManualSending(true);

    const customResponsesPayload =
      st === "no"
        ? []
        : rsvpConfig.customFields.map((f) => ({
            fieldId: f.id,
            label: f.label || "Domanda",
            type: f.type === "checkbox" ? "checkbox" : "text",
            answer: manualCustom[f.id] ?? null,
          }));

    let allergiesText = "";
    let allergiesDetailOut: AllergiesDetailPayload | null = null;

    if (st === "no") {
      allergiesText = "";
      allergiesDetailOut = null;
    } else if (!rsvpConfig.askIntolerances) {
      allergiesText = manualFreeAllergies.trim();
      allergiesDetailOut = null;
    } else {
      if (manualAllergy.hasAllergies === "no") {
        allergiesText = "";
        allergiesDetailOut = null;
      } else if (manualAllergy.hasAllergies === "yes") {
        const built = buildAllergiesPayload({
          askIntolerances: rsvpConfig.askIntolerances,
          status: st,
          hasAllergies: manualAllergy.hasAllergies,
          guestsCount: gc,
          allergyMode: manualAllergy.mode,
          wholePartyAllergies: manualAllergy.wholeParty,
          allergyPeople: manualAllergy.people,
        });
        if (!built.ok) {
          setManualError(built.error);
          setManualSending(false);
          return;
        }
        allergiesText = built.allergies;
        allergiesDetailOut = built.allergiesDetail;
      }
    }

    const messageOut = rsvpConfig.askIntolerances && st !== "no" && manualAllergy.hasAllergies === "yes" ? "" : "";
    const cleanEmailF = manualEmail.trim();
    const cleanPhoneF = manualPhone.trim();

    try {
          const res = await apiFetch(`/api/rsvps`, {
        method: "POST",
        body: JSON.stringify({
          eventSlug: slug,
          name: manualName.trim(),
          email: st === "no" ? null : cleanEmailF || null,
          phone: st === "no" ? null : cleanPhoneF || null,
          guestsCount: gc,
          guests: [{ name: manualName.trim() }, ...manualGuestsList],
          message: messageOut,
          status: st,
          allergies: allergiesText,
          ...(allergiesDetailOut ? { allergiesDetail: allergiesDetailOut } : {}),
          customResponses: customResponsesPayload,
        }),
      });

      if (!res.ok) throw new Error("Errore aggiunta manuale");

      const data = await res.json();
      const created = data.rsvp || data;
      setRsvps((prev) => [created, ...prev]);

      setManualName("");
      setManualGuests(1);
      setManualStatus("yes");
      setManualFreeAllergies("");
      setManualAllergy({
        hasAllergies: null,
        mode: null,
        wholeParty: "",
        people: defaultAllergyPeopleRows(),
      });
      setManualCustom({});
      setManualEmail("");
      setManualPhone("");
    } catch (err) {
      console.error(err);
      setManualError("Non siamo riusciti ad aggiungere l'ospite. Riprova.");
    } finally {
      setManualSending(false);
    }
  };

  const startEdit = (r: RSVP) => {
    setEditingId(r._id);

    // Pre-popola le risposte custom esistenti indicizzate per fieldId così
    // l'utente vede e può modificare quelle già presenti senza doverle riscrivere.
    const existingCustom: Record<string, any> = {};
    (r.customResponses || []).forEach((cr: any) => {
      if (cr?.fieldId !== undefined) existingCustom[cr.fieldId] = cr.answer;
    });

    const flatAllergies = extractAllergies(r) || "";
    const parsed = parseAllergiesDetailFromRecord(r.allergiesDetail, flatAllergies);

    setEditForm({
      name: r.name || "",
      guestsCount: Number(r.guestsCount) || 1,
      status: r.status || "yes",
      allergies: flatAllergies,
      customResponses: existingCustom,
      email: r.email || "",
      phone: r.phone || "",
    });
    setEditAllergy({
      hasAllergies: parsed.hasAllergies,
      mode: parsed.allergyMode,
      wholeParty: parsed.wholePartyAllergies,
      people: parsed.allergyPeople.length ? parsed.allergyPeople : defaultAllergyPeopleRows(),
    });
    const guestNames = (r.guests || []).slice(1);
    setEditGuestsList(guestNames);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAllergy({
      hasAllergies: null,
      mode: null,
      wholeParty: "",
      people: defaultAllergyPeopleRows(),
    });
  };

  const saveEdit = async (id: string) => {
    try {
      // Ricostruisce il payload risposte custom in formato denormalizzato,
      // usando la config del blocco come source of truth per label/type.
      // Fallback: se un fieldId non è più nella config (es. domanda rimossa
      // dopo la risposta), la conserviamo comunque con label = fieldId.
      const configById = new Map(rsvpConfig.customFields.map((f) => [f.id, f]));
      const allIds = new Set<string>([
        ...Object.keys(editForm.customResponses),
        ...rsvpConfig.customFields.map((f) => f.id),
      ]);
      const customResponsesPayload = Array.from(allIds)
        .map((fid) => {
          const conf = configById.get(fid);
          const answer = editForm.customResponses[fid];
          if (answer === undefined || answer === "" || answer === null) return null;
          return {
            fieldId: fid,
            label: conf?.label || fid,
            type: conf?.type === "checkbox" ? "checkbox" : "text",
            answer,
          };
        })
        .filter(Boolean);

      let allergiesOut = "";
      let allergiesDetailOut: AllergiesDetailPayload | null = null;

      if (!rsvpConfig.askIntolerances || editForm.status === "no") {
        allergiesOut = editForm.allergies.trim();
        allergiesDetailOut = null;
      } else {
        if (editAllergy.hasAllergies === null) {
          alert("Rispondi sì o no sulle allergie.");
          return;
        }
        if (editAllergy.hasAllergies === "no") {
          allergiesOut = "";
          allergiesDetailOut = null;
        } else {
          const built = buildAllergiesPayload({
            askIntolerances: rsvpConfig.askIntolerances,
            status: editForm.status,
            hasAllergies: editAllergy.hasAllergies,
            guestsCount: Number(editForm.guestsCount) || 1,
            allergyMode: editAllergy.mode,
            wholePartyAllergies: editAllergy.wholeParty,
            allergyPeople: editAllergy.people,
          });
          if (!built.ok) {
            alert(built.error);
            return;
          }
          allergiesOut = built.allergies;
          allergiesDetailOut = built.allergiesDetail;
        }
      }

      const res = await apiFetch(`/api/rsvps/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editForm.name,
          guestsCount: Number(editForm.guestsCount) || 1,
          guests: [{ name: editForm.name }, ...editGuestsList],
          status: editForm.status,
          allergies: allergiesOut,
          allergiesDetail: allergiesDetailOut,
          customResponses: customResponsesPayload,
          email: editForm.email.trim(),
          phone: editForm.phone.trim(),
        }),
      });

      if (!res.ok) throw new Error("Errore update RSVP");
      const updated = await res.json();
      setRsvps((prev) => prev.map((r) => (r._id === id ? updated : r)));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Non siamo riusciti a salvare la modifica. Riprova.");
    }
  };

  const deleteRsvp = async (id: string) => {
    try {
      const res = await apiFetch(`/api/rsvps/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Errore delete RSVP");
      setRsvps((prev) => prev.filter((r) => r._id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error(err);
      alert("Non siamo riusciti a eliminare la RSVP. Riprova.");
    }
  };

  if (loading || !authChecked) {
    return (
      <div className="rsvp-page">
        <div className="rsvp-shell">
          <Surface variant="glass">Caricamento RSVP...</Surface>
        </div>
      </div>
    );
  }

  const filterOptions = [
    { key: "all", label: "Tutti", segmentLabel: "Tutti", icon: Users },
    { key: "yes", label: "Partecipa", segmentLabel: "Partecipa", icon: CheckCircle2 },
    { key: "maybe", label: "Forse", segmentLabel: "Forse", icon: HelpCircle },
    { key: "no", label: "Non possono", segmentLabel: "No", icon: XCircle },
  ] as const;

  return (
    <div className="rsvp-page">
      <div className="rsvp-shell">
        <div className="rsvp-topbar">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            ← Torna alla dashboard
          </Button>
          <div className="rsvp-header">
            <div>
              <p className="rsvp-eyebrow">INVITATI & RSVP</p>
              <h1>{eventTitle}</h1>
              <p className="rsvp-subtitle">
                Gestisci conferme, aggiungi manualmente ospiti e tieni traccia delle modifiche.
              </p>
            </div>
            <div className="rsvp-header-actions">
              <Button variant="subtle" onClick={() => navigate(`/edit/${slug}`)}>
                Modifica evento
              </Button>
            </div>
          </div>
        </div>

        <div className="rsvp-stats-grid">
          <StatCard label="Conferme" value={String(counts.yesResponses)} hint={`${counts.yesGuests} ospiti`} />
          <StatCard label="Forse" value={String(counts.maybeResponses)} hint={`${counts.maybeGuests} ospiti`} />
          <StatCard label="Non possono" value={String(counts.noResponses)} hint={`${counts.noGuests} ospiti`} />
        </div>

        <Surface variant="glass" className="rsvp-collapse-card rsvp-manual-card">
          <button
            type="button"
            className="rsvp-collapse-trigger"
            onClick={() => setManualPanelOpen((v) => !v)}
            aria-expanded={manualPanelOpen}
          >
            <div className="rsvp-collapse-trigger__text">
              <span className="rsvp-collapse-trigger__eyebrow">Aggiungi ospite</span>
              <span className="rsvp-collapse-trigger__title">
                Inserisci un ospite che non ha completato la procedura online
              </span>
            </div>
            <span className="rsvp-collapse-trigger__meta">
              <UserPlus size={20} aria-hidden />
              {manualPanelOpen ? <ChevronUp size={20} aria-hidden /> : <ChevronDown size={20} aria-hidden />}
            </span>
          </button>

          {manualPanelOpen ? (
          <div className="rsvp-collapse-body">
          <form onSubmit={handleManualAdd}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.5rem" }}>
                <div className="input-group" style={{ gridColumn: "1 / -1", marginBottom: "0.5rem" }}>
                  <label>L'ospite parteciperà?</label>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    {[
                      { val: "yes", lab: "Sì, partecipa" },
                      { val: "maybe", lab: "Forse" },
                      { val: "no", lab: "No" }
                    ].map((opt) => {
                      const active = manualStatus === opt.val;
                      return (
                        <Button
                          key={opt.val}
                          type="button"
                          variant={active ? "primary" : "subtle"}
                          onClick={() => {
                            const v = opt.val as any;
                            setManualStatus(v);
                            if (v === "no") {
                              setManualCustom({});
                              setManualEmail("");
                              setManualPhone("");
                              setManualFreeAllergies("");
                              setManualAllergy({
                                hasAllergies: null,
                                mode: null,
                                wholeParty: "",
                                people: defaultAllergyPeopleRows(),
                              });
                            }
                          }}
                          style={{ flex: 1, height: "48px", fontWeight: 800, fontSize: "13px" }}
                        >
                          {opt.lab}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="input-group">
                  <label>Nome Ospite</label>
                  <input
                    type="text"
                    placeholder="Nome e Cognome *"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="rsvp-input"
                    autoComplete="off"
                  />
                </div>
                <div className="input-group">
                  <label>Numero Ospiti</label>
                  <div style={{ position: "relative" }}>
                    <Users size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-soft)" }} />
                    <input
                      type="number"
                      min="1"
                      value={manualGuests}
                      onChange={(e) => setManualGuests(Number(e.target.value) || 1)}
                      className="rsvp-input"
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                  {rsvpConfig.askIntolerances && (
                    <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--text-soft)", lineHeight: 1.4, opacity: 0.9 }}>
                      Indica il numero totale di partecipanti per questo gruppo.
                    </p>
                  )}
                </div>

                {/* LISTA NOMI OSPITI MANUALI */}
                {manualStatus !== "no" && Number(manualGuests) > 1 && manualGuestsList.map((g, idx) => (
                  <div key={idx} className="input-group">
                    <label>Ospite {idx + 2}</label>
                    <input 
                      type="text"
                      placeholder="Nome e Cognome *"
                      value={g.name}
                      onChange={(e) => {
                        const next = [...manualGuestsList];
                        next[idx] = { name: e.target.value };
                        setManualGuestsList(next);
                      }}
                      className="rsvp-input"
                    />
                  </div>
                ))}
              </div>

            {manualStatus !== "no" && (
              <div className="rsvp-form-subsection">
                <p className="rsvp-form-subsection__title">Dati aggiuntivi</p>

                {(rsvpConfig.askEmail || rsvpConfig.askPhone) && (
                  <div style={{ marginBottom: "1.1rem" }}>
                    <div
                      style={{
                        display: "grid",
                        gap: "1rem",
                        gridTemplateColumns: rsvpConfig.askEmail && rsvpConfig.askPhone ? "repeat(2, 1fr)" : "1fr",
                      }}
                    >
                      {rsvpConfig.askEmail && (
                        <div className="input-group">
                          <label>
                            Email
                            {rsvpConfig.askEmail && !rsvpConfig.askPhone && (
                              <span style={{ color: "var(--accent)" }}> *</span>
                            )}
                          </label>
                          <input
                            type="email"
                            placeholder={rsvpConfig.askEmail && rsvpConfig.askPhone ? "Email" : "Email *"}
                            value={manualEmail}
                            onChange={(e) => setManualEmail(e.target.value)}
                            className="rsvp-input"
                            autoComplete="off"
                          />
                        </div>
                      )}
                      {rsvpConfig.askPhone && (
                        <div className="input-group">
                          <label>
                            Telefono
                            {rsvpConfig.askPhone && !rsvpConfig.askEmail && (
                              <span style={{ color: "var(--accent)" }}> *</span>
                            )}
                          </label>
                          <input
                            type="tel"
                            placeholder={rsvpConfig.askEmail && rsvpConfig.askPhone ? "Telefono" : "Telefono *"}
                            value={manualPhone}
                            onChange={(e) => setManualPhone(e.target.value)}
                            className="rsvp-input"
                            autoComplete="off"
                          />
                        </div>
                      )}
                    </div>
                    {rsvpConfig.askEmail && rsvpConfig.askPhone && (
                      <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--text-soft)", lineHeight: 1.4, opacity: 0.88 }}>
                        Lascia almeno un recapito (email o telefono) per poter contattare l&apos;ospite.
                      </p>
                    )}
                  </div>
                )}

                {rsvpConfig.customFields.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gap: "1rem",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      marginBottom: "1.1rem",
                    }}
                  >
                    {rsvpConfig.customFields.map((field) => (
                      <div key={field.id} className="input-group">
                        <label style={{ textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11, color: "var(--text-soft)" }}>
                          {field.label || "Domanda"}
                          {field.required && <span style={{ color: "var(--accent)" }}> *</span>}
                        </label>
                        {field.type === "checkbox" ? (
                          <div style={{ display: "flex", gap: 10 }}>
                            {(["SÌ", "NO"] as const).map((opt) => {
                              const selected = manualCustom[field.id] === opt;
                              return (
                                <Button
                                  key={opt}
                                  type="button"
                                  variant={selected ? "primary" : "subtle"}
                                  onClick={() => setManualCustom((p) => ({ ...p, [field.id]: opt }))}
                                  style={{ flex: 1, justifyContent: "center", fontWeight: 800, padding: "10px 12px" }}
                                >
                                  {opt}
                                </Button>
                              );
                            })}
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="Scrivi qui la tua risposta..."
                            value={manualCustom[field.id] || ""}
                            onChange={(e) => setManualCustom((p) => ({ ...p, [field.id]: e.target.value }))}
                            className="rsvp-input"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!rsvpConfig.askIntolerances && (
                  <div className="input-group" style={{ marginBottom: "0.75rem" }}>
                    <label>
                      Allergie / intolleranze <span style={{ fontWeight: 500, color: "var(--text-soft)" }}>(testo libero)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Indica eventuali esigenze alimentari"
                      value={manualFreeAllergies}
                      onChange={(e) => setManualFreeAllergies(e.target.value)}
                      className="rsvp-input"
                    />
                  </div>
                )}

                {rsvpConfig.askIntolerances && (
                  <div style={{ marginBottom: "0.5rem" }}>
                    <p
                      className="rsvp-eyebrow"
                      style={{
                        margin: "0 0 0.5rem",
                        textAlign: "center",
                        fontSize: 11,
                        color: "var(--text-soft)",
                        letterSpacing: "0.08em",
                        fontWeight: 800,
                        textTransform: "uppercase",
                      }}
                    >
                      Allergie o intolleranze? *
                    </p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: manualAllergy.hasAllergies === "yes" ? 14 : 0 }}>
                      <Button
                        type="button"
                        variant={manualAllergy.hasAllergies === "yes" ? "primary" : "subtle"}
                        onClick={() =>
                          setManualAllergy((p) => ({
                            ...p,
                            hasAllergies: "yes",
                            mode: "by_person",
                            wholeParty: "",
                            people: defaultAllergyPeopleRows(),
                          }))
                        }
                        style={{ minWidth: 100, fontWeight: 800 }}
                      >
                        Sì
                      </Button>
                      <Button
                        type="button"
                        variant={manualAllergy.hasAllergies === "no" ? "primary" : "subtle"}
                        onClick={() =>
                          setManualAllergy({
                            hasAllergies: "no",
                            mode: null,
                            wholeParty: "",
                            people: defaultAllergyPeopleRows(),
                          })
                        }
                        style={{ minWidth: 100, fontWeight: 800 }}
                      >
                        No
                      </Button>
                    </div>

                    {manualAllergy.hasAllergies === "yes" && (
                         <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px", padding: "16px", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                          {manualAllergy.people.map((p, idx) => {
                            const hasAllergy = p.allergies.length > 0;
                            const personName = idx === 0 ? (manualName || "Titolare") : (manualGuestsList[idx-1]?.name || `Ospite ${idx+1}`);
                            return (
                              <div key={idx} style={{ 
                                display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "8px", 
                                borderBottom: idx === manualAllergy.people.length - 1 ? "none" : "1px solid var(--border-subtle)" 
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <input 
                                    type="checkbox"
                                    checked={hasAllergy}
                                    onChange={() => {
                                      setManualAllergy(prev => ({
                                        ...prev,
                                        people: prev.people.map((row, i) => i === idx ? { ...row, allergies: !hasAllergy ? " " : "" } : row)
                                      }));
                                    }}
                                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                                  />
                                  <span style={{ fontSize: "14px", fontWeight: 600 }}>{personName}</span>
                                </div>
                                {hasAllergy && (
                                  <input 
                                    type="text"
                                    placeholder="Quali allergie?"
                                    value={p.allergies === " " ? "" : p.allergies}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      setManualAllergy(prev => ({
                                        ...prev,
                                        people: prev.people.map((row, i) => i === idx ? { ...row, allergies: v || " " } : row)
                                      }));
                                    }}
                                    className="rsvp-input"
                                    style={{ height: "36px", fontSize: "13px" }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submit */}
            <div style={{ marginTop: '1.5rem' }}>
              <Button type="submit" disabled={manualSending} style={{ width: '100%', height: '52px', fontWeight: 800, fontSize: '1rem' }}>
                {manualSending ? "Aggiungo..." : "Aggiungi ospite"}
              </Button>
            </div>

            {manualError ? (
              <p style={{ color: "salmon", marginTop: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>{manualError}</p>
            ) : null}
          </form>
          </div>
          ) : null}
        </Surface>

        {/* EXPORT — CSV (Excel/Numbers) oppure PDF (stampabile/condivisibile) */}
        {rsvps.length > 0 && (
          <Surface variant="glass" className="rsvp-collapse-card">
            <button
              type="button"
              className="rsvp-collapse-trigger"
              onClick={() => setExportPanelOpen((v) => !v)}
              aria-expanded={exportPanelOpen}
            >
              <div className="rsvp-collapse-trigger__text">
                <span className="rsvp-collapse-trigger__eyebrow">Esporta elenchi</span>
                <span className="rsvp-collapse-trigger__title">
                  PDF o CSV per catering, fornitori o Excel
                </span>
              </div>
              <span className="rsvp-collapse-trigger__meta">
                <Download size={20} aria-hidden />
                {exportPanelOpen ? <ChevronUp size={20} aria-hidden /> : <ChevronDown size={20} aria-hidden />}
              </span>
            </button>

            {exportPanelOpen ? (
            <div className="rsvp-collapse-body rsvp-export-body">
            <p className="rsvp-export-lede">
              PDF da stampare o condividere; CSV da aprire in Excel o Numbers.
            </p>

            <div className="rsvp-export-grid">
              <div className="rsvp-export-tile">
                <div className="rsvp-export-tile__head">
                  <div className="rsvp-export-tile__icon" aria-hidden>
                    <ClipboardList size={16} color="var(--accent)" />
                  </div>
                  <div className="rsvp-export-tile__title">Elenco completo</div>
                </div>
                <p className="rsvp-export-tile__sub">
                  Tutte le RSVP: stato, posti, contatti, allergie e risposte alle tue domande.
                </p>
                <div className="rsvp-export-tile__actions">
                  <Button variant="primary" onClick={handleExportAllPdf} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 12px', fontWeight: 700, fontSize: '12px' }}>
                    <FileText size={14} /> PDF
                  </Button>
                  <Button variant="subtle" onClick={handleExportAllCsv} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 12px', fontWeight: 700, fontSize: '12px' }}>
                    <Download size={14} /> CSV
                  </Button>
                </div>
              </div>

              <div className="rsvp-export-tile rsvp-export-tile--allergies">
                <div className="rsvp-export-tile__head">
                  <div className="rsvp-export-tile__icon" aria-hidden>
                    <ChefHat size={16} color="#b8862a" />
                  </div>
                  <div className="rsvp-export-tile__title">Allergie per catering</div>
                </div>
                <p className="rsvp-export-tile__sub">
                  Solo RSVP con allergie: posti totali, quante persone nel gruppo e testo dettagliato.
                </p>
                <div className="rsvp-export-tile__actions">
                  <Button variant="subtle" onClick={handleExportAllergiesPdf} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 12px', fontWeight: 700, fontSize: '12px', background: 'rgba(244, 196, 107, 0.85)', color: '#3d2a05', border: '1px solid rgba(244, 196, 107, 1)' }}>
                    <FileText size={14} /> PDF
                  </Button>
                  <Button variant="subtle" onClick={handleExportAllergiesCsv} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 12px', fontWeight: 700, fontSize: '12px', background: 'rgba(244, 196, 107, 0.15)', color: '#b8862a', border: '1px solid rgba(244, 196, 107, 0.45)' }}>
                    <Download size={14} /> CSV
                  </Button>
                </div>
              </div>
            </div>
            </div>
            ) : null}
          </Surface>
        )}

        <Surface variant="glass" className="rsvp-filters-card">
          <header className="rsvp-filters-card__header">
            <p className="rsvp-collapse-trigger__eyebrow">Elenco invitati</p>
            <p className="rsvp-filters-card__subtitle">
              Filtra per stato RSVP e cerca tra nome, email, telefono o allergie.
            </p>
          </header>
          <div className="rsvp-filters-row">
            <div className="rsvp-filters-rail" role="group" aria-label="Filtra per stato RSVP">
              {filterOptions.map((opt) => {
                const isSelected = filterStatus === opt.key;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    className={`rsvp-filter-segment rsvp-filter-segment--${opt.key} ${isSelected ? "is-selected" : ""}`}
                    title={opt.label}
                    aria-pressed={isSelected}
                    onClick={() => setFilterStatus(opt.key)}
                  >
                    <Icon size={20} strokeWidth={isSelected ? 2.25 : 1.85} className="rsvp-filter-segment__icon" aria-hidden />
                    <span className="rsvp-filter-segment__label">{opt.segmentLabel}</span>
                  </button>
                );
              })}
            </div>
            <div className="rsvp-search">
              <Search size={16} strokeWidth={2} className="rsvp-search__icon" aria-hidden />
              <input
                type="search"
                placeholder="Cerca invitato…"
                title="Cerca per nome, email, telefono o allergie"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Cerca tra gli invitati per nome, email, telefono o allergie"
              />
            </div>
          </div>
        </Surface>

        {filteredRsvps.length === 0 ? (
          <Surface variant="glass" className="rsvp-empty-card">
            {rsvps.length === 0 ? (
              <>
                <Users size={32} strokeWidth={1.5} aria-hidden />
                <h3>Nessuna RSVP ancora</h3>
                <p>Quando gli invitati confermeranno, compariranno qui. Puoi anche aggiungere ospiti a mano aprendo «Aggiungi ospite» sopra.</p>
              </>
            ) : (
              <>
                <Search size={32} strokeWidth={1.5} aria-hidden />
                <h3>Nessun risultato</h3>
                <p>
                  Nessun ospite corrisponde al filtro o alla ricerca. Prova a cambiare stato o cancella il testo nella barra di ricerca.
                </p>
              </>
            )}
          </Surface>
        ) : (
          <div className="rsvp-list">
            {filteredRsvps.map((r) => {
              const isEditing = editingId === r._id;
              const isDeleting = deletingId === r._id;

              const statusBadge = (
                <Badge
                  variant={
                    r.status === "yes"
                      ? "success"
                      : r.status === "maybe"
                      ? "warning"
                      : "default"
                  }
                >
                  {r.status === "yes" ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><CheckCircle2 size={14} /> Partecipa</span>
                  ) : r.status === "maybe" ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><HelpCircle size={14} /> Forse</span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><XCircle size={14} /> Non può</span>
                  )}
                </Badge>
              );

              return (
                <div key={r._id || `${r.name}-${r.createdAt}`} className={`rsvp-card rsvp-card-${r.status}`}>
                  <div className="rsvp-card-header">
                    <div>
                      {!isEditing ? (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            {r.guests && r.guests.length > 0 ? (
                              r.guests.map((g, idx) => (
                                <strong key={idx} style={{ fontSize: idx === 0 ? "14px" : "13px", color: idx === 0 ? "var(--text-main)" : "var(--accent)", fontWeight: idx === 0 ? 800 : 700 }}>
                                  {g.name}
                                </strong>
                              ))
                            ) : (
                              <strong>{r.name || "(senza nome)"}</strong>
                            )}
                          </div>
                          <p style={{ margin: "0.2rem 0 0", color: "var(--text-soft)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <Users size={14} /> {r.guestsCount} {r.guestsCount === 1 ? 'ospite' : 'ospiti'}
                          </p>
                          {(r.email || r.phone) && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "6px", fontSize: "12px", color: "var(--text-soft)" }}>
                              {r.email && (
                                <a href={`mailto:${r.email}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--text-soft)", textDecoration: "none" }}>
                                  <Mail size={12} /> {r.email}
                                </a>
                              )}
                              {r.phone && (
                                <a href={`tel:${r.phone.replace(/\s+/g, "")}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--text-soft)", textDecoration: "none" }}>
                                  <Phone size={12} /> {r.phone}
                                </a>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
                          <div className="input-group" style={{ gridColumn: "1 / -1", marginBottom: "0.5rem" }}>
                            <label>Stato RSVP</label>
                            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                              {[
                                { val: "yes", lab: "Partecipa" },
                                { val: "maybe", lab: "Forse" },
                                { val: "no", lab: "No" }
                              ].map((opt) => {
                                const active = editForm.status === opt.val;
                                return (
                                  <Button
                                    key={opt.val}
                                    type="button"
                                    variant={active ? "primary" : "subtle"}
                                    onClick={() => setEditForm(p => ({ ...p, status: opt.val as any }))}
                                    style={{ flex: 1, height: "44px", fontWeight: 800, fontSize: "13px" }}
                                  >
                                    {opt.lab}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="input-group">
                            <label>Nome Ospite</label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm((prev) => ({ ...prev, name: e.target.value }))
                              }
                              className="rsvp-input"
                            />
                          </div>
                          <div className="input-group">
                            <label>Num. Ospiti</label>
                            <input
                              type="number"
                              min="1"
                              value={editForm.guestsCount}
                              onChange={(e) => {
                                const next = Number(e.target.value) || 1;
                                setEditForm((prev) => ({ ...prev, guestsCount: next }));
                              }}
                              className="rsvp-input"
                            />
                          </div>
                          {/* LISTA NOMI OSPITI EDIT */}
                          {Number(editForm.guestsCount) > 1 && editGuestsList.map((g, idx) => (
                            <div key={idx} className="input-group">
                              <label>Ospite {idx + 2}</label>
                              <input 
                                type="text"
                                placeholder={`Nome Ospite ${idx + 2} *`}
                                value={g.name}
                                onChange={(e) => {
                                  const next = [...editGuestsList];
                                  next[idx] = { name: e.target.value };
                                  setEditGuestsList(next);
                                }}
                                className="rsvp-input"
                              />
                            </div>
                          ))}
                        </div>
                        </>
                      )}
                    </div>
                    <div style={{ alignSelf: 'flex-start' }}>
                      {statusBadge}
                    </div>
                  </div>

                  {isEditing ? (
                    <>
                      {/* Riga base: Num. ospiti + Stato */}
                      <div className="rsvp-form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", marginTop: '0.5rem' }}>
                        <div className="input-group">
                          <label>Num. Ospiti</label>
                          <input
                            type="number"
                            min="1"
                            value={editForm.guestsCount}
                            onChange={(e) => {
                              const next = Number(e.target.value) || 1;
                              setEditForm((prev) => ({ ...prev, guestsCount: next }));
                              if (next <= 1) {
                                setEditAllergy((p) =>
                                  p.mode === "by_person"
                                    ? { ...p, people: [{ name: "", allergies: p.people[0]?.allergies ?? "" }] }
                                    : p
                                );
                              }
                            }}
                            className="rsvp-input"
                          />
                        </div>
                        <div className="input-group">
                          <label>Stato</label>
                          <select
                            value={editForm.status}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, status: e.target.value as any }))
                            }
                            className="rsvp-select"
                          >
                            <option value="yes">Partecipa</option>
                            <option value="maybe">Forse</option>
                            <option value="no">Non può</option>
                          </select>
                        </div>
                      </div>

                      {/* DATI AGGIUNTIVI — contatti + allergie + domande custom.
                          Sempre mostrato se status != "no" così l'owner può
                          aggiungere/correggere contatti anche per vecchi record. */}
                      {editForm.status !== "no" && (
                        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                          <p className="rsvp-eyebrow" style={{ margin: '0 0 0.75rem', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.2em', color: 'var(--accent)' }}>
                            DATI AGGIUNTIVI
                          </p>

                          {/* Contatti opzionali — sempre editabili lato owner */}
                          <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '1rem' }}>
                            <div className="input-group">
                              <label>Email <span style={{ fontWeight: 400, color: 'var(--text-soft)' }}>(opz.)</span></label>
                              <input
                                type="email"
                                placeholder="ospite@esempio.it"
                                value={editForm.email}
                                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                                className="rsvp-input"
                              />
                            </div>
                            <div className="input-group">
                              <label>Telefono <span style={{ fontWeight: 400, color: 'var(--text-soft)' }}>(opz.)</span></label>
                              <input
                                type="tel"
                                placeholder="+39 333 123 4567"
                                value={editForm.phone}
                                onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                                className="rsvp-input"
                              />
                            </div>
                          </div>

                          {!rsvpConfig.askIntolerances ? (
                            <div className="input-group" style={{ marginBottom: "1rem" }}>
                              <label>
                                Allergie / intolleranze <span style={{ fontWeight: 400, color: "var(--text-soft)" }}>(testo libero)</span>
                              </label>
                              <input
                                type="text"
                                placeholder="Allergia o intolleranza"
                                value={editForm.allergies}
                                onChange={(e) => setEditForm((p) => ({ ...p, allergies: e.target.value }))}
                                className="rsvp-input"
                              />
                            </div>
                          ) : (
                            <div style={{ marginBottom: "1rem" }}>
                              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
                                Allergie o intolleranze? *
                              </label>
                              <div style={{ display: "flex", gap: "8px", marginBottom: "0.75rem" }}>
                                <Button
                                  type="button"
                                  variant={editAllergy.hasAllergies === "yes" ? "primary" : "subtle"}
                                  onClick={() =>
                                    setEditAllergy((p) => ({
                                      ...p,
                                      hasAllergies: "yes",
                                      mode: "by_person",
                                      wholeParty: "",
                                      people: defaultAllergyPeopleRows(),
                                    }))
                                  }
                                  style={{ flex: 1, justifyContent: "center", fontWeight: 700 }}
                                >
                                  Sì
                                </Button>
                                <Button
                                  type="button"
                                  variant={editAllergy.hasAllergies === "no" ? "primary" : "subtle"}
                                  onClick={() =>
                                    setEditAllergy({
                                      hasAllergies: "no",
                                      mode: null,
                                      wholeParty: "",
                                      people: defaultAllergyPeopleRows(),
                                    })
                                  }
                                  style={{ flex: 1, justifyContent: "center", fontWeight: 700 }}
                                >
                                  No
                                </Button>
                              </div>

                              {editAllergy.hasAllergies === "yes" && (
                                <div style={{ marginTop: "12px", padding: "16px", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "8px" }}>
                                  {editAllergy.people.map((p, idx) => {
                                    const hasAllergy = p.allergies.length > 0;
                                    const personName = idx === 0 ? (editForm.name || "Titolare") : (editGuestsList[idx-1]?.name || `Ospite ${idx+1}`);
                                    return (
                                      <div key={idx} style={{ 
                                        display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "8px", 
                                        borderBottom: idx === editAllergy.people.length - 1 ? "none" : "1px solid var(--border-subtle)" 
                                      }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                          <input 
                                            type="checkbox"
                                            checked={hasAllergy}
                                            onChange={() => {
                                              setEditAllergy(prev => ({
                                                ...prev,
                                                people: prev.people.map((row, i) => i === idx ? { ...row, allergies: !hasAllergy ? " " : "" } : row)
                                              }));
                                            }}
                                            style={{ width: "18px", height: "18px", cursor: "pointer" }}
                                          />
                                          <span style={{ fontSize: "14px", fontWeight: 600 }}>{personName}</span>
                                        </div>
                                        {hasAllergy && (
                                          <input 
                                            type="text"
                                            placeholder="Quali allergie?"
                                            value={p.allergies === " " ? "" : p.allergies}
                                            onChange={(e) => {
                                              const v = e.target.value;
                                              setEditAllergy(prev => ({
                                                ...prev,
                                                people: prev.people.map((row, i) => i === idx ? { ...row, allergies: v || " " } : row)
                                              }));
                                            }}
                                            className="rsvp-input"
                                            style={{ height: "36px", fontSize: "13px" }}
                                          />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          {rsvpConfig.customFields.length > 0 && (
                            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                              {rsvpConfig.customFields.map((field) => {
                                const val = editForm.customResponses[field.id];
                                return (
                                  <div key={field.id} className="input-group">
                                    <label>
                                      {field.label || "Domanda"}
                                      {field.required && <span style={{ color: 'var(--accent)' }}> *</span>}
                                    </label>
                        {field.type === "checkbox" ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {(["SÌ", "NO"] as const).map((opt) => {
                              const selected = val === opt;
                              return (
                                <Button
                                  key={opt}
                                  type="button"
                                  variant={selected ? "primary" : "subtle"}
                                  onClick={() => setEditForm((p) => ({ ...p, customResponses: { ...p.customResponses, [field.id]: opt } }))}
                                  style={{ flex: 1, justifyContent: 'center', fontWeight: 700, padding: '10px 12px' }}
                                >
                                  {opt}
                                </Button>
                              );
                            })}
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="Scrivi qui la tua risposta..."
                            value={val || ""}
                            onChange={(e) => setEditForm((p) => ({ ...p, customResponses: { ...p.customResponses, [field.id]: e.target.value } }))}
                            className="rsvp-input"
                          />
                        )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* ALLERGIE — callout color warm con icona */}
                      {(() => {
                        const fallback = extractAllergies(r);
                        const hasDetail = r.allergiesDetail && typeof r.allergiesDetail === "object";
                        if (!fallback.trim() && !hasDetail) return null;
                        return (
                          <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: '10px',
                            padding: '10px 12px', marginTop: '0.75rem',
                            background: 'rgba(244, 196, 107, 0.12)',
                            border: '1px solid rgba(244, 196, 107, 0.35)',
                            borderRadius: '10px',
                            color: '#8a6013'
                          }}>
                            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85, marginBottom: '2px' }}>
                                Allergie / Intolleranze
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.4, wordBreak: 'break-word' }}>
                                {hasDetail ? (
                                  <AllergiesDetailReadout detail={r.allergiesDetail} fallback={fallback} />
                                ) : (
                                  fallback.trim()
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* RISPOSTE CUSTOM — griglia etichetta/valore, tipografia più distinta */}
                      {r.customResponses && r.customResponses.length > 0 && (
                        <div style={{
                          marginTop: '0.75rem',
                          padding: '12px 14px',
                          background: 'rgba(var(--accent-rgb), 0.04)',
                          border: '1px solid rgba(var(--accent-rgb), 0.15)',
                          borderRadius: '10px',
                          display: 'grid',
                          gap: '10px',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
                        }}>
                          {r.customResponses.map((cr) => (
                            <div key={cr.fieldId} style={{ minWidth: 0 }}>
                              <div style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: 'var(--accent)',
                                marginBottom: '3px',
                                opacity: 0.85
                              }}>
                                {cr.label}
                              </div>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                wordBreak: 'break-word',
                                lineHeight: 1.35
                              }}>
                                {formatCustomAnswer(cr) || <span style={{ color: 'var(--text-soft)', fontWeight: 400 }}>—</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* MESSAGGIO LIBERO — reso solo se non è già stato mappato come allergie */}
                      {r.message && !/nessuna allergia/i.test(r.message) && r.message !== extractAllergies(r) && (
                        <div className="rsvp-message">{r.message}</div>
                      )}
                    </>
                  )}

                  <div className="rsvp-card-actions">
                    {!isEditing ? (
                      <>
                        <Button variant="ghost" onClick={() => startEdit(r)}>
                          Modifica
                        </Button>
                        <Button
                          variant={isDeleting ? "danger" : "ghost"}
                          onClick={() => {
                            if (isDeleting) {
                              deleteRsvp(r._id);
                            } else {
                              setDeletingId(r._id);
                              setTimeout(() => setDeletingId(null), 2500);
                            }
                          }}
                        >
                          {isDeleting ? "Conferma eliminazione" : "Elimina"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => saveEdit(r._id)}>Salva</Button>
                        <Button variant="ghost" onClick={cancelEdit}>
                          Annulla
                        </Button>
                      </>
                    )}
                  </div>

                  {r.createdAt && (
                    <small style={{ color: "var(--text-soft)" }}>
                      Ricevuto il {new Date(r.createdAt).toLocaleString("it-IT")}
                    </small>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
