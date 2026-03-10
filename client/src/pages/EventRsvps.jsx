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
        await apiFetch("/api/auth/me");
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
    { key: "all", label: "Tutte" },
    { key: "yes", label: <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><CheckCircle2 size={16} /> Partecipa</span> },
    { key: "maybe", label: <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><HelpCircle size={16} /> Forse</span> },
    { key: "no", label: <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><XCircle size={16} /> No</span> },
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

        <div className="rsvp-stats">
          <StatCard label="Conferme" value={counts.yesResponses} hint={`${counts.yesGuests} ospiti`} />
          <StatCard label="Forse" value={counts.maybeResponses} hint={`${counts.maybeGuests} ospiti`} />
          <StatCard label="Non possono" value={counts.noResponses} hint={`${counts.noGuests} ospiti`} />
        </div>

        <Surface variant="soft" className="rsvp-filters">
          {filterOptions.map((opt) => {
            const isSelected = filterStatus === opt.key;
            let bgColor = "transparent";
            let color = "currentColor";
            
            if (isSelected) {
              if (opt.key === "yes") {
                bgColor = "rgba(58, 230, 179, 0.15)";
                color = "#3ae6b3"; // verde scuro/chiaro
              } else if (opt.key === "maybe") {
                bgColor = "rgba(244, 196, 107, 0.15)";
                color = "#f4c46b"; // giallognolo
              } else if (opt.key === "no") {
                bgColor = "rgba(250, 128, 114, 0.15)";
                color = "salmon"; // rosso salmon
              } else {
                // all
                bgColor = "rgba(255,255,255,0.1)";
                color = "#fff";
              }
            }

            return (
              <Button
                key={opt.key}
                variant="ghost"
                onClick={() => setFilterStatus(opt.key)}
                style={{
                   backgroundColor: bgColor,
                   color: color,
                   border: isSelected ? `1px solid ${color}` : "1px solid transparent",
                   opacity: isSelected ? 1 : 0.6
                }}
              >
                {opt.label}
              </Button>
            );
          })}
        </Surface>

        <Surface variant="glass" className="rsvp-manual-card">
          <div>
            <p className="rsvp-eyebrow" style={{ letterSpacing: "0.25em" }}>
              Aggiunta manuale
            </p>
            <h2 style={{ margin: "0.2rem 0 0" }}>Inserisci un nuovo ospite</h2>
          </div>

          <form onSubmit={handleManualAdd} className="rsvp-form-grid">
            <input
              type="text"
              required
              placeholder="Nome ospite"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              className="rsvp-input"
            />

            <input
              type="number"
              min="1"
              placeholder="Numero ospiti totali"
              value={manualGuests}
              onChange={(e) => setManualGuests(e.target.value)}
              className="rsvp-input"
            />

            <select
              value={manualStatus}
              onChange={(e) => setManualStatus(e.target.value)}
              className="rsvp-select"
            >
              <option value="yes">Partecipa</option>
              <option value="maybe">Forse</option>
              <option value="no">Non può</option>
            </select>

            <Button type="submit" disabled={manualSending}>
              {manualSending ? "Aggiungo..." : "Aggiungi ospite"}
            </Button>
          </form>

          {manualError && (
            <p style={{ color: "salmon", margin: 0 }}>{manualError}</p>
          )}
        </Surface>

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
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="rsvp-input"
                        />
                      )}
                    </div>
                    {statusBadge}
                  </div>

                  {isEditing ? (
                    <div className="rsvp-form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                      <input
                        type="number"
                        min="1"
                        value={editForm.guestsCount}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, guestsCount: e.target.value }))
                        }
                        className="rsvp-input"
                      />
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
                  ) : (
                    r.message && <p className="rsvp-message">“{r.message}”</p>
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
