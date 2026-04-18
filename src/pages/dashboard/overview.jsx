import DashboardLayout from "@/components/layout/DashboardLayout";

function StatCard({ label, value, subtitle, progressPercent, footer }) {
  return (
    <div className="bg-surface-container-low p-8 relative group hover:bg-surface-container-high transition-all shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      <div className="flex flex-col gap-6">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">
          {label}
        </span>

        <div className="flex items-baseline gap-2">
          <span className="font-headline text-5xl font-bold text-on-surface">
            {value}
          </span>

          {subtitle && (
            <span className="text-primary text-[10px] font-bold bg-primary/10 px-2 py-0.5">
              {subtitle}
            </span>
          )}
        </div>

        {progressPercent !== undefined && (
          <div className="w-full h-1 bg-surface-container-highest relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {footer && <div>{footer}</div>}
      </div>
    </div>
  );
}

function AppointmentRow({
  time,
  client,
  service,
  barberInitials,
  barberName,
  status,
}) {
  const statusConfig = {
    confirmado: {
      text: "Confirmado",
      className: "text-on-surface-variant",
      dot: "bg-primary",
    },
    progresso: {
      text: "Em Progresso",
      className: "text-primary font-bold",
      dot: "bg-primary animate-pulse",
    },
    pendente: {
      text: "Pendente",
      className: "text-on-surface-variant opacity-50",
      dot: "bg-outline",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="grid grid-cols-[0.8fr_1.5fr_1.5fr_1.2fr_1.2fr] gap-4 px-8 py-6 items-center border-b border-outline-variant/10 hover:bg-surface-container-high/50 transition-colors cursor-pointer">
      <div className="font-headline text-xl font-bold text-primary">{time}</div>

      <div className="text-on-surface font-medium text-sm">{client}</div>

      <div>
        <span className="inline-block px-3 py-1 bg-secondary-container/30 text-secondary text-[10px] font-label uppercase tracking-widest border border-secondary/20">
          {service}
        </span>
      </div>

      <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
        <div className="w-6 h-6 bg-surface-bright flex items-center justify-center grayscale text-[10px] border border-outline-variant/20 font-label">
          {barberInitials}
        </div>
        {barberName}
      </div>

      <div className="text-right">
        <span
          className={`inline-flex items-center gap-2 text-[10px] font-label uppercase tracking-widest ${config.className}`}
        >
          <span className={`w-1.5 h-1.5 ${config.dot}`} />
          {config.text}
        </span>
      </div>
    </div>
  );
}

export default function DashboardOverviewPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-12 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-1 bg-primary" />
            <span className="text-xs font-label uppercase tracking-[0.2em] text-primary">
              Status do Dia
            </span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-headline font-bold text-on-surface">
            Visão Geral
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-full lg:w-auto">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </span>

            <input
              className="bg-surface-container-low border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 text-[10px] font-label tracking-widest uppercase py-3 pl-10 pr-4 w-full lg:w-64 transition-all"
              placeholder="PESQUISAR REGISTRO..."
              type="text"
            />
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <StatCard
          label="Receita Total Hoje"
          value="$1,482"
          subtitle="+12%"
          progressPercent={75}
        />

        <StatCard
          label="Agendamentos Pendentes"
          value="14"
          footer={
            <div className="flex gap-2">
              <span className="w-2 h-2 bg-primary" />
              <span className="w-2 h-2 bg-primary" />
              <span className="w-2 h-2 bg-primary" />
              <span className="w-2 h-2 bg-outline-variant/30" />
              <span className="w-2 h-2 bg-outline-variant/30" />
            </div>
          }
        />

        <StatCard
          label="Barbeiros Ativos"
          value="08"
          footer={
            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant text-[10px] font-medium">
                / 12 TOTAL
              </span>

              <div className="flex -space-x-2 ml-auto">
                <img
                  className="w-8 h-8 object-cover grayscale border border-surface-container-low"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIPa4TGSIhGG4YL4EAprDF625ApVZVJwu4WZW67jqHzb71x5AJCcGOVqAH9lG1UI832qfRdca_lYaE3DwFu2ziIMaorFOs1rNQiLz48xEWtS2jLi2qmyiEvz-yrirpywiPCb8JlKmsiuXHQReqBEGZXCdwdRQkBiSS9Rb3cQGOh3fa02AvkSbPNkiWFbOy-bGSXZcKjUqytRkK6gxUPjkNCEjsaPa-u1TFcfGW-nfy50C6vUJLXCazPa3--F26T6wLp5fyuiY-uP8"
                  alt="Barbeiro 1"
                />
                <img
                  className="w-8 h-8 object-cover grayscale border border-surface-container-low"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7m3TqNYzVEyqy27F0iFXW7J2SgiXXgE2a5Y5ghLY2tVkg5P-WNOyrMzjMlyEU0dcVzDXZovek1Y2YL3Ccw1u1CFE6FD-st42iFxSt9HM93qun4Lp33NUqjgsO7DfioFfQaeSXSEv1mLDbt3xp1KiMdk3JoZID4DcNPp6K0J3Zy6ADoB4Q5QyOuYKnLt0s7q3WKeuscaa86m_TrnmWht-g9CPUAmZFiAxjMLpI60iegX6PE7m2N7sONrxaijL__CIz2_uOfA3S7Fw"
                  alt="Barbeiro 2"
                />
                <img
                  className="w-8 h-8 object-cover grayscale border border-surface-container-low"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBm6wVwsRclXcJOLxLNT4MCNDu9fdzCLRclCEM4m0X6gQwEHa60kOqSYNXBsM-E04-5uLH6_iFGOwtkj4Dxv86iHaAtVawJp4Pnf8pFj6cubPQyelWQl7d2xfYVSM9GTV-8Y8_5tmAlm0KU_WQNlJ1RiUeTFBl8y_mzohMbw1TxBoi3NrNQu5rSmhtUoJZ-gNYqZT7dNaslYs9wYpxMz-fBpku9cjiCetIc-X9JpViu4yqnkITlkVQP4PhIVAvPcsxuLGrIC51abW8"
                  alt="Barbeiro 3"
                />
                <div className="w-8 h-8 bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold font-label tracking-tighter">
                  +5
                </div>
              </div>
            </div>
          }
        />
      </section>

      {/* Table Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 bg-primary" />
            <h3 className="font-headline text-2xl font-bold text-on-surface">
              Próximos Agendamentos
            </h3>
          </div>

          <a
            href="/dashboard/appointments"
            className="text-xs font-label uppercase tracking-widest text-primary border-b border-primary/20 hover:border-primary pb-1 transition-all"
          >
            Ver Todos
          </a>
        </div>

        <div className="bg-surface-container-low shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="grid grid-cols-[0.8fr_1.5fr_1.5fr_1.2fr_1.2fr] gap-4 px-8 py-5 bg-surface-container-highest/50 border-b border-outline-variant/20">
            <div className="text-xs font-label uppercase tracking-widest text-primary font-bold">
              Horário
            </div>
            <div className="text-xs font-label uppercase tracking-widest text-primary font-bold">
              Cliente
            </div>
            <div className="text-xs font-label uppercase tracking-widest text-primary font-bold">
              Serviço
            </div>
            <div className="text-xs font-label uppercase tracking-widest text-primary font-bold">
              Barbeiro
            </div>
            <div className="text-xs font-label uppercase tracking-widest text-primary font-bold text-right">
              Status
            </div>
          </div>

          <AppointmentRow
            time="14:30"
            client="Julian Rivers"
            service="Classic Cut"
            barberInitials="MB"
            barberName="Marcus B."
            status="confirmado"
          />

          <AppointmentRow
            time="15:00"
            client="Ethan Hawke"
            service="Beard Groom"
            barberInitials="DS"
            barberName="David S."
            status="confirmado"
          />

          <AppointmentRow
            time="15:45"
            client="Lukas Thorne"
            service="Full Service"
            barberInitials="MB"
            barberName="Marcus B."
            status="progresso"
          />

          <AppointmentRow
            time="16:15"
            client="Silas Vane"
            service="Hot Towel Shave"
            barberInitials="TR"
            barberName="Tony R."
            status="pendente"
          />
        </div>
      </div>
    </>
  );
}

DashboardOverviewPage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
