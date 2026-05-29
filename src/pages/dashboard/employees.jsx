import { useEffect, useState } from "react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LoadingDialog from "@/components/ui/LoadingDialog";
import {
  formatPhone,
  getPhoneDigits,
} from "@/features/appointment/booking/phoneHelpers";
import pageAuthorization from "@/infra/pageAuthorization";

export async function getServerSideProps(context) {
  const result = await pageAuthorization.requireAdminPage(context);
  if (result.notFound) return { notFound: true };
  return { props: {} };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Converts "HH:mm" → "HHhMM" for Brazilian display (e.g. "08:00" → "08h00") */
function formatTime(time) {
  if (!time) return "";
  return time.replace(":", "h");
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function EditIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.04c.39-.39.39-1.02 0-1.41L18.2 3.29a.9959.9959 0 0 0-1.41 0l-1.96 1.96L18.58 9l2.13-1.79z" />
    </svg>
  );
}

// ─── BarberCard ──────────────────────────────────────────────────────────────

function BarberCard({ barber, onEdit, onDelete }) {
  const hasWorkHours = barber.work_start && barber.work_end;
  const hasLunchHours = barber.lunch_start && barber.lunch_end;
  const hasPhone = !!barber.phone_number;

  function handleEditClick(event) {
    event.stopPropagation();

    onEdit(barber);
  }

  function handleDeleteClick(event) {
    event.stopPropagation();

    onDelete(barber.barber_id);
  }

  return (
    <div className="bg-surface-container-high hover:bg-surface-container-highest transition-colors p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] group">
      <div className="grid grid-cols-[1fr_auto] gap-6">
        <div>
          {/* Name row with Razor's Edge accent */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-1 bg-primary shrink-0 self-stretch" />

            <div className="flex-1 min-w-0">
              <h4 className="font-headline text-xl font-bold text-on-surface leading-snug">
                {barber.barber_name}
              </h4>

              {hasPhone && (
                <p className="text-sm text-on-surface-variant mt-1">
                  {formatPhone(barber.phone_number)}
                </p>
              )}
            </div>
          </div>

          {/* Hours */}
          {(hasWorkHours || hasLunchHours) && (
            <div className="pl-4 space-y-1.5">
              {hasWorkHours && (
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="text-[10px] font-label uppercase tracking-widest text-primary w-20 shrink-0">
                    Expediente
                  </span>
                  <span>
                    {formatTime(barber.work_start)} –{" "}
                    {formatTime(barber.work_end)}
                  </span>
                </div>
              )}

              {hasLunchHours && (
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="text-[10px] font-label uppercase tracking-widest text-primary w-20 shrink-0">
                    Almoço
                  </span>
                  <span>
                    {formatTime(barber.lunch_start)} –{" "}
                    {formatTime(barber.lunch_end)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEditClick}
              aria-label={`Editar barbeiro ${barber.barber_name}`}
              title="Editar barbeiro"
              className="flex h-7 w-7 items-center justify-center bg-surface-container-lowest text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <EditIcon />
            </button>

            <button
              type="button"
              onClick={handleDeleteClick}
              aria-label={`Excluir barbeiro ${barber.barber_name}`}
              title="Excluir barbeiro"
              className="flex h-7 w-7 items-center justify-center bg-[#2a0f0f] text-[#ffb4ab] font-bold text-xs uppercase tracking-widest hover:bg-[#3a1515] hover:text-[#ffd6d1] active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffb4ab]/40"
            >
              ×
            </button>
          </div>

          <span
            className={`inline-block px-3 py-1 text-[10px] font-label uppercase tracking-widest ${
              barber.is_active
                ? "bg-primary/10 text-primary"
                : "bg-surface-container-lowest text-on-surface-variant"
            }`}
          >
            {barber.is_active ? "Ativo" : "Inativo"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── BarberCardSkeleton ───────────────────────────────────────────────────────

function BarberCardSkeleton() {
  return (
    <div className="bg-surface-container-high p-6 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-1 bg-primary/20 self-stretch shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-surface-container-highest w-2/5" />
          <div className="h-3 bg-surface-container-highest w-1/3" />
        </div>
      </div>
      <div className="pl-4 space-y-2">
        <div className="h-3 bg-surface-container-highest w-3/4" />
        <div className="h-3 bg-surface-container-highest w-1/2" />
      </div>
    </div>
  );
}

// ─── BarberForm ───────────────────────────────────────────────────────────────

const INITIAL_FORM = {
  barber_name: "",
  phone_number: "",
  work_start: "",
  work_end: "",
  lunch_start: "",
  lunch_end: "",
  username: "",
  email: "",
  password: "",
};

function validate(form) {
  const errors = {};

  if (!form.barber_name.trim()) {
    errors.barber_name = "O nome do barbeiro é obrigatório.";
  }

  if (!form.username.trim()) {
    errors.username = "O nome de usuário é obrigatório.";
  }

  if (!form.email.trim()) {
    errors.email = "O e-mail é obrigatório.";
  }

  if (!form.password) {
    errors.password = "A senha é obrigatória.";
  }

  // Paired time fields
  if (
    (form.work_start && !form.work_end) ||
    (!form.work_start && form.work_end)
  ) {
    errors.work_hours = "Preencha o início e o fim do expediente.";
  }

  if (
    (form.lunch_start && !form.lunch_end) ||
    (!form.lunch_start && form.lunch_end)
  ) {
    errors.lunch_hours = "Preencha o início e o fim do almoço.";
  }

  return errors;
}

function BarberForm({ onBarberCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const errors = validate(form);

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "phone_number") {
      setForm((prev) => ({ ...prev, phone_number: formatPhone(value) }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(e) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }

  // Touch the paired partner when one of a pair changes
  function handleTimeBlur(e) {
    const name = e.target.name;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
      work_hours: true,
      lunch_hours: true,
    }));
  }

  function touchAll() {
    const allTouched = {};
    Object.keys(INITIAL_FORM).forEach((k) => (allTouched[k] = true));
    allTouched.work_hours = true;
    allTouched.lunch_hours = true;
    setTouched(allTouched);
  }

  function showError(field) {
    return touched[field] && errors[field];
  }

  function fieldBorderClass(field) {
    return showError(field)
      ? "border-red-500/50 focus:border-red-400"
      : "border-outline-variant/30 focus:border-primary";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    touchAll();

    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setApiError(null);

    try {
      const body = {
        barber_name: form.barber_name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      const phoneDigits = getPhoneDigits(form.phone_number);
      if (phoneDigits) body.phone_number = phoneDigits;
      if (form.work_start) body.work_start = form.work_start;
      if (form.work_end) body.work_end = form.work_end;
      if (form.lunch_start) body.lunch_start = form.lunch_start;
      if (form.lunch_end) body.lunch_end = form.lunch_end;

      const res = await fetch("/api/v1/barbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erro ao cadastrar barbeiro.");
      }

      onBarberCreated(data.barber);
      setForm(INITIAL_FORM);
      setTouched({});
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const fieldBase =
    "w-full bg-surface-container-lowest border-none border-b-2 focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 py-3 px-2 transition-colors duration-300 font-body outline-none";

  function labelClass() {
    return "block text-xs font-label uppercase tracking-widest text-primary mb-2";
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* ── Section 1: Dados Profissionais ── */}
        <div>
          <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/60 mb-4">
            Dados Profissionais
          </p>

          <div className="space-y-5">
            {/* Nome */}
            <div>
              <label htmlFor="barber_name" className={labelClass()}>
                Nome do Barbeiro <span aria-hidden="true">*</span>
              </label>
              <input
                id="barber_name"
                name="barber_name"
                type="text"
                value={form.barber_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder='Ex: Julian "The Blade" Sterling'
                autoComplete="name"
                className={`${fieldBase} ${fieldBorderClass("barber_name")}`}
              />
              {showError("barber_name") && (
                <p className="mt-1.5 text-xs text-red-400">
                  {errors.barber_name}
                </p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="phone_number" className={labelClass()}>
                Telefone
                <span className="ml-2 normal-case text-on-surface-variant/50 tracking-normal font-normal">
                  (opcional)
                </span>
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                inputMode="numeric"
                maxLength={15}
                value={form.phone_number}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="(11) 99999-9999"
                autoComplete="tel"
                className={`${fieldBase} border-outline-variant/30 focus:border-primary`}
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: Horários ── */}
        <div>
          <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/60 mb-4">
            Horários de Trabalho
            <span className="ml-2 normal-case text-on-surface-variant/40 tracking-normal font-normal">
              (opcionais)
            </span>
          </p>

          <div className="space-y-4">
            {/* Expediente */}
            <div>
              <p className="text-xs font-label uppercase tracking-widest text-primary mb-2">
                Expediente
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="work_start" className="sr-only">
                    Início do expediente
                  </label>
                  <input
                    id="work_start"
                    name="work_start"
                    type="time"
                    value={form.work_start}
                    onChange={handleChange}
                    onBlur={handleTimeBlur}
                    className={`${fieldBase} border-outline-variant/30 focus:border-primary`}
                    aria-label="Início do expediente"
                  />
                </div>
                <div>
                  <label htmlFor="work_end" className="sr-only">
                    Fim do expediente
                  </label>
                  <input
                    id="work_end"
                    name="work_end"
                    type="time"
                    value={form.work_end}
                    onChange={handleChange}
                    onBlur={handleTimeBlur}
                    className={`${fieldBase} border-outline-variant/30 focus:border-primary`}
                    aria-label="Fim do expediente"
                  />
                </div>
              </div>
              {showError("work_hours") && (
                <p className="mt-1.5 text-xs text-red-400">
                  {errors.work_hours}
                </p>
              )}
            </div>

            {/* Almoço */}
            <div>
              <p className="text-xs font-label uppercase tracking-widest text-primary mb-2">
                Almoço
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="lunch_start" className="sr-only">
                    Início do almoço
                  </label>
                  <input
                    id="lunch_start"
                    name="lunch_start"
                    type="time"
                    value={form.lunch_start}
                    onChange={handleChange}
                    onBlur={handleTimeBlur}
                    className={`${fieldBase} border-outline-variant/30 focus:border-primary`}
                    aria-label="Início do almoço"
                  />
                </div>
                <div>
                  <label htmlFor="lunch_end" className="sr-only">
                    Fim do almoço
                  </label>
                  <input
                    id="lunch_end"
                    name="lunch_end"
                    type="time"
                    value={form.lunch_end}
                    onChange={handleChange}
                    onBlur={handleTimeBlur}
                    className={`${fieldBase} border-outline-variant/30 focus:border-primary`}
                    aria-label="Fim do almoço"
                  />
                </div>
              </div>
              {showError("lunch_hours") && (
                <p className="mt-1.5 text-xs text-red-400">
                  {errors.lunch_hours}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 3: Acesso ao Sistema ── */}
        <div>
          <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/60 mb-4">
            Acesso ao Sistema
          </p>

          <div className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className={labelClass()}>
                Nome de Usuário <span aria-hidden="true">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ex: elias_barber"
                autoComplete="username"
                className={`${fieldBase} ${fieldBorderClass("username")}`}
              />
              {showError("username") && (
                <p className="mt-1.5 text-xs text-red-400">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClass()}>
                E-mail <span aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="elias@maximusbarbers.com"
                autoComplete="email"
                className={`${fieldBase} ${fieldBorderClass("email")}`}
              />
              {showError("email") && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelClass()}>
                Senha <span aria-hidden="true">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`${fieldBase} ${fieldBorderClass("password")}`}
              />
              {showError("password") && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              )}
            </div>
          </div>
        </div>

        {/* API Error */}
        {apiError && (
          <div
            role="alert"
            className="bg-red-950/40 border-l-4 border-red-500/60 px-4 py-3"
          >
            <p className="text-xs text-red-300 leading-relaxed">{apiError}</p>
          </div>
        )}

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full lg:w-max px-12 py-4 bg-primary text-on-primary font-bold text-xs uppercase tracking-widest transition-all hover:translate-x-1 active:translate-x-0 relative group focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0"
          >
            Cadastrar Profissional
            <span className="absolute inset-0 border border-primary translate-x-2 translate-y-2 -z-10 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform opacity-30" />
          </button>
        </div>
      </form>

      <LoadingDialog
        isOpen={submitting}
        title="Cadastrando profissional"
        description="Estamos criando o perfil e o acesso ao sistema para o novo barbeiro."
      />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardEmployeesPage() {
  const [barbers, setBarbers] = useState([]);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedBarberToEdit, setSelectedBarberToEdit] = useState(null);

  // Delete flow state
  const [barberToDelete, setBarberToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    async function fetchBarbers() {
      setLoadingFetch(true);
      setFetchError(null);

      try {
        const res = await fetch("/api/v1/barbers");

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Erro ao carregar barbeiros.");
        }

        const data = await res.json();
        setBarbers(data);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoadingFetch(false);
      }
    }

    fetchBarbers();
  }, []);

  function handleBarberCreated(newBarber) {
    setBarbers((prev) => [...prev, newBarber]);
  }

  function handleBarberEdit(barber) {
    setSelectedBarberToEdit(barber);

    // TODO: Implement edit flow later.
    // Example future behavior:
    // - Open an edit modal
    // - Fill the form with barber data
    // - Submit PUT/PATCH request
    // - Update the local barbers list
  }

  function handleBarberDeleteRequest(barberId) {
    setDeleteError(null);
    setBarberToDelete(barberId);
  }

  function handleDeleteCancel() {
    setBarberToDelete(null);
  }

  async function handleDeleteConfirm() {
    const barberId = barberToDelete;
    setBarberToDelete(null);
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/v1/barbers/${barberId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao excluir barbeiro.");
      }

      setBarbers((prev) =>
        prev.filter((barber) => barber.barber_id !== barberId),
      );
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-12 px-8 pt-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 w-1 bg-primary" />
          <span className="text-xs font-label uppercase tracking-[0.2em] text-primary">
            Administração
          </span>
        </div>

        <h2 className="text-4xl lg:text-5xl font-headline font-bold text-on-surface">
          Gerenciamento de Funcionários
        </h2>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] mx-8 mb-12">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 bg-surface-container-low p-8 lg:p-12 flex flex-col">
          <div className="mb-8">
            <h3 className="text-2xl font-headline font-semibold text-on-surface mb-2">
              Adicionar Novo Barbeiro
            </h3>

            <p className="text-sm text-on-surface-variant font-light leading-relaxed">
              Expanda o legado. Cadastre um novo profissional e crie seu acesso
              ao sistema em uma única etapa.
            </p>

            {selectedBarberToEdit && (
              <div className="mt-6 bg-surface-container-lowest p-4">
                <p className="text-[10px] font-label uppercase tracking-widest text-primary mb-1">
                  Barbeiro selecionado para edição
                </p>

                <p className="text-sm text-on-surface-variant">
                  {selectedBarberToEdit.barber_name}
                </p>
              </div>
            )}
          </div>

          <BarberForm onBarberCreated={handleBarberCreated} />
        </div>

        {/* Right Column: Barbers List */}
        <div className="lg:col-span-7 bg-surface p-8 lg:p-12 flex flex-col">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-4 w-1 bg-primary shrink-0" />
            <h3 className="font-headline text-2xl font-bold text-on-surface">
              Barbeiros Cadastrados
            </h3>
            {!loadingFetch && !fetchError && (
              <span className="ml-auto text-[10px] font-label uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5">
                {barbers.length}{" "}
                {barbers.length === 1 ? "barbeiro" : "barbeiros"}
              </span>
            )}
          </div>

          {/* Loading skeleton */}
          {loadingFetch && (
            <div className="space-y-4">
              <BarberCardSkeleton />
              <BarberCardSkeleton />
              <BarberCardSkeleton />
            </div>
          )}

          {/* Fetch error */}
          {!loadingFetch && fetchError && (
            <div
              role="alert"
              className="bg-red-950/40 border-l-4 border-red-500/60 px-6 py-5"
            >
              <p className="text-xs font-label uppercase tracking-widest text-red-400 mb-1">
                Erro ao carregar
              </p>
              <p className="text-sm text-red-300 leading-relaxed">
                {fetchError}
              </p>
            </div>
          )}

          {/* Empty state */}
          {!loadingFetch && !fetchError && barbers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-surface-container-high flex items-center justify-center mb-6">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-on-surface-variant/30"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>

              <p className="text-on-surface font-headline text-xl font-bold mb-2">
                Nenhum barbeiro cadastrado
              </p>

              <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
                Use o formulário ao lado para cadastrar o primeiro profissional
                da equipe Maximus.
              </p>
            </div>
          )}

          {/* Barbers list */}
          {!loadingFetch && !fetchError && barbers.length > 0 && (
            <div className="space-y-4">
              {barbers.map((barber) => (
                <BarberCard
                  key={barber.barber_id}
                  barber={barber}
                  onEdit={handleBarberEdit}
                  onDelete={handleBarberDeleteRequest}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Delete error banner */}
      {deleteError && (
        <div
          role="alert"
          className="mx-8 mb-12 bg-red-950/40 border-l-4 border-red-500/60 px-6 py-5"
        >
          <p className="text-xs font-label uppercase tracking-widest text-red-400 mb-1">
            Erro ao excluir
          </p>

          <p className="text-sm text-red-300 leading-relaxed">{deleteError}</p>
        </div>
      )}

      <ConfirmDialog
        isOpen={barberToDelete !== null}
        title="Excluir barbeiro?"
        description="Este barbeiro será removido da lista de profissionais ativos. Agendamentos futuros vinculados a ele serão cancelados."
        confirmLabel="Sim, excluir barbeiro"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <LoadingDialog
        isOpen={deleting}
        title="Excluindo barbeiro"
        description="Estamos removendo o barbeiro e cancelando agendamentos futuros. Isso levará apenas um momento."
      />
    </>
  );
}

DashboardEmployeesPage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
