import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getDoormanDeliveries, registerDelivery, getDoormanDeliveryByCode, confirmDoormanDelivery, Delivery } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Package, LogOut, User, Plus, Search, CheckCircle, Clock, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardNav from "@/components/DashboardNav";

export default function DoormanDashboard() {
  const { user, token, logout } = useAuth();
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState<Delivery | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Form state
  const [recipientName, setRecipientName] = useState("");
  const [block, setBlock] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");

  useEffect(() => {
    fetchDeliveries();
  }, [token]);

  const fetchDeliveries = async () => {
    if (!token) return;
    
    try {
      const response = await getDoormanDeliveries(token);
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

  const handleRegisterDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    try {
      const response = await registerDelivery(token, {
        recipientName,
        block,
        apartmentNumber,
      });

      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Entrega registrada com sucesso!",
        });
        setRecipientName("");
        setBlock("");
        setApartmentNumber("");
        setRegisterDialogOpen(false);
        fetchDeliveries();
      } else {
        toast({
          title: "Erro",
          description: response.message || "Não foi possível registrar a entrega.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao registrar entrega.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async () => {
    if (!token || !searchCode.trim()) return;

    setIsSearching(true);
    setSearchResult(null);
    
    try {
      const response = await getDoormanDeliveryByCode(token, searchCode.trim());
      if (response.success && response.account) {
        setSearchResult(response.account);
      } else {
        toast({
          title: "Não encontrado",
          description: response.message || "Nenhuma entrega encontrada com esse código.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar entrega.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmDelivery = async (trackingCode: string) => {
    if (!token) return;

    try {
      const response = await confirmDoormanDelivery(token, trackingCode);
      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Entrega confirmada com sucesso!",
        });
        fetchDeliveries();
        setSearchResult(null);
        setSearchCode("");
      } else {
        toast({
          title: "Erro",
          description: response.message || "Não foi possível confirmar a entrega.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao confirmar entrega.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmByCode = async () => {
    if (!token || !confirmCode.trim()) return;

    setIsConfirming(true);
    try {
      const response = await confirmDoormanDelivery(token, confirmCode.trim());
      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Entrega confirmada com sucesso!",
        });
        fetchDeliveries();
        setConfirmCode("");
        setConfirmDialogOpen(false);
      } else {
        toast({
          title: "Erro",
          description: response.message || "Não foi possível confirmar a entrega.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao confirmar entrega.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "confirmed" || statusLower === "entregue" || statusLower === "delivered") {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Entregue</Badge>;
    }
    return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pendente</Badge>;
  };

  const isDelivered = (status: string) => {
    const statusLower = status?.toLowerCase();
    return statusLower === "confirmed" || statusLower === "entregue" || statusLower === "delivered";
  };

  const pendingDeliveries = deliveries.filter(d => !isDelivered(d.status));
  const confirmedDeliveries = deliveries.filter(d => isDelivered(d.status));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Lobby</h1>
              <p className="text-sm text-muted-foreground">Painel do Porteiro</p>
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
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="bg-card/50 border-border/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
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
                  <p className="text-3xl font-bold text-amber-500">{pendingDeliveries.length}</p>
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
                  <p className="text-3xl font-bold text-green-500">{confirmedDeliveries.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hoje</p>
                  <p className="text-3xl font-bold text-blue-500">
                    {deliveries.filter(d => d.arrivalDate && new Date(d.arrivalDate as string).toDateString() === new Date().toDateString()).length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Building className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Gestão de Entregas</h2>
            <p className="text-muted-foreground">Registre e confirme entregas do condomínio</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Dialog para confirmar entrega por código */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Entrega
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border/40">
                <DialogHeader>
                  <DialogTitle>Confirmar Entrega</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Digite o código de rastreio da entrega que deseja confirmar.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="confirmCode">Código de Rastreio</Label>
                    <Input
                      id="confirmCode"
                      placeholder="Digite o código..."
                      value={confirmCode}
                      onChange={(e) => setConfirmCode(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleConfirmByCode} disabled={isConfirming || !confirmCode.trim()}>
                    {isConfirming ? "Confirmando..." : "Confirmar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog para nova entrega */}
            <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Entrega
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border/40">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Entrega</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleRegisterDelivery} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Nome do Destinatário</Label>
                    <Input
                      id="recipientName"
                      placeholder="Ex: João Silva"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="block">Bloco</Label>
                      <Input
                        id="block"
                        placeholder="Ex: A"
                        value={block}
                        onChange={(e) => setBlock(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apartmentNumber">Apartamento</Label>
                      <Input
                        id="apartmentNumber"
                        placeholder="Ex: 103"
                        value={apartmentNumber}
                        onChange={(e) => setApartmentNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Registrando..." : "Registrar Entrega"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <Card className="bg-card/50 border-border/40 mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar por Código
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Digite o código de rastreio..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? "Buscando..." : "Buscar"}
              </Button>
            </div>
            
            {searchResult && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{searchResult.recipientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {searchResult.block && `Bloco ${searchResult.block} - `}Apto: {searchResult.apartmentNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">Código: {searchResult.trackingCode}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(searchResult.status)}
                    {!isDelivered(searchResult.status) && (
                      <Button size="sm" onClick={() => handleConfirmDelivery(searchResult.trackingCode)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirmar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendentes ({pendingDeliveries.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Entregues ({confirmedDeliveries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : pendingDeliveries.length === 0 ? (
              <Card className="bg-card/50 border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma entrega pendente</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="bg-card/50 border-border/40">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{delivery.recipientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {delivery.block && `Bloco ${delivery.block} - `}Apto: {delivery.apartmentNumber}
                          </p>
                        </div>
                        {getStatusBadge(delivery.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">Código: {delivery.trackingCode}</p>
                      {delivery.arrivalDate && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Recebido: {new Date(delivery.arrivalDate as string).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleConfirmDelivery(delivery.trackingCode)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmar Entrega
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="confirmed">
            {confirmedDeliveries.length === 0 ? (
              <Card className="bg-card/50 border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma entrega confirmada</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {confirmedDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="bg-card/50 border-border/40">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{delivery.recipientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {delivery.block && `Bloco ${delivery.block} - `}Apto: {delivery.apartmentNumber}
                          </p>
                        </div>
                        {getStatusBadge(delivery.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">Código: {delivery.trackingCode}</p>
                      {delivery.arrivalDate && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Recebido: {new Date(delivery.arrivalDate as string).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                      {delivery.withdrawalDate && (
                        <p className="text-sm text-green-400 mt-1">
                          Entregue: {new Date(delivery.withdrawalDate as string).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                      {(delivery as any).doormanFullName && (
                        <p className="text-sm text-blue-400 mt-1">
                          Porteiro: {(delivery as any).doormanFullName}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}