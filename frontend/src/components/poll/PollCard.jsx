import { Link } from "react-router-dom";
import { Heart, MessageCircle, BarChart3, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function PollCard({ poll }) {
  const timeLeft = poll.expiresAt
    ? new Date(poll.expiresAt) > new Date()
      ? `Ends ${new Date(poll.expiresAt).toLocaleDateString()}`
      : "Ended"
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 hover:border-primary/40 transition-colors group"
    >
      <Link to={`/polls/${poll._id}`} className="block">
        <div className="flex items-center gap-2 mb-3">
          {poll.category && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
              {poll.category.name}
            </span>
          )}
          {timeLeft && (
            <span className="text-xs text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timeLeft}
            </span>
          )}
        </div>

        <h3 className="font-display font-semibold text-base mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
          {poll.title}
        </h3>
        {poll.description && (
          <p className="text-sm text-muted line-clamp-2 mb-4">{poll.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" /> {poll.totalVotes} votes
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> {poll.likesCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> {poll.commentsCount}
            </span>
          </div>
          {!poll.isAnonymous && poll.author && (
            <span className="truncate max-w-[100px]">@{poll.author.username}</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
