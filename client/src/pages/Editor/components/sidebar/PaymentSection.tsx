import React, { useEffect, useState } from 'react';
import { Surface, Button } from '../../../../ui';
import { Gift, AlertCircle, Check, Plus, Loader2, ExternalLink, X, Pencil } from 'lucide-react';
import CustomColorPicker from '../CustomColorPicker';
import StripeOnboardingDialog from '../stripe/StripeOnboardingDialog';
import type { Block } from '../../../../types/editor';
import { apiFetch } from '../../../../utils/apiFetch';

interface StripeStatus {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsCurrentlyDue: string[];
}

export type PaymentSectionTab = 'setup' | 'content' | 'amounts' | 'style';

interface PaymentSectionProps {
  block: Block;
  displayColorPicker: any;
  setDisplayColorPicker: (v: any) => void;
  setIsDirty: (v: boolean) => void;
  blocks?: Block[] | undefined;
  setBlocks?: React.Dispatch<React.SetStateAction<Block[]>> | undefined;
  onUpdateBlock?: ((blockId: string, updates: Partial<Block>) => void) | undefined;
  slug: string;
  /**
   * Modalità compatta per il MobileToolbar: salta il wrapper Surface
   * e l'header "Stai modificando Regali in Denaro" perché la toolbar
   * mobile ha già il proprio header "REGALI".
   */
  compact?: boolean;
  /**
   * In modalità compact, mostra solo la sezione indicata (i campi sono
   * divisi in 4 tab nel MobileToolbar per non avere un mappazzone unico).
   * Se assente, mostra tutto (uso desktop).
   */
  section?: PaymentSectionTab;
}

const labelStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, color: 'var(--text-soft)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
  display: 'block', marginBottom: '8px',
};
const inputWrapStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '8px',
  padding: '10px 12px',
  borderRadius: '10px',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
};
const inputStyle: React.CSSProperties = {
  flex: 1, border: 'none', outline: 'none',
  background: 'transparent', fontSize: '13px',
  color: 'var(--text-primary)', minWidth: 0,
};

const PaymentSection: React.FC<PaymentSectionProps> = ({
  block, displayColorPicker, setDisplayColorPicker, setIsDirty,
  blocks, setBlocks, onUpdateBlock, slug, compact = false, section,
}) => {
  // In compact+section, mostra solo la sezione richiesta. Se compact senza
  // section, mostra tutto (comportamento legacy). Su desktop (compact=false)
  // show è sempre true (niente tab, tutto insieme nella sidebar).
  const show = (s: PaymentSectionTab) => !section || section === s;
  const [status, setStatus] = useState<StripeStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      const res = await apiFetch('/api/stripe/connect/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      // silent
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const props = block.widgetProps || {};
  const presetAmounts: number[] = props.paymentPresetAmounts || [50, 100, 200, 300];
  const allowCustomAmount = props.paymentAllowCustomAmount !== false;
  const minAmount = typeof props.paymentMinAmount === 'number' ? props.paymentMinAmount : 1;
  const maxAmount = typeof props.paymentMaxAmount === 'number' ? props.paymentMaxAmount : 5000;

  // Default contestuali: stessi valori usati dal PaymentWidget quando i props sono vuoti.
  // Li pre-popoliamo nei campi della sidebar così l'utente edita il testo reale, non un placeholder fantasma.
  const mode = props.paymentMode || 'gift';
  const defaultTitle = mode === 'donation' ? 'Sostieni la nostra causa' : 'Fai un regalo';
  const defaultDescription = mode === 'donation'
    ? 'Il tuo contributo fa davvero la differenza. Ogni donazione, grande o piccola, conta.'
    : 'Il regalo più bello è la tua presenza — ma se vuoi, puoi lasciarci anche un pensiero in denaro.';
  const defaultCta = mode === 'donation' ? 'Dona ora' : 'Fai un regalo';
  const defaultThankYou = 'Grazie di cuore! La tua generosità ci emoziona.';

  const patch = (updates: Partial<Block['widgetProps']>) => {
    setIsDirty(true);
    if (onUpdateBlock && block.id) {
      onUpdateBlock(block.id, { widgetProps: { ...block.widgetProps, ...updates } });
    } else if (blocks && setBlocks) {
      setBlocks(blocks.map(b => b.id === block.id ? { ...b, widgetProps: { ...b.widgetProps, ...updates } } : b));
    }
  };

  const handleActivate = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await apiFetch('/api/stripe/connect/create-account', {
        method: 'POST',
        body: JSON.stringify({
          eventSlug: slug,
          paymentMode: props.paymentMode || 'gift',
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Errore attivazione');
      }
      setOnboardingOpen(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const updatePreset = (idx: number, v: string) => {
    const n = Math.max(0, Math.min(10000, Number(v) || 0));
    const next = [...presetAmounts];
    next[idx] = n;
    patch({ paymentPresetAmounts: next });
  };
  const removePreset = (idx: number) => {
    if (presetAmounts.length <= 1) return;
    const next = presetAmounts.filter((_, i) => i !== idx);
    patch({ paymentPresetAmounts: next });
  };
  const addPreset = () => {
    const next = [...presetAmounts, 50].slice(0, 6);
    patch({ paymentPresetAmounts: next });
  };

  // [FIX React anti-pattern] Prima qui c'era un componente `Wrapper` definito
  // inline dentro il body di PaymentSection. Ogni render creava una nuova
  // identity del componente → React smontava/rimontava l'intero sotto-albero
  // inclusi bottoni e input, facendo saltare i click mid-render (il click
  // arrivava a un nodo DOM già rimosso). Sostituito con rendering condizionale
  // diretto in fondo al render.
  const body = (
    <>
        {!compact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(var(--accent-rgb), 0.12)',
              border: '1px solid rgba(var(--accent-rgb), 0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Gift size={18} color="var(--accent)" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                Stai modificando
              </div>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Regali in Denaro
              </h3>
            </div>
          </div>
        )}

        {/* STRIPE STATUS BANNER */}
        {show('setup') && (loadingStatus ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', color: 'var(--text-soft)', fontSize: '12px' }}>
            <Loader2 size={14} className="spin" /> Verifica stato pagamenti…
          </div>
        ) : !status?.chargesEnabled ? (
          <div style={{
            padding: compact ? '10px 12px' : '14px 16px',
            borderRadius: compact ? '10px' : '12px',
            background: 'rgba(var(--accent-rgb), 0.08)',
            border: '1px dashed rgba(var(--accent-rgb), 0.35)',
            marginBottom: compact ? '12px' : '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: compact ? '4px' : '6px' }}>
              <AlertCircle size={compact ? 12 : 14} color="var(--accent)" />
              <div style={{ fontSize: compact ? '11px' : '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {status?.connected ? 'Completa la configurazione' : 'Attiva i pagamenti'}
              </div>
            </div>
            <div style={{ fontSize: compact ? '10px' : '11px', color: 'var(--text-soft)', lineHeight: 1.4, marginBottom: compact ? '8px' : '10px' }}>
              {status?.connected
                ? 'Stripe ha bisogno di qualche informazione in più per verificarti.'
                : 'Per ricevere regali verifica la tua identità e collega un conto, in sicurezza tramite Stripe.'}
            </div>
            {error && (
              <div style={{ fontSize: '11px', color: '#c0392b', marginBottom: '8px' }}>{error}</div>
            )}
            <Button
              variant="primary"
              style={{ width: '100%', justifyContent: 'center', padding: compact ? '8px 14px' : '10px 16px', fontSize: compact ? '11px' : '12px' }}
              onClick={status?.connected ? () => setOnboardingOpen(true) : handleActivate}
              disabled={creating}
            >
              {creating ? <><Loader2 size={13} className="spin" /> Attivazione…</> : (status?.connected ? 'Completa setup' : 'Attiva pagamenti')}
            </Button>
          </div>
        ) : (
          <div style={{
            padding: '10px 14px',
            borderRadius: '100px',
            background: 'rgba(var(--accent-rgb), 0.08)',
            border: '1px solid rgba(var(--accent-rgb), 0.3)',
            marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <Check size={14} color="var(--accent)" />
            <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>
              Pagamenti attivi · pronto a ricevere regali
            </span>
          </div>
        ))}

        {/* TITOLO */}
        {show('content') && (
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Titolo</label>
          <div style={inputWrapStyle}>
            <Pencil size={12} style={{ color: 'var(--text-soft)', flexShrink: 0 }} />
            <input
              type="text"
              value={props.paymentTitle || defaultTitle}
              onChange={(e) => patch({ paymentTitle: e.target.value })}
              style={{ ...inputStyle, fontWeight: 600 }}
              maxLength={80}
            />
          </div>
        </div>
        )}

        {/* DESCRIZIONE */}
        {show('content') && (
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Descrizione</label>
          <div style={{ ...inputWrapStyle, alignItems: 'flex-start' }}>
            <Pencil size={12} style={{ color: 'var(--text-soft)', flexShrink: 0, marginTop: '3px' }} />
            <textarea
              value={props.paymentDescription || defaultDescription}
              onChange={(e) => patch({ paymentDescription: e.target.value })}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              maxLength={300}
            />
          </div>
        </div>
        )}

        {/* MODE */}
        {show('content') && (
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Tipologia</label>
          <div style={{ display: 'flex', gap: '6px', background: 'var(--surface-light)', borderRadius: '100px', padding: '3px', border: '1px solid var(--border)' }}>
            {(['gift', 'donation'] as const).map((m) => (
              <Button
                key={m}
                variant={(props.paymentMode || 'gift') === m ? 'primary' : 'ghost'}
                onClick={() => patch({ paymentMode: m })}
                style={{ flex: 1, padding: '6px 2px', fontSize: '10px', fontWeight: 800, borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em', justifyContent: 'center' }}
              >
                {m === 'gift' ? 'Regalo' : 'Donazione'}
              </Button>
            ))}
          </div>
        </div>
        )}

        {/* PRESET AMOUNTS — su mobile compact vanno in 2 colonne per
            ridurre l'altezza verticale (il form deve entrare nella viewport
            senza scroll infinito). Su desktop resta single-column come RSVP. */}
        {show('amounts') && (
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Importi suggeriti</label>
          <div
            style={
              compact
                ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }
                : { display: 'flex', flexDirection: 'column', gap: '6px' }
            }
          >
            {presetAmounts.map((amt, idx) => (
              <div key={idx} style={{ ...inputWrapStyle, padding: '6px 8px', gap: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-soft)' }}>€</span>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={amt}
                  onChange={(e) => updatePreset(idx, e.target.value)}
                  style={{ ...inputStyle, fontSize: '13px', minWidth: 0 }}
                />
                <button
                  type="button"
                  onClick={() => removePreset(idx)}
                  disabled={presetAmounts.length <= 1}
                  style={{
                    background: 'none', border: 'none',
                    cursor: presetAmounts.length <= 1 ? 'default' : 'pointer',
                    opacity: presetAmounts.length <= 1 ? 0.3 : 1,
                    padding: '2px', display: 'flex', flexShrink: 0,
                  }}
                  aria-label="Rimuovi"
                >
                  <X size={14} color="var(--text-soft)" />
                </button>
              </div>
            ))}
            {presetAmounts.length < 6 && (
              <Button
                variant="subtle"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontSize: '11px',
                  gridColumn: compact ? '1 / -1' : undefined,
                }}
                onClick={addPreset}
              >
                <Plus size={14} style={{ marginRight: 4 }} /> Aggiungi importo
              </Button>
            )}
          </div>
        </div>
        )}

        {/* CUSTOM AMOUNT TOGGLE — stile coerente con altri toggle (RSVP) */}
        {show('amounts') && (
        <Button
          variant="subtle"
          style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px', marginBottom: '8px' }}
          onClick={() => patch({ paymentAllowCustomAmount: !allowCustomAmount })}
        >
          <span style={{ fontSize: '11px', fontWeight: 600 }}>Consenti importo libero</span>
          <div style={{ width: '16px', height: '16px', border: '1px solid var(--accent)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {allowCustomAmount && <Check size={12} color="var(--accent)" />}
          </div>
        </Button>
        )}

        {show('amounts') && allowCustomAmount && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Minimo</label>
              <div style={inputWrapStyle}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-soft)' }}>€</span>
                <input
                  type="number"
                  min={1}
                  max={maxAmount - 1}
                  value={minAmount}
                  onChange={(e) => patch({ paymentMinAmount: Math.max(1, Number(e.target.value) || 1) })}
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Massimo</label>
              <div style={inputWrapStyle}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-soft)' }}>€</span>
                <input
                  type="number"
                  min={minAmount + 1}
                  max={50000}
                  value={maxAmount}
                  onChange={(e) => patch({ paymentMaxAmount: Math.min(50000, Math.max(minAmount + 1, Number(e.target.value) || 5000)) })}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        )}

        {/* OBIETTIVO — utile sia per donazioni che per "dream gift" (es: luna di miele) */}
        {show('style') && (
        <div style={{ marginBottom: '8px' }}>
          <label style={labelStyle}>Obiettivo (opzionale)</label>
          <div style={inputWrapStyle}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-soft)' }}>€</span>
            <input
              type="number"
              min={0}
              value={props.paymentTargetAmount || ''}
              onChange={(e) => patch({ paymentTargetAmount: e.target.value ? Number(e.target.value) : 0 })}
              placeholder={props.paymentMode === 'donation' ? 'Es: 5000' : 'Es: 10000 per la luna di miele'}
              style={inputStyle}
            />
          </div>
        </div>
        )}
        {show('style') && (props.paymentTargetAmount ? (
          <Button
            variant="subtle"
            style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px', marginBottom: '14px' }}
            onClick={() => patch({ paymentShowProgress: !props.paymentShowProgress })}
          >
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Mostra barra di progresso</span>
            <div style={{ width: '16px', height: '16px', border: '1px solid var(--accent)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {props.paymentShowProgress && <Check size={12} color="var(--accent)" />}
            </div>
          </Button>
        ) : (
          <div style={{ marginBottom: '14px' }} />
        ))}

        {/* COLORE ACCENTO — stile identico a RSVP */}
        {show('style') && (
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Colore Accento</label>
          <Button
            variant={displayColorPicker === 'paymentAccent' ? 'primary' : 'subtle'}
            onClick={() => setDisplayColorPicker(displayColorPicker === 'paymentAccent' ? false : 'paymentAccent')}
            style={{
              width: '100%',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '100px',
              ...(displayColorPicker === 'paymentAccent' ? { boxShadow: '0 0 15px rgba(var(--accent-rgb), 0.5)', zIndex: 1 } : {})
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Pulsante & Accenti</span>
            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: props.paymentAccentColor || 'var(--accent)', border: '1px solid rgba(0,0,0,0.1)' }} />
          </Button>
          {displayColorPicker === 'paymentAccent' && (
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '8px' }}>
              <CustomColorPicker
                color={props.paymentAccentColor || '#1a1a1a'}
                onChange={(color) => patch({ paymentAccentColor: color })}
              />
            </div>
          )}
        </div>
        )}

        {/* CTA */}
        {show('content') && (
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Testo del pulsante</label>
          <div style={inputWrapStyle}>
            <Pencil size={12} style={{ color: 'var(--text-soft)', flexShrink: 0 }} />
            <input
              type="text"
              value={props.paymentCtaLabel || defaultCta}
              onChange={(e) => patch({ paymentCtaLabel: e.target.value })}
              style={inputStyle}
              maxLength={40}
            />
          </div>
        </div>
        )}

        {/* THANK YOU MESSAGE */}
        {show('content') && (
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Messaggio di ringraziamento</label>
          <div style={{ ...inputWrapStyle, alignItems: 'flex-start' }}>
            <Pencil size={12} style={{ color: 'var(--text-soft)', flexShrink: 0, marginTop: '3px' }} />
            <textarea
              value={props.paymentThankYouMessage || defaultThankYou}
              onChange={(e) => patch({ paymentThankYouMessage: e.target.value })}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              maxLength={300}
            />
          </div>
        </div>
        )}

        {/* LINK DASHBOARD */}
        {show('setup') && status?.chargesEnabled && slug && (
          <a
            href={`/events/${slug}/donations`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', marginTop: '8px',
              background: 'rgba(var(--accent-rgb), 0.05)',
              border: '1px solid rgba(var(--accent-rgb), 0.2)',
              borderRadius: '100px',
              color: 'var(--text-primary)', textDecoration: 'none',
              fontSize: '12px', fontWeight: 600,
            }}
          >
            <span>Vedi donazioni ricevute</span>
            <ExternalLink size={14} color="var(--accent)" />
          </a>
        )}

        {show('setup') && (
          <p style={{ fontSize: '10px', color: 'var(--text-soft)', lineHeight: 1.5, padding: '10px 12px', background: 'rgba(var(--accent-rgb), 0.05)', borderRadius: '10px', borderLeft: '3px solid var(--accent)', margin: '14px 0 0' }}>
            Commissione eenvee: 3% + 0,50&nbsp;€ per transazione. Il resto viene accreditato direttamente sul tuo conto collegato.
          </p>
        )}
    </>
  );

  return (
    <>
      {compact ? (
        <div className="panel-section" style={{ width: '100%' }}>{body}</div>
      ) : (
        <Surface variant="soft" className="panel-section" style={{ marginTop: '20px' }}>{body}</Surface>
      )}

      <StripeOnboardingDialog
        open={onboardingOpen}
        onClose={() => { setOnboardingOpen(false); void loadStatus(); }}
        onComplete={() => { void loadStatus(); }}
        skipPrefill={Boolean(status?.detailsSubmitted)}
        eventSlug={slug}
        paymentMode={props.paymentMode || 'gift'}
      />
    </>
  );
};

export default PaymentSection;
