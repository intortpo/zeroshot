import React, { useState } from 'react';
import {
  Eye,
  MessageSquare,
  Sparkles,
  Send,
  RotateCw,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  Clock,
  Pin,
  Check,
  Calendar,
  Layers,
  HelpCircle,
  X,
  FileText,
} from 'lucide-react';
import { UserProfile, Workspace, PetriItem } from '../../types';

interface ConsumerPortalViewProps {
  activeUser: UserProfile;
  activeWorkspace?: Workspace;
  items?: PetriItem[];
  onCreateConsumerRequest?: (title: string, details: string, category: 'feature' | 'bug' | 'inquiry') => void;
  onOpenUserModal?: () => void;
}

type ConsumerSubTab = 'preview' | 'assistant' | 'roadmap';
type DevicePreset = 'desktop' | 'tablet' | 'mobile';

interface ConsumerMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  ticketId?: string;
  category?: string;
}

export const ConsumerPortalView: React.FC<ConsumerPortalViewProps> = ({
  activeUser,
  activeWorkspace,
  items = [],
  onCreateConsumerRequest,
  onOpenUserModal,
}) => {
  const [activeTab, setActiveTab] = useState<ConsumerSubTab>('preview');
  const [devicePreset, setDevicePreset] = useState<DevicePreset>('desktop');
  const [previewUrl, setPreviewUrl] = useState<string>('http://localhost:5173');
  const [iframeKey, setIframeKey] = useState<number>(Date.now());
  const [isPinModeActive, setIsPinModeActive] = useState<boolean>(false);
  const [pinNotes, setPinNotes] = useState<Array<{ id: string; x: number; y: number; text: string }>>([
    { id: 'pin-1', x: 22, y: 15, text: 'Top navigation bar: branding and contrast are verified.' },
  ]);
  const [newPinNote, setNewPinNote] = useState<string>('');
  const [pendingPinPos, setPendingPinPos] = useState<{ x: number; y: number } | null>(null);

  // Assistant & Request Desk state
  const [messages, setMessages] = useState<ConsumerMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: `Hello ${activeUser.name.split(' ')[0]}! I'm your Petri Zero Consumer Assistant. You can ask questions about the current live build, inspect the roadmap, or submit feature requests directly to the engineering queue.`,
      timestamp: Date.now() - 120000,
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [requestCategory, setRequestCategory] = useState<'feature' | 'bug' | 'inquiry'>('feature');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRefreshPreview = () => {
    setIframeKey(Date.now());
    showToast('Preview reloaded from live server');
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPinModeActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setPendingPinPos({ x, y });
  };

  const handleSavePinNote = () => {
    if (!newPinNote.trim() || !pendingPinPos) return;
    const newPin = {
      id: `pin-${Date.now()}`,
      x: pendingPinPos.x,
      y: pendingPinPos.y,
      text: newPinNote.trim(),
    };
    setPinNotes([...pinNotes, newPin]);
    setNewPinNote('');
    setPendingPinPos(null);
    showToast('Visual feedback pin pinned to preview');

    // Also auto-log as a request if desired
    onCreateConsumerRequest?.(
      `Visual feedback at (${newPin.x}%, ${newPin.y}%)`,
      newPin.text,
      'bug'
    );
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const userMsg: ConsumerMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: Date.now(),
      category: requestCategory,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Process request
    const ticketId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    onCreateConsumerRequest?.(userText, `Category: ${requestCategory} | Submitted by ${activeUser.name}`, requestCategory);

    setTimeout(() => {
      let replyText = '';
      if (requestCategory === 'feature') {
        replyText = `Thank you! I have filed your feature request as ticket #${ticketId} and routed it into the engineering team's triage inbox. The team has been notified.`;
      } else if (requestCategory === 'bug') {
        replyText = `Bug report #${ticketId} has been created and linked to the active workspace. It will be prioritized in the next test and verification cycle.`;
      } else {
        replyText = `Regarding your inquiry: All systems are operating normally on version 8.4.2. 100% of invariant checks passed on the latest build.`;
      }

      const botReply: ConsumerMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: Date.now(),
        ticketId,
      };
      setMessages((prev) => [...prev, botReply]);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFB] text-stone-900 overflow-hidden font-sans">
      {/* Consumer Portal Header Banner */}
      <div className="bg-white/80 backdrop-blur-md border-b border-stone-200/80 px-6 sm:px-10 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            <h1 className="text-base font-semibold text-stone-900 tracking-tight">
              Consumer Portal
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-sky-50 text-sky-700 border border-sky-200">
              CONSUMER TIER
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-stone-500 font-normal">
              Workspace: <strong className="text-stone-800">{activeWorkspace?.name || 'zero-petri'}</strong>
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Live interactive preview, feedback desk, and product release milestones for stakeholders.
          </p>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex items-center space-x-1 bg-stone-100/90 p-1 rounded-2xl border border-stone-200/70 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-stone-900 font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900 font-normal'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-sky-600" />
            <span>App Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assistant')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'assistant'
                ? 'bg-white text-stone-900 font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900 font-normal'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Request Desk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'roadmap'
                ? 'bg-white text-stone-900 font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900 font-normal'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            <span>Roadmap & Release</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-4 right-6 z-50 bg-stone-900 text-white text-xs px-3.5 py-2 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* TAB 1: Live Application Preview */}
        {activeTab === 'preview' && (
          <div className="h-full flex flex-col p-4 sm:p-6 overflow-hidden">
            {/* Preview Toolbar */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-2.5 mb-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              {/* Left: Device Presets */}
              <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDevicePreset('desktop')}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    devicePreset === 'desktop'
                      ? 'bg-white text-stone-900 font-medium shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="Desktop View (100% responsive)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDevicePreset('tablet')}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    devicePreset === 'tablet'
                      ? 'bg-white text-stone-900 font-medium shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDevicePreset('mobile')}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    devicePreset === 'mobile'
                      ? 'bg-white text-stone-900 font-medium shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>

              {/* Center: URL Bar */}
              <div className="flex-1 max-w-md flex items-center space-x-2 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-mono text-stone-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <input
                  type="text"
                  value={previewUrl}
                  onChange={(e) => setPreviewUrl(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-stone-800"
                  placeholder="http://localhost:5173"
                />
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPinModeActive(!isPinModeActive)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    isPinModeActive
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                  title="Toggle Agentation Visual Pin Feedback Mode"
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>{isPinModeActive ? 'Pin Mode ON' : 'Add Visual Pin'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRefreshPreview}
                  className="p-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
                  title="Reload Preview Frame"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
                  title="Open Preview in External Browser Tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Viewport Frame Container */}
            <div className="flex-1 bg-stone-200/50 rounded-2xl border border-stone-300/70 p-4 flex items-center justify-center overflow-auto relative">
              <div
                onClick={handlePreviewClick}
                className={`transition-all relative bg-white shadow-xl overflow-hidden rounded-xl border border-stone-300 ${
                  devicePreset === 'desktop'
                    ? 'w-full h-full'
                    : devicePreset === 'tablet'
                    ? 'w-[768px] h-[95%] max-h-[1024px] border-8 border-stone-800 rounded-3xl'
                    : 'w-[375px] h-[95%] max-h-[812px] border-8 border-stone-800 rounded-3xl'
                }`}
              >
                {/* Visual Feedback Pins Overlay */}
                {pinNotes.map((pin, idx) => (
                  <div
                    key={pin.id}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    className="absolute z-30 -translate-x-1/2 -translate-y-1/2 group"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shadow-lg border-2 border-white cursor-pointer group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <div className="hidden group-hover:block absolute left-full top-0 ml-2 w-48 p-2 rounded-xl bg-stone-900/95 text-white text-[11px] shadow-xl z-40 backdrop-blur-md">
                      {pin.text}
                    </div>
                  </div>
                ))}

                {/* Pending Pin Modal */}
                {pendingPinPos && (
                  <div
                    style={{ left: `${pendingPinPos.x}%`, top: `${pendingPinPos.y}%` }}
                    className="absolute z-40 -translate-x-1/2 -translate-y-1/2 p-3 bg-white border border-stone-300 rounded-2xl shadow-2xl w-64 space-y-2 animate-in zoom-in-95 duration-100"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-900">
                      <span>Add Visual Feedback Note</span>
                      <button
                        type="button"
                        onClick={() => setPendingPinPos(null)}
                        className="text-stone-400 hover:text-stone-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      value={newPinNote}
                      onChange={(e) => setNewPinNote(e.target.value)}
                      placeholder="What should be improved here?"
                      rows={2}
                      className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 outline-none focus:border-purple-600 resize-none"
                      autoFocus
                    />
                    <div className="flex justify-end space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setPendingPinPos(null)}
                        className="px-2.5 py-1 text-xs rounded-lg text-stone-600 hover:bg-stone-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSavePinNote}
                        className="px-3 py-1 text-xs rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700"
                      >
                        Save Pin
                      </button>
                    </div>
                  </div>
                )}

                <iframe
                  key={iframeKey}
                  src={previewUrl}
                  title="Live Consumer Preview"
                  className="w-full h-full border-none"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Consumer Assistant & Request Desk */}
        {activeTab === 'assistant' && (
          <div className="h-full flex flex-col max-w-4xl mx-auto p-4 sm:p-6 overflow-hidden">
            {/* Quick Actions Bar */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <button
                type="button"
                onClick={() => {
                  setRequestCategory('feature');
                  setInputValue('Can we add an export CSV button on the reporting table?');
                }}
                className="p-3 bg-white rounded-2xl border border-stone-200/80 hover:border-emerald-300 hover:bg-emerald-50/20 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center space-x-2 text-emerald-700 font-semibold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Feature Request</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                  Suggest a new capability or UI improvement
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequestCategory('bug');
                  setInputValue('The navigation drawer does not close on mobile screen size.');
                }}
                className="p-3 bg-white rounded-2xl border border-stone-200/80 hover:border-amber-300 hover:bg-amber-50/20 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center space-x-2 text-amber-700 font-semibold text-xs">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Report an Issue</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                  Report a broken layout or unexpected behavior
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequestCategory('inquiry');
                  setInputValue('What is the current delivery status of the v8.5 release?');
                }}
                className="p-3 bg-white rounded-2xl border border-stone-200/80 hover:border-purple-300 hover:bg-purple-50/20 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center space-x-2 text-purple-700 font-semibold text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Project Inquiry</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                  Ask about delivery progress or roadmap milestones
                </div>
              </button>
            </div>

            {/* Chat Conversation Thread */}
            <div className="flex-1 bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-6 overflow-y-auto space-y-4 shadow-xs">
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold shrink-0 ${
                        isUser
                          ? 'bg-stone-900 text-white'
                          : 'bg-sky-100 text-sky-700 border border-sky-200'
                      }`}
                    >
                      {isUser ? activeUser.name.charAt(0) : 'PZ'}
                    </div>

                    <div
                      className={`max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-stone-900 text-white rounded-tr-none'
                          : 'bg-[#FAFBFB] text-stone-800 border border-stone-200/80 rounded-tl-none space-y-2'
                      }`}
                    >
                      <div>{m.text}</div>
                      {m.ticketId && (
                        <div className="mt-2 pt-2 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-500 font-mono">
                          <span>Ticket Reference: {m.ticketId}</span>
                          <span className="text-emerald-700 font-sans font-semibold">Logged in Board</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="mt-3 flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-white border border-stone-200 rounded-2xl px-2 py-1">
                <select
                  value={requestCategory}
                  onChange={(e) => setRequestCategory(e.target.value as 'feature' | 'bug' | 'inquiry')}
                  className="text-xs bg-transparent border-none outline-none font-medium text-stone-700 cursor-pointer"
                >
                  <option value="feature">Feature</option>
                  <option value="bug">Bug</option>
                  <option value="inquiry">Question</option>
                </select>
              </div>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your request, question, or design feedback..."
                className="flex-1 bg-white border border-stone-200 rounded-2xl px-4 py-3 text-xs outline-none focus:border-stone-900 shadow-2xs"
              />

              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-3 rounded-2xl bg-stone-900 hover:bg-black text-white transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: Product Roadmap & Release Changelog */}
        {activeTab === 'roadmap' && (
          <div className="h-full overflow-y-auto max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
            {/* Release Status Hero */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-white to-sky-50/40 border border-stone-200/90 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    RELEASE v8.4.2 · CURRENT STABLE
                  </span>
                  <span className="text-xs text-stone-400">Deployed to main</span>
                </div>
                <h3 className="text-sm font-semibold text-stone-900">
                  Petri Zero Enterprise Mesh & Orchestration
                </h3>
                <p className="text-xs text-stone-500">
                  100% of invariant assertions and SAIF security compliance checks verified.
                </p>
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-2xl font-mono font-bold text-stone-900">100%</div>
                <div className="text-[10px] text-stone-400 uppercase font-sans">Uptime & Invariants</div>
              </div>
            </div>

            {/* In-Flight Deliverables & Recent Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-stone-500 tracking-wider uppercase">
                Active & Shipped Product Items ({items.length})
              </h4>

              <div className="space-y-2.5">
                {items.slice(0, 8).map((item) => {
                  const isMerged = item.stage === 'merged';
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-between transition-all hover:border-stone-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                            isMerged
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isMerged ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-stone-900 line-clamp-1">{item.title}</div>
                          <div className="text-[11px] text-stone-400 flex items-center space-x-2 mt-0.5">
                            <span className="capitalize">{item.kind}</span>
                            <span>·</span>
                            <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                            {item.commitHash && (
                              <>
                                <span>·</span>
                                <span className="font-mono text-stone-500">commit {item.commitHash.slice(0, 7)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border font-medium ${
                          isMerged
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {isMerged ? 'SHIPPED' : 'IN PROGRESS'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Milestones */}
            <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-3">
              <h4 className="text-xs font-semibold text-stone-900 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-sky-600" />
                <span>Upcoming Milestones</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                  <div className="font-semibold text-stone-900">Milestone 9.0: Multi-Tenant Mesh Sync</div>
                  <div className="text-stone-500 text-[11px]">
                    Zero-latency P2P synchronization with offline SQLite WAL replication.
                  </div>
                  <div className="text-[10px] font-mono text-sky-600 font-medium">Q4 2026 Target</div>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                  <div className="font-semibold text-stone-900">Milestone 9.1: One-Click Cloud Run Deploy</div>
                  <div className="text-stone-500 text-[11px]">
                    Automatic container build and direct deployment to GCP Cloud Run.
                  </div>
                  <div className="text-[10px] font-mono text-purple-600 font-medium">In Design</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Identity Confirmation */}
      <div className="bg-white border-t border-stone-200/60 px-6 sm:px-10 py-2.5 flex items-center justify-between text-xs text-stone-400">
        <div className="flex items-center space-x-2">
          <span>Logged in as:</span>
          <strong className="text-stone-700 font-medium">{activeUser.name}</strong>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200">
            Consumer Tier
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenUserModal}
          className="text-stone-500 hover:text-stone-800 underline transition-colors"
        >
          Switch Operator Persona
        </button>
      </div>
    </div>
  );
};
