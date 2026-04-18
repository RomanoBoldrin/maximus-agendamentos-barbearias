export default function Footer() {
  return (
    <footer className="bg-[#110e08] py-12 border-t border-outline-variant/10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full px-8 max-w-[1600px] mx-auto">
        <div>
          <div className="text-xl font-bold font-['Newsreader'] text-[#e9c349] mb-4">
            Maximus
          </div>

          <p className="text-[#e9e1d6]/40 font-['Work_Sans'] text-[10px] uppercase tracking-tighter leading-relaxed">
            © 2026 Maximus Barbershop. Built for the Modern Craftsman.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-3">
            <a
              className="text-[#e9e1d6]/60 hover:text-[#e9c349] font-['Work_Sans'] text-[10px] uppercase tracking-widest transition-all"
              href="#"
            >
              Instagram
            </a>

            <a
              className="text-[#e9e1d6]/60 hover:text-[#e9c349] font-['Work_Sans'] text-[10px] uppercase tracking-widest transition-all"
              href="#"
            >
              Twitter
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <a
              className="text-[#e9e1d6]/60 hover:text-[#e9c349] font-['Work_Sans'] text-[10px] uppercase tracking-widest transition-all"
              href="#"
            >
              Privacy
            </a>

            <a
              className="text-[#e9e1d6]/60 hover:text-[#e9c349] font-['Work_Sans'] text-[10px] uppercase tracking-widest transition-all"
              href="#"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
