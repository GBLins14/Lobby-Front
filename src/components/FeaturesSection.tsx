import {
  Shield,
  Bell,
  History,
  Users,
  QrCode,
  Building2,
  Sparkles,
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      iconColor: "text-[hsl(var(--lobby-orange))]",
      bgColor: "bg-[hsl(var(--lobby-orange))]/20",
      title: "Segurança Total",
      description:
        "Registro digital de todas as movimentações. Nada se perde, tudo documentado.",
    },
    {
      icon: Bell,
      iconColor: "text-primary",
      bgColor: "bg-primary/20",
      title: "Alertas em Tempo Real",
      description:
        "Notificações instantâneas por e-mail assim que sua encomenda chega.",
    },
    {
      icon: History,
      iconColor: "text-[hsl(var(--lobby-orange))]",
      bgColor: "bg-[hsl(var(--lobby-orange))]/20",
      title: "Histórico Completo",
      description:
        "Acompanhe o histórico de todas as suas encomendas a qualquer momento.",
    },
    {
      icon: Users,
      iconColor: "text-primary",
      bgColor: "bg-primary/20",
      title: "Multi-usuários",
      description:
        "Perfeito para moradores, porteiros e síndicos com permissões específicas.",
    },
    {
      icon: QrCode,
      iconColor: "text-[hsl(var(--lobby-orange))]",
      bgColor: "bg-[hsl(var(--lobby-orange))]/20",
      title: "Códigos Únicos",
      description:
        "Cada encomenda tem um código exclusivo para identificação e retirada.",
    },
    {
      icon: Building2,
      iconColor: "text-primary",
      bgColor: "bg-primary/20",
      title: "Gestão de Condomínio",
      description:
        "Painel completo para síndicos gerenciarem usuários e acessos.",
    },
  ];

  return (
    <section className="py-24 bg-card/30 relative glow-bottom">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="badge-primary mb-4 mx-auto w-fit">
              <Sparkles size={16} />
              Recursos Poderosos
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Tudo que você <span className="text-gradient">precisa</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Uma plataforma completa para moradores, porteiros e síndicos
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <div className="feature-card h-full">
                <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                  <feature.icon size={24} className={feature.iconColor} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
