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
  let searchQuery = $state<string>('');
  let riskFilter = $state<string>('all');
  let cohortFilter = $state<string>('all');

  let uniqueCohorts = $derived([
    'all',
    ...Array.from(new Set(students.map((s) => s.cohort).filter(Boolean))).sort(),
  ]);

  let filteredStudents = $derived(
    students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        (s.nickname && s.nickname.toLowerCase().includes(q));
      const matchRisk =
        riskFilter === 'all' || s.risk_alert?.risk_level === riskFilter;
      const matchCohort =
        cohortFilter === 'all' || s.cohort === cohortFilter;
      return matchSearch && matchRisk && matchCohort;
    })
  );

  let selectedStudent = $derived(
    students.find((s) => s.studentId === selectedStudentId) || filteredStudents[0] || students[0]
  );

  async function refreshFromFirebase() {
    isRefreshing = true;
    students = await fetchLiveFirebaseStudents();
    isRefreshing = false;
    refreshNotice = `Refreshed ${students.length} students from Firebase (0ms ML compute wait time) at ${new Date().toLocaleTimeString()}`;
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
      <div class="roster-top">
        <h2>Roster ({filteredStudents.length} / {students.length})</h2>
      </div>

      <!-- Search & Filters -->
      <div class="roster-filters">
        <input
          type="text"
          class="search-input"
          placeholder="Search name, nickname, or ID..."
          bind:value={searchQuery}
        />

        <div class="filter-controls">
          <select class="cohort-select" bind:value={cohortFilter}>
            {#each uniqueCohorts as c}
              <option value={c}>{c === 'all' ? 'All Classes' : c}</option>
            {/each}
          </select>

          <div class="risk-tabs">
            <button
              type="button"
              class="tab-btn"
              class:active={riskFilter === 'all'}
              onclick={() => (riskFilter = 'all')}>All</button
            >
            <button
              type="button"
              class="tab-btn red"
              class:active={riskFilter === 'red'}
              onclick={() => (riskFilter = 'red')}>Red</button
            >
            <button
              type="button"
              class="tab-btn amber"
              class:active={riskFilter === 'amber'}
              onclick={() => (riskFilter = 'amber')}>Amber</button
            >
            <button
              type="button"
              class="tab-btn green"
              class:active={riskFilter === 'green'}
              onclick={() => (riskFilter = 'green')}>Green</button
            >
          </div>
        </div>
      </div>

      <div class="student-list">
        {#each filteredStudents as student}
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
            {#if student.failedSubjects && student.failedSubjects.length > 0}
              <div class="card-fails">
                <span class="fail-pill">Below passing: {student.failedSubjects.join(', ')}</span>
              </div>
            {/if}
          </button>
        {/each}
        {#if filteredStudents.length === 0}
          <div class="empty-roster">No students match current search/filter.</div>
        {/if}
      </div>
    </aside>

    <!-- Right Column: Detail View -->
    <section class="detail-panel">
      <!-- Student Header -->
      <div class="detail-header">
        <div>
          <h2>{selectedStudent.name}</h2>
          <p class="meta-sub">
            {selectedStudent.cohort} · ID: {selectedStudent.studentId}
            {#if selectedStudent.course} · Course: {selectedStudent.course}{/if}
          </p>

          {#if selectedStudent.failedSubjects && selectedStudent.failedSubjects.length > 0}
            <div class="alert-failed-subjects">
              <span class="alert-tag">Curriculum Intervention Required ({selectedStudent.failedSubjects.length} subjects):</span>
              <div class="chips-row">
                {#each selectedStudent.failedSubjects as subj}
                  <span class="subj-chip fail">{subj}</span>
                {/each}
              </div>
            </div>
          {/if}
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
    grid-template-columns: 360px 1fr;
    gap: 20px;
    padding: 20px 24px;
    flex: 1;
  }
  .roster-panel {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 140px);
  }
  .roster-top h2 {
    font-size: 14px;
    margin: 0 0 10px 0;
    font-weight: 700;
    color: #334155;
  }
  .roster-filters {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }
  .search-input {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 10px;
    font-size: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
  }
  .search-input:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
  }
  .filter-controls {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .cohort-select {
    font-size: 11px;
    padding: 4px 6px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: #f8fafc;
    color: #334155;
    flex: 1;
  }
  .risk-tabs {
    display: flex;
    gap: 4px;
  }
  .tab-btn {
    font-size: 10px;
    padding: 3px 6px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    background: #f1f5f9;
    color: #475569;
    cursor: pointer;
  }
  .tab-btn.active {
    background: #0f172a;
    color: #ffffff;
    border-color: #0f172a;
  }
  .tab-btn.red.active {
    background: #991b1b;
    border-color: #991b1b;
    color: #ffffff;
  }
  .tab-btn.amber.active {
    background: #b45309;
    border-color: #b45309;
    color: #ffffff;
  }
  .tab-btn.green.active {
    background: #065f46;
    border-color: #065f46;
    color: #ffffff;
  }
  .student-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    padding-right: 4px;
    flex: 1;
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
  .card-fails {
    margin-top: 6px;
  }
  .fail-pill {
    font-size: 9px;
    color: #b91c1c;
    background: #fef2f2;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid #fecaca;
    display: inline-block;
  }
  .empty-roster {
    font-size: 12px;
    color: #94a3b8;
    text-align: center;
    padding: 24px 0;
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
  .alert-failed-subjects {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .alert-tag {
    font-size: 11px;
    font-weight: 600;
    color: #b91c1c;
  }
  .chips-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .subj-chip.fail {
    font-size: 10px;
    background: #fee2e2;
    color: #991b1b;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
    border: 1px solid #fca5a5;
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
