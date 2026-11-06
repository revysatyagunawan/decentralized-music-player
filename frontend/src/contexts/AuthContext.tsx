import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  handleIncomingRedirect,
  getDefaultSession,
  login,
  logout,
  Session,
} from '@inrupt/solid-client-authn-browser';
import { api, API_URL, User } from '../api';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  loginWithIssuer: (issuer: string) => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const CLIENT_ID = 'GN2jkUx67CSrwT17fI7Q_';
const REDIRECT_URL = 'http://localhost:5173/';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    (async () => {
      try {
        await handleIncomingRedirect({ restorePreviousSession: true });
        const s = getDefaultSession();
        setSession(s);

        if (s.info.isLoggedIn) {
          const res = await s.fetch(`${API_URL}/api/auth/solid/exchange`, {
            method: 'POST',
            credentials: 'include',
          });
          if (res.ok) {
            const json = await res.json();
            setUser(json.data.user);
          } else {
            console.error('Exchange failed:', res.status);
          }
        }
      } catch (err) {
        console.error('Auth init failed:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const loginWithIssuer = useCallback(async (issuer: string) => {
    await login({
      oidcIssuer: issuer,
      redirectUrl: REDIRECT_URL,
      clientId: CLIENT_ID,
    });
  }, []);

  const logoutUser = useCallback(async () => {
    await logout();
    await api.post('/api/auth/logout').catch(() => {});
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, isLoading, loginWithIssuer, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
