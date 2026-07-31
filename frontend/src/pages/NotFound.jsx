import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-display font-extrabold text-7xl text-emerald-400 mb-2">404</p>
      <h1 className="font-display font-semibold text-xl mb-2">This page doesn't exist</h1>
      <p className="text-muted text-sm mb-6 max-w-sm">
        The poll or page you're looking for may have been moved or deleted.
      </p>
      <Link to="/" className="btn-primary">
        <Compass className="w-4 h-4" /> Back to home
      </Link>
    </div>
  );
}
