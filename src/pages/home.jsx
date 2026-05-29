import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";
import MainLayout from "../components/layout/MainLayout";
import InteractiveCalendar from "../components/ui/InteractiveCalendar";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(false);

  async function handleLoginClick() {
    setCheckingAuth(true);
    try {
      const res = await fetch("/api/v1/user");
      if (res.ok) {
        const data = await res.json();
        if (data.access_level === "admin") {
          router.push("/dashboard/overview");
        } else {
          router.push("/dashboard/appointments");
        }
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setCheckingAuth(false);
    }
  }
  return (
    <>
      <section className="relative h-[614px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            className="w-full h-full object-cover opacity-30"
            src="/hero_section_barbershop.png"
            alt="Barbershop background"
            fill
            loading="eager"
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
              <Link href={"appointment/emperor-barbershop"}>
                <button className="bg-primary text-on-primary px-8 py-4 text-xs font-bold uppercase tracking-widest hover:shadow-[4px_4px_0px_#e9e1d6] transition-all">
                  Fazer um agendamento
                </button>
              </Link>
              <button
                onClick={handleLoginClick}
                disabled={checkingAuth}
                className="border border-outline-variant text-on-surface px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-surface-container-high transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkingAuth ? "Aguarde..." : "Acessar Dashboard"}
              </button>
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
