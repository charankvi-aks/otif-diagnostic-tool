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

  const carrierAuditList = auditData?.carrier_performance || auditData?.carrier_audit || [];

  return (
    <div className="space-y-3">
      {/* Compact Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-diy-orange flex items-center justify-center text-white font-bold shadow-md">
              <Truck className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-white">Carrier SLA Audit & Carrier Optimizer</h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 max-w-2xl">
            Select backlog orders, evaluate carrier SLA vs freight cost, and flow assigned carriers to Order Plan Optimizer.
          </p>
        </div>

        {auditData && (
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-right shrink-0">
            <span className="text-[9px] text-slate-400 uppercase font-semibold block">Sub-Optimal Carrier Penalty Loss</span>
            <div className="text-xl font-black text-rose-400">${auditData.total_penalty_impact?.toLocaleString()}</div>
          </div>
        )}
      </div>

      {/* SECTION 1: CURRENT CARRIER SLA COMPLIANCE AUDIT */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              1. Carrier SLA Audit (Historical Performance)
            </h3>
            <p className="text-[10px] text-slate-400">Assigned last-mile carriers vs contractual customer delivery SLA target hours</p>
          </div>
        </div>

        {loadingAudit ? (
          <div className="p-4 text-center text-slate-400 text-xs">Loading Carrier Audit Data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800 text-[9px]">
                <tr>
                  <th className="py-1.5 px-2.5">Carrier</th>
                  <th className="py-1.5 px-2.5">Account</th>
                  <th className="py-1.5 px-2.5">SLA Target</th>
                  <th className="py-1.5 px-2.5">Avg Transit</th>
                  <th className="py-1.5 px-2.5">On-Time %</th>
                  <th className="py-1.5 px-2.5">Status</th>
                  <th className="py-1.5 px-2.5">Penalty Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {carrierAuditList.map((c, idx) => {
                  const carrierName = c.carrier_name;
                  const account = c.primary_customer_account || c.assigned_to;
                  const targetHours = c.target_sla_hours || c.sla_target_hours || 48;
                  const actualHours = c.actual_avg_transit_hours || c.actual_avg_hours || 72;
                  const onTimePct = c.on_time_reliability_pct ?? c.on_time_pct ?? 50;
                  const status = c.sla_status || c.status || 'Sub-Optimal Breach';
                  const penalties = c.penalty_loss_accrued ?? c.penalties_caused ?? 0;

                  const isAcceptable = status.includes('Acceptable') || status.includes('Optimal');

                  return (
                    <tr key={idx} className="hover:bg-slate-800/50">
                      <td className="py-1.5 px-2.5 font-bold text-white flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>{carrierName}</span>
                      </td>
                      <td className="py-1.5 px-2.5 font-medium text-slate-300">{account}</td>
                      <td className="py-1.5 px-2.5 font-mono text-slate-300">{targetHours}h ({targetHours / 24}d)</td>
                      <td className="py-1.5 px-2.5 font-mono font-bold text-slate-200">{actualHours}h</td>
                      <td className="py-1.5 px-2.5 font-mono font-bold text-sky-400">{onTimePct}%</td>
                      <td className="py-1.5 px-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          isAcceptable
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-1.5 px-2.5 font-mono font-bold text-rose-400">${penalties?.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: FUTURE SHIPMENT CARRIER ASSIGNMENT OPTIMIZER */}
      <div className="bg-slate-900 border-2 border-sky-500 rounded-lg p-3 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-diy-orange" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">2. Future Order Carrier Optimizer</h3>
          </div>
          <span className="text-[9px] text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
            Backlog Order SLA Routing
          </span>
        </div>

        {/* ORDER BACKLOG SELECTOR BAR */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-sky-500/40 space-y-1">
          <label className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Select Backlog Order:
          </label>
          <select
            value={selectedBacklogId}
            onChange={(e) => handleSelectBacklogOrder(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 border border-sky-500/50 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-sky-400 cursor-pointer"
          >
            {(Array.isArray(backlogOrders) ? backlogOrders : DEFAULT_BACKLOG).map((b) => (
              <option key={b.order_id} value={b.order_id}>
                {b.order_id} • {b.customer_name || b.title} — Promised: {b.promised_delivery_date}
              </option>
            ))}
          </select>
        </div>

        {/* Simulator Parameters Form */}
        <form onSubmit={handleOptimize} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2.5">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Input Order Parameters</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-xs">
            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5 font-semibold">Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-1.5 text-xs focus:outline-none focus:border-sky-500"
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
              <label className="block text-[10px] text-slate-400 mb-0.5 font-semibold">DC</label>
              <select
                value={dcId}
                onChange={(e) => setDcId(e.target.value)}
                className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-1.5 text-xs focus:outline-none focus:border-sky-500"
              >
                <option value="DC-ATLANTA">US East DC (Atlanta)</option>
                <option value="DC-INLAND">US West DC (Inland)</option>
                <option value="DC-ROTTERDAM">EU Hub (Rotterdam)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5 font-semibold">SKU</label>
              <select
                value={skuId}
                onChange={(e) => setSkuId(e.target.value)}
                className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-1.5 text-xs focus:outline-none focus:border-sky-500"
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
              <label className="block text-[10px] text-slate-400 mb-0.5 font-semibold">Qty (Units)</label>
              <input
                type="number"
                value={orderedQty}
                onChange={(e) => setOrderedQty(e.target.value)}
                className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-1.5 text-xs focus:outline-none focus:border-sky-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5 font-semibold">Target SLA Date</label>
              <input
                type="date"
                value={promisedDate}
                onChange={(e) => setPromisedDate(e.target.value)}
                className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-1.5 text-xs focus:outline-none focus:border-sky-500 font-mono font-bold [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loadingOpt}
              className="bg-diy-orange hover:bg-amber-600 text-white font-bold px-4 py-1.5 rounded-lg shadow-md shadow-diy-orange/20 flex items-center gap-1.5 text-xs transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{loadingOpt ? 'Optimizing...' : 'Run Carrier Optimizer'}</span>
            </button>
          </div>
        </form>

        {/* Optimization Result Matrix */}
        {optimizationResult && (
          <div className="space-y-3">
            {assignedSuccessMsg && (
              <div className="bg-emerald-950/80 border border-emerald-500/50 p-2.5 rounded-lg text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{assignedSuccessMsg}</span>
              </div>
            )}

            {/* Optimal Carrier Callout Box */}
            <div className="bg-gradient-to-r from-sky-950/60 to-slate-950 border border-sky-400 rounded-lg p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">Rec. Carrier</span>
                </div>
                <h4 className="text-base font-black text-white">{optimizationResult.optimal_recommended_carrier.carrier_name}</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 max-w-xl">{optimizationResult.optimal_recommended_carrier.recommendation_reason}</p>
              </div>

              <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-right shrink-0">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Projected Savings</span>
                  <span className="text-xl font-black text-emerald-400">${optimizationResult.projected_savings?.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => handleAssignAndFlow(optimizationResult.optimal_recommended_carrier)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3 py-2 rounded-lg text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1 whitespace-nowrap"
                >
                  <span>Assign & Flow ➔</span>
                </button>
              </div>
            </div>

            {/* Carrier Options Comparison Matrix Table */}
            <div className="overflow-x-auto">
              <h4 className="text-[10px] font-bold text-slate-300 uppercase mb-2 tracking-wider">Carrier Options Matrix (High to Low Efficiency)</h4>
              <table className="w-full text-left text-[11px] text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800 text-[9px]">
                  <tr>
                    <th className="py-1.5 px-2.5">Carrier</th>
                    <th className="py-1.5 px-2.5">Service Tier</th>
                    <th className="py-1.5 px-2.5">Avg Transit</th>
                    <th className="py-1.5 px-2.5">Freight Cost ($)</th>
                    <th className="py-1.5 px-2.5">Expected OTIF %</th>
                    <th className="py-1.5 px-2.5">Penalty Risk ($)</th>
                    <th className="py-1.5 px-2.5">Net Total Cost ($)</th>
                    <th className="py-1.5 px-2.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {optimizationResult.carrier_options.map((opt, idx) => (
                    <tr key={idx} className={`hover:bg-slate-800/40 ${opt.is_recommended ? 'bg-sky-950/20 border-l-2 border-sky-400' : ''}`}>
                      <td className="py-1.5 px-2.5 font-bold text-white">{opt.carrier_name}</td>
                      <td className="py-1.5 px-2.5 text-slate-400">{opt.service_tier}</td>
                      <td className="py-1.5 px-2.5 font-mono font-bold text-slate-200">{opt.est_transit_days} Days ({opt.est_transit_days*24}h)</td>
                      <td className="py-1.5 px-2.5 font-mono text-slate-200">${opt.est_freight_cost?.toLocaleString()}</td>
                      <td className="py-1.5 px-2.5 font-bold text-sky-400">{opt.expected_otif_pct}%</td>
                      <td className="py-1.5 px-2.5 font-mono text-rose-400 font-bold">${opt.projected_penalty_risk?.toLocaleString()}</td>
                      <td className="py-1.5 px-2.5 font-mono font-black text-amber-400 text-xs">${opt.net_total_cost?.toLocaleString()}</td>
                      <td className="py-1.5 px-2.5">
                        <button
                          onClick={() => handleAssignAndFlow(opt)}
                          className="bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold px-2 py-1 rounded text-[10px] transition-all border border-slate-700 flex items-center gap-1 whitespace-nowrap"
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
