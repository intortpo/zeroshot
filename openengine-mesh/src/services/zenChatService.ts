/**
 * Zen Chat & Channels Service
 * Manages dedicated channels (public, team, private), threads, multi-user sharing,
 * real-time messages with AI reasoning traces, and channel participants.
 */

export interface ZenChatParticipant {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: number;
}

export interface ZenFeaturePlan {
  title: string;
  goal: string;
  targetModule: string;
  invariants: string[];
  stages: Array<{ name: string; status: 'completed' | 'in_progress' | 'pending'; detail: string }>;
  canBuild?: boolean;
}

export interface ZenBuildReceipt {
  itemId: string;
  targetModule: string;
  commitHash: string;
  diff: string;
  testLogs: string;
  status: 'synthesizing' | 'testing' | 'committed';
  builtAt: number;
}

export interface ZenChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  senderAvatar?: string;
  isAi?: boolean;
  modelId?: string;
  content: string;
  thought?: string;
  timestamp: number;
  reactions?: Record<string, string[]>; // emoji -> userIds
  attachments?: {
    name: string;
    type: string;
    size?: string;
  }[];
  plan?: ZenFeaturePlan;
  buildReceipt?: ZenBuildReceipt;
}

export interface ZenChannel {
  id: string;
  name: string;
  description: string;
  topic?: string;
  isPrivate: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: number;
  updatedAt: number;
  sharedWithUserIds: string[];
  participants: ZenChatParticipant[];
  unreadCount?: number;
  pinnedMessageId?: string;
  category: 'general' | 'project' | 'architecture' | 'standup' | 'random';
}

const STORAGE_CHANNELS_KEY = 'petri_zen_channels_v3';
const STORAGE_MESSAGES_KEY = 'petri_zen_channel_messages_v3';

const INITIAL_CHANNELS: ZenChannel[] = [
  {
    id: 'ch-general',
    name: 'general',
    description: 'Workspace-wide general announcements, design sync, and open discussion.',
    topic: 'Petri Zero · Real-time agentic collaboration & system invariants',
    isPrivate: false,
    createdBy: 'usr-hideo',
    createdByName: 'Hideo (intortpo)',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 3600000 * 2,
    sharedWithUserIds: ['usr-hideo'],
    participants: [
      { userId: 'usr-hideo', name: 'Hideo (intortpo)', email: '82773932+intortpo@users.noreply.github.com', role: 'owner', joinedAt: Date.now() - 86400000 * 5 },
    ],
    category: 'general',
  },
  {
    id: 'ch-architecture',
    name: 'architecture-rfc',
    description: 'System boundaries, fail-closed protocols, memory ledger, and kernel invariants.',
    topic: 'Rust DINA Psychometrics & Quantum ZZFeatureMap kernel verification',
    isPrivate: false,
    createdBy: 'usr-hideo',
    createdByName: 'Hideo (intortpo)',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 3600000 * 4,
    sharedWithUserIds: ['usr-hideo'],
    participants: [
      { userId: 'usr-hideo', name: 'Hideo (intortpo)', email: '82773932+intortpo@users.noreply.github.com', role: 'owner', joinedAt: Date.now() - 86400000 * 4 },
    ],
    category: 'architecture',
  },
  {
    id: 'ch-thailand-4-0',
    name: 'thailand-4-0-curriculum',
    description: 'Competency diagnosis: Computational Thinking, ESL acquisition ratios, and MANOVA orientation.',
    topic: 'K-12 Longitudinal Telemetry & O-NET Benchmark Mapping',
    isPrivate: false,
    createdBy: 'usr-hideo',
    createdByName: 'Hideo (intortpo)',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 1800000,
    sharedWithUserIds: ['usr-hideo'],
    participants: [
      { userId: 'usr-hideo', name: 'Hideo (intortpo)', email: '82773932+intortpo@users.noreply.github.com', role: 'owner', joinedAt: Date.now() - 86400000 * 2 },
    ],
    category: 'project',
  },
  {
    id: 'ch-security-shield',
    name: 'smartshield-secops',
    description: 'Anti-bot curves, rate-limiting, Zitadel SSO token revocation, and zero-trust perimeter.',
    topic: 'Encrypted FERPA Vault & WireGuard Ingress Guard',
    isPrivate: true,
    createdBy: 'usr-hideo',
    createdByName: 'Hideo (intortpo)',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 3600000 * 8,
    sharedWithUserIds: ['usr-hideo'],
    participants: [
      { userId: 'usr-hideo', name: 'Hideo (intortpo)', email: '82773932+intortpo@users.noreply.github.com', role: 'owner', joinedAt: Date.now() - 86400000 * 3 },
    ],
    category: 'architecture',
  },
];

const INITIAL_MESSAGES: Record<string, ZenChatMessage[]> = {
  'ch-general': [
    {
      id: 'msg-g-1',
      channelId: 'ch-general',
      senderId: 'usr-hideo',
      senderName: 'Hideo (intortpo)',
      senderRole: 'Owner',
      content: 'Clean editorial layout feels great. You can also mention @Gemini or @Mya in any channel to trigger high-effort thought synthesis without leaving focus mode.',
      timestamp: Date.now() - 3600000 * 3,
    },
    {
      id: 'msg-g-2',
      channelId: 'ch-general',
      senderId: 'bot-gemini',
      senderName: 'Gemini Assistant',
      isAi: true,
      modelId: 'gemini-3.8-flash-high',
      content: 'I am ready to reflect on any system questions or channel topics. Every reflection maintains bounded context and can be turned directly into a shareable Zen Note or Kanban goal.',
      thought: 'Context loaded: 4 active channels. Invariants verified.',
      timestamp: Date.now() - 3600000 * 2,
    },
  ],
  'ch-architecture': [
    {
      id: 'msg-arch-1',
      channelId: 'ch-architecture',
      senderId: 'usr-hideo',
      senderName: 'Hideo (intortpo)',
      senderRole: 'Owner',
      content: 'The DINA psychometrics engine has been calibrated with the 6 Thailand 4.0 latent skills in `crates/edm-tactical-engine/`. The discrete parameter estimation runs with zero memory leaks.',
      timestamp: Date.now() - 3600000 * 6,
    },
  ],
  'ch-thailand-4-0': [
    {
      id: 'msg-t4-1',
      channelId: 'ch-thailand-4-0',
      senderId: 'usr-hideo',
      senderName: 'Hideo (intortpo)',
      senderRole: 'Owner',
      content: 'Tracking student activity orientations (GAO vs IAO vs PO) alongside longitudinal O-NET benchmark telemetry.',
      timestamp: Date.now() - 1800000,
    },
  ],
  'ch-security-shield': [
    {
      id: 'msg-sec-1',
      channelId: 'ch-security-shield',
      senderId: 'usr-hideo',
      senderName: 'Hideo (intortpo)',
      senderRole: 'Owner',
      content: 'Zero-trust perimeter active. Private channel access is restricted to verified operator keys.',
      timestamp: Date.now() - 3600000 * 8,
    },
  ],
};

class ZenChatService {
  private channels: ZenChannel[] = [];
  private messages: Record<string, ZenChatMessage[]> = {};

  constructor() {
    this.load();
  }

  private load(): void {
    if (typeof window === 'undefined') {
      this.channels = INITIAL_CHANNELS;
      this.messages = INITIAL_MESSAGES;
      return;
    }

    try {
      const rawCh = localStorage.getItem(STORAGE_CHANNELS_KEY);
      if (rawCh) {
        this.channels = JSON.parse(rawCh);
      } else {
        this.channels = INITIAL_CHANNELS;
        this.saveChannels();
      }

      const rawMsg = localStorage.getItem(STORAGE_MESSAGES_KEY);
      if (rawMsg) {
        this.messages = JSON.parse(rawMsg);
      } else {
        this.messages = INITIAL_MESSAGES;
        this.saveMessages();
      }
    } catch {
      this.channels = INITIAL_CHANNELS;
      this.messages = INITIAL_MESSAGES;
    }
  }

  private saveChannels(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_CHANNELS_KEY, JSON.stringify(this.channels));
    } catch (e) {
      console.error('Failed to save Zen channels to localStorage', e);
    }
  }

  private saveMessages(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(this.messages));
    } catch (e) {
      console.error('Failed to save Zen messages to localStorage', e);
    }
  }

  public getChannels(userId?: string): ZenChannel[] {
    if (!userId) return [...this.channels];
    return this.channels.filter(
      (c) => !c.isPrivate || c.sharedWithUserIds.includes(userId)
    );
  }

  public getChannelById(channelId: string): ZenChannel | undefined {
    return this.channels.find((c) => c.id === channelId);
  }

  public createChannel(params: {
    name: string;
    description: string;
    topic?: string;
    isPrivate?: boolean;
    category?: ZenChannel['category'];
    createdBy: string;
    createdByName: string;
    sharedWithUserIds?: string[];
  }): ZenChannel {
    const slug = params.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');

    const newChannel: ZenChannel = {
      id: `ch-${Date.now().toString().slice(-6)}`,
      name: slug || `channel-${Date.now().toString().slice(-4)}`,
      description: params.description.trim() || 'No description provided.',
      topic: params.topic?.trim() || '',
      isPrivate: !!params.isPrivate,
      category: params.category || 'project',
      createdBy: params.createdBy,
      createdByName: params.createdByName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sharedWithUserIds: Array.from(
        new Set([params.createdBy, ...(params.sharedWithUserIds || [])])
      ),
      participants: [
        {
          userId: params.createdBy,
          name: params.createdByName,
          email: `${params.createdBy}@petri.local`,
          role: 'owner',
          joinedAt: Date.now(),
        },
      ],
    };

    this.channels.unshift(newChannel);
    this.saveChannels();

    // Add initial welcome system message
    this.sendMessage({
      channelId: newChannel.id,
      senderId: 'sys',
      senderName: 'System',
      content: `Channel #${newChannel.name} was created by ${newChannel.createdByName}. It is ${newChannel.isPrivate ? 'private' : 'public'} and ready for collaboration.`,
    });

    return newChannel;
  }

  public shareChannelWithUser(
    channelId: string,
    user: { id: string; name: string; email: string; role?: 'editor' | 'viewer' }
  ): ZenChannel | null {
    const ch = this.channels.find((c) => c.id === channelId);
    if (!ch) return null;

    if (!ch.sharedWithUserIds.includes(user.id)) {
      ch.sharedWithUserIds.push(user.id);
    }

    const existingPart = ch.participants.find((p) => p.userId === user.id);
    if (!existingPart) {
      ch.participants.push({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'editor',
        joinedAt: Date.now(),
      });
    }

    ch.updatedAt = Date.now();
    this.saveChannels();

    // Post notice
    this.sendMessage({
      channelId: ch.id,
      senderId: 'sys',
      senderName: 'System',
      content: `🔗 **${user.name}** was invited to #${ch.name} as a **${user.role || 'editor'}**.`,
    });

    return ch;
  }

  public removeUserFromChannel(channelId: string, userId: string): ZenChannel | null {
    const ch = this.channels.find((c) => c.id === channelId);
    if (!ch) return null;

    ch.sharedWithUserIds = ch.sharedWithUserIds.filter((id) => id !== userId);
    ch.participants = ch.participants.filter((p) => p.userId !== userId);
    ch.updatedAt = Date.now();
    this.saveChannels();
    return ch;
  }

  public getMessages(channelId: string): ZenChatMessage[] {
    return this.messages[channelId] || [];
  }

  public sendMessage(params: {
    channelId: string;
    senderId: string;
    senderName: string;
    senderRole?: string;
    senderAvatar?: string;
    isAi?: boolean;
    modelId?: string;
    content: string;
    thought?: string;
    attachments?: ZenChatMessage['attachments'];
    plan?: ZenFeaturePlan;
    buildReceipt?: ZenBuildReceipt;
  }): ZenChatMessage {
    const newMsg: ZenChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      channelId: params.channelId,
      senderId: params.senderId,
      senderName: params.senderName,
      senderRole: params.senderRole,
      senderAvatar: params.senderAvatar,
      isAi: params.isAi,
      modelId: params.modelId,
      content: params.content,
      thought: params.thought,
      timestamp: Date.now(),
      attachments: params.attachments,
      plan: params.plan,
      buildReceipt: params.buildReceipt,
    };

    if (!this.messages[params.channelId]) {
      this.messages[params.channelId] = [];
    }

    this.messages[params.channelId].push(newMsg);
    this.saveMessages();

    // Update channel timestamp
    const ch = this.channels.find((c) => c.id === params.channelId);
    if (ch) {
      ch.updatedAt = Date.now();
      this.saveChannels();
    }

    return newMsg;
  }

  public addReaction(channelId: string, messageId: string, emoji: string, userId: string): void {
    const msgs = this.messages[channelId];
    if (!msgs) return;
    const msg = msgs.find((m) => m.id === messageId);
    if (!msg) return;

    if (!msg.reactions) msg.reactions = {};
    if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

    const existingIdx = msg.reactions[emoji].indexOf(userId);
    if (existingIdx > -1) {
      msg.reactions[emoji].splice(existingIdx, 1);
      if (msg.reactions[emoji].length === 0) {
        delete msg.reactions[emoji];
      }
    } else {
      msg.reactions[emoji].push(userId);
    }

    this.saveMessages();
  }

  public deleteMessage(channelId: string, messageId: string): void {
    if (!this.messages[channelId]) return;
    this.messages[channelId] = this.messages[channelId].filter((m) => m.id !== messageId);
    this.saveMessages();
  }
}

export const zenChatService = new ZenChatService();
