export default function TimeSlotButton({ time, active, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(time)}
      className={`py-4 font-label text-xs tracking-widest transition-all ${
        disabled
          ? "bg-surface-container-lowest opacity-30 cursor-not-allowed border-b border-outline-variant/30"
          : active
            ? "bg-primary text-on-primary"
            : "bg-surface-container-lowest border-b border-transparent hover:border-primary"
      }`}
    >
      {time}
    </button>
  );
}
