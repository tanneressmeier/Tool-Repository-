
import type { AircraftData, Tool, Kit, PurchasePlanItem } from '../types';
import { MASTER_TOOL_INVENTORY } from '../constants';
import { PRELOADED_AIRCRAFT_DATA } from '../preloadedData';
import { PURCHASING_PLAN_DATA } from '../purchasingPlanData';
import { getSlcTools } from './slcTools';

// Removed LATENCY for instant load

// --- Multi-User Data Keys ---
const getKey = (key: string, user: string) => `tooling-app-${user}-${key}`;

// --- Aircraft Data ---
export const getAircraftData = (user: string): Promise<AircraftData[]> => {
  return new Promise((resolve) => {
    try {
      const key = getKey('aircraftData', user);
      const savedJSON = window.localStorage.getItem(key);
      if (savedJSON) {
          resolve(JSON.parse(savedJSON));
      } else {
          // First time using the app, seed with preloaded data
          const initialData = PRELOADED_AIRCRAFT_DATA;
          window.localStorage.setItem(key, JSON.stringify(initialData));
          resolve(initialData);
      }
    } catch (error) {
      console.error("Failed to parse aircraft data from localStorage", error);
      resolve(PRELOADED_AIRCRAFT_DATA); // Resolve with default on error
    }
  });
};

export const saveAircraftData = (aircraftData: AircraftData[], user: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      window.localStorage.setItem(getKey('aircraftData', user), JSON.stringify(aircraftData));
      resolve();
    } catch (error) {
      console.error("Failed to save aircraft data to localStorage", error);
      reject(error);
    }
  });
};

// --- Kits ---
export const getKits = (user: string): Promise<Kit[]> => {
    return new Promise((resolve) => {
        try {
            const savedKitsJSON = window.localStorage.getItem(getKey('kits', user));
            resolve(savedKitsJSON ? JSON.parse(savedKitsJSON) : []);
        } catch (error) {
            console.error("Failed to parse kits from localStorage", error);
            resolve([]);
        }
    });
};

export const saveKits = (kits: Kit[], user: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            window.localStorage.setItem(getKey('kits', user), JSON.stringify(kits));
            resolve();
        } catch (error) {
            console.error("Failed to save kits to localStorage", error);
            reject(error);
        }
    });
};

// --- Master Inventory ---
export const getMasterInventory = (user: string): Promise<Tool[]> => {
  return new Promise((resolve) => {
    try {
      const key = getKey('masterInventory', user);
      const savedInventory = window.localStorage.getItem(key);
      let inventory: Tool[] = [];

      if (savedInventory) {
          inventory = JSON.parse(savedInventory);
      } else {
          // First time using app, seed with preloaded data
          inventory = [...MASTER_TOOL_INVENTORY];
      }

      // Check if SLC tools are present (simple check for the first ID)
      const slcTools = getSlcTools();
      const hasSlcTools = inventory.some(t => t.toolId === 'TL-00001');

      if (!hasSlcTools) {
          console.log("Merging SLC tools into inventory...");
          // Create a set of existing IDs to prevent duplicates during merge
          const existingIds = new Set(inventory.map(t => t.toolId));
          const newTools = slcTools.filter(t => !existingIds.has(t.toolId));
          inventory = [...inventory, ...newTools];
          
          // Persist the update immediately
          window.localStorage.setItem(key, JSON.stringify(inventory));
      }

      resolve(inventory);
    } catch (error) {
      console.error("Failed to parse master inventory from localStorage", error);
      resolve(MASTER_TOOL_INVENTORY);
    }
  });
};

export const saveMasterInventory = (inventory: Tool[], user: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            window.localStorage.setItem(getKey('masterInventory', user), JSON.stringify(inventory));
            resolve();
        } catch (error) {
            console.error("Failed to save master inventory to localStorage", error);
            reject(error);
        }
    });
};

// --- Purchasing Plan ---
export const getPurchasePlan = (user: string): Promise<PurchasePlanItem[]> => {
  return new Promise((resolve) => {
      try {
        const key = getKey('purchasePlan', user);
        const savedPlanJSON = window.localStorage.getItem(key);
        if (savedPlanJSON) {
          resolve(JSON.parse(savedPlanJSON));
        } else {
          // Use pre-compiled data for instant load, no AI required
          const initialPlan = PURCHASING_PLAN_DATA;
          window.localStorage.setItem(key, JSON.stringify(initialPlan));
          resolve(initialPlan);
        }
      } catch (error) {
        console.error("Failed to get or parse purchase plan:", error);
        resolve([]); // Resolve with an empty array on error
      }
  });
};

export const savePurchasePlan = (plan: PurchasePlanItem[], user: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            window.localStorage.setItem(getKey('purchasePlan', user), JSON.stringify(plan));
            resolve();
        } catch (error) {
            console.error("Failed to save purchase plan to localStorage", error);
            reject(error);
        }
    });
};
