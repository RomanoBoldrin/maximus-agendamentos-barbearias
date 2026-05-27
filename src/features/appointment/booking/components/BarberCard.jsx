import Image from "next/image";

export default function BarberCard({ barber, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(barber)}
      className={`bg-surface-container-high group cursor-pointer overflow-hidden text-left transition-all border-2 ${
        selected ? "border-primary" : "border-transparent"
      }`}
    >
      <div
        className={`relative w-full aspect-[3/4] overflow-hidden transition-all duration-700 ${
          selected
            ? "grayscale-0 scale-105"
            : "grayscale group-hover:grayscale-0 group-hover:scale-105"
        }`}
      >
        <Image
          className="object-cover"
          src={barber.image}
          alt={barber.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
      </div>

      <div
        className={`p-8 transition-colors flex justify-between items-center ${
          selected
            ? "bg-surface-container-highest"
            : "group-hover:bg-surface-container-highest"
        }`}
      >
        <div>
          <h4 className="font-headline text-3xl">{barber.name}</h4>
          <p className="font-label text-xs uppercase tracking-[0.2em] text-primary">
            {barber.role}
          </p>
        </div>

        {selected && (
          <span className="text-primary">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" />
            </svg>
          </span>
        )}
      </div>
    </button>
  );
}
