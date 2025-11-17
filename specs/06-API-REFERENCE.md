# API Reference

> **Last Updated:** 2025-11-17

## Table of Contents
- [Overview](#overview)
- [Service Architecture](#service-architecture)
- [Gemini Service API](#gemini-service-api)
- [Data Service API](#data-service-api)
- [Type Definitions](#type-definitions)
- [Error Handling](#error-handling)

## Overview

This document provides a complete reference for the service layer APIs in Tool Inventory Checker. All services are implemented as TypeScript modules with exported functions.

### Service Modules

| Service | File | Purpose |
|---------|------|---------|
| Gemini Service | `services/geminiService.ts` | AI/ML operations via Google Gemini |
| Data Service | `services/dataService.ts` | localStorage persistence layer |

---

## Service Architecture

```
Component Layer
     │
     ├─> geminiService (AI operations)
     │   ├─> processCsvInventory()
     │   ├─> processNeededToolsCsv()
     │   ├─> compareInventories()
     │   ├─> findSubstitutions()
     │   ├─> getToolSourcingInfo()
     │   ├─> queryInventory()
     │   └─> cleanAndParseJson()
     │
     └─> dataService (localStorage)
         ├─> saveInventory()
         ├─> loadInventory()
         ├─> saveNeededTools()
         ├─> loadNeededTools()
         ├─> saveAircraftData()
         ├─> loadAircraftData()
         ├─> saveKits()
         ├─> loadKits()
         └─> savePurchaseOrders()
```

---

## Gemini Service API

**Import:**
```typescript
import {
  processCsvInventory,
  processNeededToolsCsv,
  compareInventories,
  getToolSourcingInfo,
  queryInventory,
  cleanAndParseJson
} from './services/geminiService';
```

### processCsvInventory()

**Purpose:** Parse and clean tool inventory from CSV file using AI

**Signature:**
```typescript
async function processCsvInventory(csvContent: string): Promise<Tool[]>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `csvContent` | string | Raw CSV text content |

**Returns:** `Promise<Tool[]>` - Array of parsed and cleaned Tool objects

**Features:**
- Intelligent column mapping (handles header variations)
- Data cleaning (trim, normalize, standardize)
- Calibration status derivation
- Duplicate removal (by serial number)
- Alphabetical sorting

**Example:**
```typescript
const fileText = await file.text();
const tools = await processCsvInventory(fileText);
console.log(`Imported ${tools.length} tools`);
```

**Errors:**
- Throws if CSV is malformed or AI fails to parse
- Throws if API key is invalid
- Throws if rate limit exceeded

**Model Used:** `gemini-2.5-flash`
**Avg Response Time:** 2-5 seconds

---

### processNeededToolsCsv()

**Purpose:** Parse needed tools list from CSV

**Signature:**
```typescript
async function processNeededToolsCsv(csvContent: string): Promise<Tool[]>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `csvContent` | string | Raw CSV text content |

**Returns:** `Promise<Tool[]>` - Array of needed Tool objects

**Features:**
- Flexible format parsing (tool name + part number minimum)
- Manufacturer optional (defaults to "N/A")
- Serial number set to "N/A" for all needed tools

**Example:**
```typescript
const neededTools = await processNeededToolsCsv(csvText);
setNeededToolsList(neededTools);
```

**Model Used:** `gemini-2.5-flash`
**Avg Response Time:** 2-4 seconds

---

### compareInventories()

**Purpose:** Compare needed tools against master inventory and purchase plan

**Signature:**
```typescript
async function compareInventories(
  masterInventory: Tool[],
  neededTools: Tool[],
  purchasePlan: PurchasePlanItem[]
): Promise<ComparisonResult>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `masterInventory` | Tool[] | All available tools |
| `neededTools` | Tool[] | Tools required for job |
| `purchasePlan` | PurchasePlanItem[] | Tools on order |

**Returns:** `Promise<ComparisonResult>` - Comparison breakdown with substitutions

**Algorithm:**
1. Match by part number (case-insensitive, handles comma-separated)
2. Match by exact name (if part number missing)
3. Check against purchase plan for "on order" status
4. AI suggests substitutions for shortage items

**Example:**
```typescript
const result = await compareInventories(
  masterInventory,
  neededTools,
  purchaseOrders
);

console.log(`Available: ${result.available.length}`);
console.log(`Shortage: ${result.shortage.length}`);
console.log(`Substitutions: ${result.suggestedSubstitutions?.length || 0}`);
```

**Model Used:** `gemini-2.5-flash` (for substitutions only)
**Avg Response Time:** 3-8 seconds

---

### getToolSourcingInfo()

**Purpose:** Find pricing and vendor information using Google Search

**Signature:**
```typescript
async function getToolSourcingInfo(tool: Tool): Promise<SourcingInfo>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `tool` | Tool | Tool to source |

**Returns:** `Promise<SourcingInfo>` - Pricing, purchase links, rental options

**Features:**
- Prioritizes verified aviation distributors
- Returns up to 3 purchase links
- Returns up to 2 rental links
- Confidence scoring (High/Medium/Low)
- Helpful procurement notes

**Example:**
```typescript
const sourcing = await getToolSourcingInfo(shortageTool);
console.log(`Price: ${sourcing.estimatedPrice}`);
console.log(`Vendor: ${sourcing.purchaseLinks[0]?.sourceName}`);
console.log(`Rental: ${sourcing.rentalLinks.length > 0 ? 'Available' : 'No'}`);
```

**Rate Limit:** 1 request per 60 seconds (Google Search grounding)

**Errors:**
- Throws if rate limit exceeded (429 error)
- Throws if invalid JSON response

**Model Used:** `gemini-2.5-flash` with Google Search grounding
**Avg Response Time:** 5-15 seconds

---

### queryInventory()

**Purpose:** Natural language search of inventory

**Signature:**
```typescript
async function queryInventory(
  query: string,
  inventory: Tool[]
): Promise<Tool[]>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `query` | string | Natural language query |
| `inventory` | Tool[] | Master inventory to search |

**Returns:** `Promise<Tool[]>` - Filtered tools matching query

**Example Queries:**
- "All Tronair jacks under 10 tons"
- "Show me torque wrenches from CDI"
- "Battery chargers that need calibration"

**Example:**
```typescript
const results = await queryInventory(
  "All tools needing calibration",
  masterInventory
);
console.log(`Found ${results.length} tools needing calibration`);
```

**Model Used:** `gemini-2.5-flash`
**Avg Response Time:** 1-3 seconds

---

### cleanAndParseJson()

**Purpose:** Robustly parse AI JSON responses

**Signature:**
```typescript
function cleanAndParseJson<T>(rawText: string): T
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `rawText` | string | Raw AI response text |

**Returns:** `T` - Parsed JSON object

**Features:**
- Removes markdown code fences (```json)
- Extracts JSON from surrounding text
- Handles trailing commas
- Validates brace/bracket balance
- Detects truncation

**Example:**
```typescript
const raw = response.text;
const parsed = cleanAndParseJson<{ tools: Tool[] }>(raw);
return parsed.tools;
```

**Errors:**
- Throws if no JSON found in response
- Throws if JSON is truncated/malformed
- Throws if parse fails

---

## Data Service API

**Import:**
```typescript
import { dataService } from './services/dataService';
```

### saveInventory()

**Purpose:** Persist master inventory to localStorage

**Signature:**
```typescript
function saveInventory(tools: Tool[]): void
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `tools` | Tool[] | Master inventory array |

**Storage Key:** `toolInventoryMaster`

**Example:**
```typescript
dataService.saveInventory(masterInventory);
```

**Errors:**
- Throws `QuotaExceededError` if localStorage full

---

### loadInventory()

**Purpose:** Load master inventory from localStorage

**Signature:**
```typescript
function loadInventory(): Tool[]
```

**Returns:** `Tool[]` - Master inventory (or default inventory if none saved)

**Example:**
```typescript
const inventory = dataService.loadInventory();
setMasterInventory(inventory);
```

**Fallback:** Returns pre-loaded inventory from `constants.ts` if no saved data

---

### saveNeededTools()

**Purpose:** Persist needed tools list

**Signature:**
```typescript
function saveNeededTools(tools: Tool[]): void
```

**Storage Key:** `toolInventoryNeeded`

---

### loadNeededTools()

**Purpose:** Load needed tools list

**Signature:**
```typescript
function loadNeededTools(): Tool[]
```

**Returns:** `Tool[]` - Needed tools (empty array if none)

---

### saveAircraftData()

**Purpose:** Persist all aircraft data

**Signature:**
```typescript
function saveAircraftData(data: AircraftData[]): void
```

**Storage Key:** `aircraftData`

**Example:**
```typescript
dataService.saveAircraftData(aircraftDataArray);
```

---

### loadAircraftData()

**Purpose:** Load all aircraft data

**Signature:**
```typescript
function loadAircraftData(): AircraftData[]
```

**Returns:** `AircraftData[]` - All aircraft records

---

### saveKits()

**Purpose:** Persist tool kits

**Signature:**
```typescript
function saveKits(kits: Kit[]): void
```

**Storage Key:** `toolKits`

---

### loadKits()

**Purpose:** Load tool kits

**Signature:**
```typescript
function loadKits(): Kit[]
```

**Returns:** `Kit[]` - All saved kits

---

### savePurchaseOrders()

**Purpose:** Persist purchase orders

**Signature:**
```typescript
function savePurchaseOrders(orders: PurchasePlanItem[]): void
```

**Storage Key:** `purchaseOrders`

---

### loadPurchaseOrders()

**Purpose:** Load purchase orders

**Signature:**
```typescript
function loadPurchaseOrders(): PurchasePlanItem[]
```

**Returns:** `PurchasePlanItem[]` - All purchase orders

---

## Type Definitions

**See:** [04-DATA-MODELS.md](./04-DATA-MODELS.md) for complete type documentation

**Quick Reference:**

```typescript
// Core types
import type {
  Tool,
  ComparisonResult,
  SuggestedSubstitution,
  SourcingInfo,
  SourcingInfoLink,
  AircraftData,
  SavedToolList,
  SavedComparison,
  Kit,
  PurchasePlanItem,
  MaintenanceTask,
  ToastMessage
} from './types';
```

---

## Error Handling

### Common Error Patterns

#### 1. API Key Missing
```typescript
try {
  await processCsvInventory(csv);
} catch (error) {
  if (error.message.includes('API_KEY')) {
    showToast('Please set your Gemini API key', 'error');
  }
}
```

#### 2. Rate Limit Exceeded
```typescript
try {
  await getToolSourcingInfo(tool);
} catch (error) {
  if (error.message.includes('rate limit')) {
    showToast('Rate limit exceeded. Wait 60 seconds.', 'warning');
  }
}
```

#### 3. Network Error
```typescript
try {
  await compareInventories(master, needed, orders);
} catch (error) {
  console.error('Network error:', error);
  showToast('Failed to connect to AI service', 'error');
}
```

#### 4. localStorage Quota Exceeded
```typescript
try {
  dataService.saveInventory(tools);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    if (confirm('Storage full. Clear old data?')) {
      // Clear old aircraft data
      dataService.clearOldData();
      // Retry
      dataService.saveInventory(tools);
    }
  }
}
```

### Error Message Format

**User-Friendly Messages:**
- "Failed to process CSV with AI. Please check file format."
- "API rate limit exceeded. Please wait before trying again."
- "Storage quota exceeded. Please delete old data."

**Developer Messages (console):**
- `console.error("Error calling Gemini API:", error);`
- `console.error("Failed to parse JSON:", rawText);`

---

## Performance Best Practices

### 1. Debounce Auto-Save
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    dataService.saveInventory(masterInventory);
  }, 1000); // 1-second debounce

  return () => clearTimeout(timer);
}, [masterInventory]);
```

### 2. Cache AI Responses
```typescript
const sourcingCache = new Map<string, SourcingInfo>();

async function getCachedSourcing(tool: Tool): Promise<SourcingInfo> {
  const key = `${tool.partNumber}-${tool.manufacturer}`;

  if (sourcingCache.has(key)) {
    return sourcingCache.get(key)!;
  }

  const sourcing = await getToolSourcingInfo(tool);
  sourcingCache.set(key, sourcing);
  return sourcing;
}
```

### 3. Batch Operations with Delays
```typescript
// For sourcing multiple tools (rate-limited)
for (let i = 0; i < shortages.length; i++) {
  const sourcing = await getToolSourcingInfo(shortages[i]);
  results.push(sourcing);

  if (i < shortages.length - 1) {
    await new Promise(resolve => setTimeout(resolve, 60000)); // 60s delay
  }
}
```

### 4. Context Size Management
```typescript
// Pre-filter large datasets before AI processing
const relevantTools = inventory.filter(/* relevance criteria */).slice(0, 250);
const result = await compareInventories(relevantTools, needed, orders);
```

---

## Next Steps
- [Feature Specifications](./02-FEATURES.md) - How these APIs are used in features
- [AI Integration](./05-AI-INTEGRATION.md) - Detailed AI implementation
- [Technical Architecture](./03-TECHNICAL-ARCHITECTURE.md) - Overall system design
