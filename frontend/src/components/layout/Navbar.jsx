import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, Plus, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="font-display font-extrabold text-xl text-emerald-400 shrink-0 tracking-tight">
          Pollify
        </Link>

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
              <Link to="/notifications" className="relative p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors">
                <Bell className="w-5 h-5" />
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center overflow-hidden ring-2 ring-zinc-800"
                >
                  {user.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-white">{user.name?.[0]?.toUpperCase()}</span>
                  )}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-xl p-1.5 animate-fade-in">
                    <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-100 hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                      <UserIcon className="w-4 h-4 text-zinc-400" /> Dashboard
                    </Link>
                    <Link to={`/profile/${user.username}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-100 hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                      <UserIcon className="w-4 h-4 text-zinc-400" /> Profile
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
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
    </header>
  );
}
