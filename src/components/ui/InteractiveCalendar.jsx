import { useMemo, useState } from "react";

export default function InteractiveCalendar() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthYearLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(currentDate);
  }, [currentDate]);

  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const firstDay = useMemo(() => {
    return new Date(year, month, 1).getDay();
  }, [year, month]);

  const today = new Date();

  function handlePrevMonth() {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  }

  function handleNextMonth() {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  }

  function isSameDay(dateA, dateB) {
    return (
      dateA.getDate() === dateB.getDate() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getFullYear() === dateB.getFullYear()
    );
  }

  const calendarCells = useMemo(() => {
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ type: "empty", key: `empty-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        type: "day",
        key: `day-${day}`,
        day,
        date: new Date(year, month, day),
      });
    }

    return cells;
  }, [firstDay, daysInMonth, year, month]);

  return (
    <div className="w-full max-w-2xl bg-surface-container-lowest p-6 border border-outline-variant/30 font-body shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-outline-variant/10">
        <h4 className="text-xl font-headline font-bold text-primary tracking-wide">
          {monthYearLabel}
        </h4>

        <div className="flex gap-4">
          <button
            className="p-1 hover:text-primary transition-colors"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            type="button"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <button
            className="p-1 hover:text-primary transition-colors"
            onClick={handleNextMonth}
            aria-label="Next month"
            type="button"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px text-center mb-1">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((label) => (
          <div
            key={label}
            className="text-[9px] font-bold uppercase tracking-widest text-outline py-2"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px">
        {calendarCells.map((cell) => {
          if (cell.type === "empty") {
            return <div key={cell.key} />;
          }

          const isToday = isSameDay(cell.date, today);
          const isSelected = isSameDay(cell.date, selectedDate);

          const baseClass =
            "py-4 text-[11px] transition-all hover:bg-primary/10 border border-transparent font-medium";

          const selectedClass = "bg-primary text-on-primary font-bold";
          const todayClass = "text-primary border-primary/20";

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => setSelectedDate(cell.date)}
              className={`${baseClass} ${isSelected ? selectedClass : ""} ${
                !isSelected && isToday ? todayClass : ""
              }`}
              aria-label={`Select day ${cell.day}`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
