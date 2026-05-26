import { useEffect } from "react";

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Sim",
  cancelLabel = "Cancelar",
  variant = "default",
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmButtonClass =
    variant === "danger"
      ? "bg-[#2a0f0f] text-[#ffb4ab] hover:bg-[#3a1515] hover:shadow-[3px_3px_0px_rgba(255,180,171,0.16)]"
      : "bg-primary text-on-primary hover:bg-[#f0ca55] hover:shadow-[3px_3px_0px_rgba(233,195,73,0.25)]";

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center px-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[6px] cursor-default"
        aria-label="Fechar confirmação"
        onClick={onCancel}
      />

      <section
        className="relative w-full max-w-md bg-surface-container-high text-on-surface shadow-[0_20px_50px_rgba(17,14,8,0.55)] p-8 md:p-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <div className="absolute left-0 top-10 h-16 w-1 bg-primary" />

        <div className="text-center mb-8">
          <p className="font-headline text-3xl font-black text-primary uppercase tracking-widest mb-2">
            MAXIMUS
          </p>

          <p className="font-label text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/70">
            Confirmação
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 mb-8">
          <h2
            id="confirm-dialog-title"
            className="font-headline text-3xl md:text-4xl font-bold italic mb-4"
          >
            {title}
          </h2>

          <p
            id="confirm-dialog-description"
            className="text-sm text-on-surface-variant leading-relaxed"
          >
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-surface-container-lowest text-on-surface py-4 font-bold uppercase tracking-[0.2em] text-xs hover:bg-surface-container-highest active:translate-y-[1px] active:scale-[0.99] transition-all duration-200"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`w-full py-4 font-bold uppercase tracking-[0.2em] text-xs shadow-[0_14px_30px_rgba(17,14,8,0.35)] active:translate-y-[1px] active:scale-[0.99] active:shadow-none transition-all duration-200 ${confirmButtonClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
