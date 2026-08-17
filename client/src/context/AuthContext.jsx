import React, { createContext, useContext, useEffect, useState } from 'react';
import API from '../api/axios';

const safeJsonParse = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    localStorage.removeItem(key);
    return null;
  }
};

const C = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('kaam_saathi_token') || null);
  const [worker, setWorker] = useState(() => safeJsonParse('kaam_saathi_worker'));
  const [employer, setEmployer] = useState(() => safeJsonParse('kaam_saathi_employer'));
  const [authReady, setAuthReady] = useState(true);

  // Restore the logged-in user from the server when a token already exists.
  // This prevents the AI page from incorrectly asking an already-logged-in user to login again.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const savedToken = localStorage.getItem('kaam_saathi_token');
      if (!savedToken) {
        if (!cancelled) setAuthReady(true);
        return;
      }

      try {
        const response = await API.get('/auth/me');
        if (cancelled) return;

        if (response.data?.role === 'worker') {
          const current = response.data.worker || null;
          setWorker(current);
          setEmployer(null);
          if (current) localStorage.setItem('kaam_saathi_worker', JSON.stringify(current));
          localStorage.removeItem('kaam_saathi_employer');
        } else if (response.data?.role === 'employer') {
          const current = response.data.employer || null;
          setEmployer(current);
          setWorker(null);
          if (current) localStorage.setItem('kaam_saathi_employer', JSON.stringify(current));
          localStorage.removeItem('kaam_saathi_worker');
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('[Auth] Saved session could not be restored:', error.response?.data?.message || error.message);
          // Only clear the session when the server explicitly says the token is invalid.
          if (error.response?.status === 401) {
            setToken(null);
            setWorker(null);
            setEmployer(null);
            ['kaam_saathi_token', 'kaam_saathi_worker', 'kaam_saathi_employer'].forEach(k => localStorage.removeItem(k));
          }
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    };

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  const login = (t, w) => {
    setToken(t);
    setWorker(w || null);
    setEmployer(null);
    localStorage.setItem('kaam_saathi_token', t);
    if (w) localStorage.setItem('kaam_saathi_worker', JSON.stringify(w));
    localStorage.removeItem('kaam_saathi_employer');
    setAuthReady(true);
  };

  const loginEmployer = (t, e) => {
    setToken(t);
    setEmployer(e || null);
    setWorker(null);
    localStorage.setItem('kaam_saathi_token', t);
    if (e) localStorage.setItem('kaam_saathi_employer', JSON.stringify(e));
    localStorage.removeItem('kaam_saathi_worker');
    setAuthReady(true);
  };

  const updateWorkerState = d => setWorker(prev => {
    const n = { ...(prev || {}), ...d };
    localStorage.setItem('kaam_saathi_worker', JSON.stringify(n));
    return n;
  });

  const updateEmployerState = d => setEmployer(prev => {
    const n = { ...(prev || {}), ...d };
    localStorage.setItem('kaam_saathi_employer', JSON.stringify(n));
    return n;
  });

  const logout = () => {
    setToken(null);
    setWorker(null);
    setEmployer(null);
    setAuthReady(true);
    ['kaam_saathi_token', 'kaam_saathi_worker', 'kaam_saathi_employer'].forEach(k => localStorage.removeItem(k));
  };

  return (
    <C.Provider value={{
      token,
      worker,
      employer,
      authReady,
      login,
      loginEmployer,
      updateWorkerState,
      updateEmployerState,
      logout
    }}>
      {children}
    </C.Provider>
  );
};

export const useAuth = () => useContext(C);
