import { Link } from "react-router-dom";
import { Sparkles, Check, Clock, Shield } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const CTASection = () => {
  const benefits = [
    { icon: Check, text: "Sem cartão de crédito" },
    { icon: Clock, text: "Pronto em 2 minutos" },
    { icon: Shield, text: "Suporte Incluído" },
  ];

  return (
    <section className="py-24 bg-card/30 relative overflow-hidden">
      <div className="absolute inset-0 glow-bg opacity-50" />
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="glass-card max-w-3xl mx-auto p-12 text-center">
            <div className="badge-primary mb-6 mx-auto w-fit">
              <Sparkles size={16} />
              Comece em menos de 2 minutos
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para <span className="text-gradient">transformar</span> sua
              <br />
              portaria?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Junte-se a milhares de condomínios que já digitalizaram sua gestão de
              encomendas.
            </p>
            <Link
              to="/register"
              className="btn-primary inline-flex items-center gap-2 mb-8"
            >
              <Sparkles size={18} />
              Criar conta grátis
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <benefit.icon size={16} className="text-primary" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CTASection;
