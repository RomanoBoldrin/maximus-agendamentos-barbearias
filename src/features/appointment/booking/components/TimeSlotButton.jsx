export default function TimeSlotButton({ time, active, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(time)}
      className={`py-4 font-label text-xs tracking-widest transition-all flex flex-col items-center justify-center gap-1 ${
        disabled
          ? "bg-surface-container-lowest text-on-surface-variant/30 opacity-50 cursor-not-allowed"
          : active
            ? "bg-primary text-on-primary"
            : "bg-surface-container-lowest border-b border-transparent hover:border-primary"
      }`}
    >
      <span>{time}</span>

      {disabled && (
        <span className="text-[8px] uppercase tracking-[0.15em] text-on-surface-variant/20">
          Indisponível
        </span>
      )}
    </button>
  );
}
