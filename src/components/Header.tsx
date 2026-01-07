import { Link } from "react-router-dom";
import Logo from "./Logo";
import { Sparkles, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/">
          <Logo size="sm" />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                {user?.fullName}
              </span>
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <LayoutDashboard size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Dashboard</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={14} className="sm:w-4 sm:h-4" />
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/plans"
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 sm:px-0"
              >
                Planos
              </Link>
              <Link
                to="/login"
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 sm:px-0"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="btn-primary flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm !h-9 sm:!h-10 !px-3 sm:!px-4"
              >
                <Sparkles size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Começar grátis</span>
                <span className="xs:hidden">Começar</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;