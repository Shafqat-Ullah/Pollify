import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Camera, Eye, EyeOff, Mail, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { authService } from "../../services/authService";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores only"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/\d/, "Must contain a number"),
});

export default function Register() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({ resolver: zodResolver(schema) });

  const nameValue = watch("name");

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await authService.register(values);
      toast.success("Account created! You can now sign in.");
      navigate("/login", { state: { created: true } });
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
              Join the community
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight">
              Every voice <br />deserves to be <br /><span className="text-emerald-400">heard</span>
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed max-w-xs">
              Sign up and start creating polls, collecting votes, and uncovering what your community truly thinks.
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
          <p className="relative text-zinc-600 text-xs">&copy; {new Date().getFullYear()} Pollify &middot; Made for the community</p>
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
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Create account</h1>
            <p className="text-zinc-400 mt-2 text-sm leading-relaxed">Join thousands of people shaping opinions.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-3xl font-bold text-zinc-400 overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : nameValue ? (
                    <span className="text-emerald-400">{nameValue[0].toUpperCase()}</span>
                  ) : (
                    <User size={32} className="text-zinc-500" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-colors shadow-lg"
                >
                  <Camera size={13} className="text-white" />
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarSelect}
                accept="image/*"
                className="hidden"
              />
              <p className="text-xs text-zinc-500 mt-2">Profile picture (optional)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1.5">Full name</label>
              <input
                type="text"
                placeholder="John Doe"
                {...registerField("name")}
                className={`w-full h-10 rounded-xl bg-zinc-900/70 border px-3 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/12 text-sm ${errors.name ? "border-rose-500/60" : "border-zinc-800"}`}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1.5">Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...registerField("email")}
                  className={`w-full h-10 rounded-xl bg-zinc-900/70 border px-3 pr-11 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/12 text-sm ${errors.email ? "border-rose-500/60" : "border-zinc-800"}`}
                />
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={15} />
              </div>
              {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1.5">Username</label>
              <input
                type="text"
                placeholder="johndoe"
                {...registerField("username")}
                className={`w-full h-10 rounded-xl bg-zinc-900/70 border px-3 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/12 text-sm ${errors.username ? "border-rose-500/60" : "border-zinc-800"}`}
              />
              {errors.username && <p className="mt-1 text-xs text-rose-400">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  {...registerField("password")}
                  className={`w-full h-10 rounded-xl bg-zinc-900/70 border px-3 pr-11 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/12 text-sm ${errors.password ? "border-rose-500/60" : "border-zinc-800"}`}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>}
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-emerald-400 hover:text-emerald-300 transition-colors">Terms of Service</Link>.
            </p>

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
                  Creating account...
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  Create account
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <div className="flex items-center mt-6 mb-4">
            <div className="flex-1 h-px bg-zinc-700" />
            <span className="px-3 text-xs text-zinc-500">Already registered?</span>
            <div className="flex-1 h-px bg-zinc-700" />
          </div>

          <Link
            to="/login"
            className="w-full block text-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
