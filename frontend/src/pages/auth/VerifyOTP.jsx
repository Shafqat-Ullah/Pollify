import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "../../services/authService";

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;
  const email = state?.email;
  const isRegistration = state?.name && state?.username && state?.password;
  const fromLogin = state?.fromLogin;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) navigate(fromLogin ? "/login" : "/register", { replace: true });
  }, [email, navigate, fromLogin]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      if (isRegistration) {
        await authService.verifyEmail({ ...state, otp: code });
        toast.success("Account created! You can now log in.");
        navigate("/login", { replace: true });
      } else if (fromLogin) {
        await authService.verifyEmail({ email, otp: code });
        toast.success("Email verified! You can now log in.");
        navigate("/login", { replace: true });
      } else {
        const res = await authService.verifyForgotOtp({ email, otp: code });
        const resetToken = res.data?.resetToken;
        navigate("/reset-password", { state: { email, resetToken }, replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const type = isRegistration || fromLogin ? "registration" : "forgot-password";
      await authService.resendOtp({ email, type });
      toast.success("A new code has been sent to your email.");
      setResendCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend code.");
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
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
              Almost there
            </div>

            <h1 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight">
              One last step <br />to <span className="text-emerald-400">verify</span> your email
            </h1>

            <p className="text-zinc-400 text-base leading-relaxed max-w-xs">
              We sent a 6-digit code to your inbox. Enter it below to activate your account.
            </p>
          </div>

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

          <div className="mb-8">
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Check your inbox</h1>
            <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
              We sent a 6-digit code to verify your email address.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-zinc-900/70 border border-zinc-800 p-3 mb-6">
            <Mail className="text-emerald-400 shrink-0" size={18} />
            <span className="text-sm text-zinc-300 font-medium">{email}</span>
          </div>

          <div className="space-y-6">
            <p className="text-sm font-medium text-zinc-200">Verification code</p>
            <div className="flex justify-center gap-2.5">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-12 text-center text-lg font-bold text-white bg-zinc-900/70 border border-zinc-700 rounded-xl outline-none transition-all focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/12"
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl py-2.5 font-medium transition-all disabled:opacity-40 disabled:pointer-events-none mt-6"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying...
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                Verify email
                <ArrowRight size={16} />
              </span>
            )}
          </button>

          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors disabled:text-zinc-600 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Resend code"}
            </button>
          </div>

          <div className="flex items-center justify-center mt-4">
            <Link
              to={isRegistration ? "/register" : fromLogin ? "/login" : "/forgot-password"}
              className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ChevronLeft size={14} />
              {isRegistration ? "Wrong email? Go back" : fromLogin ? "Back to login" : "Back to forgot password"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
