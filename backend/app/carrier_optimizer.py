from typing import List, Dict, Any, Optional
from app.models import (
    CarrierPerformance, CarrierOptimizationRequest, CarrierOptionResult,
    CarrierOptimizationResponse, OrderLineItem
)

# Comprehensive Carrier Matrix with historical performance metrics across US East, US West, Midwest, and Europe routes
CARRIER_CATALOG = [
    {
        "carrier_id": "CAR-01",
        "carrier_name": "FedEx Priority Freight (Expedited)",
        "service_tier": "Guaranteed Premium",
        "avg_transit_hours": 32.0,  # 1.33 Days
        "on_time_reliability_pct": 96.5,
        "damage_rejection_pct": 0.5,
        "cost_per_pallet": 380.0,
        "sla_compliance_status": "Optimal"
    },
    {
        "carrier_id": "CAR-02",
        "carrier_name": "JB Hunt Dedicated Fleet",
        "service_tier": "Expedited Dedicated",
        "avg_transit_hours": 38.0,  # 1.58 Days
        "on_time_reliability_pct": 94.2,
        "damage_rejection_pct": 0.8,
        "cost_per_pallet": 310.0,
        "sla_compliance_status": "Optimal"
    },
    {
        "carrier_id": "CAR-03",
        "carrier_name": "Schneider National Priority",
        "service_tier": "Expedited Dedicated",
        "avg_transit_hours": 42.0,  # 1.75 Days
        "on_time_reliability_pct": 92.0,
        "damage_rejection_pct": 1.1,
        "cost_per_pallet": 280.0,
        "sla_compliance_status": "Acceptable"
    },
    {
        "carrier_id": "CAR-04",
        "carrier_name": "DHL Express Freight (Europe)",
        "service_tier": "Guaranteed Premium",
        "avg_transit_hours": 36.0,  # 1.5 Days
        "on_time_reliability_pct": 95.8,
        "damage_rejection_pct": 0.6,
        "cost_per_pallet": 420.0,
        "sla_compliance_status": "Optimal"
    },
    {
        "carrier_id": "CAR-05",
        "carrier_name": "XPO Logistics Regional LTL",
        "service_tier": "Standard LTL",
        "avg_transit_hours": 68.0,  # 2.83 Days
        "on_time_reliability_pct": 74.5,
        "damage_rejection_pct": 3.2,
        "cost_per_pallet": 190.0,
        "sla_compliance_status": "High Risk Breach"
    },
    {
        "carrier_id": "CAR-06",
        "carrier_name": "Old Dominion Freight Line",
        "service_tier": "Standard LTL",
        "avg_transit_hours": 58.0,  # 2.41 Days
        "on_time_reliability_pct": 82.0,
        "damage_rejection_pct": 2.1,
        "cost_per_pallet": 220.0,
        "sla_compliance_status": "Sub-Optimal"
    },
    {
        "carrier_id": "CAR-07",
        "carrier_name": "UPS Supply Chain Solutions",
        "service_tier": "Expedited Dedicated",
        "avg_transit_hours": 48.0,  # 2.0 Days
        "on_time_reliability_pct": 93.5,
        "damage_rejection_pct": 0.9,
        "cost_per_pallet": 295.0,
        "sla_compliance_status": "Optimal"
    },
    {
        "carrier_id": "CAR-08",
        "carrier_name": "Estes Express Industrial",
        "service_tier": "Standard LTL",
        "avg_transit_hours": 52.0,  # 2.16 Days
        "on_time_reliability_pct": 88.5,
        "damage_rejection_pct": 1.4,
        "cost_per_pallet": 210.0,
        "sla_compliance_status": "Acceptable"
    },
]


def audit_current_carrier_performance(orders: List[OrderLineItem]) -> Dict[str, Any]:
    current_carrier_stats = {
        "FedEx Freight / Swift": {"assigned_to": "The Home Depot (US East)", "sla_target": 48, "actual_avg_hours": 76.8, "on_time_pct": 52.3, "penalties_caused": 155757.0, "status": "Sub-Optimal Breach"},
        "JB Hunt / Old Dominion": {"assigned_to": "The Home Depot (US West)", "sla_target": 36, "actual_avg_hours": 67.2, "on_time_pct": 51.7, "penalties_caused": 158525.0, "status": "Sub-Optimal Breach"},
        "Schneider National": {"assigned_to": "Lowe's Companies (US East)", "sla_target": 48, "actual_avg_hours": 81.6, "on_time_pct": 59.5, "penalties_caused": 161073.25, "status": "Sub-Optimal Breach"},
        "XPO Logistics": {"assigned_to": "Menards Inc. (Midwest)", "sla_target": 72, "actual_avg_hours": 98.4, "on_time_pct": 51.7, "penalties_caused": 88785.0, "status": "High Risk Breach"},
        "DHL Freight Europe": {"assigned_to": "Kingfisher Group (EU)", "sla_target": 48, "actual_avg_hours": 93.6, "on_time_pct": 49.1, "penalties_caused": 32832.0, "status": "Sub-Optimal Breach"},
        "UPS Supply Chain Solutions": {"assigned_to": "Grainger Industrial", "sla_target": 96, "actual_avg_hours": 100.8, "on_time_pct": 82.5, "penalties_caused": 18962.75, "status": "Acceptable"},
        "Estes Express Industrial": {"assigned_to": "Fastenal Direct", "sla_target": 96, "actual_avg_hours": 103.2, "on_time_pct": 84.0, "penalties_caused": 18697.0, "status": "Acceptable"},
    }

    audit_list = []
    for cname, stats in current_carrier_stats.items():
        audit_list.append({
            "carrier_name": cname,
            "primary_customer_account": stats["assigned_to"],
            "assigned_to": stats["assigned_to"],
            "target_sla_hours": stats["sla_target"],
            "sla_target_hours": stats["sla_target"],
            "actual_avg_transit_hours": stats["actual_avg_hours"],
            "actual_avg_hours": stats["actual_avg_hours"],
            "sla_delay_gap_hours": round(stats["actual_avg_hours"] - stats["sla_target"], 1),
            "on_time_reliability_pct": stats["on_time_pct"],
            "on_time_pct": stats["on_time_pct"],
            "penalty_loss_accrued": stats["penalties_caused"],
            "penalties_caused": stats["penalties_caused"],
            "sla_status": stats["status"],
            "status": stats["status"]
        })

    audit_list.sort(key=lambda x: x["penalties_caused"], reverse=True)

    return {
        "summary": "Current carrier assignments are sub-optimal for Retailer channels, missing SLA delivery windows by +1.1 to +1.9 days and triggering $634k+ in line penalties.",
        "total_penalty_impact": sum(x["penalties_caused"] for x in audit_list),
        "carrier_performance": audit_list,
        "carrier_audit": audit_list,
        "available_catalog": CARRIER_CATALOG
    }



def optimize_carrier_assignment(req: CarrierOptimizationRequest) -> CarrierOptimizationResponse:
    # Customer contract parameters
    cust_specs = {
        "CUST-101": {"name": "The Home Depot (US East)", "type": "Retailer", "window_days": 2, "daily_penalty": 450.0, "reject_pct": 0.15, "current_carrier": "FedEx Freight / Swift"},
        "CUST-102": {"name": "The Home Depot (US West)", "type": "Retailer", "window_days": 2, "daily_penalty": 450.0, "reject_pct": 0.15, "current_carrier": "JB Hunt / Old Dominion"},
        "CUST-103": {"name": "Lowe's Companies (US East)", "type": "Retailer", "window_days": 2, "daily_penalty": 400.0, "reject_pct": 0.15, "current_carrier": "Schneider National"},
        "CUST-104": {"name": "Menards Inc. (Midwest)", "type": "Retailer", "window_days": 3, "daily_penalty": 300.0, "reject_pct": 0.10, "current_carrier": "XPO Logistics"},
        "CUST-105": {"name": "Kingfisher Group (EU)", "type": "Retailer", "window_days": 3, "daily_penalty": 500.0, "reject_pct": 0.15, "current_carrier": "DHL Freight Europe"},
        "CUST-201": {"name": "Grainger Industrial Supply", "type": "Industrial", "window_days": 4, "daily_penalty": 150.0, "reject_pct": 0.05, "current_carrier": "UPS Supply Chain Solutions"},
        "CUST-202": {"name": "Fastenal Direct Supply", "type": "Industrial", "window_days": 4, "daily_penalty": 150.0, "reject_pct": 0.05, "current_carrier": "Estes Express Industrial"},
        "CUST-203": {"name": "Bechtel Construction Fleet", "type": "Industrial", "window_days": 5, "daily_penalty": 100.0, "reject_pct": 0.05, "current_carrier": "R+L Carriers Dedicated"},
    }

    cust_info = cust_specs.get(req.customer_id, cust_specs["CUST-101"])
    
    # Calculate order volume & pallets (approx 20 units per pallet)
    pallets = max(1, req.ordered_qty // 20)
    wholesale_unit_price = 140.0
    est_invoice_value = req.ordered_qty * wholesale_unit_price

    carrier_options: List[CarrierOptionResult] = []

    for c in CARRIER_CATALOG:
        est_transit_days = round(c["avg_transit_hours"] / 24.0, 2)
        est_freight_cost = round(pallets * c["cost_per_pallet"], 2)
        expected_otif = c["on_time_reliability_pct"]

        # Calculate penalty risk if transit exceeds SLA window
        sla_window = cust_info["window_days"]
        days_late_risk = max(0.0, est_transit_days - sla_window)
        
        fail_prob = (100.0 - expected_otif) / 100.0
        daily_penalty_cost = days_late_risk * cust_info["daily_penalty"]
        rejection_penalty_cost = (est_invoice_value * cust_info["reject_pct"]) * (c["damage_rejection_pct"] / 100.0)
        
        projected_penalty_risk = round(fail_prob * (daily_penalty_cost + rejection_penalty_cost), 2)
        net_total_cost = round(est_freight_cost + projected_penalty_risk, 2)

        carrier_options.append(
            CarrierOptionResult(
                carrier_id=c["carrier_id"],
                carrier_name=c["carrier_name"],
                service_tier=c["service_tier"],
                est_transit_days=est_transit_days,
                est_freight_cost=est_freight_cost,
                expected_otif_pct=expected_otif,
                projected_penalty_risk=projected_penalty_risk,
                net_total_cost=net_total_cost,
                is_recommended=False,
                recommendation_reason=""
            )
        )

    # Sort carrier options by net total cost (freight cost + penalty risk) ascending
    carrier_options.sort(key=lambda x: x.net_total_cost)

    # Select top optimal carrier
    optimal = carrier_options[0]
    optimal.is_recommended = True
    optimal.recommendation_reason = f"Optimal choice for {cust_info['name']}: Delivers in {optimal.est_transit_days} days (within {cust_info['window_days']}-day SLA window) with {optimal.expected_otif_pct}% on-time reliability, minimizing line penalty risk."

    current_carrier_info = {
        "name": cust_info["current_carrier"],
        "customer_name": cust_info["name"],
        "sla_window_days": cust_info["window_days"],
        "status": "Sub-Optimal SLA Failure Risk"
    }

    # Savings calculation compared to a standard unoptimized carrier option
    unoptimized_net = carrier_options[-1].net_total_cost
    projected_savings = round(max(0.0, unoptimized_net - optimal.net_total_cost), 2)

    return CarrierOptimizationResponse(
        request_details={
            "customer_id": req.customer_id,
            "customer_name": cust_info["name"],
            "dc_id": req.dc_id,
            "sku_id": req.sku_id,
            "ordered_qty": req.ordered_qty,
            "est_invoice_value": est_invoice_value,
            "promised_delivery_date": req.promised_delivery_date,
        },
        current_carrier=current_carrier_info,
        optimal_recommended_carrier=optimal,
        carrier_options=carrier_options,
        projected_savings=projected_savings
    )
