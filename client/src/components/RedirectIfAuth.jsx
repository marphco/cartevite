import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API_BASE } from "../config/api";

export default function RedirectIfAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });
        setIsAuth(res.ok);
      } catch {
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) return <p style={{ padding: "2rem" }}>Caricamento…</p>;

  if (isAuth) return <Navigate to="/dashboard" replace />;

  return children;
}
