import React, { useState, useEffect } from 'react';
import { Database, Users, Package, Truck, Factory, ShieldAlert, Layers } from 'lucide-react';

export default function MasterDataManager() {
  const [activeMaster, setActiveMaster] = useState('customers');
  const [masterData, setMasterData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/masters/all')
      .then((res) => res.json())
      .then((data) => {
        setMasterData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading master data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Master Data Schemas...</div>;
  }

  const masterTabs = [
    { id: 'customers', label: '1. Customers', icon: Users, count: masterData?.customer_master?.length },
    { id: 'skus', label: '2. SKUs & BOM', icon: Package, count: masterData?.sku_master?.length },
    { id: 'suppliers', label: '3. Suppliers', icon: ShieldAlert, count: masterData?.supplier_master?.length },
    { id: 'factory_dc', label: '4. Factory-DC Map', icon: Factory, count: masterData?.factory_dc_mapping?.length },
    { id: 'dc_customer', label: '5. DC-Cust SLAs', icon: Truck, count: masterData?.dc_customer_sla?.length },
    { id: 'order_schema', label: '6. Order Schema', icon: Layers, count: '14 Fields' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-diy-orange" />
            Master Data Explorer
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Authoritative datasets mapping SLAs, penalties, BOM risks, and transit times.
          </p>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-2">
        {masterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMaster === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMaster(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-slate-800 border-sky-500 text-sky-400 shadow-md'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-300">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Master 1: Customer Master */}
      {activeMaster === 'customers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl overflow-x-auto">
          <h3 className="text-sm font-bold text-slate-200 mb-4">Customer Master</h3>
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Cust ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Channel</th>
                <th className="p-3">Region</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Delivery SLA</th>
                <th className="p-3">Late Rate</th>
                <th className="p-3">Reject Penalty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {masterData.customer_master.map((c, i) => (
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
                  <td className="p-3">{c.region}</td>
                  <td className="p-3 font-medium text-slate-300">{c.priority_tier}</td>
                  <td className="p-3">{c.delivery_window_sla_days}d Window</td>
                  <td className="p-3 font-bold text-amber-400">${c.penalty_rate_per_day}/day</td>
                  <td className="p-3 font-bold text-rose-400">{(c.penalty_line_reject_pct * 100).toFixed(0)}% Line Val</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Master 2: SKU Master with BOM */}
      {activeMaster === 'skus' && (
        <div className="space-y-4">
          {masterData.sku_master.map((sku, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-sky-400 mr-2">{sku.sku_id}</span>
                  <h3 className="inline-block text-base font-bold text-white">{sku.sku_name}</h3>
                  <span className="ml-3 px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">
                    Category: {sku.category}
                  </span>
                </div>
                <div className="text-xs space-x-4">
                  <span className="text-slate-400">Mfg Cost: <strong className="text-slate-200">${sku.unit_cost}</strong></span>
                  <span className="text-slate-400">Wholesale: <strong className="text-emerald-400">${sku.wholesale_price}</strong></span>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Bill of Materials (BOM)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 bg-slate-950 rounded-lg">
                  <thead className="text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Comp ID</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Qty/Unit</th>
                      <th className="p-2.5">Cost</th>
                      <th className="p-2.5">Supplier</th>
                      <th className="p-2.5">Criticality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {sku.bom.map((b, j) => (
                      <tr key={j}>
                        <td className="p-2.5 font-mono text-slate-400">{b.component_id}</td>
                        <td className="p-2.5 font-semibold text-white">{b.component_name}</td>
                        <td className="p-2.5">{b.quantity_required} pcs</td>
                        <td className="p-2.5">${b.unit_cost}</td>
                        <td className="p-2.5 text-sky-400">{b.supplier_name} ({b.supplier_id})</td>
                        <td className="p-2.5">
                          {b.is_critical ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                              CRITICAL
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Standard</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Master 3: Supplier Master */}
      {activeMaster === 'suppliers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl overflow-x-auto">
          <h3 className="text-sm font-bold text-slate-200 mb-4">Supplier Master</h3>
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Supp ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Location</th>
                <th className="p-3">Component</th>
                <th className="p-3">Lead Time SLA</th>
                <th className="p-3">On-Time %</th>
                <th className="p-3">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {masterData.supplier_master.map((s, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-sky-400">{s.supplier_id}</td>
                  <td className="p-3 font-semibold text-white">{s.supplier_name}</td>
                  <td className="p-3">{s.location}</td>
                  <td className="p-3 font-medium text-slate-200">{s.component_category}</td>
                  <td className="p-3">{s.lead_time_sla_days}d SLA</td>
                  <td className="p-3 font-bold text-amber-400">{(s.on_time_delivery_rate * 100).toFixed(0)}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.risk_level === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : s.risk_level === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {s.risk_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Master 4: Factory to DC Mapping */}
      {activeMaster === 'factory_dc' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl overflow-x-auto">
          <h3 className="text-sm font-bold text-slate-200 mb-4">Factory-DC Route Mapping</h3>
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Map ID</th>
                <th className="p-3">Origin Factory</th>
                <th className="p-3">Origin Loc</th>
                <th className="p-3">Dest DC</th>
                <th className="p-3">Dest Loc</th>
                <th className="p-3">Mode</th>
                <th className="p-3">Transit SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {masterData.factory_dc_mapping.map((m, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-sky-400">{m.mapping_id}</td>
                  <td className="p-3 font-semibold text-white">{m.factory_name}</td>
                  <td className="p-3 text-slate-400">{m.factory_location}</td>
                  <td className="p-3 font-semibold text-slate-200">{m.dc_name}</td>
                  <td className="p-3 text-slate-400">{m.dc_location}</td>
                  <td className="p-3 font-bold text-sky-300">{m.transport_mode}</td>
                  <td className="p-3 font-bold text-amber-400">{m.baseline_transit_sla_days}d SLA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Master 5: DC to Customer SLA (Includes BOTH Retailer & Industrial Account SLA Mappings) */}
      {activeMaster === 'dc_customer' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200">DC to Customer SLA Mapping</h3>
            <span className="text-xs text-sky-400 font-semibold">Retailer & Industrial SLAs</span>
          </div>

          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">SLA Code</th>
                <th className="p-3">DC</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Channel</th>
                <th className="p-3">Region</th>
                <th className="p-3">Carrier</th>
                <th className="p-3">Target SLA</th>
                <th className="p-3">Window Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {masterData.dc_customer_sla.map((d, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-sky-400">{d.mapping_id}</td>
                  <td className="p-3 font-semibold text-white">{d.dc_name}</td>
                  <td className="p-3 font-bold text-slate-200">{d.customer_name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      d.customer_type === 'Retailer' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {d.customer_type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{d.customer_region}</td>
                  <td className="p-3 font-semibold text-amber-300">{d.carrier_name}</td>
                  <td className="p-3 font-bold text-emerald-400">{d.target_transit_sla_hours}h ({d.target_transit_sla_hours/24}d)</td>
                  <td className="p-3 font-mono text-slate-300">{d.allowed_delivery_window_days}d Window</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Master 6: Order Book Schema */}
      {activeMaster === 'order_schema' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-3">Order Book Schema</h3>
          <p className="text-xs text-slate-400 mb-4">
            Data structure for order line items with relational keys and 8 timestamps.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-slate-300 space-y-1">
              <div><strong className="text-sky-400">order_id</strong>: String (e.g. ORD-2041)</div>
              <div><strong className="text-sky-400">line_id</strong>: String (e.g. LINE-10082)</div>
              <div><strong className="text-sky-400">customer_id</strong>: Ref(CustomerMaster)</div>
              <div><strong className="text-sky-400">sku_id</strong>: Ref(SKUMaster)</div>
              <div><strong className="text-sky-400">ordered_qty / delivered_qty</strong>: Integer</div>
              <div><strong className="text-sky-400">is_otif / is_on_time / is_in_full</strong>: Boolean</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-slate-300 space-y-1">
              <div><strong className="text-amber-400">primary_defect_category</strong>: Enum</div>
              <div><strong className="text-amber-400">defect_sub_element</strong>: String</div>
              <div><strong className="text-amber-400">penalty_amount</strong>: Float ($ Line Penalty)</div>
              <div><strong className="text-emerald-400">timestamps</strong>: Object (8 Timestamps)</div>
              <div className="text-[10px] text-slate-500 pl-3">
                OrderCreated, FactoryMfg, FactoryDispatch, OriginDepart, DCArrival, PromisedStart/End, ActualDelivery
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
