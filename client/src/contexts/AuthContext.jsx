import { createContext, useContext, useEffect, useRef, useState } from "react";
import { api } from "../services/api";
const Context = createContext();
const LOGGED_OUT_KEY = "nextjobs_logged_out";
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [loggedOut, setLoggedOut] = useState(
      () => sessionStorage.getItem(LOGGED_OUT_KEY) === "1",
    );
  const authRequest = useRef(0);
  async function refresh() {
    const request = ++authRequest.current;
    try {
      const data = await api("/auth/me");
      if (request === authRequest.current) setUser(data);
      return data;
    } catch (e) {
      if (request === authRequest.current && e.status === 401) setUser(null);
      throw e;
    }
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
    const data = await refresh();
    sessionStorage.removeItem(LOGGED_OUT_KEY);
    setLoggedOut(false);
    return data;
  }
  async function logout() {
    await api("/auth/logout", { method: "POST" });
    authRequest.current += 1;
    setUser(null);
    sessionStorage.setItem(LOGGED_OUT_KEY, "1");
    setLoggedOut(true);
  }
  return (
    <Context.Provider
      value={{ user, loading, error, loggedOut, refresh, authenticate, logout }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAuth = () => useContext(Context);
