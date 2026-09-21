import os
from fastapi import FastAPI, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional, List, Dict, Any

from app.generator import build_master_data, generate_order_book
from app.otif_engine import calculate_otif_metrics, filter_orders_by_date, calculate_granular_node_analytics
from app.carrier_optimizer import audit_current_carrier_performance, optimize_carrier_assignment
from app.order_assignment_engine import get_portfolio_profitability_summary, optimize_order_assignment, get_order_backlog
from app.models import (
    OrderLineItem, CarrierOptimizationRequest, CarrierOptimizationResponse,
    OrderAssignmentOptimizationRequest, OrderAssignmentOptimizationResponse
)

app = FastAPI(
    title="DIY Home Improvement - OTIF Diagnostic Tool API",
    description="Backend API for OTIF Bridge Diagnostics, Multi-Timestamp SLAs, Master Data Management, Retailer Penalty Analytics & Carrier Assignment Optimizer",
    version="1.3.0"
)

# Enable CORS for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory datasets initialized at startup
CUSTOMERS, SKUS, SUPPLIERS, FACTORY_DC_MAP, DC_CUST_SLAS = build_master_data()
ORDER_BOOK: List[OrderLineItem] = generate_order_book(count=800)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "OTIF Diagnostic Tool Backend v1.3 with Carrier Optimizer"}


@app.get("/api/otif/summary")
def get_otif_summary(
    customer_type: Optional[str] = Query(None, description="Retailer or Industrial"),
    category: Optional[str] = Query(None, description="Drills, Saws, Nail Guns, Lawn Mowers, Portable Vacuums"),
    customer_id: Optional[str] = Query(None, description="Filter by Customer ID"),
    date_from: Optional[str] = Query(None, description="YYYY-MM-DD start date"),
    date_to: Optional[str] = Query(None, description="YYYY-MM-DD end date")
):
    filtered_orders = ORDER_BOOK

    if customer_type and customer_type != "All":
        filtered_orders = [o for o in filtered_orders if o.customer_type.lower() == customer_type.lower()]

    if category and category != "All":
        filtered_orders = [o for o in filtered_orders if o.category.lower() == category.lower()]

    if customer_id and customer_id != "All":
        filtered_orders = [o for o in filtered_orders if o.customer_id == customer_id]

    filtered_orders = filter_orders_by_date(filtered_orders, date_from=date_from, date_to=date_to)

    metrics = calculate_otif_metrics(filtered_orders)
    return metrics


@app.get("/api/otif/node-breakdown")
def get_node_breakdown(
    customer_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None)
):
    filtered_orders = ORDER_BOOK

    if customer_type and customer_type != "All":
        filtered_orders = [o for o in filtered_orders if o.customer_type.lower() == customer_type.lower()]

    if category and category != "All":
        filtered_orders = [o for o in filtered_orders if o.category.lower() == category.lower()]

    filtered_orders = filter_orders_by_date(filtered_orders, date_from=date_from, date_to=date_to)

    node_analytics = calculate_granular_node_analytics(filtered_orders)
    return node_analytics


@app.get("/api/carrier/audit")
def get_carrier_audit():
    """Audit current carrier SLA performance & penalty impact across accounts."""
    return audit_current_carrier_performance(ORDER_BOOK)


@app.post("/api/carrier/optimize", response_model=CarrierOptimizationResponse)
def post_carrier_optimize(req: CarrierOptimizationRequest = Body(...)):
    """Optimize carrier assignment for future shipments balancing freight cost vs penalty risk."""
    return optimize_carrier_assignment(req)


@app.get("/api/assignment/portfolio")
def get_assignment_portfolio(
    customer_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None)
):
    """Retrieve macro portfolio profitability summary and potential profit lift."""
    filtered_orders = ORDER_BOOK

    if customer_type and customer_type != "All":
        filtered_orders = [o for o in filtered_orders if o.customer_type.lower() == customer_type.lower()]

    if category and category != "All":
        filtered_orders = [o for o in filtered_orders if o.category.lower() == category.lower()]

    filtered_orders = filter_orders_by_date(filtered_orders, date_from=date_from, date_to=date_to)

    return get_portfolio_profitability_summary(filtered_orders)


@app.post("/api/assignment/optimize", response_model=OrderAssignmentOptimizationResponse)
def post_assignment_optimize(req: OrderAssignmentOptimizationRequest = Body(...)):
    """Simulate and optimize order assignment combining stock availability, SLAs, costs, and penalties to maximize DIY net profit ($ & %)."""
    return optimize_order_assignment(req)


@app.get("/api/assignment/backlog")
def get_assignment_backlog():
    """Retrieve pending and scheduled future order backlog for auto-populating order allocation optimizer."""
    return get_order_backlog()


@app.get("/api/orders")
def get_order_book(
    customer_type: Optional[str] = None,
    category: Optional[str] = None,
    sku_id: Optional[str] = None,
    defect_category: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    results = ORDER_BOOK

    if customer_type and customer_type != "All":
        results = [o for o in results if o.customer_type.lower() == customer_type.lower()]

    if category and category != "All":
        results = [o for o in results if o.category.lower() == category.lower()]

    if sku_id and sku_id != "All":
        results = [o for o in results if o.sku_id.lower() == sku_id.lower()]

    if defect_category and defect_category != "All":
        if defect_category == "OTIF Compliant":
            results = [o for o in results if o.is_otif]
        else:
            results = [o for o in results if o.primary_defect_category == defect_category]

    results = filter_orders_by_date(results, date_from=date_from, date_to=date_to)

    if search:
        s = search.lower()
        results = [
            o for o in results
            if (
                s in o.order_id.lower()
                or s in o.line_id.lower()
                or s in o.sku_id.lower()
                or s in o.customer_name.lower()
                or s in o.sku_name.lower()
                or s in o.category.lower()
            )
        ]

    # ALWAYS SORT HIGH TO LOW by penalty_amount, then total_invoice_value
    results.sort(key=lambda x: (x.penalty_amount, x.total_invoice_value), reverse=True)

    total_count = len(results)
    paged_results = results[offset : offset + limit]

    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "items": paged_results
    }


@app.get("/api/masters/all")
def get_all_masters():
    sorted_customers = sorted(CUSTOMERS, key=lambda c: c.penalty_rate_per_day, reverse=True)
    sorted_skus = sorted(SKUS, key=lambda s: s.wholesale_price, reverse=True)
    sorted_suppliers = sorted(SUPPLIERS, key=lambda s: s.lead_time_sla_days, reverse=True)

    return {
        "customer_master": sorted_customers,
        "sku_master": sorted_skus,
        "supplier_master": sorted_suppliers,
        "factory_dc_mapping": FACTORY_DC_MAP,
        "dc_customer_sla": DC_CUST_SLAS
    }


@app.get("/api/download/walkthrough")
def download_walkthrough_docx():
    file_path = os.path.join(os.path.dirname(__file__), "downloads/walkthrough.docx")
    if os.path.exists(file_path):
        return FileResponse(
            file_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename="DIY_Co_OTIF_Walkthrough.docx"
        )
    return {"error": "File not found"}


@app.get("/api/download/deck")
def download_executive_deck_pptx():
    file_path = os.path.join(os.path.dirname(__file__), "downloads/executive_summary_deck.pptx")
    if os.path.exists(file_path):
        return FileResponse(
            file_path,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            filename="DIY_Co_Executive_Summary_Deck.pptx"
        )
    return {"error": "File not found"}



# Mount frontend dist static files if built
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        if full_path.startswith("api"):
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))


if __name__ == "__main__":
    import uvicorn
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host=host, port=port, reload=False)

