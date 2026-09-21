# OTIF Diagnostic Tool & Presentation Prototype

A full-stack diagnostic prototype built for **DIY Home Improvement Co.** to analyze, attribute, and bridge On-Time In-Full (OTIF) supply chain failures from current baseline levels (~54%) up to the 100% ideal benchmark target.

## Business Context & Motivation
DIY Home Improvement manufactures power tools (Drills, Saws, Nail Guns, Lawn-mowers, Portable Vacuums) in Asia factories (China, Vietnam) and fulfills global demand through regional distribution centers (DCs). Key customers are Retailers (Home Depot, Lowe's, Menards) and Industrial buyers (Grainger, Fastenal, Bechtel). Retailers impose financial penalties for OTIF window breaches. Standard SAP BW reports lack root-cause breakdown.

## Architecture
- **Backend**: Python 3.13 + FastAPI + Pydantic + Synthetic Data Engine
- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide Icons

## Key Modules
1. **OTIF Waterfall Bridge to 100%**: 4 core defect pillars:
   - Customer Level Rejections
   - Logistics Delays (Origin Placement & Ocean Transit)
   - DC Out of Stock (Over-attainment, Over-allocation, Inbound delays)
   - Factory Out of Stock (Component/BOM OOS, Production delays, Export delays)
2. **Multi-Timestamp SLA Analysis**: 8 timestamps tracking lead times from Asia Factory Mfg -> Dock Staging -> Ocean Transit -> DC Arrival -> Customer Window.
3. **Master Data Explorer (6 Core Masters)**:
   - Customer Master
   - Order Book Details
   - SKU Master & Bill of Materials (BOM)
   - RM Supplier Master
   - Factory-to-DC Mapping
   - DC-to-Customer SLAs
4. **Order Book Explorer**: Line item level grid with search, defect filters, and audit trail.
5. **Executive Presentation Deck**: Slide deck embedded in the app for steering committee meetings.

## Quick Start
### 1. Backend Server
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```

Access the UI at: `http://localhost:3000` (or `http://localhost:5173`).
