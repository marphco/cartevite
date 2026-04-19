import React, { useEffect, useState } from 'react';
import { CheckCircle2, Users, Send, Trash2 } from 'lucide-react';
import type { Block, EventTheme } from '../../../../types/editor';
import { apiFetch } from '../../../../utils/apiFetch';
import {
  buildAllergiesPayload,
  defaultAllergyPeopleRows,
  type AllergiesDetailPayload,
  type AllergyPersonRow,
} from '../../../../utils/allergies';

interface RSVPWidgetProps {
  block: Block;
  theme?: EventTheme;
  readOnly?: boolean;
  eventSlug?: string;
  isMobile?: boolean; // helps with sizing
  sectionBg?: string; // effective section background (resolves transparent/inheritance)
}

export const RSVPWidget: React.FC<RSVPWidgetProps> = ({ 
  block, 
  theme, 
  readOnly = false,
  eventSlug = "demo-slug",
  isMobile = false,
  sectionBg: sectionBgProp
}) => {
  const props = block.widgetProps || {};
  
  // Customization variables
  const title = props.rsvpTitle || "GENTILE CONFERMA";
  const desc = props.rsvpDescription || "Ti preghiamo di confermare la tua presenza entro il 30 Giugno.";
  const askGuests = props.rsvpAskGuests !== false; // default true
  const askIntolerances = props.rsvpAskIntolerances !== false; // default true
  // Contatti: default OFF per non rompere eventi esistenti.
  // Il proprietario li abilita esplicitamente dalla sidebar se vuole raccoglierli.
  const askEmail = props.rsvpAskEmail === true;
  const askPhone = props.rsvpAskPhone === true;
  const customConfirm = props.rsvpConfirmationMessage || "Grazie! La tua risposta è stata registrata con successo.";

  // === AUTO-DETECT BACKGROUND LUMINANCE ===
  // Rileva automaticamente se lo sfondo della sezione è chiaro o scuro
  // e adatta TUTTI i colori del form di conseguenza
  const primaryColor = props.formPrimaryColor || theme?.accent || '#1abc9c';
  
  const normalizeColor = (color?: string | null) => {
    if (!color) return null;
    const c = String(color).trim();
    if (!c) return null;
    if (c === 'transparent') return null;
    if (c === 'none') return null;
    return c;
  };

  const getLuminance = (color: string): number => {
    if (!color) return 0;
    
    let r = 0, g = 0, b = 0;
    
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      if (hex.length === 3) {
        r = parseInt((hex[0] || '0') + (hex[0] || '0'), 16);
        g = parseInt((hex[1] || '0') + (hex[1] || '0'), 16);
        b = parseInt((hex[2] || '0') + (hex[2] || '0'), 16);
      } else if (hex.length >= 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
    } else if (color.startsWith('rgb')) {
      const match = color.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (match && match[1] && match[2] && match[3]) {
        r = parseInt(match[1]);
        g = parseInt(match[2]);
        b = parseInt(match[3]);
      }
    }
    
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  };
  
  // === SMART COLOR SYSTEM v3 ===
  // Rilevamento sfondo con fallback a cascata: blocco > props > tema globale > default nero
  const getSafeColor = () => {
    const effective =
      normalizeColor(sectionBgProp) ??
      normalizeColor(block.props?.bgColor) ??
      normalizeColor(block.bgColor) ??
      normalizeColor(theme?.background);

    // IMPORTANT: if the section is visually transparent, the page is typically white.
    // Falling back to theme.background (often dark) would produce wrong contrast.
    return effective ?? '#ffffff';
  };

  const effectiveSectionBg = getSafeColor();
  const isDark = getLuminance(effectiveSectionBg) < 0.6; // Soglia alzata per gestire meglio i grigi
  const isAccentDark = getLuminance(primaryColor) < 0.5;

  const colors = {
    text:            isDark ? '#ffffff' : '#111111',
    textSoft:        isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
    inputBg:         isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    inputBorder:     isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)',
    toggleBg:        isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    toggleInactive:  isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.45)',
    buttonText:      isAccentDark ? '#ffffff' : '#000000',
    placeholder:     isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
    allergyBorder:   isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
    successBg:       isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    successBorder:   isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)',
    errorBg:         'rgba(255,77,79,0.15)',
  };

  // Internal Form State
  const [status, setStatus] = useState<"yes" | "no" | "maybe">("yes");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guestsCount, setGuestsCount] = useState(1);
  const [message, setMessage] = useState("");
  const [hasAllergies, setHasAllergies] = useState<"yes" | "no" | null>(null);
  const [allergyMode, setAllergyMode] = useState<"whole_party" | "by_person" | null>(null);
  const [wholePartyAllergies, setWholePartyAllergies] = useState("");
  const [allergyPeople, setAllergyPeople] = useState<AllergyPersonRow[]>(() => defaultAllergyPeopleRows());
  const [customResponses, setCustomResponses] = useState<Record<string, any>>({});

  const resetAllergyFields = () => {
    setAllergyMode(null);
    setWholePartyAllergies("");
    setAllergyPeople(defaultAllergyPeopleRows());
  };

  useEffect(() => {
    if (Number(guestsCount) <= 1 && allergyMode === "whole_party") {
      setAllergyMode("by_person");
      setWholePartyAllergies("");
    }
  }, [guestsCount, allergyMode]);

  useEffect(() => {
    if (Number(guestsCount) <= 1 && allergyMode === "by_person" && allergyPeople.length > 1) {
      setAllergyPeople((p) => [{ name: "", allergies: p[0]?.allergies ?? "" }]);
    }
  }, [guestsCount, allergyMode, allergyPeople.length]);

  // Submitting States
  const [isSending, setIsSending] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isUpdated, setIsUpdated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) {
      alert("Sei in modalità Editor. L'invio dell'RSVP avviene solo nella pagina pubblica.");
      return;
    }

    // MANDATORY ALLERGY CHECK
    if (askIntolerances && status !== 'no' && hasAllergies === null) {
      setErrorMsg("Rispondi sì o no.");
      return;
    }

    // MANDATORY CONTACT CHECK — logica smart:
    //  · entrambi ON  → basta uno dei due.
    //  · solo email   → email obbligatoria.
    //  · solo phone   → phone obbligatorio.
    //  · entrambi OFF → nessun controllo (non li chiediamo proprio).
    const cleanEmail = (email || "").trim();
    const cleanPhone = (phone || "").trim();
    if (askEmail && askPhone && !cleanEmail && !cleanPhone) {
      setErrorMsg("Inserisci almeno email o telefono per consentirci di contattarti.");
      return;
    }
    if (askEmail && !askPhone && !cleanEmail) {
      setErrorMsg("Inserisci la tua email per proseguire.");
      return;
    }
    if (askPhone && !askEmail && !cleanPhone) {
      setErrorMsg("Inserisci il tuo numero di telefono per proseguire.");
      return;
    }
    // Basic email shape check (solo se valorizzata): evita typo ovvi tipo "mario@".
    if (askEmail && cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg("L'email inserita non sembra valida. Controlla e riprova.");
      return;
    }

    // MANDATORY CUSTOM FIELDS CHECK
    const missingFields = (props.customFields || []).filter((f: any) => f.required && !customResponses[f.id]);
    if (missingFields.length > 0 && missingFields[0]) {
      setErrorMsg(`Per favore, rispondi alla domanda: "${missingFields[0].label}"`);
      return;
    }

    setIsSending(true);
    setErrorMsg("");
    setIsDone(false);
    setIsUpdated(false);

    // ✅ Serializza le risposte custom in forma denormalizzata:
    //    salviamo label/type DEL MOMENTO dell'invio, così se il creatore
    //    rinomina/cambia le domande in futuro, la risposta dell'ospite
    //    resta comprensibile (es. export catering storico).
    const customResponsesPayload = (props.customFields || []).map((f: any) => ({
      fieldId: f.id,
      label: f.label || "Domanda",
      type: f.type === "checkbox" ? "checkbox" : "text",
      answer: customResponses[f.id] ?? null,
    }));

    let allergiesText = "";
    let allergiesDetailOut: AllergiesDetailPayload | null = null;
    if (askIntolerances && status !== "no") {
      const built = buildAllergiesPayload({
        askIntolerances,
        status,
        hasAllergies,
        guestsCount: Number(guestsCount) || 1,
        allergyMode,
        wholePartyAllergies,
        allergyPeople,
      });
      if (!built.ok) {
        setErrorMsg(built.error);
        setIsSending(false);
        return;
      }
      allergiesText = built.allergies;
      allergiesDetailOut = built.allergiesDetail;
    }

    const messageOut =
      askIntolerances && status !== "no" && hasAllergies === "yes" ? "" : message;

    try {
      const res = await apiFetch(`/api/rsvps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          name,
          email: email || null,
          phone: phone || null,
          guestsCount: Number(guestsCount) || 1,
          message: messageOut,
          status,
          allergies: allergiesText,
          allergiesDetail: allergiesDetailOut,
          customResponses: customResponsesPayload,
        }),
      });

      if (!res.ok) {
        throw new Error("Errore nell'invio RSVP");
      }

      const data = await res.json();
      setIsUpdated(!!data.updated);
      setIsDone(true);
      
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setGuestsCount(1);
      setMessage("");
      setStatus("yes");
      setHasAllergies(null);
      resetAllergyFields();
      setCustomResponses({});

    } catch (err) {
      console.error(err);
      setErrorMsg("Non siamo riusciti a registrare la tua risposta. Riprova.");
    } finally {
      setIsSending(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '16px',
    padding: '14px 16px',
    color: colors.text,
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit'
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      background: 'transparent',
      borderRadius: '24px',
      padding: isMobile ? '24px' : '0 40px', // Horizontal padding only, vertical managed by parent
      color: colors.text
    }}>

      {isDone ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '30px 20px',
          background: colors.successBg,
          borderRadius: '16px',
          border: `1px solid ${colors.successBorder}`,
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <CheckCircle2 size={48} color={primaryColor} style={{ display: 'block', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
            {isUpdated ? 'Risposta Aggiornata' : 'Risposta Inviata!'}
          </h3>
          <p style={{ fontSize: '14px', color: colors.text, opacity: 0.7 }}>{customConfirm}</p>
          <button 
            type="button" 
            onClick={() => setIsDone(false)}
            style={{
              marginTop: '20px',
              padding: '8px 20px',
              background: 'transparent',
              border: `1px solid ${primaryColor}`,
              color: primaryColor,
              borderRadius: '100px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            Invia un'altra conferma
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* TOGGLE PARTECIPAZIONE */}
          <div style={{ 
             display: 'flex', 
             background: colors.toggleBg, 
             borderRadius: '100px', 
             padding: '6px',
             position: 'relative'
          }}>
             <div style={{
               position: 'absolute',
               top: '6px',
               bottom: '6px',
               left: status === 'yes' ? '6px' : (status === 'maybe' ? 'calc(33.33% + 3px)' : 'calc(66.66% + 0px)'),
               width: 'calc(33.33% - 6px)',
               background: primaryColor,
               borderRadius: '100px',
               transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
             }} />
             <button
                type="button"
                onClick={() => setStatus('yes')}
                style={{
                  flex: 1, padding: '14px 0', border: 'none', background: 'transparent',
                  color: status === 'yes' ? colors.buttonText : colors.toggleInactive,
                  opacity: 1,
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                  position: 'relative', zIndex: 1, transition: 'color 0.3s'
                }}
             >
                CI SARÒ
             </button>
             <button
                type="button"
                onClick={() => setStatus('maybe')}
                style={{
                  flex: 1, padding: '14px 0', border: 'none', background: 'transparent',
                  color: status === 'maybe' ? colors.buttonText : colors.toggleInactive,
                  opacity: 1,
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                  position: 'relative', zIndex: 1, transition: 'color 0.3s'
                }}
             >
                FORSE
             </button>
             <button
                type="button"
                onClick={() => setStatus('no')}
                style={{
                  flex: 1, padding: '14px 0', border: 'none', background: 'transparent',
                  color: status === 'no' ? colors.buttonText : colors.toggleInactive,
                  opacity: 1,
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                  position: 'relative', zIndex: 1, transition: 'color 0.3s'
                }}
             >
                NON POTRÒ
             </button>
          </div>

          {(() => {
            const showGuests = askGuests && status !== 'no';
            return (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile || !showGuests ? '1fr' : '1fr 1fr', gap: '16px' }}>
                  <input 
                    type="text" 
                    placeholder="Nome o gruppo *" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    style={inputStyle}
                  />
                  {showGuests && (
                    <div style={{ position: 'relative' }}>
                      <Users size={18} color={colors.text} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                      <input 
                        type="number" 
                        min="1" 
                        max="20"
                        placeholder="Num. Ospiti" 
                        value={guestsCount} 
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          const next = Number.isFinite(v) ? Math.min(20, Math.max(1, v)) : 1;
                          setGuestsCount(next);
                        }} 
                        required 
                        style={{ ...inputStyle, paddingLeft: '44px' }}
                      />
                    </div>
                  )}
                </div>
                {showGuests && askIntolerances && (
                  <p style={{ margin: 0, fontSize: '11px', color: colors.textSoft, lineHeight: 1.4, opacity: 0.9 }}>
                    Includi tutti i posti (anche bambini).
                  </p>
                )}
              </>
            );
          })()}

          {/* ─────────── CONTATTI (Email / Telefono) ───────────
              Resi solo se abilitati nel blocco. Layout:
               · entrambi ON → griglia 2 colonne su desktop, 1 su mobile.
               · solo uno    → full-width.
              Il placeholder mostra "*" quando il campo è obbligatorio
              (rilevato dalla logica "almeno uno" nel submit). */}
          {(askEmail || askPhone) && status !== 'no' && (() => {
            // Se entrambi sono attivi, nessuno dei due ha asterisco: "almeno uno".
            // Se solo uno è attivo, quello ha asterisco.
            const emailRequiredMark = askEmail && !askPhone ? ' *' : '';
            const phoneRequiredMark = askPhone && !askEmail ? ' *' : '';
            const twoColumns = askEmail && askPhone && !isMobile;
            return (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: twoColumns ? '1fr 1fr' : '1fr', gap: '16px' }}>
                  {askEmail && (
                    <input
                      type="email"
                      placeholder={`Email${emailRequiredMark}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={inputStyle}
                      autoComplete="email"
                      inputMode="email"
                    />
                  )}
                  {askPhone && (
                    <input
                      type="tel"
                      placeholder={`Telefono${phoneRequiredMark}`}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={inputStyle}
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  )}
                </div>
                {askEmail && askPhone && (
                  <p style={{ margin: '-8px 0 0', fontSize: '11px', color: colors.textSoft, opacity: 0.85 }}>
                    Lascia almeno un recapito (email o telefono) per ricevere aggiornamenti sull'evento.
                  </p>
                )}
              </>
            );
          })()}

          {/* CUSTOM FIELDS RENDERING */}
          {status !== 'no' && (props.customFields || []).map((field: any) => (
            <div key={field.id} style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: colors.textSoft, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {field.label} {field.required ? '*' : ''}
              </label>
              
              {field.type === 'text' ? (
                <input 
                  type="text" 
                  placeholder="Scrivi qui la tua risposta..."
                  value={customResponses[field.id] || ""}
                  onChange={(e) => setCustomResponses(prev => ({ ...prev, [field.id]: e.target.value }))}
                  required={field.required}
                  style={inputStyle}
                />
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                   {['SÌ', 'NO'].map((opt) => (
                     <button
                        key={opt}
                        type="button"
                        onClick={() => setCustomResponses(prev => ({ ...prev, [field.id]: opt }))}
                        style={{
                          flex: 1, padding: '12px', borderRadius: '12px', 
                          border: `1px solid ${customResponses[field.id] === opt ? primaryColor : colors.allergyBorder}`,
                          background: customResponses[field.id] === opt ? primaryColor : 'transparent',
                          color: customResponses[field.id] === opt ? colors.buttonText : colors.text,
                          fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                     >
                       {opt}
                     </button>
                   ))}
                </div>
              )}
            </div>
          ))}

          {/* ALLERGIE SECTION - MANDATORY YES/NO */}
          {askIntolerances && status !== 'no' && (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: colors.textSoft, display: 'block', marginBottom: '12px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                HAI ALLERGIE O INTOLLERANZE? *
              </label>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: hasAllergies === 'yes' ? '16px' : '0' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setHasAllergies('yes');
                    setWholePartyAllergies('');
                    setAllergyPeople(defaultAllergyPeopleRows());
                    setAllergyMode('by_person');
                  }}
                  style={{ 
                    padding: '10px 24px', borderRadius: '100px', border: `1px solid ${hasAllergies === 'yes' ? primaryColor : colors.allergyBorder}`, 
                    background: hasAllergies === 'yes' ? primaryColor : 'transparent', color: hasAllergies === 'yes' ? colors.buttonText : colors.text, 
                    fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' 
                  }}
                >SÌ</button>
                <button 
                  type="button" 
                  onClick={() => { setHasAllergies('no'); setMessage(""); resetAllergyFields(); }}
                  style={{ 
                    padding: '10px 24px', borderRadius: '100px', border: `1px solid ${hasAllergies === 'no' ? primaryColor : colors.allergyBorder}`, 
                    background: hasAllergies === 'no' ? primaryColor : 'transparent', color: hasAllergies === 'no' ? colors.buttonText : colors.text, 
                    fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' 
                  }}
                >NO</button>
              </div>

              {hasAllergies === 'yes' && (
                <div style={{ animation: 'fadeIn 0.3s ease-out', marginTop: '14px' }}>
                  {Number(guestsCount) > 1 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                        marginBottom: '14px',
                      }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: colors.text,
                          userSelect: 'none',
                          maxWidth: '100%',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={allergyMode === 'whole_party'}
                          onChange={(e) => {
                            const on = e.target.checked;
                            if (on) {
                              const first = allergyPeople.find((p) => p.allergies.trim());
                              setWholePartyAllergies(first?.allergies?.trim() || '');
                              setAllergyMode('whole_party');
                              setAllergyPeople(defaultAllergyPeopleRows());
                            } else {
                              const t = wholePartyAllergies.trim();
                              setAllergyMode('by_person');
                              setWholePartyAllergies('');
                              setAllergyPeople(t ? [{ name: '', allergies: t }] : defaultAllergyPeopleRows());
                            }
                          }}
                          style={{ width: '18px', height: '18px', flexShrink: 0, accentColor: primaryColor }}
                        />
                        <span>Stessa allergia per tutti gli ospiti</span>
                      </label>
                    </div>
                  )}

                  {Number(guestsCount) > 1 && allergyMode === 'whole_party' && (
                    <div style={{ marginBottom: '12px' }}>
                      <textarea
                        placeholder={"Descrizione dell'allergia o intolleranza condivisa da tutti *"}
                        value={wholePartyAllergies}
                        onChange={(e) => setWholePartyAllergies(e.target.value)}
                        rows={3}
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    </div>
                  )}

                  {((Number(guestsCount) > 1 && allergyMode !== 'whole_party') || Number(guestsCount) <= 1) && (
                    <div style={{ marginTop: Number(guestsCount) > 1 && allergyMode === 'by_person' ? '0' : '0' }}>
                      {allergyPeople.map((row, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'grid',
                            gap: '10px',
                            marginBottom: '12px',
                            alignItems: 'center',
                            gridTemplateColumns:
                              Number(guestsCount) <= 1
                                ? '1fr'
                                : allergyPeople.length > 1
                                  ? 'minmax(0,1fr) minmax(0,1.15fr) auto'
                                  : 'minmax(0,1fr) minmax(0,1.15fr)',
                          }}
                        >
                          {Number(guestsCount) > 1 && (
                            <input
                              type="text"
                              autoComplete="off"
                              placeholder="Nome (opz.)"
                              value={row.name}
                              onChange={(e) => {
                                const v = e.target.value;
                                setAllergyPeople((prev) => prev.map((p, i) => (i === idx ? { ...p, name: v } : p)));
                              }}
                              style={inputStyle}
                            />
                          )}
                          <input
                            type="text"
                            autoComplete="off"
                            placeholder={
                              Number(guestsCount) <= 1
                                ? 'Allergia o intolleranza *'
                                : 'Allergia o intolleranza *'
                            }
                            value={row.allergies}
                            onChange={(e) => {
                              const v = e.target.value;
                              setAllergyPeople((prev) => prev.map((p, i) => (i === idx ? { ...p, allergies: v } : p)));
                            }}
                            style={inputStyle}
                          />
                          {Number(guestsCount) > 1 && allergyPeople.length > 1 ? (
                            <button
                              type="button"
                              aria-label={`Rimuovi persona ${idx + 1}`}
                              title="Rimuovi questa riga"
                              onClick={() =>
                                setAllergyPeople((prev) => prev.filter((_, i) => i !== idx))
                              }
                              style={{
                                border: `1px solid ${colors.allergyBorder}`,
                                background: colors.toggleBg,
                                borderRadius: '12px',
                                padding: '12px',
                                cursor: 'pointer',
                                color: '#c45c52',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Trash2 size={18} aria-hidden />
                            </button>
                          ) : null}
                        </div>
                      ))}
                      {allergyMode !== 'whole_party' && Number(guestsCount) > 1 && allergyPeople.length < 12 && (
                        <button
                          type="button"
                          onClick={() => setAllergyPeople((p) => [...p, { name: '', allergies: '' }])}
                          style={{
                            marginTop: '4px', padding: '10px 14px', borderRadius: '12px', border: `1px dashed ${colors.allergyBorder}`,
                            background: 'transparent', color: colors.textSoft, fontSize: '12px', fontWeight: 600, cursor: 'pointer', width: '100%',
                          }}
                        >
                          + Altra persona
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {(!askIntolerances && status === 'yes') || status === 'no' ? (
            <textarea 
              placeholder={status === 'no' ? "Lascia un messaggio o un augurio..." : "Altre note o messaggi speciali..."} 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          ) : null}

          {errorMsg && (
            <div style={{ color: '#ff4d4f', fontSize: '13px', textAlign: 'center', background: colors.errorBg, padding: '10px', borderRadius: '8px' }}>
              {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSending}
            style={{
              width: '100%',
              background: primaryColor,
              color: colors.buttonText,
              border: 'none',
              padding: '18px',
              borderRadius: '100px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: isSending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              opacity: isSending ? 0.7 : 1,
              transition: 'all 0.3s ease',
              marginTop: '12px',
              boxShadow: `0 8px 30px ${primaryColor}30`
            }}
          >
            {isSending ? (
               <div style={{ width: '20px', height: '20px', border: '3px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
               <><Send size={18} /> INVIA CONFERMA</>
            )}
          </button>
        </form>
      )}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input::placeholder, textarea::placeholder {
          color: ${colors.placeholder};
        }
      `}</style>
    </div>
  );
};
