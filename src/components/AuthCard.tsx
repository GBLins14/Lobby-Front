import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "./Logo";

interface AuthCardProps {
  children: ReactNode;
  showBackToHome?: boolean;
}

const AuthCard = ({ children, showBackToHome = true }: AuthCardProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start md:justify-center p-4 py-6 md:py-8 auth-glow overflow-x-hidden overflow-y-auto">
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-full">
        <div className="mb-4 md:mb-8">
          <Logo size="md" />
        </div>
        <div className="glass-card w-full max-w-md p-5 md:p-8">{children}</div>
        {showBackToHome && (
          <Link
            to="/"
            className="mt-6 md:mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Voltar para o início
          </Link>
        )}
      </div>
    </div>
  );
};

export default AuthCard;
