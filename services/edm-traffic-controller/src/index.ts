/**
 * Layer 1: Bun Traffic Controller Entry Point
 * High-speed router and cron executor for the Four-Tier EDM architecture.
 */

import { firebaseSource } from './firebaseClient';
import { executeFridayTacticalRun } from './tacticalCron';
import { executeStrategicTermRun } from './strategicCron';

const PORT = Number(process.env.PORT || 8087);
const RUST_URL = process.env.RUST_ENGINE_URL || 'http://127.0.0.1:8088';
const PYTHON_URL = process.env.PYTHON_ENGINE_URL || 'http://127.0.0.1:8089';

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // CORS headers for Layer 4 Svelte presentation
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // Health
    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          tier: 'Layer 1: Central Nervous System (Bun + Firebase)',
          bun_version: Bun.version,
          downstream: {
            rust_tactical: RUST_URL,
            python_strategic: PYTHON_URL,
          },
        }),
        { headers }
      );
    }

    // Zero-Latency Data Endpoint for Presentation Layer (Svelte / React)
    if (url.pathname === '/firebase/students') {
      const termParam = url.searchParams.get('term');
      const students = termParam
        ? await firebaseSource.getStudentsByTerm(termParam)
        : await firebaseSource.getAllStudents();
      return new Response(JSON.stringify(students, null, 2), { headers });
    }

    // Stage Next Semester endpoint
    if (url.pathname === '/firebase/terms/stage-next' && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const sourceTerm = body.sourceTerm || 'AY2026 Sem 1';
      const targetTerm = body.targetTerm || 'AY2026 Sem 2';
      const stagedCount = await firebaseSource.stageNextTerm(sourceTerm, targetTerm);
      return new Response(
        JSON.stringify({
          success: true,
          sourceTerm,
          targetTerm,
          stagedCount,
          timestamp: Date.now(),
        }, null, 2),
        { headers }
      );
    }

    // Trigger Friday 17:00 Tactical Cron
    if (url.pathname === '/cron/tactical' && req.method === 'POST') {
      console.log('[layer-1:bun] Executing Friday 17:00 Tactical Run...');
      const result = await executeFridayTacticalRun(RUST_URL);
      return new Response(JSON.stringify(result, null, 2), { headers });
    }

    // Trigger End-of-Semester Strategic Cron
    if (url.pathname === '/cron/strategic' && req.method === 'POST') {
      console.log('[layer-1:bun] Executing End of Semester Strategic Run...');
      const result = await executeStrategicTermRun(PYTHON_URL, RUST_URL);
      return new Response(JSON.stringify(result, null, 2), { headers });
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers });
  },
});

console.log(`[layer-1:bun-firebase] Traffic Controller active on http://127.0.0.1:${server.port}`);
