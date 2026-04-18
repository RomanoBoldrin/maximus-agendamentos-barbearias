import Link from "next/link";
import { useRouter } from "next/router";

function NavItem({ href, label, icon, active, collapsed }) {
  return (
    <Link
      href={href}
      className={`px-4 py-3 flex items-center gap-3 transition-all duration-200 group ${
        active
          ? "text-[#e9c349] font-bold border-l-4 border-[#e9c349] bg-[#2d2a22]"
          : "text-[#e9e1d6]/60 hover:bg-[#2d2a22] hover:text-[#e9c349]"
      }`}
      title={collapsed ? label : undefined}
    >
      <span className="text-lg shrink-0">{icon}</span>

      {!collapsed && (
        <span className="text-sm font-medium font-label uppercase tracking-wider whitespace-nowrap">
          {label}
        </span>
      )}
    </Link>
  );
}

export default function DashboardSidebar({ collapsed = false }) {
  const router = useRouter();

  return (
    <aside
      className={`fixed inset-y-0 left-0 flex flex-col h-screen z-40 bg-[#16130c] shadow-none transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="px-6 py-8">
        <div className="flex flex-col">
          <span className="text-2xl font-bold font-serif text-[#e9c349] uppercase leading-none">
            {collapsed ? "M" : "Maximus"}
          </span>

          {!collapsed && (
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#e9e1d6]/50 mt-1 font-label">
              Modern Craftsman Admin
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        <div className="mb-4">
          <NavItem
            href="/dashboard/overview"
            label="Visão Geral"
            collapsed={collapsed}
            active={router.pathname === "/dashboard/overview"}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
              </svg>
            }
          />

          <NavItem
            href="/dashboard/appointments"
            label="Agendamentos"
            collapsed={collapsed}
            active={router.pathname.startsWith("/dashboard/appointments")}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10h5v5H7v-5zm-2 9h14V8H5v11zm14-14V3h-2v2H7V3H5v2H3v16h18V5h-2z" />
              </svg>
            }
          />

          <NavItem
            href="/dashboard/employees"
            label="Funcionários"
            collapsed={collapsed}
            active={router.pathname.startsWith("/dashboard/employees")}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z" />
              </svg>
            }
          />
        </div>
      </nav>

      <div className="px-4 py-6 space-y-4">
        <div className="pt-4 border-t border-[#38342c]/30">
          <Link
            href="/dashboard/settings"
            className="text-[#e9e1d6]/60 flex items-center gap-3 px-4 py-2 hover:text-[#e9c349] transition-colors"
            title={collapsed ? "Configurações" : undefined}
          >
            <span className="text-lg shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14,12.94a7.43,7.43,0,0,0,.05-.94,7.43,7.43,0,0,0-.05-.94l2.11-1.65a.5.5,0,0,0,.12-.63l-2-3.46a.5.5,0,0,0-.6-.22l-2.49,1a7.28,7.28,0,0,0-1.63-.94l-.38-2.65A.5.5,0,0,0,13.79,2H10.21a.5.5,0,0,0-.5.42L9.33,5.07a7.28,7.28,0,0,0-1.63.94l-2.49-1a.5.5,0,0,0-.6.22l-2,3.46a.5.5,0,0,0,.12.63L4.86,11.06a7.43,7.43,0,0,0-.05.94,7.43,7.43,0,0,0,.05.94L2.75,14.59a.5.5,0,0,0-.12.63l2,3.46a.5.5,0,0,0,.6.22l2.49-1a7.28,7.28,0,0,0,1.63.94l.38,2.65a.5.5,0,0,0,.5.42h3.58a.5.5,0,0,0,.5-.42l.38-2.65a7.28,7.28,0,0,0,1.63-.94l2.49,1a.5.5,0,0,0,.6-.22l2-3.46a.5.5,0,0,0-.12-.63ZM12,15.5A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
              </svg>
            </span>

            {!collapsed && (
              <span className="text-xs uppercase tracking-widest font-medium">
                Configurações
              </span>
            )}
          </Link>

          <button
            type="button"
            className="w-full text-left text-[#e9e1d6]/60 flex items-center gap-3 px-4 py-2 hover:text-[#e9c349] transition-colors"
            title={collapsed ? "Sair" : undefined}
          >
            <span className="text-lg shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 13v-2H7V8l-5 4 5 4v-3h9zm3-10H5c-1.1 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
              </svg>
            </span>

            {!collapsed && (
              <span className="text-xs uppercase tracking-widest font-medium">
                Sair
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
