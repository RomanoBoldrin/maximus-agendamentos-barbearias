/*
========================================================
| src/pages/appointment/emperor-barbershop.jsx          |
| THIS PAGE NEEDS TO BE REFACTORED IN A FUTURE VERSION  |
| It mixes way too much responsabilities                |
======================================================== 

An ideal future refactor would be:

```
src/
  pages/
    appointment/
      emperor-barbershop.jsx

  components/
    appointment/
      AppointmentServiceStep.jsx
      AppointmentBarberStep.jsx
      AppointmentDateTimeStep.jsx
      AppointmentClientDataStep.jsx
      AppointmentSummaryCard.jsx
      ServiceCard.jsx
      BarberCard.jsx
      CalendarDayButton.jsx
      TimeSlotButton.jsx

  lib/
    appointments/
      calendar.js
      time-slots.js
      formatters.js
      mock-data.js
```

As of may 27, 2026, this is not a priority.
You, maintainer of the future (probably myself from the future),
shall refactor this. Good luck....

*/

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { showToast } from "nextjs-toast-notify";

function TopNavbar() {
  return (
    <header className="bg-[#2d2a22] flex justify-between items-center w-full px-8 py-6 max-w-full sticky top-0 z-50">
      <Link href="/home">
        <div className="font-serif text-3xl font-bold tracking-tighter text-[#e9c349]">
          MAXIMUS
        </div>
      </Link>

      <nav className="hidden md:flex gap-12">
        <div className="hidden md:flex items-center gap-8">
          <Link
            className="text-[#e9c349] border-b-2 border-[#e9c349] pb-1 font-['Newsreader'] uppercase tracking-widest text-xs"
            href="/home"
          >
            Home
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link
            className="text-[#e9c349] border-b-2 border-[#e9c349] pb-1 font-['Newsreader'] uppercase tracking-widest text-xs"
            href="/featureUnavailable"
          >
            Galeria
          </Link>
        </div>
      </nav>

      <Link href="/appointment/emperor-barbershop">
        <button
          type="button"
          className="bg-primary text-on-primary font-bold px-8 py-3 active:opacity-70 active:scale-95 transition-all"
        >
          AGENDAR
        </button>
      </Link>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#110e08] flex flex-col md:flex-row justify-between items-center w-full px-12 py-16 gap-8">
      <div className="font-serif text-[#e9c349] text-lg font-bold">MAXIMUS</div>

      <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#e9e1d6] opacity-50">
        © 2026 Maximus Barbershop. Built for the Modern Craftsman.
      </div>

      <nav className="flex gap-8">
        <a className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#e9e1d6] opacity-50 hover:text-[#e9c349] transition-opacity duration-200">
          PRIVACIDADE
        </a>
        <a className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#e9e1d6] opacity-50 hover:text-[#e9c349] transition-opacity duration-200">
          TERMOS
        </a>
        <a className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#e9e1d6] opacity-50 hover:text-[#e9c349] transition-opacity duration-200">
          CARREIRAS
        </a>
        <a className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#e9e1d6] opacity-50 hover:text-[#e9c349] transition-opacity duration-200">
          CONTATO
        </a>
      </nav>
    </footer>
  );
}

function StepTitle({ children }) {
  return (
    <div className="flex items-center gap-6 mb-10">
      <div className="w-1 h-12 bg-primary" />
      <h2 className="font-headline text-5xl font-bold italic tracking-tight">
        {children}
      </h2>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="bg-surface-container-high p-10 text-center border border-outline-variant/30">
      <span className="text-primary text-5xl mb-6 block">✦</span>

      <h3 className="font-headline text-4xl italic text-primary mb-4">
        {title}
      </h3>

      <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant opacity-70 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function ServiceCard({ service, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      className={`group p-8 flex flex-col justify-between h-64 cursor-pointer transition-all border-none text-left w-full ${
        selected
          ? "bg-primary text-on-primary hover:opacity-90"
          : "bg-surface-container-high hover:bg-surface-container-highest"
      }`}
    >
      <div className="flex justify-between items-start">
        <span
          className={`text-4xl ${
            selected ? "text-on-primary" : "text-primary"
          }`}
        >
          {service.icon}
        </span>

        <span
          className={`font-headline text-3xl ${
            selected ? "text-on-primary" : "text-primary"
          }`}
        >
          {service.priceLabel}
        </span>
      </div>

      <div>
        <h3
          className={`text-center font-headline text-4xl mb-2 ${
            selected ? "text-on-primary" : ""
          }`}
        >
          {service.title}
        </h3>

        <p
          className={`text-center font-light text-sm uppercase tracking-widest ${
            selected ? "text-on-primary" : "text-on-surface-variant"
          }`}
        >
          {service.description || "Serviço disponível para agendamento"}
        </p>
      </div>

      {selected && (
        <div className="relative bottom right-2 bg-on-primary text-primary px-2 py-1 text-[10px] font-bold">
          SELECIONADO
        </div>
      )}
    </button>
  );
}

function BarberCard({ barber, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(barber)}
      className={`bg-surface-container-high group cursor-pointer overflow-hidden text-left transition-all border-2 ${
        selected ? "border-primary" : "border-transparent"
      }`}
    >
      <div
        className={`relative w-full aspect-[3/4] overflow-hidden transition-all duration-700 ${
          selected
            ? "grayscale-0 scale-105"
            : "grayscale group-hover:grayscale-0 group-hover:scale-105"
        }`}
      >
        <Image
          className="object-cover"
          src={barber.image}
          alt={barber.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
      </div>

      <div
        className={`p-8 transition-colors flex justify-between items-center ${
          selected
            ? "bg-surface-container-highest"
            : "group-hover:bg-surface-container-highest"
        }`}
      >
        <div>
          <h4 className="font-headline text-3xl">{barber.name}</h4>
          <p className="font-label text-xs uppercase tracking-[0.2em] text-primary">
            {barber.role}
          </p>
        </div>

        {selected && (
          <span className="text-primary">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" />
            </svg>
          </span>
        )}
      </div>
    </button>
  );
}

function CalendarDayButton({ cell, active, onSelect }) {
  const isNotCurrentMonth = cell.monthOffset !== 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cellDate = new Date(cell.date);
  cellDate.setHours(0, 0, 0, 0);

  const isPast = cellDate < today;
  const isDisabled = isNotCurrentMonth || isPast;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onSelect(cell.date)}
      className={`py-2 font-bold transition-colors ${
        isDisabled
          ? "text-on-surface-variant opacity-20 cursor-not-allowed"
          : active
            ? "bg-primary text-on-primary"
            : "hover:bg-primary hover:text-on-primary cursor-pointer"
      }`}
    >
      {cell.day}
    </button>
  );
}

function TimeSlotButton({ time, active, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(time)}
      className={`py-4 font-label text-xs tracking-widest transition-all ${
        disabled
          ? "bg-surface-container-lowest opacity-30 cursor-not-allowed border-b border-outline-variant/30"
          : active
            ? "bg-primary text-on-primary"
            : "bg-surface-container-lowest border-b border-transparent hover:border-primary"
      }`}
    >
      {time}
    </button>
  );
}

function formatMonthYear(date) {
  const months = [
    "JANEIRO",
    "FEVEREIRO",
    "MARÇO",
    "ABRIL",
    "MAIO",
    "JUNHO",
    "JULHO",
    "AGOSTO",
    "SETEMBRO",
    "OUTUBRO",
    "NOVEMBRO",
    "DEZEMBRO",
  ];

  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatSelectedDate(date) {
  if (!date) return "Selecione uma data";

  const monthsShort = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  return `${monthsShort[date.getMonth()]} ${date.getDate()},`;
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits.length ? `(${digits}` : "";

  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function getPhoneDigits(value) {
  return value.replace(/\D/g, "");
}

function getCalendarCells(currentMonthDate) {
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7;

  const cells = [];

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const dateObj = new Date(year, month - 1, day);

    cells.push({
      day,
      date: dateObj,
      monthOffset: -1,
    });
  }

  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const dateObj = new Date(year, month, day);

    cells.push({
      day,
      date: dateObj,
      monthOffset: 0,
    });
  }

  while (cells.length % 7 !== 0) {
    const nextDay =
      cells.length - (firstWeekday + lastDayOfMonth.getDate()) + 1;
    const dateObj = new Date(year, month + 1, nextDay);

    cells.push({
      day: nextDay,
      date: dateObj,
      monthOffset: 1,
    });
  }

  return cells;
}

function getFirstValidDateForMonth(year, monthIndex) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, monthIndex, 1);
  firstDay.setHours(0, 0, 0, 0);

  const monthEnd = new Date(year, monthIndex + 1, 0);
  monthEnd.setHours(0, 0, 0, 0);

  if (monthEnd < today) return null;

  if (today.getFullYear() === year && today.getMonth() === monthIndex) {
    return today;
  }

  return firstDay;
}

function parseTimeToMinutes(timeString) {
  const [time, meridian] = timeString.split(" ");
  const [hh, mm] = time.split(":").map(Number);

  let hours = hh;

  if (meridian === "PM" && hours !== 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;

  return hours * 60 + mm;
}

function formatMinutesToTime(totalMinutes) {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const meridian = hours >= 12 ? "PM" : "AM";
  if (hours === 0) hours = 12;
  if (hours > 12) hours -= 12;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  return `${hh}:${mm} ${meridian}`;
}

function roundUpToInterval(minutes, interval) {
  return Math.ceil(minutes / interval) * interval;
}

function generateTimeSlots({
  workStart,
  workEnd,
  lunchStart,
  lunchEnd,
  duration,
  interval,
}) {
  if (!workStart || !workEnd || !duration) return [];

  const startMinutes = parseTimeToMinutes(workStart);
  const endMinutes = parseTimeToMinutes(workEnd);

  const hasLunchBreak = Boolean(lunchStart && lunchEnd);
  const lunchStartMin = hasLunchBreak ? parseTimeToMinutes(lunchStart) : null;
  const lunchEndMin = hasLunchBreak ? parseTimeToMinutes(lunchEnd) : null;

  const slots = [];

  let current = roundUpToInterval(startMinutes, interval);

  while (current + duration <= endMinutes) {
    const appointmentEnd = current + duration;

    const overlapsLunch =
      hasLunchBreak && current < lunchEndMin && appointmentEnd > lunchStartMin;

    if (!overlapsLunch) {
      slots.push(formatMinutesToTime(current));
    }

    current += interval;
  }

  return slots;
}

function formatApiTimeToMeridian(time) {
  if (!time) return null;

  const [hourString, minuteString] = time.split(":");
  let hour = Number(hourString);
  const meridian = hour >= 12 ? "PM" : "AM";

  if (hour === 0) hour = 12;
  if (hour > 12) hour -= 12;

  return `${String(hour).padStart(2, "0")}:${minuteString} ${meridian}`;
}

function buildAppointmentDateTime(selectedDate, selectedTime) {
  const appointmentDate = new Date(selectedDate);
  const minutes = parseTimeToMinutes(selectedTime);

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  appointmentDate.setHours(hours, mins, 0, 0);

  return appointmentDate.toISOString();
}

function getServiceIcon(serviceName = "") {
  const normalizedServiceName = serviceName.toLowerCase();

  if (normalizedServiceName.includes("barba")) {
    return (
      <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 14c0 2.76 2.24 5 5 5s5-2.24 5-5v-2H7v2zm5-12C8.13 2 5 5.13 5 9v1h14V9c0-3.87-3.13-7-7-7z" />
      </svg>
    );
  }

  if (normalizedServiceName.includes("cabelo")) {
    return (
      <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.64 7.64L12 10l2.36-2.36 1.41 1.41L13.41 11.4l2.36 2.36-1.41 1.41L12 12.81l-2.36 2.36-1.41-1.41 2.36-2.36-2.36-2.36 1.41-1.41z" />
      </svg>
    );
  }

  return (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

function mapServiceFromApi(service) {
  return {
    id: service.service_id,
    title: service.service_name,
    description: service.service_description,
    priceLabel: `R$ ${service.price}`,
    priceValue: Number(service.price),
    durationMinutes: service.duration,
    icon: getServiceIcon(service.service_name),
  };
}

function mapBarberFromApi(barber, index) {
  const fallbackImages = ["/julian_barber.jpg", "/elias_barber.jpg"];

  return {
    id: barber.barber_id,
    name: barber.barber_name,
    role: "Barbeiro",
    image: fallbackImages[index % fallbackImages.length],
    alt: `Retrato de ${barber.barber_name}.`,
    workStart: formatApiTimeToMeridian(barber.work_start || "08:00"),
    workEnd: formatApiTimeToMeridian(barber.work_end || "18:00"),
    lunchStart: formatApiTimeToMeridian(barber.lunch_start),
    lunchEnd: formatApiTimeToMeridian(barber.lunch_end),
  };
}

export default function EmperorBarbershopPage() {
  const router = useRouter();

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTime, setSelectedTime] = useState(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    if (router.query.toast !== "appointment-cancelled") return;

    showToast.success("Agendamento cancelado com sucesso", {
      duration: 4000,
      position: "top-right",
      transition: "bounceIn",
      progress: true,
      sound: false,
    });

    router.replace("/appointment/emperor-barbershop", undefined, {
      shallow: true,
    });
  }, [router]);

  useEffect(() => {
    let shouldIgnore = false;

    async function loadBookingData() {
      try {
        setIsLoadingData(true);
        setLoadError("");

        const [servicesResponse, barbersResponse] = await Promise.all([
          fetch("/api/v1/services"),
          fetch("/api/v1/barbers"),
        ]);

        const servicesBody = await servicesResponse.json();
        const barbersBody = await barbersResponse.json();

        if (!servicesResponse.ok || !barbersResponse.ok) {
          throw new Error(
            servicesBody?.message ||
              barbersBody?.message ||
              "Não foi possível carregar os dados de agendamento.",
          );
        }

        const mappedServices = servicesBody.map(mapServiceFromApi);
        const mappedBarbers = barbersBody.map(mapBarberFromApi);

        if (shouldIgnore) return;

        setServices(mappedServices);
        setBarbers(mappedBarbers);
        setSelectedService(mappedServices[0] || null);
        setSelectedBarber(mappedBarbers[0] || null);
      } catch (error) {
        if (shouldIgnore) return;

        setLoadError(
          error.message || "Não foi possível carregar os dados de agendamento.",
        );
      } finally {
        if (!shouldIgnore) {
          setIsLoadingData(false);
        }
      }
    }

    loadBookingData();

    return () => {
      shouldIgnore = true;
    };
  }, []);

  const calendarCells = useMemo(() => {
    return getCalendarCells(currentMonth);
  }, [currentMonth]);

  const generatedSlots = useMemo(() => {
    if (!selectedService || !selectedBarber) return [];

    return generateTimeSlots({
      workStart: selectedBarber.workStart,
      workEnd: selectedBarber.workEnd,
      lunchStart: selectedBarber.lunchStart,
      lunchEnd: selectedBarber.lunchEnd,
      duration: selectedService.durationMinutes,
      interval: 15,
    });
  }, [selectedBarber, selectedService]);

  const availableSlotsWithBlockedInfo = useMemo(() => {
    return generatedSlots.map((slotTime) => ({
      time: slotTime,
      blocked: false,
    }));
  }, [generatedSlots]);

  const total = selectedService?.priceValue ?? 0;
  const clientPhoneDigits = getPhoneDigits(clientPhone);
  const isClientPhoneValid = clientPhoneDigits.length === 11;
  const isClientNameValid = clientName.trim().length > 0;
  const hasServices = services.length > 0;
  const hasBarbers = barbers.length > 0;
  const canLoadBookingFlow = hasServices && hasBarbers;

  const canConfirmAppointment =
    Boolean(selectedService) &&
    Boolean(selectedBarber) &&
    Boolean(selectedDate) &&
    Boolean(selectedTime) &&
    isClientNameValid &&
    isClientPhoneValid &&
    !isSubmitting;

  function goPrevMonth() {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);

      const firstValid = getFirstValidDateForMonth(
        newMonth.getFullYear(),
        newMonth.getMonth(),
      );

      setSelectedDate(firstValid);
      setSelectedTime(null);

      return newMonth;
    });
  }

  function goNextMonth() {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);

      const firstValid = getFirstValidDateForMonth(
        newMonth.getFullYear(),
        newMonth.getMonth(),
      );

      setSelectedDate(firstValid);
      setSelectedTime(null);

      return newMonth;
    });
  }

  async function handleConfirm() {
    if (!canConfirmAppointment) {
      setSubmitError(
        "Preencha serviço, barbeiro, data, horário, nome e telefone antes de confirmar.",
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/v1/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barber_id: selectedBarber.id,
          appointment_datetime: buildAppointmentDateTime(
            selectedDate,
            selectedTime,
          ),
          service_ids: [selectedService.id],
          client_name: clientName.trim(),
          client_phone: clientPhoneDigits || null,
        }),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        setSubmitError(
          responseBody.message || "Não foi possível criar o agendamento.",
        );
        return;
      }

      await router.push(`/appointment/summary/${responseBody.appointment_id}`);
    } catch {
      setSubmitError(
        "Não foi possível criar o agendamento. Tente novamente em instantes.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen overflow-x-hidden">
      <TopNavbar />

      <main className="max-w-7xl mx-auto px-8 py-16">
        {isLoadingData && (
          <div className="bg-surface-container-high p-12 text-center">
            <span className="text-primary text-5xl mb-6 block">✦</span>

            <h1 className="font-headline text-5xl italic text-primary mb-4">
              Carregando agendamento
            </h1>

            <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant opacity-70">
              Estamos buscando serviços e barbeiros disponíveis.
            </p>
          </div>
        )}

        {!isLoadingData && loadError && (
          <div className="bg-surface-container-high p-12 text-center">
            <span className="text-primary text-5xl mb-6 block">!</span>

            <h1 className="font-headline text-5xl italic text-primary mb-4">
              Não foi possível carregar
            </h1>

            <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant opacity-70">
              {loadError}
            </p>
          </div>
        )}

        {!isLoadingData && !loadError && !canLoadBookingFlow && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {!hasServices && (
              <EmptyState
                title="Nenhum serviço disponível"
                description="A barbearia ainda não cadastrou serviços para agendamento."
              />
            )}

            {!hasBarbers && (
              <EmptyState
                title="Nenhum barbeiro disponível"
                description="A barbearia ainda não cadastrou barbeiros para agendamento."
              />
            )}
          </div>
        )}

        {!isLoadingData && !loadError && canLoadBookingFlow && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-24">
              <section>
                <StepTitle>Passo 1: Escolha seu Serviço</StepTitle>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div key={service.id}>
                      <ServiceCard
                        service={service}
                        selected={selectedService?.id === service.id}
                        onSelect={(svc) => {
                          setSelectedService(svc);
                          setSelectedTime(null);
                          setSubmitError("");
                        }}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <StepTitle>Passo 2: Selecione seu Barbeiro</StepTitle>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-10 max-w-5xl">
                  {barbers.map((barber) => (
                    <BarberCard
                      key={barber.id}
                      barber={barber}
                      selected={selectedBarber?.id === barber.id}
                      onSelect={(b) => {
                        setSelectedBarber(b);
                        setSelectedTime(null);
                        setSubmitError("");
                      }}
                    />
                  ))}
                </div>
              </section>

              <section>
                <StepTitle>Passo 3: Escolha Data e Horário</StepTitle>

                <div className="bg-surface-container-high p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <div className="flex justify-between items-center mb-8">
                      <h5 className="font-headline text-2xl italic">
                        {formatMonthYear(currentMonth)}
                      </h5>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={goPrevMonth}
                          className="cursor-pointer hover:text-primary"
                          aria-label="Mês anterior"
                        >
                          ◀
                        </button>

                        <button
                          type="button"
                          onClick={goNextMonth}
                          className="cursor-pointer hover:text-primary"
                          aria-label="Próximo mês"
                        >
                          ▶
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 text-center text-[10px] font-label text-primary mb-4 opacity-50">
                      <div>SEG</div>
                      <div>TER</div>
                      <div>QUA</div>
                      <div>QUI</div>
                      <div>SEX</div>
                      <div>SÁB</div>
                      <div>DOM</div>
                    </div>

                    <div className="grid grid-cols-7 text-center gap-y-4">
                      {calendarCells.map((cell, idx) => (
                        <CalendarDayButton
                          key={`${cell.monthOffset}-${cell.day}-${idx}`}
                          cell={cell}
                          active={
                            selectedDate &&
                            cell.date.toDateString() ===
                              selectedDate.toDateString()
                          }
                          onSelect={(date) => {
                            setSelectedDate(date);
                            setSelectedTime(null);
                            setSubmitError("");
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-headline text-2xl italic mb-6">
                      HORÁRIOS DISPONÍVEIS
                    </h5>

                    <div className="grid grid-cols-2 gap-3 h-64 overflow-y-auto pr-4 custom-scrollbar">
                      {availableSlotsWithBlockedInfo.length === 0 && (
                        <div className="col-span-2 text-on-surface-variant text-xs uppercase tracking-widest opacity-60">
                          Nenhum horário disponível
                        </div>
                      )}

                      {availableSlotsWithBlockedInfo.map((slot) => (
                        <TimeSlotButton
                          key={slot.time}
                          time={slot.time}
                          active={selectedTime === slot.time}
                          disabled={slot.blocked}
                          onClick={(time) => {
                            if (!slot.blocked) {
                              setSelectedTime(time);
                              setSubmitError("");
                            }
                          }}
                        />
                      ))}
                    </div>

                    {selectedService && (
                      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-50">
                        Duração do serviço: {selectedService.durationMinutes}{" "}
                        min
                      </p>
                    )}

                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-50">
                      A disponibilidade final será validada ao confirmar.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <StepTitle>Passo 4: Informe seus Dados</StepTitle>

                <div className="bg-surface-container-high p-8">
                  <div className="max-w-xl space-y-8">
                    <div>
                      <label
                        className="block font-label text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3"
                        htmlFor="clientName"
                      >
                        Nome do Cliente
                      </label>

                      <input
                        id="clientName"
                        name="clientName"
                        type="text"
                        value={clientName}
                        onChange={(event) => {
                          setClientName(event.target.value);
                          setSubmitError("");
                        }}
                        placeholder="Seu nome"
                        autoComplete="name"
                        className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 py-4 px-3 transition-colors duration-300 font-body outline-none"
                      />

                      {clientName.length > 0 && !isClientNameValid && (
                        <p className="mt-3 text-[10px] uppercase tracking-widest text-[#ffb4ab]">
                          Informe seu nome para continuar.
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className="block font-label text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3"
                        htmlFor="clientPhone"
                      >
                        Telefone do Cliente
                      </label>

                      <input
                        id="clientPhone"
                        name="clientPhone"
                        type="tel"
                        value={clientPhone}
                        onChange={(event) => {
                          setClientPhone(formatPhone(event.target.value));
                          setSubmitError("");
                        }}
                        placeholder="(00) 00000-0000"
                        autoComplete="tel"
                        className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 py-4 px-3 transition-colors duration-300 font-body outline-none"
                      />

                      <p className="mt-4 text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60">
                        Usaremos este número para identificar ou confirmar seu
                        agendamento.
                      </p>

                      {clientPhone.length > 0 && !isClientPhoneValid && (
                        <p className="mt-3 text-[10px] uppercase tracking-widest text-[#ffb4ab]">
                          Informe um telefone brasileiro válido com DDD.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-8">
                <section className="bg-surface-container-high p-10">
                  <div className="flex items-center gap-6 mb-12">
                    <div className="w-1 h-12 bg-primary" />
                    <h2 className="font-headline text-4xl font-bold italic tracking-tight">
                      Resumo
                    </h2>
                  </div>

                  <div className="space-y-8">
                    <div className="flex justify-between items-end border-b border-outline-variant pb-4">
                      <div>
                        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-1">
                          SERVIÇO
                        </p>
                        <p className="font-headline text-2xl">
                          {selectedService?.title ||
                            "Nenhum serviço selecionado"}
                        </p>
                      </div>

                      <p className="font-body text-on-surface">
                        {selectedService
                          ? `R$ ${selectedService.priceValue.toFixed(2)}`
                          : "R$ 0,00"}
                      </p>
                    </div>

                    <div className="flex justify-between items-end border-b border-outline-variant pb-4">
                      <div>
                        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-1">
                          BARBEIRO
                        </p>
                        <p className="font-headline text-2xl">
                          {selectedBarber?.name ||
                            "Nenhum barbeiro selecionado"}
                        </p>
                      </div>

                      <span className="text-primary">
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 1l3 7 8 .7-6 5.1 2 7.7-7-4.3-7 4.3 2-7.7-6-5.1L9 8z" />
                        </svg>
                      </span>
                    </div>

                    <div className="flex justify-between items-end border-b border-outline-variant pb-4">
                      <div>
                        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-1">
                          AGENDAMENTO
                        </p>

                        <p className="font-headline text-2xl">
                          {selectedDate && selectedTime
                            ? `${formatSelectedDate(selectedDate)} ${selectedTime}`
                            : "Selecione data e horário"}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-b border-outline-variant pb-4">
                      <div>
                        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-1">
                          CLIENTE
                        </p>

                        <p className="font-headline text-2xl">
                          {clientName || "Informe seu nome"}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-b border-outline-variant pb-4">
                      <div>
                        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-1">
                          TELEFONE
                        </p>

                        <p className="font-headline text-2xl">
                          {clientPhone || "Informe seu telefone"}
                        </p>
                      </div>
                    </div>

                    {submitError && (
                      <div className="bg-[#ffb4ab]/10 border border-[#ffb4ab]/40 p-4">
                        <p className="text-[#ffb4ab] text-[10px] uppercase tracking-widest">
                          {submitError}
                        </p>
                      </div>
                    )}

                    <div className="pt-8">
                      <div className="flex justify-between items-center mb-8">
                        <span className="font-headline text-3xl italic">
                          Total
                        </span>
                        <span className="font-headline text-4xl text-primary font-bold">
                          R$ {total.toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleConfirm}
                        className="w-full py-6 bg-primary text-on-primary font-bold uppercase tracking-widest text-sm shadow-[0_14px_30px_rgba(17,14,8,0.35)] hover:bg-[#f0ca55] hover:shadow-[4px_4px_0px_rgba(233,195,73,0.25)] active:translate-y-[1px] active:scale-[0.99] active:shadow-none transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:shadow-none"
                        disabled={!canConfirmAppointment}
                      >
                        {isSubmitting
                          ? "Confirmando..."
                          : "Confirmar Agendamento"}
                        <span className="text-xl">→</span>
                      </button>

                      <p className="text-center font-label text-[10px] text-on-surface-variant mt-6 uppercase tracking-widest opacity-50">
                        Cancelamento com 24h de antecedência
                      </p>
                    </div>
                  </div>
                </section>

                <div className="relative bg-surface-container-high h-64 overflow-hidden group">
                  <Image
                    className="object-cover opacity-40 group-hover:scale-110 transition-transform duration-700"
                    src="/barbershop-interior.png"
                    alt="Interior moderno e luxuoso de uma barbearia."
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />

                  <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center">
                    <span className="text-primary text-5xl mb-4">✦</span>

                    <h6 className="font-headline text-2xl italic mb-2">
                      O Padrão Maximus
                    </h6>

                    <p className="text-xs uppercase tracking-widest opacity-70">
                      Onde a precisão moderna encontra a tradição
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #110e08;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e9c349;
        }
      `}</style>
    </div>
  );
}
