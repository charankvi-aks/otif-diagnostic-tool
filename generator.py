import random
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from app.models import (
    CustomerMaster, SKUMaster, BOMItem, RMSupplierMaster,
    FactoryDCMapping, DCCustomerSLA, OrderLineItem, OrderLineTimestamps
)

def build_master_data():
    # 1. Customer Master
    customers = [
        CustomerMaster(
            customer_id="CUST-101",
            customer_name="The Home Depot (US East)",
            customer_type="Retailer",
            region="US East",
            country="USA",
            priority_tier="Tier 1",
            delivery_window_sla_days=2,
            penalty_rate_per_day=450.0,
            penalty_line_reject_pct=0.15
        ),
        CustomerMaster(
            customer_id="CUST-102",
            customer_name="The Home Depot (US West)",
            customer_type="Retailer",
            region="US West",
            country="USA",
            priority_tier="Tier 1",
            delivery_window_sla_days=2,
            penalty_rate_per_day=450.0,
            penalty_line_reject_pct=0.15
        ),
        CustomerMaster(
            customer_id="CUST-103",
            customer_name="Lowe's Companies (US East)",
            customer_type="Retailer",
            region="US East",
            country="USA",
            priority_tier="Tier 1",
            delivery_window_sla_days=2,
            penalty_rate_per_day=400.0,
            penalty_line_reject_pct=0.15
        ),
        CustomerMaster(
            customer_id="CUST-104",
            customer_name="Menards Inc. (Midwest)",
            customer_type="Retailer",
            region="US Midwest",
            country="USA",
            priority_tier="Tier 2",
            delivery_window_sla_days=3,
            penalty_rate_per_day=300.0,
            penalty_line_reject_pct=0.10
        ),
        CustomerMaster(
            customer_id="CUST-105",
            customer_name="Kingfisher Group (EU)",
            customer_type="Retailer",
            region="Europe",
            country="UK",
            priority_tier="Tier 1",
            delivery_window_sla_days=3,
            penalty_rate_per_day=500.0,
            penalty_line_reject_pct=0.15
        ),
        CustomerMaster(
            customer_id="CUST-201",
            customer_name="Grainger Industrial Supply",
            customer_type="Industrial",
            region="US East",
            country="USA",
            priority_tier="Tier 2",
            delivery_window_sla_days=4,
            penalty_rate_per_day=150.0,
            penalty_line_reject_pct=0.05
        ),
        CustomerMaster(
            customer_id="CUST-202",
            customer_name="Fastenal Direct Supply",
            customer_type="Industrial",
            region="US West",
            country="USA",
            priority_tier="Tier 2",
            delivery_window_sla_days=4,
            penalty_rate_per_day=150.0,
            penalty_line_reject_pct=0.05
        ),
        CustomerMaster(
            customer_id="CUST-203",
            customer_name="Bechtel Construction Fleet",
            customer_type="Industrial",
            region="US Midwest",
            country="USA",
            priority_tier="Tier 3",
            delivery_window_sla_days=5,
            penalty_rate_per_day=100.0,
            penalty_line_reject_pct=0.05
        ),
    ]

    # 2. RM Supplier Master
    suppliers = [
        RMSupplierMaster(
            supplier_id="SUP-801",
            supplier_name="Osaka Lithium Battery Ltd",
            location="Japan",
            component_category="Li-Ion Battery Cells",
            lead_time_sla_days=21,
            on_time_delivery_rate=0.78,
            risk_level="High"
        ),
        RMSupplierMaster(
            supplier_id="SUP-802",
            supplier_name="Taiwan Precision Gear Corp",
            location="Taiwan",
            component_category="Precision Steel Gears",
            lead_time_sla_days=14,
            on_time_delivery_rate=0.92,
            risk_level="Low"
        ),
        RMSupplierMaster(
            supplier_id="SUP-803",
            supplier_name="Ningbo Electric Motor Works",
            location="China",
            component_category="Brushless Stators & Motors",
            lead_time_sla_days=18,
            on_time_delivery_rate=0.81,
            risk_level="Medium"
        ),
        RMSupplierMaster(
            supplier_id="SUP-804",
            supplier_name="Dongguan Molded Polymers",
            location="China",
            component_category="High-Impact Polymer Housings",
            lead_time_sla_days=10,
            on_time_delivery_rate=0.95,
            risk_level="Low"
        ),
        RMSupplierMaster(
            supplier_id="SUP-805",
            supplier_name="Seoul Microcontroller Co",
            location="South Korea",
            component_category="Control IC Chips",
            lead_time_sla_days=30,
            on_time_delivery_rate=0.72,
            risk_level="High"
        ),
    ]

    # 3. SKU Master with BOM (Expanded: 2-3 SKUs per Category)
    skus = [
        # CATEGORY 1: DRILLS
        SKUMaster(
            sku_id="SKU-DRL-01",
            sku_name="Pro-X 20V Cordless Hammer Drill",
            category="Drills",
            unit_cost=45.0,
            wholesale_price=99.0,
            bom=[
                BOMItem(component_id="COMP-BAT-20V", component_name="20V Li-Ion Battery Pack", quantity_required=1, unit_cost=15.0, supplier_id="SUP-801", supplier_name="Osaka Lithium Battery Ltd", is_critical=True),
                BOMItem(component_id="COMP-MTR-BL", component_name="Brushless Motor Core", quantity_required=1, unit_cost=12.0, supplier_id="SUP-803", supplier_name="Ningbo Electric Motor Works", is_critical=True),
                BOMItem(component_id="COMP-HSG-POL", component_name="Heavy Duty Housing", quantity_required=1, unit_cost=6.0, supplier_id="SUP-804", supplier_name="Dongguan Molded Polymers", is_critical=False),
                BOMItem(component_id="COMP-MCU-CTL", component_name="Smart Trigger Control Board", quantity_required=1, unit_cost=8.0, supplier_id="SUP-805", supplier_name="Seoul Microcontroller Co", is_critical=True),
            ]
        ),
        SKUMaster(
            sku_id="SKU-DRL-02",
            sku_name="UltraDrill 12V Compact Driver",
            category="Drills",
            unit_cost=30.0,
            wholesale_price=69.0,
            bom=[
                BOMItem(component_id="COMP-BAT-12V", component_name="12V Li-Ion Battery Pack", quantity_required=1, unit_cost=10.0, supplier_id="SUP-801", supplier_name="Osaka Lithium Battery Ltd", is_critical=True),
                BOMItem(component_id="COMP-MTR-BL", component_name="Compact Motor Core", quantity_required=1, unit_cost=8.0, supplier_id="SUP-803", supplier_name="Ningbo Electric Motor Works", is_critical=True),
            ]
        ),
        SKUMaster(
            sku_id="SKU-DRL-03",
            sku_name="HeavyDuty 1/2 in. Mud Mixer & Drill",
            category="Drills",
            unit_cost=72.0,
            wholesale_price=159.0,
            bom=[
                BOMItem(component_id="COMP-MTR-HVY", component_name="High Torque 15A Motor Core", quantity_required=1, unit_cost=28.0, supplier_id="SUP-803", supplier_name="Ningbo Electric Motor Works", is_critical=True),
                BOMItem(component_id="COMP-GEAR-STL", component_name="Steel Reduction Gear Train", quantity_required=1, unit_cost=18.0, supplier_id="SUP-802", supplier_name="Taiwan Precision Gear Corp", is_critical=True),
            ]
        ),

        # CATEGORY 2: SAWS
        SKUMaster(
            sku_id="SKU-SAW-02",
            sku_name="MaxCut 7-1/4 in. Circular Saw",
            category="Saws",
            unit_cost=65.0,
            wholesale_price=139.0,
            bom=[
                BOMItem(component_id="COMP-BLD-7IN", component_name="Carbide Circular Blade", quantity_required=1, unit_cost=18.0, supplier_id="SUP-802", supplier_name="Taiwan Precision Gear Corp", is_critical=True),
                BOMItem(component_id="COMP-MTR-BL", component_name="Brushless Motor Core", quantity_required=1, unit_cost=14.0, supplier_id="SUP-803", supplier_name="Ningbo Electric Motor Works", is_critical=True),
                BOMItem(component_id="COMP-HSG-POL", component_name="Alloy Shoe Guard", quantity_required=1, unit_cost=10.0, supplier_id="SUP-804", supplier_name="Dongguan Molded Polymers", is_critical=False),
            ]
        ),
        SKUMaster(
            sku_id="SKU-SAW-06",
            sku_name="ProGlide 10 in. Dual-Bevel Miter Saw",
            category="Saws",
            unit_cost=130.0,
            wholesale_price=289.0,
            bom=[
                BOMItem(component_id="COMP-BLD-10IN", component_name="10-in 80T Fine Finish Blade", quantity_required=1, unit_cost=32.0, supplier_id="SUP-802", supplier_name="Taiwan Precision Gear Corp", is_critical=True),
                BOMItem(component_id="COMP-MTR-HVY", component_name="15-Amp Direct Drive Motor", quantity_required=1, unit_cost=38.0, supplier_id="SUP-803", supplier_name="Ningbo Electric Motor Works", is_critical=True),
            ]
        ),
        SKUMaster(
            sku_id="SKU-SAW-07",
            sku_name="Reciprocating Utility Saw Pro",
            category="Saws",
            unit_cost=52.0,
            wholesale_price=119.0,
            bom=[
                BOMItem(component_id="COMP-CRK-MECH", component_name="Reciprocating Crank Mechanism", quantity_required=1, unit_cost=16.0, supplier_id="SUP-802", supplier_name="Taiwan Precision Gear Corp", is_critical=True),
                BOMItem(component_id="COMP-BAT-20V", component_name="20V Li-Ion Battery Pack", quantity_required=1, unit_cost=15.0, supplier_id="SUP-801", supplier_name="Osaka Lithium Battery Ltd", is_critical=True),
            ]
        ),

        # CATEGORY 3: NAIL GUNS
        SKUMaster(
            sku_id="SKU-NAL-03",
            sku_name="FramingPro Pneumatic 21-Degree Nailer",
            category="Nail Guns",
            unit_cost=85.0,
            wholesale_price=189.0,
            bom=[
                BOMItem(component_id="COMP-PNEU-VALV", component_name="High-Pressure Valve Assembly", quantity_required=1, unit_cost=25.0, supplier_id="SUP-802", supplier_name="Taiwan Precision Gear Corp", is_critical=True),
                BOMItem(component_id="COMP-MAG-STEEL", component_name="Aluminum Magazine Track", quantity_required=1, unit_cost=20.0, supplier_id="SUP-804", supplier_name="Dongguan Molded Polymers", is_critical=False),
            ]
        ),
        SKUMaster(
            sku_id="SKU-NAL-08",
            sku_name="FinishPro 16-Gauge Cordless Brad Nailer",
            category="Nail Guns",
            unit_cost=98.0,
            wholesale_price=219.0,
            bom=[
                BOMItem(component_id="COMP-AIR-STRIKE", component_name="AirStrike Drive Cylinder", quantity_required=1, unit_cost=30.0, supplier_id="SUP-802", supplier_name="Taiwan Precision Gear Corp", is_critical=True),
                BOMItem(component_id="COMP-BAT-20V", component_name="20V Li-Ion Battery Pack", quantity_required=1, unit_cost=15.0, supplier_id="SUP-801", supplier_name="Osaka Lithium Battery Ltd", is_critical=True),
            ]
        ),

        # CATEGORY 4: LAWN MOWERS
        SKUMaster(
            sku_id="SKU-MOW-04",
            sku_name="EcoMow 40V Self-Propelled Lawn Mower",
            category="Lawn Mowers",
            unit_cost=190.0,
            wholesale_price=399.0,
            bom=[
                BOMItem(component_id="COMP-BAT-40V", component_name="Dual 40V Battery Pack", quantity_required=2, unit_cost=40.0, supplier_id="SUP-801", supplier_name="Osaka Lithium Battery Ltd", is_critical=True),
                BOMItem(component_id="COMP-MTR-HVY", component_name="High-Torque Drive Motor", quantity_required=1, unit_cost=35.0, supplier_id="SUP-803", supplier_name="Ningbo Electric Motor Works", is_critical=True),
                BOMItem(component_id="COMP-MCU-CTL", component_name="Mower ECU Board", quantity_required=1, unit_cost=15.0, supplier_id="SUP-805", supplier_name="Seoul Microcontroller Co", is_critical=True),
            ]
        ),
        SKUMaster(
            sku_id="SKU-MOW-09",
            sku_name="TurfMaster 60V Commercial Zero-Turn Mower",
            category="Lawn Mowers",
            unit_cost=410.0,
            wholesale_price=899.0,
            bom=[
                BOMItem(component_id="COMP-BAT-60V", component_name="60V High Capacity Battery Pack", quantity_required=2, unit_cost=90.0, supplier_id="SUP-801", supplier_name="Osaka Lithium Battery Ltd", is_critical=True),
                BOMItem(component_id="COMP-MTR-DUAL", component_name="Dual Rear Wheel Motors", quantity_required=2, unit_cost=80.0, supplier_id="SUP-803", supplier_name="Ningbo Electric Motor Works", is_critical=True),
            ]
        ),
        SKUMaster(
            sku_id="SKU-MOW-10",
            sku_name="TrimLite 20V Cordless String Trimmer & Edger",
            category="Lawn Mowers",
            unit_cost=58.0,
            wholesale_price=129.0,
            bom=[
                BOMItem(component_id="COMP-BAT-20V", component_name="20V Li-Ion Battery Pack", quantity_required=1, unit_cost=15.0, supplier_id="SUP-801", supplier_name="Osaka Lithium Battery Ltd", is_critical=True),
                BOMItem(component_id="COMP-MTR-SML", component_name="High Speed Trimmer Motor", quantity_required=1, unit_cost=14.0, supplier_id="SUP-803", supplier_name="Ningbo Electric Motor Works", is_critical=True),
            ]
        ),

        # CATEGORY 5: PORTABLE VACUUMS
        SKUMaster(
            sku_id="SKU-VAC-05",
            sku_name="CleanVac Heavy Duty 12G Shop Vac",
            category="Portable Vacuums",
            unit_cost=55.0,
            wholesale_price=119.0,
            bom=[
                BOMItem(component_id="COMP-VAC-IMP", component_name="Dual Fan Blower Assembly", quantity_required=1, unit_cost=16.0, supplier_id="SUP-803", supplier_name="Ningbo Electric Motor Works", is_critical=True),
                BOMItem(component_id="COMP-HSG-POL", component_name="Polyethylene Drum 12G", quantity_required=1, unit_cost=12.0, supplier_id="SUP-804", supplier_name="Dongguan Molded Polymers", is_critical=False),
            ]
        ),
        SKUMaster(
            sku_id="SKU-VAC-11",
            sku_name="HydroVac 16G Wet/Dry Stainless Vac",
            category="Portable Vacuums",
            unit_cost=82.0,
            wholesale_price=179.0,
            bom=[
                BOMItem(component_id="COMP-VAC-IMP", component_name="Industrial Vacuum Blower Assembly", quantity_required=1, unit_cost=24.0, supplier_id="SUP-803", supplier_name="Ningbo Electric Motor Works", is_critical=True),
                BOMItem(component_id="COMP-DRUM-STL", component_name="Stainless Steel Drum 16G", quantity_required=1, unit_cost=22.0, supplier_id="SUP-804", supplier_name="Dongguan Molded Polymers", is_critical=False),
            ]
        ),
    ]

    # 4. Factory to DC Mapping
    factory_dc_mappings = [
        FactoryDCMapping(mapping_id="FDC-01", factory_id="FAC-SHENZHEN", factory_name="Shenzhen Power Plant #1", factory_location="Shenzhen, China", dc_id="DC-ATLANTA", dc_name="US East Logistics Hub", dc_location="Atlanta GA, USA", transport_mode="Ocean Freight", baseline_transit_sla_days=24),
        FactoryDCMapping(mapping_id="FDC-02", factory_id="FAC-SHENZHEN", factory_name="Shenzhen Power Plant #1", factory_location="Shenzhen, China", dc_id="DC-INLAND", dc_name="US West Logistics Hub", dc_location="Inland Empire CA, USA", transport_mode="Ocean Freight", baseline_transit_sla_days=18),
        FactoryDCMapping(mapping_id="FDC-03", factory_id="FAC-VIETNAM", factory_name="Vietnam Assembly Complex", factory_location="Binh Duong, Vietnam", dc_id="DC-ATLANTA", dc_name="US East Logistics Hub", dc_location="Atlanta GA, USA", transport_mode="Ocean Freight", baseline_transit_sla_days=26),
        FactoryDCMapping(mapping_id="FDC-04", factory_id="FAC-VIETNAM", factory_name="Vietnam Assembly Complex", factory_location="Binh Duong, Vietnam", dc_id="DC-ROTTERDAM", dc_name="EU Gateway Hub", dc_location="Rotterdam, Netherlands", transport_mode="Ocean Freight", baseline_transit_sla_days=22),
    ]

    # 5. DC to Customer SLA Mapping (Populated for BOTH Retailers and Industrial Customers)
    dc_customer_slas = [
        # RETAILER SLAS
        DCCustomerSLA(mapping_id="DCSLA-01", dc_id="DC-ATLANTA", dc_name="US East Logistics Hub", customer_id="CUST-101", customer_name="The Home Depot (US East)", customer_type="Retailer", customer_region="US East", carrier_name="FedEx Freight / Swift", target_transit_sla_hours=48, allowed_delivery_window_days=2),
        DCCustomerSLA(mapping_id="DCSLA-02", dc_id="DC-INLAND", dc_name="US West Logistics Hub", customer_id="CUST-102", customer_name="The Home Depot (US West)", customer_type="Retailer", customer_region="US West", carrier_name="JB Hunt / Old Dominion", target_transit_sla_hours=36, allowed_delivery_window_days=2),
        DCCustomerSLA(mapping_id="DCSLA-03", dc_id="DC-ATLANTA", dc_name="US East Logistics Hub", customer_id="CUST-103", customer_name="Lowe's Companies (US East)", customer_type="Retailer", customer_region="US East", carrier_name="Schneider National", target_transit_sla_hours=48, allowed_delivery_window_days=2),
        DCCustomerSLA(mapping_id="DCSLA-04", dc_id="DC-ATLANTA", dc_name="US East Logistics Hub", customer_id="CUST-104", customer_name="Menards Inc. (Midwest)", customer_type="Retailer", customer_region="US Midwest", carrier_name="XPO Logistics", target_transit_sla_hours=72, allowed_delivery_window_days=3),
        DCCustomerSLA(mapping_id="DCSLA-05", dc_id="DC-ROTTERDAM", dc_name="EU Gateway Hub", customer_id="CUST-105", customer_name="Kingfisher Group (EU)", customer_type="Retailer", customer_region="Europe", carrier_name="DHL Freight Europe", target_transit_sla_hours=48, allowed_delivery_window_days=3),

        # INDUSTRIAL CUSTOMER SLAS (Fully Populated)
        DCCustomerSLA(mapping_id="DCSLA-06", dc_id="DC-ATLANTA", dc_name="US East Logistics Hub", customer_id="CUST-201", customer_name="Grainger Industrial Supply", customer_type="Industrial", customer_region="US East", carrier_name="UPS Supply Chain Solutions", target_transit_sla_hours=96, allowed_delivery_window_days=4),
        DCCustomerSLA(mapping_id="DCSLA-07", dc_id="DC-INLAND", dc_name="US West Logistics Hub", customer_id="CUST-202", customer_name="Fastenal Direct Supply", customer_type="Industrial", customer_region="US West", carrier_name="Estes Express Industrial", target_transit_sla_hours=96, allowed_delivery_window_days=4),
        DCCustomerSLA(mapping_id="DCSLA-08", dc_id="DC-ATLANTA", dc_name="US East Logistics Hub", customer_id="CUST-203", customer_name="Bechtel Construction Fleet", customer_type="Industrial", customer_region="US Midwest", carrier_name="R+L Carriers Dedicated", target_transit_sla_hours=120, allowed_delivery_window_days=5),
    ]

    return customers, skus, suppliers, factory_dc_mappings, dc_customer_slas


def generate_order_book(count=450) -> List[OrderLineItem]:
    customers, skus, suppliers, factory_dc_mappings, dc_customer_slas = build_master_data()
    random.seed(42)
    
    order_items: List[OrderLineItem] = []
    base_date = datetime(2026, 6, 1)

    defect_scenarios = [
        ("OTIF Compliant", "Delivered On-Time & In-Full", 55, "Order fulfilled smoothly within SLA."),
        ("Customer Rejection", "Damage / Dock Refusal", 4, "Damaged pallets upon unloading at retailer dock."),
        ("Customer Rejection", "Paperwork & Barcode Mismatch", 3, "ASN barcode scan failure triggered dock rejection."),
        ("Logistics Delay", "Origin Vehicle Placement Delay", 5, "Trucking carrier failed to place container chassis on schedule at Asia port."),
        ("Logistics Delay", "In-Transit Ocean Congestion", 8, "Ocean vessel port blank sailing and customs hold at port of entry."),
        ("Logistics Delay", "Origin Loading Staging Backlog", 3, "Asia export warehouse staging delay prior to vessel loading."),
        ("DC Out of Stock", "Demand Over-Attainment Spike", 5, "Retailer promotional surge exceeded monthly consensus forecast by 180%."),
        ("DC Out of Stock", "Priority Account Over-Allocation", 4, "Inventory re-allocated to higher-tier account order."),
        ("DC Out of Stock", "Inbound Transit Delay vs Est Date", 4, "DC safety stock depleted while awaiting delayed ocean container."),
        ("Factory Out of Stock", "Component / RM Supplier OOS", 5, "Li-Ion battery pack supply shortage from supplier (Osaka Lithium)."),
        ("Factory Out of Stock", "Production Run Delay", 3, "Molding machine downtime & rotor calibration delay at Shenzhen plant."),
        ("Factory Out of Stock", "Factory Staging & Export Delay", 2, "Factory finished-goods staging delay prior to export clearance."),
    ]

    scenario_pool = []
    for cat, sub, wt, desc in defect_scenarios:
        scenario_pool.extend([(cat, sub, desc)] * wt)

    for i in range(1, count + 1):
        cust = random.choice(customers)
        sku = random.choice(skus)
        
        if cust.region == "US East":
            dc_id = "DC-ATLANTA"
        elif cust.region == "US West":
            dc_id = "DC-INLAND"
        elif cust.region == "US Midwest":
            dc_id = "DC-ATLANTA"
        else:
            dc_id = "DC-ROTTERDAM"

        factory_id = "FAC-SHENZHEN" if random.random() < 0.65 else "FAC-VIETNAM"

        ordered_qty = random.randint(20, 250) * 5
        unit_price = sku.wholesale_price
        total_line_invoice = round(ordered_qty * unit_price, 2)
        
        scenario_cat, scenario_sub, scenario_desc = random.choice(scenario_pool)
        is_otif = (scenario_cat == "OTIF Compliant")
        
        if is_otif:
            is_on_time = True
            is_in_full = True
            delivered_qty = ordered_qty
            penalty = 0.0
            primary_defect = None
            defect_sub = None
            defect_desc = None
        else:
            primary_defect = scenario_cat
            defect_sub = scenario_sub
            defect_desc = scenario_desc
            
            if "In-Full" in scenario_sub or "Over-Attainment" in scenario_sub or "Component" in scenario_sub:
                is_in_full = False
                delivered_qty = int(ordered_qty * random.uniform(0.5, 0.85))
            else:
                is_in_full = True
                delivered_qty = ordered_qty
                
            is_on_time = False if ("Delay" in scenario_sub or "Rejection" in scenario_sub or "In-Transit" in scenario_sub or "Placement" in scenario_sub or "Production" in scenario_sub or "Export" in scenario_sub or "Transit" in scenario_sub) else True

            delay_days = random.randint(2, 6) if not is_on_time else 0
            daily_penalty = cust.penalty_rate_per_day * delay_days
            rejection_penalty = (total_line_invoice * cust.penalty_line_reject_pct) if scenario_cat == "Customer Rejection" else 0.0
            
            penalty = daily_penalty + rejection_penalty

        order_date = base_date + timedelta(days=random.randint(0, 80))
        mfg_plan = order_date + timedelta(days=3)
        mfg_delay = 4 if scenario_cat == "Factory Out of Stock" else 0
        mfg_act = mfg_plan + timedelta(days=mfg_delay)

        dispatch_plan = mfg_act + timedelta(days=2)
        dispatch_delay = 2 if scenario_sub == "Factory Staging & Export Delay" else 0
        dispatch_act = dispatch_plan + timedelta(days=dispatch_delay)

        origin_plan = dispatch_act + timedelta(days=2)
        origin_delay = 3 if "Origin" in scenario_sub else 0
        origin_act = origin_plan + timedelta(days=origin_delay)

        transit_days = 22 if factory_id == "FAC-SHENZHEN" else 25
        dc_arr_plan = origin_act + timedelta(days=transit_days)
        transit_delay = 5 if "In-Transit" in scenario_sub or "Transit Delay" in scenario_sub else 0
        dc_arr_act = dc_arr_plan + timedelta(days=transit_delay)

        dc_disp_plan = dc_arr_act + timedelta(days=2)
        dc_disp_delay = 2 if "Over-Allocation" in scenario_sub or "Demand" in scenario_sub else 0
        dc_disp_act = dc_disp_plan + timedelta(days=dc_disp_delay)

        promised_start = order_date + timedelta(days=34)
        promised_end = promised_start + timedelta(days=cust.delivery_window_sla_days)

        if is_otif:
            actual_del = promised_start + timedelta(days=1)
        else:
            cust_delay = random.randint(3, 8)
            actual_del = promised_end + timedelta(days=cust_delay)

        timestamps = OrderLineTimestamps(
            order_created_at=order_date.strftime("%Y-%m-%d"),
            factory_mfg_planned_at=mfg_plan.strftime("%Y-%m-%d"),
            factory_mfg_actual_at=mfg_act.strftime("%Y-%m-%d"),
            factory_dispatch_planned_at=dispatch_plan.strftime("%Y-%m-%d"),
            factory_dispatch_actual_at=dispatch_act.strftime("%Y-%m-%d"),
            origin_departure_planned_at=origin_plan.strftime("%Y-%m-%d"),
            origin_departure_actual_at=origin_act.strftime("%Y-%m-%d"),
            dc_arrival_planned_at=dc_arr_plan.strftime("%Y-%m-%d"),
            dc_arrival_actual_at=dc_arr_act.strftime("%Y-%m-%d"),
            dc_dispatch_planned_at=dc_disp_plan.strftime("%Y-%m-%d"),
            dc_dispatch_actual_at=dc_disp_act.strftime("%Y-%m-%d"),
            promised_delivery_start=promised_start.strftime("%Y-%m-%d"),
            promised_delivery_end=promised_end.strftime("%Y-%m-%d"),
            actual_delivery_at=actual_del.strftime("%Y-%m-%d"),
        )

        item = OrderLineItem(
            order_id=f"ORD-{2000 + (i // 2)}",
            line_id=f"LINE-{10000 + i}",
            customer_id=cust.customer_id,
            customer_name=cust.customer_name,
            customer_type=cust.customer_type,
            sku_id=sku.sku_id,
            sku_name=sku.sku_name,
            category=sku.category,
            factory_id=factory_id,
            dc_id=dc_id,
            ordered_qty=ordered_qty,
            delivered_qty=delivered_qty,
            unit_price=unit_price,
            total_invoice_value=total_line_invoice,
            timestamps=timestamps,
            is_on_time=is_on_time,
            is_in_full=is_in_full,
            is_otif=is_otif,
            primary_defect_category=primary_defect,
            defect_sub_element=defect_sub,
            defect_description=defect_desc,
            penalty_amount=round(penalty, 2)
        )
        order_items.append(item)

    return order_items
