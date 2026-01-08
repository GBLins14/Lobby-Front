import { Star, Heart } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const TestimonialsSection = () => {
  const testimonials = [
    {
      stars: 5,
      text: '"Nunca mais perdi uma encomenda! Recebo a notificação na hora e posso retirar quando quiser."',
      author: "Maria Silva",
      role: "Moradora - Apt 302",
      initial: "M",
      color: "bg-primary",
    },
    {
      stars: 5,
      text: '"Facilitou muito meu trabalho. Em segundos registro tudo e o morador já é avisado automaticamente."',
      author: "João Costa",
      role: "Porteiro",
      initial: "J",
      color: "bg-[hsl(var(--lobby-teal))]",
    },
    {
      stars: 5,
      text: '"Controle total sobre a portaria. Aprovar porteiros, gerenciar acessos, tudo num único lugar."',
      author: "Ana Rodrigues",
      role: "Síndica",
      initial: "A",
      color: "bg-[hsl(var(--lobby-cyan))]",
    },
  ];

  return (
    <section className="py-24 relative glow-bottom bg-white/5 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="badge-primary mb-4 mx-auto w-fit">
              <Heart size={16} />
              Amado por todos
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              O que <span className="text-gradient">dizem</span> sobre nós
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={index} delay={index * 0.15}>
              <motion.div
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="h-full"
              >
                <div className="testimonial-card h-full flex flex-col cursor-pointer">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.stars)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className="star-yellow"
                      />
                    ))}
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed flex-grow">
                    {testimonial.text}
                  </p>
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/10">
                    <div
                      className={`w-11 h-11 rounded-full ${testimonial.color} flex items-center justify-center text-sm font-bold text-primary-foreground shadow-lg`}
                    >
                      {testimonial.initial}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-sm">
                        {testimonial.author}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
