import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  Network,
  DollarSign,
  BarChart2,
  LogOut,
  UserCircle,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Dashboard() {
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orgMenuOpen, setOrgMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#545386] text-white flex flex-col justify-between">
        <nav className="p-6 space-y-4">
          <div className="text-2xl font-bold mb-6">EliTech</div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm hover:text-yellow-300"
          >
            <Home size={18} /> {t("sidebar.home")}
          </button>
          <button
            onClick={() => navigate("/dashboard/team")}
            className="flex items-center gap-2 text-sm hover:text-yellow-300"
          >
            <Users size={18} /> {t("sidebar.team")}
          </button>
          <div>
            <button
              onClick={() => setOrgMenuOpen((open) => !open)}
              className="flex items-center gap-2 text-sm hover:text-yellow-300 w-full"
            >
              <Network size={18} /> {t("sidebar.org")}
              {orgMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {orgMenuOpen && (
              <div className="ml-6 mt-2 flex flex-col gap-1">
                <button onClick={() => navigate("/dashboard/org/global")} className="text-left hover:text-yellow-300 text-sm font-sans">Global</button>
                <button onClick={() => navigate("/dashboard/org/holding")} className="text-left hover:text-yellow-300 text-sm font-sans">Holding</button>
                <button onClick={() => navigate("/dashboard/org/northamerica")} className="text-left hover:text-yellow-300 text-sm font-sans">North America</button>
                <button onClick={() => navigate("/dashboard/org/kenya")} className="text-left hover:text-yellow-300 text-sm font-sans">Kenya</button>
                <button onClick={() => navigate("/dashboard/org/colombia")} className="text-left hover:text-yellow-300 text-sm font-sans">Colombia</button>
                <button onClick={() => navigate("/dashboard/org/ecuador")} className="text-left hover:text-yellow-300 text-sm font-sans">Ecuador</button>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("/dashboard/costos")}
            className="flex items-center gap-2 text-sm hover:text-yellow-300"
          >
            <DollarSign size={18} /> {t("sidebar.costs")}
          </button>
          <button
            onClick={() => navigate("/dashboard/kpis")}
            className="flex items-center gap-2 text-sm hover:text-yellow-300"
          >
            <BarChart2 size={18} /> {t("sidebar.kpis")}
          </button>
          <button
            onClick={() => navigate("/dashboard/member-list")}
            className="flex items-center gap-2 text-sm hover:text-yellow-300"
          >
            <Users size={18} /> Member List
          </button>
        </nav>
        <div className="p-6 border-t border-gray-700 text-sm">
          <div className="mb-2">
            <span className="block font-semibold">{user?.name}</span>
            <span className="text-gray-300 text-xs">{user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-300 hover:text-red-200 text-xs"
          >
            <LogOut size={14} /> {t("sidebar.logout")}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-6 py-3 flex justify-between items-center border-b">
          <div className="flex items-center gap-3">
            <UserCircle size={20} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
            >
              <LogOut size={14} /> {t("sidebar.logout")}
            </button>
          </div>
          <LanguageSwitcher />
        </header>

        <main className="flex-1 bg-gray-50 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
