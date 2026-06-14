import React from 'react';
import { Sparkles, Activity } from 'lucide-react';
import { SIZES } from '../../utils/constants';

interface SynthesisOptionsProps {
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  genOptions: {
    inject_missing_logins: boolean;
    inject_duplicates: boolean;
    inject_mixed_timezones: boolean;
    inject_stale_records: boolean;
  };
  setGenOptions: React.Dispatch<React.SetStateAction<{
    inject_missing_logins: boolean;
    inject_duplicates: boolean;
    inject_mixed_timezones: boolean;
    inject_stale_records: boolean;
  }>>;
  handleGenerateDataset: () => void;
  generatorLoading: boolean;
  genStep: string;
}

export function SynthesisOptions({
  selectedSize, setSelectedSize, genOptions, setGenOptions, handleGenerateDataset, generatorLoading, genStep
}: SynthesisOptionsProps) {
  return (
    <div className="bg-[#111827] border border-[#1f2d47] p-6 rounded-xl shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="flex items-center gap-3 mb-6 relative">
        <div className="w-9 h-9 bg-blue-950/80 rounded-lg flex items-center justify-center border border-blue-500/20">
          <Sparkles className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white leading-relaxed">Synthesis Options</h2>
          <p className="text-xs text-slate-400">Configure parameters for custom corporate directories and events simulation stream.</p>
        </div>
      </div>

      <div className="mb-6">
        <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dataset size</span>
        <div className="grid grid-cols-3 gap-3">
          {SIZES.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSize(s.id)}
              className={`text-left p-4 rounded-xl transition border text-xs leading-normal relative group ${
                selectedSize === s.id 
                  ? 'bg-[#172033] border-blue-500/60 shadow-lg text-blue-400' 
                  : 'bg-[#0f172a] border-[#1f2d47] hover:border-blue-500/20 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-mono font-bold tracking-wide uppercase ${selectedSize === s.id ? 'text-blue-400' : 'text-slate-300'}`}>{s.label}</span>
                {selectedSize === s.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-md animate-pulse" />
                )}
              </div>
              <div className={`font-bold font-mono text-sm leading-none mt-1.5 ${s.color}`}>{s.count}</div>
              <div className="text-[10px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Data quality simulation</span>
        <div className="flex flex-col gap-1.5 bg-[#0f172a] p-4 rounded-xl border border-[#1f2d47]">
          
          <div className="flex items-center justify-between py-2.5 border-b border-slate-900/60">
            <div>
              <span className="text-xs text-slate-300 font-semibold block">Inject missing last-login records</span>
              <span className="text-[10px] text-slate-500">Injects ~5% sparse login markers for directory sprawl</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={genOptions.inject_missing_logins}
                onChange={(e) => setGenOptions(o => ({ ...o, inject_missing_logins: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          <div className="flex items-center justify-between py-2.5 border-b border-slate-900/60">
            <div>
              <span className="text-xs text-slate-300 font-semibold block">Inject duplicate event records</span>
              <span className="text-[10px] text-slate-500">Duplicates ~1% audit logs representing re-transmission retries</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={genOptions.inject_duplicates}
                onChange={(e) => setGenOptions(o => ({ ...o, inject_duplicates: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          <div className="flex items-center justify-between py-2.5 border-b border-slate-900/60">
            <div>
              <span className="text-xs text-slate-300 font-semibold block">Mix timezone offsets and formats</span>
              <span className="text-[10px] text-slate-500">Simulates logs ingested from systems running UTC and GMT formats</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={genOptions.inject_mixed_timezones}
                onChange={(e) => setGenOptions(o => ({ ...o, inject_mixed_timezones: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <div>
              <span className="text-xs text-slate-300 font-semibold block">Inject stale or backdated records</span>
              <span className="text-[10px] text-slate-500">Seeds un-archived, staled hire stamps in corporate directories</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={genOptions.inject_stale_records}
                onChange={(e) => setGenOptions(o => ({ ...o, inject_stale_records: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerateDataset}
        disabled={generatorLoading}
        className="w-full flex items-center justify-center gap-3 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 active:scale-[0.99] transition font-bold font-mono tracking-wider rounded-xl uppercase shadow-lg shadow-blue-500/10 text-white"
      >
        {generatorLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white" />
            <span>{genStep || "SOCIOMETRIC COMPILING..."}</span>
          </>
        ) : (
          <>
            <Activity className="h-4.5 w-4.5" />
            <span>Generate Security Dataset</span>
          </>
        )}
      </button>

    </div>
  );
}
