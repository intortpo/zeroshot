import React, { useState, useEffect, useRef } from 'react';
import { Settings, RefreshCw, ExternalLink } from 'lucide-react';
import { loadStoredPySpurSettings, PySpurSettings } from './PySpurSettingsModal';

export interface PetriPySpurStudioViewProps {
  onOpenSettings?: () => void;
  iframeUrl?: string;
}

export const PetriPySpurStudioView: React.FC<PetriPySpurStudioViewProps> = ({
  onOpenSettings,
  iframeUrl,
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>(() => {
    if (iframeUrl) return iframeUrl;
    const settings = loadStoredPySpurSettings();
    return settings.apiUrl || 'http://127.0.0.1:8000';
  });
  const [isReloading, setIsReloading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync if prop changes
  useEffect(() => {
    if (iframeUrl) {
      setCurrentUrl(iframeUrl);
    }
  }, [iframeUrl]);

  // Listen for settings update events
  useEffect(() => {
    const handleSettingsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<PySpurSettings>;
      if (customEvent.detail?.apiUrl && !iframeUrl) {
        setCurrentUrl(customEvent.detail.apiUrl);
      }
    };

    window.addEventListener('petri_pyspur_settings_updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('petri_pyspur_settings_updated', handleSettingsUpdated);
    };
  }, [iframeUrl]);

  const handleRefresh = () => {
    setIsReloading(true);
    if (iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = src;
        }
        setIsReloading(false);
      }, 150);
    } else {
      setIsReloading(false);
    }
  };

  const handleOpenExternal = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 font-sans select-none">
      {/* Sleek, Minimal Top Header */}
      <header className="h-14 px-5 bg-white border-b border-slate-200/80 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)] z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-slate-900 tracking-tight">
            PySpur Studio
          </h1>
          <div className="h-3.5 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500 font-normal">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{currentUrl}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleRefresh}
            title="Reload Studio View"
            disabled={isReloading}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            aria-label="Reload PySpur Studio"
          >
            <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenExternal}
            title="Open in new window"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Open in external browser"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            title="PySpur Settings"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors ml-1"
            aria-label="PySpur settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body: 100% Width & Height Iframe */}
      <main className="flex-1 w-full h-full relative overflow-hidden bg-slate-50">
        <iframe
          ref={iframeRef}
          src={currentUrl}
          title="PySpur Studio"
          className="w-full h-full border-0 bg-white"
          allow="clipboard-read; clipboard-write; cross-origin-isolated"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </main>
    </div>
  );
};
