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
  const [newAssetTags, setNewAssetTags] = useState('vellum, synthetic');

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
    if (confirm('Are you sure you want to remove this asset from the library?')) {
      assetLibraryService.deleteAsset(id);
      setAssets(assetLibraryService.getAssets());
      if (previewAsset?.id === id) setPreviewAsset(null);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset asset library to default seed artifacts?')) {
      assetLibraryService.resetToDefaults();
      setAssets(assetLibraryService.getAssets());
    }
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim() || !newAssetUrl.trim()) return;

    assetLibraryService.addAsset({
      name: newAssetName.trim(),
      type: newAssetType,
      url: newAssetUrl.trim(),
      thumbnailUrl: newAssetType === 'image' || newAssetType === 'video' ? newAssetUrl.trim() : undefined,
      sizeBytes: Math.floor(Math.random() * 5000000) + 500000,
      source: newAssetSource.trim() || 'Manual Registration',
      tags: newAssetTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    });

    setAssets(assetLibraryService.getAssets());
    setIsAddingModalOpen(false);
    setNewAssetName('');
    setNewAssetUrl('');
  };

  const renderCategoryIcon = (type: AssetItemType, className = 'w-4 h-4') => {
    switch (type) {
      case 'video':
        return <Film className={className} />;
      case 'image':
        return <ImageIcon className={className} />;
      case 'audio':
        return <Music className={className} />;
      case '3d':
        return <Box className={className} />;
      case 'dataset':
        return <Database className={className} />;
      case 'document':
        return <FileText className={className} />;
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden bg-[#F6F3EC] text-[#1A1D1A] font-mono relative select-none ${className}`}>
      {/* Background: Inked Drafting Vellum Paper with 24mm Grid */}
      <div 
        className="absolute inset-0 bg-[#F6F3EC] pointer-events-none z-0" 
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(26,29,26,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,29,26,0.07) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} 
      />

      {/* Top Header */}
      <div className="relative z-10 bg-[#FAF8F3]/95 border-b border-[#1A1D1A]/15 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-xs backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#0D9488] mb-1">
            <span>PETRI STUDIO</span>
            <span>/</span>
            <span>MEDIA VAULT</span>
            <span>/</span>
            <span className="text-[#1A1D1A]/60">GALLERY & ASSETS</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0D9488]/10 border border-[#0D9488]/30 flex items-center justify-center text-[#0D9488] shadow-xs">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1D1A] flex items-center gap-2.5">
                Gallery & Asset Explorer
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-[#1A1D1A]/5 text-[#1A1D1A] border border-[#1A1D1A]/15">
                  {assets.length} Active Artifacts
                </span>
              </h1>
              <p className="text-xs text-[#1A1D1A]/70 mt-0.5">
                Centralized vault for real videos, flow scenes, diffusion stills, audio, 3D captures, and EDM datasets.
              </p>
            </div>
          </div>
        </div>

        {/* Global Vault Telemetry & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F3] border border-[#1A1D1A]/15 text-xs font-mono text-[#1A1D1A]/80 shadow-xs">
            <HardDrive className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Vault Footprint:</span>
            <strong className="text-[#0D9488]">{totalStorageFormatted}</strong>
          </div>

          <button
            onClick={() => setIsAddingModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1A1D1A] hover:bg-[#1A1D1A]/85 text-[#FAF8F3] text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Import Asset</span>
          </button>

          <button
            onClick={handleResetDefaults}
            title="Reset library to defaults"
            className="p-2 rounded-xl bg-[#FAF8F3] hover:bg-[#F0ECE1] border border-[#1A1D1A]/15 text-[#1A1D1A]/70 hover:text-[#1A1D1A] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="relative z-10 bg-[#FAF8F3]/90 border-b border-[#1A1D1A]/15 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 backdrop-blur-sm">
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
                    ? 'bg-[#1A1D1A] text-[#FAF8F3] font-bold shadow-xs'
                    : 'bg-[#FAF8F3] text-[#1A1D1A]/70 hover:text-[#1A1D1A] hover:bg-[#F0ECE1] border border-[#1A1D1A]/15'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FAF8F3]' : 'text-[#1A1D1A]/60'}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#1A1D1A]/5 text-[#1A1D1A]/70'
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
            <Search className="w-3.5 h-3.5 text-[#1A1D1A]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets, tags, sources..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#1A1D1A]/20 text-xs text-[#1A1D1A] placeholder-[#1A1D1A]/40 focus:outline-none focus:border-[#0D9488] transition-colors font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1A1D1A]/40 hover:text-[#1A1D1A]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-[#FAF8F3] border border-[#1A1D1A]/15 rounded-lg p-1 text-xs">
            <button
              onClick={() => setSortBy('newest')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                sortBy === 'newest' ? 'bg-[#1A1D1A] text-[#FAF8F3] font-semibold' : 'text-[#1A1D1A]/70 hover:text-[#1A1D1A]'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                sortBy === 'name' ? 'bg-[#1A1D1A] text-[#FAF8F3] font-semibold' : 'text-[#1A1D1A]/70 hover:text-[#1A1D1A]'
              }`}
            >
              Name
            </button>
            <button
              onClick={() => setSortBy('size')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                sortBy === 'size' ? 'bg-[#1A1D1A] text-[#FAF8F3] font-semibold' : 'text-[#1A1D1A]/70 hover:text-[#1A1D1A]'
              }`}
            >
              Size
            </button>
          </div>

          <div className="flex items-center bg-[#FAF8F3] border border-[#1A1D1A]/15 rounded-lg p-1">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                viewLayout === 'grid' ? 'bg-[#1A1D1A] text-[#FAF8F3]' : 'text-[#1A1D1A]/70 hover:text-[#1A1D1A]'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewLayout('table')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                viewLayout === 'table' ? 'bg-[#1A1D1A] text-[#FAF8F3]' : 'text-[#1A1D1A]/70 hover:text-[#1A1D1A]'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6">
        {filteredAssets.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#1A1D1A]/20 rounded-2xl bg-[#FAF8F3]/60">
            <FolderArchive className="w-10 h-10 text-[#1A1D1A]/40 mb-3" />
            <h3 className="text-sm font-semibold text-[#1A1D1A]">No assets match your filter</h3>
            <p className="text-xs text-[#1A1D1A]/60 mt-1 max-w-sm">
              Try adjusting your search keywords, clear category filter, or import new media into the vault.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-3.5 py-1.5 rounded-lg bg-[#1A1D1A] hover:bg-[#1A1D1A]/85 text-xs font-medium text-[#FAF8F3] transition-colors"
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
                className="group relative bg-[#FAF8F3] border border-[#1A1D1A]/15 hover:border-[#1A1D1A]/40 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col shadow-xs hover:shadow-md"
              >
                {/* Media Thumbnail Container */}
                <div
                  onClick={() => setPreviewAsset(asset)}
                  className="relative aspect-video w-full bg-[#1A1D1A]/90 flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  {asset.thumbnailUrl ? (
                    <img
                      src={asset.thumbnailUrl}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-[#FAF8F3]/70">
                      {renderCategoryIcon(asset.type, 'w-10 h-10 mb-2')}
                      <span className="text-[10px] font-mono uppercase">{asset.type}</span>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#1A1D1A]/80 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-[10px] font-mono text-[#FAF8F3]">
                    {renderCategoryIcon(asset.type, 'w-3 h-3 text-[#0D9488]')}
                    <span className="uppercase font-semibold">{asset.type}</span>
                  </div>

                  {/* Dimension or Duration Badge */}
                  {(asset.dimensions || asset.durationSeconds) && (
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#1A1D1A]/80 backdrop-blur-md border border-white/20 text-[10px] font-mono text-[#FAF8F3]">
                      {asset.durationSeconds
                        ? formatDuration(asset.durationSeconds)
                        : asset.dimensions}
                    </div>
                  )}

                  {/* Play Overlay for Video & Audio */}
                  {(asset.type === 'video' || asset.type === 'audio') && (
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-[#0D9488] text-[#FAF8F3] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
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
                      className="text-xs font-bold text-[#1A1D1A] group-hover:text-[#0D9488] transition-colors line-clamp-1 cursor-pointer"
                      title={asset.name}
                    >
                      {asset.name}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-[#1A1D1A]/60 mt-1 font-mono">
                      <span className="truncate max-w-[140px]">{asset.source}</span>
                      <span>{formatFileSize(asset.sizeBytes)}</span>
                    </div>

                    {/* Tags */}
                    {asset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {asset.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#1A1D1A]/5 border border-[#1A1D1A]/10 text-[#1A1D1A]/70"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#1A1D1A]/10 text-xs">
                    <div className="text-[10px] font-mono text-[#1A1D1A]/50 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyUri(asset)}
                        title="Copy Petri Vault URI"
                        className="p-1.5 rounded-lg bg-[#FAF8F3] hover:bg-[#F0ECE1] text-[#1A1D1A]/60 hover:text-[#0D9488] border border-[#1A1D1A]/10 transition-colors cursor-pointer"
                      >
                        {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => setPreviewAsset(asset)}
                        title="Open Full Preview"
                        className="p-1.5 rounded-lg bg-[#0D9488]/10 hover:bg-[#0D9488]/20 text-[#0D9488] border border-[#0D9488]/30 transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        title="Delete asset"
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-[#1A1D1A]/40 hover:text-rose-600 transition-colors cursor-pointer"
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
          <div className="bg-[#FAF8F3] border border-[#1A1D1A]/15 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F0ECE1] border-b border-[#1A1D1A]/15 text-[#1A1D1A]/70 font-mono text-[11px]">
                    <th className="py-3 px-4 font-semibold">Artifact Name</th>
                    <th className="py-3 px-4 font-semibold">Type</th>
                    <th className="py-3 px-4 font-semibold">Source</th>
                    <th className="py-3 px-4 font-semibold">Specs</th>
                    <th className="py-3 px-4 font-semibold">Size</th>
                    <th className="py-3 px-4 font-semibold">Created</th>
                    <th className="py-3 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1D1A]/10 text-[#1A1D1A]">
                  {filteredAssets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="hover:bg-[#F0ECE1]/60 transition-colors cursor-pointer"
                      onClick={() => setPreviewAsset(asset)}
                    >
                      <td className="py-3 px-4 font-semibold flex items-center gap-2.5">
                        {renderCategoryIcon(asset.type, 'w-4 h-4 text-[#0D9488]')}
                        <span className="line-clamp-1">{asset.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#1A1D1A]/5 text-[#1A1D1A] border border-[#1A1D1A]/15 font-semibold">
                          {asset.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#1A1D1A]/60 font-mono">{asset.source}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#1A1D1A]/70">
                        {asset.durationSeconds
                          ? `${formatDuration(asset.durationSeconds)} (Video/Audio)`
                          : asset.dimensions || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#1A1D1A]/70">{formatFileSize(asset.sizeBytes)}</td>
                      <td className="py-3 px-4 text-[#1A1D1A]/50 font-mono text-[11px]">
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleCopyUri(asset)}
                            title="Copy URI"
                            className="p-1 rounded text-[#1A1D1A]/60 hover:text-[#0D9488] hover:bg-[#F0ECE1]"
                          >
                            {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setPreviewAsset(asset)}
                            title="Preview"
                            className="p-1 rounded text-[#0D9488] hover:bg-[#0D9488]/10"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            title="Delete"
                            className="p-1 rounded text-[#1A1D1A]/40 hover:text-rose-600 hover:bg-rose-50"
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
        <div className="fixed inset-0 z-50 bg-[#1A1D1A]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#FAF8F3] border border-[#1A1D1A]/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1D1A]/15 bg-[#F0ECE1]">
              <div className="flex items-center gap-2.5">
                {renderCategoryIcon(previewAsset.type, 'w-5 h-5 text-[#0D9488]')}
                <div>
                  <h2 className="text-base font-bold text-[#1A1D1A] line-clamp-1">{previewAsset.name}</h2>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#0D9488] mt-0.5">
                    <span>{previewAsset.source}</span>
                    <span>·</span>
                    <span>{formatFileSize(previewAsset.sizeBytes)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="p-1.5 rounded-lg text-[#1A1D1A]/60 hover:text-[#1A1D1A] hover:bg-[#FAF8F3] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Media Preview + Details */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Media Player / Canvas Container */}
              <div className="md:col-span-2 bg-[#1A1D1A] rounded-xl overflow-hidden border border-[#1A1D1A]/20 flex items-center justify-center min-h-[320px]">
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
                    <div className="w-20 h-20 rounded-full bg-[#0D9488]/20 border border-[#0D9488]/40 flex items-center justify-center text-[#0D9488] mb-6 animate-pulse">
                      <Music className="w-10 h-10" />
                    </div>
                    <audio src={previewAsset.url} controls className="w-full max-w-md" />
                    <div className="text-xs font-mono text-[#FAF8F3]/70 mt-4">
                      Bitrate: {previewAsset.metadata?.bitrate || '320kbps'} · Duration:{' '}
                      {formatDuration(previewAsset.durationSeconds)}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-center text-[#FAF8F3]">
                    {renderCategoryIcon(previewAsset.type, 'w-16 h-16 mb-4 text-[#0D9488]')}
                    <h4 className="text-sm font-bold">{previewAsset.name}</h4>
                    <p className="text-xs text-[#FAF8F3]/70 mt-1 max-w-sm">
                      Interactive viewer active in native studio engine.
                    </p>
                  </div>
                )}
              </div>

              {/* Inspector & Actions Drawer */}
              <div className="space-y-4 text-xs font-mono">
                <div className="bg-[#F0ECE1] p-4 rounded-xl border border-[#1A1D1A]/15 space-y-3">
                  <h4 className="text-xs font-mono uppercase text-[#0D9488] font-bold">Artifact Metadata</h4>

                  <div className="space-y-2 text-[#1A1D1A]/80">
                    <div className="flex justify-between">
                      <span className="text-[#1A1D1A]/50">Vault ID:</span>
                      <span className="font-mono text-[11px]">{previewAsset.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#1A1D1A]/50">File Size:</span>
                      <span className="font-mono">{formatFileSize(previewAsset.sizeBytes)}</span>
                    </div>
                    {previewAsset.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-[#1A1D1A]/50">Dimensions:</span>
                        <span className="font-mono">{previewAsset.dimensions}</span>
                      </div>
                    )}
                    {previewAsset.durationSeconds && (
                      <div className="flex justify-between">
                        <span className="text-[#1A1D1A]/50">Duration:</span>
                        <span className="font-mono">{formatDuration(previewAsset.durationSeconds)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#1A1D1A]/50">Ingested At:</span>
                      <span className="font-mono">{new Date(previewAsset.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {previewAsset.metadata && (
                    <div className="pt-3 border-t border-[#1A1D1A]/10 space-y-1.5">
                      <span className="text-[10px] font-mono text-[#1A1D1A]/50 uppercase">Engine Attributes:</span>
                      {Object.entries(previewAsset.metadata).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[11px]">
                          <span className="text-[#1A1D1A]/50 font-mono">{k}:</span>
                          <span className="font-mono text-[#0D9488] max-w-[140px] truncate">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="pt-3 border-t border-[#1A1D1A]/10">
                    <span className="text-[10px] font-mono text-[#1A1D1A]/50 uppercase mb-1.5 block">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {previewAsset.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-[#FAF8F3] border border-[#1A1D1A]/15 text-[10px] font-mono text-[#0D9488]"
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
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FAF8F3] hover:bg-[#F0ECE1] border border-[#1A1D1A]/15 text-xs font-semibold text-[#1A1D1A] transition-colors cursor-pointer"
                  >
                    {copiedId === previewAsset.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#0D9488]" />
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
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#1A1D1A] hover:bg-[#1A1D1A]/85 text-[#FAF8F3] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FAF8F3] hover:bg-[#F0ECE1] border border-[#1A1D1A]/15 text-xs font-medium text-[#1A1D1A]/70 hover:text-[#1A1D1A] transition-colors"
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
        <div className="fixed inset-0 z-50 bg-[#1A1D1A]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#FAF8F3] border border-[#1A1D1A]/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1A1D1A]/15">
              <h3 className="text-base font-bold text-[#1A1D1A] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0D9488]" />
                Import Media or Dataset
              </h3>
              <button
                onClick={() => setIsAddingModalOpen(false)}
                className="text-[#1A1D1A]/50 hover:text-[#1A1D1A] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="mt-4 space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-[#1A1D1A]/70 mb-1 font-medium">Asset Name</label>
                <input
                  type="text"
                  required
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  placeholder="e.g. Master Video Scene 01"
                  className="w-full p-2.5 rounded-xl bg-white border border-[#1A1D1A]/20 text-[#1A1D1A] placeholder-[#1A1D1A]/40 focus:outline-none focus:border-[#0D9488]"
                />
              </div>

              <div>
                <label className="block text-[#1A1D1A]/70 mb-1 font-medium">Asset Type</label>
                <select
                  value={newAssetType}
                  onChange={(e) => setNewAssetType(e.target.value as AssetItemType)}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#1A1D1A]/20 text-[#1A1D1A] focus:outline-none focus:border-[#0D9488] cursor-pointer"
                >
                  <option value="video">Video (.mp4, .webm, .mov)</option>
                  <option value="image">Image (.png, .jpg, .webp)</option>
                  <option value="audio">Audio (.mp3, .wav, .aac)</option>
                  <option value="3d">3D Model / NeRF (.glb, .obj, .splat)</option>
                  <option value="dataset">EDM Dataset (.json, .csv, .parquet)</option>
                  <option value="document">Document (.pdf, .md, .txt)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#1A1D1A]/70 mb-1 font-medium">Direct File URL / Data URI</label>
                <input
                  type="text"
                  required
                  value={newAssetUrl}
                  onChange={(e) => setNewAssetUrl(e.target.value)}
                  placeholder="https://... or data:image/png..."
                  className="w-full p-2.5 rounded-xl bg-white border border-[#1A1D1A]/20 text-[#1A1D1A] placeholder-[#1A1D1A]/40 focus:outline-none focus:border-[#0D9488]"
                />
              </div>

              <div>
                <label className="block text-[#1A1D1A]/70 mb-1 font-medium">Source / Generator</label>
                <input
                  type="text"
                  value={newAssetSource}
                  onChange={(e) => setNewAssetSource(e.target.value)}
                  placeholder="e.g. Video Flow Studio, Camera Import"
                  className="w-full p-2.5 rounded-xl bg-white border border-[#1A1D1A]/20 text-[#1A1D1A] placeholder-[#1A1D1A]/40 focus:outline-none focus:border-[#0D9488]"
                />
              </div>

              <div>
                <label className="block text-[#1A1D1A]/70 mb-1 font-medium">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newAssetTags}
                  onChange={(e) => setNewAssetTags(e.target.value)}
                  placeholder="vellum, scene-01, master"
                  className="w-full p-2.5 rounded-xl bg-white border border-[#1A1D1A]/20 text-[#1A1D1A] placeholder-[#1A1D1A]/40 focus:outline-none focus:border-[#0D9488]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF8F3] hover:bg-[#F0ECE1] text-[#1A1D1A]/70 border border-[#1A1D1A]/15 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1A1D1A] hover:bg-[#1A1D1A]/85 text-[#FAF8F3] font-bold shadow-xs cursor-pointer"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
