import React, { useState } from 'react';
import { BarChart3, Clock, Database, FileSpreadsheet, Factory, Calendar, Filter, RefreshCcw, Truck, Zap, ChevronUp, ChevronDown, Minimize2, Maximize2, Activity } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, filters, setFilters, summaryData }) {
  const [isMetricsMinimized, setIsMetricsMinimized] = useState(false);

  const tabs = [
    { id: 'bridge', label: 'OTIF Diag', icon: BarChart3 },
    { id: 'assignment', label: 'Order Plan Optimizer', icon: Zap },
    { id: 'carrier_optimizer', label: 'Carrier Optimizer', icon: Truck },
    { id: 'node_drilldown', label: 'Prod & Fulfilment', icon: Factory },
    { id: 'sla', label: 'E2E SLA', icon: Clock },
    { id: 'orders', label: 'Order Log', icon: FileSpreadsheet },
    { id: 'masters', label: 'Master Data', icon: Database },
  ];

  const handleDateClick = (e) => {
    if (e.target.showPicker) {
      try {
        e.target.showPicker();
      } catch (err) {
        // Fallback
      }
    }
  };

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 shadow-xl transition-all duration-300">
      {/* Top Banner & Filter Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-diy-orange flex items-center justify-center text-white shadow-lg shadow-diy-orange/30 font-bold text-xl">
            🛠️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">DIY Co.</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                OTIF Suite v1.3
              </span>
            </div>
            <p className="text-xs text-slate-400">Power Tools & Lawn Care SCM Analytics</p>
          </div>
        </div>

        {/* Global Filter Toolbar with Date A to B Calendar Pickers & Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-2 text-xs shadow-inner">
          <div className="flex items-center gap-1.5 font-bold text-slate-300 text-[11px] mr-1">
            <Calendar className="w-4 h-4 text-diy-orange" />
            <span>Dates:</span>
          </div>

          {/* Date A (Start Date) Calendar Input */}
          <div
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input');
              if (input && input.showPicker) input.showPicker();
            }}
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800/80 cursor-pointer px-2.5 py-1.5 rounded-lg border border-slate-700/80 transition-all shadow-sm"
          >
            <label className="text-sky-400 text-[11px] font-bold">From:</label>
            <input
              type="date"
              min="2026-06-01"
              max="2026-09-30"
              value={filters.dateFrom || '2026-06-01'}
              onClick={handleDateClick}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer font-mono font-bold [color-scheme:dark]"
            />
          </div>

          {/* Date B (End Date) Calendar Input */}
          <div
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input');
              if (input && input.showPicker) input.showPicker();
            }}
            className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800/80 cursor-pointer px-2.5 py-1.5 rounded-lg border border-slate-700/80 transition-all shadow-sm"
          >
            <label className="text-sky-400 text-[11px] font-bold">To:</label>
            <input
              type="date"
              min="2026-06-01"
              max="2026-09-30"
              value={filters.dateTo || '2026-08-31'}
              onClick={handleDateClick}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer font-mono font-bold [color-scheme:dark]"
            />
          </div>

          {/* Date Quick Presets */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilters({ ...filters, dateFrom: '2026-06-01', dateTo: '2026-06-30' })}
              className="px-2 py-0.5 text-[10px] font-bold rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            >
              Jun '26
            </button>
            <button
              onClick={() => setFilters({ ...filters, dateFrom: '2026-07-01', dateTo: '2026-07-31' })}
              className="px-2 py-0.5 text-[10px] font-bold rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            >
              Jul '26
            </button>
            <button
              onClick={() => setFilters({ ...filters, dateFrom: '2026-08-01', dateTo: '2026-08-31' })}
              className="px-2 py-0.5 text-[10px] font-bold rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            >
              Aug '26
            </button>
            <button
              onClick={() => setFilters({ ...filters, dateFrom: '2026-06-01', dateTo: '2026-08-31' })}
              className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-500/20 text-sky-300 border border-sky-500/30"
            >
              Q3 Full
            </button>
          </div>

          {/* Customer Channel */}
          <div>
            <select
              value={filters.customerType}
              onChange={(e) => setFilters({ ...filters, customerType: e.target.value })}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 text-xs font-semibold"
            >
              <option value="All">All Channels</option>
              <option value="Retailer">Retailers</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>

          {/* Product Category */}
          <div>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 text-xs font-semibold"
            >
              <option value="All">All Categories</option>
              <option value="Drills">Drills</option>
              <option value="Saws">Saws</option>
              <option value="Nail Guns">Nail Guns</option>
              <option value="Lawn Mowers">Lawn Mowers</option>
              <option value="Portable Vacuums">Vacuums</option>
            </select>
          </div>

          {/* Reset Filters button */}
          <button
            onClick={() => setFilters({ customerType: 'All', category: 'All', dateFrom: '2026-06-01', dateTo: '2026-08-31' })}
            title="Reset All Filters"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Ribbon Panel */}
      {summaryData && summaryData.summary && (
        <div className="bg-slate-900/80 border-t border-b border-slate-800/80 transition-all duration-300">
          {isMetricsMinimized ? (
            /* COMPACT DOCKED 1-LINE P0 METRICS BAR */
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-3 text-xs flex-nowrap overflow-x-auto custom-scrollbar">
              <div className="flex items-center gap-2.5 font-mono flex-nowrap">
                <span className="flex items-center gap-1.5 font-bold text-rose-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0">
                  <Activity className="w-3.5 h-3.5" />
                  OTIF: {summaryData.summary.actual_otif_pct}% <span className="text-[10px] text-slate-500 font-normal">(Target: {summaryData.summary.target_otif_pct}%)</span>
                </span>
                <span className="font-bold text-sky-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0">
                  OT: {summaryData.summary.on_time_pct}% | IF: {summaryData.summary.in_full_pct}%
                </span>
                <span className="font-bold text-amber-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0">
                  Penalties: ${summaryData.summary.total_penalties_accrued?.toLocaleString()}
                </span>
                <span className="font-semibold text-slate-200 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0">
                  Orders: {summaryData.summary.total_line_items} (${(summaryData.summary.total_invoice_value / 1000000).toFixed(1)}M)
                </span>
                <span className="font-semibold text-rose-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0 truncate max-w-[220px]" title={summaryData.summary.top_defect_category}>
                  Top Defect: {summaryData.summary.top_defect_category}
                </span>
              </div>

              <button
                onClick={() => setIsMetricsMinimized(false)}
                className="flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-sky-500/40 transition-colors shrink-0 whitespace-nowrap"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Expand P0 Panel</span>
              </button>
            </div>
          ) : (
            /* FULL 5-CARD EXPANDED P0 KPI GRID */
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key P0 Performance Metrics</span>
                <button
                  onClick={() => setIsMetricsMinimized(true)}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors shrink-0 whitespace-nowrap"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Minimize P0 Panel</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 shadow-inner">
                  <span className="text-slate-400 text-xs uppercase font-semibold block mb-0.5">OTIF Rate</span>
                  <div className="text-xl font-black text-rose-400 flex items-center justify-center gap-1">
                    {summaryData.summary.actual_otif_pct}%
                    <span className="text-xs text-slate-500 font-normal">vs {summaryData.summary.target_otif_pct}%</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 shadow-inner">
                  <span className="text-slate-400 text-xs uppercase font-semibold block mb-0.5">OT / IF Rate</span>
                  <div className="text-lg font-bold text-sky-300">
                    {summaryData.summary.on_time_pct}% <span className="text-xs text-slate-400">OT</span> / {summaryData.summary.in_full_pct}% <span className="text-xs text-slate-400">IF</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 shadow-inner">
                  <span className="text-slate-400 text-xs uppercase font-semibold block mb-0.5">Penalties</span>
                  <div className="text-xl font-black text-amber-400">
                    ${summaryData.summary.total_penalties_accrued?.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 shadow-inner">
                  <span className="text-slate-400 text-xs uppercase font-semibold block mb-0.5">Filtered Orders</span>
                  <div className="text-lg font-bold text-slate-200">
                    {summaryData.summary.total_line_items} (${(summaryData.summary.total_invoice_value / 1000000).toFixed(1)}M)
                  </div>
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 shadow-inner flex flex-col justify-between">
                  <span className="text-slate-400 text-xs uppercase font-semibold block mb-0.5">Top Defect</span>
                  <div className="text-sm font-bold text-rose-300 truncate">
                    {summaryData.summary.top_defect_category}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

