import { useEffect, useRef } from "react";

import AuthLayout from "@/components/layout/AuthLayout";

export default function LoginPage() {
  const containerRef = useRef(null);
  const torchRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const torch = torchRef.current;

    if (!container || !torch) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      torch.style.setProperty("--mouse-x", `${x}px`);
      torch.style.setProperty("--mouse-y", `${y}px`);
    };

    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <main
      ref={containerRef}
      className="w-full min-h-screen flex items-center justify-center relative px-4 py-12 overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(22, 19, 12, 0.85), rgba(22, 19, 12, 0.85)), url('/bg_login_barbershop.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Torch light */}
      <div
        ref={torchRef}
        className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-300 opacity-100"
        style={{
          background:
            "radial-gradient(circle 75px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.08), transparent 80%)",
        }}
      />

      {/* Extra dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Login Container */}
      <div className="w-full max-w-md z-10 relative">
        {/* Branding */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-primary uppercase tracking-widest font-headline mb-2">
            MAXIMUS
          </h1>
          <p className="font-label text-xs tracking-[0.2em] text-on-surface-variant/70 uppercase">
            O Artesão Moderno
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-high p-8 md:p-10 shadow-[0_20px_50px_rgba(17,14,8,0.6)] relative hover:brightness-110 hover:translate-y-[-2px] active:translate-y-0 active:scale-[0.98] transition-all duration-300 overflow-hidden">
          <header className="mb-8">
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-on-surface-variant/80 text-sm">
              Acesse sua conta para gerenciar seus agendamentos.
            </p>
          </header>

          <form className="space-y-6">
            {/* E-mail */}
            <div className="space-y-2">
              <label
                className="block font-label text-[10px] font-bold text-primary uppercase tracking-widest"
                htmlFor="email"
              >
                E-mail
              </label>

              <input
                className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 py-3 px-2 transition-colors duration-300 font-body outline-none"
                id="email"
                placeholder="email@exemplo.com"
                type="email"
                autoComplete="email"
                required
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label
                className="block font-label text-[10px] font-bold text-primary uppercase tracking-widest"
                htmlFor="password"
              >
                Senha
              </label>

              <input
                className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 py-3 px-2 transition-colors duration-300 font-body outline-none"
                id="password"
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
              />
            </div>

            {/* Primary Action */}
            <div className="pt-4">
              <button
                className="w-full bg-black text-[#e9c349] font-black py-4 text-sm tracking-widest uppercase border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:translate-y-[-2px] active:translate-y-0 active:scale-[0.98] transition-all duration-300 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#110e08] group"
                type="submit"
              >
                <span className="relative z-10">ENTRAR</span>

                {/* subtle shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-8 border-t border-outline-variant/10 flex flex-col gap-4 text-center">
            {/*
            <a
              className="text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
              href="#"
            >
              Esqueceu seus dados?
            </a>
           */}
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60">
              Novo por aqui?{" "}
              <a
                className="text-primary font-bold hover:opacity-80"
                href="/register"
              >
                Criar Conta
              </a>
            </p>
          </div>
        </div>

        {/* Minimal footer for auth pages */}
        <p className="mt-10 text-center text-[10px] uppercase tracking-widest text-white/40">
          © 2026 Maximus. Todos os direitos reservados.
        </p>
      </div>
    </main>
  );
}

LoginPage.getLayout = function getLayout(page) {
  return <AuthLayout>{page}</AuthLayout>;
};
