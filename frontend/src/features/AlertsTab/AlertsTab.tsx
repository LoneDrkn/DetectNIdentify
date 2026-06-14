import React, { useState } from 'react';
import { AuditTable } from './AuditTable';
import { InvestigationConsole } from './InvestigationConsole';
import { AccessEvent, UserProfile, SecurityEvaluation } from '../../types';

interface AlertsTabProps {
  events: AccessEvent[];
  users: UserProfile[];
  selectedUser: UserProfile | null;
  setSelectedUser: (user: UserProfile | null) => void;
  aiEvaluation: SecurityEvaluation | null;
  setAiEvaluation: (evalData: any) => void;
  triggerForensicAudit: (userId: string, force?: boolean) => void;
  handleToggleRole: (userId: string, status: string) => void;
  evalLoading: boolean;
  evalSource: string | null;
}

export function AlertsTab({
  events, users, selectedUser, setSelectedUser, aiEvaluation, setAiEvaluation, triggerForensicAudit, handleToggleRole, evalLoading, evalSource
}: AlertsTabProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterSuspicious, setFilterSuspicious] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('ALL');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Logs Audit Table Column */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <AuditTable 
          events={events}
          users={users}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filterSuspicious={filterSuspicious}
          setFilterSuspicious={setFilterSuspicious}
          setSelectedUser={setSelectedUser}
          setAiEvaluation={setAiEvaluation}
          triggerForensicAudit={triggerForensicAudit}
        />
      </div>

      {/* Live Interactive Investigation Console Column */}
      <div className="flex flex-col gap-4">
        <InvestigationConsole 
          selectedUser={selectedUser}
          aiEvaluation={aiEvaluation}
          evalLoading={evalLoading}
          evalSource={evalSource}
          triggerForensicAudit={triggerForensicAudit}
          handleToggleRole={handleToggleRole}
        />
      </div>

    </div>
  );
}
