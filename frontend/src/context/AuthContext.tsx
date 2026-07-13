/**
 * AuthContext.tsx
 * Provides JWT-based auth state + helpers to the entire app.
 * TRD reference: section 4.1
 */

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { UserPublic } from '@swasthconnect/shared';

// ─── State ───────────────────────────────────────────────────────────────────

interface AuthState {
  user: UserPublic | null;
  token: string | null;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'LOGIN'; payload: { user: UserPublic; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<UserPublic> };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('swasth_token'),
  isAuthenticated: !!localStorage.getItem('swasth_token'),
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('swasth_token', action.payload.token);
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      localStorage.removeItem('swasth_token');
      return { user: null, token: null, isAuthenticated: false };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: (user: UserPublic, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<UserPublic>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = (user: UserPublic, token: string) =>
    dispatch({ type: 'LOGIN', payload: { user, token } });

  const logout = () => dispatch({ type: 'LOGOUT' });

  const updateUser = (data: Partial<UserPublic>) =>
    dispatch({ type: 'UPDATE_USER', payload: data });

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
