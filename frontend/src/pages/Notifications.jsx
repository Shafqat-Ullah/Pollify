import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { notificationService } from "../services/pollService";
import { EmptyState } from "../components/ui/States";

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.list,
  });

  const markAllRead = async () => {
    await notificationService.markAllRead();
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const notifications = data?.data.notifications || [];

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl">Notifications</h1>
        {notifications.length > 0 && (
          <button onClick={markAllRead} className="text-sm text-primary hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-3">
              <div className="skeleton h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="skeleton h-3 w-3/4" />
                <div className="skeleton h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="Votes, comments, and follows will show up here." />
      ) : (
        <div className="glass-card divide-y divide-border">
          {notifications.map((n) => (
            <div key={n._id} className={`p-4 flex items-start gap-3 ${!n.isRead ? "bg-primary/5" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                {n.sender?.name?.[0]?.toUpperCase() || "P"}
              </div>
              <div>
                <p className="text-sm">{n.message}</p>
                <p className="text-xs text-muted mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
