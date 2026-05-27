export default function EmptyState({ title, description }) {
  return (
    <div className="bg-surface-container-high p-10 text-center border border-outline-variant/30">
      <span className="text-primary text-5xl mb-6 block">✦</span>

      <h3 className="font-headline text-4xl italic text-primary mb-4">
        {title}
      </h3>

      <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant opacity-70 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
