from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models import OrderLineItem, OTIFBridgeItem, ExecutiveSummary, CustomerPenaltyGridItem

def filter_orders_by_date(orders: List[OrderLineItem], date_from: Optional[str] = None, date_to: Optional[str] = None) -> List[OrderLineItem]:
    if not date_from and not date_to:
        return orders
    
    filtered = []
    for o in orders:
        dt_str = o.timestamps.order_created_at
        if date_from and dt_str < date_from:
            continue
        if date_to and dt_str > date_to:
            continue
        filtered.append(o)
    return filtered


def calculate_otif_metrics(orders: List[OrderLineItem]) -> Dict[str, Any]:
    total_orders = len(orders)
    if total_orders == 0:
        return {
            "summary": ExecutiveSummary(
                total_orders=0, total_line_items=0, total_invoice_value=0.0,
                actual_otif_pct=0.0, target_otif_pct=92.0, on_time_pct=0.0, in_full_pct=0.0,
                total_penalties_accrued=0.0, top_defect_category="None"
            ),
            "waterfall_bridge": [],
            "sla_bottlenecks": [],
            "defect_category_breakdown": [],
            "customer_penalty_grid": []
        }

    otif_count = sum(1 for o in orders if o.is_otif)
    on_time_count = sum(1 for o in orders if o.is_on_time)
    in_full_count = sum(1 for o in orders if o.is_in_full)
    total_invoice = sum(o.total_invoice_value for o in orders)
    total_penalties = sum(o.penalty_amount for o in orders)

    actual_otif_pct = round((otif_count / total_orders) * 100, 1)
    on_time_pct = round((on_time_count / total_orders) * 100, 1)
    in_full_pct = round((in_full_count / total_orders) * 100, 1)

    # Defect category attributions
    defect_counts: Dict[str, int] = {}
    defect_penalties: Dict[str, float] = {}
    sub_element_counts: Dict[str, Dict[str, Any]] = {}

    for o in orders:
        if not o.is_otif and o.primary_defect_category:
            cat = o.primary_defect_category
            sub = o.defect_sub_element or "General Defect"

            defect_counts[cat] = defect_counts.get(cat, 0) + 1
            defect_penalties[cat] = defect_penalties.get(cat, 0) + o.penalty_amount

            if sub not in sub_element_counts:
                sub_element_counts[sub] = {
                    "category": cat,
                    "count": 0,
                    "penalty": 0.0,
                    "description": o.defect_description or ""
                }
            sub_element_counts[sub]["count"] += 1
            sub_element_counts[sub]["penalty"] += o.penalty_amount

    # Waterfall Bridge items - Sorted HIGH TO LOW by deduction percentage
    bridge_items: List[OTIFBridgeItem] = []
    for sub_name, sub_info in sub_element_counts.items():
        sub_count = sub_info["count"]
        sub_pct = round((sub_count / total_orders) * 100, 1)
        bridge_items.append(
            OTIFBridgeItem(
                category=sub_info["category"],
                sub_element=sub_name,
                deduction_pct=sub_pct,
                affected_orders_count=sub_count,
                penalty_cost=round(sub_info["penalty"], 2),
                description=sub_info["description"]
            )
        )
    # Sort waterfall items high to low
    bridge_items.sort(key=lambda x: (x.deduction_pct, x.penalty_cost), reverse=True)

    top_cat = max(defect_counts.items(), key=lambda x: x[1])[0] if defect_counts else "None"

    executive_summary = ExecutiveSummary(
        total_orders=total_orders,
        total_line_items=total_orders,
        total_invoice_value=round(total_invoice, 2),
        actual_otif_pct=actual_otif_pct,
        target_otif_pct=92.0,
        on_time_pct=on_time_pct,
        in_full_pct=in_full_pct,
        total_penalties_accrued=round(total_penalties, 2),
        top_defect_category=top_cat
    )

    # Customer Penalty Grid calculation (Line-level penalty rules) - Sorted HIGH TO LOW
    cust_groups: Dict[str, Dict[str, Any]] = {}
    for o in orders:
        cid = o.customer_id
        if cid not in cust_groups:
            cust_groups[cid] = {
                "id": cid,
                "name": o.customer_name,
                "type": o.customer_type,
                "total": 0,
                "otif": 0,
                "failed": 0,
                "penalties": 0.0,
                "defects": {}
            }
        g = cust_groups[cid]
        g["total"] += 1
        if o.is_otif:
            g["otif"] += 1
        else:
            g["failed"] += 1
            g["penalties"] += o.penalty_amount
            if o.primary_defect_category:
                g["defects"][o.primary_defect_category] = g["defects"].get(o.primary_defect_category, 0) + 1

    customer_penalty_grid = []
    rates = {
        "CUST-101": (450.0, 0.15),
        "CUST-102": (450.0, 0.15),
        "CUST-103": (400.0, 0.15),
        "CUST-104": (300.0, 0.10),
        "CUST-105": (500.0, 0.15),
        "CUST-201": (150.0, 0.05),
        "CUST-202": (150.0, 0.05),
        "CUST-203": (100.0, 0.05),
    }

    for cid, g in cust_groups.items():
        daily, reject_pct = rates.get(cid, (250.0, 0.10))
        top_cause = max(g["defects"].items(), key=lambda x: x[1])[0] if g["defects"] else "None"
        otif_pct = round((g["otif"] / g["total"]) * 100, 1) if g["total"] > 0 else 100.0
        
        customer_penalty_grid.append({
            "customer_id": cid,
            "customer_name": g["name"],
            "customer_type": g["type"],
            "total_orders": g["total"],
            "otif_pct": otif_pct,
            "failed_orders": g["failed"],
            "total_penalties": round(g["penalties"], 2),
            "daily_rate": daily,
            "line_reject_pct": reject_pct,
            "top_defect_cause": top_cause
        })

    # Sort penalty grid HIGH TO LOW by total_penalties
    customer_penalty_grid.sort(key=lambda x: x["total_penalties"], reverse=True)

    # Defect category breakdown - Sorted HIGH TO LOW by penalty
    defect_category_breakdown = [
        {"category": k, "count": v, "pct": round((v/total_orders)*100, 1), "penalty": round(defect_penalties[k], 2)}
        for k, v in defect_counts.items()
    ]
    defect_category_breakdown.sort(key=lambda x: (x["penalty"], x["pct"]), reverse=True)

def calculate_dynamic_sla_bottlenecks(orders: List[OrderLineItem]) -> List[Dict[str, Any]]:
    if not orders:
        return []

    cust_sla_map = {
        "CUST-101": 2, "CUST-102": 2, "CUST-103": 2, "CUST-104": 3, "CUST-105": 3,
        "CUST-201": 4, "CUST-202": 4, "CUST-203": 5
    }

    def parse_dt(ts_str: str) -> datetime:
        return datetime.fromisoformat(ts_str.replace("Z", ""))

    def days_diff(ts_start: str, ts_end: str) -> float:
        try:
            d1 = parse_dt(ts_start)
            d2 = parse_dt(ts_end)
            return max(0.0, (d2 - d1).total_seconds() / 86400.0)
        except Exception:
            return 0.0

    stage_accumulators = {
        1: {"target_sum": 0.0, "actual_sum": 0.0, "delay_sum": 0.0, "count": 0},
        2: {"target_sum": 0.0, "actual_sum": 0.0, "delay_sum": 0.0, "count": 0},
        3: {"target_sum": 0.0, "actual_sum": 0.0, "delay_sum": 0.0, "count": 0},
        4: {"target_sum": 0.0, "actual_sum": 0.0, "delay_sum": 0.0, "count": 0},
        5: {"target_sum": 0.0, "actual_sum": 0.0, "delay_sum": 0.0, "count": 0},
        6: {"target_sum": 0.0, "actual_sum": 0.0, "delay_sum": 0.0, "count": 0},
    }

    for o in orders:
        ts = o.timestamps
        cust_target_window = cust_sla_map.get(o.customer_id, 2)

        # Stage 1: Factory Production Run (order_created_at -> factory_mfg_actual_at)
        target_1 = 3.0
        act_1 = days_diff(ts.order_created_at, ts.factory_mfg_actual_at)
        delay_1 = max(0.0, act_1 - target_1)

        # Stage 2: Factory Staging & Export (factory_mfg_actual_at -> factory_dispatch_actual_at)
        target_2 = 2.0
        act_2 = days_diff(ts.factory_mfg_actual_at, ts.factory_dispatch_actual_at)
        delay_2 = max(0.0, act_2 - target_2)

        # Stage 3: Origin Logistics & Placement (factory_dispatch_actual_at -> origin_departure_actual_at)
        target_3 = 2.0
        act_3 = days_diff(ts.factory_dispatch_actual_at, ts.origin_departure_actual_at)
        delay_3 = max(0.0, act_3 - target_3)

        # Stage 4: Ocean/Air Shipping Transit (origin_departure_actual_at -> dc_arrival_actual_at)
        target_4 = 22.0 if o.factory_id == "FAC-SHENZHEN" else 25.0
        act_4 = days_diff(ts.origin_departure_actual_at, ts.dc_arrival_actual_at)
        delay_4 = max(0.0, act_4 - target_4)

        # Stage 5: DC Staging & Allocation (dc_arrival_actual_at -> dc_dispatch_actual_at)
        target_5 = 2.0
        act_5 = days_diff(ts.dc_arrival_actual_at, ts.dc_dispatch_actual_at)
        delay_5 = max(0.0, act_5 - target_5)

        # Stage 6: Customer Dock Delivery Window (dc_dispatch_actual_at -> actual_delivery_at)
        target_6 = float(cust_target_window)
        act_6 = days_diff(ts.dc_dispatch_actual_at, ts.actual_delivery_at)
        delay_6 = max(0.0, act_6 - target_6)

        stage_vals = [(1, target_1, act_1, delay_1), (2, target_2, act_2, delay_2),
                      (3, target_3, act_3, delay_3), (4, target_4, act_4, delay_4),
                      (5, target_5, act_5, delay_5), (6, target_6, act_6, delay_6)]

        for s_idx, t_val, a_val, d_val in stage_vals:
            acc = stage_accumulators[s_idx]
            acc["target_sum"] += t_val
            acc["actual_sum"] += a_val
            acc["delay_sum"] += d_val
            acc["count"] += 1

    total_network_delay = sum(acc["delay_sum"] for acc in stage_accumulators.values())

    stage_definitions = {
        1: ("1. Factory Production Run", "Factory Operations / RM Suppliers"),
        2: ("2. Factory Staging & Export", "Asia Warehouse Staging"),
        3: ("3. Origin Logistics & Placement", "Logistics & Freight Forwarders"),
        4: ("4. Ocean/Air Shipping Transit", "Ocean Carriers / Customs"),
        5: ("5. DC Staging & Allocation", "DC Operations & Planning"),
        6: ("6. Customer Dock Delivery Window", "Last-Mile Carriers / Dock Scheduling")
    }

    result = []
    for s_idx, (stage_title, stage_owner) in stage_definitions.items():
        acc = stage_accumulators[s_idx]
        cnt = acc["count"] if acc["count"] > 0 else 1
        avg_target = round(acc["target_sum"] / cnt, 1)
        avg_actual = round(acc["actual_sum"] / cnt, 1)
        delay_pct = round((acc["delay_sum"] / total_network_delay * 100.0), 1) if total_network_delay > 0 else round(100.0 / 6, 1)

        if avg_actual > avg_target + 1.0 or delay_pct > 25.0:
            status = "Critical Breach"
        elif avg_actual > avg_target + 0.2:
            status = "Warning"
        else:
            status = "On Track"

        result.append({
            "stage": stage_title,
            "sla_target_days": avg_target,
            "avg_actual_days": avg_actual,
            "delay_contribution_pct": delay_pct,
            "owner": stage_owner,
            "status": status
        })

    # Sort HIGH TO LOW by delay_contribution_pct
    result.sort(key=lambda x: x["delay_contribution_pct"], reverse=True)
    return result


def calculate_otif_metrics(orders: List[OrderLineItem]) -> Dict[str, Any]:
    total_orders = len(orders)
    if total_orders == 0:
        return {
            "summary": ExecutiveSummary(
                total_orders=0, total_line_items=0, total_invoice_value=0.0,
                actual_otif_pct=0.0, target_otif_pct=92.0, on_time_pct=0.0, in_full_pct=0.0,
                total_penalties_accrued=0.0, top_defect_category="None"
            ),
            "waterfall_bridge": [],
            "sla_bottlenecks": [],
            "defect_category_breakdown": [],
            "customer_penalty_grid": []
        }

    otif_count = sum(1 for o in orders if o.is_otif)
    on_time_count = sum(1 for o in orders if o.is_on_time)
    in_full_count = sum(1 for o in orders if o.is_in_full)
    total_invoice = sum(o.total_invoice_value for o in orders)
    total_penalties = sum(o.penalty_amount for o in orders)

    actual_otif_pct = round((otif_count / total_orders) * 100, 1)
    on_time_pct = round((on_time_count / total_orders) * 100, 1)
    in_full_pct = round((in_full_count / total_orders) * 100, 1)

    # Defect category attributions
    defect_counts: Dict[str, int] = {}
    defect_penalties: Dict[str, float] = {}
    sub_element_counts: Dict[str, Dict[str, Any]] = {}

    for o in orders:
        if not o.is_otif and o.primary_defect_category:
            cat = o.primary_defect_category
            sub = o.defect_sub_element or "General Defect"

            defect_counts[cat] = defect_counts.get(cat, 0) + 1
            defect_penalties[cat] = defect_penalties.get(cat, 0) + o.penalty_amount

            if sub not in sub_element_counts:
                sub_element_counts[sub] = {
                    "category": cat,
                    "count": 0,
                    "penalty": 0.0,
                    "description": o.defect_description or ""
                }
            sub_element_counts[sub]["count"] += 1
            sub_element_counts[sub]["penalty"] += o.penalty_amount

    # Waterfall Bridge items - Sorted HIGH TO LOW by deduction percentage
    bridge_items: List[OTIFBridgeItem] = []
    for sub_name, sub_info in sub_element_counts.items():
        sub_count = sub_info["count"]
        sub_pct = round((sub_count / total_orders) * 100, 1)
        bridge_items.append(
            OTIFBridgeItem(
                category=sub_info["category"],
                sub_element=sub_name,
                deduction_pct=sub_pct,
                affected_orders_count=sub_count,
                penalty_cost=round(sub_info["penalty"], 2),
                description=sub_info["description"]
            )
        )
    # Sort waterfall items high to low
    bridge_items.sort(key=lambda x: (x.deduction_pct, x.penalty_cost), reverse=True)

    top_cat = max(defect_counts.items(), key=lambda x: x[1])[0] if defect_counts else "None"

    executive_summary = ExecutiveSummary(
        total_orders=total_orders,
        total_line_items=total_orders,
        total_invoice_value=round(total_invoice, 2),
        actual_otif_pct=actual_otif_pct,
        target_otif_pct=92.0,
        on_time_pct=on_time_pct,
        in_full_pct=in_full_pct,
        total_penalties_accrued=round(total_penalties, 2),
        top_defect_category=top_cat
    )

    # Customer Penalty Grid calculation (Line-level penalty rules) - Sorted HIGH TO LOW
    cust_groups: Dict[str, Dict[str, Any]] = {}
    for o in orders:
        cid = o.customer_id
        if cid not in cust_groups:
            cust_groups[cid] = {
                "id": cid,
                "name": o.customer_name,
                "type": o.customer_type,
                "total": 0,
                "otif": 0,
                "failed": 0,
                "penalties": 0.0,
                "defects": {}
            }
        g = cust_groups[cid]
        g["total"] += 1
        if o.is_otif:
            g["otif"] += 1
        else:
            g["failed"] += 1
            g["penalties"] += o.penalty_amount
            if o.primary_defect_category:
                g["defects"][o.primary_defect_category] = g["defects"].get(o.primary_defect_category, 0) + 1

    customer_penalty_grid = []
    rates = {
        "CUST-101": (450.0, 0.15),
        "CUST-102": (450.0, 0.15),
        "CUST-103": (400.0, 0.15),
        "CUST-104": (300.0, 0.10),
        "CUST-105": (500.0, 0.15),
        "CUST-201": (150.0, 0.05),
        "CUST-202": (150.0, 0.05),
        "CUST-203": (100.0, 0.05),
    }

    for cid, g in cust_groups.items():
        daily, reject_pct = rates.get(cid, (250.0, 0.10))
        top_cause = max(g["defects"].items(), key=lambda x: x[1])[0] if g["defects"] else "None"
        otif_pct = round((g["otif"] / g["total"]) * 100, 1) if g["total"] > 0 else 100.0
        
        customer_penalty_grid.append({
            "customer_id": cid,
            "customer_name": g["name"],
            "customer_type": g["type"],
            "total_orders": g["total"],
            "otif_pct": otif_pct,
            "failed_orders": g["failed"],
            "total_penalties": round(g["penalties"], 2),
            "daily_rate": daily,
            "line_reject_pct": reject_pct,
            "top_defect_cause": top_cause
        })

    # Sort penalty grid HIGH TO LOW by total_penalties
    customer_penalty_grid.sort(key=lambda x: x["total_penalties"], reverse=True)

    # Defect category breakdown - Sorted HIGH TO LOW by penalty
    defect_category_breakdown = [
        {"category": k, "count": v, "pct": round((v/total_orders)*100, 1), "penalty": round(defect_penalties[k], 2)}
        for k, v in defect_counts.items()
    ]
    defect_category_breakdown.sort(key=lambda x: (x["penalty"], x["pct"]), reverse=True)

    # DYNAMIC SLA Bottlenecks calculation from filtered orders - Sorted HIGH TO LOW by delay_contribution_pct
    sla_bottlenecks = calculate_dynamic_sla_bottlenecks(orders)

    return {
        "summary": executive_summary,
        "waterfall_bridge": bridge_items,
        "sla_bottlenecks": sla_bottlenecks,
        "defect_category_breakdown": defect_category_breakdown,
        "customer_penalty_grid": customer_penalty_grid
    }


def calculate_granular_node_analytics(orders: List[OrderLineItem]) -> Dict[str, Any]:
    factory_names = {
        "FAC-SHENZHEN": "Shenzhen Main Power Plant #1 (China)",
        "FAC-VIETNAM": "Vietnam Assembly Complex (Binh Duong)"
    }
    factories: Dict[str, Dict[str, Any]] = {}
    for fid, fname in factory_names.items():
        factories[fid] = {
            "factory_id": fid,
            "factory_name": fname,
            "total_orders": 0,
            "otif_orders": 0,
            "failed_orders": 0,
            "total_penalties": 0.0,
            "defects": {}
        }

    dc_names = {
        "DC-ATLANTA": "US East Logistics Hub (Atlanta GA)",
        "DC-INLAND": "US West Logistics Hub (Inland Empire CA)",
        "DC-ROTTERDAM": "EU Gateway Hub (Rotterdam NL)"
    }
    dcs: Dict[str, Dict[str, Any]] = {}
    for dc_id, dc_name in dc_names.items():
        dcs[dc_id] = {
            "dc_id": dc_id,
            "dc_name": dc_name,
            "total_orders": 0,
            "otif_orders": 0,
            "failed_orders": 0,
            "total_penalties": 0.0,
            "defects": {}
        }

    lanes: Dict[str, Dict[str, Any]] = {}

    for o in orders:
        fid = o.factory_id
        dc_id = o.dc_id
        lane_id = f"{fid} → {dc_id}"

        f = factories.get(fid)
        if f:
            f["total_orders"] += 1
            if o.is_otif:
                f["otif_orders"] += 1
            else:
                f["failed_orders"] += 1
                f["total_penalties"] += o.penalty_amount
                if o.primary_defect_category:
                    f["defects"][o.primary_defect_category] = f["defects"].get(o.primary_defect_category, 0) + 1

        d = dcs.get(dc_id)
        if d:
            d["total_orders"] += 1
            if o.is_otif:
                d["otif_orders"] += 1
            else:
                d["failed_orders"] += 1
                d["total_penalties"] += o.penalty_amount
                if o.primary_defect_category:
                    d["defects"][o.primary_defect_category] = d["defects"].get(o.primary_defect_category, 0) + 1

        if lane_id not in lanes:
            lanes[lane_id] = {
                "lane_id": lane_id,
                "origin_factory": factory_names.get(fid, fid),
                "destination_dc": dc_names.get(dc_id, dc_id),
                "transport_mode": "Ocean Freight",
                "baseline_sla_days": 24 if fid == "FAC-SHENZHEN" else 26,
                "total_orders": 0,
                "otif_orders": 0,
                "failed_orders": 0,
                "total_penalties": 0.0,
                "defects": {}
            }
        l = lanes[lane_id]
        l["total_orders"] += 1
        if o.is_otif:
            l["otif_orders"] += 1
        else:
            l["failed_orders"] += 1
            l["total_penalties"] += o.penalty_amount
            if o.primary_defect_category:
                l["defects"][o.primary_defect_category] = l["defects"].get(o.primary_defect_category, 0) + 1

    # Format Factory list - Sorted HIGH TO LOW by total_penalties
    factory_list = []
    for fid, f in factories.items():
        otif_pct = round((f["otif_orders"] / f["total_orders"]) * 100, 1) if f["total_orders"] > 0 else 100.0
        top_defect = max(f["defects"].items(), key=lambda x: x[1])[0] if f["defects"] else "None"
        
        # Sort factory defect bridge items HIGH TO LOW
        sorted_defects = sorted([{"category": k, "count": v} for k, v in f["defects"].items()], key=lambda x: x["count"], reverse=True)
        
        factory_list.append({
            "factory_id": f["factory_id"],
            "factory_name": f["factory_name"],
            "total_orders": f["total_orders"],
            "otif_pct": otif_pct,
            "failed_orders": f["failed_orders"],
            "total_penalties": round(f["total_penalties"], 2),
            "top_defect_cause": top_defect,
            "defect_bridge": sorted_defects
        })
    factory_list.sort(key=lambda x: x["total_penalties"], reverse=True)

    # Format DC list - Sorted HIGH TO LOW by total_penalties
    dc_list = []
    for dc_id, d in dcs.items():
        otif_pct = round((d["otif_orders"] / d["total_orders"]) * 100, 1) if d["total_orders"] > 0 else 100.0
        top_defect = max(d["defects"].items(), key=lambda x: x[1])[0] if d["defects"] else "None"
        
        sorted_defects = sorted([{"category": k, "count": v} for k, v in d["defects"].items()], key=lambda x: x["count"], reverse=True)
        
        dc_list.append({
            "dc_id": d["dc_id"],
            "dc_name": d["dc_name"],
            "total_orders": d["total_orders"],
            "otif_pct": otif_pct,
            "failed_orders": d["failed_orders"],
            "total_penalties": round(d["total_penalties"], 2),
            "top_defect_cause": top_defect,
            "defect_bridge": sorted_defects
        })
    dc_list.sort(key=lambda x: x["total_penalties"], reverse=True)

    # Format Lane list - Sorted HIGH TO LOW by total_penalties
    lane_list = []
    for lane_id, l in lanes.items():
        otif_pct = round((l["otif_orders"] / l["total_orders"]) * 100, 1) if l["total_orders"] > 0 else 100.0
        top_defect = max(l["defects"].items(), key=lambda x: x[1])[0] if l["defects"] else "None"
        
        sorted_defects = sorted([{"category": k, "count": v} for k, v in l["defects"].items()], key=lambda x: x["count"], reverse=True)
        
        lane_list.append({
            "lane_id": l["lane_id"],
            "origin_factory": l["origin_factory"],
            "destination_dc": l["destination_dc"],
            "transport_mode": l["transport_mode"],
            "baseline_sla_days": l["baseline_sla_days"],
            "total_orders": l["total_orders"],
            "otif_pct": otif_pct,
            "failed_orders": l["failed_orders"],
            "total_penalties": round(l["total_penalties"], 2),
            "top_defect_cause": top_defect,
            "defect_bridge": sorted_defects
        })
    lane_list.sort(key=lambda x: x["total_penalties"], reverse=True)

    return {
        "factories": factory_list,
        "dcs": dc_list,
        "lanes": lane_list
    }
