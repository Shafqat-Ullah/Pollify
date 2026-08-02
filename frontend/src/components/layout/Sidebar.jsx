import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  SquarePen,
  PenLine,
  CheckCircle2,
  Bookmark,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const base =
  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors border border-transparent";
const active = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium";
const idle = "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="flex flex-col h-full">
      <p className="text-[10px] uppercase tracking-widest text-zinc-600 px-3 mb-3">Menu</p>
      <div className="space-y-1 flex-1">
        <NavLink to="/dashboard" end className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
          <LayoutDashboard size={17} /> Dashboard
        </NavLink>
        <NavLink to="/explore" className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
          <Compass size={17} /> Explore
        </NavLink>
        <NavLink to="/polls/create" className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
          <SquarePen size={17} /> Create
        </NavLink>
        <NavLink to="/my-polls" className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
          <PenLine size={17} /> My Polls
        </NavLink>
        <NavLink to="/voted" className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
          <CheckCircle2 size={17} /> Voted
        </NavLink>
        <NavLink to="/saved" className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
          <Bookmark size={17} /> Saved
        </NavLink>
        {user?.role === "admin" && (
          <NavLink to="/admin" className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
            <Shield size={17} /> Admin
          </NavLink>
        )}
        <NavLink to="/settings" className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
          <Settings size={17} /> Settings
        </NavLink>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-rose-400 hover:bg-zinc-800/70 hover:text-rose-300 transition-colors mt-4"
      >
        <LogOut size={17} /> Log out
      </button>
    </nav>
  );
}
