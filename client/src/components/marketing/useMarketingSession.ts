import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../config/api";

export function useMarketingSession() {
  const navigate = useNavigate();
  const [user, setUser] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModal, setAuthModal] = useState<null | "login" | "register">(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d: { user?: unknown }) => {
        if (!cancelled) setUser(!!d?.user);
      })
      .catch(() => {
        if (!cancelled) setUser(false);
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const closeAuthModal = useCallback(() => setAuthModal(null), []);

  useEffect(() => {
    if (!authModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [authModal, closeAuthModal]);

  const onAuthSuccess = useCallback(() => {
    setAuthModal(null);
    navigate("/dashboard");
  }, [navigate]);

  return {
    user,
    authLoading,
    authModal,
    setAuthModal,
    closeAuthModal,
    onAuthSuccess,
  };
}
