import React from 'react';
import { ShieldAlert, Server, Brain } from 'lucide-react';
import { DBStatus } from '../types';

interface HeaderProps {
  dbStatus: DBStatus | null;
}

export function Header({ dbStatus }: HeaderProps) {
  return (
    <header className="bg-slate-950 border-b border-[#1f2d47] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#172554] rounded-lg display flex items-center justify-center border border-blue-500/20">
          <ShieldAlert className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">Aegis Role Guard</h1>
            <span className="text-[10px] bg-blue-900/60 leading-none text-blue-300 font-mono py-1 px-2 rounded-full border border-blue-500/30">v1.2</span>
          </div>
          <p className="text-xs text-slate-400">Differentiating corporate overtime from high-risk intruder logs on persistent clusters.</p>
        </div>
      </div>

      {/* <div className="flex items-center gap-4 text-xs font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Server className="h-3.5 w-3.5" />
          {dbStatus?.isFallback ? (
            <span className="text-amber-400">Fallback JSON</span>
          ) : (
            
          )}
        </div>
        <div className="w-px h-4 bg-slate-800" />
        <div className="flex items-center gap-1.5 text-slate-400">
          <Brain className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-indigo-400">Gemini AI</span>
        </div>
      </div> */}
    </header>
  );
}
