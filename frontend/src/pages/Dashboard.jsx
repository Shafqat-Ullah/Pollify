import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BarChart3, Vote, Users, Bookmark, Plus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { userService } from "../services/pollService";
import { useAuth } from "../contexts/AuthContext";
import { DashboardStatSkeleton, EmptyState } from "../components/ui/States";

const COLORS = ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0"];

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: userService.getDashboard,
  });

  const stats = data?.data.stats;
  const recentPolls = data?.data.recentPolls || [];

  const chartData = recentPolls.slice(0, 4).map((p) => ({ name: p.title.slice(0, 14), value: p.totalVotes }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">
            Welcome back, <span className="text-gradient">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Here's what's happening with your polls.</p>
        </div>
        <Link to="/polls/create" className="btn-primary">
          <Plus className="w-4 h-4" /> New poll
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <DashboardStatSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={BarChart3} label="Total polls" value={stats.totalPolls} />
            <StatCard icon={Vote} label="Votes received" value={stats.totalVotesReceived} />
            <StatCard icon={Users} label="Followers" value={stats.followers} />
            <StatCard icon={Bookmark} label="Saved polls" value={stats.savedPolls} />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="font-display font-semibold mb-4">Recent polls</h2>
          {recentPolls.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No polls yet"
              description="Create your first poll to see it here."
              action={<Link to="/polls/create" className="btn-primary text-sm">Create a poll</Link>}
            />
          ) : (
            <div className="space-y-3">
              {recentPolls.map((p) => (
                <Link
                  key={p._id}
                  to={`/polls/${p._id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-light transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{p.title}</p>
                    <p className="text-xs text-muted capitalize">{p.status}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{p.totalVotes} votes</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="font-display font-semibold mb-4">Votes by poll</h2>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#18181B", border: "1px solid #27272A", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className="icon-chip shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-500 mb-0.5 truncate">{label}</p>
        <p className="font-display font-bold text-2xl">{value}</p>
      </div>
    </div>
  );
}
