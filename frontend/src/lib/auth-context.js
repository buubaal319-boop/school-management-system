'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { api } from './api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Firebase user
  const [profile, setProfile] = useState(null); // { name, role, linkedStudentIds } from the backend
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null); setProfile(null); setLoading(false);
        return;
      }
      try {
        const me = await api('/auth/me'); // asks the backend for this person's role
        setProfile(me); setUser(fbUser); setAuthError('');
      } catch (e) {
        setAuthError(e.message);
        await signOut(auth);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, role: profile?.role, loading, authError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
