import React from 'react';
import {
  Sparkles,
  Kanban,
  Network,
  Server,
  MoreHorizontal,
} from 'lucide-react';
import { PetriViewMode } from '../../types';
import { triggerLightHaptic } from '../../utils/haptics';

interface MobileBottomNavProps {
  currentView: PetriViewMode;
  onSelectView: (view: PetriViewMode) => void;
  onOpenMore: () => void;
  isCognitionActive?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onSelectView,
  onOpenMore,
  isCognitionActive = false,
}) => {
  const isFocusActive = currentView === 'focus' || currentView === 'chat';
  const isBoardActive = currentView === 'board';
  const isStudioActive = currentView === 'node';
  const isServerActive = currentView === 'server';
  const isSecondaryActive =
    !isFocusActive && !isBoardActive && !isStudioActive && !isServerActive;

  const handleSelect = (view: PetriViewMode) => {
    triggerLightHaptic();
    onSelectView(view);
  };

  const handleMore = () => {
    triggerLightHaptic();
    onOpenMore();
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-around select-none">
      {/* 1. Focus / Chat */}
      <button
        type="button"
        onClick={() => handleSelect('focus')}
        className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
          isFocusActive ? 'text-indigo-600 font-semibold' : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <div className="relative">
          <Sparkles className={`w-5 h-5 ${isFocusActive ? 'text-indigo-600' : 'text-stone-400'}`} />
          {isCognitionActive && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          )}
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Focus</span>
      </button>

      {/* 2. Kanban Board */}
      <button
        type="button"
        onClick={() => handleSelect('board')}
        className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
          isBoardActive ? 'text-stone-950 font-semibold' : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <Kanban className={`w-5 h-5 ${isBoardActive ? 'text-stone-900' : 'text-stone-400'}`} />
        <span className="text-[10px] mt-0.5 tracking-tight">Board</span>
      </button>

      {/* 3. Node Studio */}
      <button
        type="button"
        onClick={() => handleSelect('node')}
        className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
          isStudioActive ? 'text-indigo-600 font-semibold' : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <Network className={`w-5 h-5 ${isStudioActive ? 'text-indigo-600' : 'text-stone-400'}`} />
        <span className="text-[10px] mt-0.5 tracking-tight">Studio</span>
      </button>

      {/* 4. Petri Server & Tailscale */}
      <button
        type="button"
        onClick={() => handleSelect('server')}
        className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
          isServerActive ? 'text-indigo-600 font-semibold' : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <Server className={`w-5 h-5 ${isServerActive ? 'text-indigo-600' : 'text-stone-400'}`} />
        <span className="text-[10px] mt-0.5 tracking-tight">Server</span>
      </button>

      {/* 5. More Action Drawer */}
      <button
        type="button"
        onClick={handleMore}
        className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
          isSecondaryActive ? 'text-purple-700 font-semibold' : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <div className="relative">
          <MoreHorizontal className={`w-5 h-5 ${isSecondaryActive ? 'text-purple-700' : 'text-stone-400'}`} />
          {isSecondaryActive && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-600" />
          )}
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">More</span>
      </button>
    </nav>
  );
};
