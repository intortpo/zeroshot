import { SystemTier, TierPermissions, UserProfile, PetriViewMode } from '../types';
import { governanceService } from './governanceService';

export interface TierMetadata {
  tier: SystemTier;
  label: string;
  tagline: string;
  description: string;
  badgeStyle: {
    bg: string;
    text: string;
    border: string;
    glow: string;
  };
}

export const TIER_DEFINITIONS: Record<SystemTier, TierMetadata> = {
  superadmin: {
    tier: 'superadmin',
    label: 'SuperAdmin',
    tagline: 'Platform, Security & Governance Authority',
    description:
      'Full administrative root access across SAIF governance policies, user RBAC promotion, AI provider keys, killswitches, and production deployment sign-off.',
    badgeStyle: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      glow: 'shadow-[0_0_12px_rgba(168,85,247,0.25)]',
    },
  },
  control: {
    tier: 'control',
    label: 'Control',
    tagline: 'Engineering, Operations & DAG Orchestration',
    description:
      'Engineering control plane for Node Studio pipeline design, Docker DevContainers, live agent cognition steering, git branching, and verification gate approvals.',
    badgeStyle: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    },
  },
  consumer: {
    tier: 'consumer',
    label: 'Consumer',
    tagline: 'Product Consumer & Stakeholder Portal',
    description:
      'Client and product stakeholder experience focused on live application preview, consumer assistant desk, visual feedback, and delivery roadmap with zero exposure to developer plumbing.',
    badgeStyle: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      glow: 'shadow-[0_0_12px_rgba(14,165,233,0.25)]',
    },
  },
};

export const DEFAULT_TIER_PERMISSIONS: Record<SystemTier, TierPermissions> = {
  superadmin: {
    canManageGovernance: true,
    canManageUsers: true,
    canManageProviders: true,
    canAccessTui: true,
    canApproveGates: true,
    canDeploy: true,
    canEditWorkflows: true,
    canRunDevContainers: true,
    canSteerCognition: true,
    canViewAuditLedger: true,
    canSubmitFeedback: true,
    canInteractAssistant: true,
    canViewPreview: true,
    canManageServer: true,
  },
  control: {
    canManageGovernance: false, // Read-only governance compliance view
    canManageUsers: false,
    canManageProviders: false,
    canAccessTui: true,
    canApproveGates: true, // Up to Stage 5 verification
    canDeploy: true,
    canEditWorkflows: true,
    canRunDevContainers: true,
    canSteerCognition: true,
    canViewAuditLedger: true,
    canSubmitFeedback: true,
    canInteractAssistant: true,
    canViewPreview: true,
    canManageServer: true,
  },
  consumer: {
    canManageGovernance: false,
    canManageUsers: false,
    canManageProviders: false,
    canAccessTui: false,
    canApproveGates: false,
    canDeploy: false,
    canEditWorkflows: false,
    canRunDevContainers: false,
    canSteerCognition: false,
    canViewAuditLedger: false,
    canSubmitFeedback: true,
    canInteractAssistant: true,
    canViewPreview: true,
    canManageServer: false,
  },
};

export const STANDARD_TIER_PERSONAS: UserProfile[] = [
  {
    id: 'usr-hideo',
    name: 'Hideo (intortpo)',
    email: '82773932+intortpo@users.noreply.github.com',
    role: 'owner',
    tier: 'superadmin',
    organization: 'Petri Zero Platform',
    canApproveGates: true,
    canDeploy: true,
    canEditRules: true,
  },
];

export const TIER_ALLOWED_VIEWS: Record<SystemTier, PetriViewMode[]> = {
  superadmin: [
    'chat',
    'plan',
    'board',
    'node',
    'skills',
    'memory',
    'stats',
    'zero',
    'tui',
    'settings',
    'governance',
    'consumer',
    'server',
  ],
  control: [
    'chat',
    'plan',
    'board',
    'node',
    'skills',
    'memory',
    'stats',
    'zero',
    'tui',
    'governance', // Read-only view
    'server',
  ],
  consumer: [
    'consumer', // Dedicated Consumer Portal
  ],
};

class TierServiceStore {
  private activeTier: SystemTier = 'superadmin';
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  getActiveTier(): SystemTier {
    return this.activeTier;
  }

  setActiveTier(tier: SystemTier) {
    if (this.activeTier !== tier) {
      this.activeTier = tier;
      this.notify();
    }
  }

  getPermissions(user?: UserProfile): TierPermissions {
    const tier = user?.tier || this.activeTier;
    const defaults = DEFAULT_TIER_PERMISSIONS[tier];
    if (user?.permissions) {
      return { ...defaults, ...user.permissions };
    }
    return defaults;
  }

  hasPermission(user: UserProfile | undefined, permission: keyof TierPermissions): boolean {
    const perms = this.getPermissions(user);
    return Boolean(perms[permission]);
  }

  isViewAllowed(tier: SystemTier, view: PetriViewMode): boolean {
    const allowed = TIER_ALLOWED_VIEWS[tier];
    return allowed.includes(view);
  }

  getAllowedViews(tier: SystemTier): PetriViewMode[] {
    return TIER_ALLOWED_VIEWS[tier];
  }

  getTierMetadata(tier: SystemTier): TierMetadata {
    return TIER_DEFINITIONS[tier];
  }

  recordBoundaryViolation(user: UserProfile, attemptedAction: string) {
    const timestamp = Date.now();
    const hash = `0x${Math.random().toString(16).slice(2, 10)}`;
    const record = {
      id: `viol-${timestamp}`,
      timestamp,
      category: 'TIER_BOUNDARY_GUARD',
      actor: user.name,
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      details: `User '${user.name}' (${user.tier.toUpperCase()}) attempted unauthorized action: '${attemptedAction}'. Blocked fail-closed by Tier Boundary Guard.`,
      status: 'rejected' as const,
      receiptHash: hash,
    };
    // Inject directly into governance service audit stream
    try {
      const records = governanceService.getAuditRecords();
      (governanceService as unknown as { auditRecords: unknown[] }).auditRecords = [record, ...records];
    } catch {
      // safe fallback
    }
  }
}

export const tierService = new TierServiceStore();
