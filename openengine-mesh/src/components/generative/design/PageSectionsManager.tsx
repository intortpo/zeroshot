import React, { useMemo } from 'react';
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
} from 'lucide-react';

interface PageSectionItem {
  id: string;
  tag: string;
  name: string;
  code: string;
  startIndex: number;
  endIndex: number;
}

interface PageSectionsManagerProps {
  code: string;
  onUpdateCode: (newCode: string, actionMsg: string) => void;
}

export const PageSectionsManager: React.FC<PageSectionsManagerProps> = ({
  code,
  onUpdateCode,
}) => {
  // Parse sections, nav, header, footer from HTML
  const sections = useMemo<PageSectionItem[]>(() => {
    const items: PageSectionItem[] = [];
    // Match common top-level block tags
    const regex = /<(nav|header|section|footer|main|article)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
    let match: RegExpExecArray | null;
    let idx = 0;

    while ((match = regex.exec(code)) !== null) {
      const tag = match[1].toLowerCase();
      const inner = match[3];

      // Try extracting human-readable name from comment or heading or tag
      let name = '';
      const commentMatch = match[0].match(/<!--\s*([A-Za-z0-9\s-_:]+?)\s*-->/);
      if (commentMatch) {
        name = commentMatch[1].trim();
      } else {
        const headingMatch = inner.match(/<h[1-4]\b[^>]*>(.*?)<\/h[1-4]>/i);
        if (headingMatch) {
          name = headingMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 30);
        } else {
          name = `${tag.toUpperCase()} Block #${idx + 1}`;
        }
      }

      items.push({
        id: `sec-${idx}-${tag}`,
        tag,
        name,
        code: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
      idx++;
    }

    return items;
  }, [code]);

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const current = sections[index];
    const target = sections[targetIndex];

    // Swap in code
    let updated = code.replace(current.code, '___SWAP_TOKEN___');
    updated = updated.replace(target.code, current.code);
    updated = updated.replace('___SWAP_TOKEN___', target.code);

    onUpdateCode(updated, `Moved "${current.name}" ${direction}`);
  };

  const handleDuplicateSection = (index: number) => {
    const sec = sections[index];
    const updated = code.replace(sec.code, `${sec.code}\n\n${sec.code}`);
    onUpdateCode(updated, `Duplicated section "${sec.name}"`);
  };

  const handleDeleteSection = (index: number) => {
    const sec = sections[index];
    if (!window.confirm(`Delete section "${sec.name}" from page?`)) return;
    const updated = code.replace(sec.code, '');
    onUpdateCode(updated, `Removed section "${sec.name}"`);
  };

  return (
    <aside className="w-72 border-r border-stone-200 bg-white flex flex-col shrink-0 overflow-hidden font-sans">
      <div className="p-3.5 border-b border-stone-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-teal-600" />
          <span className="font-bold text-xs text-stone-900">Page Block Outline</span>
        </div>
        <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
          {sections.length} Blocks
        </span>
      </div>

      <div className="p-2.5 bg-stone-50 border-b border-stone-100 text-[11px] text-stone-500">
        Reorder or remove layout sections on this active page.
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            className="p-3 bg-stone-50 hover:bg-stone-100/70 border border-stone-200 rounded-2xl transition space-y-2 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                  {sec.tag}
                </span>
                <span className="font-semibold text-xs text-stone-800 truncate max-w-[130px]">
                  {sec.name}
                </span>
              </div>

              <div className="flex items-center space-x-0.5">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMoveSection(idx, 'up')}
                  className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                  title="Move section up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  disabled={idx === sections.length - 1}
                  onClick={() => handleMoveSection(idx, 'down')}
                  className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                  title="Move section down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDuplicateSection(idx)}
                  className="p-1 rounded text-stone-400 hover:text-stone-700 cursor-pointer"
                  title="Duplicate section"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteSection(idx)}
                  className="p-1 rounded text-rose-400 hover:text-rose-600 cursor-pointer"
                  title="Delete section"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-8 text-xs text-stone-400">
            No &lt;section&gt;, &lt;nav&gt;, or &lt;header&gt; blocks detected in current HTML.
          </div>
        )}
      </div>
    </aside>
  );
};
