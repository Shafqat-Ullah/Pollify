import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Sparkles,
  SquarePen,
  Compass,
  UsersRound,
  TrendingUp,
  ChevronRight,
  List,
  CircleCheck,
  Star,
  Image as ImageIcon,
  MessageSquareText,
  X,
} from "lucide-react";
import { pollService, userService } from "../services/pollService";
import { useAuth } from "../contexts/AuthContext";
import PollCard from "../components/poll/PollCard";
import { PollCardSkeleton, EmptyState } from "../components/ui/States";

const TYPE_FILTERS = [
  { value: "", label: "All", icon: Sparkles },
  { value: "yesno", label: "Yes / No", icon: CircleCheck },
  { value: "single", label: "Single Choice", icon: List },
  { value: "rating", label: "Rating", icon: Star },
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "open", label: "Open Ended", icon: MessageSquareText },
];

const TYPE_META = {
  yesno: { label: "Yes / No", color: "bg-emerald-500" },
  single: { label: "Single choice", color: "bg-sky-500" },
  rating: { label: "Rating", color: "bg-amber-500" },
  image: { label: "Image polls", color: "bg-violet-500" },
  open: { label: "Open ended", color: "bg-rose-500" },
  multiple: { label: "Multiple choice", color: "bg-teal-500" },
  text: { label: "Text poll", color: "bg-orange-500" },
};

const TREND_COLORS = ["bg-emerald-500", "bg-sky-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"];

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("all");
  const [type, setType] = useState("");
  const loaderRef = useRef(null);

  const { data: dashData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: userService.getDashboard,
  });

  const { data: typeStats } = useQuery({
    queryKey: ["poll-type-stats"],
    queryFn: pollService.typeStats,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["dashboard-feed", tab, type],
    queryFn: ({ pageParam = 1 }) =>
      pollService.list({
        sort: "newest",
        type: type || undefined,
        feed: tab === "following" ? "following" : undefined,
        page: pageParam,
        limit: 8,
      }),
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
  const TYPES = ["yesno", "single", "rating", "image", "open"];
  (typeStats?.data?.types || []).forEach((t) => {
    typeCounts[t.type] = t.count;
  });
  const maxTypeCount = Math.max(1, ...Object.values(typeCounts));
  const typeList = TYPES
    .map((key) => [key, TYPE_META[key]])
    .filter(([key]) => typeCounts[key])
    .sort((a, b) => (typeCounts[b[0]] || 0) - (typeCounts[a[0]] || 0));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_288px] gap-5">
      {/* ---- Main feed column ---- */}
      <div className="min-w-0 space-y-4">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-lg font-bold text-zinc-100">
              Hey, <span className="text-emerald-400">{firstName}</span> 👋
            </h1>
            <p className="text-sm text-zinc-600 mt-0.5">What's the community thinking today?</p>
          </div>
        </motion.div>

        {/* Composer card */}
        <Link
          to="/polls/create"
          className="group flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 transition-colors hover:border-emerald-500/30 hover:bg-zinc-900/70"
        >
          {user?.avatar?.url ? (
            <img
              src={user.avatar.url}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-zinc-700 shrink-0"
            />
          ) : (
            <span className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
              {firstName?.[0]?.toUpperCase() || "P"}
            </span>
          )}
          <span className="flex-1 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-600 group-hover:text-zinc-400 transition-colors text-left">
            Ask the community something…
          </span>
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 active:scale-95 transition-all shrink-0 shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40">
            <SquarePen size={16} />
          </span>
        </Link>

        {/* Feed tabs */}
        <div className="flex items-center gap-2 p-1 bg-zinc-900/80 border border-zinc-800 rounded-xl w-fit">
          {[
            { key: "all", label: "Explore", Icon: Compass },
            { key: "following", label: "Following", Icon: UsersRound },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                tab === key ? "text-zinc-100" : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {tab === key && (
                <motion.span
                  layoutId="feed-tab-pill"
                  className="absolute inset-0 rounded-lg bg-zinc-800 border border-zinc-700/70"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon size={14} className="relative z-10" />
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>

        {/* Poll-type filter chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value || "all"}
              onClick={() => setType(f.value)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                type === f.value
                  ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
                  : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900 border border-transparent"
              }`}
            >
              <f.icon size={12} /> {f.label}
            </button>
          ))}
          {type && (
            <button
              onClick={() => setType("")}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium text-zinc-700 hover:text-zinc-500 transition-colors"
            >
              <X size={11} /> Clear
            </button>
          )}
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <PollCardSkeleton key={i} />)}
          </div>
        ) : polls.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-14 text-center">
            <EmptyState
              icon={tab === "following" ? UsersRound : Sparkles}
              title={tab === "following" ? "Nobody you follow has posted yet" : "Nothing here yet"}
              description={
                tab === "following"
                  ? "Follow creators to see their polls."
                  : "Be the first to ask something and kick off the discussion."
              }
              action={
                tab === "following" ? (
                  <Link to="/" onClick={() => setTab("all")} className="btn-primary text-sm">
                    Explore polls
                  </Link>
                ) : (
                  <Link to="/polls/create" className="btn-primary text-sm">Create a poll</Link>
                )
              }
            />
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {polls.map((poll) => (
                <PollCard key={poll._id} poll={poll} />
              ))}
            </div>
            <div ref={loaderRef} className="h-10 flex items-center justify-center">
              {isFetchingNextPage && <span className="text-sm text-zinc-500">Loading more...</span>}
            </div>
          </>
        )}
      </div>

      {/* ---- Right rail ---- */}
      <aside className="hidden xl:flex flex-col gap-3">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 overflow-hidden"
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-44 h-24 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />
          <div className="relative flex flex-col items-center text-center">
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-full bg-emerald-500/25 blur-md" />
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.name}
                  className="relative w-16 h-16 rounded-full object-cover ring-2 ring-zinc-800"
                />
              ) : (
                <span className="relative w-16 h-16 rounded-full bg-emerald-500 text-white text-lg font-bold ring-2 ring-zinc-800 grid place-items-center">
                  {firstName?.[0]?.toUpperCase() || "P"}
                </span>
              )}
            </div>
            <Link
              to={`/profile/${user?.username}`}
              className="mt-3 text-sm font-semibold text-zinc-200 hover:text-zinc-100 transition-colors"
            >
              {user?.name}
            </Link>
            <p className="text-xs text-zinc-600 mt-0.5">@{user?.username}</p>

            <div className="relative mt-5 pt-4 border-t border-zinc-800/80 grid grid-cols-3 divide-x divide-zinc-800/80 w-full">
              <div className="text-center px-1">
                <p className="text-base font-bold text-zinc-100 tabular-nums">{stats?.totalPolls ?? 0}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5 uppercase tracking-wide">Created</p>
              </div>
              <div className="text-center px-1">
                <p className="text-base font-bold text-zinc-100 tabular-nums">{stats?.totalVotesCast ?? 0}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5 uppercase tracking-wide">Voted</p>
              </div>
              <div className="text-center px-1">
                <p className="text-base font-bold text-zinc-100 tabular-nums">{stats?.savedPolls ?? 0}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5 uppercase tracking-wide">Saved</p>
              </div>
            </div>

            <Link
              to={`/profile/${user?.username}`}
              className="relative mt-4 w-full flex items-center justify-center gap-1 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-400 hover:text-zinc-100 text-xs font-semibold py-2 transition-colors"
            >
              View profile <ChevronRight size={13} />
            </Link>
          </div>
        </motion.div>

        {/* Trending poll types */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4"
        >
          <h3 className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp size={12} className="text-emerald-500" /> Poll types
          </h3>
          {typeList.length === 0 ? (
            <p className="text-xs text-zinc-600">No poll data yet.</p>
          ) : (
            <div className="space-y-3">
              {typeList.map(([key, meta], idx) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <span className="text-zinc-700">{meta.label}</span>
                    </span>
                    <span className="text-xs font-semibold text-zinc-600 tabular-nums">{typeCounts[key]}</span>
                  </div>
                  <div className="h-0.5 rounded-full bg-zinc-800">
                    <div
                      className={`h-0.5 rounded-full transition-all duration-700 ${TREND_COLORS[idx % TREND_COLORS.length]}`}
                      style={{ width: `${((typeCounts[key] || 0) / maxTypeCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </aside>
    </div>
  );
}
