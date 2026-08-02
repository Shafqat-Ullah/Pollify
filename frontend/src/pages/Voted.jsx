import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, BarChart3 } from "lucide-react";
import { userService } from "../services/pollService";
import { EmptyState } from "../components/ui/States";

export default function Voted() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-votes"],
    queryFn: userService.getMyVotes,
  });

  const votes = data?.data.votes || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-bold text-xl text-zinc-100">Voted <span className="text-emerald-400">polls</span></h1>
        <p className="text-sm text-zinc-600 mt-1">Polls you've cast a vote on.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-4 skeleton h-14" />
          ))}
        </div>
      ) : votes.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No votes yet"
          description="Cast your first vote on a poll and it will show up here."
          action={<Link to="/explore" className="btn-primary text-sm">Explore polls</Link>}
        />
      ) : (
        <div className="space-y-3">
          {votes.map((v) => {
            const poll = v.poll;
            const ended = poll?.status === "closed" || poll?.status === "ended" ||
              (poll?.expiresAt && new Date(poll.expiresAt) < new Date());
            return (
              <Link
                key={v._id}
                to={`/polls/${poll?._id}`}
                className="glass-card-hover p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm text-zinc-100 truncate">{poll?.title || "Poll"}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 capitalize">
                    {ended ? "Ended" : "Active"} · voted {new Date(v.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 shrink-0">
                  <BarChart3 size={14} /> {poll?.totalVotes ?? 0} votes
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
