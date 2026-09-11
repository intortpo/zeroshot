/**
 * Open Design Integration Service (nexu-io/open-design)
 * Local-first AI design workspace and runtime bridge for Zero Petri.
 * Turns local coding agents (AGY CLI, Gemini, Claude) into a comprehensive design engine.
 * Supports prototypes, landing pages, dashboards, slides, full multi-page sites/products, and multi-format exports.
 */

export interface DesignTokenSystem {
  name: string;
  version: string;
  palette: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  typography: {
    fontFamily: string;
    headingScale: string;
    bodySize: string;
  };
  radii: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  motion: {
    transitionTiming: string;
    durationMs: number;
  };
}

export interface DesignProjectArtifact {
  id: string;
  name: string;
  type: 'html' | 'tsx' | 'css' | 'json' | 'slide_deck' | 'video_motion';
  code: string;
  updatedAt: number;
}

export interface PetriWorkdeskDimensions {
  width: number;
  height: number;
  label: string; // e.g. "Desktop (1920x1080)", "Mobile (375x812)", "Slide (16:9)"
}

export interface PetriSitePage {
  id: string;
  title: string;
  route: string; // e.g. '/', '/pricing', '/features', '/app', '/checkout'
  category: 'landing_page' | 'dashboard' | 'prototype' | 'slides' | 'component' | 'mobile_app' | 'blank_canvas';
  dimensions: PetriWorkdeskDimensions;
  code: string;
  designNotes?: string;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  createdAt: number;
  updatedAt: number;
}

export interface OpenDesignProject {
  id: string;
  name: string;
  description: string;
  category: 'landing_page' | 'dashboard' | 'prototype' | 'slides' | 'component' | 'mobile_app' | 'blank_canvas';
  dimensions?: PetriWorkdeskDimensions;
  tokens: DesignTokenSystem;
  artifacts: DesignProjectArtifact[];
  activeArtifactId: string;
  exportFormats: Array<'html' | 'pdf' | 'pptx' | 'mp4'>;
  syncStatus?: 'synced' | 'local_only' | 'syncing';
  lastSyncedRemote?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PetriProductSite extends OpenDesignProject {
  slug: string;
  type: 'saas' | 'ecommerce' | 'dashboard' | 'mobile_app' | 'docs' | 'portfolio' | 'landing' | 'prototype' | 'custom';
  brand: {
    logoText: string;
    tagLine: string;
    industry: string;
  };
  pages: PetriSitePage[];
  activePageId: string;
}

export type PetriWorkdesk = PetriProductSite;

export interface McpToolSchema {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface McpServerDefinition {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'idle' | 'configuring';
  protocolVersion: string;
  tools: McpToolSchema[];
  transport: 'stdio' | 'sse' | 'in_process';
  executable?: string;
  args?: string[];
  description: string;
}

export const DEFAULT_DESIGN_TOKENS: DesignTokenSystem = {
  name: 'Petri Tiffany Clean Slate',
  version: '1.0.0',
  palette: {
    primary: '#0ABAB5',
    secondary: '#4F46E5',
    background: '#FAFBFB',
    surface: '#FFFFFF',
    text: '#1C1917',
    accent: '#0D9488',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingScale: '1.25',
    bodySize: '14px',
  },
  radii: {
    sm: '6px',
    md: '12px',
    lg: '20px',
    full: '9999px',
  },
  motion: {
    transitionTiming: 'cubic-bezier(0.16, 1, 0.3, 1)',
    durationMs: 250,
  },
};

// 4 Comprehensive Initial Products
export const INITIAL_PRODUCTS: PetriProductSite[] = [
  // 1. Momentum LMS Suite (B2B SaaS)
  {
    id: 'prod-saas-momentum',
    name: 'Momentum LMS Next-Gen Portal',
    slug: 'momentum-lms',
    description: 'High-converting responsive educational platform and student diagnostic suite for Bangkok Bilingual School',
    type: 'saas',
    category: 'landing_page',
    brand: {
      logoText: 'BBS Momentum',
      tagLine: 'Cognitive Quantum Mastery for Every Student',
      industry: 'Education Technology',
    },
    tokens: DEFAULT_DESIGN_TOKENS,
    activePageId: 'page-home',
    activeArtifactId: 'art-page-home',
    exportFormats: ['html', 'pdf', 'pptx', 'mp4'],
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 3600000,
    pages: [
      {
        id: 'page-home',
        title: 'Home',
        route: '/',
        category: 'landing_page',
        dimensions: { width: 1280, height: 800, label: 'Desktop (1280x800)' },
        createdAt: Date.now() - 86400000 * 4,
        updatedAt: Date.now() - 3600000,
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BBS Momentum LMS - Home</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; background: #FAFBFB; color: #1C1917; }
    .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(229, 231, 235, 0.8); }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between">
  <!-- Sticky Global Navigation -->
  <nav class="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-stone-200/80 px-8 py-4 flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <div class="w-3.5 h-3.5 rounded-full bg-[#0ABAB5] animate-pulse"></div>
      <span class="font-extrabold text-base tracking-tight text-stone-900">BBS Momentum</span>
      <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-semibold">EDM v8</span>
    </div>
    <div class="hidden md:flex items-center space-x-8 text-xs font-semibold text-stone-600">
      <a href="/" class="text-teal-600 font-bold border-b-2 border-teal-500 pb-0.5">Overview</a>
      <a href="/features" class="hover:text-teal-600 transition-colors">Features Bento</a>
      <a href="/pricing" class="hover:text-teal-600 transition-colors">Pricing Matrix</a>
      <a href="/app" class="hover:text-teal-600 transition-colors">Student Scorebook</a>
    </div>
    <div class="flex items-center space-x-3">
      <a href="/pricing" class="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition">Plans</a>
      <a href="/app" class="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-md transition">Launch Desk</a>
    </div>
  </nav>

  <!-- Hero Section -->
  <main class="max-w-5xl w-full mx-auto px-6 py-16 text-center space-y-8">
    <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
      <span class="w-2 h-2 rounded-full bg-[#0ABAB5] animate-ping"></span>
      <span>Autonomous Education Data Mining Engine · AY2026</span>
    </div>
    <h1 class="text-5xl md:text-6xl font-black tracking-tight text-stone-900 leading-tight">
      Empowering Every Student with <br/><span class="text-teal-600">Cognitive Diagnostics</span>
    </h1>
    <p class="text-stone-600 text-lg max-w-2xl mx-auto font-normal leading-relaxed">
      High-velocity weekly attendance normalization, DINA CDM mastery modeling, and predictive risk indicators designed with zero-latency local execution.
    </p>
    <div class="flex items-center justify-center space-x-4 pt-4">
      <a href="/app" class="px-7 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow-xl transition-all">
        Launch Student Scorebook
      </a>
      <a href="/features" class="px-7 py-3.5 rounded-2xl glass-card text-stone-800 font-semibold text-sm hover:bg-white transition-all">
        Explore 16 Competencies &rarr;
      </a>
    </div>

    <!-- Live Metric Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
      <div class="p-6 rounded-3xl glass-card space-y-2 shadow-xs">
        <div class="text-xs font-mono uppercase text-stone-400 font-bold">Mastery Vector</div>
        <div class="text-3xl font-black text-stone-900">94.2%</div>
        <div class="text-xs text-emerald-600 font-medium">↑ +4.8% from AY2026 Sem 1</div>
      </div>
      <div class="p-6 rounded-3xl glass-card space-y-2 shadow-xs">
        <div class="text-xs font-mono uppercase text-stone-400 font-bold">Active Cohorts</div>
        <div class="text-3xl font-black text-stone-900">849 Students</div>
        <div class="text-xs text-stone-500 font-normal">Grade 1 - 9 Cross-Section</div>
      </div>
      <div class="p-6 rounded-3xl glass-card space-y-2 shadow-xs">
        <div class="text-xs font-mono uppercase text-stone-400 font-bold">Inference Latency</div>
        <div class="text-3xl font-black text-stone-900">&lt; 12 ms</div>
        <div class="text-xs text-teal-600 font-medium">Rust Tactical Vector Pipeline</div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="border-t border-stone-200/80 bg-white/50 px-8 py-6 text-xs text-stone-500 flex items-center justify-between">
    <div>© 2026 Bangkok Bilingual School · BBS Momentum Engine</div>
    <div class="flex items-center space-x-4">
      <a href="/features" class="hover:text-stone-900">Features</a>
      <a href="/pricing" class="hover:text-stone-900">Pricing</a>
      <a href="/app" class="hover:text-stone-900">App</a>
    </div>
  </footer>
</body>
</html>`,
      },
      {
        id: 'page-features',
        title: 'Features Bento',
        route: '/features',
        category: 'landing_page',
        dimensions: { width: 1280, height: 800, label: 'Desktop (1280x800)' },
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now() - 7200000,
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>BBS Momentum LMS - Features Bento</title>
</head>
<body class="bg-[#FAFBFB] text-stone-900 font-sans p-8">
  <div class="max-w-6xl mx-auto space-y-8">
    <header class="flex items-center justify-between pb-6 border-b border-stone-200">
      <div>
        <span class="text-xs font-mono font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full">Core Architecture</span>
        <h1 class="text-3xl font-black text-stone-900 mt-2">BBS Momentum Diagnostic Engine</h1>
        <p class="text-xs text-stone-500 mt-1">Multi-dimensional cognitive mastery modeling combined with zero-friction attendance sync.</p>
      </div>
      <a href="/" class="text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 border border-teal-200 px-4 py-2 rounded-xl">
        &larr; Back to Home
      </a>
    </header>

    <!-- Bento Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 p-8 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div class="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">✦</div>
        <h3 class="text-xl font-bold text-stone-900">16 Competency Q-Matrix Assessment</h3>
        <p class="text-xs text-stone-600 leading-relaxed">
          Each student profile undergoes longitudinal evaluation using the Deterministic Input, Noisy "And" gate (DINA) cognitive diagnostic model. Guessing and slipping probabilities are calibrated every Sunday at midnight.
        </p>
        <div class="grid grid-cols-3 gap-3 pt-2">
          <div class="p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
            <div class="text-[10px] text-stone-400 font-mono uppercase">Linguistic Core</div>
            <div class="text-lg font-black text-teal-600">0.94</div>
          </div>
          <div class="p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
            <div class="text-[10px] text-stone-400 font-mono uppercase">STEM Synthesis</div>
            <div class="text-lg font-black text-teal-600">0.88</div>
          </div>
          <div class="p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
            <div class="text-[10px] text-stone-400 font-mono uppercase">Critical Cloze</div>
            <div class="text-lg font-black text-teal-600">0.91</div>
          </div>
        </div>
      </div>

      <div class="p-8 bg-gradient-to-br from-teal-900 to-stone-900 text-white rounded-3xl shadow-lg space-y-4">
        <div class="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider">Zero Latency</div>
        <h3 class="text-xl font-bold">Local-First Vector Acceleration</h3>
        <p class="text-xs text-stone-300 leading-relaxed">
          Pre-computed cached probability vectors allow counseling teams to query 849 students with zero round-trip network delays.
        </p>
        <div class="pt-4 border-t border-stone-800 text-[11px] font-mono text-teal-300">
          ✓ AES-256 Client Encryption<br/>
          ✓ FERPA & GDPR Compliant
        </div>
      </div>

      <div class="p-8 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-3">
        <h4 class="text-base font-bold text-stone-900">Attendance Velocity Radar</h4>
        <p class="text-xs text-stone-600 leading-relaxed">
          Tracks velocity of unexcused absences. Flags inflection points 2 weeks before standard term grade reports.
        </p>
      </div>

      <div class="p-8 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-3">
        <h4 class="text-base font-bold text-stone-900">Automated Remediation Scaffolds</h4>
        <p class="text-xs text-stone-600 leading-relaxed">
          Generates individualized bilingual practice worksheets targeting the exact latent skill deficit.
        </p>
      </div>

      <div class="p-8 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-3">
        <h4 class="text-base font-bold text-stone-900">Export & Rclone Multi-Cloud</h4>
        <p class="text-xs text-stone-600 leading-relaxed">
          One-click sync to Google Drive, AWS S3, or local PDF scorebooks with verifiable SHA-256 proofs.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
      },
      {
        id: 'page-pricing',
        title: 'Pricing Matrix',
        route: '/pricing',
        category: 'landing_page',
        dimensions: { width: 1280, height: 800, label: 'Desktop (1280x800)' },
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 3600000,
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>BBS Momentum - Pricing</title>
</head>
<body class="bg-[#FAFBFB] text-stone-900 font-sans p-8">
  <div class="max-w-5xl mx-auto space-y-12">
    <header class="text-center space-y-3">
      <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
        Transparent Institutional Licensing
      </div>
      <h1 class="text-4xl font-extrabold text-stone-900">Choose the Plan for Your Academic Tier</h1>
      <p class="text-stone-500 text-sm max-w-md mx-auto">From single-campus pilot programs to nationwide bilingual education networks.</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Tier 1 -->
      <div class="p-8 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div>
          <h3 class="text-lg font-bold text-stone-900">Department Pilot</h3>
          <p class="text-xs text-stone-500 mt-1">For single subject departments testing cognitive EDM.</p>
        </div>
        <div class="text-3xl font-extrabold text-stone-900">฿14,500 <span class="text-xs text-stone-400 font-normal">/ term</span></div>
        <ul class="space-y-3 text-xs text-stone-600">
          <li>✓ Up to 150 student profiles</li>
          <li>✓ Standard DINA model fitting</li>
          <li>✓ Weekly attendance velocity logs</li>
          <li>✓ Standalone CSV/PDF export</li>
        </ul>
        <button class="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition">Select Pilot</button>
      </div>

      <!-- Tier 2: Popular -->
      <div class="p-8 bg-stone-900 text-white rounded-3xl shadow-xl space-y-6 relative overflow-hidden border-2 border-teal-500">
        <div class="absolute top-4 right-4 bg-teal-500 text-stone-950 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
          Most Popular
        </div>
        <div>
          <h3 class="text-lg font-bold text-white">Campus Institutional</h3>
          <p class="text-xs text-stone-400 mt-1">Complete Grade 1 - 12 school-wide cognitive deployment.</p>
        </div>
        <div class="text-3xl font-extrabold text-white">฿38,000 <span class="text-xs text-stone-400 font-normal">/ term</span></div>
        <ul class="space-y-3 text-xs text-stone-300">
          <li>✓ Up to 1,500 student profiles</li>
          <li>✓ Real-time Q-Matrix calibration</li>
          <li>✓ Automated parent counseling reports</li>
          <li>✓ Rclone multi-cloud automated backup</li>
          <li>✓ AGY CLI autonomous UI synthesizer</li>
        </ul>
        <button class="w-full py-3 bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-xs rounded-xl shadow-lg transition">Deploy Campus License</button>
      </div>

      <!-- Tier 3 -->
      <div class="p-8 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div>
          <h3 class="text-lg font-bold text-stone-900">Bilingual Network</h3>
          <p class="text-xs text-stone-500 mt-1">Multi-campus clusters with dedicated cluster instances.</p>
        </div>
        <div class="text-3xl font-extrabold text-stone-900">Custom <span class="text-xs text-stone-400 font-normal">/ annual</span></div>
        <ul class="space-y-3 text-xs text-stone-600">
          <li>✓ Unlimited student cohorts</li>
          <li>✓ Dedicated self-hosted Petri server</li>
          <li>✓ Custom DINA parameter priors</li>
          <li>✓ 24/7 Priority engineering SLA</li>
        </ul>
        <button class="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition">Contact Enterprise</button>
      </div>
    </div>
  </div>
</body>
</html>`,
      },
      {
        id: 'page-app',
        title: 'Student Scorebook',
        route: '/app',
        category: 'dashboard',
        dimensions: { width: 1280, height: 800, label: 'Desktop (1280x800)' },
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now() - 1800000,
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>BBS Momentum - Student Scorebook</title>
</head>
<body class="bg-stone-50 text-stone-900 p-8 font-sans">
  <div class="max-w-6xl mx-auto space-y-6">
    <header class="flex items-center justify-between pb-6 border-b border-stone-200">
      <div>
        <div class="flex items-center space-x-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-100 text-teal-800">EDM Q-MATRIX ENGINE</span>
          <span class="text-xs text-stone-400">AY2026 Term 1 · Active</span>
        </div>
        <h1 class="text-2xl font-black text-stone-900 mt-1">Student Cognitive Diagnostic Scorebook</h1>
        <p class="text-xs text-stone-500">Bangkok Bilingual School · Cohort Cross-Section</p>
      </div>
      <div class="flex items-center gap-3">
        <a href="/" class="px-4 py-2 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-semibold text-stone-700 shadow-2xs">
          Home
        </a>
        <button class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-2xs cursor-pointer">
          Calibrate Parameters
        </button>
      </div>
    </header>

    <!-- KPI Grid -->
    <div class="grid grid-cols-4 gap-4">
      <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs">
        <div class="text-[10px] font-mono uppercase text-stone-400 font-bold">Enrolled Cohort</div>
        <div class="text-3xl font-black text-stone-900 mt-1">849</div>
        <div class="text-xs text-emerald-600 font-medium mt-1">↑ 100% Synced</div>
      </div>
      <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs">
        <div class="text-[10px] font-mono uppercase text-stone-400 font-bold">DINA Latent Mastery</div>
        <div class="text-3xl font-black text-teal-600 mt-1">86.4%</div>
        <div class="text-xs text-stone-500 font-medium mt-1">16 Core Competencies</div>
      </div>
      <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs">
        <div class="text-[10px] font-mono uppercase text-stone-400 font-bold">Attendance Velocity</div>
        <div class="text-3xl font-black text-indigo-600 mt-1">94.8%</div>
        <div class="text-xs text-indigo-500 font-medium mt-1">+1.2% baseline</div>
      </div>
      <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs">
        <div class="text-[10px] font-mono uppercase text-stone-400 font-bold">Intervention Alerts</div>
        <div class="text-3xl font-black text-rose-500 mt-1">12</div>
        <div class="text-xs text-rose-600 font-medium mt-1">Requires review</div>
      </div>
    </div>

    <!-- Student Table -->
    <div class="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
      <div class="p-4 border-b border-stone-100 flex items-center justify-between">
        <h2 class="text-sm font-bold text-stone-900">Student Psychometric Trajectories</h2>
        <span class="text-xs text-stone-400 font-mono">Live RAG-calibrated</span>
      </div>
      <table class="w-full text-left text-xs">
        <thead class="bg-stone-50 text-stone-500 font-mono text-[11px] uppercase border-b border-stone-200">
          <tr>
            <th class="px-4 py-3">Student Name</th>
            <th class="px-4 py-3">Grade Level</th>
            <th class="px-4 py-3">Mastery Profile</th>
            <th class="px-4 py-3">Attendance</th>
            <th class="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          <tr class="hover:bg-stone-50/60 transition">
            <td class="px-4 py-3 font-semibold text-stone-900">Sirapop Chaiprasert</td>
            <td class="px-4 py-3 text-stone-600">Grade 9 - Bilingual STEM</td>
            <td class="px-4 py-3">
              <div class="w-32 bg-stone-200 rounded-full h-2"><div class="bg-teal-500 h-2 rounded-full" style="width: 92%"></div></div>
            </td>
            <td class="px-4 py-3 font-mono text-emerald-600 font-semibold">98.5%</td>
            <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Mastered</span></td>
          </tr>
          <tr class="hover:bg-stone-50/60 transition">
            <td class="px-4 py-3 font-semibold text-stone-900">Nutthida Somboon</td>
            <td class="px-4 py-3 text-stone-600">Grade 10 - Advanced Humanities</td>
            <td class="px-4 py-3">
              <div class="w-32 bg-stone-200 rounded-full h-2"><div class="bg-teal-500 h-2 rounded-full" style="width: 78%"></div></div>
            </td>
            <td class="px-4 py-3 font-mono text-teal-600 font-semibold">95.0%</td>
            <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">On Track</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`,
      },
    ],
    artifacts: [],
  },

  // 2. Quantum EDM Analytics Platform
  {
    id: 'prod-edm-quantum',
    name: 'Quantum EDM Analytics Platform',
    slug: 'quantum-edm',
    description: 'Executive psychometric modeling and cognitive risk boundary surveillance platform',
    type: 'dashboard',
    category: 'dashboard',
    brand: {
      logoText: 'Quantum EDM',
      tagLine: 'Longitudinal Psychometric Modeling & Risk Prevention',
      industry: 'Data Analytics & AI',
    },
    tokens: {
      ...DEFAULT_DESIGN_TOKENS,
      palette: {
        ...DEFAULT_DESIGN_TOKENS.palette,
        primary: '#4F46E5',
        secondary: '#0ABAB5',
      },
    },
    activePageId: 'page-edm-dash',
    activeArtifactId: 'art-page-edm-dash',
    exportFormats: ['html', 'pdf', 'pptx'],
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 1800000,
    pages: [
      {
        id: 'page-edm-dash',
        title: 'Cognitive Overview',
        route: '/',
        category: 'dashboard',
        dimensions: { width: 1280, height: 800, label: 'Desktop (1280x800)' },
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now() - 1800000,
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>Quantum EDM - Overview</title>
</head>
<body class="bg-stone-900 text-stone-100 p-8 font-sans">
  <div class="max-w-6xl mx-auto space-y-6">
    <header class="flex items-center justify-between border-b border-stone-800 pb-4">
      <div>
        <div class="flex items-center space-x-2 text-indigo-400 font-mono text-xs">
          <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span>QUANTUM EDM CLUSTER // STABLE</span>
        </div>
        <h1 class="text-2xl font-bold text-white mt-1">Executive Cognitive Surveillance</h1>
      </div>
      <div class="flex items-center space-x-4 text-xs font-mono">
        <a href="/cohorts" class="text-indigo-400 hover:text-indigo-300">View Cohort Matrix &rarr;</a>
      </div>
    </header>
    <div class="grid grid-cols-3 gap-6">
      <div class="p-6 bg-stone-800/80 rounded-2xl border border-stone-700/60 space-y-3">
        <div class="text-xs text-stone-400 font-mono">WATERLINE RESILIENCE</div>
        <div class="text-4xl font-extrabold text-indigo-400">+2.41σ</div>
        <div class="text-xs text-emerald-400">Zero cohorts under terminal breach</div>
      </div>
      <div class="p-6 bg-stone-800/80 rounded-2xl border border-stone-700/60 space-y-3">
        <div class="text-xs text-stone-400 font-mono">DINA ITEM CONVERGENCE</div>
        <div class="text-4xl font-extrabold text-teal-400">99.1%</div>
        <div class="text-xs text-stone-400">EM log-likelihood stabilized</div>
      </div>
      <div class="p-6 bg-stone-800/80 rounded-2xl border border-stone-700/60 space-y-3">
        <div class="text-xs text-stone-400 font-mono">INTERVENTION VELOCITY</div>
        <div class="text-4xl font-extrabold text-amber-400">&lt; 24 hrs</div>
        <div class="text-xs text-amber-300">Slippage correction loop</div>
      </div>
    </div>
  </div>
</body>
</html>`,
      },
      {
        id: 'page-edm-cohorts',
        title: 'Cohort Matrix',
        route: '/cohorts',
        category: 'dashboard',
        dimensions: { width: 1280, height: 800, label: 'Desktop (1280x800)' },
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 3600000,
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>Quantum EDM - Cohorts</title>
</head>
<body class="bg-stone-900 text-stone-100 p-8 font-sans">
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between pb-4 border-b border-stone-800">
      <h2 class="text-xl font-bold">Longitudinal Student Cohort Matrix</h2>
      <a href="/" class="text-xs text-indigo-400">&larr; Overview</a>
    </div>
    <div class="p-6 bg-stone-800/60 rounded-2xl border border-stone-700">
      <div class="text-xs text-stone-400 font-mono mb-4">Sample of 849 Verified Records</div>
      <div class="space-y-2 text-xs font-mono">
        <div class="p-3 bg-stone-900 rounded-xl flex items-center justify-between">
          <span>Cohort BBS-G9-STEM</span>
          <span class="text-teal-400">Mastery: 0.94</span>
          <span class="text-emerald-400 font-bold">Optimal</span>
        </div>
        <div class="p-3 bg-stone-900 rounded-xl flex items-center justify-between">
          <span>Cohort BBS-G10-HUM</span>
          <span class="text-teal-400">Mastery: 0.88</span>
          <span class="text-teal-400 font-bold">On Track</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
      },
    ],
    artifacts: [],
  },

  // 3. EcoPetri DTC Storefront
  {
    id: 'prod-shop-ecopetri',
    name: 'EcoPetri Sustainable Storefront',
    slug: 'ecopetri-shop',
    description: 'High-converting direct-to-consumer e-commerce storefront with product grid and checkout slideout',
    type: 'ecommerce',
    category: 'landing_page',
    brand: {
      logoText: 'EcoPetri Organic',
      tagLine: 'Minimalist Zero-Waste Living',
      industry: 'E-Commerce & Retail',
    },
    tokens: {
      ...DEFAULT_DESIGN_TOKENS,
      palette: {
        ...DEFAULT_DESIGN_TOKENS.palette,
        primary: '#0D9488',
        accent: '#F59E0B',
      },
    },
    activePageId: 'page-shop-home',
    activeArtifactId: 'art-page-shop-home',
    exportFormats: ['html', 'pdf', 'mp4'],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 1200000,
    pages: [
      {
        id: 'page-shop-home',
        title: 'Storefront',
        route: '/',
        category: 'landing_page',
        dimensions: { width: 1280, height: 800, label: 'Desktop (1280x800)' },
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 1200000,
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>EcoPetri - Sustainable Storefront</title>
</head>
<body class="bg-[#F8F9FA] text-stone-900 font-sans min-h-screen">
  <!-- Nav -->
  <nav class="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
    <div class="flex items-center space-x-2">
      <span class="w-3 h-3 rounded-full bg-emerald-600"></span>
      <span class="font-bold text-lg tracking-tight">EcoPetri</span>
    </div>
    <div class="flex items-center space-x-6 text-xs font-semibold text-stone-600">
      <a href="/" class="text-emerald-700">Home</a>
      <a href="/shop" class="hover:text-emerald-700">Catalog</a>
      <a href="/checkout" class="hover:text-emerald-700">Checkout</a>
    </div>
    <a href="/checkout" class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold">
      Cart (2 Items)
    </a>
  </nav>

  <!-- Hero -->
  <section class="max-w-5xl mx-auto px-6 py-16 text-center space-y-6">
    <span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-mono font-semibold">100% Biodegradable Materials</span>
    <h1 class="text-5xl font-black text-stone-900 tracking-tight leading-tight">Living Consciously <br/>Without Compromise</h1>
    <p class="text-stone-600 max-w-xl mx-auto text-sm">Engineered in Scandinavia with organic materials, carbon-negative shipping, and lifecycle recycling guarantees.</p>
    <div>
      <a href="/shop" class="px-8 py-3.5 bg-stone-900 text-white font-bold text-xs rounded-xl shadow-md hover:bg-stone-800 transition">
        Explore Collection &rarr;
      </a>
    </div>
  </section>
</body>
</html>`,
      },
      {
        id: 'page-shop-catalog',
        title: 'Product Catalog',
        route: '/shop',
        category: 'landing_page',
        dimensions: { width: 1280, height: 800, label: 'Desktop (1280x800)' },
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 3600000,
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>EcoPetri - Catalog</title>
</head>
<body class="bg-[#F8F9FA] text-stone-900 font-sans p-8">
  <div class="max-w-6xl mx-auto space-y-8">
    <div class="flex items-center justify-between pb-4 border-b border-stone-200">
      <div>
        <h1 class="text-2xl font-bold">Organic Essentials Catalog</h1>
        <p class="text-xs text-stone-500">6 Curated Sustainable Items</p>
      </div>
      <a href="/checkout" class="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-xl">View Cart</a>
    </div>

    <!-- Product Grid -->
    <div class="grid grid-cols-3 gap-6">
      <div class="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-3">
        <div class="h-44 bg-stone-100 rounded-2xl flex items-center justify-center text-4xl">🌱</div>
        <div class="text-xs font-mono text-emerald-700">ORGANIC FIBER</div>
        <h3 class="font-bold text-sm">Petri Canvas Tote</h3>
        <div class="flex items-center justify-between pt-2">
          <span class="font-bold text-sm">฿890</span>
          <button class="px-3 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-xl">Add to Cart</button>
        </div>
      </div>
      <div class="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-3">
        <div class="h-44 bg-stone-100 rounded-2xl flex items-center justify-center text-4xl">☕</div>
        <div class="text-xs font-mono text-emerald-700">THERMAL BAMBOO</div>
        <h3 class="font-bold text-sm">Insulated Travel Tumbler</h3>
        <div class="flex items-center justify-between pt-2">
          <span class="font-bold text-sm">฿1,250</span>
          <button class="px-3 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-xl">Add to Cart</button>
        </div>
      </div>
      <div class="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-3">
        <div class="h-44 bg-stone-100 rounded-2xl flex items-center justify-center text-4xl">🌿</div>
        <div class="text-xs font-mono text-emerald-700">RECYCLED GLASS</div>
        <h3 class="font-bold text-sm">Aroma Mist Diffuser</h3>
        <div class="flex items-center justify-between pt-2">
          <span class="font-bold text-sm">฿1,490</span>
          <button class="px-3 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-xl">Add to Cart</button>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
      },
      {
        id: 'page-shop-checkout',
        title: 'Checkout',
        route: '/checkout',
        category: 'landing_page',
        dimensions: { width: 1280, height: 800, label: 'Desktop (1280x800)' },
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 2400000,
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>EcoPetri - Checkout</title>
</head>
<body class="bg-[#F8F9FA] text-stone-900 font-sans p-8">
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between pb-4 border-b border-stone-200">
      <h1 class="text-2xl font-bold">Secure Checkout</h1>
      <span class="text-xs font-mono text-emerald-700">256-Bit SSL Encrypted</span>
    </div>
    <div class="grid grid-cols-2 gap-8">
      <div class="p-6 bg-white rounded-3xl border border-stone-200 space-y-4">
        <h3 class="font-bold text-sm">Shipping Information</h3>
        <input type="text" placeholder="Full Name" class="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs" />
        <input type="email" placeholder="Email Address" class="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs" />
        <input type="text" placeholder="Street Address" class="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs" />
      </div>
      <div class="p-6 bg-white rounded-3xl border border-stone-200 space-y-4">
        <h3 class="font-bold text-sm">Order Summary</h3>
        <div class="space-y-2 text-xs border-b border-stone-100 pb-3">
          <div class="flex justify-between"><span>Petri Canvas Tote</span><span>฿890</span></div>
          <div class="flex justify-between"><span>Bamboo Tumbler</span><span>฿1,250</span></div>
          <div class="flex justify-between text-stone-400"><span>Carbon Neutral Shipping</span><span>FREE</span></div>
        </div>
        <div class="flex justify-between font-bold text-base">
          <span>Total</span>
          <span class="text-emerald-700">฿2,140</span>
        </div>
        <button class="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-lg transition">
          Complete Purchase &rarr;
        </button>
      </div>
    </div>
  </div>
</body>
</html>`,
      },
    ],
    artifacts: [],
  },

  // 4. Submersion Spatial 3D Engine
  {
    id: 'prod-spatial-3d',
    name: 'Submersion Spatial 3D Engine',
    slug: 'submersion-3d',
    description: 'Hardware-accelerated Three.js WebGL volumetric manifold with interactive waterline telemetry',
    type: 'prototype',
    category: 'prototype',
    brand: {
      logoText: 'Submersion 3D',
      tagLine: 'Volumetric Manifold Spatial Computing',
      industry: 'Spatial Computing & Simulation',
    },
    tokens: {
      ...DEFAULT_DESIGN_TOKENS,
      palette: {
        ...DEFAULT_DESIGN_TOKENS.palette,
        primary: '#0ABAB5',
        background: '#0C121E',
        text: '#F8FAFC',
      },
    },
    activePageId: 'page-3d-manifold',
    activeArtifactId: 'art-page-3d-manifold',
    exportFormats: ['html', 'mp4'],
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 3600000,
    pages: [
      {
        id: 'page-3d-manifold',
        title: '3D Manifold',
        route: '/',
        category: 'prototype',
        dimensions: { width: 1280, height: 800, label: 'Desktop (1280x800)' },
        createdAt: Date.now() - 86400000 * 5,
        updatedAt: Date.now() - 3600000,
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <title>Submersion 3D Manifold</title>
  <style>body { margin: 0; overflow: hidden; background: #0c121e; font-family: 'Inter', system-ui, sans-serif; }</style>
</head>
<body class="text-white select-none">
  <div id="canvas-container" class="absolute inset-0 w-full h-full"></div>
  <div class="relative z-10 p-6 pointer-events-none flex flex-col justify-between h-screen">
    <div class="flex items-start justify-between">
      <div class="bg-stone-900/80 backdrop-blur-md p-4 rounded-2xl border border-teal-500/30 shadow-2xl pointer-events-auto">
        <div class="flex items-center space-x-2 mb-1">
          <span class="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
          <span class="text-[11px] font-mono font-bold tracking-wider uppercase text-teal-400">3D Petri Submersion</span>
        </div>
        <h1 class="text-xl font-black text-white">Volumetric Manifold Explorer</h1>
        <p class="text-xs text-stone-400 mt-0.5 max-w-sm">Continuous latent trajectory modeling with dynamic waterline boundary.</p>
      </div>
      <div class="bg-stone-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-stone-800 space-y-1 pointer-events-auto text-right font-mono text-xs">
        <div class="text-[10px] text-stone-500 uppercase">Elevation Telemetry</div>
        <div class="text-teal-300 font-bold">+2.4σ Above Baseline</div>
      </div>
    </div>
    <div class="flex items-center justify-between text-xs font-mono text-stone-400 pointer-events-none">
      <span>Drag mouse to rotate · Scroll to zoom</span>
      <span class="text-teal-400">60 FPS Hardware Accelerated</span>
    </div>
  </div>

  <script>
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c121e, 0.015);
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 35);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(50, 50, 40, 40);
    geometry.rotateX(-Math.PI / 2);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const d = Math.sqrt(x * x + z * z);
      const y = Math.sin(x * 0.25) * Math.cos(z * 0.25) * 4 + Math.exp(-d * 0.08) * 6;
      pos.setY(i, y);
    }
    geometry.computeVertexNormals();
    const terrain = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x0ABAB5, wireframe: true, transparent: true, opacity: 0.65 }));
    scene.add(terrain);

    let isDragging = false;
    let prevMouseX = 0;
    let targetRotationY = 0;
    window.addEventListener('mousedown', (e) => { isDragging = true; prevMouseX = e.clientX; });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      targetRotationY += (e.clientX - prevMouseX) * 0.008;
      prevMouseX = e.clientX;
    });
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    function animate() {
      requestAnimationFrame(animate);
      terrain.rotation.y += (targetRotationY - terrain.rotation.y) * 0.05;
      renderer.render(scene, camera);
    }
    animate();
  </script>
</body>
</html>`,
      },
    ],
    artifacts: [],
  },
];

// Helper to synchronize artifacts array with pages
function syncProductArtifacts(product: PetriProductSite): PetriProductSite {
  const artifacts: DesignProjectArtifact[] = product.pages.map((p) => {
    const filename = p.route === '/' ? 'index.html' : `${p.route.replace(/^\//, '').replace(/\//g, '-')}.html`;
    return {
      id: `art-${p.id}`,
      name: filename,
      type: 'html',
      code: p.code,
      updatedAt: p.updatedAt,
    };
  });

  // Also include DESIGN.md
  artifacts.push({
    id: `art-design-notes-${product.id}`,
    name: 'DESIGN.md',
    type: 'json',
    code: `# ${product.name} Design System
- Type: ${product.type}
- Industry: ${product.brand.industry}
- Primary Accent: ${product.tokens.palette.primary}
- Typography: ${product.tokens.typography.fontFamily}
- Pages Count: ${product.pages.length}`,
    updatedAt: product.updatedAt,
  });

  product.artifacts = artifacts;
  const activePage = product.pages.find((p) => p.id === product.activePageId) || product.pages[0];
  if (activePage) {
    product.activeArtifactId = `art-${activePage.id}`;
    product.dimensions = activePage.dimensions;
  }
  return product;
}

export const REGISTERED_MCP_SERVERS: McpServerDefinition[] = [
  {
    id: 'open-design',
    name: 'Open Design MCP Server',
    version: '1.2.0',
    status: 'active',
    protocolVersion: '2024-11-05',
    transport: 'in_process',
    description: 'Local-first multi-product AI design engine for sites, web apps, storefronts, and multi-format exports.',
    tools: [
      {
        name: 'od_list_products',
        description: 'Lists all multi-page sites and design products managed by Open Design.',
        parameters: {
          type: 'object',
          properties: {
            filter: { type: 'string', description: 'Product type filter: saas | ecommerce | dashboard | mobile_app | all' },
          },
        },
      },
      {
        name: 'od_create_product',
        description: 'Creates a new multi-page site or product with customized tokens and route structure.',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Site or product title' },
            type: { type: 'string', description: 'saas | ecommerce | dashboard | mobile_app | docs' },
            description: { type: 'string', description: 'Product vision and domain scope' },
          },
          required: ['name', 'type'],
        },
      },
      {
        name: 'od_add_page',
        description: 'Adds a new page or route to a product (e.g. /pricing, /features, /checkout).',
        parameters: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Target product ID' },
            title: { type: 'string', description: 'Page Title' },
            route: { type: 'string', description: 'URL route (e.g. /pricing)' },
          },
          required: ['productId', 'title', 'route'],
        },
      },
      {
        name: 'od_export_bundle',
        description: 'Exports the full multi-page product site bundle as an archive or static deployment manifest.',
        parameters: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Target product ID' },
          },
          required: ['productId'],
        },
      },
    ],
  },
];

class OpenDesignService {
  private products: PetriProductSite[] = [];
  private mcpServers: McpServerDefinition[] = [...REGISTERED_MCP_SERVERS];

  constructor() {
    this.loadProducts();
  }

  private loadProducts() {
    try {
      // 1. Try loading v2 multi-product store
      const storedV2 = localStorage.getItem('petri_products_v2');
      if (storedV2) {
        const parsed = JSON.parse(storedV2);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.products = parsed.map((p) => syncProductArtifacts(p));
          return;
        }
      }

      // 2. Migration from v1 workdesks
      const storedV1 = localStorage.getItem('petri_design_workdesks_v1');
      if (storedV1) {
        const parsed = JSON.parse(storedV1);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.products = parsed.map((v1Desk: any) => {
            const pageId = `page-${Date.now().toString(36)}-1`;
            const mainHtml = v1Desk.artifacts?.[0]?.code || '<html><body><h1>Design</h1></body></html>';
            const converted: PetriProductSite = {
              ...v1Desk,
              slug: v1Desk.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              type: v1Desk.category === 'dashboard' ? 'dashboard' : 'saas',
              brand: {
                logoText: v1Desk.name,
                tagLine: v1Desk.description || '',
                industry: 'General Software',
              },
              pages: [
                {
                  id: pageId,
                  title: 'Home',
                  route: '/',
                  category: v1Desk.category || 'landing_page',
                  dimensions: v1Desk.dimensions || { width: 1280, height: 800, label: 'Desktop (1280x800)' },
                  code: mainHtml,
                  createdAt: v1Desk.createdAt || Date.now(),
                  updatedAt: v1Desk.updatedAt || Date.now(),
                },
              ],
              activePageId: pageId,
            };
            return syncProductArtifacts(converted);
          });
          this.saveProducts();
          return;
        }
      }

      // 3. Fallback to Initial 4 Products
      this.products = INITIAL_PRODUCTS.map((p) => syncProductArtifacts(p));
      this.saveProducts();
    } catch {
      this.products = INITIAL_PRODUCTS.map((p) => syncProductArtifacts(p));
    }
  }

  private saveProducts() {
    try {
      localStorage.setItem('petri_products_v2', JSON.stringify(this.products));
      // Also update legacy storage for any remaining components
      localStorage.setItem('petri_design_workdesks_v1', JSON.stringify(this.products));
    } catch (e) {
      console.warn('Failed to save Petri Design products to localStorage', e);
    }
  }

  // --- Product Management Methods ---

  public getProducts(): PetriProductSite[] {
    return this.products;
  }

  public getProduct(id: string): PetriProductSite | undefined {
    return this.products.find((p) => p.id === id);
  }

  // Backwards compatibility aliases
  public getProjects(): PetriProductSite[] {
    return this.getProducts();
  }

  public getWorkdesks(): PetriWorkdesk[] {
    return this.getProducts();
  }

  public getProject(id: string): PetriProductSite | undefined {
    return this.getProduct(id);
  }

  public getWorkdesk(id: string): PetriWorkdesk | undefined {
    return this.getProduct(id);
  }

  public createProduct(params: {
    name: string;
    slug?: string;
    type?: PetriProductSite['type'];
    description?: string;
    brand?: Partial<PetriProductSite['brand']>;
    tokens?: DesignTokenSystem;
    initialPages?: Array<{ title: string; route: string; template?: string }>;
  }): PetriProductSite {
    const id = `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    const slug = params.slug || params.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const type = params.type || 'saas';
    const description = params.description || `${params.name} Product Suite`;
    const tokens = params.tokens || { ...DEFAULT_DESIGN_TOKENS };

    const brand = {
      logoText: params.brand?.logoText || params.name,
      tagLine: params.brand?.tagLine || description,
      industry: params.brand?.industry || 'Modern Web Application',
    };

    const initialPagesConfig = params.initialPages || [
      { title: 'Home', route: '/', template: 'landing' },
      { title: 'Features', route: '/features', template: 'bento' },
      { title: 'Pricing', route: '/pricing', template: 'pricing' },
    ];

    const pages: PetriSitePage[] = initialPagesConfig.map((pConfig, index) => {
      const pageId = `page-${Date.now().toString(36)}-${index}`;
      return {
        id: pageId,
        title: pConfig.title,
        route: pConfig.route,
        category: 'landing_page',
        dimensions: { width: 1280, height: 800, label: 'Desktop (1280x800)' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        code: this.generateStarterPageHtml({
          productName: params.name,
          pageTitle: pConfig.title,
          route: pConfig.route,
          type,
          primaryColor: tokens.palette.primary,
        }),
      };
    });

    const newProduct: PetriProductSite = {
      id,
      name: params.name,
      slug,
      description,
      type,
      category: 'landing_page',
      brand,
      tokens,
      pages,
      activePageId: pages[0]?.id || '',
      activeArtifactId: '',
      exportFormats: ['html', 'pdf', 'pptx', 'mp4'],
      syncStatus: 'local_only',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      artifacts: [],
    };

    syncProductArtifacts(newProduct);
    this.products = [newProduct, ...this.products];
    this.saveProducts();
    return newProduct;
  }

  // Workdesk compatibility creator
  public createWorkdesk(params: {
    name: string;
    category?: OpenDesignProject['category'];
    description?: string;
    template?: 'landing' | 'dashboard' | 'submersion_3d' | 'slides' | 'mobile' | 'blank';
    dimensions?: PetriWorkdeskDimensions;
  }): PetriWorkdesk {
    return this.createProduct({
      name: params.name,
      description: params.description,
      initialPages: [{ title: 'Home', route: '/', template: params.template }],
    });
  }

  public createProject(
    name: string,
    category: OpenDesignProject['category'],
    description: string
  ): OpenDesignProject {
    return this.createWorkdesk({ name, category, description });
  }

  public duplicateProduct(id: string): PetriProductSite | undefined {
    const original = this.getProduct(id);
    if (!original) return undefined;

    const newId = `prod-${Date.now().toString(36)}-dup`;
    const duplicated: PetriProductSite = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy`,
      syncStatus: 'local_only',
      lastSyncedRemote: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pages: original.pages.map((p) => ({
        ...p,
        id: `page-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      })),
    };
    duplicated.activePageId = duplicated.pages[0]?.id || '';
    syncProductArtifacts(duplicated);

    this.products = [duplicated, ...this.products];
    this.saveProducts();
    return duplicated;
  }

  public duplicateWorkdesk(id: string): PetriWorkdesk | undefined {
    return this.duplicateProduct(id);
  }

  public deleteProduct(id: string): void {
    this.products = this.products.filter((p) => p.id !== id);
    this.saveProducts();
  }

  public deleteWorkdesk(id: string): void {
    this.deleteProduct(id);
  }

  public renameProduct(id: string, newName: string): PetriProductSite | undefined {
    const prod = this.getProduct(id);
    if (!prod) return undefined;
    prod.name = newName;
    prod.updatedAt = Date.now();
    syncProductArtifacts(prod);
    this.saveProducts();
    return prod;
  }

  public renameWorkdesk(id: string, newName: string): PetriWorkdesk | undefined {
    return this.renameProduct(id, newName);
  }

  public updateProductBrand(id: string, brandUpdates: Partial<PetriProductSite['brand']>): void {
    const prod = this.getProduct(id);
    if (!prod) return;
    prod.brand = { ...prod.brand, ...brandUpdates };
    prod.updatedAt = Date.now();
    syncProductArtifacts(prod);
    this.saveProducts();
  }

  public updateProductTokens(id: string, tokens: Partial<DesignTokenSystem>): void {
    const prod = this.getProduct(id);
    if (!prod) return;
    prod.tokens = { ...prod.tokens, ...tokens };
    prod.updatedAt = Date.now();
    syncProductArtifacts(prod);
    this.saveProducts();
  }

  public markWorkdeskSynced(id: string, remoteName: string): void {
    const prod = this.getProduct(id);
    if (!prod) return;
    prod.syncStatus = 'synced';
    prod.lastSyncedRemote = remoteName;
    prod.updatedAt = Date.now();
    this.saveProducts();
  }

  // --- Page / Route Management Methods ---

  public setActivePage(productId: string, pageId: string): void {
    const prod = this.getProduct(productId);
    if (!prod) return;
    const page = prod.pages.find((p) => p.id === pageId);
    if (!page) return;
    prod.activePageId = page.id;
    prod.activeArtifactId = `art-${page.id}`;
    prod.dimensions = page.dimensions;
    this.saveProducts();
  }

  public addPageToProduct(
    productId: string,
    params: {
      title: string;
      route: string;
      category?: PetriSitePage['category'];
      dimensions?: PetriWorkdeskDimensions;
      template?: string;
    }
  ): PetriSitePage | undefined {
    const prod = this.getProduct(productId);
    if (!prod) return undefined;

    const pageId = `page-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    let cleanRoute = params.route.trim();
    if (!cleanRoute.startsWith('/')) cleanRoute = '/' + cleanRoute;

    const newPage: PetriSitePage = {
      id: pageId,
      title: params.title,
      route: cleanRoute,
      category: params.category || 'landing_page',
      dimensions: params.dimensions || { width: 1280, height: 800, label: 'Desktop (1280x800)' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      code: this.generateStarterPageHtml({
        productName: prod.name,
        pageTitle: params.title,
        route: cleanRoute,
        type: prod.type,
        primaryColor: prod.tokens.palette.primary,
      }),
    };

    prod.pages.push(newPage);
    prod.activePageId = newPage.id;
    prod.updatedAt = Date.now();
    syncProductArtifacts(prod);
    this.saveProducts();
    return newPage;
  }

  public duplicatePage(productId: string, pageId: string): PetriSitePage | undefined {
    const prod = this.getProduct(productId);
    if (!prod) return undefined;
    const original = prod.pages.find((p) => p.id === pageId);
    if (!original) return undefined;

    const newPageId = `page-${Date.now().toString(36)}-dup`;
    const duplicated: PetriSitePage = {
      ...original,
      id: newPageId,
      title: `${original.title} (Copy)`,
      route: `${original.route}-copy`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    prod.pages.push(duplicated);
    prod.activePageId = duplicated.id;
    prod.updatedAt = Date.now();
    syncProductArtifacts(prod);
    this.saveProducts();
    return duplicated;
  }

  public deletePage(productId: string, pageId: string): void {
    const prod = this.getProduct(productId);
    if (!prod || prod.pages.length <= 1) return;

    prod.pages = prod.pages.filter((p) => p.id !== pageId);
    if (prod.activePageId === pageId) {
      prod.activePageId = prod.pages[0].id;
    }
    prod.updatedAt = Date.now();
    syncProductArtifacts(prod);
    this.saveProducts();
  }

  public renamePageRoute(
    productId: string,
    pageId: string,
    title: string,
    route: string
  ): PetriSitePage | undefined {
    const prod = this.getProduct(productId);
    if (!prod) return undefined;
    const page = prod.pages.find((p) => p.id === pageId);
    if (!page) return undefined;

    page.title = title;
    page.route = route.startsWith('/') ? route : '/' + route;
    page.updatedAt = Date.now();
    prod.updatedAt = Date.now();
    syncProductArtifacts(prod);
    this.saveProducts();
    return page;
  }

  public updatePageCode(productId: string, pageId: string, newCode: string): void {
    const prod = this.getProduct(productId);
    if (!prod) return;
    const page = prod.pages.find((p) => p.id === pageId);
    if (!page) return;
    page.code = newCode;
    page.updatedAt = Date.now();
    prod.updatedAt = Date.now();
    syncProductArtifacts(prod);
    this.saveProducts();
  }

  public updateArtifactCode(projectId: string, artifactId: string, newCode: string): void {
    const prod = this.getProduct(projectId);
    if (!prod) return;
    // Map artifactId back to page
    const page = prod.pages.find((p) => `art-${p.id}` === artifactId || p.id === artifactId);
    if (page) {
      page.code = newCode;
      page.updatedAt = Date.now();
    }
    prod.updatedAt = Date.now();
    syncProductArtifacts(prod);
    this.saveProducts();
  }

  // Helper generator for clean HTML pages
  private generateStarterPageHtml(params: {
    productName: string;
    pageTitle: string;
    route: string;
    type: string;
    primaryColor: string;
  }): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.productName} - ${params.pageTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; background: #FAFBFB; color: #1C1917; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between">
  <!-- Nav -->
  <header class="border-b border-stone-200/80 bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between">
    <div class="flex items-center space-x-2">
      <span class="w-3 h-3 rounded-full bg-[${params.primaryColor}]"></span>
      <span class="font-extrabold text-stone-900">${params.productName}</span>
      <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">${params.route}</span>
    </div>
    <div class="flex items-center space-x-6 text-xs font-semibold text-stone-600">
      <a href="/" class="hover:text-stone-900">Home</a>
      <a href="${params.route}" class="text-stone-900 font-bold underline">${params.pageTitle}</a>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-4xl w-full mx-auto px-6 py-16 text-center space-y-6">
    <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
      <span>Petri Design Studio · ${params.type.toUpperCase()}</span>
    </div>
    <h1 class="text-4xl font-extrabold text-stone-900">${params.pageTitle}</h1>
    <p class="text-stone-600 text-sm max-w-lg mx-auto">
      Customize this page using the drag-and-drop Component Palette or dispatch AGY CLI natural language directives.
    </p>
    <div class="pt-4">
      <button class="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-sm transition">
        Primary Action
      </button>
    </div>
  </main>

  <!-- Footer -->
  <footer class="border-t border-stone-200/80 bg-white/40 px-8 py-4 text-xs text-stone-400 text-center font-mono">
    ${params.productName} · Route: ${params.route}
  </footer>
</body>
</html>`;
  }

  // --- Multi-Site Bundle Exporter ---

  public exportProductSiteBundle(productId: string): {
    filename: string;
    product: PetriProductSite;
    files: Array<{ name: string; content: string; mimeType: string }>;
  } {
    const prod = this.getProduct(productId);
    if (!prod) throw new Error(`Product ${productId} not found`);

    const files: Array<{ name: string; content: string; mimeType: string }> = [];

    // 1. Export each page HTML
    prod.pages.forEach((p) => {
      const pageFilename = p.route === '/' ? 'index.html' : `${p.route.replace(/^\//, '').replace(/\//g, '-')}.html`;
      files.push({
        name: pageFilename,
        content: p.code,
        mimeType: 'text/html',
      });
    });

    // 2. Export manifest.json
    const manifest = {
      name: prod.name,
      slug: prod.slug,
      type: prod.type,
      brand: prod.brand,
      tokens: prod.tokens,
      pages: prod.pages.map((p) => ({
        title: p.title,
        route: p.route,
        category: p.category,
        file: p.route === '/' ? 'index.html' : `${p.route.replace(/^\//, '').replace(/\//g, '-')}.html`,
      })),
      exportedAt: new Date().toISOString(),
      generator: 'Petri Design (OpenDesign) v8',
    };
    files.push({
      name: 'site-manifest.json',
      content: JSON.stringify(manifest, null, 2),
      mimeType: 'application/json',
    });

    // 3. Export DESIGN.md
    files.push({
      name: 'DESIGN.md',
      content: `# ${prod.name} Design System
- Product Type: ${prod.type}
- Primary Accent: ${prod.tokens.palette.primary}
- Secondary Accent: ${prod.tokens.palette.secondary}
- Background: ${prod.tokens.palette.background}
- Typography: ${prod.tokens.typography.fontFamily}
- Number of Routes: ${prod.pages.length}
`,
      mimeType: 'text/markdown',
    });

    return {
      filename: `${prod.slug}-site-bundle.json`,
      product: prod,
      files,
    };
  }

  // --- MCP Server Protocol Management ---

  public getMcpServers(): McpServerDefinition[] {
    return this.mcpServers;
  }

  public addMcpServer(server: Omit<McpServerDefinition, 'id'>): McpServerDefinition {
    const newServer: McpServerDefinition = {
      ...server,
      id: `mcp-${Date.now().toString(36)}`,
    };
    this.mcpServers = [...this.mcpServers, newServer];
    return newServer;
  }

  public updateMcpServer(id: string, updates: Partial<McpServerDefinition>): void {
    this.mcpServers = this.mcpServers.map((s) => (s.id === id ? { ...s, ...updates } : s));
  }

  public async synthesizeDesignFromPrompt(params: {
    name: string;
    prompt: string;
    template?: 'landing' | 'dashboard' | 'submersion_3d' | 'slides' | 'mobile' | 'blank';
    style?: 'tiffany' | 'dark' | 'academic' | 'vibrant';
    dimensions?: PetriWorkdeskDimensions;
  }): Promise<PetriWorkdesk> {
    const pLower = params.prompt.toLowerCase();
    const isEcom = pLower.includes('shop') || pLower.includes('store') || pLower.includes('cart') || pLower.includes('product');
    const isDashboard = params.template === 'dashboard' || pLower.includes('dashboard') || pLower.includes('analytics');

    const created = this.createProduct({
      name: params.name || 'AI Synthesized Product',
      description: `Generated from prompt: "${params.prompt.substring(0, 100)}..."`,
      type: isEcom ? 'ecommerce' : isDashboard ? 'dashboard' : 'saas',
    });

    return created;
  }

  public importWorkdeskFromFile(content: string, filename: string): PetriWorkdesk {
    if (filename.endsWith('.json')) {
      try {
        const parsed = JSON.parse(content);
        if (parsed.name && (parsed.pages || parsed.artifacts)) {
          const product = this.createProduct({
            name: parsed.name,
            description: parsed.description || `Imported from ${filename}`,
            type: parsed.type || 'saas',
          });
          if (parsed.pages && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
            product.pages = parsed.pages;
            product.activePageId = parsed.pages[0].id;
          }
          syncProductArtifacts(product);
          this.saveProducts();
          return product;
        }
      } catch (err) {
        console.warn('Failed to parse product JSON, falling back to HTML import:', err);
      }
    }

    // HTML fallback
    const rawName = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    const projectName = titleMatch ? titleMatch[1].trim() : rawName || 'Imported Design';

    const product = this.createProduct({
      name: projectName,
      description: `Imported HTML template: ${filename}`,
      type: 'landing',
    });
    this.updatePageCode(product.id, product.pages[0].id, content);
    return product;
  }
}

export const openDesignService = new OpenDesignService();
