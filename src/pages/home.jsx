import Link from "next/link";
import MainLayout from "../components/layout/MainLayout";
import InteractiveCalendar from "../components/ui/InteractiveCalendar";

export default function Home() {
  return (
    <>
      <section className="relative h-[614px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover opacity-30"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUsinAh31_tqvacNCJBW48RqNyWCnDp8b4QX6Lm-BT7fnICYj5hBcuPXawUHHS68gN8ML6XDWO5oUi9FPnEa9ikW5mPs9hZ5r-rFpFP5c6T2pxWGkqm0Jy2fbYpOoQen4kYqCdFAETFY_OUXUllwdEsLcwiSO0rtEY5rknn0uLGfFWo8t6fvZsZ6l40husdyeFRVczVbFA8Zc3FZ_p-3Y1B0N7X1gIeLe-NGXvKcy8z8jK8-JF9zMCWKhjbWtscNK7q-zuvB1-G1A"
            alt="Barbershop background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/20 via-surface/60 to-surface" />
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto px-8 w-full">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-headline font-extrabold text-on-surface leading-tight mb-2">
              Rise above.
              <br />
              <span className="text-primary italic">Rise Sharp.</span>
            </h1>

            <p className="text-lg font-light text-on-surface-variant mb-2 tracking-wide">
              O sistema inteligente de agendamentos para barbearias.
            </p>

            <h2 className="text-sm font-label uppercase tracking-[0.2em] text-primary mb-8">
              Fácil de rodar, fácil de marcar
            </h2>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={"/register"}>
              <button className="bg-primary text-on-primary px-8 py-4 text-xs font-bold uppercase tracking-widest hover:shadow-[4px_4px_0px_#e9e1d6] transition-all">
                COMEÇAR AGORA
              </button>
              </Link>
              <Link href={"/dashboard/overview"}>
              <button className="border border-outline-variant text-on-surface px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-surface-container-high transition-all">
                Ver demo
              </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-surface" id="features">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="flex items-center justify-between mb-8 border-b border-outline-variant/10 pb-6">
            <div className="razor-divider">
              <span className="text-[10px] font-label uppercase tracking-widest text-primary block">
                Capacidades
              </span>

              <h2 className="text-3xl font-headline font-bold">
                Forjado para Eficiência
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-12 lg:col-span-12 bg-surface-container-low p-6 flex flex-col items-center">
              <div className="w-full flex flex-col md:flex-row gap-8 items-start justify-between">
                <div className="max-w-xs">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      calendar_month
                    </span>
                    <h3 className="text-xl font-headline font-bold">
                      Agendamentos inteligentes
                    </h3>
                  </div>

                  <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                    Elimine reservas duplicadas, filas e horários vagos com um
                    calendário intuitivo que se adapta aos ritmos e
                    especialidades individuais de seus barbeiros.
                  </p>

                  <button className="text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity">
                    Sua barbearia como uma sinfonia
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </button>
                </div>

                <div className="flex-1 w-full flex justify-center">
                  <InteractiveCalendar />
                </div>
              </div>
            </div>

            <div className="md:col-span-4 bg-surface-container-high p-6 border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">
                  groups
                </span>
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest group-hover:text-primary">
                  Gerenciamento
                </span>
              </div>

              <h3 className="text-lg font-headline font-bold mb-2">
                Gerenciamento de Equipe
              </h3>

              <p className="text-on-surface-variant text-xs leading-relaxed">
                Acompanhe e gerencie agendamentos e membros da equipe.
              </p>
            </div>

            <div className="md:col-span-4 bg-surface-container-highest p-6 border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">
                  loyalty
                </span>
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest group-hover:text-primary">
                  Clientes
                </span>
              </div>

              <h3 className="text-lg font-headline font-bold mb-2">
                Lealdade dos Clientes
              </h3>

              <p className="text-on-surface-variant text-xs leading-relaxed">
                Mantenha seus clientes fiéis à sua barbearia.
              </p>
            </div>

            <div className="md:col-span-4 bg-surface-container-low p-6 border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">
                  monitoring
                </span>
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest group-hover:text-primary">
                  Relatórios
                </span>
              </div>

              <h3 className="text-lg font-headline font-bold mb-2">
                Análises em tempo real
              </h3>

              <p className="text-on-surface-variant text-xs leading-relaxed">
                Veja em tempo real os agendamentos, serviços e profissionais
                reservados, tudo em um painel intuitivo.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

Home.getLayout = function getLayout(page) {
  return <MainLayout>{page}</MainLayout>;
};
