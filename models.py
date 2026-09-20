from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class CustomerMaster(BaseModel):
    customer_id: str
    customer_name: str
    customer_type: str  # "Retailer" or "Industrial"
    region: str
    country: str
    priority_tier: str  # "Tier 1", "Tier 2", "Tier 3"
    delivery_window_sla_days: int
    penalty_rate_per_day: float  # Line-level dollar penalty per day late
    penalty_line_reject_pct: float # Line-level percentage penalty (e.g. 0.15 = 15% of line invoice value)

class BOMItem(BaseModel):
    component_id: str
    component_name: str
    quantity_required: float
    unit_cost: float
    supplier_id: str
    supplier_name: str
    is_critical: bool

class SKUMaster(BaseModel):
    sku_id: str
    sku_name: str
    category: str  # "Drills", "Saws", "Nail Guns", "Lawn Mowers", "Portable Vacuums"
    unit_cost: float
    wholesale_price: float
    bom: List[BOMItem]

class RMSupplierMaster(BaseModel):
    supplier_id: str
    supplier_name: str
    location: str
    component_category: str
    lead_time_sla_days: int
    on_time_delivery_rate: float # e.g. 0.85
    risk_level: str # "Low", "Medium", "High"

class FactoryDCMapping(BaseModel):
    mapping_id: str
    factory_id: str
    factory_name: str
    factory_location: str
    dc_id: str
    dc_name: str
    dc_location: str
    transport_mode: str # "Ocean Freight", "Air Freight", "Trucking"
    baseline_transit_sla_days: int

class DCCustomerSLA(BaseModel):
    mapping_id: str
    dc_id: str
    dc_name: str
    customer_id: str
    customer_name: str
    customer_type: str  # "Retailer" or "Industrial"
    customer_region: str
    carrier_name: str
    target_transit_sla_hours: int
    allowed_delivery_window_days: int

class OrderLineTimestamps(BaseModel):
    order_created_at: str
    factory_mfg_planned_at: str
    factory_mfg_actual_at: str
    factory_dispatch_planned_at: str
    factory_dispatch_actual_at: str
    origin_departure_planned_at: str
    origin_departure_actual_at: str
    dc_arrival_planned_at: str
    dc_arrival_actual_at: str
    dc_dispatch_planned_at: str
    dc_dispatch_actual_at: str
    promised_delivery_start: str
    promised_delivery_end: str
    actual_delivery_at: str

class OrderLineItem(BaseModel):
    order_id: str
    line_id: str
    customer_id: str
    customer_name: str
    customer_type: str
    sku_id: str
    sku_name: str
    category: str
    factory_id: str
    dc_id: str
    ordered_qty: int
    delivered_qty: int
    unit_price: float
    total_invoice_value: float
    timestamps: OrderLineTimestamps
    is_on_time: bool
    is_in_full: bool
    is_otif: bool
    primary_defect_category: Optional[str] = None # "Customer Rejection", "Logistics Delay", "DC Out of Stock", "Factory Out of Stock", "OTIF Compliant"
    defect_sub_element: Optional[str] = None
    defect_description: Optional[str] = None
    penalty_amount: float = 0.0

class OTIFBridgeItem(BaseModel):
    category: str
    sub_element: str
    deduction_pct: float
    affected_orders_count: int
    penalty_cost: float
    description: str

class ExecutiveSummary(BaseModel):
    total_orders: int
    total_line_items: int
    total_invoice_value: float
    actual_otif_pct: float
    target_otif_pct: float
    on_time_pct: float
    in_full_pct: float
    total_penalties_accrued: float
    top_defect_category: str

class CustomerPenaltyGridItem(BaseModel):
    customer_id: str
    customer_name: str
    customer_type: str
    total_orders: int
    otif_pct: float
    failed_orders: int
    total_penalties: float
    daily_rate: float
    line_reject_pct: float
    top_defect_cause: str

# Carrier Optimization Models
class CarrierPerformance(BaseModel):
    carrier_id: str
    carrier_name: str
    service_tier: str
    avg_transit_hours: float
    on_time_reliability_pct: float
    damage_rejection_pct: float
    cost_per_pallet: float
    sla_compliance_status: str

class CarrierOptimizationRequest(BaseModel):
    customer_id: str
    dc_id: str
    sku_id: str
    ordered_qty: int
    promised_delivery_date: str

class CarrierOptionResult(BaseModel):
    carrier_id: str
    carrier_name: str
    service_tier: str
    est_transit_days: float
    est_freight_cost: float
    expected_otif_pct: float
    projected_penalty_risk: float
    net_total_cost: float
    is_recommended: bool
    recommendation_reason: str

class CarrierOptimizationResponse(BaseModel):
    request_details: Dict[str, Any]
    current_carrier: Dict[str, Any]
    optimal_recommended_carrier: CarrierOptionResult
    carrier_options: List[CarrierOptionResult]
    projected_savings: float

# Order Assignment & Profit Optimization Models
class FulfillmentPathOption(BaseModel):
    path_id: str
    factory_name: str
    dc_name: str
    carrier_name: str
    stock_available_qty: int
    stock_status: str  # "In Stock", "Partial Stock", "Factory Replenishment Required"
    mfg_unit_cost: float
    freight_shipping_cost: float
    total_cost: float
    gross_revenue: float
    projected_penalty_risk: float
    net_profit_dollar: float
    gross_margin_pct: float
    est_delivery_days: float
    sla_compliance_status: str
    is_optimal_profit_path: bool
    recommendation_notes: str

class OrderItemInput(BaseModel):
    sku_id: str
    ordered_qty: int

class OrderAssignmentOptimizationRequest(BaseModel):
    customer_id: str
    items: Optional[List[OrderItemInput]] = None
    sku_id: Optional[str] = "SKU-DRL-01"
    ordered_qty: Optional[int] = 500
    promised_delivery_date: str

class OrderAssignmentOptimizationResponse(BaseModel):
    request_details: Dict[str, Any]
    optimal_profit_path: FulfillmentPathOption
    fulfillment_paths: List[FulfillmentPathOption]
    max_net_margin_pct: float
    potential_profit_lift_dollars: float
