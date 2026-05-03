import { useState } from "react";

import DashboardSidebar from "@/components/ui/dashboard/DashboardSidebar";
import DashboardTopbar from "@/components/ui/dashboard/DashboardTopbar";

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;

    const saved = localStorage.getItem("maximus_sidebar_collapsed");
    return saved === "true";
  });

  function toggleSidebar() {
    setSidebarCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("maximus_sidebar_collapsed", String(newState));
      return newState;
    });
  }

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen">
      <DashboardSidebar collapsed={sidebarCollapsed} />

      <DashboardTopbar
        collapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
      />

      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <div className="p-8 lg:p-12">{children}</div>
      </main>
    </div>
  );
}
