import { Link } from "react-router-dom";
import { BarChart3, MessageCircle, Heart, Lock } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ["emerald", "sky", "violet", "amber", "rose", "teal"];

const BAR_COLORS = {
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  teal: "bg-teal-500",
};

const TAG_COLORS = {
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  sky: "bg-sky-500/10 text-sky-400 border-sky-500/25",
  violet: "bg-violet-500/10 text-violet-400 border-violet-500/25",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  rose: "bg-rose-500/10 text-rose-400 border-rose-500/25",
  teal: "bg-teal-500/10 text-teal-400 border-teal-500/25",
};

function categoryColor(category) {
  const key = category?.slug || category?.name || "";
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return COLORS[hash % COLORS.length];
}

function timeAgo(date) {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(date).toLocaleDateString();
}

export default function PollCard({ poll }) {
  const author = poll.author || {};
  const category = poll.category;
  const color = categoryColor(category);
  const barColor = BAR_COLORS[color] || BAR_COLORS.emerald;
  const tagColor = TAG_COLORS[color] || TAG_COLORS.emerald;

  const closed = poll.status === "closed" || (poll.expiresAt && new Date(poll.expiresAt) < new Date());
  const total = poll.totalVotes || 0;

  const topOptions = [...(poll.options || [])]
    .sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0))
    .slice(0, 2)
    .map((o) => ({
      key: o._id || o.text,
      text: o.text,
      pct: total > 0 ? Math.round(((o.votesCount || 0) / total) * 100) : 0,
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl overflow-hidden transition-all hover:border-zinc-700/80 hover:bg-zinc-900"
    >
      <div className={`h-px ${barColor}`} />

      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Link
            to={`/profile/${author.username}`}
            className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-xs overflow-hidden shrink-0"
          >
            {author.avatar?.url ? (
              <img src={author.avatar.url} alt={author.name} className="w-full h-full object-cover" />
            ) : (
              author.name?.[0]?.toUpperCase() || "P"
            )}
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to={`/profile/${author.username}`}
                className="text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
              >
                {author.name || "Anonymous"}
              </Link>
              <span className="text-zinc-700 text-xs">·</span>
              <span className="text-xs text-zinc-600">@{author.username}</span>
              <span className="text-zinc-700 text-xs">·</span>
              <span className="text-xs text-zinc-700">{timeAgo(poll.createdAt)}</span>
            </div>
          </div>

          {closed && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/15 text-rose-500 px-2 py-0.5 text-[10px] font-semibold shrink-0">
              <Lock size={9} /> Closed
            </span>
          )}

          {category?.name && (
            <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-semibold shrink-0 ${tagColor}`}>
              {category.name}
            </span>
          )}
        </div>

        <Link to={`/polls/${poll._id}`}>
          <h2 className="text-[15px] font-semibold text-zinc-100 mb-1 leading-snug hover:text-zinc-50 transition-colors line-clamp-2">
            {poll.title}
          </h2>
          {poll.description && (
            <p className="text-xs text-zinc-500 mb-3 leading-relaxed line-clamp-2">{poll.description}</p>
          )}

          {topOptions.length > 0 && (
            <div className="space-y-2 mb-1">
              {topOptions.map((o) => (
                <div
                  key={o.key}
                  className="relative h-9 rounded-xl bg-zinc-800/60 overflow-hidden"
                >
                  <motion.div
                    className={`absolute inset-y-0 left-0 ${barColor} opacity-15`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${o.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                  <div className="relative flex items-center justify-between gap-3 px-3 h-full">
                    <span className="text-xs text-zinc-300 truncate">{o.text}</span>
                    <span className="text-xs font-semibold text-zinc-200 shrink-0 tabular-nums">{o.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Link>

        <div className="flex items-center gap-0.5 mt-3 pt-3 border-t border-zinc-800/60">
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/8 text-emerald-500 px-2.5 py-1.5 text-xs font-semibold mr-1">
            <BarChart3 size={14} /> {total}
          </span>
          <Link
            to={`/polls/${poll._id}`}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <MessageCircle size={14} /> {poll.commentsCount ?? 0}
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600">
            <Heart size={14} /> {poll.likesCount ?? 0}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
