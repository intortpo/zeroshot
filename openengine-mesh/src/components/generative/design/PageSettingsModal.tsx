import React, { useState } from 'react';
import { X, Settings, Copy, Trash2, Globe } from 'lucide-react';
import { PetriSitePage, PetriWorkdeskDimensions } from '../../../services/openDesignService';

interface PageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: PetriSitePage;
  canDelete: boolean;
  onSave: (updated: {
    title: string;
    route: string;
    dimensions: PetriWorkdeskDimensions;
    seo?: PetriSitePage['seo'];
  }) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const DIMENSION_PRESETS: PetriWorkdeskDimensions[] = [
  { width: 1280, height: 800, label: 'Desktop (1280x800)' },
  { width: 1440, height: 900, label: 'Widescreen (1440x900)' },
  { width: 768, height: 1024, label: 'Tablet (768x1024)' },
  { width: 375, height: 812, label: 'Mobile (375x812)' },
];

export const PageSettingsModal: React.FC<PageSettingsModalProps> = ({
  isOpen,
  onClose,
  page,
  canDelete,
  onSave,
  onDuplicate,
  onDelete,
}) => {
  const [title, setTitle] = useState(page.title);
  const [route, setRoute] = useState(page.route);
  const [selectedDimensions, setSelectedDimensions] = useState<PetriWorkdeskDimensions>(
    page.dimensions || DIMENSION_PRESETS[0]
  );
  const [metaTitle, setMetaTitle] = useState(page.seo?.metaTitle || page.title);
  const [metaDesc, setMetaDesc] = useState(page.seo?.metaDescription || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: title.trim() || 'Untitled Page',
      route: route.trim().startsWith('/') ? route.trim() : '/' + route.trim(),
      dimensions: selectedDimensions,
      seo: {
        metaTitle,
        metaDescription: metaDesc,
        keywords: [],
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Page & Route Settings</h3>
              <p className="text-[11px] text-stone-500">
                Configure URL path, viewport dimensions, and metadata for "{page.title}".
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-stone-200 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">Page Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pricing Matrix"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-500"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-700">URL Route</label>
              <input
                type="text"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder="e.g. /pricing"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs focus:outline-none focus:border-teal-500"
                required
              />
            </div>
          </div>

          {/* Viewport Dimensions */}
          <div className="space-y-1.5">
            <label className="font-semibold text-stone-700">Target Viewport Dimensions</label>
            <div className="grid grid-cols-2 gap-2">
              {DIMENSION_PRESETS.map((preset) => {
                const isSelected = selectedDimensions.label === preset.label;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setSelectedDimensions(preset)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/50 text-teal-900 font-bold'
                        : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
            <div className="flex items-center space-x-1.5 font-bold text-stone-800 text-[11px]">
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>SEO & Meta Header</span>
            </div>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Browser Tab Title"
              className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
            />
            <textarea
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              placeholder="Search engine meta description..."
              rows={2}
              className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
            />
          </div>

          {/* Page Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  onDuplicate();
                  onClose();
                }}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate Page</span>
              </button>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete page "${page.title}"?`)) {
                      onDelete();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Page</span>
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs shadow-sm transition"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
