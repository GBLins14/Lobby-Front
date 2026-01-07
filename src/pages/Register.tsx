import { Link } from "react-router-dom";
import { Home, Shield, Users, Briefcase, ArrowRight, Sparkles } from "lucide-react";
import AuthCard from "@/components/AuthCard";

const Register = () => {
  const roles = [
    {
      id: "morador",
      icon: Home,
      title: "Morador",
      description: "Receba notificações e acompanhe suas encomendas",
      color: "bg-lobby-cyan",
      textColor: "text-lobby-cyan",
      path: "/register/morador",
    },
    {
      id: "porteiro",
      icon: Shield,
      title: "Porteiro",
      description: "Registre e gerencie as encomendas do condomínio",
      color: "bg-lobby-teal",
      textColor: "text-lobby-teal",
      path: "/register/porteiro",
    },
    {
      id: "sindico",
      icon: Users,
      title: "Síndico",
      description: "Administre usuários e tenha controle total",
      color: "bg-primary",
      textColor: "text-primary",
      path: "/register/sindico",
    },
    {
      id: "empresarial",
      icon: Briefcase,
      title: "Empresarial",
      description: "Gerencie entregas e parceiros comerciais",
      color: "bg-amber-500",
      textColor: "text-amber-500",
      path: "/register/empresarial",
    },
  ];

  return (
    <AuthCard>
      <div className="text-center mb-8">
        <div className="badge-primary mb-4 mx-auto w-fit">
          <Sparkles size={16} />
          Crie sua conta
        </div>
        <h1 className="text-2xl font-bold text-foreground">Quem é você?</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Escolha seu tipo de conta para começar
        </p>
      </div>

      <div className="space-y-3">
        {roles.map((role) => (
          <Link
            key={role.id}
            to={role.path}
            className="role-card group"
          >
            <div
              className={`w-12 h-12 rounded-xl ${role.color}/20 flex items-center justify-center`}
            >
              <role.icon size={24} className={role.textColor} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{role.title}</h3>
              <p className="text-sm text-muted-foreground">
                {role.description}
              </p>
            </div>
            <ArrowRight
              size={20}
              className="text-muted-foreground group-hover:text-foreground transition-colors"
            />
          </Link>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Já tem uma conta?{" "}
        <Link to="/login" className="text-primary hover:underline font-medium">
          Entrar
        </Link>
      </p>
    </AuthCard>
  );
};

export default Register;
