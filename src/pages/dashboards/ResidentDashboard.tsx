import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getDeliveries, Delivery } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, LogOut, User, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardNav from "@/components/DashboardNav";

export default function ResidentDashboard() {
  const { user, token, logout } = useAuth();
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, [token]);

  const fetchDeliveries = async () => {
    if (!token) return;
    
    try {
      const response = await getDeliveries(token);
      if (response.success) {
        setDeliveries(response.deliveries || []);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as entregas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const isDelivered = (status: string) => {
    const statusLower = status?.toLowerCase();
    return statusLower === "confirmed" || statusLower === "entregue" || statusLower === "delivered";
  };

  const getStatusBadge = (status: string) => {
    if (isDelivered(status)) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Entregue</Badge>;
    }
    return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pendente</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Lobby</h1>
              <p className="text-sm text-muted-foreground">Painel do Morador</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <DashboardNav showPlans={false} />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.fullName}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="bg-card/50 border-border/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Entregas</p>
                  <p className="text-3xl font-bold text-foreground">{deliveries.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-3xl font-bold text-foreground">
                    {deliveries.filter(d => !isDelivered(d.status)).length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Entregues</p>
                  <p className="text-3xl font-bold text-foreground">
                    {deliveries.filter(d => isDelivered(d.status)).length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Minhas Entregas</h2>
          <p className="text-muted-foreground">Acompanhe o status das suas entregas</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : deliveries.length === 0 ? (
          <Card className="bg-card/50 border-border/40">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma entrega encontrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deliveries.map((delivery) => (
              <Card key={delivery.id} className="bg-card/50 border-border/40 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{delivery.recipientName}</CardTitle>
                    {getStatusBadge(delivery.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>Código: {delivery.trackingCode}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Recebido: {delivery.arrivalDate ? new Date(delivery.arrivalDate as string).toLocaleDateString("pt-BR") : "-"}</span>
                    </div>
                    {isDelivered(delivery.status) && (
                      <>
                        {delivery.withdrawalDate && (
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="h-4 w-4" />
                            <span>Entregue: {new Date(delivery.withdrawalDate as string).toLocaleDateString("pt-BR")}</span>
                          </div>
                        )}
                        {(delivery as any).doormanFullName && (
                          <div className="flex items-center gap-2 text-blue-400">
                            <User className="h-4 w-4" />
                            <span>Porteiro: {(delivery as any).doormanFullName}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}