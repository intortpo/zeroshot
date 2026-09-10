import React, { useState, useEffect, useMemo } from 'react';
import {
  Network,
  Wifi,
  Shield,
  Radio,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Power,
  Lock,
  Search,
  Laptop,
  Smartphone,
  Server,
  Globe,
  CheckCircle2,
  X,
} from 'lucide-react';
import { TailscaleNetworkDetails } from '../../types';
import { tailscaleService } from '../../services/tailscaleService';

interface TailscaleMeshPanelProps {
  isSuperAdmin: boolean;
  onToast: (msg: string) => void;
}

export const TailscaleMeshPanel: React.FC<TailscaleMeshPanelProps> = ({
  isSuperAdmin,
  onToast,
}) => {
  const [details, setDetails] = useState<TailscaleNetworkDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [peerFilter, setPeerFilter] = useState<'all' | 'online' | 'exit_nodes'>('all');

  // Exit node form state
  const [selectedExitNode, setSelectedExitNode] = useState<string>('');
  const [allowLan, setAllowLan] = useState<boolean>(true);
  const [isAdvertising, setIsAdvertising] = useState<boolean>(false);
  const [isUpdatingExitNode, setIsUpdatingExitNode] = useState(false);

  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authKeyInput, setAuthKeyInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const res = await tailscaleService.getNetworkDetails();
      setDetails(res);
      setSelectedExitNode(res.activeExitNode || '');
      setAllowLan(res.exitNodeAllowLan ?? true);
      setIsAdvertising(res.selfNode?.advertisedExitNode ?? false);
    } catch (err) {
      onToast('Failed to load Tailscale details: ' + String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    onToast(`📋 Copied ${label} to clipboard: ${text}`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleConnect = async (key?: string) => {
    setIsLoggingIn(true);
    try {
      const res = await tailscaleService.connect(key);
      if (res.success) {
        onToast(res.message);
        setIsLoginModalOpen(false);
        setAuthKeyInput('');
        if (res.authUrl) {
          window.open(res.authUrl, '_blank');
        }
        await fetchDetails();
      } else {
        onToast('❌ ' + res.message);
      }
    } catch (err) {
      onToast('Connection error: ' + String(err));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDisconnect = async () => {
    if (!isSuperAdmin) {
      onToast('🛡️ Blocked: Only SuperAdmin tier can alter Tailscale daemon state.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await tailscaleService.disconnect();
      onToast(res.message);
      await fetchDetails();
    } catch (err) {
      onToast('Disconnection error: ' + String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyExitNode = async (exitNodeToSet?: string) => {
    if (!isSuperAdmin) {
      onToast('🛡️ Blocked: Only SuperAdmin tier can change mesh routing preferences.');
      return;
    }
    const node = exitNodeToSet !== undefined ? exitNodeToSet : selectedExitNode;
    setIsUpdatingExitNode(true);
    try {
      const res = await tailscaleService.setExitNode(node ? node : null, allowLan);
      onToast(res.message);
      await fetchDetails();
    } catch (err) {
      onToast('Exit node update error: ' + String(err));
    } finally {
      setIsUpdatingExitNode(false);
    }
  };

  const handleToggleAdvertise = async () => {
    if (!isSuperAdmin) {
      onToast('🛡️ Blocked: Only SuperAdmin tier can configure exit node advertisement.');
      return;
    }
    const nextVal = !isAdvertising;
    setIsUpdatingExitNode(true);
    try {
      const res = await tailscaleService.setAdvertiseExitNode(nextVal);
      setIsAdvertising(nextVal);
      onToast(res.message);
      await fetchDetails();
    } catch (err) {
      onToast('Error updating exit node advertisement: ' + String(err));
    } finally {
      setIsUpdatingExitNode(false);
    }
  };

  const isConnected = details?.backendState === 'Running';
  const needsLogin = details?.backendState === 'NeedsLogin';

  const exitNodeCandidates = useMemo(() => {
    if (!details) return [];
    return details.peers.filter((p) => p.exitNodeOption || p.isExitNode);
  }, [details]);

  const filteredPeers = useMemo(() => {
    if (!details) return [];
    return details.peers.filter((p) => {
      if (peerFilter === 'online' && !p.online) return false;
      if (peerFilter === 'exit_nodes' && !p.exitNodeOption && !p.isExitNode) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        p.hostName.toLowerCase().includes(q) ||
        p.dnsName.toLowerCase().includes(q) ||
        p.tailscaleIps.some((ip) => ip.includes(q)) ||
        (p.country && p.country.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        p.os.toLowerCase().includes(q)
      );
    });
  }, [details, peerFilter, searchQuery]);

  const getOsIcon = (os: string) => {
    const lower = os.toLowerCase();
    if (lower.includes('android') || lower.includes('ios')) {
      return <Smartphone className="w-4 h-4 text-emerald-600" />;
    }
    if (lower.includes('mac') || lower.includes('darwin')) {
      return <Laptop className="w-4 h-4 text-stone-700" />;
    }
    if (lower.includes('win')) {
      return <Laptop className="w-4 h-4 text-sky-600" />;
    }
    return <Server className="w-4 h-4 text-indigo-600" />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* 1. Hero Connection & Tailnet Status */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 shadow-2xs">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h3 className="text-base font-bold text-stone-900">Tailscale Zero-Trust Private Mesh</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold flex items-center space-x-1 ${
                    isConnected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : needsLogin
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
                    }`}
                  />
                  <span>
                    {isConnected
                      ? 'CONNECTED'
                      : needsLogin
                      ? 'LOGIN REQUIRED'
                      : 'DISCONNECTED / STANDBY'}
                  </span>
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Authenticated WireGuard mesh connecting cluster containers, nodes, and developers across private IP space.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={fetchDetails}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {isConnected ? (
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={isLoading}
                className="px-4 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Connect / Log In</span>
              </button>
            )}
          </div>
        </div>

        {/* Host Identity Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#FAFBFB] border border-stone-200/70 space-y-1">
            <div className="text-[10px] font-mono text-stone-400 uppercase">Host Machine Name</div>
            <div className="font-mono font-bold text-stone-900 truncate">
              {details?.selfNode?.hostName || 'po'}
            </div>
            <div className="text-[11px] text-stone-500">Local mesh identity</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAFBFB] border border-stone-200/70 space-y-1 relative group">
            <div className="text-[10px] font-mono text-stone-400 uppercase">MagicDNS Hostname</div>
            <div className="font-mono font-bold text-indigo-700 truncate flex items-center justify-between">
              <span>{details?.selfNode?.dnsName || 'po.taildf505d.ts.net'}</span>
              <button
                type="button"
                onClick={() =>
                  handleCopy(details?.selfNode?.dnsName || 'po.taildf505d.ts.net', 'MagicDNS')
                }
                className="p-1 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors"
                title="Copy MagicDNS"
              >
                {copiedText === (details?.selfNode?.dnsName || 'po.taildf505d.ts.net') ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="text-[11px] text-stone-500">Zero-config private DNS</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAFBFB] border border-stone-200/70 space-y-1">
            <div className="text-[10px] font-mono text-stone-400 uppercase">Tailscale IPv4</div>
            <div className="font-mono font-bold text-stone-900 flex items-center justify-between">
              <span>{details?.selfNode?.tailscaleIps?.[0] || '100.81.151.110'}</span>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    details?.selfNode?.tailscaleIps?.[0] || '100.81.151.110',
                    'Tailscale IP'
                  )
                }
                className="p-1 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors"
                title="Copy IP"
              >
                {copiedText === (details?.selfNode?.tailscaleIps?.[0] || '100.81.151.110') ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="text-[11px] text-stone-500">Carrier-grade CGNAT mesh IP</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAFBFB] border border-stone-200/70 space-y-1">
            <div className="text-[10px] font-mono text-stone-400 uppercase">Total Mesh Peers</div>
            <div className="font-bold text-emerald-700 flex items-center space-x-1.5">
              <Wifi className="w-3.5 h-3.5" />
              <span>{details?.peers?.length || 0} Registered Peers</span>
            </div>
            <div className="text-[11px] text-stone-500">
              {details?.peers?.filter((p) => p.online).length || 0} online now
            </div>
          </div>
        </div>
      </div>

      {/* 2. Exit Node Routing & Advertisement Control Card */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Exit Node Orchestrator</h3>
              <p className="text-xs text-stone-500">
                Route all outbound internet traffic through another secure mesh gateway or advertise this host as an exit node.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {details?.activeExitNode ? (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Gateway: {details.activeExitNode}</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 font-mono text-xs">
                Direct Routing (No Exit Node)
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Section A: Use an Exit Node */}
          <div className="p-4 rounded-2xl bg-[#FAFBFB] border border-stone-200/70 space-y-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-stone-900 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>Route Internet Traffic via Exit Node</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Select a trusted peer or Mullvad VPN gateway node to encrypt and proxy all machine internet traffic.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">
                  Selected Gateway Node
                </label>
                <select
                  value={selectedExitNode}
                  onChange={(e) => setSelectedExitNode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">None (Direct Internet Access)</option>
                  {exitNodeCandidates.map((cand) => (
                    <option key={cand.id} value={cand.hostName}>
                      {cand.hostName} {cand.country ? `(${cand.country}, ${cand.city || ''})` : ''} - {cand.tailscaleIps[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-stone-800">Allow Local LAN Access</div>
                  <div className="text-[10px] text-stone-400">
                    Preserve direct access to local subnet devices (printers, router)
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={allowLan}
                  onChange={(e) => setAllowLan(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-stone-300 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleApplyExitNode()}
                  disabled={isUpdatingExitNode}
                  className="flex-1 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{selectedExitNode ? 'Set Active Exit Node' : 'Apply Direct Routing'}</span>
                </button>

                {details?.activeExitNode && (
                  <button
                    type="button"
                    onClick={() => handleApplyExitNode('')}
                    disabled={isUpdatingExitNode}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Clear Gateway
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section B: Advertise This Host as an Exit Node */}
          <div className="p-4 rounded-2xl bg-[#FAFBFB] border border-stone-200/70 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-xs font-bold text-stone-900 flex items-center space-x-1.5">
                <Radio className="w-3.5 h-3.5 text-purple-600" />
                <span>Advertise Host as Exit Node</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                When enabled, other devices in your Tailscale mesh (e.g. your phone, travel laptop, or remote devcontainer) can route their internet traffic through this Petri Zero server.
              </p>
              <div className="p-2.5 rounded-xl bg-stone-100/80 border border-stone-200/70 text-[10px] text-stone-600 space-y-1">
                <div className="font-semibold text-stone-800">CLI Equivalent:</div>
                <code className="font-mono text-indigo-700 block">
                  tailscale set --advertise-exit-node={isAdvertising ? 'false' : 'true'}
                </code>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-stone-900">
                  {isAdvertising ? 'Broadcasting as Exit Node' : 'Exit Node Disabled'}
                </div>
                <div className="text-[10px] text-stone-400">
                  Requires admin approval in Tailscale console if enforced
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleAdvertise}
                disabled={isUpdatingExitNode}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isAdvertising ? 'bg-purple-600' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    isAdvertising ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Peer Node Explorer */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
              <span>Peer Node Explorer</span>
              <span className="text-xs font-mono text-stone-400 font-normal">
                ({filteredPeers.length} of {details?.peers.length || 0} nodes)
              </span>
            </h3>
            <p className="text-xs text-stone-500">
              Live inventory of cluster machines, developer laptops, and Mullvad gateways registered in this tailnet.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Filter buttons */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setPeerFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  peerFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                All ({details?.peers.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setPeerFilter('online')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  peerFilter === 'online'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Online ({details?.peers.filter((p) => p.online).length || 0})
              </button>
              <button
                type="button"
                onClick={() => setPeerFilter('exit_nodes')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  peerFilter === 'exit_nodes'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Exit Nodes ({exitNodeCandidates.length})
              </button>
            </div>
          </div>
        </div>

        {/* Search input bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search peers by hostname, IP address, OS, country, or tag..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAFBFB] border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Peer Table (Desktop) */}
        <div className="hidden sm:block border border-stone-200/80 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-400 font-mono text-[11px]">
                <th className="py-3 px-4">DEVICE & HOSTNAME</th>
                <th className="py-3 px-3">TAILSCALE IP</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3">ROLES & CAPABILITIES</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredPeers.map((p) => {
                const isActive = details?.activeExitNode === p.hostName;
                return (
                  <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                          {getOsIcon(p.os)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-stone-900 flex items-center space-x-1.5 truncate">
                            <span>{p.hostName}</span>
                            {p.country && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-stone-100 text-stone-600 border border-stone-200">
                                {p.country}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-stone-400 truncate">
                            {p.dnsName || `${p.hostName}.tailnet`}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-1 font-mono font-bold text-stone-800">
                        <span>{p.tailscaleIps[0]}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(p.tailscaleIps[0], p.hostName)}
                          className="p-1 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors"
                          title="Copy IP"
                        >
                          {copiedText === p.tailscaleIps[0] ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      {p.tailscaleIps[1] && (
                        <div className="text-[10px] font-mono text-stone-400 truncate max-w-[140px]">
                          {p.tailscaleIps[1]}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            p.online ? 'bg-emerald-500' : 'bg-stone-300'
                          }`}
                        />
                        <span className="font-medium text-stone-700">
                          {p.online ? 'Online' : 'Idle'}
                        </span>
                      </div>
                      {p.lastSeen && (
                        <div className="text-[10px] text-stone-400">{p.lastSeen}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ACTIVE GATEWAY</span>
                          </span>
                        )}

                        {p.exitNodeOption && !isActive && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            Exit Node Ready
                          </span>
                        )}

                        {p.tags && p.tags.includes('tag:mullvad-exit-node') && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200">
                            Mullvad VPN
                          </span>
                        )}

                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-stone-500 bg-stone-100">
                          {p.os}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {p.exitNodeOption && (
                          <button
                            type="button"
                            onClick={() => handleApplyExitNode(isActive ? '' : p.hostName)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs ${
                              isActive
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                : 'bg-stone-900 text-white hover:bg-black'
                            }`}
                          >
                            {isActive ? 'Disconnect' : 'Use Exit Node'}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopy(p.tailscaleIps[0], p.hostName)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                          title="Copy Tailscale IP"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Peer Cards (Mobile Touch Ergonomics) */}
        <div className="sm:hidden space-y-2.5">
          {filteredPeers.map((p) => {
            const isActive = details?.activeExitNode === p.hostName;
            return (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                      {getOsIcon(p.os)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-stone-900 flex items-center space-x-1.5 truncate">
                        <span>{p.hostName}</span>
                        {p.country && (
                          <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-stone-100 text-stone-600 border border-stone-200">
                            {p.country}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-stone-400 truncate">
                        {p.dnsName || `${p.hostName}.tailnet`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        p.online ? 'bg-emerald-500' : 'bg-stone-300'
                      }`}
                    />
                    <span className="text-[11px] font-medium text-stone-600">
                      {p.online ? 'Online' : 'Idle'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <div className="flex items-center space-x-1 font-mono text-xs font-bold text-stone-800">
                    <span>{p.tailscaleIps[0]}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(p.tailscaleIps[0], p.hostName)}
                      className="p-1 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors"
                      title="Copy IP"
                    >
                      {copiedText === p.tailscaleIps[0] ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {p.exitNodeOption && (
                      <button
                        type="button"
                        onClick={() => handleApplyExitNode(isActive ? '' : p.hostName)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs ${
                          isActive
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            : 'bg-stone-900 text-white hover:bg-black'
                        }`}
                      >
                        {isActive ? 'Disconnect' : 'Exit Node'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Login & Authentication Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900">Authenticate Tailscale Mesh</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Option A: Interactive Web Browser Login */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-2">
                <div className="font-bold text-indigo-950 flex items-center space-x-1.5">
                  <ExternalLink className="w-4 h-4 text-indigo-600" />
                  <span>Option 1: Web Browser SSO</span>
                </div>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Opens the official Tailscale single sign-on authorization portal in your default browser to authorize this node.
                </p>
                <button
                  type="button"
                  onClick={() => handleConnect()}
                  disabled={isLoggingIn}
                  className="w-full mt-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors cursor-pointer shadow-2xs flex items-center justify-center space-x-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Browser Login Flow</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-3 text-[10px] font-mono uppercase text-stone-400">
                  OR
                </span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>

              {/* Option B: Pre-authenticated Auth Key */}
              <div className="space-y-2">
                <label className="font-bold text-stone-900 block">
                  Option 2: Tailscale Auth Key (tskey-auth-...)
                </label>
                <p className="text-stone-500 text-[11px]">
                  Use a reusable auth key from Tailscale Admin Console (Settings ➔ Keys) for non-interactive login.
                </p>
                <input
                  type="text"
                  value={authKeyInput}
                  onChange={(e) => setAuthKeyInput(e.target.value)}
                  placeholder="tskey-auth-k1234567890-abcdef"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAFBFB] border border-stone-200 font-mono text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => handleConnect(authKeyInput)}
                  disabled={isLoggingIn || !authKeyInput.trim()}
                  className="w-full py-2 rounded-xl bg-stone-900 hover:bg-black disabled:opacity-50 text-white font-bold transition-colors cursor-pointer shadow-2xs flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Connect with Auth Key</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
