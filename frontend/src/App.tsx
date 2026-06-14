import React, { useState } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

import { GeneratorTab } from './features/GeneratorTab/GeneratorTab';
import { AlertsTab } from './features/AlertsTab/AlertsTab';
import { DirectoryTab } from './features/DirectoryTab/DirectoryTab';
import { ImportTab } from './features/ImportTab/ImportTab';

import { useAppData } from './hooks/useAppData';

export default function App() {
  const {
    dbStatus,
    users,
    events,
    selectedUser,
    aiEvaluation,
    evalLoading,
    evalSource,
    toastMessage,
    setSelectedUser,
    setAiEvaluation,
    fetchData,
    showToast,
    triggerForensicAudit,
    handleToggleRole
  } = useAppData();

  const [activeTab, setActiveTab] = useState<TabType>('generator');

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-[#e2e8f0] font-sans antialiased">
      
      <Header dbStatus={dbStatus} />

      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setSelectedUser={setSelectedUser} 
      />

      <main className="max-w-6xl mx-auto px-4 mt-6">
        
        {activeTab === 'generator' && (
          <GeneratorTab 
            fetchData={fetchData} 
            showToast={showToast} 
            setSelectedUser={setSelectedUser} 
            setAiEvaluation={setAiEvaluation} 
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsTab 
            events={events}
            users={users}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            aiEvaluation={aiEvaluation}
            setAiEvaluation={setAiEvaluation}
            triggerForensicAudit={triggerForensicAudit}
            handleToggleRole={handleToggleRole}
            evalLoading={evalLoading}
            evalSource={evalSource}
          />
        )}

        {activeTab === 'directory' && (
          <DirectoryTab 
            users={users}
            setSelectedUser={setSelectedUser}
            triggerForensicAudit={triggerForensicAudit}
            setActiveTab={setActiveTab}
            handleToggleRole={handleToggleRole}
          />
        )}

        {activeTab === 'import' && (
          <ImportTab 
            fetchData={fetchData} 
            showToast={showToast} 
          />
        )}

      </main>

      <Toast toastMessage={toastMessage} />

      <Footer />

    </div>
  );
}
