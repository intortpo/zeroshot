import React, { useState } from 'react';
import {
  Copy,
  Check,
  FileCode,
  Package,
} from 'lucide-react';

interface BevyCodeInspectorProps {
  gameTitle: string;
  dimension: '2d' | '3d';
  bevyCode: string;
  bevyVersion: string;
  avianVersion: string;
}

export const BevyCodeInspector: React.FC<BevyCodeInspectorProps> = ({
  gameTitle,
  dimension,
  bevyCode,
  bevyVersion,
  avianVersion,
}) => {
  const [activeTab, setActiveTab] = useState<'main.rs' | 'Cargo.toml'>('main.rs');
  const [copied, setCopied] = useState(false);

  const avianCrate = dimension === '2d' ? 'avian2d' : 'avian3d';

  const cargoTomlContent = `[package]
name = "${gameTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}"
version = "0.1.0"
edition = "2024"

[dependencies]
bevy = "${bevyVersion}"
${avianCrate} = "${avianVersion}"
serde = { version = "1.0", features = ["derive"] }
`;

  const currentContent = activeTab === 'main.rs' ? bevyCode : cargoTomlContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full subtle-depth rounded-2xl overflow-hidden border border-stone-200/80 font-sans">
      {/* Code Inspector Header */}
      <div className="p-3.5 border-b border-stone-200/80 bg-white/80 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* File Switcher Tabs */}
          <button
            type="button"
            onClick={() => setActiveTab('main.rs')}
            className={`subtle-depth-interactive flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-sans border transition-all ${
              activeTab === 'main.rs'
                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                : 'bg-white/90 text-stone-700 hover:text-stone-950 border-stone-200/90'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-[#0ABAB5]" />
            <span>src/main.rs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('Cargo.toml')}
            className={`subtle-depth-interactive flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-sans border transition-all ${
              activeTab === 'Cargo.toml'
                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                : 'bg-white/90 text-stone-700 hover:text-stone-950 border-stone-200/90'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-stone-500" />
            <span>Cargo.toml</span>
          </button>
        </div>

        {/* Copy & Export */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopy}
            className="subtle-depth-interactive flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-sans text-stone-700 bg-white/90 border border-stone-200/90 hover:border-stone-400"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-stone-500" />
            )}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Code Viewer Viewport */}
      <div className="flex-1 overflow-auto p-4 bg-stone-50/50">
        <pre className="font-mono text-xs text-stone-800 leading-relaxed overflow-x-auto selection:bg-stone-200">
          <code>{currentContent}</code>
        </pre>
      </div>

      {/* Footer Status */}
      <div className="px-4 py-2 border-t border-stone-200/80 bg-white/70 text-[11px] text-stone-500 flex items-center justify-between font-sans">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Synthesized for Bevy {bevyVersion} & {avianCrate} {avianVersion}</span>
        </span>
        <span>ECS Archetypes: 4 Systems</span>
      </div>
    </div>
  );
};
