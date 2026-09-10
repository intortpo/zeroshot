import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Layout,
  Upload,
  Box,
  Smartphone,
  Presentation,
  CheckCircle2,
  FileCode,
  ArrowRight,
  Sliders,
  Layers,
  Wand2,
} from 'lucide-react';
import {
  openDesignService,
  PetriWorkdesk,
  PetriWorkdeskDimensions,
} from '../../services/openDesignService';

interface NewOpenDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (workdesk: PetriWorkdesk) => void;
}

type TabMode = 'gallery' | 'ai_synthesis' | 'import';

interface ArchetypeOption {
  id: 'landing' | 'dashboard' | 'submersion_3d' | 'slides' | 'mobile' | 'blank';
  title: string;
  category: string;
  badge: string;
  description: string;
  dimensions: PetriWorkdeskDimensions;
  icon: React.ComponentType<{ className?: string }>;
  accentBg: string;
  accentText: string;
  previewTag: string;
}

const ARCHETYPES: ArchetypeOption[] = [
  {
    id: 'landing',
    title: 'SaaS Marketing Landing',
    category: 'Web Page',
    badge: 'Tiffany Clean',
    description: 'High-converting hero banner, value proposition cards, interactive CTA buttons, and responsive grid layout.',
    dimensions: { width: 1280, height: 800, label: 'Desktop (1280x800)' },
    icon: Layout,
    accentBg: 'bg-teal-50',
    accentText: 'text-teal-700',
    previewTag: '12-Column Responsive Grid',
  },
  {
    id: 'dashboard',
    title: 'EDM Psychometric Scorebook',
    category: 'Analytics',
    badge: 'DINA Q-Matrix',
    description: 'Student mastery breakdown, attendance velocity sparklines, longitudinal progress metrics, and intervention badges.',
    dimensions: { width: 1280, height: 800, label: 'Desktop (1280x800)' },
    icon: Sliders,
    accentBg: 'bg-indigo-50',
    accentText: 'text-indigo-700',
    previewTag: 'Data-Dense Table & KPIs',
  },
  {
    id: 'submersion_3d',
    title: '3D Petri Submersion Manifold',
    category: 'Spatial WebGL',
    badge: 'Interactive Three.js',
    description: 'Embedded 3D volumetric manifold with live terrain elevation, risk waterline boundary, and orbit drag controls.',
    dimensions: { width: 1280, height: 800, label: 'Desktop (1280x800)' },
    icon: Box,
    accentBg: 'bg-cyan-50',
    accentText: 'text-cyan-700',
    previewTag: '60 FPS Hardware Accelerated',
  },
  {
    id: 'slides',
    title: 'Executive Presentation Deck',
    category: 'Slide Deck',
    badge: '16:9 Widescreen',
    description: 'Academic blueprint slide layout with bold typography, high-contrast leadership figures, and BBS institutional styling.',
    dimensions: { width: 1920, height: 1080, label: 'Slide Deck (1920x1080)' },
    icon: Presentation,
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-700',
    previewTag: 'Keynote & PDF Export',
  },
  {
    id: 'mobile',
    title: 'Student Mobile Portfolio',
    category: 'Mobile Touch',
    badge: 'iOS / Android',
    description: 'Ergonomic mobile-first layout with touch-friendly progress cards, attendance velocity gauge, and quick actions.',
    dimensions: { width: 375, height: 812, label: 'Mobile (375x812)' },
    icon: Smartphone,
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-700',
    previewTag: 'Touch Friendly (375x812)',
  },
  {
    id: 'blank',
    title: 'Clean Slate Blank Canvas',
    category: 'Starter',
    badge: 'Tailwind CSS',
    description: 'Zero-clutter empty container pre-configured with Inter typography, full Tailwind CDN, and Petri design token bindings.',
    dimensions: { width: 1280, height: 800, label: 'Desktop (1280x800)' },
    icon: Layers,
    accentBg: 'bg-stone-100',
    accentText: 'text-stone-700',
    previewTag: 'Minimalist Starter',
  },
];

const SUGGESTED_PROMPTS = [
  'AY2026 Bilingual STEM Gradebook with DINA latent mastery and CSV export',
  '3D Petri Submersion Manifold with elevation telemetry and real-time risk waterline',
  'Mobile touch portfolio for Bangkok Bilingual School student attendance tracking',
  'Executive leadership pitch deck slide for curriculum innovation and learning velocity',
];

export const NewOpenDesignModal: React.FC<NewOpenDesignModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('gallery');
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeOption['id']>('landing');
  const [deskName, setDeskName] = useState('');
  const [deskDesc, setDeskDesc] = useState('');
  const [selectedDimensions, setSelectedDimensions] = useState<PetriWorkdeskDimensions>(
    ARCHETYPES[0].dimensions
  );

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState<'tiffany' | 'dark' | 'academic' | 'vibrant'>('tiffany');
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

  // Update default name and dimensions when archetype changes
  const handleArchetypeSelect = (arch: ArchetypeOption) => {
    setSelectedArchetype(arch.id);
    setSelectedDimensions(arch.dimensions);
    if (!deskName || ARCHETYPES.some((a) => a.title === deskName)) {
      setDeskName(arch.title);
    }
  };

  const handleCreateFromGallery = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = deskName.trim() || ARCHETYPES.find((a) => a.id === selectedArchetype)?.title || 'New Workdesk';
    const created = openDesignService.createWorkdesk({
      name: finalName,
      description: deskDesc.trim() || `Petri Design Workdesk based on ${selectedArchetype}`,
      template: selectedArchetype,
      dimensions: selectedDimensions,
    });
    onCreated(created);
    onClose();
  };

  const handleCreateWithAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsSynthesizing(true);
    try {
      const finalName = deskName.trim() || 'AI Synthesized Prototype';
      const created = await openDesignService.synthesizeDesignFromPrompt({
        name: finalName,
        prompt: aiPrompt,
        template: selectedArchetype,
        style: aiStyle,
        dimensions: selectedDimensions,
      });
      onCreated(created);
      onClose();
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      const sizeKb = (file.size / 1024).toFixed(1) + ' KB';
      setImportedFile({ name: file.name, size: sizeKb, content });
      if (!deskName) {
        setDeskName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importedFile) return;

    const created = openDesignService.importWorkdeskFromFile(
      importedFile.content,
      importedFile.name
    );
    if (deskName.trim()) {
      created.name = deskName.trim();
    }
    if (deskDesc.trim()) {
      created.description = deskDesc.trim();
    }
    onCreated(created);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center space-x-2">
                <span>Start New Open Design Workdesk</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  v8 Autonomous
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Local-first AI design workspace with AGY CLI, MCP tokens, and multi-format exports.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-4 border-b border-stone-200 flex items-center space-x-2 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'border-teal-600 text-teal-900 bg-teal-50/50'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50'
            }`}
          >
            <Layout className="w-4 h-4 text-teal-600" />
            <span>1. Template Gallery</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai_synthesis')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer ${
              activeTab === 'ai_synthesis'
                ? 'border-teal-600 text-teal-900 bg-teal-50/50'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50'
            }`}
          >
            <Wand2 className="w-4 h-4 text-purple-600" />
            <span>2. AI Prompt Synthesizer</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold">
              Instant
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'border-teal-600 text-teal-900 bg-teal-50/50'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50'
            }`}
          >
            <Upload className="w-4 h-4 text-stone-600" />
            <span>3. Import Wireframe (.html / .json)</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: ARCHETYPE GALLERY */}
          {activeTab === 'gallery' && (
            <form id="new-desk-gallery-form" onSubmit={handleCreateFromGallery} className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 uppercase font-mono mb-2">
                  Select Design Archetype (6 Curated Blueprints)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ARCHETYPES.map((arch) => {
                    const isSelected = selectedArchetype === arch.id;
                    const IconComponent = arch.icon;
                    return (
                      <div
                        key={arch.id}
                        onClick={() => handleArchetypeSelect(arch)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/70 ring-1.5 ring-teal-600 shadow-sm'
                            : 'border-stone-200 bg-white hover:border-teal-300 hover:shadow-xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className={`w-8 h-8 rounded-xl ${arch.accentBg} ${arch.accentText} flex items-center justify-center`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                              {arch.badge}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-stone-900">{arch.title}</div>
                          <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                            {arch.description}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px] font-mono text-stone-400">
                          <span>{arch.previewTag}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Workdesk Configuration Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 uppercase font-mono mb-1.5">
                    Workdesk Name
                  </label>
                  <input
                    type="text"
                    value={deskName}
                    onChange={(e) => setDeskName(e.target.value)}
                    placeholder="e.g. Student Progress Portal, Leadership Deck..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 font-medium text-stone-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 uppercase font-mono mb-1.5">
                    Device Viewport
                  </label>
                  <select
                    value={selectedDimensions.label}
                    onChange={(e) => {
                      const match = ARCHETYPES.map((a) => a.dimensions).find(
                        (d) => d.label === e.target.value
                      );
                      if (match) setSelectedDimensions(match);
                    }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 font-medium text-stone-800"
                  >
                    <option value="Desktop (1280x800)">Desktop (1280 x 800)</option>
                    <option value="Mobile (375x812)">Mobile iPhone / Pixel (375 x 812)</option>
                    <option value="Slide Deck (1920x1080)">Slide Deck 16:9 (1920 x 1080)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 uppercase font-mono mb-1.5">
                  Description & Context (Optional)
                </label>
                <input
                  type="text"
                  value={deskDesc}
                  onChange={(e) => setDeskDesc(e.target.value)}
                  placeholder="Target audience, curriculum goals, or styling preferences..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 text-stone-700"
                />
              </div>
            </form>
          )}

          {/* TAB 2: AI PROMPT SYNTHESIZER */}
          {activeTab === 'ai_synthesis' && (
            <form id="new-desk-ai-form" onSubmit={handleCreateWithAi} className="space-y-4">
              <div className="p-4 bg-purple-50/60 border border-purple-200/80 rounded-2xl flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-purple-950">
                    Petri Autonomous Design Synthesizer
                  </div>
                  <div className="text-[11px] text-purple-700 mt-0.5 leading-relaxed">
                    Describe your desired page, layout, or pedagogical tool. The AI engine applies Tiffany tokens, responsive Tailwind containers, and interactive elements in one shot.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 uppercase font-mono mb-1.5">
                  Natural Language Design Prompt
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Build an administrative grade verification page for Bangkok Bilingual School with DINA latent mastery scores, student attendance sparklines, teacher signoff buttons, and CSV export..."
                  rows={4}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs focus:outline-none focus:border-teal-500 font-sans leading-relaxed text-stone-800"
                  required
                />
              </div>

              {/* Prompt Suggestions */}
              <div>
                <div className="text-[10px] font-mono uppercase text-stone-400 font-semibold mb-1.5">
                  Quick Prompt Starters (Click to Fill)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setAiPrompt(prompt)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-[11px] rounded-lg transition-colors text-left"
                    >
                      ✦ {prompt.substring(0, 50)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Tone Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 uppercase font-mono mb-1.5">
                    Visual Design Tone
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'tiffany', label: 'Tiffany Clean', color: '#0ABAB5' },
                      { id: 'academic', label: 'Academic Green', color: '#0D9488' },
                      { id: 'dark', label: 'Dark Executive', color: '#6366F1' },
                      { id: 'vibrant', label: 'Vibrant Modern', color: '#EC4899' },
                    ].map((st) => (
                      <button
                        type="button"
                        key={st.id}
                        onClick={() => setAiStyle(st.id as any)}
                        className={`p-2 rounded-xl border text-left text-xs font-semibold flex items-center space-x-2 transition cursor-pointer ${
                          aiStyle === st.id
                            ? 'border-teal-600 bg-teal-50/80 ring-1 ring-teal-600 text-teal-950'
                            : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: st.color }}
                        />
                        <span>{st.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 uppercase font-mono mb-1.5">
                    Workdesk Project Name
                  </label>
                  <input
                    type="text"
                    value={deskName}
                    onChange={(e) => setDeskName(e.target.value)}
                    placeholder="e.g. AI Synthesized Scorebook"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 font-medium text-stone-800"
                  />
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: IMPORT WIREFRAME */}
          {activeTab === 'import' && (
            <form id="new-desk-import-form" onSubmit={handleImportSubmit} className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".html,.json"
                className="hidden"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                }}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                  isDragOver
                    ? 'border-teal-500 bg-teal-50/80 scale-[0.99]'
                    : 'border-stone-300 bg-stone-50/60 hover:bg-stone-50 hover:border-teal-400'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-center text-teal-600">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900">
                    Drop your HTML or JSON workdesk file here
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Supports standalone .html mockups, prototypes, and exported Petri workdesk .json bundles
                  </div>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-50"
                >
                  Browse Files
                </button>
              </div>

              {importedFile && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <FileCode className="w-5 h-5 text-teal-600" />
                    <div>
                      <div className="text-xs font-bold text-teal-950">{importedFile.name}</div>
                      <div className="text-[10px] text-teal-700 font-mono">{importedFile.size} · Ready to import</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImportedFile(null)}
                    className="p-1 rounded-lg text-teal-600 hover:text-teal-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 uppercase font-mono mb-1.5">
                  Project Display Name
                </label>
                <input
                  type="text"
                  value={deskName}
                  onChange={(e) => setDeskName(e.target.value)}
                  placeholder="e.g. Imported Wireframe"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 font-medium text-stone-800"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between">
          <div className="text-[11px] text-stone-400 font-mono">
            Press <kbd className="px-1.5 py-0.5 bg-white border border-stone-200 rounded text-stone-600 font-bold">Esc</kbd> to cancel
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>

            {activeTab === 'gallery' && (
              <button
                type="submit"
                form="new-desk-gallery-form"
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                <span>Create Workdesk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {activeTab === 'ai_synthesis' && (
              <button
                type="submit"
                form="new-desk-ai-form"
                disabled={isSynthesizing || !aiPrompt.trim()}
                className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition cursor-pointer ${
                  isSynthesizing || !aiPrompt.trim()
                    ? 'bg-stone-400 cursor-not-allowed opacity-75'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isSynthesizing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Synthesizing Prototype...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Synthesize & Open</span>
                  </>
                )}
              </button>
            )}

            {activeTab === 'import' && (
              <button
                type="submit"
                form="new-desk-import-form"
                disabled={!importedFile}
                className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition cursor-pointer ${
                  !importedFile
                    ? 'bg-stone-400 cursor-not-allowed opacity-75'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import & Open Workdesk</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
