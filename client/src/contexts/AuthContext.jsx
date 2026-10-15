import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
const Context = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  async function refresh() {
    const data = await api("/auth/me");
    setUser(data);
    return data;
  }
  useEffect(() => {
    refresh()
      .catch((e) => {
        if (e.status !== 401) setError(e.message);
      })
      .finally(() => setLoading(false));
  }, []);
  async function authenticate(mode, body) {
    await api("/auth/" + mode, { method: "POST", body });
    setError("");
    return refresh();
  }
  async function logout() {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
  }
  return (
    <Context.Provider
      value={{ user, loading, error, refresh, authenticate, logout }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAuth = () => useContext(Context);
