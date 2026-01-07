import { Package, Bell, CheckCircle, Sparkles } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const HowItWorksSection = () => {
  const steps = [
    {
      number: 1,
      icon: Package,
      iconColor: "text-[hsl(var(--lobby-orange))]",
      bgColor: "bg-[hsl(var(--lobby-orange))]/20",
      title: "Encomenda Chega",
      description:
        "O entregador deixa o pacote na portaria. O porteiro registra em segundos, selecionando o apartamento.",
    },
    {
      number: 2,
      icon: Bell,
      iconColor: "text-primary",
      bgColor: "bg-primary/20",
      title: "Notificação Instantânea",
      description:
        "Você recebe um e-mail automático com o envio e um código único de retirada interna.",
    },
    {
      number: 3,
      icon: CheckCircle,
      iconColor: "text-[hsl(var(--lobby-teal))]",
      bgColor: "bg-[hsl(var(--lobby-teal))]/20",
      title: "Retirada Segura",
      description:
        "Retire quando puder. Informe seu código e a porteira confirma. Tudo registrado com data e hora.",
    },
  ];

  return (
    <section className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="badge-primary mb-4 mx-auto w-fit">
              <Sparkles size={16} />
              Simples & Eficiente
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Como <span className="text-gradient">funciona</span>?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Três passos simples para nunca mais perder uma encomenda
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <ScrollReveal key={index} delay={index * 0.15}>
              <div className="step-card group h-full flex flex-col items-start">
                <div className={`w-12 h-12 rounded-xl ${step.bgColor} flex items-center justify-center mb-4`}>
                  <step.icon size={24} className={step.iconColor} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
