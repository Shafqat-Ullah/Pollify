import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PenLine } from "lucide-react";
import { pollService } from "../services/pollService";
import { useAuth } from "../contexts/AuthContext";
import PollCard from "../components/poll/PollCard";
import { PollCardSkeleton, EmptyState } from "../components/ui/States";

export default function MyPolls() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["my-polls"],
    queryFn: () => pollService.list({ author: user._id, limit: 50, sort: "newest" }),
  });

  const polls = data?.data.polls || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-bold text-xl text-zinc-100">My <span className="text-emerald-400">Polls</span></h1>
        <p className="text-sm text-zinc-600 mt-1">Every poll you've created.</p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <PollCardSkeleton key={i} />)}
        </div>
      ) : polls.length === 0 ? (
        <EmptyState
          icon={PenLine}
          title="No polls created yet"
          description="Create your first poll and start collecting votes."
          action={<Link to="/polls/create" className="btn-primary text-sm">Create a poll</Link>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {polls.map((poll) => (
            <PollCard key={poll._id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}
