import { sendEmail } from "./emailService.js";

const CLIENT_BASE = (process.env.CLIENT_ORIGINS?.split(",")[0] || "http://localhost:5173").trim();
const SITE_URL = (process.env.PUBLIC_BASE_URL || CLIENT_BASE || "https://eenvee.com").trim().replace(/\/$/, "");
const LOGO_URL = `${SITE_URL}/logo-eenvee.svg`;

const C_ACCENT = "#1ABC9C";
const C_NAVY = "#3C4F76";
const C_BG_PAGE = "#F4ECD6";
const C_CARD = "#ffffff";

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

interface LeadParams {
  fullName: string;
  email: string;
  phone?: string;
  tier: string;
}

/**
 * Destinatari notifica interna (replica identica della logica pagamenti in donationEmails.ts)
 */
function internalMarketingNotifyRecipients(): string {
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

export async function sendProfessionalLeadNotification(params: LeadParams) {
  const { fullName, email, phone, tier } = params;
  const to = internalMarketingNotifyRecipients();

  const inner = `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 14px;color:${C_NAVY};text-align:center;">Nuova Lead Professionista</h1>
    <p style="margin:0 0 16px;color:#444;text-align:center;">
      Hai ricevuto una nuova richiesta di attivazione piano da eenvee.com.
    </p>
    <table role="presentation" width="100%" style="border-collapse:collapse;margin:20px 0;background:#f6f5f1;border-radius:8px;overflow:hidden;">
      <tr>
        <td style="padding:12px 16px;color:#666;font-size:13px;border-bottom:1px solid #e8e6df;">Nome</td>
        <td style="padding:12px 16px;text-align:right;font-weight:600;color:#1a1a1a;border-bottom:1px solid #e8e6df;">${escapeHtml(fullName)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#666;font-size:13px;border-bottom:1px solid #e8e6df;">Email</td>
        <td style="padding:12px 16px;text-align:right;font-weight:600;color:#1a1a1a;border-bottom:1px solid #e8e6df;">${escapeHtml(email)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#666;font-size:13px;border-bottom:1px solid #e8e6df;">Telefono</td>
        <td style="padding:12px 16px;text-align:right;font-weight:600;color:#1a1a1a;border-bottom:1px solid #e8e6df;">${phone ? escapeHtml(phone) : "—"}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#1a1a1a;font-weight:600;border-top:2px solid ${C_NAVY};">Piano Scelto</td>
        <td style="padding:12px 16px;text-align:right;font-weight:700;color:${C_ACCENT};font-size:16px;border-top:2px solid ${C_NAVY};">${escapeHtml(tier)}</td>
      </tr>
    </table>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#666;text-align:center;">
      Puoi ricontattare la lead direttamente cliccando sull'email sopra.
    </p>
  `;

  return sendEmail({
    to,
    subject: `Nuova lead: ${fullName} (${tier})`,
    html: emailShell(inner),
  });
}

export async function sendProfessionalWelcomeEmail(params: LeadParams) {
  const { fullName, email, tier } = params;

  const inner = `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 14px;color:${C_NAVY};text-align:center;">Benvenuto su eenvee, ${escapeHtml(fullName.split(" ")[0])}.</h1>
    <p style="margin:0 0 18px;color:#444;text-align:center;">
      Abbiamo ricevuto con piacere la tua richiesta per attivare il piano <strong>${escapeHtml(tier)}</strong> e il mese di prova gratuita.
    </p>
    <div style="background:#e8faf6;border-radius:10px;border:1px solid #c9ecdf;padding:18px;margin:24px 0;text-align:center;">
      <p style="margin:0;color:#2d4a44;font-size:14px;line-height:1.6;">
        Il nostro team analizzerà i tuoi dati e ti contatterà a breve per procedere con l'attivazione e rispondere a ogni tua domanda.
      </p>
    </div>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#666;text-align:center;">
      A presto,<br />
      <strong>Il team di eenvee</strong>
    </p>
  `;

  return sendEmail({
    to: email,
    subject: `Richiesta ricevuta - Benvenuto su eenvee`,
    html: emailShell(inner),
  });
}
