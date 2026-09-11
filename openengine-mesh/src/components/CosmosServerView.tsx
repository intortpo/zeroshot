import React from 'react';

export const CosmosServerView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full w-full bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-sm font-semibold text-slate-800">Cosmos Server Management</div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Active Connection
          </span>
        </div>
      </header>
      <div className="flex-1 relative">
        <iframe
          src="/_cosmos/"
          className="absolute inset-0 w-full h-full border-none"
          title="Cosmos Server"
        />
      </div>
    </div>
  );
};
