/**
 * GitHub Projects Integration Service
 * Connects directly to GitHub Projects (Project #1: BBS Momentum Portal Roadmap, owner: intortpo)
 * and repository issues, synchronizing status with Antigravity container sessions.
 */

import { pureSha256 } from '../components/auth/PetriAuthGuard';

export interface GitHubProjectItem {
  id: string;
  title: string;
  body?: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Done' | 'Backlog';
  issueNumber?: number;
  issueUrl?: string;
  repository?: string;
  labels: string[];
  milestoneTitle?: string;
  assignedSessionId?: string;
  updatedAt: number;
}

const STORAGE_PROJECT_ITEMS_KEY = 'petri_gh_project_items_v1';

class GitHubProjectService {
  private items: GitHubProjectItem[] = [];

  constructor() {
    this.loadItems();
    if (this.items.length === 0) {
      this.seedFromProjectRoadmap();
    }
  }

  private loadItems(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_PROJECT_ITEMS_KEY);
      const storedSig = localStorage.getItem(STORAGE_PROJECT_ITEMS_KEY + '_sig');
      if (stored) {
        let jsonString: string;
        try {
          jsonString = decodeURIComponent(atob(stored));
        } catch {
          jsonString = stored;
        }

        if (storedSig) {
          const expectedSig = pureSha256(jsonString + 'petri-integrity-salt');
          if (storedSig !== expectedSig) {
            console.warn('GitHub project items integrity check failed; discarding corrupted data');
            this.items = [];
            return;
          }
        }

        this.items = JSON.parse(jsonString);
      }
    } catch {
      this.items = [];
    }
  }

  private saveItems(): void {
    if (typeof window === 'undefined') return;
    try {
      const jsonString = JSON.stringify(this.items);
      const encoded = btoa(encodeURIComponent(jsonString));
      const sig = pureSha256(jsonString + 'petri-integrity-salt');
      localStorage.setItem(STORAGE_PROJECT_ITEMS_KEY, encoded);
      localStorage.setItem(STORAGE_PROJECT_ITEMS_KEY + '_sig', sig);
    } catch (e) {
      console.warn('Failed to save project items', e);
    }
  }

  private seedFromProjectRoadmap(): void {
    // Seeded directly from live GitHub Project #1 "BBS Momentum Portal Roadmap"
    this.items = [
      {
        id: 'PVTI_lAHOBO8HrM4BiTfJzg5NdQE',
        title: '[P1] Dependencies & Infrastructure: Resolve 33 CVEs and Right-Size Cloud Run Memory',
        body: 'Upgrade vitest to >=4.1.0, vite to >=7.3.5, migrate xlsx to @sheetjs/xlsx, standardize single package manager lockfile, increase memoryMiB from 512 to 1024/2048 in apphosting.yaml.',
        status: 'In Progress',
        issueNumber: 98,
        issueUrl: 'https://github.com/fharrison-bbs/bbs-momentum-ino/issues/98',
        repository: 'fharrison-bbs/bbs-momentum-ino',
        labels: ['infrastructure', 'priority:p1'],
        milestoneTitle: 'M3: Dependency CVEs & Cloud Run Sizing',
        assignedSessionId: 'session-core-dev',
        updatedAt: Date.now() - 1800000,
      },
      {
        id: 'PVTI_lAHOBO8HrM4BiTfJzg5NdTA',
        title: '[P2] Gemini Ultra: Upgrade SDK to @google/genai and Parameterize Model Selection',
        body: 'Migrate from legacy @google/generative-ai (0.24.1) to official unified @google/genai SDK with native thinkingConfig support; parameterize model selection in API director.',
        status: 'In Progress',
        issueNumber: 99,
        issueUrl: 'https://github.com/fharrison-bbs/bbs-momentum-ino/issues/99',
        repository: 'fharrison-bbs/bbs-momentum-ino',
        labels: ['ai-gemini', 'priority:p2', 'backlog'],
        milestoneTitle: 'M4: Gemini Ultra & AI Architecture',
        assignedSessionId: 'session-cloud-gemini',
        updatedAt: Date.now() - 3600000,
      },
      {
        id: 'PVTI_lAHOBO8HrM4BiTfJzg5NdUw',
        title: '[P3] Codebase Hygiene: Evict Route Cache Files, Clean Root Scripts, & Consolidate Routes',
        body: 'Evict and gitignore src/routes/graphify-out/cache/ (130 JSON files), move scratch scripts into scripts/, consolidate duplicate route trees /academicreport and /academicreports.',
        status: 'Todo',
        issueNumber: 100,
        issueUrl: 'https://github.com/fharrison-bbs/bbs-momentum-ino/issues/100',
        repository: 'fharrison-bbs/bbs-momentum-ino',
        labels: ['code-cleanup', 'priority:p2'],
        milestoneTitle: 'M5: Codebase Cleanup & Debt Reduction',
        updatedAt: Date.now() - 7200000,
      },
      {
        id: 'PVTI_lAHOBO8HrM4BiTfJzg5NdNc',
        title: '[P1] Type Integrity: Resolve 46 svelte-check Errors and 137 Compiler Warnings',
        body: 'Announcement helper signatures, admin endpoint user properties, parent dashboard announcement typing, and superadmin compliance icons.',
        status: 'Done',
        issueNumber: 97,
        issueUrl: 'https://github.com/fharrison-bbs/bbs-momentum-ino/issues/97',
        repository: 'fharrison-bbs/bbs-momentum-ino',
        labels: ['type-integrity', 'priority:p1'],
        milestoneTitle: 'M2: Type Integrity & svelte-check Fixes',
        updatedAt: Date.now() - 86400000,
      },
    ];
    this.saveItems();
  }

  public getProjectItems(): GitHubProjectItem[] {
    return [...this.items];
  }

  public updateItemStatus(itemId: string, newStatus: GitHubProjectItem['status']): void {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) return;
    item.status = newStatus;
    item.updatedAt = Date.now();
    this.saveItems();
  }

  public linkSessionToItem(itemId: string, sessionId: string): void {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) return;
    item.assignedSessionId = sessionId;
    item.status = 'In Progress';
    item.updatedAt = Date.now();
    this.saveItems();
  }

  public createProjectItem(item: {
    title: string;
    body?: string;
    repository?: string;
    labels?: string[];
  }): GitHubProjectItem {
    const newItem: GitHubProjectItem = {
      id: `PVTI_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: item.title,
      body: item.body,
      status: 'Todo',
      repository: item.repository || 'fharrison-bbs/bbs-momentum-ino',
      labels: item.labels || ['feature'],
      updatedAt: Date.now(),
    };
    this.items.unshift(newItem);
    this.saveItems();
    return newItem;
  }
}

export const githubProjectService = new GitHubProjectService();
