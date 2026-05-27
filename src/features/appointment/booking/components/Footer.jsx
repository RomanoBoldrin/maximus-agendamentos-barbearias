export default function Footer() {
  return (
    <footer className="bg-[#110e08] flex flex-col md:flex-row justify-between items-center w-full px-12 py-16 gap-8">
      <div className="font-serif text-[#e9c349] text-lg font-bold">MAXIMUS</div>

      <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#e9e1d6] opacity-50">
        © 2026 Maximus Barbershop. Built for the Modern Craftsman.
      </div>

      <nav className="flex gap-8">
        <a className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#e9e1d6] opacity-50 hover:text-[#e9c349] transition-opacity duration-200">
          PRIVACIDADE
        </a>
        <a className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#e9e1d6] opacity-50 hover:text-[#e9c349] transition-opacity duration-200">
          TERMOS
        </a>
        <a className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#e9e1d6] opacity-50 hover:text-[#e9c349] transition-opacity duration-200">
          CARREIRAS
        </a>
        <a className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#e9e1d6] opacity-50 hover:text-[#e9c349] transition-opacity duration-200">
          CONTATO
        </a>
      </nav>
    </footer>
  );
}
