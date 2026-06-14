import React from 'react';
import { Activity, Brain, UserMinus, UserCheck } from 'lucide-react';
import { UserProfile, SecurityEvaluation } from '../../types';

interface InvestigationConsoleProps {
  selectedUser: UserProfile | null;
  aiEvaluation: SecurityEvaluation | null;
  evalLoading: boolean;
  evalSource: string | null;
  triggerForensicAudit: (userId: string, force?: boolean) => void;
  handleToggleRole: (userId: string, status: string) => void;
}

export function InvestigationConsole({
  selectedUser, aiEvaluation, evalLoading, evalSource, triggerForensicAudit, handleToggleRole
}: InvestigationConsoleProps) {
  return (
    <div className="bg-[#111827] border border-[#1f2d47] p-5 rounded-xl shadow-lg flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
          <Activity className="h-4.5 w-4.5 text-blue-400" />
          Investigation Console
        </h3>
        <p className="text-[11px] text-slate-400 leading-normal">Select an identity pattern to run forensic differentiation logic check.</p>
      </div>

      {selectedUser ? (
        <div className="flex flex-col gap-5">
          
          {/* User Mini Profile */}
          <div className="bg-[#0f172a] p-4 rounded-xl border border-[#1f2d47] relative">
            
            {selectedUser.role_status === 'REVOKED' && (
              <div className="absolute top-3 right-3 bg-red-950/60 border border-red-500/20 text-red-400 text-[10px] uppercase font-bold py-1 px-2.5 rounded-full shrink-0 font-mono">
                Credentials Revoked
              </div>
            )}

            <span className="text-sm font-bold text-white block mt-1 leading-relaxed">{selectedUser.name}</span>
            <span className="text-xs text-blue-400 block font-mono">{selectedUser.role || selectedUser.job_title} · {selectedUser.department}</span>
            
            <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-mono text-slate-400 pt-3 border-t border-slate-900">
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-slate-500">Days Inactive</span>
                <span className="text-slate-200 font-bold block mt-0.5">{selectedUser.days_inactive} days</span>
              </div>
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-slate-500">Scheduled Shifts</span>
                <span className="text-slate-200 block mt-0.5">{selectedUser.typical_start_hour}:00 - {selectedUser.typical_end_hour}:00</span>
              </div>
              <div className="mt-2">
                <span className="block text-[8px] uppercase tracking-wider text-slate-500">Allows Overnight</span>
                <span className="text-slate-200 block mt-0.5">{selectedUser.is_overnight_allowed ? 'YES (Flex work)' : 'NO (Out-of-shift override)'}</span>
              </div>
              <div className="mt-2">
                <span className="block text-[8px] uppercase tracking-wider text-slate-500">Credentials system access</span>
                <span className="text-slate-200 block mt-0.5 truncate">{selectedUser.systems_access || 'AD'}</span>
              </div>
            </div>
          </div>

          {/* AI Assessment Guard Decision Area */}
          <div className="bg-[#0f172a] p-4 rounded-xl border border-[#1f2d47] flex flex-col gap-4">
            
            {evalLoading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-indigo-500" />
                <span className="text-[10px] font-mono uppercase text-indigo-400 tracking-wider">Evaluating temporal access authorization...</span>
              </div>
            ) : aiEvaluation ? (
              <div className="flex flex-col gap-4 animate-fade-in text-xs leading-normal">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Auditor Evaluation Analysis</span>
                  <span className="text-[9px] font-mono bg-indigo-950/80 text-indigo-400 py-0.5 px-2 rounded border border-indigo-500/20">{evalSource} module</span>
                </div>

                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-900 justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Threat Score index</span>
                    <div className={`text-xl font-bold font-mono ${aiEvaluation.suspicionScore > 70 ? 'text-red-400' : aiEvaluation.suspicionScore > 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {aiEvaluation.suspicionScore}%
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Decision protocol</span>
                    <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold shrink-0 font-mono ${
                      aiEvaluation.actionRecommended === 'REVOKE_ROLE' ? 'bg-red-950 text-red-400 border border-red-500/20' :
                      aiEvaluation.actionRecommended === 'WARN_USER' ? 'bg-amber-950/40 text-amber-400 border border-amber-500/20' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {aiEvaluation.actionRecommended}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-900 leading-relaxed font-sans">
                  {aiEvaluation.reasoning}
                </div>

                <button
                  onClick={() => triggerForensicAudit(selectedUser.user_id, true)}
                  className="w-full text-center py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] uppercase font-bold font-mono text-slate-400 hover:text-white rounded transition"
                >
                  Recalculate logic indices
                </button>

              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-center gap-3">
                <p className="text-[11px] text-slate-400">
                  Review temporal logs logs matching midnight and unusual hour actions. Runs smart logic differentiation to check for hacker signature vs legitimate overtime.
                </p>
                <button
                  onClick={() => triggerForensicAudit(selectedUser.user_id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:brightness-110 active:scale-95 text-xs text-white rounded-lg font-mono font-bold tracking-wide shadow transition"
                >
                  <Brain className="h-4.5 w-4.5 shrink-0" />
                  Perform Suspicion Check
                </button>
              </div>
            )}

          </div>

          {/* Role Access Management Buttons */}
          <div className="flex gap-2">
            {selectedUser.role_status === 'ACTIVE' ? (
              <button
                onClick={() => handleToggleRole(selectedUser.user_id, 'ACTIVE')}
                className="flex-1 py-3 px-4 bg-rose-950/40 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                <UserMinus className="h-4 w-4 shrink-0" />
                Revoke authorization
              </button>
            ) : (
              <button
                onClick={() => handleToggleRole(selectedUser.user_id, 'REVOKED')}
                className="flex-1 py-1.5 px-3 bg-emerald-950/40 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                <UserCheck className="h-4 w-4 shrink-0" />
                Restore active role
              </button>
            )}
          </div>

        </div>
      ) : (
        <div className="py-16 text-center text-slate-500 italic text-xs">
          <Activity className="h-8 w-8 mx-auto mb-3 text-slate-800" />
          Select an employee or log row in the log table to examine profile details, trigger night shift filters and revoke credential scopes.
        </div>
      )}

    </div>
  );
}
