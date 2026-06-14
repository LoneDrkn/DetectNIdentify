/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MongoClient, Db } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { UserProfile, AccessEvent, SecurityEvaluation, DBStatus, SOCStats, RoleStatus } from '../types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_CSV_PATH = path.join(DATA_DIR, 'identity_users.csv');
const EVENTS_CSV_PATH = path.join(DATA_DIR, 'identity_events.csv');
const JSON_DB_PATH = path.join(DATA_DIR, 'fallback_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/// Initial default CSV contents matching user provided security dataset
const DEFAULT_USERS_CSV = `user_id,username,email,department,job_title,privilege_level,systems_access,last_login,days_inactive,is_active,hire_date
USR00000,pooja.murphy,pooja.murphy@company.com,Executive,Developer,user,AD,2026-02-20,59,true,2024-12-21
USR00001,daniel.singh,daniel.singh@company.com,Compliance,Lead,user,Azure_AD|Salesforce,2026-03-31,20,true,2024-04-04
USR00002,kenneth.moore,kenneth.moore@company.com,Sales,Architect,service-account,EMAIL|PROD_DB,2026-04-07,13,true,2025-12-07
USR00003,sanjana.li,sanjana.li@company.com,Marketing,Director,user,AD|AWS_IAM,2026-04-07,13,true,2023-04-21
USR00004,diya.anderson,diya.anderson@company.com,Marketing,Administrator,user,ServiceNow|AWS_IAM,2026-04-06,14,true,2022-10-18
USR00005,george.lim,george.lim@company.com,Engineering,Administrator,user,GCP,2026-02-22,57,true,2025-05-25
USR00006,kevin.ramirez,kevin.ramirez@company.com,Legal,Architect,power-user,Azure_AD|Salesforce|SIEM,2026-03-05,46,true,2024-05-08
USR00007,robert.smith,robert.smith@company.com,Operations,Lead,user,VPN|Okta,2026-03-07,44,true,2025-05-25
USR00008,thomas.iyer,thomas.iyer@company.com,Sales,Administrator,user,AD|AWS_IAM,2026-02-22,57,true,2022-04-27
USR00009,aditya.burke,aditya.burke@company.com,Finance,Architect,power-user,SIEM|Azure_AD,2026-03-28,23,true,2024-02-27
USR00010,jacob.patel,jacob.patel@company.com,Marketing,Architect,user,PROD_DB|ADMIN_SYS,2026-04-19,1,true,2025-09-20
USR00011,maria.o'brien,maria.o'brien@company.com,Security,Administrator,user,SIEM,2026-04-04,16,true,2025-09-10
USR00012,vikram.white,vikram.white@company.com,Operations,Director,service-account,SIEM|Azure_AD,2026-03-26,25,true,2024-12-04
USR00013,jonathan.jackson,jonathan.jackson@company.com,Sales,Administrator,user,EMAIL,2026-03-17,34,true,2022-05-30
USR00014,david.thomas,david.thomas@company.com,Support,Architect,user,ADMIN_SYS,2026-04-18,2,true,2025-06-17
USR00015,sophia.white,sophia.white@company.com,Security,Developer,admin,Okta|SIEM|Azure_AD|ServiceNow|AWS_IAM|VPN|ADMIN_SYS,2026-03-27,24,true,2025-10-04
`;

const DEFAULT_EVENTS_CSV = `timestamp,user_id,username,action,resource,resource_sensitivity,status,source_ip,time_classification
2025-04-20 13:02:00,USR00173,christopher.meyer,admin_operation,HRIS,high,success,192.168.73.220,business_hours
2025-04-22 05:48:00,USR00046,deepika.li,sql_query,Data_Lake,medium,success,192.168.127.154,business_hours
2025-04-22 15:52:00,USR00200,joseph.guo,export_data,Data_Lake,medium,success,192.168.45.173,business_hours
2025-04-23 03:32:00,USR00021,rohan.harris,admin_operation,BI_Tool,low,success,192.168.107.56,business_hours
2025-04-24 16:05:00,USR00164,anjali.sun,api_call,File_Share,low,success,192.168.117.89,business_hours
2025-04-25 10:45:00,USR00096,edward.thomas,api_call,HRIS,high,success,192.168.150.182,unusual_hours
2025-04-28 00:44:00,USR00059,thomas.lewis,file_access,File_Share,low,success,192.168.196.37,unusual_hours
2025-04-28 01:31:00,USR00299,leila.lee,export_data,Email_Archive,medium,success,192.168.46.89,night
2025-04-29 22:34:00,USR00028,paul.singh,file_access,Data_Lake,medium,success,192.168.208.90,business_hours
2025-04-30 02:52:00,USR00210,charles.lopez,file_access,GL_System,high,success,192.168.108.223,business_hours
2025-04-30 10:13:00,USR00179,xiulan.sharma,export_data,Admin_Console,medium,success,192.168.250.222,unusual_hours
2025-05-01 10:31:00,USR00121,joseph.perez,sql_query,HRIS,high,success,192.168.247.189,business_hours
2025-05-03 00:48:00,USR00150,daniel.wagner,login,HRIS,high,success,192.168.65.82,business_hours
2025-05-05 16:15:00,USR00036,nicholas.harris,api_call,File_Share,low,success,192.168.57.48,unusual_hours
2025-05-07 00:26:00,USR00061,sophia.hernandez,api_call,SIEM,medium,success,192.168.253.9,unusual_hours
2025-05-07 06:00:00,USR00010,jacob.patel,login,HRIS,high,success,192.168.42.176,business_hours
2025-05-08 16:48:00,USR00085,varun.rao,sql_query,File_Share,low,success,192.168.201.181,business_hours
2025-05-08 19:40:00,USR00002,kenneth.moore,api_call,BI_Tool,low,success,192.168.105.69,business_hours
2025-05-09 01:36:00,USR00087,aditya.taylor,api_call,HRIS,high,success,192.168.53.68,business_hours
2025-05-10 08:37:00,USR00151,priya.white,admin_operation,HRIS,high,success,192.168.142.233,business_hours
2025-05-10 08:50:00,USR00004,diya.anderson,file_access,PROD_DB,high,success,192.168.92.48,business_hours
2025-05-12 07:58:00,USR00032,pooja.martin,file_access,HRIS,high,success,192.168.27.56,business_hours
2025-05-14 13:52:00,USR00211,rajesh.gupta,login,GL_System,high,success,192.168.159.102,business_hours
2025-05-15 01:23:00,USR00270,robert.ramirez,login,PROD_DB,high,success,192.168.99.209,business_hours
2025-05-15 13:58:00,USR00222,jason.rizzo,login,SIEM,medium,success,192.168.27.75,business_hours
2025-05-18 04:24:00,USR00122,nisha.li,admin_operation,Email_Archive,medium,success,192.168.61.14,business_hours
2025-05-19 19:28:00,USR00124,david.russo,admin_operation,Admin_Console,medium,success,192.168.72.36,business_hours
2025-05-19 20:19:00,USR00270,robert.ramirez,sql_query,Email_Archive,medium,success,192.168.27.179,business_hours
2025-05-19 23:19:00,USR00111,james.sharma,api_call,SIEM,medium,success,192.168.13.20,business_hours
2025-05-20 09:52:00,USR00049,thomas.kang,sql_query,SIEM,medium,success,192.168.191.158,unusual_hours
2025-05-21 14:25:00,USR00252,nadia.singh,sql_query,GL_System,high,failure,192.168.32.148,business_hours
2025-05-22 10:46:00,USR00200,joseph.guo,sql_query,GL_System,high,success,192.168.83.22,business_hours
2025-05-24 18:49:00,USR00183,kenneth.johnson,login,Admin_Console,medium,success,192.168.188.0,night
2025-05-26 17:27:00,USR00197,kevin.white,export_data,File_Share,low,success,192.168.49.117,unusual_hours
2025-05-27 07:15:00,USR00242,deepika.garcia,admin_operation,Email_Archive,medium,success,192.168.161.217,business_hours
2025-05-27 10:34:00,USR00188,meera.schmidt,admin_operation,File_Share,low,success,192.168.249.147,business_hours
2025-05-28 01:58:00,USR00213,riya.colombo,api_call,BI_Tool,low,success,192.168.71.139,business_hours
2025-05-30 20:55:00,USR00200,joseph.guo,login,Email_Archive,medium,success,192.168.37.32,business_hours
2025-06-03 04:19:00,USR00221,rajesh.smith,file_access,GL_System,high,success,192.168.212.80,business_hours
2025-06-03 06:40:00,USR00166,amara.smith,sql_query,BI_Tool,low,success,192.168.21.0,business_hours
2025-06-03 09:48:00,USR00231,rajesh.pillai,sql_query,HRIS,high,success,192.168.169.115,business_hours
2025-06-04 12:02:00,USR00294,kenneth.colombo,file_access,PROD_DB,high,success,192.168.132.159,business_hours
2025-06-05 08:59:00,USR00104,jeffrey.ghosh,admin_operation,GL_System,high,failure,192.168.114.178,business_hours
2025-06-05 17:43:00,USR00078,christopher.menon,api_call,GL_System,high,success,192.168.216.148,business_hours
2025-06-05 20:54:00,USR00166,amara.smith,export_data,File_Share,low,success,192.168.92.167,business_hours
2025-06-07 12:18:00,USR00060,vikram.gonzalez,api_call,BI_Tool,low,success,192.168.8.149,business_hours
2025-06-08 04:12:00,USR00004,diya.anderson,export_data,File_Share,low,success,192.168.166.114,business_hours
2025-06-09 10:45:00,USR00173,christopher.meyer,login,Email_Archive,medium,failure,192.168.27.18,business_hours
2025-06-09 23:49:00,USR00105,gary.murphy,login,Data_Lake,medium,success,192.168.249.115,business_hours
2025-06-10 11:37:00,USR00297,sofia.schmidt,sql_query,Customer_Vault,high,success,192.168.131.167,business_hours
2025-06-10 15:32:00,USR00241,amitabh.harris,export_data,Data_Lake,medium,success,192.168.198.193,business_hours
2025-06-11 07:32:00,USR00281,nikhil.verma,file_access,SIEM,medium,success,192.168.165.169,business_hours
`;

// Seed CSV files if they are not present, or if they correspond to old dummy content
export function seedCSVFiles() {
  const needsSeeding = !fs.existsSync(USERS_CSV_PATH) || 
                       (fs.existsSync(USERS_CSV_PATH) && fs.readFileSync(USERS_CSV_PATH, 'utf8').includes('John Doe'));

  if (needsSeeding) {
    fs.writeFileSync(USERS_CSV_PATH, DEFAULT_USERS_CSV, 'utf8');
    fs.writeFileSync(EVENTS_CSV_PATH, DEFAULT_EVENTS_CSV, 'utf8');
    console.log('Seeded and upgraded identity datasets with the new user_role and security traces');
  }
}

// Memory-backed Fallback Store representing our database collections
interface FallbackStore {
  users: UserProfile[];
  events: AccessEvent[];
  evaluations: SecurityEvaluation[];
}

let fallbackStore: FallbackStore = {
  users: [],
  events: [],
  evaluations: [],
};

// Load fallback store from JSON file if it exists, otherwise initialize
function loadFallbackStore() {
  if (fs.existsSync(JSON_DB_PATH)) {
    try {
      fallbackStore = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf8'));
    } catch (e) {
      console.error('Error parsing fallback DB JSON, resetting:', e);
    }
  }
}

// Save fallback store to JSON file
function saveFallbackStore() {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(fallbackStore, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing fallback DB JSON:', e);
  }
}

// MongoDB Connection Client and database reference
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let useFallback = true;
let connectionError: string | undefined = undefined;

// Connect to MongoDB
export async function initializeDatabase(): Promise<DBStatus> {
  seedCSVFiles();
  loadFallbackStore();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    useFallback = true;
    connectionError = "MONGODB_URI environment variable is not defined.";
    console.log('MongoDB URI is missing. Operating in persistent JSON fallback mode.');
    await syncFilesToDatabase();
    return getDBStatus();
  }

  try {
    console.log(`Attempting to connect to MongoDB...`);
    mongoClient = new MongoClient(uri, {
      connectTimeoutMS: 8000,
      serverSelectionTimeoutMS: 8000,
    });
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    useFallback = false;
    connectionError = undefined;

    console.log('Successfully connected to MongoDB!');

    // Initialize collections & indices if needed
    await mongoDb.collection('users').createIndex({ user_id: 1 }, { unique: true });
    await mongoDb.collection('events').createIndex({ event_id: 1 }, { unique: true });
    await mongoDb.collection('evaluations').createIndex({ user_id: 1 });

    // Bootstrap data from CSVs into MongoDB
    await syncFilesToDatabase();

    return getDBStatus();
  } catch (e: any) {
    useFallback = true;
    connectionError = e.message || String(e);
    console.error('MongoDB Connection Failed, falling back to JSON storage:', connectionError);
    // Sync fallback store from CSV files to make sure we're fully loaded anyway
    await syncFilesToDatabase();
    return getDBStatus();
  }
}

// Get DB connection status
export function getDBStatus(): DBStatus {
  return {
    connected: !useFallback && mongoDb !== null,
    type: useFallback ? 'JSON_Fallback' : 'MongoDB',
    uri: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + '...' : undefined,
    error: connectionError,
  };
}

// Parsing logic for CSV files supporting both the standard schema and the user's generated schemas
export function parseUsersCSV(raw: string): UserProfile[] {
  const lines = raw.split('\n').filter(l => l.trim() !== '');
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map(h => unquote(h));
  const usersList: UserProfile[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => unquote(p));
    if (parts.length < headers.length) continue;

    const u: any = {};
    headers.forEach((header, index) => {
      u[header] = parts[index];
    });

    const uid = u.user_id;
    if (!uid) continue;

    const username = u.username || u.name || uid;
    const email = u.email || `${username}@company.com`;
    const department = u.department || 'Engineering';
    const role = u.role || u.job_title || 'Developer';
    
    // Inferred timezone schedules and night allowances based on roles/departments dynamically
    let start_hour = 9;
    let end_hour = 17;
    let overnight = false;
    let on_call = false;

    if (['Security', 'Engineering', 'IT', 'Support', 'Operations'].includes(department)) {
      overnight = true;
      on_call = true;
    }

    if (u.typical_start_hour !== undefined) start_hour = parseInt(u.typical_start_hour) || 9;
    if (u.typical_end_hour !== undefined) end_hour = parseInt(u.typical_end_hour) || 17;
    if (u.is_overnight_allowed !== undefined) overnight = u.is_overnight_allowed.toLowerCase() === 'true';
    if (u.is_on_call !== undefined) on_call = u.is_on_call.toLowerCase() === 'true';

    usersList.push({
      user_id: uid,
      name: username.split('.').map((n: string) => n.charAt(0).toUpperCase() + n.slice(1)).join(' '),
      username: username,
      email,
      role,
      job_title: role,
      department,
      privilege_level: u.privilege_level || 'user',
      systems_access: u.systems_access || 'AD',
      last_login: u.last_login || '',
      days_inactive: parseInt(u.days_inactive) || 0,
      is_active: u.is_active !== undefined ? u.is_active.toLowerCase() === 'true' : true,
      hire_date: u.hire_date || '',
      typical_start_hour: start_hour,
      typical_end_hour: end_hour,
      is_overnight_allowed: overnight,
      is_on_call: on_call,
      role_status: (u.role_status as RoleStatus) || 'ACTIVE',
    });
  }
  return usersList;
}

// Helper: strip surrounding quotes from a CSV field value
function unquote(s: string): string {
  s = s.trim();
  if (s.startsWith('"') && s.endsWith('"')) {
    return s.slice(1, -1).replace(/""/g, '"');
  }
  return s;
}

export function parseEventsCSV(raw: string): any[] {
  const lines = raw.split('\n').filter(l => l.trim() !== '');
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map(h => unquote(h));
  const eventsList: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => unquote(p));
    if (parts.length < headers.length) continue;

    const e: any = {};
    headers.forEach((header, index) => {
      e[header] = parts[index];
    });

    const eid = e.event_id || `EVT_${1000 + i}`;
    const uid = e.user_id || 'USR_UNKNOWN';
    const timestamp = e.timestamp || new Date().toISOString();
    const action = e.action || 'api_call';
    const resource = e.resource || e.resource_accessed || 'Unknown Resource';
    const resource_sensitivity = e.resource_sensitivity || 'medium';
    const status = e.status || 'success';
    const ip = e.source_ip || e.ip_address || '127.0.0.1';
    const time_classification = e.time_classification || 'business_hours';

    eventsList.push({
      event_id: eid,
      user_id: uid,
      username: e.username || '',
      timestamp,
      action,
      resource,
      resource_accessed: resource,
      resource_sensitivity,
      status,
      ip_address: ip,
      source_ip: ip,
      time_classification,
    });
  }
  return eventsList;
}

// Calculate rule-based suspicious indicators on events leveraging standard classifications of user logs
export function analyzeEventRuleSuspicion(event: any, user: UserProfile | undefined): AccessEvent {
  const timestamp = event.timestamp;
  let accessHour = 12; // default
  try {
    const dateObj = new Date(timestamp.replace(' ', 'T'));
    accessHour = dateObj.getUTCHours();
  } catch (err) {}

  const flags: string[] = [];
  let isSuspicious = false;
  let suspicionType: AccessEvent['suspicion_type'] = 'NONE';

  // 1. Check Off-hours based on user configuration or classification tags
  const isNightShift = event.time_classification === 'night' || event.time_classification === 'unusual_hours' || (accessHour >= 0 && accessHour <= 5);
  
  if (isNightShift) {
    if (!user) {
      isSuspicious = true;
      suspicionType = 'After Hours Access';
      flags.push('Anomalous off-hours access (Unknown User Proxy)');
    } else if (user.is_on_call) {
      flags.push('Off-hours access (Legitimate: User designated as On-Call alert responder)');
    } else if (user.is_overnight_allowed) {
      flags.push('Off-hours access (Legitimate: Overnight workflows permitted)');
    } else {
      isSuspicious = true;
      suspicionType = 'After Hours Access';
      flags.push('Threat Trigger: Account accessed sensitive core outside normal operational hours without shift override');
    }
  }

  // 2. Accessing high-risk functions: DB exports, credential modifications
  if (event.action === 'export_data' || event.action === 'EXPORT_DATABASE') {
    isSuspicious = true;
    flags.push('Alert: Potential bulk data exfiltration attempt (Export command issued)');
    if (suspicionType === 'NONE') suspicionType = 'Massive Data Export';
  }

  // 3. Failed transactions or accesses
  if (event.status === 'failure') {
    isSuspicious = true;
    flags.push('Audit Warn: Authentication / Authorisation failure recorded on target resource');
    if (suspicionType === 'NONE') suspicionType = 'Excessive System Access';
  }

  // 4. Geolocation mapping based on IP structures
  let location = 'HQ Secure Office';
  const ip = event.ip_address;
  if (ip.startsWith('192.168.73.')) location = 'HQ Chicago Private Subnet';
  else if (ip.startsWith('192.168.127.')) location = 'London VPN Entry Node';
  else if (ip.startsWith('192.168.45.')) location = 'San Francisco Office (Wired)';
  else if (ip.startsWith('192.168.107.')) location = 'Seoul Cloud Proxy Gateway';
  else if (ip.startsWith('192.168.46.')) location = 'Dublin Remote Office';
  else if (ip.startsWith('192.168.250.')) location = 'Eastern Europe VPN Gateway';
  else if (ip.startsWith('192.168.196.')) location = 'Stoke-On-Trent Residential';
  else if (ip.startsWith('192.168.')) {
    const octet = parseInt(ip.split('.')[2]) || 0;
    if (octet % 3 === 0) location = 'New York branch office';
    else if (octet % 3 === 1) location = 'Frankfurt Remote Portal';
    else location = 'Paris Gateway node';
  } else {
    location = 'Global SD-WAN Gateway';
  }

  // 5. Department Mismatch Verification
  if (user) {
    const lowerRes = event.resource_accessed.toLowerCase();
    if (user.department === 'Compliance' && lowerRes.includes('vault')) {
      // legitimate
    } else if (user.department === 'Marketing' && (lowerRes.includes('db') || lowerRes.includes('hris') || lowerRes.includes('gl_system'))) {
      isSuspicious = true;
      suspicionType = 'Cross Department Access';
      flags.push(`Anomalous Scope: Marketing specialist requesting access to sensitive resource ${event.resource_accessed}`);
    } else if (user.department === 'Sales' && lowerRes.includes('siem')) {
      isSuspicious = true;
      suspicionType = 'Cross Department Access';
      flags.push('Anomalous Scope: Sales account querying security console logs');
    } else if (event.action === 'admin_operation' && (user.privilege_level === 'user' || !user.privilege_level)) {
      isSuspicious = true;
      if (suspicionType === 'NONE') suspicionType = 'Privilege Escalation';
      flags.push(`Privilege Escalation: Standard user performing admin operation`);
    } else if (!event.ip_address.startsWith('192.168.') && event.resource_sensitivity === 'high') {
      isSuspicious = true;
      if (suspicionType === 'NONE') suspicionType = 'Impossible Travel Pattern';
      flags.push(`Foreign IP accessing high-sensitivity resource: ${event.ip_address}`);
    }
  }

  return {
    event_id: event.event_id,
    user_id: event.user_id,
    timestamp: event.timestamp,
    action: event.action,
    resource: event.resource,
    resource_accessed: event.resource_accessed,
    resource_sensitivity: event.resource_sensitivity,
    status: event.status,
    ip_address: ip,
    source_ip: ip,
    time_classification: event.time_classification,
    location: location,
    is_suspicious: isSuspicious,
    suspicion_type: suspicionType,
    suspicion_flags: flags,
  };
}

// Sync CSV storage files to current DB engine (MongoDB or JSON Fallback)
export async function syncFilesToDatabase() {
  seedCSVFiles();

  const usersRaw = fs.readFileSync(USERS_CSV_PATH, 'utf8');
  const eventsRaw = fs.readFileSync(EVENTS_CSV_PATH, 'utf8');

  const parsedUsers = parseUsersCSV(usersRaw);
  const parsedEvents = parseEventsCSV(eventsRaw);

  const finalUsers = [...parsedUsers];

  // Auto-healing loop: ensure any User active in the log trace also exists in the Directory database
  parsedEvents.forEach(e => {
    const exists = finalUsers.some(u => u.user_id === e.user_id);
    if (!exists && e.user_id !== 'USR_UNKNOWN') {
      const parts = e.username ? e.username.split('.') : ['unknown', 'employee'];
      const formattedName = parts.map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      
      let department = 'Engineering';
      if (e.resource.toLowerCase().includes('hris')) department = 'HR';
      else if (e.resource.toLowerCase().includes('gl_system')) department = 'Finance';
      else if (e.resource.toLowerCase().includes('vault')) department = 'Compliance';
      else if (e.resource.toLowerCase().includes('siem')) department = 'Security';
      else if (e.resource.toLowerCase().includes('bi_tool')) department = 'Marketing';

      finalUsers.push({
        user_id: e.user_id,
        name: formattedName,
        username: e.username || e.user_id.toLowerCase(),
        email: `${e.username || e.user_id.toLowerCase()}@company.com`,
        role: 'Senior Specialist',
        job_title: 'Senior Specialist',
        department,
        typical_start_hour: 9,
        typical_end_hour: 17,
        is_overnight_allowed: true,
        is_on_call: true,
        role_status: 'ACTIVE',
      });
    }
  });

  if (useFallback) {
    // Preserve any manual DB overrides (e.g. revokes) from preexisting state
    finalUsers.forEach(u => {
      const existing = fallbackStore.users.find(ex => ex.user_id === u.user_id);
      if (existing) {
        u.role_status = existing.role_status;
        u.revoked_at = existing.revoked_at;
        u.revocation_reason = existing.revocation_reason;
      }
    });

    const analyzedEvents = parsedEvents.map(e => {
      const user = finalUsers.find(u => u.user_id === e.user_id);
      return analyzeEventRuleSuspicion(e, user);
    });

    fallbackStore.users = finalUsers;
    fallbackStore.events = analyzedEvents;
    saveFallbackStore();
  } else {
    if (mongoDb) {
      for (const u of finalUsers) {
        const existing = await mongoDb.collection<UserProfile>('users').findOne({ user_id: u.user_id });
        if (existing) {
          u.role_status = existing.role_status;
          u.revoked_at = existing.revoked_at;
          u.revocation_reason = existing.revocation_reason;
        }
        await mongoDb.collection('users').updateOne(
          { user_id: u.user_id },
          { $set: u },
          { upsert: true }
        );
      }

      const loadedUsers = await mongoDb.collection<UserProfile>('users').find().toArray();
      const analyzedEvents = parsedEvents.map(e => {
        const user = loadedUsers.find(u => u.user_id === e.user_id);
        return analyzeEventRuleSuspicion(e, user);
      });

      for (const ev of analyzedEvents) {
        await mongoDb.collection('events').updateOne(
          { event_id: ev.event_id },
          { $set: ev },
          { upsert: true }
        );
      }
    }
  }
}

// DATABASE OPERATIONS API IMPLEMENTATIONS

// Get statistics
export async function getStats(): Promise<SOCStats> {
  let users: UserProfile[] = [];
  let events: AccessEvent[] = [];

  if (useFallback) {
    users = fallbackStore.users;
    events = fallbackStore.events;
  } else if (mongoDb) {
    users = await mongoDb.collection<UserProfile>('users').find().toArray();
    events = await mongoDb.collection<AccessEvent>('events').find().toArray();
  }

  const totalUsers = users.length;
  const activeRoles = users.filter(u => u.role_status === 'ACTIVE').length;
  const revokedRoles = users.filter(u => u.role_status === 'REVOKED').length;
  const totalEvents = events.length;
  const flaggedEvents = events.filter(e => e.is_suspicious).length;

  return {
    totalUsers,
    activeRoles,
    revokedRoles,
    totalEvents,
    flaggedEvents,
    suspiciousRatio: totalEvents > 0 ? (flaggedEvents / totalEvents) * 100 : 0
  };
}

// Get all users
export async function getUsers(): Promise<UserProfile[]> {
  if (useFallback) {
    return fallbackStore.users;
  }
  if (mongoDb) {
    return await mongoDb.collection<UserProfile>('users').find().toArray();
  }
  return [];
}

// Change user role status
export async function setRoleStatus(userId: string, status: RoleStatus, reason?: string): Promise<UserProfile | null> {
  const timestampStr = new Date().toISOString();
  if (useFallback) {
    const user = fallbackStore.users.find(u => u.user_id === userId);
    if (user) {
      user.role_status = status;
      if (status === 'REVOKED') {
        user.revoked_at = timestampStr;
        user.revocation_reason = reason || 'Manual SOC Revocation';
      } else {
        delete user.revoked_at;
        delete user.revocation_reason;
      }
      saveFallbackStore();
      return { ...user };
    }
    return null;
  } else if (mongoDb) {
    const updateObj: any = { role_status: status };
    if (status === 'REVOKED') {
      updateObj.revoked_at = timestampStr;
      updateObj.revocation_reason = reason || 'Manual SOC Revocation';
    } else {
      updateObj.revoked_at = null;
      updateObj.revocation_reason = null;
    }

    const result = await mongoDb.collection<UserProfile>('users').findOneAndUpdate(
      { user_id: userId },
      { $set: updateObj },
      { returnDocument: 'after' }
    );
    return result;
  }
  return null;
}

// Get all events
export async function getEvents(): Promise<AccessEvent[]> {
  if (useFallback) {
    return fallbackStore.events;
  }
  if (mongoDb) {
    return await mongoDb.collection<AccessEvent>('events').find().sort({ timestamp: -1 }).toArray();
  }
  return [];
}

// Trigger custom uploaded files importing
export async function importCustomCSVs(usersCSVContent?: string, eventsCSVContent?: string) {
  if (usersCSVContent) {
    fs.writeFileSync(USERS_CSV_PATH, usersCSVContent, 'utf8');
  }
  if (eventsCSVContent) {
    fs.writeFileSync(EVENTS_CSV_PATH, eventsCSVContent, 'utf8');
  }
  await syncFilesToDatabase();
}

// Save/Cache an AI Evaluation
export async function saveEvaluation(evaluation: SecurityEvaluation) {
  if (useFallback) {
    const idx = fallbackStore.evaluations.findIndex(e => e.user_id === evaluation.user_id);
    if (idx >= 0) {
      fallbackStore.evaluations[idx] = evaluation;
    } else {
      fallbackStore.evaluations.push(evaluation);
    }
    saveFallbackStore();
  } else if (mongoDb) {
    await mongoDb.collection('evaluations').updateOne(
      { user_id: evaluation.user_id },
      { $set: evaluation },
      { upsert: true }
    );
  }
}

// Retrieve cached evaluation
export async function getEvaluation(userId: string): Promise<SecurityEvaluation | null> {
  if (useFallback) {
    return fallbackStore.evaluations.find(e => e.user_id === userId) || null;
  } else if (mongoDb) {
    return await mongoDb.collection<SecurityEvaluation>('evaluations').findOne({ user_id: userId });
  }
  return null;
}
