import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import MainLayout from "@/components/layout/MainLayout";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingDialog from "@/components/ui/LoadingDialog";

function formatAppointmentDate(dateValue) {
  if (!dateValue) return "Data não informada";

  const parsedDate = new Date(dateValue);
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

function formatAppointmentTime(dateValue) {
  if (!dateValue) return "Horário não informado";

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsedDate);
}

function calculateTotalPrice(services) {
  return services.reduce((total, service) => {
    return total + Number(service.service_price || 0);
  }, 0);
}

function formatPrice(priceValue) {
  const price = Number(priceValue);

  if (Number.isNaN(price)) return "$0.00";

  return `$${price.toFixed(2)}`;
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
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

export default function SummaryPage({ appointment }) {
  const router = useRouter();

  const [dialogType, setDialogType] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(null);

  const formattedDate = formatAppointmentDate(appointment.appointment_datetime);
  const formattedTime = formatAppointmentTime(appointment.appointment_datetime);
  const totalPrice = formatPrice(calculateTotalPrice(appointment.services));
  const serviceNames = appointment.services
    .map((service) => service.service_name)
    .join(", ");
  const clientPhone = appointment.client.client_phone || "Não informado";
  const appointmentCode = appointment.appointment_id;

  const isCancelDialogOpen = dialogType === "cancel";
  const isRescheduleDialogOpen = dialogType === "reschedule";
  const isLoading = Boolean(loadingMessage);

  function closeDialog() {
    setDialogType(null);
  }

  function handleCancelAppointment() {
    setDialogType("cancel");
  }

  async function handleConfirmCancelAppointment() {
    setDialogType(null);
    setLoadingMessage({
      title: "Cancelando agendamento",
      description:
        "Estamos processando o cancelamento do seu horário. Isso pode levar alguns instantes.",
    });

    try {
      // TODO: Replace this simulated delay with the real API call.
      // Example:
      // await fetch(`/api/v1/appointments/${appointment.appointment_id}`, {
      //   method: "DELETE",
      // });

      await wait(1200);

      router.push("/appointment/emperor-barbershop");
    } catch (error) {
      console.error(error);

      // TODO: Add user-facing error dialog/toast later.
      setLoadingMessage(null);
    }
  }

  function handleRescheduleAppointment() {
    setDialogType("reschedule");
  }

  async function handleConfirmRescheduleAppointment() {
    setDialogType(null);
    setLoadingMessage({
      title: "Preparando reagendamento",
      description:
        "Estamos preparando a tela de agendamento para que você crie um novo agendamento.",
    });

    try {
      // TODO: Replace this simulated delay with a real cancellation/update API call.
      // Example:
      // await fetch(`/api/v1/appointments/${appointment.appointment_id}/reschedule`, {
      //   method: "POST",
      // });

      await wait(900);

      router.push("/appointment/emperor-barbershop");
    } catch (error) {
      console.error(error);

      // TODO: Add user-facing error dialog/toast later.
      setLoadingMessage(null);
    }
  }

  return (
    <>
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
                    {appointment.client.client_name}, seu horário está
                    reservado.
                  </h1>
                </div>
              </div>

              <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-2xl">
                A Maximus recebeu sua solicitação. Confira os detalhes do seu
                atendimento.
              </p>

              <p className="font-label text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
                Precisa alterar alguma coisa? Cancele este agendamento a
                qualquer momento e faça outro em poucos segundos!
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
                      Resumo do agendamento
                    </p>

                    <h2 className="font-headline text-4xl md:text-5xl font-bold italic text-on-surface">
                      Atendimento confirmado
                    </h2>
                  </div>

                  <div className="bg-surface-container-lowest px-5 py-4 self-start">
                    <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-1">
                      Status
                    </p>

                    <p className="font-bold text-[10px] uppercase tracking-[0.2em] text-on-surface">
                      {appointment.status}
                    </p>
                  </div>
                </div>

                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem
                    label="Cliente"
                    value={appointment.client.client_name}
                    highlight
                  />

                  <DetailItem label="Serviço" value={serviceNames} />

                  <DetailItem
                    label="Barbeiro"
                    value={appointment.barber.barber_name}
                  />

                  <DetailItem label="Data" value={formattedDate} />

                  <DetailItem label="Horário" value={formattedTime} highlight />

                  <DetailItem
                    label="Duração"
                    value={`${appointment.total_duration} min`}
                  />

                  <DetailItem label="Total" value={totalPrice} highlight />

                  <DetailItem label="Telefone" value={clientPhone} highlight />
                </dl>

                <div className="mt-8 bg-surface-container-lowest p-5">
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-2">
                    Código do agendamento
                  </p>

                  <p className="font-body text-sm text-on-surface-variant break-all">
                    {appointmentCode}
                  </p>
                </div>
              </section>

              <section className="bg-surface-container-low p-8 md:p-10">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-1 h-12 bg-primary" />

                  <h2 className="font-headline text-4xl font-bold italic">
                    Serviços contratados
                  </h2>
                </div>

                <div className="space-y-4">
                  {appointment.services.map((service) => (
                    <div
                      key={service.service_id}
                      className="flex items-center justify-between gap-4 rounded bg-surface-container-high p-4"
                    >
                      <div>
                        <p className="font-headline text-lg">
                          {service.service_name}
                        </p>
                        <p className="text-sm text-on-surface-variant">
                          {service.service_duration} min
                        </p>
                      </div>

                      <p className="font-bold">
                        {formatPrice(service.service_price)}
                      </p>
                    </div>
                  ))}
                </div>
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
                      Emperor Barbearia
                    </p>

                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Precisão, pontualidade e tradição em cada detalhe.
                    </p>
                  </div>

                  <div className="bg-surface-container-lowest p-5 mb-6">
                    <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-2">
                      Telefone informado
                    </p>

                    <p className="font-headline text-2xl text-on-surface">
                      {clientPhone}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleCancelAppointment}
                      disabled={isLoading}
                      className="w-full bg-[#2a0f0f] text-[#ffb4ab] py-4 font-bold uppercase tracking-[0.2em] text-xs shadow-[0_14px_30px_rgba(17,14,8,0.35)] hover:bg-[#3a1515] active:translate-y-[1px] active:scale-[0.99] active:shadow-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Cancelar Agendamento
                    </button>

                    <button
                      type="button"
                      onClick={handleRescheduleAppointment}
                      disabled={isLoading}
                      className="block w-full bg-surface-container-lowest text-on-surface py-4 text-center font-bold uppercase tracking-[0.2em] text-xs hover:bg-surface-container-highest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Reagendar
                    </button>

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

      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        title="Cancelar agendamento?"
        description="Tem certeza que deseja cancelar?"
        confirmLabel="Sim"
        cancelLabel="Não, voltar"
        variant="danger"
        onConfirm={handleConfirmCancelAppointment}
        onCancel={closeDialog}
      />

      <ConfirmDialog
        isOpen={isRescheduleDialogOpen}
        title="Reagendar atendimento?"
        description="Tem certeza? Isso cancelará o agendamento atual e levará você de volta para escolher outro horário."
        confirmLabel="Sim"
        cancelLabel="Não, voltar"
        onConfirm={handleConfirmRescheduleAppointment}
        onCancel={closeDialog}
      />

      <LoadingDialog
        isOpen={isLoading}
        title={loadingMessage?.title}
        description={loadingMessage?.description}
      />
    </>
  );
}

export async function getServerSideProps(context) {
  const rawAppointmentId = context.params?.appointment_id;
  const appointmentId = Array.isArray(rawAppointmentId)
    ? rawAppointmentId[0]
    : rawAppointmentId;

  if (!appointmentId || typeof appointmentId !== "string") {
    return { notFound: true };
  }

  const protocol = context.req.headers["x-forwarded-proto"] || "http";
  const host = context.req.headers.host;

  const response = await fetch(
    `${protocol}://${host}/api/v1/appointments/${appointmentId}`,
  );

  if (response.status === 404 || response.status === 400) {
    return { notFound: true };
  }

  if (!response.ok) {
    throw new Error("Failed to fetch appointment details.");
  }

  const appointment = await response.json();

  return {
    props: {
      appointment,
    },
  };
}

SummaryPage.getLayout = function getLayout(page) {
  return <MainLayout>{page}</MainLayout>;
};
