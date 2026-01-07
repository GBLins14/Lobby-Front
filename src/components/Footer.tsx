import { Link } from "react-router-dom";
import Logo from "./Logo";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Logo size="sm" />
            <p className="text-sm text-muted-foreground max-w-xs text-center md:text-left">
              Gestão inteligente de encomendas para condomínios modernos.
            </p>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              to="/login"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Entrar
            </Link>
            <Link
              to="/register"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Criar conta
            </Link>
          </nav>
        </div>
        <div className="mt-8 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 Lobby. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Feito com <Heart size={14} className="text-primary fill-primary" /> para condomínios
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
