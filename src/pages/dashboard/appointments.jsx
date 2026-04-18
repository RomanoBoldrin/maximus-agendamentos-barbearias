import { useMemo, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";

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

function AppointmentRow({ date, time, barber, client, service, price }) {
  return (
    <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_auto] gap-4 px-8 py-6 items-center border-b border-outline-variant/10 hover:bg-surface-container-high/50 transition-colors cursor-pointer group">
      <div className="flex flex-col">
        <span className="text-on-surface font-medium">{date}</span>
        <span className="text-primary text-xs font-label mt-1 uppercase tracking-wider">
          {time}
        </span>
      </div>

      <div className="text-on-surface-variant font-medium text-sm">
        {barber}
      </div>

      <div className="text-on-surface font-medium text-sm">{client}</div>

      <div>
        <span className="inline-block px-3 py-1 bg-secondary-container/30 text-secondary text-[10px] font-label uppercase tracking-widest border border-secondary/20">
          {service}
        </span>
      </div>

      <div className="text-right text-on-surface font-headline font-bold text-xl">
        {price}
      </div>
    </div>
  );
}

export default function DashboardAppointmentsPage() {
  const [activeTab, setActiveTab] = useState("today");

  const appointments = useMemo(() => {
    // mock data (later this will come from your API)
    return [
      {
        date: "14 Nov, 2023",
        time: "09:00 AM",
        barber: "Elias Weaver",
        client: "Julian Thorne",
        service: "Corte Executivo",
        price: "$40.00",
        category: "today",
      },
      {
        date: "14 Nov, 2023",
        time: "10:30 AM",
        barber: "Silas Vance",
        client: "Marcus Sterling",
        service: "Barba Completa",
        price: "$20.00",
        category: "today",
      },
      {
        date: "14 Nov, 2023",
        time: "11:15 AM",
        barber: "Elias Weaver",
        client: "Arthur Pendelton",
        service: "Cabelo & Barba",
        price: "$55.00",
        category: "today",
      },
      {
        date: "14 Nov, 2023",
        time: "01:00 PM",
        barber: "Caleb Reed",
        client: "Dominic Cross",
        service: "Corte Clássico",
        price: "$45.00",
        category: "upcoming",
      },
      {
        date: "14 Nov, 2023",
        time: "02:30 PM",
        barber: "Silas Vance",
        client: "Victor Hayes",
        service: "Barba Toalha Quente",
        price: "$55.00",
        category: "upcoming",
      },
    ];
  }, []);

  const filteredAppointments = useMemo(() => {
    if (activeTab === "today") {
      return appointments.filter((a) => a.category === "today");
    }

    if (activeTab === "upcoming") {
      return appointments.filter((a) => a.category === "upcoming");
    }

    if (activeTab === "past") {
      return appointments.filter((a) => a.category === "past");
    }

    return appointments;
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
        <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_auto] gap-4 px-8 py-5 bg-surface-container-highest/50 border-b border-outline-variant/20">
          <div className="text-xs font-label uppercase tracking-widest text-primary font-bold">
            Data & Horário
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
          <div className="text-xs font-label uppercase tracking-widest text-primary font-bold text-right">
            Preço
          </div>
        </div>

        {/* Table Rows */}
        {filteredAppointments.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <p className="text-on-surface-variant text-sm">
              Nenhum agendamento encontrado para este filtro.
            </p>
          </div>
        ) : (
          filteredAppointments.map((appt, index) => (
            <AppointmentRow
              key={`${appt.client}-${appt.time}-${index}`}
              date={appt.date}
              time={appt.time}
              barber={appt.barber}
              client={appt.client}
              service={appt.service}
              price={appt.price}
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
