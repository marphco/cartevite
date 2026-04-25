import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAuthSessionValid } from "../../utils/authSession";

interface RedirectIfAuthProps {
  children: React.ReactNode;
}

export default function RedirectIfAuth({ children }: RedirectIfAuthProps) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

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

  if (loading) return <p style={{ padding: "2rem" }}>Caricamento…</p>;

  if (isAuth) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
