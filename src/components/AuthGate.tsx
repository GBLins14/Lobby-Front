import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

/**
 * Exibe uma tela de carregamento enquanto o AuthProvider
 * verifica se existe um token armazenado e carrega os dados do usuário.
 * Isso evita flicker / estado inconsistente antes do primeiro render real.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <Logo />
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          <span className="text-muted-foreground text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
