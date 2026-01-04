import { useEffect, useState } from "react";
import { API_BASE } from "../config/api";

export default function Login() {
  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });

        if (!cancelled && res.ok) {
          // ✅ già loggato → fuori dalla pagina login
          window.location.href = "/";
        }
      } catch {
        // ignore: se fallisce resta su login
      }
    }

    check();

    return () => {
      cancelled = true;
    };
  }, []);

  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Errore auth");
      }

      // ✅ forza la sync cookie → server
      await fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
      });

      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#111",
        color: "#fff",
        fontFamily: "sans-serif",
        padding: "2rem",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#161616",
          border: "1px solid #333",
          borderRadius: "12px",
          padding: "1.5rem",
          display: "grid",
          gap: "0.75rem",
        }}
      >
        <h1 style={{ margin: 0 }}>
          {mode === "login" ? "Login" : "Crea account"}
        </h1>

        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "0.75rem", borderRadius: "8px" }}
        />

        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "0.75rem", borderRadius: "8px" }}
        />

        {error && <p style={{ color: "salmon", margin: 0 }}>{error}</p>}

        <button
          disabled={loading}
          style={{
            padding: "0.75rem",
            borderRadius: "8px",
            border: "none",
            background: "#000",
            color: "#fff",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Attendi..." : mode === "login" ? "Accedi" : "Registrati"}
        </button>

        <button
          type="button"
          onClick={() =>
            setMode((prev) => (prev === "login" ? "register" : "login"))
          }
          style={{
            background: "transparent",
            border: "none",
            color: "#bbb",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {mode === "login"
            ? "Non hai un account? Registrati"
            : "Hai già un account? Login"}
        </button>
      </form>
    </div>
  );
}
