import { useEffect, useState } from "react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LoadingDialog from "@/components/ui/LoadingDialog";
import pageAuthorization from "@/infra/pageAuthorization";

export async function getServerSideProps(context) {
  const result = await pageAuthorization.requireAdminPage(context);
  if (result.notFound) return { notFound: true };
  return { props: {} };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizePrice(raw) {
  // Accept "50,00" or "50.00" or "50" → always return "50.00"
  return raw.replace(",", ".");
}

function formatDisplayPrice(price) {
  return `R$ ${Number(price).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

// ─── ServiceCard ─────────────────────────────────────────────────────────────

function ServiceCard({ service, onEdit, onDelete }) {
  function handleEditClick(event) {
    event.stopPropagation();

    onEdit(service);
  }

  function handleDeleteClick(event) {
    event.stopPropagation();

    onDelete(service.service_id);
  }

  return (
    <div className="relative bg-surface-container-high hover:bg-surface-container-highest transition-colors p-6 pr-24 shadow-[0_10px_40px_rgba(0,0,0,0.35)] group">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleEditClick}
          aria-label={`Editar serviço ${service.service_name}`}
          title="Editar serviço"
          className="flex h-7 w-7 items-center justify-center bg-surface-container-lowest text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <EditIcon />
        </button>

        <button
          type="button"
          onClick={handleDeleteClick}
          aria-label={`Excluir serviço ${service.service_name}`}
          title="Excluir serviço"
          className="flex h-7 w-7 items-center justify-center bg-[#2a0f0f] text-[#ffb4ab] font-bold text-xs uppercase tracking-widest hover:bg-[#3a1515] hover:text-[#ffd6d1] active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffb4ab]/40"
        >
          ×
        </button>
      </div>

      {/* Name row with Razor's Edge accent */}
      <div className="flex items-start gap-3 mb-3">
        <div className="h-full w-1 bg-primary shrink-0 mt-1 self-stretch" />

        <div className="flex-1 min-w-0">
          <h4 className="font-headline text-xl font-bold text-on-surface leading-snug">
            {service.service_name}
          </h4>

          {service.service_description && (
            <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
              {service.service_description}
            </p>
          )}
        </div>
      </div>

      {/* Meta row: duration chip + price */}
      <div className="flex items-center gap-4 pl-4 mt-4">
        <span className="inline-block px-3 py-1 bg-surface-container-lowest text-on-surface-variant text-[10px] font-label uppercase tracking-widest border border-outline-variant/20">
          ⏱ {service.duration} min
        </span>

        <span className="ml-auto font-headline text-2xl font-bold text-primary">
          {formatDisplayPrice(service.price)}
        </span>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ServiceCardSkeleton() {
  return (
    <div className="bg-surface-container-high p-6 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-1 bg-primary/20 self-stretch shrink-0 mt-1" />

        <div className="flex-1 space-y-2">
          <div className="h-5 bg-surface-container-highest w-2/3" />
          <div className="h-3 bg-surface-container-highest w-full" />
          <div className="h-3 bg-surface-container-highest w-4/5" />
        </div>
      </div>

      <div className="flex items-center gap-4 pl-4 mt-4">
        <div className="h-6 w-20 bg-surface-container-highest" />
        <div className="ml-auto h-7 w-24 bg-surface-container-highest" />
      </div>
    </div>
  );
}

// ─── ServiceForm ──────────────────────────────────────────────────────────────

const INITIAL_FORM = {
  name: "",
  description: "",
  duration: "",
  price: "",
};

const INITIAL_TOUCHED = {
  name: false,
  duration: false,
  price: false,
};

function validate(formData) {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = "O nome do serviço é obrigatório.";
  }

  const dur = Number(formData.duration);
  if (formData.duration === "" || !Number.isInteger(dur) || dur <= 0) {
    errors.duration = "A duração deve ser um número inteiro positivo.";
  }

  const price = Number(normalizePrice(formData.price));
  if (formData.price === "" || isNaN(price) || price <= 0) {
    errors.price = "O preço deve ser um número positivo (ex: 50,00).";
  }

  return errors;
}

function ServiceForm({
  serviceToEdit,
  onServiceCreated,
  onServiceUpdated,
  onCancelEdit,
}) {
  const [formData, setFormData] = useState(() => {
    if (serviceToEdit) {
      return {
        name: serviceToEdit.service_name,
        description: serviceToEdit.service_description || "",
        duration: String(serviceToEdit.duration),
        price: String(serviceToEdit.price),
      };
    }
    return INITIAL_FORM;
  });
  const [touched, setTouched] = useState(INITIAL_TOUCHED);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const errors = validate(formData);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    if (name in touched) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Mark all fields as touched so errors show
    setTouched({ name: true, duration: true, price: true });

    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setApiError(null);

    try {
      const isEditMode = !!serviceToEdit;
      const url = isEditMode
        ? `/api/v1/services/${serviceToEdit.service_id}`
        : "/api/v1/services";

      const res = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_name: formData.name.trim(),
          service_description: formData.description.trim() || undefined,
          duration: Number(formData.duration),
          price: normalizePrice(formData.price),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            `Erro ao ${isEditMode ? "atualizar" : "cadastrar"} serviço.`,
        );
      }

      if (isEditMode) {
        onServiceUpdated(data);
      } else {
        onServiceCreated(data);
        setFormData(INITIAL_FORM);
        setTouched(INITIAL_TOUCHED);
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const fieldBaseClass =
    "w-full bg-surface-container-lowest border-none border-b-2 focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 py-3 px-2 transition-colors duration-300 font-body outline-none";

  function fieldBorderClass(fieldName) {
    if (touched[fieldName] && errors[fieldName]) {
      return "border-red-500/50 focus:border-red-400";
    }

    return "border-outline-variant/30 focus:border-primary";
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Service Name */}
        <div>
          <label
            htmlFor="service-name"
            className="block text-xs font-label uppercase tracking-widest text-primary mb-2"
          >
            Nome do Serviço <span aria-hidden="true">*</span>
          </label>

          <input
            id="service-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Ex: Corte Clássico Masculino"
            autoComplete="off"
            className={`${fieldBaseClass} ${fieldBorderClass("name")}`}
          />

          {touched.name && errors.name && (
            <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="service-description"
            className="block text-xs font-label uppercase tracking-widest text-primary mb-2"
          >
            Descrição
            <span className="ml-2 normal-case text-on-surface-variant/50 tracking-normal font-normal">
              (opcional)
            </span>
          </label>

          <textarea
            id="service-description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Descreva o serviço brevemente..."
            className={`${fieldBaseClass} border-b-2 border-outline-variant/30 focus:border-primary resize-none`}
          />
        </div>

        {/* Duration + Price (side by side) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="service-duration"
              className="block text-xs font-label uppercase tracking-widest text-primary mb-2"
            >
              Duração (min) <span aria-hidden="true">*</span>
            </label>

            <input
              id="service-duration"
              name="duration"
              type="number"
              min="1"
              step="1"
              value={formData.duration}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="30"
              inputMode="numeric"
              className={`${fieldBaseClass} ${fieldBorderClass("duration")}`}
            />

            {touched.duration && errors.duration && (
              <p className="mt-1.5 text-xs text-red-400">{errors.duration}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="service-price"
              className="block text-xs font-label uppercase tracking-widest text-primary mb-2"
            >
              Preço (R$) <span aria-hidden="true">*</span>
            </label>

            <input
              id="service-price"
              name="price"
              type="text"
              inputMode="decimal"
              value={formData.price}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="50,00"
              className={`${fieldBaseClass} ${fieldBorderClass("price")}`}
            />

            {touched.price && errors.price && (
              <p className="mt-1.5 text-xs text-red-400">{errors.price}</p>
            )}
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
        <div className="pt-4 flex flex-col lg:flex-row gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full lg:w-max px-12 py-4 bg-primary text-on-primary font-bold text-xs uppercase tracking-widest transition-all hover:translate-x-1 active:translate-x-0 relative group focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0"
          >
            {serviceToEdit ? "Salvar Alterações" : "Cadastrar Serviço"}
            <span className="absolute inset-0 border border-primary translate-x-2 translate-y-2 -z-10 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform opacity-30" />
          </button>

          {serviceToEdit && (
            <button
              type="button"
              disabled={submitting}
              onClick={onCancelEdit}
              className="w-full lg:w-max px-8 py-4 bg-transparent text-on-surface border border-outline-variant/30 font-bold text-xs uppercase tracking-widest transition-all hover:bg-surface-container-highest focus:outline-none focus:ring-2 focus:ring-outline-variant/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      <LoadingDialog
        isOpen={submitting}
        title={serviceToEdit ? "Atualizando serviço" : "Cadastrando serviço"}
        description={
          serviceToEdit
            ? "Estamos atualizando os dados do serviço. Isso levará apenas um momento."
            : "Estamos registrando o novo serviço no sistema. Isso levará apenas um momento."
        }
      />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardServicesPage() {
  const [services, setServices] = useState([]);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedServiceToEdit, setSelectedServiceToEdit] = useState(null);

  // Delete flow state
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    async function fetchServices() {
      setLoadingFetch(true);
      setFetchError(null);

      try {
        const res = await fetch("/api/v1/services");

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Erro ao carregar serviços.");
        }

        const data = await res.json();
        setServices(data);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoadingFetch(false);
      }
    }

    fetchServices();
  }, []);

  function handleServiceCreated(newService) {
    setServices((prev) => [...prev, newService]);
  }

  function handleServiceEdit(service) {
    setSelectedServiceToEdit(service);
  }

  function handleServiceUpdated(updatedService) {
    setServices((prev) =>
      prev.map((service) =>
        service.service_id === updatedService.service_id
          ? updatedService
          : service,
      ),
    );
    setSelectedServiceToEdit(null);
  }

  function handleCancelEdit() {
    setSelectedServiceToEdit(null);
  }

  function handleServiceDeleteRequest(serviceId) {
    setDeleteError(null);
    setServiceToDelete(serviceId);
  }

  function handleDeleteCancel() {
    setServiceToDelete(null);
  }

  async function handleDeleteConfirm() {
    const serviceId = serviceToDelete;
    setServiceToDelete(null);
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/v1/services/${serviceId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao excluir serviço.");
      }

      setServices((prev) =>
        prev.filter((service) => service.service_id !== serviceId),
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
          Gerenciamento de Serviços
        </h2>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] mx-8 mb-12">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 bg-surface-container-low p-8 lg:p-12 flex flex-col">
          <div className="mb-8">
            <h3 className="text-2xl font-headline font-semibold text-on-surface mb-2">
              {selectedServiceToEdit ? "Editar Serviço" : "Adicionar Serviço"}
            </h3>

            <p className="text-sm text-on-surface-variant font-light leading-relaxed">
              {selectedServiceToEdit
                ? "Edite os dados do serviço selecionado. As alterações serão salvas imediatamente."
                : "Cadastre um novo serviço disponível para agendamento. O serviço será listado imediatamente após o cadastro."}
            </p>
          </div>

          <ServiceForm
            key={
              selectedServiceToEdit
                ? selectedServiceToEdit.service_id
                : "create"
            }
            serviceToEdit={selectedServiceToEdit}
            onServiceCreated={handleServiceCreated}
            onServiceUpdated={handleServiceUpdated}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        {/* Right Column: Services List */}
        <div className="lg:col-span-7 bg-surface p-8 lg:p-12 flex flex-col">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-4 w-1 bg-primary shrink-0" />

            <h3 className="font-headline text-2xl font-bold text-on-surface">
              Serviços Cadastrados
            </h3>

            {!loadingFetch && !fetchError && (
              <span className="ml-auto text-[10px] font-label uppercase tracking-widest text-primary bg-primary/10 px-4 py-0.5">
                {services.length}{" "}
                {services.length === 1 ? "serviço" : "serviços"}
              </span>
            )}
          </div>

          {/* Loading skeleton */}
          {loadingFetch && (
            <div className="space-y-4">
              <ServiceCardSkeleton />
              <ServiceCardSkeleton />
              <ServiceCardSkeleton />
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
          {!loadingFetch && !fetchError && services.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-surface-container-high flex items-center justify-center mb-6">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-on-surface-variant/30"
                >
                  <path d="M20 6h-2.18c.07-.44.18-.88.18-1.33C18 2.54 15.96.5 13.5.5c-1.32 0-2.46.56-3.33 1.44L9 3.11 7.83 1.94C6.96 1.06 5.82.5 4.5.5 2.04.5 0 2.54 0 4.67c0 .45.11.89.18 1.33H0v2h20V6zm-7.5-3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-8 0c.83 0 1.5.67 1.5 1.5S5.33 5.5 4.5 5.5 3 4.83 3 4c0-.83.67-1.5 1.5-1.5zM20 9H0v13h20V9zm-9 10.5H9V11h2v8.5zm4.5 0h-2V11h2v8.5z" />
                </svg>
              </div>

              <p className="text-on-surface font-headline text-xl font-bold mb-2">
                Nenhum serviço cadastrado
              </p>

              <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
                Use o formulário ao lado para cadastrar o primeiro serviço
                disponível para agendamento.
              </p>
            </div>
          )}

          {/* Services list */}
          {!loadingFetch && !fetchError && services.length > 0 && (
            <div className="space-y-4 overflow-y-auto">
              {services.map((service) => (
                <ServiceCard
                  key={service.service_id}
                  service={service}
                  onEdit={handleServiceEdit}
                  onDelete={handleServiceDeleteRequest}
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
        isOpen={serviceToDelete !== null}
        title="Excluir serviço?"
        description="Este serviço será removido da lista de serviços ativos. Agendamentos antigos que usaram este serviço não serão apagados."
        confirmLabel="Sim, excluir serviço"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <LoadingDialog
        isOpen={deleting}
        title="Excluindo serviço"
        description="Estamos removendo o serviço da lista de serviços ativos. Isso levará apenas um momento."
      />
    </>
  );
}

DashboardServicesPage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
