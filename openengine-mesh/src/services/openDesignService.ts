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

export interface OpenDesignProject {
  id: string;
  name: string;
  description: string;
  category: 'landing_page' | 'dashboard' | 'prototype' | 'slides' | 'component';
  tokens: DesignTokenSystem;
  artifacts: DesignProjectArtifact[];
  activeArtifactId: string;
  exportFormats: Array<'html' | 'pdf' | 'pptx' | 'mp4'>;
  createdAt: number;
  updatedAt: number;
}

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
  private projects: OpenDesignProject[] = [...INITIAL_OPEN_DESIGN_PROJECTS];
  private mcpServers: McpServerDefinition[] = [...REGISTERED_MCP_SERVERS];

  public getProjects(): OpenDesignProject[] {
    return this.projects;
  }

  public getProject(id: string): OpenDesignProject | undefined {
    return this.projects.find((p) => p.id === id);
  }

  public createProject(
    name: string,
    category: OpenDesignProject['category'],
    description: string
  ): OpenDesignProject {
    const newProj: OpenDesignProject = {
      id: `proj-${Date.now().toString(36)}`,
      name,
      category,
      description,
      tokens: { ...DEFAULT_DESIGN_TOKENS },
      activeArtifactId: 'art-index',
      exportFormats: ['html', 'pdf', 'pptx', 'mp4'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      artifacts: [
        {
          id: 'art-index',
          name: 'index.html',
          type: 'html',
          updatedAt: Date.now(),
          code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>${name}</title>
</head>
<body class="min-h-screen bg-stone-50 flex items-center justify-center p-6 text-stone-900 font-sans">
  <div class="max-w-xl text-center space-y-4">
    <h1 class="text-3xl font-bold">${name}</h1>
    <p class="text-stone-600 text-sm">${description}</p>
    <div class="p-4 bg-white rounded-2xl border border-stone-200 text-xs text-stone-500">
      Generated via Open Design & AGY CLI
    </div>
  </div>
</body>
</html>`,
        },
      ],
    };

    this.projects = [newProj, ...this.projects];
    return newProj;
  }

  public updateArtifactCode(projectId: string, artifactId: string, newCode: string): void {
    const proj = this.projects.find((p) => p.id === projectId);
    if (!proj) return;
    const art = proj.artifacts.find((a) => a.id === artifactId);
    if (!art) return;
    art.code = newCode;
    art.updatedAt = Date.now();
    proj.updatedAt = Date.now();
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
