import { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { resolveImageUrl, API_BASE } from "../config/api";
import { apiFetch } from "../utils/apiFetch";
import { Surface, Button, Badge } from "../ui";
import EnvelopeAnimation from "../components/EnvelopeAnimation";
import ReadOnlyCanvas from "../components/ReadOnlyCanvas";
import { Calendar, MapPin, Users, Send } from "lucide-react";
import "./EventPublic.css";

export default function EventPublic() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpGuests, setRsvpGuests] = useState(1);
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState("yes");
  const [rsvpSending, setRsvpSending] = useState(false);
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [rsvpPhone, setRsvpPhone] = useState("");
  const [editLink, setEditLink] = useState("");
  const [rsvpWasUpdated, setRsvpWasUpdated] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/events/${slug}`);
        if (!res.ok) {
          throw new Error("Evento non trovato");
        }
        const data = await res.json();
        setEditLink(data.editLink || "");
        setEvent(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    setRsvpError("");
    setRsvpDone(false);
    setRsvpWasUpdated(false);
    setRsvpSending(true);

    try {
      const res = await apiFetch(`/api/rsvps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug: slug,
          name: rsvpName,
          email: rsvpEmail || null,
          phone: rsvpPhone || null,
          guestsCount: Number(rsvpGuests) || 1,
          message: rsvpMessage,
          status: rsvpStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Errore nell'invio RSVP");
      }

      const data = await res.json();
      setRsvpWasUpdated(!!data.updated);

      setRsvpDone(true);
      setRsvpName("");
      setRsvpGuests(1);
      setRsvpMessage("");
      setRsvpStatus("yes");
    } catch (err) {
      console.error(err);
      setRsvpError("Non siamo riusciti a registrare la tua risposta. Riprova.");
    } finally {
      setRsvpSending(false);
    }
  };

  const pageTheme = useMemo(() => {
    const accent = event?.theme?.accent || "#f4c46b";
    const bg = event?.theme?.background || "#050506";
    const fonts = event?.theme?.fonts || { heading: "Playfair Display", body: "Space Grotesk" };
    return { accent, bg, fonts };
  }, [event]);

  if (loading) return <div className="event-public-page">Caricamento...</div>;
  if (!event) return <div className="event-public-page">Evento non trovato.</div>;

  if (event.status !== "published") {
    return (
      <div className="event-public-page">
        <div className="event-public-shell">
          <Surface variant="glass">
            <h1>{event.title}</h1>
            <p style={{ opacity: 0.8 }}>Questo evento non è ancora stato pubblicato.</p>
            <p style={{ marginTop: "1rem", opacity: 0.6 }}>Torna più tardi ✨</p>
          </Surface>
        </div>
      </div>
    );
  }

  const orderedBlocks = [...(event.blocks || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const renderRsvpBlock = (key) => (
    <section key={key} className="event-section">
      <h2>Conferma la tua presenza</h2>
      <form onSubmit={handleRsvpSubmit} className="rsvp-form">
        <input
          type="text"
          required
          placeholder="Il tuo nome"
          value={rsvpName}
          onChange={(e) => setRsvpName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email (obbligatoria se non metti telefono)"
          value={rsvpEmail}
          onChange={(e) => setRsvpEmail(e.target.value)}
        />

        <input
          type="tel"
          placeholder="Telefono (opzionale)"
          value={rsvpPhone}
          onChange={(e) => setRsvpPhone(e.target.value)}
        />

        <input
          type="number"
          min="1"
          placeholder="Numero di partecipanti"
          value={rsvpGuests}
          onChange={(e) => setRsvpGuests(e.target.value)}
        />

        <select value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value)}>
          <option value="yes">Parteciperò</option>
          <option value="maybe">Forse</option>
          <option value="no">Non posso</option>
        </select>

        <textarea
          placeholder="Messaggio opzionale"
          rows={3}
          value={rsvpMessage}
          onChange={(e) => setRsvpMessage(e.target.value)}
        />

        <Button type="submit" disabled={rsvpSending} style={{ backgroundColor: pageTheme.accent, color: "var(--bg-body)" }}>
          <Send size={18} style={{ marginRight: "0.5rem" }} />
          {rsvpSending ? "Invio in corso..." : "Invia risposta"}
        </Button>

        {rsvpDone && (
          <p style={{ color: "#3ae6b3" }}>
            {rsvpWasUpdated ? "✅ Abbiamo aggiornato la tua RSVP!" : "✅ Grazie, risposta registrata!"}
          </p>
        )}

        {rsvpError && <p style={{ color: "salmon" }}>{rsvpError}</p>}

        {editLink && (
          <Surface variant="soft" style={{ marginTop: "0.75rem" }}>
            <p style={{ margin: 0 }}>Puoi modificare la tua risposta con questo link:</p>
            <code style={{ display: "block", marginTop: "0.4rem" }}>
              {window.location.origin}
              {editLink}
            </code>
            <Button
              variant="ghost"
              style={{ marginTop: "0.5rem" }}
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}${editLink}`)}
            >
              Copia link modifica
            </Button>
          </Surface>
        )}
      </form>
    </section>
  );

  return (
    <div className="event-public-page" style={{ backgroundColor: pageTheme.bg, position: 'relative', overflow: 'hidden' }}>
      {/* Sfondo Scenario */}
      {/* Sfondo Colore Scenario di base */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: event.theme?.heroBgColor || 'var(--bg-body)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Sfondo Immagine Scenario con Opacità */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        backgroundImage: (event.theme?.heroBg && !event.theme.heroBg.startsWith('#') && !event.theme.heroBg.startsWith('rgb')) 
          ? `url(${event.theme.heroBg})` 
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: event.theme?.heroBgPosition || 'center',
        opacity: (event.theme?.heroBg && !event.theme.heroBg.startsWith('#') && !event.theme.heroBg.startsWith('rgb')) ? (event.theme?.heroBgOpacity ?? 1) : 0,
        pointerEvents: 'none'
      }} />

      <div className="event-public-shell" style={{ fontFamily: pageTheme.fonts.body, position: 'relative', zIndex: 1 }}>
        <EnvelopeAnimation
          guestName={event.theme?.coverText}
          envelopeColor={event.theme?.coverBg}
          pocketColor={event.theme?.coverPocketColor}
          linerImg={event.theme?.coverLiner}
          pocketLinerImg={event.theme?.coverPocketLiner}
          linerX={event.theme?.linerX || 0}
          linerY={event.theme?.linerY || 0}
          linerScale={event.theme?.linerScale || 1}
          linerOpacity={event.theme?.linerOpacity ?? 1}
          linerColor={event.theme?.coverLinerColor || '#ffffff'}
          canvasProps={event.canvas}
          onOpenComplete={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          {event.layers && event.canvas ? (
            <ReadOnlyCanvas layers={event.layers} canvasProps={event.canvas} />
          ) : (
            <div className="hero-card">
              <Badge variant="accent" style={{ backgroundColor: pageTheme.accent, color: "var(--bg-body)", border: "none" }}>Invito digitale</Badge>
              <h1 style={{ fontFamily: pageTheme.fonts.heading }}>{event.title}</h1>
              {event.dateTBD ? (
                <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <Calendar size={18} color={pageTheme.accent} /> Data da definire
                </p>
              ) : event.date ? (
                <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <Calendar size={18} color={pageTheme.accent} /> {new Date(event.date).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              ) : null}
            </div>
          )}
        </EnvelopeAnimation>

        <div className="event-public-content">
          {orderedBlocks.length === 0 ? (
          <Surface variant="glass" style={{ marginTop: "2rem" }}>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              Il creatore dell'evento sta ancora preparando i contenuti.
            </p>
          </Surface>
        ) : (
          orderedBlocks.map((block) => {
            if (block.type === "text") {
              const layoutPreset = block.props.layoutPreset || "single";
              return (
                <section key={block.id} className={`event-section text-block layout-${layoutPreset}`}>
                  {block.props.heading && <h2>{block.props.heading}</h2>}
                  {block.props.body && <p>{block.props.body}</p>}
                </section>
              );
            }

            if (block.type === "map") {
              const title = block.props?.title || "";
              const address = block.props?.address || "";
              const mapUrl = block.props?.mapUrl || "";
              const fallbackUrl = address
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
                : "";
              const finalUrl = mapUrl || fallbackUrl;
              const embedUrl = address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed` : "";

              return (
                <section key={block.id} className="event-section">
                  <h2>{title || "Come arrivare"}</h2>
                  {address && (
                    <p style={{ opacity: 0.85, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                       <MapPin size={18} color={pageTheme.accent} /> {address}
                    </p>
                  )}

                  {embedUrl ? (
                    <div
                      style={{
                        width: "100%",
                        height: "280px",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <iframe
                        title={`map-${block.id}`}
                        src={embedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  ) : (
                    <p style={{ opacity: 0.7 }}>Indirizzo non disponibile.</p>
                  )}

                  {finalUrl && (
                    <Button as="a" href={finalUrl} target="_blank" rel="noreferrer" variant="ghost">
                      Apri su Google Maps
                    </Button>
                  )}
                </section>
              );
            }

            if (block.type === "rsvp") {
              return renderRsvpBlock(block.id || block._id);
            }

            if (block.type === "gallery") {
              const images = (block.props?.images || []).map(resolveImageUrl);

              return (
                <section key={block.id} className="event-section gallery-section">
                  <h2>Gallery</h2>
                  {images.length === 0 ? (
                    <p style={{ opacity: 0.7 }}>Nessuna immagine disponibile.</p>
                  ) : (
                    <div className="gallery-masonry">
                      {images.map((url, i) => (
                        <figure key={`${block.id}-pub-img-${i}`} className="gallery-masonry__item">
                          <img src={url} alt={`gallery-${i}`} />
                        </figure>
                      ))}
                    </div>
                  )}
                </section>
              );
            }

            if (block.type === "photo") {
              const imageUrl = block.props?.image ? resolveImageUrl(block.props.image) : null;
              if (!imageUrl) return null;
              const variant = block.props.variant || "full";
              const caption = block.props.caption || "";
              const ctaLabel = block.props.ctaLabel || "";
              const ctaLink = block.props.ctaLink || "";

              return (
                <section key={block.id} className={`event-section photo-block photo-block--${variant}`}>
                  <div className="photo-block__media">
                    <img src={imageUrl} alt={caption || "Foto"} />
                  </div>
                  {(caption || ctaLabel) && (
                    <div className="photo-block__meta">
                      {caption && <p>{caption}</p>}
                      {ctaLabel && ctaLink && (
                        <Button as="a" href={ctaLink} target="_blank" rel="noreferrer" variant="ghost">
                          {ctaLabel}
                        </Button>
                      )}
                    </div>
                  )}
                </section>
              );
            }

            return null;
          })
        )}
        </div>
      </div>
    </div>
  );
}
