import { useState, useEffect, useCallback } from 'react';
import { UserProfile, AccessEvent, SecurityEvaluation, DBStatus, SOCStats } from '../types';

export function useAppData() {
  const [stats, setStats] = useState<SOCStats | null>(null);
  const [dbStatus, setDbStatus] = useState<DBStatus | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [events, setEvents] = useState<AccessEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal / Sidebar Investigation state
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [aiEvaluation, setAiEvaluation] = useState<SecurityEvaluation | null>(null);
  const [evalLoading, setEvalLoading] = useState<boolean>(false);
  const [evalSource, setEvalSource] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, dbRes, usersRes, eventsRes] = await Promise.all([
        fetch('/api/stats').then(res => res.json()),
        fetch('/api/db-status').then(res => res.json()),
        fetch('/api/users').then(res => res.json()),
        fetch('/api/events').then(res => res.json()),
      ]);

      setStats(statsRes);
      setDbStatus(dbRes);
      setUsers(usersRes);
      setEvents(eventsRes);
    } catch (err) {
      console.error('Error synchronizing real-time analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const triggerForensicAudit = useCallback(async (userId: string, force = false) => {
    setEvalLoading(true);
    setAiEvaluation(null);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, forceEvaluation: force })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAiEvaluation(data.evaluation);
      setEvalSource(data.source);
      
      if (data.user) {
        setSelectedUser(data.user);
        setUsers(prev => prev.map(u => u.user_id === userId ? data.user : u));
      }
    } catch (err: any) {
      showToast(err.message || "Auditing failure on employee timeline", 'error');
    } finally {
      setEvalLoading(false);
    }
  }, [showToast]);

  const handleToggleRole = useCallback(async (userId: string, currentStatus: string, reason?: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
    try {
      const res = await fetch('/api/users/role-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          status: nextStatus,
          reason: reason || (nextStatus === 'REVOKED' ? 'Manual security override response to threat audit' : 'Role status reactivated on secure schedule')
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await fetchData();

      if (selectedUser && selectedUser.user_id === userId) {
        setSelectedUser(data.user);
      }
      showToast(`User ${userId} authorization updated to: ${nextStatus}.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update roll credential status', 'error');
    }
  }, [fetchData, selectedUser, showToast]);

  return {
    stats,
    dbStatus,
    users,
    events,
    loading,
    selectedUser,
    aiEvaluation,
    evalLoading,
    evalSource,
    toastMessage,
    setUsers,
    setSelectedUser,
    setAiEvaluation,
    fetchData,
    showToast,
    triggerForensicAudit,
    handleToggleRole
  };
}
