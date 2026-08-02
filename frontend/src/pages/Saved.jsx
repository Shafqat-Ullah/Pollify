import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { userService } from "../services/pollService";
import PollCard from "../components/poll/PollCard";
import { PollCardSkeleton, EmptyState } from "../components/ui/States";

export default function Saved() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-bookmarks"],
    queryFn: userService.getMyBookmarks,
  });

  const polls = (data?.data.bookmarks || []).map((b) => b.poll);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-bold text-xl text-zinc-100">Saved <span className="text-emerald-400">polls</span></h1>
        <p className="text-sm text-zinc-600 mt-1">Polls you've bookmarked for later.</p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <PollCardSkeleton key={i} />)}
        </div>
      ) : polls.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved polls"
          description="Bookmark polls you like and they'll appear here."
          action={<Link to="/explore" className="btn-primary text-sm">Explore polls</Link>}
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
