import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ArrowLeft,
  Building2,
  Zap,
  Star,
  Crown,
  MessageCircle,
  Gift,
  Briefcase,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createCheckout } from "@/lib/api";
import { toast } from "sonner";

const WHATSAPP_LINK = "https://wa.me/5581999536361";

const plans = [
  {
    id: "teste-gratis",
    name: "Teste Grátis",
    description: "Experimente todas as funcionalidades",
    price: "0,00",
    priceValue: 0,
    icon: Gift,
    color: "emerald",
    popular: false,
    isContactPlan: true,
    features: [
      "Blocos ilimitados",
      "Apartamentos ilimitados",
      "Todas as funcionalidades",
      "WhatsApp + E-mail (Dedicado 24/7)",
    ],
  },
  {
    id: "basico",
    name: "Básico",
    description: "Para pequenos condomínios",
    price: "49,90",
    priceValue: 49.90,
    icon: Building2,
    color: "blue",
    popular: false,
    isContactPlan: false,
    features: [
      "Até 1 bloco",
      "Até 40 apartamentos",
      "Funcionalidades principais incluídas",
      "WhatsApp + E-mail (Dedicado 24/7)",
    ],
  },
  {
    id: "profissional",
    name: "Profissional",
    description: "Para condomínios em crescimento",
    price: "99,90",
    priceValue: 99.90,
    icon: Zap,
    color: "primary",
    popular: true,
    isContactPlan: false,
    features: [
      "Até 3 blocos",
      "Até 100 apartamentos",
      "Funcionalidades principais incluídas",
      "WhatsApp + E-mail (Dedicado 24/7)",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Solução completa para grandes empreendimentos",
    price: "169,90",
    priceValue: 169.90,
    icon: Crown,
    color: "amber",
    popular: false,
    isContactPlan: false,
    features: [
      "Até 5 blocos",
      "Até 200 apartamentos",
      "Funcionalidades principais incluídas",
      "WhatsApp + E-mail (Dedicado 24/7)",
    ],
  },
  {
    id: "empresarial",
    name: "Empresarial",
    description: "Soluções personalizadas para sua empresa",
    price: "Sob consulta",
    priceValue: null,
    icon: Briefcase,
    color: "purple",
    popular: false,
    isContactPlan: true,
    features: [
      "Blocos personalizados",
      "Apartamentos personalizados",
      "Funcionalidades personalizadas",
      "WhatsApp + E-mail (Dedicado 24/7)",
    ],
  },
];

const colorClassMap: Record<string, { bg: string; text: string; border: string }> = {
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/30 hover:border-emerald-500/50",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/30 hover:border-blue-500/50",
  },
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/30 hover:border-primary/50",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/30 hover:border-amber-500/50",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/30 hover:border-purple-500/50",
  },
};

export default function Plans() {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const getPlanApiId = (planId: string): string => {
    const planMap: Record<string, string> = {
      "basico": "BASIC",
      "profissional": "PROFESSIONAL",
      "premium": "PREMIUM",
    };
    return planMap[planId] || planId.toUpperCase();
  };

  const getWhatsAppMessage = (planId: string): string => {
    const planNames: Record<string, string> = {
      "teste-gratis": "Teste Grátis",
      "empresarial": "Empresarial",
    };
    const planName = planNames[planId] || planId;
    return encodeURIComponent(`Oi, desejo saber mais sobre o plano ${planName}.`);
  };

  const handleSelectPlan = async (planId: string, isContactPlan: boolean) => {
    if (isContactPlan) {
      const message = getWhatsAppMessage(planId);
      window.open(`${WHATSAPP_LINK}?text=${message}`, "_blank");
      return;
    }

    if (!isAuthenticated || !token) {
      toast.error("Você precisa estar logado para assinar um plano.");
      navigate("/login");
      return;
    }

    setLoadingPlanId(planId);
    try {
      const subscriptionPlan = getPlanApiId(planId);
      const response = await createCheckout(subscriptionPlan, token);
      if (response.success && response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        toast.error(response.message || "Erro ao iniciar o checkout.");
      }
    } catch {
      toast.error("Erro ao conectar com o servidor.");
    } finally {
      setLoadingPlanId(null);
    }
  };

  const getColorClasses = (color: string) => {
    return colorClassMap[color] || colorClassMap.blue;
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={isAuthenticated ? "/dashboard" : "/"}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Lobby</h1>
              <p className="text-sm text-muted-foreground">Planos e Assinaturas</p>
            </div>
          </div>
          <div className="w-[100px]"></div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-4">
            <Star className="h-3 w-3 mr-1" />
            Planos Flexíveis
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Escolha o plano ideal para seu condomínio
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Soluções escaláveis que acompanham o crescimento do seu empreendimento.
            Todos os planos incluem suporte dedicado via WhatsApp e E-mail 24/7.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const colors = getColorClasses(plan.color);
            const Icon = plan.icon;

            return (
              <motion.div
                key={plan.id}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Card
                  className={`bg-card/50 border-border/40 relative transition-all duration-300 cursor-pointer ${
                    plan.popular ? "ring-2 ring-primary/50 lg:scale-105" : ""
                  } ${colors.border}`}
                >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`h-7 w-7 ${colors.text}`} />
                  </div>
                  <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="text-center pb-6">
                  <div className="mb-6">
                    {plan.priceValue !== null ? (
                      <>
                        <span className="text-3xl font-bold text-foreground">R$ {plan.price}</span>
                        <span className="text-muted-foreground text-sm">/mês</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                    )}
                  </div>

                  <ul className="space-y-2 text-left">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs">
                        <div className={`p-0.5 rounded-full ${colors.bg} mt-0.5 flex-shrink-0`}>
                          <Check className={`h-3 w-3 ${colors.text}`} />
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className={`w-full ${
                      plan.isContactPlan
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : plan.popular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                    onClick={() => handleSelectPlan(plan.id, plan.isContactPlan)}
                    disabled={loadingPlanId === plan.id}
                  >
                    {loadingPlanId === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : plan.isContactPlan ? (
                      <>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Falar com Especialista
                      </>
                    ) : plan.popular ? (
                      "Começar Agora"
                    ) : (
                      "Selecionar Plano"
                    )}
                  </Button>
                </CardFooter>
              </Card>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Perguntas Frequentes
          </h3>
          
          <div className="space-y-4">
            <motion.div
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Card className="bg-card/50 border-border/40 cursor-pointer">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-foreground mb-2">
                    Posso trocar de plano a qualquer momento?
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                    As alterações são aplicadas no próximo ciclo de faturamento.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Card className="bg-card/50 border-border/40 cursor-pointer">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-foreground mb-2">
                    Como funciona o teste grátis?
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    O plano Teste Grátis inclui todas as funcionalidades sem limite de blocos ou apartamentos. 
                    Entre em contato com nosso especialista para ativar.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Card className="bg-card/50 border-border/40 cursor-pointer">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-foreground mb-2">
                    Como funciona o suporte técnico?
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Todos os planos incluem suporte dedicado via WhatsApp e E-mail, 
                    disponível 24 horas por dia, 7 dias por semana.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 max-w-2xl mx-auto">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Precisa de uma solução personalizada?
              </h3>
              <p className="text-muted-foreground mb-6">
                Entre em contato conosco para discutir suas necessidades específicas.
              </p>
              <Button 
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => window.open(WHATSAPP_LINK, "_blank")}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Falar com Especialista
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
