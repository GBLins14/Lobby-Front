import logoIcon from "@/assets/logo-icon.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

const Logo = ({ size = "md" }: LogoProps) => {
  const sizes = {
    sm: { icon: 48, text: "text-xl" },
    md: { icon: 56, text: "text-2xl" },
    lg: { icon: 72, text: "text-3xl" },
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <img 
          src={logoIcon} 
          alt="Lobby Logo" 
          width={sizes[size].icon} 
          height={sizes[size].icon}
          className="object-contain opacity-90"
        />
      </div>
      <div className="flex flex-col">
        <span className={`font-bold ${sizes[size].text} text-foreground`}>
          Lobby
        </span>
        <span className="text-xs text-muted-foreground">Gestão de Encomendas</span>
      </div>
    </div>
  );
};

export default Logo;
