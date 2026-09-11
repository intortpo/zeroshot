import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Layout,
  Upload,
  Box,
  Smartphone,
  Presentation,
  FileCode,
  ArrowRight,
  Layers,
  Wand2,
  ShoppingBag,
  BookOpen,
  Globe,
  Sliders,
} from 'lucide-react';
import {
  openDesignService,
  PetriProductSite,
} from '../../services/openDesignService';

interface NewOpenDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (product: PetriProductSite) => void;
}

type TabMode = 'products' | 'ai_synthesis' | 'import';

interface ProductArchetypeOption {
  id: string;
  type: PetriProductSite['type'];
  title: string;
  badge: string;
  description: string;
  routes: Array<{ title: string; route: string }>;
  icon: React.ComponentType<{ className?: string }>;
  accentBg: string;
  accentText: string;
  industry: string;
}

const PRODUCT_ARCHETYPES: ProductArchetypeOption[] = [
  {
    id: 'arch-saas',
    type: 'saas',
    title: 'B2B SaaS Cloud Platform',
    badge: '4 Interconnected Pages',
    description: 'High-converting marketing homepage, 6-block bento features grid, 3-tier pricing matrix, and interactive scorebook desk.',
    routes: [
      { title: 'Home', route: '/' },
      { title: 'Features Bento', route: '/features' },
      { title: 'Pricing Matrix', route: '/pricing' },
      { title: 'Portal Desk', route: '/app' },
    ],
    icon: Layout,
    accentBg: 'bg-teal-50',
    accentText: 'text-teal-700',
    industry: 'Education Technology & SaaS',
  },
  {
    id: 'arch-ecommerce',
    type: 'ecommerce',
    title: 'DTC E-Commerce Storefront',
    badge: '3 Storefront Pages',
    description: 'Organic lifestyle hero, responsive product catalog with add-to-cart interactions, and streamlined 256-bit checkout.',
    routes: [
      { title: 'Storefront', route: '/' },
      { title: 'Catalog Grid', route: '/shop' },
      { title: 'Secure Checkout', route: '/checkout' },
    ],
    icon: ShoppingBag,
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-700',
    industry: 'Sustainable Retail & DTC',
  },
  {
    id: 'arch-dashboard',
    type: 'dashboard',
    title: 'Executive Analytics & EDM',
    badge: '3 Diagnostic Views',
    description: 'Executive cognitive overview, longitudinal student cohort matrix, and DINA item-response parameter calibration dials.',
    routes: [
      { title: 'Cognitive Overview', route: '/' },
      { title: 'Cohort Matrix', route: '/cohorts' },
      { title: 'Diagnostics', route: '/diagnostics' },
    ],
    icon: Sliders,
    accentBg: 'bg-indigo-50',
    accentText: 'text-indigo-700',
    industry: 'Psychometrics & AI Analytics',
  },
  {
    id: 'arch-docs',
    type: 'docs',
    title: 'Developer Documentation & API',
    badge: '3 Technical Pages',
    description: 'Two-column getting-started guide, interactive API schema endpoint browser, and version release changelog.',
    routes: [
      { title: 'Getting Started', route: '/' },
      { title: 'API Reference', route: '/api' },
      { title: 'Changelog', route: '/changelog' },
    ],
    icon: BookOpen,
    accentBg: 'bg-sky-50',
    accentText: 'text-sky-700',
    industry: 'Developer Tools & Protocols',
  },
  {
    id: 'arch-spatial',
    type: 'prototype',
    title: '3D Submersion Spatial WebGL',
    badge: '2 Hardware Accelerated Views',
    description: 'Interactive Three.js volumetric manifold with dynamic waterline boundary and 60 FPS flight telemetry.',
    routes: [
      { title: '3D Manifold', route: '/' },
      { title: 'Telemetry Scorebook', route: '/telemetry' },
    ],
    icon: Box,
    accentBg: 'bg-cyan-50',
    accentText: 'text-cyan-700',
    industry: 'Spatial Computing & Simulation',
  },
  {
    id: 'arch-mobile',
    type: 'mobile_app',
    title: 'Mobile-First Touch Application',
    badge: '3 Mobile Screens',
    description: 'Ergonomic 375x812 mobile layout with bottom navigation bar, attendance velocity radar, and learner portfolio.',
    routes: [
      { title: 'Home Feed', route: '/' },
      { title: 'Activity Tracker', route: '/tracker' },
      { title: 'Profile Settings', route: '/profile' },
    ],
    icon: Smartphone,
    accentBg: 'bg-rose-50',
    accentText: 'text-rose-700',
    industry: 'Mobile Utilities & iOS / Android',
  },
  {
    id: 'arch-slides',
    type: 'saas',
    title: 'Executive Presentation Deck',
    badge: '3 Slide Views (16:9)',
    description: 'High-contrast academic blueprint slide deck with bold typography and leadership figures for keynote presentations.',
    routes: [
      { title: 'Executive Title', route: '/' },
      { title: 'Mastery Breakdown', route: '/mastery' },
      { title: 'Strategic Roadmap', route: '/roadmap' },
    ],
    icon: Presentation,
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-700',
    industry: 'Institutional Executive Deck',
  },
  {
    id: 'arch-blank',
    type: 'custom',
    title: 'Clean Slate Custom Product',
    badge: 'Minimal Starter Canvas',
    description: 'Zero-clutter product container pre-configured with Tailwind CSS, Inter typography, and empty responsive canvas.',
    routes: [{ title: 'Home', route: '/' }],
    icon: Layers,
    accentBg: 'bg-stone-100',
    accentText: 'text-stone-700',
    industry: 'General Web Application',
  },
];

const SUGGESTED_PROMPTS = [
  'B2B SaaS Cloud Matrix with 4 pages: Home, Features Bento, Pricing, and Student Scorebook',
  'Sustainable DTC E-commerce store with catalog grid, cart slideout, and 256-bit checkout',
  'Executive psychometric modeling dashboard with DINA Q-Matrix diagnostics and waterline alerts',
  'Three.js 3D Submersion spatial manifold with elevation telemetry and real-time risk waterline',
];

export const NewOpenDesignModal: React.FC<NewOpenDesignModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('products');
  const [selectedArch, setSelectedArch] = useState<ProductArchetypeOption>(PRODUCT_ARCHETYPES[0]);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodSlug, setProdSlug] = useState('');

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Import State
  const [isDragOver, setIsDragOver] = useState(false);
  const [importedFile, setImportedFile] = useState<{ name: string; size: string; content: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Update default name and slug when archetype changes
  useEffect(() => {
    if (selectedArch) {
      const defaultName = `${selectedArch.title.split(' ')[0]} Site`;
      setProdName(defaultName);
      setProdSlug(defaultName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      setProdDesc(selectedArch.description);
    }
  }, [selectedArch]);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setProdName(name);
    setProdSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  };

  const handleCreateFromArchetype = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = prodName.trim() || selectedArch.title;

    const newProduct = openDesignService.createProduct({
      name: finalName,
      slug: prodSlug.trim() || finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: selectedArch.type,
      description: prodDesc.trim() || selectedArch.description,
      brand: {
        logoText: finalName,
        tagLine: selectedArch.description,
        industry: selectedArch.industry,
      },
      initialPages: selectedArch.routes.map((r) => ({
        title: r.title,
        route: r.route,
      })),
    });

    onCreated(newProduct);
    onClose();
  };

  const handleDispatchAiSynthesis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsSynthesizing(true);
    try {
      const finalName = prodName.trim() || 'AI Synthesized Product';
      const created = await openDesignService.synthesizeDesignFromPrompt({
        name: finalName,
        prompt: aiPrompt,
      });

      onCreated(created);
      onClose();
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setImportedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        content,
      });
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!importedFile) return;
    const created = openDesignService.importWorkdeskFromFile(
      importedFile.content,
      importedFile.name
    );
    onCreated(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <header className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Create New Site or Product</h2>
              <p className="text-xs text-stone-500">
                Design and launch complete multi-page web applications, stores, or analytics suites.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-stone-200 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Tab Switcher */}
        <div className="px-6 border-b border-stone-100 flex space-x-6 text-xs font-semibold bg-stone-50/50">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'products'
                ? 'border-teal-600 text-teal-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Product Archetypes (Multi-Page)</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_synthesis')}
            className={`py-3 border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'ai_synthesis'
                ? 'border-teal-600 text-teal-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Autonomous Synthesis</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`py-3 border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'import'
                ? 'border-teal-600 text-teal-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Bundle / HTML</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PRODUCT ARCHETYPES */}
          {activeTab === 'products' && (
            <form onSubmit={handleCreateFromArchetype} className="space-y-6">
              {/* Product Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider font-mono">
                  Select Product Archetype
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {PRODUCT_ARCHETYPES.map((arch) => {
                    const isSelected = selectedArch.id === arch.id;
                    const IconComponent = arch.icon;
                    return (
                      <button
                        key={arch.id}
                        type="button"
                        onClick={() => setSelectedArch(arch)}
                        className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer space-y-3 ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20 shadow-xs'
                            : 'border-stone-200 bg-white hover:bg-stone-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className={`p-2 rounded-xl ${arch.accentBg} ${arch.accentText}`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                              {arch.badge}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-stone-900">{arch.title}</h4>
                          <p className="text-[10px] text-stone-500 mt-1 leading-relaxed line-clamp-2">
                            {arch.description}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-stone-100/80 flex flex-wrap gap-1">
                          {arch.routes.map((r) => (
                            <span
                              key={r.route}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600"
                            >
                              {r.route}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Product Metadata & Branding */}
              <div className="p-5 bg-stone-50 border border-stone-200 rounded-3xl space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-stone-800">
                  <Globe className="w-4 h-4 text-teal-600" />
                  <span>Site & Brand Identity</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone-600">Site / Product Name</label>
                    <input
                      type="text"
                      value={prodName}
                      onChange={handleNameChange}
                      placeholder="e.g. Apex Cloud Suite"
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone-600">Domain Slug</label>
                    <input
                      type="text"
                      value={prodSlug}
                      onChange={(e) => setProdSlug(e.target.value)}
                      placeholder="e.g. apex-cloud-suite"
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl font-mono text-xs focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone-600">Industry / Domain</label>
                    <input
                      type="text"
                      value={selectedArch.industry}
                      readOnly
                      className="w-full p-2.5 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-stone-500">
                  Will generate <strong>{selectedArch.routes.length} interconnected pages</strong> with unified branding.
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
                  >
                    <span>Create Full Product</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: AI SYNTHESIS */}
          {activeTab === 'ai_synthesis' && (
            <form onSubmit={handleDispatchAiSynthesis} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800">Product Vision Directive</label>
                <textarea
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe your site or product in detail... e.g. A multi-page developer portal with getting started guide, API schemas, and interactive code playground..."
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs leading-relaxed focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              {/* Prompt Suggestions */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-stone-400">Quick Starters:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAiPrompt(p)}
                      className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-[11px] text-stone-700 text-left transition"
                    >
                      "{p}"
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white border border-stone-200 text-stone-700 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSynthesizing || !aiPrompt.trim()}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSynthesizing ? (
                    <span>Synthesizing Architecture...</span>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Synthesize with AGY CLI</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-10 border-2 border-dashed rounded-3xl text-center space-y-3 cursor-pointer transition ${
                  isDragOver
                    ? 'border-teal-500 bg-teal-50/50'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                }`}
              >
                <Upload className="w-8 h-8 text-stone-400 mx-auto" />
                <div>
                  <h4 className="font-bold text-sm text-stone-800">Drop your product file here</h4>
                  <p className="text-xs text-stone-500 mt-1">Supports site-bundle.json and standalone HTML files</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".json,.html,.htm"
                  className="hidden"
                />
              </div>

              {importedFile && (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between text-xs text-teal-900">
                  <div className="flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-teal-600" />
                    <span className="font-bold">{importedFile.name}</span>
                    <span className="text-teal-600 font-mono">({importedFile.size})</span>
                  </div>
                  <button
                    onClick={handleConfirmImport}
                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-xs transition"
                  >
                    Open Product
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
