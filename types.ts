
export interface Tool {
  toolId?: string;
  name: string;
  description?: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  calibrationStatus?: string;
  calibrationDueDays?: number;
  location?: string;
  category?: string;
  
  // New fields for ownership and cost
  owner?: string;
  toolCost?: string;

  // Fields for On-Order tools from purchasing plan
  quantity?: string;
  unitPrice?: string;
  totalPrice?: string;
  sourcingLink?: string;
  status?: string;

  // Analysis
  costAnalysis?: CostAnalysis;
}

export interface SuggestedSubstitution {
  neededTool: Tool;
  suggestedTool: Tool;
  confidence: 'High' | 'Medium' | 'Low';
  reason: string;
}

export interface ComparisonResult {
  available: Tool[];
  onOrder: Tool[];
  shortage: Tool[];
  suggestedSubstitutions?: SuggestedSubstitution[];
}

export interface SourcingInfoLink {
  url: string;
  sourceName: string;
  availability?: string;
}

export interface SourcingInfo {
  estimatedPrice: string;
  purchaseLinks: SourcingInfoLink[];
  rentalLinks: SourcingInfoLink[];
  sourcingNotes: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface SavedToolList {
  id: string;
  name: string;
  maintenanceEvent: string;
  tools: Tool[];
  createdAt: string;
}

export interface SavedComparison {
    id: string;
    name: string;
    createdAt: string;
    result: ComparisonResult;
    toolListName: string; 
    maintenanceEvent: string;
}

export interface MaintenanceTask {
    task: string;
    tools: Tool[];
}

export interface AircraftData {
  id: string;
  name: string; 
  createdAt: string;
  toolLists: SavedToolList[];
  comparisons: SavedComparison[];
}

export interface Kit {
  id: string;
  name: string;
  tools: Tool[];
  createdAt: string;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface PurchasePlanItem {
  id: string;
  aircraft: string;
  itemType: string;
  name: string;
  partNumber: string;
  manufacturer: string;
  reason: string;
  stage: string;
  unitPrice: string;
  quantity: string;
  totalPrice: string;
  sourcingLink: string;
  requestId: string;
  status: string;
  notes: string;
  received?: boolean;
  tlNumber?: string;
}

export interface CostAnalysisSource {
    sourceName: string;
    price: string;
    url: string;
}

export interface CostAnalysis {
    averageCost: string;
    notes: string;
    sources: CostAnalysisSource[];
}

// New Types for Sale Finder
export interface SaleItem {
    id: string;
    name: string;
    model: string;
    manufacturer: string;
    price: string;
    condition: string;
    sellerNotes: string;
}

export interface SaleMatch {
    saleItem: SaleItem;
    matchType: 'Purchase Plan' | 'Needed Tool' | 'Inventory Duplicate';
    matchConfidence: 'High' | 'Medium';
    matchedWith: {
        name: string;
        model: string;
        sourceContext: string; // e.g., "Citation X Annual List" or "Purchase Plan Row 5"
    }[];
}
