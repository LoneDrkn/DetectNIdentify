/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoleStatus = 'ACTIVE' | 'REVOKED';

export interface UserProfile {
  user_id: string;
  name: string;
  username?: string;
  email: string;
  role: string;
  job_title?: string;
  department: string;
  privilege_level?: string;
  systems_access?: string;
  last_login?: string;
  days_inactive?: number;
  is_active?: boolean;
  hire_date?: string;
  typical_start_hour: number; // 0-23
  typical_end_hour: number;   // 0-23
  is_overnight_allowed: boolean;
  is_on_call: boolean;
  role_status: RoleStatus;
  revoked_at?: string;
  revocation_reason?: string;
}

export interface AccessEvent {
  event_id: string;
  user_id: string;
  username?: string;
  timestamp: string; // ISO 8601 format or raw date
  action: string;    // e.g., "READ_RECORDS", "ADMIN_ACCESS" etc
  resource_accessed: string;
  resource?: string;
  resource_sensitivity?: string;
  status?: string;
  ip_address: string;
  source_ip?: string;
  time_classification?: string;
  location: string;
  is_suspicious: boolean;
  suspicion_type?: 'After Hours Access' | 'Massive Data Export' | 'Impossible Travel Pattern' | 'Cross Department Access' | 'Privilege Escalation' | 'Excessive System Access' | 'NONE';
  suspicion_flags: string[];
}

export interface SecurityEvaluation {
  user_id: string;
  suspicionScore: number; // 0 to 100
  isFraudCandidate: boolean;
  reasoning: string;
  actionRecommended: 'REVOKE_ROLE' | 'WARN_USER' | 'MONITOR' | 'NONE';
  evaluated_at: string;
}

export interface DBStatus {
  connected: boolean;
  type: 'MongoDB' | 'JSON_Fallback';
  uri?: string;
  error?: string;
  isFallback?: boolean;
}

export interface SOCStats {
  totalUsers: number;
  activeRoles: number;
  revokedRoles: number;
  totalEvents: number;
  flaggedEvents: number;
  suspiciousRatio: number;
}
