import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, Search, SquarePen, LogOut, User as UserIcon, LayoutDashboard, Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const navItem = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeAll = () => {
    setMenuOpen(false);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 -ml-2"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 shrink-0 group">
          <img
            src="/favicon.svg"
            alt="Pollify logo"
            className="w-8 h-8 rounded-lg shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-105"
          />
          <span className="hidden sm:block text-[15px] font-bold text-white tracking-tight">
            Pollify
          </span>
        </Link>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = e.target.search.value.trim();
            if (q) navigate(`/explore?search=${encodeURIComponent(q)}`);
          }}
          className="hidden md:flex flex-1 max-w-md mx-auto relative"
        >
          <Search className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            name="search"
            placeholder="Search polls…"
            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-8 pr-4 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-all hover:border-zinc-700 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
        </form>

        <div className="flex items-center gap-1.5 ml-auto md:ml-0 shrink-0">
          {user ? (
            <>
              <Link
                to="/polls/create"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 text-white px-3.5 py-2 text-sm font-semibold hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/25"
              >
                <SquarePen size={15} /> Create
              </Link>
              <Link
                to="/notifications"
                className="relative grid place-items-center w-8 h-8 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={16} />
              </Link>
              <div className="relative shrink-0">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center overflow-hidden ring-1 ring-zinc-700 hover:ring-emerald-500/60 transition-all"
                  aria-label="Account menu"
                >
                  {user.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-white">{user.name?.[0]?.toUpperCase()}</span>
                  )}
                </button>
                {menuOpen && (
                  <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-14 sm:top-full mt-0 sm:mt-2 w-auto sm:w-52 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/40 p-1.5 animate-fade-in">
                    <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                      <p className="text-sm font-semibold text-zinc-100 truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 truncate">@{user.username}</p>
                    </div>
                    <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-100 hover:bg-zinc-800 transition-colors" onClick={closeAll}>
                      <LayoutDashboard className="w-4 h-4 text-zinc-400" /> Dashboard
                    </Link>
                    <Link to={`/profile/${user.username}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-100 hover:bg-zinc-800 transition-colors" onClick={closeAll}>
                      <UserIcon className="w-4 h-4 text-zinc-400" /> Profile
                    </Link>
                    {user.role === "admin" && (
                      <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-100 hover:bg-zinc-800 transition-colors" onClick={closeAll}>
                        <Shield className="w-4 h-4 text-zinc-400" /> Admin panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        closeAll();
                        logout();
                        navigate("/");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-zinc-800 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">Log in</Link>
              <Link to="/register" className="btn-primary text-sm">Sign up</Link>
            </>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-zinc-800/60 bg-zinc-950/95 backdrop-blur-xl px-4 py-3 space-y-1 animate-fade-in">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = e.target.search.value.trim();
              if (q) navigate(`/explore?search=${encodeURIComponent(q)}`);
              closeAll();
            }}
            className="relative mb-2"
          >
            <Search className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              name="search"
              placeholder="Search polls…"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-8 pr-4 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-all hover:border-zinc-700 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
            />
          </form>
          {user ? (
            <>
              <NavLink to="/dashboard" className={navItem} onClick={closeAll}>Dashboard</NavLink>
              <NavLink to="/polls/create" className={navItem} onClick={closeAll}>Create</NavLink>
              <NavLink to="/my-polls" className={navItem} onClick={closeAll}>My Polls</NavLink>
              <NavLink to="/voted" className={navItem} onClick={closeAll}>Voted</NavLink>
              <NavLink to="/saved" className={navItem} onClick={closeAll}>Saved</NavLink>
              <NavLink to={`/profile/${user.username}`} className={navItem} onClick={closeAll}>Profile</NavLink>
              <Link to="/polls/create" className="btn-primary text-sm w-full mt-2" onClick={closeAll}>
                <SquarePen className="w-4 h-4" /> Create Poll
              </Link>
            </>
          ) : (
            <NavLink to="/explore" className={navItem} onClick={closeAll}>Explore</NavLink>
          )}
        </div>
      )}
    </header>
  );
}
