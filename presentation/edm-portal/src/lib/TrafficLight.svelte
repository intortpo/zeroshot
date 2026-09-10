<script lang="ts">
  interface Props {
    riskLevel?: string; // "green" | "amber" | "red"
    statusLabel?: string;
    confidence?: number;
    velocity?: number;
  }

  let {
    riskLevel = 'green',
    statusLabel = 'On-Track (Stable)',
    confidence = 0.92,
    velocity = 0.0,
  }: Props = $props();

  let badgeColor = $derived(
    riskLevel === 'red'
      ? { bg: '#fee2e2', text: '#991b1b', border: '#f87171', dot: '#dc2626' }
      : riskLevel === 'amber'
      ? { bg: '#fef3c7', text: '#92400e', border: '#fbbf24', dot: '#d97706' }
      : { bg: '#d1fae5', text: '#065f46', border: '#34d399', dot: '#059669' }
  );
</script>

<div class="traffic-box" style="background-color: {badgeColor.bg}; border-color: {badgeColor.border}">
  <div class="traffic-header">
    <div class="light-indicator">
      <span class="light-dot red" class:active={riskLevel === 'red'}></span>
      <span class="light-dot amber" class:active={riskLevel === 'amber'}></span>
      <span class="light-dot green" class:active={riskLevel === 'green'}></span>
    </div>
    <div class="status-info">
      <span class="status-title" style="color: {badgeColor.text}">{statusLabel}</span>
      <span class="status-sub">Model Confidence: {Math.round(confidence * 100)}%</span>
    </div>
  </div>

  <div class="velocity-pill">
    <span>Behavioral Velocity:</span>
    <strong>{velocity > 0 ? '+' : ''}{velocity.toFixed(2)}/wk</strong>
  </div>
</div>

<style>
  .traffic-box {
    border-radius: 12px;
    border: 1px solid;
    padding: 12px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  .traffic-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .light-indicator {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: #1e293b;
    padding: 6px 4px;
    border-radius: 6px;
  }
  .light-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    opacity: 0.25;
    transition: opacity 0.2s;
  }
  .light-dot.red { background: #ef4444; }
  .light-dot.amber { background: #f59e0b; }
  .light-dot.green { background: #10b981; }
  .light-dot.active {
    opacity: 1;
    box-shadow: 0 0 6px currentColor;
  }
  .status-info {
    display: flex;
    flex-direction: column;
  }
  .status-title {
    font-size: 13px;
    font-weight: 700;
  }
  .status-sub {
    font-size: 11px;
    color: #64748b;
    font-family: monospace;
  }
  .velocity-pill {
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid #cbd5e1;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-family: monospace;
    display: flex;
    gap: 4px;
  }
</style>
