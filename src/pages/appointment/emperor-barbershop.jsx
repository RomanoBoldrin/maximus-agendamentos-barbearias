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

*/

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { showToast } from "nextjs-toast-notify";

import {
  formatMonthYear,
  formatSelectedDate,
  getCalendarCells,
  getFirstValidDateForMonth,
} from "@/features/appointment/booking/dateHelpers";
import {
  generateTimeSlots,
  buildAppointmentDateTime,
} from "@/features/appointment/booking/timeHelpers";
import {
  formatPhone,
  getPhoneDigits,
} from "@/features/appointment/booking/phoneHelpers";
import {
  mapServiceFromApi,
  mapBarberFromApi,
} from "@/features/appointment/booking/apiMappers";
import TopNavbar from "@/features/appointment/booking/components/TopNavbar";
import Footer from "@/features/appointment/booking/components/Footer";
import StepTitle from "@/features/appointment/booking/components/StepTitle";
import EmptyState from "@/features/appointment/booking/components/EmptyState";
import ServiceCard from "@/features/appointment/booking/components/ServiceCard";
import BarberCard from "@/features/appointment/booking/components/BarberCard";
import CalendarDayButton from "@/features/appointment/booking/components/CalendarDayButton";
import TimeSlotButton from "@/features/appointment/booking/components/TimeSlotButton";

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
