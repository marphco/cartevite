const getApiBase = () => {
  if (import.meta.env.VITE_API_BASE) return import.meta.env.VITE_API_BASE;
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${hostname}:4000`;
};

export const API_BASE = getApiBase();

export const resolveImageUrl = (u) => {
  if (!u) return "";
  return u.startsWith("/uploads/") ? `${API_BASE}${u}` : u;
};
