import React, { useCallback, useEffect, useMemo, useState } from "react";
import { X, Check, ArrowLeft, Loader2, Star } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiFetch } from "../../utils/apiFetch";
import { API_BASE } from "../../config/api";
import "./EventPurchaseModal.css";

const STRIPE_PUBLISHABLE_KEY = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || "";

let stripePromise: Promise<Stripe | null> | null = null;
function getStripePromise() {
  if (!stripePromise && STRIPE_PUBLISHABLE_KEY) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

const UNLOCK_EUR = 69;
const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "#888",
  marginBottom: "6px",
  display: "block",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1.5px solid #e0e0e0",
  fontSize: "14px",
  color: "#1a1a1a",
  background: "#fafafa",
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color .15s ease",
};

export interface EventPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  eventSlug: string;
  /** Riga breve di contesto (es. nome evento o template dal catalogo). */
  eventTitle: string;
  onUnlocked: (slug: string) => void;
  /** Titolo modale (catalogo o dashboard). Default: «Pagamento». */
  paymentTitle?: string;
  /** Sottotitolo sotto il titolo; se omesso si usa `eventTitle`. */
  paymentSubtitle?: string;
}

type Step = "intro" | "payment" | "success" | "error" | "dev_simulate";

function readAccentHex(): string {
  if (typeof window === "undefined") return "#1ABC9C";
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  if (!raw) return "#1ABC9C";
  if (raw.startsWith("#") && (raw.length === 4 || raw.length === 7)) return raw;
  return "#1ABC9C";
}

const EventPurchaseModal: React.FC<EventPurchaseModalProps> = ({
  open,
  onClose,
  eventSlug,
  eventTitle,
  onUnlocked,
  paymentTitle: paymentTitleProp,
  paymentSubtitle: paymentSubtitleProp,
}) => {
  const paymentTitle = paymentTitleProp?.trim() || "Pagamento";
  const paymentSubtitle = (paymentSubtitleProp ?? eventTitle).trim();
  const [step, setStep] = useState<Step>("intro");
  const [accentColor, setAccentColor] = useState("#1ABC9C");
  const [payerFirstName, setPayerFirstName] = useState("");
  const [payerLastName, setPayerLastName] = useState("");
  /** Email ricevuta Stripe: precompilata dall’account, modificabile liberamente. */
  const [receiptEmail, setReceiptEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [simulatePath, setSimulatePath] = useState<string | null>(null);
  const [showHostedFallback, setShowHostedFallback] = useState(false);
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [invoiceKind, setInvoiceKind] = useState<"private" | "professional" | "company">("private");
  const [invoiceDenomination, setInvoiceDenomination] = useState("");
  const [invoiceStreet, setInvoiceStreet] = useState("");
  const [invoiceCap, setInvoiceCap] = useState("");
  const [invoiceCity, setInvoiceCity] = useState("");
  const [invoiceProvince, setInvoiceProvince] = useState("");
  const [invoiceCfPerson, setInvoiceCfPerson] = useState("");
  const [invoiceCfCompany, setInvoiceCfCompany] = useState("");
  const [invoiceVat, setInvoiceVat] = useState("");
  const [invoiceSdi, setInvoiceSdi] = useState("");
  const [invoicePec, setInvoicePec] = useState("");

  const payerFullName = useMemo(
    () => `${payerFirstName.trim()} ${payerLastName.trim()}`.trim(),
    [payerFirstName, payerLastName]
  );

  const invoiceDenominationLabel = useMemo(() => {
    if (invoiceKind === "private") return "Nome e cognome";
    if (invoiceKind === "company") return "Ragione sociale";
    return "Nome, cognome o ragione sociale";
  }, [invoiceKind]);

  const invoiceDenominationPlaceholder = useMemo(() => {
    if (invoiceKind === "private") return "Come da documento d'identità";
    if (invoiceKind === "company") return "Come da visura camerale";
    return "Come da documentazione fiscale";
  }, [invoiceKind]);

  const reset = useCallback(() => {
    setStep("intro");
    setPayerFirstName("");
    setPayerLastName("");
    setReceiptEmail("");
    setErrors({});
    setCreating(false);
    setClientSecret(null);
    setServerError(null);
    setSimulatePath(null);
    setShowHostedFallback(false);
    setWantsInvoice(false);
    setInvoiceKind("private");
    setInvoiceDenomination("");
    setInvoiceStreet("");
    setInvoiceCap("");
    setInvoiceCity("");
    setInvoiceProvince("");
    setInvoiceCfPerson("");
    setInvoiceCfCompany("");
    setInvoiceVat("");
    setInvoiceSdi("");
    setInvoicePec("");
  }, []);

  useEffect(() => {
    if (!open) return;
    reset();
    setAccentColor(readAccentHex());
  }, [open, eventSlug, reset]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/auth/me");
        const data = await res.json();
        if (!cancelled && data?.user?.email) {
          setReceiptEmail((prev) => (prev.trim() === "" ? String(data.user.email) : prev));
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step !== "payment") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, step]);

  const validateIntro = () => {
    const errs: Record<string, string> = {};
    if (!payerFirstName.trim()) errs.firstName = "Nome richiesto";
    if (!payerLastName.trim()) errs.lastName = "Cognome richiesto";
    const em = receiptEmail.trim();
    if (!em) errs.email = "Email richiesta";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) errs.email = "Email non valida";

    if (wantsInvoice) {
      if (!invoiceDenomination.trim()) {
        errs.invoiceDenomination =
          invoiceKind === "private"
            ? "Nome e cognome richiesti"
            : invoiceKind === "company"
              ? "Ragione sociale richiesta"
              : "Nome, cognome o ragione sociale richiesto";
      }
      if (!invoiceStreet.trim()) errs.invoiceStreet = "Indirizzo richiesto";
      if (!/^\d{5}$/.test(invoiceCap.trim())) errs.invoiceCap = "CAP non valido";
      if (!invoiceCity.trim()) errs.invoiceCity = "Città richiesta";
      const pr = invoiceProvince.replace(/\s/g, "").toUpperCase();
      if (pr.length !== 2) errs.invoiceProvince = "Provincia non valida";

      const sdi = invoiceSdi.replace(/\s/g, "").toUpperCase();
      const pec = invoicePec.trim().toLowerCase();
      if (invoiceKind !== "private") {
        if (!sdi && !pec) errs.invoiceSdi = "Inserisci il codice SDI oppure una PEC";
        if (sdi && !/^[A-Z0-9]{7}$/.test(sdi)) errs.invoiceSdi = "Codice SDI non valido";
      }
      if (pec && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pec)) errs.invoicePec = "PEC non valida";

      const cfP = invoiceCfPerson.replace(/\s/g, "").toUpperCase();
      const cfC = invoiceCfCompany.replace(/\s/g, "");
      const piva = invoiceVat.replace(/\s/g, "").replace(/^IT/i, "");

      if (invoiceKind === "private") {
        if (!cfP || cfP.length !== 16 || !/^[A-Z0-9]{16}$/.test(cfP)) errs.invoiceCfPerson = "Codice fiscale non valido";
      } else if (invoiceKind === "professional") {
        if (!piva || !/^\d{11}$/.test(piva)) errs.invoiceVat = "Partita IVA non valida";
        if (!cfP || cfP.length !== 16 || !/^[A-Z0-9]{16}$/.test(cfP)) errs.invoiceCfPerson = "Codice fiscale non valido";
      } else {
        if (!piva || !/^\d{11}$/.test(piva)) errs.invoiceVat = "Partita IVA non valida";
        if (!cfC || !/^\d{11}$/.test(cfC)) errs.invoiceCfCompany = "Codice fiscale società non valido";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const startHostedCheckout = async () => {
    setServerError(null);
    setCreating(true);
    try {
      const res = await apiFetch("/api/subscriptions/checkout", {
        method: "POST",
        body: JSON.stringify({ eventSlug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Checkout non disponibile");
      if (data.url) window.location.href = data.url;
      else throw new Error("URL mancante");
    } catch (e: any) {
      setServerError(e.message || "Errore");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateIntent = async () => {
    if (!validateIntro()) return;
    setCreating(true);
    setServerError(null);
    setShowHostedFallback(false);
    try {
      const body: Record<string, unknown> = {
        eventSlug,
        receiptEmail: receiptEmail.trim().toLowerCase(),
        payerName: payerFullName,
      };
      if (wantsInvoice) {
        body.invoiceRequested = true;
        body.invoiceKind = invoiceKind;
        body.invoiceDenomination = invoiceDenomination.trim();
        body.invoiceStreet = invoiceStreet.trim();
        body.invoiceCap = invoiceCap.trim();
        body.invoiceCity = invoiceCity.trim();
        body.invoiceProvince = invoiceProvince.replace(/\s/g, "").toUpperCase().slice(0, 2);
        const pec = invoicePec.trim().toLowerCase();
        if (pec) body.invoicePec = pec;
        if (invoiceKind !== "private") {
          const sdi = invoiceSdi.replace(/\s/g, "").toUpperCase();
          if (sdi) body.invoiceSdi = sdi;
        }
        if (invoiceKind === "private") {
          body.invoiceCfPerson = invoiceCfPerson.replace(/\s/g, "").toUpperCase();
        } else if (invoiceKind === "professional") {
          body.invoiceVat = invoiceVat.replace(/\s/g, "").replace(/^IT/i, "");
          body.invoiceCfPerson = invoiceCfPerson.replace(/\s/g, "").toUpperCase();
        } else {
          body.invoiceVat = invoiceVat.replace(/\s/g, "").replace(/^IT/i, "");
          body.invoiceCfCompany = invoiceCfCompany.replace(/\s/g, "");
        }
      }

      const res = await apiFetch("/api/subscriptions/create-unlock-intent", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 503 && data.code === "STRIPE_UNAVAILABLE") {
        setShowHostedFallback(true);
        setServerError(
          data.message ||
            "Pagamento integrato non disponibile. Puoi usare il checkout Stripe classico oppure completare la configurazione nel server."
        );
        setCreating(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Errore creazione pagamento");
      }

      if (data.mode === "dev_simulate" && data.simulatePath) {
        setSimulatePath(String(data.simulatePath));
        setStep("dev_simulate");
        setCreating(false);
        return;
      }

      if (data.mode === "elements" && data.clientSecret) {
        setClientSecret(String(data.clientSecret));
        setStep("payment");
        setCreating(false);
        return;
      }

      throw new Error("Risposta server non valida");
    } catch (err: any) {
      setServerError(err.message);
      setCreating(false);
    }
  };

  const formattedPrice = useMemo(
    () =>
      UNLOCK_EUR.toLocaleString("it-IT", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    []
  );

  const elementsAppearance = useMemo(
    () => ({
      theme: "flat" as const,
      variables: {
        colorPrimary: accentColor,
        colorBackground: "#ffffff",
        colorText: "#1a1a1a",
        fontFamily: "system-ui, sans-serif",
        borderRadius: "10px",
      },
      rules: {
        ".Tab": {
          paddingBottom: "26px",
        },
      },
    }),
    [accentColor]
  );

  const stripeP = getStripePromise();

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="event-purchase-modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(10, 10, 15, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== "payment") onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #eaeaea",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {step === "payment" && (
              <button
                type="button"
                aria-label="Indietro"
                onClick={() => {
                  setStep("intro");
                  setClientSecret(null);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex" }}
              >
                <ArrowLeft size={20} color="#555" />
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: 700, color: "#1a1a1a" }}>
              <Star size={20} color={accentColor} fill={`${accentColor}33`} strokeWidth={2} />
              {step === "success" ? "Fatto!" : paymentTitle}
            </div>
          </div>
          <button
            type="button"
            aria-label="Chiudi"
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex" }}
          >
            <X size={20} color="#555" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {step === "intro" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleCreateIntent();
              }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {paymentSubtitle ? (
                <p style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a", margin: 0, lineHeight: 1.35 }}>{paymentSubtitle}</p>
              ) : null}

              <p style={{ fontSize: "13px", color: "#666", margin: 0, lineHeight: 1.45 }}>
                Dopo il pagamento potrai personalizzare <strong>invito</strong>, <strong>busta</strong> e <strong>pagina evento</strong> dal tuo account.
              </p>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {["Un solo addebito, nessun abbonamento", "Accesso immediato alle funzioni del piano Evento"].map((line) => (
                  <li
                    key={line}
                    style={{
                      fontSize: "12px",
                      color: "#555",
                      lineHeight: 1.4,
                      paddingLeft: "14px",
                      position: "relative",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "0.05em",
                        color: accentColor,
                        fontWeight: 800,
                        fontSize: "14px",
                        lineHeight: 1,
                      }}
                    >
                      ·
                    </span>
                    {line}
                  </li>
                ))}
              </ul>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: `${accentColor}10`,
                  border: `1px solid ${accentColor}30`,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#888" }}>
                    Una tantum
                  </span>
                  <strong style={{ fontSize: "22px", color: accentColor, lineHeight: 1 }}>{formattedPrice}</strong>
                </div>
              </div>

              <div className="event-purchase-modal__name-row">
                <div>
                  <label style={labelStyle}>Nome</label>
                  <input
                    type="text"
                    value={payerFirstName}
                    onChange={(e) => setPayerFirstName(e.target.value)}
                    maxLength={60}
                    style={{ ...inputStyle, borderColor: errors.firstName ? "#c0392b" : "#e0e0e0" }}
                    placeholder="Maria"
                    autoComplete="given-name"
                  />
                  {errors.firstName ? (
                    <div style={{ fontSize: "12px", color: "#c0392b", marginTop: "4px" }}>{errors.firstName}</div>
                  ) : null}
                </div>
                <div>
                  <label style={labelStyle}>Cognome</label>
                  <input
                    type="text"
                    value={payerLastName}
                    onChange={(e) => setPayerLastName(e.target.value)}
                    maxLength={60}
                    style={{ ...inputStyle, borderColor: errors.lastName ? "#c0392b" : "#e0e0e0" }}
                    placeholder="Rossi"
                    autoComplete="family-name"
                  />
                  {errors.lastName ? (
                    <div style={{ fontSize: "12px", color: "#c0392b", marginTop: "4px" }}>{errors.lastName}</div>
                  ) : null}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email (ricevuta)</label>
                <input
                  type="email"
                  value={receiptEmail}
                  onChange={(e) => setReceiptEmail(e.target.value)}
                  maxLength={200}
                  style={{ ...inputStyle, borderColor: errors.email ? "#c0392b" : "#e0e0e0" }}
                  placeholder="nome@email.com"
                  autoComplete="email"
                />
                {errors.email ? <div style={{ fontSize: "12px", color: "#c0392b", marginTop: "4px" }}>{errors.email}</div> : null}
                <div style={{ fontSize: "11px", color: "#888", marginTop: "6px" }}>Può essere diversa dall&apos;account di login.</div>
              </div>

              <label
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#1a1a1a",
                  fontWeight: 600,
                }}
              >
                <input
                  type="checkbox"
                  checked={wantsInvoice}
                  onChange={(e) => {
                    const on = e.target.checked;
                    setWantsInvoice(on);
                    if (on) {
                      const auto = `${payerFirstName.trim()} ${payerLastName.trim()}`.trim();
                      if (auto) setInvoiceDenomination(auto);
                    } else {
                      setInvoiceKind("private");
                      setInvoiceDenomination("");
                      setInvoiceStreet("");
                      setInvoiceCap("");
                      setInvoiceCity("");
                      setInvoiceProvince("");
                      setInvoiceCfPerson("");
                      setInvoiceCfCompany("");
                      setInvoiceVat("");
                      setInvoiceSdi("");
                      setInvoicePec("");
                      setErrors({});
                    }
                  }}
                  style={{ width: "17px", height: "17px", accentColor }}
                />
                Hai bisogno di fattura?
              </label>

              {wantsInvoice ? (
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "10px",
                    border: "1px solid #e0e0e0",
                    background: "#fafafa",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
                    <legend style={{ ...labelStyle, marginBottom: "8px" }}>Chi fattura</legend>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {(
                        [
                          ["private", "Persona fisica"],
                          ["professional", "Libero professionista o ditta individuale"],
                          ["company", "Società o altra impresa con P.IVA"],
                        ] as const
                      ).map(([id, lab]) => (
                        <label
                          key={id}
                          style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", color: "#444", cursor: "pointer" }}
                        >
                          <input
                            type="radio"
                            name="inv-kind"
                            checked={invoiceKind === id}
                            onChange={() => {
                              setInvoiceKind(id);
                              if (id === "private") {
                                setInvoiceVat("");
                                setInvoiceCfCompany("");
                              } else if (id === "professional") {
                                setInvoiceCfCompany("");
                              } else {
                                setInvoiceCfPerson("");
                              }
                            }}
                          />
                          {lab}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <label style={labelStyle}>{invoiceDenominationLabel}</label>
                    <input
                      type="text"
                      value={invoiceDenomination}
                      onChange={(e) => setInvoiceDenomination(e.target.value)}
                      maxLength={120}
                      style={{ ...inputStyle, borderColor: errors.invoiceDenomination ? "#c0392b" : "#e0e0e0" }}
                      placeholder={invoiceDenominationPlaceholder}
                      autoComplete="organization"
                    />
                    {errors.invoiceDenomination ? (
                      <div style={{ fontSize: "12px", color: "#c0392b", marginTop: "4px" }}>{errors.invoiceDenomination}</div>
                    ) : null}
                  </div>

                  <div>
                    <label style={labelStyle}>Indirizzo</label>
                    <input
                      type="text"
                      value={invoiceStreet}
                      onChange={(e) => setInvoiceStreet(e.target.value)}
                      maxLength={100}
                      style={{ ...inputStyle, borderColor: errors.invoiceStreet ? "#c0392b" : "#e0e0e0", marginBottom: "8px" }}
                      placeholder="Via e numero civico"
                      autoComplete="street-address"
                    />
                    <div className="event-purchase-modal__addr-row">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={invoiceCap}
                        onChange={(e) => setInvoiceCap(e.target.value.replace(/\D/g, "").slice(0, 5))}
                        maxLength={5}
                        style={{ ...inputStyle, borderColor: errors.invoiceCap ? "#c0392b" : "#e0e0e0" }}
                        placeholder="CAP"
                        autoComplete="postal-code"
                      />
                      <input
                        type="text"
                        value={invoiceCity}
                        onChange={(e) => setInvoiceCity(e.target.value)}
                        maxLength={80}
                        style={{ ...inputStyle, borderColor: errors.invoiceCity ? "#c0392b" : "#e0e0e0" }}
                        placeholder="Città"
                        autoComplete="address-level2"
                      />
                      <input
                        type="text"
                        value={invoiceProvince}
                        onChange={(e) => setInvoiceProvince(e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2))}
                        maxLength={2}
                        style={{
                          ...inputStyle,
                          borderColor: errors.invoiceProvince ? "#c0392b" : "#e0e0e0",
                          maxWidth: "64px",
                        }}
                        placeholder="Prov."
                        autoComplete="address-level1"
                      />
                    </div>
                    {(errors.invoiceCap || errors.invoiceCity || errors.invoiceProvince) && (
                      <div style={{ fontSize: "12px", color: "#c0392b", marginTop: "4px" }}>
                        {errors.invoiceCap || errors.invoiceCity || errors.invoiceProvince}
                      </div>
                    )}
                  </div>

                  {invoiceKind === "private" ? (
                    <div>
                      <label style={labelStyle}>Codice fiscale</label>
                      <input
                        type="text"
                        value={invoiceCfPerson}
                        onChange={(e) => setInvoiceCfPerson(e.target.value.toUpperCase().slice(0, 16))}
                        maxLength={16}
                        style={{ ...inputStyle, borderColor: errors.invoiceCfPerson ? "#c0392b" : "#e0e0e0" }}
                        placeholder="Es. RSSMRA85M01H501Z"
                        autoComplete="off"
                      />
                      {errors.invoiceCfPerson ? (
                        <div style={{ fontSize: "12px", color: "#c0392b", marginTop: "4px" }}>{errors.invoiceCfPerson}</div>
                      ) : null}
                    </div>
                  ) : null}

                  {invoiceKind === "private" ? (
                    <div>
                      <label style={labelStyle}>PEC (facoltativa)</label>
                      <input
                        type="email"
                        value={invoicePec}
                        onChange={(e) => setInvoicePec(e.target.value)}
                        maxLength={200}
                        style={{ ...inputStyle, borderColor: errors.invoicePec ? "#c0392b" : "#e0e0e0" }}
                        placeholder="nome@pec.it"
                        autoComplete="off"
                      />
                      <p style={{ fontSize: "11px", color: "#888", margin: "6px 0 0", lineHeight: 1.4 }}>
                        Solo se vuoi ricevere la fattura su una casella certificata diversa dall&apos;email della ricevuta.
                      </p>
                      {errors.invoicePec ? (
                        <div style={{ fontSize: "12px", color: "#c0392b", marginTop: "4px" }}>{errors.invoicePec}</div>
                      ) : null}
                    </div>
                  ) : null}

                  {invoiceKind === "professional" ? (
                    <>
                      <div>
                        <label style={labelStyle}>Partita IVA</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={invoiceVat}
                          onChange={(e) => setInvoiceVat(e.target.value.replace(/\D/g, "").slice(0, 11))}
                          maxLength={11}
                          style={{ ...inputStyle, borderColor: errors.invoiceVat ? "#c0392b" : "#e0e0e0" }}
                          placeholder="Partita IVA"
                          autoComplete="off"
                        />
                        {errors.invoiceVat ? (
                          <div style={{ fontSize: "12px", color: "#c0392b", marginTop: "4px" }}>{errors.invoiceVat}</div>
                        ) : null}
                      </div>
                      <div>
                        <label style={labelStyle}>Codice fiscale (persona)</label>
                        <input
                          type="text"
                          value={invoiceCfPerson}
                          onChange={(e) => setInvoiceCfPerson(e.target.value.toUpperCase().slice(0, 16))}
                          maxLength={16}
                          style={{ ...inputStyle, borderColor: errors.invoiceCfPerson ? "#c0392b" : "#e0e0e0" }}
                          placeholder="Es. RSSMRA85M01H501Z"
                          autoComplete="off"
                        />
                        {errors.invoiceCfPerson ? (
                          <div style={{ fontSize: "12px", color: "#c0392b", marginTop: "4px" }}>{errors.invoiceCfPerson}</div>
                        ) : null}
                      </div>
                    </>
                  ) : null}

                  {invoiceKind === "company" ? (
                    <>
                      <div>
                        <label style={labelStyle}>Partita IVA</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={invoiceVat}
                          onChange={(e) => setInvoiceVat(e.target.value.replace(/\D/g, "").slice(0, 11))}
                          maxLength={11}
                          style={{ ...inputStyle, borderColor: errors.invoiceVat ? "#c0392b" : "#e0e0e0" }}
                          placeholder="Partita IVA"
                          autoComplete="off"
                        />
                        {errors.invoiceVat ? (
                          <div style={{ fontSize: "12px", color: "#c0392b", marginTop: "4px" }}>{errors.invoiceVat}</div>
                        ) : null}
                      </div>
                      <div>
                        <label style={labelStyle}>Codice fiscale società</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={invoiceCfCompany}
                          onChange={(e) => setInvoiceCfCompany(e.target.value.replace(/\D/g, "").slice(0, 11))}
                          maxLength={11}
                          style={{ ...inputStyle, borderColor: errors.invoiceCfCompany ? "#c0392b" : "#e0e0e0" }}
                          placeholder="Codice fiscale aziendale"
                          autoComplete="off"
                        />
                        {errors.invoiceCfCompany ? (
                          <div style={{ fontSize: "12px", color: "#c0392b", marginTop: "4px" }}>{errors.invoiceCfCompany}</div>
                        ) : null}
                      </div>
                    </>
                  ) : null}

                  {invoiceKind !== "private" ? (
                    <div>
                      <label style={labelStyle}>Recapito fattura elettronica</label>
                      <p style={{ fontSize: "11px", color: "#777", margin: "0 0 8px", lineHeight: 1.4 }}>
                        Inserisci il <strong>codice SDI</strong> oppure una <strong>PEC</strong> di recapito: serve almeno uno dei due.
                      </p>
                      <input
                        type="text"
                        value={invoiceSdi}
                        onChange={(e) => setInvoiceSdi(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7))}
                        maxLength={7}
                        style={{ ...inputStyle, borderColor: errors.invoiceSdi ? "#c0392b" : "#e0e0e0", marginBottom: "8px" }}
                        placeholder="Codice SDI"
                        autoComplete="off"
                      />
                      <input
                        type="email"
                        value={invoicePec}
                        onChange={(e) => setInvoicePec(e.target.value)}
                        maxLength={200}
                        style={{ ...inputStyle, borderColor: errors.invoicePec ? "#c0392b" : "#e0e0e0" }}
                        placeholder="PEC di recapito"
                        autoComplete="off"
                      />
                      {(errors.invoiceSdi || errors.invoicePec) && (
                        <div style={{ fontSize: "12px", color: "#c0392b", marginTop: "4px" }}>{errors.invoiceSdi || errors.invoicePec}</div>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {serverError ? (
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#fdecea",
                    color: "#c0392b",
                    fontSize: "13px",
                    lineHeight: 1.45,
                  }}
                >
                  {serverError}
                </div>
              ) : null}

              {showHostedFallback ? (
                <button
                  type="button"
                  onClick={() => void startHostedCheckout()}
                  disabled={creating}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "999px",
                    border: `1.5px solid ${accentColor}`,
                    background: "transparent",
                    color: accentColor,
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: creating ? "wait" : "pointer",
                  }}
                >
                  Checkout Stripe (esterno)
                </button>
              ) : null}

              <button
                type="submit"
                disabled={creating}
                style={{
                  padding: "14px 24px",
                  borderRadius: "999px",
                  border: "none",
                  background: accentColor,
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: creating ? "wait" : "pointer",
                  opacity: creating ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {creating ? (
                  <>
                    <Loader2 size={16} className="event-purchase-modal__spin" />
                    Preparo il pagamento…
                  </>
                ) : (
                  "Continua al pagamento"
                )}
              </button>

              <div style={{ fontSize: "11px", color: "#888", textAlign: "center", lineHeight: 1.5 }}>
                Pagamento sicuro via Stripe · carta, Apple Pay, Google Pay, SEPA.
                <br />
                eenvee non conserva i dati della tua carta.
              </div>
            </form>
          )}

          {step === "dev_simulate" && simulatePath && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ fontSize: "13px", color: "#666", margin: 0, lineHeight: 1.5 }}>
                In questa modalità puoi completare l&apos;attivazione senza addebito.
              </p>
              <button
                type="button"
                onClick={() => {
                  window.location.href = `${API_BASE}${simulatePath}`;
                }}
                style={{
                  padding: "14px 24px",
                  borderRadius: "999px",
                  border: "none",
                  background: accentColor,
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Continua
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "10px 20px",
                  borderRadius: "999px",
                  border: "1px solid #ddd",
                  background: "#fafafa",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Annulla
              </button>
            </div>
          )}

          {step === "payment" && clientSecret && stripeP && (
            <Elements
              stripe={stripeP}
              options={{
                clientSecret,
                locale: "it",
                appearance: elementsAppearance,
              }}
            >
              <UnlockPaymentStep
                accentColor={accentColor}
                payerName={payerFullName}
                payerEmail={receiptEmail.trim()}
                formattedPrice={formattedPrice}
                onSuccess={() => {
                  onUnlocked(eventSlug);
                  setStep("success");
                }}
                onError={(msg) => {
                  setServerError(msg);
                  setStep("error");
                }}
              />
            </Elements>
          )}

          {step === "payment" && !stripeP && (
            <div style={{ textAlign: "center", padding: "24px", color: "#c0392b" }}>
              Stripe non configurato nel client (VITE_STRIPE_PUBLISHABLE_KEY).
            </div>
          )}

          {step === "success" && (
            <div style={{ textAlign: "center", padding: "16px 8px" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: `${accentColor}1A`,
                  border: `2px solid ${accentColor}`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <Check size={36} color={accentColor} strokeWidth={3} />
              </div>
              <h3 style={{ fontSize: "22px", margin: "0 0 12px", color: "#1a1a1a", fontFamily: "serif" }}>Grazie!</h3>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6, margin: "0 0 16px" }}>
                Piano Evento attivo. Puoi continuare a modificare l&apos;invito.
              </p>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "12px 32px",
                  borderRadius: "999px",
                  border: "none",
                  background: accentColor,
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Chiudi
              </button>
            </div>
          )}

          {step === "error" && (
            <div style={{ textAlign: "center", padding: "16px 8px" }}>
              <h3 style={{ fontSize: "18px", margin: "0 0 12px", color: "#c0392b" }}>Qualcosa è andato storto</h3>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6, margin: "0 0 20px" }}>
                {serverError || "Il pagamento non è andato a buon fine. Puoi riprovare."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep("intro");
                  setClientSecret(null);
                  setServerError(null);
                }}
                style={{
                  padding: "12px 24px",
                  borderRadius: "999px",
                  border: `1.5px solid ${accentColor}`,
                  background: "transparent",
                  color: accentColor,
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Riprova
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface UnlockPaymentStepProps {
  accentColor: string;
  payerName: string;
  payerEmail: string;
  formattedPrice: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

const UnlockPaymentStep: React.FC<UnlockPaymentStepProps> = ({
  accentColor,
  payerName,
  payerEmail,
  formattedPrice,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [activeMethod, setActiveMethod] = useState<string>("card");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: window.location.href,
        payment_method_data: {
          billing_details: {
            name: payerName,
            email: payerEmail,
          },
        },
      },
    });

    if (error) {
      onError(error.message || "Pagamento non completato");
      setSubmitting(false);
      return;
    }

    if (!paymentIntent?.id) {
      onError("Risposta pagamento non valida");
      setSubmitting(false);
      return;
    }

    if (paymentIntent.status !== "succeeded" && paymentIntent.status !== "processing") {
      onError("Stato pagamento inatteso. Controlla la tua email per aggiornamenti.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await apiFetch("/api/subscriptions/complete-unlock-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onError(data.message || "Impossibile confermare lo sblocco. Contatta l'assistenza con l'ID pagamento.");
        setSubmitting(false);
        return;
      }
      onSuccess();
    } catch {
      onError("Errore di rete durante la conferma. Verifica dalla dashboard se l'evento risulta attivato.");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "10px",
          background: `${accentColor}10`,
          border: `1px solid ${accentColor}30`,
          fontSize: "14px",
          color: "#1a1a1a",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Stai inviando</span>
        <strong style={{ fontSize: "18px", color: accentColor }}>{formattedPrice}</strong>
      </div>

      <div style={{ position: "relative" }}>
        <PaymentElement
          onChange={(ev) => {
            const t = ev?.value?.type;
            if (t) setActiveMethod(t);
          }}
          options={{
            layout: "tabs",
            wallets: { link: "never" as any },
            fields: {
              billingDetails: {
                name: "never",
                email: "never",
              },
            },
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "56px",
            left: 0,
            right: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            pointerEvents: "none",
            fontSize: "10.5px",
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "0.01em",
            justifyItems: "stretch",
          }}
        >
          <div
            style={{
              color: activeMethod === "card" ? "rgba(255,255,255,0.92)" : "#999",
              transition: "color .15s ease",
              width: "100%",
              boxSizing: "border-box",
              textAlign: "left",
              paddingLeft: "16px",
              paddingRight: "6px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            inclusi Apple Pay e Google Pay
          </div>
          <div
            style={{
              color: activeMethod === "sepa_debit" ? "rgba(255,255,255,0.92)" : "#999",
              transition: "color .15s ease",
              width: "100%",
              boxSizing: "border-box",
              textAlign: "left",
              paddingLeft: "16px",
              paddingRight: "6px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            paga con il tuo IBAN
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        style={{
          padding: "14px 24px",
          borderRadius: "999px",
          border: "none",
          background: accentColor,
          color: "#ffffff",
          fontSize: "15px",
          fontWeight: 700,
          cursor: submitting ? "wait" : "pointer",
          opacity: submitting ? 0.7 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="event-purchase-modal__spin" />
            Elaborazione…
          </>
        ) : (
          `Paga ${formattedPrice}`
        )}
      </button>
    </form>
  );
};

export default EventPurchaseModal;
