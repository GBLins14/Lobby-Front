import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAccounts,
  getPendingAccounts,
  getBannedAccounts,
  getSyndicDeliveries,
  confirmDoormanDelivery,
  approveAccount,
  deleteAccount,
  changeAccountRole,
  banAccount,
  unbanAccount,
  Account,
  Delivery,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  LogOut,
  User,
  Users,
  Clock,
  Ban,
  CheckCircle,
  Trash2,
  UserCog,
  Package,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardNav from "@/components/DashboardNav";

type BanUnit = "Hours" | "Days" | "Weeks" | "Months" | "Years";

export default function SyndicDashboard() {
  const { user, token, logout } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [pendingAccounts, setPendingAccounts] = useState<Account[]>([]);
  const [bannedAccounts, setBannedAccounts] = useState<Account[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ban dialog state
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedAccountForBan, setSelectedAccountForBan] = useState<Account | null>(null);
  const [banDuration, setBanDuration] = useState("1");
  const [banUnit, setBanUnit] = useState<BanUnit>("Days");

  // Role dialog state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedAccountForRole, setSelectedAccountForRole] = useState<Account | null>(null);
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    fetchAllData();
  }, [token]);

  const fetchAllData = async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      const [accountsRes, pendingRes, bannedRes, deliveriesRes] = await Promise.all([
        getAccounts(token),
        getPendingAccounts(token),
        getBannedAccounts(token),
        getSyndicDeliveries(token),
      ]);

      if (accountsRes.success) setAccounts(accountsRes.accounts || []);
      if (pendingRes.success) setPendingAccounts(pendingRes.accounts || []);
      if (bannedRes.success) setBannedAccounts(bannedRes.accounts || []);
      if (deliveriesRes.success) setDeliveries(deliveriesRes.deliveries || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (accountId: number) => {
    if (!token) return;

    try {
      const response = await approveAccount(token, accountId);
      if (response.success) {
        toast({ title: "Sucesso", description: "Conta aprovada com sucesso!" });
        // Update state immediately for real-time feel
        setPendingAccounts(prev => prev.filter(a => a.id !== accountId));
        fetchAllData();
      } else {
        toast({
          title: "Erro",
          description: response.message || "Não foi possível aprovar a conta.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao aprovar conta.", variant: "destructive" });
    }
  };

  const handleDelete = async (accountId: number) => {
    if (!token) return;

    try {
      const response = await deleteAccount(token, accountId);
      if (response.success) {
        toast({ title: "Sucesso", description: "Conta excluída com sucesso!" });
        // Update state immediately
        setPendingAccounts(prev => prev.filter(a => a.id !== accountId));
        setAccounts(prev => prev.filter(a => a.id !== accountId));
        fetchAllData();
      } else {
        toast({
          title: "Erro",
          description: response.message || "Não foi possível excluir a conta.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao excluir conta.", variant: "destructive" });
    }
  };

  const handleBan = async () => {
    if (!token || !selectedAccountForBan) return;

    try {
      const response = await banAccount(token, selectedAccountForBan.id, parseInt(banDuration, 10), banUnit);
      if (response.success) {
        toast({ title: "Sucesso", description: "Conta banida com sucesso!" });
        setBanDialogOpen(false);
        setSelectedAccountForBan(null);
        fetchAllData();
      } else {
        toast({
          title: "Erro",
          description: response.message || "Não foi possível banir a conta.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao banir conta.", variant: "destructive" });
    }
  };

  const handleUnban = async (accountId: number) => {
    if (!token) return;

    try {
      const response = await unbanAccount(token, accountId);
      if (response.success) {
        toast({ title: "Sucesso", description: "Conta desbanida com sucesso!" });
        // Update state immediately
        setBannedAccounts(prev => prev.filter(a => a.id !== accountId));
        fetchAllData();
      } else {
        toast({
          title: "Erro",
          description: response.message || "Não foi possível desbanir a conta.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao desbanir conta.", variant: "destructive" });
    }
  };

  const handleChangeRole = async () => {
    if (!token || !selectedAccountForRole || !newRole) return;

    try {
      const response = await changeAccountRole(token, selectedAccountForRole.id, newRole);
      if (response.success) {
        toast({ title: "Sucesso", description: "Função alterada com sucesso!" });
        setRoleDialogOpen(false);
        setSelectedAccountForRole(null);
        setNewRole("");
        fetchAllData();
      } else {
        toast({
          title: "Erro",
          description: response.message || "Não foi possível alterar a função.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao alterar função.", variant: "destructive" });
    }
  };

  const handleConfirmDelivery = async (trackingCode: string) => {
    if (!token) return;

    try {
      const response = await confirmDoormanDelivery(token, trackingCode);
      if (response.success) {
        toast({ title: "Sucesso", description: "Entrega confirmada com sucesso!" });
        fetchAllData();
      } else {
        toast({
          title: "Erro",
          description: response.message || "Não foi possível confirmar a entrega.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao confirmar entrega.", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const isDelivered = (status: string) => {
    const statusLower = status?.toLowerCase();
    return statusLower === "confirmed" || statusLower === "entregue" || statusLower === "delivered";
  };

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; className: string }> = {
      RESIDENT: { label: "Morador", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      DOORMAN: { label: "Porteiro", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
      SYNDIC: { label: "Síndico", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    };
    const config = roleMap[role?.toUpperCase()] || { label: role, className: "" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (isDelivered(status)) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Entregue</Badge>;
    }
    return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pendente</Badge>;
  };

  const AccountCard = ({ account, showActions = true, showBanInfo = false }: { account: Account; showActions?: boolean; showBanInfo?: boolean }) => (
    <Card className="bg-card/50 border-border/40">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-semibold">{account.fullName}</p>
            <p className="text-sm text-muted-foreground">@{account.username}</p>
          </div>
          {getRoleBadge(account.role)}
        </div>
        <div className="text-sm text-muted-foreground space-y-1 mb-3">
          <p>Email: {account.email}</p>
          <p>CPF: {account.cpf}</p>
          {account.block && account.apartmentNumber && (
            <p>Bloco {account.block} - Apto {account.apartmentNumber}</p>
          )}
          {showBanInfo && account.banExpiresAt && (
            <p className="text-red-400">Banido até: {new Date(account.banExpiresAt as string).toLocaleString("pt-BR")}</p>
          )}
        </div>
        {showActions && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedAccountForRole(account);
                setNewRole(account.role);
                setRoleDialogOpen(true);
              }}
            >
              <UserCog className="h-4 w-4 mr-1" />
              Função
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-amber-500 border-amber-500/50"
              onClick={() => {
                setSelectedAccountForBan(account);
                setBanDialogOpen(true);
              }}
            >
              <Ban className="h-4 w-4 mr-1" />
              Banir
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-500 border-red-500/50"
              onClick={() => handleDelete(account.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
          </div>
        )}
        {showBanInfo && (
          <Button size="sm" className="w-full mt-2" onClick={() => handleUnban(account.id)}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Desbanir
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const pendingDeliveries = deliveries.filter(d => !isDelivered(d.status));
  const confirmedDeliveries = deliveries.filter(d => isDelivered(d.status));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Lobby</h1>
              <p className="text-sm text-muted-foreground">Painel do Síndico</p>
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
        <div className="grid gap-4 md:grid-cols-5 mb-8">
          <Card className="bg-card/50 border-border/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Contas</p>
                  <p className="text-3xl font-bold text-foreground">{accounts.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-3xl font-bold text-amber-500">{pendingAccounts.length}</p>
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
                  <p className="text-sm text-muted-foreground">Banidos</p>
                  <p className="text-3xl font-bold text-red-500">{bannedAccounts.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10">
                  <Ban className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Moradores</p>
                  <p className="text-3xl font-bold text-blue-500">
                    {accounts.filter(a => a.role?.toUpperCase() === "RESIDENT").length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <User className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Encomendas</p>
                  <p className="text-3xl font-bold text-green-500">{deliveries.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Package className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Gestão do Condomínio</h2>
          <p className="text-muted-foreground">Gerencie usuários e encomendas</p>
        </div>

        {/* Ban Dialog */}
        <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
          <DialogContent className="bg-card border-border/40">
            <DialogHeader>
              <DialogTitle>Banir Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Banir <strong>{selectedAccountForBan?.fullName}</strong>?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duração</Label>
                  <Input
                    type="number"
                    min="1"
                    value={banDuration}
                    onChange={(e) => setBanDuration(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Select value={banUnit} onValueChange={(v) => setBanUnit(v as BanUnit)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hours">Horas</SelectItem>
                      <SelectItem value="Days">Dias</SelectItem>
                      <SelectItem value="Weeks">Semanas</SelectItem>
                      <SelectItem value="Months">Meses</SelectItem>
                      <SelectItem value="Years">Anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleBan} className="bg-amber-600 hover:bg-amber-700">
                Confirmar Ban
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Role Dialog */}
        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent className="bg-card border-border/40">
            <DialogHeader>
              <DialogTitle>Alterar Função</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Alterar função de <strong>{selectedAccountForRole?.fullName}</strong>
              </p>
              <div className="space-y-2">
                <Label>Nova Função</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESIDENT">Morador</SelectItem>
                    <SelectItem value="DOORMAN">Porteiro</SelectItem>
                    <SelectItem value="SYNDIC">Síndico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleChangeRole}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Todos ({accounts.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendentes ({pendingAccounts.length})
            </TabsTrigger>
            <TabsTrigger value="banned" className="flex items-center gap-2">
              <Ban className="h-4 w-4" />
              Banidos ({bannedAccounts.length})
            </TabsTrigger>
            <TabsTrigger value="deliveries" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Encomendas ({deliveries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : accounts.length === 0 ? (
              <Card className="bg-card/50 border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma conta encontrada</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {pendingAccounts.length === 0 ? (
              <Card className="bg-card/50 border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma conta pendente</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingAccounts.map((account) => (
                  <Card key={account.id} className="bg-card/50 border-border/40">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{account.fullName}</p>
                          <p className="text-sm text-muted-foreground">@{account.username}</p>
                        </div>
                        {getRoleBadge(account.role)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1 mb-3">
                        <p>Email: {account.email}</p>
                        {account.block && account.apartmentNumber && (
                          <p>Bloco {account.block} - Apto {account.apartmentNumber}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => handleApprove(account.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-500/50"
                          onClick={() => handleDelete(account.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="banned">
            {bannedAccounts.length === 0 ? (
              <Card className="bg-card/50 border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Ban className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma conta banida</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bannedAccounts.map((account) => (
                  <AccountCard key={account.id} account={account} showActions={false} showBanInfo />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="deliveries">
            {deliveries.length === 0 ? (
              <Card className="bg-card/50 border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma encomenda encontrada</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Pending Deliveries */}
                {pendingDeliveries.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Pendentes ({pendingDeliveries.length})</h3>
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
                            <p className="text-sm text-muted-foreground mb-2">Código: {delivery.trackingCode}</p>
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
                  </div>
                )}

                {/* Confirmed Deliveries */}
                {confirmedDeliveries.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Entregues ({confirmedDeliveries.length})</h3>
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
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}