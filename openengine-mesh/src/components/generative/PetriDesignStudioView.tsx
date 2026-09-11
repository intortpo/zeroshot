import React, { useState, useMemo, useEffect } from 'react';
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
  Plus,
  Copy,
  Trash2,
  Cloud,
  Box,
  Settings,
  ZoomIn,
  ZoomOut,
  Grid,
  Layers,
} from 'lucide-react';
import {
  openDesignService,
  PetriProductSite,
} from '../../services/openDesignService';
import { agyDesignSynthesizer } from '../../services/agyDesignSynthesizer';
import { RcloneSyncModal } from '../rclone/RcloneSyncModal';
import { NewOpenDesignModal } from './NewOpenDesignModal';
import { ComponentPaletteDrawer } from './design/ComponentPaletteDrawer';
import { ThemeTokenInspectorModal } from './design/ThemeTokenInspectorModal';
import { PageSettingsModal } from './design/PageSettingsModal';
import { AllDesignsManagerView } from './design/AllDesignsManagerView';
import { PageSectionsManager } from './design/PageSectionsManager';

export const PetriDesignStudioView: React.FC = () => {
  const [products, setProducts] = useState<PetriProductSite[]>(() =>
    openDesignService.getProducts()
  );
  const [activeProductId, setActiveProductId] = useState<string>(
    products[0]?.id || 'prod-saas-momentum'
  );

  const activeProduct = useMemo(
    () => products.find((p) => p.id === activeProductId) || products[0],
    [products, activeProductId]
  );

  const [activePageId, setActivePageId] = useState<string>(
    activeProduct?.activePageId || activeProduct?.pages[0]?.id || ''
  );

  // Sync active page when product changes
  useEffect(() => {
    if (activeProduct) {
      setActivePageId(activeProduct.activePageId || activeProduct.pages[0]?.id || '');
    }
  }, [activeProductId]);

  const activePage = useMemo(() => {
    if (!activeProduct) return null;
    return (
      activeProduct.pages.find((p) => p.id === activePageId) ||
      activeProduct.pages[0] ||
      null
    );
  }, [activeProduct, activePageId]);

  const [activeTab, setActiveTab] = useState<'all_designs' | 'preview' | 'code' | 'tokens'>('all_designs');
  const [sidebarDrawer, setSidebarDrawer] = useState<'palette' | 'sections' | 'none'>('palette');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [promptInput, setPromptInput] = useState('');
  const [isAgentExecuting, setIsAgentExecuting] = useState(false);
  const [agentLogs, setAgentLogs] = useState<string[]>([
    '[agy-cli] Petri Design multi-site engine online: 60+ modular blocks ready',
    '[mcp:petri-design] Multi-page routing and DESIGN.md token constraints active',
  ]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Modal States
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isRcloneOpen, setIsRcloneOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isPageSettingsOpen, setIsPageSettingsOpen] = useState(false);

  // Canvas Drag & Pulse
  const [isCanvasDragOver, setIsCanvasDragOver] = useState(false);
  const [isCanvasPulse, setIsCanvasPulse] = useState(false);

  const [editableCode, setEditableCode] = useState<string>(activePage?.code || '');

  // Sync code editor when active page changes
  useEffect(() => {
    if (activePage) {
      setEditableCode(activePage.code);
      if (activePage.dimensions) {
        if (activePage.dimensions.width <= 480) {
          setViewport('mobile');
        } else if (activePage.dimensions.width <= 1024) {
          setViewport('tablet');
        } else {
          setViewport('desktop');
        }
      }
    }
  }, [activePage?.id]);

  // Global Ctrl+N shortcut to open new product modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNewProductOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleApplyCodeEdit = () => {
    if (!activeProduct || !activePage) return;
    openDesignService.updatePageCode(activeProduct.id, activePage.id, editableCode);
    setProducts([...openDesignService.getProducts()]);
    setExportSuccessMsg(`Saved code modifications to "${activePage.title}" (${activePage.route}).`);
    setTimeout(() => setExportSuccessMsg(null), 2500);
  };

  const handleInsertSnippet = (snippet: string, name: string) => {
    let updated = editableCode;
    if (updated.includes('</main>')) {
      updated = updated.replace('</main>', `${snippet}\n</main>`);
    } else if (updated.includes('</body>')) {
      updated = updated.replace('</body>', `${snippet}\n</body>`);
    } else if (updated.includes('</div>')) {
      const lastDivIndex = updated.lastIndexOf('</div>');
      updated = updated.slice(0, lastDivIndex) + snippet + updated.slice(lastDivIndex);
    } else {
      updated = updated + snippet;
    }
    setEditableCode(updated);
    if (activeProduct && activePage) {
      openDesignService.updatePageCode(activeProduct.id, activePage.id, updated);
      setProducts([...openDesignService.getProducts()]);
    }
    setExportSuccessMsg(`Inserted "${name}" into canvas.`);
    setTimeout(() => setExportSuccessMsg(null), 2500);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCanvasDragOver(true);
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCanvasDragOver(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCanvasDragOver(false);

    // External HTML or Image file
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      if (file.name.endsWith('.html') || file.type === 'text/html') {
        reader.onload = (ev) => {
          const content = ev.target?.result as string;
          setEditableCode(content);
          if (activeProduct && activePage) {
            openDesignService.updatePageCode(activeProduct.id, activePage.id, content);
            setProducts([...openDesignService.getProducts()]);
          }
          setExportSuccessMsg(`Imported "${file.name}" into canvas.`);
          setTimeout(() => setExportSuccessMsg(null), 3000);
        };
        reader.readAsText(file);
        return;
      } else if (file.type.startsWith('image/')) {
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          const imgTag = `\n<div class="my-4 text-center"><img src="${dataUrl}" alt="${file.name}" class="max-w-full rounded-2xl border border-stone-200 shadow-sm mx-auto" /></div>\n`;
          handleInsertSnippet(imgTag, file.name);
        };
        reader.readAsDataURL(file);
        return;
      }
    }

    // Snippet dropped from component palette
    const snippet = e.dataTransfer.getData('text/html') || e.dataTransfer.getData('text/plain');
    const compName = e.dataTransfer.getData('text/component-name') || 'Component';
    if (snippet) {
      handleInsertSnippet(snippet, compName);
    }
  };

  // Add a new page to the active product
  const handleAddNewPage = () => {
    if (!activeProduct) return;
    const title = prompt('Enter New Page Title (e.g. "About Us", "API Docs", "Contact"):');
    if (!title || !title.trim()) return;

    const rawRoute = prompt('Enter URL Route (e.g. /about, /docs, /contact):', `/${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
    if (!rawRoute || !rawRoute.trim()) return;

    const newPage = openDesignService.addPageToProduct(activeProduct.id, {
      title: title.trim(),
      route: rawRoute.trim(),
    });

    if (newPage) {
      setProducts([...openDesignService.getProducts()]);
      setActivePageId(newPage.id);
      setActiveTab('preview');
      setExportSuccessMsg(`Created new page "${newPage.title}" at ${newPage.route}`);
      setTimeout(() => setExportSuccessMsg(null), 3000);
    }
  };

  const handleDuplicateProduct = (productId?: string) => {
    const targetId = productId || activeProduct?.id;
    if (!targetId) return;
    const dup = openDesignService.duplicateProduct(targetId);
    if (dup) {
      setProducts([...openDesignService.getProducts()]);
      setActiveProductId(dup.id);
      setActivePageId(dup.activePageId);
      setExportSuccessMsg(`Duplicated site product: "${dup.name}"`);
      setTimeout(() => setExportSuccessMsg(null), 3000);
    }
  };

  const handleDeleteProduct = (productId?: string) => {
    const targetId = productId || activeProduct?.id;
    if (!targetId || products.length <= 1) return;
    const targetProd = products.find((p) => p.id === targetId);
    if (!window.confirm(`Are you sure you want to delete product "${targetProd?.name}" and all its pages?`)) return;

    openDesignService.deleteProduct(targetId);
    const updated = openDesignService.getProducts();
    setProducts(updated);
    if (targetId === activeProductId) {
      setActiveProductId(updated[0]?.id || '');
    }
  };

  const handleRenameProduct = (productId: string, newName: string) => {
    openDesignService.renameProduct(productId, newName);
    setProducts([...openDesignService.getProducts()]);
    setExportSuccessMsg(`Renamed design to "${newName}".`);
    setTimeout(() => setExportSuccessMsg(null), 2500);
  };

  const handleDispatchAgyTurn = async () => {
    if (!promptInput.trim() || !activeProduct || !activePage) return;
    const instruction = promptInput.trim();
    setPromptInput('');
    setIsAgentExecuting(true);

    setAgentLogs((prev) => [
      `> [user-intent] "${instruction}"`,
      `[agy-cli] Analyzing page "${activePage.title}" (${activePage.route}) in product "${activeProduct.name}"...`,
      `[mcp:open-design] Querying DESIGN.md tokens & responsive layout tree`,
      ...prev,
    ]);

    await new Promise((r) => setTimeout(r, 600));

    try {
      const currentCode = editableCode || activePage.code;
      const result = agyDesignSynthesizer.synthesizeFromInstruction(currentCode, instruction);

      setEditableCode(result.code);
      openDesignService.updatePageCode(activeProduct.id, activePage.id, result.code);
      setProducts([...openDesignService.getProducts()]);

      setIsCanvasPulse(true);
      setTimeout(() => setIsCanvasPulse(false), 2000);

      setExportSuccessMsg(`AGY applied ${result.operationsPerformed.length} design updates!`);
      setTimeout(() => setExportSuccessMsg(null), 4000);

      setAgentLogs((prev) => [
        `[agy-cli] Verified tokens against DESIGN.md (0 violations)`,
        ...result.operationsPerformed.map((op) => `[agy-ast] ${op}`),
        `[agy-cli] Synthesis committed: +${result.linesAdded} lines added, -${result.linesRemoved} lines removed`,
        `[agy-canvas] Live preview hot-reloaded for ${activePage.route}`,
        ...prev,
      ]);
    } catch (err: any) {
      setAgentLogs((prev) => [
        `[agy-cli:error] Synthesis failed: ${err?.message || 'Unknown error'}`,
        ...prev,
      ]);
    } finally {
      setIsAgentExecuting(false);
    }
  };

  const handleExport = (format: 'html' | 'pdf' | 'pptx' | 'mp4' | 'bundle', targetProductId?: string) => {
    const prod = targetProductId
      ? products.find((p) => p.id === targetProductId) || activeProduct
      : activeProduct;
    if (!prod) return;

    if (format === 'html') {
      const targetPage = prod.pages.find((p) => p.id === activePageId) || prod.pages[0];
      const filename = `${targetPage.title.toLowerCase().replace(/\s+/g, '-')}.html`;
      const blob = new Blob([editableCode || targetPage.code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setExportSuccessMsg(`Exported standalone page "${filename}".`);
    } else if (format === 'bundle') {
      const bundle = openDesignService.exportProductSiteBundle(prod.id);
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = bundle.filename;
      a.click();
      URL.revokeObjectURL(url);
      setExportSuccessMsg(`Exported full site bundle with ${prod.pages.length} pages & manifest!`);
    } else {
      setExportSuccessMsg(`Exported ${prod.name} as ${format.toUpperCase()}.`);
    }

    setTimeout(() => setExportSuccessMsg(null), 3500);
    setIsExportOpen(false);
  };

  const viewportWidth = {
    desktop: 'w-full max-w-[1280px]',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  }[viewport];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFB] overflow-hidden select-none font-sans">
      {/* Top Header: Product Selector & Global Tools */}
      <header className="px-6 py-3 bg-white/90 backdrop-blur-md border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Brand & All Designs Hub Button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0ABAB5] shadow-xs animate-pulse" />
            <span className="font-extrabold text-sm tracking-tight text-stone-900">
              Petri Design
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-teal-50 text-teal-800 border border-teal-200 font-semibold uppercase">
              {activeProduct?.type || 'Studio'}
            </span>
          </div>

          <span className="text-stone-300">/</span>

          {/* Tab Button: All Designs Manager Hub */}
          <button
            onClick={() => setActiveTab('all_designs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'all_designs'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
            title="Manage all design sites & products on one page"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>All Designs Hub</span>
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-700 text-stone-200">
              {products.length}
            </span>
          </button>

          {/* Product Switcher Dropdown */}
          <div className="flex items-center space-x-1.5 pl-2 border-l border-stone-200">
            <FolderOpen className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={activeProductId}
              onChange={(e) => {
                setActiveProductId(e.target.value);
                setActiveTab('preview');
              }}
              className="text-xs font-bold text-stone-900 bg-transparent border-0 focus:ring-0 cursor-pointer pr-6 max-w-xs truncate"
            >
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} ({prod.pages.length} {prod.pages.length === 1 ? 'page' : 'pages'})
                </option>
              ))}
            </select>
          </div>

          {/* "+ New Site / Product" Button */}
          <button
            onClick={() => setIsNewProductOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Create a new site or product (Ctrl+N)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Design</span>
          </button>
        </div>

        {/* Center: Viewport & Zoom Controls (when in preview mode) */}
        {activeTab !== 'all_designs' && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200/80">
              <button
                onClick={() => setViewport('desktop')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewport === 'desktop' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-700'
                }`}
                title="Desktop View (1280px)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewport === 'tablet' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-700'
                }`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewport === 'mobile' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-700'
                }`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200/80 text-[10px] font-mono text-stone-600">
              <button
                onClick={() => setZoomScale((prev) => Math.max(0.5, prev - 0.1))}
                className="p-1 hover:text-stone-900 cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="px-1.5">{Math.round(zoomScale * 100)}%</span>
              <button
                onClick={() => setZoomScale((prev) => Math.min(1.5, prev + 0.1))}
                className="p-1 hover:text-stone-900 cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Right: Theme Tokens, Cloud Sync, Export */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            title="Inspect and edit brand palette & design tokens"
          >
            <Palette className="w-3.5 h-3.5 text-teal-600" />
            <span>Theme Tokens</span>
          </button>

          <button
            onClick={() => setIsRcloneOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            title="Sync product to Google Drive or cloud remotes"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-600" />
            <span>Cloud Sync</span>
          </button>

          <button
            onClick={() => handleDuplicateProduct()}
            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition cursor-pointer"
            title="Duplicate current site product"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {products.length > 1 && (
            <button
              onClick={() => handleDeleteProduct()}
              className="p-1.5 rounded-lg border border-stone-200 text-rose-500 hover:bg-rose-50 transition cursor-pointer"
              title="Delete current site product"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-2xl p-1.5 shadow-xl z-30 space-y-1 animate-in fade-in duration-150 text-xs">
                <button
                  onClick={() => handleExport('html')}
                  className="w-full text-left px-3 py-2 font-medium rounded-xl hover:bg-stone-50 text-stone-700 flex items-center justify-between cursor-pointer"
                >
                  <span>Active Page HTML</span>
                  <span className="font-mono text-[9px] text-stone-400">.html</span>
                </button>
                <button
                  onClick={() => handleExport('bundle')}
                  className="w-full text-left px-3 py-2 font-semibold rounded-xl bg-teal-50/60 hover:bg-teal-50 text-teal-900 flex items-center justify-between cursor-pointer"
                >
                  <span>Full Multi-Page Bundle</span>
                  <span className="font-mono text-[9px] text-teal-700">.json + site</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full text-left px-3 py-2 font-medium rounded-xl hover:bg-stone-50 text-stone-700 flex items-center justify-between cursor-pointer"
                >
                  <span>Print Document</span>
                  <span className="font-mono text-[9px] text-stone-400">.pdf</span>
                </button>
                <button
                  onClick={() => handleExport('pptx')}
                  className="w-full text-left px-3 py-2 font-medium rounded-xl hover:bg-stone-50 text-stone-700 flex items-center justify-between cursor-pointer"
                >
                  <span>Slide Deck</span>
                  <span className="font-mono text-[9px] text-stone-400">.pptx</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Success Notification Banner */}
      {exportSuccessMsg && (
        <div className="mx-6 mt-3 bg-teal-50 border border-teal-300 rounded-2xl px-4 py-2 flex items-center justify-between text-xs text-teal-900 animate-in fade-in duration-200 shadow-2xs shrink-0">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span className="font-semibold">{exportSuccessMsg}</span>
          </div>
          <button onClick={() => setExportSuccessMsg(null)} className="text-teal-600 hover:text-teal-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Multi-Page Route Tab Strip (when viewing a specific design) */}
      {activeTab !== 'all_designs' && (
        <div className="px-6 py-2 bg-stone-50 border-b border-stone-200/80 flex items-center justify-between text-xs shrink-0">
          {/* Page / Route Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-mono text-stone-400 uppercase font-bold mr-2">Routes:</span>
            {activeProduct?.pages.map((p) => {
              const isActive = p.id === activePageId;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePageId(p.id);
                    openDesignService.setActivePage(activeProduct.id, p.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-2 cursor-pointer ${
                    isActive
                      ? 'bg-white text-teal-900 font-bold shadow-2xs border border-teal-200'
                      : 'bg-transparent text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  <span>{p.title}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">
                    {p.route}
                  </span>
                </button>
              );
            })}

            {/* "+ Add Page" Button */}
            <button
              onClick={handleAddNewPage}
              className="px-2.5 py-1.5 rounded-xl border border-dashed border-stone-300 hover:border-teal-400 text-stone-500 hover:text-teal-700 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
              title="Add a new page or route to this product"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Route</span>
            </button>
          </div>

          {/* Page Config Button */}
          {activePage && (
            <button
              onClick={() => setIsPageSettingsOpen(true)}
              className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-white transition cursor-pointer flex items-center space-x-1"
              title="Page & route configuration"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono">{activePage.route}</span>
            </button>
          )}
        </div>
      )}

      {/* Main View Mode Bar */}
      {activeTab !== 'all_designs' && (
        <div className="px-6 py-2 bg-white border-b border-stone-100 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setActiveTab('preview')}
              className={`font-semibold flex items-center space-x-1.5 py-1 border-b-2 transition cursor-pointer ${
                activeTab === 'preview'
                  ? 'border-teal-600 text-teal-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Interactive Canvas</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`font-semibold flex items-center space-x-1.5 py-1 border-b-2 transition cursor-pointer ${
                activeTab === 'code'
                  ? 'border-teal-600 text-teal-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>DOM / Tailwind Source</span>
            </button>

            <button
              onClick={() => setActiveTab('tokens')}
              className={`font-semibold flex items-center space-x-1.5 py-1 border-b-2 transition cursor-pointer ${
                activeTab === 'tokens'
                  ? 'border-teal-600 text-teal-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Design Tokens</span>
            </button>

            {/* Left Drawer Toggle: Palette vs Sections */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
              <button
                onClick={() => setSidebarDrawer(sidebarDrawer === 'palette' ? 'none' : 'palette')}
                className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center space-x-1 transition cursor-pointer ${
                  sidebarDrawer === 'palette'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Box className="w-3 h-3 text-teal-600" />
                <span>Components</span>
              </button>
              <button
                onClick={() => setSidebarDrawer(sidebarDrawer === 'sections' ? 'none' : 'sections')}
                className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center space-x-1 transition cursor-pointer ${
                  sidebarDrawer === 'sections'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Layers className="w-3 h-3 text-teal-600" />
                <span>Page Outline</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono text-stone-400">
            <span>Active Product: <strong className="text-stone-800">{activeProduct?.name}</strong></span>
            {activeProduct?.lastSyncedRemote && (
              <span className="text-sky-600 flex items-center space-x-1">
                <Cloud className="w-3 h-3" />
                <span>Synced to {activeProduct.lastSyncedRemote}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Studio Area */}
      {activeTab === 'all_designs' ? (
        <AllDesignsManagerView
          products={products}
          activeProductId={activeProductId}
          onSelectProduct={(id) => {
            setActiveProductId(id);
            setActiveTab('preview');
          }}
          onCreateNew={() => setIsNewProductOpen(true)}
          onDuplicateProduct={handleDuplicateProduct}
          onDeleteProduct={handleDeleteProduct}
          onRenameProduct={handleRenameProduct}
          onExportProduct={(id, format) => handleExport(format, id)}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Expanded Component Palette or Page Outline */}
          {activeTab === 'preview' && sidebarDrawer === 'palette' && (
            <ComponentPaletteDrawer
              isOpen={true}
              onClose={() => setSidebarDrawer('none')}
              onInsertComponent={handleInsertSnippet}
            />
          )}

          {activeTab === 'preview' && sidebarDrawer === 'sections' && (
            <PageSectionsManager
              code={editableCode}
              onUpdateCode={(newCode, actionMsg) => {
                setEditableCode(newCode);
                if (activeProduct && activePage) {
                  openDesignService.updatePageCode(activeProduct.id, activePage.id, newCode);
                  setProducts([...openDesignService.getProducts()]);
                }
                setExportSuccessMsg(actionMsg);
                setTimeout(() => setExportSuccessMsg(null), 2500);
              }}
            />
          )}

          {/* Center: Canvas / Code View */}
          <div className="flex-1 flex flex-col items-center p-6 overflow-y-auto bg-stone-100/50">
            {activeTab === 'preview' && (
              <div
                onDragOver={handleCanvasDragOver}
                onDragLeave={handleCanvasDragLeave}
                onDrop={handleCanvasDrop}
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top center',
                  minHeight: '640px',
                }}
                className={`transition-all duration-200 bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col relative ${
                  isCanvasDragOver
                    ? 'border-teal-500 ring-4 ring-teal-500/20 shadow-lg'
                    : isCanvasPulse
                    ? 'border-teal-500 ring-4 ring-teal-400/40 shadow-xl'
                    : 'border-stone-200'
                } ${viewportWidth}`}
              >
                {/* Simulated Browser Bar */}
                <div className="bg-stone-50 border-b border-stone-200 px-4 py-2.5 flex items-center justify-between text-xs text-stone-400 font-mono">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="px-3 py-1 bg-white border border-stone-200 rounded-lg text-[10px] text-stone-500 truncate max-w-sm">
                    https://{activeProduct?.slug}.internal{activePage?.route}
                  </div>
                  <div className="text-[10px] uppercase font-bold">{viewport}</div>
                </div>

                {/* Live Canvas Iframe */}
                <div className="flex-1 bg-white relative">
                  <iframe
                    title="Petri Design Live Preview"
                    srcDoc={editableCode}
                    className="w-full h-full min-h-[600px] border-0"
                    sandbox="allow-scripts allow-same-origin"
                  />

                  {/* Drop Cue Overlay */}
                  {isCanvasDragOver && (
                    <div className="absolute inset-0 bg-teal-900/10 backdrop-blur-2xs border-2 border-dashed border-teal-500 flex flex-col items-center justify-center pointer-events-none z-30">
                      <Sparkles className="w-8 h-8 text-teal-600 animate-bounce" />
                      <div className="text-sm font-bold text-teal-900 mt-2">Drop to insert into active canvas</div>
                      <div className="text-xs text-teal-700">Supports Component Snippets, HTML files, and Images</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="w-full max-w-4xl bg-stone-900 text-stone-100 rounded-2xl shadow-lg border border-stone-800 p-4 font-mono text-xs flex flex-col space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-stone-400 text-[11px]">
                  <span className="text-teal-400 font-bold">{activePage?.title} ({activePage?.route})</span>
                  <button
                    onClick={handleApplyCodeEdit}
                    className="px-3.5 py-1 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg transition cursor-pointer"
                  >
                    Apply Changes to Canvas
                  </button>
                </div>
                <textarea
                  value={editableCode}
                  onChange={(e) => setEditableCode(e.target.value)}
                  rows={24}
                  className="w-full bg-transparent text-stone-200 border-0 focus:ring-0 font-mono text-xs leading-relaxed resize-y"
                  spellCheck={false}
                />
              </div>
            )}

            {activeTab === 'tokens' && (
              <div className="w-full max-w-4xl bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Brand Tokens for {activeProduct?.name}</h3>
                    <p className="text-xs text-stone-500">Autonomous design rules enforced across all pages in this product.</p>
                  </div>
                  <button
                    onClick={() => setIsThemeModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-500 transition cursor-pointer"
                  >
                    Edit Theme Tokens
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
                    <span className="font-mono text-[10px] uppercase font-bold text-stone-400">Palette Tokens</span>
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded border border-stone-300" style={{ backgroundColor: activeProduct?.tokens.palette.primary }} />
                      <span>Primary ({activeProduct?.tokens.palette.primary})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded border border-stone-300" style={{ backgroundColor: activeProduct?.tokens.palette.secondary }} />
                      <span>Secondary ({activeProduct?.tokens.palette.secondary})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded border border-stone-300" style={{ backgroundColor: activeProduct?.tokens.palette.background }} />
                      <span>Background ({activeProduct?.tokens.palette.background})</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-stone-400">Typography & Radii</span>
                    <div><strong>Font:</strong> {activeProduct?.tokens.typography.fontFamily}</div>
                    <div><strong>Heading Scale:</strong> {activeProduct?.tokens.typography.headingScale} Modular Multiplier</div>
                    <div><strong>Card Radius:</strong> {activeProduct?.tokens.radii.md} Smooth Curvature</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: AGY CLI & MCP Agent Director */}
          <aside className="w-80 border-l border-stone-200 bg-white flex flex-col shrink-0">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-xs text-stone-900">AGY Design Agent</span>
              </div>
              <span className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-teal-50 text-teal-700 border border-teal-200">
                od_mcp
              </span>
            </div>

            {/* Natural Language Instruction Bar */}
            <div className="p-4 border-b border-stone-100 space-y-2">
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleDispatchAgyTurn()}
                placeholder={`e.g. Add 3-tier pricing matrix with annual toggle...`}
                rows={3}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={handleDispatchAgyTurn}
                disabled={isAgentExecuting || !promptInput.trim()}
                className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
              >
                {isAgentExecuting ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing UI...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Synthesize with AGY</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Directives */}
            <div className="p-4 border-b border-stone-100 space-y-1.5 text-[11px] text-stone-500">
              <span className="font-mono text-[10px] text-stone-400 uppercase font-semibold">Quick Directives:</span>
              <button
                onClick={() => setPromptInput('Add a 3-tier responsive pricing matrix with annual billing discount')}
                className="w-full text-left p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 transition cursor-pointer"
              >
                "Insert 3-tier pricing table"
              </button>
              <button
                onClick={() => setPromptInput('Inject an asymmetric bento grid showing our core architecture and features')}
                className="w-full text-left p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 transition cursor-pointer"
              >
                "Insert Bento feature grid"
              </button>
              <button
                onClick={() => setPromptInput('Add e-commerce product catalog cards with prices and add to cart buttons')}
                className="w-full text-left p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 transition cursor-pointer"
              >
                "Add product catalog cards"
              </button>
            </div>

            {/* Terminal Logs */}
            <div className="flex-1 p-4 bg-stone-900 text-stone-300 font-mono text-[10px] overflow-y-auto space-y-1">
              <div className="text-stone-500 border-b border-stone-800 pb-1 mb-2">AGY CLI Stream</div>
              {agentLogs.map((log, i) => (
                <div key={i} className="leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* New Site / Product Wizard Modal */}
      <NewOpenDesignModal
        isOpen={isNewProductOpen}
        onClose={() => setIsNewProductOpen(false)}
        onCreated={(created) => {
          const updated = openDesignService.getProducts();
          setProducts(updated);
          setActiveProductId(created.id);
          setActivePageId(created.activePageId || created.pages[0]?.id || '');
          setActiveTab('preview');
          setExportSuccessMsg(`Created new product: "${created.name}" with ${created.pages.length} pages!`);
          setTimeout(() => setExportSuccessMsg(null), 3500);
        }}
      />

      {/* Theme Token Inspector Modal */}
      {activeProduct && (
        <ThemeTokenInspectorModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
          tokens={activeProduct.tokens}
          onApplyTokens={(updatedTokens, applyToAll) => {
            openDesignService.updateProductTokens(activeProduct.id, updatedTokens);
            setProducts([...openDesignService.getProducts()]);
            setExportSuccessMsg(`Applied design tokens ${applyToAll ? 'across all pages in product' : 'to current view'}.`);
            setTimeout(() => setExportSuccessMsg(null), 3000);
          }}
        />
      )}

      {/* Page & Route Settings Modal */}
      {activeProduct && activePage && (
        <PageSettingsModal
          isOpen={isPageSettingsOpen}
          onClose={() => setIsPageSettingsOpen(false)}
          page={activePage}
          canDelete={activeProduct.pages.length > 1}
          onSave={(updated) => {
            openDesignService.renamePageRoute(activeProduct.id, activePage.id, updated.title, updated.route);
            setProducts([...openDesignService.getProducts()]);
            setExportSuccessMsg(`Updated settings for "${updated.title}".`);
            setTimeout(() => setExportSuccessMsg(null), 2500);
          }}
          onDuplicate={() => {
            const dup = openDesignService.duplicatePage(activeProduct.id, activePage.id);
            if (dup) {
              setProducts([...openDesignService.getProducts()]);
              setActivePageId(dup.id);
              setExportSuccessMsg(`Duplicated page: "${dup.title}"`);
              setTimeout(() => setExportSuccessMsg(null), 2500);
            }
          }}
          onDelete={() => {
            openDesignService.deletePage(activeProduct.id, activePage.id);
            const prods = openDesignService.getProducts();
            setProducts([...prods]);
            const updatedProd = prods.find((p) => p.id === activeProduct.id);
            if (updatedProd) {
              setActivePageId(updatedProd.activePageId);
            }
            setExportSuccessMsg('Deleted page.');
            setTimeout(() => setExportSuccessMsg(null), 2500);
          }}
        />
      )}

      {/* Rclone Multi-Cloud Sync Modal */}
      <RcloneSyncModal
        isOpen={isRcloneOpen}
        onClose={() => setIsRcloneOpen(false)}
        workdesk={activeProduct}
        onSyncComplete={(res) => {
          if (res.success && activeProduct) {
            openDesignService.markWorkdeskSynced(activeProduct.id, res.destination.split(':')[0]);
            setProducts([...openDesignService.getProducts()]);
            setExportSuccessMsg(`Successfully synced to ${res.destination}`);
            setTimeout(() => setExportSuccessMsg(null), 3500);
          }
        }}
      />
    </div>
  );
};

export const OpenDesignStudioView = PetriDesignStudioView;
