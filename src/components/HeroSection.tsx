import { Link } from "react-router-dom";
import { Sparkles, Star, Package, Building, Zap, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  const stats = [
    { icon: Package, value: "50k+", label: "Encomendas gerenciadas" },
    { icon: Building, value: "500+", label: "Condomínios ativos" },
    { icon: Zap, value: "99.9%", label: "Uptime garantido" },
    { icon: Star, value: "4.9★", label: "Avaliação dos usuários" },
  ];

  return (
    <section className="relative min-h-screen landscape:min-h-[auto] landscape:py-8 flex items-center justify-center pt-36 sm:pt-40 md:pt-52 lg:pt-56 glow-bg overflow-hidden">
      <div className="container mx-auto px-4 py-12 sm:py-20 landscape:py-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="inline-flex items-center gap-1.5 sm:gap-2 bg-secondary/50 border border-border/50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-6 sm:mb-8"
        >
          <Sparkles size={14} className="text-primary sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm text-muted-foreground">
            Sistema de Gestão de Encomendas #1 do Brasil
          </span>
          <ChevronRight size={12} className="text-muted-foreground sm:w-3.5 sm:h-3.5" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-3xl xs:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 landscape:text-4xl landscape:mb-3"
        >
          Sua portaria,
          <br />
          <span className="text-gradient">reinventada</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 landscape:text-sm landscape:mb-4 px-2"
        >
          Chega de caderno de papel. O <span className="text-foreground font-medium">Lobby</span> digitaliza toda a gestão de
          encomendas do seu condomínio com{" "}
          <span className="text-primary">notificações instantâneas</span> e{" "}
          <span className="text-primary">rastreamento completo</span>.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
          className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-16 landscape:mb-6 landscape:flex-row"
        >
          <Link to="/register" className="btn-primary flex items-center justify-center gap-2 w-full xs:w-auto">
            <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" />
            Começar agora
            <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
          </Link>
          <Link to="/login" className="btn-secondary flex items-center justify-center w-full xs:w-auto">
            Já tenho conta
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto landscape:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <stat.icon size={18} className="text-muted-foreground mx-auto mb-1.5 sm:mb-2 sm:w-5 sm:h-5" />
              <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
