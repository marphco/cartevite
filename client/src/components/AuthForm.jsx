import { useState } from "react";
import { apiFetch } from "../utils/apiFetch";
import { Button, Surface } from "../ui";
import { useGoogleLogin } from '@react-oauth/google';
import "../pages/Login.css";

export default function AuthForm({ initialMode = "login", onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const res = await apiFetch(`${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Errore auth");
      }

      await apiFetch(`/api/auth/me`);
      
      // Callback success per gestire il redirect flessibile
      if (onAuthSuccess) {
         onAuthSuccess();
      } else {
         window.location.href = "/dashboard";
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError("");
        
        const res = await apiFetch('/api/auth/google', {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Errore auth Google");
        }

        await apiFetch(`/api/auth/me`);
        
        if (onAuthSuccess) {
           onAuthSuccess();
        } else {
           window.location.href = "/dashboard";
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    },
    onError: error => setError("Login Google fallito")
  });

  return (
    <Surface variant="glass" className="auth-card" style={{ width: "100%" }}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p style={{ color: "salmon", margin: 0 }}>{error}</p>}

        <div className="auth-actions" style={{ marginTop: "0.5rem" }}>
          <Button type="submit" disabled={loading}>
            {loading ? "Attendi..." : mode === "login" ? "Accedi" : "Registrati"}
          </Button>

          <div style={{ display: "flex", alignItems: "center", margin: "0.5rem 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }}></div>
            <span style={{ margin: "0 0.5rem" }}>oppure</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }}></div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            onClick={() => loginGoogle()}
            style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "center", background: "white", color: "black", borderColor: "white", padding: "0.5rem" }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
            Continua con Google
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            style={{ fontSize: "0.85rem", marginTop: "0.25rem", color: "var(--text-muted)" }}
            onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}
          >
            {mode === "login" ? "Non hai un account? Registrati" : "Hai già un account? Login"}
          </Button>
        </div>
      </form>
    </Surface>
  );
}
