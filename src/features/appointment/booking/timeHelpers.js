/**
 * Time parsing, formatting, and time slot generation helpers for appointment booking.
 * All time strings use 24-hour "HH:MM" format (e.g., "17:00", "08:30").
 */

/**
 * Parse a 24-hour time string (HH:MM) to minutes since midnight
 * @param {string} timeString - Time in 24h format (e.g., "17:30")
 * @returns {number} Total minutes since midnight
 */
export function parseTimeToMinutes(timeString) {
  const [hh, mm] = timeString.split(":").map(Number);
  return hh * 60 + mm;
}

/**
 * Convert minutes since midnight to 24-hour format (HH:MM)
 * @param {number} totalMinutes - Total minutes since midnight
 * @returns {string} Time in 24h format (e.g., "17:30")
 */
export function formatMinutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  return `${hh}:${mm}`;
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
 * @param {string} params.workStart - Work start time in 24h format (e.g., "08:00")
 * @param {string} params.workEnd - Work end time in 24h format (e.g., "18:00")
 * @param {string|null} params.lunchStart - Lunch break start time in 24h format (optional)
 * @param {string|null} params.lunchEnd - Lunch break end time in 24h format (optional)
 * @param {number} params.duration - Service duration in minutes
 * @param {number} params.interval - Interval between slots in minutes (usually 15)
 * @returns {Array<string>} Array of available time slots in 24h format (e.g., ["08:00", "08:15"])
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
 * @param {string} selectedTime - The appointment time in 24h format (e.g., "17:00")
 * @returns {string} ISO 8601 formatted datetime string
 */
export function buildAppointmentDateTime(selectedDate, selectedTime) {
  const appointmentDate = new Date(selectedDate);
  const minutes = parseTimeToMinutes(selectedTime);

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  // Extract date components based on the local calendar of the client device
  const year = appointmentDate.getFullYear();
  const month = String(appointmentDate.getMonth() + 1).padStart(2, "0");
  const day = String(appointmentDate.getDate()).padStart(2, "0");

  const hh = String(hours).padStart(2, "0");
  const mm = String(mins).padStart(2, "0");

  // Construct ISO 8601 string in the barbershop's timezone (America/Sao_Paulo: UTC-3)
  const isoString = `${year}-${month}-${day}T${hh}:${mm}:00-03:00`;

  return new Date(isoString).toISOString();
}
