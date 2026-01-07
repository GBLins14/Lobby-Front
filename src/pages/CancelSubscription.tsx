import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cancelSubscription } from "@/lib/api";
import Logo from "@/components/Logo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CancelSubscription() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await cancelSubscription(token);
      if (response.success) {
        toast({
          title: "Assinatura cancelada",
          description: "Sua assinatura foi cancelada com sucesso.",
        });
        await logout();
        navigate("/");
      } else {
        toast({
          title: "Erro",
          description: response.message || "Não foi possível cancelar a assinatura.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao cancelar assinatura. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 auth-glow overflow-x-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-full">
        <div className="mb-8">
          <Logo size="md" />
        </div>

        <Card className="w-full max-w-lg bg-card/50 border-border/40">
          <CardHeader>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="w-fit mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <CardTitle className="text-xl font-bold text-foreground">
              Cancelar Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Warning Box */}
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-destructive mb-1">
                    Atenção: Ação Irreversível
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ao cancelar sua assinatura, <strong className="text-destructive">o condomínio e todas as contas vinculadas serão permanentemente apagados</strong>. Esta ação não pode ser desfeita.
                  </p>
                </div>
              </div>
            </div>

            {/* What will be deleted */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">O que será excluído:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  Todos os dados do condomínio
                </li>
                <li className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  Todas as contas de moradores, porteiros e síndicos
                </li>
                <li className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  Histórico completo de entregas
                </li>
                <li className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  Todas as configurações e personalizações
                </li>
              </ul>
            </div>

            {/* Cancel Button with Confirmation */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  disabled={isLoading}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Cancelar Assinatura
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border/40">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Confirmar Cancelamento
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Você tem certeza que deseja cancelar sua assinatura? <strong className="text-destructive">O condomínio e todas as contas vinculadas serão permanentemente apagados.</strong> Esta ação é irreversível.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Cancelando..." : "Sim, cancelar assinatura"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
