import { Link } from "react-router-dom";
import { Heart, MessageCircle, BarChart3, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_STYLES = {
  published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  draft: "bg-zinc-500/10 text-zinc-400 border-zinc-500/25",
  closed: "bg-rose-500/10 text-rose-400 border-rose-500/25",
  ended: "bg-rose-500/10 text-rose-400 border-rose-500/25",
};

export default function PollCard({ poll }) {
  const status = poll.status || (poll.expiresAt && new Date(poll.expiresAt) < new Date() ? "ended" : "published");
  const timeLeft = poll.expiresAt ? (
    new Date(poll.expiresAt) > new Date() ? `Ends ${new Date(poll.expiresAt).toLocaleDateString()}` : "Ended"
  ) : null;

  const total = poll.totalVotes || 0;
  const topOptions = [...(poll.options || [])]
    .sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0))
    .slice(0, 2)
    .map((o) => ({
      text: o.text,
      pct: total > 0 ? Math.round(((o.votesCount || 0) / total) * 100) : 0,
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-hover p-5 group"
    >
      <Link to={`/polls/${poll._id}`} className="block">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {poll.category && (
            <span className="chip bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              {poll.category.name}
            </span>
          )}
          {timeLeft && (
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timeLeft}
            </span>
          )}
          {status !== "published" && (
            <span className={`chip capitalize ${STATUS_STYLES[status] || STATUS_STYLES.published}`}>{status}</span>
          )}
        </div>

        <h3 className="font-display font-semibold text-base mb-1.5 group-hover:text-emerald-400 transition-colors line-clamp-2">
          {poll.title}
        </h3>
        {poll.description && (
          <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{poll.description}</p>
        )}

        {topOptions.length > 0 && (
          <div className="space-y-2 mb-4">
            {topOptions.map((o) => (
              <div key={o.text} className="relative rounded-lg bg-zinc-800/60 border border-zinc-800 px-3 py-2 overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-emerald-500/15"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${o.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
                <div className="relative flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-zinc-300">{o.text}</span>
                  <span className="font-semibold text-emerald-400 shrink-0">{o.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" /> {total} votes
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> {poll.likesCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> {poll.commentsCount}
            </span>
          </div>
          {!poll.isAnonymous && poll.author && (
            <span className="truncate max-w-[110px] flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" /> @{poll.author.username}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
