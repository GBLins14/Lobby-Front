import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getMe, logout as apiLogout } from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (token: string) => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "lobby_auth_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Limpa sessão local e exibe mensagem opcional
  const clearSession = useCallback((message?: string) => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
    if (message) {
      toast.error(message);
    }
  }, []);

  // Busca dados do usuário via /auth/me
  const fetchUser = useCallback(
    async (authToken: string): Promise<User | null> => {
      try {
        const response = await getMe(authToken);

        if (response.success && response.account) {
          setUser(response.account);
          setToken(authToken);
          localStorage.setItem(TOKEN_KEY, authToken);
          return response.account;
        }

        // Token inválido ou resposta inesperada
        clearSession();
        return null;
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        clearSession();
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [clearSession]
  );

  // Inicialização: verificar token armazenado
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      fetchUser(storedToken);
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Define novo token e busca usuário (retorna Promise<User | null>)
  const setAuth = useCallback(
    async (newToken: string): Promise<User | null> => {
      setIsLoading(true);
      return await fetchUser(newToken);
    },
    [fetchUser]
  );

  // Logout completo
  const logout = useCallback(async () => {
    if (token) {
      try {
        await apiLogout(token);
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      }
    }
    clearSession();
  }, [token, clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        setAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    if (import.meta.env.DEV) {
      console.warn("useAuth called outside AuthProvider (returning guest context)");
    }

    return {
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      setAuth: async () => null,
      logout: async () => {},
    } as AuthContextType;
  }
  return context;
}

