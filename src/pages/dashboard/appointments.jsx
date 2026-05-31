import { useMemo, useState, useEffect } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import pageAuthorization from "@/infra/pageAuthorization";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingDialog from "@/components/ui/LoadingDialog";

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

function normalizeSearchValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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
  showCancel,
  onCancel,
}) {
  const cancelled = isCancelledAppointment(status);

  return (
    <div
      className={`grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_1fr_auto_48px] gap-6 px-10 py-8 items-center border-b border-outline-variant/10 transition-colors cursor-pointer group ${
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

      {/* Actions */}
      <div className="flex items-center justify-center">
        {showCancel && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            title="Cancelar agendamento"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default function DashboardAppointmentsPage() {
  const [activeTab, setActiveTab] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cancelAppointmentId, setCancelAppointmentId] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(null);

  const isCancelDialogOpen = Boolean(cancelAppointmentId);
  const isActionLoading = Boolean(loadingMessage);

  function closeCancelDialog() {
    setCancelAppointmentId(null);
  }

  function handleCancelClick(id) {
    setCancelAppointmentId(id);
  }

  async function handleConfirmCancel() {
    const id = cancelAppointmentId;
    setCancelAppointmentId(null);
    setLoadingMessage({
      title: "Cancelando agendamento",
      description: "Estamos processando o cancelamento do agendamento.",
    });

    try {
      const response = await fetch(`/api/v1/appointments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao cancelar agendamento.");
      }

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === id ? { ...appt, status: "CANCELADO" } : appt,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessage(null);
    }
  }

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
    let result = appointments.filter((a) => a.category === activeTab);

    const term = normalizeSearchValue(searchTerm);
    if (term) {
      result = result.filter((appt) => {
        const matchClient = normalizeSearchValue(appt.client).includes(term);
        const matchService = normalizeSearchValue(appt.service).includes(term);
        const matchBarber = normalizeSearchValue(appt.barber).includes(term);
        return matchClient || matchService || matchBarber;
      });
    }

    return result;
  }, [activeTab, appointments, searchTerm]);

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
            className="bg-primary text-on-primary px-8 py-4 font-label uppercase tracking-widest text-xs font-bold transition-all hover:translate-x-1 relative group focus:outline-none focus:ring-2 focus:ring-primary/30 w-full sm:w-auto mr-4"
          >
            Novo Agendamento
            <span className="absolute inset-0 border border-primary translate-x-2 translate-y-2 -z-10 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform opacity-30" />
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 border-b border-outline-variant/20">
        <div className="flex gap-8">
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

        <div className="relative w-full sm:w-64 pb-2 sm:pb-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </span>
          <input
            className="bg-surface-container-lowest border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 text-[10px] font-label tracking-widest uppercase py-2 pl-10 pr-4 w-full transition-all"
            placeholder="PESQUISAR..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-low shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Table Head */}
        <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_1fr_auto_48px] gap-6 px-10 py-6 bg-surface-container-highest/50 border-b border-outline-variant/20">
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
          <div></div>
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
              {searchTerm.trim()
                ? "Nenhum agendamento encontrado para esta busca."
                : "Nenhum agendamento encontrado para este filtro."}
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
              showCancel={
                appt.category !== "past" &&
                appt.status !== "CANCELADO" &&
                appt.status !== "FALTOU"
              }
              onCancel={() => handleCancelClick(appt.id)}
            />
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        title="Cancelar agendamento?"
        description="Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita."
        confirmLabel="Sim, cancelar"
        cancelLabel="Não, voltar"
        variant="danger"
        onConfirm={handleConfirmCancel}
        onCancel={closeCancelDialog}
      />

      <LoadingDialog
        isOpen={isActionLoading}
        title={loadingMessage?.title}
        description={loadingMessage?.description}
      />
    </>
  );
}

DashboardAppointmentsPage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
