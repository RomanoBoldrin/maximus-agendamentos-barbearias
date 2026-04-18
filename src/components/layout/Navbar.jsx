import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full glass-nav border-b border-outline-variant/10">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-[1600px] mx-auto">
        <div className="text-2xl font-bold font-['Newsreader'] text-[#e9c349]">
          <Link href="/home" className="inline-block">
            Maximus
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link
            className="text-[#e9c349] border-b-2 border-[#e9c349] pb-1 font-['Newsreader'] uppercase tracking-widest text-xs"
            href="/home"
          >
            Home
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-[#e9c349] font-['Newsreader'] uppercase tracking-widest text-xs hover:opacity-80"
          >
            Login
          </Link>
        <Link href={"/register"}>
          <button className="bg-gradient-to-r from-[#e9c349] to-[#b39016] text-[#e8e0d5] px-5 py-2 font-bold uppercase tracking-widest text-[10px] hover:shadow-[2px_2px_0px_#e9e1d6] transition-all">
            COMEÇAR AGORA
          </button>
        </Link>
        </div>
      </div>
    </nav>
  );
}
