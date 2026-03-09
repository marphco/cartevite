import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Surface, Button, Badge } from "../ui";
import { Sparkles, Calendar, Paintbrush, Send, CreditCard, X } from "lucide-react";
import { API_BASE } from "../config/api";
import AuthForm from "../components/AuthForm";
import "./MarketingLanding.css";

const CATEGORY_CARDS = [
  { id: "matrimonio", name: "Matrimonio", img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600", desc: "Design eleganti, classici e moderni per il tuo giorno speciale." },
  { id: "feste", name: "Feste", img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=600", desc: "Compleanni, lauree e party indimenticabili." },
  { id: "business", name: "Business", img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=600", desc: "Cene di gala, eventi corporate e congressi." },
  { id: "battesimo", name: "Battesimo & Nascite", img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=600", desc: "Celebra i nuovi arrivi con infinita dolcezza." }
];

export default function MarketingLanding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          setUser(true);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  return (
    <div className="marketing-page">
      {/* HEADER NAV */}
      <nav className="marketing-nav">
        <div className="marketing-logo" onClick={() => navigate("/")} style={{cursor:"pointer"}}>CARTEVITE</div>
        <div className="marketing-nav-links">
          <Button variant="ghost" onClick={() => navigate("/templates")} style={{ marginRight: '1rem', color: "var(--text)"}}>Catalogo Inviti</Button>
          {!loading && user ? (
            <Button onClick={() => navigate("/dashboard")}>Vai alla Dashboard</Button>
          ) : (
            <div style={{ position: "relative", display: "flex", gap: "1rem" }}>
              <Button variant="ghost" onClick={() => setShowAuthModal((prev) => !prev)}>Accedi</Button>
              <Button onClick={() => setShowAuthModal((prev) => !prev)}>Inizia gratis</Button>

              {/* AUTH POPOVER DROPDOWN */}
              {showAuthModal && (
                <div 
                  className="auth-popover-dropdown" 
                  style={{
                    position: "absolute",
                    top: "calc(100% + 1rem)", // Just below the buttons
                    right: 0,
                    width: "350px",
                    zIndex: 9999,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                    borderRadius: "var(--radius-lg)",
                    animation: "fadeIn 0.2s ease-out"
                  }}
                >
                  <Button 
                      variant="ghost" 
                      onClick={() => setShowAuthModal(false)} 
                      style={{ 
                          position: "absolute", right: "0.5rem", top: "0.5rem", zIndex: 10,
                          padding: "0.2rem", color: "var(--text-muted)", minWidth: "auto", height: "auto"
                      }}
                  >
                      <X size={18} />
                  </Button>
                  <AuthForm 
                    initialMode="login" 
                    onAuthSuccess={() => { window.location.href = "/dashboard"; }} 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="marketing-hero">
        <Badge variant="accent" style={{ marginBottom: "1rem" }}>
          <Sparkles size={14} style={{ marginRight: "0.25rem" }} /> Il nuovo standard per gli inviti
        </Badge>
        <h1>Crea l'invito perfetto.<br />In pochi click.</h1>
        <p>Rivoluziona il modo in cui inviti le persone ai tuoi eventi. Design premium, animazioni 3D sbalorditive e gestione RSVP integrata tramite WhatsApp o Email.</p>
        
        <div className="marketing-hero-cta">
          {user ? (
            <Button onClick={() => navigate("/dashboard")} style={{ height: "48px", padding: "0 2rem", fontSize: "1.1rem" }}>
              Vai alla tua Dashboard
            </Button>
          ) : (
            <Button onClick={() => navigate("/login")} style={{ height: "48px", padding: "0 2rem", fontSize: "1.1rem" }}>
              Crea il tuo primo evento
            </Button>
          )}
        </div>
      </header>

      {/* HOW IT WORKS */}
      <section className="marketing-section">
        <div className="section-header">
          <h2>Come Funziona</h2>
          <p>Organizzare un evento non è mai stato così semplice ed elegante.</p>
        </div>
        
        <div className="steps-grid">
          <Surface variant="soft" className="step-card">
            <div className="step-icon"><Paintbrush size={24} /></div>
            <h3>1. Personalizza il Design</h3>
            <p>Scegli tra temi curati, font eleganti e layout blocchi. Nessuna competenza tecnica richiesta.</p>
          </Surface>

          <Surface variant="soft" className="step-card">
            <div className="step-icon"><Send size={24} /></div>
            <h3>2. Invia ai tuoi ospiti</h3>
            <p>Importa i contatti dal CSV e orchestra l'invio via WhatsApp o Email con messaggi personalizzati.</p>
          </Surface>

          <Surface variant="soft" className="step-card">
            <div className="step-icon"><Calendar size={24} /></div>
            <h3>3. Raccogli le adesioni</h3>
            <p>Tieni traccia di RSVP, partecipanti attesi e intolleranze, il tutto da una comoda dashboard.</p>
          </Surface>
        </div>
      </section>

      {/* CATALOG PREVIEW */}
      <section className="marketing-section catalog-section">
        <div className="section-header">
          <h2>Scegli la tua Categoria</h2>
          <p>Esplora l'intera collezione dei nostri design esclusivi. Completamente personalizzabili.</p>
        </div>

        <div className="catalog-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {CATEGORY_CARDS.map(item => (
            <div key={item.id} className="catalog-card" onClick={() => navigate(`/templates?category=${encodeURIComponent(item.name)}`)} style={{ cursor: "pointer", position: "relative", overflow: "hidden", borderRadius: "12px" }}>
              <div className="catalog-img-wrap" style={{ aspectRatio: "4/5", width: "100%", margin: 0, padding: 0, borderRadius: 0 }}>
                <img src={item.img} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                
                {/* Overlay Oscuro in basso per far risaltare il testo */}
                <div style={{
                  position: "absolute", 
                  inset: 0, 
                  background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "flex-end", 
                  padding: "1.5rem"
                }}>
                   <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 500, color: "white" }}>{item.name}</h3>
                   <p style={{ margin: "0.25rem 0 0", color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}>{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Button variant="base" onClick={() => navigate("/templates")}>Vedi tutti i design</Button>
        </div>
      </section>

      {/* PREMIUM TEASER */}
      <section className="marketing-section premium-teaser">
        <Surface variant="glass" className="premium-box">
          <h2>Passa a Premium per espandere le funzionalità.</h2>
          <p>Sblocca la Gallery fotografica, elimina i limiti di caricamento e rimuovi il brand Cartevite, per darti un tocco ancora più esclusivo.</p>
          <Button onClick={() => setShowAuthModal(true)} style={{ marginTop: "1rem" }}>
            <CreditCard size={18} style={{ marginRight: "0.5rem" }} />
            Scopri i vantaggi
          </Button>
        </Surface>
      </section>

      {/* FOOTER */}
      <footer className="marketing-footer">
        <div>CARTEVITE &copy; 2026. Tutti i diritti riservati.</div>
        <div className="footer-links">
          <span>Privacy</span>
          <span>Termini</span>
        </div>
      </footer>

    </div>
  );
}
