import React from 'react';
import { Sparkles, Radio, Users, FileSpreadsheet } from 'lucide-react';

export type TabType = 'generator' | 'alerts' | 'directory' | 'import';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  setSelectedUser: (user: any) => void;
}

export function Navigation({ activeTab, setActiveTab, setSelectedUser }: NavigationProps) {
  return (
    <nav className="max-w-6xl mx-auto px-4 mt-8">
      <div className="flex bg-[#111827] p-1.5 rounded-xl border border-[#1f2d47]">
        <button
          onClick={() => { setActiveTab('generator'); setSelectedUser(null); }}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg text-xs font-semibold font-mono tracking-wider transition ${
            activeTab === 'generator' ? 'bg-[#1e293b] text-blue-400 shadow-md border border-[#3b82f620]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          IDENTITY DATA GENERATOR
        </button>
        <button
          onClick={() => { setActiveTab('alerts'); setSelectedUser(null); }}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg text-xs font-semibold font-mono tracking-wider transition ${
            activeTab === 'alerts' ? 'bg-[#1e293b] text-blue-400 shadow-md border border-[#3b82f620]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="h-4 w-4" />
          SOC LOG AUDIT
        </button>
        <button
          onClick={() => { setActiveTab('directory'); setSelectedUser(null); }}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg text-xs font-semibold font-mono tracking-wider transition ${
            activeTab === 'directory' ? 'bg-[#1e293b] text-blue-400 shadow-md border border-[#3b82f620]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          EMPLOYEE DIRECTORY
        </button>
        <button
          onClick={() => { setActiveTab('import'); setSelectedUser(null); }}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg text-xs font-semibold font-mono tracking-wider transition ${
            activeTab === 'import' ? 'bg-[#1e293b] text-blue-400 shadow-md border border-[#3b82f620]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          DIRECT CSV ENTRY
        </button>
      </div>
    </nav>
  );
}
