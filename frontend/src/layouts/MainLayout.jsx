import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../contexts/AuthContext";

export default function MainLayout() {
  const { user } = useAuth();
  const location = useLocation();

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
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
