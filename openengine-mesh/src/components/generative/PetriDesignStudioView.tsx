import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  Code,
  Eye,
  Download,
  Palette,
  Play,
  CheckCircle2,
  FolderOpen,
  RotateCw,
  Plus,
  Copy,
  Trash2,
  Cloud,
  GripVertical,
  HelpCircle,
  Box,
} from 'lucide-react';
import {
  openDesignService,
  PetriWorkdesk,
} from '../../services/openDesignService';
import { RcloneSyncModal } from '../rclone/RcloneSyncModal';
import { NewOpenDesignModal } from './NewOpenDesignModal';

export const PetriDesignStudioView: React.FC = () => {
  const [workdesks, setWorkdesks] = useState<PetriWorkdesk[]>(() =>
    openDesignService.getWorkdesks()
  );
  const [activeWorkdeskId, setActiveWorkdeskId] = useState<string>(
    workdesks[0]?.id || 'proj-saas-landing'
  );
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'tokens'>('preview');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [promptInput, setPromptInput] = useState('');
  const [isAgentExecuting, setIsAgentExecuting] = useState(false);
  const [agentLogs, setAgentLogs] = useState<string[]>([
    '[agy-cli] Petri Design engine loaded: 5 MCP tools available (od_list_projects, od_create_project, od_get_artifact, od_generate_prototype, od_export_asset)',
    '[mcp:petri-design] Ready to synthesize prototypes with DESIGN.md constraints',
  ]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // New Workdesk Dialog State
  const [isNewWorkdeskOpen, setIsNewWorkdeskOpen] = useState(false);

  // Rclone Cloud Sync Modal State
  const [isRcloneOpen, setIsRcloneOpen] = useState(false);

  // Drag and drop & component palette state
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  const [isCanvasDragOver, setIsCanvasDragOver] = useState(false);
  const [showQuickStartGuide, setShowQuickStartGuide] = useState(false);

  const PALETTE_COMPONENTS = [
    {
      id: 'hero',
      name: 'Hero Header',
      category: 'Layout',
      desc: 'Gradient banner with headline and CTA buttons',
      html: `\n<!-- Hero Section -->\n<section class="py-12 px-6 text-center bg-gradient-to-b from-teal-50/80 via-white to-stone-50 rounded-2xl border border-teal-100 my-6 shadow-xs">\n  <span class="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-3 py-1 rounded-full mb-3">AI Pedagogical Engine</span>\n  <h1 class="text-3xl font-extrabold text-stone-900 tracking-tight">Autonomous Mastery & Real-Time Remediation</h1>\n  <p class="mt-3 text-sm text-stone-600 max-w-lg mx-auto">Evaluating longitudinal velocity vectors and quantum calibrated boundaries with 0ms latency.</p>\n  <div class="mt-6 flex items-center justify-center gap-3">\n    <button class="px-5 py-2.5 bg-[#0ABAB5] hover:bg-teal-600 text-white text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer">Launch Assessment</button>\n    <button class="px-5 py-2.5 bg-white border border-stone-200 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50 transition cursor-pointer">View Q-Matrix</button>\n  </div>\n</section>\n`,
    },
    {
      id: 'kpi',
      name: 'Metric Stat Grid',
      category: 'Stats',
      desc: '3-card KPI row with live metrics and trend indicators',
      html: `\n<!-- KPI Stat Grid -->\n<div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">\n  <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs">\n    <div class="text-[10px] font-mono uppercase text-stone-400 font-bold">Active Students</div>\n    <div class="text-2xl font-bold text-stone-900 mt-1">849</div>\n    <div class="text-[11px] text-emerald-600 font-medium mt-0.5">↑ 100% Synced from BBS</div>\n  </div>\n  <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs">\n    <div class="text-[10px] font-mono uppercase text-stone-400 font-bold">Query Latency</div>\n    <div class="text-2xl font-bold text-teal-600 mt-1">0 ms</div>\n    <div class="text-[11px] text-stone-500 font-medium mt-0.5">Pre-computed cache</div>\n  </div>\n  <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs">\n    <div class="text-[10px] font-mono uppercase text-stone-400 font-bold">Data Security</div>\n    <div class="text-2xl font-bold text-indigo-600 mt-1">AES-256</div>\n    <div class="text-[11px] text-indigo-500 font-medium mt-0.5">FERPA Authenticated</div>\n  </div>\n</div>\n`,
    },
    {
      id: 'card',
      name: 'Feature Card',
      category: 'Content',
      desc: 'Clean card with icon badge and descriptive paragraph',
      html: `\n<!-- Feature Card -->\n<div class="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs hover:shadow-sm transition my-4">\n  <div class="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm mb-3">✦</div>\n  <h3 class="text-base font-bold text-stone-900">Quantum Psychometric Scoring</h3>\n  <p class="text-xs text-stone-600 mt-2 leading-relaxed">Continuous latent cognitive state assessment across 16 core curriculum competencies with slippage and guessing calibration.</p>\n</div>\n`,
    },
    {
      id: 'cta',
      name: 'Primary CTA Button',
      category: 'Buttons',
      desc: 'Tiffany teal pill button with hover micro-interaction',
      html: `\n<div class="my-4 text-center">\n  <button class="px-6 py-3 bg-[#0ABAB5] hover:bg-teal-600 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer">Execute Strategic Audit</button>\n</div>\n`,
    },
    {
      id: 'testimonial',
      name: 'Teacher Testimonial',
      category: 'Content',
      desc: 'Quote card with author avatar and institutional title',
      html: `\n<!-- Testimonial -->\n<div class="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-center space-x-3 my-3 shadow-2xs">\n  <div class="w-9 h-9 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">JS</div>\n  <div>\n    <div class="text-xs font-bold text-stone-900">Dr. J. Sadol</div>\n    <div class="text-[10px] text-stone-500">Academic Director · BBS Momentum</div>\n  </div>\n</div>\n`,
    },
  ];

  // Global Ctrl+N shortcut or custom trigger to create new project/workdesk
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNewWorkdeskOpen(true);
      }
    };
    const handleCustomTrigger = () => {
      setIsNewWorkdeskOpen(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('petri:open-new-design-modal', handleCustomTrigger);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('petri:open-new-design-modal', handleCustomTrigger);
    };
  }, []);

  const injectHtmlIntoCode = (snippet: string, name: string) => {
    let updated = editableCode;
    if (updated.includes('</body>')) {
      updated = updated.replace('</body>', `${snippet}\n</body>`);
    } else if (updated.includes('</div>')) {
      const lastDivIndex = updated.lastIndexOf('</div>');
      updated = updated.slice(0, lastDivIndex) + snippet + updated.slice(lastDivIndex);
    } else {
      updated = updated + snippet;
    }
    setEditableCode(updated);
    if (activeWorkdesk && activeArtifact) {
      openDesignService.updateArtifactCode(activeWorkdesk.id, activeArtifact.id, updated);
      setWorkdesks([...openDesignService.getWorkdesks()]);
    }
    setExportSuccessMsg(`Inserted "${name}" into workdesk canvas.`);
    setTimeout(() => setExportSuccessMsg(null), 2500);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCanvasDragOver(true);
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCanvasDragOver(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCanvasDragOver(false);

    // 1. External files dropped (HTML or image)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      if (file.name.endsWith('.html') || file.type === 'text/html') {
        reader.onload = (ev) => {
          const content = ev.target?.result as string;
          setEditableCode(content);
          if (activeWorkdesk && activeArtifact) {
            openDesignService.updateArtifactCode(activeWorkdesk.id, activeArtifact.id, content);
            setWorkdesks([...openDesignService.getWorkdesks()]);
          }
          setExportSuccessMsg(`Imported "${file.name}" onto canvas.`);
          setTimeout(() => setExportSuccessMsg(null), 3000);
        };
        reader.readAsText(file);
        return;
      } else if (file.type.startsWith('image/')) {
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          const imgTag = `\n<div class="my-4 text-center"><img src="${dataUrl}" alt="${file.name}" class="max-w-full rounded-2xl border border-stone-200 shadow-sm mx-auto" /></div>\n`;
          injectHtmlIntoCode(imgTag, file.name);
        };
        reader.readAsDataURL(file);
        return;
      }
    }

    // 2. Component dragged from palette
    const snippet = e.dataTransfer.getData('text/html') || e.dataTransfer.getData('text/plain');
    const componentName = e.dataTransfer.getData('text/component-name') || 'Component';
    if (snippet) {
      injectHtmlIntoCode(snippet, componentName);
    }
  };

  const activeWorkdesk = useMemo(
    () => workdesks.find((w) => w.id === activeWorkdeskId) || workdesks[0],
    [workdesks, activeWorkdeskId]
  );

  const activeArtifact = useMemo(() => {
    if (!activeWorkdesk) return null;
    return (
      activeWorkdesk.artifacts.find((a) => a.id === activeWorkdesk.activeArtifactId) ||
      activeWorkdesk.artifacts[0]
    );
  }, [activeWorkdesk]);

  const [editableCode, setEditableCode] = useState<string>(
    activeArtifact?.code || ''
  );

  // Sync code when active artifact changes
  useEffect(() => {
    if (activeArtifact) {
      setEditableCode(activeArtifact.code);
    }
  }, [activeArtifact]);

  // Sync viewport if workdesk has pre-configured dimensions
  useEffect(() => {
    if (activeWorkdesk?.dimensions) {
      if (activeWorkdesk.dimensions.width <= 480) {
        setViewport('mobile');
      } else if (activeWorkdesk.dimensions.width <= 1024) {
        setViewport('tablet');
      } else {
        setViewport('desktop');
      }
    }
  }, [activeWorkdeskId]);

  const handleApplyCodeEdit = () => {
    if (!activeWorkdesk || !activeArtifact) return;
    openDesignService.updateArtifactCode(activeWorkdesk.id, activeArtifact.id, editableCode);
    setWorkdesks([...openDesignService.getWorkdesks()]);
    setExportSuccessMsg('Workdesk code updated and saved to local memory.');
    setTimeout(() => setExportSuccessMsg(null), 2500);
  };

  const handleDuplicateWorkdesk = () => {
    if (!activeWorkdesk) return;
    const dup = openDesignService.duplicateWorkdesk(activeWorkdesk.id);
    if (dup) {
      const updated = openDesignService.getWorkdesks();
      setWorkdesks(updated);
      setActiveWorkdeskId(dup.id);
      setExportSuccessMsg(`Duplicated workdesk: "${dup.name}"`);
      setTimeout(() => setExportSuccessMsg(null), 3000);
    }
  };

  const handleDeleteWorkdesk = () => {
    if (!activeWorkdesk || workdesks.length <= 1) return;
    const confirm = window.confirm(`Are you sure you want to delete workdesk "${activeWorkdesk.name}"?`);
    if (!confirm) return;

    openDesignService.deleteWorkdesk(activeWorkdesk.id);
    const updated = openDesignService.getWorkdesks();
    setWorkdesks(updated);
    setActiveWorkdeskId(updated[0]?.id || '');
  };

  const handleDispatchAgyTurn = async () => {
    if (!promptInput.trim() || !activeWorkdesk) return;
    const instruction = promptInput.trim();
    setPromptInput('');
    setIsAgentExecuting(true);

    setAgentLogs((prev) => [
      `> [user-intent] ${instruction}`,
      `[agy-cli] Invoking tool: od_generate_prototype for workdesk "${activeWorkdesk.name}"`,
      ...prev,
    ]);

    // Simulated AGY CLI + MCP turn
    setTimeout(() => {
      const enhancedSnippet = activeArtifact?.code.includes('Tailwind')
        ? activeArtifact.code.replace(
            '<button class="px-6 py-3 rounded-2xl bg-stone-900 text-white',
            '<button class="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-xl hover:shadow-teal-500/25'
          )
        : activeArtifact?.code;

      if (enhancedSnippet && activeArtifact) {
        setEditableCode(enhancedSnippet);
        openDesignService.updateArtifactCode(activeWorkdesk.id, activeArtifact.id, enhancedSnippet);
        setWorkdesks([...openDesignService.getWorkdesks()]);
      }

      setAgentLogs((prev) => [
        `[mcp:petri-design] Verified tokens against DESIGN.md`,
        `[agy-cli] Turn finished in 340ms · Canvas updated with responsive styling`,
        ...prev,
      ]);
      setIsAgentExecuting(false);
    }, 850);
  };

  const handleExport = (format: 'html' | 'pdf' | 'pptx' | 'mp4') => {
    if (!activeWorkdesk || !activeArtifact) return;
    const filename = `${activeWorkdesk.name.toLowerCase().replace(/\s+/g, '-')}.${format}`;

    if (format === 'html') {
      const blob = new Blob([activeArtifact.code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }

    setExportSuccessMsg(`Successfully exported ${filename} (${format.toUpperCase()})`);
    setTimeout(() => setExportSuccessMsg(null), 3500);
    setIsExportOpen(false);
  };

  const viewportWidth = {
    desktop: 'w-full max-w-[1280px]',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  }[viewport];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFB] overflow-hidden select-none font-sans">
      {/* Top Header Bar */}
      <header className="px-6 py-3 bg-white/90 backdrop-blur-md border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Brand & Workdesk Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-xs animate-pulse" />
            <span className="font-bold text-sm tracking-tight text-stone-900">
              Petri Design
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
              Workdesks
            </span>
          </div>

          <span className="text-stone-300">/</span>

          {/* Workdesk Selector Dropdown */}
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={activeWorkdeskId}
              onChange={(e) => setActiveWorkdeskId(e.target.value)}
              className="text-xs font-semibold text-stone-800 bg-transparent border-0 focus:ring-0 cursor-pointer pr-6"
            >
              {workdesks.map((desk) => (
                <option key={desk.id} value={desk.id}>
                  {desk.name} ({desk.category.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          {/* Start New Project Button */}
          <button
            onClick={() => setIsNewWorkdeskOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Start a new design project (Ctrl+N)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start New Project</span>
          </button>

          {/* Quick Start Guide Tooltip */}
          <button
            onClick={() => setShowQuickStartGuide(!showQuickStartGuide)}
            className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors cursor-pointer"
            title="How to start and design new projects"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Viewport Mode Switcher */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200/80">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewport === 'desktop' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-700'
            }`}
            title="Desktop Viewport (1280px)"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewport === 'tablet' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-700'
            }`}
            title="Tablet Viewport (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewport === 'mobile' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-700'
            }`}
            title="Mobile Viewport (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions (Rclone Sync, Duplicate, Export) */}
        <div className="flex items-center space-x-2">
          {/* Rclone Sync Button */}
          <button
            onClick={() => setIsRcloneOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Sync this workdesk to Google Drive or other cloud remotes via Rclone"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-600" />
            <span>Sync via Rclone</span>
          </button>

          {/* Workdesk Options */}
          <button
            onClick={handleDuplicateWorkdesk}
            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
            title="Duplicate current workdesk"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {workdesks.length > 1 && (
            <button
              onClick={handleDeleteWorkdesk}
              className="p-1.5 rounded-lg border border-stone-200 text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete current workdesk"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-stone-200 rounded-2xl p-1.5 shadow-xl z-30 space-y-1 animate-in fade-in duration-150">
                <button
                  onClick={() => handleExport('html')}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium rounded-xl hover:bg-stone-50 text-stone-700 flex items-center justify-between cursor-pointer"
                >
                  <span>Standalone HTML</span>
                  <span className="font-mono text-[9px] text-stone-400">.html</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium rounded-xl hover:bg-stone-50 text-stone-700 flex items-center justify-between cursor-pointer"
                >
                  <span>Print Document</span>
                  <span className="font-mono text-[9px] text-stone-400">.pdf</span>
                </button>
                <button
                  onClick={() => handleExport('pptx')}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium rounded-xl hover:bg-stone-50 text-stone-700 flex items-center justify-between cursor-pointer"
                >
                  <span>Slide Deck</span>
                  <span className="font-mono text-[9px] text-stone-400">.pptx</span>
                </button>
                <button
                  onClick={() => handleExport('mp4')}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium rounded-xl hover:bg-stone-50 text-stone-700 flex items-center justify-between cursor-pointer"
                >
                  <span>Motion Video</span>
                  <span className="font-mono text-[9px] text-stone-400">.mp4</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Success Notification Banner */}
      {exportSuccessMsg && (
        <div className="mx-6 mt-3 bg-teal-50 border border-teal-300 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-teal-800 animate-in fade-in duration-200 shadow-2xs shrink-0">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>{exportSuccessMsg}</span>
          </div>
          <button onClick={() => setExportSuccessMsg(null)} className="text-teal-600 hover:text-teal-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Secondary Sub-Bar: Tabs & Canvas Info */}
      <div className="px-6 py-2 bg-white border-b border-stone-100 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('preview')}
            className={`font-semibold flex items-center space-x-1.5 py-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'preview'
                ? 'border-teal-600 text-teal-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Interactive Canvas</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`font-semibold flex items-center space-x-1.5 py-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'border-teal-600 text-teal-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>DOM / Tailwind Source</span>
          </button>

          <button
            onClick={() => setActiveTab('tokens')}
            className={`font-semibold flex items-center space-x-1.5 py-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'tokens'
                ? 'border-teal-600 text-teal-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Design Tokens</span>
          </button>

          <button
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            className={`font-semibold flex items-center space-x-1.5 py-1 border-b-2 transition-colors cursor-pointer ${
              isPaletteOpen
                ? 'border-teal-600 text-teal-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-teal-600" />
            <span>Component Palette</span>
          </button>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-mono text-stone-400">
          <span>Active Workdesk: <strong className="text-stone-700">{activeWorkdesk?.name}</strong></span>
          {activeWorkdesk?.lastSyncedRemote && (
            <span className="text-sky-600 flex items-center space-x-1">
              <Cloud className="w-3 h-3" />
              <span>Synced to {activeWorkdesk.lastSyncedRemote}</span>
            </span>
          )}
        </div>
      </div>

      {/* Quick Start Guide Banner */}
      {showQuickStartGuide && (
        <div className="mx-6 mt-3 p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs space-y-2 animate-in fade-in duration-150 shrink-0 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="font-bold text-teal-900 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              <span>How to Start & Design New Projects in Petri Design</span>
            </div>
            <button
              onClick={() => setShowQuickStartGuide(false)}
              className="text-teal-600 hover:text-teal-900 font-bold text-xs"
            >
              ✕ Close Guide
            </button>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-teal-800 text-[11px] leading-relaxed">
            <li><strong>Create a New Project:</strong> Click <em>"+ Start New Project"</em> in the header (or press <kbd className="px-1.5 py-0.5 bg-white border border-teal-300 rounded font-mono text-[10px]">Ctrl+N</kbd>).</li>
            <li><strong>Choose Archetype:</strong> Select Landing Page, Analytics Dashboard, Slide Deck, Mobile App Mockup, or Blank Canvas. You can also import existing <span className="font-mono">.html</span> or <span className="font-mono">.json</span> files.</li>
            <li><strong>Drag and Drop Components:</strong> Open the <em>Component Palette</em> on the left and drag any UI block (Hero, KPIs, Feature Card, CTA) directly onto the Canvas.</li>
            <li><strong>Sync to Cloud:</strong> Click <em>"Sync via Rclone"</em> to backup your workdesk to Google Drive or other configured remotes.</li>
          </ol>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Draggable Component Palette Drawer */}
        {isPaletteOpen && activeTab === 'preview' && (
          <aside className="w-64 border-r border-stone-200 bg-white flex flex-col shrink-0 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-900">
                <Box className="w-4 h-4 text-teal-600" />
                <span>Drag Components</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">HTML5 / Tailwind</span>
            </div>
            <p className="text-[11px] text-stone-500 leading-tight">
              Drag any element onto the live canvas preview to insert into your prototype.
            </p>

            <div className="space-y-2.5 pt-1">
              {PALETTE_COMPONENTS.map((comp) => (
                <div
                  key={comp.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/html', comp.html);
                    e.dataTransfer.setData('text/plain', comp.html);
                    e.dataTransfer.setData('text/component-name', comp.name);
                  }}
                  className="p-3 bg-stone-50 hover:bg-teal-50/60 border border-stone-200 hover:border-teal-300 rounded-xl cursor-grab active:cursor-grabbing transition-all group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-stone-800 group-hover:text-teal-900">{comp.name}</span>
                    <GripVertical className="w-3.5 h-3.5 text-stone-400 group-hover:text-teal-600" />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1 leading-normal">{comp.desc}</p>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Center Canvas / Code View */}
        <div className="flex-1 flex flex-col items-center p-6 overflow-y-auto bg-stone-100/50">
          {activeTab === 'preview' && (
            <div
              onDragOver={handleCanvasDragOver}
              onDragLeave={handleCanvasDragLeave}
              onDrop={handleCanvasDrop}
              className={`transition-all duration-300 bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col relative ${
                isCanvasDragOver
                  ? 'border-teal-500 ring-4 ring-teal-500/20 shadow-lg'
                  : 'border-stone-200'
              } ${viewportWidth}`}
              style={{ minHeight: '640px' }}
            >
              {/* Fake Browser Window Header */}
              <div className="bg-stone-50 border-b border-stone-200 px-4 py-2.5 flex items-center justify-between text-xs text-stone-400 font-mono">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="px-3 py-1 bg-white border border-stone-200 rounded-lg text-[10px] text-stone-500 truncate max-w-xs">
                  https://petri-design.internal/{activeWorkdesk?.id}
                </div>
                <div className="text-[10px]">{viewport}</div>
              </div>

              {/* Rendered Canvas iframe */}
              <div className="flex-1 bg-white relative">
                <iframe
                  title="Petri Design Live Preview"
                  srcDoc={editableCode}
                  className="w-full h-full min-h-[600px] border-0"
                  sandbox="allow-scripts allow-same-origin"
                />

                {/* Drop Cue Overlay */}
                {isCanvasDragOver && (
                  <div className="absolute inset-0 bg-teal-900/10 backdrop-blur-2xs border-2 border-dashed border-teal-500 flex flex-col items-center justify-center pointer-events-none z-30">
                    <Sparkles className="w-8 h-8 text-teal-600 animate-bounce" />
                    <div className="text-sm font-bold text-teal-900 mt-2">Drop to insert into canvas</div>
                    <div className="text-xs text-teal-700">Supports Component Snippets, HTML files, and Images</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="w-full max-w-4xl bg-stone-900 text-stone-100 rounded-2xl shadow-lg border border-stone-800 p-4 font-mono text-xs flex flex-col space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-stone-400 text-[11px]">
                <span>{activeArtifact?.name || 'index.html'}</span>
                <button
                  onClick={handleApplyCodeEdit}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Apply Changes to Canvas
                </button>
              </div>
              <textarea
                value={editableCode}
                onChange={(e) => setEditableCode(e.target.value)}
                rows={24}
                className="w-full bg-transparent text-stone-200 border-0 focus:ring-0 font-mono text-xs leading-relaxed resize-y"
                spellCheck={false}
              />
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="w-full max-w-4xl bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Petri Design Token System</h3>
                <p className="text-xs text-stone-500">Autonomous design rules enforced across all generated prototypes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-stone-400">Palette Tokens</span>
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded bg-[#0ABAB5] border border-stone-300 shadow-xs" />
                    <span>Primary (#0ABAB5 · Tiffany Teal)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded bg-[#4F46E5] border border-stone-300 shadow-xs" />
                    <span>Secondary (#4F46E5 · Indigo)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded bg-[#FAFBFB] border border-stone-300 shadow-xs" />
                    <span>Background (#FAFBFB · Soft Linen)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-stone-400">Typography & Radii</span>
                  <div><strong>Font:</strong> Inter, system-ui, sans-serif</div>
                  <div><strong>Heading Scale:</strong> 1.25 Modular Multiplier</div>
                  <div><strong>Card Radius:</strong> 16px - 24px Smooth Curvature</div>
                  <div><strong>Glass Blur:</strong> 16px Frosted Acrylic (85% Opacity)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: AGY CLI & MCP Agent Director */}
        <aside className="w-84 border-l border-stone-200 bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span className="font-bold text-xs text-stone-900">AGY Design Agent</span>
            </div>
            <span className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-teal-50 text-teal-700 border border-teal-200">
              od_mcp
            </span>
          </div>

          {/* Natural Language Instruction Bar */}
          <div className="p-4 border-b border-stone-100 space-y-2">
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleDispatchAgyTurn()}
              placeholder="e.g. Add a dark glassmorphic metric card showing attendance velocity..."
              rows={3}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={handleDispatchAgyTurn}
              disabled={isAgentExecuting || !promptInput.trim()}
              className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isAgentExecuting ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing UI...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Synthesize with AGY</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Ideas */}
          <div className="p-4 border-b border-stone-100 space-y-1.5 text-[11px] text-stone-500">
            <span className="font-mono text-[10px] text-stone-400 uppercase font-semibold">Quick Directives:</span>
            <button
              onClick={() => setPromptInput('Make the primary call to action a gradient button with soft teal shadow')}
              className="w-full text-left p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors"
            >
              "Add soft teal gradient CTA"
            </button>
            <button
              onClick={() => setPromptInput('Inject a 3-column responsive card grid with glassmorphism for student metrics')}
              className="w-full text-left p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors"
            >
              "Insert 3-column metric cards"
            </button>
          </div>

          {/* Terminal Logs */}
          <div className="flex-1 p-4 bg-stone-900 text-stone-300 font-mono text-[10px] overflow-y-auto space-y-1">
            <div className="text-stone-500 border-b border-stone-800 pb-1 mb-2">AGY CLI Stream</div>
            {agentLogs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* New Open Design Studio Modal */}
      <NewOpenDesignModal
        isOpen={isNewWorkdeskOpen}
        onClose={() => setIsNewWorkdeskOpen(false)}
        onCreated={(created) => {
          const updated = openDesignService.getWorkdesks();
          setWorkdesks(updated);
          setActiveWorkdeskId(created.id);
          setActiveTab('preview');
          setExportSuccessMsg(`Started new Open Design workdesk: "${created.name}"`);
          setTimeout(() => setExportSuccessMsg(null), 3000);
        }}
      />

      {/* Rclone Multi-Cloud Sync Modal */}
      <RcloneSyncModal
        isOpen={isRcloneOpen}
        onClose={() => setIsRcloneOpen(false)}
        workdesk={activeWorkdesk}
        onSyncComplete={(res) => {
          if (res.success && activeWorkdesk) {
            openDesignService.markWorkdeskSynced(activeWorkdesk.id, res.destination.split(':')[0]);
            setWorkdesks([...openDesignService.getWorkdesks()]);
            setExportSuccessMsg(`Successfully synced to ${res.destination}`);
            setTimeout(() => setExportSuccessMsg(null), 3500);
          }
        }}
      />
    </div>
  );
};

export const OpenDesignStudioView = PetriDesignStudioView;
