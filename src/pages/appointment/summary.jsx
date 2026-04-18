import Link from "next/link";

function TopNavbar() {
  return (
    <header className="bg-[#2d2a22] flex justify-between items-center w-full px-8 py-6 max-w-full sticky top-0 z-50">
      <div className="font-serif text-3xl font-bold tracking-tighter text-[#e9c349]">
        MAXIMUS
      </div>

      <nav className="hidden md:flex gap-12">
        <div className="hidden md:flex items-center gap-8">
          <Link
            className="text-[#e9c349] border-b-2 border-[#e9c349] pb-1 font-['Newsreader'] uppercase tracking-widest text-xs"
            href="/home"
          >
            Home
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link
            className="text-[#e9c349] border-b-2 border-[#e9c349] pb-1 font-['Newsreader'] uppercase tracking-widest text-xs"
            href="/home"
          >
            Galeria
          </Link>
        </div>
      </nav>
    </header>
  );
}

function InConstruction() {
  return (
    <h1 className="text-center">Esta página ainda está sendo construída :D</h1>
  );
}

export default function Summary() {
  return (
    <>
      <TopNavbar />
      <InConstruction />
    </>
  );
}
