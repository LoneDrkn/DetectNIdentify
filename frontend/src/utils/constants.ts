export const ANOMALY_COLORS: Record<string, string> = {
  "Stale Admin Account": "bg-amber-950/40 text-amber-400 border border-amber-500/20",
  "Over Privileged User": "bg-blue-950/40 text-blue-400 border border-blue-500/20",
  "Dormant Privileged User": "bg-purple-950/40 text-purple-400 border border-purple-500/20",
  "Orphaned Service Account": "bg-rose-950/40 text-rose-400 border border-rose-500/20",
  "Terminated Employee With Access": "bg-red-950 text-red-400 border border-red-500/20",
  "After Hours Access": "bg-blue-950/40 text-blue-400 border border-blue-500/20",
  "Massive Data Export": "bg-red-950 text-red-400 border border-red-500/20",
  "Excessive System Access": "bg-amber-950/40 text-amber-400 border border-amber-500/20",
  "Cross Department Access": "bg-purple-950/40 text-purple-400 border border-purple-500/20",
  "Privilege Escalation": "bg-rose-950/40 text-rose-400 border border-rose-500/20",
  "Impossible Travel Pattern": "bg-amber-950/40 text-amber-400 border border-amber-500/20",
};

export const SIZES = [
  { id: "small", label: "Small", count: "300 users", desc: "Fast generation, ~5K events", color: "text-emerald-400 border-emerald-500/40" },
  { id: "medium", label: "Medium", count: "1,000 users", desc: "~15K events (Optimal for browser)", color: "text-sky-400 border-sky-500/40" },
  { id: "large", label: "Large", count: "3,000 users", desc: "~40K events", color: "text-violet-400 border-violet-500/40" },
];
