import React, { useState, useEffect } from 'react';
import { Truck, ShieldAlert, CheckCircle2, TrendingUp, DollarSign, ArrowRight, Zap, RefreshCw, AlertTriangle, Building2, Package, Sparkles, Layers } from 'lucide-react';

const DEFAULT_BACKLOG = [
  {
    order_id: 'ORD-2026-F01',
    title: 'Home Depot US East — Q4 Power Tools Promo Batch',
    customer_id: 'CUST-101',
    customer_name: 'The Home Depot (US East)',
    promised_delivery_date: '2026-09-28',
    dc_id: 'DC-ATLANTA',
    items: [{ sku_id: 'SKU-DRL-01', ordered_qty: 500 }]
  },
  {
    order_id: 'ORD-2026-F02',
    title: 'Grainger Industrial — Autumn Fleet Maintenance Restock',
    customer_id: 'CUST-201',
    customer_name: 'Grainger Industrial Supply',
    promised_delivery_date: '2026-10-05',
    dc_id: 'DC-ATLANTA',
    items: [{ sku_id: 'SKU-NAL-03', ordered_qty: 150 }]
  },
  {
    order_id: 'ORD-2026-F03',
    title: "Lowe's Companies — Lawn & Outdoor Seasonal Stock",
    customer_id: 'CUST-103',
    customer_name: "Lowe's Companies (US East)",
    promised_delivery_date: '2026-10-12',
    dc_id: 'DC-ATLANTA',
    items: [{ sku_id: 'SKU-MOW-04', ordered_qty: 250 }]
  },
  {
    order_id: 'ORD-2026-F04',
    title: 'Menards Inc. — Midwest Hardware Distribution Surge',
    customer_id: 'CUST-104',
    customer_name: 'Menards Inc. (Midwest)',
    promised_delivery_date: '2026-10-20',
    dc_id: 'DC-ATLANTA',
    items: [{ sku_id: 'SKU-SAW-02', ordered_qty: 350 }]
  },
  {
    order_id: 'ORD-2026-F05',
    title: 'Bechtel Construction — Heavy Project Fleet Order',
    customer_id: 'CUST-203',
    customer_name: 'Bechtel Construction Fleet',
    promised_delivery_date: '2026-10-28',
    dc_id: 'DC-ATLANTA',
    items: [{ sku_id: 'SKU-DRL-01', ordered_qty: 450 }]
  }
];

export default function CarrierOptimizer({ filters, onFlowToProfit }) {
  const [auditData, setAuditData] = useState(null);
  const [loadingAudit, setLoadingAudit] = useState(true);

  // Backlog integration state
  const [backlogOrders, setBacklogOrders] = useState(DEFAULT_BACKLOG);
  const [selectedBacklogId, setSelectedBacklogId] = useState('ORD-2026-F01');

  // Future shipment simulator state
  const [customerId, setCustomerId] = useState('CUST-101');
  const [dcId, setDcId] = useState('DC-ATLANTA');
  const [skuId, setSkuId] = useState('SKU-DRL-01');
  const [orderedQty, setOrderedQty] = useState(500);
  const [promisedDate, setPromisedDate] = useState('2026-09-28');
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [loadingOpt, setLoadingOpt] = useState(false);
  const [assignedSuccessMsg, setAssignedSuccessMsg] = useState('');

  // Fetch carrier SLA performance audit & backlog orders
  useEffect(() => {
    fetch('/api/carrier/audit')
      .then((res) => res.json())
      .then((data) => {
        setAuditData(data);
        setLoadingAudit(false);
      })
      .catch((err) => {
        console.error('Error fetching carrier audit:', err);
        setLoadingAudit(false);
      });

    fetch('/api/assignment/backlog')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBacklogOrders(data);
        }
      })
      .catch((err) => console.error('Error fetching backlog orders in carrier optimizer:', err));
  }, []);

  // Handle Backlog Selection
  const handleSelectBacklogOrder = (orderId) => {
    setSelectedBacklogId(orderId);
    const selected = (Array.isArray(backlogOrders) ? backlogOrders : DEFAULT_BACKLOG).find((b) => b.order_id === orderId);
    if (selected) {
      if (selected.customer_id) setCustomerId(selected.customer_id);
      if (selected.promised_delivery_date) setPromisedDate(selected.promised_delivery_date);
      if (selected.dc_id) setDcId(selected.dc_id);

      if (Array.isArray(selected.items) && selected.items.length > 0) {
        if (selected.items[0].sku_id) setSkuId(selected.items[0].sku_id);
        if (selected.items[0].ordered_qty) setOrderedQty(selected.items[0].ordered_qty);
      }
    }
  };

  // Run carrier assignment optimizer for future shipment
  const handleOptimize = (e) => {
    if (e) e.preventDefault();
    setLoadingOpt(true);
    setAssignedSuccessMsg('');

    const payload = {
      customer_id: customerId,
      dc_id: dcId,
      sku_id: skuId,
      ordered_qty: Number(orderedQty),
      promised_delivery_date: promisedDate
    };

    fetch('/api/carrier/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        setOptimizationResult(data);
        setLoadingOpt(false);
      })
      .catch((err) => {
        console.error('Error optimizing carrier assignment:', err);
        setLoadingOpt(false);
      });
  };

  // Run initial optimization on load or when parameters change
  useEffect(() => {
    handleOptimize();
  }, [customerId, dcId, skuId, orderedQty, promisedDate]);

  // Handle Flowing Assigned Carrier to Profit Optimizer
  const handleAssignAndFlow = (carrierObj) => {
    const flowData = {
      order_id: selectedBacklogId,
      customer_id: customerId,
      dc_id: dcId,
      sku_id: skuId,
      ordered_qty: orderedQty,
      promised_delivery_date: promisedDate,
      assigned_carrier: carrierObj.carrier_name,
      freight_cost: carrierObj.est_freight_cost,
      est_transit_days: carrierObj.est_transit_days,
      expected_otif_pct: carrierObj.expected_otif_pct
    };

    setAssignedSuccessMsg(`Carrier "${carrierObj.carrier_name}" assigned to Order ${selectedBacklogId}! Flowing to Profit Optimizer...`);

    if (typeof onFlowToProfit === 'function') {
      setTimeout(() => {
        onFlowToProfit(flowData);
      }, 300);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-diy-orange flex items-center justify-center text-white font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">Carrier SLA Audit & Carrier Optimizer</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Select backlog orders, evaluate carrier SLA vs freight cost, and flow assigned carriers to Order Plan Optimizer.
          </p>
        </div>

        {auditData && (
          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Sub-Optimal Carrier Penalty Loss</span>
            <div className="text-2xl font-black text-rose-400">${auditData.total_penalty_impact?.toLocaleString()}</div>
          </div>
        )}
      </div>

      {/* SECTION 1: CURRENT CARRIER SLA COMPLIANCE AUDIT */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              1. Carrier SLA Audit
            </h3>
            <p className="text-xs text-slate-400">Assigned last-mile carriers vs contractual customer delivery SLA target hours</p>
          </div>
        </div>

        {loadingAudit ? (
          <div className="p-8 text-center text-slate-400">Loading Carrier Audit Data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Carrier</th>
                  <th className="p-3">Account</th>
                  <th className="p-3">SLA Target</th>
                  <th className="p-3">Avg Transit</th>
                  <th className="p-3">On-Time %</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Penalty Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditData?.carrier_performance?.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <Truck className="w-4 h-4 text-sky-400" />
                      {c.carrier_name}
                    </td>
                    <td className="p-3 font-medium text-slate-300">{c.primary_customer_account}</td>
                    <td className="p-3 font-mono text-slate-300">{c.target_sla_hours} Hours ({c.target_sla_hours / 24}d)</td>
                    <td className="p-3 font-mono font-bold text-slate-200">{c.actual_avg_transit_hours} Hours</td>
                    <td className="p-3 font-mono font-bold text-sky-400">{c.on_time_reliability_pct}%</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.sla_status === 'Optimal SLA Compliance'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {c.sla_status}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-rose-400">${c.penalty_loss_accrued?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: FUTURE SHIPMENT CARRIER ASSIGNMENT OPTIMIZER */}
      <div className="bg-slate-900 border-2 border-sky-500 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-diy-orange" />
            <h3 className="text-lg font-black text-white">2. Future Order Carrier Optimizer</h3>
          </div>
          <span className="text-xs text-sky-400 font-bold bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/30">
            Backlog Order SLA Routing
          </span>
        </div>

        {/* ORDER BACKLOG SELECTOR BAR */}
        <div className="bg-slate-950 p-4 rounded-xl border border-sky-500/40 space-y-2">
          <label className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Select Backlog Order:
          </label>
          <select
            value={selectedBacklogId}
            onChange={(e) => handleSelectBacklogOrder(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 border border-sky-500/50 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-sky-400"
          >
            {(Array.isArray(backlogOrders) ? backlogOrders : DEFAULT_BACKLOG).map((b) => (
              <option key={b.order_id} value={b.order_id}>
                {b.order_id} • {b.customer_name || b.title} — Promised: {b.promised_delivery_date}
              </option>
            ))}
          </select>
        </div>

        {/* Simulator Parameters Form */}
        <form onSubmit={handleOptimize} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase">Input Order Parameters</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-2 focus:outline-none focus:border-sky-500"
              >
                <option value="CUST-101">The Home Depot (US East)</option>
                <option value="CUST-102">The Home Depot (US West)</option>
                <option value="CUST-103">Lowe's Companies (US East)</option>
                <option value="CUST-104">Menards Inc. (Midwest)</option>
                <option value="CUST-105">Kingfisher Group (EU)</option>
                <option value="CUST-201">Grainger Industrial Supply</option>
                <option value="CUST-202">Fastenal Direct Supply</option>
                <option value="CUST-203">Bechtel Construction Fleet</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">DC</label>
              <select
                value={dcId}
                onChange={(e) => setDcId(e.target.value)}
                className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-2 focus:outline-none focus:border-sky-500"
              >
                <option value="DC-ATLANTA">US East DC (Atlanta)</option>
                <option value="DC-INLAND">US West DC (Inland)</option>
                <option value="DC-ROTTERDAM">EU Hub (Rotterdam)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">SKU</label>
              <select
                value={skuId}
                onChange={(e) => setSkuId(e.target.value)}
                className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-2 focus:outline-none focus:border-sky-500"
              >
                <option value="SKU-DRL-01">SKU-DRL-01: Pro-X 20V Cordless Hammer Drill</option>
                <option value="SKU-DRL-02">SKU-DRL-02: UltraDrill 12V Compact Driver</option>
                <option value="SKU-DRL-03">SKU-DRL-03: HeavyDuty 1/2 in. Mud Mixer & Drill</option>
                <option value="SKU-SAW-02">SKU-SAW-02: MaxCut 7-1/4 in. Circular Saw</option>
                <option value="SKU-SAW-06">SKU-SAW-06: ProGlide 10 in. Dual-Bevel Miter Saw</option>
                <option value="SKU-SAW-07">SKU-SAW-07: Reciprocating Utility Saw Pro</option>
                <option value="SKU-NAL-03">SKU-NAL-03: FramingPro Pneumatic 21-Degree Nailer</option>
                <option value="SKU-NAL-08">SKU-NAL-08: FinishPro 16-Gauge Cordless Brad Nailer</option>
                <option value="SKU-MOW-04">SKU-MOW-04: EcoMow 40V Self-Propelled Lawn Mower</option>
                <option value="SKU-MOW-09">SKU-MOW-09: TurfMaster 60V Commercial Zero-Turn Mower</option>
                <option value="SKU-MOW-10">SKU-MOW-10: TrimLite 20V Cordless String Trimmer & Edger</option>
                <option value="SKU-VAC-05">SKU-VAC-05: CleanVac Heavy Duty 12G Shop Vac</option>
                <option value="SKU-VAC-11">SKU-VAC-11: HydroVac 16G Wet/Dry Stainless Vac</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Qty (Units)</label>
              <input
                type="number"
                value={orderedQty}
                onChange={(e) => setOrderedQty(e.target.value)}
                className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-2 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Target SLA Date</label>
              <input
                type="date"
                value={promisedDate}
                onChange={(e) => setPromisedDate(e.target.value)}
                className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-2 focus:outline-none focus:border-sky-500 font-mono [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loadingOpt}
              className="bg-diy-orange hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-diy-orange/20 flex items-center gap-2 text-xs transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>{loadingOpt ? 'Optimizing...' : 'Run Carrier Optimizer'}</span>
            </button>
          </div>
        </form>

        {/* Optimization Result Matrix */}
        {optimizationResult && (
          <div className="space-y-4">
            {assignedSuccessMsg && (
              <div className="bg-emerald-950/80 border border-emerald-500/50 p-3 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{assignedSuccessMsg}</span>
              </div>
            )}

            {/* Optimal Carrier Callout Box */}
            <div className="bg-gradient-to-r from-sky-950/60 to-slate-950 border-2 border-sky-400 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-sky-400 animate-ping"></span>
                  <span className="text-xs font-black uppercase tracking-wider text-sky-400">Rec. Carrier</span>
                </div>
                <h4 className="text-xl font-black text-white">{optimizationResult.optimal_recommended_carrier.carrier_name}</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">{optimizationResult.optimal_recommended_carrier.recommendation_reason}</p>
              </div>

              <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 text-right">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Projected Savings</span>
                  <span className="text-2xl font-black text-emerald-400">${optimizationResult.projected_savings?.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => handleAssignAndFlow(optimizationResult.optimal_recommended_carrier)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Assign & Flow to Order Plan Optimizer ➔</span>
                </button>
              </div>
            </div>

            {/* Carrier Options Comparison Matrix Table */}
            <div className="overflow-x-auto">
              <h4 className="text-xs font-bold text-slate-300 uppercase mb-3">Carrier Options Matrix (High to Low Efficiency)</h4>
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Carrier</th>
                    <th className="p-3">Service Tier</th>
                    <th className="p-3">Avg Transit</th>
                    <th className="p-3">Freight Cost ($)</th>
                    <th className="p-3">Expected OTIF %</th>
                    <th className="p-3">Penalty Risk ($)</th>
                    <th className="p-3">Net Total Cost ($)</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {optimizationResult.carrier_options.map((opt, idx) => (
                    <tr key={idx} className={`hover:bg-slate-800/40 ${opt.is_recommended ? 'bg-sky-950/20 border-l-4 border-sky-400' : ''}`}>
                      <td className="p-3 font-bold text-white">{opt.carrier_name}</td>
                      <td className="p-3 text-slate-400">{opt.service_tier}</td>
                      <td className="p-3 font-mono font-bold text-slate-200">{opt.est_transit_days} Days ({opt.est_transit_days*24}h)</td>
                      <td className="p-3 font-mono text-slate-200">${opt.est_freight_cost?.toLocaleString()}</td>
                      <td className="p-3 font-bold text-sky-400">{opt.expected_otif_pct}%</td>
                      <td className="p-3 font-mono text-rose-400 font-bold">${opt.projected_penalty_risk?.toLocaleString()}</td>
                      <td className="p-3 font-mono font-black text-amber-400 text-sm">${opt.net_total_cost?.toLocaleString()}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleAssignAndFlow(opt)}
                          className="bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold px-2.5 py-1.5 rounded-lg text-[11px] transition-all border border-slate-700 flex items-center gap-1 whitespace-nowrap"
                        >
                          <span>Assign & Flow ➔</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
