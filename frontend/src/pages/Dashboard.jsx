import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  SquarePen,
  Compass,
  UsersRound,
  TrendingUp,
  ChevronRight,
  List,
  CheckSquare,
  Image as ImageIcon,
  MessageSquare,
  BarChart3,
  Vote,
  Bookmark,
} from "lucide-react";
import { pollService, userService } from "../services/pollService";
import { useAuth } from "../contexts/AuthContext";
import PollCard from "../components/poll/PollCard";
import { PollCardSkeleton, EmptyState } from "../components/ui/States";

const TYPE_FILTERS = [
  { value: "single", label: "Single", icon: List },
  { value: "multiple", label: "Multiple", icon: CheckSquare },
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "text", label: "Text", icon: MessageSquare },
];

const TYPE_META = {
  single: { label: "Single choice", color: "bg-emerald-500" },
  multiple: { label: "Multiple choice", color: "bg-sky-500" },
  image: { label: "Image polls", color: "bg-violet-500" },
  text: { label: "Open ended", color: "bg-amber-500" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("explore");
  const [type, setType] = useState("");
  const loaderRef = useRef(null);

  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: userService.getDashboard,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["dashboard-feed", tab, type],
    queryFn: ({ pageParam = 1 }) =>
      pollService.list({ sort: "newest", type: type || undefined, page: pageParam, limit: 8 }),
    getNextPageParam: (lastPage) =>
      lastPage.data.pagination.hasMore ? lastPage.data.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });

  const handleObserver = useCallback(
    (entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  const polls = data?.pages.flatMap((p) => p.data.polls) || [];
  const stats = dashData?.data.stats;
  const firstName = user?.name?.split(" ")[0] || "there";

  const typeCounts = {};
  polls.forEach((p) => {
    typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
  });
  const maxTypeCount = Math.max(1, ...Object.values(typeCounts));
  const typeList = Object.entries(TYPE_META)
    .filter(([key]) => typeCounts[key])
    .sort((a, b) => (typeCounts[b[0]] || 0) - (typeCounts[a[0]] || 0));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-6">
      {/* ---- Main feed column ---- */}
      <div className="min-w-0">
        {/* Greeting */}
        <div className="mb-5">
          <h1 className="font-bold text-lg text-zinc-100">
            Hey, <span className="text-emerald-400">{firstName}</span> 👋
          </h1>
          <p className="text-sm text-zinc-600 mt-0.5">What's the community thinking today?</p>
        </div>

        {/* Composer card */}
        <Link
          to="/polls/create"
          className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 hover:border-zinc-700 transition-colors group"
        >
          {user?.avatar?.url ? (
            <img
              src={user.avatar.url}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-zinc-700 shrink-0"
            />
          ) : (
            <span className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
              {firstName?.[0]?.toUpperCase() || "P"}
            </span>
          )}
          <span className="flex-1 bg-zinc-800/50 rounded-xl border border-transparent px-4 py-2.5 text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors text-left">
            Ask the community something…
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 flex items-center justify-center text-white transition-colors active:scale-95 shrink-0">
            <SquarePen size={16} />
          </span>
        </Link>

        {/* Feed tabs */}
        <div className="flex items-center gap-1 mt-4 mb-3">
          <button
            onClick={() => setTab("explore")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
              tab === "explore"
                ? "bg-zinc-800 border border-zinc-700 text-zinc-100 font-medium"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Compass size={15} /> Explore
          </button>
          <button
            onClick={() => setTab("following")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
              tab === "following"
                ? "bg-zinc-800 border border-zinc-700 text-zinc-100 font-medium"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <UsersRound size={15} /> Following
          </button>
        </div>

        {/* Poll-type filter chips */}
        {tab === "explore" && (
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            <button
              onClick={() => setType("")}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                type === ""
                  ? "bg-zinc-800 border-zinc-700 text-zinc-100 font-medium"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Sparkles size={13} /> All
            </button>
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setType(f.value)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  type === f.value
                    ? "bg-zinc-800 border-zinc-700 text-zinc-100 font-medium"
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <f.icon size={13} /> {f.label}
              </button>
            ))}
            {type && (
              <button
                onClick={() => setType("")}
                className="inline-flex items-center px-2 py-1.5 rounded-lg text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Feed */}
        {tab === "following" ? (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800">
            <EmptyState
              icon={UsersRound}
              title="Your following feed"
              description="Polls from people you follow will appear here. Follow creators from the Explore tab to build your feed."
              action={<Link to="/explore" className="btn-primary text-sm">Explore polls</Link>}
            />
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <PollCardSkeleton key={i} />)}
          </div>
        ) : polls.length === 0 ? (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800">
            <EmptyState
              icon={Sparkles}
              title="No polls yet"
              description="Be the first to ask something and kick off the discussion."
              action={<Link to="/polls/create" className="btn-primary text-sm">Create a poll</Link>}
            />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {polls.map((poll) => (
                <PollCard key={poll._id} poll={poll} />
              ))}
            </div>
            <div ref={loaderRef} className="h-10 flex items-center justify-center mt-5">
              {isFetchingNextPage && <span className="text-sm text-zinc-500">Loading more...</span>}
            </div>
          </>
        )}
      </div>

      {/* ---- Right rail ---- */}
      <aside className="hidden xl:block space-y-4">
        {/* Profile card */}
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/80 p-5 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
              ) : (
                <span className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-lg">
                  {firstName?.[0]?.toUpperCase() || "P"}
                </span>
              )}
              <div className="min-w-0">
                <p className="font-bold text-sm text-zinc-100 truncate">{user?.name}</p>
                <p className="text-xs text-zinc-500 truncate">@{user?.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-zinc-800 mb-4 text-center">
              <div className="px-1">
                <p className="font-bold text-lg text-zinc-100 tabular-nums">{stats?.totalPolls ?? 0}</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-0.5">Created</p>
              </div>
              <div className="px-1">
                <p className="font-bold text-lg text-zinc-100 tabular-nums">{stats?.totalVotesCast ?? 0}</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-0.5">Voted</p>
              </div>
              <div className="px-1">
                <p className="font-bold text-lg text-zinc-100 tabular-nums">{stats?.savedPolls ?? 0}</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-0.5">Saved</p>
              </div>
            </div>

            <Link
              to={`/profile/${user?.username}`}
              className="w-full inline-flex items-center justify-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View profile <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        {/* Trending poll types */}
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/80 p-5">
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-200 mb-4">
            <TrendingUp size={15} className="text-emerald-400" /> Poll types
          </h2>
          {typeList.length === 0 ? (
            <p className="text-xs text-zinc-600">No poll data yet.</p>
          ) : (
            <div className="space-y-3.5">
              {typeList.map(([key, meta]) => (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-zinc-400">{meta.label}</span>
                    <span className="font-semibold text-zinc-200 tabular-nums">{typeCounts[key]}</span>
                  </div>
                  <div className="h-0.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${meta.color}`}
                      style={{ width: `${((typeCounts[key] || 0) / maxTypeCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick stats hint */}
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/80 p-5">
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-200 mb-4">
            <BarChart3 size={15} className="text-emerald-400" /> Your impact
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Polls created</span>
              <span className="font-semibold text-zinc-100 tabular-nums">{stats?.totalPolls ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Votes received</span>
              <span className="font-semibold text-zinc-100 tabular-nums">{stats?.totalVotesReceived ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Following</span>
              <span className="font-semibold text-zinc-100 tabular-nums">{stats?.following ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Followers</span>
              <span className="font-semibold text-zinc-100 tabular-nums">{stats?.followers ?? 0}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
