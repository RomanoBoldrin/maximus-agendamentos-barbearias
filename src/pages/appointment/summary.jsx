import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import MainLayout from "@/components/layout/MainLayout";

const DEFAULT_APPOINTMENT = {
  service: "Barba",
  barber: "Elias",
  date: "2026-05-25",
  time: "10:30 AM",
  duration: "30",
  price: "20",
  code: "MX-2026-0001",
};

function getQueryValue(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function formatAppointmentDate(dateValue) {
  if (!dateValue) return "Data não informada";

  const parsedDate = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function formatPrice(priceValue) {
  const price = Number(priceValue);

  if (Number.isNaN(price)) return "$0.00";

  return `$${price.toFixed(2)}`;
}

function convertTimeTo24Hour(timeValue) {
  if (!timeValue) return null;

  const [time, meridian] = timeValue.split(" ");
  const [hourValue, minuteValue] = time.split(":").map(Number);

  if (Number.isNaN(hourValue) || Number.isNaN(minuteValue)) return null;

  let hours = hourValue;

  if (meridian === "PM" && hours !== 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;

  return {
    hours,
    minutes: minuteValue,
  };
}

function createAppointmentDate(dateValue, timeValue) {
  const parsedTime = convertTimeTo24Hour(timeValue);

  if (!dateValue || !parsedTime) return null;

  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) return null;

  date.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);

  return date;
}

function formatCalendarDate(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0];
}

function DetailItem({ label, value, highlight = false }) {
  return (
    <div
      className={`p-5 ${
        highlight ? "bg-surface-container-highest" : "bg-surface-container-low"
      }`}
    >
      <dt className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-2">
        {label}
      </dt>
      <dd className="font-headline text-2xl text-on-surface">{value}</dd>
    </div>
  );
}

function StepItem({ number, title, description }) {
  return (
    <li className="bg-surface-container-low p-5">
      <div className="flex gap-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-primary text-on-primary font-bold text-xs">
          {number}
        </span>

        <div>
          <h3 className="font-headline text-xl text-on-surface mb-1">
            {title}
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </li>
  );
}

export default function SummaryPage() {
  const router = useRouter();

  const appointment = useMemo(() => {
    const service = getQueryValue(router.query.service);
    const barber = getQueryValue(router.query.barber);
    const date = getQueryValue(router.query.date);
    const time = getQueryValue(router.query.time);
    const duration = getQueryValue(router.query.duration);
    const price = getQueryValue(router.query.price);
    const code = getQueryValue(router.query.code);

    return {
      service: service || DEFAULT_APPOINTMENT.service,
      barber: barber || DEFAULT_APPOINTMENT.barber,
      date: date || DEFAULT_APPOINTMENT.date,
      time: time || DEFAULT_APPOINTMENT.time,
      duration: duration || DEFAULT_APPOINTMENT.duration,
      price: price || DEFAULT_APPOINTMENT.price,
      code: code || DEFAULT_APPOINTMENT.code,
    };
  }, [router.query]);

  const formattedDate = formatAppointmentDate(appointment.date);
  const formattedPrice = formatPrice(appointment.price);

  const appointmentStartDate = useMemo(() => {
    return createAppointmentDate(appointment.date, appointment.time);
  }, [appointment.date, appointment.time]);

  function handleDownloadCalendarFile() {
    if (!appointmentStartDate) return;

    const appointmentEndDate = new Date(appointmentStartDate);
    appointmentEndDate.setMinutes(
      appointmentEndDate.getMinutes() + Number(appointment.duration),
    );

    const eventLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Maximus//Appointment Summary//PT-BR",
      "BEGIN:VEVENT",
      `UID:${appointment.code}@maximus`,
      `DTSTAMP:${formatCalendarDate(new Date())}`,
      `DTSTART:${formatCalendarDate(appointmentStartDate)}`,
      `DTEND:${formatCalendarDate(appointmentEndDate)}`,
      `SUMMARY:Agendamento Maximus - ${appointment.service}`,
      `DESCRIPTION:Serviço: ${appointment.service}\\nBarbeiro: ${appointment.barber}\\nCódigo: ${appointment.code}`,
      "LOCATION:Maximus Barbearia",
      "END:VEVENT",
      "END:VCALENDAR",
    ];

    const calendarBlob = new Blob([eventLines.join("\r\n")], {
      type: "text/calendar;charset=utf-8",
    });

    const calendarUrl = URL.createObjectURL(calendarBlob);

    const downloadLink = document.createElement("a");
    downloadLink.href = calendarUrl;
    downloadLink.download = `agendamento-${appointment.code}.ics`;
    downloadLink.click();

    URL.revokeObjectURL(calendarUrl);
  }

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <section className="relative overflow-hidden bg-surface px-8 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,195,73,0.12),transparent_32%),linear-gradient(rgba(22,19,12,0.9),rgba(22,19,12,0.98))]" />

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-1 h-14 bg-primary" />

              <div>
                <p className="font-label text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
                  Agendamento confirmado
                </p>

                <h1 className="font-headline text-5xl md:text-7xl font-bold italic tracking-tight">
                  Seu horário está reservado.
                </h1>
              </div>
            </div>

            <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-2xl">
              A Maximus recebeu sua solicitação. Confira os detalhes do seu
              atendimento e salve o comprovante para consultar antes da visita.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <section className="bg-surface-container-high p-8 md:p-10 shadow-[0_20px_50px_rgba(17,14,8,0.4)]">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-10">
                <div>
                  <p className="font-label text-[10px] uppercase tracking-[0.25em] text-primary mb-3">
                    Código do agendamento
                  </p>

                  <p className="font-headline text-4xl md:text-5xl font-bold text-on-surface">
                    {appointment.code}
                  </p>
                </div>

                <div className="bg-primary text-on-primary px-5 py-3 font-bold text-[10px] uppercase tracking-[0.2em] self-start">
                  Confirmado
                </div>
              </div>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  label="Serviço"
                  value={appointment.service}
                  highlight
                />

                <DetailItem label="Barbeiro" value={appointment.barber} />

                <DetailItem label="Data" value={formattedDate} />

                <DetailItem
                  label="Horário"
                  value={appointment.time}
                  highlight
                />

                <DetailItem
                  label="Duração"
                  value={`${appointment.duration} min`}
                />

                <DetailItem label="Total" value={formattedPrice} highlight />
              </dl>
            </section>

            <section className="bg-surface-container-low p-8 md:p-10">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-1 h-12 bg-primary" />

                <h2 className="font-headline text-4xl font-bold italic">
                  Antes de chegar
                </h2>
              </div>

              <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StepItem
                  number="1"
                  title="Chegue cedo"
                  description="Recomendamos chegar com 10 minutos de antecedência para evitar atrasos."
                />

                <StepItem
                  number="2"
                  title="Cancelamento"
                  description="Cancelamentos devem ser feitos com pelo menos 24h de antecedência."
                />

                <StepItem
                  number="3"
                  title="Referências"
                  description="Se quiser um corte específico, leve imagens de referência para orientar o barbeiro."
                />
              </ul>
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <section className="bg-surface-container-high p-8">
                <p className="font-label text-[10px] uppercase tracking-[0.25em] text-primary mb-4">
                  Recibo digital
                </p>

                <div className="bg-surface-container-lowest p-6 mb-6">
                  <p className="font-headline text-3xl italic mb-2">
                    Maximus Barbearia
                  </p>

                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Atendimento premium para o artesão moderno. Precisão,
                    pontualidade e tradição em cada detalhe.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleDownloadCalendarFile}
                    className="w-full bg-primary text-on-primary py-4 font-bold uppercase tracking-[0.2em] text-xs shadow-[0_14px_30px_rgba(17,14,8,0.35)] hover:bg-[#f0ca55] hover:shadow-[3px_3px_0px_rgba(233,195,73,0.25)] active:translate-y-[1px] active:scale-[0.99] active:shadow-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:shadow-none"
                    disabled={!appointmentStartDate}
                  >
                    Adicionar ao calendário
                  </button>

                  <Link
                    href="/appointment/emperor-barbershop"
                    className="block w-full bg-surface-container-lowest text-on-surface py-4 text-center font-bold uppercase tracking-[0.2em] text-xs hover:bg-surface-container-highest transition-colors"
                  >
                    Reagendar
                  </Link>

                  <Link
                    href="/home"
                    className="block w-full text-primary py-4 text-center font-bold uppercase tracking-[0.2em] text-xs hover:underline underline-offset-4"
                  >
                    Voltar para Home
                  </Link>
                </div>
              </section>

              <section className="bg-surface-container-low p-8">
                <p className="font-label text-[10px] uppercase tracking-[0.25em] text-primary mb-4">
                  Local e contato
                </p>

                <div className="space-y-5">
                  <div>
                    <p className="font-headline text-2xl mb-1">Endereço</p>
                    <p className="text-sm text-on-surface-variant">
                      Rua da Barbearia, 120 — Centro
                    </p>
                  </div>

                  <div>
                    <p className="font-headline text-2xl mb-1">Contato</p>
                    <p className="text-sm text-on-surface-variant">
                      (00) 00000-0000
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

SummaryPage.getLayout = function getLayout(page) {
  return <MainLayout>{page}</MainLayout>;
};
