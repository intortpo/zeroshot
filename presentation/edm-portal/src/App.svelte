<script lang="ts">
  import { onMount } from 'svelte';
  import { INITIAL_STUDENTS, fetchLiveFirebaseStudents, type StudentProfile } from './lib/firebaseStore';
  import RadarChart from './lib/RadarChart.svelte';
  import TrafficLight from './lib/TrafficLight.svelte';
  import VelocitySparkline from './lib/VelocitySparkline.svelte';

  let students = $state<StudentProfile[]>(INITIAL_STUDENTS);
  let selectedStudentId = $state<string>(INITIAL_STUDENTS[0].studentId);
  let isRefreshing = $state<boolean>(false);
  let refreshNotice = $state<string>('Loaded instant cached Firebase diagnostic records.');

  let selectedStudent = $derived(
    students.find((s) => s.studentId === selectedStudentId) || students[0]
  );

  async function refreshFromFirebase() {
    isRefreshing = true;
    students = await fetchLiveFirebaseStudents();
    isRefreshing = false;
    refreshNotice = `Refreshed from Firebase (0ms ML compute wait time) at ${new Date().toLocaleTimeString()}`;
  }

  onMount(() => {
    refreshFromFirebase();
  });
</script>

<main class="portal-root">
  <!-- Top Navigation Bar -->
  <header class="top-nav">
    <div class="brand">
      <div class="brand-icon">EDM</div>
      <div>
        <h1>Four-Tier EDM Presentation Layer</h1>
        <p class="subtitle">Svelte + Vite · Pristine Zero-Latency Teacher Dashboard</p>
      </div>
    </div>

    <div class="tier-pills">
      <span class="pill layer-1">L1: Bun+Firebase</span>
      <span class="pill layer-2">L2: Rust Tactical</span>
      <span class="pill layer-3">L3: Python/Qiskit</span>
      <span class="pill layer-4 active">L4: Svelte (Zero-Latency)</span>
      <button class="btn-refresh" onclick={refreshFromFirebase} disabled={isRefreshing}>
        {isRefreshing ? 'Refreshing...' : 'Sync Firebase'}
      </button>
    </div>
  </header>

  <!-- Notice Banner -->
  <div class="notice-bar">
    <span class="notice-dot"></span>
    <span>{refreshNotice}</span>
  </div>

  <!-- Dashboard Grid -->
  <div class="dashboard-content">
    <!-- Left Column: Student Roster -->
    <aside class="roster-panel">
      <h2>Enrolled Cohort ({students.length})</h2>
      <div class="student-list">
        {#each students as student}
          <button
            type="button"
            class="student-card"
            class:selected={student.studentId === selectedStudentId}
            onclick={() => (selectedStudentId = student.studentId)}
          >
            <div class="card-header">
              <span class="student-name">{student.name}</span>
              <span
                class="badge"
                class:red={student.risk_alert?.risk_level === 'red'}
                class:amber={student.risk_alert?.risk_level === 'amber'}
                class:green={student.risk_alert?.risk_level === 'green'}
              >
                {student.risk_alert?.risk_level?.toUpperCase() || 'EVAL'}
              </span>
            </div>
            <div class="card-meta">
              <span>{student.cohort}</span>
              <span>Vel: {student.risk_alert?.composite_velocity > 0 ? '+' : ''}{student.risk_alert?.composite_velocity?.toFixed(2) || '0.00'}/wk</span>
            </div>
          </button>
        {/each}
      </div>
    </aside>

    <!-- Right Column: Detail View -->
    <section class="detail-panel">
      <!-- Student Header -->
      <div class="detail-header">
        <div>
          <h2>{selectedStudent.name}</h2>
          <p class="meta-sub">{selectedStudent.cohort} · ID: {selectedStudent.studentId}</p>
        </div>

        <TrafficLight
          riskLevel={selectedStudent.risk_alert?.risk_level}
          statusLabel={selectedStudent.risk_alert?.status_label}
          confidence={selectedStudent.risk_alert?.confidence_score}
          velocity={selectedStudent.risk_alert?.composite_velocity}
        />
      </div>

      <!-- Main Visualizations Grid -->
      <div class="vis-grid">
        <!-- Latent Competency Radar Chart -->
        <div class="vis-card">
          <div class="vis-card-header">
            <h3>Latent Skill Competencies (DINA Model)</h3>
            <span class="vis-sub">Disentangles slipping & guessing noise</span>
          </div>
          <RadarChart
            masteryProbabilities={selectedStudent.diagnostic_profile?.mastery_probabilities}
            size={260}
          />
        </div>

        <!-- Longitudinal Velocity Timeline -->
        <div class="vis-card">
          <div class="vis-card-header">
            <h3>Longitudinal Velocity Timeline</h3>
            <span class="vis-sub">Normalized weekly attendance & homework frames</span>
          </div>
          <VelocitySparkline timeline={selectedStudent.normalizedTimeline} />

          <div class="diagnostic-breakdown">
            <h4>Curriculum Mastery Probabilities</h4>
            <div class="prob-row">
              <span>Vocabulary:</span>
              <strong>{Math.round((selectedStudent.diagnostic_profile?.mastery_probabilities?.['skill_vocab'] || 0.5) * 100)}%</strong>
            </div>
            <div class="prob-row">
              <span>Syntax & Grammar:</span>
              <strong style="color: {(selectedStudent.diagnostic_profile?.mastery_probabilities?.['skill_grammar'] || 0.5) < 0.5 ? '#e11d48' : '#0d9488'}">
                {Math.round((selectedStudent.diagnostic_profile?.mastery_probabilities?.['skill_grammar'] || 0.5) * 100)}%
              </strong>
            </div>
            <div class="prob-row">
              <span>Reading Comprehension:</span>
              <strong>{Math.round((selectedStudent.diagnostic_profile?.mastery_probabilities?.['skill_reading_comp'] || 0.5) * 100)}%</strong>
            </div>
            <div class="prob-row">
              <span>Analytical Synthesis:</span>
              <strong>{Math.round((selectedStudent.diagnostic_profile?.mastery_probabilities?.['skill_synthesis'] || 0.5) * 100)}%</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #f8fafc;
    color: #0f172a;
  }
  .portal-root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  .top-nav {
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .brand-icon {
    width: 36px;
    height: 36px;
    background: #0d9488;
    color: white;
    font-weight: 800;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
  }
  h1 {
    font-size: 16px;
    margin: 0;
    font-weight: 700;
  }
  .subtitle {
    font-size: 11px;
    color: #64748b;
    margin: 2px 0 0 0;
    font-family: monospace;
  }
  .tier-pills {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .pill {
    font-size: 11px;
    font-family: monospace;
    padding: 4px 8px;
    border-radius: 6px;
    background: #f1f5f9;
    color: #64748b;
    border: 1px solid #e2e8f0;
  }
  .pill.active {
    background: #ccfbf1;
    color: #0f766e;
    border-color: #5eead4;
    font-weight: 600;
  }
  .btn-refresh {
    font-size: 11px;
    font-weight: 600;
    background: #0f766e;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
  }
  .btn-refresh:hover {
    background: #0d9488;
  }
  .notice-bar {
    background: #f0fdfa;
    border-bottom: 1px solid #ccfbf1;
    padding: 6px 24px;
    font-size: 12px;
    color: #0f766e;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: monospace;
  }
  .notice-dot {
    width: 6px;
    height: 6px;
    background: #14b8a6;
    border-radius: 50%;
  }
  .dashboard-content {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 20px;
    padding: 20px 24px;
    flex: 1;
  }
  .roster-panel {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
  }
  h2 {
    font-size: 14px;
    margin: 0 0 12px 0;
    font-weight: 700;
    color: #334155;
  }
  .student-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .student-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 12px;
    cursor: pointer;
    background: #fafafa;
    text-align: left;
    width: 100%;
    transition: all 0.2s;
  }
  .student-card:hover {
    background: #f1f5f9;
  }
  .student-card.selected {
    background: #f0fdfa;
    border-color: #0d9488;
    box-shadow: 0 0 0 1px #0d9488;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .student-name {
    font-size: 12px;
    font-weight: 600;
  }
  .badge {
    font-size: 9px;
    font-weight: 700;
    font-family: monospace;
    padding: 2px 6px;
    border-radius: 4px;
  }
  .badge.red { background: #fee2e2; color: #991b1b; }
  .badge.amber { background: #fef3c7; color: #92400e; }
  .badge.green { background: #d1fae5; color: #065f46; }
  .card-meta {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #64748b;
    margin-top: 4px;
    font-family: monospace;
  }
  .detail-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px 20px;
  }
  .meta-sub {
    font-size: 11px;
    color: #64748b;
    font-family: monospace;
    margin: 4px 0 0 0;
  }
  .vis-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .vis-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .vis-card-header h3 {
    font-size: 13px;
    margin: 0;
    font-weight: 700;
  }
  .vis-sub {
    font-size: 10px;
    color: #64748b;
    font-family: monospace;
  }
  .diagnostic-breakdown {
    background: #f8fafc;
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .diagnostic-breakdown h4 {
    font-size: 11px;
    margin: 0 0 4px 0;
    font-family: monospace;
    color: #475569;
  }
  .prob-row {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #334155;
  }
</style>
