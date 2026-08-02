import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "../../services/authService";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const resetToken = location.state?.resetToken;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resetToken) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (!/\d/.test(password)) {
      toast.error("Password must contain at least one number.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword({ token: resetToken, password });
      setDone(true);
      toast.success("Password reset successfully!");
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors?.length) {
        toast.error(fieldErrors.map((e) => e.message).join(" "));
      } else {
        toast.error(err.response?.data?.message || "Something went wrong.");
      }
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
              Secure reset
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight">
              Choose a new <br /><span className="text-emerald-400">password</span>
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed max-w-xs">
              Make sure your new password is strong and unique.
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
                <rect x="11" y="38" width="11" height="15" rx="3" fill="url(#bgGradM)" fillOpacity="0.6" />
                <rect x="26.5" y="28" width="11" height="25" rx="3" fill="url(#bgGradM)" fillOpacity="0.85" />
                <rect x="42" y="18" width="11" height="35" rx="3" fill="url(#bgGradM)" />
                <circle cx="47.5" cy="14" r="2.5" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Pollify</span>
          </div>

          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                <svg className="text-emerald-400" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h1 className="text-[24px] font-bold text-white tracking-tight mb-2">Password reset!</h1>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                Your password has been updated. Sign in with your new password.
              </p>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl py-2.5 font-medium transition-all"
              >
                Sign in
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : !resetToken ? (
            <div className="text-center">
              <h1 className="text-[24px] font-bold text-white tracking-tight mb-2">Invalid link</h1>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                This reset link is invalid or has expired. Request a new one.
              </p>
              <Link
                to="/forgot-password"
                className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm"
              >
                Request new reset link
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
                >
                  <ChevronLeft size={14} />
                  Back to login
                </button>
                <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Enter your new password</h1>
                <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
                  Choose a strong password and confirm it below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="Min. 8 chars, must include a number"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-1.5">Confirm password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full h-10 rounded-xl bg-zinc-900/70 border border-zinc-800 px-3 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/12 text-sm"
                  />
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
                      Resetting...
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2">
                      Reset password
                      <ArrowRight size={16} />
                    </span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
