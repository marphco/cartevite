import React, { useEffect, useMemo, useState } from 'react';
import { X, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiFetch } from '../../utils/apiFetch';

const STRIPE_PUBLISHABLE_KEY = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise: Promise<Stripe | null> | null = null;
function getStripePromise() {
  if (!stripePromise && STRIPE_PUBLISHABLE_KEY) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

interface DonationModalProps {
  open: boolean;
  onClose: () => void;
  eventSlug: string;
  eventTitle: string;
  presetAmounts?: number[];
  defaultAmount?: number;
  minAmount?: number;
  maxAmount?: number;
  accentColor?: string;
  mode?: 'gift' | 'donation';
  thankYouMessage?: string;
  allowCustomAmount?: boolean;
}

type Step = 'amount' | 'payment' | 'success' | 'error';

const DonationModal: React.FC<DonationModalProps> = ({
  open,
  onClose,
  eventSlug,
  eventTitle,
  presetAmounts = [25, 50, 100, 200],
  defaultAmount,
  minAmount = 1,
  maxAmount = 5000,
  accentColor = '#1a1a1a',
  mode = 'gift',
  thankYouMessage,
  allowCustomAmount = true,
}) => {
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState<string>(defaultAmount ? String(defaultAmount) : '');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorMessage, setDonorMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep('amount');
    setAmount(defaultAmount ? String(defaultAmount) : '');
    setDonorName('');
    setDonorEmail('');
    setDonorMessage('');
    setErrors({});
    setClientSecret(null);
    setServerError(null);
  }, [open, defaultAmount]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'payment') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, step]);

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < minAmount) {
      errs.amount = `Importo minimo ${minAmount}€`;
    } else if (amt > maxAmount) {
      errs.amount = `Importo massimo ${maxAmount}€`;
    }
    if (!donorName.trim()) errs.name = 'Nome richiesto';
    if (!donorEmail.trim()) {
      errs.email = 'Email richiesta';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail.trim())) {
      errs.email = 'Email non valida';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceed = async () => {
    if (!validateStep1()) return;
    setCreating(true);
    setServerError(null);
    try {
      const res = await apiFetch('/api/donations/create-intent', {
        method: 'POST',
        body: JSON.stringify({
          eventSlug,
          amount: Math.round(Number(amount) * 100),
          donor: {
            name: donorName.trim(),
            email: donorEmail.trim().toLowerCase(),
            message: donorMessage.trim(),
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Errore creazione pagamento');
      }
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setStep('payment');
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  const stripeP = getStripePromise();

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10, 10, 15, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && step !== 'payment') onClose(); }}
    >
      <div style={{
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #eaeaea',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {step === 'payment' && (
              <button
                type="button"
                aria-label="Indietro"
                onClick={() => { setStep('amount'); setClientSecret(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
              >
                <ArrowLeft size={20} color="#555" />
              </button>
            )}
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>
              {step === 'success' ? 'Grazie!' : mode === 'donation' ? 'Fai una donazione' : 'Fai un regalo'}
            </div>
          </div>
          <button
            type="button"
            aria-label="Chiudi"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
          >
            <X size={20} color="#555" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {step === 'amount' && (
            <AmountStep
              eventTitle={eventTitle}
              amount={amount}
              setAmount={setAmount}
              presetAmounts={presetAmounts}
              donorName={donorName}
              setDonorName={setDonorName}
              donorEmail={donorEmail}
              setDonorEmail={setDonorEmail}
              donorMessage={donorMessage}
              setDonorMessage={setDonorMessage}
              errors={errors}
              accentColor={accentColor}
              mode={mode}
              creating={creating}
              serverError={serverError}
              onSubmit={handleProceed}
              allowCustomAmount={allowCustomAmount}
              minAmount={minAmount}
              maxAmount={maxAmount}
            />
          )}

          {step === 'payment' && clientSecret && stripeP && (
            <Elements
              stripe={stripeP}
              options={{
                clientSecret,
                // Forziamo italiano così i testi dei metodi ("Addebito SEPA"
                // al posto di "SEPA Debit", "Carta" al posto di "Card", il
                // mandato SEPA tradotto, ecc.) e i messaggi di errore sono
                // tutti in lingua per l'utente italiano.
                locale: 'it',
                appearance: {
                  theme: 'flat',
                  variables: {
                    colorPrimary: accentColor,
                    colorBackground: '#ffffff',
                    colorText: '#1a1a1a',
                    fontFamily: 'system-ui, sans-serif',
                    borderRadius: '10px',
                  },
                  // Aumentiamo il padding inferiore delle tab Stripe così
                  // si crea uno spazio bianco DENTRO ciascun "pulsante"
                  // dove sovrapponiamo (con position: absolute nel parent)
                  // un sub-label custom. Le tab restano cliccabili, il
                  // sub-label ha pointer-events: none.
                  rules: {
                    '.Tab': {
                      paddingBottom: '26px',
                    },
                  },
                },
              }}
            >
              <PaymentStep
                accentColor={accentColor}
                amount={Number(amount)}
                donorName={donorName}
                donorEmail={donorEmail}
                onSuccess={() => setStep('success')}
                onError={(msg) => { setServerError(msg); setStep('error'); }}
              />
            </Elements>
          )}

          {step === 'payment' && !stripeP && (
            <div style={{ textAlign: 'center', padding: '24px', color: '#c0392b' }}>
              Stripe non configurato. Contatta l'assistenza.
            </div>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div style={{
                width: '72px', height: '72px',
                borderRadius: '50%',
                background: `${accentColor}1A`,
                border: `2px solid ${accentColor}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <Check size={36} color={accentColor} strokeWidth={3} />
              </div>
              <h3 style={{ fontSize: '22px', margin: '0 0 12px', color: '#1a1a1a', fontFamily: 'serif' }}>
                {mode === 'donation' ? 'Grazie per la tua donazione' : 'Il tuo regalo è stato inviato'}
              </h3>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, margin: '0 0 16px' }}>
                {thankYouMessage || 'Ti abbiamo inviato una ricevuta via email. Il destinatario riceverà una notifica del tuo gesto.'}
              </p>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '12px 32px',
                  borderRadius: '999px',
                  border: 'none',
                  background: accentColor,
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Chiudi
              </button>
            </div>
          )}

          {step === 'error' && (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <h3 style={{ fontSize: '18px', margin: '0 0 12px', color: '#c0392b' }}>
                Qualcosa è andato storto
              </h3>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, margin: '0 0 20px' }}>
                {serverError || 'Il pagamento non è andato a buon fine. Puoi riprovare.'}
              </p>
              <button
                type="button"
                onClick={() => { setStep('amount'); setClientSecret(null); setServerError(null); }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '999px',
                  border: `1.5px solid ${accentColor}`,
                  background: 'transparent',
                  color: accentColor,
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
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

interface AmountStepProps {
  eventTitle: string;
  amount: string;
  setAmount: (v: string) => void;
  presetAmounts: number[];
  donorName: string;
  setDonorName: (v: string) => void;
  donorEmail: string;
  setDonorEmail: (v: string) => void;
  donorMessage: string;
  setDonorMessage: (v: string) => void;
  errors: Record<string, string>;
  accentColor: string;
  mode: 'gift' | 'donation';
  creating: boolean;
  serverError: string | null;
  onSubmit: () => void;
  allowCustomAmount: boolean;
  minAmount: number;
  maxAmount: number;
}

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#888',
  marginBottom: '6px',
  display: 'block',
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1.5px solid #e0e0e0',
  fontSize: '14px',
  color: '#1a1a1a',
  background: '#fafafa',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color .15s ease',
};

const AmountStep: React.FC<AmountStepProps> = ({
  eventTitle, amount, setAmount, presetAmounts, donorName, setDonorName,
  donorEmail, setDonorEmail, donorMessage, setDonorMessage, errors,
  accentColor, mode, creating, serverError, onSubmit,
  allowCustomAmount, minAmount, maxAmount,
}) => {
  // Se il donatore ha già scelto un importo valido sul widget in pagina, mostriamo
  // solo un riepilogo compatto con link "Modifica". Evita la ripetizione a cascata
  // (griglia sul widget → griglia+input nel modal → riepilogo su Stripe step).
  const numericAmount = Number(amount);
  const hasValidInitialAmount = Number.isFinite(numericAmount) && numericAmount >= minAmount && numericAmount <= maxAmount;
  const [editingAmount, setEditingAmount] = useState(!hasValidInitialAmount);
  const showSelector = editingAmount || !hasValidInitialAmount;

  // Stato locale separato per il campo "importo personalizzato": è la fonte
  // di verità mentre l'utente sta digitando. Evita il bug in cui scrivendo
  // "500" il campo si svuotava al passaggio per "50" (che è un preset) e
  // selezionava visivamente il pulsante preset. Si inizializza col valore
  // corrente SOLO se non coincide con un preset.
  const initialCustom = (Number.isFinite(numericAmount) && !presetAmounts.includes(numericAmount)) ? String(numericAmount) : '';
  const [customInput, setCustomInput] = useState<string>(initialCustom);
  // Il preset è "attivo" solo se l'utente NON sta usando il campo custom.
  const isCustomMode = customInput.length > 0;

  const formattedAmount = Number.isFinite(numericAmount)
    ? numericAmount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : '';

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <p style={{ fontSize: '13px', color: '#666', margin: 0, lineHeight: 1.5 }}>
        Il tuo regalo per <strong style={{ color: '#1a1a1a' }}>{eventTitle}</strong>.
      </p>

      <div>
        {showSelector ? (
          <>
            <label style={labelStyle}>Scegli un importo</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: allowCustomAmount ? '14px' : 0 }}>
              {presetAmounts.map((amt) => {
                const active = !isCustomMode && Number(amount) === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setCustomInput('');
                      setAmount(String(amt));
                      setEditingAmount(false);
                    }}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '8px',
                      border: `1.5px solid ${active ? accentColor : '#e0e0e0'}`,
                      background: active ? `${accentColor}15` : '#fafafa',
                      color: '#1a1a1a',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {amt}€
                  </button>
                );
              })}
            </div>
            {allowCustomAmount && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 10px' }}>
                  <div style={{ flex: 1, height: '1px', background: '#eaeaea' }} />
                  <span style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                    oppure
                  </span>
                  <div style={{ flex: 1, height: '1px', background: '#eaeaea' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min={minAmount}
                    max={maxAmount}
                    step={1}
                    value={customInput}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 5);
                      setCustomInput(raw);
                      setAmount(raw);
                    }}
                    placeholder="Scegli tu l'importo"
                    style={{
                      ...inputStyle,
                      paddingRight: '40px',
                      borderColor: errors.amount ? '#c0392b' : (isCustomMode ? accentColor : '#e0e0e0'),
                      background: isCustomMode ? `${accentColor}12` : '#fafafa',
                      fontWeight: isCustomMode ? 700 : 400,
                      transition: 'border-color .15s ease, background .15s ease',
                    }}
                  />
                  <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: isCustomMode ? accentColor : '#888', fontSize: '14px', fontWeight: isCustomMode ? 700 : 400 }}>€</span>
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: '10px',
            background: `${accentColor}10`,
            border: `1px solid ${accentColor}30`,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>
                Il tuo regalo
              </span>
              <strong style={{ fontSize: '22px', color: accentColor, lineHeight: 1 }}>
                {formattedAmount}
              </strong>
            </div>
            <button
              type="button"
              onClick={() => setEditingAmount(true)}
              style={{
                padding: '8px 14px',
                borderRadius: '999px',
                border: `1px solid ${accentColor}40`,
                background: 'transparent',
                color: accentColor,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Modifica
            </button>
          </div>
        )}
        {errors.amount && <div style={{ fontSize: '12px', color: '#c0392b', marginTop: '4px' }}>{errors.amount}</div>}
      </div>

      <div>
        <label style={labelStyle}>Il tuo nome</label>
        <input
          type="text"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          maxLength={120}
          style={{ ...inputStyle, borderColor: errors.name ? '#c0392b' : '#e0e0e0' }}
          placeholder="Es: Maria Rossi"
        />
        {errors.name && <div style={{ fontSize: '12px', color: '#c0392b', marginTop: '4px' }}>{errors.name}</div>}
      </div>

      <div>
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          value={donorEmail}
          onChange={(e) => setDonorEmail(e.target.value)}
          maxLength={200}
          style={{ ...inputStyle, borderColor: errors.email ? '#c0392b' : '#e0e0e0' }}
          placeholder="maria@email.com"
          autoComplete="email"
        />
        {errors.email && <div style={{ fontSize: '12px', color: '#c0392b', marginTop: '4px' }}>{errors.email}</div>}
        <div style={{ fontSize: '11px', color: '#888', marginTop: '6px' }}>
          Ti useremo solo per inviarti la ricevuta.
        </div>
      </div>

      <div>
        <label style={labelStyle}>Messaggio (opzionale)</label>
        <textarea
          value={donorMessage}
          onChange={(e) => setDonorMessage(e.target.value)}
          maxLength={300}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          placeholder={mode === 'donation' ? 'Un messaggio di sostegno…' : 'Tanti auguri…'}
        />
        <div style={{ fontSize: '11px', color: '#888', marginTop: '4px', textAlign: 'right' }}>
          {donorMessage.length}/300
        </div>
      </div>

      {serverError && (
        <div style={{ padding: '12px', borderRadius: '8px', background: '#fdecea', color: '#c0392b', fontSize: '13px' }}>
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={creating}
        style={{
          padding: '14px 24px',
          borderRadius: '999px',
          border: 'none',
          background: accentColor,
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: 700,
          cursor: creating ? 'wait' : 'pointer',
          opacity: creating ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        {creating ? <><Loader2 size={16} className="spin" /> Preparo il pagamento…</> : 'Continua al pagamento'}
      </button>

      <div style={{ fontSize: '10px', color: '#888', textAlign: 'center', letterSpacing: '0.02em', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', opacity: 0.8, filter: palette.isDark ? 'brightness(0) invert(1)' : 'none' }}>
          <span style={{ fontSize: '10px' }}>Pagamento sicuro via</span>
          <img src={stripeLogo} alt="Stripe" style={{ height: '11px', width: 'auto', display: 'block' }} />
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '12px', 
          opacity: 0.5,
          filter: palette.isDark ? 'brightness(0) invert(1)' : 'none' 
        }}>
          <img src={visaLogo} alt="Visa" style={{ height: '9px', width: 'auto', display: 'block' }} />
          <img src={mastercardLogo} alt="Mastercard" style={{ height: '13px', width: 'auto', display: 'block' }} />
          <img src={amexLogo} alt="Amex" style={{ height: '11px', width: 'auto', display: 'block' }} />
          <img src={applePayLogo} alt="Apple Pay" style={{ height: '12px', width: 'auto', display: 'block' }} />
          <img src={googlePayLogo} alt="Google Pay" style={{ height: '12px', width: 'auto', display: 'block' }} />
          <img src={sepaLogo} alt="SEPA" style={{ height: '11px', width: 'auto', display: 'block' }} />
        </div>
      </div>
    </form>
  );
};

interface PaymentStepProps {
  accentColor: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ accentColor, amount, donorName, donorEmail, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  // Traccia quale tab di pagamento è attualmente selezionata, così il
  // sub-label sovrapposto ad ogni tab usa il colore giusto (bianco sulla
  // tab attiva con sfondo accent, grigio sull'altra).
  const [activeMethod, setActiveMethod] = useState<string>('card');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: window.location.href,
        // Passiamo i dati del donatore (già raccolti nello step precedente)
        // come default billing details. Serve in particolare a SEPA Debit,
        // che altrimenti chiederebbe di nuovo nome + email nel form.
        payment_method_data: {
          billing_details: {
            name: donorName,
            email: donorEmail,
          },
        },
      },
    });

    if (error) {
      onError(error.message || 'Pagamento non completato');
      setSubmitting(false);
      return;
    }

    if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
      onSuccess();
    } else {
      onError('Stato pagamento inatteso. Controlla la tua email per aggiornamenti.');
    }
    setSubmitting(false);
  };

  const formattedAmount = useMemo(
    () => amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }),
    [amount]
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        padding: '12px 16px',
        borderRadius: '10px',
        background: `${accentColor}10`,
        border: `1px solid ${accentColor}30`,
        fontSize: '14px',
        color: '#1a1a1a',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>Stai inviando</span>
        <strong style={{ fontSize: '18px', color: accentColor }}>{formattedAmount}</strong>
      </div>

      {/* Wrapper relative per poter sovrapporre sub-label alle tab Stripe.
          Le tab native di Stripe vivono in un iframe e non possiamo
          iniettarci testo. Abbiamo però aumentato il loro paddingBottom
          a 26px via appearance.rules (vedi sopra), così creiamo spazio
          bianco DENTRO ciascuna tab dove sovrapponiamo qui un testo
          custom con pointer-events:none. Visivamente sembra un sub-label
          del pulsante. */}
      <div style={{ position: 'relative' }}>
        <PaymentElement
          onChange={(e) => {
            const t = e?.value?.type;
            if (t) setActiveMethod(t);
          }}
          options={{
            layout: 'tabs',
            // Disabilitiamo esplicitamente Stripe Link (il pulsante fluttuante
            // "stripe >" in basso a destra, autologin email). Manteniamo i
            // wallet nativi (Apple Pay / Google Pay) che sono auto-rilevati
            // dal browser.
            wallets: { link: 'never' as any },
            // Evitiamo che Stripe richieda di nuovo nome/email per SEPA: li
            // abbiamo già raccolti nello step precedente e li passiamo come
            // default billing details al confirmPayment (vedi sotto).
            fields: {
              billingDetails: {
                name: 'never',
                email: 'never',
              },
            },
          }}
        />
        {/* Overlay posizionato sulla fascia di paddingBottom aggiunta alle
            tab via appearance.rules. pointer-events:none lascia cliccabile
            la tab sottostante. Ogni sub-label cambia colore in base a quale
            tab è attualmente selezionata (bianco su fondo accent, grigio
            su fondo bianco). */}
        <div style={{
          position: 'absolute',
          top: '56px',
          left: 0,
          right: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          pointerEvents: 'none',
          fontSize: '10.5px',
          fontWeight: 500,
          lineHeight: 1.1,
          letterSpacing: '0.01em',
          justifyItems: 'stretch',
        }}>
          <div style={{
            color: activeMethod === 'card' ? 'rgba(255,255,255,0.92)' : '#999',
            transition: 'color .15s ease',
            width: '100%',
            boxSizing: 'border-box',
            textAlign: 'left',
            paddingLeft: '16px',
            paddingRight: '6px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            inclusi Apple Pay e Google Pay
          </div>
          <div style={{
            color: activeMethod === 'sepa_debit' ? 'rgba(255,255,255,0.92)' : '#999',
            transition: 'color .15s ease',
            width: '100%',
            boxSizing: 'border-box',
            textAlign: 'left',
            paddingLeft: '16px',
            paddingRight: '6px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            paga con il tuo IBAN
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        style={{
          padding: '14px 24px',
          borderRadius: '999px',
          border: 'none',
          background: accentColor,
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: 700,
          cursor: submitting ? 'wait' : 'pointer',
          opacity: submitting ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        {submitting ? <><Loader2 size={16} className="spin" /> Elaborazione…</> : `Paga ${formattedAmount}`}
      </button>
    </form>
  );
};

export default DonationModal;
