import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Server,
  Play,
  History,
  HardDrive,
  X,
} from 'lucide-react';
import {
  rcloneSync,
  RcloneRemote,
  RcloneSyncResult,
  RcloneHistoryEntry,
} from '../../services/rcloneSyncService';
import { PetriWorkdesk } from '../../services/openDesignService';

interface RcloneSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  workdesk?: PetriWorkdesk | null;
  onSyncComplete?: (result: RcloneSyncResult) => void;
}

export const RcloneSyncModal: React.FC<RcloneSyncModalProps> = ({
  isOpen,
  onClose,
  workdesk,
  onSyncComplete,
}) => {
  const [remotes, setRemotes] = useState<RcloneRemote[]>([]);
  const [selectedRemote, setSelectedRemote] = useState<string>('intort');
  const [remoteFolder, setRemoteFolder] = useState<string>('PetriDesigns/AY2026');
  const [isDryRun, setIsDryRun] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<RcloneSyncResult | null>(null);
  const [syncHistory, setSyncHistory] = useState<RcloneHistoryEntry[]>([]);
  const [showAddRemote, setShowAddRemote] = useState(false);
  const [newRemoteName, setNewRemoteName] = useState('');
  const [newRemoteType, setNewRemoteType] = useState<RcloneRemote['remoteType']>('drive');
  const [newRemoteDesc, setNewRemoteDesc] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadRemotes();
      setSyncHistory(rcloneSync.getSyncHistory());
    }
  }, [isOpen]);

  const loadRemotes = async () => {
    const list = await rcloneSync.listRemotes();
    setRemotes(list);
    if (list.length > 0 && !list.some((r) => r.name === selectedRemote)) {
      setSelectedRemote(list[0].name);
    }
  };

  if (!isOpen) return null;

  const handleExecuteSync = async () => {
    if (!workdesk) return;
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const res = await rcloneSync.syncWorkdesk(
        workdesk.id,
        workdesk.name,
        selectedRemote,
        remoteFolder,
        isDryRun
      );
      setSyncResult(res);
      setSyncHistory(rcloneSync.getSyncHistory());
      if (onSyncComplete && res.success) {
        onSyncComplete(res);
      }
    } catch (err: any) {
      setSyncResult({
        success: false,
        exitCode: -1,
        filesTransferred: 0,
        stdout: '',
        stderr: String(err),
        dryRun: isDryRun,
        message: `Sync failed: ${err.message || err}`,
        timestamp: Date.now(),
        source: workdesk.name,
        destination: `${selectedRemote}:${remoteFolder}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddRemote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemoteName.trim()) return;
    rcloneSync.addRemote({
      name: newRemoteName.trim(),
      remoteType: newRemoteType,
      description: newRemoteDesc.trim() || undefined,
    });
    setNewRemoteName('');
    setNewRemoteDesc('');
    setShowAddRemote(false);
    loadRemotes();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center space-x-2">
                <span>Rclone Multi-Cloud Sync Hub</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
                  rclone v1.75.0
                </span>
              </h2>
              <p className="text-xs text-stone-500">
                Sync Petri Design workdesks, assets, and vaults to your Google Drive and external cloud remotes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Workdesk Summary */}
        {workdesk && (
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="font-mono uppercase text-[10px] text-stone-400 font-semibold">Source Workdesk</span>
              <div className="font-bold text-stone-900 text-sm">{workdesk.name}</div>
              <div className="text-stone-500 text-[11px] font-mono">
                {workdesk.artifacts.length} artifacts · {workdesk.category}
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Ready to Sync
            </span>
          </div>
        )}

        {/* Remote Destination Picker */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider font-mono">
              Destination Remote
            </label>
            <button
              type="button"
              onClick={() => setShowAddRemote(!showAddRemote)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddRemote ? 'Cancel' : 'Add Cloud Remote'}</span>
            </button>
          </div>

          {/* Add Remote Sub-form */}
          {showAddRemote && (
            <form onSubmit={handleAddRemote} className="bg-teal-50/50 border border-teal-200 rounded-2xl p-3.5 space-y-3 animate-in fade-in duration-150 text-xs">
              <div className="font-semibold text-teal-900 flex items-center space-x-1.5">
                <Server className="w-4 h-4 text-teal-600" />
                <span>Register New Cloud Remote</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-stone-500 uppercase">Remote Name</label>
                  <input
                    type="text"
                    placeholder="e.g. onedrive-bbs"
                    value={newRemoteName}
                    onChange={(e) => setNewRemoteName(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-stone-500 uppercase">Remote Type</label>
                  <select
                    value={newRemoteType}
                    onChange={(e) => setNewRemoteType(e.target.value as any)}
                    className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="drive">Google Drive</option>
                    <option value="s3">Amazon S3</option>
                    <option value="r2">Cloudflare R2</option>
                    <option value="onedrive">Microsoft OneDrive</option>
                    <option value="dropbox">Dropbox</option>
                    <option value="sftp">SFTP / SSH</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-stone-500 uppercase">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Department Shared Archive"
                    value={newRemoteDesc}
                    onChange={(e) => setNewRemoteDesc(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Save Remote
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {remotes.map((rem) => {
              const isSelected = rem.name === selectedRemote;
              return (
                <div
                  key={rem.name}
                  onClick={() => setSelectedRemote(rem.name)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-50/60 border-teal-600 ring-1 ring-teal-600 shadow-2xs'
                      : 'bg-white border-stone-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600">
                      {rem.remoteType === 'drive' ? (
                        <Cloud className="w-4 h-4 text-sky-600" />
                      ) : (
                        <HardDrive className="w-4 h-4 text-teal-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-stone-900 flex items-center space-x-1.5">
                        <span>{rem.name}:</span>
                        {rem.isPrimary && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-mono font-bold">
                            My Drive
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 line-clamp-1">{rem.description}</p>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Destination Path & Dry Run Option */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-stone-600 mb-1 uppercase font-mono">
              Remote Destination Subfolder
            </label>
            <div className="flex items-center space-x-1">
              <span className="text-stone-400 font-mono px-2 py-2 bg-stone-100 rounded-lg text-xs">
                {selectedRemote}:/
              </span>
              <input
                type="text"
                value={remoteFolder}
                onChange={(e) => setRemoteFolder(e.target.value)}
                placeholder="PetriDesigns/AY2026"
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1 uppercase font-mono">
              Transfer Mode
            </label>
            <button
              type="button"
              onClick={() => setIsDryRun(!isDryRun)}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                isDryRun
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <span>{isDryRun ? 'Dry Run (Preview)' : 'Live Push'}</span>
            </button>
          </div>
        </div>

        {/* Sync Action Button */}
        <div>
          <button
            onClick={handleExecuteSync}
            disabled={isSyncing || !workdesk}
            className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Rclone Synchronization...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>
                  {isDryRun
                    ? `Execute Dry Run Sync to ${selectedRemote}:${remoteFolder}`
                    : `Sync "${workdesk?.name}" to ${selectedRemote}:${remoteFolder}`}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Sync Result Banner */}
        {syncResult && (
          <div
            className={`p-4 rounded-2xl border text-xs animate-in fade-in duration-150 space-y-1 ${
              syncResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center space-x-1.5">
                {syncResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>{syncResult.dryRun ? 'Dry Run Preview Result' : 'Sync Result'}</span>
              </span>
              <span className="font-mono text-[10px]">
                {new Date(syncResult.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-xs">{syncResult.message}</p>
            {syncResult.stdout && (
              <pre className="mt-2 p-2 bg-stone-900 text-stone-200 font-mono text-[10px] rounded-lg overflow-x-auto whitespace-pre-wrap">
                {syncResult.stdout}
              </pre>
            )}
          </div>
        )}

        {/* Recent Sync History */}
        {syncHistory.length > 0 && (
          <div className="border-t border-stone-100 pt-3 space-y-2">
            <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider font-mono flex items-center space-x-1">
              <History className="w-3 h-3" />
              <span>Recent Cloud Sync Logs</span>
            </h4>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {syncHistory.slice(0, 4).map((h) => (
                <div
                  key={h.id}
                  className="p-2 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-[11px]"
                >
                  <div className="flex items-center space-x-2">
                    <Cloud className="w-3.5 h-3.5 text-sky-600" />
                    <span className="font-semibold text-stone-800">{h.remote}:</span>
                    <span className="text-stone-500 truncate max-w-xs">{h.destination}</span>
                  </div>
                  <span className="font-mono text-[10px] text-stone-400">
                    {new Date(h.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
