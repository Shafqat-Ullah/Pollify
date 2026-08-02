import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PenLine } from "lucide-react";
import toast from "react-hot-toast";
import { pollService } from "../services/pollService";
import { invalidatePollQueries } from "../services/queryUtils";
import { useAuth } from "../contexts/AuthContext";
import PollCard from "../components/poll/PollCard";
import { PollCardSkeleton, EmptyState } from "../components/ui/States";

export default function MyPolls() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-polls"],
    queryFn: () => pollService.list({ author: user._id, mine: 1, limit: 50, sort: "newest" }),
  });

  const polls = data?.data.polls || [];

  const refresh = () => invalidatePollQueries(queryClient);

  const handleVote = async (id, selectedOptions) => {
    try {
      await pollService.vote(id, selectedOptions);
      toast.success("Vote cast!");
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cast vote.");
    }
  };

  const handleUnvote = async (id) => {
    try {
      await pollService.unvote(id);
      toast.success("Vote removed.");
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove vote.");
    }
  };

  const handleEdit = async (id, payload) => {
    try {
      await pollService.update(id, payload);
      toast.success("Poll updated!");
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update poll.");
    }
  };

  const handleClose = async (id) => {
    try {
      const poll = polls.find((p) => p._id === id);
      const target =
        poll?.status === "closed" || poll?.status === "draft" ? "published" : "closed";
      await pollService.setStatus(id, target);
      toast.success(target === "closed" ? "Poll closed." : "Poll published.");
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change poll status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this poll permanently? This cannot be undone.")) return;
    try {
      await pollService.remove(id);
      toast.success("Poll deleted.");
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete poll.");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-bold text-xl text-zinc-100">
          My <span className="text-emerald-400">Polls</span>
        </h1>
        {user?.name && (
          <p className="text-sm text-zinc-500 mt-1">{user.name}</p>
        )}
        <p className="text-xs text-zinc-600 mt-0.5">
          {polls.length} {polls.length === 1 ? "poll" : "polls"} · Edit, view analytics, close or delete
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <PollCardSkeleton key={i} />)}
        </div>
      ) : polls.length === 0 ? (
        <EmptyState
          icon={PenLine}
          title="No polls created yet"
          description="Create your first poll and start collecting votes."
          action={<Link to="/polls/create" className="btn-primary text-sm">Create a poll</Link>}
        />
      ) : (
        <div className="space-y-3">
          {polls.map((poll) => (
            <PollCard
              key={poll._id}
              poll={poll}
              owner
              onVote={handleVote}
              onUnvote={handleUnvote}
              onEdit={handleEdit}
              onClose={handleClose}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
