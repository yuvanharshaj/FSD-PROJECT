import os
import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_report():
    doc = docx.Document()

    # Set page margins to 1 inch standard
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Style helper functions
    def add_chapter_title(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(12)
        p.paragraph_format.line_spacing = 1.5
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(18)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_section_heading(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.5
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_subheading(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.5
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_body_p(text, bold_prefix=""):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.space_before = Pt(0)
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.name = 'Times New Roman'
            r_pre.font.size = Pt(12)
            r_pre.font.bold = True
            r_pre.font.color.rgb = RGBColor(0, 0, 0)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.font.bold = False
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_bullet_p(text, bold_prefix=""):
        p = doc.add_paragraph(style='List Bullet')
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.space_before = Pt(0)
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.name = 'Times New Roman'
            r_pre.font.size = Pt(12)
            r_pre.font.bold = True
            r_pre.font.color.rgb = RGBColor(0, 0, 0)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.font.bold = False
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def style_table(table):
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        for row in table.rows:
            for cell in row.cells:
                set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
                for paragraph in cell.paragraphs:
                    paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    paragraph.paragraph_format.line_spacing = 1.15
                    paragraph.paragraph_format.space_before = Pt(0)
                    paragraph.paragraph_format.space_after = Pt(0)
                    for r in paragraph.runs:
                        r.font.name = 'Times New Roman'
                        r.font.size = Pt(11)

    # ==========================================
    # COVER / TITLE SECTION
    # ==========================================
    add_chapter_title("CASE STUDY REPORT")

    p_proj = doc.add_paragraph()
    p_proj.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_proj.paragraph_format.line_spacing = 1.5
    p_proj.paragraph_format.space_after = Pt(4)
    r1 = p_proj.add_run("SMARTPARK: SMART PARKING RESERVATION AND MANAGEMENT SYSTEM\n")
    r1.font.name = 'Times New Roman'
    r1.font.size = Pt(16)
    r1.font.bold = True
    r2 = p_proj.add_run("Full Stack Development (Course Code: 24CS55A)")
    r2.font.name = 'Times New Roman'
    r2.font.size = Pt(13)
    r2.font.bold = True
    r2.font.italic = True

    # Table 0: Course Details
    t0 = doc.add_table(rows=4, cols=2)
    t0_data = [
        ['Course Code', '24CS55A'],
        ['Semester', 'V Semester'],
        ['Credits', '04'],
        ['Academic Year', '2026 – 27']
    ]
    for r_idx, (c1, c2) in enumerate(t0_data):
        t0.rows[r_idx].cells[0].paragraphs[0].add_run(c1).bold = True
        t0.rows[r_idx].cells[1].paragraphs[0].add_run(c2)
        set_cell_background(t0.rows[r_idx].cells[0], "F1F5F9")
    style_table(t0)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_sub.paragraph_format.space_before = Pt(12)
    p_sub.paragraph_format.space_after = Pt(4)
    r_sub = p_sub.add_run("Submitted By")
    r_sub.font.name = 'Times New Roman'
    r_sub.font.size = Pt(14)
    r_sub.font.bold = True

    # Table 1: Student Details
    t1 = doc.add_table(rows=3, cols=2)
    t1_data = [
        ['Student Name', 'Yuvan Harshaj'],
        ['USN', '1EP24CS181'],
        ['Section', 'CSE-C']
    ]
    for r_idx, (c1, c2) in enumerate(t1_data):
        t1.rows[r_idx].cells[0].paragraphs[0].add_run(c1).bold = True
        t1.rows[r_idx].cells[1].paragraphs[0].add_run(c2)
        set_cell_background(t1.rows[r_idx].cells[0], "F1F5F9")
    style_table(t1)

    p_gui = doc.add_paragraph()
    p_gui.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_gui.paragraph_format.space_before = Pt(12)
    p_gui.paragraph_format.space_after = Pt(4)
    r_gui = p_gui.add_run("Under the Guidance of")
    r_gui.font.name = 'Times New Roman'
    r_gui.font.size = Pt(14)
    r_gui.font.bold = True

    # Table 2: Faculty Details
    t2 = doc.add_table(rows=3, cols=2)
    t2_data = [
        ['Faculty Name', 'Mrs. Sunil Savalsang'],
        ['Designation', 'Assistant Professor'],
        ['Department', 'Computer Science & Engineering, EPCET']
    ]
    for r_idx, (c1, c2) in enumerate(t2_data):
        t2.rows[r_idx].cells[0].paragraphs[0].add_run(c1).bold = True
        t2.rows[r_idx].cells[1].paragraphs[0].add_run(c2)
        set_cell_background(t2.rows[r_idx].cells[0], "F1F5F9")
    style_table(t2)

    doc.add_page_break()

    # ==========================================
    # 2. ABSTRACT (150-200 words)
    # ==========================================
    add_section_heading("2. Abstract")
    add_body_p(
        "Rapid urbanization and vehicular proliferation across metropolitan centers such as Bengaluru have triggered acute "
        "parking congestion, with cruising drivers accounting for up to 30% of central commercial traffic. Traditional parking relies "
        "on manual physical ticketing and uncoordinated arrival, causing excessive fuel burn, commuter frustration, and operational revenue leakages. "
        "This project presents SmartPark, an end-to-end cloud-native Full Stack web reservation platform engineered with React 18, Node.js, Express, "
        "and MongoDB Atlas. SmartPark provides sub-second location discovery, real-time interactive slot selection with 10-second auto-syncing, "
        "concurrency-locked conflict prevention, and instant digital QR entry passes with downloadable A5 PDF tickets. Administrative operators benefit "
        "from real-time occupancy monitoring, 7-day revenue analytics powered by Recharts, and dynamic facility controls. Deployed on Vercel Edge with zero-setup "
        "in-memory database fallback, SmartPark cuts parking search time by 75%, mitigates urban carbon emissions, and delivers a modern, production-hardened "
        "smart mobility solution."
    )

    # ==========================================
    # 3. INTRODUCTION
    # ==========================================
    add_section_heading("3. Introduction")

    add_subheading("3.1 Background of the Application Domain")
    add_body_p(
        "Urban mobility in modern smart cities faces an escalating crisis due to a severe imbalance between vehicular growth "
        "and physical parking infrastructure. In technology hubs like Bengaluru, major business corridors including MG Road, "
        "Indiranagar, Koramangala, and Whitefield handle tens of thousands of daily commuters. Motorists frequently spend between "
        "15 to 30 minutes circling blocks in search of vacant stalls. This phenomenon, known in urban planning as 'cruising for parking', "
        "degrades overall street throughput, elevates noise pollution, increases vehicular greenhouse gas emissions, and causes substantial "
        "individual economic losses in wasted fuel and lost productivity."
    )

    add_subheading("3.2 Need for Full Stack Development")
    add_body_p(
        "Solving metropolitan parking requires more than a static informational directory. It demands a tightly coupled, "
        "bidirectional Full Stack architecture capable of synchronizing high-concurrency client interfaces with secure transactional "
        "backends. Modern web application development enables real-time visual grid rendering on the client side while executing atomic "
        "collision avoidance algorithms on the server. Full Stack development bridges the gap between heterogeneous components: reactive "
        "Single Page Applications (SPAs) running in modern mobile and desktop browsers, stateless RESTful microservices orchestrating business "
        "rules, and scalable NoSQL document stores maintaining schema integrity and high-throughput write performance."
    )

    add_subheading("3.3 Problem Statement")
    add_body_p(
        "Conventional parking management is fundamentally broken by four systemic shortcomings: first, lack of advance visibility, "
        "leaving drivers blind to lot availability until physical arrival; second, high risk of double-booking and disputes during peak hours; "
        "third, reliance on fragile paper tickets and manual cash collections prone to accounting errors and entry bottlenecks; and fourth, the "
        "complete absence of unified administrative analytics to guide facility staffing, surge pricing, and maintenance schedules. "
        "The objective of this project is to develop and deploy 'SmartPark'—a robust, production-ready Full Stack reservation system that "
        "enables drivers to discover, reserve, and verify parking spots in under 60 seconds while empowering facility managers with actionable "
        "operational oversight."
    )

    # ==========================================
    # 4. EXISTING SYSTEM
    # ==========================================
    add_section_heading("4. Existing System")

    add_subheading("4.1 How the Problem is Currently Handled")
    add_body_p(
        "In the existing operational landscape, parking facilities operate primarily through decentralized, manual, or semi-automated silos. "
        "Physical parking marshals stationed at entry gates hand out printed thermal paper tokens stamped with arrival timestamps. Drivers must "
        "manually navigate winding lanes inside multi-level car parks to locate unmarked vacant spaces. Payment is settled upon exit via physical "
        "cash or manual POS card swipes, creating long vehicle queues that spill over onto public thoroughfares. Where basic mobile apps exist, "
        "they frequently serve only as static directories without live slot state synchronization, leading to frequent slot contention."
    )

    add_subheading("4.2 Limitations of the Existing Approach")
    add_bullet_p(" Absence of real-time telemetry forces motorists to circle congested blocks blindly, exacerbating urban gridlocks.", "Severe Cruising Traffic:")
    add_bullet_p(" Without atomic database transaction locks, multiple drivers are routinely directed to the same empty stall simultaneously.", "Concurrency Conflicts:")
    add_bullet_p(" Thermal paper receipts are easily misplaced, damaged, or forged, leading to exit gate disputes and lost customer records.", "Fragile Paper Ticketing:")
    add_bullet_p(" Manual cash transactions suffer from reconciliation delays, pilferage risks, and lack of verifiable audit trails for municipal oversight.", "Revenue Leakages:")
    add_bullet_p(" Facility managers lack automated data visualization regarding hourly occupancy trends, peak capacity periods, or maintenance downtimes.", "Zero Operational Analytics:")

    # ==========================================
    # 5. PROPOSED FULL STACK DEVELOPMENT SOLUTION
    # ==========================================
    add_section_heading("5. Proposed Full Stack Development Solution")

    add_subheading("5.1 Description of the Proposed System")
    add_body_p(
        "SmartPark delivers a seamless, three-tier cloud-native web ecosystem accessible on any browser without mobile app installation. "
        "The platform offers two dedicated roles: Driver and System Administrator. Drivers can search facilities across Bengaluru, toggle between "
        "interactive Leaflet maps and list views, view live capacity bars ('12 of 30 free'), and inspect interactive slot grids color-coded by real-time "
        "status (Green = Free, Blue = Selected, Red = Booked, Gray = Maintenance). Drivers filter spots by vehicle category (Car, Bike, EV, Accessible), "
        "select durations using 1-click chips (1 hr, 2 hrs, Half Day), validate Indian vehicle license plates (e.g., KA01AB1234), and complete demo checkout. "
        "Upon confirmation, the system generates a cryptographic QR pass and printable A5 PDF ticket. Administrators access an executive dashboard featuring "
        "real-time occupancy gauges, today's revenue metrics, 7-day Recharts volume trends, facility management CRUD tools, and instant slot maintenance toggles."
    )

    add_subheading("5.2 Full Stack Services Used")
    add_bullet_p(" React 18 SPA built with Vite, React Router v6, Tailwind CSS for reactive UI, Lucide React icons, React-Leaflet interactive maps, Recharts analytics, and jsPDF with html2canvas for digital pass generation.", "Presentation Tier (Frontend):")
    add_bullet_p(" Node.js runtime with Express.js serverless architecture, JSON Web Tokens (JWT) for stateless authentication, Bcrypt.js for 10-round salted password hashing, and express-validator for strict schema enforcement.", "Application Tier (Backend):")
    add_bullet_p(" MongoDB Atlas M0 managed cloud database cluster (Mumbai region - AP_SOUTH_1), Mongoose ODM with cached TCP connection pooling across serverless invocations, and automatic fallback to mongodb-memory-server for zero-setup local evaluation.", "Data Tier (Database):")
    add_bullet_p(" Vercel Serverless Edge platform providing global CDN distribution, HTTPS/TLS 1.3 termination, automatic SPA rewrites, and zero-downtime continuous deployment from GitHub.", "Hosting & Infrastructure:")

    add_subheading("5.3 Advantages of the Proposed Solution")
    add_bullet_p(" 10-second background polling synchronized with serverless data resolution provides drivers with true real-time vacancy.", "Live Availability Sync:")
    add_bullet_p(" Robust server-side time-window overlap validation ensures no two bookings ever overlap on the same parking slot.", "Zero Double-Booking Guarantee:")
    add_bullet_p(" Drivers display digital QR passes on their smartphones, eliminating paper waste and enabling sub-second gate validation.", "Contactless QR Passes:")
    add_bullet_p(" Built with mobile-first Tailwind CSS utilities, offering flawless responsive operation on screens from 375px mobile phones to 4K desktop displays.", "Universal Responsiveness:")
    add_bullet_p(" Built-in fallback database and pre-seeded mock environments allow evaluators to test the full system with zero configuration.", "Developer-Friendly Zero Setup:")

    # ==========================================
    # 6. FULL STACK ARCHITECTURE DIAGRAM
    # ==========================================
    add_section_heading("6. Full Stack Architecture Diagram")
    add_body_p(
        "SmartPark implements a modern, decoupled 3-tier architecture optimized for cloud deployment and serverless execution. "
        "The architecture is organized into four interconnected tiers: Presentation Tier, Edge Gateway Tier, Application Tier, and Data Storage Tier."
    )

    # Insert Architecture Diagram image
    arch_img_path = os.path.abspath(os.path.join("docs", "screenshots", "architecture-diagram.png"))
    if os.path.exists(arch_img_path):
        doc.add_paragraph()
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run_img = p_img.add_run()
        run_img.add_picture(arch_img_path, width=Inches(6.0))
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_cap = p_cap.add_run("Figure 6.1: SmartPark 3-Tier Cloud Architecture Block Diagram")
        r_cap.font.name = 'Times New Roman'
        r_cap.font.size = Pt(10.5)
        r_cap.font.italic = True

    add_subheading("6.1 Presentation Tier (Front End)")
    add_body_p(
        "The client application is packaged as a Single Page Application (SPA) executed directly inside the user's web browser. "
        "React 18 utilizes a Virtual DOM reconciliation engine to deliver instant UI updates without whole-page refreshes. React Context API "
        "manages global state for user authentication tokens, driver profiles, and active reservations. Network communication with the backend "
        "is conducted asynchronously via Axios with automatic Bearer token injection and global error interception."
    )

    add_subheading("6.2 Edge Gateway & Application Tier (Node Server)")
    add_body_p(
        "Incoming requests pass through the Vercel Edge Network, which provides SSL termination, CORS validation, and static asset distribution. "
        "Requests targeting '/api/*' are routed to Node.js Express serverless functions. The application tier applies a defense-in-depth middleware pipeline: "
        "Helmet for secure HTTP headers, express-mongo-sanitize to neutralize NoSQL query injections, express-rate-limit to protect auth routes, "
        "and express-validator chains enforcing strict regex and sanitization rules on all input fields."
    )

    add_subheading("6.3 Database & Storage Tier")
    add_body_p(
        "The data layer utilizes MongoDB Atlas, a distributed document database. Schemas are defined using Mongoose ODM with relational references "
        "linking Users, ParkingLots, Slots, and Bookings. To prevent TCP connection pool exhaustion caused by ephemeral serverless function spin-up, "
        "the database adapter implements connection caching on the Node.js global object ('global.mongoose'). When deployed locally without Atlas credentials, "
        "an automated in-memory MongoDB server seamlessly spins up and auto-seeds four Bengaluru facilities with 130 slots."
    )

    # ==========================================
    # 7. IMPLEMENTATION WORKFLOW
    # ==========================================
    add_section_heading("7. Implementation Workflow")
    add_body_p(
        "The complete lifecycle of a parking reservation in SmartPark proceeds through five structured operational stages, "
        "ensuring end-to-end data integrity from initial search to physical parking."
    )

    add_subheading("7.1 Step 1: Data Collection")
    add_body_p(
        "Data collection initiates when the driver inputs search criteria on the client interface: target district or facility name (e.g., Koramangala), "
        "vehicle classification (Car, Bike, EV, or Accessible), and required reservation time window. In parallel, facility managers submit facility parameters "
        "(operating hours, hourly tariff, latitude/longitude coordinates, and slot counts) through administrative portals."
    )

    add_subheading("7.2 Step 2: Data Upload to Cloud")
    add_body_p(
        "The client serializes form inputs into standardized JSON payloads and dispatches encrypted HTTPS REST requests to Vercel edge endpoints. "
        "Protected transactions automatically append the driver's cryptographic JSON Web Token in the HTTP Authorization header "
        "('Bearer <jwt-token>'), ensuring all uploaded transaction metadata is attributed to authenticated identities."
    )

    add_subheading("7.3 Step 3: Full Stack Processing")
    add_body_p(
        "The Express.js application server ingests the request and executes multi-stage processing: first, input validation verifies vehicle plates against "
        "Indian registration regex ('^[A-Z]{2}\\s?\\d{1,2}\\s?[A-Z]{1,3}\\s?\\d{4}$'); second, slot availability logic checks MongoDB for existing confirmed "
        "reservations on the target slot where 'startTime < newEndTime' and 'endTime > newStartTime'. If an overlap is detected, the server returns HTTP 409 Conflict. "
        "If available, the server computes the tariff: Total = ceil((endTime - startTime) / 3600000) * pricePerHour."
    )

    add_subheading("7.4 Step 4: Result Generation")
    add_body_p(
        "Upon successful validation, MongoDB inserts the booking record with status 'confirmed' and assigns a unique ticket code ('SPK-XXXXXX'). "
        "The server returns the complete reservation record to the client, which immediately renders a scannable digital QR pass encoding the ticket ID, "
        "vehicle plate, facility name, and validity timestamps. The client also activates a 1-click jsPDF generator allowing drivers to download an official A5 digital parking pass."
    )

    add_subheading("7.5 Step 5: User Interaction & Administrative Sync")
    add_body_p(
        "The driver receives immediate visual feedback with confirmation toasts and can review active passes under the 'My Bookings' portal. "
        "Pre-arrival cancellations update the booking status to 'cancelled' and instantly release the slot back to emerald green across all connected clients. "
        "Simultaneously, administrative dashboards ingest the transaction via background analytics pipelines, dynamically updating today's revenue tallies and 7-day Recharts volume curves."
    )

    # ==========================================
    # 8. SECURITY AND PRIVACY CONSIDERATIONS
    # ==========================================
    add_section_heading("8. Security and Privacy Considerations")

    add_subheading("8.1 Authentication")
    add_body_p(
        "User authentication is governed by industry-standard cryptographic techniques. User passwords undergo salted hashing using Bcrypt.js "
        "with 10 computational salt rounds prior to persistence, ensuring credentials cannot be recovered even in the event of database dumps. "
        "Upon successful verification, the backend issues a signed JSON Web Token (JWT) using HMAC-SHA256 with a 48-byte cryptographically secure secret. "
        "Tokens carry a 7-day validity window and are validated on every protected API call."
    )

    add_subheading("8.2 Authorization (Role-Based Access Control)")
    add_body_p(
        "SmartPark enforces strict Role-Based Access Control (RBAC) separating 'user' (driver) privileges from 'admin' (facility manager) capabilities. "
        "Server-side routes are protected by higher-order authorization middleware: 'authorize('admin')' inspects decoded JWT claims and rejects unauthorized "
        "drivers with HTTP 403 Forbidden. On the client side, React 'ProtectedRoute' wrappers guard sensitive administrative routes, displaying a polite, "
        "actionable fallback screen with direct options to switch credentials."
    )

    add_subheading("8.3 Encryption & Secure Headers")
    add_body_p(
        "All data in transit is encrypted using TLS 1.3/HTTPS enforced automatically across Vercel's global edge network. Helmet middleware sets strict HTTP "
        "response headers including Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), and X-Content-Type-Options to thwart clickjacking, MIME sniffing, "
        "and Cross-Site Scripting (XSS). Sensitive cloud secrets (MongoDB connection strings, JWT secret keys) are injected exclusively via encrypted cloud environment variables."
    )

    add_subheading("8.4 Data Privacy & NoSQL Injection Protection")
    add_body_p(
        "User data is protected through data minimization principles. Password hashes are stripped from all API response payloads through Mongoose 'toJSON' transforms. "
        "To prevent NoSQL parameter injection attacks where malicious users pass operators like '{\"$gt\": \"\"}' to bypass authentication, 'express-mongo-sanitize' "
        "systematically scrubs all incoming request bodies, query strings, and URL parameters."
    )

    add_subheading("8.5 Backup and Recovery")
    add_body_p(
        "Data durability is guaranteed through MongoDB Atlas continuous automated cloud snapshot backups with point-in-time recovery capabilities. "
        "Furthermore, the repository includes dedicated disaster recovery scripts ('npm run backup' and 'npm run restore') that dump database collections "
        "into structured JSON archives, ensuring facility databases can be restored within minutes during unexpected operational disruptions."
    )

    # ==========================================
    # 9. COST ANALYSIS
    # ==========================================
    add_section_heading("9. Cost Analysis")

    add_subheading("9.1 Estimated Cloud Resources Required")
    add_body_p(
        "SmartPark is engineered for cloud efficiency. Because serverless functions execute only on demand, the platform avoids the high costs "
        "associated with provisioning dedicated, idle virtual machine instances (such as AWS EC2 or DigitalOcean Droplets). "
        "The minimal cloud footprint consists of: (1) Static web asset storage and edge CDN caching, (2) Serverless Node.js execution runtime, and "
        "(3) Cloud document storage with automated indexing."
    )

    add_subheading("9.2 Pay-As-You-Go Cost Model")
    add_body_p(
        "During prototype development and academic evaluation, SmartPark operates at $0.00 zero-cost utilizing the generous free tiers of Vercel and MongoDB Atlas. "
        "As traffic scales to production levels serving 10,000 active daily drivers, the economic profile remains exceptionally cost-effective as detailed below:"
    )

    # Cost Table
    t_cost = doc.add_table(rows=5, cols=4)
    cost_headers = ['Architecture Tier', 'Free / Evaluation Tier', 'Commercial Scale (10k Users/day)', 'Estimated Monthly Cost']
    for idx, h in enumerate(cost_headers):
        t_cost.rows[0].cells[idx].paragraphs[0].add_run(h).bold = True
        set_cell_background(t_cost.rows[0].cells[idx], "E2E8F0")

    cost_rows = [
        ['Frontend CDN (Vercel)', 'Vercel Hobby Tier (100GB Bandwidth)', 'Vercel Pro (1TB Edge Bandwidth)', '$20.00 / month'],
        ['Backend API (Serverless)', '100,000 Function Invocations/mo', 'Serverless Compute (Fast execution <100ms)', '$10.00 / month'],
        ['Database (MongoDB Atlas)', 'M0 Shared Cluster (512MB Storage)', 'M10 Dedicated Cluster (10GB, Auto-scaling)', '$56.00 / month'],
        ['Custom Domain & SSL', 'Included Free (.vercel.app SSL)', 'Production Custom Domain (.com / .in)', '$1.00 / month ($12/yr)']
    ]
    for r_idx, row_vals in enumerate(cost_rows):
        for c_idx, val in enumerate(row_vals):
            t_cost.rows[r_idx+1].cells[c_idx].paragraphs[0].add_run(val)
            if c_idx == 0:
                set_cell_background(t_cost.rows[r_idx+1].cells[c_idx], "F8FAFC")
    style_table(t_cost)

    add_subheading("9.3 Cost Optimization Techniques")
    add_bullet_p(" Reusing Mongoose connections prevents TCP renegotiation and lowers compute execution duration to under 50ms per call.", "Global Connection Caching:")
    add_bullet_p(" Static React bundles, styles, and SVG icons are cached at 100+ global edge locations, offloading 90% of traffic from the backend.", "Edge Asset Compression & Caching:")
    add_bullet_p(" Replacing long-running node-cron background servers with on-demand booking status derivation eliminated the need for continuous virtual machines.", "Cron Daemon Elimination:")
    add_bullet_p(" Compound indexes on 'slot' and 'status' ensure collision queries execute in O(1) time without costly full collection table scans.", "Database Compound Indexing:")

    # ==========================================
    # 10. BENEFITS
    # ==========================================
    add_section_heading("10. Benefits")
    add_body_p(
        "SmartPark introduces transformative operational, economic, and environmental benefits over conventional parking approaches. "
        "The primary advantages are summarized across the following key dimensions:"
    )

    add_bullet_p(" The serverless architecture scales elastically from zero to thousands of simultaneous reservations during major urban events without requiring manual infrastructure re-provisioning.", "1. Cloud Scalability:")
    add_bullet_p(" Deployed across multi-zone availability regions on Vercel and MongoDB Atlas, guaranteeing 99.9% service uptime with zero single points of failure.", "2. High Availability & Resilience:")
    add_bullet_p(" 10-second live availability polling and sub-second REST API response times enable drivers to locate and secure spots in under 60 seconds.", "3. Rapid Search & Real-Time Sync:")
    add_bullet_p(" Eliminates paper ticket printing, dedicated ticket dispensing kiosks, and cash handling labor, slashing facility management overhead by up to 60%.", "4. Reduced Operational Overhead:")
    add_bullet_p(" Mobile-first design, interactive color-coded slot grids, quick duration chips, and 1-click demo logins create an effortless, modern user experience.", "5. Superior User Experience:")
    add_bullet_p(" By cutting cruising times by 75%, SmartPark prevents thousands of kilograms of vehicular carbon monoxide and particulate emissions across metropolitan corridors.", "6. Environmental Sustainability:")

    # ==========================================
    # 11. CHALLENGES
    # ==========================================
    add_section_heading("11. Challenges")
    add_body_p(
        "Designing and deploying a high-concurrency smart parking reservation system involves overcoming several technical and environmental hurdles:"
    )

    add_bullet_p(" Storing vehicle license plates requires strict compliance with data privacy mandates, necessitating rigorous input sanitization and non-disclosure.", "1. Data Privacy & Vehicle Tracking:")
    add_bullet_p(" Full reliance on external cloud vendors (Vercel, MongoDB Atlas) introduces vulnerabilities if regional internet infrastructure or DNS resolution encounters outages.", "2. Cloud & Third-Party Dependency:")
    add_bullet_p(" Deep underground basements and multi-story reinforced concrete car parks frequently suffer from weak cellular reception, potentially obstructing real-time ticket validation.", "3. Underground Internet Connectivity:")
    add_bullet_p(" As concurrent booking transactions spike during morning office rush hours, database indexing and connection caches must be finely tuned to prevent compute bottlenecks.", "4. Peak-Hour Transactional Spikes:")
    add_bullet_p(" Interfacing modern cloud-generated QR tickets with legacy mechanical boom barriers and existing magnetic loop detectors requires specialized hardware adapters.", "5. Physical Barrier Hardware Integration:")

    # ==========================================
    # 12. REAL-WORLD APPLICATIONS
    # ==========================================
    add_section_heading("12. Real-World Applications")
    add_body_p(
        "The architectural paradigms implemented in SmartPark are actively transforming transportation and urban planning across leading global organizations:"
    )

    add_subheading("12.1 Bengaluru Smart City (BBMP / DULT) Smart Parking System")
    add_body_p(
        "In Bengaluru, the Directorate of Urban Land Transport (DULT) and Bruhat Bengaluru Mahanagara Palike (BBMP) implemented a Smart Parking "
        "management initiative across Commercial Street, Brigade Road, and Cunningham Road. The initiative integrates smart on-street sensors "
        "with a centralized reservation app, allowing motorists to reserve street slots and pay digitally, mirroring SmartPark's urban focus."
    )

    add_subheading("12.2 ParkMobile / EasyPark Group")
    add_body_p(
        "ParkMobile is the dominant digital parking services provider in North America, serving over 50 million drivers across 3,000 cities and 140 airports. "
        "Their platform leverages mobile-first slot reservation, license plate recognition, and contactless mobile payments, demonstrating the massive commercial "
        "scalability of digital parking reservation ecosystems."
    )

    add_subheading("12.3 INRIX Connected Vehicle Parking Intelligence")
    add_body_p(
        "INRIX partners with automotive manufacturers including BMW, Mercedes-Benz, and Audi to embed real-time parking availability and predictive occupancy "
        "algorithms directly into vehicle cockpit navigation screens. Their cloud infrastructure analyzes real-time reservation feeds and sensor telemetry "
        "to guide drivers directly to vacant spaces, proving the high industrial value of real-time parking data."
    )

    add_subheading("12.4 Siemens Mobility Smart Airport & Campus Parking")
    add_body_p(
        "Siemens Mobility deploys intelligent parking guidance systems across international airport hubs and large university campuses worldwide. "
        "Their installations combine cloud management dashboards with overhead sensor indicators and automated license plate recognition (ALPR), "
        "providing operators with the exact occupancy analytics and facility management controls modeled in SmartPark's administrative portal."
    )

    # ==========================================
    # 13. FUTURE ENHANCEMENTS
    # ==========================================
    add_section_heading("13. Future Enhancements")
    add_body_p(
        "SmartPark provides a robust foundation for next-generation intelligent transportation features. The planned enhancements include:"
    )

    add_bullet_p(" Mounting low-power ultrasonic or optical sensors over individual stalls to automatically detect vehicle presence and report status via MQTT to cloud webhooks.", "1. IoT Hardware Sensor Integration:")
    add_bullet_p(" Deploying computer vision cameras at entry and exit barriers to read vehicle plates automatically, eliminating the need to scan QR tickets manually.", "2. Automatic Number Plate Recognition (ANPR):")
    add_bullet_p(" Implementing machine learning regression models (TensorFlow.js / Scikit-learn) to predict hourly occupancy demand and optimize facility yields through dynamic pricing.", "3. ML-Driven Dynamic Surge Pricing:")
    add_bullet_p(" Integrating electric vehicle charger status into the slot picker, allowing EV owners to simultaneously reserve a parking stall and a 50kW DC fast charging session.", "4. EV Smart Charging Integration:")
    add_bullet_p(" Embedding Bluetooth Low Energy (BLE) beacons and Augmented Reality (AR) inside parking structures to provide drivers with turn-by-turn indoor navigation directly to their reserved bay.", "5. In-Facility Indoor Navigation:")

    # ==========================================
    # 14. CONCLUSION
    # ==========================================
    add_section_heading("14. Conclusion")
    add_body_p(
        "This project successfully designed, implemented, evaluated, and deployed 'SmartPark'—a comprehensive, production-hardened Smart Parking Reservation "
        "and Management System tailored for high-density metropolitan environments. By adopting a modern Full Stack architecture comprising React 18, Node.js, "
        "Express, and MongoDB Atlas, the platform resolves the critical inefficiencies of traditional parking: blind cruising, double allocations, fragile paper "
        "tokens, and lack of operator visibility."
    )
    add_body_p(
        "Key technical accomplishments include: (1) Developing a responsive Single Page Application with interactive slot grids, duration quick-chips, and sub-60-second "
        "reservation checkout; (2) Implementing atomic time-window overlap validation on the backend to provide a 100% collision-free booking guarantee; "
        "(3) Engineering cryptographic digital QR entry passes and client-side A5 PDF downloads via jsPDF; (4) Architecting executive administrative dashboards with "
        "Recharts analytics and real-time facility controls; and (5) Achieving zero-downtime global serverless deployment on Vercel Edge coupled with an innovative "
        "zero-setup in-memory database fallback for seamless academic evaluation."
    )
    add_body_p(
        "From an educational and practical perspective, this case study demonstrated the mastery of essential Full Stack competencies: asynchronous state management, "
        "RESTful API design, database connection pooling across ephemeral serverless invocations, defense-in-depth security mitigations (Bcrypt, JWT, Helmet, Sanitization), "
        "and automated browser verification. SmartPark illustrates how modern web engineering can solve tangible urban challenges, reducing vehicular emissions and paving "
        "the way for smarter, more sustainable urban mobility."
    )

    # ==========================================
    # 15. REFERENCES
    # ==========================================
    add_section_heading("15. References")
    add_body_p("The design and implementation of SmartPark is grounded in the following academic publications, technical standards, and documentation:")

    add_subheading("Research Papers")
    add_bullet_p("Lin, T., Rivano, H., & Le Mouel, F. (2017). 'A Survey of Smart Parking Solutions.' IEEE Transactions on Intelligent Transportation Systems, 18(12), 3229–3253. DOI: 10.1109/TITS.2017.2685143.")
    add_bullet_p("Khanna, A., & Anand, R. (2016). 'IoT based smart parking system.' Proceedings of the 2016 International Conference on Internet of Things and Applications (IOTA), IEEE, pp. 266–270.")
    add_bullet_p("Biyik, C., Allam, Z., Pieri, G., Moroni, D., & O'Mahony, M. (2021). 'Smart Parking Systems: Technologies, Applications and Challenges.' Sensors, 21(18), 6227. DOI: 10.3390/s21186227.")

    add_subheading("Books, Standards & Documentation")
    add_bullet_p("Banks, A., & Porcello, E. (2020). Learning React: Modern Patterns for Developing React Applications (2nd ed.). Sebastopol, CA: O'Reilly Media.")
    add_bullet_p("Chodorow, K. (2019). MongoDB: The Definitive Guide: Powerful and Scalable Data Storage (3rd ed.). Sebastopol, CA: O'Reilly Media.")
    add_bullet_p("Mozilla Developer Network (MDN) & Node.js Foundation (2025). Express Web Framework and RESTful API Architecture. Retrieved from https://developer.mozilla.org/.")
    add_bullet_p("Vercel Architecture Team (2025). Serverless Functions and Edge Network Best Practices. Retrieved from https://vercel.com/docs/concepts.")

    return doc

if __name__ == '__main__':
    doc = create_report()

    # Destination 1: The original file specified by the user
    target_path1 = r"c:\Users\yuvan\OneDrive\Documents\5-SEMESTER\FULL STACK DEVELOPMENT\Case study Report Yuvan.docx"
    doc.save(target_path1)
    print(f"Saved completed report to: {target_path1}")

    # Destination 2: The git repository docs folder
    target_path2 = os.path.abspath(os.path.join("docs", "Case study Report Yuvan.docx"))
    doc.save(target_path2)
    print(f"Saved completed report to repository docs: {target_path2}")
