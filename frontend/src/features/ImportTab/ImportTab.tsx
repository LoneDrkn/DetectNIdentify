import React, { useState } from 'react';
import { FileSpreadsheet, RefreshCw } from 'lucide-react';

interface ImportTabProps {
  fetchData: () => Promise<void>;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export function ImportTab({ fetchData, showToast }: ImportTabProps) {
  const [usersCsvInput, setUsersCsvInput] = useState<string>(`user_id,username,email,department,job_title,privilege_level,systems_access,last_login,days_inactive,is_active,hire_date
USR00000,pooja.murphy,pooja.murphy@company.com,Executive,Developer,user,AD,2026-02-20,59,true,2024-12-21
USR00001,daniel.singh,daniel.singh@company.com,Compliance,Lead,user,Azure_AD|Salesforce,2026-03-31,20,true,2024-04-04
USR00002,kenneth.moore,kenneth.moore@company.com,Sales,Architect,service-account,EMAIL|PROD_DB,2026-04-07,13,true,2025-12-07`);

  const [eventsCsvInput, setEventsCsvInput] = useState<string>(`timestamp,user_id,username,action,resource,resource_sensitivity,status,source_ip,time_classification
2025-04-20 13:02:00,USR00173,christopher.meyer,admin_operation,HRIS,high,success,192.168.73.220,business_hours
2025-04-22 05:48:00,USR00046,deepika.li,sql_query,Data_Lake,medium,success,192.168.127.154,business_hours
2025-04-22 15:52:00,USR00200,joseph.guo,export_data,Data_Lake,medium,success,192.168.45.173,business_hours`);

  const handleImportCSVs = async () => {
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usersCsv: usersCsvInput, eventsCsv: eventsCsvInput })
      });
      if (!res.ok) throw new Error("Synchronization parsing failure");
      await fetchData();
      showToast("Custom CSV files successfully committed, evaluated and merged into Directory!", "success");
    } catch (err: any) {
      showToast(err.message || 'Error updating log inputs', 'error');
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1f2d47] p-6 rounded-xl flex flex-col gap-6 shadow-lg">
      <div>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
          Durable Dataset Configurator (Direct CSV Entry)
        </h2>
        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
          Directly configure or overwrite the persistence CSV logs. The system parses your entries, evaluates compliance boundaries, and commits to database states!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-400 px-1">
            <span>File: <span className="text-white">identity_users.csv</span></span>
            <span className="text-[10px] text-slate-500">Separators: Commas (,)</span>
          </div>
          <textarea
            value={usersCsvInput}
            onChange={(e) => setUsersCsvInput(e.target.value)}
            className="w-full h-80 bg-[#0a0f1e] border border-[#1f2d47] p-4 rounded-xl text-slate-300 focus:outline-none focus:border-blue-500 leading-normal font-mono"
            placeholder="Paste users CSV content here..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-400 px-1">
            <span>File: <span className="text-white">identity_events.csv</span></span>
            <span className="text-[10px] text-slate-500">Separators: Commas (,)</span>
          </div>
          <textarea
            value={eventsCsvInput}
            onChange={(e) => setEventsCsvInput(e.target.value)}
            className="w-full h-80 bg-[#0a0f1e] border border-[#1f2d47] p-4 rounded-xl text-slate-300 focus:outline-none focus:border-blue-500 leading-normal font-mono"
            placeholder="Paste events CSV content here..."
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-900 text-xs">
        <div className="text-slate-500 max-w-sm">
          <strong className="text-slate-300 block mb-0.5">Experimental Threat Scenario Seeded In Defaults:</strong>
          User <code className="text-rose-400 font-semibold">christopher.meyer</code> is evaluated under nocturnal hours. 
          User <code className="text-rose-400 font-semibold">joseph.guo</code> exports sensitive Data_Lake records.
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setUsersCsvInput(`user_id,username,email,department,job_title,privilege_level,systems_access,last_login,days_inactive,is_active,hire_date
USR00000,pooja.murphy,pooja.murphy@company.com,Executive,Developer,user,AD,2026-02-20,59,true,2024-12-21
USR00001,daniel.singh,daniel.singh@company.com,Compliance,Lead,user,Azure_AD|Salesforce,2026-03-31,20,true,2024-04-04
USR00002,kenneth.moore,kenneth.moore@company.com,Sales,Architect,service-account,EMAIL|PROD_DB,2026-04-07,13,true,2025-12-07
USR00003,sanjana.li,sanjana.li@company.com,Marketing,Director,user,AD|AWS_IAM,2026-04-07,13,true,2023-04-21
USR00004,diya.anderson,diya.anderson@company.com,Marketing,Administrator,user,ServiceNow|AWS_IAM,2026-04-06,14,true,2022-10-18`);
              setEventsCsvInput(`timestamp,user_id,username,action,resource,resource_sensitivity,status,source_ip,time_classification
2025-04-20 13:02:00,USR00173,christopher.meyer,admin_operation,HRIS,high,success,192.168.73.220,business_hours
2025-04-22 05:48:00,USR00046,deepika.li,sql_query,Data_Lake,medium,success,192.168.127.154,business_hours
2025-04-22 15:52:00,USR00200,joseph.guo,export_data,Data_Lake,medium,success,192.168.45.173,business_hours`);
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700/60 rounded-lg text-slate-300 font-mono transition"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleImportCSVs}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 hover:brightness-110 active:scale-95 text-white font-mono font-bold tracking-wide rounded-lg flex items-center gap-2 shadow transition"
          >
            <RefreshCw className="h-4 w-4" />
            Commit & Re-Parse
          </button>
        </div>
      </div>
    </div>
  );
}
