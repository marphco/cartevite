import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";
import { Surface, Button, Badge, StatCard } from "../ui";
import { CheckCircle2, HelpCircle, XCircle, Users } from "lucide-react";
import "./EventRsvps.css";

export default function EventRsvps() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [rsvps, setRsvps] = useState([]);
  const [eventTitle, setEventTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const [manualName, setManualName] = useState("");
  const [manualGuests, setManualGuests] = useState(1);
  const [manualStatus, setManualStatus] = useState("yes");
  const [manualSending, setManualSending] = useState(false);
  const [manualError, setManualError] = useState("");

  const [filterStatus, setFilterStatus] = useState("all");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    guestsCount: 1,
    status: "yes",
  });

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const meRes = await apiFetch("/api/auth/me");
        const meData = await meRes.json();
        if (!meData.user) throw new Error("Unauthorized");
        setAuthChecked(true);

        const evRes = await apiFetch(`/api/events/${slug}/private`);
        if (evRes.ok) {
          const evData = await evRes.json();
          setEventTitle(evData.title || slug);
        } else {
          setEventTitle(slug);
        }

        const rRes = await apiFetch(`/api/events/${slug}/rsvps`);
        if (rRes.ok) {
          const rData = await rRes.json();
          setRsvps(Array.isArray(rData) ? rData : []);
        } else {
          setRsvps([]);
        }
      } catch (err) {
        if (err.message !== "Unauthorized") {
          console.error(err);
          setRsvps([]);
          setEventTitle(slug);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [slug]);

  const counts = useMemo(() => {
    const base = {
      yesResponses: 0,
      maybeResponses: 0,
      noResponses: 0,
      yesGuests: 0,
      maybeGuests: 0,
      noGuests: 0,
    };

    for (const r of rsvps) {
      const guests = Number(r.guestsCount) || 1;
      if (r.status === "yes") {
        base.yesResponses += 1;
        base.yesGuests += guests;
      } else if (r.status === "maybe") {
        base.maybeResponses += 1;
        base.maybeGuests += guests;
      } else if (r.status === "no") {
        base.noResponses += 1;
        base.noGuests += guests;
      }
    }
    return base;
  }, [rsvps]);

  const filteredRsvps = useMemo(() => {
    if (filterStatus === "all") return rsvps;
    return rsvps.filter((r) => r.status === filterStatus);
  }, [rsvps, filterStatus]);

  const handleManualAdd = async (e) => {
    e.preventDefault();
    setManualError("");
    setManualSending(true);

    if (!manualName.trim()) return;

    try {
      const res = await apiFetch(`/api/rsvps`, {
        method: "POST",
        body: JSON.stringify({
          eventSlug: slug,
          name: manualName,
          email: null,
          phone: null,
          guestsCount: Number(manualGuests) || 1,
          message: "",
          status: manualStatus,
        }),
      });

      if (!res.ok) throw new Error("Errore aggiunta manuale");

      const data = await res.json();
      const created = data.rsvp || data;
      setRsvps((prev) => [created, ...prev]);

      setManualName("");
      setManualGuests(1);
      setManualStatus("yes");
    } catch (err) {
      console.error(err);
      setManualError("Non siamo riusciti ad aggiungere l'ospite. Riprova.");
    } finally {
      setManualSending(false);
    }
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setEditForm({
      name: r.name || "",
      guestsCount: Number(r.guestsCount) || 1,
      status: r.status || "yes",
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id) => {
    try {
      const res = await apiFetch(`/api/rsvps/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editForm.name,
          guestsCount: Number(editForm.guestsCount) || 1,
          status: editForm.status,
        }),
      });

      if (!res.ok) throw new Error("Errore update RSVP");
      const updated = await res.json();
      setRsvps((prev) => prev.map((r) => (r._id === id ? updated : r)));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Non siamo riusciti a salvare la modifica. Riprova.");
    }
  };

  const deleteRsvp = async (id) => {
    try {
      const res = await apiFetch(`/api/rsvps/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Errore delete RSVP");
      setRsvps((prev) => prev.filter((r) => r._id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error(err);
      alert("Non siamo riusciti a eliminare la RSVP. Riprova.");
    }
  };

  if (loading || !authChecked) {
    return (
      <div className="rsvp-page">
        <div className="rsvp-shell">
          <Surface variant="glass">Caricamento RSVP...</Surface>
        </div>
      </div>
    );
  }

  const filterOptions = [
    { key: "all", label: "Tutti", icon: Users },
    { key: "yes", label: "Partecipa", icon: CheckCircle2 },
    { key: "maybe", label: "Forse", icon: HelpCircle },
    { key: "no", label: "No", icon: XCircle },
  ];

  return (
    <div className="rsvp-page">
      <div className="rsvp-shell">
        <div className="rsvp-topbar">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            ← Torna alla dashboard
          </Button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p className="rsvp-eyebrow">INVITATI & RSVP</p>
              <h1>{eventTitle}</h1>
              <p style={{ margin: 0, color: "var(--text-muted)" }}>
                Gestisci conferme, aggiungi manualmente ospiti e tieni traccia delle modifiche.
              </p>
            </div>
          </div>
        </div>



        <Surface variant="glass" className="rsvp-manual-card" style={{ padding: '2rem', border: '1px solid var(--border-color-strong)' }}>
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <p className="rsvp-eyebrow" style={{ margin: 0, fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.25em' }}>AGGIUNTA MANUALE</p>
            <h2 style={{ margin: '0.4rem 0 0', fontSize: '1.6rem', fontFamily: 'var(--font-display)' }}>Inserisci un nuovo ospite</h2>
          </div>

          <form onSubmit={handleManualAdd} className="rsvp-form-grid">
            <div className="input-group">
              <label>Nome Ospite</label>
              <input
                type="text"
                required
                placeholder="Es. Mario Rossi"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="rsvp-input"
              />
            </div>

            <div className="input-group">
              <label>Numero Ospiti</label>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={manualGuests}
                onChange={(e) => setManualGuests(e.target.value)}
                className="rsvp-input"
              />
            </div>

            <div className="input-group">
              <label>Stato</label>
              <select
                value={manualStatus}
                onChange={(e) => setManualStatus(e.target.value)}
                className="rsvp-select"
              >
                <option value="yes">Partecipa</option>
                <option value="maybe">Forse</option>
                <option value="no">Non può</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button type="submit" disabled={manualSending} style={{ width: '100%', height: '52px', fontWeight: 800, fontSize: '1rem' }}>
                {manualSending ? "Aggiungo..." : "Aggiungi ospite"}
              </Button>
            </div>
          </form>

          {manualError && (
            <p style={{ color: "salmon", marginTop: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>{manualError}</p>
          )}
        </Surface>

        <div className="rsvp-stats" style={{ marginTop: '2rem' }}>
          <StatCard label="Conferme" value={counts.yesResponses} hint={`${counts.yesGuests} ospiti`} />
          <StatCard label="Forse" value={counts.maybeResponses} hint={`${counts.maybeGuests} ospiti`} />
          <StatCard label="Non possono" value={counts.noResponses} hint={`${counts.noGuests} ospiti`} />
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>
          <p className="rsvp-eyebrow" style={{ marginBottom: '0.8rem', opacity: 0.8 }}>Filtra per stato:</p>
          <Surface variant="soft" className="rsvp-filters" style={{ margin: 0 }}>
            {filterOptions.map((opt) => {
              const isSelected = filterStatus === opt.key;
              let bgColor = "transparent";
              let color = "var(--text-soft)";
              
              if (isSelected) {
                if (opt.key === "yes") {
                  bgColor = "rgba(var(--accent-rgb), 0.1)";
                  color = "var(--accent)";
                } else if (opt.key === "maybe") {
                  bgColor = "rgba(244, 196, 107, 0.15)";
                  color = "#d9a13e";
                } else if (opt.key === "no") {
                  bgColor = "rgba(250, 128, 114, 0.15)";
                  color = "#e66a5c";
                } else {
                  bgColor = "var(--accent)";
                  color = "#fff";
                }
              }

              return (
                <Button
                  key={opt.key}
                  variant={isSelected ? "primary" : "ghost"}
                  onClick={() => setFilterStatus(opt.key)}
                  className="rsvp-filter-btn"
                  style={{
                    backgroundColor: bgColor,
                    color: color,
                    border: isSelected ? `1px solid ${color}` : "1px solid var(--border)",
                    opacity: 1,
                    boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {opt.icon && <opt.icon size={22} className="filter-icon" />}
                  <span className="filter-label">{opt.label}</span>
                </Button>
              );
            })}
          </Surface>
        </div>

        {filteredRsvps.length === 0 ? (
          <Surface variant="soft" className="rsvp-empty">
            Nessuna RSVP per questo filtro.
          </Surface>
        ) : (
          <div className="rsvp-list">
            {filteredRsvps.map((r) => {
              const isEditing = editingId === r._id;
              const isDeleting = deletingId === r._id;

              const statusBadge = (
                <Badge
                  variant={
                    r.status === "yes"
                      ? "success"
                      : r.status === "maybe"
                      ? "warning"
                      : "default"
                  }
                >
                  {r.status === "yes" ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><CheckCircle2 size={14} /> Partecipa</span>
                  ) : r.status === "maybe" ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><HelpCircle size={14} /> Forse</span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><XCircle size={14} /> Non può</span>
                  )}
                </Badge>
              );

              return (
                <div key={r._id || `${r.name}-${r.createdAt}`} className="rsvp-card">
                  <div className="rsvp-card-header">
                    <div>
                      {!isEditing ? (
                        <>
                          <strong>{r.name || "(senza nome)"}</strong>
                          <p style={{ margin: "0.2rem 0 0", color: "var(--text-soft)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <Users size={14} /> {r.guestsCount} ospiti
                          </p>
                        </>
                      ) : (
                        <div className="input-group">
                          <label>Nome Ospite</label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className="rsvp-input"
                          />
                        </div>
                      )}
                    </div>
                    <div style={{ alignSelf: 'flex-start' }}>
                      {statusBadge}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="rsvp-form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", marginTop: '0.5rem' }}>
                      <div className="input-group">
                        <label>Num. Ospiti</label>
                        <input
                          type="number"
                          min="1"
                          value={editForm.guestsCount}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, guestsCount: e.target.value }))
                          }
                          className="rsvp-input"
                        />
                      </div>
                      <div className="input-group">
                        <label>Stato</label>
                        <select
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, status: e.target.value }))
                          }
                          className="rsvp-select"
                        >
                          <option value="yes">Partecipa</option>
                          <option value="maybe">Forse</option>
                          <option value="no">Non può</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    r.message && (
                      <div className="rsvp-message">
                         {r.message}
                      </div>
                    )
                  )}

                  <div className="rsvp-card-actions">
                    {!isEditing ? (
                      <>
                        <Button variant="ghost" onClick={() => startEdit(r)}>
                          Modifica
                        </Button>
                        <Button
                          variant={isDeleting ? "danger" : "ghost"}
                          onClick={() => {
                            if (isDeleting) {
                              deleteRsvp(r._id);
                            } else {
                              setDeletingId(r._id);
                              setTimeout(() => setDeletingId(null), 2500);
                            }
                          }}
                        >
                          {isDeleting ? "Conferma eliminazione" : "Elimina"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => saveEdit(r._id)}>Salva</Button>
                        <Button variant="ghost" onClick={cancelEdit}>
                          Annulla
                        </Button>
                      </>
                    )}
                  </div>

                  {r.createdAt && (
                    <small style={{ color: "var(--text-soft)" }}>
                      Ricevuto il {new Date(r.createdAt).toLocaleString("it-IT")}
                    </small>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
