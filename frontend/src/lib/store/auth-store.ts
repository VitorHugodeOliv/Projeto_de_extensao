import axios from "axios";
import { useSyncExternalStore } from "react";
import { API_BASE_URL } from "../config/api-config";

export interface AuthUser {
  id?: number;
  nome?: string;
  email?: string;
  tipo_usuario?: string;
  [key: string]: unknown;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isRefreshing: boolean;
}

type AuthListener = (state: AuthState) => void;

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

const safeStorage = {
  get(key: string) {
    try {
      return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  set(key: string, value: string | null) {
    try {
      if (typeof window === "undefined") return;
      if (value === null || value === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, value);
      }
    } catch {
      /* noop */
    }
  },
};

let state: AuthState = {
  accessToken: safeStorage.get(TOKEN_KEY),
  refreshToken: safeStorage.get(REFRESH_TOKEN_KEY),
  user: null,
  isRefreshing: false,
};

const listeners = new Set<AuthListener>();
let refreshPromise: Promise<string | null> | null = null;

function notify() {
  listeners.forEach((listener) => listener(state));
}

function setState(partial: Partial<AuthState>) {
  state = { ...state, ...partial };
  notify();
}

function setTokens(tokens: { accessToken: string | null; refreshToken?: string | null }) {
  const { accessToken, refreshToken = state.refreshToken } = tokens;

  safeStorage.set(TOKEN_KEY, accessToken);
  if (refreshToken !== undefined) {
    safeStorage.set(REFRESH_TOKEN_KEY, refreshToken);
  }

  setState({
    accessToken,
    refreshToken: refreshToken ?? null,
  });
}

function setUser(user: AuthUser | null) {
  setState({ user });
}

function logout() {
  setTokens({ accessToken: null, refreshToken: null });
  setUser(null);
}

async function refreshTokens(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = state.refreshToken ?? safeStorage.get(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    logout();
    return null;
  }

  refreshPromise = (async () => {
    try {
      setState({ isRefreshing: true });
      const response = await axios.post(`${API_BASE_URL}/refresh`, {
        refresh_token: refreshToken,
      });

      const newAccessToken = response.data?.access_token ?? null;
      const newRefreshToken = response.data?.refresh_token ?? refreshToken;

      setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });
      return newAccessToken;
    } catch (error) {
      logout();
      throw error;
    } finally {
      setState({ isRefreshing: false });
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function subscribe(listener: AuthListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const authStore = {
  getState: () => state,
  subscribe,
  setTokens,
  setUser,
  logout,
  refreshTokens,
};

export const useAuth = () => {
  const snapshot = useSyncExternalStore(
    authStore.subscribe,
    authStore.getState,
    authStore.getState
  );

  return {
    ...snapshot,
    setTokens: authStore.setTokens,
    setUser: authStore.setUser,
    logout: authStore.logout,
    refreshTokens: authStore.refreshTokens,
  };
};
