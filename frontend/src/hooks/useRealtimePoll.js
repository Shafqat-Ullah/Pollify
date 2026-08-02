import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../services/socketService";

const patchCachePoll = (old, pollId, payload) => {
  if (!old?.data?.poll) return old;
  const poll = { ...old.data.poll };
  poll.totalVotes = payload.totalVotes;
  poll.options = poll.options.map((o) => {
    const upd = payload.options.find((p) => String(p._id) === String(o._id));
    return upd ? { ...o, votesCount: upd.votesCount } : o;
  });
  return { ...old, data: { ...old.data, poll } };
};

export function useRealtimePoll(pollId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!pollId) return undefined;
    const socket = getSocket();

    const apply = (payload) => {
      if (String(payload.pollId) !== String(pollId)) return;
      queryClient.setQueryData(["poll", pollId], (old) => patchCachePoll(old, pollId, payload));
      queryClient.setQueryData(["poll-analytics", pollId], (old) => patchCachePoll(old, pollId, payload));
    };

    socket.emit("joinPoll", pollId);
    socket.on("poll:update", apply);

    return () => {
      socket.off("poll:update", apply);
      socket.emit("leavePoll", pollId);
    };
  }, [pollId, queryClient]);
}
