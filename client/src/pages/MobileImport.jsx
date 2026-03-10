import { useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";
import { Surface, Button, Badge } from "../ui";
import { BookUser, CheckCircle2 } from "lucide-react";

export default function MobileImport() {
  const { slug } = useParams();
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleNativeContactPicker = async () => {
    const supported = ("contacts" in navigator && "ContactsManager" in window);
    if (!supported) {
      alert("Il tuo browser cellulare non supporta questa API nativa.");
      return;
    }

    try {
      const props = ["name", "tel", "email"];
      const opts = { multiple: true };
      const contacts = await navigator.contacts.select(props, opts);
      
      if (!contacts || contacts.length === 0) return;

      setStatus("loading");

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
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <Surface variant="glass" style={{ textAlign: "center", padding: "3rem", width: "100%", maxWidth: "400px" }}>
        
        {status === "success" ? (
          <div>
            <CheckCircle2 size={64} style={{ color: "#3ae6b3", margin: "0 auto 1.5rem" }} />
            <h1 style={{ marginBottom: "0.5rem" }}>Rubrica Importata!</h1>
            <p style={{ color: "var(--text-muted)" }}>I tuoi contatti sono stati aggiunti all'evento. Ora puoi chiudere questa pagina e tornare al computer.</p>
          </div>
        ) : (
          <div>
            <div style={{ width: 80, height: 80, background: "rgba(255,255,255,0.05)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <BookUser size={40} style={{ color: "var(--accent)" }} />
            </div>
            <h1 style={{ marginBottom: "0.5rem" }}>Trasferisci Contatti</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
              Tocca il pulsante per selezionare dalla tua rubrica del telefono i contatti da invitare. Verranno inviati in tempo reale sul tuo computer.
            </p>

            <Button onClick={handleNativeContactPicker} disabled={status === "loading"} style={{ width: "100%", padding: "1rem" }}>
              {status === "loading" ? "Invio in corso..." : "Apri Rubrica Telefono"}
            </Button>
            
            {status === "error" && (
              <Badge variant="warning" style={{ marginTop: "1rem" }}>C'è stato un problema. Riprova.</Badge>
            )}
          </div>
        )}
      </Surface>
    </div>
  );
}
