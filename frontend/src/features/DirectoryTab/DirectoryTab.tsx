import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { UserProfile } from '../../types';

interface DirectoryTabProps {
  users: UserProfile[];
  setSelectedUser: (user: UserProfile) => void;
  triggerForensicAudit: (userId: string) => void;
  setActiveTab: (tab: any) => void;
  handleToggleRole: (userId: string, status: string) => void;
}

export function DirectoryTab({ users, setSelectedUser, triggerForensicAudit, setActiveTab, handleToggleRole }: DirectoryTabProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.user_id.toLowerCase().includes(term) ||
      u.department.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  return (
    <div className="bg-[#111827] border border-[#1f2d47] p-5 rounded-xl shadow-lg flex flex-col gap-4">
      
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-0.5">Corporate Directory Database</h3>
          <p className="text-[11px] text-slate-400">Total registered company accounts currently committed to persistent databases.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter users..."
            className="w-full bg-[#0a0f1e] text-xs py-2 pl-9 pr-4 border border-[#1f2d47] text-[#cbd5e1] focus:outline-none focus:border-blue-500 rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u, idx) => (
          <div key={idx} className="bg-[#0f172a] rounded-xl border border-[#1f2d47] p-4 flex flex-col gap-3 relative hover:border-blue-500/20 transition group">
            
            {u.role_status === 'REVOKED' && (
              <div className="absolute top-2.5 right-2.5 bg-red-950/60 border border-red-500/10 text-red-500 text-[8px] uppercase tracking-wider font-bold py-0.5 px-2 rounded-full font-mono">
                Scope revoked
              </div>
            )}

            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition">{u.name}</span>
              <span className="text-[10px] text-slate-500 font-mono italic">{u.email}</span>
            </div>

            <div className="text-[10px] font-mono grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-900 text-slate-400">
              <div>
                <span className="block text-[8px] uppercase text-slate-500 font-bold">Scope / Role</span>
                <span className="text-slate-200 block truncate font-semibold mt-0.5">{u.role || u.job_title}</span>
              </div>
              <div>
                <span className="block text-[8px] uppercase text-slate-500 font-bold">Inactivity</span>
                <span className="text-slate-200 block font-semibold mt-0.5">{u.days_inactive} days</span>
              </div>
              <div>
                <span className="block text-[8px] uppercase text-slate-500 font-bold">department Unit</span>
                <span className="text-slate-200 block truncate font-semibold mt-0.5">{u.department}</span>
              </div>
              <div>
                <span className="block text-[8px] uppercase text-slate-500 font-bold">Privations</span>
                <span className="text-slate-200 block truncate font-semibold mt-0.5">{u.privilege_level}</span>
              </div>
            </div>

            <div className="flex gap-2.5 mt-2.5 border-t border-slate-950 pt-2.5">
              <button
                type="button"
                onClick={() => { setSelectedUser(u); triggerForensicAudit(u.user_id); setActiveTab('alerts'); }}
                className="flex-1 py-1.5 bg-slate-950 border border-slate-800 hover:border-blue-500/20 text-slate-400 hover:text-white rounded text-[10px] font-bold font-mono transition"
              >
                Audit timelogs
              </button>
              <button
                type="button"
                onClick={() => handleToggleRole(u.user_id, u.role_status)}
                className={`px-3.5 py-1.5 rounded text-[10px] font-bold font-mono border transition ${
                  u.role_status === 'ACTIVE' 
                    ? 'bg-rose-950/20 border-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white' 
                    : 'bg-emerald-950/20 border-emerald-500/10 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                }`}
              >
                {u.role_status === 'ACTIVE' ? 'Suspend' : 'Restore'}
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
