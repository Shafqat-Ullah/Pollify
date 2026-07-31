import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="block text-center font-display font-extrabold text-3xl text-emerald-400 mb-8 tracking-tight">
          Pollify
        </Link>
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-xl p-8">
          <Outlet />
        </div>
        <p className="text-center text-xs text-zinc-600 mt-6">&copy; {new Date().getFullYear()} Pollify</p>
      </div>
    </div>
  );
}
