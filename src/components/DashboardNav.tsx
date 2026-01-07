import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreditCard, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardNavProps {
  className?: string;
  showPlans?: boolean;
}

export default function DashboardNav({ className, showPlans = false }: DashboardNavProps) {
  const location = useLocation();
  const { user } = useAuth();
  const isPlansPage = location.pathname === "/plans";
  const isAdmin = user?.role?.toUpperCase() === "ADMIN" || user?.role?.toUpperCase() === "BUSINESS";
  
  // Verifica se tem plano ativo (subscription existe e não é null)
  const hasActivePlan = !!(user?.subscription || user?.subscriptionPlan || user?.plan);

  return (
    <nav className={`flex items-center gap-2 ${className || ""}`}>
      {/* Mostrar botão de Planos apenas se showPlans=true E não tiver plano ativo */}
      {showPlans && !hasActivePlan && (
        <Link to="/plans">
          <Button 
            variant={isPlansPage ? "default" : "outline"} 
            size="sm"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Planos
          </Button>
        </Link>
      )}
      {/* Mostrar botão de Cancelar apenas se for admin/business E tiver plano ativo */}
      {isAdmin && hasActivePlan && (
        <Link to="/cancel-subscription">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive border-destructive/50 hover:bg-destructive/10"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </Link>
      )}
    </nav>
  );
}
