import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  SquarePen,
  PenLine,
  CheckCircle2,
  Bookmark,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: "/polls/create", label: "Create", Icon: SquarePen },
  { to: "/my-polls", label: "My Polls", Icon: PenLine },
  { to: "/voted", label: "Voted", Icon: CheckCircle2 },
  { to: "/saved", label: "Saved", Icon: Bookmark },
];

const base = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border border-transparent";
const active = "bg-emerald-500/10 text-emerald-400 font-semibold border-emerald-500/20";
const idle = "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="flex flex-col h-full">
      <p className="px-3 mb-2 text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Menu</p>
      <div className="space-y-0.5 flex-1">
        {links.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `${base} ${isActive ? active : idle}`}
          >
            <Icon size={16} className="shrink-0" />
            {label}
          </NavLink>
        ))}
        {user?.role === "admin" && (
          <NavLink to="/admin" className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
            <Shield size={16} className="shrink-0" /> Admin
          </NavLink>
        )}
      </div>

      <div className="pt-4 border-t border-zinc-800/60 space-y-0.5">
        <NavLink to="/settings" className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
          <Settings size={16} className="shrink-0" /> Settings
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/8 hover:text-rose-400 transition-colors"
        >
          <LogOut size={16} className="shrink-0" /> Log out
        </button>
      </div>
    </nav>
  );
}
