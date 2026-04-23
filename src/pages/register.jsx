import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import AuthLayout from "@/components/layout/AuthLayout";

export default function RegisterPage() {
  const containerRef = useRef(null);
  const torchRef = useRef(null);

  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [touchedConfirmPassword, setTouchedConfirmPassword] = useState(false);

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

  function formatPhone(value) {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 2) return digits.length ? `(${digits}` : "";

    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  const passwordRules = useMemo(() => {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasMinLength = password.length >= 8;

    return {
      hasLowercase,
      hasUppercase,
      hasNumber,
      hasMinLength,
    };
  }, [password]);

  const isPasswordValid =
    passwordRules.hasLowercase &&
    passwordRules.hasUppercase &&
    passwordRules.hasNumber &&
    passwordRules.hasMinLength;

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const canSubmit = isPasswordValid && passwordsMatch;

  function handleSubmit(e) {
    e.preventDefault();

    setTouchedPassword(true);
    setTouchedConfirmPassword(true);

    if (!canSubmit) return;

    console.log("Registering user...");
  }

  function ruleClass(isValid) {
    return isValid ? "text-green-400" : "text-red-400";
  }

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

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="w-full max-w-md z-10 relative">
        {/* Branding */}
        <div className="text-center mb-10">
          <Link href={"/"}>
            <h1 className="text-3xl font-black text-primary uppercase tracking-widest font-headline mb-2">
              MAXIMUS
            </h1>
          </Link>
          <p className="font-label text-xs tracking-[0.2em] text-on-surface-variant/70 uppercase">
            O Artesão Moderno
          </p>
        </div>

        {/* Sign Up Card */}
        <div className="bg-surface-container-high p-8 md:p-10 shadow-[0_20px_50px_rgba(17,14,8,0.6)] relative group">
          <header className="mb-8 text-center">
            <div className="w-full flex justify-center mb-6">
              <span
                className="material-symbols-outlined text-4xl text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                content_cut
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface mb-2">
              Junte-se à Maximus
            </h2>

            <p className="text-on-surface-variant/80 text-sm">
              Crie sua conta para gerenciar seu agendamentos.
            </p>
          </header>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Nome Completo */}
            <div className="space-y-2">
              <label
                className="block font-label text-[10px] font-bold text-primary uppercase tracking-widest"
                htmlFor="name"
              >
                Nome Completo
              </label>

              <input
                className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 py-3 px-2 transition-colors duration-300 font-body outline-none"
                id="name"
                name="name"
                placeholder="Seu nome completo"
                type="text"
                autoComplete="name"
                required
              />
            </div>

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
                name="email"
                placeholder="seu@email.com"
                type="email"
                autoComplete="email"
                required
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <label
                className="block font-label text-[10px] font-bold text-primary uppercase tracking-widest"
                htmlFor="phone"
              >
                Telefone
              </label>

              <input
                className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 py-3 px-2 transition-colors duration-300 font-body outline-none"
                id="phone"
                name="phone"
                placeholder="(00) 00000-0000"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
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
                name="password"
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouchedPassword(true)}
              />

              {/* Password Rules */}
              {(touchedPassword || password.length > 0) && (
                <div className="mt-4 bg-surface-container-lowest border border-outline-variant/20 p-4 text-[11px]">
                  <h3 className="font-bold text-on-surface mb-2">
                    Password must contain the following:
                  </h3>

                  <p className={ruleClass(passwordRules.hasLowercase)}>
                    A <b>lowercase</b> letter
                  </p>

                  <p className={ruleClass(passwordRules.hasUppercase)}>
                    A <b>capital (uppercase)</b> letter
                  </p>

                  <p className={ruleClass(passwordRules.hasNumber)}>
                    A <b>number</b>
                  </p>

                  <p className={ruleClass(passwordRules.hasMinLength)}>
                    Minimum <b>8 characters</b>
                  </p>
                </div>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <label
                className="block font-label text-[10px] font-bold text-primary uppercase tracking-widest"
                htmlFor="confirm_password"
              >
                Confirmar Senha
              </label>

              <input
                className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 py-3 px-2 transition-colors duration-300 font-body outline-none"
                id="confirm_password"
                name="confirm_password"
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouchedConfirmPassword(true)}
              />

              {touchedConfirmPassword && confirmPassword.length > 0 && (
                <p
                  className={`text-[10px] uppercase tracking-widest font-bold ${
                    passwordsMatch ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {passwordsMatch
                    ? "Senhas coincidem"
                    : "As senhas não coincidem"}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                className={`w-full font-black py-4 text-sm tracking-widest uppercase border shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-300 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#110e08] group
                ${
                  canSubmit
                    ? "bg-black text-[#e9c349] border-white/20 hover:translate-y-[-2px] active:translate-y-0 active:scale-[0.98]"
                    : "bg-black/50 text-[#e9c349]/40 border-white/10 cursor-not-allowed"
                }`}
                type="submit"
                disabled={!canSubmit}
              >
                <span className="relative z-10">CRIAR CONTA</span>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </button>

              {!canSubmit && (touchedPassword || touchedConfirmPassword) && (
                <p className="mt-3 text-[10px] uppercase tracking-widest text-red-400 text-center">
                  Verifique os requisitos da senha e confirme corretamente.
                </p>
              )}
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-8 border-t border-outline-variant/10 flex flex-col gap-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60">
              Já possui uma conta?{" "}
              <Link
                className="text-primary font-bold hover:opacity-80 transition-opacity"
                href="/login"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>

        {/* Minimal Auth Footer */}
        <p className="mt-10 text-center text-[10px] uppercase tracking-widest text-white/40">
          © 2026 Maximus. Todos os direitos reservados.
        </p>
      </div>
    </main>
  );
}

RegisterPage.getLayout = function getLayout(page) {
  return <AuthLayout>{page}</AuthLayout>;
};
