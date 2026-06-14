import React, { useMemo } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import { AccessEvent, UserProfile } from '../../types';
import { ANOMALY_COLORS } from '../../utils/constants';

interface AuditTableProps {
  events: AccessEvent[];
  users: UserProfile[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filterSuspicious: boolean;
  setFilterSuspicious: (suspicious: boolean) => void;
  setSelectedUser: (user: UserProfile) => void;
  setAiEvaluation: (evalData: any) => void;
  triggerForensicAudit: (userId: string) => void;
}

export function AuditTable({
  events, users, searchTerm, setSearchTerm, filterType, setFilterType, filterSuspicious, setFilterSuspicious, setSelectedUser, setAiEvaluation, triggerForensicAudit
}: AuditTableProps) {

  const userMap = useMemo(() => {
    const map: Record<string, UserProfile> = {};
    for (const u of users) map[u.user_id] = u;
    return map;
  }, [users]);

  const filteredEvents = useMemo(() => events.filter(e => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      e.user_id.toLowerCase().includes(term) ||
      (e.username || '').toLowerCase().includes(term) ||
      e.action.toLowerCase().includes(term) ||
      (e.resource || '').toLowerCase().includes(term);

    const matchesSuspicious = !filterSuspicious || e.is_suspicious;
    
    const matchesType = filterType === 'ALL' || e.suspicion_type === filterType;

    return matchesSearch && matchesSuspicious && matchesType;
  }), [events, searchTerm, filterSuspicious, filterType]);

  return (
    <div className="bg-[#111827] border border-[#1f2d47] p-5 rounded-xl shadow-lg flex flex-col gap-4">
      
      {/* Search & Header */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alerts or users..."
            className="w-full bg-[#0a0f1e] text-xs py-2 pl-9 pr-4 border border-[#1f2d47] text-slate-300 focus:outline-none focus:border-blue-500 rounded-lg"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#0a0f1e] text-xs py-1.5 px-3 border border-[#1f2d47] text-slate-300 rounded-lg focus:outline-none"
          >
            <option value="ALL">All Anomalies</option>
            <option value="After Hours Access">After Hours Access</option>
            <option value="Massive Data Export">Massive Data Export</option>
            <option value="Privilege Escalation">Privilege Escalation</option>
            <option value="Cross Department Access">Cross Department Access</option>
            <option value="Impossible Travel Pattern">Impossible Travel Pattern</option>
            <option value="Excessive System Access">Excessive System Access</option>
          </select>

          <button
            onClick={() => setFilterSuspicious(!filterSuspicious)}
            className={`text-xs py-1.5 px-3 font-semibold rounded-lg font-mono tracking-wider transition ${
              filterSuspicious 
                ? 'bg-rose-950/60 border border-rose-500/30 text-rose-400' 
                : 'bg-slate-800 border border-slate-700 text-slate-400'
            }`}
          >
            {filterSuspicious ? 'Flagged Anomalies only' : 'All raw log logs'}
          </button>
        </div>
      </div>

      {/* Main Table view */}
      <div className="overflow-x-auto max-h-[580px] overflow-y-auto custom-scrollbar border border-slate-900 rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 font-mono border-b border-[#1f2d47] select-none sticky top-0 z-10">
              <th className="p-3">Time / IP</th>
              <th className="p-3">Employee context</th>
              <th className="p-3">Action performed</th>
              <th className="p-3">Target Resource</th>
              <th className="p-3">Threat label</th>
              <th className="p-3 text-right">Scope</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((evt, idx) => {
                const userProfile = userMap[evt.user_id];
                return (
                  <tr key={idx} className="hover:bg-slate-900/60 transition group font-mono">
                    <td className="p-3 leading-relaxed">
                      <span className="text-slate-300 block font-semibold">{evt.timestamp}</span>
                      <span className="text-[10px] text-slate-500 block">{evt.source_ip || evt.ip_address}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-slate-200 block font-bold group-hover:text-blue-400 transition cursor-pointer" onClick={() => { setSelectedUser(userProfile || { user_id: evt.user_id, name: evt.username || evt.user_id, email:'', role:'', department:'', typical_start_hour:9, typical_end_hour:17, is_overnight_allowed:true, is_on_call:true, role_status:'ACTIVE'}); setAiEvaluation(null); }}>
                        {evt.username || evt.user_id}
                      </span>
                      <span className="text-[10px] text-slate-500 block">{userProfile?.department || 'Scope Mismatched'}</span>
                    </td>
                    <td className="p-3 font-semibold uppercase tracking-wider text-[11px] text-[#cbd5e1]">
                      {evt.action}
                    </td>
                    <td className="p-3">
                      <span className="text-slate-300 block">{evt.resource || evt.resource_accessed}</span>
                      <span className={`text-[10px] uppercase font-bold ${evt.resource_sensitivity === 'high' ? 'text-rose-400' : 'text-slate-500'}`}>{evt.resource_sensitivity} risk</span>
                    </td>
                    <td className="p-3">
                      {evt.is_suspicious ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${ANOMALY_COLORS[evt.suspicion_type || ''] || 'bg-rose-950 text-rose-400 border border-rose-500/20'}`}>
                          {evt.suspicion_type}
                        </span>
                      ) : (
                        <span className="text-emerald-500 flex items-center gap-1 text-[10px] uppercase font-bold">
                          <CheckCircle2 className="h-3 w-3 shrink-0" /> Authorized
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => { setSelectedUser(userProfile || { user_id: evt.user_id, name: evt.username || evt.user_id, email:'', role:'', department:'', typical_start_hour:9, typical_end_hour:17, is_overnight_allowed:true, is_on_call:true, role_status:'ACTIVE'}); triggerForensicAudit(evt.user_id); }}
                        className="py-1 px-3 bg-slate-900 border border-[#1f2d47] hover:border-blue-500/40 text-blue-400 hover:text-white rounded text-[10px] font-bold font-mono transition"
                      >
                        Audit
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 selection:none italic">
                  No logs matching search criteria exist. Synthesize fresh logs in the Generator.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
