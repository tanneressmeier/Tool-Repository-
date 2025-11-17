# Technical Architecture

> **Last Updated:** 2025-11-17
## Table of Contents
- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Architecture Patterns](#architecture-patterns)
- [Component Structure](#component-structure)
- [Data Flow](#data-flow)
- [State Management](#state-management)
- [Routing](#routing)
- [Storage Layer](#storage-layer)
- [AI Integration Layer](#ai-integration-layer)
- [Build & Deployment](#build--deployment)
- [Performance Optimization](#performance-optimization)
- [Error Handling](#error-handling)

## System Overview

Tool Inventory Checker is a **Single-Page Application (SPA)** built with React and TypeScript, leveraging Google Gemini AI for intelligent features. The architecture follows a client-side-only design with browser localStorage for persistence.

### Architectural Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              React Application (SPA)                │    │
│  │                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │    │
│  │  │ Components   │  │   Services    │  │  Hooks   │ │    │
│  │  │ (30+ UI)     │  │  (Gemini,     │  │ (Router) │ │    │
│  │  │              │  │   DataService)│  │          │ │    │
│  │  └──────┬───────┘  └──────┬────────┘  └────┬─────┘ │    │
│  │         │                  │                 │       │    │
│  │         └──────────────────┼─────────────────┘       │    │
│  │                            │                         │    │
│  │  ┌─────────────────────────▼──────────────────────┐ │    │
│  │  │           Application State                     │ │    │
│  │  │  (React.useState, props drilling)               │ │    │
│  │  └─────────────────────────┬──────────────────────┘ │    │
│  │                            │                         │    │
│  └────────────────────────────┼─────────────────────────┘    │
│                               │                              │
│  ┌────────────────────────────▼──────────────────────────┐  │
│  │              Browser APIs                              │  │
│  │  ┌──────────────┐  ┌────────────┐  ┌──────────────┐  │  │
│  │  │ localStorage │  │   Fetch    │  │  File API    │  │  │
│  │  └──────┬───────┘  └─────┬──────┘  └──────┬───────┘  │  │
│  └─────────┼─────────────────┼────────────────┼──────────┘  │
│            │                 │                │             │
└────────────┼─────────────────┼────────────────┼─────────────┘
             │                 │                │
             ▼                 ▼                ▼
    ┌─────────────┐   ┌─────────────────┐  ┌─────────┐
    │ Persisted   │   │ Google Gemini   │  │  CSV    │
    │    Data     │   │   AI Service    │  │  Files  │
    │  (5-10MB)   │   │  (API Calls)    │  │         │
    └─────────────┘   └─────────────────┘  └─────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Client-side only** | Simplified deployment, no backend costs, works with AI Studio platform |
| **localStorage persistence** | No database needed, instant saves, works offline (after initial load) |
| **React 19 with TypeScript** | Type safety, modern React features (concurrent rendering), better DX |
| **Vite build system** | Fast dev server (HMR in ms), optimized production builds, ESM-native |
| **Google Gemini AI** | Best-in-class multimodal AI, search grounding for real-time data |
| **Tailwind CSS** | Rapid UI development, consistent design, small bundle size |
| **Component composition** | Reusable UI, clear separation of concerns, easier testing |

## Technology Stack

### Core Technologies

#### Frontend Framework
- **React 19.2.0**
  - Concurrent rendering for smoother UI
  - Automatic batching for better performance
  - Server Components (not used yet, but available for future)
  - Modern hooks API

#### Language
- **TypeScript 5.8.2**
  - Strict type checking (`strict: true`)
  - Enhanced IDE support (IntelliSense, refactoring)
  - Compile-time error detection
  - Better code documentation via types

#### Build Tool
- **Vite 6.2.0**
  - Lightning-fast HMR (Hot Module Replacement)
  - Optimized production builds with Rollup
  - Native ESM support
  - Built-in TypeScript support
  - Dev server on port 3000

#### Styling
- **Tailwind CSS 3.x** (via CDN)
  - Utility-first CSS framework
  - Responsive design utilities
  - Loaded from CDN (no build step needed)
  - Custom color palette for branding

### AI & External Services

#### AI Provider
- **Google Generative AI SDK** (`@google/genai` v1.29.0)
  - **Models Used:**
    - `gemini-2.5-flash` - Fast operations (prediction, comparison, sourcing)
    - `gemini-2.5-pro` - Complex analysis (task breakdown)
  - **Features:**
    - Structured output (JSON mode)
    - Google Search grounding (real-time web data)
    - Streaming support (not used yet)

#### API Integration
- **Fetch API** - HTTP requests to Gemini
- **AbortController** - Request cancellation
- **Retry logic** - Exponential backoff for transient failures

### Data & Storage

#### Client-side Storage
- **localStorage API**
  - Synchronous key-value storage
  - 5-10MB capacity (varies by browser)
  - Persists across sessions
  - No expiration (manual clearing only)

#### Data Format
- **JSON serialization**
  - All data stored as JSON strings
  - Parsed on read, stringified on write
  - Schema validation on parse

### Development Tools

#### Package Manager
- **npm** (latest)
  - `package.json` for dependency management
  - `package-lock.json` for reproducible builds

#### Type Definitions
- `@types/react`, `@types/react-dom`
- Custom type definitions in `types.ts`

#### Linting & Formatting (Recommended)
- ESLint (can be added)
- Prettier (can be added)

## Architecture Patterns

### 1. Component-Based Architecture

**Pattern:** Decompose UI into small, reusable components

**Example:**
```typescript
// Large component (App.tsx)
<InventoryManager
  inventory={masterInventory}
  onInventoryChange={setMasterInventory}
/>

// Composed of smaller components
<InventoryManager>
  <SearchBar />
  <FilterDropdown />
  <ToolsTable>
    <ToolRow />
    <ToolRow />
  </ToolsTable>
  <Pagination />
  <AddToolModal />
  <EditToolModal />
</InventoryManager>
```

**Benefits:**
- Code reusability
- Easier testing (test small units)
- Clear responsibility boundaries
- Better collaboration (multiple devs, different components)

### 2. Props Drilling (Simple State Management)

**Pattern:** Pass state down via props, callbacks up via props

**Data Flow:**
```typescript
// App.tsx (parent - holds state)
const [masterInventory, setMasterInventory] = useState<Tool[]>([]);

// Pass down as props
<InventoryManager
  inventory={masterInventory}
  onAdd={(tool) => setMasterInventory([...masterInventory, tool])}
  onEdit={(id, tool) => setMasterInventory(inv => inv.map(t => t.id === id ? tool : t))}
  onDelete={(id) => setMasterInventory(inv => inv.filter(t => t.id !== id))}
/>
```

**Why not Context or Redux?**
- App is small enough (~3500 lines)
- State is mostly co-located
- Props drilling is explicit and traceable
- Fewer abstractions = easier to understand

**When to migrate:** If app grows >10k lines or state becomes deeply nested (>4 levels)

### 3. Service Layer Pattern

**Pattern:** Separate business logic from UI components

**Structure:**
```
services/
├── geminiService.ts    # All AI/Gemini interactions
└── dataService.ts      # All localStorage operations
```

**Benefits:**
- Components stay focused on UI
- Services are testable in isolation
- Easy to swap implementations (e.g., localStorage → API)
- Centralized error handling

**Example:**
```typescript
// Component uses service
import { geminiService } from './services/geminiService';

const handlePredict = async (jobDescription: string) => {
  try {
    const tools = await geminiService.predictToolsFromJob(jobDescription);
    setNeededTools(tools);
  } catch (error) {
    showToast('AI prediction failed', 'error');
  }
};
```

### 4. Custom Hooks Pattern

**Pattern:** Extract reusable stateful logic into hooks

**Example:** `hooks/useSimpleRouter.ts`
```typescript
export const useSimpleRouter = () => {
  const [currentPath, setCurrentPath] = useState('/');

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  return { currentPath, navigate };
};
```

**Usage:**
```typescript
const { currentPath, navigate } = useSimpleRouter();

if (currentPath === '/inventory') {
  return <InventoryManager />;
} else if (currentPath === '/comparison') {
  return <ComparisonView />;
}
```

**Benefits:**
- Reusable across components
- Separates logic from UI
- Easier to test

### 5. Debounced Auto-Save Pattern

**Pattern:** Delay expensive operations until user stops typing

**Implementation:**
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem('toolInventoryMaster', JSON.stringify(masterInventory));
  }, 1000); // 1-second debounce

  return () => clearTimeout(timer); // Cleanup on unmount or before next effect
}, [masterInventory]);
```

**Benefits:**
- Reduces localStorage writes (expensive)
- Better performance (no blocking on every keystroke)
- Feels instant to user (1s is imperceptible)

### 6. Modal State Management

**Pattern:** Control modal visibility with boolean state

**Example:**
```typescript
const [showAddModal, setShowAddModal] = useState(false);

// Open modal
<Button onClick={() => setShowAddModal(true)}>Add Tool</Button>

// Modal component
{showAddModal && (
  <Modal onClose={() => setShowAddModal(false)}>
    <AddToolForm onSubmit={(tool) => {
      addTool(tool);
      setShowAddModal(false);
    }} />
  </Modal>
)}
```

## Component Structure

### Component Hierarchy

```
App.tsx (3544 lines total)
├── Header
│   └── Navigation
├── Main Content (conditional on route)
│   ├── InventoryManager (920 lines)
│   │   ├── SearchBar
│   │   ├── CategoryFilter
│   │   ├── InventoryTable
│   │   │   └── ToolRow[]
│   │   ├── Pagination
│   │   ├── AddToolModal
│   │   ├── EditToolModal
│   │   └── CSVImportModal
│   ├── ComparisonView
│   │   ├── NeededToolsList
│   │   ├── CompareButton
│   │   └── ComparisonResults
│   │       ├── AvailableSection
│   │       ├── OnOrderSection
│   │       └── ShortageSection
│   │           └── SubstitutionSuggestions
│   ├── PredictiveTooling
│   │   ├── JobDescriptionInput
│   │   ├── PredictButton
│   │   └── PredictedToolsList
│   ├── DataHub
│   │   ├── AircraftList
│   │   │   └── AircraftCard[]
│   │   ├── AddAircraftModal
│   │   └── MaintenanceEventView
│   │       ├── EventDetails
│   │       ├── NeededToolsList
│   │       └── ComparisonResults
│   ├── PurchasingManager
│   │   ├── PurchaseOrderTable
│   │   ├── AddPurchaseModal
│   │   └── PurchasePlanView
│   ├── KitsManager
│   │   ├── KitList
│   │   ├── CreateKitModal
│   │   └── KitDetailView
│   └── PDFReport
│       ├── ReportOptions
│       ├── SourcingProgress
│       └── PDFViewer
└── Footer
```

### Component Responsibilities

#### App.tsx
**Responsibilities:**
- Root state management (master inventory, needed tools, etc.)
- Routing logic
- Data persistence (auto-save to localStorage)
- Toast notifications
- Top-level error boundaries

**State:**
- `masterInventory: Tool[]`
- `neededTools: Tool[]`
- `comparisonResults: ComparisonResult | null`
- `aircraftData: AircraftData[]`
- `purchaseOrders: PurchaseOrder[]`
- `kits: Kit[]`

#### InventoryManager
**Location:** `components/InventoryManager.tsx` (920 lines)

**Responsibilities:**
- Display master inventory
- CRUD operations on tools
- Search and filter
- Pagination
- CSV import/export

**Props:**
```typescript
interface InventoryManagerProps {
  inventory: Tool[];
  onInventoryChange: (inventory: Tool[]) => void;
}
```

**Internal State:**
- `searchTerm: string`
- `currentPage: number`
- `selectedCategory: string`
- `showAddModal: boolean`
- `editingTool: Tool | null`

#### PredictiveTooling
**Location:** `components/PredictiveTooling.tsx`

**Responsibilities:**
- Accept job description input
- Call Gemini AI for tool prediction
- Display predicted tools with edit capabilities
- Load predictions to needed tools list

**Props:**
```typescript
interface PredictiveToolingProps {
  onToolsPredicted: (tools: Tool[]) => void;
  apiKey: string;
}
```

**Internal State:**
- `jobDescription: string`
- `isLoading: boolean`
- `predictedTools: Tool[]`
- `error: string | null`

### Shared Components

#### Modal Component Pattern
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
```

#### Toast Notification Pattern
```typescript
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

const [toasts, setToasts] = useState<Toast[]>([]);

const showToast = (message: string, type: Toast['type'], duration = 3000) => {
  const id = crypto.randomUUID();
  setToasts([...toasts, { id, message, type, duration }]);
  setTimeout(() => {
    setToasts(toasts => toasts.filter(t => t.id !== id));
  }, duration);
};
```

## Data Flow

### Read Flow (Load Data)

```
User Opens App
     │
     ▼
App.tsx useEffect (on mount)
     │
     ▼
dataService.loadInventory()
     │
     ▼
localStorage.getItem('toolInventoryMaster')
     │
     ▼
JSON.parse(data)
     │
     ▼
Validate schema
     │
     ▼
setMasterInventory(tools)
     │
     ▼
Re-render with data
```

### Write Flow (Save Data)

```
User Edits Tool
     │
     ▼
Component calls onEdit(tool)
     │
     ▼
App.tsx updates state: setMasterInventory(...)
     │
     ▼
useEffect triggers (masterInventory changed)
     │
     ▼
Debounce timer (1000ms)
     │
     ▼
dataService.saveInventory(masterInventory)
     │
     ▼
JSON.stringify(data)
     │
     ▼
localStorage.setItem('toolInventoryMaster', json)
```

### AI Prediction Flow

```
User Enters Job Description
     │
     ▼
Click "Predict Tools"
     │
     ▼
Component calls geminiService.predictTools(description, apiKey)
     │
     ▼
Construct AI prompt with job description
     │
     ▼
Fetch POST to Gemini API
     │
     ▼
Gemini processes (2-10 seconds)
     │
     ▼
Response: JSON array of tools
     │
     ▼
Parse and validate response
     │
     ▼
Return tools to component
     │
     ▼
setPredictedTools(tools)
     │
     ▼
User reviews → Accept All
     │
     ▼
onToolsPredicted(tools) → App.tsx
     │
     ▼
setNeededTools(tools)
```

## State Management

### State Location Strategy

**App-level State (App.tsx):**
- Master inventory (shared across multiple views)
- Needed tools (used in comparison, reports)
- Comparison results (displayed in multiple components)
- Aircraft data (hub for all aircraft-related info)
- Purchase orders (integrated with comparison)

**Component-level State:**
- UI state (modal visibility, current page, search terms)
- Form state (input values before submission)
- Loading states
- Error states

**Why This Split:**
- Data that needs to be shared → App-level
- Data that's local to one component → Component-level
- Avoids prop drilling hell while keeping most state local

### State Updates

**Immutable Updates:**
```typescript
// ❌ BAD: Mutates state
const addTool = (tool: Tool) => {
  masterInventory.push(tool); // Direct mutation
  setMasterInventory(masterInventory);
};

// ✅ GOOD: Creates new array
const addTool = (tool: Tool) => {
  setMasterInventory([...masterInventory, tool]);
};

// ✅ GOOD: Functional update (when using previous state)
const addTool = (tool: Tool) => {
  setMasterInventory(prev => [...prev, tool]);
};
```

**Why Immutability Matters:**
- React detects changes via reference equality
- Mutations can cause missed re-renders
- Immutable updates enable features like undo/redo (future)

## Routing

### Simple Client-Side Routing

**Implementation:** `hooks/useSimpleRouter.ts`

```typescript
export const useSimpleRouter = () => {
  const [currentPath, setCurrentPath] = useState(
    window.location.pathname || '/'
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  return { currentPath, navigate };
};
```

**Usage in App.tsx:**
```typescript
const { currentPath, navigate } = useSimpleRouter();

const renderView = () => {
  switch (currentPath) {
    case '/':
    case '/inventory':
      return <InventoryManager />;
    case '/comparison':
      return <ComparisonView />;
    case '/predictive':
      return <PredictiveTooling />;
    case '/data-hub':
      return <DataHub />;
    case '/purchasing':
      return <PurchasingManager />;
    case '/kits':
      return <KitsManager />;
    default:
      return <NotFound />;
  }
};
```

**Routes:**
- `/` or `/inventory` - Master Inventory Manager
- `/comparison` - Tool Comparison View
- `/predictive` - AI Tool Prediction
- `/data-hub` - Aircraft Data Organization
- `/purchasing` - Purchase Order Tracking
- `/kits` - Kit Management
- `/reports` - Report Generation

**Why Not React Router:**
- Simple routing needs (no nested routes, no route params)
- Avoids extra dependency (7kB gzipped)
- Full control over routing logic
- Easy to understand for new developers

**When to Upgrade:** If adding:
- Nested routes (/aircraft/:id/events/:eventId)
- Route guards (authentication)
- Code splitting by route

## Storage Layer

### localStorage Abstraction

**Service:** `services/dataService.ts`

**API:**
```typescript
interface DataService {
  // Inventory
  saveInventory(tools: Tool[]): void;
  loadInventory(): Tool[];

  // Needed Tools
  saveNeededTools(tools: Tool[]): void;
  loadNeededTools(): Tool[];

  // Aircraft Data
  saveAircraftData(data: AircraftData[]): void;
  loadAircraftData(): AircraftData[];

  // Kits
  saveKits(kits: Kit[]): void;
  loadKits(): Kit[];

  // Purchase Orders
  savePurchaseOrders(orders: PurchaseOrder[]): void;
  loadPurchaseOrders(): PurchaseOrder[];

  // Generic
  clear(): void;
  getStorageInfo(): { used: number; limit: number };
}
```

**Implementation:**
```typescript
const KEYS = {
  MASTER_INVENTORY: 'toolInventoryMaster',
  NEEDED_TOOLS: 'toolInventoryNeeded',
  AIRCRAFT_DATA: 'aircraftData',
  KITS: 'toolKits',
  PURCHASE_ORDERS: 'purchaseOrders',
};

export const dataService = {
  saveInventory(tools: Tool[]) {
    try {
      localStorage.setItem(KEYS.MASTER_INVENTORY, JSON.stringify(tools));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please delete old data.');
      }
      throw error;
    }
  },

  loadInventory(): Tool[] {
    const json = localStorage.getItem(KEYS.MASTER_INVENTORY);
    if (!json) return DEFAULT_INVENTORY; // From constants.ts
    try {
      return JSON.parse(json);
    } catch {
      console.error('Failed to parse inventory, returning defaults');
      return DEFAULT_INVENTORY;
    }
  },

  // ... similar for other data types
};
```

**Error Handling:**
- Quota exceeded → User-friendly error message
- Parse errors → Fall back to defaults
- Missing data → Return empty array or defaults

### Data Migration Strategy

**Versioning:**
```typescript
interface StoredData {
  version: number;
  data: any;
}

const CURRENT_VERSION = 1;

const loadWithMigration = (key: string) => {
  const stored = localStorage.getItem(key);
  if (!stored) return null;

  const parsed: StoredData = JSON.parse(stored);

  if (parsed.version < CURRENT_VERSION) {
    return migrateData(parsed);
  }

  return parsed.data;
};
```

**(Not yet implemented, but recommended for future)**

## AI Integration Layer

**See:** [05-AI-INTEGRATION.md](./05-AI-INTEGRATION.md) for full details

**Service:** `services/geminiService.ts` (650 lines)

**Architecture:**
```
Component (UI)
     │
     ▼
geminiService (business logic)
     │
     ├─> Rate Limiter
     ├─> Error Handler
     ├─> Retry Logic
     └─> Prompt Constructor
         │
         ▼
    Fetch API
         │
         ▼
  Google Gemini API
```

## Build & Deployment

### Development

**Start Dev Server:**
```bash
npm install
npm run dev
```

**Dev Server Features:**
- Hot Module Replacement (HMR)
- Fast refresh (preserves component state)
- Runs on `http://localhost:3000`
- Automatic TypeScript compilation
- Source maps for debugging

### Production Build

**Build Command:**
```bash
npm run build
```

**Output:**
```
dist/
├── index.html          # Entry point
├── assets/
│   ├── index-[hash].js      # Bundled app code
│   ├── index-[hash].css     # Extracted CSS
│   └── [other-assets]
└── vite.svg            # Favicon
```

**Build Optimizations:**
- Code splitting (automatic for dynamic imports)
- Tree shaking (removes unused code)
- Minification (Terser for JS, cssnano for CSS)
- Asset hashing (cache busting)
- Gzip/Brotli compression

### Deployment (AI Studio)

**Platform:** AI Studio
**Deployment Method:** Static file hosting

**Steps:**
1. Run `npm run build`
2. Upload `dist/` folder to AI Studio
3. Configure:
   - Port: 3000
   - Entry point: `index.html`
   - Environment variables: GEMINI_API_KEY (if needed)

**Environment Variables:**
- `VITE_GEMINI_API_KEY` - Set at build time (optional, can be set by user in UI)

## Performance Optimization

### 1. Debounced Auto-Save
- Reduces localStorage writes from 100s/sec to 1/sec
- Prevents UI blocking

### 2. Pagination
- Inventory table shows 10 items per page
- Reduces initial render time for large inventories (100+ tools)

### 3. AI Request Caching
- Sourcing results cached for 7 days
- Avoids redundant API calls for same shortage list

### 4. Lazy Loading (Future)
```typescript
const PredictiveTooling = React.lazy(() => import('./components/PredictiveTooling'));

<Suspense fallback={<Loading />}>
  <PredictiveTooling />
</Suspense>
```

### 5. Virtual Scrolling (Future)
- For very large tool lists (1000+ items)
- Libraries: react-window, react-virtualized

## Error Handling

### Error Boundaries

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### AI Error Handling

```typescript
try {
  const result = await geminiService.predictTools(description, apiKey);
  return result;
} catch (error) {
  if (error.message.includes('API_KEY_INVALID')) {
    showToast('Invalid API key. Please check your settings.', 'error');
  } else if (error.message.includes('RATE_LIMIT')) {
    showToast('Rate limit exceeded. Please wait before trying again.', 'warning');
  } else {
    showToast('AI prediction failed. Please try again.', 'error');
  }
  console.error('AI Error:', error);
}
```

### localStorage Error Handling

```typescript
try {
  localStorage.setItem(key, value);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    // Offer to clear old data
    if (confirm('Storage full. Clear old aircraft data?')) {
      dataService.clearOldAircraftData();
      retry();
    }
  }
}
```

---

## Next Steps
- [Data Models](./04-DATA-MODELS.md) - TypeScript interfaces and data structures
- [AI Integration](./05-AI-INTEGRATION.md) - Detailed AI implementation
- [API Reference](./06-API-REFERENCE.md) - Service layer documentation