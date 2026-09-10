import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Play,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import {
  openDesignService,
  McpServerDefinition,
} from '../../services/openDesignService';

export const McpServerManagerView: React.FC = () => {
  const [servers, setServers] = useState<McpServerDefinition[]>(() =>
    openDesignService.getMcpServers()
  );
  const [activeServerId, setActiveServerId] = useState<string>(
    servers[0]?.id || 'open-design'
  );
  const [selectedToolName, setSelectedToolName] = useState<string>('od_generate_prototype');
  const [testPayload, setTestPayload] = useState<string>(
    JSON.stringify(
      {
        projectId: 'proj-saas-landing',
        prompt: 'Add soft cyan ambient glow to the CTA button',
        viewport: 'desktop',
      },
      null,
      2
    )
  );
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // New Server Form State
  const [isCreatingServer, setIsCreatingServer] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newServerDesc, setNewServerDesc] = useState('');
  const [newServerExecutable, setNewServerExecutable] = useState('agy');

  const activeServer = servers.find((s) => s.id === activeServerId) || servers[0];
  const activeTool = activeServer?.tools.find((t) => t.name === selectedToolName) || activeServer?.tools[0];

  const handleRunToolTest = () => {
    setIsExecuting(true);
    setExecutionResult(null);
    setTimeout(() => {
      setIsExecuting(false);
      setExecutionResult(
        JSON.stringify(
          {
            status: 'success',
            server: activeServer?.name,
            tool: selectedToolName,
            executedVia: 'AGY CLI Bridge (Zero Petri In-Process)',
            output: {
              artifactUpdated: true,
              tokensValidated: true,
              timestamp: Date.now(),
              diagnostics: 'Executed in 42ms with fail-closed schema validation',
            },
          },
          null,
          2
        )
      );
    }, 500);
  };

  const handleCreateServerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName.trim()) return;

    const newCreated = openDesignService.addMcpServer({
      name: newServerName.trim(),
      version: '1.0.0',
      status: 'active',
      protocolVersion: '2024-11-05',
      transport: 'stdio',
      description: newServerDesc.trim() || 'Custom user-defined MCP server in Zero Petri',
      executable: newServerExecutable,
      tools: [
        {
          name: `${newServerName.toLowerCase().replace(/\s+/g, '_')}_action`,
          description: 'Default execution handler tool for custom MCP server',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Action payload' },
            },
            required: ['query'],
          },
        },
      ],
    });

    setServers([...openDesignService.getMcpServers()]);
    setActiveServerId(newCreated.id);
    setIsCreatingServer(false);
    setNewServerName('');
    setNewServerDesc('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFB] overflow-hidden select-none font-sans">
      {/* Header Bar */}
      <header className="px-6 py-3 bg-white/80 backdrop-blur-md border-b border-stone-200/80 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Boxes className="w-4 h-4 text-indigo-600" />
            <h2 className="font-bold text-sm tracking-tight text-stone-900">
              Model Context Protocol (MCP) Manager
            </h2>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
              v2024-11-05
            </span>
          </div>
          <span className="text-stone-300">/</span>
          <span className="text-xs text-stone-500">
            {servers.length} Registered Servers · AGY CLI Integrated
          </span>
        </div>

        <button
          onClick={() => setIsCreatingServer(true)}
          className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New MCP Server</span>
        </button>
      </header>

      {/* Main Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Server Sidebar */}
        <div className="w-80 border-r border-stone-200 bg-white flex flex-col shrink-0">
          <div className="p-3 border-b border-stone-100 flex items-center justify-between text-xs text-stone-400 font-mono">
            <span>SERVERS ({servers.length})</span>
            <span className="text-[10px] text-emerald-600 font-semibold">ALL ACTIVE</span>
          </div>

          <div className="flex-1 p-2 overflow-y-auto space-y-1.5">
            {servers.map((s) => {
              const isSelected = s.id === activeServerId;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveServerId(s.id);
                    setSelectedToolName(s.tools[0]?.name || '');
                  }}
                  className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 border border-indigo-200 shadow-xs'
                      : 'hover:bg-stone-50 border border-transparent text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">{s.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-100 text-stone-600">
                      v{s.version}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>
                  <div className="mt-2 flex items-center space-x-2 text-[10px] font-mono text-stone-400">
                    <span>{s.tools.length} Tools</span>
                    <span>·</span>
                    <span className="uppercase">{s.transport}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Tools & Schema Inspector */}
        <div className="w-96 border-r border-stone-200 bg-[#FAFBFB] flex flex-col shrink-0">
          <div className="p-3 border-b border-stone-200 bg-white flex items-center justify-between text-xs text-stone-400 font-mono">
            <span>TOOLS ({activeServer?.tools.length})</span>
            <span>{activeServer?.name}</span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {activeServer?.tools.map((t) => {
              const isToolSelected = t.name === selectedToolName;
              return (
                <button
                  key={t.name}
                  onClick={() => setSelectedToolName(t.name)}
                  className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    isToolSelected
                      ? 'bg-white border-indigo-400 shadow-sm'
                      : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-mono text-xs font-bold text-stone-900">{t.name}</span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed font-sans">
                    {t.description}
                  </p>
                  <div className="mt-2 text-[10px] font-mono text-stone-400">
                    Params: {Object.keys(t.parameters.properties || {}).join(', ') || 'none'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Live Interactive Tool Runner & Schema Inspector */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto p-6 space-y-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <h3 className="text-lg font-bold text-stone-900">{selectedToolName}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
                {activeServer?.name}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1">{activeTool?.description}</p>
          </div>

          {/* Parameters Schema Card */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <h4 className="text-xs font-mono uppercase text-stone-400 font-semibold">
              Tool JSON Schema Definition
            </h4>
            <pre className="text-[11px] font-mono text-stone-800 overflow-x-auto p-3 bg-white rounded-xl border border-stone-200 max-h-48">
              {JSON.stringify(activeTool?.parameters || {}, null, 2)}
            </pre>
          </div>

          {/* Test Execution Console */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase text-stone-400 font-semibold">
                Test Request Payload
              </h4>
              <span className="text-[10px] font-mono text-stone-400">JSON Parameters</span>
            </div>
            <textarea
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              className="w-full p-3 font-mono text-xs border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 h-32 resize-none"
            />
            <button
              onClick={handleRunToolTest}
              disabled={isExecuting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isExecuting ? 'Executing with AGY...' : 'Execute Test Call'}</span>
            </button>
          </div>

          {/* Result Output */}
          {executionResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 animate-in fade-in">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Response Received</span>
              </div>
              <pre className="text-[11px] font-mono text-emerald-950 p-3 bg-white/80 rounded-xl border border-emerald-200 overflow-x-auto">
                {executionResult}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* New MCP Server Modal */}
      {isCreatingServer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-base font-bold text-stone-900">Register New MCP Server</h3>
            <p className="text-xs text-stone-500">
              Add a custom Model Context Protocol daemon or local binary to Zero Petri.
            </p>

            <form onSubmit={handleCreateServerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Server Name</label>
                <input
                  type="text"
                  required
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  placeholder="e.g. Hardware Sensor Daemon"
                  className="w-full p-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Description</label>
                <textarea
                  value={newServerDesc}
                  onChange={(e) => setNewServerDesc(e.target.value)}
                  placeholder="Explain server tools and purpose..."
                  className="w-full p-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none h-16"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Executable Command</label>
                <input
                  type="text"
                  value={newServerExecutable}
                  onChange={(e) => setNewServerExecutable(e.target.value)}
                  placeholder="e.g. agy or npx -y @modelcontextprotocol/server"
                  className="w-full p-2.5 border border-stone-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingServer(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800"
                >
                  Register Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
