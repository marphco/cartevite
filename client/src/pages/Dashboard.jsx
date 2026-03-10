import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";
import { Surface, Button, Badge, StatCard } from "../ui";
import { PenSquare, Send, Users, ExternalLink, Link2, Share2, Trash2, CheckCircle2, HelpCircle, XCircle, Star } from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState(null);
  const [rsvpSummaryBySlug, setRsvpSummaryBySlug] = useState({});

  const deleteEvent = async (slug) => {
    try {
      const res = await apiFetch(`/api/events/${slug}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Errore eliminazione");

      setEvents((prev) => prev.filter((e) => e.slug !== slug));
      setConfirmDeleteSlug(null);

      setRsvpSummaryBySlug((prev) => {
        const copy = { ...prev };
        delete copy[slug];
        return copy;
      });
    } catch (err) {
      console.error(err);
      alert("Non siamo riusciti a eliminare l'evento. Riprova.");
    }
  };

  const buildEventUrl = (slug) => {
    const base = window.location.origin;
    return `${base}/e/${slug}`;
  };

  const copyLink = async (slug) => {
    const url = buildEventUrl(slug);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch {
      prompt("Copia il link:", url);
    }
  };

  const nativeShare = async (slug, title) => {
    const url = buildEventUrl(slug);
    const text = `Sei invitato a "${title}"!`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // utente annulla → niente
      }
    } else {
      copyLink(slug);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const meRes = await apiFetch(`/api/auth/me`);

        if (!meRes.ok) throw new Error("Errore auth check");

        const meData = await meRes.json();
        if (!meData.user) {
          navigate("/login");
          return;
        }

        const res = await apiFetch(`/api/events`);

        if (!res.ok) throw new Error("Errore fetch eventi");

        const data = await res.json();
        const safeEvents = Array.isArray(data) ? data : [];

        if (!cancelled) {
          setEvents(safeEvents);
        }

        if (!safeEvents.length) {
          if (!cancelled) setRsvpSummaryBySlug({});
          return;
        }

        const summaries = await Promise.all(
          safeEvents.map(async (ev) => {
            try {
              const sRes = await apiFetch(`/api/events/${ev.slug}/rsvps/summary`);
              if (!sRes.ok) return [ev.slug, null];
              const sData = await sRes.json();
              return [ev.slug, sData];
            } catch {
              return [ev.slug, null];
            }
          })
        );

        if (!cancelled) {
          setRsvpSummaryBySlug(Object.fromEntries(summaries));
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setEvents([]);
          setRsvpSummaryBySlug({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const { publishedCount, premiumCount, upcomingCount, totalGuests, totalResponses } = useMemo(() => {
    const published = events.filter((e) => e.status === "published").length;
    const premium = events.filter((e) => (e.plan || "").toLowerCase() === "premium").length;
    const now = Date.now();
    const upcoming = events.filter((e) => {
      if (e.dateTBD || !e.date) return true;
      const dateValue = new Date(e.date).getTime();
      return dateValue >= now;
    }).length;

    let guests = 0;
    let responses = 0;

    Object.values(rsvpSummaryBySlug).forEach((summary) => {
      if (!summary) return;
      guests += summary.totalGuests || 0;
      responses += summary.totalResponses || 0;
    });

    return {
      publishedCount: published,
      premiumCount: premium,
      upcomingCount: upcoming,
      totalGuests: guests,
      totalResponses: responses,
    };
  }, [events, rsvpSummaryBySlug]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-shell">
          <Surface variant="glass">
            <p style={{ margin: 0 }}>Caricamento…</p>
          </Surface>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="dashboard-header">
          <div className="dashboard-title-block">
            <div style={{ marginBottom: "1rem" }}>
              <img 
                src="/logo-cartevite.png" 
                alt="Cartevite" 
                style={{ 
                  height: "45px", 
                  display: "block"
                }} 
              />
            </div>
            <h1>I tuoi inviti digitali</h1>
            <p>Gestisci eventi, RSVP e pagamenti in un unico pannello dal design elegante.</p>
          </div>

          <div className="ui-toolbar__actions">
            <Button variant="ghost" onClick={() => navigate("/")} style={{ opacity: 0.7 }}>
              Home Cartevite
            </Button>
            <Button
              variant="base"
              onClick={async () => {
                await apiFetch(`/api/auth/logout`, { method: "POST" });
                window.location.href = "/";
              }}
            >
              Logout
            </Button>
            <Button onClick={() => navigate("/templates")}>+ Nuovo evento</Button>
          </div>
        </div>

        <div className="dashboard-stats">
          <StatCard label="Eventi pubblicati" value={publishedCount} hint={`${premiumCount} premium`} />
          <StatCard label="Eventi attivi/prossimi" value={upcomingCount} hint={events.length ? `${events.length} totali` : ""} />
          <StatCard label="Ospiti invitati" value={totalGuests} hint={`${totalResponses} RSVP`} />
        </div>

        {events.length === 0 ? (
          <Surface variant="glass" className="empty-state">
            <h2 style={{ marginTop: 0 }}>Ancora nessun evento</h2>
            <p style={{ marginBottom: "1.5rem" }}>
              Crea il tuo primo invito digitale e personalizzalo con il nuovo editor a blocchi.
            </p>
            <Button onClick={() => navigate("/templates")}>Scegli un design</Button>
          </Surface>
        ) : (
          <div className="events-grid">
            {events.map((ev) => {
              const sum = rsvpSummaryBySlug[ev.slug];
              const premium = (ev.plan || "").toLowerCase() === "premium";
              const published = ev.status === "published";

              return (
                <div key={ev._id} className="event-card">
                  <div className="event-card__herostamp">{ev.slug}</div>

                  <h2>{ev.title}</h2>
                  <div className="event-card__meta">
                    <Badge variant={premium ? "accent" : "default"}>
                      {premium ? <><Star size={12} fill="currentColor" style={{marginRight:4, verticalAlign:"middle"}}/> Premium</> : "Free"}
                    </Badge>
                    <Badge variant={published ? "success" : "warning"}>
                      {published ? "Pubblicato" : "Draft"}
                    </Badge>
                    {ev.dateTBD ? (
                      <Badge>Data da definire</Badge>
                    ) : ev.date ? (
                      <Badge>
                        {new Date(ev.date).toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </Badge>
                    ) : null}
                  </div>

                  {sum && sum.totalResponses > 0 ? (
                    <div className="event-card__summary" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><CheckCircle2 size={16} color="#3ae6b3"/> {sum.yesResponses}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><HelpCircle size={16} color="#f4c46b"/> {sum.maybeResponses}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><XCircle size={16} color="salmon"/> {sum.noResponses}</span>
                      <span style={{ opacity: 0.6 }}> — <Users size={14} style={{verticalAlign:"middle", margin:"0 4px"}}/> {sum.totalGuests} ospiti</span>
                    </div>
                  ) : (
                    <p className="event-card__summary" style={{ opacity: 0.6 }}>
                      Ancora nessuna risposta.
                    </p>
                  )}

                  <div className="event-card__actions grid-actions">
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/edit/${ev.slug}`)}
                    >
                      <PenSquare size={16} style={{marginRight: 6}} /> Modifica Design
                    </Button>
                    <Button
                      variant="accent"
                      onClick={() => navigate(`/invites/${ev.slug}`)}
                    >
                      <Send size={16} style={{marginRight: 6}} /> Invia Inviti
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => navigate(`/rsvps/${ev.slug}`)}
                    >
                      <Users size={16} style={{marginRight: 6}} /> Vedi RSVP
                    </Button>
                    
                    <div className="event-card__actions-secondary">
                      {!premium && (
                        <Button 
                          variant="ghost" 
                          onClick={async () => {
                             try {
                               const res = await apiFetch(`/api/payments/checkout`, {
                                 method: "POST",
                                 body: JSON.stringify({ eventSlug: ev.slug })
                               });
                               if (res.ok) {
                                 const data = await res.json();
                                 window.location.href = data.url; 
                               } else {
                                 alert("Errore generazione checkout");
                               }
                             } catch (err) {
                               console.error(err);
                               alert("Errore pagamento");
                             }
                          }}
                          style={{ color: "var(--accent)", border: "1px solid var(--accent)", marginRight: "auto" }}
                        >
                          <Star size={14} style={{marginRight:6}}/> Passa a Premium
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        onClick={() => {
                          if (!published) {
                            alert("Questo evento è ancora Draft. Pubblicalo dall’editor.");
                            return;
                          }
                          navigate(`/e/${ev.slug}`);
                        }}
                        title="Apri pagina pubblica"
                      >
                        <ExternalLink size={16}/>
                      </Button>
                      <Button
                        variant={copiedSlug === ev.slug ? "subtle" : "ghost"}
                        onClick={() => copyLink(ev.slug)}
                        title="Copia link evento"
                      >
                         <Link2 size={16}/>
                      </Button>
                      <Button variant="ghost" onClick={() => nativeShare(ev.slug, ev.title)} title="Condividi nativo">
                        <Share2 size={16}/>
                      </Button>
                      <Button
                        variant={confirmDeleteSlug === ev.slug ? "danger" : "ghost"}
                        onClick={() => {
                          if (confirmDeleteSlug === ev.slug) {
                            deleteEvent(ev.slug);
                            return;
                          }
                          setConfirmDeleteSlug(ev.slug);
                          setTimeout(() => {
                            setConfirmDeleteSlug((current) => (current === ev.slug ? null : current));
                          }, 2500);
                        }}
                        title="Elimina definitivo"
                      >
                        <Trash2 size={16} color={confirmDeleteSlug === ev.slug ? "#fff" : "currentColor"}/>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
