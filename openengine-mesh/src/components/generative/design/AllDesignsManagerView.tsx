import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Copy,
  Trash2,
  Download,
  Layers,
  Layout,
  Sliders,
  ShoppingBag,
  BookOpen,
  Box,
  Smartphone,
  Cloud,
  ArrowRight,
  Grid,
  List,
} from 'lucide-react';
import { PetriProductSite } from '../../../services/openDesignService';

interface AllDesignsManagerViewProps {
  products: PetriProductSite[];
  activeProductId: string;
  onSelectProduct: (productId: string) => void;
  onCreateNew: () => void;
  onDuplicateProduct: (productId: string) => void;
  onDeleteProduct: (productId: string) => void;
  onRenameProduct: (productId: string, newName: string) => void;
  onExportProduct: (productId: string, format: 'html' | 'bundle') => void;
}

export const AllDesignsManagerView: React.FC<AllDesignsManagerViewProps> = ({
  products,
  activeProductId,
  onSelectProduct,
  onCreateNew,
  onDuplicateProduct,
  onDeleteProduct,
  onRenameProduct,
  onExportProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');

  const productTypes = [
    { id: 'all', label: 'All Designs' },
    { id: 'saas', label: 'B2B SaaS' },
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'dashboard', label: 'Dashboards & EDM' },
    { id: 'prototype', label: 'WebGL 3D' },
    { id: 'mobile_app', label: 'Mobile Apps' },
    { id: 'docs', label: 'Documentation' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchType =
        selectedTypeFilter === 'all' || prod.type === selectedTypeFilter;
      const matchSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.pages.some((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.route.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchType && matchSearch;
    });
  }, [products, selectedTypeFilter, searchQuery]);

  // Aggregate stats
  const totalPagesCount = useMemo(
    () => products.reduce((acc, p) => acc + p.pages.length, 0),
    [products]
  );

  const syncedCount = useMemo(
    () => products.filter((p) => p.syncStatus === 'synced').length,
    [products]
  );

  const getTypeIcon = (type: PetriProductSite['type']) => {
    switch (type) {
      case 'saas':
        return Layout;
      case 'ecommerce':
        return ShoppingBag;
      case 'dashboard':
        return Sliders;
      case 'prototype':
        return Box;
      case 'mobile_app':
        return Smartphone;
      case 'docs':
        return BookOpen;
      default:
        return Layers;
    }
  };

  const handleInlineRename = (prod: PetriProductSite) => {
    const newName = prompt('Enter new design title:', prod.name);
    if (newName && newName.trim() && newName.trim() !== prod.name) {
      onRenameProduct(prod.id, newName.trim());
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#FAFBFB] p-8 overflow-y-auto font-sans">
      <div className="max-w-7xl w-full mx-auto space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0ABAB5] animate-pulse"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-0.5 rounded-full border border-teal-200">
                Petri Design Hub
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-stone-900 mt-2">
              All Design Projects & Sites
            </h1>
            <p className="text-xs text-stone-500 mt-1 max-w-xl">
              Manage, preview, customize, and deploy all active web applications, e-commerce storefronts, analytics portals, and spatial prototypes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCreateNew}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Design</span>
            </button>
          </div>
        </div>

        {/* Global Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-2xs space-y-1">
            <div className="text-[10px] font-mono text-stone-400 uppercase font-bold">Total Designs / Sites</div>
            <div className="text-3xl font-black text-stone-900">{products.length}</div>
            <div className="text-[11px] text-teal-600 font-medium">Active in memory</div>
          </div>
          <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-2xs space-y-1">
            <div className="text-[10px] font-mono text-stone-400 uppercase font-bold">Total Routes & Pages</div>
            <div className="text-3xl font-black text-indigo-600">{totalPagesCount}</div>
            <div className="text-[11px] text-stone-500 font-medium">Interconnected pages</div>
          </div>
          <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-2xs space-y-1">
            <div className="text-[10px] font-mono text-stone-400 uppercase font-bold">Cloud Synced</div>
            <div className="text-3xl font-black text-sky-600">{syncedCount}</div>
            <div className="text-[11px] text-sky-600 font-medium">Rclone Drive / S3</div>
          </div>
          <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-2xs space-y-1">
            <div className="text-[10px] font-mono text-stone-400 uppercase font-bold">Synthesis Engine</div>
            <div className="text-3xl font-black text-teal-600">AGY v8</div>
            <div className="text-[11px] text-teal-600 font-medium">Local AST compiler</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {productTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedTypeFilter(type.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedTypeFilter === type.id
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search designs, routes, or slugs..."
                className="pl-8 pr-4 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-teal-500 w-64"
              />
            </div>

            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200/80">
              <button
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewLayout === 'grid' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                }`}
                title="Grid layout"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewLayout('table')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewLayout === 'table' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                }`}
                title="Table layout"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Designs Grid */}
        {viewLayout === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => {
              const IconComp = getTypeIcon(prod.type);
              const isCurrentActive = prod.id === activeProductId;

              return (
                <div
                  key={prod.id}
                  className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden group shadow-2xs hover:shadow-md ${
                    isCurrentActive
                      ? 'border-teal-500 ring-2 ring-teal-500/20'
                      : 'border-stone-200/90'
                  }`}
                >
                  {/* Card Header Preview Area */}
                  <div className="p-6 bg-gradient-to-br from-stone-50 via-white to-teal-50/20 border-b border-stone-100 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-xl bg-white border border-stone-200 text-teal-600 shadow-2xs">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {prod.type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        {isCurrentActive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-teal-100 text-teal-800">
                            ACTIVE
                          </span>
                        )}
                        {prod.lastSyncedRemote && (
                          <span className="p-1 rounded text-sky-600" title={`Synced to ${prod.lastSyncedRemote}`}>
                            <Cloud className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3
                        onClick={() => handleInlineRename(prod)}
                        className="font-bold text-base text-stone-900 hover:text-teal-700 cursor-pointer transition flex items-center gap-1.5"
                        title="Click to rename design"
                      >
                        <span>{prod.name}</span>
                      </h3>
                      <div className="text-[11px] font-mono text-stone-400 mt-0.5">
                        /{prod.slug} · {prod.brand?.industry || 'Web App'}
                      </div>
                      <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed font-normal">
                        {prod.description}
                      </p>
                    </div>

                    {/* Palette Bar & Routes Count */}
                    <div className="pt-2 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-stone-300"
                          style={{ backgroundColor: prod.tokens.palette.primary }}
                          title={`Primary: ${prod.tokens.palette.primary}`}
                        />
                        <span
                          className="w-3 h-3 rounded-full border border-stone-300"
                          style={{ backgroundColor: prod.tokens.palette.secondary }}
                          title={`Secondary: ${prod.tokens.palette.secondary}`}
                        />
                        <span className="text-[10px] font-mono text-stone-400">
                          {prod.tokens.typography.fontFamily.split(',')[0]}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-lg">
                        {prod.pages.length} {prod.pages.length === 1 ? 'Route' : 'Routes'}
                      </span>
                    </div>
                  </div>

                  {/* Route List Chips */}
                  <div className="p-4 border-b border-stone-100 bg-stone-50/40">
                    <div className="text-[10px] font-mono text-stone-400 uppercase mb-2 font-bold">Interconnected Pages:</div>
                    <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto no-scrollbar">
                      {prod.pages.map((page) => (
                        <span
                          key={page.id}
                          className="text-[10px] font-mono px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 shadow-2xs"
                        >
                          {page.route} <span className="text-stone-400">({page.title})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="p-4 bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onDuplicateProduct(prod.id)}
                        className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition cursor-pointer"
                        title="Duplicate design"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onExportProduct(prod.id, 'bundle')}
                        className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:text-teal-700 hover:bg-teal-50 transition cursor-pointer"
                        title="Export multi-page bundle (.json + files)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {products.length > 1 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete design "${prod.name}"?`)) {
                              onDeleteProduct(prod.id);
                            }
                          }}
                          className="p-2 rounded-xl border border-stone-200 text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete design"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectProduct(prod.id)}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Open Canvas</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Designs Table */}
        {viewLayout === 'table' && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-stone-50 text-stone-500 font-mono text-[10px] uppercase border-b border-stone-200">
                <tr>
                  <th className="px-6 py-3.5">Design Name & Domain</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Routes Count</th>
                  <th className="px-6 py-3.5">Theme Palette</th>
                  <th className="px-6 py-3.5">Sync Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-stone-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-stone-900 flex items-center space-x-2">
                        <span>{prod.name}</span>
                        {prod.id === activeProductId && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-teal-100 text-teal-800">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-stone-400">/{prod.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-stone-100 text-stone-700 uppercase font-semibold">
                        {prod.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold">
                      {prod.pages.length} Pages
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-200"
                          style={{ backgroundColor: prod.tokens.palette.primary }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-200"
                          style={{ backgroundColor: prod.tokens.palette.secondary }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {prod.lastSyncedRemote ? (
                        <span className="text-sky-600 font-mono text-[11px] flex items-center space-x-1">
                          <Cloud className="w-3 h-3" />
                          <span>{prod.lastSyncedRemote}</span>
                        </span>
                      ) : (
                        <span className="text-stone-400 font-mono text-[11px]">Local Only</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onDuplicateProduct(prod.id)}
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-100 transition"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onExportProduct(prod.id, 'bundle')}
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-100 transition"
                          title="Export Bundle"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectProduct(prod.id)}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition"
                        >
                          Open Canvas
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
