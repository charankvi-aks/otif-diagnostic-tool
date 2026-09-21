import React, { useState, useEffect } from 'react';
import { Factory, Warehouse, Navigation, AlertTriangle, ShieldAlert, CheckCircle2, TrendingDown, DollarSign, Package } from 'lucide-react';

export default function NodeDrilldown({ filters, onNavigateToOrders }) {
  const [activeSubTab, setActiveSubTab] = useState('factory');
  const [nodeData, setNodeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.customerType !== 'All') params.append('customer_type', filters.customerType);
    if (filters.category !== 'All') params.append('category', filters.category);
    if (filters.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters.dateTo) params.append('date_to', filters.dateTo);

    fetch(`/api/otif/node-breakdown?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setNodeData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching node breakdown:', err);
        setLoading(false);
      });
  }, [filters]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading Node-level Root-Cause Analytics...</div>;
  }

  const subTabs = [
    { id: 'factory', label: '1. Factory-Level View', icon: Factory, count: nodeData?.factories?.length },
    { id: 'dc', label: '2. Distribution Center (DC) View', icon: Warehouse, count: nodeData?.dcs?.length },
    { id: 'lane', label: '3. Shipping Lane Route View', icon: Navigation, count: nodeData?.lanes?.length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Factory className="w-5 h-5 text-diy-orange" />
            Production & Fulfilment Root-Cause Diagnostics
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Drill down into individual Asia Factories, Regional Distribution Centers, and Ocean Shipping Lanes to identify exact failure gaps and defect attribution bridges.
          </p>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex border-b border-slate-800 space-x-3 pb-2 overflow-x-auto">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-slate-800 border-sky-500 text-sky-400 shadow-md ring-1 ring-sky-500/30'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] text-slate-300 border border-slate-700">
                {tab.count} Nodes
              </span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: FACTORY-LEVEL VIEW */}
      {activeSubTab === 'factory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nodeData.factories.map((fac, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-sky-400 uppercase">{fac.factory_id}</span>
                    <h3 className="text-base font-black text-white">{fac.factory_name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Factory OTIF Rate</span>
                    <span className={`text-2xl font-black ${fac.otif_pct < 60 ? 'text-rose-400' : 'text-amber-400'}`}>
                      {fac.otif_pct}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Orders</span>
                    <span className="font-bold text-slate-200">{fac.total_orders}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Failed Orders</span>
                    <span className="font-bold text-rose-400">{fac.failed_orders}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Accrued Penalties</span>
                    <span className="font-bold text-amber-400">${fac.total_penalties.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">Factory Root-Cause Defect Attribution Bridge</h4>
                  <div className="space-y-2">
                    {fac.defect_bridge.map((item, j) => (
                      <div key={j} className="flex items-center justify-between bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-xs">
                        <span className="font-medium text-slate-200">{item.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{item.count} orders failed</span>
                          <span className="font-bold text-rose-400 font-mono">
                            {((item.count / fac.total_orders) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DC-LEVEL VIEW */}
      {activeSubTab === 'dc' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nodeData.dcs.map((dc, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">{dc.dc_id}</span>
                    <h3 className="text-sm font-black text-white">{dc.dc_name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">DC OTIF Rate</span>
                    <span className={`text-xl font-black ${dc.otif_pct < 60 ? 'text-rose-400' : 'text-amber-400'}`}>
                      {dc.otif_pct}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Line Items</span>
                    <span className="font-bold text-slate-200">{dc.total_orders}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Penalties</span>
                    <span className="font-bold text-amber-400">${dc.total_penalties.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">DC Root-Cause Defect Attribution</h4>
                  <div className="space-y-2">
                    {dc.defect_bridge.map((item, j) => (
                      <div key={j} className="flex items-center justify-between bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-xs">
                        <span className="font-medium text-slate-200">{item.category}</span>
                        <span className="font-bold text-rose-400 font-mono">{item.count} orders</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LANE-LEVEL VIEW */}
      {activeSubTab === 'lane' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 mb-2">Shipping Route Lane Performance & Defect Bridge</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Route Lane ID</th>
                  <th className="p-3">Origin Factory</th>
                  <th className="p-3">Destination DC</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Baseline SLA</th>
                  <th className="p-3">Volume</th>
                  <th className="p-3">OTIF %</th>
                  <th className="p-3">Penalties Accrued</th>
                  <th className="p-3">Primary Defect Driver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {nodeData.lanes.map((lane, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-sky-400">{lane.lane_id}</td>
                    <td className="p-3 font-semibold text-white">{lane.origin_factory}</td>
                    <td className="p-3 text-slate-200">{lane.destination_dc}</td>
                    <td className="p-3 text-sky-300 font-semibold">{lane.transport_mode}</td>
                    <td className="p-3 font-mono text-emerald-400">{lane.baseline_sla_days} Days</td>
                    <td className="p-3 font-bold text-slate-300">{lane.total_orders} orders</td>
                    <td className="p-3 font-black text-rose-400">{lane.otif_pct}%</td>
                    <td className="p-3 font-bold text-amber-400">${lane.total_penalties.toLocaleString()}</td>
                    <td className="p-3 text-amber-300 font-medium">{lane.top_defect_cause}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
