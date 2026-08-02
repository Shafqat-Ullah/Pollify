import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../contexts/AuthContext";

export default function MainLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[480px] h-[480px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-56 w-[420px] h-[420px] rounded-full bg-teal-500/8 blur-3xl" />
        <div className="absolute -bottom-64 left-1/3 w-[520px] h-[520px] rounded-full bg-emerald-600/6 blur-3xl" />
      </div>
      <Navbar />
      <div className="relative max-w-7xl mx-auto flex gap-8 px-4">
        {user && (
          <aside className="hidden lg:block w-52 shrink-0 sticky top-20 h-[calc(100vh-5rem)] py-5 overflow-y-auto">
            <Sidebar />
          </aside>
        )}
        <main className="flex-1 min-w-0 py-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
