from typing import List, Dict, Any, Optional
from app.models import (
    FulfillmentPathOption, OrderAssignmentOptimizationRequest,
    OrderAssignmentOptimizationResponse, OrderLineItem
)

def get_order_backlog() -> List[Dict[str, Any]]:
    """Returns future scheduled pending backlog orders with base required quantities and +50% DIY policy caps."""
    return [
        {
            "order_id": "ORD-2026-F01",
            "title": "Home Depot US East — Q4 Power Tools Promo Batch",
            "customer_id": "CUST-101",
            "customer_name": "The Home Depot (US East)",
            "promised_delivery_date": "2026-09-28",
            "items": [
                {"sku_id": "SKU-DRL-01", "sku_name": "Pro-X 20V Cordless Hammer Drill", "ordered_qty": 500, "base_required_qty": 500, "max_policy_qty": 750},
                {"sku_id": "SKU-SAW-02", "sku_name": "MaxCut 7-1/4 in. Circular Saw", "ordered_qty": 200, "base_required_qty": 200, "max_policy_qty": 300}
            ]
        },
        {
            "order_id": "ORD-2026-F02",
            "title": "Grainger Industrial — Autumn Fleet Maintenance Restock",
            "customer_id": "CUST-201",
            "customer_name": "Grainger Industrial Supply",
            "promised_delivery_date": "2026-10-05",
            "items": [
                {"sku_id": "SKU-NAL-03", "sku_name": "FramingPro Pneumatic Nailer", "ordered_qty": 150, "base_required_qty": 150, "max_policy_qty": 225},
                {"sku_id": "SKU-VAC-05", "sku_name": "CleanVac Heavy Duty Shop Vac", "ordered_qty": 80, "base_required_qty": 80, "max_policy_qty": 120}
            ]
        },
        {
            "order_id": "ORD-2026-F03",
            "title": "Lowe's Companies — Lawn & Outdoor Seasonal Stock",
            "customer_id": "CUST-103",
            "customer_name": "Lowe's Companies (US East)",
            "promised_delivery_date": "2026-10-12",
            "items": [
                {"sku_id": "SKU-MOW-04", "sku_name": "EcoMow 40V Lawn Mower", "ordered_qty": 250, "base_required_qty": 250, "max_policy_qty": 375},
                {"sku_id": "SKU-DRL-01", "sku_name": "Pro-X 20V Cordless Hammer Drill", "ordered_qty": 100, "base_required_qty": 100, "max_policy_qty": 150}
            ]
        },
        {
            "order_id": "ORD-2026-F04",
            "title": "Menards Inc. — Midwest Hardware Distribution Surge",
            "customer_id": "CUST-104",
            "customer_name": "Menards Inc. (Midwest)",
            "promised_delivery_date": "2026-10-20",
            "items": [
                {"sku_id": "SKU-SAW-02", "sku_name": "MaxCut 7-1/4 in. Circular Saw", "ordered_qty": 350, "base_required_qty": 350, "max_policy_qty": 525},
                {"sku_id": "SKU-NAL-03", "sku_name": "FramingPro Pneumatic Nailer", "ordered_qty": 120, "base_required_qty": 120, "max_policy_qty": 180},
                {"sku_id": "SKU-VAC-05", "sku_name": "CleanVac Heavy Duty Shop Vac", "ordered_qty": 90, "base_required_qty": 90, "max_policy_qty": 135}
            ]
        },
        {
            "order_id": "ORD-2026-F05",
            "title": "Bechtel Construction — Heavy Project Fleet Order",
            "customer_id": "CUST-203",
            "customer_name": "Bechtel Construction Fleet",
            "promised_delivery_date": "2026-10-28",
            "items": [
                {"sku_id": "SKU-DRL-01", "sku_name": "Pro-X 20V Cordless Hammer Drill", "ordered_qty": 450, "base_required_qty": 450, "max_policy_qty": 675},
                {"sku_id": "SKU-SAW-02", "sku_name": "MaxCut 7-1/4 in. Circular Saw", "ordered_qty": 180, "base_required_qty": 180, "max_policy_qty": 270},
                {"sku_id": "SKU-MOW-04", "sku_name": "EcoMow 40V Lawn Mower", "ordered_qty": 60, "base_required_qty": 60, "max_policy_qty": 90}
            ]
        }
    ]

def get_portfolio_profitability_summary(orders: List[OrderLineItem]) -> Dict[str, Any]:
    total_orders = len(orders)
    if total_orders == 0:
        return {
            "summary": {
                "total_orders": 0,
                "total_revenue": 0.0,
                "total_mfg_cost": 0.0,
                "total_freight_cost": 0.0,
                "total_penalties_loss": 0.0,
                "current_net_profit": 0.0,
                "current_net_margin_pct": 0.0,
                "optimized_net_profit": 0.0,
                "optimized_net_margin_pct": 0.0,
                "potential_profit_lift_dollars": 0.0,
                "potential_profit_lift_pct": 0.0
            }
        }

    total_revenue = sum(o.total_invoice_value for o in orders)
    # Estimate manufacturing unit cost (~45% of wholesale price)
    total_mfg_cost = sum(o.delivered_qty * (o.unit_price * 0.45) for o in orders)
    # Estimate freight shipping cost (~12% of wholesale price)
    total_freight_cost = sum(o.delivered_qty * (o.unit_price * 0.12) for o in orders)
    total_penalties = sum(o.penalty_amount for o in orders)

    current_net_profit = total_revenue - total_mfg_cost - total_freight_cost - total_penalties
    current_net_margin_pct = round((current_net_profit / total_revenue) * 100, 1) if total_revenue > 0 else 0.0

    # Optimized portfolio projection (Eradicating ~80% of carrier SLA penalties + route optimization)
    optimized_penalties = total_penalties * 0.18
    optimized_net_profit = total_revenue - total_mfg_cost - (total_freight_cost * 0.92) - optimized_penalties
    optimized_net_margin_pct = round((optimized_net_profit / total_revenue) * 100, 1) if total_revenue > 0 else 0.0

    profit_lift_dollars = round(optimized_net_profit - current_net_profit, 2)
    profit_lift_pct = round(((optimized_net_profit - current_net_profit) / current_net_profit) * 100, 1) if current_net_profit > 0 else 0.0

    return {
        "summary": {
            "total_orders": total_orders,
            "total_revenue": round(total_revenue, 2),
            "total_mfg_cost": round(total_mfg_cost, 2),
            "total_freight_cost": round(total_freight_cost, 2),
            "total_penalties_loss": round(total_penalties, 2),
            "current_net_profit": round(current_net_profit, 2),
            "current_net_margin_pct": current_net_margin_pct,
            "optimized_net_profit": round(optimized_net_profit, 2),
            "optimized_net_margin_pct": optimized_net_margin_pct,
            "potential_profit_lift_dollars": profit_lift_dollars,
            "potential_profit_lift_pct": profit_lift_pct
        }
    }


def optimize_order_assignment(req: OrderAssignmentOptimizationRequest) -> OrderAssignmentOptimizationResponse:
    # Customer contract specs & priority weighting
    cust_specs = {
        "CUST-101": {"name": "The Home Depot (US East)", "type": "Retailer", "window_days": 2, "daily_penalty": 450.0, "reject_pct": 0.15, "preferred_dc": "DC-ATLANTA"},
        "CUST-102": {"name": "The Home Depot (US West)", "type": "Retailer", "window_days": 2, "daily_penalty": 450.0, "reject_pct": 0.15, "preferred_dc": "DC-INLAND"},
        "CUST-103": {"name": "Lowe's Companies (US East)", "type": "Retailer", "window_days": 2, "daily_penalty": 400.0, "reject_pct": 0.15, "preferred_dc": "DC-ATLANTA"},
        "CUST-104": {"name": "Menards Inc. (Midwest)", "type": "Retailer", "window_days": 3, "daily_penalty": 300.0, "reject_pct": 0.10, "preferred_dc": "DC-ATLANTA"},
        "CUST-105": {"name": "Kingfisher Group (EU)", "type": "Retailer", "window_days": 3, "daily_penalty": 500.0, "reject_pct": 0.15, "preferred_dc": "DC-ROTTERDAM"},
        "CUST-201": {"name": "Grainger Industrial Supply", "type": "Industrial", "window_days": 4, "daily_penalty": 150.0, "reject_pct": 0.05, "preferred_dc": "DC-ATLANTA"},
        "CUST-202": {"name": "Fastenal Direct Supply", "type": "Industrial", "window_days": 4, "daily_penalty": 150.0, "reject_pct": 0.05, "preferred_dc": "DC-INLAND"},
        "CUST-203": {"name": "Bechtel Construction Fleet", "type": "Industrial", "window_days": 5, "daily_penalty": 100.0, "reject_pct": 0.05, "preferred_dc": "DC-ATLANTA"},
    }

    sku_specs = {
        "SKU-DRL-01": {"name": "Pro-X 20V Cordless Hammer Drill", "unit_cost": 45.0, "wholesale_price": 99.0},
        "SKU-DRL-02": {"name": "UltraDrill 12V Compact Driver", "unit_cost": 30.0, "wholesale_price": 69.0},
        "SKU-DRL-03": {"name": "HeavyDuty 1/2 in. Mud Mixer & Drill", "unit_cost": 72.0, "wholesale_price": 159.0},
        "SKU-SAW-02": {"name": "MaxCut 7-1/4 in. Circular Saw", "unit_cost": 65.0, "wholesale_price": 139.0},
        "SKU-SAW-06": {"name": "ProGlide 10 in. Dual-Bevel Miter Saw", "unit_cost": 130.0, "wholesale_price": 289.0},
        "SKU-SAW-07": {"name": "Reciprocating Utility Saw Pro", "unit_cost": 52.0, "wholesale_price": 119.0},
        "SKU-NAL-03": {"name": "FramingPro Pneumatic 21-Degree Nailer", "unit_cost": 85.0, "wholesale_price": 189.0},
        "SKU-NAL-08": {"name": "FinishPro 16-Gauge Cordless Brad Nailer", "unit_cost": 98.0, "wholesale_price": 219.0},
        "SKU-MOW-04": {"name": "EcoMow 40V Self-Propelled Lawn Mower", "unit_cost": 190.0, "wholesale_price": 399.0},
        "SKU-MOW-09": {"name": "TurfMaster 60V Commercial Zero-Turn Mower", "unit_cost": 410.0, "wholesale_price": 899.0},
        "SKU-MOW-10": {"name": "TrimLite 20V Cordless String Trimmer & Edger", "unit_cost": 58.0, "wholesale_price": 129.0},
        "SKU-VAC-05": {"name": "CleanVac Heavy Duty 12G Shop Vac", "unit_cost": 55.0, "wholesale_price": 119.0},
        "SKU-VAC-11": {"name": "HydroVac 16G Wet/Dry Stainless Vac", "unit_cost": 82.0, "wholesale_price": 179.0},
    }

    cust_info = cust_specs.get(req.customer_id, cust_specs["CUST-101"])

    # Parse requested item lines (supports multi-SKU items array or single item fallback)
    items_to_process = []
    if req.items and len(req.items) > 0:
        for it in req.items:
            items_to_process.append({"sku_id": it.sku_id, "ordered_qty": it.ordered_qty})
    else:
        s_id = req.sku_id if req.sku_id else "SKU-DRL-01"
        q_qty = req.ordered_qty if req.ordered_qty else 500
        items_to_process.append({"sku_id": s_id, "ordered_qty": q_qty})

    # Compute batch totals
    total_batch_qty = sum(it["ordered_qty"] for it in items_to_process)
    gross_revenue = 0.0
    mfg_total_cost = 0.0
    item_breakdown = []

    for it in items_to_process:
        s_info = sku_specs.get(it["sku_id"], sku_specs["SKU-DRL-01"])
        line_rev = round(it["ordered_qty"] * s_info["wholesale_price"], 2)
        line_cost = round(it["ordered_qty"] * s_info["unit_cost"], 2)
        gross_revenue += line_rev
        mfg_total_cost += line_cost
        item_breakdown.append({
            "sku_id": it["sku_id"],
            "sku_name": s_info["name"],
            "ordered_qty": it["ordered_qty"],
            "unit_price": s_info["wholesale_price"],
            "unit_cost": s_info["unit_cost"],
            "line_revenue": line_rev,
            "line_mfg_cost": line_cost
        })

    gross_revenue = round(gross_revenue, 2)
    mfg_total_cost = round(mfg_total_cost, 2)
    avg_mfg_unit_cost = round(mfg_total_cost / total_batch_qty, 2) if total_batch_qty > 0 else 0.0

    # Candidate Fulfillment Paths (Factory -> DC -> Carrier)
    candidate_paths = [
        {
            "path_id": "PATH-01",
            "factory_name": "Shenzhen Main Power Plant #1 (China)",
            "dc_name": "US East Hub (Atlanta, GA)",
            "carrier_name": "FedEx Priority Freight (Expedited Dedicated)",
            "stock_available_qty": total_batch_qty + 500,
            "stock_status": "In Stock (100% Available Across SKUs)",
            "freight_per_unit": 12.50,
            "est_delivery_days": 2.1,
            "on_time_reliability_pct": 96.5,
            "rejection_risk_pct": 0.5
        },
        {
            "path_id": "PATH-02",
            "factory_name": "Vietnam Assembly Complex (Binh Duong)",
            "dc_name": "US West Hub (Inland Empire, CA)",
            "carrier_name": "JB Hunt Dedicated Fleet",
            "stock_available_qty": total_batch_qty + 350,
            "stock_status": "In Stock (100% Available Across SKUs)",
            "freight_per_unit": 14.20,
            "est_delivery_days": 2.4,
            "on_time_reliability_pct": 94.2,
            "rejection_risk_pct": 0.8
        },
        {
            "path_id": "PATH-03",
            "factory_name": "Shenzhen Main Power Plant #1 (China)",
            "dc_name": "US East Hub (Atlanta, GA)",
            "carrier_name": "XPO Logistics Regional LTL (Standard)",
            "stock_available_qty": total_batch_qty,
            "stock_status": "Partial Stock (High Re-allocation Risk)",
            "freight_per_unit": 8.00,
            "est_delivery_days": 3.8,
            "on_time_reliability_pct": 74.5,
            "rejection_risk_pct": 3.2
        },
        {
            "path_id": "PATH-04",
            "factory_name": "Vietnam Assembly Complex (Binh Duong)",
            "dc_name": "EU Gateway Hub (Rotterdam, NL)",
            "carrier_name": "DHL Express Freight Europe",
            "stock_available_qty": total_batch_qty + 200,
            "stock_status": "In Stock (100% Available Across SKUs)",
            "freight_per_unit": 16.80,
            "est_delivery_days": 2.5,
            "on_time_reliability_pct": 95.8,
            "rejection_risk_pct": 0.6
        },
    ]

    fulfillment_options: List[FulfillmentPathOption] = []

    for cp in candidate_paths:
        freight_cost = round(total_batch_qty * cp["freight_per_unit"], 2)
        total_cost = round(mfg_total_cost + freight_cost, 2)

        sla_window = cust_info["window_days"]
        days_late_risk = max(0.0, cp["est_delivery_days"] - sla_window)
        fail_prob = (100.0 - cp["on_time_reliability_pct"]) / 100.0

        daily_penalty_cost = days_late_risk * cust_info["daily_penalty"]
        rejection_penalty_cost = (gross_revenue * cust_info["reject_pct"]) * (cp["rejection_risk_pct"] / 100.0)

        projected_penalty_risk = round(fail_prob * (daily_penalty_cost + rejection_penalty_cost), 2)
        net_profit = round(gross_revenue - total_cost - projected_penalty_risk, 2)
        gross_margin_pct = round((net_profit / gross_revenue) * 100, 1) if gross_revenue > 0 else 0.0

        status = "Optimal SLA Compliance" if cp["est_delivery_days"] <= sla_window else "SLA Delay Risk"

        fulfillment_options.append(
            FulfillmentPathOption(
                path_id=cp["path_id"],
                factory_name=cp["factory_name"],
                dc_name=cp["dc_name"],
                carrier_name=cp["carrier_name"],
                stock_available_qty=cp["stock_available_qty"],
                stock_status=cp["stock_status"],
                mfg_unit_cost=avg_mfg_unit_cost,
                freight_shipping_cost=freight_cost,
                total_cost=total_cost,
                gross_revenue=gross_revenue,
                projected_penalty_risk=projected_penalty_risk,
                net_profit_dollar=net_profit,
                gross_margin_pct=gross_margin_pct,
                est_delivery_days=cp["est_delivery_days"],
                sla_compliance_status=status,
                is_optimal_profit_path=False,
                recommendation_notes=""
            )
        )

    # ALWAYS SORT HIGH TO LOW by Net Operating Profit ($)
    fulfillment_options.sort(key=lambda x: x.net_profit_dollar, reverse=True)

    optimal_path = fulfillment_options[0]
    optimal_path.is_optimal_profit_path = True
    optimal_path.recommendation_notes = f"Optimal Profit Path: Yields highest Net Margin (${optimal_path.net_profit_dollar:,.2f} / {optimal_path.gross_margin_pct}%) across {len(item_breakdown)} SKUs ({total_batch_qty} total units) by combining stock availability, {optimal_path.est_delivery_days}-day delivery lead time within {cust_info['window_days']}-day SLA window, and minimal penalty risk."

    worst_path = fulfillment_options[-1]
    potential_profit_lift = round(optimal_path.net_profit_dollar - worst_path.net_profit_dollar, 2)

    return OrderAssignmentOptimizationResponse(
        request_details={
            "customer_id": req.customer_id,
            "customer_name": cust_info["name"],
            "total_items_count": len(item_breakdown),
            "total_ordered_qty": total_batch_qty,
            "gross_revenue": gross_revenue,
            "promised_delivery_date": req.promised_delivery_date,
            "item_breakdown": item_breakdown,
            "sku_id": item_breakdown[0]["sku_id"],
            "sku_name": item_breakdown[0]["sku_name"] if len(item_breakdown) == 1 else f"{len(item_breakdown)} SKUs Batch ({total_batch_qty} units)",
            "ordered_qty": total_batch_qty
        },
        optimal_profit_path=optimal_path,
        fulfillment_paths=fulfillment_options,
        max_net_margin_pct=optimal_path.gross_margin_pct,
        potential_profit_lift_dollars=potential_profit_lift
    )
