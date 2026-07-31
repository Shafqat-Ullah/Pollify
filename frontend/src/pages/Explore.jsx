import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Compass } from "lucide-react";
import { pollService } from "../services/pollService";
import PollCard from "../components/poll/PollCard";
import { PollCardSkeleton, EmptyState } from "../components/ui/States";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "trending", label: "Trending" },
  { value: "mostVoted", label: "Most Voted" },
];

export default function Explore() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [sort, setSort] = useState("newest");
  const loaderRef = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["polls", search, sort],
    queryFn: ({ pageParam = 1 }) => pollService.list({ search, sort, page: pageParam, limit: 12 }),
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

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">
            {search ? (
              <>
                Results for <span className="text-gradient">"{search}"</span>
              </>
            ) : (
              <>
                Explore <span className="text-gradient">polls</span>
              </>
            )}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Discover what your community is voting on.</p>
        </div>
        <div className="inline-flex gap-1 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 w-fit">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={`text-sm px-3 py-1.5 rounded-lg transition-all ${
                sort === s.value
                  ? "bg-emerald-500 text-white font-medium shadow-md shadow-emerald-500/25"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <PollCardSkeleton key={i} />)}
        </div>
      ) : polls.length === 0 ? (
        <EmptyState icon={Compass} title="No polls found" description="Try a different search or check back later." />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {polls.map((poll) => (
              <PollCard key={poll._id} poll={poll} />
            ))}
          </div>
          <div ref={loaderRef} className="h-10 flex items-center justify-center mt-6">
            {isFetchingNextPage && <span className="text-sm text-muted">Loading more...</span>}
          </div>
        </>
      )}
    </div>
  );
}
