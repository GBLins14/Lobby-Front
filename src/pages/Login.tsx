import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Sparkles, User } from "lucide-react";
import AuthCard from "@/components/AuthCard";
import InputField from "@/components/InputField";
import { toast } from "sonner";
import { signIn } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await signIn({ login, password });

      if (response.success && response.token) {
        const user = await setAuth(response.token);
        
        if (user) {
          toast.success("Login realizado com sucesso!");
          navigate("/dashboard", { replace: true });
        } else {
          toast.error("Erro ao carregar dados do usuário. Tente novamente.");
        }
      } else {
        toast.error(response.message || "Credenciais inválidas");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className="text-center mb-8">
        <div className="badge-primary mb-4 mx-auto w-fit">
          <Sparkles size={16} />
          Bem-vindo de volta
        </div>
        <h1 className="text-2xl font-bold text-foreground">Entrar</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Acesse sua conta para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField
          icon={User}
          label="Usuário ou E-mail"
          type="text"
          placeholder="seu usuário ou email"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
        />

        <InputField
          icon={Lock}
          label="Senha"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          rightElement={
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Esqueceu a senha?
            </Link>
          }
        />

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            "Entrando..."
          ) : (
            <>
              Entrar
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Não tem uma conta?{" "}
        <Link to="/register" className="text-primary hover:underline font-medium">
          Criar conta
        </Link>
      </p>
    </AuthCard>
  );
};

export default Login;
