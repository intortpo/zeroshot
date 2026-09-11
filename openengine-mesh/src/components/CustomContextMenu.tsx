import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Copy,
  Check,
  Search,
  Code,
  Terminal,
  Sparkles,
  MousePointerClick,
  FileText,
  RotateCw,
  MessageSquare,
  Eye,
  Database,
} from 'lucide-react';
import { PetriViewMode } from '../types';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  selectedText: string;
  targetElement: HTMLElement | null;
  targetText: string;
  isInput: boolean;
  isCodeBlock: boolean;
}

interface CustomContextMenuProps {
  onSelectView?: (view: PetriViewMode) => void;
  currentView?: string;
  onTogglePreview?: () => void;
}

export const CustomContextMenu: React.FC<CustomContextMenuProps> = ({
  onSelectView,
  currentView,
  onTogglePreview,
}) => {
  const [menu, setMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    selectedText: '',
    targetElement: null,
    targetText: '',
    isInput: false,
    isCodeBlock: false,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2000);
  }, []);

  const closeMenu = useCallback(() => {
    setMenu((prev) => (prev.visible ? { ...prev, visible: false } : prev));
  }, []);

  // Global contextmenu event listener
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Don't show custom context menu if holding Shift (allows devtools native context if needed)
      if (e.shiftKey) return;

      e.preventDefault();

      const selection = window.getSelection()?.toString() || '';
      const target = e.target as HTMLElement;

      const isInput =
        target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA';

      const codeParent = target.closest('pre, code, [data-code-block]');
      const isCodeBlock = !!codeParent;

      // Extract contextual text from target or selection
      let targetText = '';
      if (selection.trim()) {
        targetText = selection.trim();
      } else if (isInput && (target as HTMLInputElement).value) {
        targetText = (target as HTMLInputElement).value;
      } else if (codeParent) {
        targetText = codeParent.textContent?.trim() || '';
      } else {
        const cardParent = target.closest('[data-card], .subtle-depth, .subtle-depth-card, article');
        if (cardParent) {
          targetText = cardParent.textContent?.slice(0, 300).trim() || '';
        } else {
          targetText = target.textContent?.slice(0, 200).trim() || '';
        }
      }

      // Safe viewport boundary clamping for menu placement
      const menuWidth = 230;
      const menuHeight = 310;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      let posX = e.clientX;
      let posY = e.clientY;

      if (posX + menuWidth > screenW - 12) {
        posX = screenW - menuWidth - 12;
      }
      if (posY + menuHeight > screenH - 12) {
        posY = screenH - menuHeight - 12;
      }

      setMenu({
        visible: true,
        x: Math.max(12, posX),
        y: Math.max(12, posY),
        selectedText: selection.trim(),
        targetElement: target,
        targetText,
        isInput,
        isCodeBlock,
      });
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    const handleScroll = () => {
      closeMenu();
    };

    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [closeMenu]);

  // Actions
  const handleCopySelection = async () => {
    const textToCopy = menu.selectedText || menu.targetText;
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast(
          menu.selectedText
            ? `Copied ${menu.selectedText.length} characters`
            : 'Copied block text to clipboard'
        );
      } catch {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard');
      }
    }
    closeMenu();
  };

  const handleCopyAllBlock = async () => {
    if (menu.targetText) {
      try {
        await navigator.clipboard.writeText(menu.targetText);
        showToast('Copied full content block');
      } catch {
        showToast('Unable to copy block');
      }
    }
    closeMenu();
  };

  const handleSelectAll = () => {
    if (menu.isInput && menu.targetElement) {
      (menu.targetElement as HTMLInputElement).select();
    } else {
      const range = document.createRange();
      const targetNode = menu.targetElement?.closest('.subtle-depth-card, .subtle-depth, pre, article, [data-card]') || document.body;
      range.selectNodeContents(targetNode);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      showToast('Selected block');
    }
    closeMenu();
  };

  const handleSearchSelection = () => {
    const query = menu.selectedText || menu.targetText.slice(0, 80);
    if (query) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
    closeMenu();
  };

  const handleQuickNavigate = (view: PetriViewMode) => {
    onSelectView?.(view);
    closeMenu();
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-stone-900/90 backdrop-blur-md text-white text-xs font-medium shadow-2xl border border-stone-700/60 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-3.5 h-3.5 text-[#0ABAB5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Context Menu */}
      {menu.visible && (
        <div
          ref={menuRef}
          style={{ top: menu.y, left: menu.x }}
          className="fixed z-[9990] w-60 rounded-2xl bg-white/95 backdrop-blur-2xl border border-stone-200/90 shadow-2xl p-1.5 font-sans text-xs text-stone-800 animate-in fade-in zoom-in-95 duration-100 select-none"
        >
          {/* Header context badge */}
          <div className="px-2.5 py-1.5 mb-1 flex items-center justify-between border-b border-stone-100 text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0ABAB5]" />
              <span>Petri Actions</span>
            </span>
            <span className="font-mono lowercase text-[9px] text-stone-400">
              {currentView || 'desktop'}
            </span>
          </div>

          {/* Item 1: Copy Selected Text */}
          <button
            type="button"
            onClick={handleCopySelection}
            disabled={!menu.selectedText && !menu.targetText}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors ${
              menu.selectedText || menu.targetText
                ? 'hover:bg-stone-100 text-stone-800'
                : 'opacity-40 cursor-not-allowed text-stone-400'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Copy className="w-3.5 h-3.5 text-[#0ABAB5]" />
              <span className="font-medium">
                {menu.selectedText ? 'Copy Selection' : 'Copy Text'}
              </span>
            </div>
            <kbd className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
              Ctrl+C
            </kbd>
          </button>

          {/* Item 2: Copy Block / Code */}
          {menu.isCodeBlock && (
            <button
              type="button"
              onClick={handleCopyAllBlock}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-stone-100 text-stone-800 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Code className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-medium">Copy Code Block</span>
              </div>
            </button>
          )}

          {/* Item 3: Select All */}
          <button
            type="button"
            onClick={handleSelectAll}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-stone-100 text-stone-800 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <MousePointerClick className="w-3.5 h-3.5 text-stone-500" />
              <span className="font-medium">Select All</span>
            </div>
            <kbd className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
              Ctrl+A
            </kbd>
          </button>

          {/* Item 4: Web Search Selection (if text highlighted) */}
          {menu.selectedText && (
            <button
              type="button"
              onClick={handleSearchSelection}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-stone-100 text-stone-800 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Search className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-medium truncate max-w-[140px]">
                  Search "{menu.selectedText.slice(0, 16)}..."
                </span>
              </div>
            </button>
          )}

          {/* Divider */}
          <div className="my-1 border-t border-stone-100" />

          {onTogglePreview && (
            <button
              type="button"
              onClick={() => {
                onTogglePreview();
                closeMenu();
              }}
              className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-indigo-50 text-indigo-900 transition-colors"
            >
              <Eye className="w-3 h-3 text-indigo-600" />
              <span className="text-[11px] font-medium">Toggle Live Preview (Agentation)</span>
            </button>
          )}

          {/* Navigation Shortcuts */}
          <div className="px-2.5 py-1 text-[9px] text-stone-400 font-semibold uppercase tracking-wider">
            Switch View
          </div>

          <button
            type="button"
            onClick={() => handleQuickNavigate('chat')}
            className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-stone-100 text-stone-700 transition-colors"
          >
            <MessageSquare className="w-3 h-3 text-[#0ABAB5]" />
            <span className="text-[11px] font-medium">Chat & Plan Canvas</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickNavigate('federated')}
            className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-stone-100 text-stone-700 transition-colors"
          >
            <Database className="w-3 h-3 text-sky-600" />
            <span className="text-[11px] font-medium">Federated Data (Docs & RAG)</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickNavigate('antigravity')}
            className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-stone-100 text-stone-700 transition-colors"
          >
            <Terminal className="w-3 h-3 text-indigo-600" />
            <span className="text-[11px] font-medium">Antigravity Sessions</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickNavigate('zero')}
            className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-stone-100 text-stone-700 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-[#FF5F1F]" />
            <span className="text-[11px] font-medium">Zero Game Studio</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickNavigate('board')}
            className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-stone-100 text-stone-700 transition-colors"
          >
            <FileText className="w-3 h-3 text-stone-500" />
            <span className="text-[11px] font-medium">Kanban Board</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickNavigate('tui')}
            className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-stone-100 text-stone-700 transition-colors"
          >
            <Terminal className="w-3 h-3 text-emerald-600" />
            <span className="text-[11px] font-medium">Terminal TUI</span>
          </button>

          {/* Divider */}
          <div className="my-1 border-t border-stone-100" />

          {/* Refresh Action */}
          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
            className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-stone-100 text-stone-600 transition-colors"
          >
            <RotateCw className="w-3 h-3 text-stone-400" />
            <span className="text-[11px]">Reload Window</span>
          </button>
        </div>
      )}
    </>
  );
};
