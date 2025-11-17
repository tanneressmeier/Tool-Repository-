# Feature Specifications

> **Last Updated:** 2025-11-17

## Table of Contents
- [Feature Overview](#feature-overview)
- [1. Master Inventory Management](#1-master-inventory-management)
- [2. Tool Comparison System](#2-tool-comparison-system)
- [3. AI-Powered Tool Prediction](#3-ai-powered-tool-prediction)
- [4. Aircraft Data Hub](#4-aircraft-data-hub)
- [5. Purchase Management](#5-purchase-management)
- [6. AI Sourcing Engine](#6-ai-sourcing-engine)
- [7. Kit Management](#7-kit-management)
- [8. Report Generation](#8-report-generation)
- [9. Maintenance Task Analysis](#9-maintenance-task-analysis)
- [10. CSV Import/Export](#10-csv-importexport)

## Feature Overview

Tool Inventory Checker provides 10 major feature categories, each designed to solve specific aspects of aviation tool management.

### Feature Map
```
Master Inventory ──┬──> Tool Comparison ──> Shortage Identification ──> AI Sourcing ──> Reports
                   │
                   ├──> AI Prediction ──> Needed Tools List ─────────────┘
                   │
                   └──> Purchase Tracking ──> Inventory Updates

Aircraft Data Hub (organizes all comparisons, lists, and reports by aircraft/event)
Kit Management (reusable tool sets)
```

---

## 1. Master Inventory Management

**Location:** `components/InventoryManager.tsx` (920 lines)

### Purpose
Central database of all tools owned by the facility, with full CRUD operations and calibration tracking.

### Capabilities

#### 1.1 View Inventory
- **Display:** Paginated table view (10 items per page)
- **Columns:** Part #, Description, Manufacturer, Serial #, Category, Calibration Status, Due Date
- **Search:** Real-time filter by any field
- **Sorting:** Click column headers to sort
- **Status Indicators:**
  - ✅ Current (green) - Calibration valid
  - ⚠️ Due Soon (yellow) - <30 days until due
  - ❌ Overdue (red) - Past calibration date
  - N/A (gray) - No calibration required

#### 1.2 Add New Tools
**Trigger:** "Add New Tool" button

**Form Fields:**
- Part Number (required)
- Description (required)
- Manufacturer (optional)
- Serial Number (optional)
- Category (dropdown: Jacking & Lifting, Avionics Test, Engine, Airframe, etc.)
- Calibration Required (checkbox)
- Calibration Due Date (date picker, conditional on calibration required)

**Validation:**
- Part number uniqueness check
- Required field enforcement
- Date validation (cannot be in past for new calibrations)

**Action:** Saves to master inventory → localStorage auto-save (1s debounce)

#### 1.3 Edit Existing Tools
**Trigger:** "Edit" button on inventory row

**Behavior:**
- Opens same form as "Add New Tool"
- Pre-populated with existing values
- Can modify all fields except part number (identifier)
- Auto-save on submit

#### 1.4 Delete Tools
**Trigger:** "Delete" button on inventory row

**Behavior:**
- Confirmation dialog: "Are you sure you want to delete [Tool Name]?"
- Permanent removal from inventory
- No cascade deletion (comparisons retain references but mark as deleted)

#### 1.5 Bulk Import (CSV)
**See:** [Section 10 - CSV Import/Export](#10-csv-importexport)

#### 1.6 Export Inventory
**Trigger:** "Export as CSV" button

**Output:**
- CSV file download
- Columns: Part Number, Description, Manufacturer, Serial Number, Category, Calibration Required, Calibration Due Date
- Filename: `master-inventory-YYYY-MM-DD.csv`

### Data Storage
**localStorage key:** `toolInventoryMaster`
**Format:** JSON array of Tool objects
**Auto-save:** 1-second debounce after any change

### Pre-loaded Data
**Source:** `constants.ts` - 100+ specialized aviation tools
**Categories:**
- Jacking & Lifting Equipment (23 items)
- Avionics Test Equipment (18 items)
- Engine Maintenance Tools (22 items)
- Airframe & Rigging Tools (15 items)
- Composite & NDT Equipment (12 items)
- And 5 more categories

### User Workflows

#### Workflow: Add Calibrated Tool
1. Click "Add New Tool"
2. Enter Part #: `TW-500`, Description: `Digital Torque Wrench 0-500 ft-lb`
3. Select Manufacturer: `CDI Torque Products`
4. Enter Serial #: `TW-2024-001`
5. Select Category: `Engine Maintenance`
6. Check "Requires Calibration"
7. Set Due Date: 6 months from today
8. Click "Save"
9. Tool appears in inventory with "Current" status

#### Workflow: Track Calibration Expiry
1. System checks all tools daily (on load)
2. Tools with calibration <30 days show yellow "Due Soon"
3. Tools past due date show red "Overdue"
4. Use search: "overdue" to filter
5. Edit tool → update calibration date → status updates

---

## 2. Tool Comparison System

**Location:** `App.tsx` - `handleCompare()` function

### Purpose
Core feature that compares "Needed Tools" list against "Master Inventory" and "On Order" items to identify Available, On Order, and Shortage items, with AI-powered substitution suggestions.

### Capabilities

#### 2.1 Comparison Algorithm

**Inputs:**
1. Needed Tools List (user-created)
2. Master Inventory (from Inventory Manager)
3. On Order Tools (from Purchase Manager)

**Outputs:**
1. **Available:** Tools found in master inventory
2. **On Order:** Tools found in purchase pipeline
3. **Shortage:** Tools not available anywhere
4. **Substitution Suggestions:** AI-recommended alternatives for shortages

#### 2.2 Matching Logic

**Primary Match:** Part Number
- Exact match: `TW-500` = `TW-500`
- Case-insensitive: `tw-500` = `TW-500`

**AI-Enhanced Matching:**
When list >250 tools, AI filters to most relevant subset before matching to reduce processing.

#### 2.3 Substitution AI

**Trigger:** Shortage items detected
**Model:** Gemini 2.5 Flash
**Inputs:**
- Shortage item details (part #, description, manufacturer)
- Full master inventory (or filtered subset if >250 items)

**AI Analysis:**
```
"Analyze this shortage item and suggest substitutions from available inventory based on:
- Part number similarity (e.g., TW-500 vs TW-600)
- Same manufacturer and tool type
- Functional equivalence (e.g., 0-500 ft-lb vs 0-600 ft-lb torque wrench)
- Category match

Provide confidence level: High (>90% compatible), Medium (70-90%), Low (<70%)"
```

**Output Format:**
```typescript
{
  partNumber: "TW-600",
  description: "Digital Torque Wrench 0-600 ft-lb",
  reason: "Same manufacturer, overlapping range, higher capacity suitable",
  confidence: "High"
}
```

**Limitations:**
- Max 5 suggestions per shortage item
- Only suggests from available inventory (not from other shortages)
- Requires valid Gemini API key

#### 2.4 Comparison Results Display

**Available Section (Green)**
- Checkmark icon
- Part #, Description, Manufacturer
- Quantity available (from inventory)
- Serial numbers (if applicable)

**On Order Section (Yellow)**
- Clock icon
- Part #, Description, Manufacturer
- Expected delivery date
- Supplier information

**Shortage Section (Red)**
- Alert icon
- Part #, Description, Manufacturer
- "Find Sourcing" button → triggers AI sourcing
- Substitution suggestions (collapsible)
  - Part #, Description
  - Confidence badge (High/Medium/Low color-coded)
  - Reason for suggestion
  - "Use This" button → adds to needed list, removes shortage

### Data Flow
```
Needed Tools ──┐
               ├──> AI Filter (if >250 items) ──> Match Engine ──> Results
Master Inv  ───┤                                         │
On Order  ─────┘                                         │
                                                         v
Shortages ──> AI Substitution Engine ──> Suggestions ──> User Decision
```

### User Workflows

#### Workflow: Standard Comparison
1. Create "Needed Tools" list (via CSV import, manual entry, or AI prediction)
2. Click "Compare to Inventory"
3. View results:
   - 45 Available (green) ✓
   - 3 On Order (yellow) - arriving next week
   - 7 Shortages (red) - need action
4. Review shortage substitutions
5. Accept 2 substitutions (click "Use This")
6. 5 shortages remain → proceed to sourcing

#### Workflow: Large Inventory Comparison
1. Needed Tools: 350 items (major inspection)
2. Master Inventory: 450 items
3. Click "Compare"
4. AI filters master inventory to 200 most relevant
5. Comparison runs on filtered set
6. Results returned in <10 seconds
7. User reviews AI filtering in console (if needed)

---

## 3. AI-Powered Tool Prediction

**Location:** `components/PredictiveTooling.tsx`

### Purpose
Generate tool requirements from natural language maintenance job descriptions using AI, eliminating manual tool list creation.

### Capabilities

#### 3.1 Job Description Input
**Input Methods:**
1. Text area for typed/pasted descriptions
2. File upload (.txt, .pdf for maintenance manuals)
3. Pre-loaded examples (dropdown)

**Example Inputs:**
- "Perform 500-hour inspection on Citation X including engine and avionics checks"
- "Replace main landing gear hydraulic actuator on Boeing 737-800"
- "Annual inspection on Cessna 172 with propeller overhaul"

#### 3.2 AI Processing

**Model:** Gemini 2.5 Flash
**Temperature:** 0.3 (slightly creative but focused)

**Prompt Structure:**
```
You are an aviation maintenance expert. Based on this job description, predict the specific tools required:

[Job Description]

Return a JSON array of tools with:
- partNumber: Specific tool identifier (e.g., "TW-500", "JA-102")
- description: Detailed tool description
- manufacturer: Preferred manufacturer (if known)
- category: Tool category
- quantity: How many needed (usually 1)
- reason: Why this tool is needed for this job

Focus on specialized aviation tools, not common hand tools.
```

**AI Knowledge Base:**
- Aviation maintenance procedures
- Common tool requirements by aircraft type
- FAA/manufacturer maintenance manual conventions
- Tool naming conventions (Snap-on, CDI, Tronair, etc.)

#### 3.3 Results Review & Editing

**Display:**
- Table of predicted tools
- Columns: Part #, Description, Manufacturer, Category, Qty, Reason
- Edit icons for each field
- Delete button for incorrect predictions
- Add button for missing tools

**Actions:**
1. **Accept All** → Load to "Needed Tools" list
2. **Accept Selected** → Check boxes, load subset
3. **Edit & Accept** → Modify predictions, then load
4. **Discard** → Clear predictions, start over

#### 3.4 Confidence Indicators

**High Confidence (Green)**
- Tool exists in master inventory (AI learned from your data)
- Standard industry tool for this job type
- Specific part number provided

**Medium Confidence (Yellow)**
- Generic tool category predicted
- Description vague (e.g., "torque wrench" without range)
- Manufacturer unknown

**Low Confidence (Red)**
- Uncommon tool for this job
- AI hedging (e.g., "possibly needed")
- No part number available

### User Workflows

#### Workflow: Quick Prediction
1. Navigate to "Predictive Tooling"
2. Select example: "Citation X 500-hour inspection"
3. Click "Predict Tools"
4. AI returns 23 tools in 3 seconds
5. Review list:
   - 18 high confidence (green)
   - 4 medium confidence (yellow)
   - 1 low confidence (red)
6. Edit 2 tools (correct part numbers)
7. Delete 1 low-confidence tool
8. Click "Accept All"
9. 22 tools loaded to "Needed Tools" list
10. Proceed to comparison

#### Workflow: Custom Job
1. Paste maintenance work order:
   ```
   WO #4521: Replace APU starter motor on Gulfstream G650
   Task includes removal of APU access panels, electrical
   disconnect, starter motor removal, installation of new unit,
   and ground run test.
   ```
2. Click "Predict Tools"
3. AI analyzes and returns:
   - APU access panel removal tools
   - Electrical disconnect equipment
   - Starter motor handling equipment
   - Torque wrenches (specific ranges)
   - Safety equipment
   - Ground test equipment
4. User adds facility-specific tool (custom test harness)
5. Accept all → proceed to comparison

---

## 4. Aircraft Data Hub

**Location:** `components/DataHub.tsx`

### Purpose
Organize tool lists, comparisons, and reports by aircraft registration and maintenance event, providing historical tracking and easy retrieval.

### Capabilities

#### 4.1 Aircraft Management

**Add Aircraft:**
- Registration number (e.g., "N123AB", "G-ABCD")
- Aircraft type (e.g., "Citation X", "Boeing 737-800")
- Optional: Serial number, operator

**View Aircraft:**
- List of all aircraft in system
- Expand/collapse to view events
- Quick stats: Total events, last activity date

#### 4.2 Maintenance Event Tracking

**Event Structure:**
```typescript
{
  eventName: string;           // "500-hour inspection", "Annual"
  eventDate: string;           // "2025-01-15"
  neededTools: Tool[];         // Original needed list
  comparisonResults?: ComparisonResult;  // If comparison run
  reports?: Report[];          // Generated reports
  notes?: string;              // User notes
  createdAt: string;           // Timestamp
  updatedAt: string;           // Last modified
}
```

**Create Event:**
1. Select aircraft
2. Click "Add Event"
3. Enter event name and date
4. Option: Load needed tools from CSV, AI prediction, or kit
5. Option: Run comparison immediately
6. Save event

#### 4.3 Data Organization

**Hierarchy:**
```
Aircraft Registration (N123AB)
└── Maintenance Event (500-Hour Inspection - 2025-01-15)
    ├── Needed Tools List (45 items)
    ├── Comparison Results
    │   ├── Available (38 items)
    │   ├── On Order (2 items)
    │   └── Shortage (5 items)
    ├── Sourcing Information (for 5 shortages)
    └── Reports
        ├── Quick Report (PDF)
        └── Full Report with Sourcing (PDF)
```

#### 4.4 Historical Tracking

**Benefits:**
- See what tools were needed for past inspections
- Reuse tool lists for recurring maintenance
- Track patterns (always short on same tools?)
- Audit trail for quality assurance

**Features:**
- Timeline view of events
- Search across all aircraft/events
- Filter by date range, event type
- Export historical data

#### 4.5 Quick Actions

**From Event View:**
- "Reuse This List" → Copy needed tools to new event
- "Compare Again" → Re-run comparison with current inventory
- "Generate Report" → Create PDF from saved data
- "Edit Event" → Modify details, add notes
- "Delete Event" → Remove from history

### User Workflows

#### Workflow: Track Annual Inspection
1. Navigate to Data Hub
2. Click "Add Aircraft"
3. Enter Registration: "N525AB", Type: "Citation X"
4. Click "Add Event"
5. Event Name: "Annual Inspection 2025", Date: "2025-03-01"
6. Load needed tools via AI prediction
7. Run comparison → 3 shortages identified
8. Generate sourcing for shortages
9. Save event with all data
10. 6 months later: Review this event to plan next annual

#### Workflow: Multi-Aircraft Fleet
1. Add 5 aircraft to Data Hub
2. Each has multiple events (annuals, 100-hour, etc.)
3. Notice pattern: All Cessna 172s need same tools for annual
4. Create "C172 Annual Kit" from one event
5. Use kit for future C172 annuals
6. Time savings: 30 min → 2 min per event

---

## 5. Purchase Management

**Location:** `components/PurchasingManager.tsx`

### Purpose
Track tools on order from vendors, manage purchase pipeline, and integrate with comparison results to show "On Order" status.

### Capabilities

#### 5.1 Purchase Order Tracking

**Add Purchase:**
- Tool details (part #, description, manufacturer)
- Vendor/supplier name
- Order date
- Expected delivery date
- Quantity ordered
- Unit price & total price
- PO number (optional)
- Notes (optional)
- Applicable aircraft (links to Data Hub)

**View Purchases:**
- Table view with all active orders
- Columns: Tool, Vendor, Order Date, Expected Delivery, Status
- Status badges:
  - 🟡 Ordered (awaiting shipment)
  - 🔵 Shipped (in transit)
  - 🟢 Delivered (received, pending stock-in)
  - ✅ Received (in inventory)
  - 🔴 Cancelled

#### 5.2 Purchase Stages

**Stage Progression:**
1. **Ordered** → Vendor confirmed order
2. **Shipped** → Tracking number received
3. **Delivered** → Item arrived at facility
4. **Received** → Inspected, added to master inventory
5. **Cancelled** → Order terminated

**Auto-advancement:**
- If expected delivery date passes, prompt to update status
- On "Received" status, prompt to add to master inventory

#### 5.3 Integration with Comparison

**Behavior:**
- Tools marked "Ordered", "Shipped", or "Delivered" show in comparison as "On Order"
- Tools marked "Received" are removed from purchase list
- Expected delivery date shown in comparison results

#### 5.4 Purchase Plans

**Pre-loaded Data:** `purchasingPlanData.ts`
- Multi-item purchase plans
- Aircraft applicability (e.g., "G650 APU Tooling Package")
- Bulk pricing
- Approval workflow stages

**Features:**
- View recommended purchase plans
- Approve/reject items
- Track approval status
- Generate purchase requisitions

#### 5.5 Sourcing Integration

**Workflow:**
- Shortage identified in comparison
- Run AI sourcing → get pricing/vendors
- Click "Add to Purchase Plan"
- Auto-populates: tool details, vendor, pricing
- User adds: PO #, expected delivery
- Submit → added to purchase tracking

### User Workflows

#### Workflow: Track Tool Order
1. Comparison identified shortage: "Hydraulic Jack 25-ton"
2. Run AI sourcing → finds vendor "Aircraft Tool Supply" for $8,500
3. Click "Add to Purchase Plan"
4. Form auto-filled with tool + vendor + price
5. Add PO #: "PO-2025-0142"
6. Expected delivery: 2 weeks from today
7. Submit order
8. Order appears in Purchase Manager as "Ordered"
9. 2 weeks later: Status → "Delivered"
10. Inspect tool, Status → "Received"
11. Prompt: "Add to Master Inventory?" → Yes
12. Tool now in inventory, order archived

#### Workflow: Bulk Purchase Plan
1. Open Purchase Manager
2. View "G650 APU Tooling Package" plan (12 items, $45,000 total)
3. Review each item:
   - 8 items approved (green)
   - 2 items pending review (yellow)
   - 2 items rejected (red) - already have
4. Approve 2 pending items
5. Generate purchase requisition PDF
6. Submit to procurement dept
7. When approved, mark as "Ordered"
8. Track 10 items through delivery

---

## 6. AI Sourcing Engine

**Location:** `services/geminiService.ts` - `findToolSourcing()` function

### Purpose
Automatically discover pricing, vendors, purchase links, and rental options for shortage tools using Google Search integration with Gemini AI.

### Capabilities

#### 6.1 Sourcing Search

**Trigger:**
- Manual: "Find Sourcing" button on shortage item
- Bulk: "Generate Full Report" (sources all shortages)

**Search Process:**
1. AI constructs optimized Google search query
2. Google Search (via Gemini grounding) returns top results
3. AI parses results for relevant information
4. Structures data into SourcingInfo object

**Search Query Construction:**
```
Tool: "Digital Torque Wrench 0-500 ft-lb, CDI Model TW-500"

Generated Query:
"CDI TW-500 digital torque wrench 0-500 ft-lb aviation tool buy price"
+ site:tronair.com OR site:aircraftspruce.com OR site:skygeek.com OR site:mcmaster.com
```

**Targeted Vendors:**
- Aircraft Spruce & Specialty
- Tronair
- SkyGeek
- Snap-on Aviation
- CDI Torque Products
- McMaster-Carr
- MSC Industrial
- Grainger (for common tools)

#### 6.2 Information Extraction

**AI Parsing:**
Model: Gemini 2.5 Flash with Google Search Grounding
Temperature: 0.2 (very factual)

**Extracted Data:**
```typescript
interface SourcingInfo {
  estimatedPrice: string;      // "$8,500" or "$8,000 - $9,500"
  purchaseLink: string;        // Direct product URL
  availability: string;        // "In Stock", "2-3 weeks", "Made to Order"
  vendor: string;              // "Aircraft Tool Supply"
  rentalOption?: {
    available: boolean;
    price: string;             // "$450/week"
    rentalLink: string;
  };
  confidence: 'High' | 'Medium' | 'Low';
  lastUpdated: string;         // ISO timestamp
  notes?: string;              // "Price includes calibration cert"
}
```

**Confidence Levels:**
- **High:** Direct product page found, current pricing, verified vendor
- **Medium:** Generic category page, price range estimated, vendor confirmed
- **Low:** Limited results, price uncertain, vendor may not be specialized

#### 6.3 Rate Limiting

**Google Search Grounding Limit:** 1 request per 60 seconds

**Mitigation Strategies:**
1. **Caching:** Store sourcing results for 7 days
2. **Batch Processing:** Queue multiple shortages, process with delays
3. **Progress Indicators:** Show "Sourcing 3 of 7 tools..." status
4. **User Control:** "Skip Sourcing" option for quick reports
5. **Retry Logic:** Auto-retry failed requests (max 3 attempts)

**UI Feedback:**
```
⏳ Finding sourcing for 5 shortage items...
✅ Sourced 2 of 5 (next in 58 seconds...)
⏳ Sourcing 3 of 5...
✅ Sourced 5 of 5 (Complete!)
```

#### 6.4 Sourcing Display

**In Comparison Results:**
- Shortage item expanded view
- "Sourcing Information" section
- Price (with confidence badge)
- Vendor name (linked to purchase page)
- Availability status
- Rental option (if available)
- Last updated timestamp
- "Add to Purchase Plan" button

**In Reports:**
- Table format: Tool | Estimated Price | Vendor | Link | Availability
- Footer notes with confidence levels
- Disclaimer: "Prices are estimates and may vary"

### User Workflows

#### Workflow: Source Single Tool
1. Comparison shows 1 shortage: "APU Test Set Model XYZ-500"
2. Click "Find Sourcing"
3. Progress: "Searching for pricing and vendors..."
4. 5 seconds later: Results appear
   - Price: $12,500 - $15,000
   - Vendor: SkyGeek (link)
   - Availability: In Stock
   - Rental: Available at $850/week (link)
   - Confidence: High
5. User clicks vendor link → opens product page
6. Verifies pricing, clicks "Add to Purchase Plan"
7. Order processed

#### Workflow: Bulk Sourcing for Report
1. Comparison shows 7 shortages
2. Click "Generate Full Report"
3. Progress bar: "Sourcing 1 of 7..."
4. Wait 60s between each (rate limit)
5. After 7 minutes: All sourced
6. Report generated with complete sourcing data
7. PDF includes all pricing, vendors, links
8. Share with procurement team

---

## 7. Kit Management

**Location:** `components/KitsManager.tsx`

### Purpose
Create and manage reusable tool sets for common maintenance jobs, enabling one-click loading of frequently-used tool combinations.

### Capabilities

#### 7.1 Create Kits

**From Existing Tool List:**
1. Have needed tools list (manual, CSV, or AI-predicted)
2. Click "Save as Kit"
3. Enter kit name: "C172 Annual Inspection Kit"
4. Optional: Description, notes
5. Save kit

**Manual Kit Creation:**
1. Click "Create New Kit"
2. Enter kit name and description
3. Add tools:
   - Search master inventory
   - Check boxes to include
   - Or manually enter tool details
4. Set quantities per tool
5. Save kit

#### 7.2 Kit Structure

```typescript
interface Kit {
  id: string;
  name: string;
  description?: string;
  tools: Tool[];              // Array of tools with quantities
  category?: string;          // "Annual Inspections", "Engine Work", etc.
  applicableAircraft?: string[];  // ["C172", "C182"]
  createdDate: string;
  lastUsed?: string;
  usageCount: number;         // Track how often used
}
```

#### 7.3 Use Kits

**Load Kit to Needed Tools:**
1. Select aircraft or start new comparison
2. Click "Load from Kit"
3. Select kit from dropdown (or search)
4. Preview tools in kit
5. Options:
   - Load all tools
   - Select subset
   - Adjust quantities
6. Confirm → tools added to needed list

**Modify on Load:**
- Add extra tools for this specific job
- Remove inapplicable tools
- Change quantities
- Original kit unchanged

#### 7.4 Kit Management

**View All Kits:**
- Table view: Kit Name, Tool Count, Last Used, Usage Count
- Search/filter by name, category, aircraft
- Sort by usage (most popular), date (newest)

**Edit Kits:**
- Add/remove tools
- Update descriptions
- Modify quantities
- Rename kit

**Delete Kits:**
- Confirmation dialog
- Does not affect saved events that used the kit

**Duplicate Kits:**
- "Save As" function
- Start from existing kit
- Modify for variant (e.g., "C172 Annual with Prop Overhaul")

#### 7.5 Pre-loaded Kits

**Examples:**
- "Cessna 172 Annual Inspection" (23 tools)
- "Citation X 500-Hour Inspection" (45 tools)
- "Engine Run Test Equipment" (12 tools)
- "Avionics Panel Removal Tools" (8 tools)
- "Landing Gear Service Kit" (18 tools)

### User Workflows

#### Workflow: Create Kit from AI Prediction
1. Use AI Prediction for "Cessna 172 Annual"
2. AI returns 23 tools
3. Review and edit (correct 2 part numbers)
4. Click "Save as Kit"
5. Name: "C172 Annual Inspection Kit"
6. Description: "Standard tools for C172 annual, does not include prop tools"
7. Save kit
8. Now reusable for all C172 annuals

#### Workflow: Use Kit for Recurring Maintenance
1. Planning next month's C172 annual
2. Create event in Data Hub: "N12345 Annual - March 2025"
3. Click "Load from Kit"
4. Select "C172 Annual Inspection Kit"
5. 23 tools loaded instantly (vs 20 min manual entry)
6. This job includes prop overhaul, add 5 extra tools
7. Total: 28 tools
8. Run comparison → identify shortages
9. Time saved: 18 minutes

---

## 8. Report Generation

**Location:** `components/PDFReport.tsx`

### Purpose
Generate professional PDF reports summarizing tool requirements, availability, shortages, and sourcing information for maintenance planning and procurement.

### Capabilities

#### 8.1 Report Types

**Quick Report (No Sourcing)**
- Fast generation (<5 seconds)
- No AI sourcing calls
- Shows: Available, On Order, Shortage (without pricing)
- Use case: Internal planning, quick status

**Full Report (With AI Sourcing)**
- Includes complete sourcing data for all shortages
- Slower generation (depends on shortage count + rate limits)
- Shows: Available, On Order, Shortage with pricing/vendors/links
- Use case: Procurement requests, purchase approvals

#### 8.2 Report Structure

**Header Section:**
- Report title (customizable)
- Aircraft registration and type (if applicable)
- Maintenance event name and date
- Report generated date/time
- Generated by (user/facility name)

**Summary Statistics:**
- Total tools needed: X
- Available: X (Y%)
- On Order: X (Y%)
- Shortage: X (Y%)

**Available Tools Section:**
- Table: Part #, Description, Manufacturer, Serial #, Location
- Grouped by category (optional)
- Notes: Calibration due dates for applicable tools

**On Order Section:**
- Table: Part #, Description, Vendor, Expected Delivery
- Status indicators
- Total value of pending orders (if pricing available)

**Shortage Section (Without Sourcing):**
- Table: Part #, Description, Manufacturer
- Substitution suggestions (if available)
- Blank columns for: Estimated Price, Vendor (to be filled manually)

**Shortage Section (With AI Sourcing):**
- Table: Part #, Description, Estimated Price, Vendor, Purchase Link, Availability
- Rental options (if available)
- Confidence indicators
- Total estimated cost
- Hyperlinks to vendor pages
- Disclaimer: "Prices are estimates based on recent data and may vary"

**Footer:**
- Page numbers
- Facility logo/branding (optional)
- Report ID (unique identifier)

#### 8.3 Customization Options

**Report Settings:**
- Include/exclude sections
- Logo upload
- Header/footer text
- Color scheme (professional, minimal, branded)
- Paper size (US Letter, A4)

**Sorting Options:**
- Alphabetical by part number
- By category
- By price (descending)
- By availability

**Filtering:**
- Show only shortages
- Show only items >$X value
- Exclude items already approved for purchase

#### 8.4 Export Formats

**PDF (Primary):**
- Print-ready formatting
- Clickable hyperlinks
- Professional styling
- Filename: `Tool-Report-[Aircraft]-[Date].pdf`

**CSV (Data Export):**
- Raw data for Excel analysis
- All sections in separate sheets (if multi-sheet supported)
- Includes sourcing URLs

#### 8.5 Report Caching

**Purpose:** Avoid re-sourcing for unchanged shortage lists

**Behavior:**
- First report with sourcing: AI calls made, results cached
- Regenerate report (same shortage list): Uses cached sourcing
- Cache expiry: 7 days
- Manual cache clear: "Refresh Sourcing" button

### User Workflows

#### Workflow: Generate Quick Report
1. Complete comparison (45 available, 3 on order, 5 shortage)
2. Click "Generate Report"
3. Select "Quick Report (No Sourcing)"
4. Customize: Add logo, set header "N123AB - 500 Hour Inspection"
5. Click "Generate"
6. 3 seconds later: PDF download
7. Open PDF: 2-page report with all sections
8. Print for tech team meeting

#### Workflow: Generate Full Sourcing Report
1. Comparison shows 7 shortages
2. Click "Generate Full Report"
3. Warning: "This will make 7 AI sourcing calls (~7 minutes)"
4. Confirm
5. Progress bar shows sourcing status
6. 7 minutes later: Report ready
7. PDF includes:
   - All 7 shortages with pricing ($45,000 total estimated)
   - Vendor links
   - 3 rental options available
8. Email report to procurement manager
9. Procurement uses hyperlinks to purchase tools

---

## 9. Maintenance Task Analysis

**Location:** Part of `services/geminiService.ts`

### Purpose
Break down complex maintenance events into individual tasks and map specific tools to each task, providing granular planning.

### Capabilities

#### 9.1 Task Breakdown

**Input:** Maintenance event description
**Model:** Gemini 2.5 Pro (more capable for complex analysis)
**Output:** Structured task list with tool assignments

**Example Input:**
```
Event: "Citation X 500-Hour Inspection"
Description: "Includes airframe inspection, engine runs, avionics checks,
landing gear swing, flight control rigging verification"
```

**AI Analysis:**
```
Analyze this maintenance event and break it into individual tasks.
For each task, identify:
1. Task name and description
2. Estimated duration
3. Required tools (be specific with part numbers if known)
4. Prerequisites (what must be done first)
5. Skill level required (A&P, IA, specialized)

Return structured JSON.
```

**Example Output:**
```typescript
[
  {
    taskName: "Airframe Inspection - Fuselage",
    duration: "4 hours",
    tools: ["Borescope Model BS-200", "NDT Eddy Current Tester", "Calipers 0-6 inch"],
    prerequisites: ["Aircraft jacked and secured"],
    skillLevel: "A&P with NDT cert"
  },
  {
    taskName: "Engine Ground Run Test",
    duration: "2 hours",
    tools: ["Engine Analyzer EA-500", "Tachometer Digital DT-100", "Temperature Probe Set"],
    prerequisites: ["Airframe inspection complete", "Fire safety equipment staged"],
    skillLevel: "A&P with powerplant rating"
  },
  // ... more tasks
]
```

#### 9.2 Tool-to-Task Mapping

**Benefits:**
- Understand why each tool is needed
- Identify tools for subcontractors (e.g., NDT specialist)
- Optimize tool staging (which tools needed first)
- Estimate labor alongside tool requirements

**Display:**
- Expandable accordion view
- Each task shows:
  - Task name
  - Duration
  - Tool list (with links to inventory)
  - Prerequisites
- Total duration calculation
- Critical path highlighting

#### 9.3 Scheduling Integration

**Use Case:** Create work schedule from task analysis

**Workflow:**
1. AI breaks down "500-hour inspection" into 12 tasks
2. Each task has duration and prerequisites
3. System suggests optimal sequence:
   - Tasks 1-3: Day 1 (parallel, different areas)
   - Task 4: Day 2 (requires Task 1 completion)
   - Tasks 5-7: Day 2 (parallel)
   - Etc.
4. Tool staging plan:
   - Day 1 tools: [List]
   - Day 2 tools: [List]
5. Export to calendar/scheduling system

### User Workflows

#### Workflow: Plan Complex Inspection
1. Create event: "G650 12-Month Inspection"
2. Input description from maintenance manual
3. Click "Analyze Tasks"
4. AI (Gemini Pro) processes (15 seconds)
5. Returns 15 tasks with tool mappings
6. Review task breakdown:
   - Task 3 needs "APU Borescope Adapter" (shortage)
   - Task 8 needs "Hydraulic Pressure Test Set" (available)
7. Prioritize shortage for immediate sourcing
8. Use task order to stage tools efficiently
9. Share task list with maintenance team

---

## 10. CSV Import/Export

**Location:** `components/InventoryManager.tsx` (CSV import modal)

### Purpose
Bulk import tool lists from existing spreadsheets using AI-powered intelligent parsing, and export data for external use.

### Capabilities

#### 10.1 CSV Import (AI-Powered)

**Trigger:** "Import from CSV" button in Inventory Manager or Needed Tools

**Upload Process:**
1. User selects CSV file
2. File parsed to detect columns
3. AI analyzes headers and data
4. AI maps columns to expected fields
5. User confirms/adjusts mapping
6. Data imported with transformations

**AI Column Mapping:**
**Model:** Gemini 2.5 Flash
**Input:** CSV headers + sample rows

**Prompt:**
```
Analyze this CSV and map columns to our tool data model:
- Part Number (required)
- Description (required)
- Manufacturer
- Serial Number
- Category
- Calibration Required (boolean)
- Calibration Due Date

CSV Headers: [list of headers]
Sample Rows: [3-5 rows of data]

Return JSON mapping: {"csv_column": "our_field"}
Provide confidence level for each mapping.
```

**AI Capabilities:**
- Flexible header recognition (e.g., "Part #" = "Part Number" = "PN" = "Item Number")
- Data type inference (dates, booleans, categories)
- Category mapping (maps "Avionics" → "Avionics Test Equipment")
- Calibration detection (infers calibration required from due date presence)
- Serial number pattern detection
- Manufacturer normalization (e.g., "CDI" → "CDI Torque Products")

**Example Mapping:**
```csv
PN,Tool Name,Mfr,SN,Cal Due
TW-500,Torque Wrench 0-500,CDI,TW2024001,2025-06-01
```

**AI Output:**
```json
{
  "PN": "partNumber",
  "Tool Name": "description",
  "Mfr": "manufacturer",
  "SN": "serialNumber",
  "Cal Due": "calibrationDueDate",
  "_inferred_calibrationRequired": true
}
```

#### 10.2 Data Cleaning

**AI-Performed:**
- Trim whitespace
- Remove duplicate entries (by serial number or part number)
- Standardize date formats (MM/DD/YYYY, YYYY-MM-DD, etc. → ISO)
- Fix common typos in manufacturer names
- Normalize categories
- Remove empty rows
- Validate part numbers (flag unusual patterns)

**User Review:**
- Preview table shows cleaned data
- Warnings for duplicates (with choice to skip or merge)
- Errors for required fields missing
- Suggestions for ambiguous mappings

#### 10.3 Import Modes

**Add to Existing:**
- Append to master inventory
- Skip duplicates
- Merge if serial # matches (update fields)

**Replace Inventory:**
- Clear existing master inventory
- Import as new dataset
- Confirmation dialog (dangerous!)

**Import to Needed Tools:**
- Create new needed tools list
- Does not affect master inventory
- Ready for comparison

#### 10.4 CSV Export

**Export Master Inventory:**
- All tools in inventory → CSV
- Headers: Part Number, Description, Manufacturer, Serial Number, Category, Calibration Required, Calibration Due Date
- Filename: `master-inventory-YYYY-MM-DD.csv`

**Export Comparison Results:**
- Separate files for Available, On Order, Shortage
- Or single file with "Status" column
- Includes sourcing info if available

**Export Aircraft Data:**
- All events for selected aircraft
- Nested structure flattened (Aircraft | Event | Tool | Status)
- Useful for historical analysis in Excel

### User Workflows

#### Workflow: Import Existing Tool List
1. Facility has Excel spreadsheet with 200 tools (legacy system)
2. Save as CSV: `legacy-tools.csv`
3. Click "Import from CSV" in Inventory Manager
4. Upload file
5. AI analyzes: "Found 200 rows, 7 columns detected"
6. AI mapping:
   - "Item #" → Part Number (High confidence)
   - "Name" → Description (High confidence)
   - "Brand" → Manufacturer (Medium confidence)
   - "Cal. Due" → Calibration Due Date (High confidence)
7. User confirms mapping
8. AI cleans data:
   - 3 duplicates found (same serial #) → User chooses "Keep newest"
   - 12 dates reformatted to ISO standard
   - 5 manufacturer names normalized ("Snap-On" → "Snap-on")
9. Preview: 197 tools ready (3 duplicates removed)
10. Confirm import
11. Success: 197 tools added to master inventory

#### Workflow: Export for Procurement
1. Complete comparison with sourcing
2. 7 shortages with pricing/vendors
3. Click "Export Shortage List"
4. CSV downloads: `shortage-list-2025-01-15.csv`
5. Open in Excel:
   - Part #, Description, Estimated Price, Vendor, Purchase Link
6. Add columns: PO #, Approval Status
7. Circulate for approval
8. Import approved items to Purchase Manager

---

## Feature Dependencies

### Dependency Map
```
Master Inventory (foundation)
├── Tool Comparison (requires inventory)
│   ├── Substitution AI (requires comparison results)
│   └── AI Sourcing (requires shortage identification)
│       └── Purchase Tracking (requires sourcing)
│           └── Reports (requires all data)
│
├── AI Prediction (creates needed tools)
│   └── Tool Comparison (uses predicted tools)
│
├── Kits (uses inventory tools)
│   └── Needed Tools (loads from kits)
│
└── Aircraft Data Hub (organizes all features)
    └── Historical Analysis (requires saved events)

CSV Import/Export (supports all features)
```

### Standalone Features
- CSV Import/Export (can work without other features)
- AI Prediction (only needs API key)
- Kit Management (minimal dependency on inventory)

### Critical Path Features
Cannot use application without:
1. Master Inventory (or CSV import to create it)
2. Gemini API key (for AI features)

---

## Next Steps
- [Technical Architecture](./03-TECHNICAL-ARCHITECTURE.md) - How features are implemented
- [Data Models](./04-DATA-MODELS.md) - Data structures behind features
- [AI Integration](./05-AI-INTEGRATION.md) - How AI powers these features
