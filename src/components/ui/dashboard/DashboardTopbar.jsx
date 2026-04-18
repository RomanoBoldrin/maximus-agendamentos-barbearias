export default function DashboardTopbar({
  collapsed = false,
  onToggleSidebar,
}) {
  return (
    <header
      className={`flex justify-between items-center w-full px-8 h-16 fixed top-0 z-30 bg-[#16130c]/80 backdrop-blur-md shadow-[0_20px_50px_rgba(17,14,8,0.4)] transition-all duration-300 ${
        collapsed ? "ml-20 max-w-[calc(100%-5rem)]" : "ml-64 max-w-[calc(100%-16rem)]"
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>

        <h1 className="text-xl font-bold font-serif text-[#e9c349]">
          Maximus Admin
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Abrir menu de conta"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
