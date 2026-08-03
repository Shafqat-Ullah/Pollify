import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const successMessage = location.state?.created
    ? "Account created! Sign in to continue."
    : location.state?.verified
      ? "Email verified! You can now sign in."
      : location.state?.passwordUpdated
        ? "Password updated! Sign in with your new password."
        : null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      if (err.response?.status === 403) {
        navigate("/verify-otp", { state: { email: form.email, fromLogin: true } });
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen lg:grid lg:grid-cols-2 animate-fade-in">
      {/* Left Panel — Branding */}
      <div className="relative flex flex-col justify-center px-12 py-16 bg-zinc-900 overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 space-y-6">
          {/* Logo */}
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="bgGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#059669"/>
                    <stop offset="100%" stop-color="#10b981"/>
                  </linearGradient>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
                    <stop offset="100%" stop-color="#d1fae5" stop-opacity="0.75"/>
                  </linearGradient>
                </defs>
                <rect width="64" height="64" rx="16" fill="url(#bgGrad)"/>
                <rect width="64" height="64" rx="16" fill="white" fill-opacity="0.06"/>
                <rect x="11" y="38" width="11" height="15" rx="3" fill="url(#barGrad)" fill-opacity="0.6"/>
                <rect x="26.5" y="28" width="11" height="25" rx="3" fill="url(#barGrad)" fill-opacity="0.85"/>
                <rect x="42" y="18" width="11" height="35" rx="3" fill="url(#barGrad)"/>
                <circle cx="47.5" cy="14" r="2.5" fill="white" fill-opacity="0.9"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Pollify</span>
          </div>

          <div className="space-y-3">
            {/* Live badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live community
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight">
              Every opinion <br />deserves to be <br /><span className="text-emerald-400">counted</span>
            </h1>

            {/* Description */}
            <p className="text-zinc-400 text-base leading-relaxed max-w-xs">
              Create polls in seconds, collect votes instantly, and discover what your community truly thinks.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3 space-y-1.5">
              <p className="text-white font-bold text-lg leading-none">50K+</p>
              <p className="text-zinc-500 text-[11px] leading-tight">Community members</p>
            </div>
            <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3 space-y-1.5">
              <p className="text-white font-bold text-lg leading-none">2M+</p>
              <p className="text-zinc-500 text-[11px] leading-tight">Votes cast</p>
            </div>
            <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3 space-y-1.5">
              <p className="text-white font-bold text-lg leading-none">500K+</p>
              <p className="text-zinc-500 text-[11px] leading-tight">Polls created</p>
            </div>
          </div>

          {/* Footer */}
          <p className="relative text-zinc-600 text-xs">
            &copy; {new Date().getFullYear()} Pollify &middot; Made for the community
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex items-center justify-center px-6 py-12 bg-zinc-950">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="bgGradM" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#059669"/>
                    <stop offset="100%" stop-color="#10b981"/>
                  </linearGradient>
                  <linearGradient id="barGradM" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
                    <stop offset="100%" stop-color="#d1fae5" stop-opacity="0.75"/>
                  </linearGradient>
                </defs>
                <rect width="64" height="64" rx="16" fill="url(#bgGradM)"/>
                <rect width="64" height="64" rx="16" fill="white" fill-opacity="0.06"/>
                <rect x="11" y="38" width="11" height="15" rx="3" fill="url(#barGradM)" fill-opacity="0.6"/>
                <rect x="26.5" y="28" width="11" height="25" rx="3" fill="url(#barGradM)" fill-opacity="0.85"/>
                <rect x="42" y="18" width="11" height="35" rx="3" fill="url(#barGradM)"/>
                <circle cx="47.5" cy="14" r="2.5" fill="white" fill-opacity="0.9"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Pollify</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Welcome back</h1>
            <p className="text-zinc-400 mt-2 text-sm leading-relaxed">Sign in to your Pollify account.</p>
          </div>

          {/* Success notice */}
          {successMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20 p-3">
              <CheckCircle2 className="text-emerald-400 mt-0.5 shrink-0" size={16} />
              <p className="text-emerald-300 text-xs font-medium">{successMessage}</p>
            </div>
          )}

          {/* Error notice */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-rose-500/15 border border-rose-500/30 p-3">
              <XCircle className="text-rose-400 mt-0.5 shrink-0" size={16} />
              <p className="text-rose-300 text-xs font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1.5">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full h-10 rounded-xl bg-zinc-900/70 border border-zinc-800 px-3 pr-11 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/12 text-sm"
                />
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={15} />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-zinc-200">Password</label>
                <Link to="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  name="password"
                  required
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full h-10 rounded-xl bg-zinc-900/70 border border-zinc-800 px-3 pr-11 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
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
                  Signing in...
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  Sign in
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center mt-6 mb-4">
            <div className="flex-1 h-px bg-zinc-700" />
            <span className="px-3 text-xs text-zinc-500">New to Pollify?</span>
            <div className="flex-1 h-px bg-zinc-700" />
          </div>

          {/* Sign up link */}
          <Link
            to="/register"
            className="w-full block text-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Create a free account
          </Link>
        </div>
      </div>
    </div>
  );
}
