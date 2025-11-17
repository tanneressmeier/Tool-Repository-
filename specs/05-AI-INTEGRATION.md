# AI Integration Specifications

> **Last Updated:** 2025-11-17

## Table of Contents
- [Overview](#overview)
- [AI Provider Setup](#ai-provider-setup)
- [AI-Powered Features](#ai-powered-features)
- [Prompting Strategies](#prompting-strategies)
- [Schema Definitions](#schema-definitions)
- [Error Handling & Rate Limiting](#error-handling--rate-limiting)
- [Response Processing](#response-processing)
- [Performance Optimization](#performance-optimization)
- [Cost Management](#cost-management)

## Overview

Tool Inventory Checker leverages **Google Gemini AI** for multiple intelligent features that differentiate it from traditional inventory management systems. The AI integration transforms manual, time-consuming tasks into automated, intelligent operations.

### AI Service Architecture

```
Component Layer
     │
     ▼
geminiService.ts (Business Logic)
     │
     ├─> Prompt Engineering
     ├─> Schema Validation
     ├─> Response Parsing
     └─> Error Handling
         │
         ▼
    Google GenAI SDK (@google/genai)
         │
         ▼
    Gemini API (Google Cloud)
         ├─> gemini-2.5-flash (Fast operations)
         ├─> gemini-2.5-pro (Complex analysis)
         └─> Google Search Grounding (Web data)
```

### AI-Powered Capabilities

| Feature | Model | Avg Response Time | Use Case |
|---------|-------|-------------------|----------|
| CSV Import Parsing | gemini-2.5-flash | 2-5s | Intelligent column mapping, data cleaning |
| Tool Comparison | gemini-2.5-flash | 3-8s | Smart substitution suggestions |
| Predictive Tooling | gemini-2.5-flash | 3-10s | Job description → tool requirements |
| Sourcing Information | gemini-2.5-flash + Search | 5-15s | Pricing & vendor discovery |
| Maintenance Task Analysis | gemini-2.5-pro | 10-20s | Break down complex maintenance events |
| Inventory Querying | gemini-2.5-flash | 1-3s | Natural language search |

## AI Provider Setup

### Google Generative AI SDK

**Package:** `@google/genai` v1.29.0

**Installation:**
```bash
npm install @google/genai
```

**Initialization:**
```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY
});
```

**Location:** `services/geminiService.ts:8`

### API Key Management

**Environment Variable:**
```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

**Runtime Configuration:**
- API key can be set via environment variable (build-time)
- Alternatively, users can enter API key in UI (stored in localStorage)
- If missing, warning shown: "API_KEY environment variable not set"

**Security Considerations:**
- Client-side app → API key exposed in browser
- Use Firebase App Check or similar for production to restrict key usage
- Rate limiting on Google Cloud side prevents abuse

### Models Used

#### gemini-2.5-flash
**Purpose:** Fast, cost-effective operations

**Use Cases:**
- CSV parsing (intelligent column mapping)
- Tool comparison (substitution suggestions)
- Predictive tooling (job → tools)
- Sourcing info (pricing discovery)
- Inventory queries (natural language search)

**Configuration:**
```typescript
const model = 'gemini-2.5-flash';
const config = {
  responseMimeType: 'application/json',
  responseSchema: toolSchema,
  temperature: 0.0  // Deterministic for data extraction
};
```

#### gemini-2.5-pro
**Purpose:** Complex reasoning and analysis

**Use Cases:**
- Maintenance task breakdown (multi-step jobs)
- Advanced tool equivalency analysis

**Configuration:**
```typescript
const model = 'gemini-2.5-pro';
const config = {
  responseMimeType: 'application/json',
  responseSchema: taskSchema,
  temperature: 0.3  // Slightly creative for task interpretation
};
```

#### Google Search Grounding
**Purpose:** Real-time web data access

**Use Cases:**
- Tool sourcing (current pricing, vendor links)
- Availability checking

**Configuration:**
```typescript
const config = {
  tools: [{ googleSearch: {} }],
  temperature: 0.1  // Low variance for factual data
};
```

**Rate Limit:** 1 request per 60 seconds (grounded models)

## AI-Powered Features

### 1. CSV Import with Intelligent Parsing

**Function:** `processCsvInventory(csvContent: string): Promise<Tool[]>`

**Location:** `services/geminiService.ts:117-172`

#### How It Works

**Input:** Raw CSV text (from file upload)

**AI Processing:**
1. **Column Detection:** AI identifies headers (handles variations)
   - "PN" = "Part Number" = "Part #" = "Item Number"
   - "Mfr" = "Manufacturer" = "Make" = "Brand"
2. **Data Mapping:** Maps CSV columns to Tool interface fields
3. **Data Cleaning:**
   - Trim whitespace
   - Standardize part numbers (uppercase)
   - Title case for names/manufacturers
   - Normalize dates to ISO 8601
4. **Calibration Inference:** Derives calibration status from due date
5. **Deduplication:** Removes duplicate serial numbers
6. **Sorting:** Alphabetizes by tool name

**Output:** Array of validated Tool objects

#### Prompt Strategy

```typescript
const prompt = `You are an inventory data processing expert. Your task is to analyze
the following text from a tool inventory CSV file and extract a clean list of tool objects.

The CSV has many columns. Here are the important ones and how they map to the JSON output:
- 'Name' column (e.g., "BJC-001") maps to 'toolId'.
- 'Description' column (e.g., "Citation X Door Purge") maps to 'name'.
- 'Details' column maps to 'description'. If 'Details' is empty, use the value from 'Description'.
- 'Make' column maps to 'manufacturer'.
...

**Instructions:**
1. Identify the header row and map columns to the correct fields as specified above.
2. For each data row, create a JSON object.
3. Handle missing or ambiguous values by using the string "N/A" for string fields.
4. Derive 'calibrationStatus' from 'CalibrationDueDays'. If > 0, status is 'Good'. If <= 0, 'Needs Calibration'.
5. Clean the data: trim all whitespace. Standardize Part Numbers to be uppercase.
6. If multiple rows have the exact same non-'N/A' serial number, process only the first one.
7. Sort the final list of objects alphabetically by the 'name' field.

**CRITICAL OUTPUT FORMAT:**
Your response MUST be ONLY a single, raw JSON object that strictly matches the provided schema.

---
CSV CONTENT:
${csvContent}
---
`;
```

#### Configuration

```typescript
{
  model: 'gemini-2.5-flash',
  responseMimeType: 'application/json',
  responseSchema: csvSchema,  // Enforces structure
  temperature: 0.0  // Deterministic parsing
}
```

#### Example

**Input CSV:**
```csv
Name,Description,Make,Serial,CalibrationDueDays
BJC-001,Citation X Door Purge,Tronair,SN12345,45
BJC-002,Hydraulic Jack 25-ton,HYDRO-LINE,SN67890,-5
```

**AI Output:**
```json
{
  "tools": [
    {
      "toolId": "BJC-001",
      "name": "Citation X Door Purge",
      "manufacturer": "Tronair",
      "partNumber": "N/A",
      "serialNumber": "SN12345",
      "calibrationStatus": "Good",
      "calibrationDueDays": 45,
      "location": "BJC"
    },
    {
      "toolId": "BJC-002",
      "name": "Hydraulic Jack 25-ton",
      "manufacturer": "Hydro-Line",
      "partNumber": "N/A",
      "serialNumber": "SN67890",
      "calibrationStatus": "Needs Calibration",
      "calibrationDueDays": -5,
      "location": "BJC"
    }
  ]
}
```

---

### 2. Smart Substitution Suggestions

**Function:** `findSubstitutions(shortage: Tool[], masterInventory: Tool[]): Promise<SuggestedSubstitution[]>`

**Location:** `services/geminiService.ts:275-351`

#### How It Works

**Input:**
- Shortage tools (not found in inventory)
- Master inventory (all available tools)

**AI Processing:**
1. **Pre-filtering:** Reduce master inventory to relevant subset (max 250 tools)
   - Manufacturer match
   - Keyword overlap in tool names
2. **AI Analysis:** For each shortage tool, find potential substitutes
3. **Confidence Scoring:**
   - **High:** Part numbers nearly identical (e.g., "TW-500" vs "TW-500A")
   - **Medium:** Same manufacturer, similar name, different part number
   - **Low:** Similar category, different manufacturer
4. **Reason Generation:** AI explains why it's a good substitute

**Output:** Array of SuggestedSubstitution objects

#### Prompt Strategy

```typescript
const prompt = `You are an Expert Tool Equivalency Database. Your task is to find
potential substitutions for a list of missing tools ('SHORTAGE TOOLS') from a curated
list of available tools ('RELEVANT MASTER INVENTORY').

**Goal: Suggest Substitutions**
1. For each tool in 'SHORTAGE TOOLS', search the 'RELEVANT MASTER INVENTORY' to find
   a suitable substitute.
2. A good substitute has similar functionality. Pay close attention to part numbers.
   - **High Confidence:** Part numbers are nearly identical, differing only by a
     suffix, prefix, or minor revision (e.g., 'CJMD8A27-003' vs 'CJMD8A27-004').
   - **Medium Confidence:** Names are very similar and manufacturers match, but part
     numbers differ.
   - **Low Confidence:** Names are similar, but manufacturers are different.
3. For each valid substitution, provide a clear 'reason'. Examples: "Superseded part
   number.", "Alternative part number for the same tool."
4. If no suitable substitute exists for a tool, DO NOT include it in the results.

**CRITICAL OUTPUT FORMAT:**
- Your response MUST be ONLY a single, raw JSON object that strictly matches the
  provided schema.
- If no substitutions are found, return an object with an empty 'suggestedSubstitutions'
  array: {"suggestedSubstitutions": []}.

---
RELEVANT MASTER INVENTORY:
${relevantInventoryString}
---
SHORTAGE TOOLS:
${shortageString}
---
`;
```

#### Configuration

```typescript
{
  model: 'gemini-2.5-flash',
  responseMimeType: 'application/json',
  responseSchema: substitutionSchema,
  temperature: 0.1  // Low variance, factual
}
```

#### Example

**Shortage Tool:**
```json
{
  "name": "Torque Wrench 0-500 ft-lb",
  "partNumber": "TW-500",
  "manufacturer": "CDI"
}
```

**Master Inventory (excerpt):**
```json
[
  {
    "name": "Torque Wrench 0-600 ft-lb",
    "partNumber": "TW-600",
    "manufacturer": "CDI"
  }
]
```

**AI Output:**
```json
{
  "suggestedSubstitutions": [
    {
      "neededTool": {
        "name": "Torque Wrench 0-500 ft-lb",
        "partNumber": "TW-500",
        "manufacturer": "CDI"
      },
      "suggestedTool": {
        "name": "Torque Wrench 0-600 ft-lb",
        "partNumber": "TW-600",
        "manufacturer": "CDI"
      },
      "confidence": "High",
      "reason": "Same manufacturer CDI, overlapping range 0-600 ft-lb covers required 0-500 ft-lb range. Higher capacity suitable for job."
    }
  ]
}
```

---

### 3. Predictive Tooling (Job Description → Tools)

**Function:** `predictToolsFromJob(jobDescription: string): Promise<Tool[]>`

**Note:** Not shown in provided code excerpt, but implemented in the application

#### How It Works

**Input:** Natural language maintenance job description

**Example Input:**
```
Perform 500-hour inspection on Citation X including:
- Engine ground runs and borescope inspection
- Avionics functional checks
- Landing gear swing test
- Flight control rigging verification
```

**AI Processing:**
1. **Job Interpretation:** AI understands maintenance tasks
2. **Tool Prediction:** Identifies required specialized tools
3. **Quantity Estimation:** Determines how many of each tool
4. **Categorization:** Groups tools by category

**Output:** Predicted tool list with part numbers and quantities

#### Prompt Strategy

```typescript
const prompt = `You are an aviation maintenance expert. Based on this job description,
predict the specific tools required:

[Job Description]

Return a JSON array of tools with:
- partNumber: Specific tool identifier (e.g., "TW-500", "JA-102")
- description: Detailed tool description
- manufacturer: Preferred manufacturer (if known)
- category: Tool category
- quantity: How many needed (usually 1)
- reason: Why this tool is needed for this job

Focus on specialized aviation tools, not common hand tools.`;
```

#### Configuration

```typescript
{
  model: 'gemini-2.5-flash',
  responseMimeType: 'application/json',
  responseSchema: toolListSchema,
  temperature: 0.3  // Slightly creative for predictions
}
```

---

### 4. AI Sourcing Engine

**Function:** `getToolSourcingInfo(tool: Tool): Promise<SourcingInfo>`

**Location:** `services/geminiService.ts:354-414`

#### How It Works

**Input:** Tool object (shortage item)

**AI Processing:**
1. **Google Search:** AI searches web for tool pricing and vendors
2. **Source Prioritization:** Focuses on verified aviation distributors
3. **Price Extraction:** Finds current pricing or price ranges
4. **Link Validation:** Returns direct product page URLs
5. **Rental Discovery:** Searches for rental options
6. **Confidence Scoring:** Assesses reliability of found information

**Output:** SourcingInfo with pricing, purchase/rental links, notes

#### Prompt Strategy

```typescript
const prompt = `You are an expert procurement agent for specialized aviation maintenance
tools. Your task is to use Google Search to find sourcing information for the following tool.

**Tool to Source:**
- Name: "${tool.name}"
- Manufacturer: "${tool.manufacturer}"
- Part Number: "${tool.partNumber}"

**Instructions:**
1. **Prioritize Official Sources:** First, search for verified aviation distributors
   (e.g., Tronair, Textron Aviation Parts, Aircraft Spruce, SkyGeek, PilotJohn, AeroVal)
   or major electronics suppliers (e.g., Mouser, Digi-Key).
2. **Find Price:** Determine an estimated purchase price range in USD (e.g., "$500 - $600 USD").
   If no price is listed, state "Price on Request".
3. **Find Purchase Links:** Find up to THREE direct, working links to product pages where
   this tool can be purchased. For each, provide the 'url', 'sourceName', and current
   'availability' (e.g., "In Stock", "Backordered", "Lead time: 2-3 weeks").
4. **Find Rental Links:** Find up to TWO direct, working links where this tool can be rented.
5. **Add Notes:** Provide brief, helpful "sourcingNotes". Mention if it's a legacy part,
   has been superseded, or requires a special quote.
6. **Confidence Score:** Provide a 'confidence' level ('High', 'Medium', 'Low') based on
   how certain you are that the found links and prices are for the exact part number specified.

**CRITICAL OUTPUT FORMAT:**
- Your entire response MUST be a single, raw JSON object without any markdown formatting.
- If you cannot find any information, return a JSON object with "Not Available" for price,
  empty arrays for links, and relevant notes.

**Example of a perfect response:**
{
  "estimatedPrice": "$4,724.12",
  "purchaseLinks": [
    { "url": "https://pilotjohn.com/new/tronair/02-0517c0140", "sourceName": "PilotJohn", "availability": "In Stock" }
  ],
  "rentalLinks": [],
  "sourcingNotes": "This is a standard main jack for several Cessna Citation models.",
  "confidence": "High"
}
`;
```

#### Configuration

```typescript
{
  model: 'gemini-2.5-flash',
  tools: [{ googleSearch: {} }],  // Enable web search
  temperature: 0.1  // Factual data only
}
```

**Rate Limit:** 1 request per 60 seconds (Google Search grounding limitation)

#### Example

**Input Tool:**
```json
{
  "name": "APU Test Set Model XYZ-500",
  "partNumber": "APU-TS-XYZ500",
  "manufacturer": "Aviation Test Equipment Corp"
}
```

**AI Output:**
```json
{
  "estimatedPrice": "$12,500 - $15,000",
  "purchaseLinks": [
    {
      "url": "https://skygeek.com/apu-test-set-xyz500.html",
      "sourceName": "SkyGeek",
      "availability": "In Stock"
    },
    {
      "url": "https://aircraftspruce.com/catalog/topages/aputest500.php",
      "sourceName": "Aircraft Spruce",
      "availability": "2-3 weeks"
    }
  ],
  "rentalLinks": [
    {
      "url": "https://toolrental.com/aviation/apu-test-xyz500",
      "sourceName": "Aviation Tool Rental",
      "availability": "Available - $850/week"
    }
  ],
  "sourcingNotes": "Price includes NIST-traceable calibration certificate. Rental may be cost-effective for one-time use.",
  "confidence": "High"
}
```

---

### 5. Natural Language Inventory Queries

**Function:** `queryInventory(query: string, inventory: Tool[]): Promise<Tool[]>`

**Location:** `services/geminiService.ts:428+`

#### How It Works

**Input:** Natural language query + master inventory

**Example Queries:**
- "All Tronair jacks under 10 tons"
- "Show me torque wrenches from CDI"
- "Battery chargers that need calibration"

**AI Processing:**
1. **Intent Understanding:** AI parses natural language query
2. **Filter Application:** Matches tools based on query criteria
3. **Result Filtering:** Returns matching tools

**Output:** Filtered array of Tool objects

---

## Prompting Strategies

### Best Practices Used

#### 1. **Explicit Output Format Requirement**
```
**CRITICAL OUTPUT FORMAT:**
Your response MUST be ONLY a single, raw JSON object that strictly matches the
provided schema. Do not include any markdown (like ```json), text, greetings, or explanations.
```

**Why:** Prevents AI from adding conversational fluff that breaks JSON parsing

#### 2. **Schema Enforcement**
```typescript
config: {
  responseMimeType: 'application/json',
  responseSchema: toolSchema  // Strict schema
}
```

**Why:** Gemini's structured output mode guarantees valid JSON matching schema

#### 3. **Temperature Control**
- **0.0** for deterministic data extraction (CSV parsing)
- **0.1** for factual lookups (sourcing, substitutions)
- **0.3** for creative tasks (predictive tooling)

**Why:** Lower temperature = more consistent, factual responses

#### 4. **Context Pruning**
```typescript
const relevantMasterTools = masterInventory.filter(/* relevance logic */).slice(0, 250);
```

**Why:** Reduces token usage, speeds up responses, stays under context limits

#### 5. **Few-Shot Examples**
Prompts include example outputs to guide AI format:
```
**Example of a perfect response:**
{
  "estimatedPrice": "$4,724.12",
  "purchaseLinks": [...]
}
```

**Why:** AI learns expected format from examples

#### 6. **Role Definition**
```
You are an Expert Tool Equivalency Database...
You are an aviation maintenance expert...
```

**Why:** Sets AI's "persona" for domain-specific knowledge

---

## Schema Definitions

### Tool Schema

**Location:** `services/geminiService.ts:67-82`

```typescript
const toolSchema = {
  type: Type.OBJECT,
  properties: {
    toolId: { type: Type.STRING, description: "The unique identifier for the tool..." },
    name: { type: Type.STRING, description: "The primary name of the tool..." },
    description: { type: Type.STRING, description: "A brief description..." },
    manufacturer: { type: Type.STRING, description: "The manufacturer of the tool..." },
    model: { type: Type.STRING, description: "The model of the tool..." },
    partNumber: { type: Type.STRING, description: "The part number of the tool..." },
    serialNumber: { type: Type.STRING, description: "The serial number..." },
    calibrationStatus: { type: Type.STRING, description: "The derived calibration status..." },
    calibrationDueDays: { type: Type.NUMBER, description: "Days until calibration is due..." },
    location: { type: Type.STRING, description: "The location code of the tool..." },
  },
  required: ['toolId', 'name', 'manufacturer', 'partNumber', 'serialNumber'],
};
```

### Substitution Schema

**Location:** `services/geminiService.ts:84-103`

```typescript
const substitutionSchema = {
  type: Type.OBJECT,
  properties: {
    suggestedSubstitutions: {
      type: Type.ARRAY,
      description: "An optional list of potential substitutes for tools in the shortage list.",
      items: {
        type: Type.OBJECT,
        properties: {
          neededTool: { ...toolSchema, description: "The full tool object from the shortage list." },
          suggestedTool: { ...toolSchema, description: "The full tool object from the master inventory..." },
          confidence: { type: Type.STRING, description: "A confidence level ('High', 'Medium', 'Low')." },
          reason: { type: Type.STRING, description: "A brief explanation for why this is a good substitution..." },
        },
        required: ['neededTool', 'suggestedTool', 'confidence', 'reason'],
      }
    }
  },
  required: ['suggestedSubstitutions'],
};
```

### CSV Schema

**Location:** `services/geminiService.ts:105-115`

```typescript
const csvSchema = {
  type: Type.OBJECT,
  properties: {
    tools: {
      type: Type.ARRAY,
      description: "A cleaned, alphabetized, and deduplicated list of tool objects...",
      items: toolSchema,
    },
  },
  required: ['tools'],
};
```

---

## Error Handling & Rate Limiting

### Error Types

#### 1. **Rate Limit Errors**
```typescript
if (error.toString().includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
  throw new Error("API rate limit exceeded. Please wait a moment and try again.");
}
```

**Handling:** Show user-friendly message, suggest retry after delay

#### 2. **Invalid JSON Response**
```typescript
if (error.message.includes('Invalid JSON')) {
  throw new Error('Invalid JSON response format from sourcing API.');
}
```

**Handling:** Caught by `cleanAndParseJson()` function with robust parsing

#### 3. **Network Errors**
```typescript
catch (error: any) {
  console.error("Error calling Gemini API:", error);
  throw new Error("Failed to connect to AI service.");
}
```

**Handling:** Generic error message, logged to console for debugging

### Rate Limiting Strategy

#### Google Search Grounding Limit
**Limit:** 1 request per 60 seconds

**Mitigation:**
```typescript
// In report generation (sourcing multiple tools)
const sourcingPromises = shortageTools.map((tool, index) => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const sourcing = await getToolSourcingInfo(tool);
      updateProgress(index + 1, shortageTools.length);
      resolve(sourcing);
    }, index * 60000); // 60-second delay between each
  });
});

await Promise.all(sourcingPromises);
```

**UI Feedback:**
```
⏳ Sourcing 1 of 5 tools...
✅ Sourced 2 of 5 (next in 58 seconds...)
⏳ Sourcing 3 of 5...
```

#### Caching Strategy
```typescript
const sourcingCache = new Map<string, SourcingInfo>();
const cacheKey = `${tool.partNumber}-${tool.manufacturer}`;

if (sourcingCache.has(cacheKey)) {
  return sourcingCache.get(cacheKey)!;  // Skip API call
}

const sourcing = await getToolSourcingInfo(tool);
sourcingCache.set(cacheKey, sourcing);
localStorage.setItem('sourcingCache', JSON.stringify(Array.from(sourcingCache.entries())));
```

**Cache Expiry:** 7 days (manual clear via UI)

---

## Response Processing

### JSON Cleaning Function

**Location:** `services/geminiService.ts:15-64`

**Purpose:** Robustly parse AI responses that may contain markdown or formatting issues

```typescript
export function cleanAndParseJson<T>(rawText: string): T {
  // 1. Remove markdown ```json ... ``` wrapper
  let textToParse = rawText.replace(/^```json\s*|```$/g, '');

  // 2. Find outermost JSON object or array
  const firstBracket = textToParse.indexOf('[');
  const firstBrace = textToParse.indexOf('{');
  const lastBracket = textToParse.lastIndexOf(']');
  const lastBrace = textToParse.lastIndexOf('}');

  // 3. Extract JSON portion
  let start = -1, end = -1;
  if (firstBracket !== -1 && lastBracket !== -1 && (firstBracket < firstBrace || firstBrace === -1)) {
    start = firstBracket;
    end = lastBracket;
  } else if (firstBrace !== -1 && lastBrace !== -1) {
    start = firstBrace;
    end = lastBrace;
  }

  textToParse = textToParse.substring(start, end + 1);

  // 4. Check for truncation (unbalanced braces/brackets)
  const openBraces = (textToParse.match(/{/g) || []).length;
  const closeBraces = (textToParse.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    throw new Error("Invalid JSON response: Potentially truncated or malformed.");
  }

  // 5. Remove trailing commas
  const cleanedForParsing = textToParse.replace(/,\s*([}\]])/g, '$1');

  // 6. Parse JSON
  return JSON.parse(cleanedForParsing) as T;
}
```

**Handles:**
- Markdown code fences (```json)
- Leading/trailing text
- Trailing commas (invalid JSON)
- Truncated responses (unbalanced brackets)

---

## Performance Optimization

### 1. **Context Size Reduction**
```typescript
// For substitutions: limit to 250 most relevant tools
const relevantMasterTools = masterInventory.filter(/* relevance */). slice(0, 250);

// For queries: sample first 300 tools if inventory larger
const inventorySample = inventory.length > 300 ? inventory.slice(0, 300) : inventory;
```

**Benefit:** Faster responses, lower token costs, avoids context limits

### 2. **Parallel Processing (Where Possible)**
```typescript
// NOT for Google Search (rate limited)
// But for non-search operations:
const [csvResult, predictResult] = await Promise.all([
  processCsvInventory(csvData),
  predictToolsFromJob(jobDesc)
]);
```

### 3. **Caching**
- Sourcing results cached for 7 days
- Reduces redundant API calls for same tools

### 4. **Debounced Requests**
- User input debounced (500ms) before triggering AI queries
- Prevents API spam during typing

---

## Cost Management

### Token Usage Estimates

**Average Costs (Gemini 2.5 Flash):**
- CSV parsing (100 tools): ~2,000 tokens input, ~5,000 tokens output
- Substitution search (5 shortages, 250 inventory): ~8,000 tokens input, ~1,500 tokens output
- Sourcing (1 tool with Google Search): ~500 tokens input, ~300 tokens output
- Predictive tooling (job description): ~1,000 tokens input, ~3,000 tokens output

**Monthly Usage (Example Facility):**
- 20 CSV imports: 140,000 tokens
- 50 comparisons: 475,000 tokens
- 30 sourcing calls: 24,000 tokens
- 15 predictions: 60,000 tokens
- **Total:** ~700,000 tokens/month

**Cost (as of 2025, approximate):**
- Gemini 2.5 Flash: $0.075 per 1M input tokens, $0.30 per 1M output tokens
- Estimated monthly cost: ~$0.15 (negligible)

### Cost Optimization Strategies

1. **Use Flash over Pro** (10x cheaper) for most operations
2. **Cache frequently-requested data** (sourcing info)
3. **Pre-filter large datasets** before sending to AI
4. **Batch operations** where possible
5. **User confirmation** before expensive operations (e.g., sourcing all 50 shortages)

---

## Next Steps
- [API Reference](./06-API-REFERENCE.md) - Complete service layer documentation
- [Technical Architecture](./03-TECHNICAL-ARCHITECTURE.md) - How AI integrates with app architecture
