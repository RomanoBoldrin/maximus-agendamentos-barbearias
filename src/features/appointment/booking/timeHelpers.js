/**
 * Time parsing, formatting, and time slot generation helpers for appointment booking
 */

/**
 * Parse a time string in meridian format (HH:MM AM/PM) to minutes since midnight
 * @param {string} timeString - Time in format "HH:MM AM/PM" (e.g., "02:30 PM")
 * @returns {number} Total minutes since midnight
 */
export function parseTimeToMinutes(timeString) {
  const [time, meridian] = timeString.split(" ");
  const [hh, mm] = time.split(":").map(Number);

  let hours = hh;

  if (meridian === "PM" && hours !== 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;

  return hours * 60 + mm;
}

/**
 * Convert minutes since midnight to meridian format (HH:MM AM/PM)
 * @param {number} totalMinutes - Total minutes since midnight
 * @returns {string} Time in format "HH:MM AM/PM"
 */
export function formatMinutesToTime(totalMinutes) {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const meridian = hours >= 12 ? "PM" : "AM";
  if (hours === 0) hours = 12;
  if (hours > 12) hours -= 12;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  return `${hh}:${mm} ${meridian}`;
}

/**
 * Convert 24-hour time format (HH:MM) from API to meridian format (HH:MM AM/PM)
 * @param {string|null} time - Time in 24-hour format (e.g., "14:30") or null
 * @returns {string|null} Time in meridian format or null if input is falsy
 */
export function formatApiTimeToMeridian(time) {
  if (!time) return null;

  const [hourString, minuteString] = time.split(":");
  let hour = Number(hourString);
  const meridian = hour >= 12 ? "PM" : "AM";

  if (hour === 0) hour = 12;
  if (hour > 12) hour -= 12;

  return `${String(hour).padStart(2, "0")}:${minuteString} ${meridian}`;
}

/**
 * Round up minutes to the nearest interval
 * @param {number} minutes - Total minutes to round
 * @param {number} interval - Rounding interval in minutes
 * @returns {number} Rounded minutes
 */
export function roundUpToInterval(minutes, interval) {
  return Math.ceil(minutes / interval) * interval;
}

/**
 * Generate available time slots for an appointment based on barber work hours and service duration
 * @param {object} params - Generation parameters
 * @param {string} params.workStart - Work start time in meridian format
 * @param {string} params.workEnd - Work end time in meridian format
 * @param {string|null} params.lunchStart - Lunch break start time (optional)
 * @param {string|null} params.lunchEnd - Lunch break end time (optional)
 * @param {number} params.duration - Service duration in minutes
 * @param {number} params.interval - Interval between slots in minutes (usually 15)
 * @returns {Array<string>} Array of available time slots in meridian format
 */
export function generateTimeSlots({
  workStart,
  workEnd,
  lunchStart,
  lunchEnd,
  duration,
  interval,
}) {
  if (!workStart || !workEnd || !duration) return [];

  const startMinutes = parseTimeToMinutes(workStart);
  const endMinutes = parseTimeToMinutes(workEnd);

  const hasLunchBreak = Boolean(lunchStart && lunchEnd);
  const lunchStartMin = hasLunchBreak ? parseTimeToMinutes(lunchStart) : null;
  const lunchEndMin = hasLunchBreak ? parseTimeToMinutes(lunchEnd) : null;

  const slots = [];

  // Round up the start time to the nearest interval
  let current = roundUpToInterval(startMinutes, interval);

  // Generate slots until the appointment would extend past work end
  while (current + duration <= endMinutes) {
    const appointmentEnd = current + duration;

    // Check if appointment overlaps with lunch break
    const overlapsLunch =
      hasLunchBreak && current < lunchEndMin && appointmentEnd > lunchStartMin;

    if (!overlapsLunch) {
      slots.push(formatMinutesToTime(current));
    }

    current += interval;
  }

  return slots;
}

/**
 * Build an ISO 8601 datetime string from a selected date and time
 * @param {Date} selectedDate - The appointment date
 * @param {string} selectedTime - The appointment time in meridian format (HH:MM AM/PM)
 * @returns {string} ISO 8601 formatted datetime string
 */
export function buildAppointmentDateTime(selectedDate, selectedTime) {
  const appointmentDate = new Date(selectedDate);
  const minutes = parseTimeToMinutes(selectedTime);

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  appointmentDate.setHours(hours, mins, 0, 0);

  return appointmentDate.toISOString();
}
