import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Users, Zap } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const liveOptions = [
  { label: "Ship it Friday", pct: 62 },
  { label: "Wait for Monday", pct: 38 },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="space-y-24">
      <section className="grid lg:grid-cols-2 gap-12 items-center pt-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight mb-5">
            Ask your community.<br />
            <span className="text-emerald-400">Watch it decide.</span>
          </h1>
          <p className="text-muted text-lg mb-8 max-w-md">
            Pollify turns any question into a live, real-time vote — with results, discussion, and trends,
            all in one place.
          </p>
          <div className="flex gap-3">
            <Link to={user ? "/explore" : "/register"} className="btn-primary">
              {user ? "Explore polls" : "Get started free"} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/explore" className="btn-secondary">Browse polls</Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6"
        >
          <p className="text-xs text-muted mb-1">Live poll · 1,204 votes</p>
          <h3 className="font-display font-semibold text-lg mb-4">Do we ship the feature this week?</h3>
          <div className="space-y-3">
            {liveOptions.map((opt) => (
              <div key={opt.label} className="relative rounded-xl border border-border p-3.5 overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary/15"
                  initial={{ width: 0 }}
                  animate={{ width: `${opt.pct}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                />
                <div className="relative flex justify-between text-sm">
                  <span>{opt.label}</span>
                  <span className="font-semibold text-primary">{opt.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="grid sm:grid-cols-3 gap-6">
        {[
          { icon: Zap, title: "Real-time results", desc: "Watch percentages animate as votes land, no refresh needed." },
          { icon: Users, title: "Built for community", desc: "Comment, follow, and see what people you follow are voting on." },
          { icon: BarChart3, title: "Real analytics", desc: "Track engagement and performance on every poll you create." },
        ].map((f) => (
          <div key={f.title} className="glass-card p-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <f.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display font-semibold mb-1.5">{f.title}</h3>
            <p className="text-sm text-muted">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
