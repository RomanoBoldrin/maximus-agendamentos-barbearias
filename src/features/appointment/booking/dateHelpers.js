/**
 * Date formatting and calendar generation helpers for appointment booking
 */

/**
 * Format a date object to Portuguese month-year format (e.g., "JANEIRO 2026")
 * @param {Date} date - The date to format
 * @returns {string} Formatted month and year in Portuguese
 */
export function formatMonthYear(date) {
  const months = [
    "JANEIRO",
    "FEVEREIRO",
    "MARÇO",
    "ABRIL",
    "MAIO",
    "JUNHO",
    "JULHO",
    "AGOSTO",
    "SETEMBRO",
    "OUTUBRO",
    "NOVEMBRO",
    "DEZEMBRO",
  ];

  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format a selected date for display in summary (e.g., "Jan 25,")
 * @param {Date|null} date - The date to format, or null
 * @returns {string} Formatted date or placeholder text
 */
export function formatSelectedDate(date) {
  if (!date) return "Selecione uma data";

  const monthsShort = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  return `${monthsShort[date.getMonth()]} ${date.getDate()},`;
}

/**
 * Generate calendar grid cells for a given month
 * Includes days from previous and next months to fill the grid
 * @param {Date} currentMonthDate - A date in the target month
 * @returns {Array<{day: number, date: Date, monthOffset: number}>} Calendar cells
 */
export function getCalendarCells(currentMonthDate) {
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Monday = 0, Sunday = 6 (after adjustment)
  const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7;

  const cells = [];

  // Add days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const dateObj = new Date(year, month - 1, day);

    cells.push({
      day,
      date: dateObj,
      monthOffset: -1,
    });
  }

  // Add days from current month
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const dateObj = new Date(year, month, day);

    cells.push({
      day,
      date: dateObj,
      monthOffset: 0,
    });
  }

  // Add days from next month to fill the grid
  while (cells.length % 7 !== 0) {
    const nextDay =
      cells.length - (firstWeekday + lastDayOfMonth.getDate()) + 1;
    const dateObj = new Date(year, month + 1, nextDay);

    cells.push({
      day: nextDay,
      date: dateObj,
      monthOffset: 1,
    });
  }

  return cells;
}

/**
 * Get the first valid date for a given month (today if month is current, 1st of month otherwise)
 * Returns null if the entire month is in the past
 * @param {number} year - The year
 * @param {number} monthIndex - The month (0-11)
 * @returns {Date|null} First valid date or null if month is entirely past
 */
export function getFirstValidDateForMonth(year, monthIndex) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, monthIndex, 1);
  firstDay.setHours(0, 0, 0, 0);

  const monthEnd = new Date(year, monthIndex + 1, 0);
  monthEnd.setHours(0, 0, 0, 0);

  // If entire month is in the past, return null
  if (monthEnd < today) return null;

  // If this is the current month, return today
  if (today.getFullYear() === year && today.getMonth() === monthIndex) {
    return today;
  }

  // Otherwise return the first of the month
  return firstDay;
}
