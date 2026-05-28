import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import pageAuthorization from "@/infra/pageAuthorization";

export async function getServerSideProps(context) {
  const result = await pageAuthorization.requireAdminPage(context);
  if (result.notFound) return { notFound: true };
  return { props: {} };
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

function getAppointmentStatusLabel(status) {
  const labels = {
    AGENDADO: "Agendado",
    CONCLUIDO: "Concluído",
    CANCELADO: "Cancelado",
    FALTOU: "Faltou",
  };
  return labels[status] || status;
}

function isCancelledAppointment(status) {
  return status === "CANCELADO";
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

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
  const cancelled = isCancelledAppointment(status);

  const statusConfig = {
    AGENDADO: {
      text: getAppointmentStatusLabel("AGENDADO"),
      className: "text-on-surface-variant",
      dot: "bg-primary",
    },
    CONCLUIDO: {
      text: getAppointmentStatusLabel("CONCLUIDO"),
      className: "text-primary font-bold",
      dot: "bg-primary animate-pulse",
    },
    CANCELADO: {
      text: getAppointmentStatusLabel("CANCELADO"),
      className: "text-[#ffb4ab] font-bold",
      dot: "bg-[#ffb4ab]",
    },
    FALTOU: {
      text: getAppointmentStatusLabel("FALTOU"),
      className: "text-on-surface-variant opacity-60",
      dot: "bg-outline",
    },
  };

  const config = statusConfig[status] ?? statusConfig.AGENDADO;

  return (
    <div
      className={`grid grid-cols-[0.8fr_1.5fr_1.5fr_1.2fr_1.2fr] gap-4 px-8 py-6 items-center border-b border-outline-variant/10 transition-colors cursor-pointer ${
        cancelled
          ? "bg-surface-container-lowest hover:bg-surface-container-low/60"
          : "hover:bg-surface-container-high/50"
      }`}
    >
      {/* Time */}
      <div
        className={`font-headline text-xl font-bold ${cancelled ? "text-on-surface-variant" : "text-primary"}`}
      >
        {time}
      </div>

      {/* Client */}
      <div
        className={`font-medium text-sm ${cancelled ? "text-on-surface-variant" : "text-on-surface"}`}
      >
        {client}
      </div>

      {/* Service chip */}
      <div>
        <span
          className={`inline-block px-3 py-1 text-[10px] font-label uppercase tracking-widest border ${
            cancelled
              ? "bg-surface-container-low text-on-surface-variant/60 border-outline-variant/10"
              : "bg-secondary-container/30 text-secondary border-secondary/20"
          }`}
        >
          {service}
        </span>
      </div>

      {/* Barber */}
      <div
        className={`flex items-center gap-2 text-sm font-medium ${cancelled ? "text-on-surface-variant/60" : "text-on-surface-variant"}`}
      >
        <div className="w-6 h-6 bg-surface-bright flex items-center justify-center grayscale text-[10px] border border-outline-variant/20 font-label">
          {barberInitials}
        </div>
        {barberName}
      </div>

      {/* Status indicator */}
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
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchAppointments() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/v1/appointments");

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();

        if (mounted) {
          // Note: Categorize based on browser's local time. Edge cases exist around midnight vs UTC.
          const now = new Date();
          const todayStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );

          const upcomingOrToday = data.filter((appt) => {
            const dateObj = new Date(appt.appointment_datetime);
            return dateObj >= todayStart;
          });

          const limited = upcomingOrToday.slice(0, 4);

          const formatted = limited.map((appt) => {
            const dateObj = new Date(appt.appointment_datetime);
            const timeStr = new Intl.DateTimeFormat("pt-BR", {
              timeStyle: "short",
            }).format(dateObj);

            const servicesStr = appt.services
              .map((s) => s.service_name)
              .join(", ");

            const barberName = appt.barber.barber_name;
            const initials = barberName.substring(0, 2).toUpperCase();

            return {
              id: appt.appointment_id,
              time: timeStr,
              client: appt.client.client_name,
              service: servicesStr,
              barberInitials: initials,
              barberName: barberName,
              status: appt.status,
            };
          });

          setAppointments(formatted);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchAppointments();

    return () => {
      mounted = false;
    };
  }, []);

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
          value="02"
          footer={
            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant text-[10px] font-medium">
                / 2 TOTAL
              </span>

              <div className="flex -space-x-2 ml-auto">
                <Image
                  className="object-cover grayscale border border-surface-container-low"
                  src="/crossed_arms_barber.png"
                  alt="Barber with arms crossed"
                  width={32}
                  height={32}
                />

                <Image
                  className="object-cover grayscale border border-surface-container-low"
                  src="/old_barber.png"
                  alt="Elderly barber"
                  width={32}
                  height={32}
                />
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

          <Link
            href="/dashboard/appointments"
            className="text-xs font-label uppercase tracking-widest text-primary border-b border-primary/20 hover:border-primary pb-1 transition-all"
          >
            Ver Todos
          </Link>
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

          {loading ? (
            <div className="px-8 py-16 text-center">
              <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center">
                <div className="h-8 w-8 border-4 border-primary/20 border-t-primary animate-spin" />
              </div>
              <p className="text-on-surface-variant text-sm uppercase tracking-widest font-label">
                Carregando agendamentos...
              </p>
            </div>
          ) : error ? (
            <div className="px-8 py-16 text-center">
              <p className="text-red-500 text-sm font-bold uppercase tracking-widest font-label mb-2">
                Erro de Conexão
              </p>
              <p className="text-on-surface-variant text-sm">
                Não foi possível carregar os agendamentos no momento.
              </p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="px-8 py-16 text-center">
              <p className="text-on-surface-variant text-sm">
                Nenhum agendamento futuro encontrado.
              </p>
            </div>
          ) : (
            appointments.map((appt) => (
              <AppointmentRow
                key={appt.id}
                time={appt.time}
                client={appt.client}
                service={appt.service}
                barberInitials={appt.barberInitials}
                barberName={appt.barberName}
                status={appt.status}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

DashboardOverviewPage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
