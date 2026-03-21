import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";

export default function RequireAuth() {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const location = useLocation();

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

  if (loading) return <p style={{ padding: "2rem" }}>Verifica accesso…</p>;

  if (!isAuth)
    return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
