import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  X,
  Send,
  GitFork,
  ChevronDown,
  ChevronUp,
  Cpu,
  Clapperboard,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { geminiCompanionService } from '../../services/geminiCompanionService';
import { ConversationBranch } from '../../types';

interface GeminiThoughtDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToVideoFlow?: () => void;
}

export const GeminiThoughtDrawer: React.FC<GeminiThoughtDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToVideoFlow,
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
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [branches, activeBranchId, isThinking, isOpen]);

  if (!isOpen) return null;

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
    setInjectedConfirmation(`Injected into Video Flow!`);
    setTimeout(() => setInjectedConfirmation(null), 2500);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-slate-900/95 border-l border-teal-500/30 z-50 flex flex-col shadow-2xl backdrop-blur-xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>Thought Companion</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                GEMINI
              </span>
            </h3>
            <span className="text-[10px] text-teal-300 font-mono truncate max-w-[200px] block">
              {activeBranch.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToVideoFlow && (
            <button
              onClick={() => {
                onNavigateToVideoFlow();
                onClose();
              }}
              className="p-1.5 text-xs text-teal-400 hover:text-teal-300 font-mono flex items-center gap-1"
              title="Switch to Video Flow Editor"
            >
              <Clapperboard className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Injected Confirmation Toast */}
      {injectedConfirmation && (
        <div className="m-3 p-2.5 bg-teal-950/90 border border-teal-500/50 rounded-xl text-xs font-mono text-teal-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{injectedConfirmation}</span>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
        {activeBranch.messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSystem = msg.role === 'system';
          const isThoughtOpen = expandedThoughts[msg.id] ?? false;

          if (isSystem) {
            return (
              <div
                key={msg.id}
                className="p-2.5 rounded-lg bg-teal-950/30 border border-teal-500/20 text-[11px] font-mono text-teal-300"
              >
                {msg.content}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <span className="text-[9px] font-mono text-slate-500 mb-0.5">
                {isUser ? 'You' : 'Gemini'} • {msg.timestamp}
              </span>

              <div
                className={`max-w-[90%] rounded-xl p-3 shadow-md relative ${
                  isUser
                    ? 'bg-teal-900/50 border border-teal-500/30 text-slate-100'
                    : 'bg-slate-950 border border-slate-800 text-slate-200'
                }`}
              >
                {/* Expandable Thought Trace */}
                {!isUser && msg.thoughtTrace && (
                  <div className="mb-2 bg-slate-900 border border-teal-500/20 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleToggleThought(msg.id)}
                      className="w-full p-1.5 flex items-center justify-between text-left hover:bg-slate-850 transition-colors"
                    >
                      <span className="text-[10px] font-mono text-teal-400 flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        Thought Process ({msg.thoughtTrace.reasoningTokens}t)
                      </span>
                      {isThoughtOpen ? (
                        <ChevronUp className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      )}
                    </button>

                    {isThoughtOpen && (
                      <div className="p-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
                        <div>
                          <strong>Hypotheses:</strong> {msg.thoughtTrace.internalHypotheses.join(' • ')}
                        </div>
                        <div className="text-teal-300">
                          {msg.thoughtTrace.reflectionSummary}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>

                {/* Inject into Video Flow button */}
                {msg.injectedScenePrompt && (
                  <button
                    onClick={() => handleInjectIntoVideo(msg.injectedScenePrompt!)}
                    className="mt-2.5 w-full py-1 px-2 rounded bg-teal-500/20 hover:bg-teal-500 hover:text-slate-950 text-teal-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1 border border-teal-500/30 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>🎬 Inject into Video Flow</span>
                  </button>
                )}

                {/* Fork action */}
                <div className="mt-2 pt-1 border-t border-slate-850/60 flex justify-end">
                  <button
                    onClick={() => handleFork(msg.id)}
                    className="flex items-center gap-1 text-[9px] font-mono text-slate-500 hover:text-teal-300 transition-colors cursor-pointer"
                  >
                    <GitFork className="w-2.5 h-2.5" />
                    <span>⚡ Fork Chat</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-center gap-2 p-3 bg-slate-950 border border-teal-500/20 rounded-xl text-xs text-teal-300 animate-pulse">
            <Brain className="w-4 h-4 animate-spin" />
            <span>Reflecting & composing reasoning...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Gemini anything..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 font-sans"
        />

        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isThinking}
          className="p-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold transition-all shadow-md shadow-teal-500/20 cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
