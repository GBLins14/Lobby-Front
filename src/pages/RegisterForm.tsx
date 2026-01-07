import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Home, 
  Shield, 
  Users, 
  Briefcase,
  User, 
  Mail, 
  Building, 
  Lock, 
  Check, 
  CreditCard, 
  Phone,
  AtSign,
  Hash,
  Layers
} from "lucide-react";
import AuthCard from "@/components/AuthCard";
import InputField from "@/components/InputField";
import { toast } from "sonner";
import { formatCPF, formatPhone } from "@/lib/formatters";
import { signUp } from "@/lib/api";

type RoleType = "morador" | "porteiro" | "sindico" | "empresarial";

const roleConfig = {
  morador: {
    icon: Home,
    title: "Morador",
    apiRole: "RESIDENT" as const,
    badgeClass: "badge-cyan",
    showBlockAndApartment: true,
    hideCondominiumCode: false,
  },
  porteiro: {
    icon: Shield,
    title: "Porteiro",
    apiRole: "DOORMAN" as const,
    badgeClass: "badge-teal",
    showBlockAndApartment: false,
    hideCondominiumCode: false,
  },
  sindico: {
    icon: Users,
    title: "Síndico",
    apiRole: "SYNDIC" as const,
    badgeClass: "badge-primary",
    showBlockAndApartment: true,
    hideCondominiumCode: false,
  },
  empresarial: {
    icon: Briefcase,
    title: "Empresarial",
    apiRole: "BUSINESS" as const,
    badgeClass: "badge-amber",
    showBlockAndApartment: false,
    hideCondominiumCode: true,
  },
};

const RegisterForm = () => {
  const navigate = useNavigate();
  const { role } = useParams<{ role: RoleType }>();
  
  const config = roleConfig[role as RoleType] || roleConfig.morador;
  const IconComponent = config.icon;

  const [formData, setFormData] = useState({
    fullName: "",
    cpf: "",
    phone: "",
    username: "",
    email: "",
    condominiumCode: "",
    block: "",
    apartmentNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "cpf") {
      setFormData({ ...formData, cpf: formatCPF(value) });
    } else if (name === "phone") {
      setFormData({ ...formData, phone: formatPhone(value) });
    } else if (name === "condominiumCode") {
      setFormData({ ...formData, condominiumCode: value.toUpperCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const response = await signUp({
        fullName: formData.fullName,
        cpf: formData.cpf,
        phone: formData.phone,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: config.apiRole,
        condominiumCode: formData.condominiumCode,
        block: formData.block || undefined,
        apartmentNumber: formData.apartmentNumber || undefined,
      });

      if (response.success) {
        toast.success("Conta criada com sucesso! Faça login para continuar.");
        navigate("/login");
      } else {
        toast.error(response.message || "Erro ao criar conta");
      }
    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast.error("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <div className={`${config.badgeClass} flex-1 justify-center`}>
          <IconComponent size={18} />
          {config.title}
        </div>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-1">Criar conta</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Preencha seus dados para começar
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome completo */}
        <InputField
          icon={User}
          label="Nome completo"
          type="text"
          name="fullName"
          placeholder="Ex: João da Silva"
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        {/* CPF e Telefone */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <InputField
            icon={CreditCard}
            label="CPF"
            type="tel"
            inputMode="numeric"
            name="cpf"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={handleChange}
            required
          />

          <InputField
            icon={Phone}
            label="Telefone"
            type="tel"
            inputMode="numeric"
            name="phone"
            placeholder="(00) 00000-0000"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        {/* Username */}
        <InputField
          icon={AtSign}
          label="Nome de usuário"
          type="text"
          name="username"
          placeholder="Ex: joaosilva"
          value={formData.username}
          onChange={handleChange}
          required
        />

        {/* E-mail */}
        <InputField
          icon={Mail}
          label="E-mail"
          type="email"
          name="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* Código do Condomínio - obrigatório exceto para empresarial */}
        {!config.hideCondominiumCode && (
          <InputField
            icon={Hash}
            label="Código do condomínio"
            type="text"
            name="condominiumCode"
            placeholder="Ex: PGCK8O"
            value={formData.condominiumCode}
            onChange={handleChange}
            required
          />
        )}

        {/* Bloco e Apartamento - apenas para Morador (RESIDENT) */}
        {config.showBlockAndApartment && (
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <InputField
              icon={Layers}
              label="Bloco"
              type="text"
              name="block"
              placeholder="Ex: A, B, 1, 2"
              value={formData.block}
              onChange={handleChange}
              required
            />

            <InputField
              icon={Building}
              label="Apartamento"
              type="text"
              name="apartmentNumber"
              placeholder="Ex: 103-B"
              value={formData.apartmentNumber}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Senha e Confirmar Senha */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <InputField
            icon={Lock}
            label="Senha"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <InputField
            icon={Lock}
            label="Confirmar"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-4 md:mt-6"
        >
          {isLoading ? (
            "Criando conta..."
          ) : (
            <>
              <Check size={18} />
              Criar conta
            </>
          )}
        </button>
      </form>
    </AuthCard>
  );
};

export default RegisterForm;
