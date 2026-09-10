import React, { useState, useMemo } from 'react';
import {
  FolderArchive,
  Film,
  Image as ImageIcon,
  Music,
  Box,
  Database,
  FileText,
  Search,
  Grid,
  List,
  Download,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Plus,
  Play,
  Maximize2,
  X,
  Clock,
  HardDrive,
} from 'lucide-react';
import { AssetItem, AssetItemType } from '../../types';
import { assetLibraryService } from '../../services/assetLibraryService';

interface AssetLibraryViewProps {
  onNavigateToVideoFlow?: () => void;
  onNavigateToEdmStudio?: () => void;
  className?: string;
}

export const AssetLibraryView: React.FC<AssetLibraryViewProps> = ({
  onNavigateToVideoFlow,
  onNavigateToEdmStudio,
  className = '',
}) => {
  const [assets, setAssets] = useState<AssetItem[]>(() => assetLibraryService.getAssets());
  const [selectedCategory, setSelectedCategory] = useState<AssetItemType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'size'>('newest');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');
  const [previewAsset, setPreviewAsset] = useState<AssetItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);

  // New asset form state
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetType, setNewAssetType] = useState<AssetItemType>('image');
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newAssetSource, setNewAssetSource] = useState('Petri Studio Ingestion');
  const [newAssetTags, setNewAssetTags] = useState('tiffany, synthetic');

  // Filtered and sorted assets
  const filteredAssets = useMemo(() => {
    return assetLibraryService.filterAssets(selectedCategory, searchQuery, sortBy);
  }, [assets, selectedCategory, searchQuery, sortBy]);

  // Summary counts
  const counts = useMemo(() => {
    const all = assetLibraryService.getAssets();
    return {
      all: all.length,
      video: all.filter((a) => a.type === 'video').length,
      image: all.filter((a) => a.type === 'image').length,
      audio: all.filter((a) => a.type === 'audio').length,
      '3d': all.filter((a) => a.type === '3d').length,
      dataset: all.filter((a) => a.type === 'dataset').length,
      document: all.filter((a) => a.type === 'document').length,
    };
  }, [assets]);

  const totalStorageFormatted = useMemo(() => {
    const bytes = assetLibraryService.getTotalStorageBytes();
    if (bytes > 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, [assets]);

  const formatFileSize = (bytes: number): string => {
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes > 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyUri = (asset: AssetItem) => {
    const uri = `petri://vault/assets/${asset.type}/${asset.id}`;
    navigator.clipboard.writeText(uri);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm('Delete this asset from the local vault?')) {
      assetLibraryService.deleteAsset(id);
      setAssets(assetLibraryService.getAssets());
      if (previewAsset?.id === id) setPreviewAsset(null);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset gallery to default media & dataset catalog?')) {
      assetLibraryService.resetToDefaults();
      setAssets(assetLibraryService.getAssets());
    }
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim()) return;

    assetLibraryService.addAsset({
      name: newAssetName.trim(),
      type: newAssetType,
      url: newAssetUrl.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      thumbnailUrl: newAssetUrl.trim() || undefined,
      sizeBytes: Math.floor(Math.random() * 8000000) + 500000,
      source: newAssetSource.trim() || 'Manual Import',
      tags: newAssetTags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setAssets(assetLibraryService.getAssets());
    setIsAddingModalOpen(false);
    setNewAssetName('');
    setNewAssetUrl('');
  };

  const renderCategoryIcon = (type: AssetItemType, className = 'w-4 h-4') => {
    switch (type) {
      case 'video':
        return <Film className={`${className} text-teal-400`} />;
      case 'image':
        return <ImageIcon className={`${className} text-teal-300`} />;
      case 'audio':
        return <Music className={`${className} text-emerald-400`} />;
      case '3d':
        return <Box className={`${className} text-cyan-400`} />;
      case 'dataset':
        return <Database className={`${className} text-teal-400`} />;
      case 'document':
        return <FileText className={`${className} text-slate-300`} />;
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden bg-[#041017] text-slate-100 ${className}`}>
      {/* Top Header */}
      <div className="bg-[#071620] border-b border-teal-900/40 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <span>PETRI STUDIO</span>
            <span>/</span>
            <span>MEDIA VAULT</span>
            <span>/</span>
            <span className="text-slate-400">GALLERY & ASSETS</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shadow-xs">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
                Gallery & Asset Library
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {assets.length} Active Artifacts
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized vault for Hyperframe videos, Video Flow scenes, diffusion stills, 3D captures, and EDM datasets.
              </p>
            </div>
          </div>
        </div>

        {/* Global Vault Telemetry & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-teal-400" />
            <span>Vault Footprint:</span>
            <strong className="text-teal-300">{totalStorageFormatted}</strong>
          </div>

          <button
            onClick={() => setIsAddingModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Import Asset</span>
          </button>

          <button
            onClick={handleResetDefaults}
            title="Reset library to defaults"
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#05131C] border-b border-teal-900/30 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {(
            [
              { id: 'all', label: 'All Artifacts', count: counts.all, icon: FolderArchive },
              { id: 'video', label: 'Videos', count: counts.video, icon: Film },
              { id: 'image', label: 'Images', count: counts.image, icon: ImageIcon },
              { id: 'audio', label: 'Audio', count: counts.audio, icon: Music },
              { id: '3d', label: '3D Captures', count: counts['3d'], icon: Box },
              { id: 'dataset', label: 'EDM Datasets', count: counts.dataset, icon: Database },
              { id: 'document', label: 'Documents', count: counts.document, icon: FileText },
            ] as const
          ).map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as AssetItemType | 'all')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-teal-500/20 text-teal-200 border border-teal-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-300' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-teal-500/30 text-teal-100' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Sort, View Controls */}
        <div className="flex items-center gap-2.5 self-end md:self-auto w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets, tags, sources..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setSortBy('newest')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                sortBy === 'newest' ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                sortBy === 'name' ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Name
            </button>
            <button
              onClick={() => setSortBy('size')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                sortBy === 'size' ? 'bg-teal-500/20 text-teal-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Size
            </button>
          </div>

          <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                viewLayout === 'grid' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewLayout('table')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                viewLayout === 'table' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredAssets.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
            <FolderArchive className="w-10 h-10 text-slate-600 mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No assets match your filter</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Try adjusting your search keywords, clear category filter, or import new media into the vault.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : viewLayout === 'grid' ? (
          /* Grid View Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="group relative bg-[#071620] border border-teal-900/30 hover:border-teal-500/50 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col shadow-md hover:shadow-teal-950/40"
              >
                {/* Media Thumbnail Container */}
                <div
                  onClick={() => setPreviewAsset(asset)}
                  className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  {asset.thumbnailUrl ? (
                    <img
                      src={asset.thumbnailUrl}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-slate-500">
                      {renderCategoryIcon(asset.type, 'w-10 h-10 mb-2')}
                      <span className="text-[10px] font-mono uppercase">{asset.type}</span>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#041017]/80 backdrop-blur-md border border-teal-900/60 flex items-center gap-1.5 text-[10px] font-mono text-teal-300">
                    {renderCategoryIcon(asset.type, 'w-3 h-3')}
                    <span className="uppercase font-semibold">{asset.type}</span>
                  </div>

                  {/* Dimension or Duration Badge */}
                  {(asset.dimensions || asset.durationSeconds) && (
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#041017]/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-300">
                      {asset.durationSeconds
                        ? formatDuration(asset.durationSeconds)
                        : asset.dimensions}
                    </div>
                  )}

                  {/* Play Overlay for Video & Audio */}
                  {(asset.type === 'video' || asset.type === 'audio') && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => setPreviewAsset(asset)}
                      className="text-xs font-bold text-slate-200 group-hover:text-teal-300 transition-colors line-clamp-1 cursor-pointer"
                      title={asset.name}
                    >
                      {asset.name}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span className="truncate max-w-[140px]">{asset.source}</span>
                      <span className="font-mono text-slate-500">{formatFileSize(asset.sizeBytes)}</span>
                    </div>

                    {/* Tags */}
                    {asset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {asset.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-teal-900/20 text-xs">
                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyUri(asset)}
                        title="Copy Petri Vault URI"
                        className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
                      >
                        {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => setPreviewAsset(asset)}
                        title="Open Full Preview"
                        className="p-1.5 rounded-lg bg-teal-950 hover:bg-teal-900/80 text-teal-300 transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        title="Delete asset"
                        className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View Layout */
          <div className="bg-[#071620] border border-teal-900/30 rounded-2xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#05131C] text-slate-400 border-b border-teal-900/30 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Artifact</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Origin / Source</th>
                    <th className="py-3 px-4">Specs / Dimensions</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-900/20">
                  {filteredAssets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="hover:bg-teal-950/20 transition-colors group cursor-pointer"
                    >
                      <td
                        onClick={() => setPreviewAsset(asset)}
                        className="py-3 px-4 flex items-center gap-3 font-medium text-slate-200 group-hover:text-teal-300"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 border border-slate-800">
                          {asset.thumbnailUrl ? (
                            <img src={asset.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            renderCategoryIcon(asset.type, 'w-4 h-4')
                          )}
                        </div>
                        <span className="font-semibold line-clamp-1">{asset.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/30 uppercase">
                          {asset.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{asset.source}</td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {asset.durationSeconds
                          ? `${formatDuration(asset.durationSeconds)} (Video/Audio)`
                          : asset.dimensions || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{formatFileSize(asset.sizeBytes)}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleCopyUri(asset)}
                            title="Copy URI"
                            className="p-1 rounded text-slate-400 hover:text-teal-300 hover:bg-slate-800"
                          >
                            {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setPreviewAsset(asset)}
                            title="Preview"
                            className="p-1 rounded text-teal-400 hover:bg-teal-950"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            title="Delete"
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Asset Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#071620] border border-teal-900/50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-teal-900/30 bg-[#05131C]">
              <div className="flex items-center gap-2.5">
                {renderCategoryIcon(previewAsset.type, 'w-5 h-5')}
                <div>
                  <h2 className="text-base font-bold text-slate-100 line-clamp-1">{previewAsset.name}</h2>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-teal-400 mt-0.5">
                    <span>{previewAsset.source}</span>
                    <span>·</span>
                    <span>{formatFileSize(previewAsset.sizeBytes)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Media Preview + Details */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Media Player / Canvas Container */}
              <div className="md:col-span-2 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-[320px]">
                {previewAsset.type === 'video' ? (
                  <video
                    src={previewAsset.url}
                    controls
                    autoPlay
                    className="w-full h-full max-h-[460px] object-contain"
                  />
                ) : previewAsset.type === 'image' ? (
                  <img
                    src={previewAsset.url}
                    alt={previewAsset.name}
                    className="w-full h-full max-h-[460px] object-contain"
                  />
                ) : previewAsset.type === 'audio' ? (
                  <div className="p-8 flex flex-col items-center justify-center text-center w-full">
                    <div className="w-20 h-20 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 mb-6 animate-pulse">
                      <Music className="w-10 h-10" />
                    </div>
                    <audio src={previewAsset.url} controls className="w-full max-w-md" />
                    <div className="text-xs font-mono text-slate-400 mt-4">
                      Bitrate: {previewAsset.metadata?.bitrate || '320kbps'} · Duration:{' '}
                      {formatDuration(previewAsset.durationSeconds)}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-center">
                    {renderCategoryIcon(previewAsset.type, 'w-16 h-16 mb-4')}
                    <h4 className="text-sm font-bold text-slate-200">{previewAsset.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Interactive viewer active in native studio engine.
                    </p>
                  </div>
                )}
              </div>

              {/* Inspector & Actions Drawer */}
              <div className="space-y-4 text-xs font-sans">
                <div className="bg-[#05131C] p-4 rounded-xl border border-teal-900/30 space-y-3">
                  <h4 className="text-xs font-mono uppercase text-teal-400 font-semibold">Artifact Metadata</h4>

                  <div className="space-y-2 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vault ID:</span>
                      <span className="font-mono text-slate-400 text-[11px]">{previewAsset.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">File Size:</span>
                      <span className="font-mono">{formatFileSize(previewAsset.sizeBytes)}</span>
                    </div>
                    {previewAsset.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dimensions:</span>
                        <span className="font-mono">{previewAsset.dimensions}</span>
                      </div>
                    )}
                    {previewAsset.durationSeconds && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Duration:</span>
                        <span className="font-mono">{formatDuration(previewAsset.durationSeconds)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ingested At:</span>
                      <span className="font-mono">{new Date(previewAsset.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {previewAsset.metadata && (
                    <div className="pt-3 border-t border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Engine Attributes:</span>
                      {Object.entries(previewAsset.metadata).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[11px]">
                          <span className="text-slate-500 font-mono">{k}:</span>
                          <span className="font-mono text-teal-300 max-w-[140px] truncate">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="pt-3 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 uppercase mb-1.5 block">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {previewAsset.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-teal-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Workflow Routing Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleCopyUri(previewAsset)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    {copiedId === previewAsset.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-teal-400" />
                        <span>Copy Vault URI</span>
                      </>
                    )}
                  </button>

                  {previewAsset.type === 'video' && onNavigateToVideoFlow && (
                    <button
                      onClick={() => {
                        setPreviewAsset(null);
                        onNavigateToVideoFlow();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Send to Video Flow NLE</span>
                    </button>
                  )}

                  {(previewAsset.type === 'dataset' || previewAsset.type === 'document') && onNavigateToEdmStudio && (
                    <button
                      onClick={() => {
                        setPreviewAsset(null);
                        onNavigateToEdmStudio();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Explore in EDM Studio</span>
                    </button>
                  )}

                  <a
                    href={previewAsset.url}
                    download={previewAsset.name}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Asset Import Modal */}
      {isAddingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#071620] border border-teal-900/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-teal-900/30">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-400" />
                Import Media or Dataset
              </h3>
              <button
                onClick={() => setIsAddingModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Asset Name</label>
                <input
                  type="text"
                  required
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  placeholder="e.g. Kelvin-Helmholtz Video Render #04"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Type</label>
                  <select
                    value={newAssetType}
                    onChange={(e) => setNewAssetType(e.target.value as AssetItemType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                    <option value="audio">Audio</option>
                    <option value="3d">3D Capture</option>
                    <option value="dataset">EDM Dataset</option>
                    <option value="document">Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Origin Source</label>
                  <input
                    type="text"
                    value={newAssetSource}
                    onChange={(e) => setNewAssetSource(e.target.value)}
                    placeholder="e.g. Hyperframe Video"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">URL / Local Blob Path</label>
                <input
                  type="text"
                  value={newAssetUrl}
                  onChange={(e) => setNewAssetUrl(e.target.value)}
                  placeholder="https://... or /data/vault/..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newAssetTags}
                  onChange={(e) => setNewAssetTags(e.target.value)}
                  placeholder="simulation, 4k, fluid"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-xs"
                >
                  Register in Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
