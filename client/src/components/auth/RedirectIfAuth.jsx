import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";

export default function RedirectIfAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await apiFetch(`/api/auth/me`);
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
