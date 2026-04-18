import { useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits.replace(/(\d{0,2})/, "($1");
  }

  if (digits.length <= 7) {
    return digits.replace(/(\d{2})(\d{0,5})/, "($1) $2");
  }

  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

export default function DashboardEmployeesPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "phone") {
      setFormData((prev) => ({
        ...prev,
        phone: formatPhone(value),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    // TODO: integrate with API later
    console.log("Novo funcionário:", formData);

    setFormData({
      name: "",
      phone: "",
      email: "",
    });
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-12">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 bg-surface-container-low p-8 lg:p-12 flex flex-col">
          <div className="mb-8">
            <h3 className="text-2xl font-headline font-semibold text-on-surface mb-2">
              Adicionar Novo Barbeiro
            </h3>

            <p className="text-sm text-on-surface-variant font-light leading-relaxed">
              Expanda o legado. Cadastre um novo profissional para integrar a
              família Maximus.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo Upload (UI only for now) */}
            <div className="group">
              <label className="block text-xs font-label uppercase tracking-widest text-primary mb-4">
                Foto do Profissional
              </label>

              <button
                type="button"
                className="relative w-32 h-32 bg-surface-container-lowest border-none flex items-center justify-center cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <span className="text-on-surface-variant/30">
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </span>

                <div className="absolute inset-0 border-2 border-dashed border-outline-variant/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="absolute bottom-0 right-0 bg-primary p-1">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#3c2f00"
                  >
                    <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="relative">
                <label
                  htmlFor="name"
                  className="block text-xs font-label uppercase tracking-widest text-primary mb-2"
                >
                  Nome Completo
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Julian 'The Blade' Sterling"
                  autoComplete="name"
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 py-3 px-2 transition-colors duration-300 font-body outline-none"
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="phone"
                  className="block text-xs font-label uppercase tracking-widest text-primary mb-2"
                >
                  Número de Telefone
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={15}
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 py-3 px-2 transition-colors duration-300 font-body outline-none"
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="email"
                  className="block text-xs font-label uppercase tracking-widest text-primary mb-2"
                >
                  Endereço de Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemplo@maximusbarbers.com"
                  autoComplete="email"
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 py-3 px-2 transition-colors duration-300 font-body outline-none"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-8">
              <button
                type="submit"
                className="w-full lg:w-max px-12 py-4 bg-primary text-on-primary font-bold text-xs uppercase tracking-widest transition-all hover:translate-x-1 active:translate-x-0 relative group focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                Cadastrar Profissional
                <span className="absolute inset-0 border border-primary translate-x-2 translate-y-2 -z-10 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform opacity-30" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Image */}
        <div className="lg:col-span-7 relative min-h-[400px] lg:min-h-full">
          <img
            alt="Interior clássico e sofisticado de uma barbearia vintage com cadeira de couro e iluminação quente."
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCB33Mqxaomzz0ROnbVjQMnVbmsUvIHPd72BJcumCW-GDxz3RlJ8QutEffrcRBWZRUJ-DzvZZC6iMF_Rc2xav9p9SuB_LIm6YviuEQCgty9K22iUSvhtooN8n2m10ZUBFSAWG4w6ueqAMaoYOHCA-uCEFxl7QRSZT_gjx03lOhWMFZ8HTEs9HVXuLKWd8AmgvWScVIQY77I-ZVQsvBKOpZF5RrRrKjH0SACYEbi_Tc-7bEAGGPkEYIbWhGV10CvuZm-qFGrKgiWMp8"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low via-transparent to-transparent lg:block hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent lg:hidden block" />
        </div>
      </div>
    </>
  );
}

DashboardEmployeesPage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
