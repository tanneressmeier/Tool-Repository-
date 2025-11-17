# Data Models

> **Last Updated:** 2025-11-17

## Table of Contents
- [Overview](#overview)
- [Core Entities](#core-entities)
- [Relationship Diagram](#relationship-diagram)
- [Type Definitions](#type-definitions)
- [Data Validation](#data-validation)
- [Storage Schema](#storage-schema)
- [Migration Strategy](#migration-strategy)

## Overview

All data models are defined in `types.ts` using TypeScript interfaces. The application uses **localStorage** for persistence, serializing all data to JSON.

### Design Principles

1. **Type Safety:** All data structures strongly typed with TypeScript
2. **Immutability:** Data updated via immutable operations (spread, map, filter)
3. **Nullable Fields:** Optional fields use `?` to allow gradual data entry
4. **Unique IDs:** All entities have unique `id` field (UUID v4)
5. **Timestamps:** Creation/modification tracked with ISO 8601 strings
6. **Enums:** Status fields use string literal unions for type safety

## Core Entities

### Entity Overview

```
Tool (base entity)
  ├─> Master Inventory
  ├─> Needed Tools List
  ├─> On Order Items
  └─> Kit Contents

ComparisonResult (operation result)
  ├─> Available Tools
  ├─> On Order Tools
  ├─> Shortage Tools
  └─> Suggested Substitutions

AircraftData (organizational container)
  ├─> SavedToolList[]
  └─> SavedComparison[]

Kit (reusable template)
  └─> Tool[]

PurchasePlanItem (procurement)
```

## Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        AircraftData                              │
│  (N123AB - Citation X)                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SavedToolList (500-Hour Inspection)                      │  │
│  │  - tools: Tool[]                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SavedComparison                                          │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ ComparisonResult                                     │ │  │
│  │  │  - available: Tool[] ◄──────────┐                   │ │  │
│  │  │  - onOrder: Tool[]              │                   │ │  │
│  │  │  - shortage: Tool[]             │ Match             │ │  │
│  │  │  - suggestedSubstitutions[]     │ Against           │ │  │
│  │  └─────────────────────────────────┘                   │ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Master Inventory     │
                    │  Tool[]               │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  SourcingInfo         │
                    │  (for shortage items) │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  PurchasePlanItem     │
                    │  (order tools)        │
                    └───────────────────────┘
```

## Type Definitions

### Tool

**Source:** `types.ts:1-13`

The fundamental entity representing a physical tool or piece of equipment.

```typescript
export interface Tool {
  toolId?: string;                  // Unique identifier (UUID v4)
  name: string;                     // Display name (e.g., "Digital Torque Wrench")
  description?: string;             // Detailed description
  manufacturer: string;             // Manufacturer name (e.g., "CDI Torque Products")
  model?: string;                   // Model number (e.g., "TW-500")
  partNumber: string;               // Part/SKU number (primary identifier)
  serialNumber: string;             // Unique serial number (for tracking specific units)
  calibrationStatus?: string;       // "Current", "Due Soon", "Overdue", "N/A"
  calibrationDueDays?: number;      // Days until calibration due (negative if overdue)
  location?: string;                // Physical location (e.g., "Tool Crib A", "Shelf 3")
  category?: string;                // Tool category (see Categories below)
}
```

**Field Details:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `toolId` | string | No | UUID v4 identifier | `"550e8400-e29b-41d4-a716-446655440000"` |
| `name` | string | **Yes** | Human-readable name | `"Digital Torque Wrench 0-500 ft-lb"` |
| `description` | string | No | Additional details | `"Calibrated digital torque wrench with memory"` |
| `manufacturer` | string | **Yes** | Manufacturer name | `"CDI Torque Products"` |
| `model` | string | No | Model number | `"TW-500"` |
| `partNumber` | string | **Yes** | Part/SKU number | `"CDI-2503LDIN"` |
| `serialNumber` | string | **Yes** | Unique serial # | `"TW-2024-001"` |
| `calibrationStatus` | string | No | Status indicator | `"Current"`, `"Overdue"` |
| `calibrationDueDays` | number | No | Days until due | `45` (due in 45 days), `-10` (10 days overdue) |
| `location` | string | No | Storage location | `"Tool Crib A, Shelf 3"` |
| `category` | string | No | Category name | `"Engine Maintenance"` |

**Categories:**
- Jacking & Lifting Equipment
- Avionics Test Equipment
- Engine Maintenance Tools
- Airframe & Rigging Tools
- Composite & NDT Equipment
- Hydraulic & Pneumatic Tools
- Electrical & Wiring Tools
- General Hand Tools
- Safety & PPE Equipment
- Specialized Tooling

**Calibration Status Values:**
- `"Current"` - Calibration valid (green indicator)
- `"Due Soon"` - <30 days until due (yellow indicator)
- `"Overdue"` - Past due date (red indicator)
- `"N/A"` - No calibration required (gray indicator)

**Usage Examples:**

```typescript
// Simple hand tool (no calibration)
const hammer: Tool = {
  toolId: crypto.randomUUID(),
  name: "Ball Peen Hammer 32oz",
  manufacturer: "Snap-on",
  partNumber: "HBFE32",
  serialNumber: "N/A",
  category: "General Hand Tools"
};

// Calibrated test equipment
const torqueWrench: Tool = {
  toolId: crypto.randomUUID(),
  name: "Digital Torque Wrench 0-500 ft-lb",
  description: "High-precision digital torque wrench with LED display",
  manufacturer: "CDI Torque Products",
  model: "TW-500",
  partNumber: "CDI-2503LDIN",
  serialNumber: "TW-2024-001",
  calibrationStatus: "Current",
  calibrationDueDays: 45,
  location: "Tool Crib A, Shelf 3",
  category: "Engine Maintenance"
};
```

---

### ComparisonResult

**Source:** `types.ts:22-27`

Result of comparing needed tools against master inventory and purchase orders.

```typescript
export interface ComparisonResult {
  available: Tool[];                             // Tools found in master inventory
  onOrder: Tool[];                               // Tools in purchase pipeline
  shortage: Tool[];                              // Tools not available anywhere
  suggestedSubstitutions?: SuggestedSubstitution[];  // AI-recommended alternatives
}
```

**Field Details:**

| Field | Type | Description |
|-------|------|-------------|
| `available` | Tool[] | Tools found in master inventory (ready to use) |
| `onOrder` | Tool[] | Tools currently on order (expected arrival tracked separately) |
| `shortage` | Tool[] | Tools not available and not on order (need action) |
| `suggestedSubstitutions` | SuggestedSubstitution[] | AI-recommended alternatives for shortage items |

**Example:**

```typescript
const comparisonResult: ComparisonResult = {
  available: [
    { name: "Torque Wrench 0-500 ft-lb", partNumber: "TW-500", ... },
    { name: "Hydraulic Jack 25-ton", partNumber: "HJ-25", ... }
  ],
  onOrder: [
    { name: "APU Test Set", partNumber: "APU-TS-100", ... }
  ],
  shortage: [
    { name: "Borescope Adapter", partNumber: "BS-ADAPT-G650", ... }
  ],
  suggestedSubstitutions: [
    {
      neededTool: { name: "Borescope Adapter", partNumber: "BS-ADAPT-G650", ... },
      suggestedTool: { name: "Universal Borescope Adapter", partNumber: "BS-ADAPT-UNIV", ... },
      confidence: "Medium",
      reason: "Compatible with G650, may require additional fittings"
    }
  ]
};
```

---

### SuggestedSubstitution

**Source:** `types.ts:15-20`

AI-generated recommendation for alternative tool when exact match is unavailable.

```typescript
export interface SuggestedSubstitution {
  neededTool: Tool;                    // Original shortage item
  suggestedTool: Tool;                 // Recommended alternative from inventory
  confidence: 'High' | 'Medium' | 'Low';  // AI confidence level
  reason: string;                      // Human-readable explanation
}
```

**Confidence Levels:**

| Level | Meaning | Example |
|-------|---------|---------|
| `High` | >90% compatible, same manufacturer/type | Same torque wrench, higher range (0-600 vs 0-500) |
| `Medium` | 70-90% compatible, functional equivalent | Different manufacturer, same specifications |
| `Low` | <70% compatible, use with caution | Similar category, different specs |

**Example:**

```typescript
const substitution: SuggestedSubstitution = {
  neededTool: {
    name: "Torque Wrench 0-500 ft-lb",
    partNumber: "TW-500",
    manufacturer: "CDI"
  },
  suggestedTool: {
    name: "Torque Wrench 0-600 ft-lb",
    partNumber: "TW-600",
    manufacturer: "CDI"
  },
  confidence: "High",
  reason: "Same manufacturer CDI, overlapping range 0-600 ft-lb covers required 0-500 ft-lb range. Higher capacity suitable for job."
};
```

---

### SourcingInfo

**Source:** `types.ts:35-41`

AI-discovered pricing and vendor information for shortage tools.

```typescript
export interface SourcingInfo {
  estimatedPrice: string;              // Price or price range (e.g., "$8,500" or "$8,000-$9,500")
  purchaseLinks: SourcingInfoLink[];   // Links to purchase from vendors
  rentalLinks: SourcingInfoLink[];     // Links to rental options (if available)
  sourcingNotes: string;               // Additional notes (e.g., "Price includes calibration cert")
  confidence: 'High' | 'Medium' | 'Low';  // Confidence in pricing accuracy
}

export interface SourcingInfoLink {
  url: string;                         // Direct link to product page
  sourceName: string;                  // Vendor name (e.g., "Aircraft Tool Supply")
  availability?: string;               // "In Stock", "2-3 weeks", "Made to Order"
}
```

**Example:**

```typescript
const sourcingInfo: SourcingInfo = {
  estimatedPrice: "$12,500 - $15,000",
  purchaseLinks: [
    {
      url: "https://skygeek.com/apu-test-set-xyz500.html",
      sourceName: "SkyGeek",
      availability: "In Stock"
    },
    {
      url: "https://aircraftspruce.com/catalog/topages/aputest500.php",
      sourceName: "Aircraft Spruce",
      availability: "2-3 weeks"
    }
  ],
  rentalLinks: [
    {
      url: "https://toolrental.com/aviation/apu-test-xyz500",
      sourceName: "Aviation Tool Rental",
      availability: "Available - $850/week"
    }
  ],
  sourcingNotes: "Price includes NIST-traceable calibration certificate. Rental may be cost-effective for one-time use.",
  confidence: "High"
};
```

---

### AircraftData

**Source:** `types.ts:65-71`

Organizational container for all data related to a specific aircraft.

```typescript
export interface AircraftData {
  id: string;                          // Unique identifier (UUID v4)
  name: string;                        // Aircraft registration (e.g., "N123AB - Citation X")
  createdAt: string;                   // ISO 8601 timestamp
  toolLists: SavedToolList[];          // Needed tools lists for this aircraft
  comparisons: SavedComparison[];      // Comparison results for this aircraft
}
```

**Example:**

```typescript
const aircraft: AircraftData = {
  id: crypto.randomUUID(),
  name: "N525AB - Citation X",
  createdAt: "2025-01-15T10:30:00Z",
  toolLists: [
    {
      id: crypto.randomUUID(),
      name: "500-Hour Inspection Tools",
      maintenanceEvent: "500-Hour Inspection - January 2025",
      tools: [ /* 45 tools */ ],
      createdAt: "2025-01-15T10:30:00Z"
    }
  ],
  comparisons: [
    {
      id: crypto.randomUUID(),
      name: "500-Hour Comparison",
      createdAt: "2025-01-15T11:00:00Z",
      result: { available: [], onOrder: [], shortage: [] },
      toolListName: "500-Hour Inspection Tools",
      maintenanceEvent: "500-Hour Inspection - January 2025"
    }
  ]
};
```

---

### SavedToolList

**Source:** `types.ts:43-49`

Saved list of needed tools for a specific maintenance event.

```typescript
export interface SavedToolList {
  id: string;                          // Unique identifier (UUID v4)
  name: string;                        // List name (e.g., "Annual Inspection Tools")
  maintenanceEvent: string;            // Event description (e.g., "Annual - March 2025")
  tools: Tool[];                       // Array of needed tools
  createdAt: string;                   // ISO 8601 timestamp
}
```

**Example:**

```typescript
const toolList: SavedToolList = {
  id: crypto.randomUUID(),
  name: "C172 Annual Inspection",
  maintenanceEvent: "Annual Inspection - March 2025",
  tools: [
    { name: "Compression Tester", partNumber: "CT-100", ... },
    { name: "Borescope", partNumber: "BS-200", ... }
    // ... 21 more tools
  ],
  createdAt: "2025-03-01T08:00:00Z"
};
```

---

### SavedComparison

**Source:** `types.ts:51-58`

Saved comparison result linking to a tool list and maintenance event.

```typescript
export interface SavedComparison {
  id: string;                          // Unique identifier (UUID v4)
  name: string;                        // Comparison name (e.g., "500-Hour - Comparison 1")
  createdAt: string;                   // ISO 8601 timestamp
  result: ComparisonResult;            // The actual comparison result
  toolListName: string;                // Reference to source tool list
  maintenanceEvent: string;            // Reference to maintenance event
}
```

---

### Kit

**Source:** `types.ts:73-78`

Reusable template of commonly-used tool sets.

```typescript
export interface Kit {
  id: string;                          // Unique identifier (UUID v4)
  name: string;                        // Kit name (e.g., "C172 Annual Kit")
  tools: Tool[];                       // Array of tools in kit
  createdAt: string;                   // ISO 8601 timestamp
}
```

**Example:**

```typescript
const kit: Kit = {
  id: crypto.randomUUID(),
  name: "Cessna 172 Annual Inspection Kit",
  tools: [
    { name: "Compression Tester", partNumber: "CT-100", ... },
    { name: "Magneto Timing Light", partNumber: "MTL-50", ... }
    // ... 21 more tools
  ],
  createdAt: "2024-06-15T12:00:00Z"
};
```

---

### PurchasePlanItem

**Source:** `types.ts:86-102`

Tool on order or planned for purchase.

```typescript
export interface PurchasePlanItem {
  id: string;                          // Unique identifier (UUID v4)
  aircraft: string;                    // Applicable aircraft (e.g., "N123AB" or "All")
  name: string;                        // Tool name
  partNumber: string;                  // Part number
  manufacturer: string;                // Manufacturer
  reason: string;                      // Why needed (e.g., "Shortage for 500-hr inspection")
  stage: string;                       // Purchase stage (see below)
  unitPrice: string;                   // Price per unit (e.g., "$8,500")
  quantity: string;                    // Quantity ordered (e.g., "1", "2")
  totalPrice: string;                  // Unit price × quantity
  sourcingLink: string;                // URL to vendor product page
  requestId: string;                   // Purchase requisition ID (e.g., "PR-2025-0142")
  status: string;                      // Order status (see below)
  notes: string;                       // Additional notes
  received?: boolean;                  // Whether tool has been received
}
```

**Stage Values:**
- `"Requested"` - Purchase requisition submitted
- `"Approved"` - Approved for purchase
- `"Ordered"` - Order placed with vendor
- `"In Transit"` - Shipped, tracking available
- `"Received"` - Delivered to facility
- `"Rejected"` - Purchase denied

**Status Values:**
- `"Pending Approval"`
- `"Approved"`
- `"Ordered"`
- `"Shipped"`
- `"Delivered"`
- `"Received"` (added to inventory)
- `"Cancelled"`

**Example:**

```typescript
const purchaseItem: PurchasePlanItem = {
  id: crypto.randomUUID(),
  aircraft: "N525AB - Citation X",
  name: "APU Test Set Model XYZ-500",
  partNumber: "APU-TS-XYZ500",
  manufacturer: "Aviation Test Equipment Corp",
  reason: "Shortage identified for 500-hour inspection",
  stage: "Ordered",
  unitPrice: "$12,500",
  quantity: "1",
  totalPrice: "$12,500",
  sourcingLink: "https://skygeek.com/apu-test-set-xyz500.html",
  requestId: "PR-2025-0142",
  status: "Ordered",
  notes: "Rush delivery requested, expected 2 weeks",
  received: false
};
```

---

### MaintenanceTask

**Source:** `types.ts:60-63`

Individual task within a maintenance event, with tool assignments.

```typescript
export interface MaintenanceTask {
  task: string;                        // Task description
  tools: Tool[];                       // Tools required for this task
}
```

**Example:**

```typescript
const task: MaintenanceTask = {
  task: "Engine Ground Run Test - Perform full-power run and record EGT, oil pressure, RPM",
  tools: [
    { name: "Engine Analyzer", partNumber: "EA-500", ... },
    { name: "Digital Tachometer", partNumber: "DT-100", ... },
    { name: "Temperature Probe Set", partNumber: "TP-SET-8", ... }
  ]
};
```

---

### ToastMessage

**Source:** `types.ts:80-84`

UI notification message.

```typescript
export interface ToastMessage {
  id: number;                          // Unique identifier (numeric)
  message: string;                     // Display message
  type: 'success' | 'error' | 'info';  // Notification type
}
```

**Example:**

```typescript
const toast: ToastMessage = {
  id: Date.now(),
  message: "Tool added successfully",
  type: "success"
};
```

---

## Data Validation

### Required Field Validation

**Tool Validation:**
```typescript
function validateTool(tool: Partial<Tool>): string[] {
  const errors: string[] = [];

  if (!tool.name || tool.name.trim() === '') {
    errors.push('Name is required');
  }
  if (!tool.manufacturer || tool.manufacturer.trim() === '') {
    errors.push('Manufacturer is required');
  }
  if (!tool.partNumber || tool.partNumber.trim() === '') {
    errors.push('Part Number is required');
  }
  if (!tool.serialNumber || tool.serialNumber.trim() === '') {
    errors.push('Serial Number is required');
  }

  return errors;
}
```

### Data Normalization

**Part Number Normalization:**
```typescript
function normalizePartNumber(pn: string): string {
  return pn.trim().toUpperCase().replace(/\s+/g, '-');
}

// "tw 500" → "TW-500"
```

**Manufacturer Normalization:**
```typescript
const manufacturerAliases: Record<string, string> = {
  'snap-on': 'Snap-on',
  'SNAP ON': 'Snap-on',
  'cdi': 'CDI Torque Products',
  'CDI Torque': 'CDI Torque Products'
};

function normalizeManufacturer(mfr: string): string {
  const normalized = manufacturerAliases[mfr.toLowerCase()];
  return normalized || mfr;
}
```

### Calibration Status Calculation

```typescript
function calculateCalibrationStatus(dueDays?: number): string {
  if (dueDays === undefined || dueDays === null) {
    return 'N/A';
  }
  if (dueDays < 0) {
    return 'Overdue';
  }
  if (dueDays < 30) {
    return 'Due Soon';
  }
  return 'Current';
}
```

## Storage Schema

### localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `toolInventoryMaster` | Tool[] | Master inventory |
| `toolInventoryNeeded` | Tool[] | Current needed tools list |
| `aircraftData` | AircraftData[] | All aircraft data |
| `toolKits` | Kit[] | Saved kits |
| `purchaseOrders` | PurchasePlanItem[] | Purchase tracking |
| `apiKey` | string | Google Gemini API key |
| `sourcingCache` | Record<string, SourcingInfo> | Cached sourcing results |

### Storage Size Estimates

**Average Sizes (JSON stringified):**
- Tool: ~350 bytes
- ComparisonResult (50 tools): ~17 KB
- AircraftData (5 events): ~100 KB
- Kit (25 tools): ~9 KB
- PurchasePlanItem: ~400 bytes

**Typical Usage:**
- 100 tools in master inventory: ~35 KB
- 5 aircraft with 3 events each: ~750 KB
- 10 kits: ~90 KB
- 20 purchase items: ~8 KB
- **Total:** ~900 KB (well under 5 MB limit)

### Data Access Patterns

**Read-Heavy Operations:**
- Master inventory (read on every comparison)
- Aircraft data (read for historical review)
- Kits (read when loading into needed list)

**Write-Heavy Operations:**
- Needed tools (frequent adds/edits during planning)
- Comparison results (saved after each comparison)
- Purchase items (status updates during procurement)

**Optimization:**
- Use debounced auto-save for write-heavy data
- Cache read-heavy data in component state (with re-fetch on mount)

## Migration Strategy

### Version 1.0 Schema (Current)

No versioning implemented yet. All data stored directly as types.

### Future: Versioned Storage

**Recommended when making breaking changes:**

```typescript
interface VersionedData<T> {
  version: number;
  data: T;
  migratedAt?: string;
}

function loadWithMigration<T>(key: string, currentVersion: number): T | null {
  const json = localStorage.getItem(key);
  if (!json) return null;

  const stored: VersionedData<any> = JSON.parse(json);

  if (stored.version < currentVersion) {
    const migrated = migrate(stored.data, stored.version, currentVersion);
    saveVersioned(key, migrated, currentVersion);
    return migrated;
  }

  return stored.data;
}
```

**Example Migration (v1 → v2):**
```typescript
// v1: Tool has 'location' as string
// v2: Tool has 'location' as { building: string; shelf: string }

function migrateToolV1toV2(tool: any): Tool {
  if (typeof tool.location === 'string') {
    // Parse "Tool Crib A, Shelf 3" → { building: "Tool Crib A", shelf: "Shelf 3" }
    const parts = tool.location.split(',');
    tool.location = {
      building: parts[0]?.trim() || '',
      shelf: parts[1]?.trim() || ''
    };
  }
  return tool;
}
```

---

## Next Steps
- [AI Integration](./05-AI-INTEGRATION.md) - How AI uses these data models
- [API Reference](./06-API-REFERENCE.md) - Service functions that manipulate these models
