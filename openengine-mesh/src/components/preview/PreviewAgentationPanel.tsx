import React, { useState, useRef, useMemo } from 'react';
import {
  Eye,
  X,
  RefreshCw,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  Crosshair,
  Pause,
  Play,
  Copy,
  Send,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AgentationAnnotation, PreviewViewportMode, UserProfile } from '../../types';

interface PreviewAgentationPanelProps {
  initialUrl?: string;
  isOpen: boolean;
  onClose: () => void;
  activeUser?: UserProfile;
  onSendAnnotationsToChat?: (markdown: string, annotations: AgentationAnnotation[]) => void;
}

export const PreviewAgentationPanel: React.FC<PreviewAgentationPanelProps> = ({
  initialUrl = 'http://localhost:5173/',
  isOpen,
  onClose,
  activeUser,
  onSendAnnotationsToChat,
}) => {
  const [url, setUrl] = useState<string>(initialUrl);
  const [inputUrl, setInputUrl] = useState<string>(initialUrl);
  const [viewportMode, setViewportMode] = useState<PreviewViewportMode>('desktop');
  const [isLandscape, setIsLandscape] = useState<boolean>(false);
  const [isAnnotateMode, setIsAnnotateMode] = useState<boolean>(false);
  const [isAnimationsFrozen, setIsAnimationsFrozen] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Annotations list
  const [annotations, setAnnotations] = useState<AgentationAnnotation[]>([]);
  const [pendingPin, setPendingPin] = useState<{
    xPercent: number;
    yPercent: number;
    pixelX: number;
    pixelY: number;
  } | null>(null);
  const [pendingComment, setPendingComment] = useState<string>('');
  const [pendingCategory, setPendingCategory] = useState<'bug' | 'visual' | 'feature' | 'copy'>('visual');
  const [pendingPriority, setPendingPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [pendingSelector, setPendingSelector] = useState<string>('div.app-container');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const iframeContainerRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Reload iframe
  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
    showToast('Reloaded preview');
  };

  // Navigate to new URL
  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let target = inputUrl.trim();
    if (!target) return;
    if (!/^https?:\/\//i.test(target)) {
      target = 'http://' + target;
    }
    setUrl(target);
    setInputUrl(target);
  };

  // Click on Overlay to drop an Agentation Pin
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnnotateMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;
    const xPercent = Number(((pixelX / rect.width) * 100).toFixed(2));
    const yPercent = Number(((pixelY / rect.height) * 100).toFixed(2));

    // Guess realistic selector from position
    let guessedSelector = 'main.app-viewport';
    if (yPercent < 15) guessedSelector = 'header.navigation-bar > div.brand';
    else if (yPercent > 80) guessedSelector = 'footer.status-bar > div.stats';
    else if (xPercent < 25) guessedSelector = 'nav.sidebar-menu > button.nav-item';
    else if (xPercent > 70) guessedSelector = 'aside.inspector-panel > div.drawer';
    else guessedSelector = 'div.kanban-board > section.in-flight';

    setPendingPin({ xPercent, yPercent, pixelX, pixelY });
    setPendingSelector(guessedSelector);
    setPendingComment('');
  };

  // Save the pending annotation
  const handleSaveAnnotation = () => {
    if (!pendingPin || !pendingComment.trim()) return;

    const newAnnotation: AgentationAnnotation = {
      id: `ann-${Date.now()}`,
      pinNumber: annotations.length + 1,
      xPercent: pendingPin.xPercent,
      yPercent: pendingPin.yPercent,
      targetSelector: pendingSelector,
      targetTagName: pendingSelector.split('.')[0] || 'div',
      comment: pendingComment.trim(),
      category: pendingCategory,
      priority: pendingPriority,
      author: activeUser?.name || 'Operator',
      createdAt: Date.now(),
    };

    setAnnotations((prev) => [...prev, newAnnotation]);
    setPendingPin(null);
    setPendingComment('');
    showToast(`Saved Pin #${newAnnotation.pinNumber}`);
  };

  // Delete an annotation
  const handleDeleteAnnotation = (id: string) => {
    setAnnotations((prev) =>
      prev
        .filter((a) => a.id !== id)
        .map((a, idx) => ({ ...a, pinNumber: idx + 1 }))
    );
  };

  // Format annotations as Agentation Markdown
  const formattedAgentationMarkdown = useMemo(() => {
    if (annotations.length === 0) return '';

    return (
      `### 🎯 Agentation Visual UI Feedback (${annotations.length} annotation${annotations.length > 1 ? 's' : ''})\n` +
      `**Target Preview**: \`${url}\` | **Viewport**: \`${viewportMode} (${isLandscape ? 'Landscape' : 'Portrait'})\`\n\n` +
      annotations
        .map((a) => {
          return (
            `#### [Pin #${a.pinNumber}] ${a.category.toUpperCase()} (${a.priority} priority)\n` +
            `- **Landmark / Selector**: \`${a.targetSelector}\`\n` +
            `- **Coordinates**: \`x: ${a.xPercent}%, y: ${a.yPercent}%\`\n` +
            `- **Feedback Note**: "${a.comment}"\n` +
            `- **Author**: ${a.author}\n`
          );
        })
        .join('\n') +
      `\n*Generated by Agentation Visual Feedback Engine*`
    );
  }, [annotations, url, viewportMode, isLandscape]);

  // Copy Markdown to Clipboard
  const handleCopyMarkdown = () => {
    if (!formattedAgentationMarkdown) return;
    navigator.clipboard.writeText(formattedAgentationMarkdown);
    showToast('Copied Agentation markdown to clipboard');
  };

  // Send Annotations to Chat
  const handleSendToChat = () => {
    if (!formattedAgentationMarkdown || !onSendAnnotationsToChat) return;
    onSendAnnotationsToChat(formattedAgentationMarkdown, annotations);
    showToast('Sent annotations directly to Chat & Agent!');
  };

  if (!isOpen) return null;

  // Viewport dimensions
  let viewportWidthClass = 'w-full';
  let viewportHeightClass = 'h-full';
  if (viewportMode === 'tablet') {
    viewportWidthClass = isLandscape ? 'w-[1024px]' : 'w-[768px]';
    viewportHeightClass = isLandscape ? 'h-[768px]' : 'h-[1024px]';
  } else if (viewportMode === 'mobile') {
    viewportWidthClass = isLandscape ? 'w-[667px]' : 'w-[375px]';
    viewportHeightClass = isLandscape ? 'h-[375px]' : 'h-[667px]';
  }

  return (
    <aside className="w-full lg:w-[580px] xl:w-[680px] h-full flex flex-col bg-white border-l border-stone-200/90 shadow-2xl z-30 font-sans overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Top Header: URL Bar & Viewport Controls */}
      <div className="px-4 py-3 bg-stone-50/90 border-b border-stone-200 flex flex-col space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Eye className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-stone-900">Live Preview</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                Agentation
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Viewport Toggles */}
            <div className="flex items-center bg-stone-200/70 p-0.5 rounded-lg text-stone-600">
              <button
                type="button"
                onClick={() => setViewportMode('desktop')}
                className={`p-1 rounded-md transition-colors ${
                  viewportMode === 'desktop'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'hover:text-stone-900'
                }`}
                title="Desktop (100%)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('tablet')}
                className={`p-1 rounded-md transition-colors ${
                  viewportMode === 'tablet'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'hover:text-stone-900'
                }`}
                title="Tablet (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('mobile')}
                className={`p-1 rounded-md transition-colors ${
                  viewportMode === 'mobile'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'hover:text-stone-900'
                }`}
                title="Mobile (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {viewportMode !== 'desktop' && (
              <button
                type="button"
                onClick={() => setIsLandscape(!isLandscape)}
                className="p-1 rounded-lg text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-colors"
                title="Rotate Orientation"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleReload}
              className="p-1 rounded-lg text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-colors"
              title="Reload Frame"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-lg text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-colors"
              title="Open in External Browser"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:bg-stone-200 hover:text-stone-800 transition-colors"
              title="Close Preview Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Address Input Form */}
        <form onSubmit={handleNavigate} className="flex items-center space-x-1.5">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="http://localhost:5173/"
            className="flex-1 px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-xs font-mono text-stone-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-medium transition-colors"
          >
            Go
          </button>
        </form>
      </div>

      {/* Agentation Toolbar Ribbon */}
      <div className="px-4 py-2 bg-indigo-50/50 border-b border-indigo-100/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          {/* Annotate / Inspect Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsAnnotateMode(!isAnnotateMode);
              if (!isAnnotateMode) {
                showToast('Agentation Inspect Mode Active: Click anywhere to drop a pin');
              }
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              isAnnotateMode
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-indigo-100/60 text-indigo-900 border border-indigo-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{isAnnotateMode ? 'Annotating (Click UI)' : 'Inspect & Annotate'}</span>
          </button>

          {/* Freeze Animations Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsAnimationsFrozen(!isAnimationsFrozen);
              showToast(isAnimationsFrozen ? 'Resumed animations' : 'Frozen animations');
            }}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg border text-xs transition-colors ${
              isAnimationsFrozen
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-medium'
                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
            title="Freeze CSS Transitions & Animations"
          >
            {isAnimationsFrozen ? (
              <>
                <Play className="w-3 h-3 text-amber-700 fill-current" />
                <span>Frozen</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-stone-500" />
                <span>Freeze</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons: Pins Count & Dispatch */}
        <div className="flex items-center space-x-1.5">
          {annotations.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 font-mono text-[11px] font-semibold hover:bg-stone-50 transition-colors flex items-center space-x-1"
              >
                <span>{annotations.length} pins</span>
                {isDrawerOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>

              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
                title="Copy Agentation Markdown"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              {onSendAnnotationsToChat && (
                <button
                  type="button"
                  onClick={handleSendToChat}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs transition-all shadow-2xs"
                  title="Send Annotations to Chat"
                >
                  <Send className="w-3 h-3 text-[#0ABAB5]" />
                  <span>Send to Agent</span>
                </button>
              )}
            </>
          )}

          {toastMessage && (
            <span className="text-[11px] text-indigo-700 font-medium animate-in fade-in truncate max-w-[140px]">
              {toastMessage}
            </span>
          )}
        </div>
      </div>

      {/* Main Preview Container with Viewport Centering & Agentation Overlay */}
      <div className="flex-1 overflow-auto bg-stone-100 p-4 flex items-center justify-center relative">
        <div
          ref={iframeContainerRef}
          className={`relative bg-white rounded-xl shadow-lg border border-stone-300/80 overflow-hidden transition-all duration-300 ${viewportWidthClass} ${viewportHeightClass}`}
          style={{
            maxHeight: viewportMode === 'desktop' ? '100%' : undefined,
          }}
        >
          {/* Live Application Iframe */}
          <iframe
            key={iframeKey}
            src={url}
            title="Agentation Project Live Preview"
            className="w-full h-full border-0 bg-white"
            style={{
              filter: isAnimationsFrozen ? 'grayscale(15%)' : undefined,
            }}
          />

          {/* Agentation Click-and-Pin Overlay */}
          <div
            onClick={handleOverlayClick}
            className={`absolute inset-0 z-10 transition-colors ${
              isAnnotateMode
                ? 'cursor-crosshair bg-indigo-500/5 hover:bg-indigo-500/10'
                : 'pointer-events-none'
            }`}
          >
            {/* Render Dropped Pins */}
            {annotations.map((ann) => (
              <div
                key={ann.id}
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group"
                style={{
                  left: `${ann.xPercent}%`,
                  top: `${ann.yPercent}%`,
                }}
              >
                {/* Pin Circle */}
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-md ring-2 ring-white border border-indigo-700 group-hover:scale-110 transition-transform">
                  {ann.pinNumber}
                </div>

                {/* Tooltip on Hover */}
                <div className="absolute left-1/2 -translate-x-1/2 top-7 hidden group-hover:block w-48 p-2 rounded-xl bg-stone-900 text-white text-[10px] shadow-xl z-30 font-sans">
                  <div className="flex items-center justify-between font-mono text-stone-400 pb-1 border-b border-stone-800">
                    <span>Pin #{ann.pinNumber}</span>
                    <span className="capitalize text-indigo-400">{ann.category}</span>
                  </div>
                  <p className="mt-1 text-stone-200">{ann.comment}</p>
                  <div className="mt-1 text-[9px] font-mono text-stone-400 truncate">
                    {ann.targetSelector}
                  </div>
                </div>
              </div>
            ))}

            {/* Pending Pin Marker & Input Popover */}
            {pendingPin && (
              <div
                className="absolute z-20 pointer-events-auto"
                style={{
                  left: `${pendingPin.xPercent}%`,
                  top: `${pendingPin.yPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Pin Head */}
                <div className="w-6 h-6 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-lg ring-2 ring-white animate-bounce">
                  +
                </div>

                {/* Annotation Input Popover Card */}
                <div className="absolute left-1/2 -translate-x-1/2 top-8 w-64 p-3 rounded-2xl bg-white border border-stone-200 shadow-2xl z-30 text-xs font-sans space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                    <span className="font-bold text-stone-900 text-[11px]">
                      Add Visual Annotation
                    </span>
                    <button
                      type="button"
                      onClick={() => setPendingPin(null)}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Selector Preview */}
                  <div className="font-mono text-[10px] text-stone-500 bg-stone-50 p-1.5 rounded-lg truncate border border-stone-200">
                    {pendingSelector}
                  </div>

                  {/* Comment Input */}
                  <textarea
                    autoFocus
                    rows={2}
                    value={pendingComment}
                    onChange={(e) => setPendingComment(e.target.value)}
                    placeholder="Describe UI defect, change, or prompt note..."
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                  />

                  {/* Category & Priority Selectors */}
                  <div className="flex items-center justify-between text-[10px]">
                    <select
                      value={pendingCategory}
                      onChange={(e) => setPendingCategory(e.target.value as any)}
                      className="px-2 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-700"
                    >
                      <option value="visual">Visual Polish</option>
                      <option value="bug">Bug Defect</option>
                      <option value="feature">Feature</option>
                      <option value="copy">Copy Text</option>
                    </select>

                    <select
                      value={pendingPriority}
                      onChange={(e) => setPendingPriority(e.target.value as any)}
                      className="px-2 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 font-medium"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setPendingPin(null)}
                      className="px-2.5 py-1 rounded-lg text-stone-500 hover:bg-stone-100 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!pendingComment.trim()}
                      onClick={handleSaveAnnotation}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors"
                    >
                      Save Pin
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Annotations & Inspector Drawer */}
      {isDrawerOpen && annotations.length > 0 && (
        <div className="bg-stone-50 border-t border-stone-200 p-4 max-h-56 overflow-y-auto space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 text-[11px] uppercase tracking-wider">
              Captured Annotations ({annotations.length})
            </span>
            <button
              type="button"
              onClick={() => setAnnotations([])}
              className="text-stone-400 hover:text-rose-500 text-[10px] flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </div>

          <div className="space-y-2">
            {annotations.map((a) => (
              <div
                key={a.id}
                className="p-2.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs flex items-start justify-between gap-2"
              >
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    {a.pinNumber}
                  </span>
                  <div>
                    <div className="flex items-center space-x-1.5 text-[10px] font-mono text-stone-400">
                      <span className="text-stone-700 font-medium truncate max-w-[180px]">
                        {a.targetSelector}
                      </span>
                      <span>·</span>
                      <span className="capitalize text-indigo-600 font-medium">{a.category}</span>
                    </div>
                    <p className="text-stone-800 text-xs mt-0.5">{a.comment}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteAnnotation(a.id)}
                  className="text-stone-300 hover:text-rose-500 p-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
