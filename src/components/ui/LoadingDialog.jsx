import { useEffect } from "react";

export default function LoadingDialog({
  isOpen,
  title = "Processando",
  description = "Aguarde enquanto concluímos esta operação.",
}) {
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center px-6"
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[6px]" />

      <section
        className="relative w-full max-w-sm bg-surface-container-high text-on-surface shadow-[0_20px_50px_rgba(17,14,8,0.55)] p-8 md:p-10"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="loading-dialog-title"
        aria-describedby="loading-dialog-description"
      >
        <div className="absolute left-0 top-10 h-16 w-1 bg-primary" />

        <div className="text-center">
          <p className="font-headline text-3xl font-black text-primary uppercase tracking-widest mb-2">
            MAXIMUS
          </p>

          <p className="font-label text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/70 mb-8">
            Operação em andamento
          </p>

          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center bg-surface-container-lowest">
            <div className="h-8 w-8 border-4 border-primary/20 border-t-primary animate-spin" />
          </div>

          <div className="bg-surface-container-lowest p-6">
            <h2
              id="loading-dialog-title"
              className="font-headline text-3xl font-bold italic mb-4"
            >
              {title}
            </h2>

            <p
              id="loading-dialog-description"
              className="text-sm text-on-surface-variant leading-relaxed"
            >
              {description}
            </p>
          </div>

          <div className="mt-8 h-1 w-full bg-surface-container-lowest overflow-hidden">
            <div className="h-full w-1/3 bg-primary animate-[loading-bar_1.2s_ease-in-out_infinite]" />
          </div>
        </div>

        <style jsx>{`
          @keyframes loading-bar {
            0% {
              transform: translateX(-100%);
            }

            50% {
              transform: translateX(120%);
            }

            100% {
              transform: translateX(320%);
            }
          }
        `}</style>
      </section>
    </div>
  );
}
