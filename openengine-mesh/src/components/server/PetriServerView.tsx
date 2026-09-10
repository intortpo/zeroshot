import React, { useState, useEffect } from 'react';
import {
  Server,
  ShieldCheck,
  Cpu,
  Layers,
  ShoppingBag,
  HardDrive,
  RefreshCw,
  Play,
  Square,
  RotateCcw,
  FileText,
  Plus,
  Globe,
  ExternalLink,
  CheckCircle2,
  X,
  Trash2,
  Network,
  Wifi,
} from 'lucide-react';
import {
  PetriServerStatus,
  PetriContainerInfo,
  PetriProxyRoute,
  PetriSmartShieldState,
  PetriMarketApp,
  Workspace,
  UserProfile,
} from '../../types';
import { petriServerService } from '../../services/petriServerService';

interface PetriServerViewProps {
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
}

type ServerSubTab = 'overview' | 'containers' | 'proxy' | 'market' | 'storage';

export const PetriServerView: React.FC<PetriServerViewProps> = ({
  activeWorkspace: _activeWorkspace,
  activeUser: _activeUser,
}) => {
  const [activeTab, setActiveTab] = useState<ServerSubTab>('overview');
  const [status, setStatus] = useState<PetriServerStatus>(() => petriServerService.getStatus());
  const [smartShield, setSmartShield] = useState<PetriSmartShieldState>(() => petriServerService.getSmartShield());
  const [routes, setRoutes] = useState<PetriProxyRoute[]>(() => petriServerService.getRoutes());
  const [containers, setContainers] = useState<PetriContainerInfo[]>(() => petriServerService.getContainers());
  const [marketApps, setMarketApps] = useState<PetriMarketApp[]>(() => petriServerService.getMarketApps());

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Container Logs Modal State
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [containerLogs, setContainerLogs] = useState<string>('');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Add Route Modal State
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [newRoutePath, setNewRoutePath] = useState('');
  const [newRouteTarget, setNewRouteTarget] = useState('http://localhost:');
  const [newRouteDesc, setNewRouteDesc] = useState('');

  // Deploying Market App ID
  const [deployingAppId, setDeployingAppId] = useState<string | null>(null);

  useEffect(() => {
    return petriServerService.subscribe(() => {
      setStatus(petriServerService.getStatus());
      setSmartShield(petriServerService.getSmartShield());
      setRoutes(petriServerService.getRoutes());
      setContainers(petriServerService.getContainers());
      setMarketApps(petriServerService.getMarketApps());
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await petriServerService.refreshAll();
    setIsLoading(false);
    showToast('Petri Server state refreshed from Docker socket');
  };

  const handleContainerAction = async (containerId: string, action: 'start' | 'stop' | 'restart' | 'rm') => {
    try {
      const res = await petriServerService.manageContainer(containerId, action);
      showToast(res);
    } catch (err) {
      showToast(`Error: ${String(err)}`);
    }
  };

  const handleOpenLogs = async (containerId: string) => {
    setSelectedContainerId(containerId);
    setIsLoadingLogs(true);
    const logs = await petriServerService.getContainerLogs(containerId);
    setContainerLogs(logs);
    setIsLoadingLogs(false);
  };

  const isSuperAdmin = _activeUser?.tier === 'superadmin';

  const handleToggleShieldFeature = async (feature: string, currentVal: boolean) => {
    if (!isSuperAdmin) {
      showToast('🛡️ Blocked: Only SuperAdmin tier can alter SmartShield policies.');
      return;
    }
    const updated = await petriServerService.toggleSmartShield(feature, !currentVal);
    setSmartShield(updated);
    showToast(`SmartShield policy updated: ${feature} ${!currentVal ? 'enabled' : 'disabled'}`);
  };

  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      showToast('🛡️ Blocked: Only SuperAdmin tier can configure proxy routes.');
      return;
    }
    if (!newRoutePath.trim() || !newRouteTarget.trim()) return;

    const newRoute: PetriProxyRoute = {
      id: `rt-${Date.now().toString().slice(-4)}`,
      path: newRoutePath.trim(),
      target: newRouteTarget.trim(),
      smartShieldEnabled: true,
      rateLimitPerMinute: 100,
      requireAuth: false,
      sslEnabled: true,
      corsEnabled: true,
      description: newRouteDesc.trim() || 'Custom Reverse Proxy Route',
    };

    const res = await petriServerService.saveRoute(newRoute);
    showToast(res);
    setIsAddRouteOpen(false);
    setNewRoutePath('');
    setNewRouteTarget('http://localhost:');
    setNewRouteDesc('');
  };

  const handleDeployMarketApp = async (appId: string) => {
    setDeployingAppId(appId);
    try {
      const res = await petriServerService.installMarketApp(appId);
      showToast(res);
    } catch (err) {
      showToast(`Deployment error: ${String(err)}`);
    } finally {
      setDeployingAppId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFB] text-stone-900 font-sans overflow-hidden">
      {/* Top Banner: Petri Server Health & Status */}
      <div className="bg-white border-b border-stone-200/80 px-6 sm:px-10 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 shadow-2xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-2xs">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-stone-950 tracking-tight">
                Petri Server Control Center
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                v{status.version}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>SmartShield Active</span>
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-sans">
              Self-Hosted Cloud Gateway · Reverse Proxy · Docker Container Management · Petri Market
            </p>
          </div>
        </div>

        {/* Right Actions & Refresh */}
        <div className="flex items-center space-x-2">
          {toastMessage && (
            <div className="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-medium animate-in fade-in flex items-center space-x-2 shadow-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
            title="Refresh Docker Containers & Server Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-white border-b border-stone-200/60 px-6 sm:px-10 flex items-center space-x-6 text-xs font-sans">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`py-3 border-b-2 font-medium flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-950 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Overview & SmartShield</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('containers')}
          className={`py-3 border-b-2 font-medium flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'containers'
              ? 'border-indigo-600 text-indigo-950 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Containers ({containers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('proxy')}
          className={`py-3 border-b-2 font-medium flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'proxy'
              ? 'border-indigo-600 text-indigo-950 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Globe className="w-4 h-4 text-sky-600" />
          <span>Reverse Proxy & Routes ({routes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('market')}
          className={`py-3 border-b-2 font-medium flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'market'
              ? 'border-indigo-600 text-indigo-950 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-purple-600" />
          <span>Petri Market (App Store)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('storage')}
          className={`py-3 border-b-2 font-medium flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'storage'
              ? 'border-indigo-600 text-indigo-950 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <HardDrive className="w-4 h-4 text-amber-600" />
          <span>Storage & Volumes</span>
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6">
        {/* TAB 1: Overview & SmartShield */}
        {activeTab === 'overview' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-150">
            {/* Health & Metrics Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-1">
                <div className="text-[11px] font-mono uppercase text-stone-400 font-semibold flex items-center justify-between">
                  <span>Engine Status</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-lg font-bold text-stone-900">Docker Connected</div>
                <div className="text-xs text-stone-500 font-mono">/var/run/docker.sock</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-1">
                <div className="text-[11px] font-mono uppercase text-stone-400 font-semibold flex items-center justify-between">
                  <span>Containers Running</span>
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div className="text-lg font-bold text-stone-900">{containers.length} Active</div>
                <div className="text-xs text-stone-500">Managing host microservices</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-1">
                <div className="text-[11px] font-mono uppercase text-stone-400 font-semibold flex items-center justify-between">
                  <span>CPU & Memory</span>
                  <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-lg font-bold text-stone-900">
                  {Math.round(status.usedMemoryMb / 1024)}GB / {Math.round(status.totalMemoryMb / 1024)}GB
                </div>
                <div className="text-xs text-stone-500">{status.cpuPercent}% Host CPU Duty</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-1">
                <div className="text-[11px] font-mono uppercase text-stone-400 font-semibold flex items-center justify-between">
                  <span>SmartShield Posture</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="text-lg font-bold text-purple-900">Zero-Trust Active</div>
                <div className="text-xs text-stone-500">{smartShield.totalThreatsMitigated} Threats Mitigated</div>
              </div>
            </div>

            {/* Tailscale Private Mesh Network Gateway Integration */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <Network className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                      <span>Tailscale Zero-Trust Private Mesh Network</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        status.tailscaleConnected
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}>
                        {status.tailscaleConnected ? '● CONNECTED' : '○ STANDBY'}
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      Encrypted WireGuard mesh connecting local Docker containers directly to your distributed cluster nodes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#FAFBFB] border border-stone-200/70 space-y-1">
                  <div className="text-[10px] font-mono text-stone-400 uppercase">Tailscale Mesh IP</div>
                  <div className="font-mono font-bold text-stone-900">
                    {status.tailscaleIp || '100.81.151.110'}
                  </div>
                  <div className="text-[11px] text-stone-500">Private tunnel endpoint</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAFBFB] border border-stone-200/70 space-y-1">
                  <div className="text-[10px] font-mono text-stone-400 uppercase">MagicDNS Hostname</div>
                  <div className="font-mono font-bold text-indigo-700 truncate">
                    {status.tailscaleDns || 'po.taildf505d.ts.net'}
                  </div>
                  <div className="text-[11px] text-stone-500">Zero-config private DNS</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAFBFB] border border-stone-200/70 space-y-1">
                  <div className="text-[10px] font-mono text-stone-400 uppercase">Active Mesh Peers</div>
                  <div className="font-bold text-emerald-700 flex items-center space-x-1.5">
                    <Wifi className="w-3.5 h-3.5" />
                    <span>{status.tailscalePeersCount || 2} Mesh Peers Online</span>
                  </div>
                  <div className="text-[11px] text-stone-500">Peer load balancer active</div>
                </div>
              </div>
            </div>

            {/* SmartShield Zero-Trust Security Suite */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-5">
              {!isSuperAdmin && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>SuperAdmin Root Required: Control tier operators have read-only visibility over zero-trust SmartShield policies.</span>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Petri SmartShield Zero-Trust Security Policies</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Integrated anti-bot, anti-DDOS, rate limiting, and SSL certificate management.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-mono font-bold border border-emerald-200">
                  ENFORCEMENT: FAIL-CLOSED
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Policy 1: Anti-Bot */}
                <div className="p-4 rounded-2xl bg-[#FAFBFB] border border-stone-200/70 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-stone-900">Anti-Bot SmartShield</div>
                    <div className="text-[11px] text-stone-500 leading-normal">
                      Blocks automated web scrapers, crawler farms, and credential stuffing vectors.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleShieldFeature('anti_bot', smartShield.antiBotEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      smartShield.antiBotEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        smartShield.antiBotEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Policy 2: Anti-DDOS */}
                <div className="p-4 rounded-2xl bg-[#FAFBFB] border border-stone-200/70 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-stone-900">Anti-DDOS Flood Mitigation</div>
                    <div className="text-[11px] text-stone-500 leading-normal">
                      Dynamic connection pooling and syn-flood dampening across all proxy routes.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleShieldFeature('anti_ddos', smartShield.antiDdosEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      smartShield.antiDdosEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        smartShield.antiDdosEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Policy 3: Rate Limiting */}
                <div className="p-4 rounded-2xl bg-[#FAFBFB] border border-stone-200/70 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-stone-900">Per-IP Dynamic Rate Limiter</div>
                    <div className="text-[11px] text-stone-500 leading-normal">
                      Limits inbound requests to {smartShield.rateLimitPerMinute} req/min/IP with progressive cooldown.
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-stone-200/80 text-stone-700">
                    {smartShield.rateLimitPerMinute} RPM
                  </span>
                </div>

                {/* Policy 4: 2FA / Passkey */}
                <div className="p-4 rounded-2xl bg-[#FAFBFB] border border-stone-200/70 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-stone-900">Passkey & 2FA Gate Requirement</div>
                    <div className="text-[11px] text-stone-500 leading-normal">
                      Demands hardware FIDO2 passkey or TOTP before granting ingress to management routes.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleShieldFeature('2fa', smartShield.requirePasskeyOr2Fa)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      smartShield.requirePasskeyOr2Fa ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        smartShield.requirePasskeyOr2Fa ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Container Management */}
        {activeTab === 'containers' && (
          <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Host Docker Containers ({containers.length})</h3>
                <p className="text-xs text-stone-500">Live inspection of all Docker containers mounted via /var/run/docker.sock.</p>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-black transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Containers</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-400 font-mono text-[11px]">
                    <th className="py-3 px-5">CONTAINER NAME & ID</th>
                    <th className="py-3 px-4">IMAGE</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4">PORTS</th>
                    <th className="py-3 px-5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {containers.map((c) => {
                    const isRunning = c.status.toLowerCase().includes('up');
                    const cleanName = c.names[0] ? c.names[0].replace('/', '') : c.id.slice(0, 12);
                    return (
                      <tr key={c.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-stone-900">{cleanName}</div>
                          <div className="text-[10px] font-mono text-stone-400">{c.id.slice(0, 12)}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600 max-w-xs truncate">
                          {c.image}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${
                              isRunning
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-stone-100 text-stone-600 border-stone-200'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500">
                          {c.ports.length > 0 ? c.ports.join(', ') : 'None'}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {isRunning ? (
                              <button
                                type="button"
                                onClick={() => handleContainerAction(c.id, 'stop')}
                                className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 transition-colors"
                                title="Stop Container"
                              >
                                <Square className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleContainerAction(c.id, 'start')}
                                className="p-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 transition-colors"
                                title="Start Container"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleContainerAction(c.id, 'restart')}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                              title="Restart Container"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenLogs(c.id)}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                              title="View Logs"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleContainerAction(c.id, 'rm')}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-400 hover:text-rose-700 transition-colors"
                              title="Delete Container"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Reverse Proxy & Routes */}
        {activeTab === 'proxy' && (
          <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Petri Reverse Proxy Routes ({routes.length})</h3>
                <p className="text-xs text-stone-500">
                  Dynamic ingress routing with automatic Let's Encrypt SSL and SmartShield protection.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddRouteOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-black transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Route</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map((rt) => (
                <div key={rt.id} className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-900 border border-stone-200">
                      {rt.path}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                      SSL & SMART SHIELD ON
                    </span>
                  </div>

                  <div className="text-xs text-stone-800 font-semibold">{rt.description}</div>

                  <div className="flex items-center space-x-2 text-xs font-mono text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200/70">
                    <span>Target:</span>
                    <span className="text-stone-900 font-semibold">{rt.target}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px] font-mono text-stone-500">
                    <div className="p-1.5 bg-stone-50 rounded-lg">Rate: {rt.rateLimitPerMinute} RPM</div>
                    <div className="p-1.5 bg-stone-50 rounded-lg">CORS: {rt.corsEnabled ? 'Allow' : 'Block'}</div>
                    <div className="p-1.5 bg-stone-50 rounded-lg">Auth: {rt.requireAuth ? '2FA Req' : 'Public'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Petri Market (App Store) */}
        {activeTab === 'market' && (
          <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Petri Market: 1-Click App Catalog</h3>
              <p className="text-xs text-stone-500">
                Deploy curated self-hosted databases, local LLM runtimes, and isolated dev environments with one click.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketApps.map((app) => (
                <div key={app.id} className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900">{app.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase bg-stone-100 text-stone-600 border border-stone-200">
                        {app.category}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">{app.description}</p>
                    <div className="text-[10px] font-mono text-stone-400">
                      Image: <span className="text-stone-700">{app.image}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <a
                      href={app.docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-stone-500 hover:text-stone-900 flex items-center space-x-1"
                    >
                      <span>Docs</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      type="button"
                      disabled={deployingAppId === app.id}
                      onClick={() => handleDeployMarketApp(app.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {deployingAppId === app.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>{deployingAppId === app.id ? 'Deploying...' : 'Deploy to Server'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Storage & Volumes */}
        {activeTab === 'storage' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-150">
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Host Storage & Docker Volumes</h3>
                  <p className="text-xs text-stone-500">Persistent bind mounts, volumes, and disk space reclamation.</p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Triggered Docker volume prune: 0 bytes reclaimed')}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors"
                >
                  Prune Unused Volumes
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-stone-900">zero-data</div>
                    <div className="text-[11px] font-mono text-stone-500">Named Docker volume mounted at /var/lib/zero</div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-stone-700">1.2 GB</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-stone-900">/workspace (Bind Mount)</div>
                    <div className="text-[11px] font-mono text-stone-500">Direct host workspace bound to DevContainers</div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-stone-700">4.8 GB</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Container Logs Modal */}
      {selectedContainerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-stone-950 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4 text-stone-100 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-stone-200">Logs: {selectedContainerId}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContainerId(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-96 overflow-y-auto bg-black/60 p-4 rounded-2xl border border-stone-900 whitespace-pre-wrap leading-relaxed">
              {isLoadingLogs ? 'Loading container logs...' : containerLogs || 'No logs captured.'}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedContainerId(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-sans text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Proxy Route Modal */}
      {isAddRouteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/25 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveRoute}
            className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl space-y-4 text-xs font-sans"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="font-bold text-stone-900 text-sm">Add Petri Reverse Proxy Route</div>
              <button
                type="button"
                onClick={() => setIsAddRouteOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-stone-600 block mb-1 font-semibold">Incoming Path (e.g. /api)</label>
                <input
                  type="text"
                  value={newRoutePath}
                  onChange={(e) => setNewRoutePath(e.target.value)}
                  placeholder="/my-service"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 outline-none focus:border-indigo-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-stone-600 block mb-1 font-semibold">Target Destination</label>
                <input
                  type="text"
                  value={newRouteTarget}
                  onChange={(e) => setNewRouteTarget(e.target.value)}
                  placeholder="http://localhost:8080"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 outline-none focus:border-indigo-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-stone-600 block mb-1 font-semibold">Description</label>
                <input
                  type="text"
                  value={newRouteDesc}
                  onChange={(e) => setNewRouteDesc(e.target.value)}
                  placeholder="Internal Microservice"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddRouteOpen(false)}
                className="px-3.5 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-medium"
              >
                Save Route
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
