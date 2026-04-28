import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { Button } from "../../ui";
import EventPurchaseModal from "../../components/payments/EventPurchaseModal";
import "./EventActivate.css";

/**
 * Dopo la creazione evento: pagamento prima dell’editor.
 * Se l’evento è già a piano pagato, reindirizza all’editor.
 */
export default function EventActivate() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [showPay, setShowPay] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Percorso non valido.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(`/api/events/${slug}/private`);
        if (!res.ok) {
          setError("Non troviamo questo evento o non hai i permessi per gestirlo.");
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setTitle(typeof data.title === "string" && data.title.trim() ? data.title.trim() : "Il tuo evento");
        if (data.plan === "paid") {
          navigate(`/edit/${slug}`, { replace: true });
          return;
        }
        setShowPay(true);
      } catch {
        if (!cancelled) setError("Impossibile caricare l’evento. Riprova tra poco.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="event-activate-page">
        <div className="event-activate-card" role="status">
          <p className="event-activate-loading">Caricamento…</p>
        </div>
      </div>
    );
  }

  if (error || !slug) {
    return (
      <div className="event-activate-page">
        <div className="event-activate-card">
          <p className="event-activate-error">{error || "Qualcosa non ha funzionato."}</p>
          <Button type="button" onClick={() => navigate("/dashboard")}>
            Vai alla dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-activate-page">
      <nav className="event-activate-nav">
        <Button variant="ghost" type="button" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </Button>
      </nav>
      <div className="event-activate-shell">
        <header className="event-activate-head">
          <h1 className="event-activate-title">Attiva l’evento</h1>
          <p className="event-activate-lede">
            Pagamento 69&nbsp;€ per attivare l’evento. Subito dopo apri l’editor su invito, busta e
            pagina.
          </p>
        </header>
      </div>

      {showPay ? (
        <EventPurchaseModal
          open
          eventSlug={slug}
          eventTitle={title}
          paymentTitle="Attiva l’evento"
          onClose={() => navigate("/dashboard")}
          onUnlocked={(s) => navigate(`/edit/${s}`, { replace: true })}
        />
      ) : null}
    </div>
  );
}
