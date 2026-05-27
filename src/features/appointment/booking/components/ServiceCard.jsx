export default function ServiceCard({ service, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      className={`group p-8 flex flex-col justify-between h-64 cursor-pointer transition-all border-none text-left w-full ${
        selected
          ? "bg-primary text-on-primary hover:opacity-90"
          : "bg-surface-container-high hover:bg-surface-container-highest"
      }`}
    >
      <div className="flex justify-between items-start">
        <span
          className={`text-4xl ${
            selected ? "text-on-primary" : "text-primary"
          }`}
        >
          {service.icon}
        </span>

        <span
          className={`font-headline text-3xl ${
            selected ? "text-on-primary" : "text-primary"
          }`}
        >
          {service.priceLabel}
        </span>
      </div>

      <div>
        <h3
          className={`text-center font-headline text-4xl mb-2 ${
            selected ? "text-on-primary" : ""
          }`}
        >
          {service.title}
        </h3>

        <p
          className={`text-center font-light text-sm uppercase tracking-widest ${
            selected ? "text-on-primary" : "text-on-surface-variant"
          }`}
        >
          {service.description || "Serviço disponível para agendamento"}
        </p>
      </div>

      {selected && (
        <div className="relative bottom right-2 bg-on-primary text-primary px-2 py-1 text-[10px] font-bold">
          SELECIONADO
        </div>
      )}
    </button>
  );
}
