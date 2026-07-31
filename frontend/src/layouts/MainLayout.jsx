import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[480px] h-[480px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-56 w-[420px] h-[420px] rounded-full bg-teal-500/8 blur-3xl" />
        <div className="absolute -bottom-64 left-1/3 w-[520px] h-[520px] rounded-full bg-emerald-600/6 blur-3xl" />
      </div>
      <Navbar />
      <main className="relative max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
