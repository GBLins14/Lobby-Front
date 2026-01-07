import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, KeyRound } from "lucide-react";
import AuthCard from "@/components/AuthCard";
import InputField from "@/components/InputField";
import { toast } from "sonner";
import { forgotPassword } from "@/lib/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await forgotPassword(email);
      
      if (response.success) {
        setSent(true);
        toast.success("Instruções enviadas para seu e-mail!");
      } else {
        toast.error(response.message || "Erro ao enviar instruções");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className="text-center mb-8">
        <div className="badge-primary mb-4 mx-auto w-fit">
          <KeyRound size={16} />
          Recuperar senha
        </div>
        <h1 className="text-2xl font-bold text-foreground">Esqueceu sua senha?</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Não se preocupe, vamos te ajudar
        </p>
      </div>

      {!sent ? (
        <>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Digite seu e-mail abaixo e enviaremos instruções para você redefinir sua senha.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              icon={Mail}
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                "Enviando..."
              ) : (
                <>
                  Enviar instruções
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">E-mail enviado!</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
          </p>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground mt-6">
        Lembrou da senha?{" "}
        <Link to="/login" className="text-primary hover:underline font-medium">
          Voltar ao login
        </Link>
      </p>
    </AuthCard>
  );
};

export default ForgotPassword;
