import React from 'react';
import { Info } from 'lucide-react';

export function BreakdownIndicators() {
  return (
    <>
      <div className="bg-[#111827] border border-[#1f2d47] p-6 rounded-xl shadow-lg">
        <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Anomaly injection indices</span>
        
        <div className="flex flex-col gap-4">
          
          <div>
            <span className="block text-xs font-semibold text-slate-300 mb-2">User anomalies standard injection</span>
            <div className="flex flex-wrap gap-1.5">
              {["Stale Admin Account", "Over Privileged User", "Dormant Privileged User", "Orphaned Service Account", "Terminated Employee With Access"].map(t => (
                <span key={t} className="text-[10px] bg-slate-800 border border-slate-700/60 font-mono text-slate-400 py-1 px-2.5 rounded-full shrink-0">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full h-px bg-slate-900" />

          <div>
            <span className="block text-xs font-semibold text-slate-300 mb-2">Access anomaly vectors seeded</span>
            <div className="flex flex-wrap gap-1.5">
              {["After Hours Access", "Massive Data Export", "Excessive System Access", "Cross Department Access", "Privilege Escalation", "Impossible Travel Pattern"].map(t => (
                <span key={t} className="text-[10px] bg-slate-800 border border-slate-700/60 font-mono text-slate-400 py-1 px-2.5 rounded-full shrink-0">
                  {t}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="bg-[#1c2e47]/30 border border-blue-500/20 p-5 rounded-xl flex gap-3 text-xs leading-relaxed text-blue-300 shadow">
        <Info className="h-4.5 w-4.5 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-0.5">Differentiator Simulation Insight:</strong>
          The generator automatically injects realistic threat vectors. For example, a developer completing commits at 2 AM is tagged with an acceptable overnight deviation. In contrast, sales or marketing credentials accessing the Security SIEM or Core Vaults at 2 AM are flagged as active compromise threats.
        </div>
      </div>
    </>
  );
}
