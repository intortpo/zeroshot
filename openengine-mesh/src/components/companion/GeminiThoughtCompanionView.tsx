import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Sparkles,
  Send,
  GitFork,
  ChevronDown,
  ChevronUp,
  Cpu,
  Clapperboard,
  CheckCircle2,
  Zap
} from 'lucide-react';
import {
  geminiCompanionService
} from '../../services/geminiCompanionService';
import { ConversationBranch } from '../../types';
import { BranchTreeModal } from './BranchTreeModal';

interface GeminiThoughtCompanionViewProps {
  onNavigateToVideoFlow?: () => void;
  className?: string;
}

export const GeminiThoughtCompanionView: React.FC<GeminiThoughtCompanionViewProps> = ({
  onNavigateToVideoFlow,
  className = '',
}) => {
  const [branches, setBranches] = useState<ConversationBranch[]>(() =>
    geminiCompanionService.getAllBranches()
  );
  const [activeBranchId, setActiveBranchId] = useState<string>(() =>
    geminiCompanionService.getActiveBranchId()
  );
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [isTreeModalOpen, setIsTreeModalOpen] = useState(false);
  const [injectedConfirmation, setInjectedConfirmation] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return geminiCompanionService.subscribe(() => {
      setBranches(geminiCompanionService.getAllBranches());
      setActiveBranchId(geminiCompanionService.getActiveBranchId());
      setIsThinking(geminiCompanionService.getIsThinking());
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [branches, activeBranchId, isThinking]);

  const activeBranch =
    branches.find((b) => b.id === activeBranchId) || branches[0];

  const handleSend = async () => {
    if (!inputText.trim() || isThinking) return;
    const msg = inputText;
    setInputText('');
    await geminiCompanionService.sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFork = (messageId: string) => {
    geminiCompanionService.forkFromMessage(messageId);
  };

  const handleToggleThought = (msgId: string) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleInjectIntoVideo = (promptText: string, title?: string) => {
    geminiCompanionService.injectIntoVideoFlow(promptText, title);
    setInjectedConfirmation(`Injected "${promptText.slice(0, 30)}..." into Video Flow!`);
    setTimeout(() => setInjectedConfirmation(null), 3000);
  };

  const promptSuggestions = [
    '🎬 Write a 3-scene underwater cyberpunk teaser script with camera flights',
    '🌌 Explain Byzantine Quorum reachability in Petri net state spaces',
    '🎥 Prompt for a 35mm anamorphic drone breach through ocean waves',
    '✦ Brainstorm an open-ended narrative about self-evolving AI models',
  ];

  return (
    <div className={`flex flex-col h-full max-w-[1400px] mx-auto p-4 sm:p-6 text-slate-100 ${className}`}>
      {/* Top Header & Active Branch Bar */}
      <div className="bg-slate-900/90 border border-teal-500/20 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                Gemini Thought Companion
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                DEEP THINK • 3.8 FLASH
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Chat about anything you choose with transparent chain-of-thought and instant forking from any message.
            </p>
          </div>
        </div>

        {/* Branch Selector Pill & Video Flow Link */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsTreeModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-teal-500/40 hover:border-teal-400 text-xs font-mono font-bold text-teal-300 transition-all shadow-md hover:scale-102 cursor-pointer"
          >
            <GitFork className="w-4 h-4 text-teal-400" />
            <span className="truncate max-w-[180px]">{activeBranch.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {onNavigateToVideoFlow && (
            <button
              onClick={onNavigateToVideoFlow}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Clapperboard className="w-4 h-4 text-teal-400" />
              <span>Video Flow Studio →</span>
            </button>
          )}
        </div>
      </div>

      {/* Injected Notification Toast */}
      {injectedConfirmation && (
        <div className="mb-3 p-3 bg-teal-950/80 border border-teal-500/50 rounded-xl text-xs font-mono text-teal-300 flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span>{injectedConfirmation}</span>
          </div>
          {onNavigateToVideoFlow && (
            <button
              onClick={onNavigateToVideoFlow}
              className="text-[11px] underline font-bold hover:text-white"
            >
              Go to Video Flow
            </button>
          )}
        </div>
      )}

      {/* Messages Thread Container */}
      <div className="flex-1 bg-slate-950 border border-slate-850 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-6 shadow-inner min-h-[480px]">
        {activeBranch.messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSystem = msg.role === 'system';
          const isThoughtOpen = expandedThoughts[msg.id] ?? false;

          if (isSystem) {
            return (
              <div
                key={msg.id}
                className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30 text-xs font-mono text-teal-300 flex items-center gap-2.5 max-w-2xl mx-auto shadow-sm"
              >
                <Zap className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>{msg.content}</span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mb-1 px-1">
                <span>{isUser ? 'You' : 'Gemini Thought Companion'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Bubble Card */}
              <div
                className={`max-w-3xl rounded-2xl p-4 sm:p-5 shadow-lg relative ${
                  isUser
                    ? 'bg-gradient-to-r from-teal-900/50 to-teal-800/40 border border-teal-500/30 text-slate-100'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                {/* Expandable Chain-of-Thought Accordion for Assistant */}
                {!isUser && msg.thoughtTrace && (
                  <div className="mb-4 bg-slate-950/80 border border-teal-500/30 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleToggleThought(msg.id)}
                      className="w-full p-2.5 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-teal-400" />
                        <span className="text-[11px] font-mono font-bold text-teal-300">
                          Thought Companion Process
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ({msg.thoughtTrace.reasoningTokens} tokens • {(msg.thoughtTrace.thinkingDurationMs / 1000).toFixed(1)}s)
                        </span>
                      </div>
                      {isThoughtOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {isThoughtOpen && (
                      <div className="p-3 border-t border-slate-850 space-y-2 text-xs font-mono text-slate-400 bg-slate-950/50 animate-in fade-in duration-150">
                        <div className="text-[10px] uppercase font-bold text-slate-500">
                          Internal Hypotheses Explored:
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                          {msg.thoughtTrace.internalHypotheses.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                        <div className="pt-2 border-t border-slate-850 text-[11px] text-teal-300">
                          <strong>Synthesis Reflection: </strong>
                          {msg.thoughtTrace.reflectionSummary}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Main Content */}
                <div className="text-sm font-sans leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* Direct Inject into Video Flow Button */}
                {msg.injectedScenePrompt && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                      <Clapperboard className="w-3.5 h-3.5 text-teal-400" />
                      <span>Scene ready for Flow Editor</span>
                    </div>
                    <button
                      onClick={() => handleInjectIntoVideo(msg.injectedScenePrompt!)}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-500/20 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>🎬 Inject into Video Flow</span>
                    </button>
                  </div>
                )}

                {/* Fork From Here Action Button */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-end">
                  <button
                    onClick={() => handleFork(msg.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400 hover:text-teal-300 hover:bg-slate-800 transition-all cursor-pointer group-hover:opacity-100"
                    title="Fork conversation from this turn into a new branch"
                  >
                    <GitFork className="w-3 h-3 text-teal-400" />
                    <span>⚡ Fork Chat from Here</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-3 p-4 bg-slate-900 border border-teal-500/30 rounded-2xl max-w-md animate-pulse">
            <Brain className="w-5 h-5 text-teal-400 animate-spin" />
            <div>
              <div className="text-xs font-bold text-slate-200">
                Gemini Thought Companion is reflecting...
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Analyzing visual parameters, composing reasoning traces...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Ideas */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {promptSuggestions.map((prompt, i) => (
          <button
            key={i}
            onClick={() => setInputText(prompt)}
            className="text-[11px] font-medium text-slate-400 bg-slate-900 hover:bg-slate-850 hover:text-teal-300 px-3 py-1.5 rounded-lg border border-slate-800 whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Bottom Message Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl flex items-center gap-3">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Chat with Gemini about anything... (Press Enter to send, Shift+Enter for new line)"
          rows={2}
          className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none font-sans leading-relaxed"
        />

        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isThinking}
          className={`p-3 rounded-xl font-bold transition-all shadow-md cursor-pointer ${
            !inputText.trim() || isThinking
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Branch Tree Modal */}
      <BranchTreeModal
        isOpen={isTreeModalOpen}
        onClose={() => setIsTreeModalOpen(false)}
        branches={branches}
        activeBranchId={activeBranchId}
        onSelectBranch={(id) => geminiCompanionService.setActiveBranch(id)}
      />
    </div>
  );
};
