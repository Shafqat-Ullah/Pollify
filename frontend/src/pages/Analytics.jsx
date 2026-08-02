import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, ArrowLeft, Lock, Vote, ListChecks } from "lucide-react";
import { pollService } from "../services/pollService";
import { useAuth } from "../contexts/AuthContext";

const BAR_COLORS = ["bg-emerald-500", "bg-sky-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-teal-500"];

export default function Analytics() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["poll-analytics", id],
    queryFn: () => pollService.get(id),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="glass-card p-6 space-y-3">
          <div className="skeleton h-5 w-32" />
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-14 w-full" />
          <div className="skeleton h-14 w-full" />
        </div>
      </div>
    );
  }

  const poll = data?.data.poll;
  if (!poll) return null;

  const isOwner = user && String(poll.author?._id || poll.author) === String(user._id);
  const total = poll.totalVotes || 0;
  const maxPct = 100;

  const options = [...(poll.options || [])].sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/my-polls"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
      >
        <ArrowLeft size={14} /> Back to my polls
      </Link>

      <div className="glass-card p-6 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
            {poll.category?.name || "General"}
          </span>
          {poll.status === "closed" && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400">
              <Lock size={11} /> Closed
            </span>
          )}
        </div>
        <h1 className="font-display font-bold text-2xl mb-1">{poll.title}</h1>
        <p className="text-xs text-muted">
          Created {new Date(poll.createdAt).toLocaleDateString()} · {total} {total === 1 ? "vote" : "votes"} total
        </p>
        {!isOwner && (
          <p className="text-xs text-amber-400 mt-2">You can only edit polls you own.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass-card p-4 flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 grid place-items-center">
            <Vote size={16} />
          </span>
          <div>
            <p className="text-lg font-bold text-zinc-100 tabular-nums">{total}</p>
            <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Total votes</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 grid place-items-center">
            <ListChecks size={16} />
          </span>
          <div>
            <p className="text-lg font-bold text-zinc-100 tabular-nums">{poll.options?.length || 0}</p>
            <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Options</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-emerald-400" /> Vote breakdown
        </h2>

        {total === 0 ? (
          <p className="text-sm text-zinc-500">No votes yet. Share your poll to start collecting votes.</p>
        ) : (
          <div className="space-y-4">
            {options.map((opt, idx) => {
              const pct = total > 0 ? Number(((opt.votesCount || 0) / total) * 100).toFixed(1) : 0;
              const barColor = BAR_COLORS[idx % BAR_COLORS.length];
              return (
                <div key={opt._id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-zinc-300 truncate">
                      {opt.text || (opt.image?.url ? "Image option" : "Option")}
                    </span>
                    <span className="text-sm font-semibold text-zinc-100 tabular-nums shrink-0 ml-3">
                      {pct}% · {opt.votesCount || 0}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${barColor} transition-all duration-700`}
                      style={{ width: `${Math.min((pct / maxPct) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
