import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    (function () {
      const calendarGrid = document.getElementById("calendar-grid");
      const monthYearDisplay = document.getElementById("calendar-month-year");
      const prevBtn = document.getElementById("prev-month");
      const nextBtn = document.getElementById("next-month");

      if (!calendarGrid || !monthYearDisplay || !prevBtn || !nextBtn) return;

      let currentDate = new Date();
      let selectedDate = new Date();

      function renderCalendar() {
        calendarGrid.innerHTML = "";
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthYearDisplay.textContent = new Intl.DateTimeFormat("en-US", {
          month: "long",
          year: "numeric",
        }).format(currentDate);

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Fill empty slots
        for (let i = 0; i < firstDay; i++) {
          const emptyDiv = document.createElement("div");
          calendarGrid.appendChild(emptyDiv);
        }

        // Fill days
        for (let day = 1; day <= daysInMonth; day++) {
          const dayBtn = document.createElement("button");
          dayBtn.textContent = day;
          dayBtn.className =
            "py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium";

          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          const isSelected =
            day === selectedDate.getDate() &&
            month === selectedDate.getMonth() &&
            year === selectedDate.getFullYear();

          if (isSelected) {
            dayBtn.className =
              "py-4 text-[11px] bg-primary text-on-primary font-bold";
          } else if (isToday) {
            dayBtn.classList.add("text-primary", "border-primary/20");
          }

          dayBtn.addEventListener("click", () => {
            selectedDate = new Date(year, month, day);
            renderCalendar();
          });

          calendarGrid.appendChild(dayBtn);
        }
      }

      prevBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
      });

      nextBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
      });

      renderCalendar();
    })();
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary">
      <nav className="fixed top-0 z-50 w-full glass-nav border-b border-outline-variant/10">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-[1600px] mx-auto">
          <div
            className="text-2xl font-bold font-['Newsreader'] text-[#e9c349]"
            style={{}}
          >
            Maximus
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              className="text-[#e9c349] border-b-2 border-[#e9c349] pb-1 font-['Newsreader'] uppercase tracking-widest text-xs"
              href="#"
              style={{}}
            >
              Home
            </a>
          </div>

          <div className="flex items-center gap-6">
            <button
              className="text-[#e9c349] font-['Newsreader'] uppercase tracking-widest text-xs hover:opacity-80"
              style={{}}
            >
              Login
            </button>

            <button
              className="bg-gradient-to-r from-[#e9c349] to-[#b39016] text-[#3c2f00] px-5 py-2 font-bold uppercase tracking-widest text-[10px] hover:shadow-[2px_2px_0px_#e9e1d6] transition-all"
              style={{}}
            >
              COMEÇAR AGORA
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        <section className="relative h-[614px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover opacity-30"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUsinAh31_tqvacNCJBW48RqNyWCnDp8b4QX6Lm-BT7fnICYj5hBcuPXawUHHS68gN8ML6XDWO5oUi9FPnEa9ikW5mPs9hZ5r-rFpFP5c6T2pxWGkqm0Jy2fbYpOoQen4kYqCdFAETFY_OUXUllwdEsLcwiSO0rtEY5rknn0uLGfFWo8t6fvZsZ6l40husdyeFRVczVbFA8Zc3FZ_p-3Y1B0N7X1gIeLe-NGXvKcy8z8jK8-JF9zMCWKhjbWtscNK7q-zuvB1-G1A"
              style={{}}
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-b from-surface/20 via-surface/60 to-surface"></div>
          </div>

          <div className="relative z-10 max-w-[1600px] mx-auto px-8 w-full">
            <div className="max-w-2xl">
              <h1
                className="text-5xl md:text-6xl font-headline font-extrabold text-on-surface leading-tight mb-2"
                style={{}}
              >
                Rise above.
                <br />
                <span className="text-primary italic" style={{}}>
                  Rise Sharp.
                </span>
              </h1>

              <p
                className="text-lg font-light text-on-surface-variant mb-2 tracking-wide"
                style={{}}
              >
                O sistema inteligente de agendamentos para barbearias.
              </p>

              <h2
                className="text-sm font-label uppercase tracking-[0.2em] text-primary mb-8"
                style={{}}
              >
                Fácil de rodar, fácil de marcar
              </h2>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="bg-primary text-on-primary px-8 py-4 text-xs font-bold uppercase tracking-widest hover:shadow-[4px_4px_0px_#e9e1d6] transition-all"
                  style={{}}
                >
                  COMEÇAR AGORA
                </button>

                <button
                  className="border border-outline-variant text-on-surface px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-surface-container-high transition-all"
                  style={{}}
                >
                  Ver demo
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-surface" id="features">
          <div className="max-w-[1600px] mx-auto px-8">
            <div className="flex items-center justify-between mb-8 border-b border-outline-variant/10 pb-6">
              <div className="razor-divider">
                <span
                  className="text-[10px] font-label uppercase tracking-widest text-primary block"
                  style={{}}
                >
                  Capacidades
                </span>

                <h2 className="text-3xl font-headline font-bold" style={{}}>
                  Forjado para Eficiência
                </h2>
              </div>

              <div className="hidden md:flex gap-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-12 lg:col-span-12 bg-surface-container-low p-6 flex flex-col items-center">
                <div className="w-full flex flex-col md:flex-row gap-8 items-start justify-between">
                  <div className="max-w-xs">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="material-symbols-outlined text-primary text-2xl"
                        style={{}}
                      >
                        calendar_month
                      </span>
                      <h3
                        className="text-xl font-headline font-bold"
                        style={{}}
                      >
                        Agendamentos inteligentes
                      </h3>
                    </div>

                    <p
                      className="text-on-surface-variant text-sm leading-relaxed mb-6"
                      style={{}}
                    >
                      Elimine reservas duplicadas, filas e horários vagos com um
                      calendário intuitivo que se adapta aos ritmos e
                      especialidades individuais de seus barbeiros.
                    </p>

                    <button
                      className="text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity"
                      style={{}}
                    >
                      Sua barbearia como uma sinfonia
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{}}
                      >
                        arrow_forward
                      </span>
                    </button>
                  </div>

                  <div className="flex-1 w-full flex justify-center">
                    <div
                      className="w-full max-w-2xl bg-surface-container-lowest p-6 border border-outline-variant/30 font-body shadow-xl"
                      id="interactive-datepicker"
                    >
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-outline-variant/10">
                        <h4
                          className="text-xl font-headline font-bold text-primary tracking-wide"
                          id="calendar-month-year"
                          style={{}}
                        >
                          Abril 2026
                        </h4>

                        <div className="flex gap-4">
                          <button
                            className="p-1 hover:text-primary transition-colors"
                            id="prev-month"
                            style={{}}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{}}
                            >
                              chevron_left
                            </span>
                          </button>

                          <button
                            className="p-1 hover:text-primary transition-colors"
                            id="next-month"
                            style={{}}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{}}
                            >
                              chevron_right
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-px text-center mb-1">
                        <div
                          className="text-[9px] font-bold uppercase tracking-widest text-outline py-2"
                          style={{}}
                        >
                          Dom
                        </div>
                        <div
                          className="text-[9px] font-bold uppercase tracking-widest text-outline py-2"
                          style={{}}
                        >
                          Seg
                        </div>
                        <div
                          className="text-[9px] font-bold uppercase tracking-widest text-outline py-2"
                          style={{}}
                        >
                          Ter
                        </div>
                        <div
                          className="text-[9px] font-bold uppercase tracking-widest text-outline py-2"
                          style={{}}
                        >
                          Qua
                        </div>
                        <div
                          className="text-[9px] font-bold uppercase tracking-widest text-outline py-2"
                          style={{}}
                        >
                          Qui
                        </div>
                        <div
                          className="text-[9px] font-bold uppercase tracking-widest text-outline py-2"
                          style={{}}
                        >
                          Sex
                        </div>
                        <div
                          className="text-[9px] font-bold uppercase tracking-widest text-outline py-2"
                          style={{}}
                        >
                          Sab
                        </div>
                      </div>

                      <div
                        className="grid grid-cols-7 gap-px"
                        id="calendar-grid"
                      >
                        <div></div>
                        <div></div>
                        <div></div>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          1
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          2
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          3
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          4
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          5
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          6
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          7
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          8
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          9
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          10
                        </button>
                        <button
                          className="py-4 text-[11px] bg-primary text-on-primary font-bold"
                          style={{}}
                        >
                          11
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          12
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          13
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          14
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          15
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          16
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          17
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          18
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          19
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          20
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          21
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          22
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          23
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          24
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          25
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          26
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          27
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          28
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          29
                        </button>
                        <button
                          className="py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium"
                          style={{}}
                        >
                          30
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 bg-surface-container-high p-6 border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="material-symbols-outlined text-primary text-2xl"
                    style={{}}
                  >
                    groups
                  </span>
                  <span
                    className="text-[10px] font-bold text-outline uppercase tracking-widest group-hover:text-primary"
                    style={{}}
                  >
                    Gerenciamento
                  </span>
                </div>
                <h3 className="text-lg font-headline font-bold mb-2" style={{}}>
                  Gerenciamento de Equipe
                </h3>
                <p
                  className="text-on-surface-variant text-xs leading-relaxed"
                  style={{}}
                >
                  Acompanhe e gerencie agendamentos e membros da equipe.
                </p>
              </div>

              <div className="md:col-span-4 bg-surface-container-highest p-6 border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="material-symbols-outlined text-primary text-2xl"
                    style={{}}
                  >
                    loyalty
                  </span>
                  <span
                    className="text-[10px] font-bold text-outline uppercase tracking-widest group-hover:text-primary"
                    style={{}}
                  >
                    Clientes
                  </span>
                </div>
                <h3 className="text-lg font-headline font-bold mb-2" style={{}}>
                  Lealdade dos Clientes
                </h3>
                <p
                  className="text-on-surface-variant text-xs leading-relaxed"
                  style={{}}
                >
                  Mantenha seus clientes fiéis à sua barbearia.
                </p>
              </div>

              <div className="md:col-span-4 bg-surface-container-low p-6 border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="material-symbols-outlined text-primary text-2xl"
                    style={{}}
                  >
                    monitoring
                  </span>
                  <span
                    className="text-[10px] font-bold text-outline uppercase tracking-widest group-hover:text-primary"
                    style={{}}
                  >
                    Relatórios
                  </span>
                </div>
                <h3 className="text-lg font-headline font-bold mb-2" style={{}}>
                  Análises em tempo real
                </h3>
                <p
                  className="text-on-surface-variant text-xs leading-relaxed"
                  style={{}}
                >
                  Veja em tempo real os agendamentos, serviços e profissionais
                  reservados, tudo em um painel intuitivo.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#110e08] py-12 border-t border-outline-variant/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full px-8 max-w-[1600px] mx-auto">
          <div>
            <div
              className="text-xl font-bold font-['Newsreader'] text-[#e9c349] mb-4"
              style={{}}
            >
              Maximus
            </div>
            <p
              className="text-[#e9e1d6]/40 font-['Work_Sans'] text-[10px] uppercase tracking-tighter leading-relaxed"
              style={{}}
            >
              © 2026 Maximus Barbershop. Built for the Modern Craftsman.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-3">
              <a
                className="text-[#e9e1d6]/60 hover:text-[#e9c349] font-['Work_Sans'] text-[10px] uppercase tracking-widest transition-all"
                href="#"
                style={{}}
              >
                Instagram
              </a>
              <a
                className="text-[#e9e1d6]/60 hover:text-[#e9c349] font-['Work_Sans'] text-[10px] uppercase tracking-widest transition-all"
                href="#"
                style={{}}
              >
                Twitter
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <a
                className="text-[#e9e1d6]/60 hover:text-[#e9c349] font-['Work_Sans'] text-[10px] uppercase tracking-widest transition-all"
                href="#"
                style={{}}
              >
                Privacy
              </a>
              <a
                className="text-[#e9e1d6]/60 hover:text-[#e9c349] font-['Work_Sans'] text-[10px] uppercase tracking-widest transition-all"
                href="#"
                style={{}}
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
