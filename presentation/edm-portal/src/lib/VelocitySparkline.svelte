<script lang="ts">
  interface Props {
    timeline?: Array<{
      week: number;
      normAttendance: number;
      normHomework: number;
      compositeVelocity: number;
    }>;
  }

  let { timeline = [] }: Props = $props();
</script>

<div class="sparkline-wrapper">
  <div class="sparkline-title">5-Week Normalized Attendance & Homework Velocity</div>
  <div class="sparkline-grid">
    {#each timeline as frame}
      <div class="week-column">
        <div class="bar-container">
          <!-- Attendance bar -->
          <div
            class="bar attendance"
            style="height: {Math.round(frame.normAttendance * 100)}%"
            title="W{frame.week} Attendance: {Math.round(frame.normAttendance * 100)}%"
          ></div>
          <!-- Homework bar -->
          <div
            class="bar homework"
            style="height: {Math.round(frame.normHomework * 100)}%"
            title="W{frame.week} Homework: {Math.round(frame.normHomework * 100)}%"
          ></div>
        </div>
        <span class="week-label">W{frame.week}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .sparkline-wrapper {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 12px;
  }
  .sparkline-title {
    font-size: 11px;
    color: #64748b;
    font-family: monospace;
    margin-bottom: 8px;
  }
  .sparkline-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }
  .week-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .bar-container {
    width: 100%;
    height: 48px;
    background: #f1f5f9;
    border-radius: 4px;
    display: flex;
    align-items: flex-end;
    gap: 2px;
    padding: 2px;
    box-sizing: border-box;
  }
  .bar {
    width: 50%;
    border-radius: 2px;
    transition: height 0.3s;
  }
  .bar.attendance {
    background: #0d9488;
  }
  .bar.homework {
    background: #6366f1;
  }
  .week-label {
    font-size: 10px;
    font-family: monospace;
    color: #64748b;
  }
</style>
