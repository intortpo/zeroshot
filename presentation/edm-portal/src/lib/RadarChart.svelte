<script lang="ts">
  interface Props {
    masteryProbabilities?: Record<string, number>;
    size?: number;
  }

  let { masteryProbabilities = {}, size = 260 }: Props = $props();

  const skills = [
    { id: 'skill_vocab', name: 'Vocabulary', target: 0.85 },
    { id: 'skill_grammar', name: 'Grammar', target: 0.80 },
    { id: 'skill_reading_comp', name: 'Reading Comp', target: 0.85 },
    { id: 'skill_synthesis', name: 'Synthesis', target: 0.75 },
  ];

  let center = $derived(size / 2);
  let radius = $derived(size / 2 - 36);
  let angleSlice = $derived((Math.PI * 2) / skills.length);

  function getCoord(val: number, index: number): [number, number] {
    const angle = index * angleSlice - Math.PI / 2;
    const r = radius * Math.max(0, Math.min(1, val));
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  }

  let studentPoints = $derived(
    skills
      .map((s, i) => {
        const val = masteryProbabilities[s.id] ?? 0.5;
        const [x, y] = getCoord(val, i);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ')
  );

  let targetPoints = $derived(
    skills
      .map((s, i) => {
        const [x, y] = getCoord(s.target, i);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ')
  );
</script>

<div class="radar-container">
  <svg width={size} height={size} class="radar-svg">
    <!-- Grid concentric polygons -->
    {#each [0.25, 0.5, 0.75, 1.0] as lvl}
      <polygon
        points={skills.map((_, i) => getCoord(lvl, i).map(v => v.toFixed(1)).join(',')).join(' ')}
        fill={lvl === 1.0 ? '#f8fafc' : 'none'}
        stroke="#cbd5e1"
        stroke-width={lvl === 1.0 ? '1.5' : '1'}
        stroke-dasharray={lvl < 1.0 ? '3,3' : 'none'}
      />
    {/each}

    <!-- Axis Spokes -->
    {#each skills as skill, i}
      {@const [x, y] = getCoord(1.0, i)}
      <line x1={center} y1={center} x2={x} y2={y} stroke="#94a3b8" stroke-width="1" />
    {/each}

    <!-- Curriculum Target Polygon -->
    <polygon points={targetPoints} fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,4" />

    <!-- Student Mastery Polygon -->
    <polygon points={studentPoints} fill="rgba(13, 148, 136, 0.25)" stroke="#0d9488" stroke-width="2.5" />

    <!-- Vertex Points -->
    {#each skills as skill, i}
      {@const val = masteryProbabilities[skill.id] ?? 0.5}
      {@const [x, y] = getCoord(val, i)}
      <circle cx={x} cy={y} r="4" fill={val >= skill.target ? '#0d9488' : '#e11d48'} stroke="#ffffff" stroke-width="1.5" />
    {/each}

    <!-- Labels -->
    {#each skills as skill, i}
      {@const val = masteryProbabilities[skill.id] ?? 0.5}
      {@const [lx, ly] = getCoord(1.18, i)}
      <text x={lx} y={ly - 4} text-anchor="middle" font-size="10" font-weight="600" fill="#334155">
        {skill.name}
      </text>
      <text x={lx} y={ly + 8} text-anchor="middle" font-size="9" font-family="monospace" font-weight="700" fill={val < 0.5 ? '#e11d48' : '#0d9488'}>
        {Math.round(val * 100)}%
      </text>
    {/each}
  </svg>
</div>

<style>
  .radar-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .radar-svg {
    overflow: visible;
  }
</style>
