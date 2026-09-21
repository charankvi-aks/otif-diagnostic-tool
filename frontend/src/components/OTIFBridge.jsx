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
    return <div className="p-12 text-center text-slate-400 font-medium">Loading OTIF Waterfall Bridge analytics...</div>;
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
    <div className="space-y-6">
      {/* Interactive Top Banner & Status Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
            <h2 className="text-xl font-black text-white tracking-tight">OTIF Attribution Bridge (100% → {actualOTIF}%)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
              Line Penalty Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Click any defect block/pillar to inspect root causes, impacted accounts, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Line Penalties</div>
            <div className="text-2xl font-black text-amber-400">${totalPenalties?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* 4 Interactive Core Defect Pillar Cards */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Click a Pillar to Filter & Inspect Root Causes</span>
          {selectedCategory && (
            <button
              onClick={() => { setSelectedCategory(null); setSelectedSubElement(null); }}
              className="text-sky-400 hover:underline flex items-center gap-1 text-[11px] font-normal"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filter
            </button>
          )}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                className={`relative rounded-xl p-4 border cursor-pointer transition-all duration-200 shadow-md ${
                  isSelected
                    ? `${catObj.bg} ${catObj.border} ring-2 ${catObj.ring} scale-[1.02] shadow-xl`
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${catObj.bg} ${catObj.text} border ${catObj.border}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${catObj.bg} ${catObj.text} border ${catObj.border}`}>
                    -{categoryData.pct}%
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white mb-1">{catObj.name}</h4>

                <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400">{categoryData.count} failed</span>
                  <span className="text-xs font-extrabold text-amber-400">${categoryData.penalty?.toLocaleString()}</span>
                </div>

                <div className="mt-2 flex items-center justify-end text-[10px] font-bold text-sky-400 gap-1">
                  <span>Drill Down ➔</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width): Visual Interactive Waterfall Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white">OTIF Waterfall Bridge</h3>
              <p className="text-xs text-slate-400">Select any defect row to view order details & root cause description</p>
            </div>
            <span className="text-[11px] bg-slate-950 px-3 py-1 rounded-full text-slate-300 border border-slate-800">
              100% Target
            </span>
          </div>

          <div className="space-y-2.5">
            {/* 100% Target Benchmark Row */}
            <div className="flex items-center gap-3 p-2 bg-emerald-950/20 rounded-lg border border-emerald-500/30">
              <div className="w-44 text-xs font-extrabold text-emerald-400 flex items-center gap-1.5 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Target</span>
              </div>
              <div className="flex-1 bg-slate-950 h-5 rounded overflow-hidden relative border border-slate-800">
                <div className="bg-emerald-500 h-full text-[10px] font-black text-slate-950 px-2 flex items-center" style={{ width: '100%' }}>
                  100.0% Benchmark Target
                </div>
              </div>
              <div className="w-16 text-right font-black text-emerald-400 text-xs">100.0%</div>
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
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-slate-800 border-sky-400 ring-2 ring-sky-500/40 shadow-lg'
                        : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-44 shrink-0">
                      <div className="text-xs font-bold text-white truncate">{item.sub_element}</div>
                      <div className={`text-[10px] font-semibold ${catObj.text}`}>{item.category}</div>
                    </div>

                    <div className="flex-1 relative">
                      <div className="bg-slate-900 h-6 rounded overflow-hidden relative flex items-center border border-slate-800">
                        <div
                          className={`${catObj.color} h-full text-[10px] font-black text-slate-950 px-2 flex items-center transition-all duration-500 shadow-sm`}
                          style={{ width: `${Math.max(item.deduction_pct * 3.8, 10)}%` }}
                        >
                          -{item.deduction_pct}%
                        </div>
                        <span className="text-[10px] text-slate-300 ml-2.5 truncate font-medium">
                          {item.affected_orders_count} orders • ${item.penalty_cost.toLocaleString()} line penalties
                        </span>
                      </div>
                    </div>

                    <div className={`w-16 text-right font-black text-xs ${catObj.text}`}>
                      -{item.deduction_pct}%
                    </div>
                  </div>
                );
              })}

            {/* Actual Resulting OTIF Row */}
            <div className="flex items-center gap-3 p-2.5 bg-rose-950/30 rounded-lg border border-rose-500/40 pt-3">
              <div className="w-44 text-xs font-extrabold text-rose-400 flex items-center gap-1.5 shrink-0">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span>Actual OTIF Achieved</span>
              </div>
              <div className="flex-1 bg-slate-950 h-6 rounded overflow-hidden relative border border-slate-800">
                <div
                  className="bg-rose-500 h-full text-[10px] font-black text-slate-950 px-2 flex items-center shadow-lg"
                  style={{ width: `${actualOTIF}%` }}
                >
                  {actualOTIF}% Actual OTIF Compliance Rate
                </div>
              </div>
              <div className="w-16 text-right font-black text-rose-400 text-sm">{actualOTIF}%</div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width): Retailer Penalty Risk & Top Defect Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              Retailer Penalty Rank
            </h3>

            <div className="space-y-3 text-xs">
              {penaltyGrid.slice(0, 4).map((c, i) => (
                <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white truncate max-w-[160px]">{c.customer_name}</div>
                    <div className="text-[10px] text-slate-400">${c.daily_rate}/day + {(c.line_reject_pct * 100).toFixed(0)}% line reject</div>
                  </div>
                  <span className="font-black text-amber-400 text-sm">${c.total_penalties.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-sky-400" />
              Primary SC Bottleneck
            </h3>
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 block mb-1">Largest Single Defect Cause</span>
              <div className="font-bold text-rose-400 text-sm">Ocean Transit Delays (11.0%)</div>
              <p className="text-[11px] text-slate-300 mt-2">
                Asia export ports experience carrier vessel blank sailings and customs holds at US West & US East ports.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER PENALTY GRID TABLE (Line-Level Penalties) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-extrabold text-white">Cust Penalty Grid</h3>
          </div>
          <span className="text-xs text-slate-400">Pure line penalty rates ($/day late + % of invoice value) per account</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Customer ID</th>
                <th className="p-3">Customer Account Name</th>
                <th className="p-3">Channel</th>
                <th className="p-3">Orders (Total / Failed)</th>
                <th className="p-3">OTIF %</th>
                <th className="p-3">Line Penalty Rate Rules</th>
                <th className="p-3">Total Line Penalties</th>
                <th className="p-3">Top Defect Driver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {penaltyGrid.map((c, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-sky-400">{c.customer_id}</td>
                  <td className="p-3 font-semibold text-white">{c.customer_name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.customer_type === 'Retailer' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {c.customer_type}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-slate-200 font-bold">{c.total_orders}</span> line items (<span className="text-rose-400 font-bold">{c.failed_orders} failed</span>)
                  </td>
                  <td className="p-3 font-black text-slate-200">{c.otif_pct}%</td>
                  <td className="p-3 text-slate-400">
                    ${c.daily_rate}/day late + {(c.line_reject_pct * 100).toFixed(0)}% line value reject
                  </td>
                  <td className="p-3 font-black text-amber-400 text-sm">
                    ${c.total_penalties.toLocaleString()}
                  </td>
                  <td className="p-3 font-semibold text-rose-300">{c.top_defect_cause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEXT-LEVEL DIAGNOSTIC DRILLDOWN DRAWER */}
      {(selectedCategory || selectedSubElement) && (
        <div className="bg-slate-900 border-2 border-sky-500 rounded-2xl p-6 shadow-2xl animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider">Deep-Dive Diagnostic Drilldown</span>
                <h3 className="text-lg font-black text-white">
                  {selectedSubElement ? selectedSubElement.sub_element : selectedCategory}
                </h3>
              </div>
            </div>

            <button
              onClick={() => { setSelectedSubElement(null); setSelectedCategory(null); }}
              className="text-slate-400 hover:text-white text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              Close Drilldown
            </button>
          </div>

          {selectedSubElement && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
              <strong className="text-sky-300 font-bold block mb-1">Operational Defect Impact:</strong>
              {selectedSubElement.description}
            </div>
          )}

          {/* Impacted Order Line Items Sample Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase mb-3 flex items-center justify-between">
              <span>Impacted Order Line Items (Line-Level Audit Records)</span>
              {loadingOrders && <span className="text-sky-400 text-[10px]">Loading orders...</span>}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Order ID / Line ID</th>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">SKU & Category</th>
                    <th className="p-3">Line Invoice Value</th>
                    <th className="p-3">Actual Delivery</th>
                    <th className="p-3">Line Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {drilldownOrders.map((ord, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-sky-400">{ord.order_id} ({ord.line_id})</td>
                      <td className="p-3 font-semibold text-white">{ord.customer_name} ({ord.customer_type})</td>
                      <td className="p-3 font-medium text-slate-200">{ord.sku_name} ({ord.category})</td>
                      <td className="p-3 text-slate-300 font-mono">${ord.total_invoice_value?.toLocaleString()}</td>
                      <td className="p-3 font-mono text-rose-400">{ord.timestamps.actual_delivery_at}</td>
                      <td className="p-3 font-bold text-amber-400">${ord.penalty_amount}</td>
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
