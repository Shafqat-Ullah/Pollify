import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../contexts/AuthContext";

export default function MainLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex gap-5 xl:gap-6">
        {user && (
          <aside className="hidden lg:flex flex-col w-52 shrink-0 sticky top-14 self-start h-[calc(100vh-3.5rem)] py-6 pr-1">
            <Sidebar />
          </aside>
        )}
        <main className="flex-1 min-w-0 py-5 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
