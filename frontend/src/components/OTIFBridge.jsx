import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, ChevronRight, TrendingDown, DollarSign, Info, ShieldAlert,
  CheckCircle2, ArrowRight, ExternalLink, Package, Filter, Building2, Truck, Factory, Warehouse, RefreshCw
} from 'lucide-react';

export default function OTIFBridge({ summaryData, onNavigateToOrders }) {
  const [selectedSubElement, setSelectedSubElement] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [drilldownOrders, setDrilldownOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  if (!summaryData || !summaryData.waterfall_bridge) {
    return <div className="p-8 text-center text-slate-400 text-sm font-medium">Loading OTIF Waterfall Bridge analytics...</div>;
  }

  const bridgeItems = summaryData.waterfall_bridge;
  const actualOTIF = summaryData.summary.actual_otif_pct;
  const targetOTIF = summaryData.summary.target_otif_pct;
  const totalPenalties = summaryData.summary.total_penalties_accrued;
  const penaltyGrid = summaryData.customer_penalty_grid || [];

  const categories = [
    { id: 'Customer Rejection', name: '1. Cust Rejection', icon: Building2, color: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/50', ring: 'ring-red-500', bg: 'bg-red-950/20' },
    { id: 'Logistics Delay', name: '2. Logistics Delay', icon: Truck, color: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/50', ring: 'ring-amber-500', bg: 'bg-amber-950/20' },
    { id: 'DC Out of Stock', name: '3. DC OOS', icon: Warehouse, color: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/50', ring: 'ring-purple-500', bg: 'bg-purple-950/20' },
    { id: 'Factory Out of Stock', name: '4. Factory OOS', icon: Factory, color: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/50', ring: 'ring-blue-500', bg: 'bg-blue-950/20' },
  ];

  useEffect(() => {
    if (selectedSubElement || selectedCategory) {
      setLoadingOrders(true);
      const cat = selectedSubElement ? selectedSubElement.category : selectedCategory;
      fetch(`/api/orders?defect_category=${encodeURIComponent(cat)}&limit=8`)
        .then((res) => res.json())
        .then((data) => {
          setDrilldownOrders(data.items || []);
          setLoadingOrders(false);
        })
        .catch((err) => {
          console.error('Drilldown fetch error:', err);
          setLoadingOrders(false);
        });
    }
  }, [selectedSubElement, selectedCategory]);

  return (
    <div className="space-y-3">
      {/* Compact Top Banner & Status Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <h2 className="text-base font-black text-white tracking-tight">OTIF Attribution Bridge (100% → {actualOTIF}%)</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
              Line Penalty Mode
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 max-w-2xl">
            Click any defect block/pillar to inspect root causes, impacted accounts, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Total Line Penalties</div>
            <div className="text-lg font-black text-amber-400">${totalPenalties?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* 4 Compact Defect Pillar Cards */}
      <div>
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Click a Pillar to Filter & Inspect Root Causes</span>
          {selectedCategory && (
            <button
              onClick={() => { setSelectedCategory(null); setSelectedSubElement(null); }}
              className="text-sky-400 hover:underline flex items-center gap-1 text-[10px] font-normal"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filter
            </button>
          )}
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {categories.map((catObj) => {
            const Icon = catObj.icon;
            const isSelected = selectedCategory === catObj.id || selectedSubElement?.category === catObj.id;
            const categoryData = summaryData.defect_category_breakdown.find(c => c.category === catObj.id) || { pct: 0, count: 0, penalty: 0 };

            return (
              <div
                key={catObj.id}
                onClick={() => {
                  setSelectedCategory(isSelected ? null : catObj.id);
                  setSelectedSubElement(null);
                }}
                className={`relative rounded-lg p-2.5 border cursor-pointer transition-all duration-150 shadow-sm ${
                  isSelected
                    ? `${catObj.bg} ${catObj.border} ring-1 ${catObj.ring} scale-[1.01]`
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className={`p-1.5 rounded ${catObj.bg} ${catObj.text} border ${catObj.border}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${catObj.bg} ${catObj.text} border ${catObj.border}`}>
                    -{categoryData.pct}%
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white mb-0.5 truncate">{catObj.name}</h4>

                <div className="flex items-baseline justify-between mt-1.5 pt-1.5 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400">{categoryData.count} failed</span>
                  <span className="text-xs font-black text-amber-400">${categoryData.penalty?.toLocaleString()}</span>
                </div>

                <div className="mt-1 flex items-center justify-end text-[9px] font-bold text-sky-400 gap-0.5">
                  <span>Drill Down</span>
                  <ChevronRight className="w-2.5 h-2.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column (2/3 width): Compact Waterfall Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-sm font-extrabold text-white">OTIF Waterfall Bridge</h3>
              <p className="text-[11px] text-slate-400">Select any defect row to view order details & root cause description</p>
            </div>
            <span className="text-[10px] bg-slate-950 px-2.5 py-0.5 rounded-full text-slate-300 border border-slate-800">
              100% Target
            </span>
          </div>

          <div className="space-y-1.5">
            {/* 100% Target Benchmark Row */}
            <div className="flex items-center gap-2 p-1.5 bg-emerald-950/20 rounded border border-emerald-500/30">
              <div className="w-40 text-xs font-extrabold text-emerald-400 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Target</span>
              </div>
              <div className="flex-1 bg-slate-950 h-4.5 rounded overflow-hidden relative border border-slate-800">
                <div className="bg-emerald-500 h-full text-[9px] font-black text-slate-950 px-2 flex items-center" style={{ width: '100%' }}>
                  100.0% Benchmark Target
                </div>
              </div>
              <div className="w-14 text-right font-black text-emerald-400 text-xs">100.0%</div>
            </div>

            {/* Filtered Bridge Items */}
            {bridgeItems
              .filter(item => !selectedCategory || item.category === selectedCategory)
              .map((item, idx) => {
                const isSelected = selectedSubElement?.sub_element === item.sub_element;
                const catObj = categories.find(c => c.id === item.category) || categories[1];

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedSubElement(isSelected ? null : item);
                      if (!selectedCategory) setSelectedCategory(item.category);
                    }}
                    className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-slate-800 border-sky-400 ring-1 ring-sky-500/40'
                        : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-40 shrink-0">
                      <div className="text-xs font-bold text-white truncate">{item.sub_element}</div>
                      <div className={`text-[9px] font-semibold ${catObj.text}`}>{item.category}</div>
                    </div>

                    <div className="flex-1 relative">
                      <div className="bg-slate-900 h-5 rounded overflow-hidden relative flex items-center border border-slate-800">
                        <div
                          className={`${catObj.color} h-full text-[9px] font-black text-slate-950 px-1.5 flex items-center transition-all duration-300 shadow-sm`}
                          style={{ width: `${Math.max(item.deduction_pct * 3.8, 10)}%` }}
                        >
                          -{item.deduction_pct}%
                        </div>
                        <span className="text-[9px] text-slate-300 ml-2 truncate font-medium">
                          {item.affected_orders_count} orders • ${item.penalty_cost.toLocaleString()} penalties
                        </span>
                      </div>
                    </div>

                    <div className={`w-14 text-right font-black text-xs ${catObj.text}`}>
                      -{item.deduction_pct}%
                    </div>
                  </div>
                );
              })}

            {/* Actual Resulting OTIF Row */}
            <div className="flex items-center gap-2 p-1.5 bg-rose-950/30 rounded border border-rose-500/40 pt-2">
              <div className="w-40 text-xs font-extrabold text-rose-400 flex items-center gap-1 shrink-0">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span>Actual OTIF</span>
              </div>
              <div className="flex-1 bg-slate-950 h-5 rounded overflow-hidden relative border border-slate-800">
                <div
                  className="bg-rose-500 h-full text-[9px] font-black text-slate-950 px-2 flex items-center shadow"
                  style={{ width: `${actualOTIF}%` }}
                >
                  {actualOTIF}% Actual OTIF Compliance
                </div>
              </div>
              <div className="w-14 text-right font-black text-rose-400 text-xs">{actualOTIF}%</div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width): Retailer Penalty Risk & Bottleneck */}
        <div className="space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md">
            <h3 className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              Retailer Penalty Rank
            </h3>

            <div className="space-y-2 text-xs">
              {penaltyGrid.slice(0, 4).map((c, i) => (
                <div key={i} className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white truncate max-w-[140px] text-[11px]">{c.customer_name}</div>
                    <div className="text-[9px] text-slate-400">${c.daily_rate}/day + {(c.line_reject_pct * 100).toFixed(0)}% reject</div>
                  </div>
                  <span className="font-black text-amber-400 text-xs">${c.total_penalties.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md">
            <h3 className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
              Primary SC Bottleneck
            </h3>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs">
              <span className="text-slate-400 text-[10px] block mb-0.5">Largest Single Defect Cause</span>
              <div className="font-bold text-rose-400 text-xs">Ocean Transit Delays (11.0%)</div>
              <p className="text-[10px] text-slate-300 mt-1">
                Asia export ports experience blank sailings and customs holds at US West & US East ports.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER PENALTY GRID TABLE (Compact Line-Level Penalties) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Cust Penalty Grid</h3>
          </div>
          <span className="text-[10px] text-slate-400">Pure line penalty rates ($/day late + % invoice) per account</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800 text-[9px]">
              <tr>
                <th className="py-1.5 px-2.5">Customer ID</th>
                <th className="py-1.5 px-2.5">Customer Account Name</th>
                <th className="py-1.5 px-2.5">Channel</th>
                <th className="py-1.5 px-2.5">Orders (Total / Failed)</th>
                <th className="py-1.5 px-2.5">OTIF %</th>
                <th className="py-1.5 px-2.5">Line Penalty Rules</th>
                <th className="py-1.5 px-2.5">Total Line Penalties</th>
                <th className="py-1.5 px-2.5">Top Defect Driver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {penaltyGrid.map((c, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="py-1.5 px-2.5 font-mono font-bold text-sky-400 text-[10px]">{c.customer_id}</td>
                  <td className="py-1.5 px-2.5 font-semibold text-white">{c.customer_name}</td>
                  <td className="py-1.5 px-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      c.customer_type === 'Retailer' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {c.customer_type}
                    </span>
                  </td>
                  <td className="py-1.5 px-2.5">
                    <span className="text-slate-200 font-bold">{c.total_orders}</span> items (<span className="text-rose-400 font-bold">{c.failed_orders} failed</span>)
                  </td>
                  <td className="py-1.5 px-2.5 font-black text-slate-200">{c.otif_pct}%</td>
                  <td className="py-1.5 px-2.5 text-slate-400 text-[10px]">
                    ${c.daily_rate}/day + {(c.line_reject_pct * 100).toFixed(0)}% reject
                  </td>
                  <td className="py-1.5 px-2.5 font-black text-amber-400 text-xs">
                    ${c.total_penalties.toLocaleString()}
                  </td>
                  <td className="py-1.5 px-2.5 font-semibold text-rose-300">{c.top_defect_cause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPACT DRILLDOWN DRAWER */}
      {(selectedCategory || selectedSubElement) && (
        <div className="bg-slate-900 border-2 border-sky-500 rounded-xl p-3.5 shadow-2xl space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-extrabold text-sky-400 uppercase tracking-wider">Deep-Dive Diagnostic Drilldown</span>
                <h3 className="text-sm font-black text-white">
                  {selectedSubElement ? selectedSubElement.sub_element : selectedCategory}
                </h3>
              </div>
            </div>

            <button
              onClick={() => { setSelectedSubElement(null); setSelectedCategory(null); }}
              className="text-slate-400 hover:text-white text-[10px] bg-slate-800 px-2.5 py-1 rounded border border-slate-700"
            >
              Close Drilldown
            </button>
          </div>

          {selectedSubElement && (
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300">
              <strong className="text-sky-300 font-bold block mb-0.5">Operational Defect Impact:</strong>
              {selectedSubElement.description}
            </div>
          )}

          {/* Impacted Order Line Items Sample Table */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-300 uppercase mb-2 flex items-center justify-between">
              <span>Impacted Order Line Items (Line-Level Audit Records)</span>
              {loadingOrders && <span className="text-sky-400 text-[9px]">Loading orders...</span>}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800 text-[9px]">
                  <tr>
                    <th className="py-1.5 px-2.5">Order ID / Line ID</th>
                    <th className="py-1.5 px-2.5">Customer Name</th>
                    <th className="py-1.5 px-2.5">SKU & Category</th>
                    <th className="py-1.5 px-2.5">Line Invoice Value</th>
                    <th className="py-1.5 px-2.5">Actual Delivery</th>
                    <th className="py-1.5 px-2.5">Line Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {drilldownOrders.map((ord, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-1.5 px-2.5 font-mono font-bold text-sky-400 text-[10px]">{ord.order_id} ({ord.line_id})</td>
                      <td className="py-1.5 px-2.5 font-semibold text-white">{ord.customer_name} ({ord.customer_type})</td>
                      <td className="py-1.5 px-2.5 font-medium text-slate-200">{ord.sku_name} ({ord.category})</td>
                      <td className="py-1.5 px-2.5 text-slate-300 font-mono">${ord.total_invoice_value?.toLocaleString()}</td>
                      <td className="py-1.5 px-2.5 font-mono text-rose-400">{ord.timestamps.actual_delivery_at}</td>
                      <td className="py-1.5 px-2.5 font-bold text-amber-400">${ord.penalty_amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
