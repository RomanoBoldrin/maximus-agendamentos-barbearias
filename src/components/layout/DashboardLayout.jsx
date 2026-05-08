import { useState } from "react";

import DashboardSidebar from "@/components/ui/dashboard/DashboardSidebar";
import DashboardTopbar from "@/components/ui/dashboard/DashboardTopbar";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  function toggleSidebar() {
    setCollapsed((currentCollapsed) => !currentCollapsed);
  }

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <DashboardSidebar collapsed={collapsed} />

      <DashboardTopbar collapsed={collapsed} onToggleSidebar={toggleSidebar} />

      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
