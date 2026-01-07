import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAdminAccounts,
  getAdminPendingAccounts,
  getAdminBannedAccounts,
  getAdminDeliveries,
  confirmDoormanDelivery,
  adminApproveAccount,
  adminDeleteAccount,
  adminChangeAccountRole,
  adminBanAccount,
  adminUnbanAccount,
  registerCondominium,
  Account,
  Delivery,
  CondominiumSignUpPayload,
} from "@/lib/api";
import { formatPhone } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Briefcase,
  LogOut,
  User,
  Users,
  Clock,
  Ban,
  CheckCircle,
  Trash2,
  UserCog,
  Package,
  Building2,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardNav from "@/components/DashboardNav";

type BanUnit = "Hours" | "Days" | "Weeks" | "Months" | "Years";

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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

  // Condominium registration state
  const [condoForm, setCondoForm] = useState<CondominiumSignUpPayload>({
    name: "",
    cnpj: "",
    businessEmail: "",
    businessPhone: "",
    blocksCount: 1,
    apartmentCount: 1,
    address: {
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });
  const [isSubmittingCondo, setIsSubmittingCondo] = useState(false);

  const hasSubscription = user?.subscriptionPlan != null;
  const hasCondominium = user?.condominium != null;

  // Se não tem plano, redirecionar para página de planos
  useEffect(() => {
    if (!isLoading && user && !hasSubscription) {
      navigate("/plans");
    }
  }, [user, hasSubscription, isLoading, navigate]);

  useEffect(() => {
    fetchAllData();
  }, [token]);

  const fetchAllData = async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      const [accountsRes, pendingRes, bannedRes, deliveriesRes] = await Promise.all([
        getAdminAccounts(token),
        getAdminPendingAccounts(token),
        getAdminBannedAccounts(token),
        getAdminDeliveries(token),
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
      const response = await adminApproveAccount(token, accountId);
      if (response.success) {
        toast({ title: "Sucesso", description: "Conta aprovada com sucesso!" });
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
      const response = await adminDeleteAccount(token, accountId);
      if (response.success) {
        toast({ title: "Sucesso", description: "Conta excluída com sucesso!" });
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
      const response = await adminBanAccount(token, selectedAccountForBan.id, parseInt(banDuration, 10), banUnit);
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
      const response = await adminUnbanAccount(token, accountId);
      if (response.success) {
        toast({ title: "Sucesso", description: "Conta desbanida com sucesso!" });
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
      const response = await adminChangeAccountRole(token, selectedAccountForRole.id, newRole);
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
      BUSINESS: { label: "Empresarial", className: "bg-teal-500/20 text-teal-400 border-teal-500/30" },
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

  const handleCondoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmittingCondo(true);
    try {
      const response = await registerCondominium(token, condoForm);
      if (response.success) {
        toast({ title: "Sucesso", description: "Condomínio cadastrado com sucesso!" });
        window.location.reload();
      } else {
        toast({
          title: "Erro",
          description: response.message || "Não foi possível cadastrar o condomínio.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao cadastrar condomínio.", variant: "destructive" });
    } finally {
      setIsSubmittingCondo(false);
    }
  };

  // Se não tem plano, mostrar loading enquanto redireciona
  if (!hasSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não tem condomínio vinculado, exibir formulário de cadastro
  if (!hasCondominium) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Lobby</h1>
                <p className="text-sm text-muted-foreground">Cadastro de Condomínio</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto bg-card/50 border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Cadastrar Condomínio
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Para continuar, preencha os dados do seu condomínio.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCondoSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Condomínio *</Label>
                    <Input
                      id="name"
                      required
                      value={condoForm.name}
                      onChange={(e) => setCondoForm({ ...condoForm, name: e.target.value })}
                      placeholder="Residencial Exemplo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      required
                      value={condoForm.cnpj}
                      onChange={(e) => setCondoForm({ ...condoForm, cnpj: e.target.value })}
                      placeholder="00.000.000/0001-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessEmail">E-mail Comercial *</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      required
                      value={condoForm.businessEmail}
                      onChange={(e) => setCondoForm({ ...condoForm, businessEmail: e.target.value })}
                      placeholder="contato@condominio.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessPhone">Telefone Comercial *</Label>
                    <Input
                      id="businessPhone"
                      required
                      value={condoForm.businessPhone}
                      onChange={(e) => setCondoForm({ ...condoForm, businessPhone: formatPhone(e.target.value) })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blocksCount">Quantidade de Blocos *</Label>
                    <Input
                      id="blocksCount"
                      type="number"
                      min={1}
                      required
                      value={condoForm.blocksCount}
                      onChange={(e) => setCondoForm({ ...condoForm, blocksCount: parseInt(e.target.value) || 1 })}
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apartmentCount">Quantidade de Apartamentos *</Label>
                    <Input
                      id="apartmentCount"
                      type="number"
                      min={1}
                      required
                      value={condoForm.apartmentCount}
                      onChange={(e) => setCondoForm({ ...condoForm, apartmentCount: parseInt(e.target.value) || 1 })}
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4">
                  <h3 className="font-semibold mb-4">Endereço</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">CEP *</Label>
                      <Input
                        id="zipCode"
                        required
                        value={condoForm.address.zipCode}
                        onChange={(e) => setCondoForm({
                          ...condoForm,
                          address: { ...condoForm.address, zipCode: e.target.value }
                        })}
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street">Rua *</Label>
                      <Input
                        id="street"
                        required
                        value={condoForm.address.street}
                        onChange={(e) => setCondoForm({
                          ...condoForm,
                          address: { ...condoForm.address, street: e.target.value }
                        })}
                        placeholder="Rua Exemplo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="number">Número *</Label>
                      <Input
                        id="number"
                        required
                        value={condoForm.address.number}
                        onChange={(e) => setCondoForm({
                          ...condoForm,
                          address: { ...condoForm.address, number: e.target.value }
                        })}
                        placeholder="123"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        value={condoForm.address.complement}
                        onChange={(e) => setCondoForm({
                          ...condoForm,
                          address: { ...condoForm.address, complement: e.target.value }
                        })}
                        placeholder="Bloco A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro *</Label>
                      <Input
                        id="neighborhood"
                        required
                        value={condoForm.address.neighborhood}
                        onChange={(e) => setCondoForm({
                          ...condoForm,
                          address: { ...condoForm.address, neighborhood: e.target.value }
                        })}
                        placeholder="Centro"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        required
                        value={condoForm.address.city}
                        onChange={(e) => setCondoForm({
                          ...condoForm,
                          address: { ...condoForm.address, city: e.target.value }
                        })}
                        placeholder="Recife"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado *</Label>
                      <Input
                        id="state"
                        required
                        value={condoForm.address.state}
                        onChange={(e) => setCondoForm({
                          ...condoForm,
                          address: { ...condoForm.address, state: e.target.value }
                        })}
                        placeholder="PE"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmittingCondo}>
                  {isSubmittingCondo ? "Cadastrando..." : "Cadastrar Condomínio"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Lobby</h1>
              <p className="text-sm text-muted-foreground">Painel Empresarial</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DashboardNav showPlans={true} />
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
        {/* Condominium Code Card */}
        {(user?.condominium as { condominiumCode?: string })?.condominiumCode && (
          <Card className="mb-6 bg-card/50 border-border/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Código do Condomínio</p>
                  <p className="text-2xl font-bold text-primary font-mono">{(user.condominium as { condominiumCode: string }).condominiumCode}</p>
                  <p className="text-xs text-muted-foreground mt-1">Compartilhe este código com moradores, porteiros e síndicos para se registrarem.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText((user.condominium as { condominiumCode: string }).condominiumCode);
                    toast({ title: "Copiado!", description: "Código copiado para a área de transferência." });
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
          <h2 className="text-2xl font-bold text-foreground mb-2">Gestão Empresarial</h2>
          <p className="text-muted-foreground">Gerencie usuários e encomendas do seu condomínio</p>
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
                <Ban className="h-4 w-4 mr-2" />
                Banir
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
                Alterar função de <strong>{selectedAccountForRole?.fullName}</strong>:
              </p>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RESIDENT">Morador</SelectItem>
                  <SelectItem value="DOORMAN">Porteiro</SelectItem>
                  <SelectItem value="SYNDIC">Síndico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleChangeRole}>
                <UserCog className="h-4 w-4 mr-2" />
                Alterar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tabs */}
        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contas ({accounts.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendentes ({pendingAccounts.length})
            </TabsTrigger>
            <TabsTrigger value="banned" className="flex items-center gap-2">
              <Ban className="h-4 w-4" />
              Banidos ({bannedAccounts.length})
            </TabsTrigger>
            <TabsTrigger value="deliveries-pending" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Encomendas ({pendingDeliveries.length})
            </TabsTrigger>
            <TabsTrigger value="deliveries-confirmed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Entregues ({confirmedDeliveries.length})
            </TabsTrigger>
          </TabsList>

          {/* Accounts Tab */}
          <TabsContent value="accounts">
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

          {/* Pending Tab */}
          <TabsContent value="pending">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : pendingAccounts.length === 0 ? (
              <Card className="bg-card/50 border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <p className="text-muted-foreground">Nenhuma aprovação pendente</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingAccounts.map((account) => (
                  <Card key={account.id} className="bg-card/50 border-border/40 border-amber-500/30">
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
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(account.id)}
                        >
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

          {/* Banned Tab */}
          <TabsContent value="banned">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : bannedAccounts.length === 0 ? (
              <Card className="bg-card/50 border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <p className="text-muted-foreground">Nenhuma conta banida</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bannedAccounts.map((account) => (
                  <AccountCard key={account.id} account={account} showActions={false} showBanInfo={true} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pending Deliveries Tab */}
          <TabsContent value="deliveries-pending">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : pendingDeliveries.length === 0 ? (
              <Card className="bg-card/50 border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma encomenda pendente</p>
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
                      <p className="text-sm text-muted-foreground mb-2">Código: {delivery.trackingCode}</p>
                      {delivery.arrivalDate && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Chegada: {new Date(delivery.arrivalDate as string).toLocaleDateString("pt-BR")}
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

          {/* Confirmed Deliveries Tab */}
          <TabsContent value="deliveries-confirmed">
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
                      <p className="text-sm text-muted-foreground mb-2">Código: {delivery.trackingCode}</p>
                      {delivery.arrivalDate && (
                        <p className="text-sm text-muted-foreground">
                          Chegada: {new Date(delivery.arrivalDate as string).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                      {delivery.withdrawalDate && (
                        <p className="text-sm text-muted-foreground">
                          Retirada: {new Date(delivery.withdrawalDate as string).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                      {delivery.doormanFullName && (
                        <p className="text-sm text-muted-foreground">
                          Porteiro: {String(delivery.doormanFullName)}
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
