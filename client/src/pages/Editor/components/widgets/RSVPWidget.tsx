import React, { useState } from 'react';
import { CheckCircle2, Users, AlertCircle, Send } from 'lucide-react';
import type { Block, EventTheme } from '../../../../types/editor';
import { apiFetch } from '../../../../utils/apiFetch';

interface RSVPWidgetProps {
  block: Block;
  theme?: EventTheme;
  readOnly?: boolean;
  eventSlug?: string;
  isMobile?: boolean; // helps with sizing
}

export const RSVPWidget: React.FC<RSVPWidgetProps> = ({ 
  block, 
  theme, 
  readOnly = false,
  eventSlug = "demo-slug",
  isMobile = false
}) => {
  const props = block.widgetProps || {};
  
  // Customization variables
  const title = props.rsvpTitle || "GENTILE CONFERMA";
  const desc = props.rsvpDescription || "Ti preghiamo di confermare la tua presenza entro il 30 Giugno.";
  const askGuests = props.rsvpAskGuests !== false; // default true
  const askIntolerances = props.rsvpAskIntolerances !== false; // default true
  const customConfirm = props.rsvpConfirmationMessage || "Grazie! La tua risposta è stata registrata con successo.";
    // Colors overriding system
  const primaryColor = props.formPrimaryColor || props.formColors?.primary || theme?.accent || '#1abc9c';
  const textColor = props.formTextColor || props.formColors?.text || '#ffffff';
  const inputBg = props.formInputBg || 'rgba(0,0,0,0.2)';

  // Internal Form State
  const [status, setStatus] = useState<"yes" | "no" | "maybe">("yes");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guestsCount, setGuestsCount] = useState(1);
  const [message, setMessage] = useState("");
  const [hasAllergies, setHasAllergies] = useState<"yes" | "no" | null>(null);
  const [customResponses, setCustomResponses] = useState<Record<string, any>>({});

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
      setErrorMsg("Per favore, indica se hai allergie o intolleranze per proseguire.");
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
          message: hasAllergies === 'yes' ? message : "Nessuna allergia segnalata",
          status,
          customResponses // Includiamo le risposte extra
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
    background: inputBg,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '14px 16px',
    color: textColor,
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
      color: textColor
    }}>

      {isDone ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '30px 20px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.05)',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <CheckCircle2 size={48} color={primaryColor} style={{ display: 'block', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
            {isUpdated ? 'Risposta Aggiornata' : 'Risposta Inviata!'}
          </h3>
          <p style={{ fontSize: '14px', color: textColor, opacity: 0.7 }}>{customConfirm}</p>
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
             background: 'rgba(255,255,255,0.05)', 
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
                  color: status === 'yes' ? '#000' : textColor,
                  opacity: status === 'yes' ? 1 : 0.5,
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
                  color: status === 'maybe' ? '#000' : textColor,
                  opacity: status === 'maybe' ? 1 : 0.5,
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
                  color: status === 'no' ? '#000' : textColor,
                  opacity: status === 'no' ? 1 : 0.5,
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                  position: 'relative', zIndex: 1, transition: 'color 0.3s'
                }}
             >
                NON POTRÒ
             </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
            <input 
              type="text" 
              placeholder="Nome e Cognome *" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              style={inputStyle}
            />
            {askGuests && status !== 'no' ? (
               <div style={{ position: 'relative' }}>
                  <Users size={18} color={textColor} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    placeholder="Num. Ospiti" 
                    value={guestsCount} 
                    onChange={e => setGuestsCount(parseInt(e.target.value))} 
                    required 
                    style={{ ...inputStyle, paddingLeft: '44px' }}
                  />
               </div>
            ) : (
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  style={inputStyle}
                />
            )}
          </div>

          {/* CUSTOM FIELDS RENDERING */}
          {status !== 'no' && (props.customFields || []).map((field: any) => (
            <div key={field.id} style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: textColor, opacity: 0.6, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                          border: `1px solid ${customResponses[field.id] === opt ? primaryColor : 'rgba(255,255,255,0.1)'}`,
                          background: customResponses[field.id] === opt ? primaryColor : 'transparent',
                          color: customResponses[field.id] === opt ? '#000' : textColor,
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
              <label style={{ fontSize: '11px', fontWeight: 600, color: textColor, opacity: 0.6, display: 'block', marginBottom: '12px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                HAI ALLERGIE O INTOLLERANZE? *
              </label>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: hasAllergies === 'yes' ? '16px' : '0' }}>
                <button 
                  type="button" 
                  onClick={() => setHasAllergies('yes')}
                  style={{ 
                    padding: '10px 24px', borderRadius: '100px', border: `1px solid ${hasAllergies === 'yes' ? primaryColor : 'rgba(255,255,255,0.1)'}`, 
                    background: hasAllergies === 'yes' ? primaryColor : 'transparent', color: hasAllergies === 'yes' ? '#000' : textColor, 
                    fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' 
                  }}
                >SÌ</button>
                <button 
                  type="button" 
                  onClick={() => { setHasAllergies('no'); setMessage(""); }}
                  style={{ 
                    padding: '10px 24px', borderRadius: '100px', border: `1px solid ${hasAllergies === 'no' ? primaryColor : 'rgba(255,255,255,0.1)'}`, 
                    background: hasAllergies === 'no' ? primaryColor : 'transparent', color: hasAllergies === 'no' ? '#000' : textColor, 
                    fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' 
                  }}
                >NO</button>
              </div>

              {hasAllergies === 'yes' && (
                <div style={{ position: 'relative', animation: 'fadeIn 0.3s ease-out', marginTop: '12px' }}>
                  <AlertCircle size={18} color={textColor} style={{ position: 'absolute', left: '16px', top: '16px', opacity: 0.4 }} />
                  <textarea 
                    placeholder="Dettaglio allergie (obbligatorio)... *" 
                    value={message} 
                    onChange={e => setMessage(e.target.value)} 
                    required
                    rows={3}
                    style={{ ...inputStyle, paddingLeft: '44px', resize: 'vertical' }}
                  />
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
            <div style={{ color: '#ff4d4f', fontSize: '13px', textAlign: 'center', background: 'rgba(255,77,79,0.1)', padding: '10px', borderRadius: '8px' }}>
              {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSending}
            style={{
              width: '100%',
              background: primaryColor,
              color: '#000',
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
          color: rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );
};
