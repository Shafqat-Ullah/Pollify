import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Bookmark, Flag, Send, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { pollService } from "../services/pollService";
import { useAuth } from "../contexts/AuthContext";
import { useRealtimePoll } from "../hooks/useRealtimePoll";
import VoteOption from "../components/poll/VoteOption";
import ShareMenu from "../components/poll/ShareMenu";
import Lightbox from "../components/ui/Lightbox";
import RatingStars from "../components/ui/RatingStars";
import Button from "../components/ui/Button";

export default function PollDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState([]);
  const [comment, setComment] = useState("");
  const [voting, setVoting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["poll", id],
    queryFn: () => pollService.get(id),
  });

  useRealtimePoll(id);

  const { data: commentsData } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => pollService.getComments(id),
    enabled: !!data,
  });

  if (isLoading)
    return (
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="glass-card p-6 space-y-3">
          <div className="skeleton h-5 w-24" />
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-14 w-full" />
          <div className="skeleton h-14 w-full" />
          <div className="skeleton h-14 w-full" />
        </div>
        <div className="glass-card p-6 space-y-3">
          <div className="skeleton h-5 w-32" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-12 w-full" />
        </div>
      </div>
    );

  const poll = data.data.poll;
  const hasVoted = !!data.data.userVote;
  const totalVotes = poll.totalVotes;
  const expired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const imageOptions = poll.options.map((o) => ({ url: o.image?.url, text: o.text })).filter((o) => o.url);

  const isRating = poll.type === "rating";
  const ratingLevels = isRating
    ? poll.options.map((o, i) => ({
        id: o._id,
        level: (o.text?.match(/⭐/g) || []).length || i + 1,
        votes: o.votesCount || 0,
      }))
    : [];
  const avgRating =
    isRating && totalVotes > 0
      ? ratingLevels.reduce((s, r) => s + r.level * r.votes, 0) / totalVotes
      : 0;
  const maxLevelVotes = Math.max(1, ...ratingLevels.map((r) => r.votes));
  const canRate = !hasVoted && poll.status === "published" && !expired;

  const rateNow = async (level) => {
    const r = ratingLevels[level - 1];
    if (!r || !canRate) return;
    setVoting(true);
    try {
      await pollService.vote(id, [r.id]);
      toast.success(`Rated ${level} star${level > 1 ? "s" : ""}!`);
      queryClient.invalidateQueries({ queryKey: ["poll", id] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cast rating.");
    } finally {
      setVoting(false);
    }
  };

  const handleSelect = (optionId) => {
    if (hasVoted || expired) return;
    if (poll.type === "multiple") {
      setSelected((prev) => (prev.includes(optionId) ? prev.filter((i) => i !== optionId) : [...prev, optionId]));
    } else {
      setSelected([optionId]);
    }
  };

  const submitVote = async () => {
    if (expired) return toast.error("This poll has ended.");
    if (selected.length === 0) return toast.error("Select an option first.");
    setVoting(true);
    try {
      await pollService.vote(id, selected);
      toast.success("Vote cast!");
      queryClient.invalidateQueries({ queryKey: ["poll", id] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cast vote.");
    } finally {
      setVoting(false);
    }
  };

  const handleLike = async () => {
    if (!user) return toast.error("Log in to like polls.");
    await pollService.like(id);
    queryClient.invalidateQueries({ queryKey: ["poll", id] });
  };

  const handleBookmark = async () => {
    if (!user) return toast.error("Log in to bookmark polls.");
    await pollService.bookmark(id);
    toast.success("Bookmark updated.");
  };

  const submitComment = async () => {
    if (!comment.trim()) return;
    try {
      await pollService.addComment(id, comment.trim());
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not post comment.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          {poll.category && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
              {poll.category.name}
            </span>
          )}
          {!poll.isAnonymous && poll.author && (
            <Link to={`/profile/${poll.author.username}`} className="text-xs text-muted hover:text-primary">
              by @{poll.author.username}
            </Link>
          )}
        </div>

        <h1 className="font-display font-bold text-2xl mb-2">{poll.title}</h1>
        {poll.description && <p className="text-muted text-sm mb-6">{poll.description}</p>}

        {isRating ? (
          <div className="mb-5">
            {canRate ? (
              <div className="flex flex-col items-center gap-3 py-6 rounded-2xl bg-surface-light">
                <RatingStars
                  interactive
                  size={44}
                  onChange={rateNow}
                  disabled={voting}
                />
                <p className="text-sm text-muted">Tap a star to rate</p>
                {voting && <p className="text-xs text-primary">Submitting...</p>}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4">
                {totalVotes > 0 ? (
                  <>
                    <div className="flex items-center gap-2">
                      <RatingStars value={avgRating} size={28} />
                      <span className="text-lg text-text">
                        <span className="font-bold text-amber-400 tabular-nums">
                          {avgRating.toFixed(1)}
                        </span>{" "}
                        / 5
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      {totalVotes} {totalVotes === 1 ? "rating" : "ratings"}
                    </p>
                    <div className="w-full max-w-sm space-y-1.5 mt-1">
                      {[...ratingLevels].reverse().map((r) => (
                        <div key={r.id} className="flex items-center gap-2">
                          <span className="text-[11px] text-muted w-6 shrink-0 tabular-nums">
                            {r.level}★
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-surface-light overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-400 transition-all duration-500"
                              style={{ width: `${(r.votes / maxLevelVotes) * 100}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-muted w-6 text-right tabular-nums shrink-0">
                            {r.votes}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <RatingStars value={0} size={28} />
                    <p className="text-sm text-muted">No ratings yet. Be the first to rate!</p>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2.5 mb-5">
            {poll.options.map((opt) => (
              <VoteOption
                key={opt._id}
                option={opt}
                percentage={totalVotes > 0 ? Number(((opt.votesCount / totalVotes) * 100).toFixed(1)) : 0}
                isSelected={selected.includes(opt._id) || (hasVoted && data.data.userVote.selectedOptions.includes(opt._id))}
                hasVoted={hasVoted}
                onSelect={handleSelect}
                onImageClick={() => setLightboxIndex(poll.options.findIndex((o) => o._id === opt._id))}
              />
            ))}
          </div>
        )}

        {expired && (
          <p className="text-center text-sm text-amber-500 font-medium mb-2">
            This poll has ended.
          </p>
        )}

        {!hasVoted && poll.status === "published" && !expired && (
          <Button onClick={submitVote} loading={voting} className="w-full mb-2">
            Cast vote · {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
          </Button>
        )}
        {hasVoted && (
          <p className="text-center text-sm text-emerald-500 font-medium mb-2">
            You voted · {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
          </p>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-border text-sm text-muted">
          <span>{totalVotes} votes</span>
          <button
            onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-1.5 hover:text-primary"
          >
            <MessageCircle className="w-4 h-4" /> {commentsData?.data.comments.length || 0}
          </button>
          <button onClick={handleLike} className="flex items-center gap-1.5 hover:text-primary">
            <Heart className="w-4 h-4" /> {poll.likesCount}
          </button>
          <button onClick={handleBookmark} className="flex items-center gap-1.5 hover:text-primary">
            <Bookmark className="w-4 h-4" />
          </button>
          <ShareMenu url={window.location.href} title={poll.title} />
          <button
            onClick={() => user ? pollService.report(id, "other").then(() => toast.success("Reported.")) : toast.error("Log in to report.")}
            className="flex items-center gap-1.5 hover:text-red-400 ml-auto"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox images={imageOptions} index={lightboxIndex} onClose={setLightboxIndex} />
      )}

      <div className="glass-card p-6" id="comments">
        <h2 className="font-display font-semibold mb-4">Comments ({commentsData?.data.comments.length || 0})</h2>
        {user && (
          <div className="flex gap-2 mb-5">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="input-field flex-1"
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
            />
            <Button onClick={submitComment}><Send className="w-4 h-4" /></Button>
          </div>
        )}
        <div className="space-y-4">
          {commentsData?.data.comments.map((c) => (
            <div key={c._id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                {c.author.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm">
                  <span className="font-medium">{c.author.name}</span>{" "}
                  <span className="text-muted text-xs">@{c.author.username}</span>
                </p>
                <p className="text-sm text-text mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
