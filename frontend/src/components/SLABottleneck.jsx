import React, { useState } from 'react';
import { Clock, AlertTriangle, CheckCircle, Ship, Factory, Truck, Warehouse, ArrowRight, ShieldAlert, Navigation, X, Activity, Layers, Wrench, CheckCircle2 } from 'lucide-react';

const NODE_DRILLDOWNS = [
  {
    stage: '1. Factory Assembly',
    owner: 'Shenzhen Power Plant #1 & Vietnam Assembly Complex',
    status: 'Compliant',
    sla_target_days: 3.0,
    avg_actual_days: 3.2,
    delay_contribution_pct: 8.5,
    kpis: [
      { label: 'Assembly Line Capacity Utilization', value: '94.2%', note: 'Operating near peak limit' },
      { label: 'Component Shortage Lead Impact', value: '+0.8 Days', note: 'Osaka Lithium Cell delays' },
      { label: 'Primary Origin Sourcing', value: 'Shenzhen (65%) / Vietnam (35%)', note: '2-Plant multi-sourcing' }
    ],
    defect_attribution: [
      { cause: 'Tier-1 RM Component Backlog (Li-Ion Pack / Stators)', pct: 52, color: 'bg-amber-500' },
      { cause: 'Production Line Re-Tooling & Assembly Shifts', pct: 30, color: 'bg-sky-500' },
      { cause: 'Origin Quality Assurance Holding Inspections', pct: 18, color: 'bg-purple-500' }
    ],
    bottleneck_narrative: 'High seasonal demand for 20V cordless hammer drills and zero-turn lawn mowers has pushed assembly lines to 94.2% capacity. Component delivery lags from Osaka Lithium Battery Ltd add ~0.8 days to factory assembly release.',
    actionable_mitigation: 'Pre-allocate 15-day buffer stock of Li-Ion battery cells at Shenzhen plant and prioritize Tier-1 retail orders during production scheduling.'
  },
  {
    stage: '2. Factory Dispatch',
    owner: 'Asia Logistics Drayage & Customs Clearance Teams',
    status: 'Compliant',
    sla_target_days: 2.0,
    avg_actual_days: 2.1,
    delay_contribution_pct: 4.2,
    kpis: [
      { label: 'Drayage Transit Reliability', value: '88.5%', note: 'Port gateway transfer rate' },
      { label: 'Export Customs Clearance Lead Time', value: '1.4 Days', note: 'Target SLA: 1.0 Day' },
      { label: 'Containers Staged at Port Gate', value: '142 TEUs', note: 'Awaiting vessel loading' }
    ],
    defect_attribution: [
      { cause: 'Export Documentation & Invoice Validation Holds', pct: 45, color: 'bg-amber-500' },
      { cause: 'Origin Drayage Truck & Chassis Shortages', pct: 35, color: 'bg-rose-500' },
      { cause: 'Yantian & Haiphong Port Gate Congestion', pct: 20, color: 'bg-sky-500' }
    ],
    bottleneck_narrative: 'Export documentation validation and drayage chassis availability at Yantian port cause minor staging delays between factory dispatch and vessel loading.',
    actionable_mitigation: 'Deploy automated Electronic Export Information (EEI) filing at factory gate exit to eliminate manual customs inspection holds.'
  },
  {
    stage: '3. Ocean Transit',
    owner: 'Ocean Carrier Alliance (COSCO, Maersk, ONE)',
    status: 'Critical Breach',
    sla_target_days: 22.0,
    avg_actual_days: 26.5,
    delay_contribution_pct: 34.8,
    kpis: [
      { label: 'Avg Ocean Transit Lead Time', value: '26.5 Days', note: 'Target SLA: 22.0 Days (+4.5d delay)' },
      { label: 'Ocean Carrier On-Time Rate', value: '71.4%', note: 'Severe transpacific friction' },
      { label: 'Blank Sailings & Rolled Cargo', value: '18.2%', note: 'Vessel schedule cancellations' }
    ],
    defect_attribution: [
      { cause: 'Ocean Blank Sailings & Rolled Container Cargo', pct: 58, color: 'bg-rose-500' },
      { cause: 'Destination Port Congestion (LA/LB & Savannah Anchorage)', pct: 28, color: 'bg-amber-500' },
      { cause: 'Weather & Slow-Steaming Maritime Routes', pct: 14, color: 'bg-sky-500' }
    ],
    bottleneck_narrative: 'Transpacific ocean transit is the #1 logistics lead-time bottleneck. Carrier blank sailings and port congestion at LA/Long Beach and Savannah add an average of 4.5 extra days to ocean shipping windows.',
    actionable_mitigation: 'Shift high-penalty Tier-1 retail orders (Home Depot & Lowe’s) from standard ocean freight to expedited dedicated ocean express services.'
  },
  {
    stage: '4. DC Inbound',
    owner: 'DIY Co. Distribution Center Operations (Atlanta, Inland, Rotterdam)',
    status: 'Warning',
    sla_target_days: 2.0,
    avg_actual_days: 2.8,
    delay_contribution_pct: 14.6,
    kpis: [
      { label: 'DC Receiving Dwell Time', value: '2.8 Days', note: 'Target SLA: 2.0 Days (+0.8d delay)' },
      { label: 'Pallet Unloading Throughput', value: '420 Pallets/Shift', note: 'Cross-dock receiving rate' },
      { label: 'Containers Awaiting Putaway', value: '38 Containers', note: 'Staged in DC yard' }
    ],
    defect_attribution: [
      { cause: 'Unscheduled Container Delivery Surges', pct: 48, color: 'bg-amber-500' },
      { cause: 'Pallet Repackaging & Restacking Requirements', pct: 32, color: 'bg-purple-500' },
      { cause: 'WMS Scanning & Putaway Labor Shortages', pct: 20, color: 'bg-sky-500' }
    ],
    bottleneck_narrative: 'Inbound container surges at Atlanta GA and Inland Empire CA DCs create receiving bottlenecks, extending putaway dwell times from 2.0 to 2.8 days before stock becomes available.',
    actionable_mitigation: 'Mandate 24-hour advance ASN notifications from ocean carriers and establish dedicated fast-track cross-dock lanes for promo order items.'
  },
  {
    stage: '5. DC Outbound',
    owner: 'DC Order Fulfillment & Regional LTL/TL Carriers',
    status: 'Warning',
    sla_target_days: 1.0,
    avg_actual_days: 1.6,
    delay_contribution_pct: 12.4,
    kpis: [
      { label: 'Outbound Pick Accuracy', value: '96.8%', note: 'WMS barcode verification' },
      { label: 'DC Outbound Processing Time', value: '1.6 Days', note: 'Target SLA: 1.0 Day' },
      { label: 'Carrier Missed Pickups', value: '14 Orders/wk', note: 'LTL equipment shortage' }
    ],
    defect_attribution: [
      { cause: 'SKU Inventory Allocation Stockouts (Mowers & Saws)', pct: 44, color: 'bg-rose-500' },
      { cause: 'Retailer ASN Barcode Labeling Errors', pct: 36, color: 'bg-amber-500' },
      { cause: 'Regional LTL Carrier Pick-up Misses', pct: 20, color: 'bg-sky-500' }
    ],
    bottleneck_narrative: 'Outbound picking delays stem from SKU safety stock deficits in high-demand categories (Lawn Mowers) and regional LTL carrier pickup delays.',
    actionable_mitigation: 'Implement real-time inventory allocation locks and automated barcode scan verification at packing stations.'
  },
  {
    stage: '6. Cust Delivery',
    owner: 'Contract Logistics Carriers (FedEx, JB Hunt, Schneider, XPO)',
    status: 'Critical Breach',
    sla_target_days: 2.0,
    avg_actual_days: 3.4,
    delay_contribution_pct: 42.1,
    kpis: [
      { label: 'On-Time Delivery Compliance', value: '64.2%', note: '35.8% SLA Breach Rate' },
      { label: 'Accrued Retailer Penalties', value: '$634,632', note: 'Total chargeback loss' },
      { label: 'Avg Daily Penalty Clause', value: '$450/Day', note: 'The Home Depot penalty' }
    ],
    defect_attribution: [
      { cause: 'Customer Rejection — ASN Barcode & Paperwork Mismatch', pct: 48, color: 'bg-rose-500' },
      { cause: 'Customer Rejection — Pallet Unloading Damage', pct: 32, color: 'bg-amber-500' },
      { cause: 'Carrier Transit Window SLA Violations', pct: 20, color: 'bg-purple-500' }
    ],
    bottleneck_narrative: 'Final customer delivery is the primary financial loss driver ($634,632 accrued). Retailer dock rejections due to barcode scan failures and delivery window delays trigger heavy daily penalty rates ($450/day).',
    actionable_mitigation: 'Enforce carrier optimization routing for Tier-1 retail accounts (The Home Depot, Lowe’s) and pre-screen ASN barcodes before truck dispatch.'
  }
];

export default function SLABottleneck({ summaryData }) {
  const [selectedNode, setSelectedNode] = useState(null);

  if (!summaryData || !summaryData.sla_bottlenecks) {
    return <div className="p-8 text-center text-slate-400">Loading SLA Bottleneck data...</div>;
  }

  const stages = summaryData.sla_bottlenecks;
  const stageIcons = [Factory, Factory, Truck, Ship, Warehouse, Truck];
  const topBottleneck = stages && stages.length > 0 ? stages[0] : null;

  const nodeDetail = selectedNode !== null ? (NODE_DRILLDOWNS[selectedNode] || NODE_DRILLDOWNS[0]) : null;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-400" />
            E2E SLA Monitoring & Flow
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tracks lead times and SLAs across 8 operational timestamps. Click any node for drill-down.
          </p>
        </div>
        {topBottleneck && (
          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-xs text-right">
            <span className="text-slate-400">Primary Network Bottleneck</span>
            <div className="text-sm font-bold text-rose-400">
              {topBottleneck.stage} (+{(topBottleneck.avg_actual_days - topBottleneck.sla_target_days).toFixed(1)}d delay)
            </div>
          </div>
        )}
      </div>

      {/* Visual Supply Chain Route Map (Asia -> Global DCs -> Retailers) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-diy-orange" />
          SC Route Topology (Asia → Ocean → DC → Cust)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="font-extrabold text-sky-400 uppercase mb-2">1. Origin Factories (Asia)</div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between"><span>Shenzhen Power Plant #1 (CN)</span><span className="text-slate-400 font-mono">65% Vol</span></div>
              <div className="flex justify-between"><span>Vietnam Assembly Hub (VN)</span><span className="text-slate-400 font-mono">35% Vol</span></div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-amber-400 font-semibold">
              Component Bottleneck: Li-Ion Battery Pack shortage (+0.8d)
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/40 bg-rose-950/10">
            <div className="font-extrabold text-rose-400 uppercase mb-2">2. Ocean Logistics & Transit</div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between"><span>Baseline SLA:</span><span className="font-mono text-emerald-400">22 Days</span></div>
              <div className="flex justify-between"><span>Actual Avg Transit:</span><span className="font-mono text-rose-400 font-bold">26.5 Days (+4.5d)</span></div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-rose-400 font-extrabold">
              Critical Breach: Vessel blank sailings & port congestion
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="font-extrabold text-purple-400 uppercase mb-2">3. Destination DCs & Retailers</div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between"><span>US East DC (Atlanta, GA)</span><span className="text-slate-400">Home Depot / Lowe's</span></div>
              <div className="flex justify-between"><span>US West DC (Inland Empire, CA)</span><span className="text-slate-400">Home Depot / Fastenal</span></div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-purple-300 font-semibold">
              Retailer Window Penalty: $450/day late penalty clause
            </div>
          </div>
        </div>
      </div>

      {/* Stage Flow Interactive Timeline Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">
            Node-by-Node SLA Compliance Timeline <span className="text-xs text-sky-400 font-normal italic">(Click any node card to open contextual drill-down)</span>
          </h3>
          {selectedNode !== null && (
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Selected Node
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {stages.map((stage, idx) => {
            const Icon = stageIcons[idx % stageIcons.length];
            const isBreach = stage.status === 'Critical Breach';
            const isWarn = stage.status === 'Warning';
            const isSelected = selectedNode === idx;

            return (
              <div
                key={idx}
                onClick={() => setSelectedNode(isSelected ? null : idx)}
                className={`relative rounded-xl p-4 border flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-sky-500 scale-105 shadow-2xl bg-slate-800 border-sky-400'
                    : isBreach
                    ? 'bg-rose-950/20 border-rose-500/50 text-rose-200 hover:bg-rose-900/30'
                    : isWarn
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-200 hover:bg-amber-900/30'
                    : 'bg-slate-950 border-emerald-500/30 text-emerald-200 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${isBreach ? 'bg-rose-500/20 text-rose-400' : isWarn ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase ${
                      isBreach ? 'bg-rose-500 text-white border-rose-400' : isWarn ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {stage.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold leading-tight mb-1 text-white">{stage.stage}</h4>
                  <div className="text-[10px] text-slate-400 mb-2 truncate" title={stage.owner}>{stage.owner}</div>
                </div>

                <div className="border-t border-slate-800/80 pt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Target SLA:</span>
                    <span className="font-semibold text-slate-200">{stage.sla_target_days}d</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Avg Actual:</span>
                    <span className={`font-bold ${isBreach ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {stage.avg_actual_days}d
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RICH CONTEXTUAL NODE DRILL-DOWN PANEL */}
      {selectedNode !== null && nodeDetail && (
        <div className="bg-slate-900 border-2 border-sky-500 rounded-2xl p-6 shadow-2xl animate-fade-in text-xs space-y-6">
          {/* Panel Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                  Node #{selectedNode + 1}
                </span>
                <h3 className="text-lg font-black text-white">{nodeDetail.stage}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Responsible Owner: <span className="text-slate-200 font-semibold">{nodeDetail.owner}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Network Delay Share</span>
                <span className="text-base font-black text-rose-400">{nodeDetail.delay_contribution_pct}%</span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 3 Operational KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nodeDetail.kpis.map((kpi, kIdx) => (
              <div key={kIdx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold block">{kpi.label}</span>
                <div className="text-xl font-extrabold text-sky-400">{kpi.value}</div>
                <span className="text-[10px] text-slate-500 block italic">{kpi.note}</span>
              </div>
            ))}
          </div>

          {/* Root-Cause Defect Attribution Breakdown */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Node Defect Attribution & Delay Driver Breakdown
            </h4>

            <div className="space-y-2.5">
              {nodeDetail.defect_attribution.map((def, dIdx) => (
                <div key={dIdx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{def.cause}</span>
                    <span className="font-bold text-white font-mono">{def.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${def.color} transition-all duration-500`}
                      style={{ width: `${def.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottleneck Narrative & Recommended Mitigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Primary Operational Friction Point
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {nodeDetail.bottleneck_narrative}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Actionable Strategic Mitigation
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {nodeDetail.actionable_mitigation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
