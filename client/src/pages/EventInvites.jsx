import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";
import { Surface, Button, Badge } from "../ui";
import { Users, Mail, MessageCircle, MessageSquare, ClipboardPaste, BookUser, QrCode, FileSpreadsheet } from "lucide-react";
import "./EventInvites.css";

export default function EventInvites() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [invites, setInvites] = useState([]);
  const [eventTitle, setEventTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // Form stato
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualChannel, setManualChannel] = useState("whatsapp");
  const [adding, setAdding] = useState(false);

  // Incolla Rapido (iOS fallback)
  const [quickPaste, setQuickPaste] = useState("");
  const [parsing, setParsing] = useState(false);

  // Selezione per invio bulk
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function fetchInvites() {
      try {
        const evRes = await apiFetch(`/api/events/${slug}/private`);
        if (evRes.ok) {
          const evData = await evRes.json();
          setEventTitle(evData.title || slug);
        } else {
          setEventTitle(slug);
        }

        const invRes = await apiFetch(`/api/events/${slug}/invites`);
        if (invRes.ok) {
          const invData = await invRes.json();
          setInvites(Array.isArray(invData) ? invData : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchInvites();
  }, [slug]);

  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    setAdding(true);

    try {
      const res = await apiFetch(`/api/events/${slug}/invites`, {
        method: "POST",
        body: JSON.stringify({
          contacts: [{
            name: manualName,
            phone: manualPhone,
            email: manualEmail,
            channel: manualChannel,
          }]
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setInvites(prev => [...created, ...prev]);
        setManualName("");
        setManualPhone("");
        setManualEmail("");
      }
    } catch {
      alert("Errore aggiunta contatto.");
    } finally {
      setAdding(false);
    }
  };

  const handleNativeContactPicker = async () => {
    // Contact picker setup as requested
    const supported = ("contacts" in navigator && "ContactsManager" in window);
    if (!supported) {
      alert("Il tuo browser nativo non supporta questa API. Usa l'inserimento manuale o Incolla in basso.");
      return;
    }

    try {
      const props = ["name", "tel", "email"];
      const opts = { multiple: true };
      const contacts = await navigator.contacts.select(props, opts);
      
      if (!contacts || contacts.length === 0) return;

      const parsedContacts = contacts.map(c => ({
        name: (c.name && c.name[0]) || "Sconosciuto",
        phone: (c.tel && c.tel[0]) || "",
        email: (c.email && c.email[0]) || "",
        channel: "whatsapp"
      }));

      const res = await apiFetch(`/api/events/${slug}/invites`, {
          method: "POST",
          body: JSON.stringify({ contacts: parsedContacts }),
      });

      if (res.ok) {
        const created = await res.json();
        setInvites(prev => [...created, ...prev]);
      }
    } catch (e) {
      console.error(e);
      alert("Selezione contatti annullata o fallita.");
    }
  };

  const processContactsText = async (text) => {
    // Basic text parser: line by line
    const lines = text.split("\n").filter(l => l.trim() !== "");
    const parsedContacts = [];

    lines.forEach(line => {
      // Regex
      const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const telMatch = line.match(/[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*[0-9]{3,}/);
      
      const email = emailMatch ? emailMatch[0] : "";
      const phone = telMatch ? telMatch[0].trim() : "";
      
      let name = line.replace(email, "").replace(phone, "").trim();
      if (!name) name = "Ospite";
      name = name.replace(/^[-,\s]+|[-,\s]+$/g, '');

      if (name || phone || email) {
          parsedContacts.push({ name, phone, email, channel: "whatsapp" });
      }
    });

    if (parsedContacts.length > 0) {
      const res = await apiFetch(`/api/events/${slug}/invites`, {
          method: "POST",
          body: JSON.stringify({ contacts: parsedContacts }),
      });

      if (res.ok) {
        const created = await res.json();
        setInvites(prev => [...created, ...prev]);
        alert(`Aggiunti ${created.length} contatti!`);
      }
    }
  };

  const handleQuickPaste = async () => {
    if (!quickPaste.trim()) return;
    setParsing(true);
    try {
      await processContactsText(quickPaste);
      setQuickPaste("");
    } catch {
      alert("Errore inserimento in blocco.");
    } finally {
      setParsing(false);
    }
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setParsing(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        await processContactsText(evt.target.result);
      } catch (err) {
        console.error(err);
        alert("Errore nella lettura del file CSV.");
      } finally {
        setParsing(false);
        e.target.value = null; // reset input
      }
    };
    reader.readAsText(file);
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === invites.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(invites.map(i => i._id)));
    }
  };

  const handleSendSelected = async () => {
    if (selectedIds.size === 0) return;
    setSending(true);

    try {
      const res = await apiFetch(`/api/events/${slug}/invites/send`, {
        method: "POST",
        body: JSON.stringify({
          inviteIds: Array.from(selectedIds),
          messageTemplate: "Ciao {name}, sei invitato!"
        }),
      });

      if (res.ok) {
        // optimistically update statuses
        setInvites(prev => prev.map(inv => {
          if (selectedIds.has(inv._id)) {
            return { ...inv, status: "sent", sentAt: new Date().toISOString() };
          }
          return inv;
        }));
        setSelectedIds(new Set());
        alert("Ordini di invio presi in carico dal server (mockup)!");
      }
    } catch {
      alert("Errore invio messaggi.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="invites-page">Caricamento...</div>;

  return (
    <div className="invites-page">
      <div className="invites-shell">
        <div className="invites-topbar">
          <Button variant="ghost" onClick={() => navigate(`/dashboard`)}>
            ← Torna alla dashboard
          </Button>
          <div>
            <p className="invites-eyebrow">RUBRICA & INVITI</p>
            <h1>{eventTitle}</h1>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              Importa contatti e orchestra l'invio multicanale.
            </p>
          </div>
        </div>

        <div className="invites-actions-grid">
          <Surface variant="soft" className="invites-card">
            <h3>Aggiunta manuale</h3>
            <form onSubmit={handleManualAdd} className="invites-form">
              <input type="text" placeholder="Nome contatto" value={manualName} onChange={e => setManualName(e.target.value)} required />
              <input type="tel" placeholder="Telefono (per WhatsApp/SMS)" value={manualPhone} onChange={e => setManualPhone(e.target.value)} />
              <input type="email" placeholder="Email" value={manualEmail} onChange={e => setManualEmail(e.target.value)} />
              <select value={manualChannel} onChange={e => setManualChannel(e.target.value)}>
                <option value="whatsapp">💬 WhatsApp</option>
                <option value="sms">📱 SMS</option>
                <option value="email">✉️ Email</option>
              </select>
              <Button type="submit" disabled={adding}>{adding ? "Aggiungo..." : "Aggiungi alla rubrica"}</Button>
            </form>
          </Surface>

          <Surface variant="soft" className="invites-card">
            <h3>Importazione Multipla</h3>
            <p className="hint">
              <strong>Desktop:</strong> Carica un CSV o inquadra il QR per catturare i contatti del telefono.<br/>
              <strong>Mobile:</strong> Usa il tasto Rubrica per un accesso diretto.
            </p>
            
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <Button style={{ flex: 1 }} onClick={handleNativeContactPicker}>
                <BookUser size={16} style={{marginRight: 6}} /> Rubrica Nativa
              </Button>
              <Button variant="outline" style={{ flex: 1, position: "relative" }}>
                 <FileSpreadsheet size={16} style={{marginRight: 6}} /> Carica CSV
                 <input 
                    type="file" 
                    accept=".csv,.txt" 
                    onChange={handleCsvUpload} 
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} 
                 />
              </Button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-md)" }}>
               <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + "/import/" + slug)}`} 
                  alt="QR Code Import" 
                  style={{ width: "80px", height: "80px", borderRadius: "8px", border: "4px solid white" }} 
               />
               <div>
                  <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "0.95rem" }}><QrCode size={14} style={{verticalAlign:"middle"}}/> Importa da Cellulare</h4>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>Sei su PC? Prendi il telefono, inquadra questo codice e i contatti scelti appariranno magicamente qui. Ricarica la pagina dopo l'invio.</p>
               </div>
            </div>

            <div className="quick-paste-zone">
              <label>Incolla Lista (es. Giovanni 3331234567)</label>
              <textarea 
                placeholder="Marco 333444555&#10;Anna anna@mail.com" 
                rows={3} 
                value={quickPaste}
                onChange={e => setQuickPaste(e.target.value)}
              />
              <Button variant="ghost" onClick={handleQuickPaste} disabled={parsing || !quickPaste}>
                 <ClipboardPaste size={16} style={{marginRight: 6}} /> Aggiungi
              </Button>
            </div>
            
          </Surface>
          
          <Surface variant="soft" className="invites-card compose-card">
              <h4>Componi Messaggio Globale</h4>
              <textarea placeholder="Ciao {name}, sei invitato al mio evento! Clicca qui: {link}" rows={4} style={{ width: "100%", marginTop: "0.5rem" }} />
              <Button style={{ marginTop: "0.5rem", width: "100%" }} onClick={handleSendSelected} disabled={selectedIds.size === 0 || sending}>
                 Invia ai selezionati ({selectedIds.size})
              </Button>
          </Surface>
        </div>

        <div className="invites-list-container">
          <div className="invites-list-header">
            <h3>Contatti Rubrica ({invites.length})</h3>
            <Button variant="ghost" onClick={selectAll}>Seleziona tutti</Button>
          </div>
          
          {invites.length === 0 ? (
            <Surface variant="glass" style={{ textAlign: "center", padding: "3rem" }}>
               Nessun contatto presente in rubrica.
            </Surface>
          ) : (
            <div className="invites-table">
              {invites.map(inv => (
                <div key={inv._id} className={`invite-row ${selectedIds.has(inv._id) ? "selected" : ""}`} onClick={() => toggleSelect(inv._id)}>
                  <input type="checkbox" checked={selectedIds.has(inv._id)} readOnly />
                  <div className="invite-info">
                    <strong>{inv.name}</strong>
                    <div className="invite-meta">
                      {inv.phone && <span>{inv.phone}</span>}
                      {inv.email && <span>{inv.email}</span>}
                    </div>
                  </div>
                  <div className="invite-status">
                    <Badge variant={inv.status === "sent" ? "success" : "default"}>
                       {inv.status === "sent" ? "✅ Inviato" : "⏳ In attesa"}
                    </Badge>
                  </div>
                  <div className="invite-channel">
                    {inv.channel === "whatsapp" && <MessageCircle size={18} color="#25D366" />}
                    {inv.channel === "sms" && <MessageSquare size={18} color="#8b7bff" />}
                    {inv.channel === "email" && <Mail size={18} color="#f4c46b" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
