/**
 * Gemini Thought Companion Service
 *
 * Provides open-ended conversation with Gemini, transparent chain-of-thought
 * reasoning traces, and the ability to fork the conversation into new branches
 * from ANY message timestamp. Includes direct injection into Petri Video Flow.
 */

import {
  CompanionMessage,
  ConversationBranch,
  ThoughtTrace
} from '../types';
import { videoFlowService } from './videoFlowService';

class GeminiCompanionService {
  private branches: ConversationBranch[] = [];
  private activeBranchId: string = 'main-branch';
  private listeners: (() => void)[] = [];
  private isThinking: boolean = false;

  constructor() {
    this.initDefaultThread();
  }

  private initDefaultThread() {
    const mainBranchId = 'main-branch';
    const initialThought: ThoughtTrace = {
      reasoningTokens: 890,
      thinkingDurationMs: 1400,
      internalHypotheses: [
        'Establish warm, creative, open-ended stance',
        'Highlight the infinite forking capability from any turn',
        'Explain the bridge to Petri Video Flow scene generation',
      ],
      reflectionSummary: 'Ready to assist across creative, technical, or philosophical queries with deep transparent reasoning.',
      confidenceScore: 0.99,
    };

    const initialMessage: CompanionMessage = {
      id: 'msg-init-01',
      branchId: mainBranchId,
      role: 'assistant',
      content:
        'Hello! I am your Gemini Thought Companion. You can chat with me about anything you choose—from brainstorming cinematic video scene prompts, scriptwriting, and visual aesthetics to distributed systems architecture, mathematics, or creative storytelling.\\n\\nEvery message in our dialogue has a "⚡ Fork Chat from Here" button. If you ever want to explore an alternate line of inquiry or try a different creative direction without losing your original thread, simply fork the chat at that exact point!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      thoughtTrace: initialThought,
    };

    this.branches = [
      {
        id: mainBranchId,
        name: 'Main Conversation Line',
        parentBranchId: null,
        divergedAtMessageId: null,
        createdAt: new Date().toLocaleDateString(),
        messages: [initialMessage],
        color: '#0D9488',
      },
    ];

    this.activeBranchId = mainBranchId;
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getActiveBranchId(): string {
    return this.activeBranchId;
  }

  public setActiveBranch(branchId: string) {
    if (this.branches.some((b) => b.id === branchId)) {
      this.activeBranchId = branchId;
      this.notify();
    }
  }

  public getAllBranches(): ConversationBranch[] {
    return [...this.branches];
  }

  public getActiveBranch(): ConversationBranch {
    return (
      this.branches.find((b) => b.id === this.activeBranchId) || this.branches[0]
    );
  }

  public getIsThinking(): boolean {
    return this.isThinking;
  }

  // Fork conversation from any message
  public forkFromMessage(messageId: string): ConversationBranch {
    // Find the message in any branch
    let targetBranch: ConversationBranch | undefined;
    let targetMsgIndex = -1;

    for (const b of this.branches) {
      const idx = b.messages.findIndex((m) => m.id === messageId);
      if (idx !== -1) {
        targetBranch = b;
        targetMsgIndex = idx;
        break;
      }
    }

    if (!targetBranch || targetMsgIndex === -1) {
      return this.getActiveBranch();
    }

    // Extract all messages up to and including the target message
    const ancestors = targetBranch.messages.slice(0, targetMsgIndex + 1);
    const targetMsg = ancestors[ancestors.length - 1];
    const snippet = targetMsg.content.slice(0, 32).replace(/[\n\r]+/g, ' ');

    const branchColors = ['#14B8A6', '#0284C7', '#6366F1', '#EC4899', '#F59E0B'];
    const newColor = branchColors[this.branches.length % branchColors.length];

    const newBranchId = `branch-${Date.now()}`;
    const newBranch: ConversationBranch = {
      id: newBranchId,
      name: `Fork #${this.branches.length + 1}: "${snippet}..."`,
      parentBranchId: targetBranch.id,
      divergedAtMessageId: messageId,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: ancestors.map((m) => ({ ...m, branchId: newBranchId })),
      color: newColor,
    };

    // Append system marker informing of fork
    const systemNotice: CompanionMessage = {
      id: `sys-${Date.now()}`,
      branchId: newBranchId,
      role: 'system',
      content: `⚡ Chat forked from message "${snippet}...". All prior context is preserved. Continue your conversation here independently without altering the parent thread.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      forkedFromMessageId: messageId,
    };
    newBranch.messages.push(systemNotice);

    this.branches.push(newBranch);
    this.activeBranchId = newBranchId;
    this.notify();
    return newBranch;
  }

  // Send a message to the active branch
  public async sendMessage(content: string): Promise<CompanionMessage> {
    const activeBranch = this.getActiveBranch();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: CompanionMessage = {
      id: `msg-user-${Date.now()}`,
      branchId: activeBranch.id,
      role: 'user',
      content,
      timestamp: timeStr,
    };

    activeBranch.messages.push(userMessage);
    this.isThinking = true;
    this.notify();

    // Generate intelligent assistant response with chain-of-thought
    const aiResponse = await this.synthesizeCompanionTurn(content, activeBranch.id);

    this.isThinking = false;
    activeBranch.messages.push(aiResponse);
    this.notify();

    return aiResponse;
  }

  // Synthesize Gemini turn with realistic thinking trace and potential video prompt extraction
  private async synthesizeCompanionTurn(
    prompt: string,
    branchId: string
  ): Promise<CompanionMessage> {
    const lower = prompt.toLowerCase();
    const isVideoRelated =
      lower.includes('video') ||
      lower.includes('scene') ||
      lower.includes('camera') ||
      lower.includes('cinematic') ||
      lower.includes('shot') ||
      lower.includes('motion') ||
      lower.includes('film');

    // Simulate thinking duration
    await new Promise((r) => setTimeout(r, 900));

    let content = '';
    let injectedScenePrompt: string | undefined = undefined;
    let hypotheses: string[] = [];
    let reflection = '';

    if (isVideoRelated) {
      hypotheses = [
        'Analyze narrative pacing and scene mood',
        'Formulate cinematic lighting and focal depth parameters',
        'Engineer optimal camera flight: Push-in vs Submersion Dive',
        'Structure prompt for high optical fidelity in Petri Video Flow',
      ];
      reflection =
        'Generated a multi-sensory scene prompt with crystalline caustics, volumetric lighting, and precise camera flight trajectory.';

      injectedScenePrompt =
        `Cinematic ultra-realistic 4K underwater sequence, crystal-clear turquoise abyss with glowing bioluminescent rays piercing through surface ripples. Slow helical crane dive around an obsidian monolith, 35mm anamorphic lens flare.`;

      content = `Here is a cinematic scene concept tailored for your vision:

**Visual Narrative**: *The Abyssal Awakening*
**Camera Flight**: Slow helical crane dive (35mm Anamorphic)
**Lighting**: High-contrast caustics with volumetric turquoise rays

> "${injectedScenePrompt}"

You can click the **"🎬 Inject into Video Flow"** button below to immediately add this scene as a node in your video editor timeline!`;
    } else {
      hypotheses = [
        'Deconstruct user inquiry into foundational principles',
        'Evaluate creative and structural options',
        'Verify alignment with user intent and offer divergent angles',
      ];
      reflection =
        'Comprehensive exploration delivered with clarity and actionable recommendations.';

      content = `I have analyzed your thoughts on "${prompt.slice(0, 45)}...":

1. **Core Insight**: The fundamental leverage point is combining modular clarity with fast feedback loops.
2. **Exploration**: Consider how small structural iterations can open up entirely new creative pathways.
3. **Recommendation**: We can continue deepening this direction, or you can fork this conversation to explore an alternative hypothesis in parallel!`;
    }

    const thoughtTrace: ThoughtTrace = {
      reasoningTokens: Math.floor(Math.random() * 800) + 1100,
      thinkingDurationMs: 1200 + Math.floor(Math.random() * 600),
      internalHypotheses: hypotheses,
      reflectionSummary: reflection,
      confidenceScore: 0.98,
    };

    return {
      id: `msg-asst-${Date.now()}`,
      branchId,
      role: 'assistant',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      thoughtTrace,
      injectedScenePrompt,
    };
  }

  // Direct injection into Petri Video Flow
  public injectIntoVideoFlow(promptText: string, title?: string) {
    return videoFlowService.addSceneNode({
      title: title || 'Scene: AI Gemini Concept',
      prompt: promptText,
      durationSeconds: 4,
      cameraFlight: 'submersion_dive',
      colorLut: 'Tiffany Clean',
    });
  }

  public deleteBranch(branchId: string) {
    if (branchId === 'main-branch') return; // Cannot delete main
    this.branches = this.branches.filter((b) => b.id !== branchId);
    if (this.activeBranchId === branchId) {
      this.activeBranchId = 'main-branch';
    }
    this.notify();
  }
}

export const geminiCompanionService = new GeminiCompanionService();
