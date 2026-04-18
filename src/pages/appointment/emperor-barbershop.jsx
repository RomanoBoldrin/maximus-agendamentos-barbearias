// src/pages/emperor-barbershop.jsx
import { useMemo, useState } from "react";
import Link from "next/link";

function TopNavbar() {
  return (
    <header className="bg-[#2d2a22] flex justify-between items-center w-full px-8 py-6 max-w-full sticky top-0 z-50">
      <Link href={"../home"}>
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
            href="/home"
          >
            Galeria
          </Link>
        </div>
      </nav>

      <Link href={"summary"}>
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
          {service.description}
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
        {" "}
        <img
          className="w-full h-full object-cover"
          src={barber.image}
          alt={barber.alt}
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

function getCalendarCells(currentMonthDate) {
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Convert JS Sunday=0 into Monday=0
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
  const startMinutes = parseTimeToMinutes(workStart);
  const endMinutes = parseTimeToMinutes(workEnd);

  const lunchStartMin = parseTimeToMinutes(lunchStart);
  const lunchEndMin = parseTimeToMinutes(lunchEnd);

  const slots = [];

  let current = roundUpToInterval(startMinutes, interval);

  while (current + duration <= endMinutes) {
    const appointmentEnd = current + duration;

    const overlapsLunch =
      current < lunchEndMin && appointmentEnd > lunchStartMin;

    if (!overlapsLunch) {
      slots.push(formatMinutesToTime(current));
    }

    current += interval;
  }

  return slots;
}

function areDatesSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function appointmentOverlapsSlot({
  appointmentStartMinutes,
  appointmentDurationMinutes,
  slotStartMinutes,
  slotDurationMinutes,
}) {
  const appointmentEnd = appointmentStartMinutes + appointmentDurationMinutes;
  const slotEnd = slotStartMinutes + slotDurationMinutes;

  return slotStartMinutes < appointmentEnd && slotEnd > appointmentStartMinutes;
}

export default function EmperorBarbershopPage() {
  const services = useMemo(() => {
    return [
      {
        id: "haircut",
        title: "Corte de Cabelo",
        description: "Corte preciso, lavagem e finalização",
        priceLabel: "$40",
        priceValue: 40,
        durationMinutes: 45,
        icon: (
          <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.64 7.64L12 10l2.36-2.36 1.41 1.41L13.41 11.4l2.36 2.36-1.41 1.41L12 12.81l-2.36 2.36-1.41-1.41 2.36-2.36-2.36-2.36 1.41-1.41z" />
          </svg>
        ),
      },
      {
        id: "beard",
        title: "Barba",
        description: "Toalha quente, desenho e hidratação",
        priceLabel: "$20",
        priceValue: 20,
        durationMinutes: 30,
        icon: (
          <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14c0 2.76 2.24 5 5 5s5-2.24 5-5v-2H7v2zm5-12C8.13 2 5 5.13 5 9v1h14V9c0-3.87-3.13-7-7-7z" />
          </svg>
        ),
      },
      {
        id: "full",
        title: "Cabelo e Barba",
        description: "A experiência completa",
        priceLabel: "$55",
        priceValue: 55,
        durationMinutes: 75,
        icon: (
          <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        ),
      },
    ];
  }, []);

  const barbers = useMemo(() => {
    return [
      {
        id: "julian",
        name: "Julian",
        role: "Barbeiro Master",
        image: "../julian_barber.jpg",
        alt: "Retrato de um barbeiro profissional em ambiente de barbearia.",
        workStart: "09:00 AM",
        workEnd: "06:00 PM",
        lunchStart: "12:00 PM",
        lunchEnd: "01:00 PM",
      },
      {
        id: "elias",
        name: "Elias",
        role: "Especialista em Grooming",
        image: "../elias_barber.jpg",
        alt: "Barbeiro trabalhando com precisão na barba de um cliente.",
        workStart: "10:00 AM",
        workEnd: "07:00 PM",
        lunchStart: "01:00 PM",
        lunchEnd: "02:00 PM",
      },
    ];
  }, []);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // Simulated existing appointments (pretend from DB)
  const simulatedAppointments = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);

    const tomorrow = new Date(base);
    tomorrow.setDate(base.getDate() + 1);

    const afterTomorrow = new Date(base);
    afterTomorrow.setDate(base.getDate() + 2);

    return [
      {
        id: "a1",
        barberId: "elias",
        date: tomorrow,
        startTime: "11:30 AM",
        durationMinutes: 30,
      },
      {
        id: "a2",
        barberId: "elias",
        date: tomorrow,
        startTime: "02:30 PM",
        durationMinutes: 45,
      },
      {
        id: "a3",
        barberId: "julian",
        date: tomorrow,
        startTime: "09:00 AM",
        durationMinutes: 75,
      },
      {
        id: "a4",
        barberId: "julian",
        date: afterTomorrow,
        startTime: "03:45 PM",
        durationMinutes: 45,
      },
    ];
  }, []);

  const [selectedService, setSelectedService] = useState(services[1]);
  const [selectedBarber, setSelectedBarber] = useState(barbers[1]);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTime, setSelectedTime] = useState(null);

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

  const bookedAppointmentsForDay = useMemo(() => {
    if (!selectedDate || !selectedBarber) return [];

    return simulatedAppointments.filter(
      (apt) =>
        apt.barberId === selectedBarber.id &&
        areDatesSameDay(apt.date, selectedDate),
    );
  }, [selectedDate, selectedBarber, simulatedAppointments]);

  const availableSlotsWithBlockedInfo = useMemo(() => {
    if (!selectedService) return [];

    return generatedSlots.map((slotTime) => {
      const slotStartMinutes = parseTimeToMinutes(slotTime);

      const isBooked = bookedAppointmentsForDay.some((apt) => {
        const aptStartMinutes = parseTimeToMinutes(apt.startTime);

        return appointmentOverlapsSlot({
          appointmentStartMinutes: aptStartMinutes,
          appointmentDurationMinutes: apt.durationMinutes,
          slotStartMinutes,
          slotDurationMinutes: selectedService.durationMinutes,
        });
      });

      return {
        time: slotTime,
        blocked: isBooked,
      };
    });
  }, [generatedSlots, bookedAppointmentsForDay, selectedService]);

  const total = selectedService?.priceValue ?? 0;

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

  function handleConfirm() {
    if (!selectedDate || !selectedTime) {
      alert("Selecione uma data e um horário válido antes de confirmar.");
      return;
    }

    const blocked = availableSlotsWithBlockedInfo.find(
      (slot) => slot.time === selectedTime,
    )?.blocked;

    if (blocked) {
      alert("Este horário já está reservado. Escolha outro horário.");
      return;
    }

    alert(
      `Agendamento confirmado!\n\nServiço: ${selectedService.title}\nDuração: ${
        selectedService.durationMinutes
      } min\nBarbeiro: ${
        selectedBarber.name
      }\nData: ${selectedDate.toLocaleDateString(
        "pt-BR",
      )}\nHorário: ${selectedTime}\nTotal: $${total}.00`,
    );
  }

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen overflow-x-hidden">
      <TopNavbar />

      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-24">
            {/* Step 1 */}
            <section>
              <StepTitle>Passo 1: Escolha seu Serviço</StepTitle>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={service.id === "full" ? "md:col-span-2" : ""}
                  >
                    <ServiceCard
                      service={service}
                      selected={selectedService?.id === service.id}
                      onSelect={(svc) => {
                        setSelectedService(svc);
                        setSelectedTime(null);
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Step 2 */}
            <section>
              <StepTitle>Passo 2: Selecione seu Barbeiro</StepTitle>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-10 max-w-5xl">
                {" "}
                {barbers.map((barber) => (
                  <BarberCard
                    key={barber.id}
                    barber={barber}
                    selected={selectedBarber?.id === barber.id}
                    onSelect={(b) => {
                      setSelectedBarber(b);
                      setSelectedTime(null);
                    }}
                  />
                ))}
              </div>
            </section>

            {/* Step 3 */}
            <section>
              <StepTitle>Passo 3: Escolha Data e Horário</StepTitle>

              <div className="bg-surface-container-high p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Calendar */}
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
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Times */}
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
                          if (!slot.blocked) setSelectedTime(time);
                        }}
                      />
                    ))}
                  </div>

                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-50">
                    Duração do serviço: {selectedService.durationMinutes} min
                  </p>

                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-50">
                    Horários bloqueados = já reservados
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              {/* Summary */}
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
                        {selectedService.title}
                      </p>
                    </div>
                    <p className="font-body text-on-surface">
                      ${selectedService.priceValue}.00
                    </p>
                  </div>

                  <div className="flex justify-between items-end border-b border-outline-variant pb-4">
                    <div>
                      <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-1">
                        BARBEIRO
                      </p>
                      <p className="font-headline text-2xl">
                        {selectedBarber.name}
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

                  <div className="pt-8">
                    <div className="flex justify-between items-center mb-8">
                      <span className="font-headline text-3xl italic">
                        Total
                      </span>
                      <span className="font-headline text-4xl text-primary font-bold">
                        ${total}.00
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirm}
                      className="w-full py-6 bg-gradient-to-r from-primary to-on-primary-container text-on-primary font-bold uppercase tracking-widest text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={!selectedDate || !selectedTime}
                    >
                      Confirmar Agendamento
                      <span className="text-xl">→</span>
                    </button>

                    <p className="text-center font-label text-[10px] text-on-surface-variant mt-6 uppercase tracking-widest opacity-50">
                      Cancelamento com 24h de antecedência
                    </p>
                  </div>
                </div>
              </section>

              {/* Aesthetic Card */}
              <div className="relative bg-surface-container-high h-64 overflow-hidden group">
                <img
                  className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBlJgE3Yrp1Cqx1VWOCuf3LbR1_p50k1vEOtuZEZHepZwOF41EYDyA6jr3dMwQzjFpS3DL6oaKltOvIMXju18DyjWoxS1h6crHDRLFr8zm0a54-JOyKSWJujLZumfYaz28luHuRqKCVrlG5t4DyVSNc8tCV_ueLP40G-B7lYz7M3wwaguUqF7rB5kbSk6xTbgtj2sqIlel-3xBzLQj1DzfUZr-xfg6TcAF4EuxGZ65Yz9aDayJCnsUb3fD4xfWybADB1D-JwLJzqw"
                  alt="Interior moderno e luxuoso de uma barbearia."
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
