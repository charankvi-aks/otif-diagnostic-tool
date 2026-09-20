import os
from docx import Document
from docx.shared import Inches as DocxInches, Pt as DocxPt, RGBColor as DocxRGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

from pptx import Presentation
from pptx.util import Inches as PptxInches, Pt as PptxPt
from pptx.dml.color import RGBColor as PptxRGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def create_word_walkthrough(output_path):
    doc = Document()

    # Set page margins
    sections = doc.sections
    for section in sections:
        section.top_margin = DocxInches(0.8)
        section.bottom_margin = DocxInches(0.8)
        section.left_margin = DocxInches(0.8)
        section.right_margin = DocxInches(0.8)

    # Styles
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Calibri'
    font.size = DocxPt(11)
    font.color.rgb = DocxRGBColor(0x1E, 0x29, 0x3B) # slate-800

    # Title Banner
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run_title = p_title.add_run("DIY Co. OTIF Diagnostic & Order Assignment Optimization")
    run_title.font.size = DocxPt(24)
    run_title.font.bold = True
    run_title.font.color.rgb = DocxRGBColor(0x0F, 0x17, 0x2A) # slate-900

    p_sub = doc.add_paragraph()
    run_sub = p_sub.add_run("Technical & Operational Walkthrough | Executive Diagnostic Report")
    run_sub.font.size = DocxPt(14)
    run_sub.font.italic = True
    run_sub.font.color.rgb = DocxRGBColor(0x02, 0x84, 0xC7) # sky-600

    doc.add_paragraph() # Spacer

    # Section 1: Executive Summary
    h1 = doc.add_heading("1. Executive Summary & Diagnostic Scope", level=1)
    h1.runs[0].font.color.rgb = DocxRGBColor(0x0F, 0x17, 0x2A)
    
    p = doc.add_paragraph()
    p.add_run("DIY Co. experienced significant drops in On-Time In-Full (OTIF) fulfillment rates across major retail and industrial distribution channels. In response, this full-stack diagnostic application and optimization suite was developed to pinpoint operational friction points, quantify financial penalty exposure, and automate order and carrier allocation for maximum net margin realization.")

    # Key Highlights Table
    table = doc.add_table(rows=5, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    headers = ["Metric / Scope Focus", "Diagnostic Result / Business Impact"]
    for i, h_text in enumerate(headers):
        cell = table.cell(0, i)
        set_cell_background(cell, "0F172A")
        p = cell.paragraphs[0]
        r = p.add_run(h_text)
        r.font.bold = True
        r.font.color.rgb = DocxRGBColor(0xFF, 0xFF, 0xFF)

    data = [
        ("Current Synthetic Order Book Scope", "800 Line Items across 13 SKUs and 5 Product Categories"),
        ("Baseline OTIF Fulfillment Rate", "48.2% Compliant across Tier-1 Retailers & Industrial Clients"),
        ("Quantified Penalty Exposure", "$634,632 Total Loss (Customer Rejections + Carrier SLA Fines)"),
        ("Potential Net Operating Profit Lift", "+$1,040,117.82 (+4.2% Net Margin Expansion)")
    ]

    for row_idx, (m_val, r_val) in enumerate(data, start=1):
        c0 = table.cell(row_idx, 0)
        c1 = table.cell(row_idx, 1)
        if row_idx % 2 == 1:
            set_cell_background(c0, "F8FAFC")
            set_cell_background(c1, "F8FAFC")
        else:
            set_cell_background(c0, "FFFFFF")
            set_cell_background(c1, "FFFFFF")
        c0.paragraphs[0].add_run(m_val).font.bold = True
        c1.paragraphs[0].add_run(r_val)

    doc.add_paragraph() # Spacer

    # Section 2: Core System Modules
    h2 = doc.add_heading("2. Core System Architecture & Modules", level=1)
    h2.runs[0].font.color.rgb = DocxRGBColor(0x0F, 0x17, 0x2A)

    modules = [
        ("Executive OTIF Summary & Waterfall Bridge", "Provides high-level OTIF metrics, OTIF bridge waterfall analysis, and financial loss breakdown by primary defect category (Customer Rejection, Logistics Delay, DC Out of Stock, Factory Out of Stock)."),
        ("Multi-Timestamp SLA Audit Trail", "Tracks granular timestamps across 6 operational milestones: Order Created -> Factory Planned/Actual -> Factory Dispatch -> Ocean Departure -> DC Arrival/Dispatch -> Final Delivery Window SLA."),
        ("Carrier Assignment & Penalty Risk Optimizer", "Audits carrier SLA performance across FedEx, JB Hunt, Schneider, XPO, DHL, and UPS. Simulates carrier assignment balancing freight rates vs penalty risks."),
        ("Order Assignment & Profit Optimizer", "Dynamic profit optimization engine supporting flexible SKU selection, SLA auto-population, backlog order loading, and DIY Co. guardrail policy caps (+50% max allocation limit)."),
        ("Order Book Explorer with Execution Log", "Searchable, filterable order book displaying SKU-level data with line item timestamps formatted in a single green timeline view with red font highlighting plan vs actual deviations."),
        ("Master Data Explorer", "Comprehensive dataset explorer for Customers, SKUs (with Bill of Materials linkages), Suppliers, and DC-to-Customer SLA mappings.")
    ]

    for title, desc in modules:
        p = doc.add_paragraph()
        r1 = p.add_run(f"• {title}: ")
        r1.font.bold = True
        r1.font.color.rgb = DocxRGBColor(0x02, 0x84, 0xC7)
        p.add_run(desc)

    doc.add_paragraph() # Spacer

    # Section 3: SKU Catalog & Order Expansion
    h3 = doc.add_heading("3. Expanded 13-SKU Catalog & 800 Order Book", level=1)
    h3.runs[0].font.color.rgb = DocxRGBColor(0x0F, 0x17, 0x2A)

    p = doc.add_paragraph()
    p.add_run("To ensure real-world complexity, the SKU master catalog was expanded from a single item per category to 13 SKUs across 5 core DIY product categories:")

    sku_table = doc.add_table(rows=14, cols=4)
    sku_table.alignment = WD_TABLE_ALIGNMENT.CENTER

    headers = ["SKU ID", "Product Name", "Category", "Wholesale Price / Cost"]
    for i, h_text in enumerate(headers):
        cell = sku_table.cell(0, i)
        set_cell_background(cell, "0F172A")
        p = cell.paragraphs[0]
        r = p.add_run(h_text)
        r.font.bold = True
        r.font.color.rgb = DocxRGBColor(0xFF, 0xFF, 0xFF)

    skus_data = [
        ("SKU-DRL-01", "Pro-X 20V Cordless Hammer Drill", "Drills", "$99.00 / $45.00"),
        ("SKU-DRL-02", "UltraDrill 12V Compact Driver", "Drills", "$69.00 / $30.00"),
        ("SKU-DRL-03", "HeavyDuty 1/2 in. Mud Mixer & Drill", "Drills", "$159.00 / $72.00"),
        ("SKU-SAW-02", "MaxCut 7-1/4 in. Circular Saw", "Saws", "$139.00 / $65.00"),
        ("SKU-SAW-06", "ProGlide 10 in. Dual-Bevel Miter Saw", "Saws", "$289.00 / $130.00"),
        ("SKU-SAW-07", "Reciprocating Utility Saw Pro", "Saws", "$119.00 / $52.00"),
        ("SKU-NAL-03", "FramingPro Pneumatic 21-Degree Nailer", "Nail Guns", "$189.00 / $85.00"),
        ("SKU-NAL-08", "FinishPro 16-Gauge Cordless Brad Nailer", "Nail Guns", "$219.00 / $98.00"),
        ("SKU-MOW-04", "EcoMow 40V Self-Propelled Lawn Mower", "Lawn Mowers", "$399.00 / $190.00"),
        ("SKU-MOW-09", "TurfMaster 60V Commercial Zero-Turn Mower", "Lawn Mowers", "$899.00 / $410.00"),
        ("SKU-MOW-10", "TrimLite 20V Cordless String Trimmer & Edger", "Lawn Mowers", "$129.00 / $58.00"),
        ("SKU-VAC-05", "CleanVac Heavy Duty 12G Shop Vac", "Portable Vacuums", "$119.00 / $55.00"),
        ("SKU-VAC-11", "HydroVac 16G Wet/Dry Stainless Vac", "Portable Vacuums", "$179.00 / $82.00"),
    ]

    for r_idx, (s_id, s_name, s_cat, s_price) in enumerate(skus_data, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate([s_id, s_name, s_cat, s_price]):
            cell = sku_table.cell(r_idx, c_idx)
            set_cell_background(cell, bg)
            cell.paragraphs[0].add_run(val)

    doc.add_paragraph() # Spacer

    # Section 4: Recommendations & Implementation Roadmap
    h4 = doc.add_heading("4. Financial Impact & Strategic Recommendations", level=1)
    h4.runs[0].font.color.rgb = DocxRGBColor(0x0F, 0x17, 0x2A)

    p = doc.add_paragraph()
    p.add_run("By implementing the Order Assignment & Profit Optimization Engine, DIY Co. achieves the following financial results:\n")
    p.add_run("• Net Revenue Base: $55,984,370.00\n")
    p.add_run("• Current Net Profit: $24,491,388.08 (43.7% Margin)\n")
    p.add_run("• Optimized Net Profit: $25,531,505.90 (45.6% Margin)\n")
    p.add_run("• Net Profit Lift: +$1,040,117.82 (+4.2% Margin Expansion)\n\n")

    p_recs = doc.add_paragraph()
    p_recs.add_run("Key Strategic Recommendations:\n").font.bold = True
    p_recs.add_run("1. Automated Carrier Routing: Route high-risk retail orders via expedited dedicated freight carriers (FedEx, JB Hunt) to eradicate 82% of late delivery chargebacks.\n")
    p_recs.add_run("2. Origin ASN & Barcode Verification: Mandate barcode validation at Shenzhen & Vietnam assembly plants to eliminate 42% of customer dock rejection penalties.\n")
    p_recs.add_run("3. Dynamic Backlog Allocation: Utilize the Order Assignment Engine to automatically pair backlog orders with optimal DC inventory availability within DIY Co. policy caps.")

    doc.save(output_path)
    print(f"Saved Word document to {output_path}")


def create_pptx_executive_deck(output_path):
    prs = Presentation()
    prs.slide_width = PptxInches(13.333) # 16:9 widescreen
    prs.slide_height = PptxInches(7.5)

    blank_layout = prs.slide_layouts[6]

    # Theme colors
    NAVY = PptxRGBColor(0x0F, 0x17, 0x2A)
    SLATE = PptxRGBColor(0x1E, 0x29, 0x3B)
    CYAN = PptxRGBColor(0x02, 0x84, 0xC7)
    WHITE = PptxRGBColor(0xFF, 0xFF, 0xFF)
    LIGHT_BG = PptxRGBColor(0xF8, 0xFA, 0xFC)
    GRAY_TEXT = PptxRGBColor(0x64, 0x74, 0x8B)
    GREEN = PptxRGBColor(0x16, 0xA3, 0x4A)
    RED = PptxRGBColor(0xDC, 0x26, 0x26)

    def add_header(slide, title_text, category_text="EXECUTIVE SUMMARY DECK"):
        # Header bar background
        shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, PptxInches(0), PptxInches(0), PptxInches(13.333), PptxInches(1.1))
        shape.fill.solid()
        shape.fill.fore_color.rgb = NAVY
        shape.line.color.rgb = NAVY

        txBox = slide.shapes.add_textbox(PptxInches(0.8), PptxInches(0.15), PptxInches(11), PptxInches(0.8))
        tf = txBox.text_frame
        tf.word_wrap = True
        
        p_cat = tf.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = PptxPt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = CYAN

        p_title = tf.add_paragraph()
        p_title.text = title_text
        p_title.font.size = PptxPt(20)
        p_title.font.bold = True
        p_title.font.color.rgb = WHITE

    # SLIDE 1: Title Slide
    slide1 = prs.slides.add_slide(blank_layout)
    bg1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, PptxInches(0), PptxInches(0), PptxInches(13.333), PptxInches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = NAVY
    bg1.line.color.rgb = NAVY

    tb1 = slide1.shapes.add_textbox(PptxInches(1.0), PptxInches(2.2), PptxInches(11.333), PptxInches(3.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "DIY CO. OTIF DIAGNOSTIC & PROFIT OPTIMIZATION"
    p.font.size = PptxPt(14)
    p.font.bold = True
    p.font.color.rgb = CYAN

    p2 = tf1.add_paragraph()
    p2.text = "Executive Summary & Operational Action Plan"
    p2.font.size = PptxPt(36)
    p2.font.bold = True
    p2.font.color.rgb = WHITE

    p3 = tf1.add_paragraph()
    p3.text = "End-to-End Diagnostic Suite • Multi-Timestamp SLA Audit • Order Assignment Profit Optimizer • 13 SKU Catalog"
    p3.font.size = PptxPt(14)
    p3.font.color.rgb = PptxRGBColor(0x94, 0xA3, 0xB8)

    # SLIDE 2: Business Challenge & Diagnostic Scope
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "1. Executive Summary & Diagnostic Scope")

    # Left box: Context
    box_l = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, PptxInches(0.8), PptxInches(1.5), PptxInches(5.6), PptxInches(5.3))
    box_l.fill.solid()
    box_l.fill.fore_color.rgb = LIGHT_BG
    box_l.line.color.rgb = PptxRGBColor(0xE2, 0xE8, 0xF0)

    tf_l = box_l.text_frame
    tf_l.word_wrap = True
    tf_l.margin_left = PptxInches(0.3)
    tf_l.margin_top = PptxInches(0.3)

    p = tf_l.paragraphs[0]
    p.text = "Business Challenge & Context"
    p.font.size = PptxPt(18)
    p.font.bold = True
    p.font.color.rgb = NAVY

    bullet_points = [
        "Fulfillment OTIF rate dropped to 48.2% across core retail accounts.",
        "Retailer chargebacks & carrier penalties exceeded $634K annually.",
        "Major accounts impacted: The Home Depot, Lowe's, Menards, Kingfisher, Grainger, Fastenal, Bechtel.",
        "Diagnostic objective: Identify root-cause bottlenecks and quantify net margin recovery potential."
    ]
    for bp in bullet_points:
        p = tf_l.add_paragraph()
        p.text = f"• {bp}"
        p.font.size = PptxPt(13)
        p.font.color.rgb = SLATE

    # Right box: Scope
    box_r = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, PptxInches(6.8), PptxInches(1.5), PptxInches(5.7), PptxInches(5.3))
    box_r.fill.solid()
    box_r.fill.fore_color.rgb = LIGHT_BG
    box_r.line.color.rgb = PptxRGBColor(0xE2, 0xE8, 0xF0)

    tf_r = box_r.text_frame
    tf_r.word_wrap = True
    tf_r.margin_left = PptxInches(0.3)
    tf_r.margin_top = PptxInches(0.3)

    p = tf_r.paragraphs[0]
    p.text = "Diagnostic Tooling & Capabilities"
    p.font.size = PptxPt(18)
    p.font.bold = True
    p.font.color.rgb = NAVY

    scope_points = [
        "Executive OTIF Summary & Waterfall Bridge Analysis",
        "Multi-Timestamp Node SLA Audit Trail (6 Milestones)",
        "Carrier Assignment & Penalty Risk Optimizer",
        "Order Assignment & Net Margin Engine (Backlog + Guardrails)",
        "Timeline Execution Log in Order Book Explorer",
        "Scaled Dataset: 800 Order Lines across 13 SKUs & 5 Categories"
    ]
    for sp in scope_points:
        p = tf_r.add_paragraph()
        p.text = f"✔  {sp}"
        p.font.size = PptxPt(13)
        p.font.color.rgb = CYAN

    # SLIDE 3: Diagnostic Findings & OTIF Bridge
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "2. OTIF Waterfall Diagnostics & Root-Cause Failure Drivers")

    # 4 Key Defect Stat Cards
    cards = [
        ("42.1%", "Customer Dock Rejection", "Damage & Barcode/ASN Mismatch", RED),
        ("34.8%", "Logistics SLA Delay", "Carrier Transit Window Failures", RED),
        ("14.6%", "DC Inventory Stockout", "Safety Stock Allocation Deficits", CYAN),
        ("8.5%", "Factory Lead Time Overrun", "Tier-1 Component Lead Delays", NAVY)
    ]

    for idx, (stat, title, sub, color) in enumerate(cards):
        left_pos = PptxInches(0.8 + idx * 2.95)
        card = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_pos, PptxInches(1.5), PptxInches(2.8), PptxInches(2.2))
        card.fill.solid()
        card.fill.fore_color.rgb = LIGHT_BG
        card.line.color.rgb = PptxRGBColor(0xCB, 0xD5, 0xE1)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_top = PptxInches(0.2)
        tf.margin_left = PptxInches(0.2)

        p = tf.paragraphs[0]
        p.text = stat
        p.font.size = PptxPt(32)
        p.font.bold = True
        p.font.color.rgb = color

        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.size = PptxPt(13)
        p2.font.bold = True
        p2.font.color.rgb = NAVY

        p3 = tf.add_paragraph()
        p3.text = sub
        p3.font.size = PptxPt(11)
        p3.font.color.rgb = GRAY_TEXT

    # Lower Table: Customer Penalty Exposure
    box_tbl = slide3.shapes.add_shape(MSO_SHAPE.RECTANGLE, PptxInches(0.8), PptxInches(4.0), PptxInches(11.7), PptxInches(2.8))
    box_tbl.fill.solid()
    box_tbl.fill.fore_color.rgb = WHITE
    box_tbl.line.color.rgb = PptxRGBColor(0xE2, 0xE8, 0xF0)

    tf_t = box_tbl.text_frame
    tf_t.word_wrap = True
    tf_t.margin_left = PptxInches(0.3)
    tf_t.margin_top = PptxInches(0.2)

    p = tf_t.paragraphs[0]
    p.text = "Major Customer Penalty Exposure Summary"
    p.font.size = PptxPt(16)
    p.font.bold = True
    p.font.color.rgb = NAVY

    tbl_text = [
        "• The Home Depot (US East / West): $245,200 penalty loss • 2-day delivery SLA window • High penalty rate ($450/day + 15% reject fine)",
        "• Lowe's Companies (US East): $182,400 penalty loss • 2-day delivery SLA window • Barcode mismatch on dock arrival",
        "• Kingfisher Group (EU): $112,850 penalty loss • 3-day EU gateway SLA window • Transit damage on ocean containers",
        "• Industrial Accounts (Grainger, Fastenal, Bechtel): $94,182 penalty loss • 4-5 day SLA window • Carrier route delays"
    ]
    for tt in tbl_text:
        p = tf_t.add_paragraph()
        p.text = tt
        p.font.size = PptxPt(12)
        p.font.color.rgb = SLATE

    # SLIDE 4: Order Assignment & Profit Engine
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "3. Order Assignment & Net Profit Margin Engine")

    # Left: Features
    box_opt = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, PptxInches(0.8), PptxInches(1.5), PptxInches(5.6), PptxInches(5.3))
    box_opt.fill.solid()
    box_opt.fill.fore_color.rgb = LIGHT_BG
    box_opt.line.color.rgb = PptxRGBColor(0xCB, 0xD5, 0xE1)

    tf_o = box_opt.text_frame
    tf_o.word_wrap = True
    tf_o.margin_left = PptxInches(0.3)
    tf_o.margin_top = PptxInches(0.3)

    p = tf_o.paragraphs[0]
    p.text = "Optimization Rules & Guardrails"
    p.font.size = PptxPt(18)
    p.font.bold = True
    p.font.color.rgb = NAVY

    opt_rules = [
        "Flexible SKU Line Items: Choose any SKU from the order catalog.",
        "SLA Auto-Population: Customer SLA delivery date auto-populates upon customer selection.",
        "Future Order Backlog Integration: Pre-loads future backlog orders into optimizer.",
        "Fulfillment Policy Caps: Enforces max +50% allocation guardrails beyond order requirements.",
        "Path Evaluation: Evaluates Shenzhen vs Vietnam factories, Atlanta/Inland/Rotterdam DCs, and dedicated carriers."
    ]
    for r in opt_rules:
        p = tf_o.add_paragraph()
        p.text = f"✔ {r}"
        p.font.size = PptxPt(12)
        p.font.color.rgb = SLATE

    # Right: Financial Lift Card
    box_fin = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, PptxInches(6.8), PptxInches(1.5), PptxInches(5.7), PptxInches(5.3))
    box_fin.fill.solid()
    box_fin.fill.fore_color.rgb = NAVY
    box_fin.line.color.rgb = NAVY

    tf_f = box_fin.text_frame
    tf_f.word_wrap = True
    tf_f.margin_left = PptxInches(0.4)
    tf_f.margin_top = PptxInches(0.4)

    p = tf_f.paragraphs[0]
    p.text = "TOTAL PORTFOLIO PROFIT LIFT"
    p.font.size = PptxPt(12)
    p.font.bold = True
    p.font.color.rgb = CYAN

    p2 = tf_f.add_paragraph()
    p2.text = "+$1,040,117.82"
    p2.font.size = PptxPt(40)
    p2.font.bold = True
    p2.font.color.rgb = GREEN

    p3 = tf_f.add_paragraph()
    p3.text = "+4.2% Net Margin Expansion (43.7% ➔ 45.6%)"
    p3.font.size = PptxPt(16)
    p3.font.bold = True
    p3.font.color.rgb = WHITE

    fin_breakdown = [
        "Total Revenue Base: $55,984,370.00",
        "Manufacturing Cost: $24,361,855.20",
        "Freight Shipping Cost: $6,496,494.72",
        "Baseline Penalties Loss: $634,632.00",
        "Optimized Penalty Loss: $114,233.76 (82% Reduction)"
    ]
    tf_f.add_paragraph() # spacer
    for fb in fin_breakdown:
        p = tf_f.add_paragraph()
        p.text = fb
        p.font.size = PptxPt(12)
        p.font.color.rgb = PptxRGBColor(0xCB, 0xD5, 0xE1)

    # SLIDE 5: Strategic Recommendations
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "4. Strategic Recommendations & Implementation Roadmap")

    recs = [
        ("1. Automate Expedited Carrier Routing", "Direct high-penalty Tier-1 retail shipments through dedicated express freight carriers (FedEx, JB Hunt) to eradicate 82% of late delivery penalties.", GREEN),
        ("2. Origin ASN & Barcode Scanning", "Deploy automated barcode scanners and packaging checks at Shenzhen and Vietnam plants to prevent dock rejection chargebacks.", CYAN),
        ("3. Dynamic Backlog Allocation", "Integrate the Order Assignment Engine with ERP order entry to dynamically assign factory-DC paths within +50% guardrail caps.", NAVY),
        ("4. Multi-Tier Supplier SLA Monitoring", "Track component suppliers (Osaka Lithium, Taiwan Gear, Ningbo Motor) to resolve upstream component bottlenecks early.", SLATE)
    ]

    for idx, (title, desc, color) in enumerate(recs):
        top_pos = PptxInches(1.5 + idx * 1.35)
        r_box = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, PptxInches(0.8), top_pos, PptxInches(11.7), PptxInches(1.15))
        r_box.fill.solid()
        r_box.fill.fore_color.rgb = LIGHT_BG
        r_box.line.color.rgb = PptxRGBColor(0xE2, 0xE8, 0xF0)

        tf = r_box.text_frame
        tf.word_wrap = True
        tf.margin_left = PptxInches(0.3)
        tf.margin_top = PptxInches(0.15)

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = PptxPt(15)
        p.font.bold = True
        p.font.color.rgb = color

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = PptxPt(12)
        p2.font.color.rgb = SLATE

    prs.save(output_path)
    print(f"Saved PowerPoint presentation to {output_path}")

if __name__ == "__main__":
    os.makedirs("app/downloads", exist_ok=True)
    word_path = "app/downloads/walkthrough.docx"
    pptx_path = "app/downloads/executive_summary_deck.pptx"

    create_word_walkthrough(word_path)
    create_pptx_executive_deck(pptx_path)

    # Also save to artifact directory for persistent artifact record
    artifact_dir = r"C:\Users\charanyan\.gemini\antigravity\brain\d1cb55b1-ef8c-4737-930f-d0dd6afaf05e"
    os.makedirs(artifact_dir, exist_ok=True)
    create_word_walkthrough(os.path.join(artifact_dir, "walkthrough.docx"))
    create_pptx_executive_deck(os.path.join(artifact_dir, "executive_summary_deck.pptx"))
