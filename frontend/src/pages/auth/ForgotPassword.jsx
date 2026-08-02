import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Mail, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "../../services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      navigate("/verify-forgot-otp", { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen lg:grid lg:grid-cols-2">
      <div className="relative flex flex-col justify-center px-12 py-16 bg-zinc-900 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="relative z-10 space-y-6">
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="bgGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#d1fae5" stopOpacity="0.75" />
                  </linearGradient>
                </defs>
                <rect width="64" height="64" rx="16" fill="url(#bgGrad)" />
                <rect width="64" height="64" rx="16" fill="white" fillOpacity="0.06" />
                <rect x="11" y="38" width="11" height="15" rx="3" fill="url(#barGrad)" fillOpacity="0.6" />
                <rect x="26.5" y="28" width="11" height="25" rx="3" fill="url(#barGrad)" fillOpacity="0.85" />
                <rect x="42" y="18" width="11" height="35" rx="3" fill="url(#barGrad)" />
                <circle cx="47.5" cy="14" r="2.5" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Pollify</span>
          </div>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              No worries
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight">
              Forgot your <br /><span className="text-emerald-400">password</span>?
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed max-w-xs">
              Enter your email and we&apos;ll send you a secure link to reset it.
            </p>
          </div>
          <p className="relative text-zinc-600 text-xs">
            &copy; {new Date().getFullYear()} Pollify &middot; Made for the community
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 bg-zinc-950">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="bgGradM" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient id="barGradM" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#d1fae5" stopOpacity="0.75" />
                  </linearGradient>
                </defs>
                <rect width="64" height="64" rx="16" fill="url(#bgGradM)" />
                <rect width="64" height="64" rx="16" fill="white" fillOpacity="0.06" />
                <rect x="11" y="38" width="11" height="15" rx="3" fill="url(#barGradM)" fillOpacity="0.6" />
                <rect x="26.5" y="28" width="11" height="25" rx="3" fill="url(#barGradM)" fillOpacity="0.85" />
                <rect x="42" y="18" width="11" height="35" rx="3" fill="url(#barGradM)" />
                <circle cx="47.5" cy="14" r="2.5" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Pollify</span>
          </div>

          <div className="mb-8">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
            >
              <ChevronLeft size={14} />
              Back to login
            </button>
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Reset password</h1>
            <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
              Enter your registered email and we&apos;ll send you a reset link.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1.5">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 rounded-xl bg-zinc-900/70 border border-zinc-800 px-3 pr-11 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/12 text-sm"
                />
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={15} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl py-2.5 font-medium transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending link...
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  Send reset link
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
