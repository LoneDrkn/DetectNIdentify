/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI, Type } from '@google/genai';

// Load environmental parameters
dotenv.config();

import {
  initializeDatabase,
  getDBStatus,
  getUsers,
  setRoleStatus,
  getEvents,
  getStats,
  importCustomCSVs,
  saveEvaluation,
  getEvaluation,
  syncFilesToDatabase
} from './src/server/db.js';
import { SecurityEvaluation } from './src/types.js';
import { generateSyntheticDataset } from './src/server/generator.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 1. Initialize Gemini API Client
let geminiClient: GoogleGenAI | null = null;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini API client initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Gemini Client:', err);
  }
} else {
  console.warn('GEMINI_API_KEY not found in environment. Gemini AI smart analysis will fall back to local rule-based evaluations.');
}

// 2. API Routes

// Get SOC dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

// Get Database connection and engine status
app.get('/api/db-status', async (req, res) => {
  try {
    const dbStatus = getDBStatus();
    res.json(dbStatus);
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

// Get Employee list
app.get('/api/users', async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

// Get System access logs
app.get('/api/events', async (req, res) => {
  try {
    const events = await getEvents();
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

// Manually Revoke/Suspend or Restore an Employee's Access Role
app.post('/api/users/role-status', async (req, res) => {
  const { userId, status, reason } = req.body;
  if (!userId || !status) {
    res.status(400).json({ error: 'parameters userId and status are required' });
    return;
  }
  try {
    const updatedUser = await setRoleStatus(userId, status, reason);
    if (!updatedUser) {
      res.status(404).json({ error: `User with ID ${userId} not found` });
      return;
    }
    res.json({ message: `Access role successfully set to ${status}`, user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

// Endpoint to upload custom 'identity_users.csv' and 'identity_events.csv' files
app.post('/api/import', async (req, res) => {
  const { usersCsv, eventsCsv } = req.body;
  try {
    await importCustomCSVs(usersCsv, eventsCsv);
    res.json({ success: true, message: 'Custom security datasets imported and synchronized.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

// Gemini AI-Powered Suspicious Activity Logic Guard
app.post('/api/evaluate', async (req, res) => {
  const { userId, forceEvaluation } = req.body;
  if (!userId) {
    res.status(400).json({ error: 'userId parameter is required' });
    return;
  }

  try {
    // 1. Fetch user data and log trace
    const allUsers = await getUsers();
    const allEvents = await getEvents();

    const user = allUsers.find(u => u.user_id === userId);
    if (!user) {
      res.status(404).json({ error: 'Target user profile not found.' });
      return;
    }

    const userEvents = allEvents.filter(e => e.user_id === userId);

    // Check if we already have a cached evaluation, unless forced
    if (!forceEvaluation) {
      const cached = await getEvaluation(userId);
      if (cached) {
        res.json({ evaluation: cached, user, source: 'cache' });
        return;
      }
    }

    let evaluationResult: SecurityEvaluation;

    // 2. Perform Intelligent Logical Differentiation (Gemini vs Rule-based Fallback)
    if (geminiClient) {
      console.log(`Evaluating user ${user.name} (${userId}) using server-side Gemini...`);

      const prompt = `
        Evaluate the potential threat profile for the following company employee based on their profile parameters, shift constraints, and recent system access event logs.
        The goal is specifically to differentiate between benign legitimate overnight employee operations (e.g. night shift, on-call alert response, overnight project catchup) vs suspicious fraudulent activities / hacker activities / credential compromise:

        ### EMPLOYEE IDENTITY PROFILE:
        - User ID: ${user.user_id}
        - Name: ${user.name}
        - Current Role: ${user.role}
        - Registered Department: ${user.department}
        - Normal Work Hours (UTC style): ${user.typical_start_hour}:00 to ${user.typical_end_hour}:00
        - Allowed Overnight Operations: ${user.is_overnight_allowed ? 'YES' : 'NO'}
        - Designated On-Call Team: ${user.is_on_call ? 'YES' : 'NO'}
        - Current Status: ${user.role_status}

        ### RECENT AUDIT ACCESS TRACE LOGS:
        ${JSON.stringify(userEvents, null, 2)}

        ### ANALYSIS LOGIC GUIDELINE:
        - Check Access Hour VS Shift Hours: If the access time is during night or off-hours (e.g. 2:00 AM):
          - Is this a developer working on typical engineering code (safe/legitimate overnight habit if overnight allowed)?
          - Is this an HR or accountant accessing core network resources? (Highly anomalous for department scopes, suspect fraud).
          - Is the location / IP of 2:00 AM access consistent with typical locations (New York) or is it flagging unusual geographical proxies (e.g., VPNs, servers in St. Petersburg, Seoul)?
        - Check Action Severity: Downloading normal items vs database/financial bulk EXPORT_DATABASE actions. High-volume export combined with nocturnal access is severe.
        - Balance: Differentiate clearly! Overnight work is typical on flexible teams, but unauthorized actions on sensitive databases outside one's department role is fraud. Make your explanation human-readable and analytical.

        Evaluate this information and generate the results strictly in JSON format matching the schema rules requested.
      `;

      try {
        const geminiResponse = await geminiClient.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an advanced Enterprise SOC Security Architect specialized in forensic access auditing and insider threat detection. Output your evaluation solely as a well-formed JSON object matching the requested schema fields.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                suspicionScore: {
                  type: Type.NUMBER,
                  description: 'Fraud threat score scale from 0 (completely benign employee working) to 100 (actively malicious threat / direct system compromise).'
                },
                isFraudCandidate: {
                  type: Type.BOOLEAN,
                  description: 'Whether this pattern represents highly likely fraudulent access or server compromised state rather than safe employee work.'
                },
                reasoning: {
                  type: Type.STRING,
                  description: 'Detailed, authoritative logical deduction explaining and comparing timestamps, department roles, and geographical locations.'
                },
                actionRecommended: {
                  type: Type.STRING,
                  description: 'Must be one of the exact string elements: "REVOKE_ROLE" (very high risk), "WARN_USER" (medium risk), "MONITOR" (minor risk), "NONE" (authorized safe).'
                }
              },
              required: ['suspicionScore', 'isFraudCandidate', 'reasoning', 'actionRecommended']
            }
          }
        });

        const textOutput = geminiResponse.text?.trim() || '{}';
        const parsedGemini = JSON.parse(textOutput);

        evaluationResult = {
          user_id: userId,
          suspicionScore: typeof parsedGemini.suspicionScore === 'number' ? parsedGemini.suspicionScore : 20,
          isFraudCandidate: !!parsedGemini.isFraudCandidate,
          reasoning: parsedGemini.reasoning || 'No analysis details provided.',
          actionRecommended: ['REVOKE_ROLE', 'WARN_USER', 'MONITOR', 'NONE'].includes(parsedGemini.actionRecommended)
            ? parsedGemini.actionRecommended
            : 'MONITOR',
          evaluated_at: new Date().toISOString()
        };

      } catch (geminiErr) {
        console.error('Error invoking Gemini, falling back to rule-based security evaluation:', geminiErr);
        evaluationResult = triggerRuleBasedEvaluationFallback(user, userEvents);
      }
    } else {
      // Offline fallback rule logic
      console.log(`Evaluating user ${user.name} offline using rule engine...`);
      evaluationResult = triggerRuleBasedEvaluationFallback(user, userEvents);
    }

    // 3. Automated Guard Protocol: If recommended action is REVOKE_ROLE, automatically revoke the role
    let finalUser = user;
    if (evaluationResult.actionRecommended === 'REVOKE_ROLE' && user.role_status === 'ACTIVE') {
      console.log(`Automated Security Guard active: Revoking role for user ${user.user_id} based on critical AI threat assessment.`);
      const updated = await setRoleStatus(
        userId,
        'REVOKED',
        `Automated Threat Defense: Evaluated Suspicion Score of ${evaluationResult.suspicionScore}%. Reason: ${evaluationResult.reasoning}`
      );
      if (updated) finalUser = updated;
    }

    // Save evaluation to DB
    await saveEvaluation(evaluationResult);

    res.json({
      evaluation: evaluationResult,
      user: finalUser,
      source: geminiClient ? 'gemini' : 'rules_engine'
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

// Offline logical fallback rule machine to score suspicion
function triggerRuleBasedEvaluationFallback(user: any, events: any[]): SecurityEvaluation {
  let score = 0;
  const reasons: string[] = [];
  let isFraud = false;
  let action: 'REVOKE_ROLE' | 'WARN_USER' | 'MONITOR' | 'NONE' = 'NONE';

  const hasHighlySuspiciousEvents = events.some(e => e.is_suspicious);
  const foreignEvents = events.filter(e => e.location && (e.location.includes('Seoul') || e.location.includes('Petersburg')));
  const bulkExports = events.filter(e => e.action === 'EXPORT_DATABASE');
  const departmentMismatches = events.filter(e => e.suspicion_type === 'Cross Department Access');

  if (foreignEvents.length > 0) {
    score += 55;
    reasons.push(`Geographical threat detected: Logins occurred from foreign proxy locations: ${foreignEvents.map(fe => fe.location).join(', ')}`);
  }

  if (bulkExports.length > 0) {
    score += 35;
    reasons.push("Bulk record exfiltration signature: 'EXPORT_DATABASE' actions logged during anomalous window");
  }

  if (departmentMismatches.length > 0) {
    score += 40;
    reasons.push("Scope of authorities violation: Accounts accessed resources completely non-pertinent to user's registered department.");
  }

  const offHoursLogins = events.filter(e => {
    if (e.time_classification === 'night' || e.time_classification === 'unusual_hours') return true;
    try {
      const ts = e.timestamp ? e.timestamp.replace(' ', 'T') : '';
      const hr = new Date(ts).getUTCHours();
      return hr >= 0 && hr <= 5;
    } catch {
      return false;
    }
  });

  if (offHoursLogins.length > 0) {
    if (user.is_on_call) {
      score += 10;
      reasons.push("Off-hours activities registered (Benign: Employee has authorized on-call responsibilities).");
    } else if (user.is_overnight_allowed) {
      score += 15;
      reasons.push("Off-hours activities registered (Benign: Employee allows overnight workflows).");
    } else {
      score += 45;
      reasons.push("Out-of-shift violation: No overnight work authorization registered for this account.");
    }
  }

  // Cap score at 100
  score = Math.min(score, 100);

  if (score >= 75) {
    isFraud = true;
    action = 'REVOKE_ROLE';
  } else if (score >= 40) {
    action = 'WARN_USER';
  } else if (score > 15) {
    action = 'MONITOR';
  }

  const finalDetail = reasons.length > 0
    ? reasons.join('. ')
    : "Access logs represent standard working shifts inside authorized boundaries. Legitimate employee.";

  return {
    user_id: user.user_id,
    suspicionScore: score,
    isFraudCandidate: isFraud,
    reasoning: `Rule-Engine Evaluation: ${finalDetail}`,
    actionRecommended: action,
    evaluated_at: new Date().toISOString()
  };
}

// 2.5 Generate synthetic data
app.post('/api/generate-data', async (req, res) => {
  const { size, inject_missing_logins, inject_duplicates, inject_mixed_timezones, inject_stale_records } = req.body;
  try {
    const summary = generateSyntheticDataset({
      size: size || 'small',
      inject_missing_logins: !!inject_missing_logins,
      inject_duplicates: !!inject_duplicates,
      inject_mixed_timezones: !!inject_mixed_timezones,
      inject_stale_records: !!inject_stale_records,
    });
    // Sync newly generated files to database so UI pulls current data
    await syncFilesToDatabase();
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message || String(error) });
  }
});

// Expose download routes support
app.get('/download/users', (req, res) => {
  res.download(path.join(process.cwd(), 'data', 'identity_users.csv'), 'identity_users.csv');
});
app.get('/download/events', (req, res) => {
  res.download(path.join(process.cwd(), 'data', 'identity_events.csv'), 'identity_events.csv');
});
app.get('/download/user-labels', (req, res) => {
  res.download(path.join(process.cwd(), 'data', 'identity_users_labels.csv'), 'identity_users_labels.csv');
});
app.get('/download/event-labels', (req, res) => {
  res.download(path.join(process.cwd(), 'data', 'identity_events_labels.csv'), 'identity_events_labels.csv');
});

// Alternate proxy download endpoints
app.get('/api/download/users', (req, res) => {
  res.download(path.join(process.cwd(), 'data', 'identity_users.csv'), 'identity_users.csv');
});
app.get('/api/download/events', (req, res) => {
  res.download(path.join(process.cwd(), 'data', 'identity_events.csv'), 'identity_events.csv');
});
app.get('/api/download/user-labels', (req, res) => {
  res.download(path.join(process.cwd(), 'data', 'identity_users_labels.csv'), 'identity_users_labels.csv');
});
app.get('/api/download/event-labels', (req, res) => {
  res.download(path.join(process.cwd(), 'data', 'identity_events_labels.csv'), 'identity_events_labels.csv');
});

// 3. Connect DB and Mount Vite Client Server

async function startApplicationServer() {
  console.log('Connecting database services...');
  const dbStatus = await initializeDatabase();
  console.log(`Database initialized. Mode: ${dbStatus.type}. Server standing by.`);

  // Serve built frontend static files (single-port mode)
  const distPath = path.join(process.cwd(), '../frontend/dist');
  const fs = await import('fs');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    // Catch-all: serve index.html for client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving built frontend from frontend/dist');
  } else {
    console.log('No frontend/dist found — run: cd frontend && npm run build');
    console.log('For dev with HMR, keep both servers running separately.');
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ AI-Powered Security SOC Server running on http://localhost:${PORT}`);
    console.log(`   Mode: ${dbStatus.type} | Data: Local CSV files (backend/data/)`);
    console.log(`   Frontend proxy: http://localhost:5174 → API → http://localhost:${PORT}\n`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use!`);
      console.error(`   Another backend instance is running. To fix it:`);
      console.error(`   Run: netstat -ano | findstr :${PORT}  then taskkill /PID <pid> /F`);
      console.error(`   Or close any other terminal that is running npm run dev\n`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}

startApplicationServer().catch(err => {
  console.error('Fatal crash on startup:', err);
});
