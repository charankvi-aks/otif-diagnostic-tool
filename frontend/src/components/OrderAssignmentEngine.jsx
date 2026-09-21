import React, { useState, useEffect } from 'react';
import { DollarSign, Zap, TrendingUp, ShieldAlert, CheckCircle2, ArrowRight, Package, Building2, Truck, Sparkles, RefreshCw, AlertTriangle, Plus, Trash2, Layers, Factory, Clock } from 'lucide-react';

const SKU_CATALOG = [
  { id: 'SKU-DRL-01', name: 'Pro-X 20V Cordless Hammer Drill', price: 99.0, cost: 45.0, cat: 'Drills' },
  { id: 'SKU-DRL-02', name: 'UltraDrill 12V Compact Driver', price: 69.0, cost: 30.0, cat: 'Drills' },
  { id: 'SKU-DRL-03', name: 'HeavyDuty 1/2 in. Mud Mixer & Drill', price: 159.0, cost: 72.0, cat: 'Drills' },
  { id: 'SKU-SAW-02', name: 'MaxCut 7-1/4 in. Circular Saw', price: 139.0, cost: 65.0, cat: 'Saws' },
  { id: 'SKU-SAW-06', name: 'ProGlide 10 in. Dual-Bevel Miter Saw', price: 289.0, cost: 130.0, cat: 'Saws' },
  { id: 'SKU-SAW-07', name: 'Reciprocating Utility Saw Pro', price: 119.0, cost: 52.0, cat: 'Saws' },
  { id: 'SKU-NAL-03', name: 'FramingPro Pneumatic Nailer', price: 189.0, cost: 85.0, cat: 'Nail Guns' },
  { id: 'SKU-NAL-08', name: 'FinishPro 16-Gauge Cordless Brad Nailer', price: 219.0, cost: 98.0, cat: 'Nail Guns' },
  { id: 'SKU-MOW-04', name: 'EcoMow 40V Lawn Mower', price: 399.0, cost: 190.0, cat: 'Lawn Mowers' },
  { id: 'SKU-MOW-09', name: 'TurfMaster 60V Commercial Zero-Turn Mower', price: 899.0, cost: 410.0, cat: 'Lawn Mowers' },
  { id: 'SKU-MOW-10', name: 'TrimLite 20V Cordless String Trimmer & Edger', price: 129.0, cost: 58.0, cat: 'Lawn Mowers' },
  { id: 'SKU-VAC-05', name: 'CleanVac Heavy Duty Shop Vac', price: 119.0, cost: 55.0, cat: 'Portable Vacuums' },
  { id: 'SKU-VAC-11', name: 'HydroVac 16G Wet/Dry Stainless Vac', price: 179.0, cost: 82.0, cat: 'Portable Vacuums' },
];

const DEFAULT_PORTFOLIO = {
  total_orders: 450,
  total_revenue: 55984370.0,
  total_mfg_cost: 24361855.2,
  total_freight_cost: 6496494.72,
  total_penalties_loss: 634632.0,
  current_net_profit: 24491388.08,
  current_net_margin_pct: 43.7,
  optimized_net_profit: 25531505.9,
  optimized_net_margin_pct: 45.6,
  potential_profit_lift_dollars: 1040117.82,
  potential_profit_lift_pct: 4.2
};

const DEFAULT_BACKLOG = [
  {
    order_id: 'ORD-2026-F01',
    title: 'Home Depot US East — Q4 Power Tools Promo Batch',
    customer_id: 'CUST-101',
    customer_name: 'The Home Depot (US East)',
    promised_delivery_date: '2026-09-28',
    items: [
      { sku_id: 'SKU-DRL-01', sku_name: 'Pro-X 20V Cordless Hammer Drill', ordered_qty: 500, base_required_qty: 500, max_policy_qty: 750 },
      { sku_id: 'SKU-SAW-02', sku_name: 'MaxCut 7-1/4 in. Circular Saw', ordered_qty: 200, base_required_qty: 200, max_policy_qty: 300 }
    ]
  },
  {
    order_id: 'ORD-2026-F02',
    title: 'Grainger Industrial — Autumn Fleet Maintenance Restock',
    customer_id: 'CUST-201',
    customer_name: 'Grainger Industrial Supply',
    promised_delivery_date: '2026-10-05',
    items: [
      { sku_id: 'SKU-NAL-03', sku_name: 'FramingPro Pneumatic Nailer', ordered_qty: 150, base_required_qty: 150, max_policy_qty: 225 },
      { sku_id: 'SKU-VAC-05', sku_name: 'CleanVac Heavy Duty Shop Vac', ordered_qty: 80, base_required_qty: 80, max_policy_qty: 120 }
    ]
  },
  {
    order_id: 'ORD-2026-F03',
    title: 'Lowe\'s Companies — Lawn & Outdoor Seasonal Stock',
    customer_id: 'CUST-103',
    customer_name: 'Lowe\'s Companies (US East)',
    promised_delivery_date: '2026-10-12',
    items: [
      { sku_id: 'SKU-MOW-04', sku_name: 'EcoMow 40V Lawn Mower', ordered_qty: 250, base_required_qty: 250, max_policy_qty: 375 },
      { sku_id: 'SKU-DRL-01', sku_name: 'Pro-X 20V Cordless Hammer Drill', ordered_qty: 100, base_required_qty: 100, max_policy_qty: 150 }
    ]
  },
  {
    order_id: 'ORD-2026-F04',
    title: 'Menards Inc. — Midwest Hardware Distribution Surge',
    customer_id: 'CUST-104',
    customer_name: 'Menards Inc. (Midwest)',
    promised_delivery_date: '2026-10-20',
    items: [
      { sku_id: 'SKU-SAW-02', sku_name: 'MaxCut 7-1/4 in. Circular Saw', ordered_qty: 350, base_required_qty: 350, max_policy_qty: 525 },
      { sku_id: 'SKU-NAL-03', sku_name: 'FramingPro Pneumatic Nailer', ordered_qty: 120, base_required_qty: 120, max_policy_qty: 180 },
      { sku_id: 'SKU-VAC-05', sku_name: 'CleanVac Heavy Duty Shop Vac', ordered_qty: 90, base_required_qty: 90, max_policy_qty: 135 }
    ]
  },
  {
    order_id: 'ORD-2026-F05',
    title: 'Bechtel Construction — Heavy Project Fleet Order',
    customer_id: 'CUST-203',
    customer_name: 'Bechtel Construction Fleet',
    promised_delivery_date: '2026-10-28',
    items: [
      { sku_id: 'SKU-DRL-01', sku_name: 'Pro-X 20V Cordless Hammer Drill', ordered_qty: 450, base_required_qty: 450, max_policy_qty: 675 },
      { sku_id: 'SKU-SAW-02', sku_name: 'MaxCut 7-1/4 in. Circular Saw', ordered_qty: 180, base_required_qty: 180, max_policy_qty: 270 },
      { sku_id: 'SKU-MOW-04', sku_name: 'EcoMow 40V Lawn Mower', ordered_qty: 60, base_required_qty: 60, max_policy_qty: 90 }
    ]
  }
];

const DEFAULT_SIMULATION = {
  request_details: {
    customer_id: 'CUST-101',
    customer_name: 'The Home Depot (US East)',
    total_items_count: 2,
    total_ordered_qty: 700,
    gross_revenue: 77300.0,
    promised_delivery_date: '2026-09-28',
    item_breakdown: [
      { sku_id: 'SKU-DRL-01', sku_name: 'Pro-X 20V Cordless Hammer Drill', ordered_qty: 500, unit_price: 99.0, line_revenue: 49500.0 },
      { sku_id: 'SKU-SAW-02', sku_name: 'MaxCut 7-1/4 in. Circular Saw', ordered_qty: 200, unit_price: 139.0, line_revenue: 27800.0 }
    ],
    sku_name: '2 SKUs Batch (700 units)'
  },
  optimal_profit_path: {
    path_id: 'PATH-03',
    factory_name: 'Shenzhen Main Power Plant #1 (China)',
    dc_name: 'US East Hub (Atlanta, GA)',
    carrier_name: 'XPO Logistics Regional LTL (Standard)',
    stock_available_qty: 700,
    stock_status: 'In Stock (100% Available Across SKUs)',
    mfg_unit_cost: 50.71,
    freight_shipping_cost: 5600.0,
    total_cost: 41100.0,
    gross_revenue: 77300.0,
    projected_penalty_risk: 312.45,
    net_profit_dollar: 35887.55,
    gross_margin_pct: 46.4,
    est_delivery_days: 3.8,
    sla_compliance_status: 'Optimal SLA Compliance',
    is_optimal_profit_path: true,
    recommendation_notes: 'Optimal Profit Path: Yields highest Net Margin ($35,887.55 / 46.4%) across 2 SKUs (700 total units) by balancing regional LTL shipping rates with DC stock availability.'
  },
  fulfillment_paths: [
    {
      path_id: 'PATH-03',
      factory_name: 'Shenzhen Main Power Plant #1 (China)',
      dc_name: 'US East Hub (Atlanta, GA)',
      carrier_name: 'XPO Logistics Regional LTL (Standard)',
      stock_available_qty: 700,
      stock_status: 'In Stock (100% Available Across SKUs)',
      mfg_unit_cost: 50.71,
      freight_shipping_cost: 5600.0,
      total_cost: 41100.0,
      gross_revenue: 77300.0,
      projected_penalty_risk: 312.45,
      net_profit_dollar: 35887.55,
      gross_margin_pct: 46.4,
      est_delivery_days: 3.8,
      sla_compliance_status: 'Optimal SLA Compliance',
      is_optimal_profit_path: true,
      recommendation_notes: 'Optimal Profit Path: Yields highest Net Margin ($35,887.55 / 46.4%) across 2 SKUs (700 total units) by balancing regional LTL shipping rates with DC stock availability.'
    },
    {
      path_id: 'PATH-01',
      factory_name: 'Shenzhen Main Power Plant #1 (China)',
      dc_name: 'US East Hub (Atlanta, GA)',
      carrier_name: 'FedEx Priority Freight (Expedited Dedicated)',
      stock_available_qty: 1200,
      stock_status: 'In Stock (100% Available Across SKUs)',
      mfg_unit_cost: 50.71,
      freight_shipping_cost: 8750.0,
      total_cost: 44250.0,
      gross_revenue: 77300.0,
      projected_penalty_risk: 115.95,
      net_profit_dollar: 32934.05,
      gross_margin_pct: 42.6,
      est_delivery_days: 2.1,
      sla_compliance_status: 'Optimal SLA Compliance',
      is_optimal_profit_path: false,
      recommendation_notes: ''
    },
    {
      path_id: 'PATH-02',
      factory_name: 'Vietnam Assembly Complex (Binh Duong)',
      dc_name: 'US West Hub (Inland Empire, CA)',
      carrier_name: 'JB Hunt Dedicated Fleet',
      stock_available_qty: 1050,
      stock_status: 'In Stock (100% Available Across SKUs)',
      mfg_unit_cost: 50.71,
      freight_shipping_cost: 9940.0,
      total_cost: 45440.0,
      gross_revenue: 77300.0,
      projected_penalty_risk: 163.00,
      net_profit_dollar: 31697.00,
      gross_margin_pct: 41.0,
      est_delivery_days: 2.4,
      sla_compliance_status: 'Optimal SLA Compliance',
      is_optimal_profit_path: false,
      recommendation_notes: ''
    },
    {
      path_id: 'PATH-04',
      factory_name: 'Vietnam Assembly Complex (Binh Duong)',
      dc_name: 'EU Gateway Hub (Rotterdam, NL)',
      carrier_name: 'DHL Express Freight Europe',
      stock_available_qty: 900,
      stock_status: 'In Stock (100% Available Across SKUs)',
      mfg_unit_cost: 50.71,
      freight_shipping_cost: 11760.0,
      total_cost: 47260.0,
      gross_revenue: 77300.0,
      projected_penalty_risk: 144.30,
      net_profit_dollar: 29895.70,
      gross_margin_pct: 38.7,
      est_delivery_days: 2.5,
      sla_compliance_status: 'Optimal SLA Compliance',
      is_optimal_profit_path: false,
      recommendation_notes: ''
    }
  ],
  max_net_margin_pct: 46.4,
  potential_profit_lift_dollars: 5991.85
};

const safeNum = (val, fallback = 0) => (typeof val === 'number' && !isNaN(val) ? val : fallback);
const safeStr = (val, fallback = '') => (typeof val === 'string' ? val : (val != null ? String(val) : fallback));

export default function OrderAssignmentEngine({ filters, assignedCarrierFlow }) {
  const [portfolioData, setPortfolioData] = useState(DEFAULT_PORTFOLIO);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  // Future Backlog Orders State
  const [backlogOrders, setBacklogOrders] = useState(DEFAULT_BACKLOG);
  const [selectedBacklogId, setSelectedBacklogId] = useState('ORD-2026-F01');

  // Customer & Delivery Date State
  const [customerId, setCustomerId] = useState('CUST-101');
  const [promisedDate, setPromisedDate] = useState('2026-09-28');

  // Multi-SKU Line Items State
  const [items, setItems] = useState([
    { id: 'item-1', skuId: 'SKU-DRL-01', orderedQty: 500, baseQty: 500, maxPolicyQty: 750 },
    { id: 'item-2', skuId: 'SKU-SAW-02', orderedQty: 200, baseQty: 200, maxPolicyQty: 300 }
  ]);

  const [simResult, setSimResult] = useState(DEFAULT_SIMULATION);
  const [selectedPathId, setSelectedPathId] = useState(null);
  const [loadingSim, setLoadingSim] = useState(false);
  const [dispatchMsg, setDispatchMsg] = useState('');

  // Handle Carrier Assignment Flowed from Carrier Optimizer
  useEffect(() => {
    if (assignedCarrierFlow && assignedCarrierFlow.order_id) {
      if (assignedCarrierFlow.order_id) setSelectedBacklogId(assignedCarrierFlow.order_id);
      if (assignedCarrierFlow.customer_id) setCustomerId(assignedCarrierFlow.customer_id);
      if (assignedCarrierFlow.promised_delivery_date) setPromisedDate(assignedCarrierFlow.promised_delivery_date);
      if (assignedCarrierFlow.sku_id) {
        const matchingSku = SKU_CATALOG.find((s) => s.id === assignedCarrierFlow.sku_id) || SKU_CATALOG[0];
        const qty = Number(assignedCarrierFlow.ordered_qty) || 500;
        setItems([
          {
            id: `item-flow-${Date.now()}`,
            skuId: matchingSku.id,
            orderedQty: qty,
            baseQty: qty,
            maxPolicyQty: Math.floor(qty * 1.5)
          }
        ]);
      }
      setDispatchMsg(`Carrier "${assignedCarrierFlow.assigned_carrier}" assigned from Carrier Optimizer for Order ${assignedCarrierFlow.order_id}! Profit and SLA compliance recalculated below.`);
    }
  }, [assignedCarrierFlow]);

  // Fetch Backlog Orders from Backend
  useEffect(() => {
    fetch('/api/assignment/backlog')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBacklogOrders(data);
        }
      })
      .catch((err) => console.error('Error fetching backlog orders:', err));
  }, []);

  // Handle Backlog Order Selection & Auto-Population
  const handleSelectBacklogOrder = (orderId) => {
    setSelectedBacklogId(orderId);
    const selected = (Array.isArray(backlogOrders) ? backlogOrders : DEFAULT_BACKLOG).find((b) => b.order_id === orderId);
    if (selected) {
      if (selected.customer_id) setCustomerId(selected.customer_id);
      if (selected.promised_delivery_date) setPromisedDate(selected.promised_delivery_date);
      if (Array.isArray(selected.items) && selected.items.length > 0) {
        setItems(
          selected.items.map((it, idx) => {
            const baseQty = Number(it.base_required_qty || it.ordered_qty) || 100;
            const maxCap = Number(it.max_policy_qty) || Math.floor(baseQty * 1.5);
            return {
              id: `item-${Date.now()}-${idx}`,
              skuId: it.sku_id,
              orderedQty: Number(it.ordered_qty) || baseQty,
              baseQty: baseQty,
              maxPolicyQty: maxCap
            };
          })
        );
      }
    }
  };

  // Add a new SKU line item
  const handleAddItem = () => {
    const currentItems = Array.isArray(items) ? items : [];
    const existingSkus = currentItems.map((i) => i.skuId);
    const unusedSku = SKU_CATALOG.find((s) => !existingSkus.includes(s.id)) || SKU_CATALOG[0];

    const newItem = {
      id: `item-${Date.now()}`,
      skuId: unusedSku.id,
      orderedQty: 100,
      baseQty: 100,
      maxPolicyQty: 150
    };
    setItems([...currentItems, newItem]);
  };

  // Remove a SKU line item
  const handleRemoveItem = (idToRemove) => {
    const currentItems = Array.isArray(items) ? items : [];
    if (currentItems.length <= 1) return;
    setItems(currentItems.filter((item) => item.id !== idToRemove));
  };

  // Update item field
  const handleItemChange = (id, field, value) => {
    const currentItems = Array.isArray(items) ? items : [];
    setItems(
      currentItems.map((item) => {
        if (item.id === id) {
          if (field === 'orderedQty') {
            const numVal = Math.max(1, Number(value) || 1);
            return { ...item, orderedQty: numVal };
          }
          if (field === 'skuId') {
            return { ...item, skuId: value };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Compute live combined metrics for UI form preview
  const safeItemsList = Array.isArray(items) ? items : [];
  const totalBatchUnits = safeItemsList.reduce((sum, item) => sum + (Number(item?.orderedQty) || 0), 0);
  const estimatedGrossRev = safeItemsList.reduce((sum, item) => {
    const sku = SKU_CATALOG.find((s) => s.id === item?.skuId);
    return sum + (sku ? sku.price * (Number(item?.orderedQty) || 0) : 0);
  }, 0);

  // Fetch Macro Portfolio Profitability
  const fetchPortfolio = () => {
    setLoadingPortfolio(true);
    const params = new URLSearchParams();
    if (filters?.customerType && filters.customerType !== 'All') params.append('customer_type', filters.customerType);
    if (filters?.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters?.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters?.dateTo) params.append('date_to', filters.dateTo);

    fetch(`/api/assignment/portfolio?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.summary && Object.keys(data.summary).length > 0) {
          setPortfolioData(data.summary);
        }
        setLoadingPortfolio(false);
      })
      .catch((err) => {
        console.error('Error fetching portfolio summary:', err);
        setLoadingPortfolio(false);
      });
  };

  useEffect(() => {
    fetchPortfolio();
  }, [filters]);

  // Run Order Assignment Simulator with Multi-SKU Payload
  const handleSimulate = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoadingSim(true);
    setDispatchMsg('');

    const currentItems = Array.isArray(items) ? items : [];
    const payload = {
      customer_id: customerId || 'CUST-101',
      items: currentItems.map((it) => ({
        sku_id: it.skuId || 'SKU-DRL-01',
        ordered_qty: Number(it.orderedQty) || 10
      })),
      promised_delivery_date: promisedDate || '2026-09-28'
    };

    fetch('/api/assignment/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.fulfillment_paths) && data.fulfillment_paths.length > 0) {
          setSimResult(data);
          setSelectedPathId(data.optimal_profit_path?.path_id || data.fulfillment_paths[0]?.path_id);
        }
        setLoadingSim(false);
      })
      .catch((err) => {
        console.error('Error executing multi-SKU assignment optimization:', err);
        setLoadingSim(false);
      });
  };

  useEffect(() => {
    handleSimulate();
  }, []);

  const pData = (portfolioData && typeof portfolioData.total_revenue === 'number') ? portfolioData : DEFAULT_PORTFOLIO;
  const sData = (simResult && Array.isArray(simResult.fulfillment_paths)) ? simResult : DEFAULT_SIMULATION;

  const fulfillmentPaths = Array.isArray(sData.fulfillment_paths) ? sData.fulfillment_paths : DEFAULT_SIMULATION.fulfillment_paths;
  const itemBreakdown = Array.isArray(sData.request_details?.item_breakdown) ? sData.request_details.item_breakdown : DEFAULT_SIMULATION.request_details.item_breakdown;

  return (
    <div className="space-y-3">
      {/* Compact Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/30">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-white">Multi-SKU Order & Profit Engine</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Multi-Item Opt
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 max-w-2xl">
            Optimizes multi-SKU fulfillment across DCs, SLAs, mfg costs, freight, and penalties to maximize net margin ($ & %).
          </p>
        </div>

        <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-right shadow-inner shrink-0">
          <span className="text-[9px] text-emerald-400 uppercase font-semibold flex items-center justify-end gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Net Profit Lift
          </span>
          <div className="text-xl font-black text-emerald-400">
            +${safeNum(pData.potential_profit_lift_dollars).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            +{safeNum(pData.potential_profit_lift_pct)}% margin expansion
          </span>
        </div>
      </div>

      {/* SECTION 1: MACRO PORTFOLIO PROFITABILITY SCORECARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              1. Macro Portfolio Profit Waterfall
            </h3>
            <p className="text-[10px] text-slate-400">Financial impact breakdown of current fulfillment vs. SLA & assignment optimization</p>
          </div>
          <button
            onClick={fetchPortfolio}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {loadingPortfolio ? (
          <div className="py-4 text-center text-slate-400 text-xs">Computing Portfolio Waterfall...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="bg-slate-950 p-2.5 px-3 rounded-lg border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-medium">Gross Invoice</span>
              <div className="text-base font-extrabold text-slate-100">${safeNum(pData.total_revenue).toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">{safeNum(pData.total_orders)} order lines</div>
            </div>

            <div className="bg-slate-950 p-2.5 px-3 rounded-lg border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-medium">Mfg + Freight</span>
              <div className="text-base font-extrabold text-slate-300">
                ${(safeNum(pData.total_mfg_cost) + safeNum(pData.total_freight_cost)).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">Mfg: ${safeNum(pData.total_mfg_cost).toLocaleString()} | Freight: ${safeNum(pData.total_freight_cost).toLocaleString()}</div>
            </div>

            <div className="bg-slate-950 p-2.5 px-3 rounded-lg border border-rose-500/30 space-y-0.5">
              <span className="text-[10px] text-rose-400 font-medium">Penalty Loss</span>
              <div className="text-base font-extrabold text-rose-400">
                -${safeNum(pData.total_penalties_loss).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">Line-level penalties accrued</div>
            </div>

            <div className="bg-emerald-950/40 p-2.5 px-3 rounded-lg border border-emerald-500/40 space-y-0.5">
              <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-between">
                <span>Opt Net Margin</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded text-[9px]">High to Low</span>
              </span>
              <div className="text-lg font-black text-emerald-400">
                ${safeNum(pData.optimized_net_profit).toLocaleString()}
              </div>
              <div className="text-[10px] font-bold text-emerald-300">
                {safeNum(pData.optimized_net_margin_pct)}% Net Margin (vs {safeNum(pData.current_net_margin_pct)}% current)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: MULTI-SKU ORDER ASSIGNMENT SIMULATOR & OPTIMIZER */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md space-y-3">
        <div className="border-b border-slate-800 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <DollarSign className="w-4 h-4 text-amber-400" />
              2. Multi-SKU Order Simulator
            </h3>
            <p className="text-[10px] text-slate-400">
              Select backlog orders or configure custom SKUs/quantities to optimize combined batch profitability across fulfillment routes.
            </p>
          </div>

          {/* Form Quick Summary Ribbon */}
          <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px]">
            <div className="text-slate-400 font-medium">
              Items: <span className="text-slate-200 font-bold">{safeItemsList.length} SKUs</span>
            </div>
            <div className="w-px h-3 bg-slate-800" />
            <div className="text-slate-400 font-medium">
              Units: <span className="text-sky-400 font-bold">{totalBatchUnits.toLocaleString()}</span>
            </div>
            <div className="w-px h-3 bg-slate-800" />
            <div className="text-slate-400 font-medium">
              Est Rev: <span className="text-emerald-400 font-bold">${estimatedGrossRev.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* FEATURE: FUTURE ORDER BACKLOG AUTO-POPULATION SELECTOR */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-sky-500/30 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-diy-orange" />
              <span>Select Backlog Order to Auto-Populate:</span>
            </label>
            <span className="text-[9px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.2 rounded font-semibold">
              Q4 Backlog
            </span>
          </div>

          <select
            value={selectedBacklogId}
            onChange={(e) => handleSelectBacklogOrder(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            {(Array.isArray(backlogOrders) ? backlogOrders : DEFAULT_BACKLOG).map((order) => (
              <option key={order.order_id} value={order.order_id}>
                [{order.order_id}] {order.title} — Promised: {order.promised_delivery_date} ({order.items?.length || 1} SKUs)
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSimulate} className="space-y-3">
          {/* Header Controls: Customer & Delivery Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="CUST-101">The Home Depot (US East) - Retailer (2-Day SLA)</option>
                <option value="CUST-102">The Home Depot (US West) - Retailer (2-Day SLA)</option>
                <option value="CUST-103">Lowe's Companies (US East) - Retailer (2-Day SLA)</option>
                <option value="CUST-104">Menards Inc. (Midwest) - Retailer (3-Day SLA)</option>
                <option value="CUST-105">Kingfisher Group (EU) - Retailer (3-Day SLA)</option>
                <option value="CUST-201">Grainger Industrial Supply - Industrial (4-Day SLA)</option>
                <option value="CUST-202">Fastenal Direct Supply - Industrial (4-Day SLA)</option>
                <option value="CUST-203">Bechtel Construction Fleet - Industrial (5-Day SLA)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">Target SLA Date</label>
              <input
                type="date"
                value={promisedDate}
                onChange={(e) => setPromisedDate(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500 font-mono font-bold [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Dynamic Multi-SKU Line Items List */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-1 border-b border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Order SKU Line Items ({safeItemsList.length})</span>
              </div>
              <span className="text-[10px] text-slate-500">DIY Co. Policy Guard-Rails (+50% Cap)</span>
            </div>

            {safeItemsList.map((item, index) => {
              if (!item) return null;
              const selectedSku = SKU_CATALOG.find((s) => s.id === item.skuId) || SKU_CATALOG[0];
              const lineRev = (selectedSku?.price || 0) * (Number(item.orderedQty) || 0);

              const baseQty = item.baseQty || Number(item.orderedQty) || 100;
              const maxPolicyQty = item.maxPolicyQty || Math.floor(baseQty * 1.5);
              const currentQty = Number(item.orderedQty) || 0;
              const isOverPolicyCap = currentQty > maxPolicyQty;
              const isBufferAllocated = currentQty > baseQty && currentQty <= maxPolicyQty;

              return (
                <div key={item.id || index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-900 p-2 px-2.5 rounded-lg border border-slate-800/80">
                  <div className="sm:col-span-1 text-[10px] font-mono font-bold text-slate-500 text-center">
                    #{index + 1}
                  </div>

                  <div className="sm:col-span-5">
                    <select
                      value={item.skuId || 'SKU-DRL-01'}
                      onChange={(e) => handleItemChange(item.id, 'skuId', e.target.value)}
                      className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      {SKU_CATALOG.map((sku) => (
                        <option key={sku.id} value={sku.id}>
                          {sku.id}: {sku.name} (${sku.price} wholesale)
                        </option>
                      ))}
                    </select>

                    {/* Policy Status Badge */}
                    <div className="mt-0.5">
                      {isOverPolicyCap ? (
                        <div className="flex items-center gap-1 text-[9px] text-rose-300 font-bold bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.2 rounded">
                          <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0 text-rose-400" />
                          <span>Exceeds +50% Policy Cap ({maxPolicyQty.toLocaleString()} max)</span>
                        </div>
                      ) : isBufferAllocated ? (
                        <div className="flex items-center gap-1 text-[9px] text-emerald-300 font-bold bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.2 rounded">
                          <CheckCircle2 className="w-2.5 h-2.5 flex-shrink-0 text-emerald-400" />
                          <span>Policy Compliant (+{Math.round(((currentQty - baseQty) / baseQty) * 100)}% Buffer)</span>
                        </div>
                      ) : (
                        <div className="text-[9px] text-slate-400 font-medium">
                          Base: {baseQty.toLocaleString()} | Policy Cap (+50%): {maxPolicyQty.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.orderedQty || 100}
                        onChange={(e) => handleItemChange(item.id, 'orderedQty', e.target.value)}
                        className={`w-full bg-slate-950 text-slate-200 border rounded px-2 py-1 text-xs focus:outline-none font-mono font-bold ${
                          isOverPolicyCap ? 'border-rose-500 text-rose-300 ring-1 ring-rose-500/50' : 'border-slate-700 focus:border-emerald-500'
                        }`}
                      />
                      <span className="text-[10px] text-slate-400 font-semibold">units</span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 text-right">
                    <span className="text-[9px] text-slate-400 block">Line Rev</span>
                    <span className="text-xs font-bold text-emerald-400">${lineRev.toLocaleString()}</span>
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={safeItemsList.length <= 1}
                      title="Remove Line Item"
                      className="p-1 text-slate-400 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Action Buttons: Add Item & Optimize */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-sky-400 border border-sky-500/30 hover:border-sky-500/60 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add SKU Line Item
              </button>

              <button
                type="submit"
                disabled={loadingSim}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/30 whitespace-nowrap"
              >
                {loadingSim ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" /> Optimize Multi-SKU Order Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {dispatchMsg && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-lg p-2.5 text-xs text-emerald-300 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{dispatchMsg}</span>
          </div>
        )}

        {/* SECTION 3: FULFILLMENT PATH COMPARISON MATRIX (ALWAYS HIGH TO LOW BY NET PROFIT $) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Candidate Fulfillment Paths Ranked High to Low by Net Margin
              </h4>
              <p className="text-[10px] text-slate-400">
                Gross Revenue: <span className="text-white font-bold">${safeNum(sData.request_details?.gross_revenue).toLocaleString()}</span> across {safeNum(sData.request_details?.total_items_count, itemBreakdown.length)} SKUs ({safeNum(sData.request_details?.total_ordered_qty, 1)} units) to {safeStr(sData.request_details?.customer_name, 'Customer')}
              </p>
            </div>
            <div className="sm:text-right">
              <span className="text-xs text-emerald-400 font-bold">Max Net Margin: {safeNum(sData.max_net_margin_pct)}%</span>
              <div className="text-[10px] text-slate-400">Profit Lift vs Lowest: +${safeNum(sData.potential_profit_lift_dollars).toLocaleString()}</div>
            </div>
          </div>

          {/* Optimized SKU Batch Line Items Summary Pill Bar */}
          {itemBreakdown.length > 0 && (
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Optimized Order SKU Batch Breakdown
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {itemBreakdown.map((line, idx) => {
                  if (!line) return null;
                  return (
                    <div key={idx} className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[11px]">
                      <span className="font-mono font-bold text-sky-400">{safeStr(line.sku_id)}</span>
                      <span className="text-slate-300 font-semibold">{safeStr(line.sku_name)}</span>
                      <span className="bg-slate-800 text-slate-200 font-bold px-1.5 py-0.2 rounded text-[10px]">
                        {safeNum(line.ordered_qty)} units
                      </span>
                      <span className="text-emerald-400 font-bold">${safeNum(line.line_revenue).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2.5">
            {fulfillmentPaths.map((path, idx) => {
              if (!path) return null;
              const isOptimal = Boolean(path.is_optimal_profit_path);
              const activeSelectedId = selectedPathId || sData.optimal_profit_path?.path_id || 'PATH-01';
              const isSelectedPath = path.path_id === activeSelectedId;

              const optimalNetProfit = sData.optimal_profit_path?.net_profit_dollar || 0;
              const pathNetProfit = safeNum(path.net_profit_dollar);
              const marginDiff = Math.max(0, optimalNetProfit - pathNetProfit);

              return (
                <div
                  key={path.path_id || idx}
                  className={`rounded-lg p-3 border transition-all shadow-md ${
                    isSelectedPath
                      ? 'bg-slate-900 border-2 border-emerald-500 ring-1 ring-emerald-500/40 shadow-emerald-500/10'
                      : 'bg-slate-950/90 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Left Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          #{idx + 1} • {safeStr(path.path_id, `PATH-0${idx + 1}`)}
                        </span>

                        {isOptimal && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3" /> OPTIMAL PROFIT PATH
                          </span>
                        )}

                        {!isOptimal && isSelectedPath && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3 h-3 text-sky-400" /> SELECTED ALTERNATE
                          </span>
                        )}

                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          safeStr(path.sla_compliance_status).includes('Optimal')
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {safeStr(path.sla_compliance_status, 'SLA Evaluated')} ({safeNum(path.est_delivery_days)}d delivery)
                        </span>
                      </div>

                      {/* Origin -> DC -> Carrier */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 text-xs">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Factory className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span className="truncate text-[11px]" title={safeStr(path.factory_name)}>{safeStr(path.factory_name, 'Asia Factory')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                          <span className="truncate text-[11px]" title={safeStr(path.dc_name)}>{safeStr(path.dc_name, 'Regional DC')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-300">
                          <Truck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span className="truncate text-[11px]" title={safeStr(path.carrier_name)}>{safeStr(path.carrier_name, 'Carrier Logistics')}</span>
                        </div>
                      </div>

                      {/* Inventory & Notes */}
                      <div className="flex items-center justify-between text-[11px] bg-slate-950 p-2 rounded-md border border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-300">Stock Availability:</span>
                          <span className={safeStr(path.stock_status).includes('100%') ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                            {safeStr(path.stock_status, 'In Stock')} ({safeNum(path.stock_available_qty).toLocaleString()} units available)
                          </span>
                        </div>
                        {isOptimal && (
                          <p className="text-[10px] text-emerald-300 font-medium italic hidden sm:block">
                            {safeStr(path.recommendation_notes)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Financial Breakdown */}
                    <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-800 pt-2 lg:pt-0 lg:pl-4 min-w-[240px] justify-between lg:justify-end">
                      <div className="text-right space-y-0.5">
                        <div className="text-[10px] text-slate-400">
                          Freight: <span className="text-slate-200 font-semibold">${safeNum(path.freight_shipping_cost).toLocaleString()}</span> | Penalty: <span className="text-rose-400 font-semibold">${safeNum(path.projected_penalty_risk).toLocaleString()}</span>
                        </div>
                        <div className="text-xl font-black text-emerald-400">
                          ${safeNum(path.net_profit_dollar).toLocaleString()}
                        </div>
                        <div className="text-[11px] font-extrabold text-slate-300">
                          {safeNum(path.gross_margin_pct)}% Operating Margin
                        </div>
                      </div>

                      <div>
                        {isSelectedPath ? (
                          <button
                            onClick={() => setDispatchMsg(`Fulfillment Order Dispatched via ${safeStr(path.path_id)} (${safeStr(path.dc_name, 'DC')} / ${safeStr(path.carrier_name, 'Carrier')})! Promised Delivery: ${promisedDate}`)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-md shadow-emerald-600/30 transition-all"
                          >
                            <span>Dispatch</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedPathId(path.path_id);
                              setDispatchMsg(`Alternate Plan ${safeStr(path.path_id)} selected for ${safeStr(path.dc_name, 'DC')} via ${safeStr(path.carrier_name, 'Carrier')}! Net Margin: $${safeNum(path.net_profit_dollar).toLocaleString()} (${safeNum(path.gross_margin_pct)}%).`);
                            }}
                            className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all border border-sky-500/40 shadow-sm shadow-sky-600/20"
                          >
                            Select Alt
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
