import { sendEmail } from "./emailService.js";

const CLIENT_BASE = (process.env.CLIENT_ORIGINS?.split(",")[0] || "http://localhost:5173").trim();
/** URL pubblico del sito (per link e asset nelle email). */
const SITE_URL = (
  process.env.PUBLIC_BASE_URL ||
  CLIENT_BASE ||
  "https://eenvee.com"
)
  .trim()
  .replace(/\/$/, "");
const LOGO_URL = `${SITE_URL}/logo-eenvee.svg`;

/** Brand eenvee (allineato al client: accent Tiffany + navy) */
const C_ACCENT = "#1ABC9C";
const C_NAVY = "#3C4F76";
const C_BG_PAGE = "#F4ECD6";
const C_CARD = "#ffffff";

function formatEur(cents: number): string {
  return (cents / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR" });
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paidEventInvoiceHtml(meta: Record<string, string>): string {
  if (meta.invoice_requested !== "true") return "";
  const kind =
    meta.inv_kind === "private"
      ? "Persona fisica"
      : meta.inv_kind === "professional"
        ? "Libero professionista / ditta individuale"
        : meta.inv_kind === "company"
          ? "Società / impresa"
          : meta.inv_kind || "—";
  const rows: [string, string][] = [
    ["Tipo intestatario", kind],
    ["Intestazione", meta.inv_den || "—"],
    ["Indirizzo", [meta.inv_street, meta.inv_cap, meta.inv_city, meta.inv_prov].filter(Boolean).join(", ") || "—"],
  ];
  if (meta.inv_cf16) rows.push(["Codice fiscale (persona)", meta.inv_cf16]);
  if (meta.inv_cf11) rows.push(["Codice fiscale (azienda)", meta.inv_cf11]);
  if (meta.inv_piva) rows.push(["Partita IVA", meta.inv_piva]);
  if (meta.inv_sdi) rows.push(["Codice SDI", meta.inv_sdi]);
  if (meta.inv_pec) rows.push(["PEC", meta.inv_pec]);
  const body = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 10px;color:#666;font-size:12px;border-bottom:1px solid #eee;">${escapeHtml(k)}</td><td style="padding:6px 10px;font-size:12px;border-bottom:1px solid #eee;">${escapeHtml(v)}</td></tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" style="margin:0 0 16px;background:#fff9e6;border-radius:8px;border:1px solid #e8dc9a;overflow:hidden;"><tr><td style="padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#5c4a1a;">Dati per fattura elettronica</td></tr><tr><td style="padding:0 8px 8px;"><table role="presentation" width="100%" style="border-collapse:collapse;">${body}</table></td></tr></table>`;
}

/**
 * Wrapper HTML comune: logo, barra accent, footer.
 * I client email spesso "tagliano" contenuti in fondo se sembrano citazioni
 * ripetute; per testi critici usare box dedicati subito dopo i dati principali.
 */
function emailShell(inner: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C_BG_PAGE};padding:28px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background:${C_CARD};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(60,79,118,0.08);">
        <tr>
          <td style="height:4px;background:${C_ACCENT};line-height:4px;font-size:0;">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding:28px 28px 8px;text-align:center;">
            <a href="${SITE_URL}" target="_blank" rel="noopener" style="text-decoration:none;">
              <img src="${LOGO_URL}" width="160" height="32" alt="eenvee" style="display:inline-block;border:0;outline:none;max-width:160px;height:auto;" />
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 28px 32px;color:#1a1a1a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;">
            ${inner}
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 24px;border-top:1px solid #e8e6df;font-size:12px;color:#888;text-align:center;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <p style="margin:0;">eenvee — il tuo portale per inviti digitali.</p>
            <p style="margin:6px 0 0;color:#aaa;">I pagamenti sono processati in modo sicuro da Stripe.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

function ctaButton(href: string, label: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0 8px;">
  <tr>
    <td align="center">
      <a href="${href}" style="display:inline-block;background:${C_ACCENT};color:#ffffff;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.02em;">${label}</a>
    </td>
  </tr>
</table>`;
}

interface DonorReceiptParams {
  donorEmail: string;
  donorName: string;
  eventTitle: string;
  eventSlug: string;
  amountCents: number;
  message?: string;
}

export async function sendDonorReceipt(params: DonorReceiptParams) {
  const { donorEmail, donorName, eventTitle, eventSlug, amountCents, message } = params;
  const eventUrl = `${SITE_URL}/e/${eventSlug}`;
  const inner = `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 14px;color:${C_NAVY};text-align:center;">Grazie per il tuo regalo, ${escapeHtml(donorName)}.</h1>
    <p style="margin:0 0 18px;color:#444;">
      Abbiamo ricevuto il tuo contributo di <strong>${formatEur(amountCents)}</strong> per l'evento <strong>${escapeHtml(eventTitle)}</strong>.
      Il denaro verrà trasferito direttamente al destinatario dell'evento.
    </p>
    ${message ? `
    <table role="presentation" width="100%" style="background:#f6f5f1;border-left:4px solid ${C_ACCENT};border-radius:8px;margin:18px 0;">
      <tr><td style="padding:14px 18px;">
        <div style="font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#888;margin-bottom:6px;">Il tuo messaggio</div>
        <div style="font-style:italic;color:#333;">"${escapeHtml(message)}"</div>
      </td></tr>
    </table>
    ` : ""}
    <p style="margin:0;font-size:13px;line-height:1.6;color:#666;">
      Conserva questa email come ricevuta del tuo gesto. Stripe ti invierà anche una ricevuta di pagamento separata con tutti i dettagli della transazione.
    </p>
    ${ctaButton(eventUrl, "Torna alla pagina evento")}
  `;
  const html = emailShell(inner);

  return sendEmail({
    to: donorEmail,
    subject: `Grazie per il tuo regalo per ${eventTitle}`,
    html,
  });
}

interface HostNotificationParams {
  hostEmail: string;
  eventTitle: string;
  eventSlug: string;
  donorName: string;
  donorEmail: string;
  amountCents: number;
  netCents: number;
  feeCents: number;
  message?: string;
}

export async function sendHostNotification(params: HostNotificationParams) {
  const { hostEmail, eventTitle, eventSlug, donorName, donorEmail, amountCents, netCents, feeCents, message } = params;
  const dashboardUrl = `${SITE_URL}/events/${eventSlug}/donations`;

  /** Box accredito: messo subito dopo la tabella importi così non finisce in fondo
   *  dove Gmail tende a nascondere paragrafi ripetitivi dietro "Mostra contenuto tagliato". */
  const payoutBox = `
<table role="presentation" width="100%" style="margin:16px 0 20px;background:#e8faf6;border-radius:10px;border:1px solid #c9ecdf;">
  <tr>
    <td style="padding:14px 16px;font-size:13px;line-height:1.55;color:#2d4a44;">
      <strong style="display:block;margin-bottom:6px;color:#0d6b5c;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;">Quando arriva il denaro?</strong>
      L'importo netto verrà accreditato automaticamente sul conto collegato secondo i tempi di payout Stripe standard.
    </td>
  </tr>
</table>`;

  const inner = `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 14px;color:${C_NAVY};text-align:center;">Hai ricevuto un regalo!</h1>
    <p style="margin:0 0 16px;color:#444;">
      <strong>${escapeHtml(donorName)}</strong> ha inviato un regalo per <strong>${escapeHtml(eventTitle)}</strong>.
    </p>
    <table role="presentation" width="100%" style="border-collapse:collapse;margin:0 0 4px;background:#f6f5f1;border-radius:8px;overflow:hidden;">
      <tr>
        <td style="padding:12px 16px;color:#666;font-size:13px;">Importo regalo</td>
        <td style="padding:12px 16px;text-align:right;font-weight:600;color:#1a1a1a;">${formatEur(amountCents)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#666;font-size:13px;border-top:1px solid #e8e6df;">Commissione eenvee + Stripe</td>
        <td style="padding:12px 16px;text-align:right;color:#888;border-top:1px solid #e8e6df;">-${formatEur(feeCents)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#1a1a1a;font-weight:600;border-top:2px solid ${C_NAVY};">Netto a te</td>
        <td style="padding:12px 16px;text-align:right;font-weight:700;color:${C_ACCENT};font-size:16px;border-top:2px solid ${C_NAVY};">${formatEur(netCents)}</td>
      </tr>
    </table>
    ${payoutBox}
    ${message ? `
    <table role="presentation" width="100%" style="background:#ffffff;border:1px solid #e8e6df;border-radius:8px;margin:0 0 16px;">
      <tr><td style="padding:14px 18px;">
        <div style="font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#888;margin-bottom:6px;">Messaggio da ${escapeHtml(donorName)}</div>
        <div style="font-style:italic;color:#333;">"${escapeHtml(message)}"</div>
      </td></tr>
    </table>
    ` : ""}
    <p style="margin:0;font-size:13px;line-height:1.6;color:#666;">
      Puoi contattare il donatore all'indirizzo <a href="mailto:${escapeHtml(donorEmail)}" style="color:${C_NAVY};font-weight:600;">${escapeHtml(donorEmail)}</a>.
    </p>
    ${ctaButton(dashboardUrl, "Vedi tutte le donazioni")}
  `;
  const html = emailShell(inner);

  return sendEmail({
    to: hostEmail,
    subject: `Hai ricevuto un regalo per ${eventTitle}`,
    html,
  });
}

/**
 * Destinatari notifica interna acquisto piano Evento (comma-separated per nodemailer).
 * - Se `INTERNAL_NOTIFY_EMAIL` è valorizzato, usa quello (più indirizzi separati da virgola).
 * - Altrimenti, se `SMTP_USER` è un indirizzo email, usa quello: è la casella da cui invii
 *   ed è dove di solito vuoi ricevere gli avvisi in dev / piccoli deploy.
 * - Ultimo fallback: info@eenvee.com (se coincide con EMAIL_FROM, alcuni provider non recapitan bene: imposta INTERNAL_NOTIFY_EMAIL).
 */
function internalPaidEventNotifyRecipients(): string {
  const explicit = process.env.INTERNAL_NOTIFY_EMAIL?.trim();
  if (explicit) {
    const parts = explicit
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
    if (parts.length) return parts.join(", ");
  }
  const smtp = process.env.SMTP_USER?.trim();
  if (smtp && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(smtp)) {
    return smtp;
  }
  return "info@eenvee.com";
}

export interface PaidEventBuyerReceiptParams {
  buyerEmail: string;
  buyerName: string;
  eventTitle: string;
  eventSlug: string;
  amountCents: number;
  invoiceRequested?: boolean;
}

/** Ricevuta acquisto piano Evento (69 €) — stessa struttura visiva dell’email «Grazie per il tuo regalo». */
export async function sendPaidEventBuyerReceipt(params: PaidEventBuyerReceiptParams) {
  const { buyerEmail, buyerName, eventTitle, eventSlug, amountCents, invoiceRequested } = params;
  const eventUrl = `${SITE_URL}/e/${eventSlug}`;
  const invoiceNote = invoiceRequested
    ? `<p style="margin:0 0 18px;font-size:13px;line-height:1.55;color:#2d4a44;background:#e8faf6;border-radius:8px;border:1px solid #c9ecdf;padding:12px 14px;">Hai richiesto la <strong>fattura elettronica</strong>: emetteremo il documento con i dati che ci hai fornito.</p>`
    : "";
  const inner = `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 14px;color:${C_NAVY};text-align:center;">Grazie per il tuo acquisto, ${escapeHtml(buyerName)}.</h1>
    <p style="margin:0 0 18px;color:#444;">
      Abbiamo ricevuto <strong>${formatEur(amountCents)}</strong> per il <strong>piano Evento</strong> su <strong>${escapeHtml(eventTitle)}</strong>.
    </p>
    ${invoiceNote}
    <table role="presentation" width="100%" style="border-collapse:collapse;margin:0 0 16px;background:#f6f5f1;border-radius:8px;overflow:hidden;">
      <tr>
        <td style="padding:12px 16px;color:#666;font-size:13px;">Piano</td>
        <td style="padding:12px 16px;text-align:right;font-weight:600;color:#1a1a1a;">Evento · una tantum</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#1a1a1a;font-weight:600;border-top:2px solid ${C_NAVY};">Totale pagato</td>
        <td style="padding:12px 16px;text-align:right;font-weight:700;color:${C_ACCENT};font-size:16px;border-top:2px solid ${C_NAVY};">${formatEur(amountCents)}</td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#666;">
      Conserva questa email come ricevuta del tuo acquisto. Stripe ti invierà anche una ricevuta di pagamento separata con tutti i dettagli della transazione.
    </p>
    ${ctaButton(eventUrl, "Torna alla pagina evento")}
  `;
  const html = emailShell(inner);
  return sendEmail({
    to: buyerEmail,
    subject: `Grazie per il tuo acquisto — ${eventTitle}`,
    html,
  });
}

export interface PaidEventOpsNotificationParams {
  eventTitle: string;
  eventSlug: string;
  amountCents: number;
  buyerEmail: string;
  buyerName: string;
  ownerAccountEmail?: string;
  paymentIntentId: string;
  invoiceMetadata?: Record<string, string>;
}

/** Notifica interna vendita piano Evento — stessa struttura dell’email «Hai ricevuto un regalo» (tabella + box + CTA). */
export async function sendPaidEventOpsNotification(params: PaidEventOpsNotificationParams) {
  const { eventTitle, eventSlug, amountCents, buyerEmail, buyerName, ownerAccountEmail, paymentIntentId, invoiceMetadata } = params;
  const to = internalPaidEventNotifyRecipients();
  const dashboardUrl = `${SITE_URL}/dashboard`;

  const invoiceBlock = invoiceMetadata ? paidEventInvoiceHtml(invoiceMetadata) : "";

  const infoBox = `
<table role="presentation" width="100%" style="margin:16px 0 20px;background:#e8faf6;border-radius:10px;border:1px solid #c9ecdf;">
  <tr>
    <td style="padding:14px 16px;font-size:13px;line-height:1.55;color:#2d4a44;">
      <strong style="display:block;margin-bottom:6px;color:#0d6b5c;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;">Dettaglio tecnico</strong>
      ID pagamento Stripe: <span style="font-family:monospace;font-size:11px;word-break:break-all;">${escapeHtml(paymentIntentId)}</span>
      ${ownerAccountEmail ? `<br/><span style="margin-top:8px;display:block;">Account organizzatore: <a href="mailto:${escapeHtml(ownerAccountEmail)}" style="color:${C_NAVY};font-weight:600;">${escapeHtml(ownerAccountEmail)}</a></span>` : ""}
    </td>
  </tr>
</table>`;

  const inner = `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 14px;color:${C_NAVY};text-align:center;">Nuovo acquisto — piano Evento</h1>
    <p style="margin:0 0 16px;color:#444;">
      <strong>${escapeHtml(buyerName)}</strong> ha acquistato il piano Evento (69 € una tantum) per <strong>${escapeHtml(eventTitle)}</strong>.
    </p>
    <table role="presentation" width="100%" style="border-collapse:collapse;margin:0 0 4px;background:#f6f5f1;border-radius:8px;overflow:hidden;">
      <tr>
        <td style="padding:12px 16px;color:#666;font-size:13px;">Importo</td>
        <td style="padding:12px 16px;text-align:right;font-weight:600;color:#1a1a1a;">${formatEur(amountCents)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#1a1a1a;font-weight:600;border-top:2px solid ${C_NAVY};">Totale incassato</td>
        <td style="padding:12px 16px;text-align:right;font-weight:700;color:${C_ACCENT};font-size:16px;border-top:2px solid ${C_NAVY};">${formatEur(amountCents)}</td>
      </tr>
    </table>
    ${invoiceBlock}
    ${infoBox}
    <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#666;">
      Puoi contattare l&apos;acquirente all&apos;indirizzo <a href="mailto:${escapeHtml(buyerEmail)}" style="color:${C_NAVY};font-weight:600;">${escapeHtml(buyerEmail)}</a>.
    </p>
    <p style="margin:0 0 8px;font-size:12px;color:#888;">Slug evento: <span style="font-family:monospace;">${escapeHtml(eventSlug)}</span></p>
    ${ctaButton(dashboardUrl, "Apri la dashboard")}
  `;
  const html = emailShell(inner);
  return sendEmail({
    to,
    subject: `Acquisto piano Evento — ${eventTitle} (${formatEur(amountCents)})`,
    html,
  });
}
