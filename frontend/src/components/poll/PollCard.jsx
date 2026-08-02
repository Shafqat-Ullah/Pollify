import { useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, MessageCircle, Heart, Lock, Pencil, RotateCcw, Trash2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { CATEGORIES } from "../../constants";

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

export default function PollCard({
  poll,
  owner = false,
  onVote,
  onUnvote,
  onEdit,
  onClose,
  onDelete,
}) {
  const author = poll.author || {};
  const category = poll.category;
  const color = categoryColor(category);
  const barColor = BAR_COLORS[color] || BAR_COLORS.emerald;
  const tagColor = TAG_COLORS[color] || TAG_COLORS.emerald;

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("General");
  const [busy, setBusy] = useState(false);

  const closed = poll.status === "closed" || (poll.expiresAt && new Date(poll.expiresAt) < new Date());
  const total = poll.totalVotes || 0;
  const myVote = Array.isArray(poll.myVote) ? poll.myVote.map((id) => String(id)) : null;
  const voted = !!myVote && myVote.length > 0;
  const canUndo = voted && !!onUnvote && !closed;
  const interactive = !voted && !!onVote && !closed;

  const options = [...(poll.options || [])].sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));

  const startEdit = () => {
    setEditTitle(poll.title || "");
    setEditCategory(category?.name || "General");
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!editTitle.trim() || !onEdit) return;
    setBusy(true);
    try {
      await onEdit(poll._id, { title: editTitle.trim(), category: editCategory });
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const handleOptionClick = (opt) => {
    if (voted && canUndo && myVote.includes(String(opt._id))) {
      onUnvote(poll._id);
    } else if (interactive) {
      onVote(poll._id, [opt._id]);
    }
  };

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

        {/* Owner controls */}
        {owner && !editing && (
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <button
              onClick={startEdit}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Pencil size={11} /> Edit
            </button>
            <Link
              to={`/polls/${poll._id}/analytics`}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <BarChart3 size={11} /> Analytics
            </Link>
            {onClose && (
              <button
                onClick={() => onClose(poll._id)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
              >
                {closed ? <RotateCcw size={11} /> : <Lock size={11} />} {closed ? "Reopen" : "Close"}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(poll._id)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors ml-auto"
              >
                <Trash2 size={11} /> Delete
              </button>
            )}
          </div>
        )}

        {/* Inline edit */}
        {editing ? (
          <div className="mb-3 space-y-2">
            <textarea
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              rows={2}
              className="w-full rounded-xl bg-zinc-800/60 border border-zinc-700/60 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500/60"
            />
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full rounded-xl bg-zinc-800/60 border border-zinc-700/60 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500/60"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-zinc-900">
                  {c}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                disabled={busy}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold hover:bg-emerald-400 disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1 rounded-xl bg-zinc-800 text-zinc-400 px-3 py-1.5 text-xs font-semibold hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <Link to={`/polls/${poll._id}`}>
            <h2 className="text-[15px] font-semibold text-zinc-100 mb-1 leading-snug hover:text-zinc-50 transition-colors line-clamp-2">
              {poll.title}
            </h2>
            {poll.description && (
              <p className="text-xs text-zinc-500 mb-3 leading-relaxed line-clamp-2">{poll.description}</p>
            )}
          </Link>
        )}

        {/* Vote bars */}
        {options.length > 0 && (
          <div className="space-y-2 mb-1">
            {options.map((o) => {
              const pct = total > 0 ? Math.round(((o.votesCount || 0) / total) * 100) : 0;
              const mine = voted && myVote.includes(String(o._id));
              const clickable = (interactive && !voted) || (mine && canUndo);
              return (
                <div
                  key={o._id || o.text}
                  onClick={() => handleOptionClick(o)}
                  className={`relative h-9 rounded-xl bg-zinc-800/60 overflow-hidden ${clickable ? "cursor-pointer hover:bg-zinc-800" : ""} ${mine ? "ring-1 ring-emerald-500/40" : ""}`}
                >
                  <motion.div
                    className={`absolute inset-y-0 left-0 ${barColor} opacity-15`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                  <div className="relative flex items-center justify-between gap-3 px-3 h-full">
                    <span className="text-xs text-zinc-300 truncate flex items-center gap-1.5">
                      {mine && <CheckCircle size={12} className="text-emerald-400 shrink-0" />}
                      <span className={mine ? "text-emerald-300 font-semibold" : ""}>
                        {o.text || (o.image?.url ? "Image" : "Option")}
                      </span>
                    </span>
                    <span className={`text-xs font-semibold shrink-0 tabular-nums flex items-center gap-1.5 ${mine ? "text-emerald-300" : "text-zinc-200"}`}>
                      {mine && canUndo && (
                        <span className="text-[10px] font-normal text-zinc-500">(you · click to undo)</span>
                      )}
                      {mine && !canUndo && <span className="text-[10px] font-normal text-zinc-500">(you)</span>}
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-0.5 mt-3 pt-3 border-t border-zinc-800/60">
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/8 text-emerald-500 px-2.5 py-1.5 text-xs font-semibold mr-1">
            <BarChart3 size={14} /> {total} {total === 1 ? "vote" : "votes"}
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
