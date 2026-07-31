import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { userService, pollService } from "../services/pollService";
import { useAuth } from "../contexts/AuthContext";
import PollCard from "../components/poll/PollCard";
import { PollCardSkeleton, EmptyState } from "../components/ui/States";
import { Users } from "lucide-react";

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => userService.getProfile(username),
  });

  const { data: pollsData } = useQuery({
    queryKey: ["userPolls", username, data?.data.user._id],
    queryFn: () => pollService.list({ author: data.data.user._id }),
    enabled: !!data,
  });

  if (isLoading) return <div className="text-muted text-sm">Loading profile...</div>;

  const profileUser = data.data.user;
  const stats = data.data.stats;
  const isOwn = currentUser?.username === username;

  const handleFollow = async () => {
    if (!currentUser) return toast.error("Log in to follow users.");
    await userService.toggleFollow(profileUser._id);
    refetch();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass-card p-6 mb-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-2xl font-bold text-white shrink-0 overflow-hidden">
          {profileUser.avatar?.url ? (
            <img src={profileUser.avatar.url} alt={profileUser.name} className="w-full h-full object-cover" />
          ) : (
            profileUser.name?.[0]?.toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <h1 className="font-display font-bold text-xl">{profileUser.name}</h1>
          <p className="text-muted text-sm mb-2">@{profileUser.username}</p>
          {profileUser.bio && <p className="text-sm mb-2">{profileUser.bio}</p>}
          <div className="flex gap-4 text-sm text-muted">
            <span>{stats.pollsCount} polls</span>
            <span>{stats.followersCount} followers</span>
            <span>{stats.followingCount} following</span>
          </div>
        </div>
        {!isOwn && (
          <button onClick={handleFollow} className="btn-primary text-sm">
            <Users className="w-4 h-4" /> Follow
          </button>
        )}
      </div>

      <h2 className="font-display font-semibold text-lg mb-4">Polls</h2>
      {!pollsData ? (
        <div className="grid sm:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <PollCardSkeleton key={i} />)}
        </div>
      ) : pollsData.data.polls.length === 0 ? (
        <EmptyState title="No public polls yet" description={`${profileUser.name} hasn't published any polls.`} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {pollsData.data.polls.map((p) => <PollCard key={p._id} poll={p} />)}
        </div>
      )}
    </div>
  );
}
