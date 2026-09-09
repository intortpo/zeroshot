import React, { useState, useMemo } from 'react';
import {
  Flame,
  GitPullRequest,
  Cloud,
  Cpu,
  Search,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Play,
} from 'lucide-react';
import { PetriSkill, SkillCategory } from '../types';

interface SkillsCatalogProps {
  onDispatchSkill: (prompt: string, category: SkillCategory) => void;
}

export const INITIAL_SKILLS: PetriSkill[] = [
  // Firebase Skills
  {
    id: 'fb-deploy',
    category: 'firebase',
    name: 'firebase-deploy',
    title: 'Firebase Atomic Deploy',
    description: 'Zero-downtime deployment for Firebase Hosting, Cloud Functions gen-2, and Firestore indexes with automated rollback on healthcheck failure.',
    version: 'v2.4.0',
    tags: ['hosting', 'functions', 'firestore', 'ci-cd'],
    isActive: true,
    samplePrompts: [
      'Deploy current web build to Firebase Hosting preview channel with ephemeral URL',
      'Deploy gen-2 Cloud Functions with 512MB RAM ceiling and max 10 instances',
      'Validate and deploy Firestore composite index definitions',
    ],
  },
  {
    id: 'fb-security-rules',
    category: 'firebase',
    name: 'firebase-security-rules',
    title: 'Firestore Security Rules Validator',
    description: 'Formal verification and unit-test simulation of Firestore and Realtime Database security rules to prevent unauthorized data exposure.',
    version: 'v1.8.2',
    tags: ['firestore', 'security', 'rules', 'audit'],
    isActive: true,
    samplePrompts: [
      'Audit Firestore security rules for missing auth.uid ownership checks',
      'Generate unit tests for tenant isolation in multi-tenant Firestore collections',
      'Simulate unauthenticated read requests against users and orders collections',
    ],
  },
  {
    id: 'fb-auth-admin',
    category: 'firebase',
    name: 'firebase-auth-admin',
    title: 'Firebase Identity & DWD Admin',
    description: 'Multi-tenant authentication provisioning, custom claims minting, and Google Workspace Domain-Wide Delegation OAuth tokens.',
    version: 'v2.1.0',
    tags: ['auth', 'dwd', 'oauth', 'jwt', 'security'],
    isActive: true,
    samplePrompts: [
      'Provision custom admin claims for delegated domain service account',
      'Verify JWT session token expiration and token revocation list',
      'Sync user identity lifecycle between Google Workspace Directory and Firebase Auth',
    ],
  },
  {
    id: 'fb-firestore-models',
    category: 'firebase',
    name: 'firebase-firestore-models',
    title: 'Firestore Schema & Batch Migration',
    description: 'Strict TypeScript schema validation, atomic batch writes, and chunked cursor-based database migrations without lock contention.',
    version: 'v1.5.0',
    tags: ['firestore', 'schema', 'migration', 'performance'],
    isActive: true,
    samplePrompts: [
      'Execute chunked migration adding workspaceId to all legacy task documents',
      'Validate document schema conformance using zod definitions against live collection',
      'Optimize query patterns to leverage composite index for compound filters',
    ],
  },
  {
    id: 'fb-functions-gen2',
    category: 'firebase',
    name: 'firebase-functions-gen2',
    title: 'Cloud Functions Gen-2 Optimizer',
    description: 'Eventarc-triggered Cloud Functions with concurrency controls, minimum instances to eliminate cold starts, and bounded memory ceilings.',
    version: 'v2.0.1',
    tags: ['cloud-functions', 'eventarc', 'cold-start', 'latency'],
    isActive: true,
    samplePrompts: [
      'Set concurrency to 80 and minInstances to 1 on webhook ingestion function',
      'Wire Cloud Storage bucket upload event to trigger image thumbnail generation',
      'Trace cold-start latency bottlenecks in Gen-2 Node.js runtime',
    ],
  },
  {
    id: 'fb-app-distribution',
    category: 'firebase',
    name: 'firebase-app-distribution',
    title: 'App Distribution & Release Rings',
    description: 'Automated packaging and distribution of Android Tauri APK and iOS test builds to internal QA rings with release notes.',
    version: 'v1.3.0',
    tags: ['android', 'apk', 'mobile', 'qa'],
    isActive: true,
    samplePrompts: [
      'Upload latest release APK to internal alpha tester group with git changelog',
      'Track crash reports and adoption rate for Tauri v2 mobile build',
      'Notify Telegram tester group when new APK build is published',
    ],
  },

  // GitHub Skills
  {
    id: 'gh-pr-orchestrator',
    category: 'github',
    name: 'github-pr-orchestrator',
    title: 'GitHub PR Semantic Orchestrator',
    description: 'Autonomous Git branch isolation, atomic Conventional Commit batches, push refs, and pull request generation with rich markdown descriptions.',
    version: 'v3.1.0',
    tags: ['git', 'pull-request', 'conventional-commits', 'automation'],
    isActive: true,
    samplePrompts: [
      'Prepare semantic branch and open PR targeting main with passing test logs',
      'Squash-rebase branch onto latest main and force-push with lease',
      'Synthesize comprehensive PR description with before/after architectural diff',
    ],
  },
  {
    id: 'gh-gate-reviewer',
    category: 'github',
    name: 'github-gate-reviewer',
    title: 'GitHub Gate Reviewer & Invariants',
    description: 'Static AST invariant evaluation, Clippy compliance checks, four-parameter ceiling audits, and gate review summaries.',
    version: 'v2.5.0',
    tags: ['review', 'invariants', 'clippy', 'gate'],
    isActive: true,
    samplePrompts: [
      'Review pending PR for conformance to 4-parameter Clippy rule',
      'Verify that target image and native protocol types match authoritative schemas',
      'Check that structured output recovery turn disables reused provider sessions',
    ],
  },
  {
    id: 'gh-issue-triage',
    category: 'github',
    name: 'github-issue-triage',
    title: 'GitHub Issue Triage & Deduplication',
    description: 'Semantic vector clustering of incoming bug reports, automatic label application, milestone alignment, and reproduction verification.',
    version: 'v1.7.0',
    tags: ['issues', 'triage', 'vector-dedup', 'labels'],
    isActive: true,
    samplePrompts: [
      'Scan open issues for duplicate reports on mobile peer discovery',
      'Auto-label issues based on affected crate (openengine-mesh, protocol, cli)',
      'Draft reproduction verification script for reported stdin deadlock',
    ],
  },
  {
    id: 'gh-release-manager',
    category: 'github',
    name: 'github-release-manager',
    title: 'GitHub Release & Immutable Tags',
    description: 'Immutable vX.Y.Z release tag creation, automated SHA256 checksum generation, release asset upload, and distribution manifest updates.',
    version: 'v2.2.0',
    tags: ['releases', 'tags', 'checksums', 'immutable'],
    isActive: true,
    samplePrompts: [
      'Draft v8.4.0 release notes from merged commits descended from last tag',
      'Calculate SHA-256 digests for Linux, macOS, and Windows binary tarballs',
      'Verify that distribution/zeroshot-targets.json matches authoritative targets',
    ],
  },
  {
    id: 'gh-conflict-resolver',
    category: 'github',
    name: 'github-conflict-resolver',
    title: 'GitHub 3-Way Conflict Auto-Resolver',
    description: 'Semantic merge conflict resolution utilizing AST syntax trees and domain modeling rather than crude text markers.',
    version: 'v2.0.0',
    tags: ['merge-conflict', 'ast-merge', 'rebase'],
    isActive: true,
    samplePrompts: [
      'Resolve merge conflict in openengine-mesh/src/App.tsx preserving both changes',
      'Rebase feature branch onto main and resolve Cargo.lock dependency drift',
      'Verify zero compilation errors after complex 3-way structural merge',
    ],
  },
  {
    id: 'gh-copilot-reviewer',
    category: 'github',
    name: 'github-copilot-reviewer',
    title: 'Copilot Code Review Sync',
    description: 'Two-way synchronization with Copilot code review comments, automated fix proposals, and comment thread resolutions.',
    version: 'v1.4.0',
    tags: ['copilot', 'code-review', 'suggestions'],
    isActive: true,
    samplePrompts: [
      'Fetch all unresolved review comments from PR #42 and generate patch',
      'Submit Copilot review review suggestions as batch suggested changes',
      'Validate that review fixes preserve all existing unit tests',
    ],
  },

  // Google Cloud Skills
  {
    id: 'gc-run-deploy',
    category: 'gcloud',
    name: 'gcloud-run-deploy',
    title: 'Cloud Run Ephemeral Sandbox',
    description: 'Deploy serverless container sandboxes with ephemeral CPU boost, VPC connector access, and concurrency ceilings for fast agent workloads.',
    version: 'v2.8.0',
    tags: ['cloud-run', 'containers', 'vpc', 'serverless'],
    isActive: true,
    samplePrompts: [
      'Deploy zero-petri target runner image to Cloud Run with 2 CPUs and 4GB RAM',
      'Configure Cloud Run service scaling to zero on idle with 15min request deadline',
      'Enable direct VPC egress to route peer traffic over WireGuard network',
    ],
  },
  {
    id: 'gc-storage-mesh',
    category: 'gcloud',
    name: 'gcloud-storage-mesh',
    title: 'GCS Storage Mesh & Security Assessment',
    description: 'Audit Google Cloud Storage buckets for public access prevention, uniform bucket-level access, CMEK encryption, and signed URL minting.',
    version: 'v2.1.0',
    tags: ['gcs', 'security', 'cmek', 'signed-urls'],
    isActive: true,
    samplePrompts: [
      'Run security assessment across all GCS buckets in project',
      'Enforce Uniform Bucket-Level Access and Public Access Prevention',
      'Generate 15-minute signed upload URL for container artifact tarballs',
    ],
  },
  {
    id: 'gc-iam-service-accounts',
    category: 'gcloud',
    name: 'gcloud-iam-service-accounts',
    title: 'GCloud IAM & Workload Identity',
    description: 'Principle-of-least-privilege IAM roles, service account key rotation, and Google Workspace Domain-Wide Delegation credential verification.',
    version: 'v1.9.0',
    tags: ['iam', 'service-accounts', 'dwd', 'security'],
    isActive: true,
    samplePrompts: [
      'Audit service account keys older than 90 days and initiate rotation',
      'Verify Domain-Wide Delegation permissions for petri-runner@project.iam.gserviceaccount.com',
      'Grant minimal roles/run.invoker to specific API gateway service identity',
    ],
  },
  {
    id: 'gc-bigquery-pipelines',
    category: 'gcloud',
    name: 'gcloud-bigquery-pipelines',
    title: 'BigQuery Telemetry & Analytics',
    description: 'Streaming run telemetry ingestion into BigQuery partition tables, property graph GQL queries, and cost-optimized caching queries.',
    version: 'v3.0.0',
    tags: ['bigquery', 'sql', 'telemetry', 'graph'],
    isActive: true,
    samplePrompts: [
      'Create partitioned BigQuery table for high-throughput agent run ledgers',
      'Execute GQL property graph query mapping peer node consensus latency',
      'Optimize query slots and apply BI Engine caching to real-time dashboard queries',
    ],
  },
  {
    id: 'gc-secret-manager',
    category: 'gcloud',
    name: 'gcloud-secret-manager',
    title: 'Secret Manager Zero-Leak Hydration',
    description: 'Safe in-memory secret fetching without writing keys to disk or process environments, with automatic payload destruction upon close.',
    version: 'v1.6.0',
    tags: ['secrets', 'security', 'in-memory', 'redaction'],
    isActive: true,
    samplePrompts: [
      'Fetch service account JSON from Secret Manager into memory-pinned buffer',
      'Rotate GitHub personal access token secret and verify latest version access',
      'Audit log access to sensitive credentials across all mesh workers',
    ],
  },
  {
    id: 'gc-monitoring-telemetry',
    category: 'gcloud',
    name: 'gcloud-monitoring-telemetry',
    title: 'Cloud Monitoring & Distributed Tracing',
    description: 'OpenTelemetry span export, Cloud Trace correlation IDs, and log-based alerting for autonomous agent repair loops.',
    version: 'v1.5.0',
    tags: ['tracing', 'opentelemetry', 'logging', 'alerts'],
    isActive: true,
    samplePrompts: [
      'Set up Cloud Monitoring alert for container exit code 137 (OOM)',
      'Trace latency waterfall across P2P WireGuard handoff to RTX server',
      'Create custom dashboard for GPU memory usage and active worker turns',
    ],
  },

  // Antigravity (AGY) Skills
  {
    id: 'agy-brain-state',
    category: 'agy',
    name: 'agy-brain-state',
    title: 'AGY Brain State & Vector Memory',
    description: 'Persistent memory querying, hierarchical transcript inspection, semantic clustering, and context condensation across sessions.',
    version: 'v3.2.0',
    tags: ['memory', 'brain', 'embeddings', 'transcripts'],
    isActive: true,
    samplePrompts: [
      'Search agent memory for previous bug fixes involving bounded stdin streaming',
      'Condense recent 40-step conversation transcript into compact architectural insights',
      'Index current workspace ADRs into local vector knowledge store',
    ],
  },
  {
    id: 'agy-custom-mcps',
    category: 'agy',
    name: 'agy-custom-mcps',
    title: 'AGY Custom MCP Protocol Bridge',
    description: 'Lazy-load and orchestrate external Model Context Protocol (MCP) servers with automatic schema discovery and error isolation.',
    version: 'v2.1.0',
    tags: ['mcp', 'tools', 'schema', 'protocol'],
    isActive: true,
    samplePrompts: [
      'Inspect registered MCP tools on firebase-mcp-server and github-mcp-server',
      'Add custom local MCP server bridging local hardware sensors via Unix socket',
      'Diagnose timeout on lazy-loaded knowledge-catalog tool call',
    ],
  },
  {
    id: 'agy-sidecar-mesh',
    category: 'agy',
    name: 'agy-sidecar-mesh',
    title: 'AGY Sidecar Mesh & Consensus',
    description: 'Coordinate multiple autonomous agent sidecars across RTX server, Linux desktop, and Android mobile with consensus arbitration.',
    version: 'v2.4.0',
    tags: ['sidecar', 'mesh', 'p2p', 'consensus'],
    isActive: true,
    samplePrompts: [
      'Arbitrate consensus between speculative coder and invariant verifier',
      'Hand off mobile voice-dictated intent to RTX server for immediate compilation',
      'Elect primary target executor based on available VRAM and thermal headroom',
    ],
  },
  {
    id: 'agy-deep-reasoning',
    category: 'agy',
    name: 'agy-deep-reasoning',
    title: 'AGY Deep Reasoning & CoT Recursion',
    description: 'Multi-turn Chain of Thought (CoT) recursion tuning, recursive branching trees, bounded self-correction budgets, and testkit replays.',
    version: 'v2.9.0',
    tags: ['reasoning', 'cot', 'recursion', 'self-correction'],
    isActive: true,
    samplePrompts: [
      'Configure 3-turn recursive self-correction budget for failing compiler test',
      'Generate step-by-step chain of thought tree for complex lock-free data structure',
      'Inject defensive pause check if AST change causes contradictory invariants',
    ],
  },
  {
    id: 'agy-rule-synthesizer',
    category: 'agy',
    name: 'agy-rule-synthesizer',
    title: 'AGY Rule & Lesson Synthesizer',
    description: 'Automatic distillation of user corrections, code review comments, and debugging retrospectives into permanent workspace rules.',
    version: 'v1.7.0',
    tags: ['rules', 'learning', 'conventions', 'adr'],
    isActive: true,
    samplePrompts: [
      'Synthesize lessons learned from container SIGPIPE bug into AGENTS.md rule',
      'Record new Architectural Decision Record (ADR) for frameless dark silk UI',
      'Audit codebase conformance against CONTEXT.md ubiquitous vocabulary',
    ],
  },
  {
    id: 'agy-slash-automations',
    category: 'agy',
    name: 'agy-slash-automations',
    title: 'AGY Slash Workflow Automations',
    description: 'Execute and orchestrate built-in and custom slash commands: /grill-me, /plan, /goal, /boost, /teach, and /learn.',
    version: 'v2.3.0',
    tags: ['slash-commands', 'workflows', 'grill-me', 'goal'],
    isActive: true,
    samplePrompts: [
      'Run /grill-me interview to stress-test WireGuard peer roaming design',
      'Execute overnight /goal run with test-first invariant verification',
      'Trigger /boost mode with multi-perspective analysis on cluster protocol',
    ],
  },
];

export const SkillsCatalog: React.FC<SkillsCatalogProps> = ({ onDispatchSkill }) => {
  const [skills, setSkills] = useState<PetriSkill[]>(INITIAL_SKILLS);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<PetriSkill | null>(null);

  const toggleSkillActive = (skillId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSkills((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesCategory =
        selectedCategory === 'all' || skill.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        skill.title.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.tags.some((t) => t.toLowerCase().includes(q)) ||
        skill.name.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [skills, selectedCategory, searchQuery]);

  const CATEGORY_TABS: {
    category: SkillCategory | 'all';
    label: string;
    icon: React.ReactNode;
    count: number;
  }[] = [
    {
      category: 'all',
      label: 'All Skills',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      count: skills.length,
    },
    {
      category: 'firebase',
      label: 'Firebase',
      icon: <Flame className="w-3.5 h-3.5 text-amber-400" />,
      count: skills.filter((s) => s.category === 'firebase').length,
    },
    {
      category: 'github',
      label: 'GitHub',
      icon: <GitPullRequest className="w-3.5 h-3.5 text-purple-400" />,
      count: skills.filter((s) => s.category === 'github').length,
    },
    {
      category: 'gcloud',
      label: 'Google Cloud',
      icon: <Cloud className="w-3.5 h-3.5 text-sky-400" />,
      count: skills.filter((s) => s.category === 'gcloud').length,
    },
    {
      category: 'agy',
      label: 'Antigravity (AGY)',
      icon: <Cpu className="w-3.5 h-3.5 text-stone-700" />,
      count: skills.filter((s) => s.category === 'agy').length,
    },
  ];

  return (
    <div className="flex-1 w-full overflow-y-auto p-6 sm:p-10 select-none space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-xl font-semibold font-sans text-stone-900 flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0ABAB5]" />
            <span>Skills Registry</span>
            <span className="text-xs font-sans font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
              {skills.length}
            </span>
          </h1>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills, tags, workflows..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2 text-xs font-sans text-stone-900 placeholder-[#555555] focus:outline-none focus:border-stone-900 transition-all"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.category}
            onClick={() => setSelectedCategory(tab.category)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-sans transition-all ${
              selectedCategory === tab.category
                ? 'bg-stone-900 text-white font-medium'
                : 'bg-white/70 text-stone-600 hover:text-stone-900 border border-stone-200/80 hover:bg-white font-normal'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span className="text-xs text-stone-400 font-sans">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSkills.map((skill) => {
          return (
            <div
              key={skill.id}
              onClick={() => setSelectedSkill(skill)}
              className="bg-white/70 border border-stone-200/80 hover:border-stone-400 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all duration-200 backdrop-blur-2xl group cursor-pointer"
            >
              <div className="space-y-2.5">
                {/* Header: Category Badge, Version, and Active Switch */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-xs font-sans font-medium uppercase bg-stone-100 text-stone-700 border border-stone-200">
                      {skill.category}
                    </span>
                    <span className="text-xs font-sans text-stone-400 font-normal">
                      {skill.version}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => toggleSkillActive(skill.id, e)}
                    className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-xs font-sans transition-colors ${
                      skill.isActive
                        ? 'bg-stone-100 border border-stone-200 text-stone-700 font-medium'
                        : 'bg-stone-100 border border-stone-200 text-stone-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        skill.isActive ? 'bg-emerald-500' : 'bg-stone-400'
                      }`}
                    />
                    <span>{skill.isActive ? 'ACTIVE' : 'IDLE'}</span>
                  </button>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 group-hover:text-stone-950 transition-colors leading-snug">
                    {skill.title}
                  </h3>
                  <div className="text-xs font-sans text-stone-400 mt-0.5">
                    {skill.name}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {skill.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-white/80 border border-stone-200 text-xs font-sans text-stone-500 font-normal"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample Prompts & Launch Footer */}
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <div className="text-xs font-sans text-stone-400">
                  Quick Action:
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDispatchSkill(skill.samplePrompts[0], skill.category);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-sans transition-all flex items-center justify-between group/btn font-normal"
                >
                  <span className="truncate text-left mr-2">
                    {skill.samplePrompts[0]}
                  </span>
                  <Play className="w-3 h-3 text-stone-500 flex-shrink-0 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Skill Inspection Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/20 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 border border-stone-200/80 rounded-3xl w-full max-w-2xl overflow-hidden text-stone-800 font-sans">
            {/* Modal Header */}
            <div className="border-b border-stone-200 p-6 flex items-center justify-between bg-stone-50">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-sans font-medium uppercase bg-stone-100 border border-stone-200 text-stone-600">
                    {selectedSkill.category}
                  </span>
                  <span className="text-xs font-sans text-stone-400">
                    {selectedSkill.version}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-stone-900 mt-1.5">
                  {selectedSkill.title}
                </h2>
                <div className="text-xs font-sans text-stone-400">
                  {selectedSkill.name}
                </div>
              </div>

              <button
                onClick={() => setSelectedSkill(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-white/5 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xs font-sans font-medium text-stone-400 uppercase mb-1.5">
                  Specification & Architecture
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {selectedSkill.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-sans font-medium text-stone-400 uppercase mb-2">
                  Tags & Capabilities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSkill.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-xs font-sans text-stone-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-sans font-medium text-stone-400 uppercase mb-2.5">
                  Executable Workflow Prompts (Click to Dispatch to Board)
                </h4>
                <div className="space-y-2">
                  {selectedSkill.samplePrompts.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => {
                        onDispatchSkill(prompt, selectedSkill.category);
                        setSelectedSkill(null);
                      }}
                      className="w-full text-left p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-stone-400 text-xs font-sans text-stone-800 hover:text-stone-950 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-stone-400 font-semibold">0{pIdx + 1}</span>
                        <span>{prompt}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-sans text-stone-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified autonomous capability</span>
              </div>

              <button
                onClick={() => setSelectedSkill(null)}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black border border-stone-900 text-xs font-sans font-medium text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
