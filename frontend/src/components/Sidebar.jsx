import React, { useState } from 'react';
import { BarChart3, Clock, Database, FileSpreadsheet, Factory, Truck, Zap, Sparkles, Pin, PinOff } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isPinned, setIsPinned }) {

  const tabs = [
    { id: 'bridge', label: 'OTIF Diag', icon: BarChart3, tag: 'Core' },
    { id: 'assignment', label: 'Order Plan Optimizer', icon: Zap, tag: 'New' },
    { id: 'carrier_optimizer', label: 'Carrier Optimizer', icon: Truck, tag: 'SLA' },
    { id: 'node_drilldown', label: 'Prod & Fulfilment', icon: Factory, tag: 'Nodes' },
    { id: 'sla', label: 'E2E SLA', icon: Clock, tag: 'Audit' },
    { id: 'orders', label: 'Order Log', icon: FileSpreadsheet, tag: 'Log' },
    { id: 'masters', label: 'Master Data', icon: Database, tag: 'Master' },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-[100] group flex flex-col bg-slate-950/95 backdrop-blur-md border-r border-slate-800 shadow-2xl transition-all duration-300 ease-in-out select-none ${
        isPinned ? 'w-72' : 'w-16 hover:w-72'
      }`}
    >
      {/* Top Logo & App Title */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-slate-800/80 flex-shrink-0">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-xl bg-diy-orange flex items-center justify-center text-white shadow-lg shadow-diy-orange/30 font-bold text-xl flex-shrink-0">
            🛠️
          </div>
          <div className={`ml-3 transition-opacity duration-300 whitespace-nowrap overflow-hidden ${isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <h1 className="text-sm font-bold text-white tracking-tight">DIY Co.</h1>
            <p className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 inline" /> OTIF Suite
            </p>
          </div>
        </div>

        {/* Pin / Unpin Toggle Button */}
        <button
          onClick={() => setIsPinned(!isPinned)}
          title={isPinned ? 'Unpin Sidebar' : 'Pin Sidebar Expanded'}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-opacity duration-300 ${
            isPinned ? 'opacity-100 text-sky-400' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Hint / Label */}
      <div className={`px-3 py-2 border-b border-slate-900 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 transition-opacity duration-300 whitespace-nowrap overflow-hidden ${
        isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        Navigation {isPinned && '(Pinned)'}
      </div>

      {/* Tab Navigation List */}
      <nav className="flex-1 py-3 px-2 space-y-1.5 overflow-y-auto custom-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveTab(tab.id);
              }}
              title={tab.label}
              className={`w-full flex items-center px-2 py-2.5 rounded-xl transition-all duration-200 group/btn relative cursor-pointer ${
                isActive
                  ? 'bg-diy-orange text-white shadow-lg shadow-diy-orange/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/90'
              }`}
            >
              {/* Active Bar Indicator */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full" />
              )}

              {/* Icon Container */}
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <Icon className={`w-5 h-5 transition-transform group-hover/btn:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover/btn:text-sky-400'}`} />
              </div>

              {/* Tab Title Label (Revealed on Sidebar Hover or Pinned) */}
              <div className={`ml-3 flex-1 text-left transition-all duration-300 whitespace-nowrap overflow-hidden flex items-center justify-between ${
                isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <span className="text-xs font-semibold">{tab.label}</span>
                {tab.tag && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ml-1 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-400 group-hover/btn:text-sky-300'
                  }`}>
                    {tab.tag}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Dock Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950 flex items-center gap-3 flex-shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
        <div className={`transition-opacity duration-300 text-[10px] text-slate-400 whitespace-nowrap overflow-hidden ${
          isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <span className="font-bold text-slate-200">v1.3 Active</span>
          <p className="text-slate-500 text-[9px]">{isPinned ? 'Pinned' : 'Docked'}</p>
        </div>
      </div>
    </aside>
  );
}
