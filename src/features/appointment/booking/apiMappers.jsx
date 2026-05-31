/**
 * Get SVG icon for a service based on service name
 * Returns appropriate barbershop-related icon (JSX)
 * @param {string} serviceName - Name of the service
 * @returns {JSX.Element} SVG icon element
 */
export function getServiceIcon(serviceName = "") {
  const normalizedServiceName = serviceName.toLowerCase();

  if (normalizedServiceName.includes("barba")) {
    return (
      <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 14c0 2.76 2.24 5 5 5s5-2.24 5-5v-2H7v2zm5-12C8.13 2 5 5.13 5 9v1h14V9c0-3.87-3.13-7-7-7z" />
      </svg>
    );
  }

  if (normalizedServiceName.includes("cabelo")) {
    return (
      <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.64 7.64L12 10l2.36-2.36 1.41 1.41L13.41 11.4l2.36 2.36-1.41 1.41L12 12.81l-2.36 2.36-1.41-1.41 2.36-2.36-2.36-2.36 1.41-1.41z" />
      </svg>
    );
  }

  return (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

/**
 * Map a service object from the API format to the UI format
 * @param {object} service - Raw service object from API
 * @param {string} service.service_id - Service ID
 * @param {string} service.service_name - Service name
 * @param {string} service.service_description - Service description
 * @param {string} service.price - Service price as string
 * @param {number} service.duration - Duration in minutes
 * @returns {object} Service object formatted for UI
 */
export function mapServiceFromApi(service) {
  return {
    id: service.service_id,
    title: service.service_name,
    description: service.service_description,
    priceLabel: `R$ ${service.price}`,
    priceValue: Number(service.price),
    durationMinutes: service.duration,
    icon: getServiceIcon(service.service_name),
  };
}

/**
 * Map a barber object from the API format to the UI format
 * @param {object} barber - Raw barber object from API
 * @param {string} barber.barber_id - Barber ID
 * @param {string} barber.barber_name - Barber name
 * @param {string} barber.work_start - Work start time in 24h format (e.g., "08:00")
 * @param {string} barber.work_end - Work end time in 24h format (e.g., "18:00")
 * @param {string|null} barber.lunch_start - Lunch start time in 24h format or null
 * @param {string|null} barber.lunch_end - Lunch end time in 24h format or null
 * @param {number} index - Index of barber in array (for image rotation)
 * @returns {object} Barber object formatted for UI
 */
export function mapBarberFromApi(barber, index) {
  const fallbackImages = ["/julian_barber.jpg", "/elias_barber.jpg"];

  return {
    id: barber.barber_id,
    name: barber.barber_name,
    role: "Barbeiro",
    image: fallbackImages[index % fallbackImages.length],
    alt: `Retrato de ${barber.barber_name}.`,
    workStart: barber.work_start || "08:00",
    workEnd: barber.work_end || "18:00",
    lunchStart: barber.lunch_start || null,
    lunchEnd: barber.lunch_end || null,
  };
}
