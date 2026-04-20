import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { Surface, Button, Badge, StatCard } from "../../ui";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Gift,
  Download,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  CheckCircle2,
  Undo2,
  ShieldAlert,
  XCircle,
  Mail,
  Clock,
  Banknote,
  ListOrdered,
  FileText,
} from "lucide-react";
import "../Rsvps/EventRsvps.css";
import "./EventDonations.css";

type DonationStatus =
  | "pending"
  | "requires_payment"
  | "processing"
  | "succeeded"
  | "failed"
  | "refunded"
  | "disputed";

interface Donation {
  _id: string;
  eventSlug: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  applicationFee: number;
  netToHost: number;
  status: DonationStatus;
  donor?: {
    name?: string;
    email?: string;
    message?: string;
  };
  createdAt?: string;
}

interface DonationsResponse {
  donations: Donation[];
  totals: {
    grossReceived: number;
    netReceived: number;
    count: number;
  };
}

function csvEscape(value: any): string {
  const str = String(value ?? "");
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

function formatEuro(cents: number): string {
  return (cents / 100).toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
  });
}

type BadgeTone = "default" | "accent" | "success" | "warning";
function statusLabel(s: string): { label: string; tone: BadgeTone } {
  switch (s) {
    case "succeeded":
      return { label: "Completato", tone: "success" };
    case "refunded":
      return { label: "Rimborsato", tone: "warning" };
    case "disputed":
      return { label: "Contestato", tone: "warning" };
    case "failed":
      return { label: "Fallito", tone: "warning" };
    case "processing":
    case "requires_payment":
      return { label: "In elaborazione", tone: "accent" };
    case "pending":
      return { label: "In sospeso", tone: "default" };
    default:
      return { label: "In attesa", tone: "default" };
  }
}

function donationCardTone(status: string): string {
  if (status === "succeeded") return "rsvp-card-yes";
  if (status === "processing" || status === "requires_payment" || status === "pending") return "rsvp-card-maybe";
  if (status === "refunded") return "rsvp-card-maybe";
  if (status === "disputed" || status === "failed") return "rsvp-card-no";
  return "rsvp-card-maybe";
}

function filterSegmentClass(key: "all" | DonationStatus): string {
  if (key === "all") return "rsvp-filter-segment--all";
  if (key === "succeeded") return "rsvp-filter-segment--yes";
  if (key === "refunded") return "rsvp-filter-segment--maybe";
  if (key === "disputed" || key === "failed") return "rsvp-filter-segment--no";
  return "rsvp-filter-segment--maybe";
}

export default function EventDonations() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [totals, setTotals] = useState({ grossReceived: 0, netReceived: 0, count: 0 });
  const [eventTitle, setEventTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const [hubTab, setHubTab] = useState<"money" | "list">("money");
  const [filterStatus, setFilterStatus] = useState<"all" | DonationStatus>("all");
  const [search, setSearch] = useState("");
  const [exportPanelOpen, setExportPanelOpen] = useState(false);

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
        } else {
          setEventTitle(slug || "");
        }

        const dRes = await apiFetch(`/api/donations/event/${slug}`);
        if (dRes.ok) {
          const dData: DonationsResponse = await dRes.json();
          setDonations(Array.isArray(dData.donations) ? dData.donations : []);
          setTotals(dData.totals || { grossReceived: 0, netReceived: 0, count: 0 });
        } else {
          setDonations([]);
        }
      } catch (err: any) {
        if (err.message !== "Unauthorized") {
          console.error(err);
          setDonations([]);
          setEventTitle(slug || "");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [slug]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return donations.filter((d) => {
      if (filterStatus !== "all" && d.status !== filterStatus) return false;
      if (!q) return true;
      const hay = `${d.donor?.name || ""} ${d.donor?.email || ""} ${d.donor?.message || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [donations, filterStatus, search]);

  const avgAmount = useMemo(() => {
    if (totals.count === 0) return 0;
    return Math.round(totals.grossReceived / totals.count);
  }, [totals]);

  const donationExportRows = () => {
    const headers = [
      "Data",
      "Donatore",
      "Email",
      "Messaggio",
      "Importo lordo (€)",
      "Commissione servizio (€)",
      "Netto (€)",
      "Stato",
      "ID transazione",
    ];
    const rows = donations.map((d) => [
      d.createdAt ? new Date(d.createdAt).toLocaleString("it-IT") : "",
      d.donor?.name || "Anonimo",
      d.donor?.email || "",
      d.donor?.message || "",
      (d.amount / 100).toFixed(2),
      (d.applicationFee / 100).toFixed(2),
      (d.netToHost / 100).toFixed(2),
      statusLabel(d.status).label,
      d.stripePaymentIntentId || "",
    ]);
    return { headers, rows };
  };

  const handleExportCsv = () => {
    const { headers, rows } = donationExportRows();
    const csv = buildCsv(headers, rows);
    const safeSlug = (slug || "evento").replace(/[^a-z0-9-_]/gi, "_");
    downloadCsv(`regali_${safeSlug}.csv`, csv);
  };

  const pdfHeaderDonations = (doc: jsPDF, title: string, subtitle: string) => {
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFillColor(20, 184, 166);
    doc.rect(0, 0, pageW, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("EENVEE · Regali", 12, 12);
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

  const pdfFooterDonations = (doc: jsPDF) => {
    const pageCount = doc.getNumberOfPages();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(`Pagina ${i} di ${pageCount}`, pageW - 12, pageH - 8, { align: "right" });
      doc.text("eenvee · regali e donazioni", 12, pageH - 8);
    }
  };

  const handleExportPdf = () => {
    if (donations.length === 0) {
      alert("Nessun regalo da esportare.");
      return;
    }
    const { headers, rows } = donationExportRows();
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    pdfHeaderDonations(doc, eventTitle || "Evento", "Elenco regali in denaro");

    const summary = `Regali: ${totals.count}  ·  Lordo: ${formatEuro(totals.grossReceived)}  ·  Netto: ${formatEuro(totals.netReceived)}`;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(summary, 12, 46);

    const statusColIndex = headers.indexOf("Stato");

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 52,
      theme: "striped",
      styles: { fontSize: 8.5, cellPadding: 2.5, overflow: "linebreak" },
      headStyles: { fillColor: [20, 184, 166], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [247, 247, 247] },
      didParseCell: (data) => {
        if (data.section === "body" && statusColIndex >= 0 && data.column.index === statusColIndex) {
          const val = String(data.cell.raw || "");
          if (val === "Completato") data.cell.styles.textColor = [20, 120, 90];
          else if (val === "In elaborazione" || val === "In sospeso" || val === "In attesa")
            data.cell.styles.textColor = [30, 90, 140];
          else if (val === "Rimborsato" || val === "Contestato" || val === "Fallito")
            data.cell.styles.textColor = [180, 60, 60];
        }
      },
    });

    pdfFooterDonations(doc);
    const safeSlug = (slug || "evento").replace(/[^a-z0-9-_]/gi, "_");
    doc.save(`regali_${safeSlug}.pdf`);
  };

  const filterOptions: Array<{
    key: "all" | DonationStatus;
    label: string;
    segmentLabel: string;
    icon: typeof LayoutGrid;
  }> = [
    { key: "all", label: "Tutti i regali", segmentLabel: "Tutti", icon: LayoutGrid },
    { key: "succeeded", label: "Completati", segmentLabel: "Completati", icon: CheckCircle2 },
    { key: "refunded", label: "Rimborsati", segmentLabel: "Rimborsati", icon: Undo2 },
    { key: "disputed", label: "Contestati", segmentLabel: "Contestati", icon: ShieldAlert },
    { key: "failed", label: "Falliti", segmentLabel: "Falliti", icon: XCircle },
  ];

  if (loading) {
    return (
      <div className="rsvp-page">
        <div className="rsvp-shell">
          <Surface variant="glass">Caricamento…</Surface>
        </div>
      </div>
    );
  }

  if (!authChecked) return null;

  return (
    <div className="rsvp-page">
      <div className="rsvp-shell">
        <div className="rsvp-topbar">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            ← Torna alla dashboard
          </Button>
          <div className="rsvp-header">
            <div>
              <p className="rsvp-eyebrow">REGALI E DONAZIONI</p>
              <h1>{eventTitle}</h1>
              <p className="rsvp-subtitle don-page-subtitle">
                Regali in denaro e lista regali in un solo posto. Dettagli su pagamenti e commissioni sono sotto, nel
                riquadro informativo.
              </p>
            </div>
            <div className="rsvp-header-actions">
              <Button variant="subtle" onClick={() => navigate(`/edit/${slug}`)}>
                Modifica evento
              </Button>
            </div>
          </div>
        </div>

        <Surface variant="glass" className="don-hub-card">
          <header className="don-hub-card__header">
            <p className="rsvp-collapse-trigger__eyebrow">Sezione</p>
            <p className="don-hub-card__lede">Passa tra regali in denaro e lista regali.</p>
          </header>
          <div className="don-hub-rail rsvp-filters-rail" role="tablist" aria-label="Tipo di regalo">
            <button
              type="button"
              role="tab"
              aria-selected={hubTab === "money"}
              className={`rsvp-filter-segment rsvp-filter-segment--all ${hubTab === "money" ? "is-selected" : ""}`}
              onClick={() => setHubTab("money")}
            >
              <Banknote size={24} strokeWidth={hubTab === "money" ? 2.25 : 1.85} className="rsvp-filter-segment__icon" aria-hidden />
              <span className="rsvp-filter-segment__label">Denaro</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={hubTab === "list"}
              className={`rsvp-filter-segment rsvp-filter-segment--yes ${hubTab === "list" ? "is-selected" : ""}`}
              onClick={() => setHubTab("list")}
            >
              <ListOrdered size={24} strokeWidth={hubTab === "list" ? 2.25 : 1.85} className="rsvp-filter-segment__icon" aria-hidden />
              <span className="rsvp-filter-segment__label">Lista regali</span>
            </button>
          </div>
        </Surface>

        {hubTab === "list" ? (
          <Surface variant="glass" className="don-list-roadmap-card">
            <div className="don-list-roadmap-card__icon" aria-hidden>
              <ListOrdered size={28} strokeWidth={1.5} />
            </div>
            <h3 className="don-list-roadmap-card__title">Lista regali — in arrivo</h3>
            <p className="don-list-roadmap-card__p">
              Chi prenota un oggetto lascia nome e recapito qui; poi apre il link esterno per comprarlo. Tu vedi chi
              ha prenotato cosa (l’acquisto resta sul negozio).
            </p>
            <ul className="don-list-roadmap-card__steps">
              <li>Dati: evento, voce lista, nome, recapito, data.</li>
              <li>API pubblica con limiti anti-spam; elenco per te in questa area.</li>
            </ul>
          </Surface>
        ) : null}

        {hubTab === "money" ? (
          <>
        <div className="rsvp-stats-grid">
          <StatCard label="Regali ricevuti" value={String(totals.count)} />
          <StatCard label="Totale lordo" value={formatEuro(totals.grossReceived)} />
          <StatCard
            label="Netto sul tuo conto"
            value={formatEuro(totals.netReceived)}
            {...(totals.count > 0 ? { hint: "Dopo commissioni di servizio" } : {})}
          />
          <StatCard label="Regalo medio" value={formatEuro(avgAmount)} />
        </div>

        {donations.length > 0 && (
          <Surface variant="glass" className="rsvp-collapse-card">
            <button
              type="button"
              className="rsvp-collapse-trigger"
              onClick={() => setExportPanelOpen((v) => !v)}
              aria-expanded={exportPanelOpen}
            >
              <div className="rsvp-collapse-trigger__text">
                <span className="rsvp-collapse-trigger__eyebrow">Esporta</span>
                <span className="rsvp-collapse-trigger__title">PDF o CSV</span>
              </div>
              <span className="rsvp-collapse-trigger__meta">
                <Download size={22} aria-hidden />
                {exportPanelOpen ? <ChevronUp size={22} aria-hidden /> : <ChevronDown size={22} aria-hidden />}
              </span>
            </button>
            {exportPanelOpen ? (
              <div className="rsvp-collapse-body rsvp-export-body">
                <p className="rsvp-export-lede don-export-lede">Stampa o condividi il PDF; il CSV per Excel o Numbers.</p>
                <div className="don-export-actions">
                  <Button
                    variant="primary"
                    onClick={handleExportPdf}
                    className="don-export-btn don-export-btn--pdf"
                  >
                    <FileText size={20} strokeWidth={2} aria-hidden />
                    Scarica PDF
                  </Button>
                  <Button
                    variant="subtle"
                    onClick={handleExportCsv}
                    className="don-export-btn don-export-btn--csv"
                  >
                    <Download size={20} strokeWidth={2} aria-hidden />
                    Scarica CSV
                  </Button>
                </div>
              </div>
            ) : null}
          </Surface>
        )}

        <Surface variant="glass" className="rsvp-filters-card">
          <header className="rsvp-filters-card__header">
            <p className="rsvp-collapse-trigger__eyebrow">Elenco regali</p>
            <p className="rsvp-filters-card__subtitle">Stato pagamento e ricerca per nome o messaggio.</p>
          </header>
          <div className="rsvp-filters-row">
            <div className="rsvp-filters-rail" role="group" aria-label="Filtra per stato pagamento">
              {filterOptions.map((opt) => {
                const isSelected = filterStatus === opt.key;
                const Icon = opt.icon;
                const seg = filterSegmentClass(opt.key);
                return (
                  <button
                    key={String(opt.key)}
                    type="button"
                    className={`rsvp-filter-segment ${seg} ${isSelected ? "is-selected" : ""}`}
                    title={opt.label}
                    aria-pressed={isSelected}
                    onClick={() => setFilterStatus(opt.key)}
                  >
                    <Icon size={22} strokeWidth={isSelected ? 2.25 : 1.85} className="rsvp-filter-segment__icon" aria-hidden />
                    <span className="rsvp-filter-segment__label">{opt.segmentLabel}</span>
                  </button>
                );
              })}
            </div>
            <div className="rsvp-search">
              <Search size={18} strokeWidth={2} className="rsvp-search__icon" aria-hidden />
              <input
                type="search"
                placeholder="Cerca donatore…"
                title="Cerca per nome, email o messaggio"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Cerca tra i regali"
              />
            </div>
          </div>
        </Surface>

        {filtered.length === 0 ? (
          <Surface variant="glass" className="rsvp-empty-card">
            {donations.length === 0 ? (
              <>
                <Gift size={32} strokeWidth={1.5} aria-hidden />
                <h3>Nessun regalo ancora</h3>
                <p>Quando arriverà un regalo in denaro, lo vedrai qui con importi e stato.</p>
              </>
            ) : (
              <>
                <Search size={32} strokeWidth={1.5} aria-hidden />
                <h3>Nessun risultato</h3>
                <p>Prova un altro filtro o svuota la ricerca.</p>
              </>
            )}
          </Surface>
        ) : (
          <div className="rsvp-list don-gift-list">
            {filtered.map((d) => {
              const sl = statusLabel(d.status);
              const tone = donationCardTone(d.status);
              const when = d.createdAt
                ? new Date(d.createdAt).toLocaleString("it-IT", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null;
              return (
                <div key={d._id} className={`rsvp-card ${tone}`}>
                  <div className="rsvp-card-header">
                    <div>
                      <strong>{d.donor?.name || "Anonimo"}</strong>
                      {d.donor?.email ? (
                        <p className="don-card-meta">
                          <Mail size={16} aria-hidden />
                          <a href={`mailto:${d.donor.email}`}>{d.donor.email}</a>
                        </p>
                      ) : null}
                      {when ? (
                        <p className="don-card-meta">
                          <Clock size={16} aria-hidden />
                          {when}
                        </p>
                      ) : null}
                    </div>
                    <div style={{ alignSelf: "flex-start" }}>
                      <Badge variant={sl.tone}>{sl.label}</Badge>
                    </div>
                  </div>

                  {d.donor?.message ? (
                    <div className="don-message-callout">
                      <div className="don-message-callout__head">
                        <Gift className="don-message-callout__icon" size={22} strokeWidth={1.85} aria-hidden />
                        <span className="don-message-callout__title">Messaggio dal donatore</span>
                      </div>
                      <p className="don-message-callout__body">{d.donor.message}</p>
                    </div>
                  ) : null}

                  <div className="don-amount-grid">
                    <div className="don-amount-cell">
                      <span className="don-amount-label">Lordo</span>
                      <strong>{formatEuro(d.amount)}</strong>
                    </div>
                    <div className="don-amount-cell don-amount-cell--fee">
                      <span className="don-amount-label">Commissione servizio</span>
                      <strong>−{formatEuro(d.applicationFee)}</strong>
                    </div>
                    <div className="don-amount-cell don-amount-cell--net">
                      <span className="don-amount-label">Netto per te</span>
                      <strong>{formatEuro(d.netToHost)}</strong>
                    </div>
                  </div>

                  {d.stripePaymentIntentId ? (
                    <p className="don-pi-hint" title="Identificativo tecnico del pagamento">
                      Rif. pagamento: <span className="don-pi-code">{d.stripePaymentIntentId}</span>
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        <Surface variant="glass" className="don-info-card">
          <AlertTriangle size={26} strokeWidth={2} className="don-info-card__icon" aria-hidden />
          <div className="don-info-card__body">
            <strong className="don-info-card__title">Pagamenti e commissioni</strong>
            <p>
              I regali in denaro passano da <strong>Stripe</strong>. Eenvee non è una banca: applica la commissione di
              servizio (3% + 0,50&nbsp;€) e il resto va sul <strong>conto che hai collegato</strong> quando hai attivato
              i regali, come da regole Stripe.
            </p>
            <strong className="don-info-card__subheading">Se l&apos;addebito in carta viene contestato</strong>
            <p>
              Di solito chi ha pagato contatta la <strong>propria banca</strong> o scrive all&apos;
              <strong>organizzatore dell&apos;evento</strong>. Le pratiche
              ufficiali tra banca e circuiti le gestisce <strong>Stripe</strong> sul conto collegato: controlla email e
              dashboard Stripe dell&apos;attivazione. <strong>Da questa app non si aprono contestazioni sulla carta</strong>{" "}
              né si annullano pagamenti.
            </p>
          </div>
        </Surface>
          </>
        ) : null}
      </div>
    </div>
  );
}
