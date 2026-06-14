import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

const FIRST_NAMES = ['priya', 'daniel', 'kenneth', 'sanjana', 'diya', 'george', 'kevin', 'robert', 'thomas', 'aditya', 'jacob', 'maria', 'vikram', 'jonathan', 'david', 'sophia', 'elena', 'meera', 'joshua', 'karan', 'rohan', 'harsh', 'isha', 'nicholas', 'stephen', 'pooja', 'paul', 'zainab', 'timothy', 'matthew', 'george', 'anthony', 'william', 'donald', 'sanjana', 'timothy', 'richard', 'michael', 'aisha', 'matthew', 'timothy', 'timothy', 'mark', 'timothy', 'timothy', 'timothy', 'timothy'];
const LAST_NAMES = ['murphy', 'singh', 'moore', 'li', 'anderson', 'lim', 'ramirez', 'smith', 'iyer', 'burke', 'patel', "o'brien", 'white', 'jackson', 'thomas', 'dubois', 'schulz', 'burke', 'white', 'harris', 'jones', 'bhat', 'sullivan', 'singh', 'wagner', 'meyer', 'taylor', 'martin', 'sharma', 'huang', 'sanchez', 'clark', 'colombo', 'kang', 'hernandez', 'jones', 'martin', 'smith', 'wang', 'quinn', 'chen', 'becker', 'he', 'rossi', 'gonzalez', 'garcia', 'petit', 'lopez', 'martinez'];

const DEPARTMENTS = ['Executive', 'Compliance', 'Sales', 'Marketing', 'Engineering', 'Legal', 'Operations', 'Finance', 'Security', 'Support', 'IT', 'HR'];
const DESIGNATIONS: Record<string, string[]> = {
  Executive: ['Director', 'Executive', 'Manager', 'Officer'],
  Compliance: ['Lead', 'Specialist', 'Coordinator', 'Manager', 'Analyst'],
  Sales: ['Architect', 'Administrator', 'Director', 'Engineer', 'Lead'],
  Marketing: ['Director', 'Administrator', 'Architect', 'Analyst', 'Coordinator', 'Manager'],
  Engineering: ['Administrator', 'Developer', 'Engineer', 'Architect', 'Lead'],
  Legal: ['Architect', 'Specialist', 'Director', 'Officer', 'Analyst'],
  Operations: ['Lead', 'Director', 'Coordinator', 'Executive', 'Specialist'],
  Finance: ['Architect', 'Director', 'Coordinator', 'Developer', 'Officer', 'Administrator'],
  Security: ['Administrator', 'Developer', 'Officer', 'Engineer', 'Analyst', 'Specialist'],
  Support: ['Architect', 'Specialist', 'Lead', 'Engineer', 'Coordinator'],
  IT: ['Specialist', 'Manager', 'Administrator', 'Engineer', 'Developer', 'Architect'],
  HR: ['Officer', 'Architect', 'Analyst', 'Coordinator', 'Manager', 'Engineer', 'Developer']
};

const SYSTEMS = ['AD', 'Azure_AD', 'Salesforce', 'EMAIL', 'PROD_DB', 'AWS_IAM', 'ServiceNow', 'GCP', 'SIEM', 'Okta', 'VPN', 'ADMIN_SYS'];
const ACTIONS = ['admin_operation', 'sql_query', 'export_data', 'api_call', 'file_access', 'login'];
const RESOURCES = ['HRIS', 'Data_Lake', 'BI_Tool', 'File_Share', 'Email_Archive', 'GL_System', 'Admin_Console', 'PROD_DB', 'SIEM', 'Customer_Vault'];

interface GenerationOptions {
  size: string;
  inject_missing_logins: boolean;
  inject_duplicates: boolean;
  inject_mixed_timezones: boolean;
  inject_stale_records: boolean;
}

export function generateSyntheticDataset(options: GenerationOptions) {
  // Determine target counts
  let userCount = 300;
  let eventCount = 5000;

  if (options.size === 'medium') {
    userCount = 1000; // optimized for browser speed, but feels medium
    eventCount = 15000;
  } else if (options.size === 'large') {
    userCount = 3000;
    eventCount = 40000;
  }

  // Ensure data folder exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const usersList: any[] = [];
  const userAnomaliesList: any[] = [];
  
  // Generate user profiles
  for (let i = 0; i < userCount; i++) {
    const uid = `USR${String(i).padStart(5, '0')}`;
    const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const username = `${fName}.${lName}`;
    const email = `${username}@company.com`;
    const department = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
    const titles = DESIGNATIONS[department] || ['Specialist'];
    const jobTitle = titles[Math.floor(Math.random() * titles.length)];
    
    let privilege = 'user';
    if (jobTitle === 'Director' || jobTitle === 'Executive') privilege = 'admin';
    else if (jobTitle === 'Lead' || jobTitle === 'Architect') privilege = 'power-user';
    else if (Math.random() < 0.05) privilege = 'service-account';

    const accessSystems = Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => SYSTEMS[Math.floor(Math.random() * SYSTEMS.length)]);
    const uniqueSystems = Array.from(new Set(accessSystems)).join('|');

    // Simulate login parameters
    let lastLogin = '';
    if (!options.inject_missing_logins || Math.random() > 0.05) {
      const loginDaysAgo = Math.floor(Math.random() * 90);
      const loginDate = new Date();
      loginDate.setDate(loginDate.getDate() - loginDaysAgo);
      lastLogin = loginDate.toISOString().split('T')[0];
    }

    const daysInactive = lastLogin ? Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 3600 * 24)) : 99;
    const isActive = daysInactive < 60;

    // Hire date
    let hireDate = '2023-01-15';
    if (options.inject_stale_records && Math.random() < 0.1) {
      hireDate = '1999-12-31'; // Backdated stale record anomaly
    } else {
      const year = 2021 + Math.floor(Math.random() * 4);
      const m = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const d = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      hireDate = `${year}-${m}-${d}`;
    }

    // Role anomalies injection (around 15-20%)
    let hasAnomaly = false;
    let anomalyType = '';
    const roll = Math.random();

    if (roll < 0.04 && privilege === 'admin' && daysInactive > 45) {
      hasAnomaly = true;
      anomalyType = 'Stale Admin Account';
    } else if (roll >= 0.04 && roll < 0.08 && privilege === 'user' && uniqueSystems.includes('ADMIN_SYS')) {
      hasAnomaly = true;
      anomalyType = 'Over Privileged User';
    } else if (roll >= 0.08 && roll < 0.12 && privilege === 'power-user' && daysInactive > 60) {
      hasAnomaly = true;
      anomalyType = 'Dormant Privileged User';
    } else if (roll >= 0.12 && roll < 0.15 && privilege === 'service-account' && daysInactive > 120) {
      hasAnomaly = true;
      anomalyType = 'Orphaned Service Account';
    } else if (roll >= 0.15 && roll < 0.18 && !isActive && uniqueSystems.includes('PROD_DB')) {
      hasAnomaly = true;
      anomalyType = 'Terminated Employee With Access';
    }

    usersList.push({
      user_id: uid,
      username,
      email,
      department,
      job_title: jobTitle,
      privilege_level: privilege,
      systems_access: uniqueSystems,
      last_login: lastLogin,
      days_inactive: daysInactive,
      is_active: isActive ? 'true' : 'false',
      hire_date: hireDate
    });

    if (hasAnomaly) {
      userAnomaliesList.push({
        user_id: uid,
        username,
        anomaly_type: anomalyType,
        confidence: (0.75 + Math.random() * 0.2).toFixed(2),
        risk_level: anomalyType.includes('Terminated') || anomalyType.includes('Orphaned') ? 'CRITICAL' : 'HIGH'
      });
    }
  }

  // Generate event records
  const eventsList: any[] = [];
  const eventAnomaliesList: any[] = [];

  const baseDate = new Date();
  baseDate.setFullYear(baseDate.getFullYear() - 1);

  for (let i = 0; i < eventCount; i++) {
    const user = usersList[Math.floor(Math.random() * usersList.length)];
    
    // Increment timestamp dynamically spaced over a year
    const eventTime = new Date(baseDate.getTime());
    eventTime.setMinutes(eventTime.getMinutes() + (i * Math.floor(525600 / eventCount)));

    let hour = eventTime.getHours();
    
    // Ingress anomaly flag (around 30-40%)
    let standsAnomaly = false;
    let anomalyType = '';
    const eroll = Math.random();

    // Time classification
    let timeClass = 'business_hours';
    if (hour >= 22 || hour <= 5) {
      timeClass = 'night';
    } else if (hour >= 18 || hour < 8) {
      timeClass = 'unusual_hours';
    }

    let action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    let resource = RESOURCES[Math.floor(Math.random() * RESOURCES.length)];
    let sensitivity = 'medium';
    if (resource === 'PROD_DB' || resource === 'Customer_Vault' || resource === 'Admin_Console') {
      sensitivity = 'high';
    } else if (resource === 'File_Share' || resource === 'BI_Tool') {
      sensitivity = 'low';
    }

    let ip = `192.168.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;
    let status = Math.random() < 0.02 ? 'failure' : 'success';

    // Inject event anomaly behaviors
    if (eroll < 0.05 && timeClass === 'night') {
      standsAnomaly = true;
      anomalyType = 'After Hours Access';
      action = 'file_access';
    } else if (eroll >= 0.05 && eroll < 0.10 && action === 'export_data' && sensitivity === 'high') {
      standsAnomaly = true;
      anomalyType = 'Massive Data Export';
    } else if (eroll >= 0.10 && eroll < 0.14 && action === 'login' && status === 'failure') {
      standsAnomaly = true;
      anomalyType = 'Excessive System Access';
    } else if (eroll >= 0.14 && eroll < 0.18 && user.department === 'HR' && resource === 'Customer_Vault') {
      standsAnomaly = true;
      anomalyType = 'Cross Department Access';
    } else if (eroll >= 0.18 && eroll < 0.22 && action === 'admin_operation' && user.privilege_level === 'user') {
      standsAnomaly = true;
      anomalyType = 'Privilege Escalation';
    } else if (eroll >= 0.22 && eroll < 0.25) {
      standsAnomaly = true;
      anomalyType = 'Impossible Travel Pattern';
      ip = `84.22.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`; // Flagged foreign ip
    }

    // Timezone formatting distortion if requested
    let formattedTs = '';
    if (options.inject_mixed_timezones && Math.random() < 0.15) {
      // mix formats: ISO, UTC and Raw local log strings
      formattedTs = Math.random() < 0.5 
        ? eventTime.toUTCString()
        : eventTime.toLocaleString();
    } else {
      // standard database timestamp format
      const yyyy = eventTime.getFullYear();
      const mm = String(eventTime.getMonth() + 1).padStart(2, '0');
      const dd = String(eventTime.getDate()).padStart(2, '0');
      const hh = String(eventTime.getHours()).padStart(2, '0');
      const min = String(eventTime.getMinutes()).padStart(2, '0');
      const ss = String(eventTime.getSeconds()).padStart(2, '0');
      formattedTs = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    }

    eventsList.push({
      timestamp: formattedTs,
      user_id: user.user_id,
      username: user.username,
      action,
      resource,
      resource_sensitivity: sensitivity,
      status,
      source_ip: ip,
      time_classification: timeClass
    });

    if (standsAnomaly) {
      eventAnomaliesList.push({
        timestamp: formattedTs,
        user_id: user.user_id,
        username: user.username,
        anomaly_type: anomalyType,
        resource,
        source_ip: ip,
        severity: sensitivity === 'high' || anomalyType === 'Privilege Escalation' ? 'HIGH' : 'MEDIUM'
      });
    }
  }

  // Handle duplicate injection option
  if (options.inject_duplicates && eventsList.length > 0) {
    const dupsCount = Math.floor(eventsList.length * 0.01) || 12;
    for (let d = 0; d < dupsCount; d++) {
      const idx = Math.floor(Math.random() * eventsList.length);
      eventsList.push({ ...eventsList[idx] });
    }
  }

  // WRITE USERS CSV
  const userCSVHeaders = 'user_id,username,email,department,job_title,privilege_level,systems_access,last_login,days_inactive,is_active,hire_date';
  const userCSVRows = usersList.map(u => 
    `"${u.user_id}","${u.username}","${u.email}","${u.department}","${u.job_title}","${u.privilege_level}","${u.systems_access}","${u.last_login}",${u.days_inactive},${u.is_active},"${u.hire_date}"`
  );
  fs.writeFileSync(path.join(DATA_DIR, 'identity_users.csv'), [userCSVHeaders, ...userCSVRows].join('\n'), 'utf8');

  // WRITE EVENTS CSV
  const eventCSVHeaders = 'timestamp,user_id,username,action,resource,resource_sensitivity,status,source_ip,time_classification';
  const eventCSVRows = eventsList.map(e => 
    `"${e.timestamp}","${e.user_id}","${e.username}","${e.action}","${e.resource}","${e.resource_sensitivity}","${e.status}","${e.source_ip}","${e.time_classification}"`
  );
  fs.writeFileSync(path.join(DATA_DIR, 'identity_events.csv'), [eventCSVHeaders, ...eventCSVRows].join('\n'), 'utf8');

  // WRITE USER LABELS CSV
  const userLabelsHeaders = 'user_id,username,anomaly_type,confidence,risk_level';
  const userLabelsRows = userAnomaliesList.map(u => 
    `"${u.user_id}","${u.username}","${u.anomaly_type}",${u.confidence},"${u.risk_level}"`
  );
  fs.writeFileSync(path.join(DATA_DIR, 'identity_users_labels.csv'), [userLabelsHeaders, ...userLabelsRows].join('\n'), 'utf8');

  // WRITE EVENT LABELS CSV
  const eventLabelsHeaders = 'timestamp,user_id,username,anomaly_type,resource,source_ip,severity';
  const eventLabelsRows = eventAnomaliesList.map(e => 
    `"${e.timestamp}","${e.user_id}","${e.username}","${e.anomaly_type}","${e.resource}","${e.source_ip}","${e.severity}"`
  );
  fs.writeFileSync(path.join(DATA_DIR, 'identity_events_labels.csv'), [eventLabelsHeaders, ...eventLabelsRows].join('\n'), 'utf8');

  // Calculate stats for output
  const userBreakdown: Record<string, number> = {};
  userAnomaliesList.forEach(a => {
    userBreakdown[a.anomaly_type] = (userBreakdown[a.anomaly_type] || 0) + 1;
  });

  const eventBreakdown: Record<string, number> = {};
  eventAnomaliesList.forEach(a => {
    eventBreakdown[a.anomaly_type] = (eventBreakdown[a.anomaly_type] || 0) + 1;
  });

  return {
    users_generated: usersList.length,
    events_generated: eventsList.length,
    user_anomalies: userAnomaliesList.length,
    user_anomaly_pct: parseFloat((userAnomaliesList.length / usersList.length * 100).toFixed(1)),
    event_anomalies: eventAnomaliesList.length,
    event_anomaly_pct: parseFloat((eventAnomaliesList.length / eventsList.length * 100).toFixed(1)),
    user_anomaly_breakdown: userBreakdown,
    event_anomaly_breakdown: eventBreakdown,
    generated_at: new Date().toISOString()
  };
}
