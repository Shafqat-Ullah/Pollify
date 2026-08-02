// Invalidate every query that renders poll data so the UI updates
// immediately after a mutation (vote, like, bookmark, comment) without
// needing a manual page refresh.
export const invalidatePollQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ["poll"] });
  queryClient.invalidateQueries({ queryKey: ["poll-analytics"] });
  queryClient.invalidateQueries({ queryKey: ["poll-votes-timeline"] });
  queryClient.invalidateQueries({ queryKey: ["poll-type-stats"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard-feed"] });
  queryClient.invalidateQueries({ queryKey: ["polls"] });
  queryClient.invalidateQueries({ queryKey: ["my-polls"] });
  queryClient.invalidateQueries({ queryKey: ["userPolls"] });
  queryClient.invalidateQueries({ queryKey: ["my-bookmarks"] });
  queryClient.invalidateQueries({ queryKey: ["my-votes"] });
};
