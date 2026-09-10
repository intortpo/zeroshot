/**
 * Zen Notes & Pattern Matching Service for Petri Zero
 * Stores conversational thoughts, auto-categorizes them, matches against existing notes,
 * and enables 1-click dispatch to autonomous coding agents.
 */

export interface ZenNote {
  id: string;
  workspaceId: string; // 'global' or workspace identifier (e.g. 'ws-petri')
  scope: 'global' | 'workspace';
  title: string;
  content: string;
  category: 'idea' | 'architecture' | 'todo' | 'ux' | 'security' | 'pattern' | 'snippet';
  tags: string[];
  matchedPatternIds: string[];
  status: 'captured' | 'pushed_to_agent' | 'archived';
  createdAt: number;
  updatedAt: number;
  pushedItemId?: string;
}

const STORAGE_KEY = 'petri_zen_notes_v1';

const INITIAL_ZEN_NOTES: ZenNote[] = [
  {
    id: 'zn-global-01',
    workspaceId: 'global',
    scope: 'global',
    title: 'Universal Fail-Closed Security Boundaries',
    content: 'All agent runtime recovery turns must disable tool write access, MCP approval bypass, and external unauthenticated sessions. Always favor deterministic abort over speculative recovery.',
    category: 'security',
    tags: ['security', 'fail-closed', 'invariants', 'runtime'],
    matchedPatternIds: [],
    status: 'captured',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'zn-global-02',
    workspaceId: 'global',
    scope: 'global',
    title: 'Mobile First-Class Touch Ergonomics & Safe Insets',
    content: 'Navigation touch targets must satisfy minimum 44x44px. Apply env(safe-area-inset-bottom) for bottom sheets, drawers, and thumb navigators. Single-column segment views over multi-column kanban.',
    category: 'ux',
    tags: ['ux', 'mobile', 'haptics', 'ergonomics'],
    matchedPatternIds: [],
    status: 'captured',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'zn-ws-01',
    workspaceId: 'ws-petri',
    scope: 'workspace',
    title: 'Tailscale Exit Node Route Advertising',
    content: 'Expose local Petri Zero server as an authorized exit node via tailscale set --advertise-exit-node. Enable travel laptops and phones to securely route ingress through cluster WireGuard IP.',
    category: 'architecture',
    tags: ['architecture', 'networking', 'tailscale', 'wireguard'],
    matchedPatternIds: [],
    status: 'captured',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'zn-ws-02',
    workspaceId: 'ws-petri',
    scope: 'workspace',
    title: 'SmartShield Anti-Bot Mitigation Pipeline',
    content: 'Investigate rate-limiting curves and challenge-response filters on consumer portal endpoints. Ensure superadmin traffic bypasses challenge while unauthenticated requests hit captcha.',
    category: 'security',
    tags: ['security', 'smartshield', 'anti-bot', 'rate-limit'],
    matchedPatternIds: [],
    status: 'captured',
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 43200000,
  },
];

class ZenNotesService {
  private notes: ZenNote[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    if (typeof window === 'undefined') {
      this.notes = INITIAL_ZEN_NOTES;
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.notes = JSON.parse(raw);
      } else {
        this.notes = INITIAL_ZEN_NOTES;
        this.save();
      }
    } catch {
      this.notes = INITIAL_ZEN_NOTES;
    }
  }

  private save(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notes));
    } catch (e) {
      console.error('Failed to save Zen notes to localStorage', e);
    }
  }

  public getAllNotes(): ZenNote[] {
    return [...this.notes].sort((a, b) => b.createdAt - a.createdAt);
  }

  public getNotes(scope: 'global' | 'workspace' | 'all' = 'all', workspaceId = 'ws-petri'): ZenNote[] {
    const all = this.getAllNotes();
    if (scope === 'global') {
      return all.filter((n) => n.scope === 'global' || n.workspaceId === 'global');
    }
    if (scope === 'workspace') {
      return all.filter((n) => n.scope === 'workspace' && n.workspaceId === workspaceId);
    }
    return all;
  }

  public autoCategorize(text: string): { category: ZenNote['category']; tags: string[] } {
    const lower = text.toLowerCase();
    const tags: Set<string> = new Set();
    let category: ZenNote['category'] = 'idea';

    // Heuristics for category and tag extraction
    if (lower.includes('security') || lower.includes('auth') || lower.includes('shield') || lower.includes('safe') || lower.includes('leak') || lower.includes('audit')) {
      category = 'security';
      tags.add('security');
    } else if (lower.includes('architect') || lower.includes('pipeline') || lower.includes('queue') || lower.includes('ledger') || lower.includes('protocol') || lower.includes('tailscale') || lower.includes('docker')) {
      category = 'architecture';
      tags.add('architecture');
    } else if (lower.includes('todo') || lower.includes('fixme') || lower.includes('must') || lower.includes('need to') || lower.includes('task')) {
      category = 'todo';
      tags.add('todo');
    } else if (lower.includes('ui') || lower.includes('ux') || lower.includes('mobile') || lower.includes('button') || lower.includes('screen') || lower.includes('touch') || lower.includes('layout')) {
      category = 'ux';
      tags.add('ux');
    } else if (lower.includes('pattern') || lower.includes('heuristic') || lower.includes('invariant') || lower.includes('convention')) {
      category = 'pattern';
      tags.add('pattern');
    } else if (lower.includes('def ') || lower.includes('fn ') || lower.includes('curl ') || lower.includes('const ') || lower.includes('function')) {
      category = 'snippet';
      tags.add('snippet');
    }

    // Specific tag detection
    if (lower.includes('tailscale') || lower.includes('wireguard')) tags.add('tailscale');
    if (lower.includes('docker') || lower.includes('container')) tags.add('container');
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('haptic')) tags.add('mobile');
    if (lower.includes('gemini') || lower.includes('ai') || lower.includes('llm')) tags.add('gemini');
    if (lower.includes('memory') || lower.includes('note')) tags.add('memory');
    if (lower.includes('sqlite') || lower.includes('database')) tags.add('db');
    if (lower.includes('smartshield')) tags.add('smartshield');

    if (tags.size === 0) {
      tags.add(category);
    }

    return { category, tags: Array.from(tags) };
  }

  public findMatchingPatterns(
    text: string,
    currentId?: string,
    providedNotes?: ZenNote[]
  ): { note: ZenNote; matchedTags: string[]; score: number }[] {
    const list = providedNotes || this.notes;
    const { tags: currentTags } = this.autoCategorize(text);
    const lower = text.toLowerCase();

    const matches: { note: ZenNote; matchedTags: string[]; score: number }[] = [];

    for (const note of list) {
      if (currentId && note.id === currentId) continue;

      let score = 0;
      const matchedTags: string[] = [];

      // Check tag overlap
      for (const t of currentTags) {
        if (note.tags.includes(t)) {
          score += 3;
          matchedTags.push(t);
        }
      }

      // Check category match
      if (text.toLowerCase().includes(note.category)) {
        score += 2;
      }

      // Check title word match
      const titleWords = note.title.toLowerCase().split(/\s+/);
      for (const tw of titleWords) {
        if (tw.length > 3 && lower.includes(tw)) {
          score += 2;
          if (!matchedTags.includes(tw)) matchedTags.push(tw);
        }
      }

      if (score >= 2) {
        matches.push({ note, matchedTags, score });
      }
    }

    return matches.sort((a, b) => b.score - a.score).slice(0, 3);
  }

  public saveNote(params: {
    title?: string;
    content: string;
    scope?: 'global' | 'workspace';
    workspaceId?: string;
    category?: ZenNote['category'];
    tags?: string[];
  }): ZenNote {
    const content = params.content.trim();
    const inferred = this.autoCategorize(content);

    const title =
      params.title?.trim() ||
      content.split('\n')[0].replace(/^#+\s*/, '').slice(0, 48) ||
      'Untitled Thought';

    const category = params.category || inferred.category;
    const tags = Array.from(new Set([...(params.tags || []), ...inferred.tags]));
    const scope = params.scope || 'workspace';
    const workspaceId = scope === 'global' ? 'global' : params.workspaceId || 'ws-petri';

    // Check matches
    const matched = this.findMatchingPatterns(content);

    const newNote: ZenNote = {
      id: `zn-${Date.now().toString().slice(-6)}`,
      workspaceId,
      scope,
      title,
      content,
      category,
      tags,
      matchedPatternIds: matched.map((m) => m.note.id),
      status: 'captured',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.notes.unshift(newNote);
    this.save();
    return newNote;
  }

  public updateNote(id: string, updates: Partial<ZenNote>): ZenNote | null {
    const idx = this.notes.findIndex((n) => n.id === id);
    if (idx === -1) return null;

    const existing = this.notes[idx];
    const updated: ZenNote = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    this.notes[idx] = updated;
    this.save();
    return updated;
  }

  public deleteNote(id: string): void {
    this.notes = this.notes.filter((n) => n.id !== id);
    this.save();
  }

  public markPushedToAgent(noteId: string, pushedItemId?: string): ZenNote | null {
    return this.updateNote(noteId, {
      status: 'pushed_to_agent',
      pushedItemId,
    });
  }
}

export const zenNotesService = new ZenNotesService();
