export function PollCardSkeleton() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-24 w-full" />
      <div className="flex gap-2">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-3 w-16" />
      </div>
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="glass-card p-5 space-y-2">
      <div className="skeleton h-3 w-20" />
      <div className="skeleton h-7 w-14" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-surface-light flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-muted" />
        </div>
      )}
      <h3 className="font-display font-semibold text-lg mb-1">{title}</h3>
      {description && <p className="text-muted text-sm max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
