import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { login, logout, refreshSession, signup } from '../api';
import { setAccessToken, setTokenExpiredHandler } from './session';
import { clearRefreshToken, readRefreshToken, saveRefreshToken } from './tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // loading: 보관된 토큰으로 복구를 시도하는 중. 이때는 어떤 화면도 보여주지 않는다.
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);

  const storeSession = useCallback(async (session) => {
    setAccessToken(session.accessToken);
    await saveRefreshToken(session.refreshToken);
    setUser(session.user);
  }, []);

  const clearSession = useCallback(async () => {
    setAccessToken(null);
    await clearRefreshToken();
    setUser(null);
    setStatus('signedOut');
  }, []);

  // 앱을 다시 켰을 때, 보관된 재발급 토큰으로 조용히 로그인 상태를 되살린다.
  useEffect(() => {
    let active = true;

    (async () => {
      const storedToken = await readRefreshToken();
      if (!storedToken) {
        if (active) setStatus('signedOut');
        return;
      }

      try {
        const session = await refreshSession(storedToken);
        if (!active) return;
        await storeSession(session);
        setStatus('signedIn');
      } catch {
        if (active) await clearSession();
      }
    })();

    return () => {
      active = false;
    };
  }, [clearSession, storeSession]);

  // 액세스 토큰이 만료되면 api 계층이 이 함수를 부른다.
  // 성공하면 원래 요청이 그대로 다시 나가고, 실패하면 로그인 화면으로 돌아간다.
  useEffect(() => {
    setTokenExpiredHandler(async () => {
      const storedToken = await readRefreshToken();
      if (!storedToken) {
        await clearSession();
        return false;
      }

      try {
        await storeSession(await refreshSession(storedToken));
        return true;
      } catch {
        await clearSession();
        return false;
      }
    });

    return () => setTokenExpiredHandler(null);
  }, [clearSession, storeSession]);

  const signIn = useCallback(
    async (email, password) => {
      await storeSession(await login(email, password));
      setStatus('signedIn');
    },
    [storeSession]
  );

  const signUp = useCallback(
    async (email, password, nickname) => {
      await storeSession(await signup(email, password, nickname));
      setStatus('signedIn');
    },
    [storeSession]
  );

  const signOut = useCallback(async () => {
    try {
      await logout();
    } catch {
      // 서버에 알리지 못해도 이 기기의 토큰은 반드시 지운다.
    }
    await clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ status, user, signIn, signUp, signOut }),
    [signIn, signOut, signUp, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.');
  }
  return context;
};
