export default function CalendarDayButton({ cell, active, onSelect }) {
  const isNotCurrentMonth = cell.monthOffset !== 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cellDate = new Date(cell.date);
  cellDate.setHours(0, 0, 0, 0);

  const isPast = cellDate < today;
  const isDisabled = isNotCurrentMonth || isPast;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onSelect(cell.date)}
      className={`py-2 font-bold transition-colors ${
        isDisabled
          ? "text-on-surface-variant opacity-20 cursor-not-allowed"
          : active
            ? "bg-primary text-on-primary"
            : "hover:bg-primary hover:text-on-primary cursor-pointer"
      }`}
    >
      {cell.day}
    </button>
  );
}
