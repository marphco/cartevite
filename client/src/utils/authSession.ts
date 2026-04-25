import { apiFetch } from "./apiFetch";

/** `/api/auth/me` risponde 200 con `{ user: null }` se non c’è sessione: non usare `res.ok` come login. */
export async function isAuthSessionValid(): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/auth/me`);
    if (!res.ok) return false;
    const data = (await res.json()) as { user?: unknown };
    return data != null && data.user != null;
  } catch {
    return false;
  }
}
