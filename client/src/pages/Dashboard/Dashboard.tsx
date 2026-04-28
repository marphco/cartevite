import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { Surface, Button, Badge, StatCard } from "../../ui";
import { PenSquare, Send, Users, ExternalLink, Link2, Share2, Trash2, CheckCircle2, HelpCircle, XCircle, Star, Gift } from "lucide-react";
import EventPurchaseModal from "../../components/payments/EventPurchaseModal";
import { isPaidPlan } from "../../utils/eventPlan";
import "./Dashboard.css";

interface RsvpSummary {
  totalGuests: number;
  totalResponses: number;
  yesResponses: number;
  maybeResponses: number;
  noResponses: number;
}

interface Event {
  _id: string;
  slug: string;
  title: string;
  status: string;
  plan?: string;
  date?: string;
  dateTBD?: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState<string | null>(null);
  const [rsvpSummaryBySlug, setRsvpSummaryBySlug] = useState<Record<string, RsvpSummary | null>>({});
  const [unlockBanner, setUnlockBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [purchaseModal, setPurchaseModal] = useState<{ slug: string; title: string } | null>(null);

  const deleteEvent = async (slug: string) => {
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

  const buildEventUrl = (slug: string) => {
    const base = window.location.origin;
    return `${base}/e/${slug}`;
  };

  const copyLink = async (slug: string) => {
    const url = buildEventUrl(slug);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch {
      prompt("Copia il link:", url);
    }
  };

  const nativeShare = async (slug: string, title: string) => {
    const url = buildEventUrl(slug);
    const text = `Sei invitato a "${title}"!`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user cancelled
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
        const safeEvents: Event[] = Array.isArray(data) ? data : [];

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
              if (!sRes.ok) return [ev.slug, null] as [string, null];
              const sData = await sRes.json();
              return [ev.slug, sData] as [string, RsvpSummary];
            } catch {
              return [ev.slug, null] as [string, null];
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

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const unlock = searchParams.get("unlock");
    if (unlock !== "1" || !sessionId) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await apiFetch("/api/subscriptions/complete-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
          slug?: string;
          alreadyPaid?: boolean;
          alreadyPremium?: boolean;
        };
        if (cancelled) return;

        setSearchParams({}, { replace: true });

        if (!res.ok) {
          setUnlockBanner({ type: "err", text: data.message || "Impossibile confermare il pagamento." });
          return;
        }

        const slug = data.slug;
        if (slug) {
          setEvents((prev) => prev.map((e) => (e.slug === slug ? { ...e, plan: "paid" } : e)));
        }
        const already = data.alreadyPaid ?? data.alreadyPremium;
        setUnlockBanner({
          type: "ok",
          text: already
            ? "Questo evento risultava già attivato (pagamento già registrato)."
            : "Pagamento ricevuto: piano Evento attivo per il tuo invito.",
        });
      } catch {
        if (!cancelled) {
          setSearchParams({}, { replace: true });
          setUnlockBanner({
            type: "err",
            text: "Errore di rete. Se hai pagato, controlla lo stato su Stripe o riapri la dashboard tra qualche istante.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, setSearchParams]);

  const { publishedCount, paidCount, upcomingCount, totalGuests, totalResponses } = useMemo(() => {
    const published = events.filter((e) => e.status === "published").length;
    const paid = events.filter((e) => isPaidPlan(e.plan)).length;
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
      paidCount: paid,
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
        {unlockBanner ? (
          <Surface
            variant="glass"
            className="dashboard-unlock-banner"
            style={{
              marginBottom: "1.25rem",
              borderColor: unlockBanner.type === "ok" ? "rgba(58, 230, 179, 0.45)" : "rgba(255, 120, 120, 0.35)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
              <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.5 }}>
                {unlockBanner.type === "ok" ? (
                  <CheckCircle2 size={18} style={{ display: "inline", marginRight: 8, verticalAlign: "text-top", color: "var(--accent)" }} />
                ) : (
                  <XCircle size={18} style={{ display: "inline", marginRight: 8, verticalAlign: "text-top", color: "salmon" }} />
                )}
                {unlockBanner.text}
              </p>
              <Button variant="ghost" type="button" onClick={() => setUnlockBanner(null)}>
                Chiudi
              </Button>
            </div>
          </Surface>
        ) : null}

        <div className="dashboard-header">
          <div className="dashboard-title-block">
            <div style={{ marginBottom: "1rem" }}>
              <img 
                src="/logo-eenvee.svg" 
                alt="eenvee" 
                style={{ 
                  height: "45px", 
                  display: "block"
                }} 
              />
            </div>
            <h1>I tuoi inviti digitali</h1>
            <p>Gestisci eventi, RSVP, regali e pagamenti in un unico pannello dal design elegante.</p>
          </div>

          <div className="ui-toolbar__actions">
            <Button variant="ghost" onClick={() => navigate("/")} style={{ opacity: 0.7 }}>
              Home eenvee
            </Button>
            <Button
              variant="outline"
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
          <StatCard label="Eventi pubblicati" value={publishedCount} hint={`${paidCount} con piano Evento`} />
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
              const paid = isPaidPlan(ev.plan);
              const published = ev.status === "published";

              return (
                <div key={ev._id} className="event-card">
                  <div className="event-card__herostamp">{ev.slug}</div>

                  <h2>{ev.title}</h2>
                  <div className="event-card__meta">
                    <Badge variant={paid ? "accent" : "default"}>
                      {paid ? (
                        <>
                          <Star size={12} fill="currentColor" style={{ marginRight: 4, verticalAlign: "middle" }} /> Attivo
                        </>
                      ) : (
                        "Lancio (gratis)"
                      )}
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
                      variant="primary"
                      onClick={() => navigate(`/invites/${ev.slug}`)}
                    >
                      <Send size={16} style={{marginRight: 6}} /> Invia Inviti
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/rsvps/${ev.slug}`)}
                    >
                      <Users size={16} style={{marginRight: 6}} /> Vedi RSVP
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/gifts/${ev.slug}`)}
                    >
                      <Gift size={16} style={{ marginRight: 6 }} /> Regali e donazioni
                    </Button>
                    
                    <div className="event-card__actions-secondary">
                      {!paid && (
                        <Button
                          variant="ghost"
                          type="button"
                          onClick={() => setPurchaseModal({ slug: ev.slug, title: ev.title })}
                          style={{ color: "var(--accent)", border: "1px solid var(--accent)", marginRight: "auto" }}
                        >
                          <Star size={14} style={{ marginRight: 6 }} /> Attiva evento (69 €)
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

      {purchaseModal ? (
        <EventPurchaseModal
          open
          eventSlug={purchaseModal.slug}
          eventTitle={purchaseModal.title}
          onClose={() => setPurchaseModal(null)}
          onUnlocked={(slug) => {
            setEvents((prev) => prev.map((e) => (e.slug === slug ? { ...e, plan: "paid" } : e)));
          }}
        />
      ) : null}
    </div>
  );
}
