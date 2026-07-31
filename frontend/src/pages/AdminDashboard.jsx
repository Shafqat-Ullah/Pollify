import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, BarChart3, Vote, Flag } from "lucide-react";
import api from "../services/api";
import Button from "../components/ui/Button";

const TABS = ["overview", "users", "polls", "reports"];

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api.get("/admin/dashboard").then((r) => r.data.data),
  });

  const { data: users } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api.get("/admin/users").then((r) => r.data.data.users),
    enabled: tab === "users",
  });

  const { data: polls } = useQuery({
    queryKey: ["admin", "polls"],
    queryFn: () => api.get("/admin/polls").then((r) => r.data.data.polls),
    enabled: tab === "polls",
  });

  const { data: reports } = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: () => api.get("/admin/reports").then((r) => r.data.data.reports),
    enabled: tab === "reports",
  });

  const banUser = async (id) => {
    await api.patch(`/admin/users/${id}/ban`);
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  };

  const deletePoll = async (id) => {
    await api.delete(`/admin/polls/${id}`);
    queryClient.invalidateQueries({ queryKey: ["admin", "polls"] });
  };

  const resolveReport = async (id, status) => {
    await api.patch(`/admin/reports/${id}`, { status });
    queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
  };

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-6">Admin</h1>

      <div className="inline-flex gap-1 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm px-4 py-1.5 rounded-lg capitalize transition-all ${
              tab === t
                ? "bg-emerald-500 text-white font-medium shadow-md shadow-emerald-500/25"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total users" value={stats.totalUsers} />
          <StatCard icon={BarChart3} label="Total polls" value={stats.totalPolls} />
          <StatCard icon={Vote} label="Total votes" value={stats.totalVotes} />
          <StatCard icon={Flag} label="Pending reports" value={stats.pendingReports} />
        </div>
      )}

      {tab === "users" && (
        <div className="glass-card divide-y divide-border">
          {users?.map((u) => (
            <div key={u._id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{u.name} <span className="text-muted">@{u.username}</span></p>
                <p className="text-xs text-muted">{u.email}</p>
              </div>
              <Button variant={u.isBanned ? "secondary" : "danger"} onClick={() => banUser(u._id)} className="text-xs px-3 py-1.5">
                {u.isBanned ? "Unban" : "Ban"}
              </Button>
            </div>
          ))}
        </div>
      )}

      {tab === "polls" && (
        <div className="glass-card divide-y divide-border">
          {polls?.map((p) => (
            <div key={p._id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-xs text-muted">by @{p.author?.username} · {p.totalVotes} votes</p>
              </div>
              <Button variant="danger" onClick={() => deletePoll(p._id)} className="text-xs px-3 py-1.5">Delete</Button>
            </div>
          ))}
        </div>
      )}

      {tab === "reports" && (
        <div className="glass-card divide-y divide-border">
          {reports?.length === 0 && <p className="p-4 text-sm text-muted">No pending reports.</p>}
          {reports?.map((r) => (
            <div key={r._id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{r.poll?.title}</p>
                <p className="text-xs text-muted">reason: {r.reason} · by @{r.reportedBy?.username}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => resolveReport(r._id, "dismissed")} className="text-xs px-3 py-1.5">Dismiss</Button>
                <Button variant="danger" onClick={() => resolveReport(r._id, "reviewed")} className="text-xs px-3 py-1.5">Resolve</Button>
              </div>
            </div>
          ))}
        </div>
      )}
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
