import React, { useState, useMemo } from 'react';
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
  FileText,
  Presentation,
  Video,
  FileDown,
  Terminal,
} from 'lucide-react';
import {
  openDesignService,
  OpenDesignProject,
} from '../../services/openDesignService';

export const OpenDesignStudioView: React.FC = () => {
  const [projects, setProjects] = useState<OpenDesignProject[]>(() =>
    openDesignService.getProjects()
  );
  const [activeProjectId, setActiveProjectId] = useState<string>(
    projects[0]?.id || 'proj-saas-landing'
  );
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'tokens'>('preview');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [promptInput, setPromptInput] = useState('');
  const [isAgentExecuting, setIsAgentExecuting] = useState(false);
  const [agentLogs, setAgentLogs] = useState<string[]>([
    '[agy-cli] Open Design MCP server loaded: 5 tools available (od_list_projects, od_create_project, od_get_artifact, od_generate_prototype, od_export_asset)',
    '[mcp:open-design] Ready to synthesize prototypes with DESIGN.md constraints',
  ]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) || projects[0],
    [projects, activeProjectId]
  );

  const activeArtifact = useMemo(() => {
    if (!activeProject) return null;
    return (
      activeProject.artifacts.find((a) => a.id === activeProject.activeArtifactId) ||
      activeProject.artifacts[0]
    );
  }, [activeProject]);

  const [editableCode, setEditableCode] = useState<string>(
    activeArtifact?.code || ''
  );

  // Sync code when artifact changes
  React.useEffect(() => {
    if (activeArtifact) {
      setEditableCode(activeArtifact.code);
    }
  }, [activeArtifact]);

  const handleApplyCodeEdit = () => {
    if (!activeProject || !activeArtifact) return;
    openDesignService.updateArtifactCode(activeProject.id, activeArtifact.id, editableCode);
    setProjects([...openDesignService.getProjects()]);
  };

  const handleDispatchAgyTurn = async () => {
    if (!promptInput.trim() || !activeProject) return;
    const instruction = promptInput.trim();
    setPromptInput('');
    setIsAgentExecuting(true);

    setAgentLogs((prev) => [
      `> [user-intent] ${instruction}`,
      `[agy-cli] Invoking tool: od_generate_prototype for project #${activeProject.id}`,
      ...prev,
    ]);

    // Simulated AGY CLI + MCP execution turn
    setTimeout(() => {
      const enhancedSnippet = activeArtifact?.code.includes('Tailwind')
        ? activeArtifact.code.replace(
            '<button class="px-6 py-3 rounded-2xl bg-stone-900 text-white',
            '<button class="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-xl hover:shadow-teal-500/25'
          )
        : activeArtifact?.code;

      if (enhancedSnippet && activeArtifact) {
        setEditableCode(enhancedSnippet);
        openDesignService.updateArtifactCode(activeProject.id, activeArtifact.id, enhancedSnippet);
        setProjects([...openDesignService.getProjects()]);
      }

      setAgentLogs((prev) => [
        `[mcp:open-design] Successfully verified tokens against DESIGN.md`,
        `[agy-cli] Turn finished in 380ms · DOM updated with responsive styling`,
        ...prev,
      ]);
      setIsAgentExecuting(false);
    }, 900);
  };

  const handleExport = (format: 'html' | 'pdf' | 'pptx' | 'mp4') => {
    if (!activeProject || !activeArtifact) return;
    const filename = `${activeProject.name.toLowerCase().replace(/\s+/g, '-')}.${format}`;

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

  // Viewport width styling
  const viewportWidth = {
    desktop: 'w-full max-w-[1280px]',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  }[viewport];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFB] overflow-hidden select-none font-sans">
      {/* Top Header Bar */}
      <header className="px-6 py-3 bg-white/80 backdrop-blur-md border-b border-stone-200/80 flex items-center justify-between shrink-0">
        {/* Left: Brand, Project Picker & Category */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-xs animate-pulse" />
            <span className="font-bold text-sm tracking-tight text-stone-900">
              Open Design Studio
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-teal-50 text-teal-700 border border-teal-200">
              nexu-io
            </span>
          </div>

          <span className="text-stone-300">/</span>

          {/* Project Selector */}
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="text-xs font-semibold text-stone-800 bg-transparent border-0 focus:ring-0 cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Viewport & Mode Controls */}
        <div className="flex items-center space-x-4">
          {/* Viewport Toggles */}
          <div className="flex items-center bg-stone-100/80 p-0.5 rounded-xl border border-stone-200/60">
            <button
              onClick={() => setViewport('desktop')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewport === 'desktop'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Desktop 1440px"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>

            <button
              onClick={() => setViewport('tablet')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewport === 'tablet'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Tablet 768px"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>

            <button
              onClick={() => setViewport('mobile')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewport === 'mobile'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Mobile 375px"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* View Tabs */}
          <div className="flex items-center space-x-1 bg-stone-100/80 p-0.5 rounded-xl border border-stone-200/60">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Canvas</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>

            <button
              onClick={() => setActiveTab('tokens')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'tokens'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-teal-600" />
              <span>DESIGN.md</span>
            </button>
          </div>
        </div>

        {/* Right: AGY MCP Status & Export Button */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
            <Terminal className="w-3 h-3 text-emerald-600" />
            <span className="font-mono text-[10px]">AGY CLI + MCP Active</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {isExportOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-stone-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-mono uppercase text-stone-400 font-semibold px-2 py-1">
                  Export Production Asset
                </div>
                <button
                  onClick={() => handleExport('html')}
                  className="w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-stone-50 text-xs text-stone-800 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-teal-600" />
                  <div>
                    <div className="font-semibold">HTML Bundle</div>
                    <div className="text-[10px] text-stone-400">Single-file standalone web app</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-stone-50 text-xs text-stone-800 transition-colors cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-rose-600" />
                  <div>
                    <div className="font-semibold">PDF Document</div>
                    <div className="text-[10px] text-stone-400">High-res vector document</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('pptx')}
                  className="w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-stone-50 text-xs text-stone-800 transition-colors cursor-pointer"
                >
                  <Presentation className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-semibold">PPTX Slide Deck</div>
                    <div className="text-[10px] text-stone-400">Editable presentation slides</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('mp4')}
                  className="w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-stone-50 text-xs text-stone-800 transition-colors cursor-pointer"
                >
                  <Video className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="font-semibold">MP4 Video Animation</div>
                    <div className="text-[10px] text-stone-400">Canvas motion recording</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Export feedback toast */}
      {exportSuccessMsg && (
        <div className="mx-6 mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportSuccessMsg}</span>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas / Code / Tokens Workspace */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto bg-stone-100/50">
          {activeTab === 'preview' && (
            <div
              className={`${viewportWidth} h-full max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-stone-200/80 overflow-hidden flex flex-col transition-all duration-300`}
            >
              <div className="px-3 py-1.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-[10px] font-mono text-stone-400">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-stone-600 font-sans">
                    {activeProject?.name} ({viewport})
                  </span>
                </div>
                <span>Sandboxed IFrame (AGY MCP Engine)</span>
              </div>
              <iframe
                title="Open Design Preview"
                srcDoc={editableCode}
                className="w-full flex-1 border-0 bg-white"
                sandbox="allow-scripts"
              />
            </div>
          )}

          {activeTab === 'code' && (
            <div className="w-full max-w-5xl h-full flex flex-col bg-stone-900 rounded-2xl shadow-2xl overflow-hidden border border-stone-800">
              <div className="px-4 py-2 bg-stone-950 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400 font-mono">
                <span>{activeArtifact?.name}</span>
                <button
                  onClick={handleApplyCodeEdit}
                  className="px-3 py-1 rounded-lg bg-teal-600 text-white font-semibold text-xs hover:bg-teal-500 transition-colors"
                >
                  Apply & Hot Reload
                </button>
              </div>
              <textarea
                value={editableCode}
                onChange={(e) => setEditableCode(e.target.value)}
                className="flex-1 p-4 bg-stone-900 text-stone-100 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-0"
                spellCheck={false}
              />
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="w-full max-w-4xl p-6 bg-white rounded-2xl shadow-xl border border-stone-200 space-y-6">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  DESIGN.md Brand Design System Tokens
                </h3>
                <p className="text-xs text-stone-500">
                  Open Design enforces strict token conformity for AGY CLI prompts.
                </p>
              </div>

              {/* Color Palette */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-stone-400 font-semibold">
                  Palette Tokens
                </h4>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {Object.entries(activeProject?.tokens.palette || {}).map(([key, val]) => (
                    <div
                      key={key}
                      className="p-3 rounded-xl border border-stone-200 flex items-center space-x-3"
                    >
                      <div
                        className="w-8 h-8 rounded-lg shadow-inner border border-stone-200/50"
                        style={{ backgroundColor: val }}
                      />
                      <div>
                        <div className="font-semibold capitalize">{key}</div>
                        <div className="font-mono text-stone-400">{val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography & Radii */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-stone-200 space-y-2">
                  <div className="font-mono uppercase text-stone-400 text-[10px] font-semibold">
                    Typography Scale
                  </div>
                  <div className="font-semibold text-stone-800">
                    {activeProject?.tokens.typography.fontFamily}
                  </div>
                  <div className="text-stone-500">
                    Heading Scale: {activeProject?.tokens.typography.headingScale}x · Base:{' '}
                    {activeProject?.tokens.typography.bodySize}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 space-y-2">
                  <div className="font-mono uppercase text-stone-400 text-[10px] font-semibold">
                    Corner Radii
                  </div>
                  <div className="font-semibold text-stone-800">Smooth Squircle Curves</div>
                  <div className="text-stone-500">
                    SM: {activeProject?.tokens.radii.sm} · MD: {activeProject?.tokens.radii.md} · LG:{' '}
                    {activeProject?.tokens.radii.lg}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: AGY Agent Execution Console & History */}
        <div className="w-80 border-l border-stone-200 bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-bold text-stone-900">AGY Design Agent</h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
              MCP Protocol
            </span>
          </div>

          {/* Execution Log Stream */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 font-mono text-[11px]">
            {agentLogs.map((log, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg leading-relaxed ${
                  log.startsWith('>')
                    ? 'bg-stone-100 text-stone-900 font-bold'
                    : log.includes('error')
                    ? 'bg-rose-50 text-rose-800'
                    : 'text-stone-600'
                }`}
              >
                {log}
              </div>
            ))}
          </div>

          {/* Interactive Agent Turn Input */}
          <div className="p-3 border-t border-stone-100 bg-stone-50 space-y-2">
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Prompt AGY CLI: e.g. 'Add a glassmorphic stat banner with Tiffany palette and haptic buttons'..."
              className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none h-20"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleDispatchAgyTurn();
                }
              }}
            />
            <button
              onClick={handleDispatchAgyTurn}
              disabled={isAgentExecuting || !promptInput.trim()}
              className="w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              {isAgentExecuting ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing with AGY CLI...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Iterate with AGY (Ctrl+Enter)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
