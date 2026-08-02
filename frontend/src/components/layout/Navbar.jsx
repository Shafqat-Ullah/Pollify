import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, Search, Plus, LogOut, User as UserIcon, LayoutDashboard, Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const navItem = ({ isActive }) =>
  `text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
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
    <header className="sticky top-0 z-40 border-b border-zinc-800/70 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 -ml-2"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to={user ? "/explore" : "/"} className="font-display font-extrabold text-xl tracking-tight shrink-0">
            <span className="text-emerald-400">Poll</span>
            <span className="text-zinc-100">ify</span>
          </Link>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = e.target.search.value.trim();
            if (q) navigate(`/explore?search=${encodeURIComponent(q)}`);
          }}
          className="hidden md:flex flex-1 max-w-md relative"
        >
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            name="search"
            placeholder="Search polls..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors"
          />
        </form>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/polls/create" className="btn-primary text-sm hidden sm:inline-flex">
                <Plus className="w-4 h-4" /> Create Poll
              </Link>
              <Link
                to="/notifications"
                className="relative p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center overflow-hidden ring-2 ring-zinc-700 hover:ring-emerald-500/60 transition-all"
                  aria-label="Account menu"
                >
                  {user.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-white">{user.name?.[0]?.toUpperCase()}</span>
                  )}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-xl p-1.5 animate-fade-in">
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
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl px-4 py-3 space-y-1 animate-fade-in">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = e.target.search.value.trim();
              if (q) navigate(`/explore?search=${encodeURIComponent(q)}`);
              closeAll();
            }}
            className="relative mb-2"
          >
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              name="search"
              placeholder="Search polls..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </form>
          <NavLink to="/explore" className={navItem} onClick={closeAll}>Explore</NavLink>
          {user && (
            <>
              <NavLink to="/dashboard" className={navItem} onClick={closeAll}>Dashboard</NavLink>
              <NavLink to="/polls/create" className={navItem} onClick={closeAll}>Create</NavLink>
              <NavLink to="/my-polls" className={navItem} onClick={closeAll}>My Polls</NavLink>
              <NavLink to="/voted" className={navItem} onClick={closeAll}>Voted</NavLink>
              <NavLink to="/saved" className={navItem} onClick={closeAll}>Saved</NavLink>
              <NavLink to={`/profile/${user.username}`} className={navItem} onClick={closeAll}>Profile</NavLink>
              <Link to="/polls/create" className="btn-primary text-sm w-full mt-2" onClick={closeAll}>
                <Plus className="w-4 h-4" /> Create Poll
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
