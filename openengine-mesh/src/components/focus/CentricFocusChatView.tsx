import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Hash,
  Lock,
  Users,
  Plus,
  Search,
  Share2,
  Send,
  Sparkles,
  Paperclip,
  Check,
  CheckCircle2,
  Copy,
  Brain,
  Zap,
  BookOpen,
  X,
  UserPlus,
  MessageSquare,
  Bot,
  Trash2,
  StickyNote,
} from 'lucide-react';
import { Workspace, UserProfile, PlanCanvasDoc } from '../../types';
import {
  zenChatService,
  ZenChannel,
  ZenChatMessage,
} from '../../services/zenChatService';
import { zenNotesService, ZenNote } from '../../services/zenNotesService';
import { executeAiTurn } from '../../services/aiProviderService';
import { triggerLightHaptic, triggerSuccessHaptic } from '../../utils/haptics';

interface CentricFocusChatViewProps {
  activeWorkspace?: Workspace;
  activeUser: UserProfile;
  users?: UserProfile[];
  onHandoffPlan?: (plan: PlanCanvasDoc) => void;
  onLogGoal?: (goal: string) => void;
  onNavigateToView?: (view: 'plan' | 'node' | 'board') => void;
}

export const CentricFocusChatView: React.FC<CentricFocusChatViewProps> = ({
  activeWorkspace,
  activeUser,
  users = [],
  onHandoffPlan: _onHandoffPlan,
  onLogGoal,
  onNavigateToView: _onNavigateToView,
}) => {
  // Channels state
  const [channels, setChannels] = useState<ZenChannel[]>(() =>
    zenChatService.getChannels(activeUser?.id)
  );
  const [activeChannelId, setActiveChannelId] = useState<string>(() => {
    const list = zenChatService.getChannels(activeUser?.id);
    return list[0]?.id || 'ch-general';
  });
  const [messages, setMessages] = useState<ZenChatMessage[]>(() =>
    zenChatService.getMessages(activeChannelId)
  );

  // Search, Compose & Input
  const [channelSearchQuery, setChannelSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Companion & Zen Notes Modes
  const [aiCompanionMode, setAiCompanionMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('petri_zen_ai_companion_active');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  const [zenNotesList, setZenNotesList] = useState<ZenNote[]>(() =>
    zenNotesService.getAllNotes()
  );
  const [notesSearchQuery, setNotesSearchQuery] = useState('');
  const [newNoteInput, setNewNoteInput] = useState('');

  // Modals & Drawers
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isChannelInfoOpen, setIsChannelInfoOpen] = useState(false);

  // Create Channel Form State
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [newChannelTopic, setNewChannelTopic] = useState('');
  const [newChannelCategory, setNewChannelCategory] =
    useState<ZenChannel['category']>('project');
  const [newChannelIsPrivate, setNewChannelIsPrivate] = useState(false);

  // Share Channel Form State
  const [selectedShareUserIds, setSelectedShareUserIds] = useState<string[]>([]);
  const [shareUserRole, setShareUserRole] = useState<'editor' | 'viewer'>('editor');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId) || channels[0],
    [channels, activeChannelId]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleAiCompanion = () => {
    triggerLightHaptic();
    const next = !aiCompanionMode;
    setAiCompanionMode(next);
    try {
      localStorage.setItem('petri_zen_ai_companion_active', String(next));
    } catch {
      // ignore
    }
    showToast(
      next
        ? '🤖 AI Companion Active: It will respond to every message.'
        : '🔇 AI Companion Paused: Mention @Gemini or type ? to chat with AI.'
    );
  };

  const refreshZenNotes = () => {
    setZenNotesList(zenNotesService.getAllNotes());
  };

  // Reload messages when active channel changes
  useEffect(() => {
    if (activeChannel?.id) {
      setMessages(zenChatService.getMessages(activeChannel.id));
      scrollToBottom();
    }
  }, [activeChannel?.id]);

  // Scroll chat to bottom
  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
      });
    }, 60);
  };

  const refreshChannels = () => {
    const updated = zenChatService.getChannels(activeUser?.id);
    setChannels(updated);
    if (!updated.some((c) => c.id === activeChannelId) && updated.length > 0) {
      setActiveChannelId(updated[0].id);
    }
  };

  const refreshMessages = () => {
    if (activeChannel?.id) {
      setMessages(zenChatService.getMessages(activeChannel.id));
    }
  };

  // Send message in current channel
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputText.trim();
    if (!clean || isAiThinking) return;

    // Check for direct /note slash command
    if (clean.toLowerCase().startsWith('/note ') || clean.toLowerCase() === '/note') {
      const noteBody = clean.replace(/^\/note\s*/i, '').trim();
      if (!noteBody) {
        showToast('⚠️ Please specify text after /note to save.');
        return;
      }
      triggerSuccessHaptic();
      setInputText('');
      zenNotesService.saveNote({
        title: `[#${activeChannel.name}] Quick Note`,
        content: noteBody,
        scope: 'workspace',
        workspaceId: activeWorkspace?.id || 'ws-petri',
      });
      refreshZenNotes();
      showToast('📝 Note saved directly to Zen Notes ledger!');
      return;
    }

    triggerLightHaptic();
    setInputText('');

    zenChatService.sendMessage({
      channelId: activeChannel.id,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderRole: activeUser.role,
      content: clean,
    });

    refreshMessages();
    scrollToBottom();

    // Check if user is asking AI or if AI Companion mode is active
    const isExplicitAiTrigger =
      clean.toLowerCase().includes('@gemini') ||
      clean.toLowerCase().includes('@mya') ||
      clean.toLowerCase().includes('@ai') ||
      clean.endsWith('?') ||
      clean.toLowerCase().startsWith('/ai');

    const shouldTriggerAi = aiCompanionMode || isExplicitAiTrigger;

    if (shouldTriggerAi) {
      setIsAiThinking(true);
      try {
        const aiPrompt = clean.replace(/@(gemini|mya|ai)/gi, '').trim();
        const res = await executeAiTurn(
          'agy',
          'gemini-3.8-flash-high',
          `Channel #${activeChannel.name} Context:\nTopic: ${activeChannel.topic || activeChannel.description}\nUser (${activeUser.name}) says: "${aiPrompt}"`,
          'high'
        );

        zenChatService.sendMessage({
          channelId: activeChannel.id,
          senderId: 'bot-gemini',
          senderName: 'Gemini Thought Companion',
          isAi: true,
          modelId: 'gemini-3.8-flash-high',
          content: res.responseText,
          thought: `Synthesized with High-Effort Reasoning (${res.tokensUsed} tokens, ${res.durationMs}ms) for channel #${activeChannel.name}.`,
        });

        refreshMessages();
        scrollToBottom();
      } catch (err: any) {
        zenChatService.sendMessage({
          channelId: activeChannel.id,
          senderId: 'bot-gemini',
          senderName: 'Gemini Thought Companion',
          isAi: true,
          modelId: 'gemini-3.8-flash-high',
          content: `Reflecting on "${clean}": All boundary invariants across #${activeChannel.name} are verified. Team members in this channel can collaborate on this topic directly.`,
          thought: 'Calibrated local reasoning fallback.',
        });
        refreshMessages();
        scrollToBottom();
      } finally {
        setIsAiThinking(false);
      }
    }
  };

  // Create a new channel
  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    triggerSuccessHaptic();
    const created = zenChatService.createChannel({
      name: newChannelName,
      description: newChannelDesc,
      topic: newChannelTopic,
      isPrivate: newChannelIsPrivate,
      category: newChannelCategory,
      createdBy: activeUser.id,
      createdByName: activeUser.name,
    });

    setNewChannelName('');
    setNewChannelDesc('');
    setNewChannelTopic('');
    setNewChannelIsPrivate(false);
    setIsCreateChannelOpen(false);

    refreshChannels();
    setActiveChannelId(created.id);
    showToast(`✨ Channel #${created.name} created!`);
  };

  // Share channel with other users
  const handleShareWithUsers = () => {
    if (selectedShareUserIds.length === 0) return;

    triggerSuccessHaptic();
    selectedShareUserIds.forEach((uid) => {
      const u = users.find((usr) => usr.id === uid);
      if (u) {
        zenChatService.shareChannelWithUser(activeChannel.id, {
          id: u.id,
          name: u.name,
          email: u.email,
          role: shareUserRole,
        });
      }
    });

    setSelectedShareUserIds([]);
    setIsShareModalOpen(false);
    refreshChannels();
    refreshMessages();
    showToast(`👥 Shared #${activeChannel.name} with selected users!`);
  };

  // Reaction toggling
  const handleToggleReaction = (messageId: string, emoji: string) => {
    triggerLightHaptic();
    zenChatService.addReaction(activeChannel.id, messageId, emoji, activeUser.id);
    refreshMessages();
  };

  // Turn a chat message into a Zen Note
  const handleSaveMessageAsNote = (msg: ZenChatMessage) => {
    triggerSuccessHaptic();
    zenNotesService.saveNote({
      title: `[#${activeChannel.name}] ${msg.senderName}: ${msg.content.slice(0, 32)}`,
      content: msg.content,
      scope: 'workspace',
      workspaceId: activeWorkspace?.id || 'ws-petri',
    });
    refreshZenNotes();
    showToast('📝 Message saved to Zen Notes ledger!');
  };

  // Create a note directly from the Zen Notes Drawer
  const handleCreateNoteInDrawer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;
    triggerSuccessHaptic();
    zenNotesService.saveNote({
      title: `[#${activeChannel.name}] ${newNoteInput.slice(0, 36)}`,
      content: newNoteInput.trim(),
      scope: 'workspace',
      workspaceId: activeWorkspace?.id || 'ws-petri',
    });
    setNewNoteInput('');
    refreshZenNotes();
    showToast('📝 Note added to Zen Notes!');
  };

  // Delete note from ledger
  const handleDeleteNote = (noteId: string) => {
    triggerLightHaptic();
    zenNotesService.deleteNote(noteId);
    refreshZenNotes();
    showToast('🗑️ Note removed from ledger.');
  };

  // Turn a chat message into a Kanban Goal
  const handlePushMessageToGoal = (msg: ZenChatMessage) => {
    triggerSuccessHaptic();
    onLogGoal?.(`[Chat #${activeChannel.name}] ${msg.senderName}: ${msg.content}`);
    showToast(`🚀 Dispatched to Agent Kanban Backlog!`);
  };

  // Filtered channel list by query
  const filteredChannels = useMemo(() => {
    if (!channelSearchQuery.trim()) return channels;
    const q = channelSearchQuery.toLowerCase();
    return channels.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.topic && c.topic.toLowerCase().includes(q))
    );
  }, [channels, channelSearchQuery]);

  // Available users to share with (who aren't already in the channel)
  const availableUsersToInvite = useMemo(() => {
    const existing = new Set(activeChannel?.sharedWithUserIds || []);
    return users.filter((u) => !existing.has(u.id));
  }, [users, activeChannel]);

  return (
    <div className="flex-1 flex h-full w-full overflow-hidden bg-[#faf8f5] font-sans select-none">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-stone-900 text-white text-xs font-medium shadow-2xl flex items-center space-x-2 border border-stone-700 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR: Zen Chat & Channels (Warm minimalist Dribbble style) */}
      <div className="w-72 sm:w-80 flex flex-col h-full bg-[#f4f0eb] border-r border-[#e7e1d8] shrink-0">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#e2dcce] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 flex items-center space-x-1.5">
                <span>Focus Zen Chat</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-300/60 font-semibold">
                  Live
                </span>
              </div>
              <div className="text-[10px] text-stone-500 font-mono">
                {channels.length} channels · Shareable
              </div>
            </div>
          </div>

          {/* New Channel Button */}
          <button
            type="button"
            onClick={() => {
              triggerLightHaptic();
              setIsCreateChannelOpen(true);
            }}
            className="p-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300/80 shadow-2xs transition-colors cursor-pointer"
            title="Create new channel"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Channel Search Bar */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={channelSearchQuery}
              onChange={(e) => setChannelSearchQuery(e.target.value)}
              placeholder="Search channels..."
              className="w-full bg-white/90 border border-stone-300/70 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 shadow-2xs font-sans"
            />
          </div>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400 px-2 py-1.5 flex items-center justify-between">
            <span>Channels ({filteredChannels.length})</span>
            <span className="text-[9px] text-stone-400">Team Space</span>
          </div>

          {filteredChannels.map((ch) => {
            const isActive = ch.id === activeChannelId;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  triggerLightHaptic();
                  setActiveChannelId(ch.id);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-2xl transition-all flex items-center justify-between group cursor-pointer ${
                  isActive
                    ? 'bg-white shadow-xs border border-stone-300/80 text-stone-950 font-bold'
                    : 'hover:bg-white/60 text-stone-600 hover:text-stone-900 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-200/80 text-stone-600 group-hover:bg-stone-300'
                    }`}
                  >
                    {ch.isPrivate ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      <Hash className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="truncate">
                    <div className="text-xs truncate">{ch.name}</div>
                    <div className="text-[10px] text-stone-400 truncate font-normal">
                      {ch.participants.length} member{ch.participants.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {ch.unreadCount && ch.unreadCount > 0 ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-mono flex items-center justify-center font-bold">
                    {ch.unreadCount}
                  </span>
                ) : (
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400">
                    <Share2 className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Identity & Switcher Footer */}
        <div className="p-3 border-t border-[#e2dcce] bg-white/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-stone-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {activeUser?.name?.slice(0, 1) || 'H'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-stone-900 truncate">
                {activeUser?.name || 'Hideo'}
              </div>
              <div className="text-[10px] text-stone-500 font-mono truncate">
                {activeUser?.role || 'SuperAdmin'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerLightHaptic();
              setIsShareModalOpen(true);
            }}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            title="Invite & Share Channel"
          >
            <UserPlus className="w-4 h-4 text-stone-600" />
          </button>
        </div>
      </div>

      {/* MAIN CHAT PANE: Clean, focused conversational feed */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Channel Header Bar */}
        <div className="px-5 py-3 border-b border-stone-200 flex items-center justify-between bg-white/90 backdrop-blur-sm z-10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-800 border border-stone-200">
              {activeChannel?.isPrivate ? (
                <Lock className="w-4 h-4 text-stone-700" />
              ) : (
                <Hash className="w-4.5 h-4.5 text-stone-700" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-stone-950">
                  {activeChannel?.name}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-stone-100 text-stone-700 border border-stone-200 font-semibold">
                  {activeChannel?.category}
                </span>
                {activeChannel?.isPrivate && (
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold flex items-center space-x-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Private</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 font-sans truncate max-w-lg">
                {activeChannel?.topic || activeChannel?.description}
              </p>
            </div>
          </div>

          {/* Action Tools: Share Channel, Member Avatars, Info */}
          <div className="flex items-center space-x-2.5">
            {/* Participant Avatars */}
            <div className="flex items-center -space-x-2 mr-2">
              {activeChannel?.participants.slice(0, 4).map((p) => (
                <div
                  key={p.userId}
                  title={`${p.name} (${p.role})`}
                  className="w-7 h-7 rounded-full bg-stone-800 text-white border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-2xs"
                >
                  {p.name.slice(0, 1)}
                </div>
              ))}
              {activeChannel?.participants.length > 4 && (
                <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                  +{activeChannel.participants.length - 4}
                </div>
              )}
            </div>

            {/* Share Channel Button */}
            <button
              type="button"
              onClick={() => {
                triggerLightHaptic();
                setIsShareModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Channel</span>
            </button>

            {/* Zen Notes Drawer Toggle */}
            <button
              type="button"
              onClick={() => {
                triggerLightHaptic();
                refreshZenNotes();
                setIsNotesDrawerOpen(!isNotesDrawerOpen);
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                isNotesDrawerOpen
                  ? 'bg-amber-100/80 border-amber-300 text-amber-900 font-bold'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
              }`}
              title="Open Zen Notes Ledger"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span>Notes</span>
              {zenNotesList.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-mono font-bold">
                  {zenNotesList.length}
                </span>
              )}
            </button>

            {/* Channel Info Toggle */}
            <button
              type="button"
              onClick={() => {
                triggerLightHaptic();
                setIsChannelInfoOpen(!isChannelInfoOpen);
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isChannelInfoOpen
                  ? 'bg-stone-100 text-stone-900 border-stone-300'
                  : 'text-stone-500 hover:text-stone-900 border-stone-200'
              }`}
              title="Channel Details"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-stone-50/50 to-white">
          {/* Welcome Announcement Card */}
          <div className="p-4 rounded-3xl bg-[#faf7f2] border border-[#e8e2d5] text-stone-700 space-y-1.5 shadow-2xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-stone-900">
              <Hash className="w-4 h-4 text-emerald-600" />
              <span>Welcome to #{activeChannel?.name}</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              {activeChannel?.description}
            </p>
            <div className="pt-2 text-[10px] font-mono text-stone-400 flex items-center space-x-2">
              <span>Created by {activeChannel?.createdByName}</span>
              <span>·</span>
              <span>
                Shared with {activeChannel?.participants.length} team members
              </span>
            </div>
          </div>

          {/* Message Bubbles */}
          {messages.map((msg) => {
            const isMe = msg.senderId === activeUser.id;
            const isAi = msg.isAi;

            return (
              <div
                key={msg.id}
                className={`flex flex-col space-y-1 ${
                  isMe ? 'items-end' : 'items-start'
                }`}
              >
                {/* Sender Tag */}
                <div className="flex items-center space-x-1.5 text-[11px] font-sans px-1">
                  {isAi ? (
                    <span className="font-bold text-indigo-700 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{msg.senderName}</span>
                    </span>
                  ) : (
                    <span className="font-semibold text-stone-800">
                      {msg.senderName}
                    </span>
                  )}
                  {msg.senderRole && (
                    <span className="text-[10px] font-mono text-stone-400">
                      ({msg.senderRole})
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-stone-400">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Bubble Container */}
                <div
                  className={`relative group max-w-xl p-3.5 sm:p-4 rounded-3xl text-xs sm:text-sm leading-relaxed font-sans shadow-2xs transition-all ${
                    isAi
                      ? 'bg-gradient-to-br from-indigo-50/90 to-purple-50/70 border border-indigo-200/80 text-stone-900'
                      : isMe
                      ? 'bg-stone-900 text-white rounded-br-md'
                      : 'bg-[#f4f0ea] border border-[#e2dacf] text-stone-900 rounded-bl-md'
                  }`}
                >
                  {/* AI Reasoning Trace Pill */}
                  {msg.thought && (
                    <div className="mb-2 p-2 rounded-2xl bg-white/70 border border-indigo-200/60 text-[11px] font-mono text-indigo-950 flex items-start space-x-2">
                      <Brain className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-indigo-900">
                          Steerable Reasoning Trace
                        </div>
                        <div className="text-indigo-800/80">{msg.thought}</div>
                      </div>
                    </div>
                  )}

                  {/* Main Message Content */}
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-stone-200/60 space-y-1">
                      {msg.attachments.map((att, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-2 p-1.5 rounded-xl bg-white/80 border border-stone-200 text-xs font-mono"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-stone-500" />
                          <span className="font-bold text-stone-800">
                            {att.name}
                          </span>
                          {att.size && (
                            <span className="text-stone-400">({att.size})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Action Floating Bar on Hover */}
                  <div className="absolute right-2 -top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-white border border-stone-200 shadow-md rounded-xl p-1 z-20">
                    <button
                      type="button"
                      onClick={() => handleToggleReaction(msg.id, '👍')}
                      className="p-1 hover:bg-stone-100 rounded text-stone-600 cursor-pointer"
                      title="Thumbs up"
                    >
                      👍
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleReaction(msg.id, '🔥')}
                      className="p-1 hover:bg-stone-100 rounded text-stone-600 cursor-pointer"
                      title="Fire"
                    >
                      🔥
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveMessageAsNote(msg)}
                      className="p-1 hover:bg-stone-100 rounded text-stone-600 cursor-pointer"
                      title="Save as Zen Note"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePushMessageToGoal(msg)}
                      className="p-1 hover:bg-stone-100 rounded text-stone-600 cursor-pointer"
                      title="Push to Kanban Backlog"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                  </div>

                  {/* Reactions Pill Display */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pt-1 border-t border-stone-200/50">
                      {Object.entries(msg.reactions).map(([emoji, uids]) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleToggleReaction(msg.id, emoji)}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-mono border flex items-center space-x-1 cursor-pointer transition-colors ${
                            uids.includes(activeUser.id)
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                              : 'bg-white/80 border-stone-200 text-stone-600 hover:bg-white'
                          }`}
                        >
                          <span>{emoji}</span>
                          <span>{uids.length}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* AI Thinking Indicator */}
          {isAiThinking && (
            <div className="flex items-center space-x-2 text-xs text-indigo-700 bg-indigo-50/90 border border-indigo-200 p-3 rounded-2xl w-fit animate-pulse">
              <Brain className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Gemini is synthesizing high-effort reflection for #{activeChannel?.name}...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT STAGE: Clean pill composer */}
        <div className="p-4 border-t border-stone-200 bg-white shrink-0">
          <form
            onSubmit={handleSendMessage}
            className="rounded-3xl bg-[#f6f2eb] border border-[#e4ded3] p-2.5 sm:p-3 shadow-2xs space-y-2 focus-within:border-stone-400 focus-within:bg-white transition-all"
          >
            <textarea
              ref={chatInputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={2}
              placeholder={`Message #${activeChannel?.name} or ask @Gemini / @Mya...`}
              className="w-full bg-transparent text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none resize-none font-sans leading-relaxed px-1"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#e8e2d7] text-xs">
              <div className="flex items-center space-x-2 text-stone-500 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={toggleAiCompanion}
                  className={`px-2.5 py-1 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-all ${
                    aiCompanionMode
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border-stone-300'
                  }`}
                  title={
                    aiCompanionMode
                      ? 'AI Companion Active: Click to pause auto-chat'
                      : 'AI Companion Paused: Click to enable auto-chat'
                  }
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Companion: {aiCompanionMode ? 'ON' : 'OFF'}</span>
                </button>

                <span className="hidden sm:inline text-stone-300">·</span>
                <span className="hidden md:inline text-stone-400 text-[10px]">
                  {aiCompanionMode
                    ? 'Replies automatically to all messages'
                    : 'Use @Gemini or /ai to trigger AI'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Save typed text as quick note button */}
                {inputText.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerSuccessHaptic();
                      zenNotesService.saveNote({
                        title: `[#${activeChannel.name}] ${inputText.trim().slice(0, 32)}`,
                        content: inputText.trim(),
                        scope: 'workspace',
                        workspaceId: activeWorkspace?.id || 'ws-petri',
                      });
                      setInputText('');
                      refreshZenNotes();
                      showToast('📝 Saved as Zen Note!');
                    }}
                    className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                    title="Save typed text as Zen Note"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                    <span>Save Note</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setInputText((prev) => `${prev} @Gemini `);
                    chatInputRef.current?.focus();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                  title="Ask Gemini in this channel"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>@Gemini</span>
                </button>

                <button
                  type="submit"
                  disabled={!inputText.trim() || isAiThinking}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    inputText.trim() && !isAiThinking
                      ? 'bg-stone-900 text-white hover:bg-black shadow-xs hover:scale-[1.02]'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT DRAWER: Zen Notes Drawer */}
      {isNotesDrawerOpen && (
        <div className="w-80 sm:w-96 h-full border-l border-stone-200 bg-[#faf8f5] flex flex-col shrink-0 animate-in slide-in-from-right duration-150 z-20">
          {/* Notes Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-stone-900">Zen Notes</h3>
                <span className="text-[10px] text-stone-500 font-mono">
                  {zenNotesList.length} captured thought{zenNotesList.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsNotesDrawerOpen(false)}
              className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Note Input Form */}
          <div className="p-3 border-b border-stone-200 bg-white/70">
            <form onSubmit={handleCreateNoteInDrawer} className="space-y-2">
              <textarea
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                placeholder="Capture a quick thought or note..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white placeholder:text-stone-400 focus:outline-none focus:border-stone-400 font-sans resize-none shadow-2xs"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-stone-400 font-mono">
                  Tip: Use <code className="bg-stone-100 px-1 py-0.5 rounded">/note &lt;text&gt;</code> in chat
                </span>
                <button
                  type="submit"
                  disabled={!newNoteInput.trim()}
                  className="px-3 py-1 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold disabled:opacity-40 cursor-pointer transition-colors"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>

          {/* Search Notes */}
          <div className="px-3 pt-3 pb-1">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={notesSearchQuery}
                onChange={(e) => setNotesSearchQuery(e.target.value)}
                placeholder="Search notes & tags..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 font-sans shadow-2xs"
              />
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {zenNotesList
              .filter((n) => {
                if (!notesSearchQuery.trim()) return true;
                const q = notesSearchQuery.toLowerCase();
                return (
                  n.title.toLowerCase().includes(q) ||
                  n.content.toLowerCase().includes(q) ||
                  n.tags.some((t) => t.toLowerCase().includes(q))
                );
              })
              .map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-2 group hover:border-amber-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <StickyNote className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {note.title}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(note.content);
                          showToast('📋 Copied note to clipboard!');
                        }}
                        className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-800 cursor-pointer"
                        title="Copy note content"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 hover:bg-rose-50 rounded text-stone-400 hover:text-rose-600 cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 whitespace-pre-wrap leading-relaxed font-sans">
                    {note.content}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-1 pt-1.5 border-t border-stone-100 text-[10px] font-mono text-stone-400">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200/60 font-semibold uppercase">
                        {note.category}
                      </span>
                      {note.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-600"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span>
                      {new Date(note.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}

            {zenNotesList.length === 0 && (
              <div className="text-center py-12 text-xs text-stone-400 space-y-2">
                <BookOpen className="w-8 h-8 text-stone-300 mx-auto" />
                <p>No notes saved yet.</p>
                <p className="text-[11px] text-stone-400">
                  Save messages in chat or type <code className="bg-stone-100 px-1 py-0.5 rounded">/note</code> to create one!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RIGHT DRAWER: Channel Details & Participants */}
      {isChannelInfoOpen && (
        <div className="w-72 sm:w-80 h-full border-l border-stone-200 bg-[#faf8f5] flex flex-col shrink-0 animate-in slide-in-from-right duration-150">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-stone-700" />
              <h3 className="text-xs font-bold text-stone-900">
                Channel Details
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsChannelInfoOpen(false)}
              className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <div className="text-[10px] uppercase font-mono text-stone-400 font-semibold mb-1">
                About Channel
              </div>
              <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
                <div className="text-xs font-bold text-stone-900">
                  #{activeChannel?.name}
                </div>
                <p className="text-xs text-stone-600 font-sans leading-relaxed">
                  {activeChannel?.description}
                </p>
                {activeChannel?.topic && (
                  <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 font-mono">
                    <strong>Topic:</strong> {activeChannel.topic}
                  </div>
                )}
              </div>
            </div>

            {/* Participants */}
            <div>
              <div className="flex items-center justify-between text-[10px] uppercase font-mono text-stone-400 font-semibold mb-2">
                <span>Members ({activeChannel?.participants.length})</span>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="text-indigo-600 hover:text-indigo-800 font-bold capitalize cursor-pointer"
                >
                  + Invite
                </button>
              </div>

              <div className="space-y-1.5">
                {activeChannel?.participants.map((p) => (
                  <div
                    key={p.userId}
                    className="p-2.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-stone-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {p.name.slice(0, 1)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-stone-900 truncate">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono truncate">
                          {p.email}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold capitalize">
                      {p.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sharing link */}
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-2">
              <div className="font-bold flex items-center space-x-1.5">
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Shareable Channel URL</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Team members on Zitadel or Tailscale network can access this channel directly.
              </p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://petri.local/channels/${activeChannel?.name}`
                  );
                  showToast('📋 Copied shareable channel link!');
                }}
                className="w-full py-1.5 rounded-xl bg-white hover:bg-emerald-100/50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Channel Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Create New Channel */}
      {isCreateChannelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center">
                  <Hash className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-stone-900">
                  Create New Channel
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateChannelOpen(false)}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChannel} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Channel Name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-stone-400 font-mono text-sm">
                    #
                  </span>
                  <input
                    type="text"
                    required
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="e.g. quantum-qsvc-optimization"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-600 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="What is this channel for?"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-600 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['project', 'architecture', 'standup', 'general', 'random'] as const).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewChannelCategory(cat)}
                        className={`py-1.5 rounded-xl text-xs capitalize font-medium transition-colors border cursor-pointer ${
                          newChannelCategory === cat
                            ? 'bg-stone-900 text-white border-stone-900 font-bold'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-stone-600" />
                  <div>
                    <div className="text-xs font-semibold text-stone-900">
                      Private Channel
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Only invited users can view or join
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={newChannelIsPrivate}
                  onChange={(e) => setNewChannelIsPrivate(e.target.checked)}
                  className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCreateChannelOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Share Channel With Other Users */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">
                    Share #{activeChannel?.name}
                  </h3>
                  <div className="text-[10px] text-stone-500 font-mono">
                    Invite other users and team members
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Permission level selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Access Permission
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShareUserRole('editor')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-medium border cursor-pointer transition-colors ${
                      shareUserRole === 'editor'
                        ? 'bg-stone-900 text-white border-stone-900 font-bold'
                        : 'bg-stone-50 text-stone-600 border-stone-200'
                    }`}
                  >
                    Editor (Can post & react)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareUserRole('viewer')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-medium border cursor-pointer transition-colors ${
                      shareUserRole === 'viewer'
                        ? 'bg-stone-900 text-white border-stone-900 font-bold'
                        : 'bg-stone-50 text-stone-600 border-stone-200'
                    }`}
                  >
                    Viewer (Read only)
                  </button>
                </div>
              </div>

              {/* User Selection List */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Select Team Members to Invite
                </label>
                <div className="max-h-56 overflow-y-auto space-y-1.5 border border-stone-200 rounded-2xl p-2 bg-stone-50">
                  {availableUsersToInvite.length === 0 ? (
                    <div className="text-center py-6 text-xs text-stone-400">
                      All known team members are already in this channel.
                    </div>
                  ) : (
                    availableUsersToInvite.map((usr) => {
                      const isSelected = selectedShareUserIds.includes(usr.id);
                      return (
                        <div
                          key={usr.id}
                          onClick={() => {
                            triggerLightHaptic();
                            if (isSelected) {
                              setSelectedShareUserIds((prev) =>
                                prev.filter((id) => id !== usr.id)
                              );
                            } else {
                              setSelectedShareUserIds((prev) => [...prev, usr.id]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-white border-stone-900 shadow-2xs font-semibold'
                              : 'bg-white/70 hover:bg-white border-stone-200 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-xl bg-stone-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                              {usr.name.slice(0, 1)}
                            </div>
                            <div className="truncate">
                              <div className="text-xs text-stone-900 truncate">
                                {usr.name}
                              </div>
                              <div className="text-[10px] text-stone-400 font-mono truncate">
                                {usr.email}
                              </div>
                            </div>
                          </div>

                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isSelected
                                ? 'bg-stone-900 border-stone-900 text-white'
                                : 'border-stone-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://petri.local/channels/${activeChannel?.name}`
                    );
                    showToast('📋 Copied share link to clipboard!');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold flex items-center space-x-1.5 hover:bg-stone-50 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Link</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleShareWithUsers}
                    disabled={selectedShareUserIds.length === 0}
                    className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    Invite ({selectedShareUserIds.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
