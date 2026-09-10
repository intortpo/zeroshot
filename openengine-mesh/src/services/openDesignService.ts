/**
 * Open Design Integration Service (nexu-io/open-design)
 * Local-first AI design workspace and runtime bridge for Zero Petri.
 * Turns local coding agents (AGY CLI, Gemini, Claude) into a comprehensive design engine.
 * Supports prototypes, landing pages, dashboards, slides, and multi-format exports (HTML, PDF, PPTX, MP4).
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

export type PetriWorkdesk = OpenDesignProject;

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

const DEFAULT_DESIGN_TOKENS: DesignTokenSystem = {
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

export const INITIAL_OPEN_DESIGN_PROJECTS: OpenDesignProject[] = [
  {
    id: 'proj-saas-landing',
    name: 'Momentum LMS Next-Gen Portal',
    description: 'High-converting responsive landing page for Bangkok Bilingual School learning platform',
    category: 'landing_page',
    tokens: DEFAULT_DESIGN_TOKENS,
    activeArtifactId: 'art-landing-html',
    exportFormats: ['html', 'pdf', 'mp4'],
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 3600000,
    artifacts: [
      {
        id: 'art-landing-html',
        name: 'index.html',
        type: 'html',
        updatedAt: Date.now() - 3600000,
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BBS Momentum LMS</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; background: #FAFBFB; color: #1C1917; }
    .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(229, 231, 235, 0.8); }
  </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-center p-6">
  <main class="max-w-4xl w-full text-center space-y-8">
    <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
      <span class="w-2 h-2 rounded-full bg-[#0ABAB5] animate-pulse"></span>
      <span>Autonomous Education Data Mining Engine v8</span>
    </div>
    <h1 class="text-5xl font-extrabold tracking-tight text-stone-900 leading-tight">
      Empowering Every Student with <br/><span class="text-teal-600">Cognitive Quantum Diagnostics</span>
    </h1>
    <p class="text-stone-600 text-lg max-w-2xl mx-auto font-normal">
      High-velocity weekly attendance normalization, DINA CDM mastery modeling, and predictive risk indicators designed with local-first privacy.
    </p>
    <div class="flex items-center justify-center space-x-4 pt-4">
      <button class="px-6 py-3 rounded-2xl bg-stone-900 text-white font-semibold text-sm shadow-lg hover:bg-stone-800 transition-all">
        Launch Student Desk
      </button>
      <button class="px-6 py-3 rounded-2xl glass-card text-stone-700 font-semibold text-sm hover:bg-white transition-all">
        View Academic Blueprint
      </button>
    </div>
    <!-- Interactive Metric Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-10 text-left">
      <div class="p-5 rounded-2xl glass-card space-y-2">
        <div class="text-xs font-mono uppercase text-stone-400">Mastery Vector</div>
        <div class="text-2xl font-bold text-stone-900">94.2%</div>
        <div class="text-xs text-emerald-600 font-medium">↑ +4.8% from AY2026 Sem 1</div>
      </div>
      <div class="p-5 rounded-2xl glass-card space-y-2">
        <div class="text-xs font-mono uppercase text-stone-400">Active Cohorts</div>
        <div class="text-2xl font-bold text-stone-900">849 Students</div>
        <div class="text-xs text-stone-500 font-normal">Grade 1 - 9 Cross-Section</div>
      </div>
      <div class="p-5 rounded-2xl glass-card space-y-2">
        <div class="text-xs font-mono uppercase text-stone-400">Intervention Speed</div>
        <div class="text-2xl font-bold text-stone-900">&lt; 120 ms</div>
        <div class="text-xs text-teal-600 font-medium">Rust Tactical Vector Pipeline</div>
      </div>
    </div>
  </main>
</body>
</html>`,
      },
      {
        id: 'art-landing-css',
        name: 'DESIGN.md',
        type: 'json',
        updatedAt: Date.now() - 7200000,
        code: `# BBS Momentum Design System
- Primary Accent: #0ABAB5 (Tiffany Teal)
- Typography: Inter, sans-serif
- Surface: Glassmorphic Frost 85%
- Corner Radii: 16px - 24px Card Smooth Curves
- Tone: Quiet, Academic Enterprise Luxury`,
      },
    ],
  },
  {
    id: 'proj-analytics-dash',
    name: 'Quantum EDM Student Diagnostics Dashboard',
    description: 'Interactive DINA cognitive diagnosis and QSVC classifier visualizer',
    category: 'dashboard',
    tokens: DEFAULT_DESIGN_TOKENS,
    activeArtifactId: 'art-dash-html',
    exportFormats: ['html', 'pdf', 'pptx'],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 1800000,
    artifacts: [
      {
        id: 'art-dash-html',
        name: 'dashboard.html',
        type: 'html',
        updatedAt: Date.now() - 1800000,
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>EDM Diagnostics</title>
</head>
<body class="bg-stone-50 text-stone-900 p-8 font-sans">
  <div class="max-w-5xl mx-auto space-y-6">
    <header class="flex items-center justify-between border-b border-stone-200 pb-4">
      <div>
        <h2 class="text-2xl font-bold text-stone-900">Student Cognitive Profile</h2>
        <p class="text-xs text-stone-500">Student ID #402 · Linguistics Core A</p>
      </div>
      <span class="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-mono font-semibold">
        Amber Warning: Midterm Divergence
      </span>
    </header>
    <div class="grid grid-cols-2 gap-4">
      <div class="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <h4 class="text-sm font-bold uppercase text-stone-400">Latent Skill Probabilities</h4>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between"><span>Vocabulary Acquisition</span><span class="font-bold">0.92</span></div>
          <div class="w-full bg-stone-100 h-2 rounded-full overflow-hidden"><div class="bg-teal-500 h-full w-[92%]"></div></div>
          <div class="flex justify-between"><span>Grammar Cloze</span><span class="font-bold">0.31</span></div>
          <div class="w-full bg-stone-100 h-2 rounded-full overflow-hidden"><div class="bg-amber-500 h-full w-[31%]"></div></div>
          <div class="flex justify-between"><span>Reading Synthesis</span><span class="font-bold">0.18</span></div>
          <div class="w-full bg-stone-100 h-2 rounded-full overflow-hidden"><div class="bg-rose-500 h-full w-[18%]"></div></div>
        </div>
      </div>
      <div class="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <h4 class="text-sm font-bold uppercase text-stone-400">Intervention Prescription</h4>
        <p class="text-xs text-stone-600 leading-relaxed">
          Student shows strong vocabulary foundation but struggles with cloze synthesis and paragraph transitions. Recommend 2 weekly focused reading scaffolding sessions before AY2026 Sem 2.
        </p>
        <button class="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700">
          Dispatch Action Plan to Counselor
        </button>
      </div>
    </div>
  </div>
</body>
</html>`,
      },
    ],
  },
];

export const REGISTERED_MCP_SERVERS: McpServerDefinition[] = [
  {
    id: 'open-design',
    name: 'Open Design MCP Server',
    version: '0.9.4',
    status: 'active',
    protocolVersion: '2024-11-05',
    transport: 'in_process',
    description: 'Local-first AI design engine for prototypes, landing pages, slide decks, and multi-format exports.',
    tools: [
      {
        name: 'od_list_projects',
        description: 'Lists all prototypes, landing pages, and slide decks managed by Open Design.',
        parameters: {
          type: 'object',
          properties: {
            filter: { type: 'string', description: 'Category filter: landing_page, dashboard, slides, or all' },
          },
        },
      },
      {
        name: 'od_create_project',
        description: 'Creates a new design project with customized design tokens and layout scaffold.',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Project title' },
            category: { type: 'string', description: 'landing_page | dashboard | prototype | slides' },
            description: { type: 'string', description: 'Design objective and user intent' },
          },
          required: ['name', 'category'],
        },
      },
      {
        name: 'od_get_artifact',
        description: 'Retrieves code artifact, HTML template, or design token specifications for a project.',
        parameters: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'Target project ID' },
            artifactId: { type: 'string', description: 'Artifact ID to load' },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'od_generate_prototype',
        description: 'Dispatches AGY CLI agent turn to synthesize or iteratively refine HTML/TSX code according to DESIGN.md tokens.',
        parameters: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'Target project ID' },
            prompt: { type: 'string', description: 'Natural language design instructions' },
            viewport: { type: 'string', description: 'Target viewport: desktop | tablet | mobile' },
          },
          required: ['projectId', 'prompt'],
        },
      },
      {
        name: 'od_export_asset',
        description: 'Exports the active project into standalone HTML, PDF, PPTX slide deck, or MP4 video.',
        parameters: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'Target project ID' },
            format: { type: 'string', description: 'html | pdf | pptx | mp4' },
          },
          required: ['projectId', 'format'],
        },
      },
    ],
  },
  {
    id: 'github-mcp-server',
    name: 'GitHub Enterprise MCP',
    version: '1.2.0',
    status: 'active',
    protocolVersion: '2024-11-05',
    transport: 'stdio',
    description: 'GitHub pull requests, issues, commit reviews, and release automation.',
    tools: [
      {
        name: 'create_pull_request',
        description: 'Create a new pull request targeting main with Conventional Commit header.',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            body: { type: 'string' },
            head: { type: 'string' },
            base: { type: 'string' },
          },
          required: ['title', 'head'],
        },
      },
      {
        name: 'issue_write',
        description: 'Write or comment on issues in the active zero-petri repository.',
        parameters: {
          type: 'object',
          properties: {
            issue_number: { type: 'number' },
            comment: { type: 'string' },
          },
          required: ['comment'],
        },
      },
    ],
  },
  {
    id: 'firebase-mcp-server',
    name: 'Firebase & Cloud Storage MCP',
    version: '1.0.4',
    status: 'active',
    protocolVersion: '2024-11-05',
    transport: 'stdio',
    description: 'Firebase real-time synchronization, student record document storage, and security rules.',
    tools: [
      {
        name: 'firebase_get_project',
        description: 'Retrieve Firebase project environment and credentials.',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'firebase_read_resources',
        description: 'Read document collections and student attendance raw logs.',
        parameters: {
          type: 'object',
          properties: {
            collection: { type: 'string' },
          },
          required: ['collection'],
        },
      },
    ],
  },
  {
    id: 'knowledge-catalog',
    name: 'Knowledge Catalog MCP',
    version: '1.1.0',
    status: 'active',
    protocolVersion: '2024-11-05',
    transport: 'stdio',
    description: 'Enterprise data asset catalog, schema discovery, and graph relationships.',
    tools: [
      {
        name: 'search_entries',
        description: 'Search catalog entries for datasets, tables, and views.',
        parameters: {
          type: 'object',
          properties: { query: { type: 'string' } },
          required: ['query'],
        },
      },
      {
        name: 'lookup_context',
        description: 'Retrieve rich LLM-ready schema and quality context for data assets.',
        parameters: {
          type: 'object',
          properties: { resources: { type: 'array', items: { type: 'string' } } },
          required: ['resources'],
        },
      },
    ],
  },
];

class OpenDesignService {
  private projects: OpenDesignProject[] = [];
  private mcpServers: McpServerDefinition[] = [...REGISTERED_MCP_SERVERS];

  constructor() {
    this.loadProjects();
  }

  private loadProjects() {
    try {
      const stored = localStorage.getItem('petri_design_workdesks_v1');
      if (stored) {
        this.projects = JSON.parse(stored);
      } else {
        this.projects = [...INITIAL_OPEN_DESIGN_PROJECTS];
      }
    } catch {
      this.projects = [...INITIAL_OPEN_DESIGN_PROJECTS];
    }
  }

  private saveProjects() {
    try {
      localStorage.setItem('petri_design_workdesks_v1', JSON.stringify(this.projects));
    } catch (e) {
      console.warn('Failed to save Petri Design workdesks to localStorage', e);
    }
  }

  public getProjects(): OpenDesignProject[] {
    return this.projects;
  }

  public getWorkdesks(): PetriWorkdesk[] {
    return this.projects;
  }

  public getProject(id: string): OpenDesignProject | undefined {
    return this.projects.find((p) => p.id === id);
  }

  public getWorkdesk(id: string): PetriWorkdesk | undefined {
    return this.getProject(id);
  }

  public createWorkdesk(params: {
    name: string;
    category?: OpenDesignProject['category'];
    description?: string;
    template?: 'landing' | 'dashboard' | 'slides' | 'mobile' | 'blank';
    dimensions?: PetriWorkdeskDimensions;
  }): PetriWorkdesk {
    const category = params.category || (params.template === 'mobile' ? 'mobile_app' : params.template === 'slides' ? 'slides' : params.template === 'dashboard' ? 'dashboard' : 'landing_page');
    const description = params.description || `Petri Design Workdesk: ${params.name}`;
    const id = `workdesk-${Date.now().toString(36)}`;

    let starterHtml = '';
    let defaultDimensions: PetriWorkdeskDimensions = params.dimensions || {
      width: 1280,
      height: 800,
      label: 'Desktop (1280x800)',
    };

    if (params.template === 'mobile') {
      defaultDimensions = params.dimensions || { width: 375, height: 812, label: 'Mobile (375x812 iPhone / Pixel)' };
      starterHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body { font-family: 'Inter', system-ui, sans-serif; }</style>
</head>
<body class="bg-stone-900 text-stone-100 min-h-screen flex flex-col justify-between p-4">
  <div class="space-y-4 pt-6">
    <div class="flex items-center justify-between">
      <span class="text-xs font-mono text-teal-400 font-semibold tracking-wider">BBS MOMENTUM MOBILE</span>
      <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
    </div>
    <h2 class="text-2xl font-bold tracking-tight">${params.name}</h2>
    <div class="p-4 bg-stone-800/80 rounded-2xl border border-stone-700/60 space-y-2">
      <div class="text-xs text-stone-400">Active Academic Term</div>
      <div class="text-lg font-bold text-white">AY2026 · Sem 1</div>
      <div class="text-xs text-emerald-400 font-medium">94.2% Attendance Velocity</div>
    </div>
  </div>
  <button class="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-sm rounded-2xl transition-all shadow-lg">
    Open Student Portfolio
  </button>
</body>
</html>`;
    } else if (params.template === 'slides') {
      defaultDimensions = params.dimensions || { width: 1920, height: 1080, label: 'Slide Deck (16:9 Widescreen)' };
      starterHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="w-full h-screen bg-[#0F172A] text-white flex flex-col justify-between p-16 font-sans">
  <div class="flex items-center justify-between border-b border-slate-700/60 pb-6">
    <span class="text-sm font-mono tracking-widest text-teal-400 font-bold uppercase">BANGKOK BILINGUAL SCHOOL · CURRICULUM BLUEPRINT</span>
    <span class="text-xs font-mono text-slate-400">SLIDE 01 / 12</span>
  </div>
  <div class="space-y-6 max-w-4xl">
    <h1 class="text-6xl font-black tracking-tight leading-tight">${params.name}</h1>
    <p class="text-xl text-slate-300 leading-relaxed font-light">${description}</p>
  </div>
  <div class="flex items-center justify-between text-xs font-mono text-slate-500">
    <span>Superadmin Authority: j.sadol@bbs.ac.th</span>
    <span>Powered by Petri Design & AGY CLI</span>
  </div>
</body>
</html>`;
    } else if (params.template === 'blank') {
      starterHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-[#FAFBFB] text-stone-900 flex items-center justify-center p-8 font-sans">
  <div class="max-w-md w-full p-8 bg-white border border-stone-200 rounded-3xl shadow-sm text-center space-y-4">
    <h2 class="text-2xl font-bold tracking-tight">${params.name}</h2>
    <p class="text-stone-500 text-xs">${description}</p>
    <div class="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-[11px] text-teal-800 font-mono">
      Ready for AGY CLI autonomous UI synthesis
    </div>
  </div>
</body>
</html>`;
    } else {
      // Default modern landing
      starterHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>${params.name}</title>
</head>
<body class="min-h-screen bg-stone-50 flex items-center justify-center p-6 text-stone-900 font-sans">
  <div class="max-w-2xl w-full bg-white p-10 rounded-3xl border border-stone-200/80 shadow-xs space-y-6 text-center">
    <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold">
      <span class="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
      <span>Petri Design Workdesk</span>
    </div>
    <h1 class="text-4xl font-extrabold tracking-tight">${params.name}</h1>
    <p class="text-stone-600 text-sm leading-relaxed max-w-lg mx-auto">${description}</p>
    <div class="flex items-center justify-center gap-3 pt-2">
      <button class="px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-all">
        Get Started
      </button>
      <button class="px-6 py-2.5 bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-200 transition-all">
        Explore Features
      </button>
    </div>
  </div>
</body>
</html>`;
    }

    const newWorkdesk: PetriWorkdesk = {
      id,
      name: params.name,
      category,
      description,
      dimensions: defaultDimensions,
      tokens: { ...DEFAULT_DESIGN_TOKENS },
      activeArtifactId: 'art-main-html',
      exportFormats: ['html', 'pdf', 'pptx', 'mp4'],
      syncStatus: 'local_only',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      artifacts: [
        {
          id: 'art-main-html',
          name: 'index.html',
          type: 'html',
          updatedAt: Date.now(),
          code: starterHtml,
        },
        {
          id: 'art-main-notes',
          name: 'DESIGN.md',
          type: 'json',
          updatedAt: Date.now(),
          code: `# ${params.name} Design Guide\n- Primary Accent: #0ABAB5\n- Typography: Inter, system-ui\n- Grid System: 12-column responsive layout`,
        },
      ],
    };

    this.projects = [newWorkdesk, ...this.projects];
    this.saveProjects();
    return newWorkdesk;
  }

  public createProject(
    name: string,
    category: OpenDesignProject['category'],
    description: string
  ): OpenDesignProject {
    return this.createWorkdesk({ name, category, description });
  }

  public duplicateWorkdesk(id: string): PetriWorkdesk | undefined {
    const original = this.getProject(id);
    if (!original) return undefined;

    const duplicated: PetriWorkdesk = {
      ...original,
      id: `workdesk-${Date.now().toString(36)}`,
      name: `${original.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncStatus: 'local_only',
      lastSyncedRemote: undefined,
      artifacts: original.artifacts.map((a) => ({
        ...a,
        id: `art-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      })),
    };

    this.projects = [duplicated, ...this.projects];
    this.saveProjects();
    return duplicated;
  }

  public deleteWorkdesk(id: string): void {
    this.projects = this.projects.filter((p) => p.id !== id);
    this.saveProjects();
  }

  public renameWorkdesk(id: string, newName: string): PetriWorkdesk | undefined {
    const proj = this.getProject(id);
    if (!proj) return undefined;
    proj.name = newName;
    proj.updatedAt = Date.now();
    this.saveProjects();
    return proj;
  }

  public markWorkdeskSynced(id: string, remoteName: string): void {
    const proj = this.getProject(id);
    if (!proj) return;
    proj.syncStatus = 'synced';
    proj.lastSyncedRemote = remoteName;
    proj.updatedAt = Date.now();
    this.saveProjects();
  }

  public updateArtifactCode(projectId: string, artifactId: string, newCode: string): void {
    const proj = this.projects.find((p) => p.id === projectId);
    if (!proj) return;
    const art = proj.artifacts.find((a) => a.id === artifactId);
    if (!art) return;
    art.code = newCode;
    art.updatedAt = Date.now();
    proj.updatedAt = Date.now();
    this.saveProjects();
  }

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
}

export const openDesignService = new OpenDesignService();
