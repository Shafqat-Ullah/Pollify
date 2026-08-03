import { Inbox } from "lucide-react";
import { motion } from "framer-motion";

export function PollCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/70 border border-zinc-800/60 rounded-2xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full shimmer shrink-0" />
        <div className="h-2.5 w-24 shimmer rounded-lg" />
        <div className="h-2 w-16 shimmer rounded-lg" />
        <div className="ml-auto h-5 w-14 shimmer rounded-lg" />
      </div>
      <div className="h-4 w-3/4 shimmer rounded-lg mb-4" />
      <div className="space-y-2 mb-4">
        <div className="h-9 shimmer rounded-xl" />
        <div className="h-9 shimmer rounded-xl" />
      </div>
      <div className="flex gap-2 pt-3 border-t border-zinc-800/60">
        <div className="h-8 w-20 shimmer rounded-lg" />
        <div className="h-8 w-20 shimmer rounded-lg" />
        <div className="h-8 w-16 shimmer rounded-lg" />
      </div>
    </motion.div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className="skeleton h-10 w-10 rounded-xl shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-7 w-14" />
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      {Icon && (
        <div className="grid place-items-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/15 text-emerald-500 mx-auto mb-4">
          <Icon size={22} />
        </div>
      )}
      <h3 className="font-semibold text-zinc-300">{title}</h3>
      {description && <p className="text-sm text-zinc-600 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
