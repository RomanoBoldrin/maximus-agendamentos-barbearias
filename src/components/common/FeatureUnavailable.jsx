import Link from "next/link";

export default function FeatureUnavailable({
  eyebrow = "Feature descoberta",
  title = "Você encontrou uma funcionalidade ainda não implementada.",
  description = "Essa funcionalidade ainda não foi implementada nesta versão, mas saiba que ela já está no mapa da Maximus para futuras implementações.",
  cardTitle = "Volte em breve.",
  cardDescription = "Enquanto isso, você ainda pode continuar navegando pelo sistema e realizar um novo agendamento normalmente.",
  primaryActionLabel = "Fazer Agendamento",
  primaryActionHref = "/appointment/emperor-barbershop",
  secondaryActionLabel = "Voltar para Home",
  secondaryActionHref = "/home",
}) {
  return (
    <div className="bg-background text-on-surface min-h-screen">
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-surface px-8 py-20 flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,195,73,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(233,195,73,0.08),transparent_28%),linear-gradient(rgba(22,19,12,0.92),rgba(22,19,12,0.98))]" />

        <div className="relative max-w-5xl mx-auto w-full">
          <div className="bg-surface-container-high shadow-[0_20px_50px_rgba(17,14,8,0.45)] p-8 md:p-12 lg:p-16">
            <div className="flex flex-col items-center text-center">
              <p className="font-headline text-4xl md:text-5xl font-black text-primary uppercase tracking-widest mb-3">
                MAXIMUS
              </p>

              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/70 mb-12">
                O artesão moderno
              </p>

              <p className="font-label text-[10px] uppercase tracking-[0.25em] text-primary mb-5">
                {eyebrow}
              </p>

              <h1 className="font-headline text-4xl md:text-6xl font-bold italic tracking-tight max-w-3xl mb-8">
                {title}
              </h1>

              <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-2xl mb-10">
                {description}
              </p>

              <div className="bg-surface-container-lowest p-6 md:p-8 max-w-2xl mb-10">
                <p className="font-headline text-2xl md:text-3xl italic text-on-surface mb-3">
                  {cardTitle}
                </p>

                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {cardDescription}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  href={primaryActionHref}
                  className="bg-primary text-on-primary px-8 py-4 font-bold uppercase tracking-[0.2em] text-xs text-center shadow-[0_14px_30px_rgba(17,14,8,0.35)] hover:bg-[#f0ca55] hover:shadow-[4px_4px_0px_rgba(233,195,73,0.25)] active:translate-y-[1px] active:scale-[0.99] active:shadow-none transition-all duration-200"
                >
                  {primaryActionLabel}
                </Link>

                <Link
                  href={secondaryActionHref}
                  className="bg-surface-container-lowest text-on-surface px-8 py-4 font-bold uppercase tracking-[0.2em] text-xs text-center hover:bg-surface-container-highest transition-colors"
                >
                  {secondaryActionLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
