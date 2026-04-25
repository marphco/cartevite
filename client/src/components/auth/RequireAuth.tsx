import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthSessionValid } from "../../utils/authSession";

export default function RequireAuth() {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await isAuthSessionValid();
      if (!cancelled) {
        setIsAuth(ok);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p style={{ padding: "2rem" }}>Verifica accesso…</p>;

  if (!isAuth)
    return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
