import React from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import { ANOMALY_COLORS } from '../../utils/constants';

interface SynthesisSummaryProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generatorSummary: any;
}

export function SynthesisSummary({ generatorSummary }: SynthesisSummaryProps) {
  if (!generatorSummary) return null;

  return (
    <div className="bg-[#111827] border border-[#1f2d47] p-6 rounded-xl shadow-xl flex flex-col gap-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-4 gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-bold text-white uppercase tracking-wider">Latest Synthesis Summary</span>
        </div>
        <span className="text-xs font-mono text-slate-500 font-bold">{new Date(generatorSummary.generated_at).toLocaleString()}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-[#0f172a] p-4 rounded-xl border border-[#1f2d47]">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Users Generated</span>
          <div className="text-2xl font-bold font-mono text-sky-400">{generatorSummary.users_generated}</div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-[#1f2d47]">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Events log stream</span>
          <div className="text-2xl font-bold font-mono text-violet-400">{generatorSummary.events_generated}</div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-[#1f2d47] flex flex-col gap-2">
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Privilege anomalies</span>
            <div className="text-2xl font-bold font-mono text-orange-400">{generatorSummary.user_anomalies}</div>
          </div>
          <div className="text-[10px] text-slate-400 bg-orange-950/20 py-0.5 px-2 rounded-full border border-orange-500/10 self-start font-mono font-bold leading-none">
            {generatorSummary.user_anomaly_pct}% directories
          </div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-[#1f2d47] flex flex-col gap-2">
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Behavioral anomalies</span>
            <div className="text-2xl font-bold font-mono text-pink-400">{generatorSummary.event_anomalies}</div>
          </div>
          <div className="text-[10px] text-slate-400 bg-pink-950/20 py-0.5 px-2 rounded-full border border-pink-500/10 self-start font-mono font-bold leading-none">
            {generatorSummary.event_anomaly_pct}% records
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-[#0f172a] p-5 rounded-xl border border-[#1f2d47] flex flex-col gap-4">
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">User anomalies distribution</span>
          <div className="flex flex-col gap-3">
            {Object.entries<number>(generatorSummary.user_anomaly_breakdown || {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-xs font-mono">
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${ANOMALY_COLORS[type] || 'bg-slate-800'}`}>{type}</span>
                <div className="w-full bg-slate-900 h-1.5 mx-3 rounded overflow-hidden">
                  <div className="bg-orange-500 h-full" style={{ width: `${(count / generatorSummary.user_anomalies) * 100}%` }} />
                </div>
                <span className="text-slate-400 font-bold shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-xl border border-[#1f2d47] flex flex-col gap-4">
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Behavioral Threat indices</span>
          <div className="flex flex-col gap-3">
            {Object.entries<number>(generatorSummary.event_anomaly_breakdown || {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-xs font-mono">
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${ANOMALY_COLORS[type] || 'bg-slate-800'}`}>{type}</span>
                <div className="w-full bg-slate-900 h-1.5 mx-3 rounded overflow-hidden">
                  <div className="bg-pink-500 h-full" style={{ width: `${(count / generatorSummary.event_anomalies) * 100}%` }} />
                </div>
                <span className="text-slate-400 font-bold shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="bg-[#0f172a] p-5 rounded-xl border border-[#1f2d47]">
        <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Export generated files</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a href="/download/users" target="_blank" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-[#1a2538] hover:text-blue-400 border border-slate-800 hover:border-blue-500/20 text-xs font-mono text-slate-300 font-semibold rounded-lg shadow-sm transition">
            <Download className="h-4 w-4" />
            identity_users.csv
          </a>
          <a href="/download/events" target="_blank" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-[#1a2538] hover:text-blue-400 border border-slate-800 hover:border-blue-500/20 text-xs font-mono text-slate-300 font-semibold rounded-lg shadow-sm transition">
            <Download className="h-4 w-4" />
            identity_events.csv
          </a>
          <a href="/download/user-labels" target="_blank" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-[#1a2538] hover:text-blue-400 border border-slate-800 hover:border-blue-500/20 text-xs font-mono text-slate-300 font-semibold rounded-lg shadow-sm transition">
            <Download className="h-4 w-4" />
            user_labels.csv
          </a>
          <a href="/download/event-labels" target="_blank" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-[#1a2538] hover:text-blue-400 border border-slate-800 hover:border-blue-500/20 text-xs font-mono text-slate-300 font-semibold rounded-lg shadow-sm transition">
            <Download className="h-4 w-4" />
            event_labels.csv
          </a>
        </div>
      </div>

    </div>
  );
}
