import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/Logo";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 auth-glow overflow-x-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-full">
        <div className="mb-8">
          <Logo size="md" />
        </div>

        <Card className="w-full max-w-lg bg-card/50 border-border/40">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Pagamento Confirmado!
            </h1>

            <p className="text-muted-foreground mb-6">
              Sua assinatura foi ativada com sucesso. Você já pode começar a usar o Lobby.
            </p>

            <div className="bg-muted/30 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-3 text-foreground">
                <Building2 className="h-5 w-5 text-primary" />
                <span>Próximo passo: Acessar seu painel</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Você será redirecionado automaticamente em{" "}
              <span className="text-primary font-semibold">{countdown} segundos</span>
            </p>

            <Button 
              className="w-full"
              onClick={() => navigate("/dashboard")}
            >
              Ir para o Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
