import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck, Info } from 'lucide-react';
import { Button } from '../../../../ui';
import { apiFetch } from '../../../../utils/apiFetch';

export interface PrefillWizardProps {
  onComplete: () => void;
  onCancel: () => void;
  /** Slug dell'evento che l'utente sta configurando, usato da Stripe per pre-popolare business_profile.url. */
  eventSlug?: string | undefined;
  /** gift | donation — usato per impostare MCC Stripe corretto. */
  paymentMode?: 'gift' | 'donation' | undefined;
}

interface FormState {
  firstName: string;
  lastName: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  fiscalCode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  province: string;
  phone: string;
  iban: string;
  ibanHolder: string;
}

const initialState: FormState = {
  firstName: '',
  lastName: '',
  dobDay: '',
  dobMonth: '',
  dobYear: '',
  fiscalCode: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: '',
  province: '',
  phone: '+39 ',
  iban: '',
  ibanHolder: '',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#555',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  display: 'block',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid #dcdcdc',
  background: '#fff',
  fontSize: '14px',
  color: '#1a1a1a',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const helperStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#888',
  marginTop: '6px',
  lineHeight: 1.45,
};

const errorStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#c0392b',
  marginTop: '6px',
  lineHeight: 1.4,
};

function validateItalianFiscalCode(cf: string): boolean {
  return /^[A-Z0-9]{16}$/i.test(cf.trim());
}

function sanitizeIban(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase();
}

function validateItalianIban(iban: string): boolean {
  return /^IT\d{2}[A-Z0-9]{23}$/.test(sanitizeIban(iban));
}

function formatIban(iban: string): string {
  const clean = sanitizeIban(iban);
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

const STEPS = [
  { key: 'identity', title: 'Chi sei', subtitle: 'Ci servono i tuoi dati anagrafici per la verifica antiriciclaggio' },
  { key: 'address', title: 'Dove vivi', subtitle: 'La residenza che risulta sui tuoi documenti' },
  { key: 'contact', title: 'Contatto', subtitle: 'Un numero raggiungibile per comunicazioni sicurezza' },
  { key: 'bank', title: 'Conto corrente', subtitle: 'Dove vuoi ricevere i regali' },
] as const;

const PrefillWizard: React.FC<PrefillWizardProps> = ({ onComplete, onCancel, eventSlug, paymentMode }) => {
  const [form, setForm] = useState<FormState>(initialState);
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [stepErrors, setStepErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (patch: Partial<FormState>) => {
    setForm((f) => ({ ...f, ...patch }));
    if (Object.keys(stepErrors).length) setStepErrors({});
    if (apiError) setApiError(null);
  };

  const currentStep = STEPS[stepIdx]!;

  const yearsList = useMemo(() => {
    const now = new Date().getFullYear();
    const list: number[] = [];
    for (let y = now - 13; y >= now - 110; y--) list.push(y);
    return list;
  }, []);

  const validateStep = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (currentStep.key === 'identity') {
      if (form.firstName.trim().length < 1) errs.firstName = 'Obbligatorio';
      if (form.lastName.trim().length < 1) errs.lastName = 'Obbligatorio';
      const dd = Number(form.dobDay), mm = Number(form.dobMonth), yy = Number(form.dobYear);
      if (!dd || dd < 1 || dd > 31) errs.dobDay = 'Giorno';
      if (!mm || mm < 1 || mm > 12) errs.dobMonth = 'Mese';
      if (!yy) errs.dobYear = 'Anno';
      if (!validateItalianFiscalCode(form.fiscalCode)) errs.fiscalCode = '16 caratteri (es. RSSMRA85M01H501U)';
    }
    if (currentStep.key === 'address') {
      if (form.addressLine1.trim().length < 3) errs.addressLine1 = 'Via e numero civico';
      if (form.city.trim().length < 2) errs.city = 'Città richiesta';
      if (!/^\d{5}$/.test(form.postalCode.trim())) errs.postalCode = 'CAP a 5 cifre';
      if (!/^[A-Z]{2}$/i.test(form.province.trim())) errs.province = 'Sigla (es. MI, NA, RM)';
    }
    if (currentStep.key === 'contact') {
      if (!/^[+0-9\s()-]{6,}$/.test(form.phone.trim())) errs.phone = 'Numero non valido';
    }
    if (currentStep.key === 'bank') {
      if (!validateItalianIban(form.iban)) errs.iban = 'IBAN italiano non valido (deve iniziare con IT)';
      if (form.ibanHolder.trim().length < 2) errs.ibanHolder = 'Intestatario del conto';
    }
    setStepErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    if (stepIdx === STEPS.length - 1) {
      void submit();
    } else {
      if (stepIdx === 0 && !form.ibanHolder) {
        setForm((f) => ({ ...f, ibanHolder: `${f.firstName} ${f.lastName}`.trim() }));
      }
      setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
    }
  };

  const goBack = () => {
    if (submitting) return;
    if (stepIdx === 0) {
      onCancel();
    } else {
      setStepIdx((i) => Math.max(0, i - 1));
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setApiError(null);
    try {
      const res = await apiFetch('/api/stripe/connect/prefill-account', {
        method: 'POST',
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          dobDay: Number(form.dobDay),
          dobMonth: Number(form.dobMonth),
          dobYear: Number(form.dobYear),
          fiscalCode: form.fiscalCode.trim().toUpperCase(),
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          province: form.province.trim().toUpperCase(),
          phone: form.phone.trim(),
          iban: sanitizeIban(form.iban),
          ibanHolder: form.ibanHolder.trim(),
          eventSlug: eventSlug || undefined,
          paymentMode: paymentMode || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any));
        const msg = Array.isArray(data?.errors) && data.errors.length
          ? data.errors.join(' · ')
          : (data?.message || 'Errore salvataggio dati');
        throw new Error(msg);
      }
      onComplete();
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 14px',
        borderRadius: '100px',
        background: 'linear-gradient(135deg, rgba(40, 120, 80, 0.08), rgba(40, 120, 80, 0.02))',
        border: '1px solid rgba(40, 120, 80, 0.2)',
        alignSelf: 'flex-start',
      }}>
        <ShieldCheck size={14} color="#2b8a5e" />
        <span style={{ fontSize: '11px', color: '#1b5e3e', fontWeight: 600 }}>
          Dati cifrati · trasmessi in sicurezza a Stripe
        </span>
      </div>

      {stepIdx === 0 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start',
          fontSize: '12px',
          color: '#666',
          lineHeight: 1.5,
        }}>
          <Info size={14} color="#888" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            Al termine, ti verrà chiesta una foto del documento d'identità per verificare che sei tu.
          </span>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: '3px', borderRadius: '2px',
              background: i <= stepIdx ? '#1a1a1a' : '#e5e5e5',
              transition: 'background 160ms',
            }} />
          ))}
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
          Passo {stepIdx + 1} di {STEPS.length}
        </div>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#1a1a1a' }}>
          {currentStep.title}
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
          {currentStep.subtitle}
        </p>
      </div>

      {currentStep.key === 'identity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Nome</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => set({ firstName: e.target.value })}
                placeholder="Mario"
                style={inputStyle}
                autoFocus
              />
              {stepErrors.firstName && <div style={errorStyle}>{stepErrors.firstName}</div>}
            </div>
            <div>
              <label style={labelStyle}>Cognome</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => set({ lastName: e.target.value })}
                placeholder="Rossi"
                style={inputStyle}
              />
              {stepErrors.lastName && <div style={errorStyle}>{stepErrors.lastName}</div>}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Data di nascita</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.2fr', gap: '10px' }}>
              <input
                type="number"
                min={1}
                max={31}
                value={form.dobDay}
                onChange={(e) => set({ dobDay: e.target.value })}
                placeholder="GG"
                style={inputStyle}
              />
              <select
                value={form.dobMonth}
                onChange={(e) => set({ dobMonth: e.target.value })}
                style={inputStyle}
              >
                <option value="">Mese</option>
                {['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']
                  .map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select
                value={form.dobYear}
                onChange={(e) => set({ dobYear: e.target.value })}
                style={inputStyle}
              >
                <option value="">Anno</option>
                {yearsList.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {(stepErrors.dobDay || stepErrors.dobMonth || stepErrors.dobYear) && (
              <div style={errorStyle}>Data di nascita non valida</div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Codice fiscale</label>
            <input
              type="text"
              value={form.fiscalCode}
              onChange={(e) => set({ fiscalCode: e.target.value.toUpperCase() })}
              placeholder="RSSMRA85M01H501U"
              maxLength={16}
              style={{ ...inputStyle, letterSpacing: '0.05em', fontFamily: 'monospace' }}
            />
            {stepErrors.fiscalCode ? (
              <div style={errorStyle}>{stepErrors.fiscalCode}</div>
            ) : (
              <div style={helperStyle}>Lo trovi sulla tua tessera sanitaria o carta d'identità.</div>
            )}
          </div>
        </div>
      )}

      {currentStep.key === 'address' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Indirizzo</label>
            <input
              type="text"
              value={form.addressLine1}
              onChange={(e) => set({ addressLine1: e.target.value })}
              placeholder="Via Roma 12"
              style={inputStyle}
              autoFocus
            />
            {stepErrors.addressLine1 && <div style={errorStyle}>{stepErrors.addressLine1}</div>}
          </div>

          <div>
            <label style={labelStyle}>Interno / Scala / Piano <span style={{ color: '#999', fontWeight: 500 }}>(opzionale)</span></label>
            <input
              type="text"
              value={form.addressLine2}
              onChange={(e) => set({ addressLine2: e.target.value })}
              placeholder="Int. 3, Scala B"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Città</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => set({ city: e.target.value })}
                placeholder="Milano"
                style={inputStyle}
              />
              {stepErrors.city && <div style={errorStyle}>{stepErrors.city}</div>}
            </div>
            <div>
              <label style={labelStyle}>Provincia</label>
              <input
                type="text"
                value={form.province}
                onChange={(e) => set({ province: e.target.value.toUpperCase().slice(0, 2) })}
                placeholder="MI"
                maxLength={2}
                style={{ ...inputStyle, textTransform: 'uppercase' }}
              />
              {stepErrors.province && <div style={errorStyle}>{stepErrors.province}</div>}
            </div>
          </div>

          <div>
            <label style={labelStyle}>CAP</label>
            <input
              type="text"
              value={form.postalCode}
              onChange={(e) => set({ postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
              placeholder="20121"
              maxLength={5}
              inputMode="numeric"
              style={{ ...inputStyle, maxWidth: '180px' }}
            />
            {stepErrors.postalCode && <div style={errorStyle}>{stepErrors.postalCode}</div>}
          </div>
        </div>
      )}

      {currentStep.key === 'contact' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Numero di telefono</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set({ phone: e.target.value })}
              placeholder="+39 333 1234567"
              style={inputStyle}
              autoFocus
            />
            {stepErrors.phone ? (
              <div style={errorStyle}>{stepErrors.phone}</div>
            ) : (
              <div style={helperStyle}>Usato solo per comunicazioni di sicurezza (verifica a due fattori). Nessun marketing.</div>
            )}
          </div>
        </div>
      )}

      {currentStep.key === 'bank' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>IBAN</label>
            <input
              type="text"
              value={form.iban}
              onChange={(e) => set({ iban: formatIban(e.target.value) })}
              placeholder="IT60 X054 2811 1010 0000 0123 456"
              style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.03em' }}
              autoFocus
            />
            {stepErrors.iban ? (
              <div style={errorStyle}>{stepErrors.iban}</div>
            ) : (
              <div style={helperStyle}>Il conto corrente su cui riceverai i regali. Deve essere un IBAN italiano.</div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Intestatario del conto</label>
            <input
              type="text"
              value={form.ibanHolder}
              onChange={(e) => set({ ibanHolder: e.target.value })}
              placeholder="Mario Rossi"
              style={inputStyle}
            />
            {stepErrors.ibanHolder && <div style={errorStyle}>{stepErrors.ibanHolder}</div>}
          </div>

        </div>
      )}

      {apiError && (
        <div style={{
          padding: '12px 14px',
          borderRadius: '10px',
          background: '#fdecea',
          border: '1px solid #f5b5b0',
          color: '#8e2a22',
          fontSize: '12px',
          lineHeight: 1.5,
        }}>
          {apiError}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', paddingTop: '8px' }}>
        <Button
          variant="ghost"
          onClick={goBack}
          disabled={submitting}
          style={{ padding: '10px 14px' }}
        >
          <ArrowLeft size={14} style={{ marginRight: 6 }} />
          {stepIdx === 0 ? 'Annulla' : 'Indietro'}
        </Button>
        <Button
          variant="primary"
          onClick={goNext}
          disabled={submitting}
          style={{ padding: '12px 22px', minWidth: '160px', justifyContent: 'center' }}
        >
          {submitting ? (
            <><Loader2 size={14} className="spin" style={{ marginRight: 8 }} /> Salvataggio…</>
          ) : stepIdx === STEPS.length - 1 ? (
            <><Check size={14} style={{ marginRight: 6 }} /> Conferma e continua</>
          ) : (
            <>Continua <ArrowRight size={14} style={{ marginLeft: 6 }} /></>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PrefillWizard;
