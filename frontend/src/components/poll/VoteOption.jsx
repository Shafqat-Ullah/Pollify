import { motion } from "framer-motion";
import { Check } from "lucide-react";
import clsx from "clsx";

export default function VoteOption({ option, percentage, isSelected, hasVoted, onSelect, disabled }) {
  return (
    <button
      onClick={() => onSelect(option._id)}
      disabled={disabled || hasVoted}
      className={clsx(
        "relative w-full text-left rounded-xl border p-3.5 overflow-hidden transition-colors",
        hasVoted ? "cursor-default" : "cursor-pointer hover:border-primary/50",
        isSelected ? "border-primary" : "border-border"
      )}
    >
      {hasVoted && (
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary/15"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isSelected && (
              <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-white" />
            </span>
          )}
          <span className="text-sm text-text">{option.text}</span>
        </div>
        {hasVoted && (
          <span className="text-sm font-semibold text-primary shrink-0">{percentage}%</span>
        )}
      </div>
    </button>
  );
}
