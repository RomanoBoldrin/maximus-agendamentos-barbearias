import { useMemo, useState, useEffect } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import pageAuthorization from "@/infra/pageAuthorization";

export async function getServerSideProps(context) {
  const result = await pageAuthorization.requireAdminOrBarberPage(context);
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

function getAppointmentStatusBadgeClasses(status) {
  const map = {
    AGENDADO: "text-primary bg-primary/10",
    CONCLUIDO: "text-on-surface bg-surface-container-highest",
    CANCELADO: "text-[#ffb4ab] bg-[#2a0f0f]",
    FALTOU: "text-on-surface-variant bg-surface-container-highest",
  };
  return map[status] || "text-on-surface-variant bg-surface-container-highest";
}

function isCancelledAppointment(status) {
  return status === "CANCELADO";
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function FilterTab({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-label uppercase tracking-widest text-xs pb-4 transition-colors ${
        active
          ? "text-primary font-bold border-b-2 border-primary"
          : "text-on-surface-variant hover:text-on-surface"
      }`}
    >
      {label}
    </button>
  );
}

function AppointmentRow({
  date,
  time,
  barber,
  client,
  service,
  price,
  status,
}) {
  const cancelled = isCancelledAppointment(status);

  return (
    <div
      className={`grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_1fr_auto] gap-4 px-8 py-6 items-center border-b border-outline-variant/10 transition-colors cursor-pointer group ${
        cancelled
          ? "bg-surface-container-lowest hover:bg-surface-container-low/60"
          : "hover:bg-surface-container-high/50"
      }`}
    >
      {/* Date & Time */}
      <div className="flex flex-col">
        <span
          className={`font-medium ${cancelled ? "text-on-surface-variant" : "text-on-surface"}`}
        >
          {date}
        </span>
        <span
          className={`text-xs font-label mt-1 uppercase tracking-wider ${cancelled ? "text-on-surface-variant/60" : "text-primary"}`}
        >
          {time}
        </span>
      </div>

      {/* Barber */}
      <div
        className={`font-medium text-sm ${cancelled ? "text-on-surface-variant/60" : "text-on-surface-variant"}`}
      >
        {barber}
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

      {/* Status badge */}
      <div>
        <span
          className={`inline-block px-3 py-1 text-[10px] font-label uppercase tracking-widest ${getAppointmentStatusBadgeClasses(status)}`}
        >
          {getAppointmentStatusLabel(status)}
        </span>
      </div>

      {/* Price */}
      <div
        className={`text-right font-headline font-bold text-xl ${cancelled ? "text-on-surface-variant/70" : "text-on-surface"}`}
      >
        {price}
      </div>
    </div>
  );
}

export default function DashboardAppointmentsPage() {
  const [activeTab, setActiveTab] = useState("today");
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
          const formatted = data.map((appt) => {
            const dateObj = new Date(appt.appointment_datetime);

            const dateStr = new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "short",
            }).format(dateObj);
            const timeStr = new Intl.DateTimeFormat("pt-BR", {
              timeStyle: "short",
            }).format(dateObj);

            const totalPrice = appt.services.reduce(
              (acc, curr) => acc + parseFloat(curr.service_price),
              0,
            );
            const priceStr = new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(totalPrice);

            const servicesStr = appt.services
              .map((s) => s.service_name)
              .join(", ");

            // Note: Categorize based on browser's local time. Edge cases exist around midnight vs UTC.
            const now = new Date();
            const todayStart = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
            );
            const todayEnd = new Date(
              todayStart.getTime() + 24 * 60 * 60 * 1000,
            );

            let category = "today";
            if (dateObj < todayStart) {
              category = "past";
            } else if (dateObj >= todayEnd) {
              category = "upcoming";
            }

            return {
              id: appt.appointment_id,
              date: dateStr,
              time: timeStr,
              barber: appt.barber.barber_name,
              client: appt.client.client_name,
              service: servicesStr,
              price: priceStr,
              status: appt.status,
              category: category,
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

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => a.category === activeTab);
  }, [activeTab, appointments]);

  return (
    <>
      {/* Header */}
      <div className="mb-12 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-1 bg-primary" />
            <span className="text-xs font-label uppercase tracking-[0.2em] text-primary">
              Administração
            </span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-headline font-bold text-on-surface">
            Agendamentos
          </h2>
        </div>
        <Link href={"../appointment/emperor-barbershop"}>
          <button
            type="button"
            className="bg-primary text-on-primary px-8 py-4 font-label uppercase tracking-widest text-xs font-bold transition-all hover:translate-x-1 relative group focus:outline-none focus:ring-2 focus:ring-primary/30 w-full sm:w-auto"
          >
            Novo Agendamento
            <span className="absolute inset-0 border border-primary translate-x-2 translate-y-2 -z-10 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform opacity-30" />
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-8 mb-8 border-b border-outline-variant/20">
        <FilterTab
          label="Hoje"
          active={activeTab === "today"}
          onClick={() => setActiveTab("today")}
        />

        <FilterTab
          label="Próximos"
          active={activeTab === "upcoming"}
          onClick={() => setActiveTab("upcoming")}
        />

        <FilterTab
          label="Anteriores"
          active={activeTab === "past"}
          onClick={() => setActiveTab("past")}
        />
      </div>

      {/* Table */}
      <div className="bg-surface-container-low shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Table Head */}
        <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_1fr_auto] gap-4 px-8 py-5 bg-surface-container-highest/50 border-b border-outline-variant/20">
          <div className="text-xs font-label uppercase tracking-widest text-primary font-bold">
            Data &amp; Horário
          </div>
          <div className="text-xs font-label uppercase tracking-widest text-primary font-bold">
            Barbeiro
          </div>
          <div className="text-xs font-label uppercase tracking-widest text-primary font-bold">
            Cliente
          </div>
          <div className="text-xs font-label uppercase tracking-widest text-primary font-bold">
            Serviço
          </div>
          <div className="text-xs font-label uppercase tracking-widest text-primary font-bold">
            Status
          </div>
          <div className="text-xs font-label uppercase tracking-widest text-primary font-bold text-right">
            Preço
          </div>
        </div>

        {/* Table Rows */}
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
        ) : filteredAppointments.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <p className="text-on-surface-variant text-sm">
              Nenhum agendamento encontrado para este filtro.
            </p>
          </div>
        ) : (
          filteredAppointments.map((appt) => (
            <AppointmentRow
              key={appt.id}
              date={appt.date}
              time={appt.time}
              barber={appt.barber}
              client={appt.client}
              service={appt.service}
              price={appt.price}
              status={appt.status}
            />
          ))
        )}
      </div>
    </>
  );
}

DashboardAppointmentsPage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
