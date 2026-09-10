import {
  SaifAuditPillar,
  GovernancePolicy,
  GovernanceAuditRecord,
} from '../types';

export const INITIAL_SAIF_PILLARS: SaifAuditPillar[] = [
  {
    key: 'foundations',
    name: '1. Security Foundations & Isolation',
    scorePercent: 100,
    checksCount: 3,
    passedCount: 3,
    checks: [
      {
        id: 'sec-1',
        pillar: 'foundations',
        title: 'Contained Worker Sessions',
        description: 'Enforces execution within isolated Docker DevContainers or non-root sandboxes with bounded timeouts.',
        status: 'passed',
        evidence: 'Docker DevContainer container boundary active (/workspace). 10-minute timeout ceiling enforced.',
        lastAuditedAt: Date.now() - 3600000,
      },
      {
        id: 'sec-2',
        pillar: 'foundations',
        title: 'Fail-Closed Invariant Admission',
        description: 'Admission rejects known incompatible provider/model pairs and unverified external worker profiles.',
        status: 'passed',
        evidence: 'WorkerRegistry rejects unverified bindings. openengine.worker.builtin/v1 reserved for native workers.',
        lastAuditedAt: Date.now() - 3600000,
      },
      {
        id: 'sec-3',
        pillar: 'foundations',
        title: 'Concurrent Deadlock Prevention',
        description: 'Provider stdin and stdout streams are concurrent and bounded, preventing I/O deadlocks.',
        status: 'passed',
        evidence: '64 MiB buffer guard active. Incomplete stdin fails closed deterministically.',
        lastAuditedAt: Date.now() - 3600000,
      },
    ],
  },
  {
    key: 'data_governance',
    name: '2. Data & Memory Vault Governance',
    scorePercent: 100,
    checksCount: 2,
    passedCount: 2,
    checks: [
      {
        id: 'data-1',
        pillar: 'data_governance',
        title: 'Secret Sanitization in Ledgers',
        description: 'Ensures secret-bearing target inputs never enter run ledgers, target configurations, or observation logs.',
        status: 'passed',
        evidence: '0 secret leaks detected across 1,420 durable events. Redaction pipeline active.',
        lastAuditedAt: Date.now() - 3600000,
      },
      {
        id: 'data-2',
        pillar: 'data_governance',
        title: 'DWD OAuth Scope Boundaries',
        description: 'Google Workspace Domain-Wide Delegation tokens bound to minimum required use-case scopes.',
        status: 'passed',
        evidence: 'DWD client validated. Key ID suffix verified with expiration in 42 days.',
        lastAuditedAt: Date.now() - 3600000,
      },
    ],
  },
  {
    key: 'model_security',
    name: '3. Model & Provider Tier Guardrails',
    scorePercent: 96,
    checksCount: 3,
    passedCount: 3,
    checks: [
      {
        id: 'model-1',
        pillar: 'model_security',
        title: 'Caller-Authored Provider Selection',
        description: 'Runtime requires explicit harness, provider, and model identifiers. No model catalog inference.',
        status: 'passed',
        evidence: 'Harness validation active: Claude Sonnet 4.6, Gemini 3.8 Flash, o3-mini.',
        lastAuditedAt: Date.now() - 3600000,
      },
      {
        id: 'model-2',
        pillar: 'model_security',
        title: 'Temperature & Determinism Ceilings',
        description: 'Code synthesis and invariant checking locked to temperature <= 0.3.',
        status: 'passed',
        evidence: 'Deterministic generation verified for code nodes.',
        lastAuditedAt: Date.now() - 3600000,
      },
      {
        id: 'model-3',
        pillar: 'model_security',
        title: 'Token Budget Guards',
        description: 'Prevents infinite looping prompts with a 64,000 token turn ceiling.',
        status: 'passed',
        evidence: 'Turn limits active. Total session tokens capped at 500,000.',
        lastAuditedAt: Date.now() - 3600000,
      },
    ],
  },
  {
    key: 'fail_closed',
    name: '4. Fail-Closed Recovery & Correction',
    scorePercent: 100,
    checksCount: 2,
    passedCount: 2,
    checks: [
      {
        id: 'fail-1',
        pillar: 'fail_closed',
        title: 'Restricted Recovery Turns',
        description: 'Structured-output recovery turns disable reused sessions, MCP, approval bypass, and write tools.',
        status: 'passed',
        evidence: 'Recovery turn policy enforced: max 2 correction turns before declaring malformed.',
        lastAuditedAt: Date.now() - 3600000,
      },
      {
        id: 'fail-2',
        pillar: 'fail_closed',
        title: 'Bounded Provider Continuation',
        description: 'Claude continues once after api_retry; Codex continues once after execution error. No compounding retries.',
        status: 'passed',
        evidence: 'Continuation ceiling = 1 turn. Observed 0 runaway retry loops.',
        lastAuditedAt: Date.now() - 3600000,
      },
    ],
  },
  {
    key: 'adversarial_defense',
    name: '5. Adversarial Input & Injection Defense',
    scorePercent: 98,
    checksCount: 2,
    passedCount: 2,
    checks: [
      {
        id: 'adv-1',
        pillar: 'adversarial_defense',
        title: 'Boundary Tag Isolation',
        description: 'User requests wrapped in explicit <USER_REQUEST> tags. System instructions protected from prompt injection.',
        status: 'passed',
        evidence: 'XML boundary tags parsed correctly. 0 jailbreak attempts succeeded.',
        lastAuditedAt: Date.now() - 3600000,
      },
      {
        id: 'adv-2',
        pillar: 'adversarial_defense',
        title: 'Validator Git Isolation',
        description: 'Validators inspect files and observable outputs; git commands banned in validator prompts.',
        status: 'passed',
        evidence: 'Static analysis confirms 0 git invocations in validator definitions.',
        lastAuditedAt: Date.now() - 3600000,
      },
    ],
  },
  {
    key: 'audit_ledger',
    name: '6. Durable Audit Ledger & CAS Receipts',
    scorePercent: 100,
    checksCount: 2,
    passedCount: 2,
    checks: [
      {
        id: 'audit-1',
        pillar: 'audit_ledger',
        title: 'Positive JS-Safe Epoch Timestamps',
        description: 'Timestamps captured at producer boundary as positive JavaScript-safe Unix milliseconds.',
        status: 'passed',
        evidence: 'Validated 100% of event receipts use Number.isSafeInteger() epoch ms.',
        lastAuditedAt: Date.now() - 3600000,
      },
      {
        id: 'audit-2',
        pillar: 'audit_ledger',
        title: 'CAS Compare-and-Swap Merge Authority',
        description: 'Branch freshness advances only via authorized compare-and-swap responses against origin/main.',
        status: 'passed',
        evidence: 'Delivery workers verify exact pushed ref and wait for aggregate required CI checks.',
        lastAuditedAt: Date.now() - 3600000,
      },
    ],
  },
];

export const INITIAL_GOVERNANCE_POLICIES: GovernancePolicy[] = [
  {
    id: 'pol-1',
    category: 'review_gate',
    name: 'Mandatory Dual-Verifier Gate on Rust/Tauri Changes',
    description: 'Any AST mutation affecting crates/ or src-tauri/ requires Acceptance Verifier + Code Reviewer signoff.',
    isEnabled: true,
    severity: 'strict',
    targetScope: 'openengine-mesh/src-tauri/**, crates/**',
  },
  {
    id: 'pol-2',
    category: 'cas_delivery',
    name: 'Compare-and-Swap Squash Merge Enforced',
    description: 'Requires exact commit ref match and clean merge queue validation before updating main.',
    isEnabled: true,
    severity: 'strict',
    targetScope: 'git://main',
  },
  {
    id: 'pol-3',
    category: 'secret_sanitization',
    name: 'Pre-Commit Secret Regex Inspection',
    description: 'Blocks commits containing potential API keys, RSA private keys, or cloud access tokens.',
    isEnabled: true,
    severity: 'strict',
    targetScope: 'all files',
  },
  {
    id: 'pol-4',
    category: 'model_access',
    name: 'Provider Fallback Ceiling',
    description: 'At most 1 automatic retry on HTTP 429/500 before entering operator gate pause.',
    isEnabled: true,
    severity: 'strict',
    targetScope: 'anthropic, agy, openai',
  },
  {
    id: 'pol-5',
    category: 'token_ceiling',
    name: 'Autonomous Loop Hard Ceiling',
    description: 'Maximum 10 self-healing repair turns per software change goal before requiring human signoff.',
    isEnabled: true,
    severity: 'strict',
    targetScope: 'Petri Repair Engine',
  },
];

export const INITIAL_AUDIT_RECORDS: GovernanceAuditRecord[] = [
  {
    id: 'aud-101',
    timestamp: Date.now() - 120000,
    category: 'MODEL_DISPATCH',
    actor: '@orchestrator',
    action: 'DISPATCH_INSPECTION',
    details: 'Invoked Gemini 3.8 Flash High for goal specification analysis.',
    status: 'verified',
    receiptHash: '0x8f2b...c31e',
  },
  {
    id: 'aud-102',
    timestamp: Date.now() - 95000,
    category: 'CONTAINER_EXEC',
    actor: '@debugger-agent',
    action: 'DEVCONTAINER_RUN',
    details: 'Executed isolated test repro script in Python 3.11 DevContainer (/workspace). Exit code: 0.',
    status: 'verified',
    receiptHash: '0x4d1a...7e92',
  },
  {
    id: 'aud-103',
    timestamp: Date.now() - 60000,
    category: 'INVARIANT_CHECK',
    actor: '@verifier-matrix',
    action: 'EVALUATOR_RUBRIC_PASS',
    details: 'Verified 4/4 assertions: exit code 0, 64 MiB buffer ceiling, 0 unhandled exceptions. Score: 99/100.',
    status: 'verified',
    receiptHash: '0x2a9e...bb41',
  },
  {
    id: 'aud-104',
    timestamp: Date.now() - 30000,
    category: 'SECRET_SCAN',
    actor: '@security-daemon',
    action: 'LEAK_INSPECTION_CLEAN',
    details: 'Scanned 6 staged files for OAuth secrets, API keys, and private credentials. 0 leaks detected.',
    status: 'verified',
    receiptHash: '0x5c7f...11a0',
  },
];

class GovernanceStore {
  private pillars: SaifAuditPillar[] = INITIAL_SAIF_PILLARS;
  private policies: GovernancePolicy[] = INITIAL_GOVERNANCE_POLICIES;
  private auditRecords: GovernanceAuditRecord[] = INITIAL_AUDIT_RECORDS;
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  getPillars(): SaifAuditPillar[] {
    return this.pillars;
  }

  getPolicies(): GovernancePolicy[] {
    return this.policies;
  }

  getAuditRecords(): GovernanceAuditRecord[] {
    return this.auditRecords;
  }

  togglePolicy(policyId: string) {
    this.policies = this.policies.map((p) =>
      p.id === policyId ? { ...p, isEnabled: !p.isEnabled } : p
    );
    this.notify();
  }

  async runSaifAudit(): Promise<{ overallScore: number; passedChecks: number; totalChecks: number }> {
    // Simulate active scan
    await new Promise((r) => setTimeout(r, 600));

    this.auditRecords = [
      {
        id: `aud-${Date.now()}`,
        timestamp: Date.now(),
        category: 'SAIF_FULL_SCAN',
        actor: '@security-auditor',
        action: 'RUN_COMPLIANCE_SUITE',
        details: 'Evaluated all 6 SAIF pillars across 14 security vectors. Zero critical vulnerabilities found.',
        status: 'verified',
        receiptHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      },
      ...this.auditRecords,
    ];

    let totalChecks = 0;
    let passedChecks = 0;

    this.pillars.forEach((p) => {
      totalChecks += p.checksCount;
      passedChecks += p.passedCount;
    });

    const overallScore = Math.round((passedChecks / totalChecks) * 100);
    this.notify();

    return { overallScore, passedChecks, totalChecks };
  }
}

export const governanceService = new GovernanceStore();
