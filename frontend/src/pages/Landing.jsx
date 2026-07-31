import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Users, Zap, Flame, MessageCircle, Eye } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const liveOptions = [
  { label: "Ship it Friday", pct: 62 },
  { label: "Wait for Monday", pct: 38 },
];

export default function Landing() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/explore" replace />;

  return (
    <div className="space-y-24">
      <section className="grid lg:grid-cols-2 gap-12 items-center pt-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold tracking-wide mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live real-time voting
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight mb-5">
            Ask your community.
            <br />
            <span className="text-emerald-400">Watch it decide.</span>
          </h1>
          <p className="text-zinc-400 text-lg mb-8 max-w-md">
            Pollify turns any question into a live, real-time vote — with results, discussion, and trends,
            all in one place.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link to="/register" className="btn-primary">
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary">Log in</Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-card-hover p-6"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-zinc-500">Live poll · 1,204 votes</p>
            <span className="chip bg-rose-500/10 text-rose-400 border border-rose-500/25">
              <Flame className="w-3 h-3" /> Trending
            </span>
          </div>
          <h3 className="font-display font-semibold text-lg mb-4">Do we ship the feature this week?</h3>
          <div className="space-y-3">
            {liveOptions.map((opt) => (
              <div key={opt.label} className="relative rounded-xl border border-zinc-800 bg-zinc-800/50 p-3.5 overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-emerald-500/15"
                  initial={{ width: 0 }}
                  animate={{ width: `${opt.pct}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                />
                <div className="relative flex justify-between text-sm">
                  <span className="text-zinc-200">{opt.label}</span>
                  <span className="font-semibold text-emerald-400">{opt.pct}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 pt-4 mt-4 border-t border-zinc-800 text-xs text-zinc-500">
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 3.1k views</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> 142 comments</span>
            <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> 82% response</span>
          </div>
        </motion.div>
      </section>

      <section className="grid sm:grid-cols-3 gap-6">
        {[
          { icon: Zap, title: "Real-time results", desc: "Watch percentages animate as votes land, no refresh needed." },
          { icon: Users, title: "Built for community", desc: "Comment, follow, and see what people you follow are voting on." },
          { icon: BarChart3, title: "Real analytics", desc: "Track engagement and performance on every poll you create." },
        ].map((f) => (
          <div key={f.title} className="glass-card-hover p-6">
            <div className="icon-chip mb-4">
              <f.icon className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold mb-1.5">{f.title}</h3>
            <p className="text-sm text-zinc-400">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
