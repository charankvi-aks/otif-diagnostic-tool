import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function OrderBookExplorer({ filters }) {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [defectFilter, setDefectFilter] = useState('All');
  const [skuFilter, setSkuFilter] = useState('All');
  const [expandedRow, setExpandedRow] = useState(null);
  const [loading, setLoading] = useState(true);

  const skuOptions = [
    { id: 'All', name: 'All SKUs (13 Models)' },
    { id: 'SKU-DRL-01', name: 'SKU-DRL-01: Pro-X 20V Cordless Hammer Drill' },
    { id: 'SKU-DRL-02', name: 'SKU-DRL-02: UltraDrill 12V Compact Driver' },
    { id: 'SKU-DRL-03', name: 'SKU-DRL-03: HeavyDuty 1/2 in. Mud Mixer & Drill' },
    { id: 'SKU-SAW-02', name: 'SKU-SAW-02: MaxCut 7-1/4 in. Circular Saw' },
    { id: 'SKU-SAW-06', name: 'SKU-SAW-06: ProGlide 10 in. Dual-Bevel Miter Saw' },
    { id: 'SKU-SAW-07', name: 'SKU-SAW-07: Reciprocating Utility Saw Pro' },
    { id: 'SKU-NAL-03', name: 'SKU-NAL-03: FramingPro Pneumatic 21-Degree Nailer' },
    { id: 'SKU-NAL-08', name: 'SKU-NAL-08: FinishPro 16-Gauge Cordless Brad Nailer' },
    { id: 'SKU-MOW-04', name: 'SKU-MOW-04: EcoMow 40V Self-Propelled Lawn Mower' },
    { id: 'SKU-MOW-09', name: 'SKU-MOW-09: TurfMaster 60V Commercial Zero-Turn Mower' },
    { id: 'SKU-MOW-10', name: 'SKU-MOW-10: TrimLite 20V Cordless String Trimmer & Edger' },
    { id: 'SKU-VAC-05', name: 'SKU-VAC-05: CleanVac Heavy Duty 12G Shop Vac' },
    { id: 'SKU-VAC-11', name: 'SKU-VAC-11: HydroVac 16G Wet/Dry Stainless Vac' },
  ];

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.customerType !== 'All') params.append('customer_type', filters.customerType);
    if (filters.category !== 'All') params.append('category', filters.category);
    if (skuFilter !== 'All') params.append('sku_id', skuFilter);
    if (defectFilter !== 'All') params.append('defect_category', defectFilter);
    if (search) params.append('search', search);
    params.append('limit', '50');

    fetch(`/api/orders?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.items || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching orders:', err);
        setLoading(false);
      });
  }, [filters, defectFilter, skuFilter, search]);

  const defectCategories = [
    'All',
    'OTIF Compliant',
    'Customer Rejection',
    'Logistics Delay',
    'DC Out of Stock',
    'Factory Out of Stock',
  ];

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search Order ID, Customer, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-sky-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* SKU Level Dropdown Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">SKU:</span>
            <select
              value={skuFilter}
              onChange={(e) => setSkuFilter(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-semibold cursor-pointer"
            >
              {skuOptions.map((sku) => (
                <option key={sku.id} value={sku.id}>
                  {sku.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Defect:</span>
            {defectCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setDefectFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${
                  defectFilter === cat
                    ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-200">
            Order Execution Log ({total} Lines)
          </h3>
          <span className="text-xs text-slate-400">Click row for Execution Log</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading Order Log...</div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">SKU & Cat</th>
                <th className="p-3">Qty (Del/Ord)</th>
                <th className="p-3">Invoice Val</th>
                <th className="p-3">OTIF</th>
                <th className="p-3">Defect</th>
                <th className="p-3">Penalty</th>
                <th className="p-3">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((order, idx) => {
                const isExpanded = expandedRow === order.line_id;

                const renderDatePair = (planDate, actualDate) => {
                  if (!planDate) return <span className="font-mono text-slate-300">{actualDate || '-'}</span>;
                  const isDelayed = Boolean(actualDate && planDate && actualDate > planDate);
                  return (
                    <span className="font-mono text-slate-300">
                      {planDate} /{' '}
                      <span className={isDelayed ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {actualDate || '-'}
                      </span>
                    </span>
                  );
                };

                const isDeliveryLate = Boolean(
                  order.timestamps?.actual_delivery_at &&
                  order.timestamps?.promised_delivery_end &&
                  order.timestamps.actual_delivery_at > order.timestamps.promised_delivery_end
                );

                return (
                  <React.Fragment key={idx}>
                    <tr
                      onClick={() => setExpandedRow(isExpanded ? null : order.line_id)}
                      className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        isExpanded ? 'bg-slate-800/80' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-mono font-bold text-sky-400">{order.order_id}</div>
                        <div className="text-[10px] text-slate-500">{order.line_id}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-white truncate max-w-[180px]">{order.customer_name}</div>
                        <span className={`text-[10px] ${order.customer_type === 'Retailer' ? 'text-amber-400 font-semibold' : 'text-blue-400'}`}>
                          {order.customer_type}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="font-medium text-slate-200 truncate max-w-[200px]">{order.sku_name}</div>
                        <div className="text-[10px] text-slate-400">{order.category}</div>
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-slate-200">{order.delivered_qty}</span> / {order.ordered_qty} pcs
                      </td>

                      <td className="p-3 font-semibold text-slate-300">
                        ${order.total_invoice_value?.toLocaleString()}
                      </td>

                      <td className="p-3">
                        {order.is_otif ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3 text-emerald-400" /> PASS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit">
                            <AlertCircle className="w-3 h-3 text-rose-400" /> FAIL
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        {order.primary_defect_category ? (
                          <div>
                            <span className="font-bold text-rose-400 block">{order.primary_defect_category}</span>
                            <span className="text-[10px] text-slate-400">{order.defect_sub_element}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[10px]">No Defect</span>
                        )}
                      </td>

                      <td className="p-3 font-bold text-amber-400">
                        {order.penalty_amount > 0 ? `$${order.penalty_amount}` : '-'}
                      </td>

                      <td className="p-3 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-sky-400" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                    </tr>

                    {/* Expanded Execution Log - Single Timeline View with Green Color Marking */}
                    {isExpanded && (
                      <tr className="bg-slate-950 border-b border-slate-800">
                        <td colSpan={9} className="p-4">
                          <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-4 space-y-4 shadow-xl">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                                  <Clock className="w-3.5 h-3.5" />
                                </div>
                                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                  Execution Log Timeline ({order.line_id})
                                </h4>
                              </div>
                              <div className="text-xs text-slate-300 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                                Defect Root Cause: <strong className="text-rose-400">{order.defect_description || 'Fulfillment executed within SLA'}</strong>
                              </div>
                            </div>

                            {/* Timeline Stepper Track */}
                            <div className="relative">
                              {/* Green Timeline Connecting Bar */}
                              <div className="hidden md:block absolute top-3.5 left-4 right-4 h-0.5 bg-emerald-500/40 -z-0" />

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-8 gap-2.5 relative z-10">
                                {/* Step 1: Order Created */}
                                {(() => {
                                  return (
                                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold text-slate-400">1. Order Placed</span>
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 flex-shrink-0" />
                                      </div>
                                      <div className="text-[11px] font-mono text-slate-300">{order.timestamps?.order_created_at || '-'}</div>
                                    </div>
                                  );
                                })()}

                                {/* Step 2: Factory Mfg */}
                                {(() => {
                                  const plan = order.timestamps?.factory_mfg_planned_at;
                                  const act = order.timestamps?.factory_mfg_actual_at;
                                  const isLate = Boolean(plan && act && act > plan);
                                  return (
                                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold text-slate-400">2. Factory Mfg</span>
                                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isLate ? 'bg-rose-500 ring-2 ring-rose-500/30' : 'bg-emerald-500 ring-2 ring-emerald-500/30'}`} />
                                      </div>
                                      <div className="text-[10px] font-mono leading-tight">
                                        <div className="text-slate-400">Plan: {plan || '-'}</div>
                                        <div className={isLate ? 'text-rose-400 font-bold' : 'text-slate-300'}>Act: {act || '-'}</div>
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Step 3: Factory Dispatch */}
                                {(() => {
                                  const plan = order.timestamps?.factory_dispatch_planned_at;
                                  const act = order.timestamps?.factory_dispatch_actual_at;
                                  const isLate = Boolean(plan && act && act > plan);
                                  return (
                                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold text-slate-400">3. Factory Dispatch</span>
                                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isLate ? 'bg-rose-500 ring-2 ring-rose-500/30' : 'bg-emerald-500 ring-2 ring-emerald-500/30'}`} />
                                      </div>
                                      <div className="text-[10px] font-mono leading-tight">
                                        <div className="text-slate-400">Plan: {plan || '-'}</div>
                                        <div className={isLate ? 'text-rose-400 font-bold' : 'text-slate-300'}>Act: {act || '-'}</div>
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Step 4: Origin Departure */}
                                {(() => {
                                  const plan = order.timestamps?.origin_departure_planned_at;
                                  const act = order.timestamps?.origin_departure_actual_at;
                                  const isLate = Boolean(plan && act && act > plan);
                                  return (
                                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold text-slate-400">4. Origin Depart</span>
                                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isLate ? 'bg-rose-500 ring-2 ring-rose-500/30' : 'bg-emerald-500 ring-2 ring-emerald-500/30'}`} />
                                      </div>
                                      <div className="text-[10px] font-mono leading-tight">
                                        <div className="text-slate-400">Plan: {plan || '-'}</div>
                                        <div className={isLate ? 'text-rose-400 font-bold' : 'text-slate-300'}>Act: {act || '-'}</div>
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Step 5: DC Arrival */}
                                {(() => {
                                  const plan = order.timestamps?.dc_arrival_planned_at;
                                  const act = order.timestamps?.dc_arrival_actual_at;
                                  const isLate = Boolean(plan && act && act > plan);
                                  return (
                                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold text-slate-400">5. DC Arrival</span>
                                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isLate ? 'bg-rose-500 ring-2 ring-rose-500/30' : 'bg-emerald-500 ring-2 ring-emerald-500/30'}`} />
                                      </div>
                                      <div className="text-[10px] font-mono leading-tight">
                                        <div className="text-slate-400">Plan: {plan || '-'}</div>
                                        <div className={isLate ? 'text-rose-400 font-bold' : 'text-slate-300'}>Act: {act || '-'}</div>
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Step 6: DC Dispatch */}
                                {(() => {
                                  const plan = order.timestamps?.dc_dispatch_planned_at;
                                  const act = order.timestamps?.dc_dispatch_actual_at;
                                  const isLate = Boolean(plan && act && act > plan);
                                  return (
                                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold text-slate-400">6. DC Dispatch</span>
                                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isLate ? 'bg-rose-500 ring-2 ring-rose-500/30' : 'bg-emerald-500 ring-2 ring-emerald-500/30'}`} />
                                      </div>
                                      <div className="text-[10px] font-mono leading-tight">
                                        <div className="text-slate-400">Plan: {plan || '-'}</div>
                                        <div className={isLate ? 'text-rose-400 font-bold' : 'text-slate-300'}>Act: {act || '-'}</div>
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Step 7: Promised SLA Window */}
                                {(() => {
                                  return (
                                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold text-slate-400">7. Promised SLA</span>
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 flex-shrink-0" />
                                      </div>
                                      <div className="text-[10px] font-mono text-slate-300 leading-tight">
                                        {order.timestamps?.promised_delivery_start}<br />to {order.timestamps?.promised_delivery_end}
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Step 8: Actual Customer Delivery */}
                                {(() => {
                                  const promisedEnd = order.timestamps?.promised_delivery_end;
                                  const act = order.timestamps?.actual_delivery_at;
                                  const isLate = Boolean(promisedEnd && act && act > promisedEnd);
                                  return (
                                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold text-slate-400">8. Final Delivery</span>
                                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isLate ? 'bg-rose-500 ring-2 ring-rose-500/30' : 'bg-emerald-500 ring-2 ring-emerald-500/30'}`} />
                                      </div>
                                      <div className="text-[10px] font-mono leading-tight">
                                        <div className="text-slate-400">SLA: {promisedEnd || '-'}</div>
                                        <div className={isLate ? 'text-rose-400 font-bold' : 'text-slate-300'}>Act: {act || '-'}</div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
