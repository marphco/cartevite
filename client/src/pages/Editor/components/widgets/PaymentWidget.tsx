import React, { useState, useEffect } from 'react';
import { Gift, Heart, AlertCircle, Loader2 } from 'lucide-react';
import { getAdaptivePalette } from '../../../../utils/colorUtils';
import { apiFetch } from '../../../../utils/apiFetch';
import visaLogo from '../../../../assets/visa.svg';
import mastercardLogo from '../../../../assets/mastercard.svg';
import amexLogo from '../../../../assets/amex.svg';
import applePayLogo from '../../../../assets/apple-pay.svg';
import googlePayLogo from '../../../../assets/google-pay.svg';
import sepaLogo from '../../../../assets/sepa.svg';
import stripeLogo from '../../../../assets/stripe.svg';

export interface PaymentWidgetProps {
  eventSlug?: string;
  title?: string;
  description?: string;
  presetAmounts?: number[];
  minAmount?: number;
  maxAmount?: number;
  targetAmount?: number;
  showProgress?: boolean;
  accentColor?: string;
  mode?: 'gift' | 'donation';
  ctaLabel?: string;
  sectionBg?: string | null;
  previewMobile?: boolean;
  readOnly?: boolean;
  /** Se true (default) mostra un input per importo libero sotto i preset. */
  allowCustomAmount?: boolean;
  /** In editor: se l'owner non ha ancora completato onboarding Stripe mostriamo un banner. */
  onboardingNeeded?: boolean;
  onClickDonate?: (defaultAmount?: number) => void;
}

const PaymentWidget: React.FC<PaymentWidgetProps> = ({
  eventSlug,
  title,
  description,
  presetAmounts = [25, 50, 100, 200],
  minAmount = 1,
  maxAmount = 5000,
  targetAmount,
  showProgress = false,
  accentColor = 'var(--accent)',
  mode = 'gift',
  ctaLabel,
  sectionBg,
  previewMobile = false,
  readOnly = false,
  allowCustomAmount = true,
  onboardingNeeded = false,
  onClickDonate,
}) => {
  const palette = getAdaptivePalette(sectionBg, accentColor);
  const [progress, setProgress] = useState<{ total: number; count: number } | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');

  const defaultTitle = mode === 'donation' ? 'Sostieni la nostra causa' : 'Fai un regalo';
  const defaultDescription = mode === 'donation'
    ? 'Il tuo contributo fa davvero la differenza. Ogni donazione, grande o piccola, conta.'
    : 'Il regalo più bello è la tua presenza — ma se vuoi, puoi lasciarci anche un pensiero in denaro.';
  const defaultCta = mode === 'donation' ? 'Dona ora' : 'Fai un regalo';
  const effectiveCta = ctaLabel || defaultCta;

  useEffect(() => {
    if (!showProgress || !targetAmount || !eventSlug || readOnly) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(`/api/donations/event/${eventSlug}/progress`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setProgress({ total: data.total || 0, count: data.count || 0 });
        }
      } catch {
        // silent fail — progress bar opzionale
      }
    })();
    return () => { cancelled = true; };
  }, [showProgress, targetAmount, eventSlug, readOnly]);

  const formatEur = (cents: number) => (cents / 100).toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

  const progressPercent = (showProgress && targetAmount && progress)
    ? Math.min(100, Math.round((progress.total / (targetAmount * 100)) * 100))
    : null;

  if (onboardingNeeded) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        padding: '32px 24px',
        border: `2px dashed ${palette.border}`,
        borderRadius: '16px',
        background: palette.surface,
        color: palette.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '56px', height: '56px',
          borderRadius: '14px',
          background: `${accentColor}1A`,
          border: `1px solid ${accentColor}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AlertCircle size={26} color={accentColor as string} />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: palette.text, marginBottom: '6px' }}>
            Attiva i pagamenti per ricevere regali
          </div>
          <div style={{ fontSize: '13px', color: palette.textSoft, lineHeight: 1.5, maxWidth: '460px' }}>
            Completa la configurazione dal pannello laterale. Bastano pochi minuti — verifichiamo la tua identità e colleghiamo il tuo conto in modo sicuro tramite Stripe.
          </div>
        </div>
      </div>
    );
  }

  const cardPadding = previewMobile ? '24px 18px' : '36px 28px';
  const Icon = mode === 'donation' ? Heart : Gift;
  // Su sfondi scuri il `palette.surface` (5% bianco) risulta quasi invisibile:
  // promuoviamo il contrasto a 10% e rinforziamo il bordo per far "staccare"
  // chiaramente la card dal background della sezione. Su sfondi chiari il
  // comportamento storico (3% nero) resta inalterato.
  const cardBg = palette.isDark ? 'rgba(255,255,255,0.08)' : palette.surface;
  const cardBorder = palette.isDark ? 'rgba(255,255,255,0.22)' : palette.border;
  const cardShadow = palette.isDark
    ? '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)'
    : '0 4px 20px rgba(0,0,0,0.06)';

  return (
    <div style={{
      width: '100%',
      maxWidth: '620px',
      margin: '0 auto',
      padding: cardPadding,
      borderRadius: '20px',
      background: cardBg,
      border: `1px solid ${cardBorder}`,
      boxShadow: cardShadow,
      color: palette.text,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
        <div style={{
          width: '52px', height: '52px',
          borderRadius: '14px',
          background: `${accentColor}1A`,
          border: `1px solid ${accentColor}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={24} color={accentColor as string} />
        </div>
        <div style={{
          fontSize: previewMobile ? '20px' : '24px',
          fontWeight: 700,
          fontFamily: 'var(--font-heading, serif)',
          lineHeight: 1.2,
        }}>
          {title || defaultTitle}
        </div>
        <div style={{ fontSize: '14px', color: palette.textSoft, lineHeight: 1.6, maxWidth: '480px' }}>
          {description || defaultDescription}
        </div>
      </div>

      {progressPercent !== null && progress && targetAmount && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            height: '10px',
            borderRadius: '999px',
            background: palette.border,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: accentColor,
              transition: 'width .5s ease',
            }} />
          </div>
          <div style={{ fontSize: '12px', color: palette.textSoft, display: 'flex', justifyContent: 'space-between' }}>
            <span>{formatEur(progress.total)} raccolti</span>
            <span>obiettivo {formatEur(targetAmount * 100)}</span>
          </div>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${previewMobile ? 2 : 4}, 1fr)`,
        gap: '8px',
      }}>
        {presetAmounts.map((amt) => {
          // Preset "attivo" solo se non stiamo usando il campo custom. Così
          // digitando 500 nel custom, il bottone 50 non si illumina di passaggio.
          const active = !customAmount && selectedAmount === amt;
          return (
            <button
              key={amt}
              type="button"
              onClick={() => {
                if (readOnly) return;
                setSelectedAmount(amt);
                setCustomAmount('');
              }}
              disabled={readOnly}
              style={{
                padding: '12px 8px',
                borderRadius: '10px',
                border: `1.5px solid ${active ? accentColor : palette.border}`,
                background: active ? `${accentColor}1A` : 'transparent',
                color: palette.text,
                fontSize: '15px',
                fontWeight: 700,
                cursor: readOnly ? 'default' : 'pointer',
                transition: 'all .15s ease',
              }}
            >
              {formatEur(amt * 100)}
            </button>
          );
        })}
      </div>

      {allowCustomAmount && (() => {
        const customActive = customAmount.length > 0;
        return (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
              <div style={{ flex: 1, height: '1px', background: palette.border }} />
              <span style={{
                fontSize: '11px',
                color: palette.textSoft,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 600,
              }}>
                oppure
              </span>
              <div style={{ flex: 1, height: '1px', background: palette.border }} />
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '4px 16px',
              borderRadius: '12px',
              background: customActive
                ? `${accentColor}1A`
                : (palette.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)'),
              border: `1.5px solid ${customActive ? accentColor : palette.border}`,
              transition: 'border-color .15s ease, background .15s ease',
            }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  inputMode="decimal"
                  min={minAmount}
                  max={maxAmount}
                  step="1"
                  value={customAmount}
                  onChange={(e) => {
                    if (readOnly) return;
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setCustomAmount(raw);
                    setSelectedAmount(null);
                  }}
                  disabled={readOnly}
                  placeholder="Scegli tu l'importo"
                  className="payment-custom-input"
                  style={{
                    flex: 1, minWidth: 0,
                    padding: '14px 0',
                    border: 'none', outline: 'none',
                    background: 'transparent',
                    color: palette.text,
                    fontSize: '16px',
                    fontWeight: customActive ? 700 : 500,
                    fontFamily: 'inherit',
                    ['--ph-color' as any]: palette.textSoft,
                  }}
                />
                <span style={{
                  fontSize: '16px',
                  fontWeight: customActive ? 700 : 500,
                  color: customActive ? accentColor : palette.textSoft,
                  transition: 'color .15s ease',
                }}>€</span>
              </div>
            </div>
          </>
        );
      })()}

      <button
        type="button"
        onClick={() => {
          if (readOnly) return;
          const custom = Number(customAmount);
          if (customAmount && custom >= minAmount && custom <= maxAmount) {
            onClickDonate?.(custom);
          } else {
            onClickDonate?.(selectedAmount ?? undefined);
          }
        }}
        disabled={readOnly}
        style={{
          padding: '14px 24px',
          borderRadius: '999px',
          border: 'none',
          background: accentColor,
          color: palette.isDark ? '#ffffff' : '#ffffff',
          fontSize: '15px',
          fontWeight: 700,
          letterSpacing: '0.02em',
          cursor: readOnly ? 'default' : 'pointer',
          pointerEvents: readOnly ? 'none' : 'auto',
          opacity: readOnly ? 0.75 : 1,
          transition: 'transform .15s ease, opacity .15s ease',
        }}
      >
        {effectiveCta}
      </button>

      <div style={{ fontSize: '10px', color: palette.textMuted, textAlign: 'center', letterSpacing: '0.02em', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', opacity: 0.8 }}>
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
          <img src={sepaLogo} alt="SEPA" style={{ height: '9px', width: 'auto', display: 'block' }} />
        </div>
      </div>
      {/* min/max visibili come hint silenzioso */}
      <span style={{ display: 'none' }} data-min={minAmount} data-max={maxAmount} />
    </div>
  );
};

export default PaymentWidget;
